---
description: "Task list for menu iter 2: one-line layout + character glitch"
---

# Tasks: Menú iter 2 — Una línea + Glitch de caracteres

**Input**: Design documents from `/specs/003-menu-iter-2/`

**Prerequisites**: spec.md (required)

**Tests**: Sin tests automatizados. Verificación visual + DevTools + bundle size.

**Organization**: Tasks por user story. Ambas US son P1 (el usuario pidió ambos arreglos juntos).

## Path Conventions

- **Sitio Jekyll estático**: `assets/css/`, `assets/js/bundles/`

---

## Phase 1: Setup

- [x] T001 Verificar branch `003-menu-iter-2` activo
- [x] T002 Capturar baseline: viewport de prueba, font-size actual, gap actual, ancho de `.nube-de-palabras`

---

## Phase 2: User Story 1 - Menú en una sola línea (Priority: P1) 🎯 MVP

**Purpose**: Reducir font-size y gap, añadir nowrap por item.

**Independent Test**: Viewport 1280px → los 8 items en una fila.

### Implementación CSS

- [x] T010 [US1] En `assets/css/style.css`, dentro de `.nube-de-palabras`, cambiar:
  - `gap: clamp(0.5rem, 2vw, 1.2rem)` → `gap: clamp(0.4rem, 1vw, 0.8rem)`
- [x] T011 [US1] En `.nube-de-palabras a`:
  - `font-size: clamp(0.9rem, 2.5vw, 1.2rem)` → `font-size: clamp(0.78rem, 1.5vw, 0.95rem)`
  - Añadir `white-space: nowrap`
  - Reducir `padding: 0.25rem` → `padding: 0.2rem 0.4rem`
- [x] T012 [US1] En cualquier regla mobile/responsive para `.nube-de-palabras a`, verificar que los font-sizes reducidos no rompen la legibilidad (≥0.7rem)
- [x] T013 [P] [US1] Considerar reducir el número de items mostrando solo el símbolo en `<480px` (móvil muy pequeño). Si se hace, añadir `<span class="nube-de-palabras__symbol">☍</span><span class="nube-de-palabras__label">Fragmentos</span>` y CSS condicional. **OPCIONAL** — aplicar solo si el wrap en móvil se ve mal.

### Verificación

- [x] T014 [US1] `bundle exec jekyll build` no falla
- [x] T015 [US1] Inspeccionar `_site/index.html` → `.nube-de-palabras` tiene el CSS actualizado
- [x] T016 [US1] **Pendiente de verificación visual en navegador**: viewport 1280px → 1 fila; 1024px → 1 fila; <768px → puede wrappear

**Checkpoint**: Menú cabe en una línea en desktop.

---

## Phase 3: User Story 2 - Glitch de caracteres random (Priority: P1)

**Purpose**: Reemplazar el módulo RGB split por uno que sustituye caracteres al azar.

**Independent Test**: Hover sobre "Fragmentos" → ver caracteres glitch reemplazando letras en ráfagas.

### CSS

- [x] T030 [US2] Eliminar la regla `.nube-de-palabras a.is-glitching { color: #fff; }` (ya no se usa; el JS controla el texto directamente)
- [x] T031 [US2] Verificar/ajustar `.nube-de-palabras a:hover, .nube-de-palabras a:focus-visible` para que mantenga el cambio a color blanco como base

### JS — Reemplazo del módulo 7

- [x] T040 [US2] En `assets/js/bundles/home.bundle.js`, localizar el módulo "7. menu-glitch.js" y reemplazarlo entero por la versión de char-glitch
- [x] T041 [US2] El nuevo módulo debe:
  - Detectar `prefers-reduced-motion` y `pointer: coarse`; si alguno aplica, no adjuntar listeners
  - Para cada `<a>` en `.nube-de-palabras`, guardar su texto original en `el.dataset.originalText`
  - En `mouseenter`/`focus`: arrancar rAF que durante 600ms (con auto-cancel) reescribe `el.textContent` con chars random
- [x] T042 [US2] Implementación de referencia del char-glitch (sustitución por frame, probabilidad 22% por char, emojis preservados):

```js
var GLYPHS = "▒▓█░▄▀■□◊◈◉○";
var MAX_DUR = 600;
var FRAME_INTERVAL = 70; // ms entre frames (~14fps de glitch, ahorra CPU)
var REPLACE_PROB = 0.22;
var lastFrameTime = 0;

function tick(now) {
  if (now - startTime >= MAX_DUR) { stop(); return; }
  if (now - lastFrameTime < FRAME_INTERVAL) {
    rafId = requestAnimationFrame(tick);
    return;
  }
  lastFrameTime = now;
  var original = el.dataset.originalText;
  var out = "";
  for (var i = 0; i < original.length; i++) {
    var ch = original[i];
    // Preservar emojis/símbolos no-ASCII simples y espacios
    if (ch === " " || /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(ch)) {
      out += ch;
    } else if (Math.random() < REPLACE_PROB) {
      out += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
    } else {
      out += ch;
    }
  }
  el.textContent = out;
  rafId = requestAnimationFrame(tick);
}
```

- [x] T043 [US2] Actualizar el comentario de cabecera del bundle: cambiar "7. menu-glitch.js" a "7. menu-char-glitch.js" para reflejar el nuevo comportamiento (mantener la posición 7)

### Verificación

- [x] T050 [US2] `node --check assets/js/bundles/home.bundle.js` pasa
- [x] T051 [US2] `bundle exec jekyll build` no falla
- [x] T052 [US2] En `grep`, no debe quedar "is-glitching" en CSS ni "text-shadow" en el módulo 7 del bundle
- [x] T053 [US2] **Pendiente de verificación visual en navegador**: hover sobre "Fragmentos" → ver caracteres glitch; mouseleave → vuelve al original; keyboard focus → mismo efecto
- [x] T054 [US2] **Pendiente DevTools**: emular `prefers-reduced-motion: reduce` → no se anima; emular `pointer: coarse` → no se dispara

**Checkpoint**: Glitch de caracteres visible y funcionando.

---

## Phase 4: Polish

- [x] T060 [P] Revisar que `ESTRUCTURA.md` sigue siendo coherente (no menciona detalle del módulo del menú, OK)
- [x] T061 Verificar que no quedan referencias huérfanas a `is-glitching`, `text-shadow` (en módulo 7), `MAX_OFFSET`
- [x] T062 [P] Actualizar `specs/003-menu-iter-2/tasks.md` marcando todo completo
- [x] T063 Commit con mensaje `feat(menu): single-line layout + char glitch (iter 2)`
- [x] T064 Push a main y verificar deploy

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Sin deps
- **US1 (Phase 2)**: Depende de Setup. Es CSS-only.
- **US2 (Phase 3)**: Depende de Setup. Es JS + CSS menor. Puede ir en paralelo con US1 (archivos distintos si US1 no toca el módulo 7 del bundle).
- **Polish (Phase 4)**: Depende de US1 + US2

### Within Each Phase

- US1 (CSS) y US2 (JS bundle + CSS mínimo) NO entran en conflicto si se aplican en commits separados
- Pero como tocan el mismo `.home-nav .nube-de-palabras` selector conceptualmente, mejor un solo commit con todo

### Secuencia recomendada (un solo dev)

1. Setup (T001-T002)
2. US1 CSS (T010-T016) → build → verificar mentalmente
3. US2 JS+CSS (T030-T054) → build → verificar mentalmente
4. Polish (T060-T064) → push

---

## Implementation Strategy

### MVP

Ambas US son P1. Se entregan juntas en un solo commit (`feat(menu): single-line layout + char glitch (iter 2)`) porque arreglan la misma queja del usuario.

### Verificación visual

Sin browser headless disponible, las verificaciones T016, T053, T054 quedan como "pendientes de inspección manual" — se confía en la inspección del bundle servido y el código revisado.

---

## Notes

- El set de glifos `▒▓█░▄▀■□◊◈◉○` está en BMP (no requiere font especial, todos los navegadores los renderizan).
- El módulo NO toca emojis Unicode (☍ ↂ 𝄞 ◉ 🜏 ◊ ◇ ꩜) ni espacios; preserva el ancho.
- La duración de 600ms es un buen balance entre "visible" y "no molesto". Auto-cancela a los 600ms aunque el cursor siga.
- El rAF se llama a ~14fps (cada 70ms) en vez de 60fps para reducir CPU. Visualmente sigue siento glitch.
- Si el efecto se siente lento o rápido en testing manual, ajustar `FRAME_INTERVAL` y/o `MAX_DUR`.
- Cuidado: `el.textContent = ...` resetea el contenido del `<a>`. Si el `<a>` tuviera hijos (iconos, etc.) se perderían. En este caso cada `<a>` solo tiene texto, así que OK. Si se añaden iconos, refactorizar para usar `<span>` interno.

## Estado de cierre (2026-06-15)

- 2/2 user stories implementadas y commiteadas en rama `003-menu-iter-2`
- 1 commit: `d41c003` (US1 + US2 juntas; mismo archivo conceptual)
- Bundle: 24.278 B → 24.687 B (+409 B, +1.7%)
- Pendiente: push a `main` y verificación visual post-deploy

| US | Commit | Cambio |
|---|---|---|
| US1 (P1) | `d41c003` | font-size 0.78-0.95rem, gap 0.4-0.8rem, white-space: nowrap |
| US2 (P1) | `d41c003` | char-glitch con glifos ▒▓█░▄▀■□◊◈◉○, 600ms, 14fps |
