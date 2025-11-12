# Admin CMS - KNDL 000

Interfaz de administración para gestionar el contenido del blog usando **Decap CMS** (antes Netlify CMS).

## Acceso

Visita: `https://kundala000.com/admin/` o `http://localhost:4000/admin/` en desarrollo.

## Configuración inicial

1. **Autenticación con GitHub:**
   - Al acceder por primera vez, se te pedirá autenticarte con GitHub
   - Necesitas permisos de escritura en el repositorio `hugomoraga/kndl000`

2. **OAuth App (si es necesario):**
   - Si no funciona la autenticación, necesitarás crear una OAuth App en GitHub
   - Ve a: GitHub Settings → Developer settings → OAuth Apps
   - Authorization callback URL: `https://kundala000.com/admin/`

## Colecciones disponibles

### ✶ Diario (`_posts/`)
- Entradas del diario personal
- Formato: `YYYY-MM-DD-titulo.md`
- Campos: título, imagen (opcional), fecha, contenido

### ↂ Poemas (`_poems/`)
- Poemas y textos poéticos
- Campos: título, layout, imagen (opcional), fecha (opcional), serie (opcional), contenido

### ⚱ Vestigios (`_vestigios/`)
- Objetos encontrados, textos incompletos, fragmentos
- Campos: título, imagen (opcional), fecha (opcional), contenido

### ◉ Imágenes (`_images/`)
- Galería de imágenes
- Campos: título, imagen, caption (opcional), alt text (opcional), contenido (opcional)

## Uso

1. Haz clic en la colección que quieres editar
2. Para crear nuevo contenido: botón "New [Colección]"
3. Completa los campos del formulario
4. Usa el editor markdown para el contenido
5. Sube imágenes desde el editor o desde la biblioteca de medios
6. Guarda y publica

## Notas

- Los cambios se guardan directamente en GitHub
- Los archivos se crean/editan en las carpetas correspondientes
- El formato de fecha se genera automáticamente según la colección
- Las imágenes se guardan en `assets/images/`

