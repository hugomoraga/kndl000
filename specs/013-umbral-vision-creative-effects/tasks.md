---
description: "Task list for umbral-vision-creative-effects"
---

# Tasks: Umbral Vision — Nuevos efectos creativos

**Input**: Design documents from `/specs/013-umbral-vision-creative-effects/`
**Prerequisites**: spec.md, plan.md
**Tests**: Verificación visual + FPS counter (spec 012) + manual sobre calidad estética.
**Organization**: Tasks agrupadas por user story.

---

## Phase 1: Setup

- [ ] T001 Crear rama `013-umbral-vision-creative-effects` desde `main` en `hugomoraga/umbral-vision`
- [ ] T002 Auditar `Effects.js` actual: contar efectos (debería ser 11); listar los que faltan para llegar a 15 según README/EFEECT_LABELS
- [ ] T003 Capturar screenshots de los 11 efectos actuales en `examples/effects-baseline/` para comparar calidad post-cambios
- [ ] T004 Definir paleta de colores global de Umbral Vision en `src/config/palette.js` (extraer constantes hardcodeadas de Effects.js): { bgDark, accent1, accent2, accentWarm, hues[] }

**Checkpoint**: Baseline capturado + paleta unificada.

---

## Phase 2: User Story 1 — Completar los 4 efectos faltantes (Priority: P1) 🎯 MVP

**Goal**: Que `Object.keys(Effects).length === 15`. Los 4 faltantes: `fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang`.

**Independent Test**: `Object.keys(Effects).sort()` retorna array de 15 strings. Cada uno se selecciona sin error.

### Implementation for US1

- [ ] T005 [US1] Implementar `fractalGlitch`: combina `fractal` con `glitchNoise()` aplicada cada 30 frames. Reusa `Utils.fractalNoise`.
- [ ] T006 [US1] Implementar `waveGlitch`: combina `waves` con bandas horizontales desplazadas. Reusa `Utils.distortionWave`.
- [ ] T007 [US1] Implementar `sacredGeometry`: dibuja Flower of Life (19 círculos concéntricos con offset hexagonal). Pre-computar centros en setup. Audio: bass pulsa el radio.
- [ ] T008 [US1] Implementar `yinYang`: dibuja el símbolo taijitu con bezier curves. Audio: bass rota la figura.
- [ ] T009 [US1] Agregar entradas en `EFFECT_LABELS` (en `app.js`): `fractalGlitch: 'Fractal Glitch'`, `waveGlitch: 'Wave Glitch'`, `sacredGeometry: 'Geometría Sagrada'`, `yinYang: 'Yin Yang'`. (Ya existen los labels — verificar).
- [ ] T010 [US1] Verificar: `Object.keys(Effects).length === 15`. Cada uno se carga sin error. Screenshots en `examples/effects-completed/`.

**Checkpoint**: 15 efectos.

---

## Phase 3: User Story 3 — Audio FFT bands (Priority: P2)

**Goal**: Exponer `getAudioBands()` con bass/mid/high. Migrar spectrum a usarlo.

**Independent Test**: `getAudioBands()` retorna `{ bass, mid, high, level }`. Con música, los 3 valores son distintos entre sí.

- [ ] T011 [US3] Modificar `AudioReactive.js`: implementar `getAudioBands()` con split de bins (1-4 bass, 4-16 mid, 16-64 high). Smoothing: `bass *= 0.7` para evitar parpadeo.
- [ ] T012 [US3] Exponer en `index.js` re-exports.
- [ ] T013 [US3] Smoke test (spec 010): agregar verificación de que `getAudioBands()` existe y retorna objeto con 4 campos numéricos.
- [ ] T014 [US3] Documentar en README de `@hugomoraga/umbral-vision`: tabla comparativa `getAudioState()` vs `getAudioBands()`.

**Checkpoint**: API pública extendida.

---

## Phase 4: User Story 2 — Efectos creativos nuevos (Priority: P1) 🎯 MVP

**Goal**: Agregar ≥5 efectos nuevos para llegar a ≥20 totales.

**Independent Test**: `Object.keys(Effects).length >= 20`. Cada efecto nuevo renderiza a 60fps desktop.

### Implementation for US2

- [ ] T015 [US2] Implementar `flowField`: grid de vectores 32×32 con noise `Math.sin(x*0.1+t)*Math.cos(y*0.1+t)`. 200 partículas en `ObjectPool<Particle>` siguiendo el campo. Color por velocidad.
- [ ] T016 [US2] Implementar `truchet`: grid 16×16 de celdas 40px. Lookup table de 4 variantes de arcos (┘└┐┌). Color por posición + audio bands.
- [ ] T017 [US2] Implementar `fluid`: grid 64×64 (no 256 — **ponytail** ceiling). Campo de velocidad inicializado con noise. Advección de color cada 2 frames. Mouse aplica fuerza radial al campo (click + drag).
- [ ] T018 [US2] Implementar `boids`: 100 boids (ObjectPool). Cohesion + separation + alignment. Bass aumenta cohesion, high aumenta separation. Render: triángulos orientados por velocity.
- [ ] T019 [US2] Implementar `spectrum`: 64 barras FFT verticales con peak hold (decae a 0.95x por frame). Bass = rojo-naranja, mid = verde-azul, high = blanco-cyan. Usa `getAudioBands()`.
- [ ] T020 [US2] Agregar entradas en `EFFECT_LABELS`: `flowField: 'Flow Field'`, `truchet: 'Truchet'`, `fluid: 'Fluído'`, `boids: 'Boids'`, `spectrum: 'Spectrum'`.
- [ ] T021 [US2] Verificar conteo: `Object.keys(Effects).length === 20`.
- [ ] T022 [US2] Benchmarks con FPS counter de spec 012: cada efecto nuevo ≥58fps desktop, ≥30fps mobile lite.
- [ ] T023 [US2] Screenshots/GIFs de cada efecto nuevo en `examples/effects/`.

**Checkpoint**: 20 efectos, todos performantes.

---

## Phase 5: User Story 4 — Efectos basados en cámara (Priority: P3)

**Goal**: 2 efectos nuevos usando webcam como input. Limpieza correcta de tracks.

**Independent Test**: Activar cámara + efecto `mirror` → reflejo en pantalla. Desactivar cámara → tracks cerrados (verificable con DevTools Application > Media).

### Implementation for US4

- [ ] T024 [US4] Crear `src/camera.js`: API `initCamera()`, `getCameraFrame()` (ImageData 320×240), `stopCamera()`, `getCameraState()`. Stream cleanup completo en stop.
- [ ] T025 [US4] Agregar botones en `_layouts/generator.html`: "📷 Cámara" y 📷 icon en panel.
- [ ] T026 [US4] Implementar `mirror` effect: dibuja `getCameraFrame()` con `translate(width, 0); scale(-1, 1)` para espejo. Filter `contrast(1.2) hue-rotate()` con audio level.
- [ ] T027 [US4] Implementar `motionParticles` effect: frame differencing (compara frame actual con frame anterior), encuentra zonas con diff > threshold, emite partículas desde ahí. ObjectPool<Particle>. Bass aumenta threshold sensitivity.
- [ ] T028 [US4] Agregar entradas en `EFFECT_LABELS`: `mirror: 'Mirror'`, `motionParticles: 'Motion Particles'`.
- [ ] T029 [US4] Edge cases: cámara en uso por otra tab → toast. Permiso denegado → fallback placeholder. Stream cerrado al salir de tab.
- [ ] T030 [US4] Memory leak test: 10 ciclos init/stop cámara, heap estable.
- [ ] T031 [US4] Verificar conteo: `Object.keys(Effects).length === 22`.

**Checkpoint**: 22 efectos con cámara.

---

## Phase 6: User Story 5 — Stories (Priority: P3)

**Goal**: Sistema de stories con JSON + runner + crossfade.

**Independent Test**: Click "▶ Story" → ejecuta secuencia de `intro.json` con crossfades. Click en thumbnail → stop story.

### Implementation for US5

- [ ] T032 [US5] Extender `Transition.js`: agregar `crossfade(fromEffect, toEffect, durationMs)` que retorna `{ draw, isComplete }`. Implementar con `globalAlpha`.
- [ ] T033 [US5] Modificar `Visualizer.js`: durante crossfade, ejecutar ambos efectos en el mismo frame con opacidades opuestas.
- [ ] T034 [US5] Crear `src/stories/intro.json` con 6 efectos curados y duraciones 6–10s cada uno.
- [ ] T035 [P] [US5] Crear `src/stories/lullaby.json` (story nocturna, efectos suaves).
- [ ] T036 [P] [US5] Crear `src/stories/nightdrive.json` (story urbana, efectos rápidos + spectrum).
- [ ] T037 [US5] Crear `src/stories.js`: exporta `runStory(storyJson, callbacks)`, `stopStory()`, `getCurrentStory()`. Maneja cancellation al click de usuario.
- [ ] T038 [US5] Agregar botón "▶ Story" en panel + dropdown con las 3 stories disponibles.
- [ ] T039 [US5] Persistencia opcional: `localStorage['umbral-vision:last-story']` para reanudar tras F5.
- [ ] T040 [US5] Verificar story de 60s: ejecuta sin intervención, crossfades visibles, terminación limpia.

**Checkpoint**: Sistema de stories funcional.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T041 Refactor `Effects.js`: si supera 1500 LOC, split por archivo en `src/effects/`. **ponytail**: si no llega a 1500, dejar inline.
- [ ] T042 Unificar uso de paleta de colores: todos los efectos usan `palette.js` en vez de magic numbers.
- [ ] T043 Verificar que cada efecto nuevo respeta `lite mode` (50% reduction).
- [ ] T044 Documentar cada efecto nuevo en README de `@hugomoraga/umbral-vision`: nombre, descripción 1-línea, parámetros, screenshot/GIF.
- [ ] T045 Screenshots/GIFs: 1 por efecto nuevo en `examples/effects/`.
- [ ] T046 Verificar crossfades con `transition: true` durante 1500ms con curva linear (o eased — implementar easing simple si queda mejor).
- [ ] T047 Smoke test de `@hugomoraga/umbral-vision`: importar todos los efectos, verificar que cada factory retorna objeto con `draw()` que no lanza.
- [ ] T048 Benchmarks finales: 22 efectos × 60fps desktop / 30fps mobile lite.
- [ ] T049 Bump version: 0.4.0 (post spec 012) o 0.5.0 si spec 011 ya fue mergeada.
- [ ] T050 Publicar: `npm publish` con tag correspondiente.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No deps
- **Phase 2 (US1)**: Depende de Phase 1 (paleta)
- **Phase 3 (US3)**: Depende de Phase 1, paralelo a Phase 2
- **Phase 4 (US2)**: Depende de Phase 3 (usa `getAudioBands`)
- **Phase 5 (US4)**: Depende de Phase 4 (cameraReactive reutiliza patrones)
- **Phase 6 (US5)**: Depende de Phase 4 (crossfade necesita transiciones ya robustas)
- **Phase 7 (Polish)**: Depende de todas

### MVP First (US1 + US2 + US3)

1. Phase 1
2. Phase 2 (US1: 4 efectos faltantes)
3. Phase 3 (US3: audio bands)
4. Phase 4 (US2: 5 efectos nuevos)
5. **MVP**: 20 efectos publicados

### Incremental

- US4 (cámara) post-MVP
- US5 (stories) post-MVP

## Notes

- [P] tasks = archivos distintos, sin dependencias
- [Story] = US1-US5
- Cada efecto se mide con FPS counter antes de mergear
- Screenshots/GIFs son obligatorios para PRs de efectos nuevos (revisión visual)
- Si un efecto rompe perf budget, refactor con ObjectPool o degradar a lite only
- Camera requiere HTTPS para funcionar; documentar en README
- Stories son JSON estático; no hay editor visual todavía