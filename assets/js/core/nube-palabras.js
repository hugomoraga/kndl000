(function () {
  "use strict";

  var root = document.querySelector(".nube-de-palabras");
  if (!root || root.getAttribute("data-no-nube-motion") != null) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var links = root.querySelectorAll("a");
  if (!links.length) return;

  root.classList.add("nube-de-palabras--js");

  var start = performance.now();
  /** Un ciclo: calma → intensidad máx. → calma (ms). */
  var CYCLE_MS = 15000;

  /** 0 en t≈0 y t≈fin de ciclo, 1 en el centro (sin² sobre medio periodo). */
  function intensity(now) {
    var t = (((now - start) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
    var u = t / CYCLE_MS;
    var s = Math.sin(Math.PI * u);
    return s * s;
  }

  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () {
      a.classList.add("nube-de-palabras__link--hover");
    });
    a.addEventListener("mouseleave", function () {
      a.classList.remove("nube-de-palabras__link--hover");
    });
  });

  function loop(now) {
    var I = intensity(now);
    var drift = 3 + I * 22;
    var rotC = Math.sin(now / 13000) * (0.25 + I * 1.4);
    root.style.transform =
      "translate(" +
      Math.sin(now / 6200) * drift +
      "px, " +
      Math.cos(now / 7100) * drift * 0.88 +
      "px) rotate(" +
      rotC +
      "deg)";

    links.forEach(function (a, i) {
      var seed = i * 1.73 + 0.41;
      var speed = 0.38 + I * 1.05;
      var phase = now * 0.001 * speed + seed;
      var amp = 5 + I * 30;
      var rot = 2.2 + I * 7.5;
      var hover = a.classList.contains("nube-de-palabras__link--hover");
      var sc = hover ? 1.22 : 1;
      a.style.transform =
        "translateY(" +
        Math.sin(phase) * amp +
        "px) rotate(" +
        Math.cos(phase * 0.64) * rot +
        "deg) scale(" +
        sc +
        ")";
      var glow = I * 14;
      var glowA = 0.08 + I * 0.42;
      a.style.filter =
        "brightness(" +
        (1 + I * 0.42) +
        ") drop-shadow(0 0 " +
        glow +
        "px rgba(255, 255, 255, " +
        glowA +
        "))";
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
