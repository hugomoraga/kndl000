# Implementation Plan: Umbral Vision — Performance

**Branch**: `012-umbral-vision-performance` | **Date**: 2026-06-20 | **Spec**: `specs/012-umbral-vision-performance/spec.md`

**Input**: Feature specification from `/specs/012-umbral-vision-performance/spec.md`

## Summary

Llevar el render loop a 60fps estables en desktop y ≥30fps en mobile gama media, eliminar leaks de AudioContext, diferir la carga de p5.js, e introducir object pooling + push/pop + caching de inputs en los efectos existentes. Medible con FPS counter integrado + DevTools Performance + Lighthouse.

## Technical Context

**Language/Version**: JavaScript ES2022, p5.js v1.x/v2.x, Web Audio API.
**Primary Dependencies**: `@hugomoraga/umbral-vision@^0.1.0` (spec 010), p5.js (peer dep).
**Testing**: Medición con `performance.now()` + FPS counter integrado; no hay framework de tests en sitio estático. Benchmarks documentados en `specs/012-umbral-vision-performance/baseline-fps.json`.
**Target Platform**: Chrome/Edge/Firefox/Safari desktop + mobile (iOS Safari, Chrome Android).
**Project Type**: Performance optimization (refactor + lazy loading).
**Performance Goals**: 60fps desktop, ≥30fps mobile gama media, FCP <1.5s, LCP <2.5s, memory heap estable.
**Constraints**: Sin nuevas deps runtime; sin romper API pública; backwards-compatible con efectos existentes (el refactor es interno).
**Scale/Scope**: Modificaciones a `Visualizer.js`, `AudioReactive.js`, `Effects.js`, `index.js`, `app.js`. Nuevo `src/perf/` con FPS counter, device profile, object pool.

## Constitution Check

- **YAGNI**: ✅ No se introduce `stats.js` (FPS counter casero, 30 LOC). No se introduce `OffscreenCanvas` polyfill. No se reescriben efectos a WebGL (sería otro spec, y rompería compatibilidad).
- **Stdlib first**: ✅ `performance.now()`, `requestAnimationFrame`, `IntersectionObserver`, `document.visibilityState`, `OffscreenCanvas` (donde exista). Todo nativo.
- **Native platform**: ✅ `navigator.deviceMemory`, `navigator.hardwareConcurrency`, `navigator.connection.saveData` (Save-Data header) — todos nativos.
- **Already-installed**: ✅ p5.js ya está vía CDN; el cambio es a `defer` + dynamic import.
- **ponytail markers**: Capping DPR a 1.5 (no a 2.0 ni a native) — simplificación consciente. Modo lite por heurística simple (hardwareConcurrency + deviceMemory) sin ML.

*Gates passed*. Las simplificaciones están documentadas con ceilings claros.

## Project Structure

### Documentation (this feature)

```text
specs/012-umbral-vision-performance/
├── spec.md              # Feature spec
├── plan.md              # Este archivo
├── tasks.md             # Task list
├── checklist.md         # Performance verification checklist
└── baseline-fps.json    # Benchmarks pre-cambio para comparar
```

### Source Code (cambios en `hugomoraga/umbral-vision`)

```text
src/
├── perf/
│   ├── fpsCounter.js        # FPS instant + avg + 1% low + frame time
│   ├── deviceProfile.js     # hardwareConcurrency, deviceMemory, isMobile, dpr
│   ├── renderLoop.js        # loop compartido (render + audio) con visibilityState
│   ├── objectPool.js        # pool genérico <T>
│   └── inputCache.js        # cache de inputs DOM por efecto
├── Visualizer.js            # MODIFICADO: usa renderLoop, FPS counter, inputCache
├── AudioReactive.js         # MODIFICADO: cleanup completo (close context)
├── Effects.js               # MODIFICADO: object pooling, push/pop, cached inputs
├── index.js                 # MODIFICADO: exporta perf modules
└── app.js                   # MODIFICADO: device profile + lite mode toggle
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Sistema de device profile separado (10 LOC) | Necesario para modo lite auto | Hardcodear DPR=1 rompe pantallas Retina de alta densidad |
| Object pool como clase genérica | Reusable en todos los efectos con partículas | Inline en cada efecto = duplicación |

## Implementation Strategy

### 1. Render loop unificado

Reemplazar el patrón actual (cada efecto tiene su propio `draw()` que p5 invoca, audio tiene su propio rAF) por un loop unificado que:

```js
// pseudo-código
function loop(now) {
  if (document.visibilityState === 'hidden') {
    setTimeout(() => requestAnimationFrame(loop), 200); // 5fps en background
    return;
  }
  const deltaMs = now - lastFrame;
  fpsCounter.tick(deltaMs);
  
  if (audioEnabled) {
    analyser.getByteFrequencyData(dataArray);
    audioLevel = computeLevel(dataArray);
  }
  
  effect.draw();
  renderLoopStats.update();
  
  requestAnimationFrame(loop);
}
```

**Beneficio**: Una sola fuente de tiempo, sin drift entre audio y visual.

### 2. Object pooling genérico

```js
class ObjectPool<T> {
  constructor(factory, reset, initialSize = 50) {
    this.pool = Array.from({ length: initialSize }, factory);
    this.reset = reset;
  }
  acquire() { return this.pool.pop() || this.factory(); }
  release(obj) { this.reset(obj); this.pool.push(obj); }
}
```

**Aplicación**: `particles`, `biomech` (entidades biomecánicas), futuro `fireflies`, etc.

### 3. Input cache por efecto

Patrón:

```js
function effectFactory(sketch) {
  // Setup-time: leer DOM UNA vez
  const config = inputCache.readMany({
    ellipseCount: { id: 'ellipseCount', default: 100, parser: parseInt },
    ellipseSpacing: { id: 'ellipseSpacing', default: 10 }
  });
  
  return {
    draw: () => {
      // draw-time: usar config, NO releer DOM
      for (let i = 0; i < config.ellipseCount; i++) { ... }
    },
    // Hook para reactividad si el usuario cambia el slider mientras corre
    onConfigChange: () => { /* re-read */ }
  };
}
```

**Beneficio**: De N `getElementById` por frame a 0.

### 4. DPR cap

```js
const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5);
sketch.pixelDensity(dpr);
```

**Trade-off**: En Retina desktop se pierde algo de sharpness (1.5 vs 2.0), pero se gana 30% en píxeles a renderizar.

### 5. p5.js deferred load

```html
<!-- antes: <script src="p5.min.js"></script> (bloqueante) -->
<!-- después: -->
<script>
  // Preload hint, pero no bloqueante
  const link = document.createElement('link');
  link.rel = 'preload'; link.as = 'script'; link.href = p5CDN;
  document.head.appendChild(link);
</script>
<script type="module" src="app.js"></script>
```

Y en `app.js`, `import { startVisualizer } from '@hugomoraga/umbral-vision'` que internamente hace `await import(p5CDN)` antes de instanciar p5.

### 6. AudioContext cleanup completo

```js
export async function stopAudio() {
  if (microphone) microphone.disconnect();
  if (analyser) analyser.disconnect();
  if (audioStream) audioStream.getTracks().forEach(t => t.stop());
  if (audioContext && audioContext.state !== 'closed') {
    await audioContext.close();
  }
  audioStream = null;
  audioContext = null;
  analyser = null;
  microphone = null;
  dataArray = null;
  audioLevel = 0;
  audioEnabled = false;
}
```

## Dependencies & Execution Order

1. **US3 (P2)** + **US4 (P2)**: PerfMonitor + AudioCleanup (independientes, base)
2. **US1 (P1)**: RenderLoop + DPR cap + object pooling en efectos
3. **US2 (P1)**: Device profile + lite mode + DPR cap mobile
4. **US5 (P3)**: Refactor profundo de effects.js con pools
5. **Polish**: visibilityState, FPS counter visible, benchmarks

## References

- `specs/012-umbral-vision-performance/spec.md`
- `specs/011-umbral-vision-ux-ui/spec.md` (de US4 en adelante)
- DevTools Performance: https://developer.chrome.com/docs/devtools/performance/
- p5.js performance tips: https://p5js.org/examples/performance-optimization.html