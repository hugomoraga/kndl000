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

### User Story 3 - Autenticación con Personal Access Token (Priority: P1)

[Como único autor del blog, quiero autenticarme en `/admin/` pegando mi Personal Access Token (PAT) de GitHub con scope `repo`, que se guarda en `sessionStorage` y se envía en cada request como `Authorization: Bearer <token>`, sin necesidad de OAuth Apps, workers, ni infraestructura extra.]

**Why this priority**: Es la decisión de auth. Para un solo autor con 1 commit/día, PAT es la opción más simple: 0 infraestructura (sin OAuth App, sin Cloudflare Worker, sin callback URL), 0 mantenimiento, y el token solo vive en `sessionStorage` (se borra al cerrar la pestaña).

**Independent Test**: Limpiar `sessionStorage` → entrar a `/admin/` → aparece formulario con input "GitHub Personal Access Token" y link a `github.com/settings/tokens/new?scopes=repo&description=KNDL+CMS` → pegar PAT → el editor carga la lista de colecciones.

**Acceptance Scenarios**:

1. **Given** usuario no autenticado, **When** entra a `/admin/`, **Then** aparece un formulario con: (a) input de PAT (type="password"), (b) link a GitHub para generar un token nuevo, (c) botón "Guardar y entrar".
2. **Given** usuario pega un PAT, **When** hace click en "Guardar y entrar", **Then** el editor valida el token haciendo `GET https://api.github.com/user` con `Authorization: Bearer <token>`.
3. **Given** token válido (200), **When** se valida, **Then** se guarda en `sessionStorage` bajo la key `kndl-cms-pat` y se redirige a la vista principal del editor.
4. **Given** token inválido (401), **When** se valida, **Then** aparece un error claro: "Token inválido. Verifica que tenga scope `repo` y que no haya expirado."
5. **Given** token guardado, **When** el usuario cierra y reabre la pestaña, **Then** el token ya no está (sessionStorage se limpia al cerrar la pestaña).
6. **Given** token guardado, **When** el usuario navega a otra pestaña y vuelve, **Then** el token sigue (mientras sea la misma sesión de la pestaña).
7. **Given** usuario quiere cerrar sesión, **When** hace click en "Logout", **Then** se limpia `sessionStorage.kndl-cms-pat` y se vuelve al formulario de login.
8. **Given** cualquier request a la API de GitHub, **When** se hace, **Then** el header `Authorization: Bearer <token>` se añade automáticamente desde sessionStorage.
9. **Given** rate limit de GitHub (5000 req/h con token), **When** el usuario edita mucho, **Then** un contador visible muestra "Quedan X requests" basado en `X-RateLimit-Remaining`.

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
- **FR-002**: El editor MUST autenticar usando un Personal Access Token (PAT) de GitHub con scope `repo`, guardado en `sessionStorage` bajo la key `kndl-cms-pat`.
- **FR-003**: El editor MUST soportar las 11 colecciones del schema actual.
- **FR-004**: El editor MUST permitir listar, crear, editar y eliminar documentos de cada colección.
- **FR-005**: El editor MUST mostrar un preview live del markdown mientras se escribe.
- **FR-006**: El editor MUST guardar via GitHub Contents API (PUT `/repos/:owner/:repo/contents/:path`) con `Authorization: Bearer <token>`.
- **FR-007**: El editor MUST mostrar mensajes de error claros (rate limit, 404, 409 conflict, sin permisos).
- **FR-008**: El editor MUST NO persistir el token en `localStorage` ni en cookies persistentes. Solo `sessionStorage` (se borra al cerrar pestaña).
- **FR-009**: El backend MUST ser un Cloudflare Worker (free tier).
- **FR-010**: El backend MUST leer/escribir via GitHub API con un token de un `wrangler secret`.
- **FR-011**: El backend MUST manejar rate limiting de GitHub con cache en KV (TTL 60s para listados).
- **FR-012**: El backend MUST devolver CORS headers correctos para el origen del sitio.
- **FR-013**: El frontend MUST ser un SPA estático (<300 KB idealmente) que se sirve desde `/admin/`.
- **FR-014**: La migración MUST eliminar `tinacms` de `package.json`, `tina/`, y el build de Tina del workflow.

### Key Entities *(include if feature involves data)*

- **Editor (frontend)**: SPA en `/admin/` con login por PAT, sidebar de colecciones, lista, formulario de edición con preview.
- **GitHub client**: helper en el frontend que envuelve la GitHub REST API (Contents, Trees, Commits) y añade automáticamente el header `Authorization: Bearer <pat>`.
- **Schema (parser)**: lógica que parsea `tina/config.ts` (o un `cms/schema.json` propio) y genera los formularios. Mientras Tina esté presente, parsea el `.ts`; tras la migración, usa el JSON.
- **PAT session**: string en `sessionStorage.kndl-cms-pat`, validado contra `GET /user` al login, limpiado al logout o al cerrar pestaña.

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

- **Decisión de auth: PAT** (Personal Access Token). Sin OAuth App, sin Cloudflare Worker, sin callback URL. El usuario genera un PAT con scope `repo` en `github.com/settings/tokens/new` y lo pega en el formulario de login.
- El CMS se sirve como bundle estático en `/admin/` del sitio Jekyll. Sin backend propio: el frontend habla directo con la API de GitHub usando el PAT.
- El PAT se guarda en `sessionStorage` (clave `kndl-cms-pat`), se envía en cada request como `Authorization: Bearer <token>`, y se borra al cerrar la pestaña o al hacer logout.
- La opción "stack" es **Sveltia CMS** (fork moderno de Decap CMS, sin deuda técnica, se sirve como bundle estático). Justificación: para un solo autor con 1 commit/día, Sveltia cubre 100% del caso de uso sin código propio.
- La colección `_dispositivos` requiere "config" además de frontmatter; ese caso se cubre con un campo `object` nested.
- Las imágenes se suben a `assets/media/images/` vía GitHub Contents API (PUT file). Máximo 25MB por archivo (límite de Contents API en archivos >1MB via blob; usar uploadit en su lugar si se sube imágenes grandes).
- El editor NO reemplaza el contenido de un archivo si el `sha` no coincide (optimistic locking, evita pisar commits concurrentes).
- El CMS NO ejecuta builds de Jekyll; solo escribe archivos y deja que el CI de GitHub Actions despliegue.
- **NO hay Cloudflare Worker** (decisión por simplicidad: PAT en frontend es suficiente para 1 autor). Si en el futuro se quiere multi-autor, se migra a OAuth.

## Out of Scope

- Preview en vivo del sitio renderizado (requeriría build de Jekyll en cada save; costoso).
- Comentarios / colaboración en tiempo real (tipo Google Docs).
- Workflows de aprobación multi-usuario (PRs se abren pero no se requiere review).
- Soporte de medios grandes (videos, audio). Solo imágenes.
- Internacionalización del editor.
- Tematización del editor.
- Multi-autor con OAuth / cuentas individuales (cubierto por PAT único, suficiente para 1 autor).
