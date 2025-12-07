---
layout: default
title: 🜂
---

{% assign fragmentos = site.fragmentos | sort: 'path' | reverse %}
{% assign count = fragmentos.size %}

{% for fragmento in fragmentos %}
## ...{{ count | minus: forloop.index0 }}

{% for item in fragmento.lineas %}
    ~ "{{ item.linea }}"
{% endfor %}

{% endfor %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
