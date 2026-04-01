---
layout: default
title: ((( Ecos )))
nav: true
nav_order: 4
---

## 🎛️ [Mixer Generativo](/musica/mixer/)

---

## 🎵 Playlists

{% assign playlists = site.spotify_playlists | sort: "date" | reverse %}
{% for playlist in playlists %}
  {% include spotify-playlist.html playlist=playlist %}
{% endfor %}

---

## 🎛️ Setlists

{% assign setlists = site.youtube_setlists | sort: "date" | reverse %}
{% for setlist in setlists %}
  {% include youtube-setlist.html setlist=setlist %}
{% endfor %}

---
