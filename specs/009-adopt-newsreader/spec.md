# Feature Specification: Adopt Newsreader as the editorial serif

**Feature Branch**: `009-adopt-newsreader`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "me gusto Newsreader" (después de explorar 9 candidatas via spec 008).

**Context**: El sitio KNDL 000 usaba Cormorant Garamond como serif editorial desde su fundación. El usuario reportó que "le falta aire moderno" y exploró 9 candidatas via el preview switch de spec 008. Después de probar en contexto real, eligió **Newsreader** (Production Type, 2020). Newsreader es la "hermana editorial moderna" de Spectral — transitional, optimizada para lectura digital larga, con optical sizing refinado y variable font. Tiene la modernidad que faltaba sin perder el feel editorial.

Esta spec implementa el cambio definitivo: Newsreader se convierte en la `--font-serif` default del sitio. El preview switch de spec 008 se mantiene (sigue siendo útil para comparar en el futuro), pero Newsreader es la única fuente que se carga por default.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Newsreader como --font-serif default (Priority: P1) 🎯 MVP

[Como visitante del sitio, quiero ver Newsreader cargada por default en todas las páginas (home, poemas, melange-reports, diario, fragmentos, dispositivos, etc.) — sin necesidad de usar `?font=`.]

**Why this priority**: Es el cambio. Sin esto, no hay adopción.

**Independent Test**: `curl -s http://localhost:4000/ | grep 'fonts.googleapis'` devuelve URL de Newsreader (no Cormorant). `getComputedStyle(document.documentElement).getPropertyValue('--font-serif')` en DevTools contiene "Newsreader".

**Acceptance Scenarios**:

1. **Given** el sitio corriendo, **When** se carga la home `/` sin query param, **Then** `--font-serif` apunta a Newsreader.
2. **Given** el sitio, **When** se navega a `/poemas/`, `/melange/`, `/fragmentos/`, `/dispositivos/`, **Then** todas usan Newsreader.
3. **Given** el sitio, **When** se inspecciona el `<link>` a Google Fonts, **Then** carga Newsreader (con sus weights: 200-800 + italics, opsz 6-72).
4. **Given** el sitio, **When** se ve en el browser, **Then** el feel es "moderno, editorial, legible" — sin perder la calidez que tenía con Cormorant.

---

### User Story 2 - Switch de preview sigue funcional (Priority: P2)

[Como autor, el switch de preview de spec 008 sigue funcionando — puedo seguir probando `?font=fraunces`, `?font=recoleta`, etc. para comparar en el futuro. Newsreader es la default, pero las 8 alternativas siguen accesibles via query param.]

**Why this priority**: Decisión del usuario explícita en la clarificación. Cero costo mantenerlo (ya está en `_includes/`).

**Independent Test**: `?font=fraunces` sigue funcionando, el sitio carga Fraunces temporalmente. Borrar `sessionStorage.kndl-font` resetea a Newsreader.

**Acceptance Scenarios**:

1. **Given** el sitio, **When** se navega a `?font=fraunces`, **Then** el sitio carga Fraunces (override funciona).
2. **Given** el sitio con override, **When** se navega entre páginas, **Then** el override persiste.
3. **Given** el sitio, **When** se borra `sessionStorage.kndl-font`, **Then** vuelve a Newsreader.
4. **Given** el sitio, **When** se navega sin query param y sin sessionStorage, **Then** carga Newsreader (default).

---

### User Story 3 - Documentación actualizada (Priority: P1)

[Como autor que lee el codebase y el doc de identidad visual, quiero que la decisión de cambiar Cormorant a Newsreader esté documentada — no quiero que un próximo autor se pregunte "por qué Newsreader" sin contexto.]

**Why this priority**: Higiene. La decisión fue conversada (spec 008, exploración, elección), pero eso no queda en código.

**Independent Test**: `docs/VISUAL-IDENTITY.md` menciona Newsreader como la serif editorial, no Cormorant. `grep -r 'Cormorant' docs/ assets/ _includes/ _layouts/ _config.yml` solo devuelve referencias al preview switch (donde Cormorant sigue siendo una opción válida).

**Acceptance Scenarios**:

1. **Given** `docs/VISUAL-IDENTITY.md`, **When** se lee, **Then** Newsreader aparece como la serif editorial principal.
2. **Given** el doc, **When** se lee, **Then** hay una nota breve sobre por qué se cambió desde Cormorant (link a spec 008/009).
3. **Given** `grep -r 'Cormorant Garamond' assets/ _layouts/ _config.yml _includes/`, **When** se ejecuta, **Then** los hits son solo: el preview switch (donde Cormorant sigue siendo la opción `cormorant`) y posiblemente `docs/VISUAL-IDENTITY.md` histórico.
4. **Given** el ESTRUCTURA.md, **When** se lee, **Then** el árbol sigue mencionando que el sitio usa serif editorial (sin nombrar Cormorant específicamente).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El CSS MUST cambiar `--font-serif` de "Cormorant Garamond..." a "Newsreader..." en `:root`.
- **FR-002**: Las 6 layouts (default, dispositivo, poems, melange-report, imagen, codigo) MUST cambiar el `<link>` de Google Fonts para cargar Newsreader por default.
- **FR-003**: El `<link>` debe cargar los weights que el sitio necesita: 400, 600, 800 (display + body + bold) + italic 400, 600. Variable font con opsz 6-72.
- **FR-004**: El preview switch de spec 008 MUST seguir funcionando sin cambios. Newsreader es la default, pero `?font=cormorant` (y las otras 7) siguen siendo válidas.
- **FR-005**: El sitio MUST seguir buildando sin warnings.
- **FR-006**: Ningún layout debe romperse visualmente — manual smoke test (home, poemas, melange-report, fragmentos, dispositivos).
- **FR-007**: `docs/VISUAL-IDENTITY.md` MUST actualizarse para reflejar Newsreader como la nueva serif.
- **FR-008**: Newsreader ya está en el switch, así que solo hay que:
  - Actualizar el `<link>` default de Cormorant a Newsreader
  - Actualizar `--font-serif` token
  - Actualizar la documentación
  - (NO se agrega nueva candidata porque ya está en el switch)

### Key Entities *(include if feature involves data)*

- **Newsreader**: la nueva `--font-serif` default. Production Type, 2020. Variable font, opsz 6-72, wght 200-800, italic en mismo rango. Cargada via Google Fonts.
- **Token --font-serif**: cambia de Cormorant a Newsreader. Esto afecta a: h1-h6, p, .melange-report__title, .page-title (implícito), .lab-text, main.fragmentos-archive, .init a, .poem-body, y todos los demás consumidores de `var(--font-serif)`.
- **Preview switch**: sin cambios. Sigue siendo opt-in.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El sitio carga Newsreader por default (verificable en DevTools → Computed → font-family del h1).
- **SC-002**: El `<link>` a Google Fonts en las 6 layouts apunta a Newsreader (con weights correctos).
- **SC-003**: El preview switch sigue funcionando con las 9 candidatas.
- **SC-004**: El sitio builda sin warnings.
- **SC-005**: `docs/VISUAL-IDENTITY.md` actualizado.
- **SC-006**: Ninguna página existente (home, poemas, diario, melange, fragmentos, dispositivos, visual, codigo, music, etc.) tiene regresión visual obvia (manual smoke test).
- **SC-007**: Newsreader se ve en pantalla, con la italic 400 visible en el lead de fragmentos y melange-reports.
- **SC-008**: El sitio carga más rápido que antes (Newsreader es una variable font, una sola descarga; antes Cormorant cargaba 6 estáticas).

## Assumptions

- Newsreader ya está en el preview switch de spec 008, así que la URL de Google Fonts y los weights ya están definidos. Esta spec REUTILIZA esa config.
- Newsreader se ve bien con los tokens actuales (`--fs-*`, `--lh-*`, etc.) — el refactor de type-scale en spec 007 ya unificó el sistema. Si después de adoptarla la escala necesita tuning, va en spec 010.
- Cormorant sigue siendo una opción válida del preview switch. No se elimina del switch, solo deja de ser la default.
- Newsreader es OFL, gratis, en Google Fonts. No introduce dependencias comerciales.
- El usuario vio Newsreader en el preview y en `?font=newsreader` en el sitio real antes de elegir. La decisión es informada.
- No se necesita rebuild manual — el sitio se sirve con Newsreader al recargar.
- Italic 400 + 600 son los pesos de itálica que el sitio necesita (lead de fragmentos, .lab-specimen, etc.). Newsreader los tiene.
- Documentar el cambio en el doc de identidad es importante porque la decisión fue conversada, no obvia.

## Out of Scope (v1)

- Tuning fino de la escala (`--fs-*`, `--lh-*`) para оптимизar Newsreader. Eso es spec 010 si hace falta.
- Eliminar Cormorant del preview switch. Sigue siendo una opción válida.
- Agregar weights que el sitio no usa. Si después hace falta 700, se agrega.
- Self-host de las fuentes. Google Fonts CDN es suficiente.
- Cambiar `--font-sans` (Lato) o `--font-mono` (JetBrains Mono). Solo cambia la editorial.
- Re-evaluar la decisión más adelante. Esto es "elegir y adoptar", no "probar de nuevo".

---

## Notas técnicas

**Por qué Newsreader sobre las otras (resumen del spec 008):**

- **Cormorant (mantener)**: el usuario explícitamente dijo "le falta aire moderno". Mantener era ignorar el brief.
- **Fraunces (⭐ recomendada)**: técnicamente la mejor match, pero el usuario prefirió Newsreader. Está bien — la decisión es del usuario, no del agente.
- **Spectral**: similar a Newsreader, pero más "neutra" (Production Type tiene un feel más "transitional limpio" en Spectral vs "editorial con peso" en Newsreader).
- **Bitter / DM Serif Display**: extremos — slab y display puro. No encajan con el brief.
- **Recoleta**: muy cercana a Cormorant, no resuelve el brief.
- **Source Serif 4**: muy buena segunda opción, Newsreader le ganó por feel editorial.
- **Inknut Antiqua**: ruptura total — no es lo que el usuario quiere.
- **EB Garamond**: el "lateral opuesto" — si el usuario quería "más aire moderno", EB Garamond (Old Style clásico) no es la respuesta.

**Lo que Newsreader le da a KNDL 000:**

1. **Aire moderno sin sacrificar el feel editorial** — Production Type es un estudio con pedigree, Newsreader es un producto refinado.
2. **Variable font** — una sola descarga, todos los weights, optical sizing automático.
3. **Italic 400 + 600** — perfecto para el lead de Rastros y los ledes de Melange.
4. **Display vs body coherente** — el axis `opsz` ajusta el feel automáticamente según tamaño.
5. **Compatibilidad con el sistema de tokens** — el refactor de type-scale (spec 007) ya está calibrado para una serif editorial moderna. Newsreader encaja sin tocar nada.

**Lo que NO cambia:**

- Sistema de tokens (`--fs-1` a `--fs-mono`, `--lh-tight` a `--lh-meta`, `--fw-regular` a `--fw-bold`).
- Layouts, includes, estructura de páginas.
- El preview switch (sigue siendo opt-in para comparaciones futuras).
- `--font-sans` (Lato) y `--font-mono` (JetBrains Mono).
- El resto del sitio (no se toca CSS, layouts, contenido).

**Cambios concretos:**

1. `:root` en `assets/css/style.css`:
   ```diff
   - --font-serif: "Cormorant Garamond", Georgia, "Times New Roman", serif;
   + --font-serif: "Newsreader", Georgia, "Times New Roman", serif;
   ```

2. `<link>` en las 6 layouts:
   ```diff
   - <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:...">
   + <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Lato:...">
   ```

3. `docs/VISUAL-IDENTITY.md`: actualizar tabla de glifos/familias.

4. `specs/008-typeface-exploration/spec.md`: nota al final indicando que la decisión fue Newsreader (referencia a spec 009).
