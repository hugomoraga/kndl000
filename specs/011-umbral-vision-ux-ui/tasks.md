---
description: "Task list for umbral-vision-ux-ui"
---

# Tasks: Umbral Vision — Overhaul de UX/UI

**Input**: Design documents from `/specs/011-umbral-vision-ux-ui/`
**Prerequisites**: spec.md (required), plan.md (required)
**Tests**: Verificación manual + Lighthouse (no hay framework de tests en el sitio estático). Cada US se verifica independientemente en `/_site/` local.
**Organization**: Tasks agrupadas por user story para entrega incremental independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1–US6
- Rutas exactas en la descripción

## Path Conventions

- Relativos al root de `kndl000`.
- El submodule `assets/js/umbral-vision/` se edita desde el repo `hugomoraga/umbral-vision` (no modificar el gitlink directamente).

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Capturar baseline de Lighthouse: `lighthouse https://kundala000.com/visual/generator/ --output=json > specs/011-umbral-vision-ux-ui/baseline-lighthouse.json`
- [ ] T002 Crear rama `011-umbral-vision-ux-ui` desde `main` en `kndl000`
- [ ] T003 Crear `assets/css/generator.css` vacío y referenciarlo en `_layouts/generator.html`
- [ ] T004 [P] Definir CSS custom properties del generador: `--panel-bg`, `--panel-border`, `--accent`, `--accent-warm`, `--font-ui`, `--radius`, `--z-panel`, `--z-overlay`
- [ ] T005 [P] Confirmar que las variables CSS del sitio (`_includes/head-css.html`) tienen las tipografías `Newsreader` y `monospace` cargadas

**Checkpoint**: CSS foundation lista. Proceder a US1.

---

## Phase 2: User Story 1 - Panel colapsable (Priority: P1) 🎯 MVP

**Goal**: Reemplazar el `<div id="controls">` inline por un panel con glassmorphism, colapsable, responsive.

**Independent Test**: Abrir `/visual/generator/`. Panel visible top-left con blur. Click chevron → colapsa. Tecla `H` → toggle. Redimensionar a 375px → panel pasa a bottom-sheet.

- [ ] T006 [US1] Reestructurar `_layouts/generator.html`: envolver controles en `<nav id="panel">` con `<header>` (chevron + título "Umbral Vision") y `<section>` (contenido colapsable)
- [ ] T007 [P] [US1] CSS para panel: `position: fixed; top: 1rem; left: 1rem; z-index: var(--z-panel); background: var(--panel-bg); backdrop-filter: blur(12px); border-radius: var(--radius); border: 1px solid var(--panel-border); max-width: 360px;`
- [ ] T008 [P] [US1] CSS para collapse: clase `.collapsed` → `max-height: 0; opacity: 0; overflow: hidden; pointer-events: none; transition: all 200ms ease;`
- [ ] T009 [P] [US1] CSS para chevron flotante: solo visible cuando collapsed, `position: absolute; top: 1rem; left: 1rem;` con idéntico glassmorphism
- [ ] T010 [P] [US1] CSS responsive (≤768px): `bottom: 0; left: 0; right: 0; top: auto; max-width: none; max-height: 40vh; border-radius: var(--radius) var(--radius) 0 0;`
- [ ] T011 [P] [US1] CSS para `prefers-reduced-motion`: `.collapsed { transition: none; }`
- [ ] T012 [US1] Crear `src/ui/panel.js` en el repo `hugomoraga/umbral-vision`: exporta `createPanel()`, `togglePanel()`, `isPanelExpanded()`
- [ ] T013 [US1] Integrar `panel.js` en `app.js`: importar y llamar `createPanel()` en init
- [ ] T014 [US1] Persistir estado en `localStorage` (`umbral-vision:panel-state`) al hacer toggle
- [ ] T015 [US1] Keyboard handler: `h` → toggle panel (despachado desde `keyboard.js`, ver US2)

**Checkpoint**: Panel colapsable + responsive + accesible por teclado.

---

## Phase 3: User Story 2 - Thumbnails + Shortcuts (Priority: P1) 🎯 MVP

**Goal**: Reemplazar `<select>` por grid de thumbnails vivos; shortcuts numéricos.

**Independent Test**: Grid 4×3 con previews animados. Click cambia efecto. `1` → tunnel, `2` → spiral, etc. Arrow keys navegan. Focus no interfiere con inputs.

- [ ] T016 [P] [US2] CSS para grid de thumbnails: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;`. Cada thumbnail: `width: 80px; height: 80px; border-radius: 8px; cursor: pointer; position: relative;`
- [ ] T017 [P] [US2] CSS para thumbnail activo: `box-shadow: 0 0 0 2px var(--accent); transform: scale(1.05);`
- [ ] T018 [P] [US2] CSS para hover: `transform: translateY(-2px); tooltip with .effect-label sobre el thumbnail;`
- [ ] T019 [P] [US2] CSS para tooltip: `position: absolute; bottom: -1.5rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); font-size: 0.7rem; white-space: nowrap;`
- [ ] T020 [US2] Crear `src/ui/thumbnails.js`: exporta `createThumbnails(container)`, `highlightThumbnail(name)`, `setThumbnailPreview(name, canvas)`. Cada thumbnail usa `<canvas width=80 height=80>` dentro del `<button>`.
- [ ] T021 [US2] Crear `src/ui/keyboard.js`: exporta `initKeyboard(handlers)` con mapa de teclas. `1-9` → efecto index 0-8. `0` → 9, `-` → 10, `=` → 11. `ArrowLeft/Right` → previous/next con wrap. `Space` → toggle auto. `F` → fullscreen. `H` → panel. `M` → mic. `?` → onboarding.
- [ ] T022 [US2] Keyboard handler: ignorar teclas cuando `document.activeElement` es `INPUT`, `TEXTAREA`, `[contenteditable]`
- [ ] T023 [US2] Implementar thumbnail preview vivo: renderizar el efecto a 5fps en el mini-canvas (compartir el `p5` instance main o usar `OffscreenCanvas` si disponible)
- [ ] T024 [US2] **ponytail**: Thumbnail preview limitado a 5fps; en devices con `navigator.deviceMemory < 4` mostrar placeholder con nombre del efecto (sin preview)
- [ ] T025 [US2] Remover el `<select>` del HTML (ya no es necesario)
- [ ] T026 [US2] Wire up: click thumbnail → `changeEffect(name)` + `highlightThumbnail(name)`
- [ ] T027 [US2] Shortcut indicator: mínimo label en cada thumbnail `1`, `2`, … `0`, `-`, `=` en esquina superior derecha (opacidad 0.4)

**Checkpoint**: Selector visual de efectos + shortcuts. MVP completo del generador.

---

## Phase 4: User Story 3 - Audio Indicator (Priority: P2)

**Goal**: Reemplazar barra verde de 4px por indicador circular + barras FFT.

**Independent Test**: Mic OFF → nada visible. Mic ON → círculo late con audio y 16 barras FFT se mueven.

- [ ] T028 [P] [US3] CSS para indicador: `width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); transform-origin: center;`
- [ ] T029 [P] [US3] CSS para barras FFT: `display: flex; gap: 2px; align-items: flex-end; height: 32px;`. Cada barra: `width: 4px; background: var(--accent); border-radius: 2px; transition: height 60ms;`
- [ ] T030 [P] [US3] CSS peak: `.peak { background: var(--accent-warm); transition: background 100ms; }`
- [ ] T031 [US3] Crear `src/ui/audioIndicator.js`: exporta `initAudioIndicator(container)`, `updateAudioIndicator(level, frequencyData)`. Renderiza en container div.
- [ ] T032 [US3] Lógica de update: `requestAnimationFrame` loop que lee `getFrequencyData()`, promedia 16 bins para las barras, dibuja escala del círculo.
- [ ] T033 [US3] Integrar en `app.js`: pasar `audioLevel` + `frequencyData` a `updateAudioIndicator()` cada frame.
- [ ] T034 [US3] Remover `#audioLevel` y `#audioLevelBar` antiguos del HTML.

**Checkpoint**: Indicador de audio vistoso y funcional.

---

## Phase 5: User Story 4 - Presets (Priority: P2)

**Goal**: Guardar/cargar/borrar presets en localStorage. Modal de nombre.

**Independent Test**: Guardar preset → aparece en dropdown → recargar → sigue ahí → cargar → restaura efecto+interval+mic.

- [ ] T035 [P] [US4] CSS para dropdown de presets: `<select>` estilizado o custom dropdown con lista y scroll (max 10 visibles)
- [ ] T036 [P] [US4] CSS para modal de nombre: overlay semi-transparente + input centrado con glassmorphism, similar al panel
- [ ] T037 [P] [US4] CSS para toast: `position: fixed; bottom: 2rem; right: 2rem; background: var(--panel-bg); backdrop-filter: blur(8px); border-radius: var(--radius); padding: 0.75rem 1rem; animation: fade-in 200ms, fade-out 2s;`
- [ ] T038 [US4] Crear `src/ui/presets.js`: exporta `getPresets()`, `savePreset(name, state)`, `loadPreset(id)`, `deletePreset(id)`, `renamePreset(id, name)`. Persiste en `localStorage` como `umbral-vision:presets`.
- [ ] T039 [US4] Integrar botón "💾 Guardar" en panel header
- [ ] T040 [US4] Modal de nombre: input + confirm con Enter o botón, Esc cancela. Validar nombre no vacío.
- [ ] T041 [US4] Dropdown de presets: listar por nombre con timestamp relativo ("hace 2h"). Primer item "Guardar actual…".
- [ ] T042 [US4] Click en preset → restaurar estado (changeEffect + setInterval + initAudio si estaba ON)
- [ ] T043 [US4] Right-click/long-press en preset → menú contextual con "Renombrar", "Duplicar", "Borrar"
- [ ] T044 [US4] Toast confirmación al guardar/borrar: fade-in 200ms, visible 2s, fade-out 2s
- [ ] T045 [US4] Fallback en modo incógnito (Safari): toast "Los presets no persistirán al cerrar la ventana" + almacenar en array en memoria

**Checkpoint**: Sistema de presets funcional y persistente.

---

## Phase 6: User Story 5 - Onboarding (Priority: P3)

**Goal**: Overlay sutil en primera visita con tips interactivos.

**Independent Test**: Primera visita → overlay aparece 800ms post-load → 4 tips → click "Entendido" → no vuelve a aparecer.

- [ ] T046 [P] [US5] CSS para overlay: `position: fixed; inset: 0; z-index: var(--z-overlay); background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;`
- [ ] T047 [P] [US5] CSS para tarjetas de tips: glassmorphism, gap 1rem, max-width 400px, cada tip con icono + texto
- [ ] T048 [US5] Crear `src/ui/onboarding.js`: exporta `showOnboarding()`, `dismissOnboarding()`. Tips hardcodeados: "1-9: Cambiar efecto", "Espacio: Auto transición", "F: Fullscreen", "H: Ocultar panel".
- [ ] T049 [US5] Control de timing: overlay aparece 800ms después de que el primer frame del canvas se renderizó (evento custom o setTimeout post-init). Auto-cierre a los 6s.
- [ ] T050 [US5] Flag `umbral-vision:onboarded` en `localStorage`. Si existe, no mostrar. Link "¿Cómo funciona?" en el panel (junto al título) que reabre.
- [ ] T051 [US5] Cerrar overlay al primer click/tecla (o al click en backdrop sin propagar al canvas)

**Checkpoint**: First-run onboarding protegido con flag.

---

## Phase 7: User Story 6 - Captura + Share (Priority: P3)

**Goal**: Descargar frame como PNG, copiar URL de estado al clipboard.

**Independent Test**: Click 📸 → descarga PNG. Click 🔗 → clipboard tiene URL. Abrir URL → mismo efecto.

- [ ] T052 [US6] Crear `src/ui/share.js`: exporta `captureFrame()`, `getShareURL()`, `parseShareURL(url)`, `applyShareURL(params)`
- [ ] T053 [US6] `captureFrame()`: `canvas.toBlob(blob => { const link = document.createElement('a'); link.download = 'umbral-vision-'+new Date().toISOString()+'.png'; link.href = URL.createObjectURL(blob); link.click(); })`
- [ ] T054 [US6] `getShareURL()`: `const params = new URLSearchParams({ effect: getCurrentEffect(), interval: intervalInput.value, audio: audioEnabled ? 1 : 0 }); return window.location.origin + window.location.pathname + '?' + params`
- [ ] T055 [US6] `parseShareURL(url)`: leer searchParams, validar effect existe (sino fallback tunnel + toast), devolver `{ effect, interval, audio }`
- [ ] T056 [US6] `applyShareURL(params)`: llamar al start del generador con esos parámetros
- [ ] T057 [US6] Integrar botones "📸" y "🔗" en el panel header
- [ ] T058 [US6] Toast "URL copiada al clipboard" al click en 🔗
- [ ] T059 [US6] Fallback clipboard: si `navigator.clipboard.writeText` falla, mostrar modal con input readonly + la URL para copia manual

**Checkpoint**: Frame descargable + estado compartible por URL.

---

## Phase 8: Polish & Cross-Cutting

- [ ] T060 [P] Verificar `prefers-reduced-motion: reduce` desactiva todas las animaciones de UI
- [ ] T061 [P] Verificar Lighthouse Accessibility ≥95: roles ARIA para panel, thumbnails, botones
- [ ] T062 [P] Verificar Lighthouse Performance ≥85 en mobile
- [ ] T063 [P] Test mobile: iPhone SE (375×667), Galaxy S20 (412×915), iPad (1024×768) — panel no tapa >30%
- [ ] T064 [P] Verificar shortcuts no interfieren con input de preset name
- [ ] T065 [P] Test regeneración del sitio: `bundle exec jekyll build` sin errores
- [ ] T066 [P] Keyboard navigation: Tab order lógico, thumbnails focusables con `tabindex="0"`
- [ ] T067 [P] `aria-label` en todos los botones (chevron, mic, fullscreen, captura, share, presets)
- [ ] T068 [P] Update CHANGELOG de `@hugomoraga/umbral-vision` con los cambios UI (new en `src/ui/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (US1)**: Depende de Phase 1
- **Phase 3 (US2)**: Depende de Phase 2 (thumbnails van dentro del panel)
- **Phase 4 (US3)**: Puede correr en paralelo con US2 (independiente)
- **Phase 5 (US4)**: Depende de Phase 2 + Phase 3 (necesita thumbnails + panel)
- **Phase 6 (US5)**: Depende de Phase 2
- **Phase 7 (US6)**: Independiente, puede correr en paralelo con cualquier fase
- **Phase 8 (Polish)**: Depende de todas

### MVP First (US1 + US2)

1. Phase 1
2. Phase 2 (US1) → panel colapsable
3. Phase 3 (US2) → thumbnails + shortcuts
4. **MVP listo**: publicar tag, actualizar submodule en kndl000

### Incremental

- US3, US4, US5, US6 se agregan en orden de prioridad P2 → P3
- Cada una es testeable y desplegable independientemente