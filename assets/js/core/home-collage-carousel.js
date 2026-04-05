(function () {
  "use strict";

  var ROOT_ID = "home-collage-root";

  function centerMiddleSlide(root) {
    if (!root || root.id !== ROOT_ID || !root.classList.contains("collage--home-mini")) {
      return;
    }
    if (!window.matchMedia("(max-width: 768px)").matches) {
      return;
    }
    var figures = root.querySelectorAll("figure");
    if (figures.length === 0) {
      return;
    }
    var mid = Math.floor((figures.length - 1) / 2);
    var target = figures[mid];
    if (!target) {
      return;
    }
    var rootRect = root.getBoundingClientRect();
    var targetRect = target.getBoundingClientRect();
    var centerTarget = targetRect.left + targetRect.width / 2;
    var centerViewport = rootRect.left + root.clientWidth / 2;
    var delta = centerTarget - centerViewport;
    var maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
    var next = root.scrollLeft + delta;
    root.scrollLeft = Math.max(0, Math.min(next, maxScroll));
  }

  function run() {
    var root = document.getElementById(ROOT_ID);
    centerMiddleSlide(root);
  }

  function runAfterLayout() {
    requestAnimationFrame(function () {
      requestAnimationFrame(run);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAfterLayout);
  } else {
    runAfterLayout();
  }

  window.addEventListener("load", run);
})();
