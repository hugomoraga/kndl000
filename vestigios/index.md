---
layout: default
title: ⚱ Vestigios ⚱
---

> *Lo que queda después. Objetos encontrados. Textos incompletos. Archivo de lo que persiste.*

{% assign sorted_vestigios = site.vestigios | sort: "date" | reverse %}

{% for vestigio in sorted_vestigios %}
<div class="vestigio" style="margin: 3rem 0; padding: 1.5rem; border-left: 1px solid #333;">
  <a href="{{ vestigio.url | relative_url }}" style="text-decoration: none;">
    <h3 style="margin-top: 0; color: #888; font-size: 1rem; font-weight: normal;">
      {{ vestigio.title }}
      {% if vestigio.date %}
        <span style="color: #444; font-size: 0.85rem;">({{ vestigio.date | date: "%Y-%m-%d" }})</span>
      {% endif %}
    </h3>
  </a>
  
  {% if vestigio.image %}
    <img src="{{ vestigio.image | relative_url }}" alt="{{ vestigio.title }}" style="max-width: 100%; height: auto; margin: 1rem 0; opacity: 0.7; border-radius: 4px;">
  {% endif %}
  
  <div style="color: #666; font-size: 0.9rem; line-height: 1.6;">
    {{ vestigio.content | strip_html | truncatewords: 30 }}
  </div>
  
  <a href="{{ vestigio.url | relative_url }}" style="color: #444; font-size: 0.85rem; text-decoration: none; margin-top: 0.5rem; display: inline-block;">
    ↳ ver vestigio completo
  </a>
</div>

{% if forloop.last == false %}
<hr style="border: none; border-top: 1px solid #222; margin: 2rem 0;">
{% endif %}

{% endfor %}

