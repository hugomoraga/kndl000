(function () {
  "use strict";

  var root = document.querySelector(".nube-de-palabras");
  if (!root || root.getAttribute("data-no-nube-motion") != null) return;

  /* En móvil el CSS ya deja la nube como lista; evitar transform inline y rAF */
  if (window.matchMedia("(max-width: 768px)").matches) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var links = root.querySelectorAll("a");
  if (!links.length) return;

  root.classList.add("nube-de-palabras--js");

  var start = performance.now();
  /** Un ciclo: calma → subida suave → pico moderado → calma (ms). */
  var CYCLE_MS = 28000;

  /**
   * 0 en calma al inicio/fin de ciclo, ~1 en el centro.
   * sin⁴ deja más tiempo cerca de 0 (más respiración, menos tiempo “fuerte”).
   */
  function intensity(now) {
    var t = (((now - start) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
    var u = t / CYCLE_MS;
    var s = Math.sin(Math.PI * u);
    return s * s * s * s;
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
    /* Calma: deriva mínima; pico: aún moderado */
    var drift = 1.2 + I * 12;
    var rotC = Math.sin(now / 16000) * (0.1 + I * 0.65);
    root.style.transform =
      "translate(" +
      Math.sin(now / 7800) * drift +
      "px, " +
      Math.cos(now / 9000) * drift * 0.85 +
      "px) rotate(" +
      rotC +
      "deg)";

    links.forEach(function (a, i) {
      var seed = i * 1.73 + 0.41;
      var speed = 0.26 + I * 0.55;
      var phase = now * 0.001 * speed + seed;
      var amp = 2.5 + I * 12;
      var rot = 1 + I * 3.8;
      var hover = a.classList.contains("nube-de-palabras__link--hover");
      var sc = hover ? 1.18 : 1;
      a.style.transform =
        "translateY(" +
        Math.sin(phase) * amp +
        "px) rotate(" +
        Math.cos(phase * 0.64) * rot +
        "deg) scale(" +
        sc +
        ")";
      var glow = I * 6;
      var glowA = 0.04 + I * 0.18;
      a.style.filter =
        "brightness(" +
        (1 + I * 0.2) +
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
