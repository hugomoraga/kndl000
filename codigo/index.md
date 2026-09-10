---
layout: default
title: Código
description: "Código como expresión. Programación desfasada y algo inútil — KNDL 000."
---

{% assign sorted_codigos = site.codigos | sort: "title" %}

<div class="codigo-listing">
  <div class="codigo-listing__head">
    <span class="codigo-listing__ps">$</span>ls -1 /codigo/
  </div>
  <ul class="codigo-listing__list">
    {% for codigo in sorted_codigos %}
      {% assign index = forloop.index | minus: 1 %}
      {% assign binary = "" %}
      {% assign num = index %}
      {% for i in (0..7) %}
        {% assign bit = num | modulo: 2 %}
        {% assign binary = bit | append: binary %}
        {% assign num = num | divided_by: 2 %}
      {% endfor %}
      {% assign binary = binary | prepend: "00000000" | slice: -8, 8 %}
      <li class="codigo-listing__item">
        <a class="codigo-listing__link" href="{{ codigo.url | relative_url }}">
          <span class="codigo-listing__hash">#{{ binary }}</span>
          <span class="codigo-listing__title">{{ codigo.title }}</span>
          <span class="codigo-listing__lang">{{ codigo.language | downcase }}</span>
          {% if codigo.concept %}
            <span class="codigo-listing__concept">— {{ codigo.concept }}</span>
          {% endif %}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>

---

_Código como expresión. Programación desfasada y algo inútil._
