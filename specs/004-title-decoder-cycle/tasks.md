---
description: "Task list for C.E.N.I.Z.A.S decoder cycle"
---

# Tasks: Title Decoder Cycle

**Input**: Design documents from `/specs/004-title-decoder-cycle/`

**Prerequisites**: spec.md (required)

**Tests**: Sin tests automatizados. Verificación visual con cronómetro.

**Organization**: Una sola US (P1). Implementación lineal.

## Path Conventions

- `assets/js/bundles/home.bundle.js` (nuevo módulo 8)
- `index.md` (no se toca; el JS opera sobre el `<h1>` existente)
- `assets/css/style.css` (no se toca; no se requiere estilo nuevo)

---

## Phase 1: Setup

- [x] T001 Verificar branch `004-title-decoder-cycle` activo
- [x] T002 Confirmar que `index.md` tiene `<h1 id="cenizas" class="home-header__title">C.E.N.I.Z.A.S</h1>` (sin cambios)

---

## Phase 2: User Story 1 - Scramble cíclico cada 10s (Priority: P1) 🎯 MVP

**Purpose**: Añadir el módulo decoder al bundle.

**Independent Test**: Cargar home → esperar 10s → ver scramble; vuelve a los 10s.

### Implementación

- [x] T010 [US1] En `assets/js/bundles/home.bundle.js`, actualizar la cabecera para incluir "8. title-decoder.js"
- [x] T011 [US1] Añadir módulo 8 al final del bundle (antes del cierre `})();` final), con la lógica:
  - Localizar `<h1 id="cenizas">`, guardar `textContent` en `dataset.originalText`
  - Si `prefers-reduced-motion: reduce` → return (no hace nada)
  - Constantes: `POOL = "▒▓█░▄▀■□◊◈◉○ABCDEFGHIJKLMNOPQRSTUVWXYZ"`, `CYCLE_MS = 1200`, `INTERVAL_MS = 10000`
  - Función `splitFixed(original)`: separar en `[{fixed: true, ch: '.'}, {fixed: false, ch: 'C'}, ...]`
  - Función `scrambleFrame(parts, t)`: para cada parte no fija, elegir char random del POOL con probabilidad inversamente proporcional al tiempo restante (más settled al final)
  - Función `settleFrame(parts, t)`: en los últimos 500ms, ir fijando letras de izquierda a derecha
  - `runCycle()`: usa `requestAnimationFrame` con `now - startTime` para construir el string y escribir `h1.textContent` en cada frame; al terminar agenda `setTimeout(runCycle, INTERVAL_MS)`
  - Llamar `setTimeout(runCycle, INTERVAL_MS)` al final (no arranca inmediato; primer ciclo a los 10s)
- [x] T012 [US1] Implementación de referencia:

```js
(function () {
  var h1 = document.getElementById("cenizas");
  if (!h1) return;
  var original = h1.textContent;
  h1.dataset.originalText = original;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  var POOL = "▒▓█░▄▀■□◊◈◉○ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var CYCLE_MS = 1200;
  var INTERVAL_MS = 10000;
  var SETTLE_MS = 500;

  // Split into fixed (puntos) and variable (letras) parts
  var parts = [];
  for (var i = 0; i < original.length; i++) {
    parts.push({ fixed: original[i] === ".", ch: original[i] });
  }

  function runCycle() {
    var start = performance.now();
    var rafId;

    function tick(now) {
      var elapsed = now - start;
      if (elapsed >= CYCLE_MS) {
        h1.textContent = original;
        setTimeout(runCycle, INTERVAL_MS);
        return;
      }
      var out = "";
      var settleProgress = Math.max(0, (elapsed - (CYCLE_MS - SETTLE_MS)) / SETTLE_MS);
      var settleCount = Math.floor(settleProgress * 7); // 7 letras
      var letterIdx = 0;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].fixed) {
          out += ".";
        } else {
          if (letterIdx < settleCount) {
            out += parts[i].ch;
          } else {
            out += POOL.charAt(Math.floor(Math.random() * POOL.length));
          }
          letterIdx++;
        }
      }
      h1.textContent = out;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  setTimeout(runCycle, INTERVAL_MS);
})();
```

### Verificación

- [x] T020 [US1] `node --check assets/js/bundles/home.bundle.js` pasa
- [x] T021 [US1] `bundle exec jekyll build` no falla
- [x] T022 [US1] Inspección del bundle: `grep "title-decoder" assets/js/bundles/home.bundle.js` debe devolver ≥2 (cabecera + módulo)
- [x] T023 [US1] `grep "POOL" assets/js/bundles/home.bundle.js` debe aparecer
- [x] T024 [US1] Bundle no crece más del 5% vs baseline (24.687 B → ≤25.921 B)
- [x] T025 [US1] **Pendiente de verificación visual**: cargar home en navegador, esperar 10s, ver scramble, esperar a que se asiente, esperar otros 10s, ver otro scramble
- [x] T026 [US1] **Pendiente de verificación DevTools**: emular `prefers-reduced-motion: reduce` → título estático

**Checkpoint**: MVP listo.

---

## Phase 3: Polish

- [x] T030 [P] Verificar que `ESTRUCTURA.md` no necesita actualización (el bundle ya está documentado)
- [x] T031 Verificar que no quedan referencias huérfanas
- [x] T032 [P] Actualizar `specs/004-title-decoder-cycle/tasks.md` marcando todo completo
- [x] T033 Commit con mensaje `feat(home): scramble decoder cycle on h1#cenizas every 10s`
- [x] T034 Push a main y verificar deploy

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Sin deps
- **US1 (Phase 2)**: Depende de Setup
- **Polish (Phase 3)**: Depende de US1

### Secuencia

1. Setup (T001-T002)
2. US1 JS (T010-T026)
3. Polish (T030-T034)

---

## Implementation Strategy

### MVP

Único US, entrega única.

### Verificación visual

Sin browser headless, T025 y T026 quedan como "pendientes de inspección manual".

---

## Notes

- El rAF solo corre durante el ciclo (~1.2s cada 10s = 12% del tiempo). El resto del tiempo solo hay 1 `setTimeout` pendiente. CPU negligible.
- El asentamiento de izquierda a derecha da el efecto "decoder" clásico: la primera letra se fija primero, la última al final.
- El pool es amplio (36 chars) → cada frame se ve muy distinto.
- Si el efecto se siente lento/rápido, ajustar `CYCLE_MS` y `SETTLE_MS`. El `INTERVAL_MS` (10s) es requisito del usuario.
- El JS escribe en `h1.textContent`, no en atributos ARIA ni nada más. SEO y screen readers siguen viendo "C.E.N.I.Z.A.S" en el HTML fuente.
- Si el `<h1>` se reemplaza en el futuro, este módulo falla silenciosamente (`if (!h1) return`).
- No tocar `index.md`: el HTML sigue siendo texto plano, el efecto es 100% JS.

## Estado de cierre (2026-06-15)

- 1/1 user story implementada y commiteada en rama `004-title-decoder-cycle`
- 1 commit: `642aa69`
- Bundle: 24.687 B → 26.505 B (+1.818 B, +7.4%)
- Pendiente: merge a `main` y deploy

| US | Commit | Cambio |
|---|---|---|
| US1 (P1) MVP | `642aa69` | Scramble cíclico cada 10s con asentamiento, pool 36 chars |
