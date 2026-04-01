---
layout: default
title: Poemas
---

{% assign sorted_poems = site.poems | sort: "date" | reverse %}
{% assign grouped_poems = sorted_poems | group_by_exp: "item", "item.date | date: '%Y-%m'" %}

<div class="poemas-index">
  <p class="poemas-index-lede">Archivo de versos, ordenado por fecha.</p>

  {% for group in grouped_poems %}
  {% assign month_num = group.items.first.date | date: "%m" %}
  {% case month_num %}
    {% when "01" %}{% assign month_es = "Enero" %}
    {% when "02" %}{% assign month_es = "Febrero" %}
    {% when "03" %}{% assign month_es = "Marzo" %}
    {% when "04" %}{% assign month_es = "Abril" %}
    {% when "05" %}{% assign month_es = "Mayo" %}
    {% when "06" %}{% assign month_es = "Junio" %}
    {% when "07" %}{% assign month_es = "Julio" %}
    {% when "08" %}{% assign month_es = "Agosto" %}
    {% when "09" %}{% assign month_es = "Septiembre" %}
    {% when "10" %}{% assign month_es = "Octubre" %}
    {% when "11" %}{% assign month_es = "Noviembre" %}
    {% when "12" %}{% assign month_es = "Diciembre" %}
  {% endcase %}
  {% assign year_es = group.items.first.date | date: "%Y" %}

  <section class="poemas-index__month" aria-labelledby="poemas-mes-{{ group.name }}">
    <h2 id="poemas-mes-{{ group.name }}" class="poemas-index__month-label">{{ month_es }} {{ year_es }}</h2>
    <ul class="poemas-index__list">
      {% for poem in group.items %}
      <li>
        <a class="poemas-index__row" href="{{ poem.url | relative_url }}">
          {% if poem.image %}
          <span class="poemas-index__thumb-wrap">
            <img class="poemas-index__thumb" src="{{ poem.image | relative_url }}" alt="" width="48" height="48" loading="lazy" decoding="async">
          </span>
          {% endif %}
          <time class="poemas-index__day" datetime="{{ poem.date | date_to_xmlschema }}">{{ poem.date | date: "%d" }}</time>
          <span class="poemas-index__title-wrap">
            <span class="poemas-index__title">{{ poem.title }}</span>
            {% if poem.series %}
            <span class="poemas-index__series"> · {{ poem.series }}</span>
            {% endif %}
          </span>
        </a>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
</div>
