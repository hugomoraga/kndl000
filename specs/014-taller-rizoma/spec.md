# Feature Specification: Taller de Rizoma

**Feature Branch**: `014-taller-rizoma`
**Created**: 2026-11-14
**Status**: Draft
**Input**: User description: "Estaba pensando en hacer un gestor basado en git para la sección basada en Rizoma. No es lo mismo que el `/admin/` actual: este sería como un backoffice. Que me permita publicar, pero también atachar documentos, unir ideas, iterar con IA. Sería como un banco de trabajo. La idea es que sea minimalista, pero que me permita expandir esta sección."

**Decisiones de la sesión (2026-11-14)**:

- **Local-first**: el taller corre en la máquina del autor sobre el working tree; no se despliega en v1.
- **IA en fase 2**: la iteración con IA se hace desde el navegador contra una API, con la clave en `sessionStorage`. No entra en v1.
- **v1**: índice del banco, edición con diff, adjuntos, vínculos y publicación con validaciones y commit.
- **Proceso**: esta spec y el ADR 0006 se escriben antes del código.

**Context**: KNDL 000 es un sitio Jekyll estático desplegado en GitHub Pages, sin backend. El CMS actual (`/admin/`, Sveltia) administra colecciones públicas mediante un PAT de GitHub, pero no modela el proceso de Rizoma: las notas viven en `docs/rizoma/`, los anexos en `rizoma/<exploración>/anexos/`, los nodos y exploraciones en `content/collections/`, y las reglas en el protocolo y los ADR. El autor quiere un banco de trabajo minimalista —no otro CMS— para leer ese material, editarlo, adjuntar documentos, vincular ideas, promover piezas a lo público e iterar con IA sin perder la traza de git. La decisión de arquitectura está en [`ADR-0006`](../../docs/rizoma/adr/ADR-0006-taller-de-rizoma.md).

**No objetivos (v1)**:

- Reemplazar `/admin/` o editar colecciones que no sean de Rizoma.
- Publicar desde el navegador o desplegar el taller en GitHub Pages.
- Base de datos, autenticación multiusuario o estado fuera de git.
- Un grafo, dashboard, kanban o panel de métricas: el protocolo lo prohíbe.
- Promoción automática de adjuntos a assets públicos.
- Renombrar o mover archivos existentes.
- IA (fase 2).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leer el banco completo (Priority: P1) 🎯 MVP

[Como autor, quiero abrir el taller y ver en un solo lugar las notas, ciclos, exploraciones, nodos, anexos y documentos de Rizoma, para decidir qué trabajar sin saltar entre carpetas y sin abrir el CMS genérico.]

**Why this priority**: Es la superficie mínima del banco. Sin índice no hay taller; además valida que el taller lee el repo real y no un modelo paralelo.

**Independent Test**: Correr `npm run taller`, abrir `http://127.0.0.1:4173` y ver el banco actual: 2 exploraciones, 12 nodos, 5 anexos y las notas de `docs/rizoma/`. Filtrar por estado o buscar un título. No se escribe nada.

**Acceptance Scenarios**:

1. **Given** el repo con contenido, **When** arranco el taller, **Then** la UI lista notas (`docs/rizoma/*.md`, `docs/rizoma/ciclos/*.md`, `docs/rizoma/banco/*.md`), exploraciones, nodos y anexos, cada uno con tipo, estado, fecha y path.
2. **Given** el banco listado, **When** filtro por tipo o estado, o busco por título, **Then** la lista se reduce y los conteos visibles coinciden.
3. **Given** un ítem, **When** lo abro, **Then** veo su path, estado, fecha, vínculos, backlinks y cuerpo en modo lectura; lo público y lo de trabajo están marcados.
4. **Given** un campo obligatorio faltante o un vínculo interno roto, **When** abro el banco, **Then** el margen muestra una advertencia y no se corrige nada automáticamente.
5. **Given** que Jekyll no está instalado, **When** intento un preview o un check, **Then** veo un error claro y el resto del banco sigue usable.

---

### User Story 2 - Editar una nota con diff exacto (Priority: P1)

[Como autor, quiero editar una nota y ver el diff antes de tocar git, para que ningún cambio se haga en silencio y para poder descartarlo sin consecuencias.]

**Why this priority**: El diff es la unidad de trabajo del taller. Sin edición controlada no hay banco ni promoción segura.

**Independent Test**: Abrir una nota, cambiar una frase, ver el diff, guardar. `git diff` muestra solo ese archivo. Descartar la devuelve a HEAD.

**Acceptance Scenarios**:

1. **Given** una nota abierta, **When** edito el cuerpo, **Then** el diff se actualiza y el guardado es explícito (sin autosave).
2. **Given** el frontmatter, **When** cambio un campo, **Then** las claves desconocidas, el orden y los comentarios se conservan; el cuerpo queda byte-idéntico.
3. **Given** una nota abierta, **When** otro proceso la cambió en disco, **Then** el guardado se rechaza con un conflicto y ofrece recargar o ver el diff.
4. **Given** un cambio sin commitear, **When** elijo "Descartar", **Then** el archivo vuelve a HEAD y sale del plan de cambios.
5. **Given** un YAML inválido, **When** guardo, **Then** veo el error con línea y no se escribe nada.
6. **Given** "Nueva nota", **When** la creo con título y pregunta, **Then** se crea solo `docs/rizoma/banco/<fecha>-<slug>.md`; no se crea ningún archivo público.
7. **Given** "Nueva exploración", **When** la ejecuto, **Then** el taller llama a `node scripts/nueva-exploracion.mjs` y muestra su salida y los paths creados.

---

### User Story 3 - Adjuntar documentos de trabajo (Priority: P1)

[Como autor, quiero adjuntar PDFs, imágenes y borradores a una nota sin publicarlos, para que el banco sea un lugar de trabajo y no solo de texto.]

**Why this priority**: "Atachar documentos" es una de las funciones pedidas y la que más diferencia al taller del CMS: el material de trabajo no tiene que entrar al sitio.

**Independent Test**: Arrastrar un PDF a una nota, verlo bajo `docs/rizoma/adjuntos/<slug>/`, abrirlo desde el margen y verificar que no aparece en `_site`.

**Acceptance Scenarios**:

1. **Given** una nota, **When** suelto un archivo, **Then** se guarda en `docs/rizoma/adjuntos/<slug>/` y el frontmatter de la nota recibe `{archivo, titulo, tipo, nota}` en `adjuntos`.
2. **Given** un archivo de más de 25 MB, **When** lo subo, **Then** se rechaza con el límite y no se escribe nada.
3. **Given** un nombre con `../`, espacios, acentos o duplicado, **When** lo subo, **Then** el nombre se sanitiza y el archivo queda dentro de la carpeta de la nota.
4. **Given** un adjunto, **When** lo abro, **Then** el servidor local lo sirve en read-only y nunca se copia a `assets/` ni a `_site`.
5. **Given** un adjunto vinculado, **When** elijo "Desvincular", **Then** solo se quita la entrada del frontmatter; borrar el archivo requiere una segunda confirmación.
6. **Given** una nota con adjuntos, **When** creo un anexo, **Then** el taller ofrece citar el adjunto como fuente, pero no publica el archivo.

---

### User Story 4 - Vincular ideas y ver backlinks (Priority: P1)

[Como autor, quiero unir dos ideas con un motivo y ver el backlink en la otra nota, para que las conexiones se hagan sin construir un grafo ni un índice central.]

**Why this priority**: "Unir ideas" es parte del pedido, pero el protocolo prohíbe el grafo y el calco. El vínculo tiene que ser una frase con motivo, no una arista.

**Independent Test**: Vincular A→B con un motivo; abrir B y ver el backlink. Quitar el vínculo y ver que el backlink desaparece.

**Acceptance Scenarios**:

1. **Given** dos notas, **When** vinculo A→B con un motivo, **Then** el frontmatter de A recibe `{destino, motivo, fecha}` y B muestra el backlink.
2. **Given** un destino interno, **When** vinculo, **Then** el taller verifica que exista; si no, avisa pero no bloquea.
3. **Given** una URL externa, **When** vinculo, **Then** se guarda marcada como externa y no se fetchea.
4. **Given** un vínculo duplicado, **When** intento crearlo, **Then** se rechaza o se fusiona con un mensaje claro.
5. **Given** un backlink, **When** lo abro, **Then** salto a la nota de origen en el bloque `vinculos`.
6. **Given** el repo después de vincular, **When** lo inspecciono, **Then** no existe un `vinculos.yml` ni un grafo persistido: solo frontmatter de notas.

---

### User Story 5 - Publicar con validaciones y commit (Priority: P1)

[Como autor, quiero promover una nota a exploración, nodo o anexo con las reglas del protocolo como chequeos, y commitear solo ese cambio, para que publicar sea deliberado y rastreable.]

**Why this priority**: Es la razón de ser del backoffice. Sin promoción validada, el taller sería un editor de notas y el CMS seguiría siendo el único camino a lo público.

**Independent Test**: Publicar una exploración de prueba; ver los archivos creados; correr build, check-links y láminas; commitear solo esos paths; revertir.

**Acceptance Scenarios**:

1. **Given** una nota con pregunta, **When** elijo "Publicar como exploración", **Then** veo un plan con archivos, diffs y chequeos antes de escribir; el scaffold se crea con `nueva-exploracion.mjs` y el cuerpo de la nota se copia solo con confirmación explícita.
2. **Given** un anexo nuevo, **When** elijo tipo, estado y fuentes, **Then** se crea `rizoma/<exp>/anexos/<slug>.md`, se actualiza `anexos` en la exploración y se agrega un hito cuando la lectura cambia.
3. **Given** un nodo cuya palabra aparece en menos de dos cuerpos, **When** intento publicarlo, **Then** se bloquea por defecto; un override pide motivo y queda registrado en el mensaje de commit.
4. **Given** una exploración sin ningún nodo compartido, **When** intento publicarla, **Then** se bloquea o se advierte según el protocolo; un override pide motivo.
5. **Given** un cambio en `question`, `summary`, `status`, `nodos`, `corpus`, `relacionadas` o el cuerpo de una exploración publicada, **When** commiteo, **Then** el taller exige un hito nuevo o un motivo de "cambio menor".
6. **Given** un plan de cambios, **When** commiteo, **Then** corre `bundle exec jekyll build`, `node scripts/check-links.mjs` y `build-lamina.py --verify --plate 01|02`, muestra la salida y commitea solo los paths seleccionados.
7. **Given** un chequeo fallido, **When** intento commitear, **Then** se bloquea; un override pide motivo y se agrega al mensaje de commit.
8. **Given** un commit, **When** elijo push, **Then** es una acción separada y explícita; no hay force push.
9. **Given** la publicación, **When** Jekyll construye, **Then** la página pública y el historial reflejan el cambio; el taller no escribió historial a mano.

---

### User Story 6 - Iterar con IA sin publicar (Priority: P3 — fase 2, fuera de v1)

[Como autor, quiero pedirle a una IA que continúe, critique o reescriba una nota, y guardar la propuesta como una iteración fechada, para usar la IA sin que decida la voz ni toque lo público.]

**Why this priority**: Es la función que más riesgo tiene para la voz y la traza. Se posterga hasta que el banco y la publicación estén estables.

**Independent Test**: Con una clave válida, correr una iteración; ver el archivo en `docs/rizoma/iteraciones/`; verificar que ningún archivo público cambió; aplicar a la nota y ver el diff.

**Acceptance Scenarios**:

1. **Given** una clave en `sessionStorage`, **When** corro una iteración, **Then** la request sale del navegador y la clave no se escribe a disco, log ni commit.
2. **Given** un error de CORS o una clave inválida, **When** corro la iteración, **Then** veo un error claro y no se escribe ningún archivo.
3. **Given** una iteración exitosa, **When** termina, **Then** se guarda en `docs/rizoma/iteraciones/<slug>/<fecha>-<hash>.md` con origen, hash base, proveedor, modelo, prompt, salida y estado.
4. **Given** una iteración, **When** la aplico, **Then** solo cambia la nota de trabajo; ningún archivo público cambia.
5. **Given** una iteración, **When** la descarto, **Then** el archivo queda como traza con estado "descartada".
6. **Given** una iteración aplicada, **When** commiteo, **Then** el mensaje referencia el archivo de iteración.
7. **Given** "Cerrar sesión", **When** lo ejecuto, **Then** la clave se borra de `sessionStorage`.

---

### User Story 7 - Extender tipos y operaciones (Priority: P3)

[Como autor, quiero agregar un tipo de pieza o una operación nueva desde un registro, para que el taller pueda crecer con Rizoma sin reescribir la aplicación.]

**Why this priority**: La sección va a cambiar; el taller tiene que aceptar piezas nuevas (corte, serie, lo que venga) sin convertirse en un framework.

**Independent Test**: Agregar un tipo `corte` y una operación `mover` al registro; reiniciar; verlos en la UI sin tocar el router ni el núcleo.

**Acceptance Scenarios**:

1. **Given** el registro, **When** agrego un tipo con glob, campos y validaciones, **Then** aparece en la UI después de reiniciar, sin editar el router HTTP ni el núcleo de la UI.
2. **Given** una operación nueva, **When** la registro, **Then** aparece en la paleta de comandos y expone un plan en seco antes de aplicar.
3. **Given** un tipo u operación con configuración inválida, **When** arranco, **Then** el servidor avisa y lo ignora; el resto sigue funcionando.
4. **Given** los tests, **When** corro `npm run test:taller`, **Then** cubren paths, frontmatter, validaciones, vínculos y registro.

---

### Edge Cases

- **Path traversal**: un request con `../../etc/passwd` o un symlink que sale del repo debe rechazarse.
- **Edición concurrente**: dos pestañas abren la misma nota; la segunda guarda con hash viejo y recibe conflicto.
- **Repo sucio**: hay cambios ajenos al plan; el commit no los incluye y la UI los muestra.
- **Detached HEAD, merge o rebase en curso**: se puede leer y editar; commit/push bloqueados con instrucciones.
- **Dependencias ausentes**: sin `node`, `git`, `bundle` o `python3`+PyYAML, la operación afectada falla con un mensaje accionable.
- **Frontmatter difícil**: comentarios, block scalars, anclas, listas anidadas y `date: ""` deben sobrevivir al round-trip.
- **Archivos raros**: BOM, CRLF, UTF-8 inválido o binario en un `.md`; el editor avisa y no corrompe.
- **Adjuntos**: nombres con espacios/acentos, duplicados y archivos grandes; límite de 25 MB.
- **Borrar una nota con backlinks**: se muestran los backlinks y no se editan automáticamente.
- **Renombrar una nota**: fuera de v1; se avisa que los vínculos no se actualizan solos.
- **Slug existente**: publicar no sobrescribe; pide otro slug o muestra el conflicto.
- **Nodo con acentos/mayúsculas**: la búsqueda normaliza y usa límite de palabra.
- **Anexo con exploración inexistente o tipo inválido**: se bloquea con el campo exacto.
- **Lámina desincronizada por cambios ajenos**: el check falla; se puede overridear con motivo.
- **Jekyll no está corriendo**: el link al preview real se deshabilita; el editor sigue.
- **Puerto ocupado**: el servidor falla con un mensaje claro y sugiere `TALLER_PORT`.
- **IA fase 2**: proveedor sin CORS o clave expirada; error claro, sin archivo de iteración.

## Requirements *(mandatory)*

### Functional Requirements

**Runtime y seguridad**

- **FR-001** (v1): El taller MUST arrancar con `npm run taller` en `127.0.0.1:4173` (puerto configurable con `TALLER_PORT`) y servir la UI desde archivos locales. MUST NOT hacer telemetría ni requests externos, salvo `git push` explícito y la API de IA de la fase 2.
- **FR-002** (v1): El servidor MUST resolver cada ruta contra la raíz del repo y rechazar `..`, rutas absolutas, symlinks que escapen y cualquier archivo fuera de las carpetas declaradas.
- **FR-003** (v1): El servidor MUST aceptar solo requests same-origin y loopback; si se accede desde otro host, la UI MUST advertir y el servidor MUST rechazar escrituras.
- **FR-004** (v1): La UI MUST cargar solo assets locales y una CSP `default-src 'self'`; MUST NOT cargar scripts de terceros.
- **FR-005** (v1): El servidor MUST loguear operaciones a stdout y devolver errores legibles con el path o comando que falló; MUST NOT loguear contenido de notas ni claves.

**Datos y cambios**

- **FR-006** (v1): El índice MUST leer notas (`docs/rizoma/*.md`, `docs/rizoma/ciclos/*.md`, `docs/rizoma/banco/*.md`), exploraciones (`content/collections/_exploraciones/*.md`), nodos (`_nodos/*.md`) y anexos (`rizoma/**/anexos/*.md`, sin `index.md`). Los ADR, el protocolo y la taxonomía se listan como documentos read-only.
- **FR-007** (v1): El parseo y la escritura de frontmatter MUST preservar claves desconocidas, orden y comentarios; el cuerpo MUST quedar byte-idéntico salvo edición explícita. Se permite una dependencia mínima (`yaml`) si no hay un parser propio confiable.
- **FR-008** (v1): Cada lectura MUST devolver un hash del contenido; una escritura con hash obsoleto MUST rechazarse con un conflicto y ofrecer recargar o ver el diff.
- **FR-009** (v1): Toda operación MUST construirse como un plan de cambios (paths + contenido + diff + validaciones) y aplicarse solo si el plan es válido; si falla una validación, MUST NOT escribir nada.
- **FR-010** (v1): El diff MUST venir de `git diff` sin color y el descarte de un archivo MUST usar `git restore` sobre ese path. El taller MUST NOT usar `git add -A`, `git reset --hard`, `git checkout -- .` ni force push.
- **FR-011** (v1): El commit MUST incluir solo los paths del plan; los archivos sucios ajenos MUST quedar fuera y visibles en la barra de estado.
- **FR-012** (v1): En detached HEAD, merge/rebase en curso o conflicto, el taller MUST permitir leer y editar pero MUST bloquear commit/push hasta que el repo esté limpio, con un mensaje que explique cómo resolverlo.

**Edición**

- **FR-013** (v1): El editor MUST ofrecer campos para los metadatos frecuentes (título, pregunta, estado, fecha) y una vista YAML cruda para el resto; el guardado MUST ser explícito, sin autosave.
- **FR-014** (v1): "Nueva nota" MUST crear solo `docs/rizoma/banco/<fecha>-<slug>.md` con el frontmatter de banco; MUST NOT crear archivos públicos.
- **FR-015** (v1): "Nueva exploración" MUST ejecutar `node scripts/nueva-exploracion.mjs` y mostrar su salida y los paths creados; MUST NOT duplicar la lógica del scaffold.
- **FR-016** (v1): Un YAML inválido o un campo obligatorio faltante MUST mostrar el error con línea y MUST NOT escribir; los campos desconocidos MUST conservarse.
- **FR-017** (v1): El editor MUST mostrar un preview aproximado del Markdown y un enlace al preview real de Jekyll (`http://localhost:4000/...`) cuando esté corriendo; editar MUST funcionar sin Jekyll.
- **FR-018** (v1): Renombrar o mover notas MUST quedar fuera de v1; si se detecta un path cambiado, el taller MUST avisar y no actualizar vínculos automáticamente.

**Publicación**

- **FR-019** (v1): Los destinos de promoción de v1 MUST ser `exploración`, `nodo`, `anexo` e `hito`. Rastro, corpus y asset público quedan para fase 2.
- **FR-020** (v1): Una exploración MUST validar `question` no vacía, `summary`, al menos una sección, `status` y al menos un nodo compartido con otra exploración. Si falta el nodo compartido, MUST bloquear salvo override con motivo. Al publicar una nota como exploración nueva, el taller MUST crear el scaffold con el script y ofrecer copiar el cuerpo de la nota al archivo público con diff; la copia MUST ser explícita.
- **FR-021** (v1): Un nodo MUST validar que la palabra aparece en al menos dos cuerpos distintos (exploraciones, poemas, fragmentos, códigos, dispositivos, anexos), sin distinguir mayúsculas ni acentos y con límite de palabra. MUST mostrar el conteo y los archivos. Si no llega a dos, MUST bloquear salvo override con motivo.
- **FR-022** (v1): Un anexo MUST validar `tipo` (uno de los cinco), `estado`, `exploracion`, `order`, `permalink` y `fuentes` con al menos una fuente completa (autor, título, URL, consultado, verifica) para corrección, fuente y derivación.
- **FR-023** (v1): Si una publicación cambia `question`, `summary`, `status`, `nodos`, `corpus`, `relacionadas` o el cuerpo de una exploración publicada, el taller MUST exigir un hito nuevo o un motivo de "cambio menor"; el motivo MUST quedar en el mensaje de commit.
- **FR-024** (v1): Al publicar un anexo, el taller MUST crear o actualizar `rizoma/<exp>/anexos/<slug>.md`, el `anexos` de la exploración y el `index.md` de anexos si falta; MUST NOT sobrescribir un archivo existente sin confirmación. El cuerpo de la nota puede usarse como base del anexo, con confirmación.
- **FR-025** (v1): Antes de commitear, el taller MUST correr `bundle exec jekyll build`, `node scripts/check-links.mjs` y `python3 docs/rizoma/build-lamina.py --verify --plate 01` y `--plate 02`; MUST mostrar stdout/stderr y bloquear si falla.
- **FR-026** (v1): Un override de validación o check MUST pedir un motivo, registrarlo en el mensaje de commit y dejarlo visible en el plan; MUST NOT ser silencioso.
- **FR-027** (v1): El commit MUST tener un mensaje editable que incluya la operación y la nota de origen; el push MUST ser una acción separada y explícita.
- **FR-028** (v1): El historial público MUST seguir saliendo de git (`_plugins/rizoma_history.rb`); el taller MUST NOT escribir archivos de historial a mano.

**Adjuntos**

- **FR-029** (v1): Un adjunto MUST guardarse en `docs/rizoma/adjuntos/<slug>/`, con nombre sanitizado y límite de 25 MB; nombres duplicados MUST resolverse con sufijo.
- **FR-030** (v1): El frontmatter de la nota MUST registrar `adjuntos` como lista de `{archivo, titulo, tipo, nota}`; el archivo MUST ser relativo al repo.
- **FR-031** (v1): El servidor MUST servir adjuntos en read-only; MUST NOT copiarlos a `assets/` ni a `_site`, y MUST NOT ejecutarlos.
- **FR-032** (v1): "Desvincular" MUST quitar solo la entrada del frontmatter; borrar el archivo MUST requerir una segunda confirmación y MUST mostrar las notas que lo referencian.

**Vínculos**

- **FR-033** (v1): `vinculos` MUST ser una lista en el frontmatter de la nota con `{destino, motivo, fecha}`; `destino` puede ser un path interno o una URL.
- **FR-034** (v1): Los backlinks MUST calcularse escaneando las notas en cada lectura; MUST NOT existir un archivo central de relaciones ni un grafo persistido.
- **FR-035** (v1): Un vínculo interno MUST verificar que el destino existe (warning si no); un vínculo externo MUST marcarse como externo y no fetchearse; los duplicados MUST rechazarse o fusionarse.
- **FR-036** (v1): Los vínculos del taller MUST vivir solo en notas de banco; publicar una relación (`relacionadas`, `corpus`, anexo) MUST ser una acción de promoción explícita, fuera de v1.

**IA (fase 2, fuera de v1)**

- **FR-037** (fase 2): La iteración MUST llamarse desde el navegador a una API; la clave MUST vivir en `sessionStorage`, MUST NOT escribirse a disco, log ni commit, y MUST poder borrarse con "cerrar sesión".
- **FR-038** (fase 2): Cada iteración MUST guardarse en `docs/rizoma/iteraciones/<slug>/<fecha>-<hash>.md` con `origen`, `hash_base`, `proveedor`, `modelo`, `prompt`, `salida` y `estado`; MUST ser append-only.
- **FR-039** (fase 2): Aplicar una iteración MUST modificar solo la nota de trabajo; MUST NOT tocar archivos públicos ni commitear o pushear automáticamente.
- **FR-040** (fase 2): El adaptador de proveedor MUST soportar al menos un proveedor con CORS y MUST mostrar un error claro si el navegador bloquea la request; la elección de proveedor queda como pregunta abierta.

**Extensibilidad y calidad**

- **FR-041** (v1): Tipos y operaciones MUST declararse en `taller/rizoma.config.mjs` (o JSON equivalente) con un contrato estable (`id`, `label`, `glob`, `fields`, `validaciones`, `plan`, `apply`). Agregar un tipo u operación MUST NOT requerir editar el router HTTP ni el núcleo de la UI.
- **FR-042** (v1): El taller MUST ser HTML/CSS/JS sin framework ni build step; MUST usar módulos ES y built-ins de Node; la única dependencia runtime permitida es un parser YAML.
- **FR-043** (v1): Las funciones puras (paths, frontmatter, validaciones, vínculos, plan de cambios) MUST tener tests con `node --test`; los tests MUST correr con `npm run test:taller`.
- **FR-044** (v1): El taller MUST documentarse en `taller/README.md` con comandos, arquitectura, límites de v1 y contrato de extensión.
- **FR-045** (v1): La UI MUST ser keyboard-first (paleta de comandos, foco visible, etiquetas, Escape), MUST funcionar a 1280×800 o más y MUST NOT depender solo del color para estados.
- **FR-046** (v1): La UI MUST ser listas + editor + margen; MUST NOT incluir grafo, kanban, tarjetas de dashboard ni métricas.
- **FR-047** (v1): `taller/` MUST quedar excluido del build de Jekyll y MUST verificarse que `_site/taller` no exista.

### Key Entities *(include if feature involves data)*

- **Nota**: documento de trabajo en `docs/rizoma/`; `path`, `meta` (title, date, estado, pregunta, autor, `vinculos`, `adjuntos`) y `body`.
- **Objeto público**: exploración, nodo, anexo o hito; `tipo`, `path`, `meta`, `body`, `url` cuando exista.
- **Vínculo**: `{destino, motivo, fecha}`; vive en el frontmatter de la nota de origen. Los backlinks se derivan, no se guardan.
- **Adjunto**: `{archivo, titulo, tipo, nota}`; el archivo vive en `docs/rizoma/adjuntos/<slug>/` y es relativo al repo.
- **Plan de cambios**: `{operacion, paths, diffs, validaciones, chequeos, mensaje}`; se aplica una sola vez y el commit incluye solo esos paths.
- **Iteración IA** (fase 2): `{origen, hash_base, proveedor, modelo, prompt, salida, estado}`; append-only en `docs/rizoma/iteraciones/`.
- **Tipo/Operación**: entrada de registro con `id`, `label`, `glob`/`fields`, validaciones y contrato `plan`/`apply`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde `npm run taller` hasta ver el banco completo pasan menos de 2 segundos en el repo actual (2 exploraciones, 12 nodos, 5 anexos y las notas).
- **SC-002**: Editar una nota produce un diff visible en menos de 300 ms y `git diff --stat` muestra solo ese archivo; el cuerpo no editado queda byte-idéntico.
- **SC-003**: Publicar una exploración nueva crea el archivo público y la nota de ciclo con el script, corre build + check-links + láminas y deja un commit con solo esos paths; el historial público lo refleja después del build.
- **SC-004**: Adjuntar un PDF de 10 MB lo deja en `docs/rizoma/adjuntos/`, lo vincula desde la nota y no aparece en `_site`.
- **SC-005**: Vincular A→B muestra el backlink en B; quitarlo lo elimina; no se crea ningún archivo central de relaciones.
- **SC-006**: Un nodo con menos de dos apariciones se bloquea por defecto; un override con motivo queda registrado en el commit.
- **SC-007**: Un request a `../../etc/passwd`, un symlink que escapa o un Origin externo se rechazan con error claro.
- **SC-008**: Agregar un tipo al registro y reiniciar lo hace aparecer en la UI sin tocar el router ni el núcleo.
- **SC-009**: `npm run test:taller` pasa y cubre paths, frontmatter, validaciones, vínculos y plan de cambios.
- **SC-010**: Un chequeo fallido bloquea el commit y muestra el comando exacto; un override deja el motivo en el mensaje.
- **SC-011**: El ciclo completo nota → adjunto → vínculo → publicación → commit se hace sin salir del taller, salvo para escribir prosa y decidir.
- **SC-012**: v1 no tiene IA, deploy ni base de datos; `git status` y los archivos son el único estado.

## Assumptions

- El autor trabaja en una máquina con Node 20+, git, Ruby/Bundler/Jekyll y Python 3 + PyYAML.
- Hay un solo autor y una sola máquina; no hay concurrencia real entre usuarios.
- El repo está clonado y en una rama normal (no detached HEAD) para commitear.
- `docs/` ya está excluido de Jekyll; en la implementación se agrega `taller` al `exclude`.
- El repo es público: el taller local no agrega privacidad, solo evita escrituras accidentales.
- Los adjuntos son material de trabajo; lo público sigue siendo Markdown en `content/collections/` y `rizoma/`.
- `/admin/` sigue existiendo para las colecciones que no son de Rizoma.
- La fase 2 usará un proveedor con CORS; la elección concreta queda abierta.
- Una dependencia YAML (`yaml`) es aceptable; si no, se vendoriza un parser con tests equivalentes.
- No se agregan frameworks, bundlers ni tests de navegador en v1.

## Dependencies

- `scripts/nueva-exploracion.mjs` para el scaffold de exploraciones.
- `_plugins/rizoma_history.rb` para el historial público (solo lectura).
- `docs/rizoma/build-lamina.py` para el chequeo de láminas.
- `scripts/check-links.mjs` y `bundle exec jekyll build` para los chequeos previos al commit.
- `_config.yml` para excluir `taller/` del build.
- `package.json` para `npm run taller` y `npm run test:taller`.
- `docs/rizoma/PUNTO-DE-ENTRADA.md`, `protocolo-cartografia.md`, `taxonomia-anexos.md` y los ADR 0001–0006 como fuente de reglas.

## Open Questions

1. **Proveedor de IA (fase 2)**: ¿qué API con CORS se usa y con qué modelo? Queda fuera de v1.
2. **Carpeta `banco/`**: las notas nuevas van a `docs/rizoma/banco/`; las existentes quedan donde están. ¿Se migran o se indexan en su lugar?
3. **Adjuntos públicos**: ¿alcanza con que sean material de trabajo, o hace falta un flujo para publicar un PDF como asset en fase 2?
4. **Push**: ¿el taller puede pushear a `main` directo después de los checks, o conviene una rama + PR? v1 asume push explícito a la rama actual.
5. **Dependencia YAML**: ¿se acepta `yaml` como única dependencia o se prefiere un parser propio?
