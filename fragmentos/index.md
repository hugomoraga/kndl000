---
layout: default
title: Fragmentos
---

{% for frag in site.data.fragmentos %}
## K.N.D.L.0.0.{{ frag.id }}

{% for linea in frag.textos %}
- "{{ linea }}"
{% endfor %}

{% endfor %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
