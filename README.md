# Bitácora KNDL

Este repositorio contiene un blog minimalista basado en [Jekyll](https://jekyllrb.com/) y Markdown preparado para GitHub Pages.

> 📁 Ver [ESTRUCTURA.md](ESTRUCTURA.md) para entender la organización del proyecto.

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

Accede al panel de administración en `/admin/` para gestionar el contenido del blog usando [Tina CMS](https://tina.io/).

### Configuración de Tina CMS

#### Para desarrollo local:

1. **Configura las credenciales** (opcional para desarrollo):
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   
   # Edita .env con tus credenciales de Tina Cloud
   # Obtén las credenciales de https://tina.io/cloud
   ```

2. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Esto iniciará tanto Jekyll como el servidor de desarrollo de TinaCMS en `http://localhost:4000`

3. **Accede al admin** en `http://localhost:4000/admin/`

#### Para producción:

1. **Configura las variables de entorno** con tus credenciales de Tina Cloud:
   - `NEXT_PUBLIC_TINA_CLIENT_ID`
   - `TINA_TOKEN`

2. **Construye el admin**:
   ```bash
   npm run build
   ```
   Esto generará los assets de producción en `admin/`

3. **Despliega** el sitio (el admin estará disponible en `/admin/`)

### Colecciones disponibles

El esquema de contenido está definido en `tina/config.ts`. Las colecciones son:
- ✶ Diario (`_posts`)
- ↂ Poemas (`_poems`)
- ☽ Melange Reports (`_melange_reports`)
- ⚱ Vestigios (`_vestigios`)
- ◉ Imágenes (`_images`)

### Solución de problemas

Si ves el error "Failed loading TinaCMS assets":
- **En desarrollo**: Asegúrate de usar `npm run dev` (no accedas directamente a `/admin/`)
- **En producción**: Verifica que hayas ejecutado `npm run build` y que las credenciales estén configuradas
