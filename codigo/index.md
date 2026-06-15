---
layout: default
title: Código
description: "Código como expresión. Programación desfasada y algo inútil — KNDL 000."
---

{% assign sorted_codigos = site.codigos | sort: "title" %}

<ul class="codigo-list">
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
    <li class="codigo-list__item">
      <span class="codigo-list__binary">#{{ binary }}</span>
      <a class="codigo-list__title" href="{{ codigo.url | relative_url }}">[{{ codigo.title }}]</a>
      {% if codigo.language %}
        <span class="codigo-list__lang">({{ codigo.language }})</span>
      {% endif %}
      {% if codigo.concept %}
        <p class="codigo-list__concept">{{ codigo.concept }}</p>
      {% endif %}
    </li>
  {% endfor %}
</ul>

---

_Código como expresión. Programación desfasada y algo inutil._

