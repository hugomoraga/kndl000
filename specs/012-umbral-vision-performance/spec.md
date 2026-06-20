# Feature Specification: Umbral Vision — Performance

**Feature Branch**: `012-umbral-vision-performance`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "hacer mejoras de UX/UI, performance y creativas" — esta spec cubre el componente performance.

**Context**: El generador visual corre a ~30–45fps en desktop promedio y cae a <15fps en mobile gama media (medido informalmente con DevTools Performance panel). El código actual presenta varios anti-patterns que limitan el framerate: (a) cada frame llama a `getInputValue()` que hace `document.getElementById()` repetidamente (`assets/js/umbral-vision/Effects.js:22,23,24,25`); (b) `Effects.js` tiene 942 LOC con efectos que dibujan 100–300 elementos sin pooling ni `push/pop` matrix; (c) `AudioReactive.js` actualiza el `level` por un único `requestAnimationFrame` global que corre aún sin audio activo; (d) `p5.js` se carga de forma síncrona via CDN (~900 KB minified) bloqueando el render inicial; (e) no hay `devicePixelRatio` cap, por lo que en pantallas Retina el canvas se renderiza a 2×–3× la resolución. El objetivo es alcanzar 60fps estables en desktop y ≥30fps en mobile gama media sin sacrificar la estética.

Depende de: spec 010 (paquete npm + submodule), spec 011 (UI overhaul).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frame budget estable a 60fps en desktop (Priority: P1) 🎯 MVP

[Como visitante en desktop, quiero que el generador corra a 60fps estables (sin drops perceptibles) durante el render de cualquier efecto, para que la experiencia sea fluida.]

**Why this priority**: Es el baseline mínimo. Sin esto, ningún efecto nuevo o feature creativa tiene sentido porque la base no es performante.

**Independent Test**: Abrir `/visual/generator/` en Chrome desktop con DevTools Performance panel, grabar 10s, verificar que el frame budget ≤16.7ms en el percentil 95. El medidor debe mostrar 60fps (16ms green).

**Acceptance Scenarios**:

1. **Given** un desktop promedio (MacBook Air M1 / Intel i5 equivalente), **When** corro el generador con cualquier efecto por 10s, **Then** el FPS counter integrado reporta ≥58fps (5% margen).
2. **Given** un efecto pesado como `tunnel` (100 elipses) o `spiral` (300 segmentos), **When** activo el audio reactivo simultáneamente, **Then** el framerate no cae >10%.
3. **Given** un desktop con pantalla Retina (DPR=2), **When** renderiza, **Then** el `devicePixelRatio` está capado a 1.5 (vs 2.0) para mantener 60fps sin sacrificar sharpness visual.

---

### User Story 2 - Mobile gama media ≥30fps (Priority: P1) 🎯 MVP

[Como visitante en mobile gama media (Android con Snapdragon 600-series / iPhone 8), quiero que el generador corra al menos a 30fps sin que el teléfono se sobrecaliente.]

**Why this priority**: El 50%+ del tráfico de blogs personales es mobile. Si mobile es injugable, la mitad del público se va.

**Independent Test**: Abrir `/visual/generator/` en un Android gama media (o Chrome DevTools con throttling CPU 4× + network Fast 3G), verificar ≥30fps sostenido por 30s, temperatura del dispositivo estable (no aumenta más de 5°C).

**Acceptance Scenarios**:

1. **Given** un mobile con `navigator.hardwareConcurrency < 6`, **When** cargo el generador, **Then** automáticamente se activa un "modo lite" que reduce counts de elementos (100 → 50 elipses, 300 → 150 segmentos).
2. **Given** un mobile con `navigator.deviceMemory < 4`, **When** activo un efecto pesado, **Then** se sugiere vía toast: "Modo lite activado por hardware limitado" y se persiste en `localStorage`.
3. **Given** un mobile gama media, **When** corro el generador por 5 minutos, **Then** la temperatura del dispositivo no se vuelve incómoda al tacto (validación manual).
4. **Given** un mobile con pantalla DPR≥2, **When** renderiza, **Then** el DPR se capa a 1.0 (no Retina) para reducir la carga de pixels 4×.

---

### User Story 3 - Carga diferida del bundle y de p5.js (Priority: P2)

[Como visitante, quiero que la página `/visual/generator/` muestre contenido (preview estático o efecto ya renderizado) en <1s, sin esperar a que p5.js (~900 KB) se baje y parsee.]

**Why this priority**: Time-to-interactive impacta bounce rate. Aunque no es estrictamente "performance de render", la primera impresión cuenta.

**Independent Test**: Lighthouse Performance ≥85 en mobile simulated. FCP <1.5s, LCP <2.5s, TTI <3s.

**Acceptance Scenarios**:

1. **Given** la página, **When** se carga, **Then** p5.js se carga con `<script defer>` o vía dynamic import (`import('https://cdn.../p5.min.js')`) sólo cuando se confirma intención del usuario (o después del primer paint).
2. **Given** el bundle del framework, **When** se importa, **Then** se sirve con `Content-Encoding: br` o `gzip` y `Cache-Control: public, max-age=31536000` (inmutable, content-hashed).
3. **Given** una visita repetida, **When** se carga, **Then** el bundle está en cache del browser; sólo se baja si cambió el hash (cache busting por filename).

---

### User Story 4 - Audio analyzer eficiente (Priority: P2)

[Como visitante, quiero que activar el micrófono no degrade el framerate, y que desactivarlo libere los recursos (CPU + memoria) inmediatamente.]

**Why this priority**: Audio context es notoriamente leak-prone. Sin cleanup correcto, una SPA puede consumir 100MB+ en pocas horas.

**Independent Test**: Con audio OFF, `AudioContext.state === 'closed'`. Con audio ON, el `analyser` se actualiza en un loop separado del render loop (requestAnimationFrame compartido), no en un timer independiente.

**Acceptance Scenarios**:

1. **Given** audio OFF, **When** inspecciono el memory snapshot en DevTools, **Then** no hay `AudioContext` ni `MediaStream` activos.
2. **Given** audio ON, **When** desactivo, **Then** `MediaStreamTrack.stop()` se llama en cada track y `audioContext.close()` se ejecuta.
3. **Given** audio ON, **When** cambio de tab y vuelvo, **Then** el `AudioContext` se reanuda automáticamente si fue suspendido por la política de autoplay.
4. **Given** audio ON, **When** el `level` y `frequencyData` se leen en el render loop, **Then** no hay un `setInterval` o `requestAnimationFrame` separado para el audio (es un solo loop compartido).

---

### User Story 5 - Effects optimizados (object pooling, matrix push/pop, cached values) (Priority: P3)

[Como mantenedor, quiero que los efectos existentes (`tunnel`, `spiral`, etc.) usen patrones eficientes (object pooling para partículas, `push()/pop()` para transforms, cacheo de valores que no cambian entre frames), para que escalar a efectos más complejos no degrade el framerate.]

**Why this priority**: Refactor profundo del código existente. Importante para escalar pero no bloqueante.

**Independent Test**: Antes/después medido con DevTools Performance. Por cada efecto, el tiempo de `draw()` baja ≥30%.

**Acceptance Scenarios**:

1. **Given** el efecto `particles`, **When** lo refactoreo, **Then** uso object pooling (array de N partículas reutilizadas) en vez de crear/destruir objetos por frame.
2. **Given** el efecto `tunnel`, **When** lo refactoreo, **Then** los `translate()` están envueltos en `push()/pop()` en vez de aplicarse globalmente al canvas.
3. **Given** cualquier efecto, **When** lee un valor del DOM (input, slider), **Then** se cachea en `setup()` o en un `useEffect`-like hook, no se relee cada frame.
4. **Given** cualquier efecto, **When** computa un valor constante (e.g. `Math.PI * 2`), **Then** se precomputa fuera del loop de draw.

---

### Edge Cases

- ¿Qué pasa si el browser no soporta `OffscreenCanvas`? → Fallback al canvas principal compartido; el thumbnail preview se desactiva (placeholder estático).
- ¿Qué pasa si el usuario tiene `prefers-reduced-motion: reduce`? → Los efectos siguen renderizando, pero a 30fps fijo (no 60) y con menos elementos (50% reduction).
- ¿Qué pasa si `navigator.deviceMemory` no está disponible (Firefox)? → Fallback a `navigator.hardwareConcurrency < 4` como heurística.
- ¿Qué pasa si la pestaña está en background? → El render loop usa `document.visibilityState` para reducir a 5fps y no quemar batería.
- ¿Qué pasa si el `AudioContext` no se puede crear (HTTP en lugar de HTTPS)? → Fallback a un mensaje "Mic requiere HTTPS" sin romper el generador.
- ¿Qué pasa si el usuario cambia de efecto muy rápido (spam de clicks)? → Debounce de 100ms para evitar reinicializaciones de p5 en cascada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El render loop MUST mantener ≥58fps en desktop promedio (medido con FPS counter integrado en UI) durante 10s sostenidos.
- **FR-002**: El render loop MUST mantener ≥30fps en mobile gama media con throttling CPU 4× (Chrome DevTools).
- **FR-003**: El `devicePixelRatio` MUST estar capado a `min(window.devicePixelRatio, 1.5)` en desktop y `1.0` en mobile.
- **FR-004**: El `AudioContext` MUST cerrarse completamente al desactivar el micrófono (no quedar en estado `suspended` con memoria retenida).
- **FR-005**: El audio analyzer MUST correr en el mismo `requestAnimationFrame` loop que el render del canvas (no en timer separado).
- **FR-006**: p5.js MUST cargarse vía `<script defer>` o dynamic import, no síncrono.
- **FR-007**: El bundle del paquete MUST servirse con cache inmutable (filename hasheado, `Cache-Control: max-age=31536000`).
- **FR-008**: El código MUST detectar hardware limitado (`navigator.hardwareConcurrency`, `navigator.deviceMemory`) y aplicar modo lite automáticamente.
- **FR-009**: El modo lite MUST ser overrideable por el usuario vía toggle en el panel "Modo lite: ON/OFF".
- **FR-010**: Los efectos MUST usar object pooling para partículas y `push()/pop()` para transforms.
- **FR-011**: Los inputs de DOM (sliders, checkboxes) MUST cachearse una vez en setup del efecto, no leerse por frame.
- **FR-012**: El render loop MUST respetar `document.visibilityState` y reducir a 5fps cuando la pestaña está oculta.
- **FR-013**: El FPS counter MUST ser visible en el panel (toggleable), con métricas de fps instant, avg y 1% low.

### Key Entities *(include if feature involves data)*

- **PerfMetrics**: `{ fpsInstant, fpsAvg, fpsLow1Percent, frameTimeMs, drawTimeMs, audioTimeMs }` actualizado cada frame.
- **DeviceProfile**: `{ hardwareConcurrency, deviceMemory, connection, isMobile, dpr, isLiteModeForced }` derivado de `navigator` al inicio.
- **ObjectPool<T>**: pool reutilizable de partículas/elementos para evitar GC pressure.
- **CachedInputs**: `{ ellipseCount, angleIncrement, ... }` leídos en `setup()` del efecto, no en `draw()`.
- **RenderLoopConfig**: `{ targetFps, dpr, isBackground, isLiteMode }` consumido por el loop.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: FPS promedio ≥58 en MacBook Air M1 / Intel i5 con cualquier efecto, audio ON o OFF.
- **SC-002**: FPS promedio ≥30 en Chrome DevTools mobile emulation (CPU 4× throttling).
- **SC-003**: Frame time del percentil 95 ≤16.7ms (60fps) en desktop, ≤33ms (30fps) en mobile.
- **SC-004**: `performance.memory.usedJSHeapSize` se mantiene estable (±20%) tras 5 minutos de uso (no leak).
- **SC-005**: FCP <1.5s, LCP <2.5s, TTI <3s en Lighthouse mobile.
- **SC-006**: Memory footprint de AudioContext es 0 bytes cuando mic está OFF (verificable con `performance.memory` antes/después de `initAudio` + `stopAudio`).
- **SC-007**: Battery usage en mobile: el dispositivo no se calienta incómodamente tras 5min (validación manual).
- **SC-008**: Modo lite reduce el conteo de elementos en ≥50% manteniendo estética reconocible.

## Assumptions

- Los usuarios con hardware potente (desktop i7+, MacBook Pro) no notarán diferencia al activar modo lite; es opt-out.
- `p5.js` no se puede cargar diferidamente en todos los browsers de forma nativa; algunos requieren que esté disponible antes del primer uso del módulo. El dynamic import funciona en Chrome/Firefox/Safari modernos.
- El servidor de GitHub Pages soporta `Content-Encoding: br` automáticamente; no requiere config del usuario.
- El FPS counter es opt-in (toggle en panel) para no afectar la estética minimalista.
- El modo lite se persiste en `localStorage` por device-profile (key incluye hardwareConcurrency).
- Los benchmarks se hacen con `performance.now()` o con DevTools Performance panel; no se introducen herramientas externas tipo stats.js a menos que sean lightweight.