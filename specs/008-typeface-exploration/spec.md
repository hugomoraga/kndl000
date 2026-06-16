# Feature Specification: Exploración de nueva tipografía editorial (reemplazo de Cormorant Garamond)

**Feature Branch**: `008-typeface-exploration`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Buscaria otra Fuente." (en respuesta a que Cormorant Garamond, si bien le gustaba, "le falta aire moderno").

**Context**: El sitio KNDL 000 usa Cormorant Garamond como serif editorial (regla de `docs/VISUAL-IDENTITY.md`, "títulos, body editorial"). Cormorant es un **didona moderno** (display, "Old Style" soft-serif inspirado en Windsor, Souvenir, Cooper). Alto contraste entre gruesos y finos, remates planos, presencia dramática. Funciona como display pero como cuerpo de texto largo puede sentirse anticuado y pesado. El usuario quiere algo "con más aire moderno" — más humanista, más textura, más "con cuerpo" pero menos古董. Esta spec es **exploración + mecanismo de preview**: propone 4 candidatos sólidos y un switch in-browser para que el usuario los pruebe sin commitear nada.

**Nota crítica de proceso**: Esta NO es una spec de implementación. Es un spec de *exploración*. El éxito se mide en: (a) tener 4 candidatos viables caracterizados, (b) un mecanismo para previsualizarlos en el sitio real, (c) una recomendación del agente con justificación. La implementación real (cambiar `--font-serif`, ajustar scale si hace falta) viene en spec 009, una vez que el usuario elija.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mecanismo de preview por query param (Priority: P1) 🎯 MVP

[Como autor, quiero poder cambiar la fuente del sitio en tiempo real via URL (`?font=fraunces`, `?font=spectral`, etc.) para poder compararlas en contexto real, leyendo mis poemas, mis diarios, mis melange-reports — no en specimens aislados de Google Fonts. La elección por default sigue siendo Cormorant; este switch es opt-in via query string.]

**Why this priority**: Es el corazón de la exploración. Sin esto, el usuario tiene que imaginar cómo se vería cada fuente en SU sitio, con SU contenido. Comparar specimens es información incompleta.

**Independent Test**: `http://localhost:4000/?font=fraunces` carga el sitio con Fraunces. `?font=spectral` con Spectral. Sin query param, sigue en Cormorant. El switch es client-side (CSS variable override), no requiere rebuild.

**Acceptance Scenarios**:

1. **Given** el sitio corriendo, **When** se navega a `?font=fraunces`, **Then** la variable `--font-serif` apunta a Fraunces.
2. **Given** el sitio corriendo, **When** se navega a `?font=spectral`, **Then** la variable `--font-serif` apunta a Spectral.
3. **Given** el sitio corriendo, **When** se navega sin query param, **Then** la fuente es Cormorant (default actual).
4. **Given** el sitio con el switch activo, **When** se navega entre páginas (poemas, diario, melange-report, fragmentos, etc.), **Then** el override persiste.
5. **Given** el sitio con el switch activo, **When** se recarga la página, **Then** el override se mantiene (vía sessionStorage).
6. **Given** el sitio, **When** se clickea un link interno, **Then** el override NO se pierde (el query param se preserva o se lee de sessionStorage).

---

### User Story 2 - 4 candidatos caracterizados con sus pros/contras (Priority: P1)

[Como autor, quiero tener una lista de 4 fuentes candidatas con descripción clara, link al specimen, weights disponibles, y pros/contras específicos para el feel de KNDL 000 — para no elegir a ciegas entre 30 fuentes de Google Fonts.]

**Why this priority**: Acota el espacio. Sin esto el usuario se pierde.

**Independent Test**: El spec lista 4 fuentes con: nombre, link a Google Fonts, weights cargados, 2-3 pros, 2-3 contras, y por qué encaja con el brief ("aire moderno"). El usuario puede verlas lado a lado.

**Acceptance Scenarios**:

1. **Given** el spec, **When** se lee la sección de candidatos, **Then** hay exactamente 4 (no 2 ni 8).
2. **Given** cada candidato, **When** se lee, **Then** tiene: nombre, link a Google Fonts, weights disponibles, pros para KNDL, contras para KNDL.
3. **Given** los candidatos, **When** se comparan, **Then** cubren el espectro "moderno editorial" — desde humanista clásico hasta soft-serif display.

---

### User Story 3 - Recomendación del agente con justificación (Priority: P1)

[Como autor, además de la lista de candidatos, quiero la recomendación del agente: una sola fuente recomendada, con justificación específica para el tono de KNDL 000, no genérica. El usuario puede aceptarla o descartarla, pero tiene un ancla.]

**Why this priority**: Evita parálisis de elección. 4 fuentes + mecanismo de preview + recomendación explícita = el usuario puede actuar.

**Independent Test**: El spec tiene una sección "Recomendación" con: nombre, por qué sí, por qué no las otras.

**Acceptance Scenarios**:

1. **Given** el spec, **When** se lee la sección de recomendación, **Then** hay UN candidato recomendado.
2. **Given** la recomendación, **When** se lee, **Then** la justificación menciona aspectos específicos de KNDL 000 (rastros, melange, poèmes, etc.) — no genérica.
3. **Given** la recomendación, **When** se lee, **Then** explica por qué NO se recomiendan las otras 3.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sitio MUST aceptar un query param `?font=<slug>` (valores: `cormorant`, `fraunces`, `newsreader`, `spectral`, `bitter`) y aplicar el override de `--font-serif`.
- **FR-002**: El override MUST aplicarse via CSS variable (no requiere rebuild, funciona client-side via JS inline o CSS `@import` condicional).
- **FR-003**: El override MUST persistir en `sessionStorage` para que la navegación entre páginas no lo pierda.
- **FR-004**: El default (sin query param) MUST seguir siendo Cormorant Garamond — el preview es opt-in, no disruptivo.
- **FR-005**: El sitio MUST seguir buildando y deployando con la fuente default.
- **FR-006**: El spec MUST incluir 4 candidatos caracterizados.
- **FR-007**: El spec MUST incluir una recomendación con justificación específica.
- **FR-008**: El preview mechanism NO debe agregar más de ~5KB de JS inline.
- **FR-009**: El preview mechanism NO debe hacer requests adicionales a Google Fonts más allá de los que ya hace (es decir, NO carga Fraunces en el default — solo cuando el query param lo pide).

### Key Entities *(include if feature involves data)*

- **Typeface override**: una pieza de JS inline al final del `<body>` que lee `?font=` y `sessionStorage`, y aplica el override via `document.documentElement.style.setProperty('--font-serif', '...')`.
- **Candidata**: una fuente con nombre, weights, link, pros/contras, y veredicto.
- **Recomendación**: la candidata sugerida con justificación para KNDL 000.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 9 candidatas caracterizadas en el spec.
- **SC-002**: 1 recomendación explícita con justificación.
- **SC-003**: El mecanismo de preview funciona (verificable navegando a `?font=fraunces` y viendo el cambio).
- **SC-004**: El sitio sin query param se ve igual que antes (no regresión).
- **SC-005**: El sitio con `?font=fraunces` carga Fraunces, mantiene el resto de tokens (--fs-*, --lh-*, etc.) intactos.
- **SC-006**: El sitio con override navega entre páginas (poemas, melange, fragmentos) sin perder el override.
- **SC-007**: `bundle exec jekyll build` sigue limpio (sin warnings nuevos).
- **SC-008**: La página `/specs/008-typeface-exploration/preview.html` (si se crea) permite ver las 9 fuentes en el mismo contexto, lado a lado.

## Assumptions

- El usuario quiere explorar, no está casado con ninguna fuente específica todavía.
- Las 9 fuentes candidatas (Cormorant + 8) son las que recomiendo después de evaluar el espacio — no son las únicas opciones, pero cubren el cuadrante "más moderno que Cormorant" con perfiles distintos entre sí.
- Google Fonts es la fuente de las fuentes (CDN gratuito, fácil de cambiar, mismo mecanismo que el sitio ya usa para Cormorant). No descargo las fuentes localmente.
- Cormorant sigue siendo la default. Si al final se cambia, va en spec 009.
- El preview NO requiere rebuild — el sitio se sirve con Cormorant por default, el JS inline aplica override al cargar.
- "Aire moderno" no significa "sans-serif". El usuario quiere seguir con serif (regla del sitio), solo que más humanista, menos古董.
- Los weights deben cubrir 400 + 600 (los que usa el sitio actualmente después del refactor de type-scale). Italic deseable para el lead de fragmentos y ledes.
- No descargo las fuentes — uso `<link>` a Google Fonts cuando el override está activo. Esto suma ~1-2 requests solo cuando el usuario previsualiza.
- El preview.html (si se crea) es un archivo estático en `/specs/008-typeface-exploration/preview.html` que el `_config.yml` excluye del build (ya está excluido `specs/`).

## Out of Scope (v1)

- Cambiar `--font-serif` definitivo (eso es spec 009, post-elección).
- Auto-hospedar las fuentes (no Fontsource, no `/assets/fonts/`) — Google Fonts CDN es suficiente.
- Evaluar fuentes no-Google-Fonts (ej: Commercial Type, Klim, etc.) — para eso hay que pagar o self-host. Asumimos open-source.
- Cambiar `--font-sans` (Lato) o `--font-mono` (JetBrains Mono). Cormorant es el único issue.
- Agregar más de 4 candidatas (la lista se mantendría manejable).
- Implementar A/B testing o analytics de qué fuente prefiere el usuario.

---

## Candidatas: 4 fuentes para explorar

### 1. **Cormorant Garamond** (actual, control)

- **Link**: https://fonts.google.com/specimen/Cormorant+Garamond
- **Weights cargados**: 300, 400, 500, 600, 700 + italics
- **Origen**: Christian Thalmann (Catharsis Fonts), 2015
- **Tipo**: Display "Old Style" soft-serif, inspirado en Garamond de mediados del s. XVI
- **Pros para KNDL**: ya está integrada, sistema de tokens ya calibrado a sus medidas, comunidad de usuarios ya lo lee.
- **Contras para KNDL**: alto contraste古董, itálica "rara", puede sentirse anticuado vs Spectral/Newsreader.

### 2. **Fraunces** ⭐ *(recomendada)*

- **Link**: https://fonts.google.com/specimen/Fraunces
- **Weights cargados**: variable 100-900 + italics (axis: opsz, wght, SOFT, WONK)
- **Origen**: Phaedra Charles / Undercase Type, 2019-2021
- **Tipo**: Display "Old Style" soft-serif, *hermano moderno* de Cormorant (mismo linaje: Souvenir, Cooper, Windsor) — pero con personalidad juguetona, optical sizing refinado, y 4 variable axes.
- **Por qué encaja con el brief "aire moderno"**: es la versión 2020s de lo que Cormorant quería ser. Tiene el carácter editorial humanista (no es didona-display pura), pero con más textura, más personalidad, y un sistema variable que permite ajustes finos (el axis `opsz` ajusta el feel según tamaño — display vs body).
- **Pros para KNDL**: variable font = control total desde CSS, italicas expresivas (perfecto para el lead italic de fragmentos), feel "diario" que match con melange, gratis en Google Fonts, SOFT axis permite ir de sharp (editorial) a soft (humano) sin cambiar de fuente.
- **Contras para KNDL**: tiene una `g` y otros detalles que pueden no gustar (la `g` es un poco particular); sus opentype features (WONK axis) pueden ser distractoras si no se controlan.

### 3. **Spectral**

- **Link**: https://fonts.google.com/specimen/Spectral
- **Weights cargados**: 200, 300, 400, 500, 600, 700, 800 + italics
- **Origen**: Production Type, 2017
- **Tipo**: Serif "transitional" moderno, racional, menos decorativo que Cormorant. Diseñado para lectura digital larga.
- **Pros para KNDL**: más "Sohne con serifa" — neutro, legible, no古董. Buena para cuerpo de texto largo (diario, melange). Viene de Production Type, estudio con buen ojo editorial.
- **Contras para KNDL**: menos personalidad que Fraunces; puede sentirse "neutral" en exceso (no tiene el carácter de Cormorant). Display en headlines queda menos dramático.

### 4. **Newsreader**

- **Link**: https://fonts.google.com/specimen/Newsreader
- **Weights cargados**: variable 200-800 + italics
- **Origen**: Production Type, 2020
- **Tipo**: Hermana más editorial de Spectral. Optimizada para lectura digital, opticals que crecen, ascender prominent.
- **Pros para KNDL**: el "Faktum del serif" moderno. Diseño limpio pero con peso. Variable font con opsz y wght.
- **Contras para KNDL**: la "g" single-storey es más funcional que expresiva. Puede sentirse "tool" más que "obra". Similar a Spectral en feel, no aporta tanto al brief.

### 5. **Bitter** (cuarta opción, no obvia)

- **Link**: https://fonts.google.com/specimen/Bitter
- **Weights cargados**: 100-900 + italics (algunos)
- **Origen**: Sol Matas, 2011 (Google Fonts, 2014)
- **Tipo**: Slab-serif humanista. NO es lo que el usuario pidió ("serif humanista moderno" no implica slab), pero es un punto de contraste útil.
- **Pros para KNDL**: robusto, muy legible, tiene "cuerpo" (la slab lo hace sentir más sólido que Cormorant).
- **Contras para KNDL**: la slab es disruptiva — cambia el "aire moderno" por "aire industrial/artesanal". Si el usuario quiere "más aire" NO quiere slab.
- **Incluida como contraste**: para que el usuario vea que la decisión es entre *cuál serif humanista*, no entre *serif o no serif*.

### 6. **Recoleta** ⭐

- **Link**: https://fonts.google.com/specimen/Recoleta
- **Weights cargados**: 300-900 + italics
- **Origen**: Latinotype, 2018 (Google Fonts, 2023)
- **Tipo**: Didona-humanista con raíces en tipografía argentina de los 70s (Rustic, Verdad). Remates suaves, contraste medio-alto, mucha personalidad.
- **Pros para KNDL**: la "hermana emotiva" de Cormorant — mismo linaje didona pero más cálida, menos formal, más "ensayo personal". Excelente para el feel KNDL.
- **Contras para KNDL**: relativamente nueva en Google Fonts (2023), menos probada. Italic limitado en Google Fonts.

### 7. **DM Serif Display**

- **Link**: https://fonts.google.com/specimen/DM+Serif+Display
- **Weights cargados**: solo 400, no italic
- **Origen**: Colophon Foundry, 2015
- **Tipo**: Display puro. Dramática para H1, pésima como body. Remates altos, alto contraste.
- **Pros para KNDL**: muestra el extremo "display" del espacio. Útil para ver el contraste con body neutro.
- **Contras para KNDL**: NO sirve para párrafos. Solo display. Italic no existe. La "g" es genérica. Inutilizable como `--font-serif` global.

### 8. **Source Serif 4** ⭐

- **Link**: https://fonts.google.com/specimen/Source+Serif+4
- **Weights cargados**: variable 200-900 + italics (opsz axis: 8-60pt)
- **Origen**: Frank Grießhammer (Adobe), 2021
- **Tipo**: Transitional moderno. El "Helvetica del serif" — neutral pero con peso. Excelente para body largo.
- **Pros para KNDL**: si Spectral te pareció "neutro en exceso", Source Serif 4 es similar pero con más "humanidad". Diseño de Adobe, leído y refinado. Variable font con opsz.
- **Contras para KNDL**: puede sentirse "tool" más que "obra". Menos carácter que Fraunces/Recoleta.

### 9. **Inknut Antiqua**

- **Link**: https://fonts.google.com/specimen/Inknut+Antiqua
- **Weights cargados**: 300-900, NO italic
- **Origen**: Andrew Paglinawan, 2014
- **Tipo**: Serif humanista con raíces caligráficas, diseñada para texto de India. Remates pronunciados, mucho "cuerpo".
- **Pros para KNDL**: ruptura total con el linaje Occidental. Te muestra que el espacio "serif moderno" no es solo europeo. Feel de manuscrito, de "archivo".
- **Contras para KNDL**: muy personalidad, puede no ser lo que querés. Sin italic. Si Cormorant es "didona Occidental", Inknut es "didona India" — totalmente distinto.

### 10. **EB Garamond** ⭐

- **Link**: https://fonts.google.com/specimen/EB+Garamond
- **Weights cargados**: variable 400-800 + italics
- **Origen**: Georg Duffner, 2011-2017
- **Tipo**: Digital revival directo del Garamond de Claude Garamont (1530s). Old Style clásico, no reinterpretación.
- **Pros para KNDL**: el "lateral opuesto" a Cormorant — Cormorant es Old Style reinterpretada con sabor Windsor; EB Garamond es el Old Style clásico. Más delicada, más cuerpo, italic hermosa. Si te cansaste de la "moderna" Cormorant, EB Garamond es el respiro.
- **Contras para KNDL**: puede sentirse "vieja" si lo que querías es aire moderno (en el sentido de "actual", no "histórico"). Menos variable, menos tooling moderno.

---

## Recomendación: **Fraunces**

**Por qué Fraunces para KNDL 000:**

1. **Matchea el linaje de Cormorant pero moderno**: KNDL 000 ya está calibrado para un didona soft-serif (Windsor/Souvenir/Cooper family). Fraunces es exactamente eso, con la sensibilidad 2020s — optical sizing refinado, variable axes, italicas que cantan.

2. **Aire moderno por el opsz axis**: el axis `opsz` (9pt a 144pt) ajusta el feel automáticamente — display a 80px se ve dramático y editorial, body a 16px se ve neutro y legible. Cormorant requiere que el autor elija weights manualmente; Fraunces lo hace por vos.

3. **Perfecto para el tono KNDL**:
   - **Rastros**: el `※` marca + serif italic con el SOFT axis activado (más humano) = "cuaderno"
   - **Melange Reports**: el H1 display con opsz alto = "reportaje editorial"
   - **Poemas**: el body con opsz bajo = "lectura larga sin drama"
   - **Visual generador**: el meta mono no cambia, no se afecta

4. **Es variable**: una sola descarga cubre todos los weights. El sitio carga una sola fuente en vez de 5 estáticas. Bundle más liviano.

5. **Es gratis y open-source (OFL)**: igual que Cormorant, no introduce dependencias comerciales.

6. **Mismo color emocional, mejor tecnología**: Cormorant era "el didona que el sitio merecía en 2015". Fraunces es "el didona que el sitio merece en 2025".

**Por qué NO las otras (resumen rápido — la sección de Candidatas tiene los detalles):**

- **Cormorant (mantener)**: si el usuario dice "le falta aire moderno", el spec lo escuchó. Mantenerla es ignorar el brief.
- **Spectral**: buena para cuerpo largo pero le falta personalidad. KNDL no es "blog de tecnología limpio" — es un archivo alquímico. Spectral lo neutralizaría.
- **Newsreader**: similar a Spectral, hermana, sin la chispa. Mismo argumento.
- **Bitter**: slab es disruptiva. Si el usuario quería "más aire" no quería "más peso". Se incluye como contraste, no como candidata seria.
- **Recoleta**: ⭐ segunda opción. Mismo linaje que Cormorant pero más emotiva. Si después de probar Fraunces no convence, Recoleta es el siguiente paso natural.
- **DM Serif Display**: display puro, inutilizable como `--font-serif` global. Solo display, no italic, no body.
- **Source Serif 4**: ⭐ segunda opción para "cuerpo de texto largo moderno". Si lo que querés es "el Atlantic/NYT feel", es esta. Menos carácter que Fraunces/Recoleta.
- **Inknut Antiqua**: ruptura total con el linaje Occidental. Personalidad excesiva, sin italic. Incluida para mostrar que el espacio es más amplio de lo que parece.
- **EB Garamond**: ⭐ segunda opción para "el respiro opuesto" — si te cansaste de la "moderna" Cormorant y querés el Old Style clásico. Puede sentirse "vieja" si lo que querías era "aire actual".

---

## Plan de preview (lo que se implementa en este PR)

1. **JS inline** al final del `<body>` en `default.html` (y propagar a las otras layouts que lo necesiten):
   ```js
   (function(){
     var allowed = {cormorant:0, fraunces:0, spectral:0, newsreader:0, bitter:0};
     var url = new URL(location.href);
     var f = (url.searchParams.get('font') || sessionStorage.getItem('kndl-font') || '').toLowerCase();
     if (!f || !allowed.hasOwnProperty(f)) return;
     sessionStorage.setItem('kndl-font', f);
     var fonts = {
       fraunces: 'Fraunces, Georgia, serif',
       spectral: 'Spectral, Georgia, serif',
       newsreader: 'Newsreader, Georgia, serif',
       bitter: 'Bitter, Georgia, serif',
       cormorant: 'Cormorant Garamond, Georgia, serif'
     };
     document.documentElement.style.setProperty('--font-serif', fonts[f] || fonts.cormorant);
     if (f !== 'cormorant') {
       var link = document.createElement('link');
       link.rel = 'stylesheet';
       link.href = 'https://fonts.googleapis.com/css2?family=' + f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, '+$1') + ':ital,wght@0,400;0,600;1,400&display=swap';
       document.head.appendChild(link);
     }
   })();
   ```
   - Lee `?font=` o `sessionStorage.kndl-font`
   - Si es válido, aplica override
   - Si no es cormorant, agrega `<link>` a Google Fonts (lazy)
   - Si no hay param, no hace nada (Cormorant default, sin request extra)

2. **Página de preview** en `specs/008-typeface-exploration/preview.html` (excluida del build):
   - Muestra 5 bloques de texto (lead, h1, párrafo, marca, mono-mix) en cada fuente
   - Links para ir al sitio real con `?font=X`
   - Solo accesible durante la exploración, no entra al deploy

3. **Documentación** en este spec + decisión final en spec 009 (post-uso).

4. **Commit / push / PR**: este PR no cambia `--font-serif` default. Solo agrega el switch + el spec + la preview. La decisión final es un PR aparte.

---

## Riesgos

- **Fraunces puede no gustar después del preview**: si el usuario la prueba y no convence, el switch permite volver a Cormorant o probar las otras. La spec sigue siendo útil como caracterización.
- **El `g` de Fraunces es controversial**: hay gente que la ama, gente que la odia. Si al verla live no convence, Newsreader es la siguiente mejor opción.
- **Bundle size**: agregar las 4 fuentes en Google Fonts via `<link>` cuando se activan suma ~50-100KB total (las 4 variable fonts). Solo se cargan si el usuario hace `?font=`. Default sigue siendo Cormorant sin cambio.
- **CORS / CSP**: el sitio no usa CSP estricta, así que `<link>` cross-origin a Google Fonts está OK.
