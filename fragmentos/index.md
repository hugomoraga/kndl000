---
layout: default
title: 🜂
---

{% assign fragmentos = site.data.fragmentos %}
{% assign count = fragmentos.size %}

{% for bloque in fragmentos %}
## ...{{ count | minus: forloop.index0 }}

{% for linea in bloque %}
    ~ "{{ linea }}"
{% endfor %}

{% endfor %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
