---
layout: default
title: Dispositivos
symbol: "⎔"
sigil: dispositivos
body_class: interior-page section-index
description: "Módulos propios de audio, software y visuales — KNDL 000."
back: false
---

<p class="dispositivo-index-lead">Módulos propios: audio, software y visuales. Cada dispositivo muestra su stack, su estado y su puerta de entrada.</p>

{% assign sorted = site.dispositivos | sort: "date" | reverse %}
{% assign _module_count = sorted | size %}
{% assign _active_count = 0 %}
{% assign _online_count = 0 %}
{% for d in sorted %}
  {% assign _state = d.status | default: "activo" %}
  {% if _state == "activo" %}{% assign _active_count = _active_count | plus: 1 %}{% endif %}
  {% if d.demo_url %}{% assign _online_count = _online_count | plus: 1 %}{% endif %}
{% endfor %}

<div class="device-rack">
  <div class="device-rack__bar" aria-label="Resumen de dispositivos">
    <span>{{ _module_count }} {% if _module_count == 1 %}módulo{% else %}módulos{% endif %}</span>
    <span>{{ _active_count }} {% if _active_count == 1 %}activo{% else %}activos{% endif %}</span>
    <span>{{ _online_count }} en línea</span>
  </div>

  <div class="device-modules{% if _module_count == 4 %} device-modules--two{% endif %}">
    {% for d in sorted %}
      {% assign label = d.list_title | default: d.title %}
      {% assign kind = d.kind | default: "tool" %}
      {% assign state = d.status | default: "activo" %}
      <article class="device-module" aria-labelledby="device-module-{{ forloop.index }}">
        <header class="device-module__head">
          <span class="device-module__addr">DEV/{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
          <span class="device-module__status device-module__status--{{ state }}">{{ state }}</span>
        </header>

        <h2 class="device-module__title" id="device-module-{{ forloop.index }}">
          <a href="{{ d.url | relative_url }}">{{ label }}</a>
        </h2>

        {% if d.description %}
        <p class="device-module__desc">{{ d.description }}</p>
        {% endif %}

        <dl class="device-module__specs">
          <div>
            <dt>tipo</dt>
            <dd>{% case kind %}{% when "vst" %}VST{% when "app" %}APP{% when "tool" %}HERRAMIENTA{% when "visual" %}VISUAL{% when "hardware" %}HARDWARE{% when "plugin" %}PLUGIN{% else %}{{ kind | upcase }}{% endcase %}</dd>
          </div>
          <div>
            <dt>stack</dt>
            <dd>{{ d.tech | default: "—" }}</dd>
          </div>
          <div>
            <dt>target</dt>
            <dd>{{ d.platform | default: "—" }}</dd>
          </div>
          <div>
            <dt>versión</dt>
            <dd>{{ d.version | default: "—" }}</dd>
          </div>
        </dl>

        <footer class="device-module__foot">
          {% if d.date %}
          <time datetime="{{ d.date | date: '%Y-%m-%d' }}">{{ d.date | date: "%Y-%m-%d" }}</time>
          {% else %}
          <span>—</span>
          {% endif %}
          <span class="device-module__links">
            {% if d.repo %}
            <a href="{{ d.repo }}" target="_blank" rel="noopener noreferrer" aria-label="Repositorio de {{ label | escape }}">repo ↗</a>
            {% endif %}
            {% if d.demo_url %}
            <a href="{{ d.demo_url }}" target="_blank" rel="noopener noreferrer" aria-label="Demo de {{ label | escape }}">demo ↗</a>
            {% endif %}
            <a href="{{ d.url | relative_url }}" aria-label="Ficha de {{ label | escape }}">ficha →</a>
          </span>
        </footer>
      </article>
    {% endfor %}
  </div>
</div>

_Dispositivos: cosas que instalar, abrir, ejecutar o enchufar._
