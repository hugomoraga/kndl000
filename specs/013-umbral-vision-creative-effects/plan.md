# Implementation Plan: Umbral Vision — Nuevos efectos creativos

**Branch**: `013-umbral-vision-creative-effects` | **Date**: 2026-06-20 | **Spec**: `specs/013-umbral-vision-creative-effects/spec.md`

**Input**: Feature specification from `/specs/013-umbral-vision-creative-effects/spec.md`

## Summary

Llevar Umbral Vision de 11 a ≥20 efectos visuales. Completar los 4 efectos faltantes mencionados en README (`fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang`). Agregar 5 nuevos basados en técnicas de generative art (`flowField`, `truchet`, `fluid`, `boids`, `spectrum`). Exponer `getAudioBands()` (bass/mid/high) en vez del único `level` global. Agregar 2 efectos basados en cámara (`mirror`, `motionParticles`). Agregar sistema de stories (secuencias curadas con crossfades).

## Technical Context

**Language/Version**: JavaScript ES2022, p5.js v1.x/v2.x, Web Audio API (FFT analyzer), getUserMedia (camera).
**Primary Dependencies**: `@hugomoraga/umbral-vision@^0.2.0` (post spec 011/012), p5.js.
**Testing**: Verificación visual + FPS counter. No hay tests automatizados para calidad visual; la verificación es humana.
**Target Platform**: Browsers modernos desktop + mobile (cámara requiere HTTPS).
**Project Type**: Feature expansion (new effects + camera + stories).
**Performance Goals**: Cada efecto nuevo a 60fps desktop / ≥30fps mobile lite; memory estable con cámara.
**Constraints**: Sin deps runtime nuevas. Mantener estética Umbral Vision. No romper API existente.
**Scale/Scope**: ~9 efectos nuevos + 1 módulo camera + 1 módulo stories + crossfade en Transition.

## Constitution Check

- **YAGNI**: ✅ No se introduce librería de física externa (Cannon.js, matter.js). El `boids` es implementación propia (~150 LOC). El `fluid` es advección simple grid 64×64, no Navier-Stokes real.
- **Stdlib first**: ✅ Perlin noise: usar `Math.sin/cos` para noise simple (no Perlin real); suficiente para `flowField`. Truchet tiles: aritmética básica. Spectrum: `getByteFrequencyData` nativo.
- **Native platform**: ✅ `getUserMedia`, `MediaStream`, `requestVideoFrameCallback` (donde exista), `ImageData` para motion detection.
- **Already-installed**: ✅ `ObjectPool` (spec 012) reusado para `boids`, `motionParticles`, `particles` upgrade.
- **ponytail markers**: `fluid` con grid 64×64 no 256×256 (ceiling: el upgrade a grid fino + shaders sería spec aparte). `flowField` con noise sin/cos no Perlin real (suficiente para "vibe" psicodélica, ahorra 30 KB de noise lib).
- **Deletion over addition**: ✅ `mirror` no requiere nueva dep de filtros; usa `ctx.filter` nativo o composite modes.
- **No abstractions not requested**: ✅ No se crea `Effect` base class; los efectos siguen siendo factories con `draw()`. No se introduce sistema de plugins.

*Gates passed*.

## Project Structure

### Documentation (this feature)

```text
specs/013-umbral-vision-creative-effects/
├── spec.md                  # Feature spec
├── plan.md                  # Este archivo
├── tasks.md                 # Task list
└── checklist.md             # Creative review checklist
```

### Source Code (cambios en `hugomoraga/umbral-vision`)

```text
src/
├── Effects.js               # MODIFICADO: +9 efectos
├── AudioReactive.js         # MODIFICADO: getAudioBands() con FFT band analysis
├── Transition.js            # MODIFICADO: crossfade visual entre efectos
├── camera.js                # NUEVO: CameraReactive (init/stop/getFrame/getMotion)
├── stories.js               # NUEVO: Story runner
├── stories/
│   ├── intro.json           # Story por defecto al abrir el generador
│   ├── lullaby.json         # Story nocturna (opcional)
│   └── nightdrive.json      # Story urbana (opcional)
├── effects/                 # NUEVO: split opcional de effects por archivo
│   ├── sacredGeometry.js
│   ├── yinYang.js
│   ├── flowField.js
│   ├── truchet.js
│   ├── fluid.js
│   ├── boids.js
│   ├── spectrum.js
│   ├── mirror.js
│   └── motionParticles.js
├── index.js                 # MODIFICADO: re-exporta nuevos módulos
└── app.js                   # MODIFICADO: integra botones de cámara y story
```

### Source Code (cambios en `kndl000`)

```text
_layouts/generator.html      # MODIFICADO: botones 📷 Cámara, ▶ Story
assets/js/umbral-vision/     # submodule — bump a nueva versión
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 9 archivos en `effects/` (uno por efecto) | Cada efecto >100 LOC; mantener todo en `Effects.js` superaría 1500 LOC | Inline en `Effects.js` sería difícil de navegar y mantener |
| `camera.js` separado | Lógica de cámara ortogonal al render loop; mismo patrón que `AudioReactive` | Inline en `app.js` haría `app.js` >600 LOC |
| `stories.js` + JSON | Curación declarativa de secuencias; permite contributors agregar stories sin tocar código | Hardcodear en JS requiere redeploy para cada story nueva |

## Implementation Strategy

### 1. FFT bands (extensión natural de AudioReactive)

```js
// AudioReactive.js — adicionar
export function getAudioBands() {
  if (!analyser || !dataArray) return { bass: 0, mid: 0, high: 0, level: 0 };
  analyser.getByteFrequencyData(dataArray);
  
  // Bins 1-4 (bass, ~20-200 Hz)
  const bass = avg(dataArray, 1, 4) / 255;
  // Bins 4-16 (mid, ~200-2000 Hz)
  const mid = avg(dataArray, 4, 16) / 255;
  // Bins 16-64 (high, ~2k-20k Hz)
  const high = avg(dataArray, 16, 64) / 255;
  // Level global
  const level = avg(dataArray, 0, dataArray.length) / 255;
  
  return { bass, mid, high, level };
}

function avg(arr, from, to) {
  let sum = 0;
  for (let i = from; i < to; i++) sum += arr[i];
  return sum / (to - from);
}
```

**Migración gradual**: efectos existentes siguen con `getAudioState().level`; los nuevos usan `getAudioBands()`. Migración retroactiva es opt-in (no breaking change).

### 2. CameraReactive (mismo patrón que AudioReactive)

```js
// camera.js (referencia)
let video, stream, motionBuffer;

export async function initCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
  video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
}

export function getCameraFrame() {
  // Dibuja en un offscreen canvas; retorna ImageData
  if (!video) return null;
  const off = document.createElement('canvas');
  off.width = 320; off.height = 240;
  const ctx = off.getContext('2d');
  ctx.drawImage(video, 0, 0, 320, 240);
  return ctx.getImageData(0, 0, 320, 240);
}

export function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  video = null; stream = null;
}
```

### 3. Crossfade transition

```js
// Transition.js — adicionar crossfade
export function crossfade(fromEffect, toEffect, durationMs = 1500) {
  const start = performance.now();
  const originalFromDraw = fromEffect.draw;
  
  return {
    draw: () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / durationMs, 1);
      
      // Dibuja fromEffect con opacidad decreciente
      const fromAlpha = 1 - t;
      // ... usar globalAlpha
      
      // Dibuja toEffect con opacidad creciente
      const toAlpha = t;
      // ... usar globalAlpha
      
      if (t >= 1) return false; // crossfade terminado
      return true; // sigue dibujando ambos
    }
  };
}
```

### 4. Stories (JSON + runner)

```json
// src/stories/intro.json
{
  "id": "intro",
  "name": "Introducción",
  "description": "Recorrido por los efectos principales",
  "sequence": [
    { "effect": "tunnel",   "duration_ms": 8000, "crossfade_ms": 1500 },
    { "effect": "mandala",  "duration_ms": 6000, "crossfade_ms": 1500 },
    { "effect": "sacredGeometry", "duration_ms": 7000, "crossfade_ms": 1500 },
    { "effect": "flowField", "duration_ms": 8000, "crossfade_ms": 1500 },
    { "effect": "spectrum", "duration_ms": 8000, "crossfade_ms": 1500 }
  ]
}
```

```js
// stories.js (referencia)
export async function runStory(storyJson, onEffectChange) {
  for (const step of storyJson.sequence) {
    await crossfadeAndPlay(step.effect, step.duration_ms, step.crossfade_ms, onEffectChange);
  }
}

async function crossfadeAndPlay(effect, durationMs, crossfadeMs, onEffectChange) {
  onEffectChange(effect);
  await sleep(durationMs);
}
```

### 5. Efectos: decisiones técnicas

| Efecto | Técnica | Pool/Reuso |
|--------|---------|------------|
| `fractalGlitch` | Combina `fractal` con `glitchNoise()` random cada 30 frames | Reusa `Utils.fractalNoise` |
| `waveGlitch` | Combina `waves` con bandas horizontales desplazadas | Reusa `Utils.distortionWave` |
| `sacredGeometry` | Círculos concéntricos con intersecciones (Flower of Life) | Pre-computa centros |
| `yinYang` | Path con curvas bezier del símbolo taijitu | Pre-computa puntos |
| `flowField` | Grid de vectores con noise sin/cos + partículas siguiendo líneas | ObjectPool<Particle> |
| `truchet` | Grid de celdas con arcos aleatorios (4 variantes) | Lookup table |
| `fluid` | Grid 64×64 con advección de color + force radial del mouse | Grid pre-allocated |
| `boids` | 80–150 entidades con cohesion/separation/alignment | ObjectPool<Boid> |
| `spectrum` | 64 barras verticales con peak hold | Buffer circular |
| `mirror` | Dibuja `getCameraFrame()` reflejado con `scale(-1, 1)` + filter | — |
| `motionParticles` | Frame differencing + emit particles en zonas de motion | ObjectPool<Particle> |

**Nota**: Los detalles de implementación de cada efecto se desarrollan en T015-T024, no en este plan.

## Dependencies & Execution Order

1. **Phase 1**: Setup (rama, baseline)
2. **Phase 2**: US1 (4 efectos faltantes) — fácil, alto valor
3. **Phase 3**: US3 (audio bands) — base para efectos nuevos audio-reactivos
4. **Phase 4**: US2 (efectos creativos: flowField, truchet, fluid, boids, spectrum)
5. **Phase 5**: US4 (cámara: mirror, motionParticles)
6. **Phase 6**: US5 (stories)
7. **Phase 7**: Polish (crossfade, docs, examples)

### MVP First

1. Setup
2. US1 + US3 + US2 (11 + 4 + 5 = 20 efectos)
3. **MVP**: `v0.4.0-creative`
4. US4, US5, Polish después

## References

- `specs/013-umbral-vision-creative-effects/spec.md`
- `specs/012-umbral-vision-performance/spec.md` (perf budgets)
- `specs/011-umbral-vision-ux-ui/spec.md` (UI integration)
- Truchet tiles: https://en.wikipedia.org/wiki/Truchet_tiles
- Boids algorithm: https://www.red3d.com/cwr/boids/
- Flow fields: https://tylerxhobbs.com/flowfields