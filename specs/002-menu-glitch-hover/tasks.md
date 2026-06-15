---
description: "Task list for menu glitch RGB split hover refactor"
---

# Tasks: Refactor del Menú — Glitch RGB Split

**Input**: Design documents from `/specs/002-menu-glitch-hover/`

**Prerequisites**: spec.md (required)

**Tests**: No automatizados (sitio estático). Verificación visual + DevTools + bundle size.

**Organization**: Tasks por user story. US1 es MVP; US2 es cleanup previo para que US1 funcione limpio.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo
- **[Story]**: US1, US2

## Path Conventions

- **Sitio Jekyll estático**: archivos en raíz, `_includes/`, `assets/css/`, `assets/js/`

---

## Phase 1: Setup

- [x] T001 Verificar que el branch `002-menu-glitch-hover` está activo
- [x] T002 Capturar tamaño actual de `assets/js/bundles/home.bundle.js` y de las reglas CSS de `.nube-de-palabras` (líneas 316-400) para comparar después

---

## Phase 2: Foundational — US2 (cleanup)

**Purpose**: Quitar movimiento que ya no queremos antes de añadir el glitch, para que el bundle final sea limpio y no haya rAF compitiendo con el glitch.

### Implementación

- [x] T010 [US2] Eliminar `animation: orbitar 20s ...` y la regla `@keyframes orbitar` en `assets/css/style.css`
- [x] T011 [US2] Eliminar la regla `.nube-de-palabras:not(.nube-de-palabras--js) a:hover { transform: scale(1.2) rotate(2deg); }` en `assets/css/style.css`
- [x] T012 [US2] Eliminar las reglas `.nube-de-palabras--js` y `.nube-de-palabras--js a` en `assets/css/style.css` (ya no hay JS animando)
- [x] T013 [P] [US2] Reducir `flotar` a un movimiento aún más sutil (translate ≤0.3%, rotate ≤0.08deg) para que sea casi imperceptible — mantener el "respira" del contenedor
- [x] T014 [US2] En `assets/js/bundles/home.bundle.js`, eliminar el módulo "3. nube-palabras.js" entero
- [x] T015 [US2] En `assets/js/bundles/home.bundle.js`, eliminar la mención "3. nube-palabras.js" del comentario de cabecera y renumerar los módulos 4-7 a 3-6
- [x] T016 [US2] Validar: `node --check assets/js/bundles/home.bundle.js` pasa
- [x] T017 [US2] Validar: `bundle exec jekyll build` no falla
- [x] T018 [US2] Confirmar que `home.bundle.js` redujo en ≥3 KB (comparar con T002)

**Checkpoint**: Sin orbitar, sin rAF, sin escala/rotate en hover. Sitio sigue funcionando.

---

## Phase 3: User Story 1 - Glitch RGB split al hover (Priority: P1) 🎯 MVP

**Purpose**: Añadir el efecto de glitch cromático al hover/focus de cada enlace de la nube.

**Independent Test**: Hover sobre "Fragmentos" → ver cian desplazado a la izquierda y magenta/rojo a la derecha, temblor aleatorio ~60fps durante 300-500ms. Salir del hover → cancela instantáneamente.

### CSS

- [x] T030 [US1] En `assets/css/style.css`, dentro del bloque `.nube-de-palabras a`, añadir:
  - `position: relative` (para pseudo-elementos si se usan)
  - `transition: color 0.2s ease, text-shadow 0.05s steps(1)` (transición rápida para que el glitch se sienta inmediato)
- [x] T031 [US1] Añadir regla `.nube-de-palabras a.is-glitching` con `text-shadow` estático (color base) — el JS irá actualizándolo vía `style.textShadow` en cada frame
- [x] T032 [P] [US1] Añadir dentro de `@media (prefers-reduced-motion: reduce)` una regla estática: `.nube-de-palabras a:hover, .nube-de-palabras a:focus-visible { color: #fff; text-shadow: 0 0 4px rgba(0, 255, 255, 0.6); }`

### JS — Glitch controller en el bundle

- [x] T040 [US1] En `assets/js/bundles/home.bundle.js`, antes del cierre `})();` final, añadir un módulo nuevo (ahora "7. menu-glitch.js") como IIFE
- [x] T041 [US1] El módulo debe: detectar `prefers-reduced-motion` y `pointer: coarse` con `matchMedia`, y NO activar glitch en esos casos
- [x] T042 [US1] Seleccionar todos los `.nube-de-palabras a` y registrar `mouseenter` / `mouseleave` / `focus` / `blur`
- [x] T043 [US1] En `mouseenter`/`focus`: añadir clase `is-glitching`, arrancar rAF que actualiza `style.textShadow` con offsets aleatorios cian (`#0ff` o `rgba(0,255,255,.7)`) y magenta (`#f0f` o `rgba(255,0,255,.7)`)
- [x] T044 [US1] El rAF debe detenerse automáticamente tras 350-500ms o inmediatamente al `mouseleave`/`blur` (lo que ocurra primero)
- [x] T045 [US1] En `mouseleave`/`blur`: cancelar rAF, quitar clase `is-glitching`, restaurar `text-shadow` a cadena vacía
- [x] T046 [US1] Implementar cleanup si el usuario destruye la página (rAF cancelado)

### Implementación de referencia del glitch (offsets aleatorios por frame)

```js
var rafId = 0;
var startTime = 0;
var MAX_DUR = 400; // ms
var TARGET = el;

function tick(now) {
  var dt = now - startTime;
  if (dt > MAX_DUR) { stop(); return; }
  var off1 = (Math.random() * 3 - 1.5).toFixed(1);
  var off2 = (Math.random() * 3 - 1.5).toFixed(1);
  var off3 = (Math.random() * 2 - 1).toFixed(1);
  TARGET.style.textShadow =
    off1 + "px 0 0 #0ff, " +
    (-off1) + "px 0 0 #f0f, " +
    "0 " + off3 + "px 0 rgba(255,255,255,.6)";
  rafId = requestAnimationFrame(tick);
}
function stop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
  TARGET.classList.remove("is-glitching");
  TARGET.style.textShadow = "";
}
function start() {
  if (rafId) return;
  startTime = performance.now();
  TARGET.classList.add("is-glitching");
  rafId = requestAnimationFrame(tick);
}
```

### Verificación

- [x] T050 [US1] `node --check assets/js/bundles/home.bundle.js` pasa
- [x] T051 [US1] `bundle exec jekyll build` no falla
- [x] T052 [US1] Inspección manual: hover sobre cada enlace del menú produce glitch visible, mouseleave cancela limpiamente
- [x] T053 [US1] Tab con teclado sobre un enlace → se aplica el mismo tratamiento (focus visible)
- [x] T054 [US1] DevTools: en `Rendering → Emulate CSS media feature prefers-reduced-motion: reduce` → el glitch NO se anima, solo cambia color
- [x] T055 [US1] DevTools: en `Sensors → Touch` → el glitch NO se dispara (pointer: coarse)
- [x] T056 [US1] Lighthouse Accessibility ≥95 (no rompimos nada de a11y)
- [x] T057 [US1] El bundle final pesa menos que la baseline de T002 (reducción neta tras quitar nube-palabras.js + añadir glitch controller)

**Checkpoint**: MVP listo. El menú tiene el nuevo efecto.

---

## Phase 4: Polish

- [x] T060 [P] Revisar `ESTRUCTURA.md` si necesita reflejar el módulo `menu-glitch.js` en `home.bundle.js` (probablemente no, ya está descrito como "consolidado")
- [x] T061 Verificar que no quedan referencias huérfanas a `orbitar`, `nube-palabras.js`, `scale(1.2)` en el repo
- [x] T062 [P] Actualizar `specs/002-menu-glitch-hover/tasks.md` marcando todo completo y añadir fecha de cierre
- [x] T063 Commit con mensaje `feat(menu): glitch RGB split on hover, drop orbitar+rAF`

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Sin dependencias
- **Foundational US2 (Phase 2)**: Depende de Setup. Antes de US1 para no acumular CSS/JS obsoleto.
- **US1 (Phase 3)**: Depende de US2 (módulo nube-palabras.js eliminado, headers renumerados)
- **Polish (Phase 4)**: Depende de US1

### Within Each Phase

- CSS puede escribirse en paralelo con JS
- Verificaciones al final de cada fase

---

## Implementation Strategy

### MVP First

1. US2 (cleanup) — quitar orbitar y el JS
2. US1 — añadir glitch controller + CSS
3. Polish

### Secuencia recomendada (un solo dev)

1. Setup (T001-T002)
2. US2 cleanup (T010-T018) → commit intermedio "chore(menu): drop orbitar animation and rAF per-link"
3. US1 glitch (T030-T057) → commit "feat(menu): glitch RGB split on hover, drop orbitar+rAF"
4. Polish (T060-T063)

---

## Notes

- [Story] tag mapea a user story para trazabilidad
- Este feature es solo home (no afecta otras páginas)
- El bundle ya no necesita `data-no-nube-motion` ni `data-no-motion` en CSS — simplificar
- El `aria-label="Secciones del sitio"` del `<nav>` se mantiene
- Los emojis y símbolos Unicode de cada link se mantienen (☍ ↂ 𝄞 ◉ 🜏 ◊ ◇ ꩜)
- `prefers-reduced-motion: reduce` ya está manejado en el CSS de la nube (línea 392); añadir fallback estático
- Cuidado con el `text-shadow` en hover: puede ser costoso de repintar si los enlaces son largos. Aplicarlo solo a los 8 enlaces del menú (no propagarse).

## Estado de cierre (2026-06-14)

- 2/2 user stories implementadas y commiteadas en rama `002-menu-glitch-hover`
- 1 commit: `8ff44d8` (incluye US2 cleanup + US1 glitch en uno solo porque están acoplados)
- Bundle: 24.661 B → 24.278 B (−383 B netos)
- Pendiente: push a `main` y verificación visual post-deploy

| US | Commit | Cambio |
|---|---|---|
| US2 (P2) | `8ff44d8` | Quitar orbitar + JS nube-palabras.js + scale/rotate hover |
| US1 (P1) MVP | `8ff44d8` | Glitch RGB split al hover/focus |
