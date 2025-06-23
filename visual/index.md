# Visuales: Imágenes y Capturas <span style="float:right;"><a href="/">⌂ init</a></span>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">

{% for image in site.images %}
  <a href="{{ image.url }}" style="text-decoration: none;">
    <figure style="margin: 0;">
      <img src="{{ image.image }}" alt="{{ image.title }}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
      <figcaption style="text-align: center; font-size: 0.9rem; color: #666; margin-top: 0.3rem;">
        {{ image.title }}
      </figcaption>
    </figure>
  </a>
{% endfor %}

</div>
