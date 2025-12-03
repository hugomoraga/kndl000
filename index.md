---
layout: default
title: Inicio
nav: true
nav_order: 1
---

# C . E . N . I . Z . A . S

> "Oculto y no tanto"<a href="{{ site.baseurl }}/vestigios/" class="link-oculto" title="Vestigios">·</a><a href="{{ site.baseurl }}/admin/" class="link-oculto" title="Admin" style="margin-left: 0.5rem;">⚙</a>

<div class="nube-de-palabras">
  <a href="{{ site.baseurl }}/diario/">✶ Diario</a>
  <a href="{{ site.baseurl }}/fragmentos/">☍ Fragmentos</a>
  <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
  <a href="{{ site.baseurl }}/musica/">𝄞 Música</a>
  <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
  <a href="{{ site.baseurl }}/melange">🜏 Melange </a>  
  <a href="{{ site.baseurl }}/visual/generator">꩜</a>

</div>

      {% include assemblage.html %}



<canvas id="art" width="800" height="600" style="width: 100%; height:300px"></canvas>
<script src="{{ '/assets/js/core/home-canvas.js' | relative_url }}" defer></script>

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/QNS9RGB1GWg?si=1kdQaWa02BWeQJiI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<button id="start" style="margin: 1rem 0; padding: 0.75rem 1.5rem; background: #333; color: #fff; border: 1px solid #555; cursor: pointer; font-size: 1rem; min-height: 44px; width: 100%; max-width: 300px; display: block; margin-left: auto; margin-right: auto;">▶ Iniciar audio</button>
<script src="{{ '/assets/js/core/home-audio.js' | relative_url }}" defer></script>
