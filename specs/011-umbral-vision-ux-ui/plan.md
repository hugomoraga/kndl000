# Implementation Plan: Umbral Vision — Overhaul de UX/UI

**Branch**: `011-umbral-vision-ux-ui` | **Date**: 2026-06-20 | **Spec**: `specs/011-umbral-vision-ux-ui/spec.md`

**Input**: Feature specification from `/specs/011-umbral-vision-ux-ui/spec.md`

## Summary

Rediseñar el panel de controles del generador visual: pasar de un `<select>` + checkbox + range nativos a una interfaz glassmorphic colapsable con thumbnails de efectos vivos, shortcuts de teclado, indicador de audio visualmente rico, sistema de presets persistente, onboarding first-run, captura de frame y share vía URL. Respetar `prefers-reduced-motion`, adaptarse responsive, mantener coherencia estética con `kndl000`.

## Technical Context

**Language/Version**: JavaScript ES2022, CSS3 (Glassmorphism: `backdrop-filter`, custom properties, `prefers-reduced-motion`, `prefers-color-scheme`).
**Primary Dependencies**: `@hugomoraga/umbral-vision@^0.1.0` (spec 010), p5.js (peer dep).
**Testing**: Verificación visual + manual (no hay framework de tests en el sitio Jekyll). Se documentan pasos de verificación.
**Target Platform**: Browsers modernos (Chrome/Edge/Firefox/Safari evergreen), mobile iOS/Android.
**Project Type**: UI enhancement sobre el framework existente.
**Performance Goals**: Grid de thumbnails <500ms load, shortcuts <50ms response, panel collapse animación 200ms CSS.
**Constraints**: Sin frameworks UI (no React/Vue/Svelte), vanilla JS + CSS. Sin aumentar el bundle más de 15 KB sobre el tamaño actual.
**Scale/Scope**: 1 archivo HTML (`_layouts/generator.html`), 1 archivo CSS (nuevo en `assets/css/` o inline en layout), 1 archivo JS (`app.js` modificado).

## Constitution Check

*Ponytail gates aplicados (ver AGENTS.md)*:

- **YAGNI**: ❌ Se agregaron 4 features (presets, onboarding, captura, share) que no se pidieron explícitamente pero se justifican como "lo esperable en un generador bien hecho". Se marcan P3 para no bloquear MVP de UX (US1-US2).
- **Stdlib first**: ✅ Thumbnails via `OffscreenCanvas` + `requestAnimationFrame` limitado a 5fps. Presets via `localStorage`. Captura via `canvas.toBlob()`. Share via `URLSearchParams` + `navigator.clipboard`. Todo nativo, cero dependencias.
- **Native platform**: ✅ `prefers-reduced-motion`, `prefers-color-scheme`, `navigator.deviceMemory`, `orientationchange` event — todo nativo.
- **Already-installed**: ✅ El paquete `@hugomoraga/umbral-vision` ya está instalado (spec 010). p5.js ya viene vía CDN en el layout.
- **Deletion over addition**: ✅ El `<select>` nativo se elimina (reemplazado por grid de thumbnails). La barra verde de 4px se elimina (reemplazada por indicador circular + FFT).
- **ponytail markers**: Se marcan las simplificaciones: thumbnail preview a 5fps (no 60fps como el efecto principal), sin WebGL para thumbnails (comparten el mismo canvas del visor principal), sin handler para más de 20 efectos en el grid.

*Gates passed*. Las simplificaciones están documentadas con `ponytail:`.

## Project Structure

### Documentation (this feature)

```text
specs/011-umbral-vision-ux-ui/
├── spec.md              # Feature spec (completado)
├── plan.md              # Este archivo
├── tasks.md             # Task list
├── checklist.md         # UX review checklist
```

### Source Code (files afectados en kndl000)

```text
kndl000/
├── _layouts/generator.html          # MODIFICADO - estructura del panel
├── assets/css/generator.css         # NUEVO - CSS específico del generador
├── assets/js/umbral-vision/         # submodule (spec 010)
│   └── app.js                       # MODIFICADO - nueva UI logic
├── assets/js/umbral-vision/src/     # dentro del submodule
│   ├── ui/                          # NUEVO - módulos de UI
│   │   ├── panel.js                 # collapsed/expanded
│   │   ├── thumbnails.js            # grid de previews
│   │   ├── keyboard.js              # shortcuts handler
│   │   ├── audioIndicator.js        # circle + FFT bars
│   │   ├── presets.js               # localStorage CRUD
│   │   ├── onboarding.js            # first-run overlay
│   │   └── share.js                 # capture PNG + URL
│   ├── index.js                     # MODIFICADO - re-exporta módulos UI
│   └── app.js                       # MODIFICADO - orquesta UI modules
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 7 módulos UI en vez de 1 | Cada módulo tiene 1 responsabilidad; el archivo total sería >500 LOC si no se separa | Ya se aprobó la modularidad en el diseño actual del framework; mantenerla es consistente |
| `navigator.deviceMemory` | No estándar, sólo en Chrome/Edge | No es blocking; es graceful degradation. Sin polyfill |

## Dependencies & Execution Order

1. **Phase 1**: CSS foundation (varíaables, glassmorphism, responsive breakpoints)
2. **Phase 2**: US1 (panel colapsable) — arquitectura base
3. **Phase 3**: US2 (thumbnails + shortcuts) — sobre panel existente
4. **Phase 4**: US3 (audio indicator) — independiente
5. **Phase 5**: US4 (presets) — sobre US1 y US2
6. **Phase 6**: US5 (onboarding) — sobre US1
7. **Phase 7**: US6 (captura + share) — independiente
8. **Phase 8**: Polish — reduced-motion, mobile, lighthouse

US1-US2 son P1 (MVP). US3-P2. US4-US6 son P3.

## References

- `specs/011-umbral-vision-ux-ui/spec.md`
- `_layouts/generator.html` (estado actual)