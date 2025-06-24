---
layout: default
title: 🜂
---

{% for frag in site.data.fragmentos %}
## ...{{ frag.id }}

    {% for linea in frag.textos %}
        ~ "{{ linea }}"
    {% endfor %}

{% endfor %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
