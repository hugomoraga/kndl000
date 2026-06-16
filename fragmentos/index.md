---
layout: default
title: Rastros
main_class: fragmentos-archive
symbol: ⟡
symbol_suffix: false
description: "Pensamiento continuo. Acumulación. Memoria. Lenguaje latiendo."
---

<p class="rastros-lead">Pensamiento continuo. Acumulación. Memoria. Lenguaje latiendo.</p>

{%- comment -%}
  Cada fragmento ordena por su "clave cronológica":
  - El slug del filename (fragmento-YYYYMMDD-HHMMSS) es la fuente
    primaria — el filename no miente.
  - Si el slug no tiene fecha (caso degenerado), fallback al frontmatter date.

  Agrupamos por año y renderizamos descendente.
{%- endcomment -%}

{%- assign _ordered = site.fragmentos | sort: "path" | reverse -%}

{%- assign _year_prev = "" -%}
{%- for f in _ordered -%}
  {%- if f.lineas -%}
    {%- comment -%} Determinar año: slug primero, date como fallback -{%- endcomment -%}
    {%- assign _slug = f.path | split: "/" | last | replace: ".md", "" -%}
    {%- assign _slug_year = _slug | slice: 10, 4 -%}
    {%- if _slug_year.size == 4 -%}
      {%- assign _year = _slug_year -%}
    {%- elsif f.date -%}
      {%- assign _year = f.date | date: "%Y" -%}
    {%- else -%}
      {%- assign _year = "?" -%}
    {%- endif -%}
    {%- if _year != _year_prev -%}
      {%- unless forloop.first -%}{%- endunless -%}
      <div class="rastros-year">{{ _year }}</div>
      {%- assign _year_prev = _year -%}
    {%- endif -%}
    <article class="rastro-bloque">
      {%- assign _lineas = f.lineas | where_exp: "row", "row.linea != nil and row.linea != ''" -%}
      {%- for row in _lineas -%}
        {%- assign t = row.linea -%}
        <p class="rastro-linea">{{ t | escape }}</p>
      {%- endfor -%}
      <div class="rastro-firma" aria-hidden="true">※</div>
    </article>
  {%- endif -%}
{%- endfor -%}

---

_Archivo de pensamiento en curso. No son publicaciones. Son rastros._
