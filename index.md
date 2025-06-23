---
layout: default
title: Inicio
nav: true
nav_order: 1
---

# Vestigio y Cenizas

> “No me mires. Solo deja que exista.”

Este sitio es una bitácora introspectiva donde conservo fragmentos, poemas, pensamientos, música y silencio.

- [✶ Diario interior](diario/)
- [☍ Fragmentos](fragmentos/)
- [ↂ Poemas](poemas/)
- [𝄞 Música](musica.md)
- [◉ Archivo visual](visual/)


<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">

{% for object in site.assemblage %}
  <a href="{{ site.baseurl }}{{ object.link }}" style="text-decoration: none;">
    <figure style="margin: 0;">
      <img src="{{ site.baseurl }}{{ object.image }}" alt="{{ object.title }}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
      <figcaption style="text-align: center; font-size: 0.9rem; color: #666; margin-top: 0.3rem;">
        {{ object.title }}
      </figcaption>
    </figure>
  </a>
{% endfor %}

</div>
