---
description: "Task list for custom CMS admin (replaces TinaCMS)"
---

# Tasks: CMS Admin Propio

**Input**: Design documents from `/specs/005-custom-cms-admin/`

**Prerequisites**: spec.md (required), Cloudflare account, GitHub OAuth App

**Tests**: Manuales (curl + browser). Sin tests automatizados (es admin, no public site).

**Organization**: Tasks por user story. US1-US3 son P1 (MVP funcional). US4-US5 son P2 (alcance completo + migración).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1-US5

## Path Conventions

- **Frontend (editor)**: `admin/` (servido por Jekyll)
- **Backend (worker)**: `worker/` (deploy aparte via `wrangler`)
- **Schema/parser**: `cms/schema-parser.ts` (compartido)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Decisiones de stack antes de empezar

- [ ] T001 Decidir stack del frontend: (a) **Sveltia CMS drop-in** (más simple, sin build), (b) **editor propio en vanilla JS/TS** (más control), (c) **Decap CMS clásico** (legacy, mantenido). Documentar decisión.
- [ ] T002 Decidir flow de guardado: (a) commits directos a `main`, (b) PRs desde un branch. Documentar.
- [ ] T003 Crear GitHub OAuth App en `github.com/settings/developers` con callback `https://<worker-url>/callback` (si flow OAuth). Guardar CLIENT_ID y CLIENT_SECRET.
- [ ] T004 Crear Cloudflare account + Worker + KV namespace (si backend en Workers).
- [ ] T005 Verificar que `package.json` actual tiene `@tinacms/cli` y `tina/` aún presentes (para iterar antes de migrar).

**Checkpoint**: Stack y credenciales listos.

---

## Phase 2: User Story 1 - Editor markdown en /admin/ (Priority: P1) 🎯 MVP

**Purpose**: SPA funcional en `/admin/`

### Si se elige Sveltia CMS (T001 = a)

- [ ] T010 [P] [US1] Descargar bundle de Sveltia CMS: `npm install sveltia-cms` y copiar `dist/index.html` + assets a `admin/`
- [ ] T011 [US1] Crear `admin/config.yml` con la estructura de las 11 colecciones (basada en `tina/config.ts`)
- [ ] T012 [US1] Configurar `backend.name: github` con `repo: hugomoraga/kndl000`, `branch: main`
- [ ] T013 [US1] Configurar `local_backend: false` (producción) y `media_folder: assets/media/images`
- [ ] T014 [US1] Verificar que `bundle exec jekyll build` copia `admin/config.yml` a `_site/admin/config.yml` (Jekyll no copia archivos sin front matter; revisar `include:` en `_config.yml`)
- [ ] T015 [US1] Probar local: `bundle exec jekyll serve` y abrir `http://localhost:4000/admin/`

### Si se elige editor propio (T001 = b)

- [ ] T020 [US1] Crear `admin/index.html` con sidebar de colecciones + panel de edición
- [ ] T021 [US1] Crear `admin/app.js` con el router (hash-based) y state management
- [ ] T022 [US1] Crear `admin/cms.css` con los estilos del editor (tema oscuro por defecto)
- [ ] T023 [US1] Implementar vista de login: input PAT + botón "Login con GitHub" (link al OAuth start)
- [ ] T024 [US1] Implementar vista de lista: `GET /api/contents/:collection` → render tabla
- [ ] T025 [US1] Implementar vista de edición: form con campos del schema + editor markdown (EasyMDE, CodeMirror o similar) + preview live
- [ ] T026 [US1] Implementar vista de nuevo: misma UI que edición con campos vacíos

**Checkpoint**: Editor cargable y navegable.

---

## Phase 3: User Story 2 - Backend serverless en Cloudflare Workers (Priority: P1)

**Purpose**: API REST que lee/escribe via GitHub

### Setup del worker

- [ ] T030 [US2] Crear `worker/` con `wrangler.toml`, `package.json`, `src/index.ts`
- [ ] T031 [US2] Configurar `wrangler.toml` con `name: kndl-cms`, `main: src/index.ts`, `compatibility_date: 2024-12-01`
- [ ] T032 [US2] Crear KV namespace: `wrangler kv:namespace create SESSIONS` y añadir el ID a `wrangler.toml`
- [ ] T033 [US2] Configurar `GITHUB_TOKEN` como secret: `wrangler secret put GITHUB_TOKEN` (usar un PAT con scope `repo`)
- [ ] T034 [US2] Configurar `GITHUB_REPO` como var de entorno: `wrangler secret put GITHUB_REPO` (valor: `hugomoraga/kndl000`)

### Implementación de rutas

- [ ] T040 [P] [US2] `GET /api/schema` → devuelve el schema parseado (de Tina config o JSON propio)
- [ ] T041 [P] [US2] `GET /api/contents/:collection` → lista archivos via GitHub Trees API, devuelve `[{slug, title, date, sha}]`
- [ ] T042 [P] [US2] `GET /api/contents/:collection/:slug` → lee un archivo via GitHub Contents API, devuelve `{content, sha}`
- [ ] T043 [P] [US2] `PUT /api/contents/:collection/:slug` → escribe/crea un archivo, devuelve `{commit_sha, html_url}`
- [ ] T044 [P] [US2] `DELETE /api/contents/:collection/:slug` → borra un archivo (con confirmación de sha)
- [ ] T045 [US2] Todos los endpoints devuelven CORS headers para `https://kundala000.com` y `http://localhost:4000` (dev)
- [ ] T046 [US2] Implementar cache KV para `GET` de listados (key = `list:${collection}`, TTL 60s)
- [ ] T047 [US2] Manejo de errores: rate limit (403 con `X-RateLimit-Remaining: 0` → 429 al cliente), 404, 409 conflict (sha mismatch)

### OAuth flow (si se eligió OAuth en T001)

- [ ] T050 [US3] `GET /auth/github` → redirige a GitHub OAuth con `client_id`, `redirect_uri`, `scope=repo+read:user`, `state=<random>`
- [ ] T051 [US3] `GET /callback` → intercambia code por access_token via POST a `github.com/login/oauth/access_token`, guarda en KV con key `session:${state}`, TTL 24h, redirige a `/admin/?session=${state}`
- [ ] T052 [US3] Middleware: si request tiene `Authorization: Bearer <session_id>` o cookie `session=<session_id>`, lee el token de KV y lo añade a la llamada a GitHub

### Deploy

- [ ] T060 [US2] `wrangler deploy` → confirma que el worker responde en `https://kndl-cms.<subdomain>.workers.dev`
- [ ] T061 [US2] `curl https://<worker-url>/api/schema` → 200 con JSON
- [ ] T062 [US2] `curl -H "Authorization: Bearer <session>" https://<worker-url>/api/contents/poemas` → 200 con lista

**Checkpoint**: API funcional.

---

## Phase 4: User Story 1 (cont.) - Integración frontend-backend

- [ ] T070 [US1] El editor (sea Sveltia o propio) apunta al worker como `backend.base_url`
- [ ] T071 [US1] Flujo de login: pegar PAT o click "Login GitHub" (redirige a `/auth/github`)
- [ ] T072 [US1] El session ID se guarda en `sessionStorage` y se envía en cada request como `Authorization: Bearer <id>`
- [ ] T073 [US1] Manejo de errores en UI: toast rojo con mensaje del backend
- [ ] T074 [US1] Confirmación antes de borrar (modal o `confirm()`)

---

## Phase 5: User Story 4 - 11 colecciones (Priority: P2)

**Purpose**: Schema completo

- [ ] T080 [P] [US4] Diario (`_posts`): title, layout, image, body, date
- [ ] T081 [P] [US4] Poemas (`_poems`): title, image, date, body
- [ ] T082 [P] [US4] Vestigios (`_vestigios`): title, image, date, body
- [ ] T083 [P] [US4] Melange Reports (`_melange_reports`): title, image, date, body, wip
- [ ] T084 [P] [US4] Código (`_codigos`): title, language, body, image
- [ ] T085 [P] [US4] Imágenes (`_images`): title, image, date, body
- [ ] T086 [P] [US4] Fragmentos (`_fragmentos`): title, lineas (list of objects)
- [ ] T087 [P] [US4] Dispositivos (`_dispositivos`): title, brand, model, description, image, body
- [ ] T088 [P] [US4] Spotify Playlists (`_spotify_playlists`): title, url, image
- [ ] T089 [P] [US4] YouTube Setlists (`_youtube_setlists`): title, url, image
- [ ] T090 [P] [US4] Personal Music (`_personal_music`): title, artist, album, year, image

**Checkpoint**: Las 11 colecciones son editables.

---

## Phase 6: User Story 5 - Migración desde TinaCMS (Priority: P2)

**Purpose**: Limpiar Tina del proyecto

- [ ] T100 [US5] Backup de `tina/config.ts` → `cms/schema.json` (snapshot de la estructura de las 11 colecciones)
- [ ] T101 [US5] Confirmar que el editor lee `cms/schema.json` o `tina/config.ts` parseado (no necesita ambos)
- [ ] T102 [US5] Eliminar `tina/` del repo
- [ ] T103 [US5] Editar `package.json`: quitar `@tinacms/cli`, cambiar script `dev` y `build` (eliminar `tinacms dev`, `tinacms build`)
- [ ] T104 [US5] Regenerar `package-lock.json`
- [ ] T105 [US5] Editar `.github/workflows/jekyll.yml`: quitar el step `Build Tina CMS admin` y el `if: steps.changes.outputs.admin == 'true'`
- [ ] T106 [US5] Editar `.github/workflows/jekyll.yml`: añadir el `path-filter` para detectar cambios en `admin/config.yml` o schema (rebuild admin)
- [ ] T107 [US5] Verificar `_config.yml` no tiene referencias a Tina
- [ ] T108 [US5] Actualizar `README.md`: quitar la sección Tina CMS, añadir la sección del nuevo CMS
- [ ] T109 [US5] Verificar `npm install` desde cero funciona sin Tina
- [ ] T110 [US5] Push a main y verificar deploy

**Checkpoint**: Tina eliminada, proyecto más simple.

---

## Phase 7: Polish

- [ ] T120 [P] Verificar que `ESTRUCTURA.md` se actualiza: añadir `worker/` y `cms/` secciones, quitar `tina/`
- [ ] T121 [P] Documentar en README: deploy del worker, secret setup, troubleshooting
- [ ] T122 Commit y push a main
- [ ] T123 Abrir PR si se quiere revisión

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin deps — bloquea todo
- **US1 (Phase 2)**: Depende de Setup
- **US2 (Phase 3)**: Depende de Setup
- **US1 integración (Phase 4)**: Depende de US1 (frontend) + US2 (backend) + US3 (auth)
- **US4 (Phase 5)**: Depende de US1+US2 (necesita editor + backend funcionales)
- **US5 (Phase 6)**: Depende de US4 (migrar solo si el editor ya funciona con todas las colecciones)
- **Polish (Phase 7)**: Depende de US5

### Parallel Opportunities

- US2 (worker) y US3 (auth) pueden ir en paralelo
- US4 (11 colecciones) puede ir por fases: 3 colecciones primero (Diario, Poemas, Vestigios), luego las 8 restantes
- Si T001 = Sveltia CMS, US1 + US2 + US3 son mucho más simples (1-2 días vs 2-3 semanas)

### Secuencia recomendada

1. **Setup** (T001-T005) — 1 día, principalmente credenciales
2. **Decisión Sveltia vs propio** (T001) — si Sveltia: salta a Phase 2-a; si propio: Phase 2-b
3. **Worker + auth** (Phase 3) — 2-3 días para el worker, 1 día para OAuth
4. **Frontend + integración** (Phase 2 + 4) — 3-5 días
5. **11 colecciones** (Phase 5) — 1-2 días
6. **Migración** (Phase 6) — 1 día
7. **Polish** (Phase 7) — 1 día

**Total estimado**: 1-2 semanas (Sveltia) o 3-4 semanas (editor propio)

---

## Implementation Strategy

### MVP (Sveltia CMS)

Si T001 = Sveltia CMS:

1. Phase 1: Setup + decisión
2. Phase 2-a: Descargar Sveltia + escribir `config.yml`
3. Phase 3: NO necesario (Sveltia habla GitHub directo)
4. Phase 4: NO necesario
5. Phase 5: Las 11 colecciones van en el `config.yml`
6. Phase 6: Migración Tina
7. Phase 7: Polish

**Total: 3-4 días**. Esta es la opción recomendada.

### MVP (editor propio)

1. Phase 1: Setup
2. Phase 2-b: Frontend (3-5 días)
3. Phase 3: Worker (2-3 días)
4. Phase 4: Integración (1-2 días)
5. Phase 5: Schema completo (1-2 días)
6. Phase 6: Migración (1 día)
7. Phase 7: Polish (1 día)

**Total: 2-3 semanas**.

### Decisión recomendada

**Sveltia CMS** es la opción pragmática:
- Es un fork mantenido de Decap CMS, sin la deuda técnica de Decap.
- Se sirve como bundle estático en `/admin/`, no necesita build runtime.
- Habla GitHub API directamente, sin backend.
- El "auth" es GitHub OAuth o PAT — lo que el usuario prefiera.
- Tiene UI pulida, soporta Markdown + front matter + preview live + uploads.

Si el usuario quiere control total y un worker separado, la opción 2 (editor propio + Worker) es legítima pero más costosa en tiempo.

---

## Notes

- El schema Tina en `tina/config.ts` puede ser la fuente de verdad durante el desarrollo; tras la migración, se convierte a un JSON propio (`cms/schema.json`).
- Si T001 = Sveltia CMS, el `config.yml` se genera manualmente basándose en `tina/config.ts` (estructura similar, sintaxis YAML).
- Los secretos del worker se configuran con `wrangler secret put`, NO en el código.
- El frontend del admin puede tener su propio `_config.yml` overrides o vivir como una excepción en el `_config.yml` principal con `include: - admin`.
- Lighthouse en `/admin/` puede ser bajo (es un SPA de admin, no afecta el SEO del sitio público). El sitio público sigue intacto.
- Cloudflare Workers free tier: 100k req/día, 10ms CPU/request. Un CMS con 1 commit/día = ~30 req/día = 0.03% del límite. **Cobro cero garantizado** en este uso.
