(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function init() {
    var poem = document.querySelector(".poem-body");
    if (!poem || poem.dataset.inkEcho === "true") return;

    poem.dataset.inkEcho = "true";
    poem.classList.add("poem-with-ink-echo");

    var pointerX = 0;
    var pointerY = 0;
    var scrollShift = 0;
    var frame = null;

    function render() {
      frame = null;
      var x = 1.2 + pointerX * 1.6;
      var y = 0.6 + pointerY * 1.2 + scrollShift;
      poem.style.setProperty("--echo-x", x.toFixed(2) + "px");
      poem.style.setProperty("--echo-y", y.toFixed(2) + "px");
    }

    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(render);
    }

    window.addEventListener(
      "pointermove",
      function (event) {
        pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        pointerY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
        schedule();
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      function () {
        pointerX = 0;
        pointerY = 0;
        schedule();
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      function () {
        scrollShift = Math.sin(window.scrollY / 300) * 1.4;
        schedule();
      },
      { passive: true }
    );

    render();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
