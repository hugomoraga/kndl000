# Bitácora KNDL

Este repositorio contiene un blog minimalista basado en [Jekyll](https://jekyllrb.com/) y Markdown preparado para GitHub Pages.

## Uso Local

1. Clona el repositorio y entra en la carpeta.
2. Instala las dependencias ejecutando `bundle install` (requiere Ruby y Bundler).
3. Inicia el servidor local con `bundle exec jekyll serve` para previsualizar los cambios.

## Despliegue

El sitio se construye automáticamente usando **GitHub Actions** cuando haces push a la rama `main`. 

### Configuración de GitHub Pages

1. Ve a **Settings** → **Pages** en tu repositorio
2. En **Source**, selecciona **GitHub Actions** (no "Deploy from a branch")
3. El workflow `.github/workflows/jekyll.yml` construirá y desplegará el sitio automáticamente

## Admin CMS

Accede al panel de administración en `/admin/` para gestionar el contenido del blog usando Decap CMS.
