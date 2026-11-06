---
layout: default
title: Imaginario
symbol: "◉"
sigil: imaginario
description: "Fotografía, imagen latente y formatos por venir — Imaginario de KNDL 000."
body_class: imaginario-surface
main_class: imaginario-main
back: false
---

{%- comment -%}
  Modelo de datos de Imaginario (compatible con las placas actuales):
  - image:        thumbnail/póster (obligatorio)
  - media_type:   foto | video | gif | escaneo | generativo (default: foto)
  - media_src:    URL del video, gif o pieza generativa (opcional)
  - media_embed:  HTML de embed para video/generativo (opcional)
  - poster:       póster alternativo para video (opcional)
  - captured, place, medium, dimensions, credits (opcionales)
  Las placas antiguas solo necesitan `image`; el resto cae a `foto`.
{%- endcomment -%}

{% assign plates = site.images %}
{% assign total_placas = plates | size %}

<div class="imaginario-inner">
  <section class="imaginario-intro" aria-label="Resumen de Imaginario">
    <p class="imaginario-intro__lede">Fotografía, imagen latente y formatos por venir.</p>
    <div class="imaginario-intro__meta">
      <p class="imaginario-intro__stats">{{ total_placas }} placas</p>
      <p class="imaginario-intro__formats">
        <span>foto</span>
        <span aria-hidden="true">·</span>
        <a href="{{ '/imaginario/generator/' | relative_url }}">generativo ↗</a>
      </p>
    </div>
  </section>

  <div class="imaginario-grid">
    {% for image in plates %}
      {% assign media_type = image.media_type | default: "foto" %}
      {% assign media_label = media_type | downcase %}
      <a class="imaginario-plate" href="{{ image.url | relative_url }}" data-format="{{ media_label }}">
        <figure class="imaginario-plate__figure">
          <span class="imaginario-plate__media">
            {% assign image_base = image.image | split: '.' | first %}
            {% assign webp_480 = image_base | append: '-480.webp' %}
            {% assign webp_960 = image_base | append: '-960.webp' %}
            {% assign has_webp = site.static_files | where: "path", webp_960 | size %}
            <picture>
              {% if has_webp > 0 %}
                <source
                  type="image/webp"
                  srcset="{{ webp_480 | relative_url }} 480w, {{ webp_960 | relative_url }} 960w"
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                />
              {% endif %}
              <img
                src="{{ image.image | relative_url }}"
                alt="{{ image.alt | default: image.title | escape }}"
                loading="lazy"
                width="960"
                height="720"
                style="object-position: {{ image.image_position | default: 'center' }};"
              />
            </picture>
          </span>
          <figcaption class="imaginario-plate__meta">
            <span class="imaginario-plate__index">{{ forloop.index | prepend: '00' | slice: -2, 2 }}</span>
            <span class="imaginario-plate__title">{{ image.title }}</span>
            <span class="imaginario-plate__format">{{ media_label }}</span>
            {% if image.caption and image.caption != image.title %}
              <span class="imaginario-plate__caption">{{ image.caption }}</span>
            {% endif %}
          </figcaption>
        </figure>
      </a>
    {% endfor %}
    <div class="imaginario-tail" aria-hidden="true">
      <span class="imaginario-tail__label">fin del carrete</span>
      <strong>{{ total_placas }}</strong>
      <span class="imaginario-tail__unit">placas</span>
    </div>
  </div>
</div>
