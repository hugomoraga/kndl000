---
layout: default
title: Música
symbol: "∿"
sigil: musica
body_class: interior-page section-index
nav: true
nav_order: 4
back: false
---

<div class="musica-page" markdown="0">

<p class="musica-page__soon">Próximamente: <strong>plugins VST</strong> y Tracks propios</p>

<p class="musica-page__mixer-line"><a href="{{ '/dispositivos/espiral/' | relative_url }}">Espiral — instrumento generativo</a></p>

<section class="musica-page__section musica-page__section--last" aria-labelledby="musica-playlists">
  <h2 id="musica-playlists" class="musica-page__section-title">Sala de escucha</h2>
  <p class="listen-room__note">Playlists curadas. Se abren en Spotify; acá queda el registro.</p>
{% assign playlists = site.spotify_playlists | sort: "date" | reverse %}
{% for playlist in playlists %}
  {% include spotify-playlist.html playlist=playlist index=forloop.index %}
{% endfor %}
</section>

</div>
