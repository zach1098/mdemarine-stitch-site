const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const PROMETHEUS_HOOK_URL = process.env.PROMETHEUS_HOOK_URL || "";
const PROMETHEUS_HOOK_TOKEN = process.env.PROMETHEUS_HOOK_TOKEN || "";

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    changes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string" },
          value: {}
        },
        required: ["path", "value"]
      }
    }
  },
  required: ["reply", "changes"]
};

const ALLOWED_PREFIXES = ["brand.", "seo.", "theme.", "contact.", "home.", "chat.endpoint"];

function toMessages(history, latestMessage) {
  const messages = [
    {
      role: "system",
      content:
        "You are Prometheus, a website-only assistant for MDEmarine's owner console. " +
        "Help the owner edit ONLY this website content. Keep replies concise and practical. " +
        "If asked to change content, return concrete path/value edits in `changes`. " +
        "Only use valid paths rooted in: brand, seo, theme, contact, home, chat.endpoint. " +
        "Never include secrets. Never suggest unrelated features unless asked."
    }
  ];

  if (Array.isArray(history)) {
    history.slice(-12).forEach((item) => {
      const role = item && item.role === "assistant" ? "assistant" : "user";
      const content = item && typeof item.content === "string" ? item.content : "";
      if (content.trim()) {
        messages.push({ role, content: content.trim() });
      }
    });
  }

  messages.push({ role: "user", content: latestMessage });
  return messages;
}

function sanitizeChanges(changes) {
  if (!Array.isArray(changes)) return [];

  return changes
    .filter((item) => item && typeof item.path === "string")
    .filter((item) => ALLOWED_PREFIXES.some((prefix) => item.path === prefix || item.path.startsWith(prefix)))
    .slice(0, 30)
    .map((item) => ({ path: item.path, value: item.value }));
}

async function callPrometheusHook(payload) {
  if (!PROMETHEUS_HOOK_URL || !PROMETHEUS_HOOK_TOKEN) return null;

  const response = await fetch(PROMETHEUS_HOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PROMETHEUS_HOOK_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let parsed;

  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    parsed = { raw: rawText };
  }

  if (!response.ok) {
    return {
      reply: `Prometheus hook error (${response.status}).`,
      changes: [],
      debug: parsed
    };
  }

  if (parsed && typeof parsed.reply === "string") {
    return {
      reply: parsed.reply,
      changes: sanitizeChanges(parsed.changes)
    };
  }

  if (parsed && parsed.result && typeof parsed.result.reply === "string") {
    return {
      reply: parsed.result.reply,
      changes: sanitizeChanges(parsed.result.changes)
    };
  }

  if (parsed && parsed.result && typeof parsed.result.output === "string") {
    try {
      const json = JSON.parse(parsed.result.output);
      return {
        reply: json.reply || "Updated.",
        changes: sanitizeChanges(json.changes)
      };
    } catch (error) {
      return {
        reply: parsed.result.output,
        changes: []
      };
    }
  }

  return {
    reply: "Prometheus hook responded, but not in the expected shape yet.",
    changes: [],
    debug: parsed
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const message = String(body.message || "").trim();
  const draft = body.draft || {};
  const history = body.history || [];

  if (!message) {
    return res.status(400).json({ reply: "Say what you want changed.", changes: [] });
  }

  const prompt = [
    "You are Prometheus, acting as the dedicated website agent for the MDEmarine owner console.",
    "Reply ONLY as JSON with this shape: {\"reply\": string, \"changes\": [{\"path\": string, \"value\": any}] }.",
    "Only edit these roots: brand, seo, theme, contact, home, chat.endpoint.",
    "Be concise in reply text.",
    "Current site draft JSON:",
    JSON.stringify(draft, null, 2),
    "",
    "Recent conversation:",
    JSON.stringify(history.slice(-14), null, 2),
    "",
    "Latest owner request:",
    message
  ].join("\n");

  if (PROMETHEUS_HOOK_URL && PROMETHEUS_HOOK_TOKEN) {
    try {
      const relay = await callPrometheusHook({
        message: prompt,
        agentId: "main",
        wakeMode: "now",
        timeoutSeconds: 60,
        deliver: false,
        sessionKey: "hook:mdemarine-admin"
      });

      if (relay) {
        return res.status(200).json(relay);
      }
    } catch (error) {
      return res.status(200).json({
        reply: "Prometheus relay is configured, but the hook call failed.",
        changes: []
      });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      reply:
        "Prometheus-first relay is wired, but PROMETHEUS_HOOK_URL and PROMETHEUS_HOOK_TOKEN are not set. If you want fallback mode instead, add OPENAI_API_KEY.",
      changes: []
    });
  }

  try {
    const contextSummary = JSON.stringify(
      {
        brand: draft.brand,
        seo: draft.seo,
        contact: draft.contact,
        theme: draft.theme,
        home: {
          eyebrow: draft.home && draft.home.eyebrow,
          headline: draft.home && draft.home.headline,
          subhead: draft.home && draft.home.subhead,
          services: draft.home && draft.home.services,
          request: draft.home && draft.home.request,
          gallery: draft.home && draft.home.gallery
        }
      },
      null,
      2
    );

    const messages = toMessages(history, `${message}\n\nCurrent site config context:\n${contextSummary}`);

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.3,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "site_agent_response",
            strict: true,
            schema: RESPONSE_SCHEMA
          }
        }
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(200).json({
        reply: `AI endpoint error (${response.status}).`,
        changes: [],
        debug: txt.slice(0, 300)
      });
    }

    const data = await response.json();
    const raw = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const parsed = raw ? JSON.parse(raw) : { reply: "No response content.", changes: [] };

    const safeReply = typeof parsed.reply === "string" ? parsed.reply : "Updated.";
    const safeChanges = sanitizeChanges(parsed.changes);

    return res.status(200).json({ reply: safeReply, changes: safeChanges, model: DEFAULT_MODEL });
  } catch (error) {
    return res.status(200).json({
      reply: "I hit an error calling the AI backend. Try again in a sec.",
      changes: []
    });
  }
};
