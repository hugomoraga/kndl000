(function () {
  "use strict";

  var elScript = document.getElementById("lab-items");
  var elRoot = document.getElementById("lab-feed-root");
  var elBtn = document.getElementById("lab-shuffle");
  var elCfg = document.getElementById("lab-home-config");
  if (!elScript || !elRoot) return;

  var cfg = {};
  if (elCfg && elCfg.textContent) {
    try {
      cfg = JSON.parse(elCfg.textContent);
    } catch (ignore) {}
  }
  var SAMPLE_COUNT =
    typeof cfg.sample_count === "number" && cfg.sample_count > 0
      ? Math.floor(cfg.sample_count)
      : 10;

  var items;
  try {
    items = JSON.parse(elScript.textContent);
  } catch (e) {
    return;
  }
  if (!Array.isArray(items) || items.length === 0) return;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function fnv1a32(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
      h >>>= 0;
    }
    return h >>> 0;
  }

  function canonicalKey(item) {
    var r = item.ref != null ? String(item.ref).trim() : "";
    if (r !== "") return r;
    var kind = String(item.kind || "");
    var href = String(item.href || "");
    var text = String(item.text || "").slice(0, 240);
    return kind + "\x1e" + href + "\x1e" + text;
  }

  function archiveHashHex(key) {
    var a = fnv1a32(key);
    var b = fnv1a32("\xff" + key + "\xfe");
    return (
      a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0")
    );
  }

  function formatHexByFour(hex) {
    var s = String(hex);
    var out = [];
    for (var i = 0; i < s.length; i += 4) {
      out.push(s.slice(i, i + 4));
    }
    return out.join(".");
  }

  function kindPrefix(kind) {
    var k = String(kind || "")
      .toUpperCase()
      .replace(/\s/g, "");
    if (k === "CÓDIGO" || k === "CODIGO") return "COD/";
    if (k === "DIARIO") return "DIA/";
    if (k === "POEMA") return "POE/";
    if (k === "REPORTE") return "REP/";
    return "ARC/";
  }

  function pickWeighted() {
    return shuffle(items).slice(0, Math.min(SAMPLE_COUNT, items.length));
  }

  function render() {
    var pick = pickWeighted();
    var frag = document.createDocumentFragment();
    pick.forEach(function (item) {
      var text = item.text != null ? String(item.text) : "";
      var href = item.href != null ? String(item.href) : "#";
      var kind = item.kind != null ? String(item.kind) : "MUESTRA";
      var key = canonicalKey(item);
      var hex = archiveHashHex(key);
      var prefix = kindPrefix(kind);
      var hexDotted = formatHexByFour(hex);
      var label = prefix + hexDotted;
      var tip = label + " | " + key + " (FNV-1a)";

      var article = document.createElement("article");
      article.className = "lab-specimen";
      article.setAttribute("data-lab-key", key);
      article.setAttribute("data-lab-hash", hex);
      article.innerHTML =
        '<header class="lab-specimen-meta">' +
        '<span class="lab-kind" data-kind="' + escapeHtml(kind) + '">' +
        escapeHtml(kind) +
        "</span>" +
        '<span class="lab-num" title="' +
        escapeHtml(tip) +
        '">' +
        escapeHtml(label) +
        "</span>" +
        "</header>" +
        '<p class="lab-text"><a href="' +
        escapeHtml(href) +
        '">' +
        escapeHtml(text) +
        "</a></p>";
      frag.appendChild(article);
    });
    elRoot.innerHTML = "";
    elRoot.appendChild(frag);
  }

  render();
  if (elBtn) elBtn.addEventListener("click", render);
})();
