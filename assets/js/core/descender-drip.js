(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?:[’'][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)*[.,;:!?…]*/g;

  function init() {
    var poem = document.querySelector(".poem-body");
    if (!poem) return;

    var paragraphs = Array.prototype.slice.call(poem.querySelectorAll("p"));
    if (!paragraphs.length) return;

    function lastWordRange(paragraph) {
      var text = paragraph.textContent || "";
      var match = null;
      var current;
      WORD.lastIndex = 0;
      while ((current = WORD.exec(text)) !== null) {
        match = current;
      }
      if (!match) return null;

      var start = match.index;
      var end = start + match[0].length;
      var walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, null, false);
      var node;
      var count = 0;
      var startNode = null;
      var startOffset = 0;
      var endNode = null;
      var endOffset = 0;

      while ((node = walker.nextNode())) {
        var length = node.nodeValue.length;
        if (!startNode && start >= count && start < count + length) {
          startNode = node;
          startOffset = start - count;
        }
        if (startNode && end >= count && end <= count + length) {
          endNode = node;
          endOffset = end - count;
          break;
        }
        count += length;
      }

      if (!startNode || !endNode) return null;

      var range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    }

    function lastRect(range) {
      var rects = range.getClientRects();
      for (var i = rects.length - 1; i >= 0; i--) {
        if (rects[i].width > 0 && rects[i].height > 0) return rects[i];
      }
      return null;
    }

    var targets = [];
    paragraphs.forEach(function (paragraph, index) {
      var range = lastWordRange(paragraph);
      if (!range) return;
      var rect = lastRect(range);
      if (!rect) return;
      targets.push({ paragraph: paragraph, range: range, index: index });
    });

    if (!targets.length) return;

    var layer = document.createElement("div");
    layer.className = "melt-layer";
    layer.setAttribute("aria-hidden", "true");
    poem.appendChild(layer);
    document.body.classList.add("has-descender-drip");

    var melted = Object.create(null);
    var activeUntil = 0;
    var cooldown = 1400;
    var ticking = false;

    function addDrop(left, top, delay) {
      var drop = document.createElement("span");
      drop.className = "melt-drop";
      drop.style.left = left + "px";
      drop.style.top = top + "px";
      drop.style.animationDelay = delay + "ms";
      layer.appendChild(drop);
      drop.addEventListener("animationend", function () {
        drop.remove();
      }, { once: true });
    }

    function melt(target) {
      var rect = lastRect(target.range);
      if (!rect) return false;

      var layerRect = layer.getBoundingClientRect();
      var style = window.getComputedStyle(target.paragraph);
      var left = rect.left - layerRect.left;
      var top = rect.top - layerRect.top;
      var delay = 0;
      var value = target.range.toString();
      if (!value) return false;

      var clone = document.createElement("span");
      clone.className = "melt-word";
      clone.style.left = left + "px";
      clone.style.top = top + "px";
      clone.style.fontFamily = style.fontFamily;
      clone.style.fontSize = style.fontSize;
      clone.style.fontWeight = style.fontWeight;
      clone.style.fontStyle = style.fontStyle;
      clone.style.letterSpacing = style.letterSpacing;
      clone.style.lineHeight = "1";

      var letters = [];
      Array.prototype.forEach.call(value, function (character, index) {
        var letter = document.createElement("span");
        letter.className = "melt-letter";
        letter.textContent = character;
        letter.style.animationDelay = (delay + index * 24) + "ms";
        clone.appendChild(letter);
        letters.push(letter);
      });
      layer.appendChild(clone);

      if (typeof letters[0].animate !== "function") {
        clone.style.opacity = "0.7";
        clone.style.transform = "translateY(1.2em) scaleY(2.4) skewX(5deg)";
        window.setTimeout(function () { clone.remove(); }, 2800);
        return true;
      }

      letters.forEach(function (letter, index) {
        letter.animate(
          [
            {
              transform: "translate3d(0, 0, 0) scale(1, 1) skewX(0deg)",
              opacity: 0,
              filter: "blur(0px)",
              offset: 0
            },
            {
              transform: "translate3d(0, 0.1em, 0) scale(1.03, 1.24) skewX(-1deg)",
              opacity: 0.92,
              filter: "blur(0px)",
              offset: 0.14
            },
            {
              transform: "translate3d(" + ((index % 2 ? 1 : -1) * 0.06) + "em, 0.65em, 0) scale(1.06, 2) skewX(-4deg)",
              opacity: 0.72,
              filter: "blur(0.15px)",
              offset: 0.62
            },
            {
              transform: "translate3d(" + ((index % 2 ? 1 : -1) * 0.1) + "em, " + (0.95 + (index % 3) * 0.16) + "em, 0) scale(1.08, 2.7) skewX(6deg)",
              opacity: 0,
              filter: "blur(0.55px)",
              offset: 1
            }
          ],
          {
            duration: 2800 + (index % 4) * 180,
            delay: delay + index * 24,
            easing: "cubic-bezier(.16,.8,.2,1)",
            fill: "forwards"
          }
        );
      });

      window.requestAnimationFrame(function () {
        var drops = 0;
        Array.prototype.forEach.call(letters, function (letter, index) {
          if (drops >= 3) return;
          var letterRect = letter.getBoundingClientRect();
          var isDescender = /[gjpqy]/i.test(letter.textContent);
          if (!isDescender && index < letters.length - 2) return;
          drops += 1;
          addDrop(
            letterRect.left - layerRect.left + letterRect.width / 2,
            letterRect.bottom - layerRect.top - 2,
            delay + index * 24 + 60
          );
        });
      });

      window.setTimeout(function () { clone.remove(); }, 3900 + delay);
      return true;
    }

    function nearestTarget() {
      var viewportCenter = window.innerHeight * 0.5;
      var best = null;
      var bestDistance = Infinity;

      targets.forEach(function (target) {
        if (melted[target.index]) return;
        var rect = lastRect(target.range);
        if (!rect) return;
        if (rect.bottom < 40 || rect.top > window.innerHeight - 40) return;
        var middle = rect.top + rect.height / 2;
        var distance = Math.abs(middle - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = target;
        }
      });

      return best;
    }

    function maybeMelt() {
      var now = window.performance && performance.now ? performance.now() : Date.now();
      if (now < activeUntil + cooldown) return;
      var target = nearestTarget();
      if (!target) return;
      activeUntil = now + 3400;
      if (melt(target)) {
        melted[target.index] = true;
      } else {
        activeUntil = now + 600;
      }
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        maybeMelt();
      });
    }

    window.addEventListener("scroll", schedule, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        Array.prototype.forEach.call(layer.children, function (node) {
          if (node.classList.contains("melt-word") || node.classList.contains("melt-drop")) {
            node.remove();
          }
        });
        schedule();
      }, 180);
    });

    window.setTimeout(schedule, 700);

    var loadTries = 0;
    var loadTimer = window.setInterval(function () {
      schedule();
      loadTries++;
      if (loadTries >= 8 || Object.keys(melted).length > 0) {
        window.clearInterval(loadTimer);
      }
    }, 900);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
