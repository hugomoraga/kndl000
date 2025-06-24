---
layout: default
title: Inicio
nav: true
nav_order: 1
---

# C . E . N . I . Z . A . S

> “Oculto y no tanto”

<div class="nube-de-palabras">
  <a href="{{ site.baseurl }}/diario/">✶ Diario</a>
  <a href="{{ site.baseurl }}/fragmentos/">☍ Fragmentos</a>
  <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
  <a href="{{ site.baseurl }}/musica/">𝄞 Música</a>
  <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
</div>

<div class="collage">

{% for object in site.assemblage %}
  <figure>
    <a href="{{ site.baseurl }}{{ object.link }}">
      <img src="{{ site.baseurl }}{{ object.image }}" alt="{{ object.title }}">
    </a>
    <figcaption>{{ object.title }}</figcaption>
  </figure>
{% endfor %}

</div>


<canvas id="art" width="800" height="600" style="width: 100%; height: 300px;"></canvas>
<script>
const canvas = document.getElementById("art");
const ctx = canvas.getContext("2d");
let t = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#999";
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 10) {
    let y = canvas.height / 2 + Math.sin(x * 0.01 + t) * 20;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  t += 0.05;
  requestAnimationFrame(draw);
}
draw();
</script>


<iframe width="100%" height="400px" src="https://www.youtube.com/embed/QNS9RGB1GWg?si=1kdQaWa02BWeQJiI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>