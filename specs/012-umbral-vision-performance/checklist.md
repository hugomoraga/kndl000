# Performance Verification Checklist: Umbral Vision

**Purpose**: Verificación final de métricas de performance tras implementar la spec.
**Created**: 2026-06-20
**Feature**: `specs/012-umbral-vision-performance/spec.md`

## Benchmark capture (baseline vs post)

- [ ] CHK001 FPS avg y 1% low por efecto capturado en `baseline-fps.json` (pre-cambio)
- [ ] CHK002 FPS avg y 1% low por efecto capturado en `post-fps.json` (post-cambio) — debe mejorar ≥30%
- [ ] CHK003 Frame time percentil 95 por efecto, pre y post
- [ ] CHK004 Device de prueba documentado (modelo, OS, browser, DPR)

## Desktop 60fps (US1)

- [ ] CHK005 `tunnel` con audio OFF: fps_avg ≥58
- [ ] CHK006 `tunnel` con audio ON: fps_avg ≥58 (no degrada >10%)
- [ ] CHK007 `spiral`: fps_avg ≥58
- [ ] CHK008 `mandala`: fps_avg ≥58
- [ ] CHK009 `particles`: fps_avg ≥58
- [ ] CHK010 `waves`: fps_avg ≥58
- [ ] CHK011 `fractal`: fps_avg ≥58
- [ ] CHK012 `matrix`: fps_avg ≥58
- [ ] CHK013 `glitch`: fps_avg ≥58
- [ ] CHK014 `melt`: fps_avg ≥58
- [ ] CHK015 `biomech`: fps_avg ≥58
- [ ] CHK016 `dune`: fps_avg ≥58
- [ ] CHK017 1% low fps ≥50 en todos los efectos
- [ ] CHK017a Frame time percentil 95 ≤16.7ms en todos los efectos
- [ ] CHK018 DPR capado a 1.5 en desktop (verificar con DevTools Sensors)

## Mobile ≥30fps (US2)

- [ ] CHK019 DevTools CPU 4× throttling + Moto G4 emulation: fps_avg ≥30 en cada efecto
- [ ] CHK020 DPR capado a 1.0 en mobile (verificar)
- [ ] CHK021 `navigator.hardwareConcurrency` detectado correctamente
- [ ] CHK022 `navigator.deviceMemory` detectado correctamente (donde exista)
- [ ] CHK023 Modo lite auto-activado en mobile sin intervention del usuario
- [ ] CHK024 Toggle "Modo lite" en panel funciona
- [ ] CHK025 Estado de modo lite persiste en `localStorage`
- [ ] CHK026 Validación manual en device real (Android gama media): 5min de uso sin sobrecalentamiento
- [ ] CHK027 Validación manual en iOS Safari (iPhone 8+): ≥30fps

## Audio cleanup (US4)

- [ ] CHK028 `stopAudio()` cierra `AudioContext` completamente (no queda suspended)
- [ ] CHK029 `stopAudio()` llama `stop()` en cada `MediaStreamTrack`
- [ ] CHK030 Memory heap estable tras 10 ciclos init/stop (±20%)
- [ ] CHK031 Audio analyzer en mismo render loop (no timer separado)
- [ ] CHK032 `getAudioSnapshot()` retorna datos pre-calculados, no llama `getByteFrequencyData` directamente desde efectos
- [ ] CHK033 `AudioContext.state === 'suspended'` al iniciar (no `running`) por autoplay policy

## Deferred load (US3)

- [ ] CHK034 p5.js cargado con `preload` + dynamic import, no bloqueante
- [ ] CHK035 FCP <1.5s en Lighthouse mobile
- [ ] CHK036 LCP <2.5s en Lighthouse mobile
- [ ] CHK037 TTI <3s en Lighthouse mobile
- [ ] CHK038 Bundle del paquete con `Cache-Control: max-age=31536000`
- [ ] CHK039 Network waterfall muestra p5.js descargado tras primer paint

## Effects refactor (US5)

- [ ] CHK040 `tunnel`: usa `inputCache`, wrap `translate()` con push/pop
- [ ] CHK041 `spiral`: mismo patrón
- [ ] CHK042 `particles`: usa `ObjectPool`
- [ ] CHK043 `biomech`: usa `ObjectPool` si tiene entidades
- [ ] CHK044 Constantes (`Math.PI * 2`, etc.) pre-computadas fuera de loops
- [ ] CHK045 Cero `getElementById()` en `draw()` (verificado con `console.trace()` + grep)

## Polish

- [ ] CHK046 `prefers-reduced-motion: reduce`: render loop a 30fps + 50% elementos
- [ ] CHK047 `visibilitychange`: loop a 5fps cuando tab oculto
- [ ] CHK048 FPS counter visible en panel (toggle opt-in)
- [ ] CHK049 Métricas mostradas: fps instant, avg, 1% low, frame time, audio time
- [ ] CHK050 Bundle size <50 KB minificado (`ls -lah dist/index.mjs`)
- [ ] CHK051 Lighthouse Performance ≥85 mobile
- [ ] CHK052 Lighthouse Performance ≥95 desktop

## No regressions

- [ ] CHK053 No regresión visual: capturar screenshots pre/post, comparar
- [ ] CHK054 No regresión API: `startVisualizer`, `changeEffect`, etc. mantienen firmas
- [ ] CHK055 No regresión de tests: smoke test del paquete (spec 010) sigue verde
- [ ] CHK056 `bundle exec jekyll build` en kndl000 sin warnings nuevos
- [ ] CHK057 `/visual/generator/` funciona idéntico al pre-cambio (validación manual)

## Cross-browser

- [ ] CHK058 Chrome desktop (última): 60fps
- [ ] CHK059 Firefox desktop (última): 60fps
- [ ] CHK060 Safari desktop (última): 60fps
- [ ] CHK061 Chrome Android: ≥30fps
- [ ] CHK062 Safari iOS: ≥30fps

## Notes

- Cada CHK debe tener métrica documentada en `post-fps.json` o `post-lighthouse.json`
- Si algún CHK falla, abrir issue antes de mergear
- Re-correr después de cada PR que toque `Effects.js`, `Visualizer.js` o `AudioReactive.js`
- `prefers-reduced-motion` puede coexistir con `visibilitychange`: ambos reducen fps, pero visibilitychange tiene precedencia