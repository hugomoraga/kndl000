(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function init() {
    var poem = document.querySelector(".poem-body");
    if (!poem || poem.dataset.wordDrift === "true") return;

    var blocks = Array.prototype.slice.call(poem.querySelectorAll("p, blockquote, li"));
    if (!blocks.length) return;

    var wordIndex = 0;

    blocks.forEach(function (block) {
      var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement && node.parentElement.closest("code, pre, a")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }, false);

      var textNodes = [];
      var node;
      while ((node = walker.nextNode())) textNodes.push(node);

      textNodes.forEach(function (textNode) {
        var parts = textNode.nodeValue.split(/(\s+)/);
        var fragment = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          var word = document.createElement("span");
          word.className = "drift-word";
          word.textContent = part;
          word.style.setProperty("--i", String(wordIndex));
          wordIndex += 1;
          fragment.appendChild(word);
        });
        textNode.parentNode.replaceChild(fragment, textNode);
      });
    });

    poem.dataset.wordDrift = "true";
    poem.classList.add("poem-with-word-drift");

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            poem.classList.toggle("is-visible", entry.isIntersecting);
          });
        },
        { threshold: 0.08 }
      );
      observer.observe(poem);
    } else {
      poem.classList.add("is-visible");
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
