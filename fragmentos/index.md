---
layout: default
title: Rastros
symbol: "⟡"
sigil: rastros
body_class: reading-rastros
main_class: fragmentos-archive reading-main
back: false
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

{% if _ordered.size == 0 %}
<p class="reading-empty">Todavía no hay rastros.</p>
{% endif %}

{%- assign _year_prev = "" -%}
{%- for f in _ordered -%}
  {%- if f.lineas -%}
    {%- comment -%} Determinar año: slug primero, date como fallback -{%- endcomment -%}
    {%- assign _slug = f.path | split: "/" | last | replace: ".md", "" -%}
    {%- assign _slug_year = _slug | slice: 10, 4 -%}
    {%- assign _slug_year_num = _slug_year | plus: 0 -%}
    {%- if _slug_year.size == 4 and _slug_year_num > 2000 -%}
      {%- assign _year = _slug_year -%}
    {%- elsif f.date -%}
      {%- assign _year = f.date | date: "%Y" -%}
    {%- else -%}
      {%- assign _year = "?" -%}
    {%- endif -%}
    {%- if _year != _year_prev -%}
      {%- unless forloop.first -%}{% include rastro-divider.html size="full" %}{%- endunless -%}
      <div class="rastros-year">{{ _year }}</div>
      {%- assign _year_prev = _year -%}
    {%- else -%}
      {%- unless forloop.first -%}{% include rastro-divider.html size="compact" %}{%- endunless -%}
    {%- endif -%}
    <article class="rastro-bloque">
      {%- assign _lineas = f.lineas | where_exp: "row", "row.linea != nil and row.linea != ''" -%}
      <p class="rastro-texto">
        {%- for row in _lineas -%}
          {%- assign t = row.linea -%}
          <span class="rastro-linea">{{ t | escape }}</span>
        {%- endfor -%}
      </p>
    </article>
  {%- endif -%}
{%- endfor -%}

{% include rastro-divider.html size="full" %}

<p class="rastros-end"><span class="rastros-end__fleuron" aria-hidden="true">❧</span> <em>Archivo de pensamiento en curso. No son publicaciones. Son rastros.</em></p>

<div class="rastros-seismograph" aria-hidden="true"></div>
<script src="{{ '/assets/js/core/rastros-seismograph.js' | relative_url }}" defer></script>
