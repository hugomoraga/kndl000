(function () {
  "use strict";

  var header = document.querySelector(".home-header");
  var nav = document.querySelector(".home-nav");
  var btn = document.getElementById("home-nav-toggle");
  var panel = document.getElementById("home-nav-panel");
  if (!header || !nav || !btn || !panel) return;

  var mq = window.matchMedia("(max-width: 768px)");
  var SCROLL_HIDE_PX = 48;

  function updateScrollClass() {
    if (!mq.matches) {
      header.classList.remove("home-header--scrolled");
      return;
    }
    if (header.classList.contains("home-header--nav-open")) {
      header.classList.remove("home-header--scrolled");
      return;
    }
    if (window.scrollY > SCROLL_HIDE_PX) {
      header.classList.add("home-header--scrolled");
    } else {
      header.classList.remove("home-header--scrolled");
    }
  }

  function sync() {
    if (mq.matches) {
      var open = header.classList.contains("home-header--nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    } else {
      header.classList.remove("home-header--nav-open");
      btn.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
    }
  }

  btn.addEventListener("click", function () {
    if (!mq.matches) return;
    header.classList.toggle("home-header--nav-open");
    sync();
    updateScrollClass();
  });

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      mq.matches &&
      header.classList.contains("home-header--nav-open")
    ) {
      header.classList.remove("home-header--nav-open");
      sync();
      updateScrollClass();
      btn.focus();
    }
  });

  panel.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      if (mq.matches) {
        header.classList.remove("home-header--nav-open");
        sync();
        updateScrollClass();
      }
    });
  });

  window.addEventListener(
    "scroll",
    function () {
      updateScrollClass();
    },
    { passive: true }
  );

  if (mq.addEventListener) {
    mq.addEventListener("change", function () {
      sync();
      updateScrollClass();
    });
  } else if (mq.addListener) {
    mq.addListener(function () {
      sync();
      updateScrollClass();
    });
  }

  sync();
  updateScrollClass();
})();
