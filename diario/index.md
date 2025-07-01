---
layout: default
title: ✶ Diario ✶
nav: true
nav_order: 10
---

{% for post in site.posts %}
 [**◦ {{ post.title }}**]({{ post.url | relative_url }}) <span style="color:#666">({{ post.date | date: "%Y-%m-%d" }})</span>

<div class="excerpt">
  {{ post.content | strip_html | newline_to_br }}
</div>
<a href="{{ post.url | relative_url }}" class="read-more">↳ Ver más</a>

* * *
{% endfor %}

