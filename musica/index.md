---
layout: default
title: Música
symbol: "∿"
sigil: musica
body_class: reading-poemas reading-musica
main_class: reading-main
back: false
description: "Cuaderno de escucha — KNDL 000. Ideas, referencias y máquinas."
---

<div class="musica-cuaderno">
  <p class="musica-lede">Cuaderno de escucha. Ideas, referencias y máquinas.</p>

  {% assign _featured = site.escuchas | where: "featured", true | sort: "date" | reverse | first %}
  {% if _featured %}
  <section class="musica-ahora" aria-labelledby="musica-ahora-title">
    <h2 class="musica-section-title" id="musica-ahora-title">Ahora</h2>
    <h3 class="musica-ahora__title">{{ _featured.title }}</h3>
    {% if _featured.artist %}<p class="musica-ahora__artist">{{ _featured.artist }}</p>{% endif %}
    {% if _featured.note %}<p class="musica-ahora__note">{{ _featured.note }}</p>{% endif %}
    {% if _featured.link %}
    <a class="musica-ahora__link" href="{{ _featured.link }}" target="_blank" rel="noopener noreferrer">Escuchar ↗</a>
    {% endif %}
  </section>
  {% endif %}

  {% assign _notes = site.escuchas | where_exp: "item", "item.featured != true" | sort: "date" | reverse %}
  {% if _notes.size > 0 %}
  <section class="musica-notas" aria-labelledby="musica-notas-title">
    <h2 class="musica-section-title" id="musica-notas-title">Notas de escucha</h2>
    <div class="musica-notas__list">
      {% for note in _notes %}
      <article class="musica-nota">
        <span class="musica-nota__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
        <div class="musica-nota__body">
          <p class="musica-nota__kind">{{ note.kind | default: "Nota" }}</p>
          <h3 class="musica-nota__title">{{ note.title }}</h3>
          {% if note.source %}<p class="musica-nota__source">{{ note.source }}</p>{% endif %}
          {% if note.note %}<p class="musica-nota__note">{{ note.note }}</p>{% endif %}
        </div>
        {% if note.date %}<time class="musica-nota__date" datetime="{{ note.date | date: '%Y-%m-%d' }}">{{ note.date | date: "%Y-%m-%d" }}</time>{% endif %}
      </article>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  <section class="musica-block" aria-labelledby="musica-aparatos-title">
    <h2 class="musica-section-title" id="musica-aparatos-title">Aparatos</h2>
    <ul class="musica-aparatos">
      <li>
        <a href="{{ '/dispositivos/espiral/' | relative_url }}">
          <span class="musica-aparatos__name">Espiral</span>
          <span class="musica-aparatos__desc">instrumento generativo</span>
        </a>
      </li>
    </ul>
  </section>

  <section class="musica-block" aria-labelledby="musica-sesiones-title">
    <h2 class="musica-section-title" id="musica-sesiones-title">Sesiones</h2>
    <p class="musica-status">Tracks propios y plugins VST. <span>En preparación.</span></p>
  </section>

  {% assign _playlists = site.spotify_playlists | sort: "date" | reverse %}
  {% if _playlists.size > 0 %}
  <section class="musica-block musica-block--last" aria-labelledby="musica-referencias-title">
    <h2 class="musica-section-title" id="musica-referencias-title">Referencias</h2>
    <p class="musica-referencias">
      {% for playlist in _playlists %}
      <a href="https://open.spotify.com/playlist/{{ playlist.spotify_id }}" target="_blank" rel="noopener noreferrer">{{ playlist.title }}</a>
      {% endfor %}
    </p>
  </section>
  {% endif %}
</div>
