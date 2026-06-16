# Feature Specification: Refactorización de la sección "Fragmentos"

**Feature Branch**: `006-fragmentos-refactor`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Refactoriza la sección Fragmentos para que sea un archivo de pensamiento en curso, no publicaciones individuales. Sin páginas individuales, fuera del feed, flujo continuo, identidad visual propia, y empujar el cambio conceptual (no llamarlos 'posts' en código ni en UI)."

**Context**: El sitio KNDL 000 tiene una colección `_fragmentos` con 33 entradas de líneas cortas (pensamientos, frases sueltas, observaciones). Hoy viven en `fragmentos/index.md` pero siguen apareciendo mezclados con poemas, diario, código y reportes Melange en el lab feed de la home (`_includes/lab-feed.html` + `assets/js/core/lab-home.js`). Además la UI los llama "FRAGMENTO" (en el dataset) y la página índice los numera `...32 ...31 ...30` con un estilo que se siente más como "lista de posts" que como cuaderno de notas. El usuario quiere tratar los fragmentos como archivo vivo: continuo, íntimo, sin clicks, sin paginación, fuera del feed principal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sin páginas individuales (Priority: P1) 🎯 MVP

[Como visitante del sitio, NO quiero poder hacer clic en un fragmento y llegar a una página individual que solo repite la misma frase — los fragmentos solo existen dentro de su archivo colectivo en `/fragmentos`, sin expectativa de profundidad.]

**Why this priority**: Es la promesa conceptual del refactor. Sin esto, todo lo demás falla (un click te lleva a una página vacía y se rompe la sensación de archivo).

**Independent Test**: `find _site/fragmentos -name '*.html'` devuelve solo `index.html`. Cualquier link a `/fragmentos/<slug>/` devuelve 404. `grep -r 'fragmento-' _site/fragmentos/` no devuelve links a páginas individuales.

**Acceptance Scenarios**:

1. **Given** el sitio construido, **When** se lista el directorio `_site/fragmentos/`, **Then** solo existe `index.html` (cero páginas individuales).
2. **Given** el archivo `fragmento-foo.md` en `_fragmentos`, **When** se construye el sitio, **Then** NO se genera una URL accesible (sigue siendo un item de la colección, no una página).
3. **Given** el `_config.yml`, **When** se lee la sección `collections.fragmentos`, **Then** `output: false` está explícito.
4. **Given** un fragmento cualquiera, **When** se renderiza en `/fragmentos`, **Then** la línea NO está envuelta en un `<a>` que apunte a una página propia.
5. **Given** la nav del sitio, **When** se inspeccionan los links, **Then** no hay ningún `<a href="/fragmentos/...">` hacia un fragmento individual.

---

### User Story 2 - Sacar del lab feed de la home (Priority: P1)

[Como visitante, NO quiero ver fragmentos mezclados con poemas, posts de diario, código o reportes Melange en el feed de la home — los fragmentos tienen su propio espacio y no compiten por atención con textos largos.]

**Why this priority**: Refuerza la separación conceptual. El feed de la home es para "especímenes" completos; los fragmentos son otra cosa.

**Independent Test**: Visitar `/` → abrir DevTools → el `<script id="lab-items">` no contiene ningún objeto con `kind: "FRAGMENTO"` (o su reemplazo conceptual). El shuffle tampoco los inyecta vía JS.

**Acceptance Scenarios**:

1. **Given** la home `/`, **When** se renderiza `_includes/lab-feed.html`, **Then** el loop sobre `site.fragmentos` no se ejecuta (eliminado del template).
2. **Given** el JSON `lab-items` en la home, **When** se inspecciona, **Then** no hay objetos con `kind` igual a fragmento, rastro, señal o nota.
3. **Given** `assets/js/core/lab-home.js`, **When** se carga y reproduce, **Then** la lógica de `max_fragment_ratio` (límite 30% de fragmentos en la muestra) se elimina porque ya no hay fragmentos en el dataset.
4. **Given** la home en una red lenta, **When** se hace shuffle varias veces, **Then** solo aparecen DIARIO, POEMA, CÓDIGO, REPORTE (nada de fragmentos).
5. **Given** `_data/home.yml`, **When** se lee, **Then** las claves `posts_pool_limit`, `poems_pool_limit`, `melange_pool_limit`, `max_fragment_ratio` se reducen a las 3 primeras (sin `max_fragment_ratio`).

---

### User Story 3 - Archivo continuo en `/fragmentos` (Priority: P1)

[Como visitante, cuando entro a `/fragmentos` quiero leer un flujo continuo de frases — sin clics, sin paginación agresiva, sin numeración descendente que se sienta como feed — más como hojear un cuaderno o un archivo de pensamiento acumulado.]

**Why this priority**: Es la experiencia core. Define lo que el usuario siente al entrar. Si esto no se logra, el refactor falla estéticamente.

**Independent Test**: Visitar `/fragmentos` en desktop → leer 60 segundos sin hacer scroll con el mouse → ver ≥10 fragmentos, todos legibles, sin paginación, sin links clickeables hacia otros lados. En mobile → swipe natural sin paginación.

**Acceptance Scenarios**:

1. **Given** la página `/fragmentos`, **When** se renderiza, **Then** los fragmentos aparecen en orden cronológico inverso (más reciente primero), uno tras otro, sin `<a>` envolventes.
2. **Given** la página, **When** se renderiza, **Then** no hay numeración descendente tipo `...32 ...31 ...30` (eso prometía profundidad donde no hay).
3. **Given** la página, **When** se renderiza, **Then** hay un separador temporal sutil (ej: año) entre grupos grandes, pero no interfiere con la lectura.
4. **Given** un fragmento con múltiples líneas (`lineas: [a, b, c]`), **When** se renderiza, **Then** las 3 líneas se muestran juntas, visualmente agrupadas (sin `<h2>` ni separador entre ellas, pero con un respiro mínimo entre fragmentos).
5. **Given** un fragmento con una sola línea, **When** se renderiza, **Then** aparece como una línea sola con su respiro.
6. **Given** la página, **When** se hace scroll, **Then** no aparece un botón "ver más" ni paginación de ningún tipo.
7. **Given** la página, **When** se inspecciona el HTML, **Then** no hay `<h2>` ni `<h3>` ni `data-ref` tipo `FRAG/...` (eso era terminología de feed).

---

### User Story 4 - Identidad visual propia, íntima y experimental (Priority: P1)

[Como visitante, al entrar a `/fragmentos` quiero sentir que estoy en otro modo del sitio — más íntimo, más experimental, más cercano a un cuaderno personal — distinto al tono del resto.]

**Why this priority**: Diferenciar la sección del resto del sitio refuerza el cambio conceptual. Si se ve igual, el refactor falla en convencer.

**Independent Test**: Comparar visualmente `/` y `/fragmentos` en la misma sesión → deben sentirse como dos cosas distintas. La sección de fragmentos debe ser legible pero más contemplativa.

**Acceptance Scenarios**:

1. **Given** la página `/fragmentos`, **When** se renderiza, **Then** usa una tipografía distinta (o peso/tamaño distinto) al resto del sitio (más serif, más pequeño, o ambos).
2. **Given** la página, **When** se renderiza, **Then** el interlineado es más generoso (1.5–1.8 vs 1.65 del default).
3. **Given** la página, **When** se renderiza, **Then** el color de texto es más tenue (rgba más bajo que el resto) o tiene un tinte diferente.
4. **Given** la página, **When** se ve en dark mode, **Then** el fondo puede ser ligeramente distinto (no negro puro, sino un charcoal más cálido).
5. **Given** un fragmento, **When** se hace hover, **Then** aparece un highlight sutil (background fade-in o borde izquierdo) sin mover el texto.
6. **Given** la página, **When** se carga, **Then** hay un header discreto con el glifo `🜂` (fuego = transformación) o el que se decida, sin un `<h1>` grande que se sienta como título de sección.
7. **Given** la página, **When** se inspecciona el HTML, **Then** tiene una clase única en `<main>` o `<body>` (ej: `<main class="fragmentos-archive">`) que permite estilo scoped.

---

### User Story 5 - Renombrar el concepto: de "fragmento/post" a "señal/rastro" (Priority: P2)

[Como autor y visitante, quiero que los fragmentos no se llamen "FRAGMENTO" o "POST" en el código ni en la UI — quiero usar un término que transmita archivo vivo: señal, rastro, eco, nota, anotación, observación, constelación.]

**Why this priority**: El usuario dijo "el cambio conceptual suele producir mejores decisiones de diseño". Es la guinda del refactor. P2 porque no es estrictamente funcional, pero sí importante.

**Independent Test**: `grep -rni 'fragmento\|FRAGMENTO' assets/ _includes/ _data/ _config.yml admin/config.yml` después del refactor devuelve cero matches (o solo los del nombre del archivo, ej: `fragmento-20241231-...md`). El JSON del lab feed no tiene `kind: "FRAGMENTO"`. La UI no dice "FRAGMENTO" en ningún lado.

**Acceptance Scenarios**:

1. **Given** el codebase, **When** se busca `fragmento` (case-insensitive) en `assets/`, `_includes/`, `_data/`, `_config.yml`, **Then** los hits restantes son solo: nombre de la carpeta `_fragmentos`, nombre de archivos `fragmento-*.md`, y referencias a la URL `/fragmentos/`.
2. **Given** la página `/fragmentos`, **When** se renderiza, **Then** la etiqueta visible (en el header discreto) no dice "Fragmentos" sino el término elegido (ej: "Rastros", "Señales", "Ecos").
3. **Given** el home menú, **When** se ve el link a la sección, **Then** la etiqueta refleja el nuevo término (ej: `☍ Rastros` en vez de `☍ Fragmentos`).
4. **Given** la admin CMS, **When** se ve la colección en `admin/config.yml`, **Then** el `label` es el nuevo término.
5. **Given** el README y ESTRUCTURA, **When** se mencionan los fragmentos, **Then** se actualizan al nuevo término.
6. **Given** la decisión de rename, **When** se elige, **Then** se documenta en `Assumptions` (ej: "Asumimos 'Rastros' como término final").

---

### User Story 6 - Limpiar referencias huérfanas (Priority: P2)

[Como autor, después del refactor quiero que no queden referencias rotas en el codebase — la lógica que asumía que existían páginas individuales de fragmentos debe limpiarse.]

**Why this priority**: Higiene. El back-button ya tiene una rama para `/fragmentos/` que no aplica más. Datos de config (`home.yml`, `max_fragment_ratio`) ya no aplican.

**Independent Test**: `grep -rn 'fragmento\|FRAGMENTO' _includes/ assets/ _data/ _config.yml` devuelve solo lo esencial (URL, nombre de carpeta, glifo).

**Acceptance Scenarios**:

1. **Given** `_includes/back-button.html`, **When** se inspecciona, **Then** la rama `page.url contains "/fragmentos/"` se elimina (no hay páginas individuales).
2. **Given** `_data/fragmentos.yml`, **When** se inspecciona, **Then** el archivo se elimina (data huérfana, ya no se usa).
3. **Given** `_data/home.yml`, **When** se lee, **Then** `max_fragment_ratio` se elimina.
4. **Given** el `<a href="/fragmentos/">☍ Fragmentos</a>` en `404.html`, **When** se refactoriza, **Then** el glifo y label se actualizan al nuevo término.
5. **Given** `_includes/lab-feed.html`, **When** se lee, **Then** la sección que itera `site.fragmentos` y la lógica de fragment ratio están eliminadas.
6. **Given** `assets/js/core/lab-home.js`, **When** se busca, **Then** las funciones y comentarios que mencionan fragmentos se eliminan.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El `_config.yml` MUST declarar `fragmentos: output: false` (ya existe, mantenerlo explícito).
- **FR-002**: `_includes/lab-feed.html` MUST eliminar el loop `for f in site.fragmentos` y las dependencias (frag_href, etc.).
- **FR-003**: `assets/js/core/lab-home.js` MUST eliminar la lógica de `max_fragment_ratio` y el muestreo de fragmentos.
- **FR-004**: `_data/home.yml` MUST eliminar `max_fragment_ratio` y mantener los otros límites.
- **FR-005**: `fragmentos/index.md` MUST renderizar todos los fragmentos en orden cronológico inverso, sin `<a>` envolventes, sin numeración descendente.
- **FR-006**: `fragmentos/index.md` MUST usar una clase única en el contenedor (ej: `<main class="fragmentos-archive">`) que permita estilo scoped.
- **FR-007**: El CSS de fragmentos MUST vivir en `assets/css/style.css` bajo una sección dedicada, con tipografía, interlineado y color distintos al default.
- **FR-008**: Los fragmentos con `lineas: [a, b, c]` MUST renderizarse como grupo visualmente cohesivo, sin `<h2>`/`<h3>`.
- **FR-009**: `_includes/back-button.html` MUST eliminar la rama `page.url contains "/fragmentos/"`.
- **FR-010**: `_data/fragmentos.yml` MUST eliminarse (huérfano).
- **FR-011**: El glifo y label de la sección MUST cambiar al término decidido (decidido en clarificación; propuesta: `🜂 Rastros` o `☍ Rastros`).
- **FR-012**: La admin CMS (`admin/config.yml`) MUST reflejar el nuevo `label` para la colección.
- **FR-013**: El código y la UI MUST NO usar la palabra "FRAGMENTO"/"FRAGMENTOS" como etiqueta de tipo, kind o display label.
- **FR-014**: El 404 (`404.html`) MUST actualizarse al nuevo glifo/label si referencia la sección.
- **FR-015**: El home menu (la nube de secciones) SHOULD incluir un link a `/fragmentos/` con el glifo nuevo (actualmente no aparece; el usuario quiere que exista como entrada propia).

### Key Entities *(include if feature involves data)*

- **Fragmento (item)**: archivo markdown en `content/collections/_fragmentos/`, frontmatter `{ lineas: [{linea: string}], date: datetime }`. No genera página.
- **Archivo colectivo (`/fragmentos`)**: la página única que renderiza todos los fragmentos. Único punto de acceso a la sección.
- **Glifo/label de sección**: símbolo Unicode + palabra que identifica la sección en la UI (decisión pendiente).
- **Rango temporal**: cada fragmento tiene `date`; se usa para ordenar y opcionalmente como separador visual entre años.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `find _site/fragmentos -name '*.html'` devuelve exactamente 1 archivo (`index.html`).
- **SC-002**: El JSON `lab-items` en la home no contiene ningún item con `kind` relacionado a fragmento/rastro/señal.
- **SC-003**: Visitar `/fragmentos` muestra ≥30 fragmentos en una sola página sin clicks ni paginación.
- **SC-004**: El CSS de la página tiene una clase scoped única que la diferencia visualmente del resto del sitio (verificable con DevTools: `<main class="...">` distinto al default).
- **SC-005**: `grep -rni 'FRAGMENTO' assets/ _includes/ _data/ _config.yml admin/config.yml` devuelve 0 hits.
- **SC-006**: El sitio construye y despliega sin errores (`bundle exec jekyll build` sin warnings nuevos).
- **SC-007**: Lighthouse score de `/fragmentos` ≥ 90 (es contenido estático, no necesita SEO, sí performance/percepción).
- **SC-008**: El feed de la home (lab-items) ya no tiene ruido por fragmentos — shuffle de 10 corridas no muestra ninguno.

## Assumptions

- **Término final (decidido)**: **"Rastros"**. El usuario aprobó el cambio conceptual en la sesión de clarificación. Justificación: transmite archivo, huella, paso; no pide profundidad. Coherente con el glifo alquímico elegido.
- **Glifo final (decidido)**: **`⟡`** (U+27E1, "white bowtie"). Símbolo alquímico clásico de mercurio — lo volátil, el cambio, la transformación. Encaja con la paleta alquímica del sitio (☍, 🜂, ⚱, 🜏) sin repetir uno ya en uso.
- **Entrada en la nube del home (decidido)**: SÍ se agrega. La sección actualmente no aparece en el home menu; el refactor la incluye como `⟡ Rastros`.
- **Sin constelaciones temáticas en v1**: el usuario mencionó la idea pero requiere agregar un campo `constelaciones: [string]` al schema de cada fragmento, lo cual multiplica el scope. Se deja como feature futura (P3 en otro spec).
- **Sin paginación infinita (JS)**: el refactor es Jekyll puro. Si el archivo crece a cientos de fragmentos, podría necesitarse virtualización, pero con 33 actuales no hace falta.
- **33 fragmentos actuales**: con 33 entries no hay problema de performance. Si llegara a 500+, habría que reconsiderar (out of scope para v1).
- **El `fragmentos.yml` en `_data/` es huérfano**: data legacy que ya no se referencia. Se elimina.
- **El glifo actual `🜂` (fuego) en `fragmentos/index.md` línea 3** se mantiene o reemplaza según decisión de rename.
- **La sección no aparece en el home menu actual** (la nube de secciones). El usuario quiere que exista como entrada propia — esto es parte de la refactorización.
- **El renombrado NO incluye renombrar la carpeta `_fragmentos/` ni el slug de los archivos**: eso es backward incompatible con el CMS y el versionado. Solo cambia el label visible y la UI; el nombre técnico puede quedarse.
- **El glifo en ESTRUCTURA.md, README.md y la nube del home** se actualizan al nuevo término.

## Out of Scope

- Renombrar la carpeta de colección `_fragmentos/` o los slugs de archivos (rompe compat con CMS y git history).
- Constelaciones temáticas (campo nuevo en frontmatter, taxonomy, navegación por tema). Queda para futuro spec.
- Paginación o virtualización (33 fragments no lo requieren).
- Sincronización con red social (Twitter, Mastodon) estilo indieweb.
- Internacionalización del archivo.
- Multi-autor o atribución por línea.
- Búsqueda full-text dentro del archivo (sería feature nueva).
- Exportar el archivo como PDF / EPUB.
- Modo "imprimir cuaderno" o estilo print.
- Animaciones pesadas al cargar (el archivo debe ser contemplativo, no performático).
