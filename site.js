(function () {
  var KEYS = {
    published: "mde_site_published_v1",
    draft: "mde_site_draft_v1",
    versions: "mde_site_versions_v1",
    ownerSession: "mde_owner_session_v1"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function merge(target, source) {
    if (!isObject(source)) return target;
    Object.keys(source).forEach(function (key) {
      var sourceValue = source[key];
      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue.slice();
      } else if (isObject(sourceValue)) {
        target[key] = merge(isObject(target[key]) ? target[key] : {}, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  function loadJson(key) {
    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme) {
    if (!theme) return;
    var root = document.documentElement;
    var map = {
      bg: "--bg",
      panel: "--panel",
      panelSoft: "--panel-soft",
      ink: "--ink",
      muted: "--muted",
      navy: "--navy",
      navy2: "--navy-2",
      accent: "--accent",
      accentSoft: "--accent-soft"
    };

    Object.keys(map).forEach(function (key) {
      if (theme[key]) {
        root.style.setProperty(map[key], theme[key]);
      }
    });
  }

  function bindText(config) {
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      var path = el.getAttribute("data-bind");
      var value = getByPath(config, path);
      if (value === undefined || value === null) return;

      if (el.tagName === "IMG") {
        el.src = String(value);
      } else {
        el.textContent = String(value);
      }
    });

    document.querySelectorAll("[data-bind-list]").forEach(function (el) {
      var path = el.getAttribute("data-bind-list");
      var value = getByPath(config, path);
      var items = [];
      if (Array.isArray(value)) {
        items = value;
      } else if (typeof value === "string") {
        items = value
          .split("\n")
          .map(function (line) {
            return line.trim();
          })
          .filter(Boolean);
      }

      if (!items.length) return;
      el.innerHTML = "";
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = String(item);
        el.appendChild(li);
      });
    });
  }

  function bindLinks(config) {
    document.querySelectorAll("[data-bind-href]").forEach(function (el) {
      var path = el.getAttribute("data-bind-href");
      var value = getByPath(config, path);
      if (value) el.setAttribute("href", String(value));
    });
  }

  function loadActiveConfig() {
    var defaults = window.MDE_DEFAULT_CONFIG || {};
    var active = clone(defaults);
    var published = loadJson(KEYS.published);
    if (published) active = merge(active, published);

    var preview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (preview) {
      var draft = loadJson(KEYS.draft);
      if (draft) active = merge(active, draft);
    }

    return active;
  }

  var config = loadActiveConfig();
  applyTheme(config.theme || {});
  bindText(config);
  bindLinks(config);

  window.MDE_SITE = {
    keys: KEYS,
    clone: clone,
    merge: merge,
    getByPath: getByPath,
    loadJson: loadJson,
    getActiveConfig: function () {
      return clone(config);
    },
    getDefaults: function () {
      return clone(window.MDE_DEFAULT_CONFIG || {});
    }
  };
})();
