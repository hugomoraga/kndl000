---
layout: default
title: ✶ Diario ✶
nav: true
nav_order: 10
---


{% for post in site.posts %}
◦ [{{ post.title }}]({{ post.url | relative_url }}) <span style="color:#666">({{ post.date | date: "%Y-%m-%d" }})</span>

{{ post.content | strip_html | truncatewords: 50 }}


* * *


{% endfor %}

