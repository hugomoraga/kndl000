---
layout: default
title: Código
---

{% assign sorted_codigos = site.codigos | sort: "date" %}

<ul>
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
    <li>
      <span style="color:#5fa8a0; font-family: var(--font-mono); font-size: 0.85em;">#{{ binary }}</span>
      ~ <a href="{{ codigo.url | relative_url }}">[{{ codigo.title }}]</a>
      {% if codigo.language %}
        <span style="font-size: 0.9em; color: #999;"> ({{ codigo.language }})</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>

---

_Código como expresión. Programación desfasada y algo inutil._

