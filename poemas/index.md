---
layout: default
title: Poema
---

# Poemas

{% for poems in site.poems %}
- [{{ poems.title }}]({{ poems.url | relative_url }}) <span style="color:#666">({{ poems.date | date: "%Y-%m-%d" }})</span>
{% endfor %}
