---
description: "Task list for the Fragmentos section refactor"
---

# Tasks: Refactorización de Fragmentos

**Input**: Design documents from `/specs/006-fragmentos-refactor/`

**Prerequisites**: spec.md (required)

**Tests**: Manuales (Jekyll build + DevTools + browser). Sin tests automatizados (es contenido/UI estático).

**Organization**: Tasks por user story. US1, US2, US3, US4 son P1 (MVP funcional). US5 y US6 son P2 (rename + limpieza).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1-US6

## Path Conventions

- **Colección**: `content/collections/_fragmentos/`
- **Página índice**: `fragmentos/index.md`
- **Feed home**: `_includes/lab-feed.html` + `assets/js/core/lab-home.js` + `_data/home.yml`
- **CSS scoped**: bloque en `assets/css/style.css` bajo selector `.fragmentos-archive`
- **CMS**: `admin/config.yml`

---

## Phase 1: Setup (Decisiones)

**Purpose**: Resolver el rename conceptual (US5) antes de tocar UI/código.

- [ ] T001 [US5] Decidir el término final para renombrar "fragmentos" → opciones: "Rastros", "Señales", "Ecos", "Notas". Decisión documentada en `Assumptions` del spec.
- [ ] T002 [US5] Decidir el glifo de la sección: mantener `☍` (conjunción alquímica, ya usado en el menú) o cambiar a `🜂` (fuego, ya en la página índice). Decisión documentada.
- [ ] T003 [US5] Decidir si se agrega la entrada en la nube del home (actualmente no está) — recomendación: sí, con el glifo nuevo.

---

## Phase 2: Foundational (Bloquea US1-US4)

**Purpose**: Limpiar las referencias técnicas que asumían páginas individuales o que metían fragmentos en el feed.

- [ ] T010 [P] Verificar que `_config.yml` tiene `fragmentos: output: false` (ya está, confirmar).
- [ ] T011 [P] [US6] Eliminar `_data/fragmentos.yml` (data huérfana legacy).
- [ ] T012 [P] [US6] Eliminar la rama `page.url contains "/fragmentos/"` de `_includes/back-button.html` (no hay páginas individuales).
- [ ] T013 [P] [US2] Eliminar el loop `for f in site.fragmentos` y la lógica de `frag_href` de `_includes/lab-feed.html`.
- [ ] T014 [P] [US2] Eliminar `max_fragment_ratio` de `_data/home.yml` (mantener los otros 3 límites).
- [ ] T015 [P] [US2] Eliminar lógica de fragmentos en `assets/js/core/lab-home.js` (variables, funciones, comentarios sobre `max_fragment_ratio`).
- [ ] T016 Verificar que `bundle exec jekyll build` no genera warnings ni páginas individuales en `_site/fragmentos/` (debe haber solo `index.html`).

---

## Phase 3: User Story 1 - Sin páginas individuales (P1)

**Purpose**: Confirmar el contrato técnico (no se generan páginas por fragmento).

- [ ] T020 [P] [US1] Confirmar `_config.yml` línea de `fragmentos` con `output: false` y comentario inline explicando por qué.
- [ ] T021 [US1] Auditar el codebase: `grep -rn 'fragmento-' assets/ _includes/ _layouts/ _data/ _config.yml` no devuelve URLs a páginas individuales (solo nombres de archivos).
- [ ] T022 [US1] Verificar en `_site/fragmentos/` que solo hay `index.html` (`find _site/fragmentos -name '*.html' | wc -l` → 1).

---

## Phase 4: User Story 2 - Fuera del lab feed (P1)

**Purpose**: Los fragmentos ya no compiten con poemas/diario/código en la home.

- [ ] T030 [US2] (depende de T013, T014, T015) Construir el sitio y verificar que `grep -A2 'lab-items' _site/index.html` no contiene objetos con `kind` de fragmento/rastro/señal.
- [ ] T031 [US2] (depende de T015) Probar shuffle en la home 10 veces en el browser, confirmar que nunca aparece un fragmento.
- [ ] T032 [US2] Actualizar comentario en `_includes/lab-feed.html` (línea 1-4) para reflejar que el feed es solo de "especímenes completos" (no fragmentos).

---

## Phase 5: User Story 3 - Archivo continuo (P1)

**Purpose**: La página `/fragmentos` es un flujo legible, sin numeración, sin `<a>` envolventes.

- [ ] T040 [US3] Reescribir `fragmentos/index.md`:
  - Mantener `layout: default` y `title: 🜂` (o el glifo decidido en T002).
  - Renderizar todos los fragmentos en orden cronológico inverso (`sort: 'date' | reverse`).
  - Cada fragmento renderiza sus líneas (puede ser 1 o varias) sin `<a>`, sin `<h2>`, sin numeración.
  - Cada fragmento con múltiples líneas se agrupa con un respiro mínimo (clase `fragmento-bloque`).
  - Sin botón "ver más", sin paginación.
  - Incluir el `{% include fragmentos-focus.html %}` solo si todavía aplica (con T012 se puede eliminar).
- [ ] T041 [US3] Agregar clase `fragmentos-archive` al `<main>` o contenedor top (vía wrapper o modificando el layout default para que respete `page.layout_class`).
- [ ] T042 [US3] Verificar en browser: 60 segundos de scroll en `/fragmentos` muestran ≥10 fragmentos legibles, sin clicks, sin paginación.

---

## Phase 6: User Story 4 - Identidad visual (P1)

**Purpose**: La página se siente distinta al resto.

- [ ] T050 [US4] Crear bloque CSS en `assets/css/style.css` bajo `/* === Fragmentos archive === */` con selector `.fragmentos-archive` (o equivalente):
  - Tipografía distinta: serif (`var(--font-serif)`) o peso menor, o ambas.
  - Interlineado `line-height: 1.7` o `1.8`.
  - Color de texto `rgba(200, 200, 210, 0.85)` (más tenue que default).
  - Background opcional: `background-color: #0c0c0e` (charcoal más cálido).
  - Espaciado entre bloques: `margin-bottom: 1.5rem` por `.fragmento-bloque`.
  - Hover sutil en cada bloque: `background: rgba(255,255,255,0.02)`, transición `0.3s`.
  - Header discreto: glifo + label en tamaño menor, sin `<h1>` gigante.
- [ ] T051 [US4] Verificar en browser la comparación `/` vs `/fragmentos` → se sienten como dos cosas distintas.
- [ ] T052 [US4] Verificar en DevTools que la clase está aplicada (scoping correcto).

---

## Phase 7: User Story 5 - Rename conceptual (P2)

**Purpose**: Cambiar etiqueta visible y de UI de "FRAGMENTO" a "Rastro"/"Señal"/"Eco" (decidido en T001).

- [ ] T060 [P] [US5] Actualizar el título de `fragmentos/index.md` al nuevo término (ej: `title: Rastros` con glifo `🜂`).
- [ ] T061 [P] [US5] Actualizar `index.md` (home menu) línea 22: `◇ Devices` está sin fragmento actualmente, AGREGAR `<a href="{{ site.baseurl }}/fragmentos/">🜂 Rastros</a>` (o el glifo/término decididos).
- [ ] T062 [P] [US5] Actualizar `admin/config.yml` línea 173-179: cambiar `name`, `label` y `label_singular` de la colección fragmentos al nuevo término.
- [ ] T063 [P] [US5] Actualizar `404.html` línea 24: el link a fragmentos con glifo y label nuevos.
- [ ] T064 [P] [US5] Actualizar `README.md` línea 41: lista de colecciones con nuevo glifo/label.
- [ ] T065 [P] [US5] Actualizar `ESTRUCTURA.md` línea 27, 43, 118: referencias a fragmentos con nuevo glifo/label.
- [ ] T066 [P] [US5] Actualizar `docs/VISUAL-IDENTITY.md` línea 117 (tabla de glifos) si menciona `◇` o fragmentos.
- [ ] T067 [US5] Verificar `grep -rni 'fragmento\|FRAGMENTO' assets/ _includes/ _data/ _config.yml admin/config.yml` → solo hits de nombre de archivo/carpeta/URL.

---

## Phase 8: User Story 6 - Limpieza de referencias huérfanas (P2)

**Purpose**: Higiene. Sin código muerto.

- [ ] T070 [P] [US6] Eliminar `fragmentos-focus.html` si T012 eliminó su única llamada (verificar: `grep -rn 'fragmentos-focus' _includes/`).
- [ ] T071 [P] [US6] Eliminar el bloque CSS `.fragmento-linea-wrap` y `.fragmento-linea` en `style.css` (líneas 2905-2947 aprox.) si T040 ya no los usa.
- [ ] T072 [US6] Verificación final: `grep -rn 'fragmento' assets/ _includes/ _layouts/ _data/ _config.yml` solo devuelve referencias a nombre de carpeta/archivo/URL.

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: Verificación end-to-end.

- [ ] T080 Verificar `bundle exec jekyll build` sin warnings.
- [ ] T081 Lighthouse en `/fragmentos` ≥ 90 (performance + accessibility).
- [ ] T082 Probar la home: shuffle 10 veces, no aparece ningún fragmento.
- [ ] T083 Probar `/fragmentos` en mobile: scroll fluido, sin overflow horizontal.
- [ ] T084 Verificar que la nube del home muestra la nueva entrada a fragmentos con glifo correcto.

---

## Dependencies & Execution Order

```
Phase 1 (T001-T003) → bloquea todo
   ↓
Phase 2 (T010-T016) → cleanup técnico
   ↓
Phase 3 (T020-T022) ← independiente (verificación)
Phase 4 (T030-T032) ← depende de Phase 2
Phase 5 (T040-T042) ← depende de T010, T011, T012
Phase 6 (T050-T052) ← depende de T041
Phase 7 (T060-T067) ← depende de T001, T002
Phase 8 (T070-T072) ← depende de Phase 5, 6
   ↓
Phase 9 (T080-T084) ← depende de todo
```

## Parallel Opportunities

- T011, T012, T013, T014, T015 son todos archivos distintos → correr en paralelo.
- T020, T021, T022 son verificaciones → pueden ir al final.
- T060-T067 son todos archivos distintos → correr en paralelo.

## Implementation Strategy

**MVP (P1)**: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 = secciones sacan del feed + archivo continuo + identidad visual. Es lo que ve el visitante.

**Complete (P1 + P2)**: + Phase 7 + Phase 8 = rename conceptual + limpieza. Es lo que completa el refactor.

**Out of scope (futuro spec)**: constelaciones temáticas, búsqueda, export, internacionalización.
