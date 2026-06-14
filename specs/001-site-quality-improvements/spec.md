# Feature Specification: Mejoras de Calidad del Sitio

**Feature Branch**: `001-site-quality-improvements`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "ve oportunidades de mejora. y hace spec y task con el spec kit de github"

**Context**: Blog Jekyll (KNDL 000) con TinaCMS desplegado en GitHub Pages (`https://kundala000.com`). Estructura documentada en `ESTRUCTURA.md`, esquema en `tina/config.ts`, build en `.github/workflows/jekyll.yml`. El sitio carga p5.js + Tone.js vía CDN en todas las páginas (`_layouts/default.html:10-11`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reducir superficie de ataque y tiempo de build (Priority: P1) 🎯 MVP

[Como mantenedor del sitio, quiero que `package.json` declare solo las dependencias reales (TinaCMS) para que `npm ci` sea rápido, reproducible y no exponga 700+ paquetes innecesarios.]

**Why this priority**: `package.json` tiene ~700 dependencias declaradas (muchas heredadas del monorepo de TinaCMS) instaladas en `node_modules/`. Cada push ejecuta `npm ci` (~60-90s) + `npm run build`. Reducirlo a solo lo necesario baja tiempo de CI, riesgo de CVEs y confusión. Es la base sobre la que US4 (consolidar JS) se apoya.

**Independent Test**: Ejecutar `rm -rf node_modules package-lock.json && npm install` y verificar que (a) se instalan <20 paquetes, (b) `npm run dev` arranca Jekyll + Tina, (c) `npm run build` genera `admin/` sin error, (d) la página `/_site/index.html` resultante es idéntica a la previa.

**Acceptance Scenarios**:

1. **Given** un `package.json` con dependencias infladas, **When** ejecuto `npm install`, **Then** se instalan solo las dependencias declaradas necesarias para TinaCMS CLI/build.
2. **Given** un `package.json` limpio, **When** corro `npm run build`, **Then** se genera `admin/index.html` con el CMS funcional.
3. **Given** el sitio desplegado, **When** un visitante navega, **Then** no hay regresión visual ni funcional.
4. **Given** `npm audit`, **When** lo ejecuto, **Then** el reporte lista menos vulnerabilidades que antes.

---

### User Story 2 - Documentación coherente con la estructura real (Priority: P2)

[Como nuevo colaborador, quiero que `ESTRUCTURA.md` refleje los directorios que realmente existen para no perder tiempo buscando archivos que la documentación promete.]

**Why this priority**: `ESTRUCTURA.md:48-50,56-57` referencia `assets/js/features/main.js` (tunnel/generator) y `assets/js/utils/control-panel.js`, pero `ls assets/js/features/` no existe y `control-panel.js` está en `assets/js/utils/components/`. Genera fricción y desincentiva contribuciones.

**Independent Test**: `grep -E "assets/js/features|control-panel" ESTRUCTURA.md` no debe arrojar rutas inexistentes. `find assets/js -type d` debe coincidir con lo documentado.

**Acceptance Scenarios**:

1. **Given** `ESTRUCTURA.md` desactualizado, **When** lo abro, **Then** cada archivo/carpeta mencionado existe en el repo.
2. **Given** la estructura real, **When** actualizo `ESTRUCTURA.md`, **Then** refleja exactamente `ls -R assets/js`.

---

### User Story 3 - Build/CI más rápido (Priority: P2)

[Como mantenedor, quiero que el workflow de GitHub Actions no rebuildee el admin de Tina si no cambió nada relevante, y que el build de Jekyll no se rompa si falla el build de Tina, para tener iteraciones más rápidas.]

**Why this priority**: `.github/workflows/jekyll.yml:38-46` corre `npm ci` + `npm run build` (Tina) en cada push a `main`, incluso cuando solo cambió contenido Markdown. `npm ci` tarda ~60s y Tina build otros ~30-60s. El build de Tina no es necesario para construir el sitio Jekyll; solo se necesita si cambió `tina/` o `package.json`.

**Independent Test**: Hacer push solo de un cambio en `content/collections/_posts/*.md` y verificar que el job omite el paso de Tina build (o lo hace en menos de 10s vía cache). El sitio desplegado sigue funcionando.

**Acceptance Scenarios**:

1. **Given** un push que solo modifica contenido Markdown, **When** corre el workflow, **Then** se salta o cachea `npm ci` y `npm run build` (Tina).
2. **Given** un push que modifica `tina/config.ts` o `package.json`, **When** corre el workflow, **Then** invalida el cache y reconstruye Tina.
3. **Given** un fallo en el build de Tina, **When** Jekyll puede construir sin él, **Then** el sitio igual se despliega (Tina es opcional para el sitio público).

---

### User Story 4 - Bundle único para el home (Priority: P3)

[Como visitante, quiero que la página de inicio cargue un solo JS optimizado en lugar de 6+ scripts dispersos, para que el tiempo hasta interactividad mejore.]

**Why this priority**: `index.md:38-44` carga 5 scripts independientes (`home-nav.js`, `lab-home.js`, `nube-palabras.js`, `home-canvas.js`, `home-audio.js`). El layout base además carga `image-effects.js` global. Consolidar en un solo `home-bundle.js` (con `defer`) reduce peticiones HTTP y dependencias de orden de carga.

**Independent Test**: En la página de inicio, abrir DevTools → Network → JS: debe haber ≤1 script propio de la home (los CDN p5/Tone siguen aparte). Lighthouse Performance no debe empeorar.

**Acceptance Scenarios**:

1. **Given** el home carga 5 scripts, **When** consolido en `assets/js/bundles/home.bundle.js`, **Then** la página solo incluye ese bundle + p5/Tone.
2. **Given** el bundle consolidado, **When** navego al home, **Then** la nube de palabras, el canvas, el audio y la nav funcionan idénticamente.
3. **Given** un usuario con JS deshabilitado, **When** carga el home, **Then** el contenido textual sigue siendo accesible (no se rompe el `<h1>`, el feed, ni los enlaces de navegación).

---

### User Story 5 - Accesibilidad y SEO del home (Priority: P3)

[Como visitante con lector de pantalla o como crawler de buscador, quiero que la página de inicio tenga estructura semántica correcta y metaetiquetas sociales, para mejorar accesibilidad y compartibilidad.]

**Why this priority**: `index.md:11` muestra `<h1 id="c--e--n--i--z--a--s">C . E . N . Z . A . S</h1>` con espacios y guiones decorativos que ensucian el `id` para anclas. El `<canvas id="art">` (`index.md:42`) no tiene `aria-label` ni fallback. El `<a class="link-oculto" ...>... ⚙ ...</a>` (línea 36) esconde un enlace con texto confuso. `_includes/seo.html` ya es robusto, pero el `og:image` y `twitter:image` solo se emiten si existe `seo_image`.

**Independent Test**: Lighthouse Accessibility ≥95 en el home. Validador W3C sin errores. `<canvas>` tiene `role="img"` y `aria-label`. El `<h1>` tiene `id` limpio (slugificado) o se reemplaza por heading real.

**Acceptance Scenarios**:

1. **Given** un `<canvas>` decorativo, **When** un lector de pantalla lo visita, **Then** anuncia algo útil o lo omite (`aria-hidden="true"` con fallback textual).
2. **Given** el `<h1>` actual, **When** limpio el `id`, **Then** el `id` es un slug válido y el heading es semánticamente `<h1>` (no un span).
3. **Given** `site.seo_image` configurado o ausente, **When** inspecciono los meta tags, **Then** las previsualizaciones sociales funcionan o se omite limpiamente sin `og:image` vacío.
4. **Given** el enlace oculto "vestigios", **When** un usuario navega con teclado, **Then** el enlace es focuseable y su `aria-label` describe el destino.

---

### Edge Cases

- ¿Qué pasa si `npm install` con un `package.json` mínimo no encuentra alguna dependencia transitiva usada por `tinacms` CLI? → Validar con `npm ls tinacms` y `tinacms dev` localmente antes de mergear.
- ¿Qué pasa si el cache de GitHub Actions devuelve una versión vieja de Tina cuando cambió `package.json`? → Usar hash de `package-lock.json` o paths en la key del cache para invalidar.
- ¿Qué pasa con usuarios con JS deshabilitado si consolido scripts sin `<noscript>` fallback? → El contenido Markdown sigue accesible; los efectos visuales (canvas, audio) son enhancement.
- ¿El `<h1>` decorativo "C.E.N.I.Z.A.S" se usa como ancla en algún lugar? → Buscar referencias antes de cambiar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `package.json` MUST declarar solo las dependencias necesarias para ejecutar `tinacms dev` y `tinacms build` (CLI + @tinacms/cli), todas en `devDependencies` o en la sección mínima viable.
- **FR-002**: El sitio MUST construirse y servir idénticamente después de la limpieza de `package.json` (sin regresión visual ni funcional).
- **FR-003**: `ESTRUCTURA.md` MUST reflejar exactamente los directorios y archivos que existen en `assets/js/` y `assets/media/`.
- **FR-004**: El workflow `.github/workflows/jekyll.yml` SHOULD cachear o saltar `npm ci` + `tinacms build` cuando el cambio no afecta al admin (paths-filter o cache por hash de lockfile).
- **FR-005**: La página `index.md` MUST incluir como máximo un bundle JS propio del home (`assets/js/bundles/home.bundle.js`), preservando p5/Tone vía CDN.
- **FR-006**: El `<canvas id="art">` MUST tener `role="img"` con `aria-label` o ser marcado `aria-hidden="true"` con contenido textual alternativo visible.
- **FR-007**: El `<h1>` decorativo del home SHOULD tener un `id` slugificado y semánticamente correcto.
- **FR-008**: El enlace oculto a `/vestigios/` MUST ser accesible por teclado con un `aria-label` descriptivo.
- **FR-009**: El sistema MUST seguir construyendo y desplegando correctamente si el build de TinaCMS falla, siempre que Jekyll pueda generar el sitio.

### Key Entities *(include if feature involves data)*

- **Bundle de home**: archivo único `assets/js/bundles/home.bundle.js` que reemplaza los 5 scripts actuales. Sin datos nuevos.
- **Workflow CI**: archivo `.github/workflows/jekyll.yml` con pasos condicionales. Sin datos nuevos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm install` instala ≤20 paquetes top-level (medido con `npm ls --depth=0 | wc -l`).
- **SC-002**: Tiempo de `npm ci` en CI ≤15s (con cache) cuando no cambió `package.json` ni `tina/`.
- **SC-003**: Lighthouse Performance del home no empeora respecto a baseline; Accessibility ≥95.
- **SC-004**: El sitio desplegado en `https://kundala000.com` funciona idénticamente (verificación visual + funcional).
- **SC-005**: `find assets/js -type d` coincide con la sección "JavaScript" de `ESTRUCTURA.md`.

## Assumptions

- TinaCMS CLI requiere su propio `package.json` con sus dependencias; no se puede eliminar todo, solo reducir a lo declarado en su peerDependencies.
- p5.js y Tone.js vía CDN se mantienen (son librerías grandes, no tiene sentido bundlearlas).
- El sitio se construye con Jekyll en producción, no con Tina build; Tina solo aporta `/admin/`.
- `package-lock.json` actual es válido y reproducible; no se va a regenerar desde cero en este feature (sería una tarea separada).
- El sitio está en español (`locale: es_ES`) y el contenido no cambia.
