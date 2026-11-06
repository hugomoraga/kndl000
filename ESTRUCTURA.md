# Estructura del Proyecto KNDL 000

## 📁 Organización de Directorios

```
kndl000/
│
├── 📄 Configuración (Raíz)
│   ├── _config.yml          # Configuración Jekyll
│   ├── Gemfile              # Dependencias Ruby
│   ├── package.json         # Metadatos del proyecto (sin dependencias Node)
│   ├── package-lock.json    # Lockfile de npm (vacío, sin dependencias)
│   ├── CNAME                # Configuración dominio
│   ├── .gitignore           # Archivos ignorados por Git
│   ├── .ruby-version        # Versión de Ruby
│   ├── 404.html             # Página de error 404
│   ├── robots.txt           # Reglas para crawlers
│   ├── index.md             # Página de inicio
│   ├── README.md            # Documentación principal
│   └── ESTRUCTURA.md        # Este archivo
│
├── 📝 Contenido
│   ├── content/
│   │   └── collections/     # Colecciones Jekyll (contenido fuente)
│   │       ├── _codigos/        # ◊ Código
│   │       ├── _dispositivos/   # ⎔ Dispositivos
│   │       ├── _fragmentos/     # ⟡ Rastros
│   │       ├── _images/         # ◉ Imágenes
│   │       ├── _melange_reports/# 🜏 Melange Reports
│   │       ├── _personal_music/ # ♪ Música personal
│   │       ├── _poems/          # ⁂ Poemas
│   │       ├── _posts/          # ✶ Diario
│   │       ├── _spotify_playlists/ # Listas de Spotify
│   │       ├── _vestigios/      # ⏚ Vestigios
│   │       └── _youtube_setlists/   # Setlists de YouTube
│   │
│   ├── diario/index.md      # ✶ Diario (página)
│   ├── poemas/index.md      # ⁂ Poemas
│   ├── imaginario/index.md   # ◉ Imaginario
│   ├── melange/index.md     # 🜏 Melange
│   ├── vestigios/index.md   # ⏚ Vestigios
│   ├── codigo/index.md      # ◊ Código
│   └── dispositivos/index.md# ⎔ Dispositivos
│
│   # Las páginas viven en la raíz para que Jekyll las procese
│
├── 🎨 Assets Estáticos
│   └── assets/
│       ├── css/
│       │   └── style.css    # Estilos principales
│       │
│       ├── js/
│       │   ├── core/        # Código principal y helpers base
│       │   │   ├── main.js
│       │   │   ├── audio.js
│       │   │   ├── config.js
│       │   │   ├── visualizer.js
│       │   │   ├── image-effects.js
│       │   │   ├── home-audio.js
│       │   │   ├── home-canvas.js
│       │   │   ├── home-nav.js
│       │   │   ├── home-collage-carousel.js
│       │   │   ├── collage-home.js
│       │   │   ├── nube-palabras.js
│       │   │   ├── lab-home.js
│       │   │   ├── infinite-scroll.js
│       │   │   └── code-runner.js
│       │   │
│       │   ├── utils/       # Utilidades y componentes UI
│       │   │   ├── control-panel.js
│       │   │   └── components/
│       │   │       └── control-panel.js
│       │   │
│       │   ├── umbral-vision/# Módulo de visual generativo
│       │   │   ├── index.js
│       │   │   ├── app.js
│       │   │   ├── AudioReactive.js
│       │   │   ├── Effects.js
│       │   │   ├── Transition.js
│       │   │   ├── Utils.js
│       │   │   ├── Visualizer.js
│       │   │   └── README.md
│       │
│       └── media/
│           ├── images/      # Imágenes del sitio
│           └── audio/       # Samples de audio (WAV)
│
├── 🧩 Componentes Jekyll
│   ├── _layouts/            # Layouts de páginas
│   │   ├── default.html
│   │   ├── poems.html
│   │   ├── imagen.html
│   │   ├── codigo.html
│   │   ├── dispositivo.html
│   │   ├── melange-report.html
│   │   ├── generator.html
│   │   └── interactive.html
│   │
│   ├── _includes/           # Includes reutilizables
│   │   ├── analytics.html
│   │   ├── assemblage.html
│   │   ├── back-button.html
│   │   ├── collage-dynamic.html
│   │   ├── content-item.html
│   │   ├── figure.html
│   │   ├── fragmentos-focus.html (eliminado en 006)
│   │   ├── home-collage.html
│   │   ├── lab-feed.html
│   │   ├── melange-report-placeholder.html
│   │   ├── nav-poem.html
│   │   ├── personal-music-item.html
│   │   ├── related-poem.html
│   │   ├── seo.html
│   │   ├── spotify-playlist.html
│   │   ├── title.html
│   │   └── youtube-setlist.html
│   │
│   └── _data/               # Datos YAML
│       ├── assemblage.yml
│       ├── home.yml
│       └── navigation.yml
│
├── 🧪 Calidad
│   └── scripts/
│       ├── build-image-variants.sh  # WebP 480w/960w de Imaginario
│       └── check-links.mjs          # Chequeo de enlaces internos en _site
│
├── 🔧 Admin
│   ├── admin/config.yml  # Configuración Sveltia CMS (11 colecciones)
│   └── admin/index.html  # Panel admin Sveltia CMS (CDN)
│
├── 🛠️ Spec Kit
│   ├── .specify/            # Configuración de GitHub Spec Kit
│   └── specs/               # Features y tareas
│
├── 🤖 GitHub
│   ├── .github/
│   │   ├── workflows/       # GitHub Actions
│   │   ├── agents/          # Agentes de Spec Kit
│   │   └── prompts/         # Prompts de Spec Kit
│   └── .vscode/             # Configuración VS Code
│
└── 🗑️ Directorios de Build (ignorados por Git)
    ├── _site/               # Sitio generado por Jekyll
    ├── node_modules/        # Dependencias Node
    ├── vendor/              # Dependencias Ruby
    └── .jekyll-cache/       # Cache de Jekyll
```

## 📋 Organización por Tipo

### JavaScript (`assets/js/`)

- **`core/`**: Código principal y helpers base. Audio, visualización, efectos de imagen, navegación, collage, nube de palabras, lab feed, infinite scroll y code runner. Carga vía `<script defer>` en layouts/pages.
- **`utils/`**: Utilidades y componentes UI reutilizables. `control-panel.js` y `components/control-panel.js` (módulo y componente).
- **`umbral-vision/`**: Módulo de visual generativo. AudioReactive, Effects, Transition, Visualizer, Utils, orquestados desde `app.js` (entry point).
- **Módulos externos:** el motor de audio vive en [`quicio/umbral-tone`](https://github.com/quicio/umbral-tone) y el instrumento **Espiral** en [`quicio/espiral`](https://github.com/quicio/espiral). El sitio los consume como dispositivos, no como código embebido.

### Media (`assets/media/`)

- **`images/`**: Imágenes del sitio (JPEG/PNG) organizadas por fecha/UUID.
- **`audio/`**: Samples de audio (WAV) usados por la home y copiados a Espiral.

### Contenido (`content/`)

- **`collections/`**: Colecciones Jekyll configuradas en `_config.yml` con `collections_dir: content/collections`. Cada subdirectorio prefijo `_` es una colección.
- Las páginas viven en la raíz del repo para que Jekyll las incluya automáticamente.

## 🎯 Ventajas de esta Estructura

- **Separación clara**: Contenido fuente vs archivos generados (`_site/`).
- **Organización lógica**: `core/`, `utils/` y `umbral-vision/` agrupan por responsabilidad; los instrumentos autónomos viven en repositorios de Quicio.
- **Escalabilidad**: Módulos `umbral-*` se pueden cargar como bundles independientes.
- **Mantenibilidad**: Cada módulo tiene su `README.md` interno y entry point claro.
- **Compatibilidad**: Funciona con Jekyll (Ruby) y GitHub Pages sin configuración extra.

## 📝 Notas Importantes

- Las páginas (`diario/`, `poemas/`, etc.) están en la raíz para que Jekyll las procese con `permalink: /`.
- Imaginario vive en `imaginario/index.md`. Las rutas antiguas `/visual/` y `/imagenes/` se conservan como redirects estáticos hacia `/imaginario/` y `/imaginario/:name/`; la colección fuente sigue siendo `content/collections/_images`.
- `_data/navigation.yml` es la fuente única de nombres, URLs, glifos, descripciones, visibilidad primaria y prefijos de vuelta de las secciones.
- Después de agregar una placa nueva, ejecutar `scripts/build-image-variants.sh` para generar sus derivados WebP.
- El workflow de GitHub Actions corre `scripts/check-links.mjs` después del build y antes del deploy.

- Las colecciones viven en `content/collections/<_nombre>/` por la config `collections_dir`.
- `assets/js/umbral-vision/` es un módulo autocontenido con su propio `app.js` (entry) e `index.js` (API pública).
- `quicio/umbral-tone` y `quicio/espiral` son repositorios independientes; el sitio enlaza el instrumento desde `/dispositivos/espiral/`.
- `_site/`, `node_modules/` y `vendor/` son generados — no editar manualmente.
- `admin/config.yml` define las 11 colecciones del CMS (Sveltia CMS).
