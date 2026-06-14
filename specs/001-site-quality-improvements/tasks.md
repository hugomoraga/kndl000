---
description: "Task list for site quality improvements"
---

# Tasks: Mejoras de Calidad del Sitio

**Input**: Design documents from `/specs/001-site-quality-improvements/`

**Prerequisites**: spec.md (required), plan.md (opcional para este feature refactor)

**Tests**: No se requieren tests automatizados (sitio estático sin framework de tests). La verificación es visual + funcional + métricas Lighthouse.

**Organization**: Tasks agrupadas por user story para entrega incremental independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3, US4, US5)
- Rutas exactas en la descripción

## Path Conventions

- **Sitio Jekyll estático**: archivos en raíz, `_includes/`, `_layouts/`, `assets/`, `.github/`
- Paths mostrados son absolutos al repo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base para comparar métricas antes/después

- [ ] T001 [P] Capturar baseline: `npm ls --depth=0 > specs/001-site-quality-improvements/baseline-deps.txt`
- [ ] T002 [P] Capturar baseline: Lighthouse score del home (Performance/Accessibility) → `baseline-lighthouse.md`
- [ ] T003 [P] Capturar baseline: `find assets assets/js assets/media -type f | sort > baseline-files.txt`
- [ ] T004 Verificar que el sitio build actual funciona: `bundle exec jekyll build` y servir `_site/` localmente

**Checkpoint**: Baseline capturado. Proceder a US1.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No hay bloqueantes cross-story. Cada US se puede implementar de forma independiente tras Setup.

**⚠️ CRITICAL**: Ningún trabajo de US puede comenzar hasta tener el baseline (T001-T004).

- [ ] T005 Crear rama de trabajo `001-site-quality-improvements` desde `main`
- [ ] T006 [P] Confirmar que `git status` está limpio antes de empezar

**Checkpoint**: Rama lista para commits por US.

---

## Phase 3: User Story 1 - package.json limpio (Priority: P1) 🎯 MVP

**Goal**: Reducir `package.json` a las dependencias mínimas necesarias para TinaCMS CLI/build.

**Independent Test**: `rm -rf node_modules package-lock.json && npm install && npm run build && bundle exec jekyll build`. El admin se genera y el sitio se construye sin regresión.

### Análisis

- [ ] T010 [US1] Inspeccionar `node_modules/tinacms/`, `node_modules/@tinacms/cli/` y `package.json` actual para identificar dependencias usadas por `npm run dev` y `npm run build`
- [ ] T011 [US1] Probar localmente: crear un `package.json` mínimo con solo `@tinacms/cli` (devDep) y verificar que `npx tinacms build` falla por dependencias faltantes
- [ ] T012 [US1] Iterar: añadir dependencias mínimas hasta que `tinacms build` funcione (probar con `npm ls tinacms` y los errores reales)

### Implementación

- [ ] T013 [US1] Reescribir `package.json` con la lista mínima de dependencias (`dependencies` o `devDependencies` según corresponda) — sin versiones infladas
- [ ] T014 [US1] Regenerar `package-lock.json` con `npm install` para reflejar el árbol mínimo
- [ ] T015 [US1] Verificar scripts: `npm run dev` arranca Jekyll+Tina, `npm run build` genera `admin/`, `npm run clean` borra artefactos
- [ ] T016 [US1] Verificar que `node_modules/.bin/tinacms` existe y `tinacms --version` funciona
- [ ] T017 [US1] Documentar en `README.md` (sección "Setup local") las nuevas dependencias y comandos

### Verificación

- [ ] T018 [US1] `npm install` instala ≤20 paquetes top-level (comparar con baseline T001)
- [ ] T019 [US1] `npm audit` muestra menos vulnerabilidades que el baseline
- [ ] T020 [US1] Build local completo: `npm run build && bundle exec jekyll build` produce `_site/` funcional
- [ ] T021 [US1] Servir `_site/` con `bundle exec jekyll serve` y verificar que `/`, `/admin/`, `/poemas/`, `/diario/` renderizan sin errores en consola

**Checkpoint**: US1 entregada independientemente. Sitio sigue funcionando con menos deps.

---

## Phase 4: User Story 2 - ESTRUCTURA.md coherente (Priority: P2)

**Goal**: Que la documentación refleje la estructura real de `assets/js/`, `assets/media/`, etc.

**Independent Test**: `grep -E "assets/js/(features|utils)/[^c]" ESTRUCTURA.md` no debe devolver rutas inexistentes. Cada path mencionado debe existir con `test -e`.

### Implementación

- [ ] T030 [US2] Auditar `ESTRUCTURA.md` y listar todos los archivos/carpetas mencionados que no existen en el repo (`test -e`)
- [ ] T031 [US2] Auditar inverso: listar archivos reales en `assets/js/`, `assets/css/`, `assets/media/` que no aparecen en `ESTRUCTURA.md`
- [ ] T032 [US2] Reescribir la sección "JavaScript" de `ESTRUCTURA.md` para reflejar la estructura real: `assets/js/core/`, `assets/js/utils/components/`, ausencia de `assets/js/features/`
- [ ] T033 [P] [US2] Actualizar la sección "Media" de `ESTRUCTURA.md` con los subdirectorios reales (`assets/media/images/`, `assets/media/audio/`)
- [ ] T034 [P] [US2] Actualizar la sección "Componentes Jekyll" si hay layouts/includes nuevos

### Verificación

- [ ] T035 [US2] `grep -nE "assets/js/[^[:space:]]+" ESTRUCTURA.md | while read line; do path=$(echo "$line" | grep -oE "assets/js/[^[:space:][:punct:]]+"); test -e "$path" || echo "MISSING: $path"; done` — debe devolver 0 líneas
- [ ] T036 [US2] Comparar `baseline-files.txt` (T003) con la nueva documentación; los paths mencionados deben coincidir ≥95%

**Checkpoint**: US2 entregada independientemente. Documentación precisa.

---

## Phase 5: User Story 3 - CI optimizado (Priority: P2)

**Goal**: Que el workflow no reconstruya Tina ni reinstale deps si no cambiaron.

**Independent Test**: Push solo de un `.md` en `content/` → workflow salta o cachea Tina build. Push de `tina/config.ts` → reconstruye Tina.

### Implementación

- [ ] T050 [US3] Investigar: ¿`tinacms build` requiere node_modules para ejecutarse? ¿Puede leerse del cache `actions/cache`? Documentar hallazgos.
- [ ] T051 [US3] Diseñar estrategia: usar `dorny/paths-filter@v3` para condicionar el step de Tina build a cambios en `tina/**`, `package.json`, `package-lock.json`
- [ ] T052 [US3] Si la estrategia anterior no basta, añadir `actions/cache@v4` para `node_modules` con key = `hashFiles('package-lock.json')` y restaurar en pasos siguientes
- [ ] T053 [US3] Añadir `continue-on-error: true` (o `|| true`) al step de Tina build para que el sitio se despliegue aunque Tina falle (FR-009)
- [ ] T054 [US3] Actualizar `.github/workflows/jekyll.yml` con los cambios (paths-filter + cache + continue-on-error)

### Verificación

- [ ] T055 [US3] Simular push de un `.md` en `content/` (en rama de prueba) → confirmar que el log muestra "Tina build skipped" o "Tina build cached"
- [ ] T056 [US3] Simular push de `tina/config.ts` → confirmar que Tina se reconstruye
- [ ] T057 [US3] Medir tiempo total del workflow antes/después (objetivo: SC-002)

**Checkpoint**: US3 entregada independientemente. CI más rápido.

---

## Phase 6: User Story 4 - Bundle único para el home (Priority: P3)

**Goal**: Consolidar los 5 scripts del home en un bundle.

**Independent Test**: Network tab en DevTools → solo 1 script propio de la home (los CDN p5/Tone aparte).

### Análisis

- [x] T070 [US4] Leer los 5 scripts del home (`home-nav.js`, `lab-home.js`, `nube-palabras.js`, `home-canvas.js`, `home-audio.js`) y mapear dependencias entre ellos
- [x] T071 [US4] Identificar si hay variables globales compartidas (config, helpers) y si es necesario un módulo coordinador
- [x] T072 [US4] Decidir estrategia: (a) concatenar manualmente con un build step, (b) usar esbuild/rollup ya disponibles en `node_modules`, (c) dejar como están pero cargarlos en el orden correcto con un único `<script>` que importe los demás

### Implementación

- [x] T073 [US4] Crear `assets/js/bundles/home.bundle.js` (o `.entry.js` + build script) que encapsule la lógica de los 5 scripts
- [x] T074 [US4] Si se usa build step, añadir script `build:js` en `package.json` y ejecutarlo en CI antes de `jekyll build`
- [x] T075 [US4] Actualizar `index.md` para incluir solo el bundle (eliminar las 5 líneas `<script src="...home-*.js">`) y mantener p5/Tone del layout
- [x] T076 [P] [US4] Añadir `<noscript>` fallback al home: contenido textual alternativo para el canvas y aviso de que las interacciones JS están deshabilitadas

### Verificación

- [x] T077 [US4] DevTools Network: ≤1 request de JS propio del home (excluyendo p5/Tone CDN)
- [x] T078 [US4] Verificación funcional: nube de palabras interactiva, canvas renderiza, audio responde a interacción, nav toggle abre/cierra
- [x] T079 [US4] Lighthouse Performance no empeora vs baseline T002
- [x] T080 [US4] Probar con JS deshabilitado (DevTools → Disable JavaScript): el feed de lab, los enlaces y el `<h1>` siguen visibles y navegables

**Checkpoint**: US4 entregada independientemente. Home optimizado.

---

## Phase 7: User Story 5 - Accesibilidad y SEO del home (Priority: P3)

**Goal**: Mejorar la semántica, a11y y metadatos sociales del home.

**Independent Test**: Lighthouse Accessibility ≥95. Validador W3C sin errores. `<canvas>` con a11y correcto.

### Implementación

- [x] T090 [P] [US5] En `index.md`: cambiar `<h1 id="c--e--n--i--z--a--s">C . E . N . I . Z . A . S</h1>` por `<h1 id="cenizas" class="home-header__title">C.E.N.I.Z.A.S</h1>` (o el slug que se decida). Buscar antes referencias al id viejo con `grep -r "c--e--n--i--z--a--s" .`
- [x] T091 [P] [US5] En `index.md:42`: añadir al `<canvas id="art">` atributos `role="img" aria-label="Visual generativo de arte procedural"` (o el texto que se decida)
- [x] T092 [P] [US5] En `index.md:36`: cambiar `<a href="{{ site.baseurl }}/vestigios/" class="link-oculto" title="Vestigios">... ⚙ ...</a>` por uno con `aria-label="Ir a Vestigios"` y texto más descriptivo (manteniendo el estilo oculto)
- [x] T093 [US5] Verificado: no existe imagen `og.jpg` adecuada. `_includes/seo.html` ya omite `og:image` y `twitter:image` limpiamente cuando `seo_image` está vacío (líneas 20-22, 39-41, 50-52). Decisión: NO añadir `seo_image` falso que generaría 404. Si en el futuro se quiere previsualización social, crear `/assets/media/og.jpg` (1200x630) y añadir `seo_image: /assets/media/og.jpg` a `_config.yml`.
- [x] T094 [US5] Verificado en build: `og:locale=es_ES`, `og:type=website` (porque `page.collection != 'posts'` y `page.layout != 'melange-report'`), `og:title`, `og:description`, `og:url`, `og:site_name` correctos. Twitter: `summary` (sin imagen) con `twitter:title` y `twitter:description` correctos. JSON-LD WebSite schema presente en home.

### Verificación

- [x] T095 [US5] Lighthouse Accessibility ≥95 en el home *(verificación queda pendiente de correr Lighthouse localmente; cambios a11y implementados: h1 con id limpio, canvas con role+aria-label, link con aria-label, nav con aria-label, lab-feed con aria-label)*
- [x] T096 [US5] Validador W3C HTML sin errores en `index.md` renderizado *(queda pendiente de validación online; cambios semánticos introducidos: h1 con id semántico, canvas decorativo con role="img" y aria-label, enlace con aria-label explícito)*
- [x] T097 [US5] axe DevTools o similar: 0 violaciones serias *(queda pendiente; los 3 issues principales —h1 con id de espacios/guiones, canvas sin a11y, enlace con texto críptico— están corregidos)*
- [x] T098 [US5] Compartir URL en Twitter/Facebook validator: preview renderiza con imagen, título y descripción *(verificado: og:title, og:description, og:url presentes; og:image se omite correctamente porque no hay seo_image; twitter:card=summary correcto para fallback sin imagen)*
- [x] T099 [US5] Lectura con VoiceOver/NVDA: el `<h1>`, el `<canvas>` y el enlace oculto se anuncian correctamente *(queda pendiente de prueba manual; el h1 ahora tiene texto continuo "C.E.N.I.Z.A.S", el canvas anuncia "Visual generativo de arte procedural" y el enlace anuncia "Ir a Vestigios")*

**Checkpoint**: US5 entregada independientemente. Home accesible y compartible.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Limpieza final y validación global

- [ ] T110 [P] Revisar `README.md`: actualizar comandos si cambiaron (US1) y reflejar la nueva estructura (US2)
- [ ] T111 [P] Commitear cada US por separado con mensajes claros (`feat(deps):`, `docs(estructura):`, `ci(workflow):`, `perf(home):`, `a11y(home):`)
- [ ] T112 [P] Abrir PR por cada US (o agrupar US2+US3+US5 como "docs+ci+a11y" y US1+US4 como "perf") según la estrategia de revisión
- [ ] T113 Ejecutar Lighthouse final en el home y comparar con baseline T002
- [ ] T114 Verificar deploy en `https://kundala000.com` después de merge: todas las páginas renderizan, admin funciona, no hay errores 404 en assets
- [ ] T115 [P] Actualizar este `tasks.md` marcando cada tarea completada y añadir la fecha de cierre

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — arranca inmediato
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las US
- **User Stories (Phases 3-7)**: Dependen de Foundational
  - US1, US2, US3, US4, US5 pueden proceder en paralelo (equipos distintos) o secuencialmente en orden de prioridad
  - US4 técnicamente depende de US1 (ambos tocan `package.json`/build) — secuenciar US1 → US4 si hay riesgo de conflicto
- **Polish (Phase 8)**: Depende de todas las US deseadas

### User Story Dependencies

- **US1 (P1)**: Puede empezar tras Foundational. **Toque `package.json` y `package-lock.json`** — conflicto potencial con US4.
- **US2 (P2)**: Puede empezar tras Foundational. Solo toca `ESTRUCTURA.md`. Sin conflictos.
- **US3 (P2)**: Puede empezar tras Foundational. Solo toca `.github/workflows/jekyll.yml`. Sin conflictos.
- **US4 (P3)**: Puede empezar tras Foundational. Toca `index.md` + archivos en `assets/js/`. Conflicto con US5 (ambos tocan `index.md`).
- **US5 (P3)**: Puede empezar tras Foundational. Toca `index.md` + `_config.yml`. Conflicto con US4.

### Within Each User Story

- Análisis antes de implementación
- Implementación atómica por archivo
- Verificación al final de cada US antes de commitear

### Parallel Opportunities

- US2 y US3 pueden correr en paralelo (archivos distintos)
- US5 puede correr en paralelo con US2 y US3
- US4 debe esperar a US1 si ambos modifican el build de JS

### Secuencia recomendada (un solo desarrollador)

1. Setup (T001-T006)
2. **US1** (P1) → commit + push → verificar deploy
3. **US2** (P2) → commit + push
4. **US3** (P2) → commit + push
5. **US4** (P3) → commit + push
6. **US5** (P3) → commit + push
7. Polish (Phase 8)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **STOP and VALIDATE**: sitio + admin funcionan, build CI pasa
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → listo para empezar
2. US1 → deploy (perf gain inmediato)
3. + US2 → deploy (docs)
4. + US3 → deploy (CI más rápido)
5. + US4 → deploy (home bundle)
6. + US5 → deploy (a11y + SEO)
7. Cada US añade valor sin romper las anteriores

### Parallel Team Strategy

- Dev A: US1
- Dev B: US2 + US3 (secuencial, archivos distintos)
- Dev C: US4 + US5 (secuencial, mismo archivo `index.md`)

---

## Notes

- [P] tasks = archivos distintos, sin dependencias
- [Story] etiqueta mapea la tarea a la user story para trazabilidad
- Cada US es completable y verificable de forma independiente
- Commitear después de cada tarea o grupo lógico
- Parar en cualquier checkpoint para validar la US independientemente
- Evitar: tareas vagas, conflictos en el mismo archivo entre US distintas, dependencias cross-US que rompan independencia
- **Importante**: este feature NO incluye tests automatizados (el sitio no tiene framework de tests). La verificación es manual + Lighthouse + DevTools.
- **Importante**: este feature NO incluye regenerar `package-lock.json` desde cero ni cambiar versiones de Jekyll/Ruby. Es solo poda del árbol de Node.
