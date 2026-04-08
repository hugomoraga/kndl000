---
layout: default
title: Dispositivos
description: "Plugins, VST, aplicaciones y herramientas para mentes creativas."
---

<p class="dispositivo-index-lead">Herramientas propias: audio, software y experimentos empaquetados. Cada entrada es un dispositivo en el archivo.</p>

{% assign sorted = site.dispositivos | sort: "date" | reverse %}

<ul class="dispositivo-list">
  {% for d in sorted %}
    {% assign label = d.list_title | default: d.title %}
    <li>
      <a href="{{ d.url | relative_url }}">{{ label }}</a>
      {% if d.kind %}
        <span class="dispositivo-list__kind">
          {% case d.kind %}
            {% when "vst" %}(VST)
            {% when "app" %}(app)
            {% when "tool" %}(herramienta)
            {% else %}({{ d.kind }})
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

_Dispositivos: cosas que instalar, abrir o enchufar._
