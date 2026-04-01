(function () {
  "use strict";

  var FRAGMENT_KIND = "FRAGMENTO";
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
  var MAX_FRAGMENT_RATIO =
    typeof cfg.max_fragment_ratio === "number" &&
    cfg.max_fragment_ratio >= 0 &&
    cfg.max_fragment_ratio <= 1
      ? cfg.max_fragment_ratio
      : 0.3;

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

  function maxFragmentsForSize(n) {
    return Math.floor(n * MAX_FRAGMENT_RATIO);
  }

  function countFragments(arr) {
    var c = 0;
    for (var j = 0; j < arr.length; j++) {
      if (String(arr[j].kind || "") === FRAGMENT_KIND) c++;
    }
    return c;
  }

  /** FNV-1a 32-bit: mismo texto → mismo hash (coherente entre sorteos y recargas). */
  function fnv1a32(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
      h >>>= 0;
    }
    return h >>> 0;
  }

  /** Clave canónica: preferimos ref del build; si no, kind + href + texto. */
  function canonicalKey(item) {
    var r = item.ref != null ? String(item.ref).trim() : "";
    if (r !== "") return r;
    var kind = String(item.kind || "");
    var href = String(item.href || "");
    var text = String(item.text || "").slice(0, 240);
    return kind + "\x1e" + href + "\x1e" + text;
  }

  /** Identificador fijo tipo archivo: 16 hex (dos medias palabras FNV con sal distinta). */
  function archiveHashHex(key) {
    var a = fnv1a32(key);
    var b = fnv1a32("\xff" + key + "\xfe");
    return (
      a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0")
    );
  }

  /** Hex con puntos cada 4 caracteres (16 hex → 4 grupos sin resto). */
  function formatHexByFour(hex) {
    var s = String(hex);
    var out = [];
    for (var i = 0; i < s.length; i += 4) {
      out.push(s.slice(i, i + 4));
    }
    return out.join(".");
  }

  /** Prefijo de colección (coherente con ref en el JSON). */
  function kindPrefix(kind) {
    var k = String(kind || "")
      .toUpperCase()
      .replace(/\s/g, "");
    if (k === "FRAGMENTO") return "FRAG/";
    if (k === "CÓDIGO" || k === "CODIGO") return "COD/";
    if (k === "DIARIO") return "DIA/";
    if (k === "POEMA") return "POE/";
    return "ARC/";
  }

  /**
   * Hasta SAMPLE_COUNT ítems: como máximo ~30% FRAGMENTO (resto CÓDIGO, DIARIO, POEMA, …).
   * Primero llena con no-fragmentos; luego añade fragmentos si el tope lo permite.
   */
  function pickWeighted() {
    var frags = [];
    var rest = [];
    items.forEach(function (item) {
      if (String(item.kind || "") === FRAGMENT_KIND) frags.push(item);
      else rest.push(item);
    });
    var shF = shuffle(frags);
    var shR = shuffle(rest);
    var out = [];
    var i;
    var fi = 0;

    for (i = 0; i < shR.length && out.length < SAMPLE_COUNT; i++) {
      out.push(shR[i]);
    }

    if (out.length === 0 && shF.length > 0) {
      var capOnly = Math.min(
        maxFragmentsForSize(SAMPLE_COUNT),
        SAMPLE_COUNT,
        shF.length
      );
      for (i = 0; i < capOnly; i++) out.push(shF[i]);
      return shuffle(out);
    }

    while (fi < shF.length && out.length < SAMPLE_COUNT) {
      var n = out.length + 1;
      var currFr = countFragments(out);
      if (currFr + 1 > maxFragmentsForSize(n)) break;
      out.push(shF[fi]);
      fi++;
    }

    return shuffle(out);
  }

  function render() {
    var pick = pickWeighted();
    var frag = document.createDocumentFragment();
    pick.forEach(function (item, idx) {
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
        '<span class="lab-kind">' +
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
