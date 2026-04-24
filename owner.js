(function () {
  var site = window.MDE_SITE;
  if (!site) return;

  var defaults = site.getDefaults();
  var keys = site.keys;
  var CHAT_HISTORY_KEY = "mde_owner_chat_history_v1";

  var loginPanel = document.getElementById("loginPanel");
  var appPanel = document.getElementById("appPanel");
  var loginBtn = document.getElementById("loginBtn");
  var logoutBtn = document.getElementById("logoutBtn");
  var loginStatus = document.getElementById("loginStatus");
  var passwordInput = document.getElementById("passwordInput");

  var formContainer = document.getElementById("formContainer");
  var rawSchema = document.getElementById("rawSchema");
  var editorStatus = document.getElementById("editorStatus");
  var previewFrame = document.getElementById("previewFrame");

  var saveDraftBtn = document.getElementById("saveDraftBtn");
  var refreshPreviewBtn = document.getElementById("refreshPreviewBtn");
  var publishBtn = document.getElementById("publishBtn");
  var rollbackBtn = document.getElementById("rollbackBtn");
  var versionSelect = document.getElementById("versionSelect");
  var resetBtn = document.getElementById("resetBtn");
  var openPreviewBtn = document.getElementById("openPreviewBtn");

  var chatHistory = document.getElementById("chatHistory");
  var chatInput = document.getElementById("chatInput");
  var chatSendBtn = document.getElementById("chatSendBtn");

  var published = mergeAll(defaults, site.loadJson(keys.published) || {});
  var draft = mergeAll(defaults, site.loadJson(keys.published) || {}, site.loadJson(keys.draft) || {});
  var versions = site.loadJson(keys.versions) || [];
  var convo = loadConvo();

  var sending = false;

  var fields = [
    { path: "brand.name", label: "Brand Name", type: "text" },
    { path: "contact.phone", label: "Contact Phone", type: "text" },
    { path: "contact.email", label: "Contact Email", type: "text" },
    { path: "contact.serviceArea", label: "Service Area", type: "text" },
    { path: "chat.endpoint", label: "Chat Endpoint", type: "text", full: true },

    { path: "seo.title", label: "SEO Title", type: "text", full: true },
    { path: "seo.description", label: "SEO Description", type: "textarea", full: true },
    { path: "seo.keywords", label: "SEO Keywords", type: "textarea", full: true },
    { path: "seo.canonicalUrl", label: "Canonical URL", type: "text", full: true },
    { path: "seo.ogImage", label: "SEO / Social Image URL", type: "image", full: true },

    { path: "theme.bg", label: "Theme Background", type: "color" },
    { path: "theme.navy", label: "Theme Navy", type: "color" },
    { path: "theme.accent", label: "Theme Accent", type: "color" },

    { path: "home.eyebrow", label: "Hero Eyebrow", type: "text", full: true },
    { path: "home.headline", label: "Hero Headline", type: "textarea", full: true },
    { path: "home.subhead", label: "Hero Subhead", type: "textarea", full: true },

    { path: "home.stats.0.value", label: "Hero Stat #1", type: "text" },
    { path: "home.stats.1.value", label: "Hero Stat #2", type: "text" },
    { path: "home.stats.2.value", label: "Hero Stat #3", type: "text" },

    { path: "home.services.0.title", label: "Service Card 1 Title", type: "text" },
    { path: "home.services.1.title", label: "Service Card 2 Title", type: "text" },
    { path: "home.services.2.title", label: "Service Card 3 Title", type: "text" },

    { path: "home.request.title", label: "Request Section Title", type: "text", full: true },
    { path: "home.request.checklist", label: "Request Checklist (1 line per bullet)", type: "list", full: true },

    { path: "home.gallery.items.0.image", label: "Gallery Image #1 URL", type: "image", full: true },
    { path: "home.gallery.items.1.image", label: "Gallery Image #2 URL", type: "image", full: true },
    { path: "home.gallery.items.2.image", label: "Gallery Image #3 URL", type: "image", full: true },

    { path: "auth.ownerPassword", label: "Owner Password", type: "text" }
  ];

  function mergeAll() {
    var out = {};
    for (var i = 0; i < arguments.length; i += 1) {
      out = site.merge(out, arguments[i] || {});
    }
    return out;
  }

  function setStatus(text, ok) {
    editorStatus.textContent = text;
    editorStatus.classList.remove("ok");
    if (ok) editorStatus.classList.add("ok");
  }

  function setLoginStatus(text, ok) {
    loginStatus.textContent = text;
    loginStatus.classList.remove("ok");
    if (ok) loginStatus.classList.add("ok");
  }

  function pathParts(path) {
    return path.split(".").map(function (part) {
      return /^\d+$/.test(part) ? Number(part) : part;
    });
  }

  function getByPath(obj, path) {
    return pathParts(path).reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  function setByPath(obj, path, value) {
    var parts = pathParts(path);
    var curr = obj;

    for (var i = 0; i < parts.length - 1; i += 1) {
      var key = parts[i];
      var nextKey = parts[i + 1];
      if (curr[key] == null) {
        curr[key] = typeof nextKey === "number" ? [] : {};
      }
      curr = curr[key];
    }

    curr[parts[parts.length - 1]] = value;
  }

  function saveDraft() {
    localStorage.setItem(keys.draft, JSON.stringify(draft));
  }

  function refreshRawSchema() {
    rawSchema.value = JSON.stringify(draft, null, 2);
  }

  function reloadPreview() {
    saveDraft();
    var url = "./index.html?preview=1&t=" + Date.now();
    previewFrame.src = url;
  }

  function renderVersionSelect() {
    versionSelect.innerHTML = "";
    if (!versions.length) {
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "No rollback points yet";
      versionSelect.appendChild(empty);
      return;
    }

    versions.forEach(function (item) {
      var option = document.createElement("option");
      option.value = String(item.id);
      option.textContent = new Date(item.createdAt).toLocaleString() + " • " + (item.label || "Published snapshot");
      versionSelect.appendChild(option);
    });
  }

  function createInput(field) {
    var value = getByPath(draft, field.path);
    var wrapper = document.createElement("div");
    wrapper.className = "field" + (field.full ? " full" : "");

    var label = document.createElement("label");
    label.textContent = field.label;

    wrapper.appendChild(label);

    if (field.type === "textarea") {
      var textarea = document.createElement("textarea");
      textarea.value = value || "";
      textarea.addEventListener("input", function () {
        setByPath(draft, field.path, textarea.value);
        refreshRawSchema();
      });
      wrapper.appendChild(textarea);
      return wrapper;
    }

    if (field.type === "list") {
      var listArea = document.createElement("textarea");
      listArea.value = Array.isArray(value) ? value.join("\n") : "";
      listArea.addEventListener("input", function () {
        var lines = listArea.value
          .split("\n")
          .map(function (line) {
            return line.trim();
          })
          .filter(Boolean);
        setByPath(draft, field.path, lines);
        refreshRawSchema();
      });
      wrapper.appendChild(listArea);
      return wrapper;
    }

    if (field.type === "image") {
      var urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.placeholder = "https://... or data:image/...";
      urlInput.value = value || "";
      urlInput.addEventListener("input", function () {
        setByPath(draft, field.path, urlInput.value.trim());
        refreshRawSchema();
      });

      var fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function () {
          var dataUrl = String(reader.result || "");
          urlInput.value = dataUrl;
          setByPath(draft, field.path, dataUrl);
          refreshRawSchema();
          setStatus("Image loaded into draft.", true);
        };
        reader.readAsDataURL(file);
      });

      wrapper.appendChild(urlInput);
      wrapper.appendChild(fileInput);
      return wrapper;
    }

    var input = document.createElement("input");
    input.type = field.type === "color" ? "color" : "text";
    input.value = value || "";
    input.addEventListener("input", function () {
      setByPath(draft, field.path, input.value);
      refreshRawSchema();
    });
    wrapper.appendChild(input);

    return wrapper;
  }

  function renderForm() {
    formContainer.innerHTML = "";
    fields.forEach(function (field) {
      formContainer.appendChild(createInput(field));
    });
    refreshRawSchema();
    renderVersionSelect();
  }

  function doPublish() {
    versions.unshift({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      label: "Publish",
      config: published
    });
    versions = versions.slice(0, 20);

    published = mergeAll(defaults, draft);
    localStorage.setItem(keys.published, JSON.stringify(published));
    localStorage.setItem(keys.versions, JSON.stringify(versions));
    localStorage.setItem(keys.draft, JSON.stringify(draft));

    setStatus("Published live.", true);
    renderVersionSelect();
    reloadPreview();
  }

  function rollbackSelected() {
    var selectedId = versionSelect.value;
    if (!selectedId) return;

    var target = versions.find(function (item) {
      return String(item.id) === String(selectedId);
    });

    if (!target || !target.config) return;

    published = mergeAll(defaults, target.config);
    draft = mergeAll(defaults, target.config);

    localStorage.setItem(keys.published, JSON.stringify(published));
    localStorage.setItem(keys.draft, JSON.stringify(draft));

    renderForm();
    setStatus("Rollback complete.", true);
    reloadPreview();
  }

  function resetDraft() {
    draft = mergeAll(defaults, published);
    saveDraft();
    renderForm();
    reloadPreview();
    setStatus("Draft reset to current published state.", true);
  }

  function loadConvo() {
    try {
      var parsed = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveConvo() {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(convo.slice(-80)));
  }

  function appendBubble(role, text, persist) {
    if (!chatHistory) return;
    var bubble = document.createElement("div");
    bubble.className = "bubble " + (role === "user" ? "user" : "bot");
    bubble.textContent = String(text || "");
    chatHistory.appendChild(bubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if (persist) {
      convo.push({ role: role === "user" ? "user" : "assistant", content: String(text || ""), at: Date.now() });
      saveConvo();
    }
  }

  function renderConvo() {
    if (!chatHistory) return;
    chatHistory.innerHTML = "";

    convo.forEach(function (entry) {
      appendBubble(entry.role === "user" ? "user" : "bot", entry.content || "", false);
    });

    if (!convo.length) {
      appendBubble(
        "bot",
        "I’m connected to your website draft. Tell me what to change, like: ‘rewrite the hero for yacht owners’ or ‘make the colors darker and update contact info.’",
        true
      );
    }
  }

  function getChatEndpoint() {
    var endpoint = getByPath(draft, "chat.endpoint");
    if (typeof endpoint !== "string" || !endpoint.trim()) return "/api/site-agent";
    return endpoint.trim();
  }

  function applyChanges(changes) {
    if (!Array.isArray(changes) || !changes.length) return 0;

    var applied = 0;
    changes.forEach(function (change) {
      if (!change || typeof change.path !== "string") return;
      setByPath(draft, change.path, change.value);
      applied += 1;
    });

    if (applied) {
      saveDraft();
      renderForm();
      reloadPreview();
    }

    return applied;
  }

  async function sendChat() {
    if (sending) return;
    var message = (chatInput.value || "").trim();
    if (!message) return;

    chatInput.value = "";
    appendBubble("user", message, true);

    var endpoint = getChatEndpoint();

    sending = true;
    chatSendBtn.disabled = true;
    setStatus("Thinking...", false);

    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          draft: draft,
          published: published,
          history: convo.slice(-14)
        })
      });

      if (!response.ok) {
        appendBubble("bot", "Endpoint returned " + response.status + ".", true);
        setStatus("Chat call failed.", false);
        return;
      }

      var data = await response.json();
      var reply = data.reply || data.message || "Done.";
      appendBubble("bot", String(reply), true);

      var applied = applyChanges(data.changes || []);
      if (applied > 0) {
        setStatus("Applied " + applied + " change" + (applied === 1 ? "" : "s") + " to draft.", true);
      } else {
        setStatus("No draft changes applied.", true);
      }
    } catch (error) {
      appendBubble("bot", "Could not reach the chat endpoint.", true);
      setStatus("Chat endpoint unreachable.", false);
    } finally {
      sending = false;
      chatSendBtn.disabled = false;
    }
  }

  function unlock() {
    localStorage.setItem(keys.ownerSession, "1");
    loginPanel.classList.add("hidden");
    appPanel.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    renderForm();
    renderConvo();
    reloadPreview();
  }

  function lock() {
    localStorage.removeItem(keys.ownerSession);
    loginPanel.classList.remove("hidden");
    appPanel.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    passwordInput.value = "";
  }

  function init() {
    var alreadyLoggedIn = localStorage.getItem(keys.ownerSession) === "1";
    if (alreadyLoggedIn) unlock();

    loginBtn.addEventListener("click", function () {
      var entered = passwordInput.value;
      var actual = getByPath(published, "auth.ownerPassword") || "mde-owner-2026";

      if (entered !== actual) {
        setLoginStatus("Wrong password.");
        return;
      }

      setLoginStatus("Access granted.", true);
      unlock();
    });

    logoutBtn.addEventListener("click", lock);

    saveDraftBtn.addEventListener("click", function () {
      saveDraft();
      setStatus("Draft saved.", true);
    });

    refreshPreviewBtn.addEventListener("click", function () {
      reloadPreview();
      setStatus("Preview refreshed.", true);
    });

    if (openPreviewBtn) {
      openPreviewBtn.addEventListener("click", function () {
        saveDraft();
        window.open("./index.html?preview=1&t=" + Date.now(), "_blank");
      });
    }

    publishBtn.addEventListener("click", doPublish);
    rollbackBtn.addEventListener("click", rollbackSelected);
    resetBtn.addEventListener("click", resetDraft);

    rawSchema.addEventListener("blur", function () {
      try {
        var parsed = JSON.parse(rawSchema.value);
        draft = mergeAll(defaults, parsed);
        saveDraft();
        renderForm();
        reloadPreview();
        setStatus("Raw schema applied to draft.", true);
      } catch (error) {
        setStatus("Raw JSON invalid. Fix before applying.");
      }
    });

    chatSendBtn.addEventListener("click", sendChat);
    chatInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendChat();
      }
    });
  }

  init();
})();
