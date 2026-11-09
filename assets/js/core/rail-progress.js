(function () {
  "use strict";

  var fill = document.querySelector(".archive-rail__progress-fill");
  if (!fill) return;

  var ticking = false;

  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var progress = max > 0 ? window.scrollY / max : 0;
    progress = Math.max(0, Math.min(1, progress));
    fill.style.height = (progress * 100).toFixed(2) + "%";
    ticking = false;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();
