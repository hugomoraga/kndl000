---
layout: default
title: ((( Ecos )))
nav: true
nav_order: 4
---

<div class="musica-page" markdown="0">

<p class="musica-page__soon">Próximamente: <strong>plugins VST</strong> y Tracks propios</p>

<p class="musica-page__mixer-line"><a href="{{ '/musica/mixer/' | relative_url }}">Mixer generativo</a></p>

<section class="musica-page__section musica-page__section--last" aria-labelledby="musica-playlists">
  <h2 id="musica-playlists" class="musica-page__section-title">Playlists</h2>
{% assign playlists = site.spotify_playlists | sort: "date" | reverse %}
{% for playlist in playlists %}
  {% include spotify-playlist.html playlist=playlist %}
{% endfor %}
</section>

</div>
