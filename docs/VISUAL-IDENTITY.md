# Identidad Visual — KNDL 000

> Documento vivo. Describe la identidad digital del sitio tal como existe hoy.
> Si cambias tipografía, paleta, glifos o sistema de marcas, **actualiza este doc primero**.
>
> **Diferencia con `~/Documents/kundala000/style-system/01-style-bible.md`:**
> el Style Bible norma la *producción de ilustraciones* (encargo a ChatGPT/DALL-E).
> Este doc describe la *identidad implementada* (lo que el visitante ve al cargar
> `kundala000.com`). Son complementarios, no duplicados.

---

## 1. Principios

- **Sobriedad sobre estridencia.** El sitio es un archivo, no un portafolio
  diseñado para impresionar. Negro sobre papel cálido, mucho espacio, una
  nota de color por vista.
- **Glifos antes que palabras.** Las secciones del nav y las firmas de autor
  usan glifos alquímicos (ↂ ◉ 🜏 ◊ ◇ ✶ ⚱ ⟡ ☽) en vez de iconos. Los glifos
  son del dominio público, no se licencian, no se rompen en updates.
- **Sistema, no librería.** Cada color, cada tipografía, cada animación tiene
  *una* razón de estar documentada. Si algo no encaja con la paleta, no entra.
- **Reversibilidad.** Cualquier decisión se puede deshacer leyendo el commit
  que la introdujo. El sitio no acumula deuda visual.

## 2. Tipografía

| Uso | Familia | Variable CSS | Pesos en uso |
|---|---|---|---|
| Títulos, body editorial | **Newsreader** | `--font-serif` | variable 200-800 + itálicas, opsz 6-72 |
| UI, meta, navegación | **Lato** | `--font-sans` | 300, 400, 700 + itálicas |
| Código, hashes, lab-feed | **JetBrains Mono** | `--font-mono` | 300, 400, 500 + itálicas |
| Meta del lab-feed | **ui-monospace** del sistema | `--font-ui-mono` | (sistema) |

> **Cambio 2026-06-15**: Cormorant Garamond → Newsreader (specs 008 + 009).
> Cormorant era didona soft-serif (Windsor/Souvenir/Cooper family), display con
> contraste alto. Newsreader es transitional moderno de Production Type, con
> optical sizing variable (opsz 6-72), italics expresivas, y feel "moderno-newspaper".
> Decisión después de explorar 9 candidatas via `?font=` switch.
> Cormorant sigue siendo una opción válida del preview switch para comparaciones futuras.

**Reglas:**
- **Nunca** usar `system-ui` para títulos: el sitio debe verse igual en todos
  los sistemas, y la serif es la firma.
- **Cormorant** se carga con pesos 400/600/700 + itálicas. No añadir 800/900
  sin justificar: el sitio nunca grita.
- **Lato** se usa solo para meta, navegación y UI. El cuerpo editorial es
  siempre serif.
- **JetBrains Mono** aparece solo donde hay código, hashes (`#5fa8a0`) o
  glifos de dirección. No para texto corrido.

**Cargadas vía Google Fonts en cada layout.** No hay self-host. Si Google
Fonts cae, las stack fallbacks (`Georgia`, `system-ui`, `"Courier New"`)
sostienen el render.

## 3. Paleta

### 3.1 Base obligatoria

```
--papel:    #F4EFE6   off-white cálido (Style Bible)
--tinta:    #0A0A0A   negro tinta, no #000 puro
--fondo:    #000000   negro absoluto del sitio (contraste con #papel del Style Bible)
```

> **Decisión consciente:** el sitio web usa `#000` puro para el fondo del body,
> mientras que el Style Bible de las ilustraciones usa `#0A0A0A` (off-black).
> El web es más contrastado porque el contenido se ve a través de pantallas
> iluminadas, no de papel. **No son la misma estética**, son dos materializaciones
> del mismo lenguaje visual.

### 3.2 Colores de acento en uso

Catalogados de la Style Bible accent catalog, en orden de aparición:

| Color | Hex | Uso en el sitio | Origen |
|---|---|---|---|
| Teal | `#5fa8a0` | Binary sigil en `/codigo/`, kind `CÓDIGO` en lab-feed, código y `#5fa8a0` como acento secundario | Style Bible implícito (no está en el catálogo pero es el acento histórico del sitio desde los primeros commits) |
| Ámbar | `#b8741a` | Kind `DIARIO` en lab-feed, border-left de excerpts en `/diario/`, hover del glifo `∴` en `/vestigios/` | Style Bible: "ámbar — savia, memoria, calor residual" |
| Ámbar vivo | `#c9a86b` | Glifo `∴` (firma Hermes) en estado de reposo | Style Bible: ámbar (más saturado para firma) |
| Ámbar más claro | `#e0c08a` | Glifo `∴` en hover | Derivado de `#c9a86b` |
| Cinabrio | `#a8321a` | Kind `POEMA` en lab-feed, color de error del 404 | Style Bible: "rojo cinabrio — alquimia, transmutación" |
| Cobalto apagado | `#6a8caf` | Kind `REPORTE` en lab-feed | Style Bible: "azul cobalto — agua, melancolía" |
| Beige cálido | `#c9c2b3` | Kind `FRAGMENTO` en lab-feed, figcaption hover de `/visual/` | Derivado del papel cálido |
| Azul link | `#7ab6f5` | Links del 404, links externos en lab-feed | Convencional (no Style Bible) |
| Verde savia | `#5a6b3a` | Acento histórico (revisar si sigue en uso) | Style Bible: "verde savia" |

**Reglas del sistema de color:**

1. **Un color de acento por vista, máximo dos.** Si un componente tiene más
   de dos colores, algo está fuera de control.
2. **El teal `#5fa8a0` es secundario del site-wide**, no es un acento más:
   aparece en `/codigo/`, en el código en general, y en el lab-feed como
   badge de `CÓDIGO`. Es el "color técnico" del sitio.
3. **El ámbar en sus tres tonos** (`#b8741a` apagado, `#c9a86b` vivo,
   `#e0c08a` claro) es la familia del calor: savia, memoria, diario,
   firma. No aparece en `/codigo/` ni en el melange.
4. **El cinabrio y el cobalto** son los colores de los kind labels de
   `POEMA` y `REPORTE` en el lab-feed. No se usan en otros componentes.
5. **El beige cálido** se reserva para FRAGMENTO y para hovers sutiles
   (figcaption en `/visual/`).

### 3.3 Colores de UI neutros

| Color | Hex | Uso |
|---|---|---|
| Texto secundario | `#a8a39c` | Excerpts de `/diario/` |
| Texto meta | `#999` | Fechas secundarias, labels de tipo |
| Texto terciario | `#666` | Fechas pequeñas, captions |
| Texto muted | `#444` | Borders, dividers tenues |
| Border tenue | `rgba(255,255,255,0.05)` | Separadores entre entries |
| Border más fuerte | `rgba(255,255,255,0.1)` | Separadores del collage |

## 4. Glifos (sistema de identidad)

### 4.1 Glifos del nav principal

| Glifo | Sección | Significado | Notas |
|---|---|---|---|
| `ↂ` | Poemas | flecha hacia arriba invertida = elevación, verso | único en el nav |
| `◉` | Visual | ojo = ver | círculo con punto |
| `🜏` | Melange | antimonio (alquimia) = mixtura, sustancia | U+1F70F |
| `◊` | Código | diamante = dato, bit | |
| `◇` | Dispositivos | diamante hueco = contenedor, herramienta | variante de ◊ |

**Regla de unicidad:** no hay dos glifos del mismo registro en el nav.
`◊` y `◇` son variantes (relleno vs. hueco) — diferencia semántica
"dato puro" vs. "contenedor".

### 4.2 Glifos secundarios (en listas, etiquetas, kinds)

| Glifo | Contexto | Notas |
|---|---|---|
| `✶` | Diario | estrella, en el H1 del listado |
| `⚱` | Vestigios | urna funeraria, contenedor de lo que queda |
| `⟡` | Rastros (ex-Fragmentos) | bowtie alquímico, mercurio, lo volátil |
| `☽` | Melange Reports | luna, ciclo, traversal |
| `∴` | **Firma Hermes** (alter-ego del autor) | triple therefore, "por lo tanto" |
| `↳` | "ver más" en entradas | flecha de continuación |
| `←` | back-button | retorno |
| `∅` | INIT (link al inicio) | conjunto vacío |
| `◦` | bullet de cada post de diario | anillo, no lleno |
| `~` | borde de poema en H1 | tilde, ondulación |

### 4.3 Reglas de glifos

1. **El glifo `∴` es exclusivo de Hermes.** Nadie más lo usa. Si en el
   futuro otro colaborador firma contenido, se le asigna un glifo distinto.
2. **El glifo aparece en la página de listado** (`vestigios/index.md`)
   cuando `vestigio.hermes == true`. No en el detalle de cada item.
3. **Color del glifo** en reposo: `#c9a86b` (ámbar vivo). En hover del
   title-link: `#e0c08a`. Borde de 0.35em con el título.
4. **Tamaño**: mismo que el texto del título (sin `font-size: 1.2em` ni
   cosas por el estilo). El sigil es un igual, no un encabezado.

## 5. Layout y composición

### 5.1 Layouts disponibles

| Layout | Uso | Estructura |
|---|---|---|
| `default.html` | páginas raíz, posts, vestigios | `<main>` + `title.html` + `figure.html` (opcional) + contenido + `back-button.html` |
| `poems.html` | detalle de poemas | H1 con `~` + `nav-poem.html` + `figure.html` + cuerpo + `related-poem.html` + `back-button.html` |
| `codigo.html` | detalle de códigos | H1 + `concept` (cursiva) + `codigo-meta` (lenguaje, fecha) + código |
| `imagen.html` | detalle de imágenes | `<article class="imagen-page">` con figure + body |
| `dispositivo.html` | detalle de dispositivos | H1 con `◇` + meta + contenido |
| `melange-report.html` | detalle de melange reports | ficha técnica + relato |
| `generator.html` | **(dead code, eliminado en #18)** | — |
| `interactive.html` | **(dead code, eliminado en #18)** | — |

### 5.2 Composición general

- **Max-width del contenido:** no excede `~720-760px` en la mayoría de
  las páginas. El body tiene un padding lateral generoso
  (`max(1.5rem, env(safe-area-inset-*, 0px))`).
- **Centrado:** todo el contenido está centrado, sin sidebar. La excepción
  es el collage de `/visual/` que es full-bleed.
- **Background:** negro absoluto `#000` en todo el sitio, sin gradientes.
- **Bordes:** la mayoría son `border-left: 1-2px solid rgba(255,255,255,0.05-0.1)`,
  apenas visibles. Sirven para agrupar, no para decorar.

### 5.3 Tipografía y ritmo

- **Line-height:** 1.7 en el cuerpo editorial (Cormorant), 1.4-1.5 en
  meta y UI.
- **Letter-spacing:** ligero en mayúsculas pequeñas
  (`letter-spacing: 0.08em` en `lab-specimen-meta`).
- **Espaciado entre sections:** `2rem` mínimo, `3rem` entre entries
  principales (poemas, vestigios, posts de diario).

## 6. Sistema de marcas (signatures)

El sitio tiene tres "marcadores de identidad" que se usan para señalar
dónde el sitio firma algo. No son iconos UI, son firmas:

| Marcador | Significado | Lugar |
|---|---|---|
| `∴` (ámbar, en reposo) | contenido firmado por **Hermes** (alter-ego del autor) | `/vestigios/`, prepende al título de items con `hermes: true` |
| `#00000000` (teal, en badge) | código de la colección `/codigo/` (identidad de bit, no de autor) | `/codigo/`, precede a cada item |
| `[Título]` (entre corchetes) | cita o nombre de código en el listado | `/codigo/`, parte del título |

**Regla:** los tres no se mezclan en la misma vista. Si un item del
`/codigo/` está firmado por Hermes, se ve `#00000000 [Título]` (badge
binario primero, brackets en el título, **sin** el `∴` separado).

## 7. Animación y movimiento

### 7.1 Animaciones en uso

- **C.E.N.I.Z.A.S title decoder** (PR #4 del usuario, antes de Hermes):
  scramble cada 10s del H1 de la home. Pool mixto: 10 glifos + 26 letras.
  Caracteres fijos: los puntos. `prefers-reduced-motion: reduce`
  desactiva.
- **Menu char-glitch** (módulo 7 del bundle): en hover/focus de cada
  link del nav, scramble de caracteres. RGB-split sutil.
- **Collage figure animation-delay**: cada figure del collage de la
  home tiene un `animation-delay` 0.1s × índice. Animación de entrada
  escalonada al cargar.
- **Hover brightens**:
  - `∴` en vestigios: `#c9a86b` → `#e0c08a` (200ms).
  - Collage figcaption: `#888` → `#c9c2b3` (250ms).
  - Binary sigil en código: borde se ilumina al pasar el mouse (no
    implementado aún; sería el siguiente paso natural).
- **Scroll-snap horizontal** en el collage de la home (`/visual/` también,
  pero la home tiene el carrusel de 6 imágenes).

### 7.2 Reglas de animación

1. **Nada se mueve solo.** Cada animación requiere acción del usuario
   (hover, focus, scroll) o tiene un ciclo largo (>5s) en elementos
   decorativos del H1.
2. **`prefers-reduced-motion: reduce`** desactiva TODO scramble y
   glitch. Verificado en `home.bundle.js`.
3. **No hay animaciones en textos largos.** El cuerpo de un poema o
   de un post nunca se anima, solo se decodifica el H1.
4. **Las transiciones son cortas** (200-300ms). El sitio es de lectura,
   no de juego.

## 8. Sistema de símbolos (mapa de uso)

```
NAV (5 entradas)
  ↂ Poemas          ◉ Visual          🜏 Melange         ◊ Código          ◇ Devices

LISTADOS (5 secciones)
  ✶ Diario          ⚱ Vestigios       ⟡ Rastros       ☽ Melange Reports

FIRMAS
  ∴  (Hermes)
  #00000000  (código)
  ~  (poema)

UI
  ↳  ver más        ←  volver         ∅  INIT            ◦  bullet
```

## 9. Sistema de layout y CSS

- **BEM estricto** desde el PR #5 (vestigios). Todas las clases siguen
  el patrón `block`, `__element`, `--modifier`. No hay utility-first.
- **No utility classes.** No `.mt-3`, no `.text-center`. Si necesitas
  centrar, abres el CSS.
- **Sin CSS frameworks.** No Tailwind, no Bootstrap. CSS escrito a mano
  en `assets/css/style.css` (3368 líneas, 500 llaves en el último
  refactor).
- **Mobile-first con `@media (max-width: ...)`.** Los breakpoints son
  360, 480, 500, 520, 580, 600, 768, 900, 1024. El collage reduce de
  3 a 2 columnas a 900px y a 1 a 600px.

## 10. Bundle JS (home)

El bundle `assets/js/bundles/home.bundle.js` (802 líneas) es la
concatenación manual de 8 módulos IIFE:

1. `home-nav.js` — toggle de nav móvil + scroll-hide
2. `lab-home.js` — feed de laboratorio (shuffle + hash FNV-1a)
3. `home-canvas.js` — canvas#art (línea sinusoidal vibrátil)
4. `home-audio.js` — sintetizador generativo con Tone.js
5. `collage-home.js` — render del collage dinámico
6. `home-collage-carousel.js` — centrado del slide medio en móvil
7. `menu-char-glitch.js` — glitch de caracteres random en hover/focus
8. `title-decoder.js` — scramble cíclico cada 10s del `<h1 id="cenizas">`

> **⚠️ Advertencia operacional:** los módulos 7 y 8 (`menu-char-glitch.js`
> y `title-decoder.js`) **no existen como archivos en disco**; viven
> solo dentro del bundle. Si en el futuro se regenera el bundle desde
> los archivos, esos dos módulos se pierden. **El bundle es la fuente
> de verdad para ellos.** Cualquier edit del comportamiento de glitch o
> decoder debe hacerse directamente sobre el bundle, no sobre archivos
> inexistentes.

## 11. Decisiones que todavía no se han tomado

- **Skip-link para a11y.** La home tiene `aria-controls` en el nav-toggle
  y `aria-label` en collage, lab-feed y melange skeleton. No hay
  "Saltar al contenido" en `<body>`. Pendiente.
- **Página `/musica/`**. Existe como `musica/index.md` y `_data/assemblage.yml`
  pero no aparece en el nav principal. Pendiente de decisión: ¿se
  añade al nav, o queda como recurso secundario?
- **Aria-labels** en `back-button.html` y `nav-poem.html`. El back-button
  es solo `←` sin texto. Para screen readers, falta el label.
- **Imágenes de vestigios firmados**. El primer vestigio Hermes
  ("Página que ya no responde") no tiene imagen. Pendiente: prompt
  candidato a ChatGPT siguiendo el Style Bible.

## 12. Cambios que este doc rastrea

- 2026-06-15: creado. Estado de la identidad después de 24 PRs de
  Hermes (tecnología + diseño). Siguiente revisión programada para
  cuando se cierren los 5 PRs de diseño o se abra el primer PR de
  contenido multi-firmado.
