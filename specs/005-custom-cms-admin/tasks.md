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
- **Auth**: PAT de GitHub guardado en `sessionStorage` del navegador
- **API**: GitHub REST API (sin backend propio)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Decisiones de stack antes de empezar

- [ ] T001 Stack elegido: **Sveltia CMS** (drop-in, sin build, sin backend). Justificación: 1 autor, 1 commit/día, no se justifica infraestructura extra.
- [ ] T002 Auth elegida: **Personal Access Token (PAT)** con scope `repo`. El usuario genera el token en `github.com/settings/tokens/new` y lo pega en el login.
- [ ] T003 Flow de guardado: **commits directos a `main`** (es 1 autor, no se necesita PR review).
- [ ] T004 Generar el PAT con scope `repo` y guardarlo en un lugar seguro (1Password, Bitwarden, etc.). NO commitearlo al repo.
- [ ] T005 Verificar que `package.json` actual tiene `@tinacms/cli` y `tina/` aún presentes (para iterar antes de migrar).

**Checkpoint**: Stack, auth y PAT listos.

---

## Phase 2: User Story 1 + 3 - Editor Sveltia con auth PAT (Priority: P1) 🎯 MVP

**Purpose**: Editor funcional en `/admin/` con login PAT y soporte para las 11 colecciones.

**Stack**: Sveltia CMS drop-in. Sin build step runtime, sin backend.

### Instalación de Sveltia

- [ ] T010 [US1] Instalar Sveltia CMS como devDep: `npm install --save-dev sveltia-cms` (en `package.json`)
- [ ] T011 [US1] Verificar la versión actual de Sveltia CMS y descargar su `dist/` (HTML + JS + assets) a `admin/` (sin commitear `node_modules`)
- [ ] T012 [US1] Crear `admin/config.yml` con la metadata del sitio y la config del backend GitHub

### Backend config (en admin/config.yml)

- [ ] T020 [US1] Configurar `backend.name: github` con `repo: hugomoraga/kndl000`, `branch: main`
- [ ] T021 [US1] Configurar `local_backend: false` (producción) y `media_folder: assets/media/images`, `public_folder: /assets/media/images`
- [ ] T022 [US1] Configurar `publish_mode: simple` (commits directos, no PR)
- [ ] T023 [US1] Configurar las 11 colecciones con sus campos (basado en `tina/config.ts`). Ver Phase 3 para detalle.

### Build e integración con Jekyll

- [ ] T030 [P] [US1] Verificar que `admin/index.html` y `admin/config.yml` se incluyen en el build de Jekyll (revisar `include:` en `_config.yml` y `_config.yml: include: - admin` ya existe)
- [ ] T031 [P] [US1] Verificar que `admin/.gitignore` no excluye los archivos de Sveltia
- [ ] T032 [US1] Verificar que `robots.txt` excluye `/admin/` del crawl (revisar si ya está)

### Verificación

- [ ] T040 [US1] `bundle exec jekyll build` produce `_site/admin/index.html` con Sveltia
- [ ] T041 [US1] `bundle exec jekyll serve` y abrir `http://localhost:4000/admin/` → ve el login
- [ ] T042 [US1] Pegar PAT → editor carga las 11 colecciones
- [ ] T043 [US1] Click en "Poemas" → lista los 3 poemas actuales
- [ ] T044 [US1] Editar un poema → guardar → commit aparece en `origin/main` → Jekyll rebuild → sitio actualizado
- [ ] T045 [US1] Crear un poema nuevo → guardar → archivo en `content/collections/_poems/`
- [ ] T046 [US1] Borrar un poema → commit de borrado

**Checkpoint**: MVP funcional end-to-end.

---

## Phase 3: User Story 4 - 11 colecciones (Priority: P2)

**Purpose**: Schema completo en `admin/config.yml`

- [ ] T050 [P] [US4] Diario (`_posts`): title, layout, image, body, date
- [ ] T051 [P] [US4] Poemas (`_poems`): title, image, date, body
- [ ] T052 [P] [US4] Vestigios (`_vestigios`): title, image, date, body
- [ ] T053 [P] [US4] Melange Reports (`_melange_reports`): title, image, date, body, wip
- [ ] T054 [P] [US4] Código (`_codigos`): title, language, body, image
- [ ] T055 [P] [US4] Imágenes (`_images`): title, image, date, body
- [ ] T056 [P] [US4] Fragmentos (`_fragmentos`): title, lineas (list of objects)
- [ ] T057 [P] [US4] Dispositivos (`_dispositivos`): title, brand, model, description, image, body
- [ ] T058 [P] [US4] Spotify Playlists (`_spotify_playlists`): title, url, image
- [ ] T059 [P] [US4] YouTube Setlists (`_youtube_setlists`): title, url, image
- [ ] T060 [P] [US4] Personal Music (`_personal_music`): title, artist, album, year, image

**Checkpoint**: Las 11 colecciones son editables.

---
- [ ] T087 [P] [US4] Dispositivos (`_dispositivos`): title, brand, model, description, image, body
- [ ] T088 [P] [US4] Spotify Playlists (`_spotify_playlists`): title, url, image
- [ ] T089 [P] [US4] YouTube Setlists (`_youtube_setlists`): title, url, image
- [ ] T090 [P] [US4] Personal Music (`_personal_music`): title, artist, album, year, image

**Checkpoint**: Las 11 colecciones son editables.

---

## Phase 4: User Story 5 - Migración desde TinaCMS (Priority: P2)

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

## Phase 5: Polish

- [ ] T120 [P] Verificar que `ESTRUCTURA.md` se actualiza: añadir `worker/` y `cms/` secciones, quitar `tina/`
- [ ] T121 [P] Documentar en README: deploy del worker, secret setup, troubleshooting
- [ ] T122 Commit y push a main
- [ ] T123 Abrir PR si se quiere revisión

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin deps — bloquea todo
- **Editor + Auth (Phase 2)**: Depende de Setup. Incluye US1 (editor) + US3 (auth PAT).
- **11 colecciones (Phase 3)**: Depende de Phase 2 (el editor debe estar cargado y el config.yml base listo).
- **Migración Tina (Phase 4)**: Depende de Phase 3 (el editor funciona con las 11 colecciones).
- **Polish (Phase 5)**: Depende de Phase 4.

### Parallel Opportunities

- Las 11 colecciones del `config.yml` (T050-T060) pueden escribirse en paralelo (archivo único pero secciones independientes).
- La migración (Phase 4) puede empezar en paralelo con la verificación de Phase 3, pero commitea al final.

### Secuencia recomendada

1. **Setup** (T001-T005) — 30 min, principalmente generar el PAT
2. **Editor + Auth** (Phase 2) — 1-2 días: descargar Sveltia, escribir `config.yml` base
3. **11 colecciones** (Phase 3) — 1 día: completar el `config.yml`
4. **Migración Tina** (Phase 4) — 1 día: quitar Tina, actualizar package.json, CI, README
5. **Polish** (Phase 5) — 30 min: actualizar ESTRUCTURA.md, push final

**Total estimado: 3-4 días**.

---

## Implementation Strategy

### MVP

1. Phase 1: Setup (PAT)
2. Phase 2: Sveltia + auth + backend config
3. Phase 3: 11 colecciones
4. Phase 4: Migrar Tina
5. Phase 5: Polish

### Verificación end-to-end

El test definitivo: editar un poema existente desde `/admin/`, guardar, ver el commit en `origin/main`, esperar el CI (~1 min), ver el cambio reflejado en `https://kundala000.com`.

---

## Notes

- **PAT vs OAuth**: PAT es la opción correcta para 1 autor. El token se pega cada vez que se quiere editar (cada vez que se abre `/admin/` y se inicia una nueva sesión de pestaña). Si el día de mañana se quiere multi-autor, se migra a OAuth sin reescribir el editor (Sveltia lo soporta nativamente).
- **El schema Tina en `tina/config.ts`** se mantiene como referencia durante el desarrollo. Una vez validado el `admin/config.yml` de Sveltia, se borra Tina en Phase 4.
- **`_config.yml` de Jekyll** ya tiene `include: - admin` (de cuando Tina servía ahí), así que el bundle de Sveltia se copia automáticamente al build. Solo hay que añadir `admin/config.yml` al control de versiones (Sveltia no lo lee del directorio, lo lee del repo).
- **Lighthouse en `/admin/`** puede ser bajo (es un SPA de admin, no afecta el SEO del sitio público). El sitio público sigue intacto.
- **Free tier**: 0 costo. Sveltia es bundle estático, GitHub API es gratis con PAT (5000 req/h).
- **Si el PAT se compromete** (ej: commiteado por error), se rota inmediatamente en `github.com/settings/tokens` y se actualiza en `/admin/`. El PAT comprometido no daña el repo porque tiene scope solo `repo` (mismo nivel que el owner).
