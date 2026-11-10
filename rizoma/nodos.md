---
layout: default
title: Nodos
symbol: "⋔"
sigil: rizoma
body_class: reading-poemas reading-rizoma
main_class: reading-main
permalink: /rizoma/nodos/
description: "Nodos de Rizoma — KNDL 000. Puntos de conexión provisionales entre exploraciones."
---

<p class="rizoma-lede">Puntos de conexión, no categorías. Cada nodo reúne exploraciones donde una idea aparece y cambia de sentido. Las definiciones son provisorias.</p>

{% assign nodos = site.nodos | sort: "order" %}
<div class="nodos">
  {% for nodo in nodos %}
  <section class="nodo" id="{{ nodo.slug }}">
    <h2 class="nodo__title">{{ nodo.title }}</h2>
    <p class="nodo__definition">{{ nodo.definition }}</p>
    {% assign _found = false %}
    {% for exploracion in site.exploraciones %}
      {% if exploracion.nodos contains nodo.title %}
        {% unless _found %}<ul class="nodo__list">{% endunless %}
        <li><a href="{{ exploracion.url | relative_url }}">{{ exploracion.title }}</a></li>
        {% assign _found = true %}
      {% endif %}
    {% endfor %}
    {% if _found %}</ul>{% else %}<p class="nodo__empty">Todavía sin exploraciones.</p>{% endif %}
  </section>
  {% endfor %}
</div>
