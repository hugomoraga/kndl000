(function () {
  "use strict";

  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-code-filter]"));
  var modules = Array.prototype.slice.call(document.querySelectorAll(".codigo-rack .codigo-module"));
  var status = document.getElementById("codigo-filter-status");
  if (!filters.length || !modules.length) return;

  function apply(value) {
    var visible = 0;

    modules.forEach(function (module) {
      var link = module.querySelector(".codigo-module__link");
      var runnable = link && link.getAttribute("data-runnable") === "true";
      var match = value === "all" || (value === "true" && runnable) || (value === "false" && !runnable);
      module.hidden = !match;
      if (match) visible += 1;
    });

    filters.forEach(function (filter) {
      filter.setAttribute("aria-pressed", filter.getAttribute("data-code-filter") === value ? "true" : "false");
    });

    if (status) {
      status.textContent = "Mostrando " + visible + " módulos.";
    }
  }

  filters.forEach(function (filter) {
    filter.addEventListener("click", function () {
      apply(filter.getAttribute("data-code-filter"));
    });
  });
})();
