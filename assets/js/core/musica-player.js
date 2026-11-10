(function () {
  "use strict";

  var button = document.getElementById("musica-play");
  var player = document.getElementById("musica-player");
  if (!button || !player) return;

  button.hidden = false;

  button.addEventListener("click", function () {
    var src = button.getAttribute("data-embed");
    if (!src) return;

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = "100%";
    iframe.height = "80";
    iframe.loading = "lazy";
    iframe.title = "Reproductor de Spotify: " + (button.getAttribute("data-title") || "");
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.setAttribute("frameborder", "0");
    player.appendChild(iframe);
    player.hidden = false;
    button.hidden = true;
    button.setAttribute("aria-expanded", "true");
  });
})();
