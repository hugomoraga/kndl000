---
layout: default
title: Dispositivos
symbol: "⎔"
sigil: dispositivos
body_class: interior-page section-index atelier-index
description: "Sistemas, instrumentos y artefactos en construcción — KNDL 000."
back: false
hide_title: true
---

{% assign all = site.dispositivos %}
{% assign featured = all | where: "featured", true | first %}
{% unless featured %}{% assign featured = all | where: "slug", "nacre" | first %}{% endunless %}
{% assign _objs = all | size %}
{% assign _activos = 0 %}
{% assign _curso = 0 %}
{% for d in all %}
  {% assign _state = d.status | default: "activo" %}
  {% if _state == "activo" %}{% assign _activos = _activos | plus: 1 %}{% endif %}
  {% if _state == "en-curso" %}{% assign _curso = _curso | plus: 1 %}{% endif %}
{% endfor %}
{% assign _objs_n = _objs | prepend: "00" | slice: -2, 2 %}
{% assign _activos_n = _activos | prepend: "00" | slice: -2, 2 %}
{% assign _curso_n = _curso | prepend: "00" | slice: -2, 2 %}

<div class="atelier">
  <header class="atelier-mast">
    <span class="atelier-mast__moon" aria-hidden="true">
      <img src="{{ '/assets/media/dispositivos/moon.jpg' | relative_url }}" alt="" width="640" height="640">
    </span>
    <div class="atelier-mast__lead">
      <p class="atelier-index-mark">[ 02 ]</p>
      <h1 class="atelier-title">Dispositivos</h1>
      <p class="atelier-lede">Sistemas, instrumentos y artefactos<br>en construcción.</p>
      <p class="atelier-stats">
        <span>{{ _objs_n }} {% if _objs == 1 %}objeto{% else %}objetos{% endif %}</span>
        <span class="atelier-stats__dot" aria-hidden="true">·</span>
        <span>{{ _activos_n }} {% if _activos == 1 %}activo{% else %}activos{% endif %}</span>
        {% if _curso > 0 %}
        <span class="atelier-stats__dot" aria-hidden="true">·</span>
        <span>{{ _curso_n }} en desarrollo</span>
        {% endif %}
      </p>
    </div>
    <p class="atelier-mast__aside">Un laboratorio de exploración donde el código, el sonido, la imagen y el texto se encuentran para producir nuevas formas de experimentar y pensar.</p>
  </header>

  {% if featured %}
  {% assign d = featured %}
  {% include atelier-voice.html %}
  <a class="atelier-feature" href="{{ d.url | relative_url }}">
    <img class="atelier-feature__plate" src="{{ '/assets/media/dispositivos/' | append: d.slug | append: '.jpg' | relative_url }}" alt="" width="1600" height="700">
    <div class="atelier-feature__copy">
      <p class="atelier-kicker"><span>01</span> / Destacado</p>
      <h2 class="atelier-feature__title">{{ d.title }}</h2>
      <p class="atelier-feature__line">{{ line }}</p>
      <ul class="atelier-marks">
        {% if mark_a %}<li>{{ mark_a }}</li>{% endif %}
        {% if mark_b %}<li>{{ mark_b }}</li>{% endif %}
        {% if mark_c %}<li>{{ mark_c }}</li>{% endif %}
      </ul>
      {% include atelier-arrow.html %}
    </div>
  </a>
  {% endif %}

  <section class="atelier-collection" aria-labelledby="atelier-collection-title">
    <header class="atelier-collection__head">
      <h2 id="atelier-collection-title" class="atelier-collection__title"><span class="atelier-index-mark">[ 03 ]</span> Colección</h2>
    </header>
    <div class="atelier-grid">
      {% assign wanted = "semina|parametrica|candil|espiral|umbral-vision" | split: "|" %}
      {% assign shown = featured.slug | default: "" %}
      {% assign n = 1 %}
      {% for slug in wanted %}
        {% assign d = all | where: "slug", slug | first %}
        {% if d and d.slug != featured.slug %}
          {% assign n = n | plus: 1 %}
          {% assign num = n | prepend: "00" | slice: -2, 2 %}
          {% include atelier-voice.html %}
          <a class="atelier-card" href="{{ d.url | relative_url }}">
            <img class="atelier-card__plate" src="{{ '/assets/media/dispositivos/' | append: d.slug | append: '.jpg' | relative_url }}" alt="" width="800" height="800">
            <span class="atelier-card__copy">
              <span class="atelier-card__num">{{ num }}</span>
              <span class="atelier-card__title">{{ d.title }}</span>
              <span class="atelier-card__line">{{ line }}</span>
              <ul class="atelier-marks">
                {% if mark_a %}<li>{{ mark_a }}</li>{% endif %}
                {% if mark_b %}<li>{{ mark_b }}</li>{% endif %}
                {% if mark_c %}<li>{{ mark_c }}</li>{% endif %}
              </ul>
              {% include atelier-arrow.html %}
            </span>
          </a>
          {% assign shown = shown | append: "|" | append: d.slug %}
        {% endif %}
      {% endfor %}
      {% for d in all %}
        {% unless shown contains d.slug %}
          {% assign n = n | plus: 1 %}
          {% assign num = n | prepend: "00" | slice: -2, 2 %}
          {% include atelier-voice.html %}
          <a class="atelier-card" href="{{ d.url | relative_url }}">
            <img class="atelier-card__plate" src="{{ '/assets/media/dispositivos/' | append: d.slug | append: '.jpg' | relative_url }}" alt="" width="800" height="800">
            <span class="atelier-card__copy">
              <span class="atelier-card__num">{{ num }}</span>
              <span class="atelier-card__title">{{ d.title }}</span>
              <span class="atelier-card__line">{{ line }}</span>
              <ul class="atelier-marks">
                {% if mark_a %}<li>{{ mark_a }}</li>{% endif %}
                {% if mark_b %}<li>{{ mark_b }}</li>{% endif %}
              </ul>
              {% include atelier-arrow.html %}
            </span>
          </a>
        {% endunless %}
      {% endfor %}
      <a class="atelier-card atelier-card--archive" href="#archivo">
        <img class="atelier-card__plate" src="{{ '/assets/media/dispositivos/archivo.jpg' | relative_url }}" alt="" width="800" height="800">
        <span class="atelier-card__copy">
          <span class="atelier-card__title">Archivo completo</span>
          <span class="atelier-card__line">Todos los dispositivos y sus versiones.</span>
          {% include atelier-arrow.html %}
        </span>
      </a>
    </div>
  </section>

  <section id="archivo" class="atelier-archive" aria-labelledby="atelier-archive-title">
    <h2 id="atelier-archive-title">Archivo</h2>
    <p class="atelier-archive__lead">Versión, estado y stack de cada dispositivo.</p>
    <ol class="atelier-archive__list">
      {% if featured %}
        {% assign d = featured %}
        {% include atelier-archive-row.html index="01" %}
      {% endif %}
      {% assign n = 1 %}
      {% for slug in wanted %}
        {% assign d = all | where: "slug", slug | first %}
        {% if d and d.slug != featured.slug %}
          {% assign n = n | plus: 1 %}
          {% assign num = n | prepend: "00" | slice: -2, 2 %}
          {% include atelier-archive-row.html index=num %}
        {% endif %}
      {% endfor %}
    </ol>
  </section>
</div>
