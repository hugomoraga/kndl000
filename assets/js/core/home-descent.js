(function () {
  "use strict";

  var link = document.querySelector(".umbral__descent");
  if (!link) return;

  var defaultId = String(link.getAttribute("href") || "").replace(/^#/, "");
  var mobileId = link.getAttribute("data-mobile-target") || defaultId;
  var mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 768px)") : null;
  var hero = document.querySelector(".umbral");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function currentId() {
    return mobileQuery && mobileQuery.matches ? mobileId : defaultId;
  }

  function syncHref() {
    link.setAttribute("href", "#" + currentId());
  }

  syncHref();
  if (mobileQuery) {
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", syncHref);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(syncHref);
    }
  }

  link.addEventListener("click", function (event) {
    if (reduced) return;

    var id = currentId();
    var target = document.getElementById(id) || document.getElementById(defaultId);
    if (!target) return;

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
