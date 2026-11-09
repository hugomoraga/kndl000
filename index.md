---
layout: default
title: Inicio
description: "Archivo creativo de KNDL 000: poemas, imágenes, rastros, código y dispositivos en estado umbral."
nav: true
nav_order: 1
body_class: umbral-page
main_class: umbral-main
---

{% assign primary_nav = site.data.navigation | where: "primary", true %}

<div markdown="0">
  <a class="umbral-skip" href="#laboratorio">Saltar al contenido</a>
</div>

<div class="umbral" id="umbral">
  <canvas id="art" class="umbral__chamber" role="img" aria-label="Cámara de niebla generativa: trazas de partículas que se condensan en la oscuridad"></canvas>
  <div class="umbral__veil" aria-hidden="true"></div>

  <header class="umbral__bar">
    <a class="umbral__mark" href="{{ site.baseurl }}/" aria-label="KNDL 000, inicio">KNDL 000</a>
    <p class="umbral__state" translate="no">Estado umbral</p>
  </header>

  <div class="umbral__stage">
    <h1 class="umbral__title" aria-label="Cenizas">
      <span class="umbral__title-top" aria-hidden="true">CENIZAS</span>
      <span class="umbral__title-bottom" aria-hidden="true">CENIZAS</span>
      <span class="umbral__threshold" aria-hidden="true"></span>
    </h1>
    <p class="umbral__sub">Texto, imagen y código se condensan en el mismo lugar.</p>
  </div>

  <div class="umbral__foot">
    <nav class="umbral__nav" aria-label="Secciones del sitio">
      {% for item in primary_nav %}
        <a href="{{ item.url | relative_url }}">{{ item.name }}</a>
      {% endfor %}
    </nav>
    <a class="umbral__descent" href="#laboratorio">
      <span>Descender</span>
      <svg width="12" height="26" viewBox="0 0 12 26" fill="none" aria-hidden="true" focusable="false">
        <path d="M6 0v24M1 19l5 5 5-5" stroke="currentColor" stroke-width="1"/>
      </svg>
    </a>
  </div>
</div>

{%- comment -%}
  Cita curada del archivo. Solo entran los rastros con `home_quote: true`.
  El HTML renderiza la más reciente como fallback sin JavaScript; home-quote.js
  elige otra del pool en cada visita.
{%- endcomment -%}
{%- assign _quote_pool = site.fragmentos | where: "home_quote", true | sort: "path" | reverse -%}
{%- assign _quote_count = _quote_pool | size -%}
{%- if _quote_count > 0 -%}
  {%- assign _quote_first = _quote_pool | first -%}
  {%- assign _quote_text = _quote_first.quote -%}
  {%- if _quote_text == nil or _quote_text == "" -%}
    {%- assign _quote_line = _quote_first.lineas | first -%}
    {%- assign _quote_text = _quote_line.linea -%}
  {%- endif -%}
  {%- assign _quote_slug = _quote_first.path | split: "/" | last | replace: ".md", "" -%}
  {%- assign _quote_year = _quote_slug | slice: 10, 4 -%}
  {%- assign _quote_year_num = _quote_year | plus: 0 -%}
  {%- if _quote_year.size != 4 or _quote_year_num <= 2000 -%}
    {%- if _quote_first.date -%}{%- assign _quote_year = _quote_first.date | date: "%Y" -%}{%- else -%}{%- assign _quote_year = "" -%}{%- endif -%}
  {%- endif %}
<section class="umbral-quote" aria-label="Rastro del archivo">
  <p class="umbral-quote__label" translate="no">Rastro</p>
  <blockquote class="umbral-quote__text">{{ _quote_text | escape }}</blockquote>
  {%- if _quote_year != "" %}
  <p class="umbral-quote__meta" translate="no">{{ _quote_year }}</p>
  {%- endif %}
</section>

<script type="application/json" id="home-quote-pool">
[
{%- assign _quote_first_item = true -%}
{%- for f in _quote_pool -%}
  {%- assign _text = f.quote -%}
  {%- if _text == nil or _text == "" -%}
    {%- assign _line = f.lineas | first -%}
    {%- assign _text = _line.linea -%}
  {%- endif -%}
  {%- assign _slug = f.path | split: "/" | last | replace: ".md", "" -%}
  {%- assign _year = _slug | slice: 10, 4 -%}
  {%- assign _year_num = _year | plus: 0 -%}
  {%- if _year.size != 4 or _year_num <= 2000 -%}
    {%- if f.date -%}{%- assign _year = f.date | date: "%Y" -%}{%- else -%}{%- assign _year = "" -%}{%- endif -%}
  {%- endif -%}
  {%- if _text and _text != "" -%}
    {%- unless _quote_first_item -%},{%- endunless -%}{%- assign _quote_first_item = false -%}
{"text":{{ _text | jsonify }},"year":{{ _year | jsonify }}}
  {%- endif -%}
{%- endfor -%}
]
</script>
<script src="{{ '/assets/js/core/home-quote.js' | relative_url }}" defer></script>
{%- endif -%}

{% include lab-feed.html %}

<section class="umbral-exits" aria-labelledby="umbral-exits-title">
  <h2 id="umbral-exits-title">Umbrales</h2>
  <ul class="umbral-exits__list">
    {% for item in primary_nav %}
      <li class="umbral-exits__item">
        <a href="{{ item.url | relative_url }}">
          <span class="umbral-exits__glyph sigil sigil--{{ item.sigil }}" aria-hidden="true"><span class="sigil__glyph">{{ item.glyph }}</span></span>
          <span class="umbral-exits__name">{{ item.name }}</span>
          <span class="umbral-exits__desc">{{ item.description }}</span>
        </a>
      </li>
    {% endfor %}
  </ul>

  {% assign featured_nav = site.data.navigation | where: "featured", true %}
  {% for item in featured_nav %}
  <a class="umbral-featured" href="{{ item.url | relative_url }}">
    <span class="umbral-featured__glyph sigil sigil--{{ item.sigil }}" aria-hidden="true"><span class="sigil__glyph">{{ item.glyph }}</span></span>
    <span class="umbral-featured__body">
      <span class="umbral-featured__name">{{ item.name }}</span>
      <span class="umbral-featured__desc">{{ item.description }}</span>
    </span>
    <span class="umbral-featured__arrow" aria-hidden="true">→</span>
  </a>
  {% endfor %}

  {% assign archive_nav = site.data.navigation | where_exp: "item", "item.primary == false and item.featured != true" %}
  {% if archive_nav.size > 0 %}
  <p class="umbral-archive-line">
    <span class="umbral-archive-line__label">Archivo:</span>
    {% for item in archive_nav %}
      <a href="{{ item.url | relative_url }}">{{ item.name }}</a>{% unless forloop.last %}<span class="umbral-archive-line__sep" aria-hidden="true">·</span>{% endunless %}
    {% endfor %}
  </p>
  {% endif %}
</section>

<footer class="umbral-foot">
  <p>KNDL 000 · <span translate="no">archivo en estado umbral</span></p>
  <a href="{{ site.baseurl }}/vestigios/" class="umbral-foot__vestigio">Vestigios</a>
</footer>

<noscript>
  <p class="umbral-noscript">La cámara generativa y el laboratorio requieren JavaScript. La navegación, los poemas, las imágenes y el archivo completo siguen disponibles sin él.</p>
</noscript>

<script src="{{ '/assets/js/core/home-descent.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/bundles/home.bundle.js' | relative_url }}" defer></script>
