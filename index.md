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
  Cita curada del archivo. Fuente: fragmento-20260331-151000 (Rastros, 2026).
  Si se cambia la frase, actualizar también el año del bloque.
{%- endcomment -%}
<section class="umbral-quote" aria-label="Rastro del archivo">
  <p class="umbral-quote__label" translate="no">Rastro</p>
  <blockquote class="umbral-quote__text">Lo que arde no desaparece, se vuelve residuo.</blockquote>
  <p class="umbral-quote__meta" translate="no">2026</p>
</section>

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
</section>

<footer class="umbral-foot">
  <p>KNDL 000 · <span translate="no">archivo en estado umbral</span></p>
  <a href="{{ site.baseurl }}/vestigios/" class="umbral-foot__vestigio">Vestigios</a>
</footer>

<noscript>
  <p class="umbral-noscript">La cámara generativa y el laboratorio requieren JavaScript. La navegación, los poemas, las imágenes y el archivo completo siguen disponibles sin él.</p>
</noscript>

<script src="{{ '/assets/js/bundles/home.bundle.js' | relative_url }}" defer></script>
