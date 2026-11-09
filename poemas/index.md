---
layout: default
title: Poemas
symbol: "⁂"
sigil: poemas
body_class: reading-poemas
main_class: reading-main
back: false
description: "Archivo de poemas — KNDL 000. Versos breves, simbólicos, fragmentarios. Voz que se deshace."
---

{%- comment -%}
  El índice ordena por fecha, pero una serie es una unidad de lectura:
  se colapsa en un bloque, se ordena por `part` y se ancla a la fecha
  de su parte más reciente.
{%- endcomment -%}
{%- assign _series_poems = site.poems | where_exp: "item", "item.series and item.series != ''" -%}
{%- assign _series_names = _series_poems | map: "series" | uniq -%}
{%- assign _entries = "" -%}

{%- for series in _series_names -%}
  {%- assign _members = site.poems | where: "series", series | sort: "part" -%}
  {%- if _members.size > 1 -%}
    {%- assign _latest = "" -%}
    {%- for poem in _members -%}
      {%- assign _d = poem.date | date: "%Y-%m-%d" -%}
      {%- if _d > _latest -%}{%- assign _latest = _d -%}{%- endif -%}
    {%- endfor -%}
    {%- assign _entry = _latest | append: "|1|series|" | append: series -%}
  {%- else -%}
    {%- assign _poem = _members.first -%}
    {%- assign _d = _poem.date | date: "%Y-%m-%d" -%}
    {%- assign _entry = _d | append: "|0|single|" | append: _poem.url -%}
  {%- endif -%}
  {%- if _entries == "" -%}{%- assign _entries = _entry -%}{%- else -%}{%- assign _entries = _entries | append: "~~~" | append: _entry -%}{%- endif -%}
{%- endfor -%}

{%- assign _singles = site.poems | where_exp: "item", "item.series == nil or item.series == ''" -%}
{%- for poem in _singles -%}
  {%- assign _d = poem.date | date: "%Y-%m-%d" -%}
  {%- assign _entry = _d | append: "|0|single|" | append: poem.url -%}
  {%- if _entries == "" -%}{%- assign _entries = _entry -%}{%- else -%}{%- assign _entries = _entries | append: "~~~" | append: _entry -%}{%- endif -%}
{%- endfor -%}

{%- if _entries != "" -%}
  {%- assign _ordered_entries = _entries | split: "~~~" | sort | reverse -%}
{%- else -%}
  {%- assign _ordered_entries = "" | split: "" -%}
{%- endif -%}

<div class="poemas-index">
  <p class="poemas-index-lede">Archivo de versos. Las series se leen completas; el resto, por fecha.</p>

  {% if _ordered_entries.size == 0 %}
  <p class="reading-empty">Todavía no hay poemas publicados.</p>
  {% endif %}

  {%- assign _month_prev = "" -%}
  {%- for entry in _ordered_entries -%}
    {%- assign _pieces = entry | split: "|" -%}
    {%- assign _date = _pieces[0] -%}
    {%- assign _type = _pieces[2] -%}
    {%- assign _value = _pieces[3] -%}
    {%- assign _month = _date | date: "%Y-%m" -%}
    {%- assign _month_num = _date | date: "%m" -%}
    {%- assign _year_es = _date | date: "%Y" -%}

    {%- if _month != _month_prev -%}
      {%- unless forloop.first -%}</ul></section>{%- endunless -%}
      {%- case _month_num -%}
        {%- when "01" -%}{%- assign _month_es = "Enero" -%}
        {%- when "02" -%}{%- assign _month_es = "Febrero" -%}
        {%- when "03" -%}{%- assign _month_es = "Marzo" -%}
        {%- when "04" -%}{%- assign _month_es = "Abril" -%}
        {%- when "05" -%}{%- assign _month_es = "Mayo" -%}
        {%- when "06" -%}{%- assign _month_es = "Junio" -%}
        {%- when "07" -%}{%- assign _month_es = "Julio" -%}
        {%- when "08" -%}{%- assign _month_es = "Agosto" -%}
        {%- when "09" -%}{%- assign _month_es = "Septiembre" -%}
        {%- when "10" -%}{%- assign _month_es = "Octubre" -%}
        {%- when "11" -%}{%- assign _month_es = "Noviembre" -%}
        {%- when "12" -%}{%- assign _month_es = "Diciembre" -%}
      {%- endcase -%}
      <section class="poemas-index__month" aria-labelledby="poemas-mes-{{ _month }}">
        <h2 id="poemas-mes-{{ _month }}" class="poemas-index__month-label">{{ _month_es }} {{ _year_es }}</h2>
        <ul class="poemas-index__list">
      {%- assign _month_prev = _month -%}
    {%- endif -%}

    {%- if _type == "series" -%}
      {%- assign _members = site.poems | where: "series", _value | sort: "part" -%}
      <li class="poemas-index__series-item">
        <article class="poemas-index__series-block">
          <header class="poemas-index__series-head">
            <span class="poemas-index__series-label">Serie · {{ _value }} · {{ _members.size }} {% if _members.size == 1 %}parte{% else %}partes{% endif %}</span>
            <time class="poemas-index__series-date" datetime="{{ _date }}">{{ _date }}</time>
          </header>
          <ol class="poemas-index__series-list">
            {%- for poem in _members -%}
              {%- assign _part = poem.part -%}
              {%- if _part == nil or _part == "" -%}{%- assign _part = forloop.index -%}{%- endif -%}
            <li>
              <a class="poemas-index__series-link" href="{{ poem.url | relative_url }}">
                <span class="poemas-index__series-part">{{ _part }}</span>
                <span class="poemas-index__series-name">{{ poem.title }}</span>
              </a>
            </li>
            {%- endfor -%}
          </ol>
        </article>
      </li>
    {%- else -%}
      {%- assign _poem = site.poems | where: "url", _value | first -%}
      {%- if _poem -%}
      <li>
        <a class="poemas-index__row" href="{{ _poem.url | relative_url }}">
          <time class="poemas-index__day" datetime="{{ _poem.date | date_to_xmlschema }}">{{ _poem.date | date: "%d" }}</time>
          <span class="poemas-index__title-wrap">
            <span class="poemas-index__title">{{ _poem.title }}</span>
            {% if _poem.series and _poem.series != "" %}
            <span class="poemas-index__series"> · {{ _poem.series }}{% if _poem.part and _poem.part != "" %} · parte {{ _poem.part }}{% endif %}</span>
            {% endif %}
          </span>
        </a>
      </li>
      {%- endif -%}
    {%- endif -%}

    {%- if forloop.last -%}</ul></section>{%- endif -%}
  {%- endfor -%}
</div>
