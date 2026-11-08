---
name: KNDL 000
description: Archivo creativo en estado umbral — una cámara de niebla donde texto, imagen y código se condensan.
colors:
  chamber-black: "#060708"
  ink: "#e9e6dc"
  ink-dim: "#9aa3a1"
  ink-muted: "#7f8a88"
  nav-ink: "#c3c8c4"
  trace-cyan: "#9fc6c9"
  event-amber: "#c7a466"
  rule: "rgba(233, 230, 220, 0.12)"
  rule-faint: "rgba(233, 230, 220, 0.07)"
  code-teal: "#8fbfc0"
  diary-amber: "#c2a06a"
  poem-cinnabar: "#c0816e"
  report-cobalt: "#8fa4bd"
  viewer-black: "#0a0c0d"
  syntax-number: "#a9bfa0"
  syntax-function: "#d8d2c0"
  syntax-type: "#b7c9a9"
  syntax-variable: "#c6d2d0"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(3.2rem, 9vw, 6rem)"
    fontWeight: 250
    lineHeight: 0.82
    letterSpacing: "0.06em"
    fontVariation: "\"opsz\" 72"
  quote:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.55rem, 3.6vw, 2.8rem)"
    fontWeight: 300
    lineHeight: 1.18
    letterSpacing: "0em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "0em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0em"
  body:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(0.95rem, 1.6vw, 1.05rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0em"
  sans:
    fontFamily: "Lato, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  none: "0px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3rem"
  2xl: "5rem"
components:
  nav-link:
    textColor: "{colors.nav-ink}"
    typography: "{typography.body}"
    padding: "0.3rem 0"
    rounded: "{rounded.none}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    padding: "0.68rem 1rem"
    rounded: "{rounded.none}"
  lab-row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1.15rem 0"
    rounded: "{rounded.none}"
  exit-link:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1.3rem 0"
    rounded: "{rounded.none}"
  code-module:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1.15rem 0"
    rounded: "{rounded.none}"
  code-bench:
    backgroundColor: "rgba(0, 0, 0, 0.26)"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "1.15rem 1.25rem"
    rounded: "{rounded.none}"
  plate:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "0.8rem 1rem 1rem"
    rounded: "{rounded.none}"
  light-table:
    backgroundColor: "{colors.viewer-black}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0"
  reading-frame:
    backgroundColor: "{colors.chamber-black}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2rem) clamp(4rem, 8vw, 7rem)"
    rounded: "{rounded.none}"
  rastro-block:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "0 0 2rem"
    rounded: "{rounded.none}"
  poem-row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1rem 0"
    rounded: "{rounded.none}"
  poem-pager:
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    padding: "1.25rem 0 0"
    rounded: "{rounded.none}"
  melange-entry:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "1.5rem 0"
    rounded: "{rounded.none}"
  melange-report:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0"
    rounded: "{rounded.none}"

  interior-frame:
    backgroundColor: "{colors.chamber-black}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "clamp(1.25rem, 4vw, 2rem)"
    rounded: "{rounded.none}"

---

# Design System: KNDL 000

## Overview

**Creative North Star: "La cámara de niebla"**

KNDL 000 se comporta como un instrumento científico antiguo encendido en una habitación oscura. La portada no es una landing: es una cámara de niebla donde las señales invisibles —un poema, una imagen, una rutina de código— se condensan en trazas visibles. El fondo casi negro, la línea umbral de 1px y el canvas generativo hacen el trabajo; la interfaz se retira.

La voz es editorial y sobria, pero el mecanismo está a la vista. La serif carga el pensamiento; la mono mide y fecha; el canvas produce el fenómeno. Lo psicodélico aparece como física —trazas que se curvan, se ramifican y se disipan—, nunca como neón decorativo. La composición prefiere el vacío, las reglas capilares y una sola anomalía luminosa por pantalla.

**Key Characteristics:**
- Cámara oscura full-bleed; el canvas es la materia del hero, no un adorno.
- Una línea umbral horizontal corta el título y organiza la página.
- Serif editorial para la voz; mono solo para medida, fecha y hash.
- Sin tarjetas, sin esquinas redondeadas, sin sombras; profundidad por luz y transparencia.
- Movimiento físico y contenido: trazas que se condensan; nada rebota ni brilla por reflejo.
- Espiral se toca en tres contextos —Performance, Sequencer y Sound— sobre un transporte persistente y un panel generativo con semilla, escenas, freeze y evolución.

## Colors

Paleta de cámara: un negro con una pizca de azul, marfil frío para la voz y dos señales —cian de traza y ámbar de evento— que aparecen solo cuando algo ocurre.

### Primary
- **Trace Cyan** (#9fc6c9): la señal viva. Subrayados de navegación, hover de filas, glifo activo, acentos de medición. Nunca cubre superficies grandes.
- **Chamber Black** (#060708): el campo de la cámara. Fondo de la portada y de las bandas de contenido.

### Secondary
- **Event Amber** (#c7a466): el evento ocasional. Una traza de partícula, un destello de calor, el estado activo de un dato. Su rareza es el punto.

### Neutral
- **Ink** (#e9e6dc): títulos, cuerpo principal y enlaces en reposo.
- **Ink Dim** (#9aa3a1): texto secundario, descripciones y sublínea del hero.
- **Ink Muted** (#7f8a88): labels, hashes y metadatos; cumple contraste AA sobre el fondo.
- **Nav Ink** (#c3c8c4): enlaces de navegación sobre el hero.
- **Rule** (rgba(233, 230, 220, 0.12)): separadores de sección.
- **Rule Faint** (rgba(233, 230, 220, 0.07)): separadores de fila.
- **Viewer Black** (#0a0c0d): fondo de la mesa de luz y de las miniaturas; un negro apenas más claro que la cámara.

### Syntax (detalle de Código)
- **Syntax Number** (#a9bfa0): literales numéricos en el editor y los bloques de código.
- **Syntax Function** (#d8d2c0): nombres de función y métodos.
- **Syntax Type** (#b7c9a9): tipos, clases y constructores.
- **Syntax Variable** (#c6d2d0): identificadores y variables.
- El error se compone en cinabrio (#c0816e); el comentario, en Ink Muted itálica.

### Named Rules
**The One Trace Rule.** El cian es una señal, no un tema: aparece en el estado activo, el hover o la medida. Si una pantalla tiene cian en tres lugares no relacionados, sobra uno.

**The Warm Event Rule.** El ámbar se reserva para lo que ocurre —un evento, una partícula, una marca de tiempo—. No se usa como color de marca ni como fondo.

## Typography

**Display Font:** Newsreader (con Georgia, serif)
**Body Font:** Newsreader (con Georgia, serif)
**UI Sans:** Lato (con system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (con Fira Code, monospace)

**Character:** Una serif editorial de periódico moderno, con optical sizing, que a gran escala se vuelve casi una inscripción; una mono técnica que solo habla cuando tiene algo que medir. El contraste no es decorativo: separa la voz del instrumento.

### Hierarchy
- **Display** (250, clamp(3.2rem, 9vw, 6rem), 0.82): el título CENIZAS de la portada, cortado por la línea umbral.
- **Quote** (300 italic, clamp(1.55rem, 3.6vw, 2.8rem), 1.18): la cita del archivo; máxima 24ch.
- **Headline** (300, clamp(1.8rem, 3vw, 2.5rem), 1.1): Laboratorio y Umbrales.
- **Title** (400, clamp(1.05rem, 1.8vw, 1.35rem), 1.35): títulos de las muestras del laboratorio y nombres de sección.
- **Body** (400, clamp(0.95rem, 1.6vw, 1.05rem), 1.7): lectura editorial a 75ch dentro del contenedor de 1000px.
- **Sans** (400, 0.8–0.92rem, 1.45–1.55): descripciones de laboratorio y salidas; nunca para títulos ni cuerpo largo.
- **Label** (400, 0.7rem, 0.16em, mayúsculas): estados, hashes, fechas, botones y metadatos. Nunca por debajo de 11px.

### Named Rules
**The Instrument Label Rule.** La mono no es un traje técnico: solo aparece para fechas, hashes, códigos, estados y medidas. Un texto que no se mide se compone en serif.

## Layout

El hero ocupa `100svh` y se organiza en tres filas: barra superior, escena central y pie de navegación. La escena centra el título; la línea umbral nace en el centro del título y se extiende a `100vw`. Debajo, el contenido respira en una columna máxima de 1100px con padding lateral fluido.

La cita usa una retícula de tres columnas —label, texto, año— que colapsa a una columna por debajo de 900px. El laboratorio es una lista de filas, no una cuadrícula de tarjetas: dos columnas (metadato / título) en escritorio y una columna apilada en móvil. Umbrales se reparte en dos columnas con reglas capilares y pasa a una sola columna en pantallas estrechas. La navegación del hero es una fila flexible; en móvil se convierte en una retícula de 3×2 para no dejar un enlace huérfano.

Código usa una columna de 1100px. El índice es un rack de cuatro columnas —dirección, nodo del bus, cuerpo, lenguaje/estado— que colapsa a un rail de 1.5rem con dirección, título, concepto y meta apilados. El detalle comparte la misma columna y el mismo padding que el índice; el banco de pruebas ocupa el ancho completo.

Imaginario usa una columna de 1200px. El índice es una hoja de contactos de tres columnas (dos en tablet, una en móvil), con gutters de 1px y placas de 4:3. El detalle es una mesa de luz: media a ancho completo, caption y nota en una columna de 62ch.

El ritmo vertical es generoso: 3–5rem entre bandas, 5–8rem en los cierres de sección. Siempre hay más aire arriba de un encabezado que debajo.

## Elevation & Depth

El sistema es plano por defecto y no usa sombras. La profundidad la produce la cámara: el canvas generativo detrás del contenido, el velo radial que ilumina la línea umbral, las reglas de 1px y la transparencia del fondo. Cualquier sombra difusa añadida a una tarjeta o botón rompe la física del instrumento.

**The No-Card Rule.** No hay tarjetas, ni contenedores elevados, ni halos de color. Una fila se agrupa con una regla de 1px y espacio, no con una caja.

## Shapes

Todo es recto: radios de 0px, reglas de 1px, bordes completos cuando existen. Las únicas formas circulares permitidas son los puntos de estado (5–6px) y los nodos del rack de Código (7px). Las formas orgánicas pertenecen al canvas, no al CSS.

## Components

### Navigation
- **Style:** enlaces en Newsreader de 0.85–0.98rem, color `nav-ink`, padding vertical de 0.3rem.
- **States:** un subrayado cian de 1px crece desde la izquierda con `scaleX` en hover/focus. No hay fondo, borde ni píldora.
- **Mobile:** retícula 3×2 centrada; sin toggle, sin panel.

### Section rail
- **Estructura:** una sola lista de las 9 secciones. En escritorio (`>=1280px`) es un rail fijo a la derecha, sobre una columna de 1px implícita; por debajo, se convierte en un índice al pie del contenido.
- **Sigilo:** cada enlace usa el mismo `.sigil` y el mismo glifo de `_data/navigation.yml` que el título.
- **Estados:** el nombre aparece a la izquierda en hover/focus; la sección activa pasa a Trace Cyan y recibe `aria-current`.
- **Accesibilidad:** los glifos son `aria-hidden`; el enlace tiene `aria-label` con el nombre de la sección. No se duplica la lista en el DOM.
- **Móvil:** retícula de 2 columnas, 44px de alto por enlace; nunca es una navbar con caja.

**The One Rail Rule.** El rail no compite con la página: es una puerta lateral, no un menú. Si la sección actual no se puede reconocer, el rail falló.

### Umbral continuo
- **Qué:** la home y la cabecera de cada sección comparten `view-transition-name: umbral-title`.
- **Cómo:** `@view-transition { navigation: auto; }`; el título y su línea se transforman de `CENIZAS` al título de la sección en 0.55s.
- **Fallback:** sin View Transitions, la navegación es instantánea y normal.
- **Reduced motion:** las animaciones de `::view-transition-*` se anulan.
- **Alcance:** solo el paso home → sección. No se usa para volver atrás ni para cada link interno.

**The Crossing Rule.** El umbral no es una portada que se abandona: es la misma línea que se convierte en la cabecera de la sección.

### Buttons
- **Shape:** rectángulo de 0px de radio, borde de 1px rgba(233, 230, 220, 0.22).
- **Secondary:** fondo transparente, texto mono de 0.7rem en mayúsculas, padding 0.68rem 1rem; hover cambia el borde a cian y el texto a marfil.
- **Focus:** outline cian de 1px con offset de 4px.

### Lab rows
- **Structure:** dos columnas (metadato / título) separadas por reglas capilares; sin borde lateral de color.
- **Meta:** tipo de muestra con punto de 5px y hash FNV-1a en mono de 0.7rem. Colores semánticos: cian para CÓDIGO, ámbar para DIARIO, cinabrio para POEMA, cobalto para REPORTE.
- **Hover:** una línea cian de 1px recorre la base de la fila y el título se subraya con una regla que crece.

### Laboratorio — condensación de muestra
- **Al sortear:** las filas colapsan (`max-height`, opacidad, padding y borde) y la nueva selección se expande en el mismo lugar.
- **Tiempo:** 180ms de colapso + 220ms de expansión; el foco permanece en `Nueva muestra`.
- **Estado:** el feed lleva `aria-busy` durante el cambio; el anuncio va a `#lab-status`, no a la lista.
- **Reduced motion:** el cambio es instantáneo, sin clases de animación.
- **No:** no se barajan alturas ni se mueve el scroll.

**The Sample Condenses Rule.** La muestra no se reemplaza: se condensa y vuelve a aparecer. El hash y la traza son la materia del cambio.

### Espiral — instrumento generativo
- **Dónde vive:** el instrumento es **Espiral** ([`quicio/espiral`](https://github.com/quicio/espiral)); su motor de audio es [`quicio/umbral-tone`](https://github.com/quicio/umbral-tone). El sitio lo presenta desde `/dispositivos/espiral/`.
- **Estructura:** un transporte persistente —play, tempo, swing, humanize, master y estado— sobre tres contextos que comparten motor y panel generativo: **Performance**, **Sequencer** y **Sound**. Cambiar de contexto nunca detiene el audio. En escritorio, transporte y pestañas quedan fijos arriba.
- **Performance:** anillo de pulso colectivo de 16 puntos (unión de los patrones, paso actual en Ink), lectura de paso y estado, y una fila por canal con nombre serif, tipo (patrón/generativo), 16 celdas de actividad, mute y freeze. Es la superficie de interpretación.
- **Sequencer:** editor radial de 16 pasos para el canal seleccionado, con números y estado de paso; herramientas de Euclid (pulsos), densidad, giro, copiar/pegar y deshacer; una matriz de cuatro filas para comparar patrones sin perder el contexto; y una **lane de automatización** de 16 pasos con objetivo seleccionable (reverb/delay) que se dibuja con el puntero o se ajusta con teclado.
- **Sound:** rack de siete canales con fader horizontal, valor dB, mute/solo/freeze y delay/reverb por canal; los presets de mezcla cargan niveles y efectos. El master vive en el transporte, no se duplica.
- **Panel generativo:** escenas concebidas como estados (`Umbral`, `Deriva`, `Pulso`, `Caos contenido`), semilla visible, cinco parámetros musicales (densidad, complejidad, variación, estabilidad, azar), **tonalidad** (raíz, escala, progresión), **duración de notas**, canal seleccionado, mutación/freeze, evolución cada dos compases y nueva semilla.
- **Armonía:** la raíz y la escala guían pad, lead, bajo y drone. Las progresiones construyen acordes diatónicos; el bajo se reafina por sample y el lead se ancla a las notas del acorde. La duración estira acordes y notas sin cambiar el patrón rítmico.
- **Automatización:** una curva de 16 pasos por objetivo (Reverb Pad, Delay Lead, Reverb Hi-Hat, Delay Drone). `Auto` la aplica en cada paso mediante rampas cortas; al apagarla, el parámetro queda en su último valor.
- **Sesión:** guardar/cargar en `localStorage` y exportar/importar JSON con semilla, escena, parámetros, patrones, mezcla, swing y humanize. La semilla y los contadores hacen reproducible la generación.
- **Teclado:** `espacio` reproduce/detiene, `1`/`2`/`3` cambian de contexto, `R` muta, `F` congela, `M` silencia y `Z` deshace. Los atajos no roban foco a campos editables.
- **Estados:** preparando audio, reproduciendo, detenido, mute, solo, freeze, evolución, undo disabled, error de audio/preset y feedback de cada operación en un `role="status"`.
- **Móvil:** transporte en dos columnas con play a ancho completo; canales apilados; anillo y editor radial reducidos sin scroll horizontal; el panel generativo pasa debajo de la escena.

**The Instrument Surface Rule.** Espiral no es una página con controles: es una superficie de interpretación. El transporte y el panel generativo permanecen; solo cambia la escena que se está tocando.

**The Pulse Is the Score Rule.** El anillo de Performance no decora: muestra la unión rítmica de los canales y el paso que suena. Si el movimiento no ayuda a leer el pulso, sobra.

**The Harmony Lock Rule.** La raíz y la escala se eligen una vez y gobiernan todas las voces generativas. Una progresión puede cambiar de centro, pero no debe romper la afinación del pad, el bajo, el lead y el drone.

**The Drawn Automation Rule.** La automatización se dibuja en 16 pasos y se lee como una curva, no como una tabla de valores. Cada paso tiene un valor y un estado actual; el parámetro elegido recibe una rampa corta al entrar cada paso.

### Imaginario — contact sheet
- **Structure:** grid de tres columnas en escritorio (2 en tablet, 1 en móvil), gutters de 1px sobre Rule Faint, imágenes 4:3 con `object-fit: cover` y `object-position` desde `image_position`.
- **Plate:** índice de dos cifras, título serif, etiqueta de formato mono y caption en itálica si no repite el título. Sin radio, sin sombra, sin tarjeta: la placa es la imagen y su pie.
- **States:** hover/focus: la imagen escala 1.025 y el título pasa a Trace Cyan; focus con outline de 1px. `media_type` produce `foto / video / gif / escaneo / generativo`; las placas antiguas caen a `foto`.

**The Contact Sheet Rule.** El índice de Imaginario es una hoja de contactos, no un masonry: todas las placas comparten ratio y fila para que el ojo pueda comparar formatos. El cierre de carrete ocupa las celdas finales con el conteo de placas; no hay celdas vacías.

**The End-of-Roll Rule.** La última fila no se rellena con una placa falsa: se cierra con un bloque tipográfico que dice cuántas placas hay. El vacío se vuelve índice.

**The Media-Agnostic Plate Rule.** Una placa siempre tiene `image` como póster/miniatura; el detalle decide si muestra imagen, video, gif, escaneo o embed generativo según `media_type`. Nunca se asume que toda placa es una foto.

### Imaginario — lupa de mesa de luz
- **Solo puntero fino:** al mover el cursor sobre la imagen, un recorte cuadrado de 180px muestra la zona al 2×.
- **Construcción:** un clon de la imagen con `object-fit`/`object-position` equivalentes; el original no se transforma.
- **Borde:** 1px Trace Cyan, sin radio ni sombra; etiqueta `2×` en mono.
- **Pista:** `Mover para inspeccionar` debajo del caption, visible solo en `(hover:hover) and (pointer:fine)`.
- **Táctil:** no se muestra; la imagen sigue siendo la experiencia principal.
- **Reduced motion:** la lupa es estática; no hay animación.

**The Light Table Loupe Rule.** La lupa no reemplaza la placa: es una lente temporal sobre la mesa de luz. Si tapa la imagen o secuestra el scroll, está mal.

### Exit index
- **Structure:** dos columnas; cada enlace tiene un glifo-sigilo tipográfico, nombre en serif y descripción en sans de 0.8rem.
- **State:** el glifo pasa a cian y el nombre se desplaza 3px a la derecha. El glifo es marginalia tipográfica del archivo, nunca un icono de interfaz.

### Code rack
- **Structure:** lista ordenada de 17 módulos; una línea de bus vertical de 1px, un nodo por módulo, dirección binaria de 8 bits, título y concepto en serif, lenguaje y estado en mono.
- **State:** el nodo y la dirección pasan a cian al hover/focus; una traza de 1px recorre la regla superior; el título se desplaza 3px. `ejecutable` usa punto cian; `lectura`, punto hueco.
- **Mobile:** el bus se mantiene a la izquierda; la dirección sube sobre el título y el meta baja al pie de la fila.
- **Filter:** la leyenda `todos / ejecutable / lectura` es un grupo de botones con `aria-pressed`; filtra los módulos y anuncia el total visible en un `role="status"`. En móvil conserva 44px de alto.

**The Single Bus Rule.** En Código, todo el índice se organiza sobre un único bus vertical de 1px; el nodo es el único punto y la traza cian es la única señal. El filtro no agrega otra retícula: solo esconde filas del mismo bus.

### Imaginario — light table (detalle)
- **Structure:** breadcrumb `← Imaginario`, título serif, meta mono (`media_type · captured · place · medium`), visor de medios y nota en 62ch.
- **Viewer:** figura con borde de 1px y fondo Viewer Black; imagen, video con controles y póster, iframe o embed según `media_type`; caption debajo.
- **Detail fields:** `media_type`, `media_src`, `poster`, `media_embed`, `captured`, `place`, `medium`, `dimensions`, `credits`. Las placas existentes solo usan `image` y caen a `foto`.
- **Pager:** enlaces anterior/siguiente en orden de colección, contador `n / total`, y navegación con `ArrowLeft` / `ArrowRight` fuera de controles de formulario.
- **Fallback:** si un video/generativo no tiene fuente, se muestra el póster; si no hay póster ni fuente, la imagen.

### Diario, Vestigios y Música
- **Fechas:** todas las fechas de metadatos usan `YYYY-MM-DD` en mono. El año suelto queda solo para la cita de la home.
- **Diario:** fecha en columna mono, título serif y extracto en itálica. El título es la única puerta; no hay `Ver más`, borde ámbar ni tarjeta.
- **Vestigios:** el título es `h2` (sin saltar de `h1` a `h3`), fecha mono, cuerpo dim y una sola puerta. La imagen no lleva radio.
- **Música:** títulos de sección, géneros y descripciones suben a contraste AA; las descripciones se limitan a 65ch y no bajan de 14px.
- **Fondo:** las interiores comparten Chamber Black; ya no conviven `#0e0e0e` y `#060708`.

**The One Date Rule.** Una fecha de archivo se escribe `YYYY-MM-DD` en mono. Si solo hay año, es una etiqueta de época, no una fecha.

### Rastros — sismógrafo
- **Qué:** una línea fija de 1px al margen izquierdo, solo en Rastros y solo en escritorio (`>=1280px`).
- **Marcas:** cada fragmento que entra en viewport agrega una muesca de 4–15px en una posición determinista; las marcas se dispersan, no forman una barra de progreso.
- **Reduced motion:** todas las marcas aparecen estáticas, sin transición.
- **Móvil:** el sismógrafo se oculta; la lectura queda limpia.
- **Accesibilidad:** todo el dispositivo es `aria-hidden`; no comunica estado ni sustituye la lectura.

**The Seismograph Rule.** La traza no mide cuánto falta: registra que algo pasó. Si se puede leer como progress bar, está mal.

### Reading surfaces — Rastros, Poemas, Melange
- **Shared frame:** columna exterior de 1100px y contenedor interior de 1000px centrado. Título, metadatos, pager y relacionados usan el contenedor; la prosa usa `--prose-measure: 75ch`, alineada al borde izquierdo del contenedor.
- **Materials:** Newsreader para la voz, JetBrains Mono solo para fecha, serie, posición y ruta. Reglas de 1px, sin tarjetas, radios ni sombras.
- **Rastros:** cuaderno continuo sin enlaces en las entradas; año en mono, marca `※`, líneas separadas por puntos cian y un cierre en itálica. No hay paginación ni hover de tarjeta.
- **Poemas — índice:** meses en mono mayúscula; cada fila es día, título serif y serie en itálica, separados por una regla capilar. Sin miniaturas.
- **Poemas — detalle:** breadcrumb `← Poemas`, título con marca `~`, meta mono (`serie · parte · fecha`), imagen como frontispicio junto al título en escritorio (máx. 16rem de ancho y 300px de alto) y placa centrada en móvil (máx. 30vh); sin recorte, poema en la medida de prosa, un efecto opcional de lectura (`descender-drip`, `ink-echo`, `fog-focus` o `word-drift`), pager `n / total` y poemas relacionados de la misma serie.
- **Melange — índice:** ficha de cuaderno de campo con fecha mono, título serif, lead de 44 palabras y estado `en curso` para los reportes `wip`. El título es la única puerta; no hay CTA repetido.
- **Melange — reporte:** breadcrumb `← Melange`, título y subtítulo, meta mono (`reporte · año · serie` cuando existe), portada y cuerpo largo en el contenedor de 1000px. La ficha técnica es una lista de definición plana, sin caja.
- **Estados:** vacío en itálica, foco cian de 1px con offset de 3px, navegación por teclado y adaptación a 320, 390, 768 y 1440 sin overflow.

### Poemas — efectos de lectura
- **Asignación:** una sola clave `effect` en el frontmatter del poema, editable desde el CMS. Los efectos son exclusivos: no se apilan.
- **`descender-drip` — Derretir:** la última palabra de cada estrofa cuelga y gotea; letras estiradas, gotas cian y desenfoque final.
- **`ink-echo` — Eco de tinta:** el poema gana un registro desplazado y cromático (cian/ámbar) que se mueve apenas con el puntero y el scroll. El texto original queda nítido y no se duplica en el DOM.
- **`fog-focus` — Niebla:** las palabras se desenfocan y atenúan al alejarse del centro del viewport; el centro de lectura queda enfocado. Funciona por palabra para poemas de una sola estrofa.
- **`word-drift` — Deriva:** las palabras respiran con una deriva vertical y una inclinación mínimas, desfasadas por índice. Solo se anima mientras el poema está visible.
- **Límites:** todos respetan `prefers-reduced-motion`; no cambian el layout, no tapan la lectura y no agregan controles.

**The Poem Leads Rule.** En un poema, la imagen es una placa de apertura, no un hero: se limita en ancho y alto y el poema conserva el ancho completo de lectura. Si la foto empuja el primer verso fuera de la primera pantalla, la jerarquía está invertida.

**The Reading Anomaly Rule.** Un efecto de poema ocurre una vez y pertenece al texto. Si obliga a perseguir la lectura o compite con el poema, sobra.

### Cae — descender drip
- **Alcance:** solo el poema `Cae`, mediante `effect: descender-drip`. No es un comportamiento global.
- **Regla:** la última palabra de cada estrofa se derrite: cada letra cuelga, se estira y gotea sobre la línea siguiente. No es una letra suelta ni una lluvia.
- **Capa:** clones `aria-hidden` dentro de `.melt-layer`, `pointer-events: none`; el texto original no se muta y sigue siendo la fuente accesible.
- **Letras:** cada letra se anima por separado con distinto desplazamiento, escala vertical, inclinación y desenfoque; el conjunto se lee como tinta que se derrite, no como una palabra duplicada.
- **Gotas:** 1–3 líneas verticales de 1px con gradiente cian caen desde las letras con descendente; desaparecen al terminar.
- **Disparo:** la palabra se activa cuando su marcador entra en viewport, no cuando la estrofa completa es visible; así el efecto se percibe al llegar a la línea.
- **Movimiento:** 3–3.4s, sin layout shift, una palabra por estrofa; `prefers-reduced-motion` no crea capa ni clones.
- **No:** lluvia aleatoria, letras que tapan palabras, selección de texto o efectos que se ejecuten fuera del viewport.
- **Pager móvil:** por debajo de 700px, anterior/siguiente se apilan a ancho completo y el título deja de truncarse con elipsis.

**The Semantic Anomaly Rule.** La extrañeza solo ocurre cuando el contenido la pide. En `Cae`, la letra que cae es una lectura del poema; en cualquier otra página sería un efecto.

**The Reading Frame Rule.** Las tres secciones comparten columna y ritmo, pero no estructura: Rastros fluye, Poemas entra en un poema, Melange entra en un reporte. Una plantilla de artículo única borraría esa diferencia.

**The Clickless Rastro Rule.** Un rastro no es una tarjeta ni un enlace: es una línea de pensamiento dentro de una secuencia. El año es la única señal de navegación.

### Interior grid — todas las páginas internas
- **Shell:** 1100px de ancho máximo, centrado, con gutters de `clamp(1.25rem, 4vw, 2rem)`.
- **Contenedor:** 1000px, centrado. Es la única medida de página de las interiores.
- **Contenido:** títulos, índices, medios, portadas, pagers, fichas, rack de Código, banco de pruebas, hoja de contactos y Espiral usan el contenedor de 1000px.
- **Prosa:** los párrafos largos usan `--prose-measure: 75ch` y se alinean al borde izquierdo del contenedor; nunca ocupan los 1000px completos.
- **Títulos de sección:** los nueve índices usan el mismo `clamp(2.6rem, 5.5vw, 4.2rem)`, peso 250 y `line-height: 0.95`; `body.section-index` cubre Diario, Vestigios, Dispositivos y Música.
- **Regla:** ningún índice o detalle define su propio ancho de página. Diario, Vestigios, Dispositivos, Música, Poemas, Melange, Rastros, Código e Imaginario usan la misma retícula.

**The One Container Rule.** Toda página interior usa un contenedor de 1000px centrado. Dentro de él, la prosa se mide a 75ch; el contenedor es uno, la medida de lectura es otra.

### Section sigils
- **Regla:** cada sección tiene un solo sigilo, siempre como prefijo del nombre. No hay sufijos, paréntesis ni símbolos dentro del título.
- **Tamaño:** la tinta se normaliza a `0.68em` del título, con ajustes ópticos para glifos de poca masa.
- **Caja:** slot de `1em` (`1.15em` para `∿`), centrado, `vertical-align: -0.06em`, separación de `0.14em`.
- **Color:** `currentColor` al 90%; en la home hereda `Ink Muted` y pasa a Trace Cyan en hover/focus.
- **Accesibilidad:** `aria-hidden="true"`; el nombre accesible es solo el texto de la sección.
- **Fuente:** `_data/navigation.yml` guarda `glyph` y `sigil`; títulos, home y 404 consumen el mismo dato.
- **Emoji:** `font-variant-emoji: text` y `🜏︎` con selector de texto para que Melange no se renderice como emoji de color.

| Sección | Sigilo | Escala óptica |
|---|---|---:|
| Poemas | `⁂` | 1.10 |
| Imaginario | `◉` | 0.773 |
| Rastros | `⟡` | 1.182 |
| Melange | `🜏` | 1.027 |
| Código | `◊` | 1.212 |
| Dispositivos | `⎔` | 1.13 |
| Diario | `✶` | 0.950 |
| Vestigios | `⏚` | 1.20 |
| Música | `∿` | 1.2 |

**The One Sigil Rule.** Un sigilo por sección, siempre a la izquierda del nombre y normalizado por altura óptica. Melange conserva `🜏`; el resto no inventa una segunda marca.

### Test bench (detalle de Código)
- **Structure:** breadcrumb de regreso, título serif, concepto en itálica, meta mono (`lenguaje · fecha · estado`) y banco inmediatamente después.
- **Bench:** borde de 1px, radio 0, barra con lenguaje, estado, pasos y acciones `ejecutar` / `reiniciar` / `enfoque`, etiquetas `código` / `entrada` / `salida`, editor y output mono. El terminal inline tiene una altura estándar (`--term-height`: 58vh en escritorio, 56vh en móvil) y muestra **un solo panel a la vez**. Al pulsar `ejecutar`, el banco pasa automáticamente a fullscreen (`100vw × 100svh`) con la barra y el paso activo; `salir` o `Esc` vuelven al inline. Sin puntos de ventana macOS ni cromo redondeado.
- **Bar:** tres zonas alineadas —metadatos a la izquierda (lenguaje + punto de estado), pasos al centro, acciones a la derecha—. El paso activo sube a peso 500 y se subraya en cian; el estado lleva un punto del color de su estado; la acción primaria se distingue con borde y peso. En móvil, metadatos y pasos comparten la primera fila y las acciones bajan a la segunda.
- **States:** `listo`, `entrada`, `ejecutando`, `ok`, `error` en la barra. La pieza se revela por pasos: al cargar solo se ve el código; al pulsar `ejecutar` el banco entra en fullscreen y aparece la entrada si el snippet la pide; la salida aparece cuando ya hay resultado y ocupa todo el alto. `código` / `salida` permiten alternar sin perder la ejecución; `reiniciar` vuelve al paso código. `enfoque` reabre el fullscreen desde el inline.
- **Output:** panel único que llena el terminal (y el viewport en fullscreen), `white-space: pre` para conservar grillas y columnas y scroll interno. Al terminar, la salida vuelve al inicio para leerla en orden; `inicio` / `fin` en la cabecera permiten saltar. El seguimiento del final es opt-in: pulsar `fin` lo activa; `inicio` lo desactiva. La API estructurada acepta `output({type: 'text' | 'grid' | 'trace' | 'metric' | 'error', ...})`: grid en `<pre>`, trace en SVG, metric en fila, error en cinabrio. Todo texto se inserta con `textContent`.
- **Fullscreen:** el banco ocupa todo el viewport (`100vw × 100svh`), sin borde ni sombra, con la barra visible y el paso activo llenando el resto. El body queda bloqueado; `salir` y `Esc` cierran y devuelven el foco al inline.
- **Syntax:** usa la paleta Syntax de cuatro tintas; el error, cinabrio; el comentario, Ink Muted itálica.

**The Bench Is Not a Window Rule.** El banco de Código no imita una ventana de sistema operativo: sin puntos de macOS, sin esquinas redondeadas, sin barra de shell falsa. Es un instrumento del archivo.

**The Three-Zone Bar Rule.** Metadatos a la izquierda, pasos al centro, acciones a la derecha. Ninguna zona invade la otra; en móvil, metadatos y pasos comparten la primera fila y las acciones bajan a la segunda.

**The Three-Step Rule.** Código → Entrada → Salida. Ningún panel se adelanta a su paso: la entrada no existe hasta que hace falta y la salida no aparece hasta que hay algo que leer.

### Threshold title
- **Structure:** dos copias del mismo texto, recortadas al 50% superior e inferior, con una línea de 1px entre ellas. La mitad inferior es más apagada y se desplaza 1px.
- **Behavior:** la línea respira con una opacidad de 11s; con `prefers-reduced-motion` queda fija. Es la firma de la portada, no un patrón para páginas internas.

### Chamber canvas
- **Structure:** canvas full-bleed detrás del hero, con `aria-label` y `role="img"`.
- **Behavior:** trazas de partículas que nacen en la línea umbral, se curvan, se ramifican y se disipan. El puntero condensa trazas nuevas. Con movimiento reducido se dibuja una exposición fija.

### Footer
- **Style:** mono de 0.7rem en mayúsculas, regla superior, dos extremos: archivo y Vestigios. Contraste AA.

## Do's and Don'ts

### Do:
- **Do** dejar que el canvas y la línea umbral hagan el trabajo visual del hero.
- **Do** usar la serif para la voz y la mono solo para medida, fecha, estado o hash.
- **Do** agrupar con reglas de 1px, espacio y jerarquía tipográfica.
- **Do** mantener el texto funcional en 11px o más, con contraste AA.
- **Do** respetar `prefers-reduced-motion`: la cámara se detiene, la página sigue completa.
- **Do** mantener el rack de Código en un solo bus vertical de 1px; el nodo es el único punto.
- **Do** usar la paleta Syntax de cuatro tintas en el editor y los bloques de código.
- **Do** revelar Código, Entrada y Salida en ese orden, solo cuando cada paso tiene contenido.
- **Do** mantener la hoja de contactos de Imaginario en una retícula uniforme de 1px y 4:3.
- **Do** declarar `media_type` en cada placa nueva; las fotos pueden omitirlo.
- **Do** mantener Rastros, Poemas y Melange sobre `--reading-measure`: título, meta, cuerpo y pager comparten eje.
- **Do** dejar que Rastros fluya sin enlaces; el año y la marca `※` bastan.
- **Do** mantener todas las interiores sobre el shell de 1100px y el contenedor de 1000px centrado.
- **Do** usar el contenedor de 1000px para medios e instrumentos y 75ch para la prosa larga.
- **Do** usar un solo sigilo por sección, como prefijo y normalizado por altura óptica.
- **Do** tomar el glifo de `_data/navigation.yml` para que título, home, 404 y rail coincidan.
- **Do** usar el rail de secciones en interiores: es la puerta lateral del archivo.
- **Do** dejar que `Cae` pierda una descendente por estrofa y la acumule en su línea de sedimento.
- **Do** escribir las fechas de metadatos como `YYYY-MM-DD`.
- **Do** cerrar la hoja de contactos con el bloque de fin de carrete, no con celdas vacías.
- **Do** usar el umbral continuo solo para el cruce home → sección.
- **Do** dejar que el sismógrafo de Rastros registre fragmentos sin convertirse en progreso.
- **Do** condensar la muestra del laboratorio con el foco en `Nueva muestra`.
- **Do** mostrar la lupa de Imaginario solo en puntero fino.
- **Do** tratar Espiral como un instrumento: transporte persistente, escenas que cambian sin cortar el audio y controles con estados explícitos.
- **Do** elegir raíz, escala y progresión antes de generar; la armonía guía pad, lead, bajo y drone.
- **Do** dibujar la automatización con una curva de 16 pasos y dejar que cada paso entregue su valor con una rampa corta.
- **Do** mostrar la semilla y los valores generativos junto al resultado; la reproducibilidad es parte del instrumento.

### Don't:
- **Don't** usar sombras, halos de color, glassmorphism ni degradados como decoración.
- **Don't** envolver filas o secciones en tarjetas, y nunca anidar tarjetas.
- **Don't** convertir el cian o el ámbar en fondos de sección.
- **Don't** añadir kickers, eyebrows ni números de sección decorativos.
- **Don't** usar emoji o glifos como iconos de interfaz; los sigilos del archivo son marginalia tipográfica.
- **Don't** repetir el título partido por la línea umbral fuera de la portada.
- **Don't** usar puntos de ventana, esquinas redondeadas ni un prompt de shell falso en Código.
- **Don't** sustituir la paleta Syntax por VS Code Dark+ u otro tema de editor ajeno.
- **Don't** mostrar una salida vacía o un input antes de que el visitante pulse ejecutar.
- **Don't** volver a Imaginario a un masonry irregular ni a tarjetas con radio.
- **Don't** asumir que `image` es el medio final: es el póster o la miniatura.
- **Don't** convertir Rastros en tarjetas, acordeones o paginación: es un cuaderno continuo.
- **Don't** devolver a Poemas las miniaturas del índice ni a Melange las cajas de la ficha técnica.
- **Don't** dar a Diario, Vestigios, Dispositivos o Música un ancho de página distinto al resto de las interiores.
- **Don't** pegar el contenedor a la izquierda ni llevarlo al ancho completo: siempre 1000px centrados.
- **Don't** dejar que un párrafo largo ocupe los 1000px del contenedor: la prosa va a 75ch.
- **Don't** convertir el sismógrafo de Rastros en una barra de progreso ni en una métrica de lectura.
- **Don't** animar el umbral, la muestra o el sismógrafo si el visitante pidió movimiento reducido.
- **Don't** mostrar la lupa en táctil ni convertirla en un zoom permanente que tape la placa.
- **Don't** devolver Espiral a tarjetas con radio, sombras o botones diminutos.
- **Don't** detener el transporte al cambiar entre Performance, Sequencer y Sound ni duplicar el master en cada contexto.
- **Don't** añadir animación al pulso o al paso actual que no comunique el ritmo real.
- **Don't** automatizar un parámetro que el canal no tenga ni seguir aplicando rampas cuando `Auto` está apagado; el parámetro queda en su último valor.
- **Don't** repetir el símbolo como sufijo ni mezclar `☽ Melange ☾` con el sigilo nuevo: Melange usa solo `🜏`.
- **Don't** renderizar `🜏` como emoji de color.
- **Don't** convertir el goteo de `Cae` en una lluvia global de letras aleatorias.
- **Don't** repetir `Leer reporte →` en Melange ni `Ver más` en Diario: el título ya es la puerta.
- **Don't** usar bordes ámbar, tarjetas o extractos con caja en Diario.
- **Don't** mezclar `#0e0e0e` y `#060708` en las interiores.
