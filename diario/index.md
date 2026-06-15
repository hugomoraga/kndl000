---
layout: default
title: ✶ Diario ✶
description: "Anotaciones, recorridos, pensamientos sueltos. Bitácora pública de KNDL 000."
nav: false
---

<div class="diario-index">
  {% for post in site.posts %}
  <article class="diario-entry">
    <h2 class="diario-entry__title">
      <a href="{{ post.url | relative_url }}">◦ {{ post.title }}</a>
      <span class="diario-entry__date">({{ post.date | date: "%Y-%m-%d" }})</span>
    </h2>
    <div class="diario-entry__excerpt">
      {{ post.content | strip_html | truncatewords: 40 }}
    </div>
    <a href="{{ post.url | relative_url }}" class="diario-entry__more">↳ Ver más</a>
  </article>
  {% if forloop.last == false %}
  <hr class="diario-entry__sep">
  {% endif %}
  {% endfor %}
</div>
