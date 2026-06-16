---
layout: fragmentos-archive
title: ⟡ Rastros
description: "Pensamiento continuo. Acumulación. Memoria. Lenguaje latiendo."
---

<header class="rastros-header">
  <span class="rastros-glyph" aria-hidden="true">⟡</span>
  <span class="rastros-label">Rastros</span>
</header>

<p class="rastros-lead">Pensamiento continuo. Acumulación. Memoria. Lenguaje latiendo.</p>

{%- assign rastros = site.fragmentos | sort: "date" | reverse -%}
{%- assign _year_prev = "" -%}
{%- for f in rastros -%}
  {%- if f.lineas -%}
    {%- assign _year_cur = f.date | date: "%Y" -%}
    {%- if _year_cur != _year_prev -%}
      {%- unless forloop.first -%}<hr class="rastros-year-sep" aria-hidden="true">{%- endunless -%}
      <div class="rastros-year">{{ _year_cur }}</div>
      {%- assign _year_prev = _year_cur -%}
    {%- endif -%}
    <article class="rastro-bloque">
      {%- for row in f.lineas -%}
        {%- assign t = row.linea -%}
        {%- if t != nil and t != "" -%}
          <p class="rastro-linea"><span class="rastro-marca" aria-hidden="true">※</span> {{ t | escape }}</p>
        {%- endif -%}
      {%- endfor -%}
    </article>
  {%- endif -%}
{%- endfor -%}

---

_Archivo de pensamiento en curso. No son publicaciones. Son rastros._
