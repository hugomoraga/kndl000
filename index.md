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

<iframe width="100%" height="100%" src="https://www.youtube.com/embed/QNS9RGB1GWg?si=1kdQaWa02BWeQJiI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>