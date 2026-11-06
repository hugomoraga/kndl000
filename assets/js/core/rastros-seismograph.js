(function () {
  "use strict";

  var host = document.querySelector(".rastros-seismograph");
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".rastro-bloque"));
  if (!host || !blocks.length) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hash(n) {
    var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return Math.abs(Math.floor(x * 1000));
  }

  var marks = blocks.map(function (block, index) {
    var mark = document.createElement("span");
    mark.className = "rastros-seismograph__mark";
    mark.style.setProperty("--mark-y", 6 + (hash(index) % 88) + "%");
    mark.style.setProperty("--mark-w", 4 + (hash(index + 17) % 12) + "px");
    host.appendChild(mark);
    return mark;
  });

  if (reduced) {
    marks.forEach(function (mark) {
      mark.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = blocks.indexOf(entry.target);
        if (index >= 0) marks[index].classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.55 }
  );

  blocks.forEach(function (block) {
    observer.observe(block);
  });
})();
