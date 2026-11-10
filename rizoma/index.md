---
layout: default
title: Rizoma
symbol: "⋔"
sigil: rizoma
body_class: reading-poemas reading-rizoma
main_class: reading-main
back: false
description: "Rizoma — KNDL 000. Exploraciones abiertas, nodos provisionales y un mapa que se construye al recorrerlo."
---

<p class="rizoma-lede">Un espacio para explorar ideas, descomponer conceptos y encontrar relaciones entre territorios aparentemente distantes.</p>

<div class="rizoma-declaration">
  <p>Cada exploración comienza con una intuición, una pregunta o un fenómeno. A partir de ahí, las ideas se desplazan, se fragmentan, se conectan y vuelven a aparecer bajo otras formas.</p>
  <p>No hay un recorrido predeterminado ni una conclusión obligatoria. Hay lecturas, referencias, poemas, código, experimentos y fragmentos que se incorporan al proceso.</p>
  <p>Algunas ideas persisten. Otras se transforman, se contradicen o abren nuevas exploraciones.</p>
  <p class="rizoma-declaration__close">El mapa permanece abierto.</p>
</div>

{% assign exploraciones = site.exploraciones | sort: "order" %}
<div class="rizoma-index">
  {% if exploraciones.size == 0 %}
  <p class="reading-empty">Todavía no hay exploraciones abiertas.</p>
  {% endif %}

  {% for exploracion in exploraciones %}
  <article class="expediente-item">
    <span class="expediente-item__num">{{ exploracion.order }}</span>
    <div class="expediente-item__body">
      <h2 class="expediente-item__title"><a href="{{ exploracion.url | relative_url }}">{{ exploracion.title }}</a></h2>
      {% if exploracion.question %}<p class="expediente-item__question">{{ exploracion.question }}</p>{% endif %}
      <p class="expediente-item__meta">
        {% if exploracion.nodos %}{{ exploracion.nodos | size }} nodos · {% endif %}
        {{ exploracion.corpus | size }} piezas · {{ exploracion.status }}
        {% if exploracion.updated %} · {{ exploracion.updated | date: "%Y-%m-%d" }}{% endif %}
      </p>
    </div>
  </article>
  {% endfor %}
</div>

<p class="rizoma-nodos-link">
  <a href="{{ '/rizoma/nodos/' | relative_url }}">Ver los nodos →</a>
</p>
