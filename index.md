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

<style>
.collage {
  column-count: 3;
  column-gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 800px) {
  .collage {
    column-count: 2;
  }
}
@media (max-width: 500px) {
  .collage {
    column-count: 1;
  }
}

.collage figure {
  break-inside: avoid;
  margin: 0 0 1rem;
}

.collage img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}
.collage figcaption {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.4rem;
}
</style>

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