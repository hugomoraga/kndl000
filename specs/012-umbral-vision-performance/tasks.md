---
description: "Task list for umbral-vision-performance"
---

# Tasks: Umbral Vision — Performance

**Input**: Design documents from `/specs/012-umbral-vision-performance/`
**Prerequisites**: plan.md, spec.md
**Tests**: Medición con FPS counter + Chrome DevTools Performance. Benchmarks en `baseline-fps.json` para comparar pre/post.
**Organization**: Tasks agrupadas por user story.

---

## Phase 1: Setup — Baseline capture

- [ ] T001 Capturar FPS baseline: correr generador con cada efecto por 30s, medir fps avg y 1% low. Guardar en `specs/012-umbral-vision-performance/baseline-fps.json` con estructura `{ effect, fps_avg, fps_low1p, frame_ms_p95, device }`. Device de prueba: MacBook Air M1, Chrome latest, DPR=2.
- [ ] T002 Capturar Lighthouse baseline del `/visual/generator/`: FCP, LCP, TTI, TBT. Guardar en `baseline-lighthouse.json`.
- [ ] T003 Capturar memory baseline: `performance.memory.usedJSHeapSize` antes, durante (5min con audio ON), después (audio OFF + GC). Guardar en `baseline-memory.json`.
- [ ] T004 Crear rama `012-umbral-vision-performance` desde `main` en `hugomoraga/umbral-vision` (no en kndl000; el trabajo es en el paquete).

**Checkpoint**: Baseline capturado. Proceder.

---

## Phase 2: User Story 4 — Audio analyzer eficiente (Priority: P2) — Hacer primero porque desbloquea medición limpia

**Goal**: AudioContext se cierra completamente al desactivar mic; un solo render loop compartido.

**Independent Test**: `audioContext` === null tras `stopAudio()`. `performance.memory` no crece tras ciclo init→stop→init→stop.

- [ ] T005 Refactor `AudioReactive.js`: implementar cleanup completo en `stopAudio()` — `microphone.disconnect()`, `analyser.disconnect()`, `audioStream.getTracks().forEach(t => t.stop())`, `await audioContext.close()`, set all refs to `null`.
- [ ] T006 Mover lectura de `audioLevel` y `frequencyData` al render loop unificado (`renderLoop.js`), no en rAF separado.
- [ ] T007 Agregar método `getAudioSnapshot()` que retorna `{ level, frequencyData: Float32Array(16) }` pre-calculado por frame.
- [ ] T008 Remover el `requestAnimationFrame` interno del audio (si existe).
- [ ] T009 Test: ejecutar `initAudio()` → `stopAudio()` 10 veces, verificar `audioContext === null` cada vez y memory heap estable.

**Checkpoint**: Audio no leakea memoria.

---

## Phase 3: User Story 3 — Carga diferida del bundle y de p5.js (Priority: P2)

**Goal**: FCP <1.5s, LCP <2.5s, TTI <3s. p5.js no bloqueante.

**Independent Test**: Lighthouse mobile (Moto G4 simulated) reporta FCP <1.5s y LCP <2.5s. Network waterfall muestra p5.js no bloqueante.

- [ ] T010 Modificar `_layouts/generator.html`: cambiar `<script src="p5.min.js">` a `<link rel="preload" as="script" href="p5.min.js">` (hint) + remover el script bloqueante.
- [ ] T011 Modificar `Visualizer.js`: dentro de `startVisualizer`, hacer `await import('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js')` antes de instanciar `new p5(...)`. Cachear la promesa para no repetir.
- [ ] T012 Modificar `scripts/build.mjs`: configurar esbuild para emitir `dist/index.mjs` con `[name]-[hash].mjs` (filename hasheado).
- [ ] T013 Documentar en README: para deploy en GitHub Pages, Jekyll no hashea filenames por sí mismo; se sirve como `dist/index.mjs` con `Cache-Control: public, max-age=31536000`. Si se quiere hash, configurar plugin de Jekyll (no parte de esta spec).
- [ ] T014 Verificar con `curl -I https://kundala000.com/assets/js/umbral-vision/dist/index.mjs` los headers de cache (deben ser `Cache-Control: max-age=31536000`).
- [ ] T015 Re-correr Lighthouse: FCP <1.5s, LCP <2.5s, TTI <3s.

**Checkpoint**: p5.js no bloquea primer paint.

---

## Phase 4: User Story 1 — Frame budget 60fps desktop (Priority: P1) 🎯 MVP

**Goal**: 60fps estables en desktop con cualquier efecto.

**Independent Test**: FPS counter integrado reporta ≥58fps por 10s en cada efecto.

- [ ] T016 Crear `src/perf/fpsCounter.js`: implementa ring buffer de 60 samples, expone `tick(deltaMs)`, `getInstant()`, `getAvg()`, `getLow1Percent()`.
- [ ] T017 Crear `src/perf/renderLoop.js`: función `startLoop(onFrame)` que ejecuta frame callback con timing unificado, respeta `document.visibilityState` (5fps en hidden).
- [ ] T018 Crear `src/perf/inputCache.js`: API `readMany(map)` que lee múltiples inputs DOM una vez, retorna objeto con valores cacheados. Soporta `parser` opcional.
- [ ] T019 Crear `src/perf/objectPool.js`: clase genérica `ObjectPool<T>` con `acquire()`, `release()`, `size()`.
- [ ] T020 Modificar `Visualizer.js`: usar `renderLoop.startLoop()` en vez de `new p5(...)` con `sketch.draw`. El loop invoca `currentEffect.draw()` + audio snapshot + FPS tick.
- [ ] T021 Implementar DPR cap en `Visualizer.js`: `const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5); sketch.pixelDensity(dpr);`
- [ ] T022 Refactor `Effects.tunnel`: usar `inputCache.readMany()` en factory, wrap `translate()` con `push()/pop()`. Medir con FPS counter antes/después.
- [ ] T023 Refactor `Effects.spiral`: mismo patrón. Medir.
- [ ] T024 Refactor `Effects.particles`: usar `ObjectPool<Particle>` con factory + reset.
- [ ] T025 Refactor `Effects.mandala, waves, fractal, matrix, glitch, melt, biomech, dune`: mínimo leer inputs vía cache; aplicar push/pop donde corresponda.
- [ ] T026 Re-correr benchmarks: `for each effect: fps_avg >= 58, fps_low1p >= 50`. Comparar con baseline.

**Checkpoint**: 60fps en desktop promedio. MVP cumplido.

---

## Phase 5: User Story 2 — Mobile ≥30fps (Priority: P1) 🎯 MVP

**Goal**: ≥30fps en mobile gama media con throttling CPU 4×.

**Independent Test**: Chrome DevTools con CPU 4× throttling + mobile emulation (Moto G4) reporta ≥30fps por 30s.

- [ ] T027 Crear `src/perf/deviceProfile.js`: exporta `detectProfile()` que retorna `{ hardwareConcurrency, deviceMemory, isMobile, dpr, saveData, isLiteRecommended }`.
- [ ] T028 Lógica `isLiteRecommended`: `hardwareConcurrency < 6 || deviceMemory < 4 || isMobile || saveData`.
- [ ] T029 Persistir decisión del usuario en `localStorage` bajo `umbral-vision:lite-mode` (valores: `'auto' | 'on' | 'off'`).
- [ ] T030 Toggle "Modo lite" en panel (UI de spec 011): al activarlo, `inputCache` lee valores reducidos (50% de defaults).
- [ ] T031 Modificar todos los efectos: aceptar `config.isLite ? liteCount : fullCount` para elementos iterados.
- [ ] T032 Default config lite: `tunnel.ellipseCount: 50`, `spiral.segments: 150`, `particles.count: 30`, etc. Documentar en `src/config/effects.config.js`.
- [ ] T033 DPR cap mobile a 1.0 (ya en T021).
- [ ] T034 Re-correr benchmarks con DevTools CPU 4×: `fps_avg >= 30` en cada efecto.
- [ ] T035 Validación manual en device real (Android gama media): 5min de uso, dispositivo no se sobrecalienta.

**Checkpoint**: Mobile usable.

---

## Phase 6: User Story 5 — Effects optimizados (Priority: P3)

**Goal**: Refactor profundo de effects.js con pools, push/pop, caching. Frame time -30% por efecto.

**Independent Test**: Frame time del percentil 95 baja ≥30% en cada efecto refactoreado.

- [ ] T036 Auditar `Effects.js`: listar todos los `getInputValue()` en `draw()`, reemplazar por cache.
- [ ] T037 Auditar `translate()` sin `push()/pop()`: agregar pair en cada caso.
- [ ] T038 Pre-computar constantes fuera del loop de draw (`Math.PI * 2`, `Math.min(width, height) * 0.45`, etc.).
- [ ] T039 Para cada efecto con partículas (`particles`, `biomech`): migrar a `ObjectPool`.
- [ ] T040 Para cada efecto con trayectorias (`waves`, `spiral`): pre-computar arrays de paths en setup si son estáticos.
- [ ] T041 Re-medir: frame time -30% vs baseline por efecto.

**Checkpoint**: Effects optimizados.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T042 Crear `src/perf/fpsCounterUI.js`: mini-widget que muestra FPS instant en esquina del panel (toggle desde settings).
- [ ] T043 Métricas visibles en panel (cuando toggle ON): fps instant, avg, 1% low, frame time, audio time.
- [ ] T044 Verificar `prefers-reduced-motion: reduce`: render loop a 30fps fijo + 50% reducción de elementos.
- [ ] T045 Verificar `visibilitychange`: loop a 5fps cuando tab oculto, retoma a 60fps cuando visible.
- [ ] T046 Memory leak test: 10 ciclos init/stop audio, heap estable ±20%.
- [ ] T047 Bundle size check: `ls -lah dist/` debe mostrar `index.mjs` <50 KB minificado.
- [ ] T048 Actualizar CHANGELOG de `@hugomoraga/umbral-vision` con sección performance.
- [ ] T049 Re-correr Lighthouse final: Performance ≥85 mobile, ≥95 desktop.
- [ ] T050 Bump version: 0.2.0 (post spec 011) o 0.3.0 (si 011 ya merged).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No deps.
- **Phase 2 (US4 audio cleanup)**: No deps, hacer primero porque da medición limpia.
- **Phase 3 (US3 deferred load)**: No deps.
- **Phase 4 (US1 desktop 60fps)**: Depende de Phase 2 (audio unificado).
- **Phase 5 (US2 mobile lite)**: Depende de Phase 4 (perf modules ya existen).
- **Phase 6 (US5 deep refactor)**: Depende de Phase 4 + 5.
- **Phase 7 (Polish)**: Depende de todas.

### MVP First (US1 + US2 + US4)

1. Setup
2. US4 (audio) — quick win
3. US1 (60fps desktop) — corazón de la spec
4. US2 (mobile lite) — extiende US1
5. **STOP**: tag `v0.3.0-perf`

### Incremental

- US3 (deferred load) puede ir antes o después, paralelo a US4
- US5 (deep refactor) post-MVP

## Notes

- [P] tasks = archivos distintos, sin dependencias
- [Story] = US1-US5
- Cada US es testeable independientemente con benchmarks
- Comparar siempre contra `baseline-fps.json`
- Si una optimización rompe un efecto visualmente, revertir y documentar