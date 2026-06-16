# Bitácora KNDL

Este repositorio contiene un blog minimalista basado en [Jekyll](https://jekyllrb.com/) y Markdown preparado para GitHub Pages.

> 📁 Ver [ESTRUCTURA.md](ESTRUCTURA.md) para entender la organización del proyecto.

## Uso Local

### Dependencias del sistema

- **Ruby** (versión fijada en `.ruby-version`) + Bundler

### Pasos

1. Clona el repositorio y entra en la carpeta.
2. Instala las dependencias de Ruby: `bundle install`.
3. Inicia el servidor local: `bundle exec jekyll serve`.

## Admin CMS

Accede al panel de administración en `/admin/` para gestionar el contenido usando [Sveltia CMS](https://github.com/sveltia/sveltia-cms).

### Cómo usar

1. Navega a `https://kundala000.com/admin/`.
2. Haz clic en **"Sign In with Token"**.
3. Genera un [Personal Access Token (PAT)](https://github.com/settings/tokens/new?scopes=repo&description=KNDL+CMS) con scope `repo`.
4. Pega el token y entra.
5. Las 11 colecciones aparecen en la barra lateral. Edita, crea o elimina contenido.

> El token se guarda en `localStorage`. Se borra al hacer logout.

### Colecciones disponibles

Las 11 colecciones configuradas en `admin/config.yml`:
- ✶ Diario (`_posts`)
- ↂ Poemas (`_poems`)
- ☽ Melange Reports (`_melange_reports`)
- ⚱ Vestigios (`_vestigios`)
- ◉ Imágenes (`_images`)
- ⟡ Rastros (`_fragmentos`)
- ◊ Código (`_codigos`)
- ◇ Dispositivos (`_dispositivos`)
- 🎵 Spotify Playlists (`_spotify_playlists`)
- 🎛️ YouTube Setlists (`_youtube_setlists`)
- 🎧 Música Personal (`_personal_music`)

## Despliegue

El sitio se construye automáticamente usando **GitHub Actions** cuando haces push a la rama `main`.

### Configuración de GitHub Pages

1. Ve a **Settings** → **Pages** en tu repositorio
2. En **Source**, selecciona **GitHub Actions** (no "Deploy from a branch")
3. El workflow `.github/workflows/jekyll.yml` construirá y desplegará el sitio automáticamente
