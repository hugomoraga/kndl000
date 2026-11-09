(function () {
  "use strict";

  var link = document.querySelector(".umbral__descent");
  if (!link) return;

  var id = String(link.getAttribute("href") || "").replace(/^#/, "");
  var target = id ? document.getElementById(id) : null;
  if (!target) return;

  var hero = document.querySelector(".umbral");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  link.addEventListener("click", function (event) {
    if (reduced) return;

    event.preventDefault();

    var top = target.getBoundingClientRect().top + window.scrollY;

    if (hero) hero.classList.add("is-descending");

    if (history.pushState) {
      history.pushState(null, "", "#" + id);
    } else {
      window.location.hash = id;
    }

    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({ top: top, behavior: "smooth" });
    } else {
      window.scrollTo(0, top);
    }

    window.setTimeout(function () {
      if (hero) hero.classList.remove("is-descending");
    }, 1100);
  });
})();
