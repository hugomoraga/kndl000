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

    targets.forEach(function (target) {
      var rect = lastRect(target.range);
      if (!rect) return;
      var layerRect = layer.getBoundingClientRect();
      var marker = document.createElement("span");
      marker.className = "melt-marker";
      marker.style.left = (rect.left - layerRect.left) + "px";
      marker.style.top = (rect.top - layerRect.top) + "px";
      layer.appendChild(marker);
      target.marker = marker;
    });

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
      if (!rect) return;

      var layerRect = layer.getBoundingClientRect();
      var style = window.getComputedStyle(target.paragraph);
      var left = rect.left - layerRect.left;
      var top = rect.top - layerRect.top;
      var delay = target.index * 55;
      var value = target.range.toString();
      if (!value) return;

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
        return;
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
              transform: "translate3d(" + ((index % 2 ? 1 : -1) * 0.12) + "em, " + (1.35 + (index % 3) * 0.22) + "em, 0) scale(1.1, 3.1) skewX(8deg)",
              opacity: 0,
              filter: "blur(0.8px)",
              offset: 1
            }
          ],
          {
            duration: 3000 + (index % 4) * 220,
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

      window.setTimeout(function () { clone.remove(); }, 4300 + delay);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = null;
          for (var i = 0; i < targets.length; i++) {
            if (targets[i].marker === entry.target) {
              target = targets[i];
              break;
            }
          }
          if (!target) return;
          observer.unobserve(entry.target);
          if (target.marker) target.marker.remove();
          window.setTimeout(function () { melt(target); }, 80);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (target) {
      if (target.marker) observer.observe(target.marker);
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        Array.prototype.forEach.call(layer.children, function (node) {
          if (node.classList.contains("melt-word") || node.classList.contains("melt-drop")) {
            node.remove();
          }
        });
      }, 180);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
