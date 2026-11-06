# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Lectoras y lectores de poesía, arte y crítica técnica; pares que llegan desde enlaces compartidos, buscadores o redes. Entran a explorar sin una tarea concreta: quieren reconocer una voz y decidir por dónde entrar al archivo. *(Inferido del contenido, la navegación y el carácter público del repositorio; confirmar si cambia.)*

## Product Purpose

KNDL 000 es un archivo creativo personal y un laboratorio: reúne poemas, imágenes, rastros, reportes, código y dispositivos bajo una misma sensibilidad. Su éxito es que alguien atraviese la portada, encuentre una pieza que le concierna y siga leyendo o explorando.

## Positioning

No es un blog de autor ni un portafolio de servicios: es una membrana entre arte y tecnología. El sitio publica obra, la somete a procedimientos generativos propios (`umbral-tone`, `umbral-vision`) y deja ver el mecanismo, no solo el resultado. El instrumento **Espiral** vive en su propio repositorio y se presenta como dispositivo.

## Operating Context

- Sitio estático Jekyll desplegado en GitHub Pages; sin backend ni sesión de usuario.
- Contenido gestionado con Sveltia CMS y escrito en Markdown con frontmatter.
- Colecciones activas: diario, poemas, visual, rastros, melange, vestigios, código, dispositivos, música.
- La portada, Código e Imaginario son las superficies rediseñadas; el resto del sitio conserva sus plantillas y su lectura.
- Módulos propios de audio y visual generativos: el motor de audio vive en `quicio/umbral-tone`; el instrumento **Espiral** en `quicio/espiral`; el visual generativo en `assets/js/umbral-vision/`.
- Código reúne 17 módulos: 14 son ejecutables en el navegador con `code-runner.js`; 3 son de lectura (C y Python).
- Imaginario es la sección de imágenes: 16 placas fotográficas hoy. Su modelo admite `media_type` (foto, video, gif, escaneo, generativo), `media_src`, `poster` y `media_embed`; las placas sin esos campos caen a `foto`. La ruta es `/imaginario/`; `/visual/` y `/imagenes/` redirigen a la nueva sección.

## Capabilities and Constraints

- La portada debe seguir funcionando sin JavaScript en lo esencial: navegación y enlaces accesibles; el feed y el canvas pueden requerir JS.
- Presupuesto de página estática: sin servicios externos nuevos, sin build de framework ni dependencias pesadas.
- El canvas generativo y el feed de laboratorio se conservan por decisión explícita.
- El collage y la línea de terminal de la portada actual no son obligatorios y pueden sustituirse.
- El sitio es en español; los títulos y nombres de sección pueden mantener su mezcla actual.
- Imaginario debe poder incorporar video, gif, escaneos y piezas generativas sin cambiar la estructura del índice ni del detalle.

## Brand Commitments

- Nombre: KNDL 000 / C.E.N.I.Z.A.S como umbral de la portada.
- Imaginario es el nombre de la sección de imágenes y medios; sustituye a “Visual”.
- Estética fijada por el usuario: minimalista, sobria, oscura y algo psicodélica.
- Debe dar la impresión de que el arte se funde con la tecnología y de que se entra a un estado umbral.
- Tono editorial, contenido, no publicitario; sin lenguaje de marketing.

## Evidence on Hand

- Contenido real en `content/collections/`: poemas, imágenes, textos, código y reportes.
- Identidad tipográfica y cromática existente en `assets/css/style.css` (fondo casi negro, serif editorial, mono técnica).
- Canvas generativo en `assets/js/core/home-canvas.js` y feed en `_includes/lab-feed.html`.
- No hay testimonios, métricas, precios ni casos de estudio que puedan citarse como prueba comercial.

## Product Principles

1. La obra manda: la interfaz se retira y deja que el material respire.
2. Mostrar el mecanismo: el código y el proceso son parte de la estética, no un secreto.
3. Umbral antes que escaparate: la portada es un pasaje, no una landing de conversión.
4. Sobriedad con una sola anomalía: la psicodelia aparece como fenómeno, no como decoración.
5. Nada inventado: solo contenido y capacidades que el archivo posee.

## Accessibility & Inclusion

- El sitio debe seguir siendo navegable por teclado y legible con lectores de pantalla.
- Respetar `prefers-reduced-motion`: el canvas y las transiciones deben poder detenerse.
- Contraste de texto suficiente sobre el fondo oscuro; el efecto visual no puede ser la única portadora de información.
