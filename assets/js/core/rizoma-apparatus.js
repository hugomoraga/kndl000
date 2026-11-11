(function () {
  "use strict";

  var details = document.querySelector(".expediente__apparatus-details");
  if (!details) return;

  var mobile = window.matchMedia
    ? window.matchMedia("(max-width: 900px)")
    : null;

  function sync() {
    if (mobile && mobile.matches) {
      details.removeAttribute("open");
    } else {
      details.setAttribute("open", "");
    }
  }

  sync();

  if (mobile) {
    if (mobile.addEventListener) {
      mobile.addEventListener("change", sync);
    } else if (mobile.addListener) {
      mobile.addListener(sync);
    }
  }
})();
