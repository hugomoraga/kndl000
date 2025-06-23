---
layout: default
title: Poema
---

# Diario interior

{% for post in site.posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) <span style="color:#666">({{ post.date | date: "%Y-%m-%d" }})</span>
{% endfor %}
