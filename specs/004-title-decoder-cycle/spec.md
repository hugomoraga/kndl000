# Feature Specification: Title Decoder Cycle

**Feature Branch**: `004-title-decoder-cycle`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Añade a cenizas un efecto similar pero que sea un pool caracteres y letras y que al final se arme la palabra cenizas. y que no sea por hover si no por time cada 10 segundos"

**Context**: El `<h1 id="cenizas" class="home-header__title">C.E.N.I.Z.A.S</h1>` de la home (`index.md:11`) es el título del sitio. Ahora es estático. El usuario quiere un efecto "decoder" tipo Matrix/terminal donde cada carácter se scramblea aleatoriamente durante ~1-1.5s y luego se asienta en "C.E.N.I.Z.A.S", repetido automáticamente cada 10s (no en hover).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scramble cíclico del título cada 10s (Priority: P1) 🎯 MVP

[Como visitante del sitio, quiero ver que el título "C.E.N.I.Z.A.S" se scramblea automáticamente cada 10 segundos usando un pool mixto de letras latinas y glifos, y luego se asienta letra por letra en su forma final, para que el sitio se sienta vivo y refuerce la estética terminal/hacker.]

**Why this priority**: Es el cambio pedido. Da movimiento al hero sin requerir interacción del usuario y refuerza la identidad visual (decoder = terminal/cyberpunk).

**Independent Test**: Cargar `https://kundala000.com`, esperar 10s → ver scramble de "C.E.N.I.Z.A.S" durante ~1.2s, luego se queda legible 8.8s, vuelve a scramblear a los 10s. Los puntos `.` se mantienen fijos durante todo el ciclo. En `prefers-reduced-motion: reduce` no se scramblea (queda estático).

**Acceptance Scenarios**:

1. **Given** la página cargada, **When** pasan 10s desde la carga, **Then** el `<h1>` empieza un ciclo de scramble que dura ~1.2s y termina asentado en "C.E.N.I.Z.A.S".
2. **Given** el ciclo de scramble, **When** se observa, **Then** los puntos `.` se mantienen fijos y solo las 7 letras (C, E, N, I, Z, A, S) se reemplazan.
3. **Given** el título settled, **When** pasan otros 10s, **Then** arranca otro ciclo idéntico.
4. **Given** el pool de caracteres, **When** se reemplaza una letra, **Then** el carácter random viene del pool mixto `▒▓█░▄▀■□◊◈◉○ABCDEFGHIJKLMNOPQRSTUVWXYZ` (10 glifos + 26 letras = 36 chars).
5. **Given** la fase de "asentamiento" del scramble, **When** se observa, **Then** las letras se van fijando una a una (no todas a la vez) en los últimos 400-600ms.
6. **Given** `prefers-reduced-motion: reduce`, **When** la página carga, **Then** el título queda estático en "C.E.N.I.Z.A.S" sin animación.
7. **Given** `prefers-reduced-motion: reduce`, **When** se observa la página, **Then** NO se ejecuta ningún rAF para el scramble.
8. **Given** el efecto, **When** se mide con DevTools Performance, **Then** el rAF solo corre durante los ~1.2s del scramble, no en bucle continuo.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El JS MUST localizar el `<h1 id="cenizas">` y mantener su texto original "C.E.N.I.Z.A.S" en `dataset.originalText`.
- **FR-002**: El JS MUST separar el texto en dos tipos: caracteres fijos (puntos `.`) y caracteres scramblables (las 7 letras).
- **FR-003**: El pool de caracteres random MUST ser `▒▓█░▄▀■□◊◈◉○ABCDEFGHIJKLMNOPQRSTUVWXYZ` (10 glifos + 26 letras = 36 chars).
- **FR-004**: El ciclo MUST durar ~1200ms total: ~700ms de scramble puro + ~500ms de asentamiento letra por letra.
- **FR-005**: El ciclo MUST repetirse automáticamente cada 10000ms (10s) desde el fin del ciclo anterior.
- **FR-006**: El JS MUST respetar `prefers-reduced-motion: reduce` (no se ejecuta nada).
- **FR-007**: El JS MUST añadir el módulo como módulo 8 del bundle (después de menu-char-glitch).
- **FR-008**: El `<h1>` MUST seguir siendo texto literal en el HTML (no `<span>` por letra) para que screen readers y SEO lo lean correctamente.
- **FR-009**: El bundle MUST seguir siendo válido (`node --check`).

### Key Entities *(include if feature involves data)*

- **Title decoder**: módulo JS dentro de `home.bundle.js` que mantiene el texto original, ejecuta un ciclo de scramble con asentamiento, agenda el siguiente con `setTimeout`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A los 10s de cargar la página, el scramble arranca automáticamente.
- **SC-002**: El scramble dura ~1.2s y luego el texto se queda legible hasta el próximo ciclo.
- **SC-003**: El rAF solo corre durante el scramble (~1.2s cada 10s = 12% de uso de CPU vs 100% de un loop continuo).
- **SC-004**: `home.bundle.js` no crece más del 5% (módulo pequeño, ~30 líneas).
- **SC-005**: El sitio construye y el módulo se sirve correctamente.

## Assumptions

- El título se mantiene en `C.E.N.I.Z.A.S` con puntos (decidido en clarificación).
- El pool mixto (glifos + letras) es definitivo (decidido en clarificación).
- El usuario no quiere afectar `<h1>` visualmente (font-size, color); solo el contenido de texto.
- El efecto NO se pausa al hacer hover sobre el título; es independiente de la interacción.
- El ciclo de 10s empieza a contar desde `DOMContentLoaded` (no desde `window.load`).
- `prefers-reduced-motion: reduce` se respeta al 100% (ni siquiera el asentamiento).
