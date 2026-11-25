---
layout: default
title: Rizoma
symbol: "⋔"
sigil: rizoma
body_class: reading-poemas reading-rizoma
main_class: reading-main
back: false
description: "Rizoma — exploraciones abiertas de KNDL. Índice generado desde el repositorio de Rizoma."
---

{% assign rizoma = site.data.rizoma_index %}

<p class="rizoma-lede">Un espacio para explorar ideas, descomponer conceptos y encontrar relaciones entre territorios aparentemente distantes.</p>

<div class="rizoma-declaration">
  <p>Cada exploración comienza con una intuición, una pregunta o un fenómeno. A partir de ahí, las ideas se desplazan, se fragmentan, se conectan y vuelven a aparecer bajo otras formas.</p>
  <p>No hay un recorrido predeterminado ni una conclusión obligatoria. Hay lecturas, referencias, poemas, código, experimentos y fragmentos que se incorporan al proceso.</p>
  <p>Algunas ideas persisten. Otras se transforman, se contradicen o abren nuevas exploraciones.</p>
  <p class="rizoma-declaration__close">El mapa permanece abierto.</p>
</div>

<p class="rizoma-nodos-link">
  <a href="{{ rizoma.site }}/" target="_blank" rel="noreferrer">Abrir Rizoma ↗</a>
  <span aria-hidden="true">·</span>
  <a href="{{ rizoma.site }}/nodos/" target="_blank" rel="noreferrer">Ver los {{ rizoma.nodos }} nodos ↗</a>
</p>

<div class="rizoma-index">
  {% if rizoma.exploraciones.size == 0 %}
  <p class="reading-empty">No se pudo leer el repositorio de Rizoma. Revisá <code>RIZOMA_DIR</code> o el checkout de CI.</p>
  {% endif %}

  {% for exploracion in rizoma.exploraciones %}
  <article class="expediente-item">
    <span class="expediente-item__num">{{ exploracion.order }}</span>
    <div class="expediente-item__body">
      <h2 class="expediente-item__title"><a href="{{ exploracion.url }}" target="_blank" rel="noreferrer">{{ exploracion.title }} ↗</a></h2>
      {% if exploracion.question != "" %}<p class="expediente-item__question">{{ exploracion.question }}</p>{% endif %}
      <p class="expediente-item__meta">
        {{ exploracion.nodos }} nodos · {{ exploracion.corpus }} piezas · {{ exploracion.status }}{% if exploracion.updated != "" %} · actualizado {{ exploracion.updated }}{% endif %}
      </p>
    </div>
  </article>
  {% endfor %}
</div>

<p class="rizoma-nodos-link">
  <span>Índice generado desde <code>quicio/rizoma</code> en build time.</span>
</p>
