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

  /** 0–1 (ej. 0.3) o 1–100 como porcentaje (ej. 30 → 0.3). */
  function normalizeFragmentRatio(v) {
    if (v === undefined || v === null) return 0.3;
    var n =
      typeof v === "number" && !isNaN(v)
        ? v
        : parseFloat(String(v).replace(",", "."));
    if (isNaN(n) || n < 0) return 0;
    if (n > 1 && n <= 100) return n / 100;
    if (n > 100) return 1;
    return Math.min(1, n);
  }

  var MAX_FRAGMENT_RATIO = normalizeFragmentRatio(cfg.max_fragment_ratio);

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

  /** Máximo de fragmentos permitidos con n ítems en total (≤ ratio × n). */
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
   * Muestra de SAMPLE_COUNT ítems: hasta floor(ratio × SAMPLE_COUNT) fragmentos
   * y el resto de CÓDIGO / DIARIO / POEMA cuando el pool lo permite (mezcla visible).
   * Si no hay suficientes no-fragmentos, completa con fragmentos respetando el tope proporcional.
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
    var maxFr = Math.floor(SAMPLE_COUNT * MAX_FRAGMENT_RATIO);
    var i;
    var fi;

    if (shR.length === 0 && shF.length > 0) {
      var capOnly = Math.min(
        maxFragmentsForSize(SAMPLE_COUNT),
        SAMPLE_COUNT,
        shF.length
      );
      for (i = 0; i < capOnly; i++) out.push(shF[i]);
      return shuffle(out);
    }

    var numFr = Math.min(maxFr, shF.length);
    var numRest = SAMPLE_COUNT - numFr;

    if (shR.length >= numRest) {
      for (i = 0; i < numFr; i++) out.push(shF[i]);
      for (i = 0; i < numRest; i++) out.push(shR[i]);
      return shuffle(out);
    }

    for (i = 0; i < shR.length; i++) out.push(shR[i]);
    fi = 0;
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
