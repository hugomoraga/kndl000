---
layout: default
title: 🜂
---

{% assign fragmentos = site.fragmentos | sort: 'path' | reverse %}
{% assign count = fragmentos.size %}

{% for fragmento in fragmentos %}
## ...{{ count | minus: forloop.index0 }}

{% if fragmento.lineas %}
  {% assign lineas_texto = fragmento.lineas | strip_html | strip %}
  {% assign lineas = lineas_texto | split: '
' %}
```
  {% for linea in lineas %}
    {% assign linea_trim = linea | strip %}
    {% if linea_trim != '' %}
      ~ "{{ linea_trim }}"
    {% endif %}
  {% endfor %}
```
{% endif %}

{% endfor %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
