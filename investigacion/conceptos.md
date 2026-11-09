---
layout: default
title: Constelación
symbol: "⌖"
sigil: investigacion
body_class: reading-poemas reading-investigacion
main_class: reading-main
permalink: /investigacion/conceptos/
description: "Conceptos que cruzan los expedientes de investigación — KNDL 000."
---

<p class="investigacion-lede">Los conceptos que cruzan los expedientes. Una misma idea puede aparecer en un poema, un código, un ritual o una imagen.</p>

<div class="conceptos">
  {% for concept in site.data.conceptos %}
  <section class="concepto" id="{{ concept.slug }}">
    <h2 class="concepto__title">{{ concept.name }}</h2>
    <p class="concepto__definition">{{ concept.definition }}</p>
    {% assign _found = false %}
    {% for inv in site.investigaciones %}
      {% if inv.concepts contains concept.name %}
        {% unless _found %}<ul class="concepto__list">{% endunless %}
        <li><a href="{{ inv.url | relative_url }}">{{ inv.title }}</a></li>
        {% assign _found = true %}
      {% endif %}
    {% endfor %}
    {% if _found %}</ul>{% endif %}
  </section>
  {% endfor %}
</div>
