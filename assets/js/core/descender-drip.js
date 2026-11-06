(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  function init() {
    var poem = document.querySelector(".poem-body");
    if (!poem) return;

    var paragraphs = Array.prototype.slice.call(poem.querySelectorAll("p"));
    if (!paragraphs.length) return;

    function hasDescender(value) {
      return /[gjpqy]/.test(value);
    }

    var targets = [];

    paragraphs.forEach(function (paragraph, paragraphIndex) {
      if (paragraph.closest(".descender-layer")) return;

      var text = paragraph.textContent || "";
      if (!hasDescender(text)) return;

      var charIndex = -1;
      for (var i = text.length - 1; i >= 0; i--) {
        if (hasDescender(text.charAt(i))) {
          charIndex = i;
          break;
        }
      }
      if (charIndex < 0) return;

      var walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, null, false);
      var node;
      var count = 0;
      var targetNode = null;
      var offset = 0;

      while ((node = walker.nextNode())) {
        var length = node.nodeValue.length;
        if (charIndex < count + length) {
          targetNode = node;
          offset = charIndex - count;
          break;
        }
        count += length;
      }

      if (!targetNode) return;

      var span = document.createElement("span");
      span.className = "descender";
      span.textContent = targetNode.nodeValue.charAt(offset);

      var range = document.createRange();
      range.setStart(targetNode, offset);
      range.setEnd(targetNode, offset + 1);
      range.deleteContents();
      range.insertNode(span);

      targets.push({ span: span, paragraph: paragraph, index: paragraphIndex });
    });

    if (!targets.length) return;

    var layer = document.createElement("div");
    layer.className = "descender-layer";
    layer.setAttribute("aria-hidden", "true");
    poem.appendChild(layer);
    document.body.classList.add("has-descender-drip");
    var sedimentIndex = 0;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var target = null;
          for (var i = 0; i < targets.length; i++) {
            if (targets[i].paragraph === entry.target) {
              target = targets[i];
              break;
            }
          }
          if (!target) return;

          observer.unobserve(entry.target);
          window.setTimeout(function () {
            drop(target);
          }, target.index * 140);
        });
      },
      { threshold: 0.55, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (target) {
      observer.observe(target.paragraph);
    });

    function drop(target) {
      if (target.span.classList.contains("descender--ghost")) return;

      var rect = target.span.getBoundingClientRect();
      var layerRect = layer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      var clone = document.createElement("span");
      clone.className = "descender descender--falling";
      clone.textContent = target.span.textContent;
      clone.setAttribute("aria-hidden", "true");

      var startLeft = rect.left - layerRect.left;
      var startTop = rect.top - layerRect.top;
      var targetLeft = sedimentIndex * 16;
      var targetTop = layer.clientHeight - 38 - rect.height;
      var dx = targetLeft - startLeft;
      var dy = targetTop - startTop;
      var rotation = target.index % 2 === 0 ? 5 : -4;
      sedimentIndex += 1;

      clone.style.left = startLeft + "px";
      clone.style.top = startTop + "px";
      clone.style.width = rect.width + "px";
      clone.dataset.targetLeft = String(targetLeft);
      clone.dataset.targetTop = String(targetTop);
      layer.appendChild(clone);

      target.span.classList.add("descender--ghost");

      if (typeof clone.animate !== "function") {
        clone.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rotation + "deg)";
        clone.style.opacity = "0.7";
        return;
      }

      var animation = clone.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 0.85 },
          { transform: "translate(" + dx + "px," + dy + "px) rotate(" + rotation + "deg)", opacity: 0.7 }
        ],
        {
          duration: 1200 + target.index * 100,
          easing: "cubic-bezier(.2,.75,.2,1)",
          fill: "forwards"
        }
      );

      animation.onfinish = function () {
        clone.style.opacity = "0.7";
      };
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        Array.prototype.forEach.call(layer.querySelectorAll(".descender--falling"), function (clone) {
          var startLeft = parseFloat(clone.style.left) || 0;
          var startTop = parseFloat(clone.style.top) || 0;
          var targetLeft = parseFloat(clone.dataset.targetLeft) || 0;
          var height = clone.getBoundingClientRect().height;
          var targetTop = layer.clientHeight - 38 - height;
          var dx = targetLeft - startLeft;
          var dy = targetTop - startTop;

          if (clone.getAnimations) {
            clone.getAnimations().forEach(function (animation) {
              animation.cancel();
            });
          }
          clone.style.transform = "translate(" + dx + "px," + dy + "px) rotate(0deg)";
          clone.style.opacity = "0.7";
        });
      }, 200);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
