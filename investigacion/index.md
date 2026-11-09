---
layout: default
title: Investigación
symbol: "⌖"
sigil: investigacion
body_class: reading-poemas reading-investigacion
main_class: reading-main
back: false
description: "Preguntas que atraviesan el archivo — KNDL 000. Expedientes que cruzan memoria, lenguaje, código y ritual."
---

<p class="investigacion-lede">Preguntas que atraviesan el archivo. Cada expediente reúne obras de distintas secciones y las pone a conversar.</p>

{% assign expedientes = site.investigaciones | sort: "order" %}
<div class="investigacion-index">
  {% if expedientes.size == 0 %}
  <p class="reading-empty">Todavía no hay expedientes abiertos.</p>
  {% endif %}

  {% for inv in expedientes %}
  <article class="expediente-item">
    <span class="expediente-item__num">{{ inv.order }}</span>
    <div class="expediente-item__body">
      <h2 class="expediente-item__title"><a href="{{ inv.url | relative_url }}">{{ inv.title }}</a></h2>
      {% if inv.question %}<p class="expediente-item__question">{{ inv.question }}</p>{% endif %}
      <p class="expediente-item__meta">
        {% if inv.fields %}{{ inv.fields | join: " · " }} · {% endif %}
        {{ inv.corpus | size }} piezas · {{ inv.status }}
        {% if inv.updated %} · {{ inv.updated | date: "%Y-%m-%d" }}{% endif %}
      </p>
    </div>
  </article>
  {% endfor %}
</div>

<p class="investigacion-concepts-link">
  <a href="{{ '/investigacion/conceptos/' | relative_url }}">Ver la constelación de conceptos →</a>
</p>
