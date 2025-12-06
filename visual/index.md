---
layout: default
title: ⊙
---


<div class="collage">

{% for image in site.images %}
  <figure class="image-effect">
    <a href="{{ site.baseurl }}{{ image.url }}" style="text-decoration: none;">
      <img src="{{ site.baseurl }}{{ image.image }}" alt="{{ image.title }}" loading="lazy" />
    </a>
    <figcaption style="text-align: center; font-size: 0.9rem; color: #666; margin-top: 0.3rem;">
      {{ image.title }}
    </figcaption>
  </figure>
{% endfor %}

</div>
