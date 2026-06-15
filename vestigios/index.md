---
layout: default
title: ⚱ Vestigios ⚱
description: "Lo que queda después. Objetos encontrados. Textos incompletos. Archivo de lo que persiste. — KNDL 000"
---

> *Lo que queda después. Objetos encontrados. Textos incompletos. Archivo de lo que persiste.*

{% assign sorted_vestigios = site.vestigios | sort: "date" | reverse %}

{% for vestigio in sorted_vestigios %}
<article class="vestigio">
  <a class="vestigio__title-link" href="{{ vestigio.url | relative_url }}">
    <h3 class="vestigio__title">
      {% if vestigio.hermes == true %}<span class="vestigio__sigil" title="Firmado por Hermes (∴)">∴</span> {% endif %}{{ vestigio.title }}
      {% if vestigio.date %}
        <span class="vestigio__date">({{ vestigio.date | date: "%Y-%m-%d" }})</span>
      {% endif %}
    </h3>
  </a>

  {% if vestigio.image %}
    <img class="vestigio__image" src="{{ vestigio.image | relative_url }}" alt="{{ vestigio.title }}">
  {% endif %}

  <div class="vestigio__body">
    {{ vestigio.content | strip_html | truncatewords: 30 }}
  </div>

  <a class="vestigio__more" href="{{ vestigio.url | relative_url }}">↳ ver vestigio completo</a>
</article>

{% if forloop.last == false %}
<hr class="vestigio__sep">
{% endif %}

{% endfor %}
