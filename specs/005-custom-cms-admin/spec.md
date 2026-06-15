# Feature Specification: CMS Admin Propio

**Feature Branch**: `005-custom-cms-admin`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "he hecho varios cambios. Ahora estaba pensando en hacer un cms admin propio para no depender de tinaCMS. haceme las spec con el github kit spec para esto."

**Context**: El proyecto KNDL 000 usa actualmente TinaCMS como admin CMS (`/admin/`), con schema en `tina/config.ts` y build via `@tinacms/cli`. TinaCMS requiere credenciales de Tina Cloud (ClientID + Token, ambos secretos de GitHub), y genera un admin SPA de ~10MB que se sirve desde `/admin/`. El usuario quiere un admin **propio** que:
- No dependa de Tina Cloud (ni de sus secretos, ni de su auth, ni de su CDN).
- Sirva para todas las 11 colecciones del schema actual.
- Sea ligero y se mantenga dentro del free tier de Cloudflare Workers (ideal para 1 commit/día).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editor markdown en /admin/ (Priority: P1) 🎯 MVP

[Como autor del blog, quiero abrir `https://kundala000.com/admin/` en el navegador, ver un editor de markdown con las 11 colecciones, elegir una colección, listar sus documentos, crear uno nuevo o editar uno existente, escribir contenido con preview, y guardar para que se haga commit al repo en `main` (o abra un PR), sin depender de Tina Cloud.]

**Why this priority**: Es la funcionalidad core. Sin editor, no hay CMS. Tiene que ser funcional end-to-end en la primera entrega.

**Independent Test**: En `https://kundala000.com/admin/`, hacer login con GitHub OAuth → elegir "Poemas" → crear nuevo poema "test" con título y body → guardar → aparece un commit en el repo (o PR abierto) con el nuevo archivo `content/collections/_poems/test.md`.

**Acceptance Scenarios**:

1. **Given** visitante llega a `/admin/`, **When** ve la página, **Then** aparece un botón "Login con GitHub" (OAuth) o un input para PAT (Personal Access Token).
2. **Given** usuario autenticado, **When** ve la página, **Then** aparecen las 11 colecciones en una sidebar: Diario, Poemas, Vestigios, Melange Reports, Código, Imágenes, Fragmentos, Dispositivos, Spotify Playlists, YouTube Setlists, Personal Music.
3. **Given** usuario hace click en "Poemas", **When** se lista la colección, **Then** aparecen todos los `*.md` en `content/collections/_poems/` con título y fecha, paginados si hay >20.
4. **Given** usuario hace click en "Nuevo Poema", **When** se abre el editor, **Then** ve un formulario con los campos del schema (title, image, date, body) más un editor markdown con preview live.
5. **Given** usuario edita un poema existente, **When** cambia el body, **Then** ve el preview live del markdown y el diff vs la versión original.
6. **Given** usuario hace click en "Guardar", **When** el backend procesa, **Then** aparece un toast "✓ Guardado, commit abc1234 en main" o "✓ PR #42 abierto" según configuración.
7. **Given** usuario autenticado pero sin permisos de escritura, **When** intenta guardar, **Then** el backend rechaza con error claro y el editor muestra un mensaje accionable.

---

### User Story 2 - Backend serverless en Cloudflare Workers (Priority: P1)

[Como operador del sitio, quiero que el backend que lee/escribe archivos en el repo esté desplegado en Cloudflare Workers (free tier), con secretos de GitHub token configurados en `wrangler secret put`, para no pagar hosting y mantener el SLA global.]

**Why this priority**: Sin backend, el editor no puede hacer nada. Workers es la opción más barata (100k req/día gratis) y más rápida para un CMS con tráfico muy bajo.

**Independent Test**: `wrangler tail` muestra las requests cuando se guarda un documento. El KV de Workers guarda la sesión OAuth. La API de GitHub se llama con el token desde un secret.

**Acceptance Scenarios**:

1. **Given** el worker está desplegado, **When** recibe `POST /api/contents/:collection/:slug` con `{content, message}`, **Then** escribe el archivo via GitHub Contents API y devuelve `{commit_sha, html_url}`.
2. **Given** el worker recibe `GET /api/contents/:collection/:slug`, **When** procesa, **Then** devuelve `{content, sha}` (el sha es para optimistic locking).
3. **Given** el worker recibe `GET /api/contents/:collection`, **When** procesa, **Then** lista los archivos de la carpeta via GitHub Trees API y devuelve `[{slug, title, date}]`.
4. **Given** hay un error de GitHub (rate limit, 404, 409), **When** el worker responde, **Then** propaga el error con código HTTP correcto y mensaje legible al frontend.
5. **Given** el rate limit de GitHub es 5000 req/h con token, **When** el usuario edita mucho, **Then** el worker implementa un cache simple en KV (TTL 60s) para `GET` de listados.

---

### User Story 3 - Autenticación GitHub OAuth o PAT (Priority: P1)

[Como autor, quiero autenticarme contra el repo de GitHub sin depender de Tina Cloud. Las opciones son: (a) OAuth App con callback al worker, (b) Personal Access Token pegado en el formulario.]

**Why this priority**: El CMS debe ser seguro. No exponer el token en el bundle del frontend.

**Independent Test**: Limpiar cookies → entrar a `/admin/` → OAuth redirige a `github.com/login/oauth/...` → autorizar → callback al worker → callback al `/admin/` con cookie de sesión.

**Acceptance Scenarios**:

1. **Given** usuario no autenticado, **When** hace click en "Login con GitHub", **Then** redirige a GitHub OAuth con scopes `repo` y `read:user`.
2. **Given** usuario autorizado en GitHub, **When** el callback llega al worker, **Then** el worker intercambia el code por un access_token, lo guarda en KV con TTL 24h, y redirige a `/admin/?session=<id>`.
3. **Given** sesión válida, **When** el frontend llama al backend, **Then** el worker lee la sesión de KV y la usa para autenticar las llamadas a GitHub.
4. **Given** sesión expirada (TTL 24h), **When** el frontend llama al backend, **Then** el worker responde 401 y el frontend redirige a login.
5. **Given** la opción PAT (alternativa), **When** usuario pega el token, **Then** se guarda en `sessionStorage` (no localStorage) y se envía en cada request; nunca se persiste en el backend.

---

### User Story 4 - Cubrir las 11 colecciones del schema Tina actual (Priority: P2)

[Como autor, quiero poder editar cualquiera de las 11 colecciones (diario, poemas, vestigios, melange_reports, codigos, imagenes, fragmentos, dispositivos, spotify_playlists, youtube_setlists, personal_music) con sus campos específicos.]

**Why this priority**: Es el alcance completo. La opción por defecto (MVP) podría ser 2-3 colecciones; el usuario pidió las 11.

**Independent Test**: Para cada una de las 11 colecciones, el editor debe reconocer los campos del schema y permitir crear/editar/eliminar.

**Acceptance Scenarios**:

1. **Given** schema Tina en `tina/config.ts`, **When** se construye el editor, **Then** se parsea el schema y se generan los formularios para cada colección.
2. **Given** una colección con campo `rich-text` (body), **When** se edita, **Then** se muestra un editor markdown con preview.
3. **Given** una colección con campo `image`, **When** se edita, **Then** se muestra un input de URL o un selector de archivos (los assets en `assets/media/images/`).
4. **Given** una colección con `datetime` (date), **When** se edita, **Then** se muestra un input `<input type="datetime-local">`.
5. **Given** una colección con `string` con `options: [...]` (enum), **When** se edita, **Then** se muestra un `<select>` con las opciones.
6. **Given** una colección con `object` (nested), **When** se edita, **Then** se muestra un grupo de campos anidados.
7. **Given** una colección con `list` (array), **When** se edita, **Then** se muestran filas repetibles con botón "Añadir" / "Eliminar".

---

### User Story 5 - Migración desde TinaCMS (Priority: P2)

[Como operador, una vez el CMS propio funcione, quiero poder quitar TinaCMS: desinstalar `@tinacms/cli`, eliminar `tina/`, eliminar el build de Tina del workflow CI, eliminar la config en `_config.yml` y el `include: - admin` (si ya no se necesita), y actualizar README.]

**Why this priority**: Limpieza final. Sin esto, el proyecto arrastra ambas dependencias.

**Independent Test**: `npm ls tinacms` no devuelve nada. `grep -r tinacms .` solo aparece en el README histórico (si se mantiene) o en el commit message del cambio.

**Acceptance Scenarios**:

1. **Given** el CMS propio está desplegado y funcional, **When** se quita Tina, **Then** el sitio sigue construyendo y desplegando sin errores.
2. **Given** `package.json` limpio, **When** se hace `npm install` desde cero, **Then** no se instala Tina.
3. **Given** el CI actualizado, **When** se hace push, **Then** no se ejecuta el build de Tina.
4. **Given** el `admin/index.html` real generado por el CMS propio, **When** se sirve, **Then** funciona en `/admin/`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El editor MUST servir en `/admin/` del sitio Jekyll (mismo path que Tina tenía).
- **FR-002**: El editor MUST autenticar contra GitHub (OAuth o PAT), no contra Tina Cloud ni ningún servicio externo de auth.
- **FR-003**: El editor MUST soportar las 11 colecciones del schema actual.
- **FR-004**: El editor MUST permitir listar, crear, editar y eliminar documentos de cada colección.
- **FR-005**: El editor MUST mostrar un preview live del markdown mientras se escribe.
- **FR-006**: El editor MUST guardar via GitHub Contents API (PUT `/repos/:owner/:repo/contents/:path`).
- **FR-007**: El editor MUST mostrar mensajes de error claros (rate limit, 404, 409 conflict, sin permisos).
- **FR-008**: El editor MUST NO persistir tokens en `localStorage` (usar `sessionStorage` o cookies httpOnly del worker).
- **FR-009**: El backend MUST ser un Cloudflare Worker (free tier).
- **FR-010**: El backend MUST leer/escribir via GitHub API con un token de un `wrangler secret`.
- **FR-011**: El backend MUST manejar rate limiting de GitHub con cache en KV (TTL 60s para listados).
- **FR-012**: El backend MUST devolver CORS headers correctos para el origen del sitio.
- **FR-013**: El frontend MUST ser un SPA estático (<300 KB idealmente) que se sirve desde `/admin/`.
- **FR-014**: La migración MUST eliminar `tinacms` de `package.json`, `tina/`, y el build de Tina del workflow.

### Key Entities *(include if feature involves data)*

- **Editor (frontend)**: SPA en `/admin/` con login, sidebar de colecciones, lista, formulario de edición con preview.
- **Worker (backend)**: Cloudflare Worker con rutas `/api/auth/*`, `/api/contents/*`, `/api/schema`.
- **Schema (parser)**: lógica que parsea `tina/config.ts` y genera los formularios. **OJO**: este spec se construye ANTES de eliminar Tina, así que el schema se mantiene. Tras la migración, se convierte a un formato JSON propio.
- **Session store**: KV namespace de Workers con sesiones OAuth (TTL 24h).
- **GitHub client**: helper que envuelve la GitHub REST API (Contents, Trees, Commits).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El editor se carga en `/admin/` y permite login con GitHub OAuth o PAT.
- **SC-002**: El editor lista correctamente los documentos de las 11 colecciones desde el repo real.
- **SC-003**: Crear un documento nuevo y guardarlo produce un commit (o PR) visible en `https://github.com/hugomoraga/kndl000/commits/main`.
- **SC-004**: Editar y guardar un documento existente actualiza el `sha` y produce un commit nuevo.
- **SC-005**: Eliminar un documento (botón Delete) pide confirmación y luego lo borra via API.
- **SC-006**: El worker maneja 100 requests en menos de 5s sin errores (test manual con `wrangler dev`).
- **SC-007**: La migración deja `npm ls tinacms` vacío y `grep -r tinacms .` sin matches.
- **SC-008**: Lighthouse score del editor en `/admin/` ≥90 (es un admin, no necesita SEO pero sí performance).

## Assumptions

- El usuario ya tiene una GitHub OAuth App creada (o la creará). El callback URL será `https://admin.kundala000.com/callback` o `https://kundala000.com/admin/callback` (un subdominio o ruta del worker).
- El usuario tiene un Cloudflare account con un Worker habilitado y acceso a KV (incluido en free tier).
- El usuario acepta tener 2 deploys: (a) el sitio Jekyll en GitHub Pages, (b) el worker en Cloudflare. Ambos con secretos separados.
- El CMS propio se construye con HTML/CSS/JS vanilla o un framework ligero (preferiblemente **sin build step**, o build mínimo con esbuild/rollup local, sin npm runtime en producción). Alternativamente, **Sveltia CMS** (fork moderno de Decap CMS) es una opción drop-in que se sirve como bundle estático desde `/admin/` y se conecta a GitHub directamente — sin backend propio. Esta es la opción más simple si se relaja "backend en Workers".
- La colección `_dispositivos` requiere "config" además de frontmatter; ese caso se cubre con un campo `object` nested.
- Las imágenes se suben a `assets/media/images/` vía GitHub API (PUT file). Máximo 25MB por archivo (límite de Contents API en archivos >1MB via blob; usar uploadit en su lugar si se sube imágenes grandes).
- El editor NO reemplaza el contenido de un archivo si el `sha` no coincide (optimistic locking, evita pisar commits concurrentes).
- El worker NO ejecuta builds de Jekyll; solo escribe archivos y deja que el CI de GitHub Actions despliegue.

## Out of Scope

- Preview en vivo del sitio renderizado (requeriría build de Jekyll en cada save; costoso).
- Comentarios / colaboración en tiempo real (tipo Google Docs).
- Workflows de aprobación multi-usuario (PRs se abren pero no se requiere review).
- Soporte de medios grandes (videos, audio). Solo imágenes.
- Internacionalización del editor.
- Tematización del editor.
