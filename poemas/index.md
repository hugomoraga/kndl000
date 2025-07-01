---
layout: default
title: Poemas
---
{% assign sorted_poems = site.poems | sort: "date" | reverse %}
{% assign grouped_poems = sorted_poems | group_by_exp: "item", "item.date | date: '%Y-%m'" %}

{% for group in grouped_poems %}
## {{ group.name }}
<ul>
  {% for poems in group.items %}
    <li>
      <span style="color:#666">{{ poems.date | date: "%d" }}</span>
      ~ <a href="{{ poems.url | relative_url }}">[{{ poems.title }}]</a>
      {% if poems.series %}
        <span style="font-size: 0.9em; color: #999;"> (Serie: {{ poems.series }})</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>
{% endfor %}