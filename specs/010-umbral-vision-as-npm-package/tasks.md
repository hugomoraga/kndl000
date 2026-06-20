---
description: "Task list for umbral-vision-as-npm-package"
---

# Tasks: Umbral Vision como submódulo y paquete npm

**Input**: Design documents from `/specs/010-umbral-vision-as-npm-package/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, contracts/exports.md
**Tests**: Smoke test mínimo (vitest + jsdom) en el repo nuevo; sin tests automatizados en `kndl000` (la verificación es el build de Jekyll + render manual del `/visual/generator/`).
**Organization**: Tasks agrupadas por user story para entrega incremental independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2, US3, US4
- Rutas exactas en la descripción

## Path Conventions

- **Repo nuevo `hugomoraga/umbral-vision`**: `src/`, `dist/`, `tests/`, `examples/`, `scripts/`, `.github/workflows/`
- **Repo `kndl000`**: raíz Jekyll, `assets/js/umbral-vision/` (gitlink), `package.json`, `.gitmodules`, `.github/workflows/jekyll.yml`
- Paths mostrados son relativos al root de cada repo (cuando aplica, se aclara)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Sentar las bases administrativas (cuenta npm, scope, secrets) y crear el repo nuevo vacío.

- [ ] T001 Verificar que la cuenta `hugomoraga` en npmjs.com existe y tiene 2FA activo
- [ ] T002 Verificar/crear el scope `@hugomoraga` en npmjs.com (Settings → Organizations → create scope `@hugomoraga`)
- [ ] T003 Crear repo `hugomoraga/umbral-vision` en GitHub con `gh repo create hugomoraga/umbral-vision --public --description "Framework modular para generación de visuales psicodélicos con p5.js"` (sin README/LICENSE/.gitignore default para empezar limpio)
- [ ] T004 Agregar secret `NPM_TOKEN` en el repo nuevo (Settings → Secrets → Actions); el token debe tener scope `Automation` y ser publish-only para `@hugomoraga`
- [ ] T005 Crear rama de trabajo `010-umbral-vision-as-npm-package` desde `main` en `kndl000`

**Checkpoint**: Repo destino + scope + token + rama listos. Proceder a US1.

---

## Phase 2: User Story 1 - Repositorio independiente con historia limpia (Priority: P1) 🎯 MVP

**Goal**: Extraer `assets/js/umbral-vision/` de `kndl000` a `hugomoraga/umbral-vision` con historia preservada.

**Independent Test**: `git clone https://github.com/hugomoraga/umbral-vision && cd umbral-vision && git log --oneline` muestra historia coherente (≥1 commit por cambio significativo). `git tag -l` incluye `v0.1.0`.

### Implementation for User Story 1

- [ ] T006 [US1] En `kndl000`, crear rama temporal con `git subtree split -P assets/js/umbral-vision -b umbral-vision-split` (no modifica el árbol, sólo genera rama)
- [ ] T007 [US1] Push de la rama al repo nuevo: `git push https://github.com/hugomoraga/umbral-vision.git umbral-vision-split:main --force` (forzamos porque el repo nuevo está vacío)
- [ ] T008 [US1] Crear tag `v0.1.0` en el repo nuevo apuntando a `main`: `git tag -a v0.1.0 -m "v0.1.0: initial split from kndl000"`
- [ ] T009 [US1] Push del tag: `git push hugomoraga/umbral-vision v0.1.0`
- [ ] T010 [US1] Verificar clone limpio: `rm -rf /tmp/uv && git clone https://github.com/hugomoraga/umbral-vision /tmp/uv && cd /tmp/uv && ls -la` — debe mostrar los 7 archivos JS + README, sin dependencias de `kndl000`
- [ ] T011 [US1] Verificar historia: `git log --oneline --stat | head -50` — debe mostrar los commits originales de esos archivos

**Checkpoint**: Repo nuevo con código + historia + tag `v0.1.0`. kndl000 intacto todavía.

---

## Phase 3: User Story 2 - Paquete npm `@hugomoraga/umbral-vision` (Priority: P1) 🎯 MVP

**Goal**: Configurar el repo nuevo como paquete npm publicable, con bundler, lint, smoke test, y publicación inicial.

**Independent Test**: `npm view @hugomoraga/umbral-vision` retorna metadata válida. `npm pack` produce un tarball con `dist/index.mjs`, `dist/index.cjs`, `package.json`, `README.md`, `LICENSE`.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Crear `LICENSE` (MIT) en repo nuevo: contenido estándar, copyright `Copyright (c) 2026 hugomoraga`
- [ ] T013 [P] [US2] Crear `README.md` en repo nuevo: secciones Install (`npm i @hugomoraga/umbral-vision`), Usage (mínimo ejemplo HTML+JS), API (tabla de exports), Peer Dependencies (`p5`), Browser support, License
- [ ] T014 [P] [US2] Crear `CHANGELOG.md` (formato Keep a Changelog): sección `## [0.1.0] - 2026-06-20` con bullet `Initial extraction from hugomoraga/kndl000 (assets/js/umbral-vision/)`
- [ ] T015 [US2] Crear `package.json` con campos: `name: "@hugomoraga/umbral-vision"`, `version: "0.1.0"`, `description`, `type: "module"`, `main: "./dist/index.cjs"`, `module: "./dist/index.mjs"`, `exports` (ver `contracts/exports.md`), `files: ["dist", "src", "README.md", "LICENSE", "CHANGELOG.md"]`, `peerDependencies: { "p5": "^1.0.0 || ^2.0.0" }`, `keywords: ["p5js", "visuals", "generative", "psychedelic", "audio-reactive"]`, `license: "MIT"`, `repository: { type: "git", url: "git+https://github.com/hugomoraga/umbral-vision.git" }`, `bugs: { url: "https://github.com/hugomoraga/umbral-vision/issues" }`, `homepage: "https://github.com/hugomoraga/umbral-vision#readme"`, `engines: { node: ">=18" }`, `publishConfig: { access: "public", provenance: true }`
- [ ] T016 [P] [US2] Crear `src/` con los 7 archivos migrados (mantener nombres originales por ahora: `Effects.js`, `Visualizer.js`, `AudioReactive.js`, `Transition.js`, `Utils.js`, `index.js`, `app.js`); renombrar a `.js` lowercase en commit posterior si se prefiere (no es P1)
- [ ] T017 [US2] Crear `scripts/build.mjs` que use esbuild para generar `dist/index.mjs` (entry: `src/index.js`, format: `esm`, sourcemap) y `dist/index.cjs` (entry: `src/index.js`, format: `cjs`, sourcemap, platform: `neutral`)
- [ ] T018 [US2] Agregar script `"build": "node scripts/build.mjs"` en `package.json`
- [ ] T019 [P] [US2] Crear `esbuild.config.mjs` plano (10 líneas, sólo entry points + outdir + sourcemap) — **ponytail**: deliberadamente sin tree-shaking custom, sin plugins, sin splitting
- [ ] T020 [US2] Instalar devDependencies: `npm install -D esbuild vitest eslint @vitest/ui jsdom`
- [ ] T021 [P] [US2] Crear `eslint.config.mjs` flat config con reglas: `no-unused-vars: warn`, `no-undef: error`, `eqeqeq: error`, `prefer-const: error`, `no-var: error`; ignorar `dist/` y `node_modules/`
- [ ] T022 [P] [US2] Agregar script `"lint": "eslint src/ scripts/ tests/"` en `package.json`
- [ ] T023 [US2] Crear `tests/smoke.test.js` (vitest) que: (a) importa el bundle ESM, (b) verifica que los exports nombrados existen (`startVisualizer`, `changeEffect`, `initAudio`, `stopAudio`, `Effects`, etc.), (c) ejecuta `Effects.tunnel({ background: () => {}, noFill: () => {}, stroke: () => {} })` y llama `.draw()` esperando que no lance
- [ ] T024 [P] [US2] Crear `vitest.config.mjs` plano: `environment: 'jsdom'`, `include: ['tests/**/*.test.js']`
- [ ] T025 [US2] Agregar scripts `"test": "vitest run"` y `"test:watch": "vitest"` en `package.json`
- [ ] T026 [US2] Crear `.gitignore`: `node_modules/`, `dist/`, `*.log`, `.DS_Store`, `coverage/`
- [ ] T027 [US2] Correr localmente: `npm ci && npm run lint && npm test && npm run build` — todo verde
- [ ] T028 [US2] Verificar tarball: `npm pack` produce `hugomoraga-umbral-vision-0.1.0.tgz`; `tar -tzf` lista `dist/index.mjs`, `dist/index.cjs`, `package/`, `README.md`, `LICENSE`
- [ ] T029 [US2] Publicar: `npm publish --access public` (preferentemente vía CI workflow, ver US4; pero el primer publish puede ser manual)
- [ ] T030 [US2] Verificar publicación: `npm view @hugomoraga/umbral-vision version` retorna `0.1.0`; `npm view @hugomoraga/umbral-vision` muestra el README renderizado

**Checkpoint**: Paquete público instalable. `npm install @hugomoraga/umbral-vision` funciona desde registry.

---

## Phase 4: User Story 4 - Build reproducible y CI por repo (Priority: P2)

**Goal**: Workflow de GitHub Actions que valida lint, test y build en matriz de Node, y permite release al pushear tags.

**Independent Test**: Push a `main` (o PR) dispara workflow verde; push de tag `v*` produce release.

### Implementation for User Story 4

- [ ] T031 [P] [US4] Crear `.github/workflows/ci.yml` con: `on: [push, pull_request]`, matriz `node-version: [18, 20, 22]`, pasos `actions/checkout@v4`, `actions/setup-node@v4` con cache npm, `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm pack --dry-run`
- [ ] T032 [P] [US4] Crear `.github/workflows/release.yml` con: `on: push: tags: ['v*']`, jobs `publish` con environment `production` y `npm publish --provenance --access public` usando secret `NPM_TOKEN`; gate opcional con `production` GitHub Environment + required reviewers
- [ ] T033 [US4] Commitear workflows, push a `main`, verificar badge verde en README
- [ ] T034 [US4] Crear PR de prueba para verificar que `ci.yml` corre en PR
- [ ] T035 [US4] (Opcional) Testear release: bump `0.1.0` → `0.1.1` con un commit trivial, tag `v0.1.1`, push tag, verificar que `release.yml` publica `0.1.1`

**Checkpoint**: CI verde + release workflow funcional.

---

## Phase 5: User Story 3 - kndl000 consume el paquete (Priority: P1) 🎯 MVP

**Goal**: Reemplazar `assets/js/umbral-vision/` tracked por un git submodule pinned a `v0.1.0`, agregar dependencia npm, actualizar workflow.

**Independent Test**: `kndl000` clone fresco + `git submodule update --init --recursive` + `npm ci` + `bundle exec jekyll build` produce sitio cuyo `/visual/generator/` funciona.

### Implementation for User Story 3

- [ ] T036 [US3] En `kndl000`, agregar submodule: `git submodule add https://github.com/hugomoraga/umbral-vision assets/js/umbral-vision`
- [ ] T037 [US3] Pinear a tag: `cd assets/js/umbral-vision && git checkout v0.1.0 && cd ../..`
- [ ] T038 [US3] Commitear el gitlink: `git add .gitmodules assets/js/umbral-vision && git commit -m "feat: track umbral-vision as git submodule pinned to v0.1.0"`
- [ ] T039 [P] [US3] Editar `kndl000/package.json`: agregar `"@hugomoraga/umbral-vision": "^0.1.0"` en `dependencies`
- [ ] T040 [P] [US3] Actualizar `assets/js/umbral-vision/app.js` (en el submodule, no en `kndl000`): los imports ya son relativos (`./index.js`), funcionan tal cual desde el submodule path. Verificar.
- [ ] T041 [US3] Verificar visualmente: `cd assets/js/umbral-vision && python3 -m http.server 8000` y abrir `examples/basic.html` (o equivalente); los visuales se dibujan
- [ ] T042 [US3] Editar `.github/workflows/jekyll.yml`: agregar paso `git submodule update --init --recursive` después de `actions/checkout@v4`
- [ ] T043 [US3] Editar `.github/workflows/jekyll.yml`: agregar paso `npm ci` antes de cualquier `tinacms` build si no existía
- [ ] T044 [US3] Correr `bundle exec jekyll build` local; el sitio se construye sin error; `_site/visual/generator/index.html` existe
- [ ] T045 [US3] Verificar el gitlink: `git ls-tree HEAD assets/js/umbral-vision` retorna `160000 commit <sha> ... umbral-vision` (modo `160000` confirma gitlink, no directorio)
- [ ] T046 [US3] Documentar coexistencia: agregar párrafo en `kndl000/README.md` bajo "Uso Local": "Umbral Vision vive como submodule en `assets/js/umbral-vision/`. Tras clonar, correr `git submodule update --init --recursive`. Para actualizar: `git -C assets/js/umbral-vision pull --tags` + bumpear la dep en `package.json`."
- [ ] T047 [US3] Push a `main`; verificar que el workflow de Jekyll corre el paso de submodule y que el sitio redesplegado en `kundala000.com/visual/generator/` funciona

**Checkpoint**: kndl000 consume el paquete. El sitio público sigue funcionando idéntico al pre-split.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T048 [P] Documentar el proceso de split en `hugomoraga/umbral-vision/RELEASING.md`: cómo taggear, cómo publicar, cómo manejar pre-1.0
- [ ] T049 [P] Crear `examples/basic.html` en el repo nuevo: standalone HTML que carga p5.js vía CDN + importa el bundle ESM y arranca `startVisualizer('tunnel')` en un `<canvas>`
- [ ] T050 Code cleanup: revisar que no haya `console.log` de debug olvidados en `src/` (mantener los intencionales)
- [ ] T051 Performance: bundle size check, `ls -lah dist/` debe mostrar `index.mjs` <50 KB (p5 viene aparte)
- [ ] T052 Security: `npm audit` en repo nuevo debe retornar 0 vulnerabilidades (o documentar las aceptadas)
- [ ] T053 [P] Agregar badge al README del repo nuevo: `[![npm version](https://badge.fury.io/js/%40hugomoraga%2Fumbral-vision.svg)](https://www.npmjs.com/package/@hugomoraga/umbral-vision)` + CI badge
- [ ] T054 Verificar `quickstart.md`: clonar repo nuevo, `npm ci`, `npm run build`, `npm test`, `npm pack` — todo verde end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (US1)**: Depends on Setup.
- **Phase 3 (US2)**: Depends on US1.
- **Phase 4 (US4)**: Depends on US2.
- **Phase 5 (US3)**: Depends on US2 (necesita versión publicable).
- **Phase 6 (Polish)**: Depends on US3 + US4.

### User Story Dependencies

- **US1 (P1)** → bloqueante
- **US2 (P1)** → depende de US1
- **US4 (P2)** → depende de US2, paralelo a US3
- **US3 (P1)** → depende de US2

### Within Each User Story

- US1: split → push → tag → verify (secuencial)
- US2: package.json → bundler → tests → publish (secuencial, pero T012-T014, T019, T021, T024 son [P])
- US4: workflows → push → verify (secuencial)
- US3: submodule → package.json → workflow → verify (secuencial, T039-T040 [P])

### Parallel Opportunities

- T012-T014, T019, T021, T024 corren en paralelo dentro de US2 (archivos distintos).
- US4 puede arrancar en paralelo con US3 una vez que US2 publicó `v0.1.0`.

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Phase 1: Setup
2. Phase 2: US1 (split + repo)
3. Phase 3: US2 (paquete npm)
4. Phase 5: US3 (integración en kndl000)
5. **STOP and VALIDATE**: deploy manual + verificación visual del `/visual/generator/`
6. Tag demo `v0.1.0-mvp` en ambos repos

### Incremental Delivery

1. Setup → repo creado
2. US1 → código extraído (sin publicar todavía, sirve como backup)
3. US2 → publicado en npm (entregable a la comunidad)
4. US4 → CI verde (calidad)
5. US3 → kndl000 migrado (entregable al blog)
6. Polish → badges, examples, docs

---

## Notes

- [P] tasks = archivos distintos, sin dependencias
- [Story] label = US1/US2/US3/US4
- Cada US es independientemente completable
- US4 puede correr en paralelo con US3
- `git subtree split` es preferible a `git filter-repo` (preserva historia visible en `kndl000`)
- Verificar siempre que el tag del submodule y la versión npm coincidan
- Después de mergear esta spec, abrir spec 011 (UX/UI) que toma este packaging como base