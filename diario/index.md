---
layout: default
title: Diario
symbol: "✶"
sigil: diario
body_class: interior-page diario-surface section-index
back: false
description: "Anotaciones, recorridos, pensamientos sueltos. Bitácora pública de KNDL 000."
nav: false
---

<div class="diario-index">
  {% for post in site.posts %}
  <article class="diario-entry">
    <time class="diario-entry__date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
    <div class="diario-entry__body">
      <h2 class="diario-entry__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      <p class="diario-entry__excerpt">{{ post.content | strip_html | truncatewords: 40 }}</p>
    </div>
  </article>
  {% endfor %}
</div>
