---
layout: default
title: Dispositivos
description: "Plugins, VST, aplicaciones, visuales y herramientas para mentes creativas — KNDL 000."
---

<p class="dispositivo-index-lead">Herramientas propias: audio, software, visuales y experimentos empaquetados. Cada entrada es un dispositivo en el archivo.</p>

{% assign sorted = site.dispositivos | sort: "date" | reverse %}

<ul class="dispositivo-list">
  {% for d in sorted %}
    {% assign label = d.list_title | default: d.title %}
    <li>
      <a href="{{ d.url | relative_url }}">{{ label }}</a>
      {% if d.kind %}
        <span class="dispositivo-list__kind">
          {% case d.kind %}
            {% when "vst" %}🔌 VST
            {% when "app" %}📱 app
            {% when "tool" %}🛠️ herramienta
            {% when "visual" %}🎨 visual
            {% when "hardware" %}🔧 hardware
            {% when "plugin" %}🔌 plugin
            {% else %}· {{ d.kind }}
          {% endcase %}
        </span>
      {% endif %}
      {% if d.tech %}
        <span class="dispositivo-list__kind">· {{ d.tech }}</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>

---

_Dispositivos: cosas que instalar, abrir, ejecutar o enchufar._
