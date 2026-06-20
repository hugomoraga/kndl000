# Creative Review Checklist: Umbral Vision — Nuevos efectos

**Purpose**: Verificación final de los efectos nuevos y de la calidad creativa.
**Created**: 2026-06-20
**Feature**: `specs/013-umbral-vision-creative-effects/spec.md`

## Conteo y completitud

- [ ] CHK001 `Object.keys(Effects).length >= 20` tras la spec
- [ ] CHK002 Los 4 efectos faltantes del README están implementados: `fractalGlitch`, `waveGlitch`, `sacredGeometry`, `yinYang`
- [ ] CHK003 Cada efecto nuevo tiene entrada en `EFFECT_LABELS` con nombre legible en español
- [ ] CHK004 Cada efecto se selecciona sin error en el generador

## Estética coherente

- [ ] CHK005 `sacredGeometry`: visualmente reconocible como Flower of Life (19 círculos con offset hexagonal). No infringe copyright.
- [ ] CHK006 `yinYang`: visualmente reconocible como símbolo taijitu (dos gotas con puntos). No problemas de IP.
- [ ] CHK007 `flowField`: estética Umbral Vision (oscura, luminosa). Partículas no se ven "planas" o sin dirección.
- [ ] CHK008 `truchet`: tiles coherentes, sin "roturas" donde los arcos no conectan entre celdas.
- [ ] CHK009 `fluid`: simulación se ve "líquida", no pixelada. Mouse force funciona (click + drag empuja el color).
- [ ] CHK010 `boids`: comportamiento de flocking observable (separación, alineación, cohesión). No se ven "amontonados" o "desperdigados".
- [ ] CHK011 `spectrum`: 64 barras visibles, peak hold funcional. Colores diferenciados bass/mid/high.
- [ ] CHK012 `mirror`: reflejo correcto, no invertido. Filter audio-reactivo es perceptible.
- [ ] CHK013 `motionParticles`: detecta movimiento facial/gestual. Partículas emergen de zonas de motion, no aleatorias.

## Audio reactivity

- [ ] CHK014 `getAudioBands()` retorna `{ bass, mid, high, level }` con valores 0-1
- [ ] CHK015 Bass, mid, high son perceptiblemente distintos entre sí con música rica en frecuencias
- [ ] CHK016 Smoothing: bass no parpadea errático (suavizado a 0.7x)
- [ ] CHK017 Spectrum usa bands (no solo level global)
- [ ] CHK018 Boids: bass aumenta cohesion, high aumenta separation
- [ ] CHK019 Tunnel migrado a bands: hue shift distinto bass vs agudos (verificación perceptual)
- [ ] CHK020 Al menos 5 efectos usan `getAudioBands()` (no solo level)

## Camera (US4)

- [ ] CHK021 Click 📷 → prompt nativo de permiso aparece
- [ ] CHK022 Permiso otorgado: `mirror` muestra webcam en vivo
- [ ] CHK023 Permiso denegado: toast "Cámara no disponible", generador sigue funcionando
- [ ] CHK024 Cámara en uso por otra tab: toast específico, no crashea
- [ ] CHK025 Memory leak test: 10 ciclos init/stop cámara, heap estable ±20%
- [ ] CHK026 Al cerrar tab/navegar fuera: `MediaStreamTrack.stop()` en cada track
- [ ] CHK027 HTTPS requerido: si HTTP, mensaje "Cámara requiere HTTPS" sin romper nada
- [ ] CHK028 motionParticles: emerge partículas en zonas de motion del video, no en background estático

## Stories (US5)

- [ ] CHK029 `src/stories/intro.json` existe con ≥5 efectos curados
- [ ] CHK030 `src/stories/lullaby.json` y `nightdrive.json` existen
- [ ] CHK031 Click "▶ Story" → ejecuta `intro.json` secuencia completa
- [ ] CHK032 Crossfade visible entre efectos (1500ms con globalAlpha)
- [ ] CHK033 Click en thumbnail durante story → stop story + control vuelve al usuario
- [ ] CHK034 Story completa sin intervention: termina limpiamente
- [ ] CHK035 Story de 60s no tiene gaps ni pauses perceptibles

## Performance

- [ ] CHK036 Cada efecto nuevo ≥58fps desktop (medido con FPS counter)
- [ ] CHK037 Cada efecto nuevo ≥30fps mobile lite (CPU 4× throttling)
- [ ] CHK038 fluid con grid 64×64 mantiene framerate (no exceder a 128×128)
- [ ] CHK039 boids con 100 boids a 60fps (no aumentar >150 sin OOM)
- [ ] CHK040 spectrum con 64 barras a 60fps (no exceder a 128)
- [ ] CHK041 Bundle size sigue <70 KB (no增长了 >20 KB por los 9 efectos)

## Documentación

- [ ] CHK042 README de `@hugomoraga/umbral-vision`: tabla de efectos con nombre + 1-línea descripción
- [ ] CHK043 README: sección "Audio API" con `getAudioState()` vs `getAudioBands()`
- [ ] CHK044 README: sección "Camera API" con permisos, HTTPS, cleanup
- [ ] CHK045 README: sección "Stories" con formato JSON y ejemplo
- [ ] CHK046 Screenshots o GIFs en `examples/effects/` para cada efecto nuevo (≥1 visual por efecto)
- [ ] CHK047 CHANGELOG actualizado con sección `0.4.0` o `0.5.0`

## No regressions

- [ ] CHK048 11 efectos originales siguen funcionando idénticos (screenshots pre/post)
- [ ] CHK049 API pública no rompió: `startVisualizer`, `changeEffect`, `getAudioState`, `getAudioBands`, `initCamera`, `stopCamera`, `runStory`
- [ ] CHK050 Smoke test del paquete (spec 010): todos los exports nombrados + cada efecto factory retorna objeto con `draw`
- [ ] CHK051 `bundle exec jekyll build` en kndl000 sin warnings nuevos
- [ ] CHK052 `/visual/generator/` funciona idéntico al pre-spec para los 11 originales

## Cross-browser

- [ ] CHK053 Chrome desktop: 22 efectos funcionan
- [ ] CHK054 Firefox desktop: 22 efectos funcionan
- [ ] CHK055 Safari desktop: 22 efectos funcionan
- [ ] CHK056 Chrome Android: 22 efectos (incluyendo cámara)
- [ ] CHK057 Safari iOS: 22 efectos (cámara requiere iOS 14.3+)

## Notes

- Cada CHK debe tener screenshot/evidencia adjunta en `examples/effects/`
- Si un efecto rompe perf budget, refactor con ObjectPool o marcar como lite-only
- La estética Umbral Vision es prioridad absoluta: si un efecto funciona técnicamente pero rompe la coherencia visual, iterar
- Publicar tag `v0.4.0` (o `v0.5.0`) al completar MVP (US1+US2+US3)
- Camera y stories post-MVP, en versión 0.5.0 o 0.6.0