---
layout: default
title: ⊙
description: "Imágenes — grabados, litografías, símbolos. Archivo visual de KNDL 000."
---


<div class="collage">

{% for image in site.images %}
  <figure class="image-effect">
    <a class="collage-crop collage__link" href="{{ site.baseurl }}{{ image.url }}">
      <span class="collage-crop__inner">
        <img src="{{ site.baseurl }}{{ image.image }}" alt="{{ image.title }}" loading="lazy" />
      </span>
    </a>
    <figcaption class="collage__caption">{{ image.title }}</figcaption>
  </figure>
{% endfor %}

</div>
