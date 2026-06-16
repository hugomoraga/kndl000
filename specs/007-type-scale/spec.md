# Feature Specification: Refactor del sistema tipográfico (h1-h6 + p)

**Feature Branch**: `007-type-scale`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "El titulo esta muy pequeño. De hehco creo que refactorizaria todo el sitema de titulos h1 h2 h3 h4 h5 h6 p en la pagina para que conversen. y tengan un estilo definido"

**Context**: El sitio KNDL 000 tiene hoy 3 "shapes" distintas de H1 (`.page-title` con `clamp(1.5, 4vw, 2rem)`, `.melange-report__title` con `clamp(1.85, 5vw, 2.45rem)`, `.home-header__title` sin CSS propio), 0 tokens de font-size/line-height/weight en `:root`, 23 puntos en `style.css` que tocan `h1-h4` con valores ad-hoc, sin regla global de `p`, y H4 declarado en el base rule pero sin uso en ninguna parte. El trigger fue el header `⟡ Rastros` de `main.fragmentos-archive` que se siente muy chico respecto al `1.25rem` del lead. El usuario pide un sistema unificado donde todos los títulos (h1-h6 + p) "conversen" — escala clara, tokens en :root, sin contradicciones.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escala tipográfica con tokens (Priority: P1) 🎯 MVP

[Como autor y visitante, quiero que todos los títulos del sitio (h1-h6 + p) estén definidos por una escala única de tokens en `:root` (`--fs-1`, `--fs-2`, ..., `--lh-tight`, `--lh-base`, `--lh-loose`, etc.), de modo que si quiero cambiar el feel de la página cambio una variable y todo se reajusta coherentemente.]

**Why this priority**: Es el corazón del refactor. Sin tokens, los 23 puntos siguen siendo ad-hoc y cualquier ajuste futuro rompe la consistencia.

**Independent Test**: `grep -E '^\s*--fs-|^\s*--lh-|^\s*--fw-' _sass/_tokens.css assets/css/style.css` devuelve al menos 5 tokens de font-size, 2 de line-height, 2 de font-weight. Cualquier `clamp(1.Xrem, Yvw, Zrem)` en el archivo usa esos tokens como base.

**Acceptance Scenarios**:

1. **Given** el CSS, **When** se lee la sección `:root`, **Then** existen al menos: `--fs-1` (display), `--fs-2` (h1), `--fs-3` (h2), `--fs-4` (h3), `--fs-5` (h4), `--fs-6` (h5/h6), `--fs-body` (p base), `--fs-small` (meta), más `--lh-tight`, `--lh-base`, `--lh-loose`, `--fw-regular`, `--fw-medium`, `--fw-semibold`, `--fw-bold`.
2. **Given** el CSS, **When** se busca cualquier `clamp(` o `font-size:`, **Then** los valores que se repiten en 2+ lugares pasan a referenciar tokens (no magic numbers repetidos).
3. **Given** los tokens, **When** se cambian, **Then** todo el sitio reacciona de forma coherente (no hay valores huérfanos fuera de la escala).

---

### User Story 2 - H1 unificado en 3 variantes (Priority: P1)

[Como visitante, quiero que el H1 de la home, el de las páginas de sección (`.page-title`) y el de los reportes Melange (`.melange-report__title`) compartan una base común (mismo font-family, mismo border-bottom, mismo letter-spacing) y se diferencien solo en tamaño y presencia de eyebrow/subtítulo. Hoy son 3 cosas distintas sin parentesco visual.]

**Why this priority**: Es lo que el usuario ve al navegar — pasar de `ↂ Poemas` a un reporte Melange no debe sentirse como entrar a otro sitio.

**Independent Test**: Comparar `/poemas/`, un melange-report y la home en DevTools → los 3 H1 tienen el mismo `font-family`, mismo `font-weight`, mismo `letter-spacing`, mismo `border-bottom`, y solo difieren en `font-size` y `line-height` (porque los reports son "display" y las páginas son "page-title").

**Acceptance Scenarios**:

1. **Given** 3 H1s distintos (`.page-title`, `.melange-report__title`, `.home-header__title`), **When** se inspeccionan, **Then** los 3 usan la misma `font-family` (var(--font-serif)) y mismo `font-weight` (var(--fw-bold) o equivalente).
2. **Given** los 3 H1s, **When** se inspeccionan, **Then** los 3 tienen `border-bottom` o ninguno — NO mixto (algunos con border, otros sin).
3. **Given** los 3 H1s, **When** se inspeccionan, **Then** el `letter-spacing` es el mismo (o ausente en los 3).
4. **Given** los 3 H1s, **When** se ven en navegador, **Then** se sienten parientes — un visitante no nota que son implementaciones distintas.
5. **Given** `.page-title`, **When** se renderiza, **Then** se ve claramente más grande que `.rastros-header` (el lead es lead, no es H1).

---

### User Story 3 - p con estilo global (Priority: P1)

[Como visitante, quiero que todo párrafo del sitio tenga un `font-size`, `line-height`, `margin-top` y `margin-bottom` coherentes — hoy no hay regla global de `p` y cada layout hereda valores por defecto que no conversan entre secciones.]

**Why this priority**: p es el elemento más usado del sitio. Sin regla global, los párrafos del diario se ven distintos a los del código, a los de melange, etc.

**Independent Test**: En `/diario/`, `/codigo/`, `/melange-reports/`, el `<p>` del body tiene el mismo `font-size` (modulado por su contexto), el mismo `line-height` base, y márgenes verticales coherentes.

**Acceptance Scenarios**:

1. **Given** el CSS, **When** se busca `p {`, **Then** existe una regla global (no solo en scopes como `.poem-body p`).
2. **Given** la regla global, **When** se aplica, **Then** `font-size: var(--fs-body)`, `line-height: var(--lh-base)`, `margin-top: 0`, `margin-bottom: 1em` (o un valor tokenizado similar).
3. **Given** el `<p>` de un melange-report, **When** se compara con el `<p>` de un poema, **Then** tienen el mismo `line-height` y misma `margin-bottom` (con tolerancia).
4. **Given** los `.poem-body p` y `.melange-report__body p`, **When** se refactoriza, **Then** pasan a usar la regla global o un override explícito con tokens (no magic numbers).

---

### User Story 4 - H4 y H5/H6 con estilo definido o quitados (Priority: P2)

[Como autor, no quiero que H4 esté declarado en el base rule pero sin uso en ninguna parte (deuda técnica), y quiero que H5/H6 o se definan en la escala o se documenten como "no usados" para que un próximo autor sepa qué hacer.]

**Why this priority**: Higiene. El base rule (línea 121) declara `h1, h2, h3, h4` con font-family y weight, pero H4 no se usa en ningún layout ni contenido. Y H5/H6 no se declaran en ningún lado.

**Independent Test**: `grep -rn 'h4\|<h4' _layouts/ _includes/ content/` devuelve 0 hits. `grep -rn 'h5\|h6\|<h5\|<h6' _layouts/ _includes/ content/` devuelve 0 hits. La regla `h1, h2, h3, h4` se reemplaza por `h1, h2, h3, h4, h5, h6` con la misma base, o se acota a `h1, h2, h3` y se documenta que H4+ no se usan.

**Acceptance Scenarios**:

1. **Given** el CSS, **When** se lee la base rule, **Then** o se incluyen `h5, h6` con la misma font-family/weight, o se acota a `h1, h2, h3` y se agrega un comentario `/* H4+ no se usan en el contenido actual */`.
2. **Given** la base rule, **When** se aplica, **Then** cualquier H4+ que un autor escriba en el futuro tiene un estilo predecible (no Magic blank).
3. **Given** el refactor, **When** se commitea, **Then** no queda H4 declarado en el base rule si no se usa en el contenido.

---

### User Story 5 - El header de Rastros tiene el tamaño correcto (Priority: P1) 🎯 Trigger original

[Como visitante de `/fragmentos`, quiero que el `⟡ Rastros` se sienta con peso — más grande que el lead italic — para que se lea como título, no como etiqueta. Hoy está a `0.78rem` mientras el lead está a `1.25rem`, así que el lead pesa más que el título. Eso está al revés.]

**Why this priority**: Es el disparador del refactor. El usuario dijo "el titulo esta muy pequeño" refiriéndose a esto.

**Independent Test**: Visitar `/fragmentos` → el `⟡ Rastros` se ve claramente más grande que el lead italic debajo. La jerarquía visual es `header > lead > bloques > año`.

**Acceptance Scenarios**:

1. **Given** la página `/fragmentos`, **When** se renderiza, **Then** el `.rastros-header` tiene `font-size: var(--fs-2)` o `var(--fs-3)` (claramente más grande que el `.rastros-lead` que está en `var(--fs-body) * 1.2` o equivalente).
2. **Given** la página, **When** se ve, **Then** la jerarquía es header > lead (header más grande).
3. **Given** la página, **When** se ve en mobile (≤600px), **Then** el header sigue siendo más grande que el lead (proporcionalmente).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El CSS MUST definir tokens de font-size, line-height y font-weight en `:root` (al menos `--fs-1` a `--fs-6`, `--fs-body`, `--fs-small`, `--lh-tight`, `--lh-base`, `--lh-loose`, `--fw-regular`, `--fw-medium`, `--fw-semibold`, `--fw-bold`).
- **FR-002**: Cualquier valor de `font-size` en `style.css` SHOULD usar `clamp()` con tokens o un valor tokenizado — no magic numbers repetidos.
- **FR-003**: La base rule `h1, h2, h3, h4` (línea 121) MUST actualizarse a incluir todos los headings (h1-h6) o acotarse a los usados (h1-h3) con un comentario explicativo.
- **FR-004**: Los 3 H1 shapes (`.page-title`, `.melange-report__title`, `.home-header__title`) MUST compartir `font-family` y `font-weight` y tener el mismo criterio de `border-bottom` (todos o ninguno).
- **FR-005**: El `p` MUST tener una regla global con `font-size`, `line-height`, `margin-top` y `margin-bottom` coherentes con los tokens.
- **FR-006**: El `.rastros-header` en `main.fragmentos-archive` MUST ser visiblemente más grande que el `.rastros-lead` (font-size y/o weight).
- **FR-007**: Los overrides existentes (`.poem-body h2`, `.poem-body p`, `.codigo-page h1/h2/h3`, `.dispositivo-page__body h3`, `.melange-report__body h2`) MUST pasar a usar tokens donde sea posible (no magic numbers).
- **FR-008**: El refactor MUST NO romper el build (`bundle exec jekyll build` sin warnings) ni las 7 layouts existentes (default, dispositivo, poems, melange-report, imagen, codigo, generator, fragmentos-archive).
- **FR-009**: El sitio MUST seguir buildando el PR #33 (rastros-archive) sin conflictos visuales obvios.
- **FR-010**: Los tokens SHOULD estar en una sección comentada y ordenados (no mezclados con reglas), para que sean fáciles de localizar y extender.

### Key Entities *(include if feature involves data)*

- **Token de font-size**: variable CSS en `:root` con la forma `--fs-N` donde N es un índice de escala (1 = más grande, 6 = más chico). Valor recomendado: `clamp(min, vw, max)` para los niveles principales.
- **Token de line-height**: `--lh-tight` (1.1-1.2, títulos), `--lh-base` (1.5-1.7, body), `--lh-loose` (1.8-2, editorial).
- **Token de font-weight**: `--fw-regular` (400), `--fw-medium` (500), `--fw-semibold` (600), `--fw-bold` (700). Cormorant no carga 800/900 (regla del sitio), así que el techo es 700.
- **Escala de tamaños (propuesta)**: `--fs-1: clamp(2.2rem, 5.5vw, 3rem)` (display / melange title) · `--fs-2: clamp(1.85rem, 4.5vw, 2.4rem)` (h1 page-title / home) · `--fs-3: clamp(1.4rem, 3.5vw, 1.7rem)` (h2) · `--fs-4: clamp(1.1rem, 2.8vw, 1.3rem)` (h3) · `--fs-5: clamp(0.95rem, 2.2vw, 1.1rem)` (h4) · `--fs-6: 0.85rem` (h5/h6) · `--fs-body: clamp(0.95rem, 1.6vw, 1.05rem)` (p) · `--fs-small: 0.78rem` (meta/eyebrow).
- **Override contextual**: cuando un scope (`.poem-body`, `.melange-report__body`, `.codigo-page`) necesita un `line-height` o un `font-size` distinto del global, lo hace con tokens, no con magic numbers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Existen ≥ 13 tokens en `:root` (5+ font-size, 2+ line-height, 2+ font-weight, 4+ estructurales adicionales).
- **SC-002**: El 80%+ de los valores `font-size`, `line-height` y `font-weight` en `style.css` usan tokens (no magic numbers repetidos).
- **SC-003**: El `.rastros-header` se renderiza a un font-size visiblemente mayor que el `.rastros-lead` (verificable con DevTools).
- **SC-004**: Los 3 H1 shapes comparten `font-family` y `font-weight` (verificable con `getComputedStyle()`).
- **SC-005**: El sitio builda sin warnings (`bundle exec jekyll build`).
- **SC-006**: Ningún layout existente (default, dispositivo, poems, melange-report, imagen, codigo, generator, fragmentos-archive) tiene regresión visual obvia (manual smoke test).
- **SC-007**: Existe una regla global `p { ... }` con tokens.
- **SC-008**: La base rule de headings está consolidada (o ampliada a h1-h6, o acotada a h1-h3 con comentario).

## Assumptions

- La escala propuesta (1.05rem base, ratio ~1.25) es razonable para el feel editorial del sitio. Si el usuario quiere otra ratio (1.2, 1.333, 1.5) se ajusta post-feedback.
- Cormorant Garamond se mantiene como serif principal (regla del sitio, `docs/VISUAL-IDENTITY.md`).
- Los H1 shapes no se unifican al 100% — melange-report sigue siendo "display" (más grande, con eyebrow + subtitle) porque su contexto lo pide. Lo que se unifica es la base (family, weight, border, letter-spacing).
- H4+ se mantienen en el base rule (no se eliminan) por si el autor los necesita en el futuro, con un tamaño más chico y sin border.
- No se introducen nuevas dependencias (sin fuentes nuevas, sin preprocessor, solo CSS variables).
- Los magic numbers que sobreviven son los `clamp()` de cada token (esos son los "anclas" — está bien que vivan en `:root`).
- El refactor NO toca la escala del lab-feed (`.lab-text`, `.lab-kind`, `.lab-num`) porque ya tiene su propio sistema coherente (mono para meta, serif para body, micro-escala interna). Se documenta como excepción.
- El refactor NO toca los colores. Solo tipografía.
- Si el usuario quiere eliminar completamente la excepción del melange-report (unificar a un solo H1), se hace en un spec 008.

## Out of Scope

- Cambiar las familias de fuentes (Cormorant, Lato, JetBrains Mono se mantienen).
- Introducir una nueva fuente (Inter, Söhne, etc.).
- Refactorizar el sistema de colores (eso es spec 008+).
- Unificar los H1 al 100% (mantener melange-report como "display" con eyebrow + subtitle, pero compartir base).
- Refactorizar `.lab-text` / `.lab-kind` / `.lab-num` (su sistema interno ya es coherente).
- Refactorizar el sistema de espaciados (margin/padding) — solo font-size, line-height, weight.
- Agregar tokenización para colors, shadows, border-radius, etc.
- Touch el contenido markdown (frontmatter, etc.).
- Touch el JS.
- Touch la admin CMS.
