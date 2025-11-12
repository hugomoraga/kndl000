---
layout: default
title:  ☽ Melange ☾
nav: true
nav_order: 6
---

## Experiencias Sicodelicas

{% for melanges in site.melange_reports %}

 [**◦ {{ melanges.title }}**]({{ melanges.url | relative_url }}) <span style="color:#666">({{ melanges.date | date: "%Y-%m-%d" }})</span>

<div class="excerpt">
  {{ melanges.content | strip_html | newline_to_br }}
</div>
<a href="{{ melanges.url | relative_url }}" class="read-more">↳ Ver más</a>

* * *
{% endfor %}

