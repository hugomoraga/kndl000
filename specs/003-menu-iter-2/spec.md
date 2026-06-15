# Feature Specification: Menú iter 2 — Una línea + Glitch de caracteres

**Feature Branch**: `003-menu-iter-2`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Actualmente el menu no entra en una sola linea. que me recomiendas hacer. ademas no veo el menu glitch"

**Context**: El menú de la home (`.nube-de-palabras`) en `index.md` tiene 8 items con emojis + texto (☍ Fragmentos, ↂ Poemas, 𝄞 Música, ◉ Visual, 🜏 Melange, ◊ Código, ◇ Devices, ꩜ Generator). En desktop >1024px no entran en una sola línea. El glitch RGB split del feature 002-menu-glitch-hover tiene `MAX_OFFSET=2.5px` con `font-size=1.2rem` → apenas se nota.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menú en una sola línea en desktop (Priority: P1) 🎯 MVP

[Como visitante en desktop, quiero ver los 8 items del menú en una sola fila horizontal, sin wrap, para que la navegación sea escaneable de un vistazo y se sienta como un menú real.]

**Why this priority**: Es la queja principal del usuario. Sin esto el menú se siente roto.

**Independent Test**: Abrir `https://kundala000.com` en viewport ≥1024px → los 8 enlaces del menú deben estar en una sola fila. En móvil (<768px) se permite wrap a varias filas (el panel móvil ya tiene su propio patrón).

**Acceptance Scenarios**:

1. **Given** viewport 1024px, **When** se renderiza el home, **Then** los 8 items del menú están en una sola línea horizontal sin wrap.
2. **Given** viewport 1280px, **When** se renderiza el home, **Then** el menú sigue en una sola línea con gap uniforme.
3. **Given** viewport <768px, **When** se renderiza el home, **Then** el menú puede hacer wrap (el comportamiento móvil queda intacto; el panel de nav móvil ya tiene su propio flujo).
4. **Given** el font-size reducido, **When** se mide, **Then** el menú no se ve "apretado" — debe haber padding lateral suficiente para no tocar los bordes.
5. **Given** el menú, **When** se inspecciona el CSS, **Then** cada `<a>` tiene `white-space: nowrap` para que las palabras no se rompan en 2 líneas.

---

### User Story 2 - Glitch de caracteres random al hover (Priority: P1)

[Como visitante en desktop, al hacer hover sobre un enlace del menú, quiero que cada carácter de la palabra se reemplace aleatoriamente por un símbolo glitch (▓▒░█▄▀■□◊◈◉○) durante 80-150ms y luego vuelva al original, en 3-5 ciclos, para que el efecto sea claramente visible sin importar el tamaño del texto.]

**Why this priority**: El RGB split con 2.5px sobre fuente de 1.2rem es prácticamente invisible. Los caracteres random dan un efecto claro y "terminal" que casa con la estética del sitio.

**Independent Test**: Hover sobre "Fragmentos" durante 1s → ver caracteres glitch (▒▓█░) reemplazando las letras originales en ráfagas, volviendo al texto normal en los ~600ms totales. Múltiples ciclos. Al sacar el mouse, vuelve inmediatamente al original.

**Acceptance Scenarios**:

1. **Given** un enlace en estado normal ("Fragmentos"), **When** se hace hover, **Then** en cada frame (~60fps) cada carácter tiene probabilidad ~25% de ser reemplazado por un símbolo random del set `[▒▓█░▄▀■□◊◈◉○]`, manteniendo la longitud.
2. **Given** el efecto activo, **When** se observa 600ms, **Then** hay ≥3 ciclos completos de glitch (cada ciclo es ~150-200ms).
3. **Given** el efecto activo, **When** el mouse sale del enlace, **Then** el texto vuelve al original inmediatamente y se cancela el rAF.
4. **Given** el efecto activo, **When** el usuario navega con teclado (`:focus-visible`), **Then** se aplica el mismo efecto.
5. **Given** `prefers-reduced-motion: reduce`, **When** se hace hover, **Then** NO se anima el glitch; en su lugar se aplica un cambio estático (color blanco + un text-shadow cian suave).
6. **Given** `pointer: coarse` (touch), **When** el usuario toca el enlace, **Then** NO se dispara el glitch.
7. **Given** el texto original contiene emojis/símbolos Unicode (☍ ↂ 𝄞 ◉ 🜏 ◊ ◇ ꩜), **When** se hace hover, **Then** el efecto se aplica letra por letra pero los emojis se preservan (no se reemplazan por glitch).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El contenedor `.nube-de-palabras` MUST mantener `flex-wrap: wrap` para que en móvil siga wrappeando.
- **FR-002**: Cada `<a>` dentro de `.nube-de-palabras` MUST tener `white-space: nowrap` y un font-size que permita los 8 items en una sola fila en viewports ≥1024px.
- **FR-003**: El font-size MUST respetar el principio de legibilidad: ≥0.7rem (no más pequeño) y ≤1rem en desktop.
- **FR-004**: El gap entre items MUST ser uniforme y `clamp(0.3rem, 1vw, 0.8rem)` (reducido del actual).
- **FR-005**: El JS de glitch MUST leer el texto original del enlace, partirlo por carácter, y en cada frame construir un nuevo string con probabilidad de替换.
- **FR-006**: El set de caracteres glitch MUST ser: `▒▓█░▄▀■□◊◈◉○` (10 símbolos, estética terminal).
- **FR-007**: El efecto MUST respetar `prefers-reduced-motion: reduce` (cambio estático) y `pointer: coarse` (sin efecto).
- **FR-008**: El efecto MUST dispararse en `:hover` y `:focus-visible` y cancelarse en `:mouseleave` / `:blur`.
- **FR-009**: El rAF MUST auto-cancelarse a los ~600ms aunque el cursor siga sobre el enlace.
- **FR-010**: El módulo `menu-glitch.js` actual (RGB split con text-shadow) MUST eliminarse y reemplazarse por este nuevo enfoque.
- **FR-011**: El bundle final MUST seguir siendo válido (`node --check`).
- **FR-012**: El sitio MUST seguir construyendo y desplegando sin regresiones.

### Key Entities *(include if feature involves data)*

- **Char-glitch controller**: módulo JS dentro de `home.bundle.js` que mantiene el texto original de cada enlace, ejecuta rAF durante ~600ms sustituyendo caracteres random, restaura al final.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En viewport 1280px, los 8 items del menú están en una sola línea (verificable inspeccionando `flex-wrap: nowrap` o contando filas con getBoundingClientRect).
- **SC-002**: Al hacer hover sobre cualquier enlace, el efecto glitch es claramente visible: se ven caracteres glitch reemplazando las letras al menos 3 veces en 600ms.
- **SC-003**: `home.bundle.js` no crece más del 10% (el nuevo módulo debe ser similar o menor al anterior).
- **SC-004**: Lighthouse Performance no empeora; Accessibility no empeora.
- **SC-005**: Build local + CI en verde.

## Assumptions

- El usuario está en desktop con viewport ≥1024px; en móvil el wrap es aceptable.
- Los 8 items son fijos (no se añaden más); si en el futuro se añaden, podría romperse la regla de "una línea".
- Los emojis Unicode (☍ ↂ 𝄞 ◉ 🜏 ◊ ◇ ꩜) cuentan como 1 "letra" y NO se reemplazan durante el glitch.
- El sitio sigue usando `font-family: var(--font-serif)` para los links; el glitch usa el mismo font.
- No hay dark mode; el set de glitch (símbolos) se ve bien en el fondo oscuro/negro actual.
