# Estructura del Proyecto KNDL 000

## 📁 Organización de Directorios

```
kndl000/
│
├── 📄 Configuración (Raíz)
│   ├── _config.yml          # Configuración Jekyll
│   ├── Gemfile              # Dependencias Ruby
│   ├── package.json         # Dependencias Node.js
│   ├── CNAME                # Configuración dominio
│   └── .gitignore           # Archivos ignorados por Git
│
├── 📝 Contenido
│   └── content/
│       └── collections/      # Colecciones Jekyll (contenido fuente)
│           ├── _posts/      # ✶ Diario
│           ├── _poems/      # ↂ Poemas
│           ├── _images/     # ◉ Imágenes
│           ├── _vestigios/  # ⚱ Vestigios
│           ├── _melange_reports/ # ☽ Melange Reports
│           └── _dispositivos/ # ◇ Dispositivos (VST, apps, herramientas)
│
│   # Páginas en raíz (Jekyll las requiere aquí)
│   ├── diario/index.md
│   ├── fragmentos/index.md
│   ├── poemas/index.md
│   ├── musica/index.md
│   ├── visual/index.md
│   ├── melange/index.md
│   ├── vestigios/index.md
│   └── dispositivos/index.md
│
│   # Nota: Las páginas deben estar en la raíz para que Jekyll las procese
│
├── 🎨 Assets Estáticos
│   └── assets/
│       ├── css/             # Estilos
│       │   └── style.css
│       │
│       ├── js/              # JavaScript organizado
│       │   ├── core/        # Código principal
│       │   │   ├── main.js
│       │   │   ├── audio.js
│       │   │   ├── visualizer.js
│       │   │   ├── config.js
│       │   │   ├── image-effects.js
│       │   │   ├── home-audio.js
│       │   │   └── home-canvas.js
│       │   │
│       │   ├── features/    # Funcionalidades específicas
│       │   │   ├── main.js  # Generator
│       │   │   └── tunnel.js
│       │   │
│       │   └── utils/       # Utilidades y componentes
│       │       └── control-panel.js
│       │
│       └── media/           # Media organizado
│           ├── images/      # Imágenes
│           └── audio/       # Samples de audio
│
├── 🧩 Componentes Jekyll
│   ├── _layouts/            # Layouts de páginas
│   ├── _includes/           # Includes reutilizables
│   └── _data/               # Datos YAML
│
├── ⚙️ Configuración
│   └── tina/                # Configuración TinaCMS
│       ├── config.ts        # Esquema de contenido
│       └── __generated__/   # Archivos generados
│
├── 🔧 Admin
│   └── admin/               # Panel admin TinaCMS (generado)
│
├── 📄 Páginas
│   └── index.md             # Página principal
│
└── 🗑️ Directorios de Build (ignorados por Git)
    ├── _site/               # Sitio generado por Jekyll
    ├── node_modules/        # Dependencias Node
    ├── vendor/              # Dependencias Ruby
    └── .jekyll-cache/       # Cache de Jekyll
```

## 📋 Organización por Tipo

### JavaScript (`assets/js/`)
- **`core/`**: Código principal y funcionalidades base
  - Audio, visualización, efectos de imagen
  - Configuración compartida
- **`features/`**: Funcionalidades específicas
  - Generator, tunnel, etc.
- **`utils/`**: Utilidades y componentes reutilizables
  - Control panels, helpers, etc.

### Media (`assets/media/`)
- **`images/`**: Todas las imágenes del sitio
- **`audio/`**: Samples y archivos de audio

### Contenido (`content/`)
- **`collections/`**: Contenido fuente de las colecciones Jekyll
- **`pages/`**: Páginas del sitio (con symlinks en raíz para Jekyll)

## 🎯 Ventajas de esta Estructura

✅ **Separación clara**: Contenido fuente vs archivos generados
✅ **Organización lógica**: Archivos relacionados agrupados
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
✅ **Mantenibilidad**: Fácil encontrar y modificar archivos
✅ **Compatibilidad**: Funciona con Jekyll y TinaCMS

## 📝 Notas Importantes

- Las páginas tienen **symlinks** en la raíz para que Jekyll las procese correctamente
- Las colecciones están en `content/collections/` configurado en `_config.yml`
- Los assets están organizados por tipo (js/core, js/features, js/utils, media/images, media/audio)
- `_site/`, `admin/`, y `tina/__generated__/` son generados - no editar manualmente
