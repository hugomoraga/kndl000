---
layout: default
title: Inicio
description: "Textos, código, arte y experimento — archivo creativo. Fragmentos, poemas, música, visual y código."
nav: true
nav_order: 1
---

<div class="home-header">
  <div class="home-header__top">
    <h1 id="cenizas" class="home-header__title">C . E . N . I . Z . A . S</h1>
    <button type="button" class="home-nav__toggle" id="home-nav-toggle" aria-expanded="false" aria-controls="home-nav-panel" aria-label="Secciones del sitio">
      <span class="home-nav__glyph" aria-hidden="true"></span>
    </button>
  </div>
  <nav class="home-nav" aria-label="Secciones del sitio">
    <div id="home-nav-panel" class="home-nav__panel nube-de-palabras">
      <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
      <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
      <a href="{{ site.baseurl }}/melange">🜏 Melange </a>
      <a href="{{ site.baseurl }}/codigo/">◊ Código</a>
      <a href="{{ site.baseurl }}/dispositivos/">◇ Devices</a>
    </div>
  </nav>
</div>

{% include home-collage.html %}

<p class="home-terminal" translate="no"><span class="home-terminal-prompt" aria-hidden="true">kndl@archivo:~$</span><span class="home-terminal-text">cd /root/señales_en_estado_infinito </span></p>

{% include lab-feed.html %}

<a href="{{ site.baseurl }}/vestigios/" class="link-oculto" aria-label="Ir a Vestigios" title="Vestigios">... ⚙ ...</a>

<canvas id="art" width="800" height="600" role="img" aria-label="Visual generativo de arte procedural" style="width: 100%; height:300px"></canvas>

<noscript>
  <p class="noscript-note">Las animaciones (nube de secciones, canvas generativo y audio sintetizado) y el feed de laboratorio requieren JavaScript. La navegación, el collage y todos los enlaces del sitio siguen siendo accesibles sin él. Para activar el laboratorio, las nubes y el audio, habilita JavaScript.</p>
</noscript>

<script src="{{ '/assets/js/bundles/home.bundle.js' | relative_url }}" defer></script>
