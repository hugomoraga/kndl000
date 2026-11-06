(function () {
  "use strict";

  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  var figure = document.querySelector(".imaginario-viewer__figure");
  var image = figure && figure.querySelector("img.imaginario-viewer__media");
  if (!figure || !image) return;

  var lensSize = 180;
  var scale = 2;

  var lens = document.createElement("div");
  lens.className = "imaginario-loupe";
  lens.setAttribute("aria-hidden", "true");

  var clone = image.cloneNode(false);
  clone.className = "imaginario-loupe__image";
  clone.removeAttribute("id");
  clone.removeAttribute("loading");
  clone.setAttribute("aria-hidden", "true");
  clone.alt = "";

  var sourceStyle = getComputedStyle(image);
  clone.style.objectFit = sourceStyle.objectFit;
  clone.style.objectPosition = sourceStyle.objectPosition;
  clone.style.aspectRatio = "auto";

  lens.appendChild(clone);
  figure.appendChild(lens);

  function hide() {
    figure.classList.remove("is-loupe");
  }

  function move(event) {
    var rect = image.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      hide();
      return;
    }

    var figureRect = figure.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var left = Math.min(Math.max(x - lensSize / 2, 0), Math.max(0, rect.width - lensSize));
    var top = Math.min(Math.max(y - lensSize / 2, 0), Math.max(0, rect.height - lensSize));

    lens.style.left = rect.left - figureRect.left + left + "px";
    lens.style.top = rect.top - figureRect.top + top + "px";

    clone.style.width = rect.width * scale + "px";
    clone.style.height = rect.height * scale + "px";
    clone.style.left = lensSize / 2 - x * scale + "px";
    clone.style.top = lensSize / 2 - y * scale + "px";

    figure.classList.add("is-loupe");
  }

  image.addEventListener("pointerenter", move);
  image.addEventListener("pointermove", move);
  image.addEventListener("pointerleave", hide);
  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize", hide);
})();
