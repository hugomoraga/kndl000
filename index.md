---
layout: default
title: Inicio
description: "Textos, código, arte y experimento — archivo creativo. Fragmentos, poemas, música, visual y código."
nav: true
nav_order: 1
---

<div class="home-header">
  <div class="home-header__top">
    <h1 id="c--e--n--i--z--a--s">C . E . N . I . Z . A . S</h1>
    <button type="button" class="home-nav__toggle" id="home-nav-toggle" aria-expanded="false" aria-controls="home-nav-panel" aria-label="Secciones del sitio">
      <span class="home-nav__glyph" aria-hidden="true"></span>
    </button>
  </div>
  <nav class="home-nav" aria-label="Secciones del sitio">
    <div id="home-nav-panel" class="home-nav__panel nube-de-palabras">
      <a href="{{ site.baseurl }}/fragmentos/">☍ Fragmentos</a>
      <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
      <a href="{{ site.baseurl }}/musica/">𝄞 Música</a>
      <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
      <a href="{{ site.baseurl }}/melange">🜏 Melange </a>
      <a href="{{ site.baseurl }}/codigo/">◊ Código</a>
      <a href="{{ site.baseurl }}/dispositivos/">◇ Devices</a>
      <a href="{{ site.baseurl }}/visual/generator">꩜ Generator</a>
    </div>
  </nav>
</div>

{% include home-collage.html %}

<p class="home-terminal" translate="no"><span class="home-terminal-prompt" aria-hidden="true">kndl@archivo:~$</span><span class="home-terminal-text">cd /root/señales_en_estado_infinito </span></p>

{% include lab-feed.html %}

<a href="{{ site.baseurl }}/vestigios/" class="link-oculto" title="Vestigios">... ⚙ ...</a>

<script src="{{ '/assets/js/core/home-nav.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/core/lab-home.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/core/nube-palabras.js' | relative_url }}" defer></script>

<canvas id="art" width="800" height="600" style="width: 100%; height:300px"></canvas>
<script src="{{ '/assets/js/core/home-canvas.js' | relative_url }}" defer></script>

<script src="{{ '/assets/js/core/home-audio.js' | relative_url }}" defer></script>
