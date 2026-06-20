# Feature Specification: Umbral Vision — Nuevos efectos creativos

**Feature Branch**: `013-umbral-vision-creative-effects`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "hacer mejoras de UX/UI, performance y creativas" — esta spec cubre el componente creativo (nuevos efectos visuales).

**Context**: Umbral Vision tiene 11 efectos en `assets/js/umbral-vision/Effects.js` (tunnel, spiral, mandala, particles, waves, fractal, matrix, glitch, melt, biomech, dune). El README menciona 15 pero hay 4 que faltan: `fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang` (los nombres están en `EFFECT_LABELS` de `app.js` pero los efectos no existen en el `Effects` object). Además, oportunidades creativas nuevas: simulaciones de fluidos, sistemas de agentes, shaders simples, sistemas de partículas físicamente simuladas, campos de flujo, geometría generativa tipo Truchet tiles, audio-reactive FFT bands (no solo level global). El objetivo es triplicar la librería visual manteniendo coherencia estética (oscura, luminosa, orgánica, psicodélica) y budgets de performance definidos en spec 012.

Depende de: spec 010 (paquete), spec 011 (UI con thumbnails + shortcuts), spec 012 (perf: object pooling, renderLoop, inputCache, lite mode).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar los 4 efectos faltantes mencionados en README (Priority: P1) 🎯 MVP

[Como visitante, quiero que el README de Umbral Vision mencione efectos que realmente existen, y que los 4 que están en el `EFFECT_LABELS` (`fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang`) sean efectos reales y seleccionables.]

**Why this priority**: Deuda técnica visible: el usuario ve "15 efectos" en la descripción, "11" en el selector. Es credibilidad y pulido mínimo.

**Independent Test**: Abrir `/visual/generator/`, contar efectos en el dropdown/thumbnails: deben ser 15 (11 actuales + 4 nuevos). Cada uno renderiza sin error al seleccionarlo.

**Acceptance Scenarios**:

1. **Given** el README dice "15 efectos" pero hay 11, **When** implemento `fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang`, **Then** el conteo coincide.
2. **Given** un visitante selecciona `sacredGeometry`, **When** carga, **Then** dibuja patrones de geometría sagrada (Flower of Life, Metatron's Cube, Sri Yantra simplificado).
3. **Given** un visitante selecciona `yinYang`, **When** carga, **Then** dibuja el símbolo Yin-Yang rotando con audio reactivo.
4. **Given** un visitante selecciona `fractalGlitch`, **When** carga, **Then** combina `fractal` con glitches aleatorios.
5. **Given** un visitante selecciona `waveGlitch`, **When** carga, **Then** combina `waves` con barras de glitches horizontales periódicas.

---

### User Story 2 - Nuevos efectos basados en flujo y campos (Priority: P1) 🎯 MVP

[Como visitante, quiero efectos nuevos que exploten técnicas de generative art más allá de partículas y geometría: flow fields, Truchet tiles, simulación de fluidos simple (Navier-Stokes lite), sistemas de agentes (boids con flocking).]

**Why this priority**: Diferenciador creativo. Estos efectos elevan el nivel de "demo de p5.js" a "framework generativo serio".

**Independent Test**: Cada efecto nuevo renderiza a 60fps en desktop (cumpliendo SC-001 de spec 012). Visualmente coherente con la paleta oscura/luminosa del resto.

**Acceptance Scenarios**:

1. **Given** el efecto `flowField`, **When** se selecciona, **Then** dibuja un campo de flujo 2D basado en ruido Perlin, con partículas siguiendo las líneas (estilo Tyler Hobbs).
2. **Given** el efecto `truchet`, **When** se selecciona, **Then** dibuja tiles Truchet (arcos entre centros de celdas) en grid, con variaciones de curvatura y color audio-reactive.
3. **Given** el efecto `fluid`, **When** se selecciona, **Then** simula un fluído 2D simplificado (advección de color con campo de velocidad por noise + mouse force opcional). No usa WebGL — sigue siendo canvas 2D.
4. **Given** el efecto `boids`, **When** se selecciona, **Then** implementa flocking (cohesion, separation, alignment) con 80–150 boids audio-reactive.
5. **Given** todos los efectos nuevos, **When** se cuenta, **Then** la librería total llega a ≥20 efectos.

---

### User Story 3 - Audio FFT bands (no solo level global) (Priority: P2)

[Como visitante con micrófono activo, quiero que los efectos reactivos usen bandas de frecuencia FFT (bass, mid, high) en vez de un único "level", para que la respuesta visual sea más musical y matizada.]

**Why this priority**: Es lo que distingue un visualizador musical de un visualizador "que se mueve con el ruido". Bajo esfuerzo, alto valor.

**Independent Test**: Activar mic + reproducir música con bajos marcados y agudos. `tunnel` debe mostrar hue shift distinto en bajos vs agudos. `boids` debe separar behavior: bass → cohesion up, high → separation up.

**Acceptance Scenarios**:

1. **Given** mic ON, **When** expongo `getAudioBands()` que retorna `{ bass: 0-1, mid: 0-1, high: 0-1 }`, **Then** los efectos pueden consumir bandas en vez de un único level.
2. **Given** los efectos existentes (`tunnel`, `spiral`, `mandala`), **When** los migro a usar bandas, **Then** el audio reactivo es perceptiblemente más "musical".
3. **Given** el efecto `spectrum`, **When** se selecciona, **Then** dibuja 64 barras FFT verticales con peak hold (estilo Winamp/Audioblocks moderno).
4. **Given** los efectos nuevos de spec 013, **When** se renderizan con mic ON, **Then** al menos 1 efecto por familia (flow, truchet, fluid, boids) usa bandas FFT.

---

### User Story 4 - Efectos basados en cámara/webcam (Priority: P3)

[Como visitante, quiero poder activar la cámara como input para algunos efectos, para que el visual reaccione a mi presencia o movimiento.]

**Why this priority**: Diferenciador fuerte pero requiere HTTPS + consentimiento. P3 por privacidad y complejidad.

**Independent Test**: Click "📷 Cámara" → prompt de permiso → activar efecto `mirror` → reflejo del rostro en pantalla con distorsión audio-reactiva.

**Acceptance Scenarios**:

1. **Given** HTTPS + cámara disponible, **When** click en botón "📷 Cámara", **Then** prompt de permiso nativo, stream de webcam activo.
2. **Given** cámara activa, **When** selecciono efecto `mirror`, **Then** refleja el video en el canvas con feedback loop sutil (audio controla el feedback amount).
3. **Given** cámara activa, **When** selecciono efecto `motionParticles`, **Then** detecta movimiento (frame differencing) y emite partículas desde las zonas de motion.
4. **Given** permiso de cámara denegado, **When** activo cualquier efecto basado en cámara, **Then** fallback elegante: muestra un placeholder oscuro con texto "Cámara no disponible" sin romper el resto del generador.
5. **Given** cámara activa, **When** cierro la pestaña o navego fuera, **Then** `MediaStreamTrack.stop()` se llama en cada track (no leak).

---

### User Story 5 - Efecto "preset story" — secuencias curadas (Priority: P3)

[Como visitante, quiero un modo "story" que ejecuta una secuencia curada de efectos con transiciones, en vez de tener que cambiar manualmente, para tener una experiencia cinematográfica de varios minutos.]

**Why this priority**: Feature narrativa. Conecta con la estética de blog "diario" del sitio.

**Independent Test**: Click "▶ Story" → empieza secuencia predefinida de 6–8 efectos con duraciones variables y crossfades. Botón "Stop" termina. Secuencia configurable vía JSON.

**Acceptance Scenarios**:

1. **Given** un JSON de story (incluido en el paquete: `src/stories/intro.json`), **When** click "▶ Story", **Then** se ejecuta la secuencia con timing y crossfades especificados.
2. **Given** story en ejecución, **When** completa, **Then** queda en el último efecto o vuelve al efecto del usuario (configurable).
3. **Given** story en ejecución, **When** click en cualquier thumbnail o shortcut, **Then** story se detiene y el control vuelve al usuario.
4. **Given** una story, **When** se publica la siguiente versión, **Then** se puede agregar `src/stories/lullaby.json`, `nightdrive.json`, etc., sin tocar el código del runtime.

---

### Edge Cases

- ¿Qué pasa si la cámara está en uso por otra tab? → El prompt de getUserMedia falla; mostrar toast "Cámara en uso por otra pestaña".
- ¿Qué pasa si el navegador no soporta `navigator.mediaDevices.getUserMedia({video:true})`? → Mismo fallback: desactiva features de cámara silenciosamente.
- ¿Qué pasa con el performance del efecto `fluid` (Navier-Stokes lite)? → Implementación simplificada grid 64×64 (no 256×256) + advección cada 2 frames, no cada frame. Documentado como **ponytail** ceiling.
- ¿Qué pasa si un efecto nuevo crashea en una combinación específica (audio + lite mode)? → Wrap en try/catch, fallback al efecto anterior con toast de error.
- ¿Qué pasa si el usuario tiene muchos efectos (20+) y quiere buscar? → Filtro por nombre en el panel de thumbnails (futuro; spec 011 ya lo deja preparado).
- ¿Las stories necesitan persistencia? → Sí, en `localStorage` bajo `umbral-vision:last-story` para reanudar tras F5 (opcional, con duración > 30s).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La librería MUST contener ≥20 efectos (11 actuales + 4 completados + ≥5 nuevos) tras esta spec.
- **FR-002**: Cada efecto nuevo MUST estar en `Effects.js` con la firma `name: (sketch) => { return { draw } }` y exportarse correctamente.
- **FR-003**: Cada efecto MUST tener una entrada en `EFFECT_LABELS` con nombre legible en español.
- **FR-004**: Cada efecto MUST respetar el budget de performance definido en spec 012 (60fps desktop, ≥30fps mobile con lite mode).
- **FR-005**: La API pública MUST exponer `getAudioBands()` que retorna `{ bass, mid, high }` normalizados 0–1.
- **FR-006**: Cada efecto reactivo a audio SHOULD preferir `getAudioBands()` sobre `getAudioState().level` cuando aplique.
- **FR-007**: El efecto `spectrum` MUST dibujar 64 barras FFT con peak hold.
- **FR-008**: El sistema de cámara MUST limpiar todos los `MediaStreamTrack`s al desactivar.
- **FR-009**: El sistema de stories MUST leer un JSON desde `src/stories/*.json` y ejecutar la secuencia con crossfades.
- **FR-010**: El crossfade entre efectos MUST ser visual (no pop): durante N ms, el efecto saliente dibuja con opacity decreciente mientras el entrante aumenta.
- **FR-011**: Los efectos MUST funcionar en `lite mode` (50% reduction) sin romper la estética reconocible.
- **FR-012**: Cada efecto MUST estar documentado con: nombre, descripción breve, parámetros ajustables, ejemplo visual estático (screenshot o GIF en `examples/effects/`).

### Key Entities *(include if feature involves data)*

- **Effect**: factory `(sketch) => ({ draw, setup?, teardown?, onConfigChange? })` exportado en `Effects` object.
- **AudioBands**: `{ bass: 0-1, mid: 0-1, high: 0-1, level: 0-1 }` retornado por `getAudioBands()`.
- **CameraStream**: `{ stream: MediaStream, video: HTMLVideoElement, motion: Float32Array }` gestionado por `CameraReactive.js` (nuevo módulo).
- **Story**: `{ id, name, description, duration_ms, sequence: [{ effect, duration_ms, crossfade_ms }] }` en JSON.
- **Transition (crossfade)**: estado entre dos efectos durante N ms, gestionado por `Transition.crossfade(fromEffect, toEffect, durationMs)`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La librería contiene ≥20 efectos tras esta spec (verificable con `Object.keys(Effects).length`).
- **SC-002**: Cada efecto nuevo renderiza a ≥58fps en desktop (medido con FPS counter de spec 012) en su versión full, y ≥30fps en mobile lite.
- **SC-003**: `getAudioBands()` retorna valores distintos para distintos géneros musicales (bass vs mid vs high) — verificable con songs de prueba.
- **SC-004**: El efecto `spectrum` muestra actividad en las 64 barras cuando hay audio rico en frecuencias.
- **SC-005**: Activar y desactivar cámara 10 veces no produce memory leak (±20% heap estable, verificado con `performance.memory`).
- **SC-006**: Una story de 60s se ejecuta sin intervención del usuario y termina limpiamente.
- **SC-007**: Crossfade entre dos efectos dura 1500ms con curva de opacity lineal (o eased).

## Assumptions

- Los nuevos efectos siguen la estética Umbral Vision (oscura, luminosa, orgánica, psicodélica) sin agregar dependencias.
- `sacredGeometry` no infringe copyright: se dibuja desde primitivas matemáticas (círculos concéntricos, líneas), no se replica artwork protegida existente.
- `yinYang` es símbolo cultural milenario; renderizarlo no es problema de IP.
- `flowField` y `fluid` se basan en ruido Perlin (estándar abierto, CC0) y no requieren atribución especial.
- El performance budget de spec 012 es suficiente: object pooling + renderLoop + lite mode permiten 20+ efectos sin degradación.
- Las stories son JSON estático; no hay editor visual de stories en esta spec (futuro).
- La cámara se ofrece como opt-in; nunca se activa sin click explícito.