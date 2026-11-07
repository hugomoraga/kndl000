(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function init() {
    var poem = document.querySelector(".poem-body");
    if (!poem || poem.dataset.fogFocus === "true") return;

    var blocks = Array.prototype.slice.call(poem.querySelectorAll("p, blockquote, li"));
    if (!blocks.length) return;

    var words = [];

    function wrapWords(block) {
      var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement && node.parentElement.closest("code, pre, a")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }, false);

      var nodes = [];
      var node;
      while ((node = walker.nextNode())) nodes.push(node);

      nodes.forEach(function (textNode) {
        var parts = textNode.nodeValue.split(/(\s+)/);
        var fragment = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          var word = document.createElement("span");
          word.className = "fog-word";
          word.textContent = part;
          fragment.appendChild(word);
          words.push(word);
        });
        textNode.parentNode.replaceChild(fragment, textNode);
      });
    }

    blocks.forEach(wrapWords);
    if (!words.length) return;

    poem.dataset.fogFocus = "true";
    poem.classList.add("poem-with-fog");

    var frame = null;

    function update() {
      frame = null;
      var height = window.innerHeight || 1;
      var center = height * 0.5;
      var range = height * 0.58;

      words.forEach(function (word) {
        var rect = word.getBoundingClientRect();
        if (rect.bottom < -range || rect.top > height + range) return;
        var wordCenter = rect.top + rect.height / 2;
        var distance = Math.abs(wordCenter - center);
        var fog = Math.min(1, Math.max(0, (distance / range - 0.14) / 0.86));
        word.style.setProperty("--fog", fog.toFixed(3));
      });
    }

    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
