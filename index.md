---
layout: default
title: Inicio
nav: true
nav_order: 1
---

# C . E . N . I . Z . A . S 


<div class="nube-de-palabras">
  <a href="{{ site.baseurl }}/fragmentos/">☍ Fragmentos</a>
  <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
  <a href="{{ site.baseurl }}/musica/">𝄞 Música</a>
  <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
  <a href="{{ site.baseurl }}/melange">🜏 Melange </a>  
  <a href="{{ site.baseurl }}/codigo/">◊ Código</a>
  <a href="{{ site.baseurl }}/visual/generator">꩜</a>

</div>

{% include home-collage.html %}

<p class="home-terminal" translate="no"><span class="home-terminal-prompt" aria-hidden="true">kndl@archivo:~$</span> <span class="home-terminal-text"> Textos, código, experimento y ecos</span></p>

{% include lab-feed.html %}

<a href="{{ site.baseurl }}/vestigios/" class="link-oculto" title="Vestigios">... ⚙ ...</a>

<script src="{{ '/assets/js/core/lab-home.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/core/nube-palabras.js' | relative_url }}" defer></script>

<canvas id="art" width="800" height="600" style="width: 100%; height:300px"></canvas>
<script src="{{ '/assets/js/core/home-canvas.js' | relative_url }}" defer></script>

<script src="{{ '/assets/js/core/home-audio.js' | relative_url }}" defer></script>
