# Feature Specification: Umbral Vision — Overhaul de UX/UI

**Feature Branch**: `011-umbral-vision-ux-ui`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "hacer mejoras de UX/UI, performance y creativas" — esta spec cubre el componente UX/UI.

**Context**: El generador visual `/visual/generator/` se renderiza con el layout `_layouts/generator.html` (36 líneas, todo inline). El panel de controles actual (`<div id="controls">`) es un strip horizontal de 7 elementos sin estilo: `<select>` nativo, `<input type="checkbox">`, `<input type="range">`, dos `<button>` con emojis como contenido, una barra de nivel de audio (4px de alto) y un enlace "↩". No hay thumbnails de efectos, no hay búsqueda, no hay presets, no hay shortcuts de teclado, no es responsive (en mobile se ve roto), y la única indicación del estado es texto plano en los botones. El objetivo es llevarlo a una experiencia pulida, inmersiva, descubrible y mobile-friendly sin perder la estética minimalista del blog `kndl000`.

Depende de: spec 010 (paquete npm + submodule) — presupone que `umbral-vision` ya es un paquete independiente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Panel de controles colapsable con estética coherente (Priority: P1) 🎯 MVP

[Como visitante que llega al generador, quiero un panel de controles visible pero no invasivo, que pueda colapsar para ver el efecto a pantalla completa con un click o tecla, y que respete la estética tipográfica y cromática del sitio.]

**Why this priority**: Es el cambio visible más impactante y el que quita el primer punto de fricción (los controles actuales son feos y tapan parte del canvas). Es el "wow factor" mínimo para una demo pública.

**Independent Test**: Abrir `/visual/generator/`, ver panel arriba a la izquierda con tipografía coherente al blog, glassmorphism sutil. Click en el chevron → panel colapsa en 200ms, canvas ocupa el 100%. Click de nuevo → expande. Tecla `H` → toggle.

**Acceptance Scenarios**:

1. **Given** el panel actual es un strip horizontal feo, **When** aplico el nuevo CSS, **Then** el panel es fixed top-left, ancho máx 360px, fondo `rgba(0,0,0,0.4)` con `backdrop-filter: blur(12px)`, borde sutil, tipografía `Newsreader` (la del blog).
2. **Given** el panel renderizado, **When** hago click en el chevron o presiono `H`, **Then** el panel colapsa con animación CSS de 200ms (`max-height`, `opacity`).
3. **Given** el panel colapsado, **When** muevo el mouse al top-left, **Then** un hint visual (botón chevron flotante) sugiere la acción.
4. **Given** un visitante móvil (≤768px), **When** carga la página, **Then** el panel ocupa el bottom 30vh, swipe down lo oculta, swipe up lo muestra.

---

### User Story 2 - Selector de efectos con thumbnails y shortcuts (Priority: P1) 🎯 MVP

[Como visitante, quiero ver una preview miniatura de cada efecto en lugar de leer una lista de nombres, y poder cambiar de efecto con teclas numéricas 1-9 sin buscar el select.]

**Why this priority**: Es el segundo punto de fricción: 11 efectos en un `<select>` nativo es inmanejable. Thumbnails + shortcuts lo hacen descubrible y rápido.

**Independent Test**: Abrir `/visual/generator/`, ver grid 3×4 de thumbnails (preview renderizado en canvas 64×64, primer frame del efecto). Click en thumbnail → cambia. Presionar `1` a `9` y `0`, `-`, `=` → cambia al efecto N. Arrow keys → siguiente/anterior.

**Acceptance Scenarios**:

1. **Given** el `<select>` actual, **When** lo reemplazo por un grid de thumbnails, **Then** cada thumbnail muestra un preview vivo del efecto (canvas 80×80 con el efecto corriendo a 5fps).
2. **Given** los thumbnails renderizados, **When** presiono `1`, **Then** cambia al primer efecto disponible; `2` al segundo; etc. hasta `9`.
3. **Given** 11 efectos (más de 9), **When** uso `0`, `-`, `=`, **Then** accedo a los efectos 10, 11, 12 (extendible).
4. **Given** los arrow keys (`←` `→`), **When** los presiono, **Then** navego al efecto anterior/siguiente con wrap-around.
5. **Given** el efecto activo, **When** lo veo en el grid, **Then** tiene un borde brillante (`box-shadow: 0 0 0 2px var(--accent)`).
6. **Given** un thumbnail con hover, **When** paso el mouse, **Then** se eleva 2px y muestra tooltip con el nombre legible (del `EFFECT_LABELS` actual).

---

### User Story 3 - Indicador de nivel de audio rediseñado (Priority: P2)

[Como visitante con el micrófono activo, quiero ver el nivel de audio de forma visualmente rica (no una barra verde de 4px), con feedback suficiente para entender cómo los visuales van a reaccionar.]

**Why this priority**: La barra actual (`#audioLevelBar`) es invisible y críptica. Mejorarla es quick win visual.

**Independent Test**: Activar micrófono, ver indicador expandido: círculo pulsante con nivel + barras de frecuencia FFT en mini-canvas. Sin activar, indicador oculto.

**Acceptance Scenarios**:

1. **Given** micrófono OFF, **When** miro la zona del indicador, **Then** no hay nada visible (clean look).
2. **Given** micrófono ON, **When** hay sonido ambiente, **Then** un círculo central de 16px radio late con `transform: scale(1 + level * 0.5)`.
3. **Given** micrófono ON, **When** hay sonido, **Then** 16 barras verticales (FFT bins) muestran el espectro, normalizadas a 0-1.
4. **Given** level > 0.9, **When** ocurre un peak, **Then** el círculo cambia a `var(--accent-warm)` (rojo/naranja) por 100ms.

---

### User Story 4 - Sistema de presets (Priority: P2)

[Como visitante, quiero guardar la combinación actual (efecto + parámetros) como preset con nombre, y poder cargarlo después con un click, para no perder configuraciones que me gustan.]

**Why this priority**: Diferenciador de otros generadores online. Vale el esfuerzo pero no es MVP.

**Independent Test**: Configurar efecto `mandala` + intervalo `15s` + mic ON. Click "Guardar preset" → modal pide nombre → "Mi vibe". Volver mañana → preset persiste en `localStorage`. Click → restaura estado.

**Acceptance Scenarios**:

1. **Given** un estado de generador, **When** click en "💾 Guardar preset", **Then** se abre un modal pidiendo nombre (input text + Enter para confirmar, Esc para cancelar).
2. **Given** un nombre ingresado, **When** confirmo, **Then** el preset se guarda en `localStorage` bajo clave `umbral-vision:presets` como array de `{ id, name, state, createdAt }`.
3. **Given** presets guardados, **When** abro el dropdown de presets, **Then** veo la lista con nombre y preview (mini-canvas del efecto).
4. **Given** un preset seleccionado, **When** click, **Then** restaura efecto + transición + estado de audio (mic ON/OFF según se haya guardado).
5. **Given** un preset, **When** click derecho o long-press, **Then** menú contextual con "Renombrar", "Duplicar", "Borrar".
6. **Given** primer preset guardado, **When** el panel lo muestra, **Then** aparece un toast `Preset "X" guardado` que se desvanece en 2s.

---

### User Story 5 - Onboarding / First-run experience (Priority: P3)

[Como visitante nuevo, quiero un overlay sutil la primera vez que entro al generador que me muestre los shortcuts principales y los controles, sin tener que explorar a ciegas.]

**Why this priority**: Pulido UX, no bloqueante. Diferencia "producto cuidado" de "demo rápida".

**Independent Test**: Primera visita (sin flag en `localStorage`), overlay aparece con 4 tips animados secuencialmente ("Presiona 1-9 para cambiar efecto", "Espacio para auto-transición", "F para fullscreen", "H para ocultar panel"). Click "Entendido" o tecla Esc → cierra, setea flag.

**Acceptance Scenarios**:

1. **Given** primera visita (`!localStorage['umbral-vision:onboarded']`), **When** carga `/visual/generator/`, **Then** overlay aparece 800ms después de que el primer frame se renderiza (no antes).
2. **Given** el overlay visible, **When** pasan 6s sin interacción, **Then** se cierra solo y setea el flag (no interrumpe si el usuario está mirando el efecto).
3. **Given** el overlay visible, **When** el usuario interactúa (click, tecla), **Then** se cierra inmediatamente y setea el flag.
4. **Given** el flag seteado, **When** vuelvo a entrar, **Then** el overlay no aparece más. Hay un link "¿Cómo funciona?" en el panel que lo reabre manualmente.

---

### User Story 6 - Captura y share (Priority: P3)

[Como visitante, quiero capturar el frame actual como PNG y compartir el estado del generador vía URL, para mostrarle a alguien lo que estoy viendo.]

**Why this priority**: Feature social/difusión. Bajo esfuerzo (p5.js + `canvas.toBlob` + `URLSearchParams`), alto valor narrativo para un blog.

**Independent Test**: Click "📸 Capturar" → descarga `umbral-vision-{timestamp}.png`. Click "🔗 Compartir" → copia URL `https://kundala000.com/visual/generator/?effect=tunnel&interval=10` al clipboard, toast confirma.

**Acceptance Scenarios**:

1. **Given** un frame del canvas activo, **When** click "📸", **Then** se genera un Blob del canvas como PNG y se dispara descarga con nombre `umbral-vision-{ISO timestamp}.png`.
2. **Given** el estado actual (effect + interval + audioEnabled), **When** click "🔗", **Then** se construye URL con query params y se copia al clipboard vía `navigator.clipboard.writeText`.
3. **Given** URL compartida con query params, **When** se abre en otro browser, **Then** el generador arranca con esos parámetros (effect, interval, audio).
4. **Given** la captura PNG, **When** la abro, **Then** muestra el frame tal cual estaba en pantalla (sin watermark por ahora; spec P3rd).

---

### Edge Cases

- ¿Qué pasa si el usuario tiene `prefers-reduced-motion: reduce`? → Todas las animaciones de UI (transición del panel, scale del círculo de audio, hover lifts) se reducen a `transition: none` o `transform: none`. El canvas sigue animando porque es el contenido, no chrome.
- ¿Qué pasa en un mobile con poca RAM (Safari iOS)? → Los thumbnails se renderizan a 5fps no a 60fps; si el device reporta `navigator.deviceMemory < 4`, se desactiva el preview vivo y se muestra un placeholder con el nombre del efecto.
- ¿Qué pasa si localStorage está bloqueado (modo incógnito Safari)? → Presets caen a memoria de la sesión (array en memoria, no persistente); se muestra un toast al guardar "Los presets no persistirán al cerrar esta ventana".
- ¿Qué pasa si el clipboard API no está disponible (HTTP, no HTTPS)? → Fallback a un modal con la URL en un `<input readonly>` que el usuario puede copiar manualmente.
- ¿Qué pasa si el visitante presiona teclas mientras está escribiendo en un input? → Shortcuts se ignoran cuando `document.activeElement.tagName === 'INPUT'`.
- ¿Qué pasa si el visitante comparte URL con effect inválido (`?effect=foo`)? → Fallback a `'tunnel'` con toast `"Efecto 'foo' no disponible, usando 'tunnel'"`.
- ¿El panel bloquea el click en el canvas? → El canvas está debajo (`z-index: 0`); el panel está arriba (`z-index: 10`); los clicks al canvas sólo se capturan en las zonas no cubiertas por el panel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel de controles MUST ser un componente reutilizable con estados `expanded` y `collapsed`, persistido en `localStorage` bajo `umbral-vision:panel-state`.
- **FR-002**: El selector de efectos MUST ser un grid de thumbnails (no un `<select>`), con preview vivo del efecto.
- **FR-003**: Los shortcuts de teclado `1`-`9`, `0`, `-`, `=` MUST cambiar al efecto N (1-indexed). `←`/`→` navegan. `Espacio` toggle auto-transición. `F` fullscreen. `H` toggle panel. `M` toggle mic. `?` toggle onboarding.
- **FR-004**: Los shortcuts MUST ignorarse cuando el focus está en un `<input>`, `<textarea>` o `[contenteditable]`.
- **FR-005**: El indicador de nivel de audio MUST ser un círculo pulsante + barras FFT, visible sólo cuando el mic está ON.
- **FR-006**: El sistema de presets MUST persistir en `localStorage` bajo `umbral-vision:presets` como array JSON; debe sobrevivir recargas.
- **FR-007**: El onboarding MUST aparecer sólo en la primera visita (flag `umbral-vision:onboarded`) y debe poder reabrirse desde un link en el panel.
- **FR-008**: La captura MUST generar un PNG con timestamp ISO en el nombre y descargarse vía Blob URL.
- **FR-009**: El share MUST copiar al clipboard una URL con query params (`?effect=X&interval=Y&audio=Z`) y al abrirse esa URL el estado debe restaurarse.
- **FR-010**: El layout MUST ser responsive: en viewports ≤768px el panel pasa a bottom-sheet con swipe gesture.
- **FR-011**: El CSS MUST respetar `prefers-reduced-motion: reduce` desactivando todas las animaciones de chrome (no del canvas).
- **FR-012**: La tipografía y paleta MUST ser coherentes con el sitio `kndl000` (Newsreader para texto, accent ya definido en `_includes/head-css.html`).
- **FR-013**: Los thumbnails MUST usar `navigator.deviceMemory` (si está disponible) para degradar a placeholder estático en devices con <4GB RAM.

### Key Entities *(include if feature involves data)*

- **PanelState**: `{ expanded: boolean }` persistido en `localStorage`.
- **Preset**: `{ id: string (uuid), name: string, state: { effect: string, interval: number, audioEnabled: boolean }, createdAt: ISO string }`.
- **ShareURL**: query string `?effect=<name>&interval=<seconds>&audio=<0|1>` parseada al cargar.
- **OnboardingFlag**: `localStorage['umbral-vision:onboarded'] = '1'`.
- **EffectThumbnail**: par `{ effectName, previewCanvas, label }` generado al inicializar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lighthouse Accessibility del `/visual/generator/` ≥95 (vs baseline a capturar en T002).
- **SC-002**: Lighthouse Performance ≥85 en mobile (Moto G4 simulated).
- **SC-003**: Todos los shortcuts de teclado responden en <50ms desde keydown hasta cambio visible.
- **SC-004**: El grid de thumbnails renderiza en <500ms desde el load (incluyendo 11 previews vivos).
- **SC-005**: El sistema de presets sobrevive a un reload (verificado con `localStorage.getItem` después de F5).
- **SC-006**: Una URL con `?effect=mandala` restaura ese efecto al cargar en <300ms.
- **SC-007**: En un viewport 375×667 (iPhone SE), el panel no tapa el canvas más del 30% del área visible.
- **SC-008**: Con `prefers-reduced-motion: reduce`, no hay transición de UI >50ms (animaciones de chrome desactivadas).
- **SC-009**: La captura PNG es idéntica pixel-by-pixel al frame en pantalla (sin overlays del panel en la captura).

## Assumptions

- El sitio `kndl000` ya tiene variable CSS `--accent` y la tipografía `Newsreader` cargada (verificado en `_includes/head-css.html`).
- El paquete `@hugomoraga/umbral-vision@^0.1.0` está publicado y `kndl000` lo consume (spec 010 completada).
- `navigator.clipboard.writeText` está disponible en HTTPS (kundala000.com sirve HTTPS).
- Los thumbnails de preview no necesitan ser idénticos al efecto real; sirven como "vibe preview" (1 frame representativo).
- El onboarding se cierra automáticamente sin ser intrusivo (después de 6s); visitante puede reabrirlo si quiere.
- Las animaciones del canvas (no del UI) NO se ven afectadas por `prefers-reduced-motion`; siguen siendo el contenido.
- El grid de thumbnails asume ≤20 efectos. Spec 013 puede ampliarlo; este diseño escala a ~20 sin refactor.