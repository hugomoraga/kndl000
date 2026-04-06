(function () {
  "use strict";

  var elRoot = document.getElementById("home-collage-root");
  var elItems = document.getElementById("home-collage-items");
  var elCfg = document.getElementById("home-collage-config");
  if (!elRoot || !elItems) return;

  var cfg = {};
  if (elCfg && elCfg.textContent) {
    try {
      cfg = JSON.parse(elCfg.textContent);
    } catch (ignore) {}
  }
  var maxItems =
    typeof cfg.max_items === "number" && cfg.max_items > 0
      ? Math.floor(cfg.max_items)
      : 6;

  var pool;
  try {
    pool = JSON.parse(elItems.textContent);
  } catch (e) {
    return;
  }
  if (!Array.isArray(pool) || pool.length === 0) return;

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

  /** Rejilla 3×3: claves nw,n,ne,w,c,e,sw,s,se o 1–9 (teclado numérico). */
  var FOCAL_NUM = {
    "1": "nw",
    "2": "n",
    "3": "ne",
    "4": "w",
    "5": "c",
    "6": "e",
    "7": "sw",
    "8": "s",
    "9": "se"
  };
  var FOCAL_WORD = {
    nw: true,
    n: true,
    ne: true,
    w: true,
    c: true,
    e: true,
    sw: true,
    s: true,
    se: true
  };

  function canonicalSliderFocal(raw) {
    if (raw == null || raw === "") return "";
    var s = String(raw).trim().toLowerCase();
    if (!s) return "";
    if (FOCAL_NUM[s]) return FOCAL_NUM[s];
    if (FOCAL_WORD[s]) return s;
    return "";
  }

  function render() {
    var pick = shuffle(pool).slice(0, maxItems);
    var html = pick
      .map(function (it) {
        var title = it.title != null ? String(it.title) : "";
        var href = it.href != null ? String(it.href) : "#";
        var src = it.src != null ? String(it.src) : "";
        if (!src) return "";
        var focal = canonicalSliderFocal(it.focal);
        var dataFocal = focal ? ' data-focal="' + escapeHtml(focal) + '"' : "";
        return (
          '<figure class="image-effect"' +
          dataFocal +
          ">" +
          '<a class="collage-crop" href="' +
          escapeHtml(href) +
          '">' +
          '<span class="collage-crop__inner">' +
          '<img src="' +
          escapeHtml(src) +
          '" alt="' +
          escapeHtml(title) +
          '" loading="lazy">' +
          "</span></a>" +
          '<figcaption>' +
          escapeHtml(title) +
          "</figcaption>" +
          "</figure>"
        );
      })
      .join("");
    elRoot.innerHTML = html;
  }

  render();
})();
