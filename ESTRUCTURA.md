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
│   │       ├── _codigos/        # ◇ Código
│   │       ├── _dispositivos/   # ◇ Dispositivos
│   │       ├── _fragmentos/     # ☍ Fragmentos
│   │       ├── _images/         # ◉ Imágenes
│   │       ├── _melange_reports/# ☽ Melange Reports
│   │       ├── _personal_music/ # ♪ Música personal
│   │       ├── _poems/          # ↂ Poemas
│   │       ├── _posts/          # ✶ Diario
│   │       ├── _spotify_playlists/ # Listas de Spotify
│   │       ├── _vestigios/      # ⚱ Vestigios
│   │       └── _youtube_setlists/   # Setlists de YouTube
│   │
│   ├── diario/index.md      # ✶ Diario (página)
│   ├── poemas/index.md      # ↂ Poemas
│   ├── visual/index.md      # ◉ Visual
│   ├── melange/index.md     # 🜏 Melange
│   ├── vestigios/index.md   # ⚱ Vestigios
│   ├── codigo/index.md      # ◊ Código
│   └── dispositivos/index.md# ◇ Devices
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
│       │   ├── umbral-tone/   # Módulo de audio generativo
│       │   │   ├── index.js
│       │   │   ├── app.js
│       │   │   ├── Channel.js
│       │   │   ├── Effects.js
│       │   │   ├── Generators.js
│       │   │   ├── Mixer.js
│       │   │   ├── PatternEditor.js
│       │   │   ├── PresetLoader.js
│       │   │   ├── Transport.js
│       │   │   └── README.md
│       │   │
│       │   └── umbral-vision/# Módulo de visual generativo
│       │       ├── index.js
│       │       ├── app.js
│       │       ├── AudioReactive.js
│       │       ├── Effects.js
│       │       ├── Transition.js
│       │       ├── Utils.js
│       │       ├── Visualizer.js
│       │       └── README.md
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
│   │   ├── fragmentos-focus.html
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
│       ├── fragmentos.yml
│       ├── home.yml
│       └── navigation.yml
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
- **`umbral-tone/`**: Módulo de audio generativo. Transport, Mixer, Channel, Effects, Generators, PatternEditor, PresetLoader, orquestados desde `app.js` (entry point).
- **`umbral-vision/`**: Módulo de visual generativo. AudioReactive, Effects, Transition, Visualizer, Utils, orquestados desde `app.js` (entry point).

### Media (`assets/media/`)

- **`images/`**: Imágenes del sitio (JPEG/PNG) organizadas por fecha/UUID.
- **`audio/`**: Samples de audio (WAV) usados por `umbral-tone` y la home.

### Contenido (`content/`)

- **`collections/`**: Colecciones Jekyll configuradas en `_config.yml` con `collections_dir: content/collections`. Cada subdirectorio prefijo `_` es una colección.
- Las páginas viven en la raíz del repo para que Jekyll las incluya automáticamente.

## 🎯 Ventajas de esta Estructura

- **Separación clara**: Contenido fuente vs archivos generados (`_site/`).
- **Organización lógica**: `core/`, `utils/`, `umbral-tone/`, `umbral-vision/` agrupan por responsabilidad.
- **Escalabilidad**: Módulos `umbral-*` se pueden cargar como bundles independientes.
- **Mantenibilidad**: Cada módulo tiene su `README.md` interno y entry point claro.
- **Compatibilidad**: Funciona con Jekyll (Ruby) y GitHub Pages sin configuración extra.

## 📝 Notas Importantes

- Las páginas (`diario/`, `poemas/`, etc.) están en la raíz para que Jekyll las procese con `permalink: /`.
- Las colecciones viven en `content/collections/<_nombre>/` por la config `collections_dir`.
- `assets/js/umbral-tone/` y `assets/js/umbral-vision/` son módulos autocontenidos con su propio `app.js` (entry) y `index.js` (API pública).
- `_site/`, `node_modules/` y `vendor/` son generados — no editar manualmente.
- `admin/config.yml` define las 11 colecciones del CMS (Sveltia CMS).
