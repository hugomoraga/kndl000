---
layout: default
title:  ☽ Melange ☾
nav: true
nav_order: 6
---

<div class="melange-journal" markdown="0">

<header class="melange-journal__masthead">
  <p class="melange-journal__kicker">Cuaderno de campo</p>
  <p class="melange-journal__tagline">Notas sueltas, fechas aproximadas, reportes de travesía... sicodelica</p>
</header>

{% assign melange_thumb_fallback = '/assets/media/images/melange-report-fallback.png' %}
{% assign melange_sorted = site.melange_reports | sort: 'date' | reverse %}
{% for melanges in melange_sorted %}
{% assign _thumb_src = melanges.image | default: melange_thumb_fallback %}
{% comment %}
  Listado: resumen corto. Opción 1) front matter `summary`. Opción 2) texto tras el h2 "Relato" (evita la ficha técnica). Opción 3) truncar todo el contenido.
{% endcomment %}
{% if melanges.summary %}
  {% assign _preview = melanges.summary | strip %}
{% else %}
  {% assign _parts = melanges.content | split: 'Relato</h2>' %}
  {% if _parts.size > 1 %}
    {% assign _preview = _parts[1] | strip_html | strip | truncatewords: 44 %}
  {% else %}
    {% assign _preview = melanges.content | strip_html | strip | truncatewords: 44 %}
  {% endif %}
{% endif %}
<article class="melange-entry">
  <div class="melange-entry__row">
    <div class="melange-entry__media">
      <time class="melange-entry__date melange-entry__date--media" datetime="{{ melanges.date | date: '%Y-%m-%d' }}">{{ melanges.date | date: "%d · %m · %Y" }}</time>
      <a href="{{ melanges.url | relative_url }}" class="melange-entry__thumb{% unless melanges.image %} melange-entry__thumb--fallback{% endunless %}">
        <img src="{{ _thumb_src | relative_url }}" alt="{{ melanges.title | escape }}" loading="lazy" width="96" height="96" />
      </a>
    </div>
    <div class="melange-entry__main">
      <h2 class="melange-entry__title">
        <a href="{{ melanges.url | relative_url }}">{{ melanges.title }}</a>
      </h2>
      {% if _preview != '' %}
      <p class="melange-entry__body">{{ _preview }}</p>
      {% else %}
      <p class="melange-entry__body melange-entry__body--stub">Borrador: el relato todavía se está escribiendo.</p>
      {% endif %}
      <p class="melange-entry__footer">
        <a href="{{ melanges.url | relative_url }}" class="melange-entry__more">Abrir reporte</a>
      </p>
    </div>
  </div>
</article>
{% endfor %}

</div>
