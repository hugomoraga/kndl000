---
layout: default
title: 🜂
---

{% assign fragmentos = site.fragmentos | sort: 'path' | reverse %}
{% assign count = fragmentos.size %}

{% for fragmento in fragmentos %}
## ...{{ count | minus: forloop.index0 }}

{% assign _frag_id = fragmento.slug | default: fragmento.name | replace: '.md', '' | slugify %}
{% for item in fragmento.lineas %}
<p class="fragmento-linea-wrap"><span class="fragmento-linea" id="frag-{{ _frag_id }}-{{ forloop.index }}" tabindex="-1">~ "{{ item.linea | escape }}"</span></p>
{% endfor %}

{% endfor %}

{% include fragmentos-focus.html %}

---

_Fragmentos sin explicación. Solo lenguaje latiendo._
