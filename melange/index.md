---
layout: default
title: Melange
symbol: "🜏\uFE0E"
sigil: melange
body_class: reading-melange
main_class: reading-main
back: false
description: "Cuaderno de campo. Notas sueltas, fechas aproximadas, reportes de travesía — sicodélica. KNDL 000."
nav: true
nav_order: 6
---

<p class="reading-lede">Cuaderno de campo. Notas sueltas, fechas aproximadas, reportes de travesía… sicodélica.</p>

{% assign melange_sorted = site.melange_reports | sort: 'date' | reverse %}
{% if melange_sorted.size == 0 %}
<p class="reading-empty">Todavía no hay reportes publicados.</p>
{% endif %}

<div class="melange-index">
  {% for melanges in melange_sorted %}
    {% assign _preview = '' %}
    {% if melanges.summary and melanges.summary != '' %}
      {% assign _preview = melanges.summary | strip %}
    {% endif %}
    {% if _preview == '' %}
      {% assign _parts = melanges.content | split: 'Relato</h2>' %}
      {% if _parts.size > 1 %}
        {% assign _preview = _parts[1] | strip_html | strip | truncatewords: 44 %}
      {% else %}
        {% assign _preview = melanges.content | strip_html | strip | truncatewords: 44 %}
      {% endif %}
    {% endif %}

    <article class="melange-item{% if melanges.wip %} is-wip{% endif %}">
      <time class="melange-item__date" datetime="{{ melanges.date | date: '%Y-%m-%d' }}">{{ melanges.date | date: "%Y-%m-%d" }}</time>
      <div class="melange-item__body">
        <h2 class="melange-item__title"><a href="{{ melanges.url | relative_url }}">{{ melanges.title }}</a></h2>
        {% if melanges.wip %}
          <p class="melange-item__status">en curso</p>
        {% elsif _preview != '' %}
          <p class="melange-item__lead">{{ _preview }}</p>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
