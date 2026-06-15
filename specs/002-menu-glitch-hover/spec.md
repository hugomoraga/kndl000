# Feature Specification: Refactor del Menú — Glitch RGB Split

**Feature Branch**: `002-menu-glitch-hover`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Puedes refactorizar el menu, ya no me gusta el efecto. Quiero que se vea una letras con glitch al hover"

**Context**: El menú de la home (`index.md`) es la "nube de palabras" (`<div class="nube-de-palabras">`) con 8 enlaces de sección. Hoy flota con `animation: flotar` (movimiento sutil del contenedor) y cada link orbita con `animation: orbitar` (translateY + rotate). Al hover hay `transform: scale(1.2) rotate(2deg)`. Un JS rAF (`nube-palabras.js`, ya consolidado en `home.bundle.js`) reescribe `transform` y `filter` por link, anulando las CSS animations y dejando la nube bajo control JS.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Glitch RGB split al hover (Priority: P1) 🎯 MVP

[Como visitante del sitio, al pasar el mouse sobre un enlace del menú, quiero ver un efecto de glitch RGB clásico donde las letras muestran un desplazamiento cian/rojo, para que el menú se sienta cyberpunk y no como un scale/rotate genérico.]

**Why this priority**: Es el corazón del refactor pedido. El efecto actual de `scale(1.2) rotate(2deg)` se siente anticuado; el glitch RGB es la estética propia del sitio (web hacker/terminal).

**Independent Test**: Inspeccionar el menú en `https://kundala000.com`, hover sobre "Fragmentos" → ver desplazamiento cromático animado (cian desplazado a la izquierda, rojo a la derecha, magenta al centro) que tiembla/varía. Mover el mouse fuera → vuelve a color y posición normal sin glitches residuales.

**Acceptance Scenarios**:

1. **Given** un enlace del menú en estado normal, **When** el usuario hace hover, **Then** se inicia una animación rAF que desplaza `text-shadow` con offsets aleatorios en cian (`#0ff`) y rojo (`#f0f`) durante ~400ms.
2. **Given** el enlace con glitch activo, **When** el mouse sale del enlace, **Then** la animación se cancela, `text-shadow` vuelve a 0 y la clase `--glitching` se elimina.
3. **Given** `prefers-reduced-motion: reduce`, **When** el usuario hace hover, **Then** NO se anima el glitch (se aplica un cambio estático: color blanco + un text-shadow muy sutil) para no provocar malestar.
4. **Given** un dispositivo con puntero coarse (touch), **When** el usuario toca el enlace, **Then** el glitch NO se dispara (solo al hover real con mouse).
5. **Given** un usuario navegando con teclado, **When** el enlace recibe `:focus`, **Then** se aplica el mismo tratamiento de glitch que en hover (a11y).

---

### User Story 2 - Eliminar orbitar por link y movimiento JS (Priority: P2)

[Como visitante, quiero que el menú esté mucho más quieto: que solo la nube entera flote muy lentamente como un fondo, y que cada palabra individual no orbite ni se mueva con rAF, para que el contenido sea legible y la atención vaya al hover.]

**Why this priority**: El JS actual (`nube-palabras.js` en el bundle) sobreescribe `transform` por link en cada frame, compitiendo con CSS y gastando CPU. Sin ese rAF, la página se siente más limpia y la batería del móvil dura más. Es la base para que el glitch de US1 destaque.

**Independent Test**: DevTools Performance → grabar 5s en el home con la nube visible → confirmar que no hay rAF loops continuos en `.nube-de-palabras a`. `grep orbitar style.css` no debe encontrar reglas activas.

**Acceptance Scenarios**:

1. **Given** la nube renderizada, **When** se mide el uso de CPU en el home, **Then** no hay frames rAF dedicados a la nube (solo el canvas#art y los loops de Tone.js si están activos).
2. **Given** el CSS actual, **When** se elimina `animation: orbitar` y la regla `prefers-reduced-motion`, **Then** la nube sigue flotando muy sutilmente con `flotar` (movimiento del contenedor, no de cada link).
3. **Given** el bundle actual, **When** se elimina el módulo `nube-palabras.js` del bundle, **Then** el bundle se reduce en ~3.5 KB y la nube sigue funcionando.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada `<a>` dentro de `.nube-de-palabras` MUST mostrar glitch RGB split al `:hover` y al `:focus-visible`.
- **FR-002**: El glitch MUST ser cancelable (al `:mouseleave` o `:blur`) sin residuos visuales.
- **FR-003**: El glitch MUST respetar `prefers-reduced-motion: reduce` (cambio estático en su lugar, sin rAF).
- **FR-004**: El glitch MUST NO dispararse en dispositivos `pointer: coarse` (touch).
- **FR-005**: La nube MUST mantener solo el movimiento `flotar` del contenedor (no `orbitar` por link).
- **FR-006**: El JS de animación rAF por link MUST eliminarse del bundle.
- **FR-007**: El `home.bundle.js` MUST reducir su tamaño tras quitar el módulo de nube.
- **FR-008**: El efecto de hover CSS antiguo (`scale(1.2) rotate(2deg)`) MUST eliminarse.
- **FR-009**: El bundle MUST seguir siendo válido (`node --check`) y el sitio MUST seguir construyendo (`bundle exec jekyll build`).

### Key Entities *(include if feature involves data)*

- **Glitch controller**: módulo JS dentro de `home.bundle.js` que aplica/quita el glitch por enlace via `mouseenter`/`mouseleave`/`focus`/`blur`, saltando si `(prefers-reduced-motion: reduce)` o `matchMedia('(pointer: coarse)').matches`.
- **Nube-de-palabras (CSS)**: reglas para el contenedor (flota muy sutil) y para cada `<a>` (sin orbitar, con clase `.is-glitching` que activa el text-shadow RGB).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al hacer hover en un enlace, la animación glitch corre a ~60fps durante 300-500ms y se cancela limpiamente al salir.
- **SC-002**: `home.bundle.js` reduce su tamaño en ≥3 KB al eliminar `nube-palabras.js`.
- **SC-003**: El CSS no contiene `orbitar` ni `scale(1.2) rotate(2deg)` ni `prefers-reduced-motion` referenciando el orbitar.
- **SC-004**: Lighthouse Performance no empeora; Accessibility no empeora (focus debe verse igual que hover).
- **SC-005**: El sitio construye y se sirve idénticamente en el resto de páginas (no es un cambio cross-site).

## Assumptions

- El usuario quiere mantener el **flotar muy sutil** de la nube (decidido en preguntas de clarificación) → no se quita `flotar`, solo `orbitar` y el JS.
- El "glitch RGB clásico" se interpreta como `text-shadow` con 2-3 capas (cian + magenta/rojo) animadas vía rAF, NO se usan caracteres aleatorios ni clip-path.
- El sitio no usa prefers-color-scheme ni dark mode toggle; el glitch usa los mismos colores cian/magenta independientemente del tema.
- p5.js sigue cargándose en el layout pero no se usa para este efecto (sería overkill).
