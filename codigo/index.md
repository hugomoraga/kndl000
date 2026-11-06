---
layout: default
title: Código
symbol: "◊"
sigil: codigo
description: "Código como expresión. Programación desfasada y algo inútil — KNDL 000."
body_class: codigo-surface
back: false
---

{% assign sorted_codigos = site.codigos | sort: "title" %}
{% assign total_modulos = sorted_codigos | size %}
{% assign ejecutables = 0 %}
{% for codigo in sorted_codigos %}
  {% assign _lang = codigo.language | downcase %}
  {% if _lang == "javascript" %}{% assign ejecutables = ejecutables | plus: 1 %}{% endif %}
{% endfor %}
{% assign total_lenguajes = sorted_codigos | map: "language" | uniq | size %}

<div class="codigo-surface__inner">
  <section class="codigo-intro" aria-label="Resumen del archivo de código">
    <p class="codigo-intro__lede">Código como expresión. Programación desfasada y algo inútil.</p>
    <div class="codigo-intro__meta">
      <p class="codigo-intro__stats">
        <span>{{ total_modulos }} módulos</span>
        <span aria-hidden="true">·</span>
        <span>{{ ejecutables }} ejecutables</span>
        <span aria-hidden="true">·</span>
        <span>{{ total_lenguajes }} lenguajes</span>
      </p>
      <p class="codigo-intro__legend" role="group" aria-label="Filtrar módulos por estado">
        <button class="codigo-intro__legend-item codigo-filter" type="button" data-code-filter="all" aria-pressed="true">todos</button>
        <button class="codigo-intro__legend-item codigo-filter" type="button" data-code-filter="true" aria-pressed="false"><span class="codigo-legend__dot codigo-legend__dot--run" aria-hidden="true"></span> ejecutable</button>
        <button class="codigo-intro__legend-item codigo-filter" type="button" data-code-filter="false" aria-pressed="false"><span class="codigo-legend__dot codigo-legend__dot--read" aria-hidden="true"></span> lectura</button>
      </p>
    </div>
  </section>

  <ol class="codigo-rack" aria-label="Módulos de código">
    {% for codigo in sorted_codigos %}
      {% assign index = forloop.index | minus: 1 %}
      {% assign binary = "" %}
      {% assign num = index %}
      {% for i in (0..7) %}
        {% assign bit = num | modulo: 2 %}
        {% assign binary = bit | append: binary %}
        {% assign num = num | divided_by: 2 %}
      {% endfor %}
      {% assign binary = binary | prepend: "00000000" | slice: -8, 8 %}
      {% assign _lang = codigo.language | downcase %}
      {% assign _runnable = false %}
      {% if _lang == "javascript" %}{% assign _runnable = true %}{% endif %}
      <li class="codigo-module">
        <a class="codigo-module__link" href="{{ codigo.url | relative_url }}" data-runnable="{{ _runnable }}">
          <span class="codigo-module__address">#{{ binary }}</span>
          <span class="codigo-module__node" aria-hidden="true"></span>
          <span class="codigo-module__body">
            <span class="codigo-module__title">{{ codigo.title }}</span>
            {% if codigo.concept %}
              <span class="codigo-module__concept">{{ codigo.concept }}</span>
            {% endif %}
          </span>
          <span class="codigo-module__meta">
            <span class="codigo-module__lang">{{ codigo.language | default: "—" | downcase }}</span>
            <span class="codigo-module__state">
              <span class="codigo-legend__dot {% if _runnable %}codigo-legend__dot--run{% else %}codigo-legend__dot--read{% endif %}" aria-hidden="true"></span>
              {% if _runnable %}ejecutable{% else %}lectura{% endif %}
            </span>
          </span>
        </a>
      </li>
    {% endfor %}
  </ol>
</div>

<p class="sr-only" id="codigo-filter-status" role="status" aria-live="polite"></p>
<script src="{{ '/assets/js/core/codigo-filter.js' | relative_url }}" defer></script>
