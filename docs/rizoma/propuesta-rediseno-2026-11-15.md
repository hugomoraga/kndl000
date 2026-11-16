---
title: "Propuesta de rediseño conceptual y arquitectónico de Rizoma"
date: 2026-11-15
estado: propuesta para discusión · no normativo
---

# Rizoma — Rediseño conceptual y arquitectónico

**Documento de trabajo para discutir el modelo antes de implementar. No migra datos ni modifica el sitio.**

---

## 0. Alcance y método

Este documento reconstruye la arquitectura actual de Rizoma, identifica sus problemas conceptuales y editoriales, desarrolla tres modelos alternativos, los evalúa con ejemplos de la exploración 01 y propone una arquitectura conceptual, una arquitectura de información y una estrategia de migración.

Leí, entre otros:

- `docs/rizoma/PUNTO-DE-ENTRADA.md`, `protocolo-cartografia.md`, `taxonomia-anexos.md`.
- Los ADR 0001–0006.
- `docs/rizoma/lectura-01.md`, las notas de banco y ciclo, y la nota de diagram-design.
- Las dos exploraciones, sus anexos, los 12 nodos y las piezas de corpus.
- Los layouts, includes, plugins, el taller, la spec 014 y el pipeline de láminas.

Las cifras que cito son las del working tree actual. Cuando un documento está desactualizado, lo señalo. Las relaciones que propongo y no están explícitas en el contenido existente están marcadas como **[hipótesis]**.

**Regla de lectura:** este documento no busca confirmar la hipótesis inicial de cuatro categorías. La examina y, donde no se sostiene, propone otra arquitectura.

---

## 1. Diagnóstico de la arquitectura actual

### 1.1 Los objetos reales

| Objeto | Dónde vive | Qué es hoy | Qué responde | Qué no responde |
|---|---|---|---|---|
| **Exploración** | `content/collections/_exploraciones/*.md` | Ensayo público + inventario en frontmatter | Qué dice la deriva | Por qué está cada material |
| **Corpus** | `corpus`, `corpus_secciones` | Lista de URLs con una nota y un mapa sección→obra | Qué obras se leen | Qué función cumple cada obra, qué cambia |
| **Nodo** | `_nodos/*.md` + `nodos` en la exploración | Título, definición y lista de exploraciones que lo usan | Dónde aparece la palabra | Diferencia de sentido, tensión, emergencia |
| **Anexo** | `rizoma/<exp>/anexos/*.md` | Pieza larga con un tipo primario | Corrección, objeción, fuente, concepto o derivación | Sobre qué frente/afirmación opera; funciones múltiples |
| **Hito** | `hitos` en el frontmatter | Decisión curada | Cuándo cambió la lectura (declarado) | Qué material o afirmación cambió; vínculo con la prosa |
| **Lámina** | `lamina-*.data.yml` + `annotations.yml` + SVG | Artefacto fechado, esqueleto generado + anotación manual | Corpus, nodos y cortes | Frentes, inscripciones; está hardcodeada a 01/02 |
| **Banco** | `docs/rizoma/` | Notas, ciclos, ADR, lecturas | El proceso | Ninguna relación pública |
| **Git** | repo | Memoria técnica | Versiones | Prosa, decisiones, cortes |
| **Taller** | `taller/` | Plan/diff/commit local-first | Promoción con fricción | Frentes, inscripciones, cortes |

### 1.2 El modelo real es hub-and-spoke

La exploración es el centro canónico. Todo cuelga de ella:

- `corpus` y `corpus_secciones` viven en su frontmatter.
- `nodos` es un array de títulos suyos.
- `relacionadas` es un array de URLs suyas.
- `anexos` es un array de metadatos suyos; los archivos son hijos de `rizoma/<exp>/anexos/`.
- `hitos` vive en su frontmatter.
- La lámina se genera por exploración.
- El historial se genera por exploración.
- El índice público ordena exploraciones.

El diagrama interno más reciente lo confirma: `docs/rizoma/mapa-contenido.html` rotula la exploración como **“NÚCLEO”** y dibuja flechas desde corpus, aparato, nodos, hitos y lámina hacia ella. No es un grafo público, pero es la estructura real.

El protocolo dice “no hay sujeto ni objeto, solo dimensiones” y prohíbe “un índice-raíz que sea «el» origen de la sección” (`protocolo-cartografia.md:19`). La implementación es un índice-raíz con otro nombre.

Esto no invalida el proyecto, pero define el problema: **el sistema representa la exploración como contenedor, no como trayectoria.**

### 1.3 Decisiones conceptuales, editoriales y restricciones

| Capa | Decisiones | Consecuencia |
|---|---|---|
| **Conceptual** | Cartografía, no calco; heterogeneidad; multiplicidad; ruptura asignificante; archivo como participante; exploración como meseta; público/taller; nodo en dos cuerpos; no corregir en silencio | El sistema debe permanecer abierto, reversible, sin totalidad |
| **Editorial** | El autor decide la voz y la publicación; un anexo, un tipo; hito cuando cambia la lectura; lámina manual y fechada; las lecturas no se publican | La publicación es un acto de corte, no un guardado |
| **Implementación** | Jekyll estático; Git como único archivo; taller local-first; path como identidad; `order` como clave de lámina; láminas hardcodeadas; commit con whitelist; taxonomía duplicada; GA4; sin búsqueda pública; scaffold que escribe directo | Varias restricciones técnicas están moldeando el modelo conceptual |

No todo lo que hoy existe expresa una decisión conceptual. El hub, el tesauro de nodos, la falta de cortes y el historial que solo lee frontmatter son deudas de implementación o de diseño, no principios.

### 1.4 Lo que ya funciona y debe preservarse

1. **La separación público/taller.** Es la decisión arquitectónica más fuerte: el mapa público no se contamina con el proceso.
2. **La promoción con diff, validaciones y commit.** “El diff es la interfaz” es una buena respuesta al problema de la burocracia: no hay guardado silencioso.
3. **La heterogeneidad del corpus.** Poema, código, dispositivo, vestigio, imagen, fragmento y ficha conviven sin jerarquía.
4. **El aparato de anexos.** La idea de que una pieza larga hace una operación sobre la investigación es valiosa, aunque su taxonomía mezcle niveles.
5. **La lámina como artefacto fechado.** Es el mejor instrumento existente: no es un dashboard, no refluye, se anota a mano.
6. **La regla del nodo como aspiración.** “Una palabra no es un nodo hasta que aparece en dos cuerpos” es una intuición correcta; el problema es su implementación léxica.
7. **Las dos memorias.** Git como memoria técnica e hitos como memoria editorial es una distinción sofisticada que hay que conservar y completar.

### 1.5 Contradicciones y deudas

| # | Deuda | Evidencia |
|---|---|---|
| 1 | **Hub vs multiplicidad** | La exploración es el centro; el protocolo prohíbe el índice-raíz (`protocolo:19`) |
| 2 | **Relaciones declaradas vs hechas** | `corpus`, `nodos`, `relacionadas`, `anexos` son arrays de frontmatter; el protocolo dice “la conexión se hace, no se declara” (`protocolo:17`) |
| 3 | **Nodos como etiquetas** | `/rizoma/nodos/` filtra con `nodos contains title`; `lectura-01:97-101` lo llama tesauro |
| 4 | **`fields` duplica nodos** | `lectura-01:102-104`: dos vocabularios controlados con funciones parecidas |
| 5 | **Historial ciego a la prosa** | `_plugins/rizoma_history.rb:53-118` solo lee frontmatter; `lectura-01:199-204` muestra que el corte del Ritual es invisible |
| 6 | **No hay cortes de primera clase** | El ritual quedó huérfano: se borró la sección, sobrevivió la frase, el nodo se retiró, `fields` todavía lista `ritual` (`lectura-01:72-78`) |
| 7 | **Taxonomía de anexos mezcla niveles** | “Fuente” y “concepto” son materiales/lentes; “corrección”, “objeción” y “derivación” son operaciones. Solo se usan 2 de 5 tipos (`PUNTO-DE-ENTRADA.md:161-162`) |
| 8 | **Tres fuentes de verdad del anexo** | Archivo + entrada en `anexos` + `anexos/index.md`; el audit solo advierte (`taller/lib/audit.mjs`) |
| 9 | **Sin búsqueda pública; con tracking** | `nota-archivo-memoria.md:161-166`; los layouts de Rizoma incluyen `analytics.html` y `_config.yml:14-16` configura GA4, contra “Lector sin tracking” (`protocolo:59`) |
| 10 | **El scaffold esquiva la puerta** | `scripts/nueva-exploracion.mjs` escribe una exploración pública sin nodo compartido; la regla existe en prosa y en el taller, no en el scaffold (`protocolo:87-88`) |
| 11 | **Documentación desfasada** | `protocolo:117-123` dice 7 piezas y 9 nodos; hoy 01 tiene 8 piezas. `spec 014` dice 5 anexos; hay 6 |
| 12 | **El calco reaparece** | `cartografia-repeticion-01.html` y el nuevo `mapa-contenido.html` vuelven a cajas, flechas y “NÚCLEO”; `lectura-01:217-220` ya había detectado la recaída |

---

## 2. Problemas conceptuales y editoriales

### 2.1 Falta la capa que responde “¿por qué está esto aquí?”

Las cuatro categorías propuestas —Rastro, Lente, Evidencia, Nodo— describen **funciones de los materiales** y una **relación emergente**, pero no describen **aquello sobre lo que el material actúa**. Sin un frente, pregunta o afirmación, “procedencia”, “interpretación” y “contraste” no tienen referente.

Hoy el sistema responde:

- **Qué es**: poema, código, dispositivo, vestigio, anexo.
- **Dónde está**: exploración, sección, corpus, aparato.
- **Qué dice**: el cuerpo del ensayo.

No responde:

- **Por qué entró** ese material y no otro.
- **Qué afirmación o pregunta** pone a prueba.
- **Qué cambió** después de incorporarlo.
- **Qué tensión** abre.
- **Qué se cortó** y qué sobrevivió.

La nota de corpus es una descripción o una lectura del material, no una razón. “La palabra que insiste para no desaparecer” describe el poema; no dice qué hace el poema en la investigación. “Tres copias, un voto: la redundancia que corrige y su umbral” describe el código; no dice qué afirmación de la deriva queda sostenida o cuestionada.

### 2.2 Las cuatro categorías no están en el mismo nivel

- **Rastro, Lente y Evidencia** son funciones de un material **en relación con una investigación**. Un mismo poema puede ser procedencia, lente y contraste, en la misma exploración o en frentes distintos.
- **Nodo** es una **relación emergente** entre materiales, usos o diferencias. No es una cuarta función del material; es una propiedad de la trama.
- **Frente/pregunta/afirmación** es el objeto sobre el que actúan las funciones. Sin él, las funciones flotan.
- **Corte** es un **acontecimiento editorial/temporal**: algo se abandona, se desplaza o se reemplaza. No es una función ni una relación; es una transformación.

Además, hay colisiones de nombres:

- **“Rastro”** ya nombra un género del sitio: `_fragmentos` se publica como “Rastros”. Usarlo como categoría de función confunde el género con la función. El glosario del usuario ya sugiere el nombre correcto: **Procedencia**.
- **“Evidencia”** tiene una carga positivista. En Rizoma, un poema o una experiencia pueden contrastar una afirmación sin ser “evidencia” en sentido probatorio. **Contraste** es más amplio y más honesto: incluye apoyo, objeción, demostración, dato y tensión.
- **“Nodo”** ya es un objeto público con 12 entradas y una página propia. Si se redefine como relación emergente, hay que migrar su semántica, no solo su nombre.

### 2.3 Referencia, argumento y evidencia no están diferenciados

Hoy todo lo que entra al corpus es una “pieza”. Esa uniformidad es visualmente democrática, pero epistemológicamente muda:

- Una **fuente** no es un argumento.
- Una **obra** no es evidencia de una tesis; puede ser un caso, una lente o una procedencia.
- Un **código** puede ser una demostración, un contraejemplo o una metáfora ejecutable.
- Un **anexo** puede corregir, objetar o derivar; su tipo no dice qué función cumple en la deriva.

El sistema confunde **tipo de material**, **operación textual** y **función en la investigación**. La taxonomía de anexos es el síntoma más claro: “fuente” y “concepto” no son operaciones del mismo tipo que “corrección”, “objeción” y “derivación”.

### 2.4 El sistema puede agregar, pero no cortar

La regla del protocolo es explícita: “Una idea se abandona con hito y motivo; no se borra sin dejar traza” (`protocolo:85-86`). Pero el modelo no tiene un objeto “corte”. Solo tiene:

- `hitos` (decisiones),
- versiones de Git (automáticas),
- anotaciones de lámina (manuales).

El caso del Ritual demuestra el costo: se borró una sección, sobrevivió una frase, se retiró un nodo, `fields` todavía lista `ritual`, y el historial solo muestra “Nodos retirados: Ritual”. El acontecimiento más importante de la exploración es invisible. `lectura-01:199-204` lo dice con precisión: la unidad interesante no es la versión del expediente, es la decisión.

### 2.5 El riesgo de burocracia es real

Cualquier capa nueva puede convertirse en un formulario. La condición es clara: “No queremos convertir cada relación en una explicación burocrática. Tampoco queremos que el autor tenga que completar formularios para poder pensar.”

Por eso el modelo debe cumplir tres reglas:

1. **Opcional por defecto**: un material sin inscripción sigue siendo válido.
2. **Una frase**: el motivo se escribe en una línea; el efecto es opcional.
3. **Sin campos obligatorios nuevos para el lector**: el lector ve una margen, no un formulario.

### 2.6 La experiencia del lector es la de un inventario, no la de una trayectoria

La página de exploración muestra:

- el ensayo,
- el corpus por sección,
- el aparato (corpus completo, nodos, relacionadas, anexos, historial, procedencia),
- la lámina.

El lector puede saber **qué se leyó**, pero no **por qué**. Los nodos son una lista de palabras; las relacionadas son URLs; los anexos están agrupados por tipo, no por frente. La página `/rizoma/nodos/` promete “Puntos de conexión, no categorías”, pero su mecanismo es exactamente una categoría filtrada.

Además, el protocolo promete cuatro entradas —índice, nodo, corpus, búsqueda— y la búsqueda pública no existe. Y el lector es trackeado con GA4 mientras el protocolo dice “sin tracking”.

### 2.7 La taxonomía de anexos necesita un re-mapeo

Los cinco tipos actuales:

| Tipo actual | Qué es realmente | Nivel |
|---|---|---|
| `correccion` | Operación sobre una afirmación | Operación |
| `objecion` | Operación sobre una afirmación | Operación |
| `derivacion` | Operación formal | Operación |
| `fuente` | Material + operación de verificación | Material/operación |
| `concepto` | Lente + operación de expansión | Función/operación |

No hace falta abandonar los cinco tipos como **géneros públicos**; hacen falta dos campos nuevos: `operacion` (`corregir`, `objetar`, `derivar`, `verificar`, `expandir`, `cortar`) y `frente`. Así se preserva el contenido y se aclara el nivel.

### 2.8 Restricciones de implementación que distorsionan el modelo

| Restricción | Efecto conceptual |
|---|---|
| Path como identidad | No hay IDs estables; mover un archivo rompe enlaces |
| `order` como clave de lámina | Renumerar una exploración cambia el asset esperado |
| Láminas hardcodeadas a 01/02 | La tercera exploración no puede tener lámina sin código |
| Commit whitelist (`taller/ops/commit.mjs:11-16`) | El taller no puede commitear `assets/media/rizoma`, layouts, data ni scripts |
| Tres fuentes de verdad del anexo | El archivo, la entrada en `anexos` y el índice pueden desincronizarse |
| Taxonomía duplicada | `_data/anexos_tipos.yml`, `taller/lib/validations.mjs` y la doc deben cambiar juntos |
| Scaffold público sin gate | La regla del nodo compartido se puede esquivar |
| Sin búsqueda pública; con GA4 | El protocolo promete algo que el sitio no hace y hace algo que promete no hacer |

---

## 3. Tres propuestas arquitectónicas

### Propuesta A — Modelo de cuatro categorías

**Definición.** Mantener Rastro, Lente, Evidencia y Nodo, pero tratarlos como **roles relacionales**, no como tipos de contenido.

| Categoría | Definición | Qué no es |
|---|---|---|
| **Rastro** | Material que permite reconocer de dónde surge o vuelve una inquietud: experiencia, escrito anterior, proyecto, intuición, acontecimiento | No es cualquier material del corpus; no es una nota de proceso |
| **Lente** | Material que cambia la forma de ver la pregunta: autor, teoría, disciplina, concepto, obra, marco | No es una cita decorativa; no es una fuente sin efecto |
| **Evidencia** | Material que sostiene, cuestiona o tensiona una afirmación: investigación, experimento, dato, demostración, observación, fuente | No es una prueba definitiva; no es una obra que solo acompaña |
| **Nodo** | Concepto, tensión, contradicción o recurrencia que emerge entre distintos elementos y abre una línea | No es una etiqueta; no es un tema; no es un contenedor |

**Reglas.**
- Un material puede tener más de un rol.
- Un rol es siempre **relativo a una exploración y a un frente**; no es una propiedad intrínseca.
- El rol primario se usa para la lectura; los secundarios quedan en la margen.
- Un nodo se promueve cuando aparece en al menos dos cuerpos con una diferencia de sentido declarada por el autor.
- Un material sin rol declarado sigue siendo válido como “corpus sin función explícita”.

**Ejemplo en 01.**

| Material | Rol A | Por qué |
|---|---|---|
| Introducción personal (“la vida es un loop”) | Rastro | Es el origen explícito de la inquietud |
| *Persistir en el algo* / *∞* | Rastro + Lente | Origen y modo de leer la insistencia |
| Rastros (“el alfabeto se gasta”) | Rastro + Evidencia | Origen y contraejemplo del gasto |
| Fibonacci | Lente + Evidencia | Modelo formal de recurrencia |
| Espiral (dispositivo) | Lente | Vuelve visible la repetición como composición |
| Shannon / Markov | Lente + Evidencia | Cambia la lectura de la repetición como redundancia |
| Voto por mayoría | Evidencia | Demuestra que la repetición corrige y su límite |
| Hormiga de Langton | Evidencia | Contraejemplo: periodicidad, no orden |
| Anexo “La redundancia no es lo que sobra” | Lente + Evidencia | Corrige y cambia la lectura |
| Anexo “El autómata no es redundancia” | Evidencia | Objeción que tensiona la tesis |

**Fortalezas.** Es el modelo más cercano a la intuición del usuario; es fácil de explicar al lector; permite múltiples roles; conserva el corpus.

**Debilidades.**
- **Nodo sigue en otro nivel.** Si se mantiene como cuarta categoría, el modelo mezcla funciones y relaciones.
- **No hay frente/afirmación.** “Rastro”, “Lente” y “Evidencia” siguen flotando sin saber **de qué** son procedencia, lente o evidencia.
- **Riesgo de formulario.** Si cada material exige un rol, el autor termina clasificando en vez de pensando.
- **Colisión de nombres.** “Rastro” ya es un género; “Evidencia” tiene carga positivista.
- **No resuelve el corte.** El ritual sigue sin lugar.

**Veredicto.** Buen **vocabulario de lectura**, mal **modelo de datos** si se usa solo. Sirve como capa pública de nombres, no como arquitectura completa.

---

### Propuesta B — Modelo revisado: funciones, frentes, nodos y cortes

**Tesis.** No son cuatro categorías del mismo tipo. Son **cuatro capas**:

1. **Frente** — la pregunta, tensión o afirmación que la investigación está trabajando.
2. **Inscripción** — el uso de un material en un frente, con función, motivo, efecto y estado.
3. **Nodo** — una diferencia o tensión emergente entre inscripciones.
4. **Corte** — una transformación o abandono con lo que sobrevive.

Alrededor: **Material** (las colecciones existentes), **Anexo** (operación larga), **Hito** (decisión curada), **Lámina** (artefacto fechado).

#### B.1 Nombres

| Nombre propuesto | Reemplaza a | Razón |
|---|---|---|
| **Procedencia** | Rastro (como función) | Evita la colisión con el género “Rastros”; dice de dónde viene |
| **Lente** | Lente | Se conserva; es claro y no pasivo |
| **Contraste** | Evidencia | Incluye apoyo, objeción, demostración, dato y tensión; no exige prueba |
| **Nodo** | Nodo | Se conserva el nombre público, se cambia la semántica: diferencia emergente, no etiqueta |
| **Frente** | — | Ya aparece en el proyecto (“frente de archivo”) y nombra lo que falta |
| **Inscripción** | — | El uso de un material en un frente; en la UI puede llamarse “por qué está” o “entrada” |
| **Corte** | — | Lo que el sistema no puede decir hoy |

#### B.2 Ontología

```text
Exploración
  ├── Frente (pregunta / tensión / afirmación)
  │     ├── Inscripción ──→ Material
  │     └── Corte
  ├── Nodo (emergente, cruza frentes/inscripciones)
  ├── Anexo (operación larga sobre un frente)
  ├── Hito (decisión curada)
  └── Lámina (artefacto fechado)
```

**Relaciones y cardinalidades.**

- Una exploración tiene 0..n frentes.
- Un frente tiene 0..n inscripciones y 0..n cortes.
- Un material puede tener 0..n inscripciones, en uno o varios frentes.
- Una inscripción tiene 1..n funciones (`procedencia`, `lente`, `contraste`); una es primaria para mostrar.
- Un nodo emerge de 2..n inscripciones; no pertenece a una sola exploración.
- Un corte pertenece a un frente y puede referenciar un material y/o un nodo.
- Un anexo pertenece a un frente y tiene una operación primaria.
- Un hito puede referenciar frentes, cortes y anexos.
- Una lámina puede referenciar frentes, inscripciones, nodos y cortes, pero su composición sigue siendo manual.

#### B.3 Reglas de mínima fricción

1. **Una inscripción es una frase.** `motivo` en una línea; `efecto` opcional.
2. **Sin función declarada es válido.** El material se muestra como corpus; no se inventa una función.
3. **Funciones múltiples, una primaria.** La UI muestra un badge primario; el resto queda en detalle.
4. **El frente es opcional.** Si no hay frente, la inscripción se ancla a la exploración o a una sección.
5. **El nodo no se declara por frecuencia.** Se promueve cuando el autor escribe una **diferencia** entre al menos dos apariciones.
6. **El corte no se inventa.** Se registra cuando algo se cortó; si no se sabe por qué, se marca `por-que: desconocido`.
7. **El anexo es para operaciones largas.** La mayoría de los materiales no necesitan anexo.
8. **Nada de grafo.** La lectura es listas, márgenes, anclas y una lámina fechada.

#### B.4 Esquema de datos mínimo

```yaml
# exploración
frentes:
  - id: persistir
    pregunta: "¿La repetición conserva algo o solo lo gasta?"
    estado: abierto        # abierto | en-tension | resuelto | cortado | latente

inscripciones:
  - material: /poemas/persistencias-del-algo/
    frente: persistir
    funciones: [procedencia, lente]
    primaria: procedencia
    motivo: "La insistencia de la palabra abre la pregunta por lo que vuelve."
    efecto: "La repetición aparece como insuficiencia del lenguaje, no como técnica."
    estado: activa         # activa | en-tension | cortada | deprecada | por-definir

cortes:
  - id: ritual
    frente: la-maquina
    material: /melange-reports/mescalina-arkana/  # si existe; si no, descripción
    que_se_corto: "La sección 5, Ritual, y el nodo Ritual."
    por_que: "desconocido"  # no inventar
    sobrevive: "La frase: «un ritual no es una costumbre: es una máquina de producir presente»."
    donde_sobrevive: "#lo-que-queda"
    fecha: 2026-11-10
    estado: por-documentar
```

```yaml
# nodo
title: Diferencia
definition: "Lo que una repetición produce entre una vuelta y la siguiente."
estado: candidato          # campo | candidato | nodo | deprecado
diferencia: >-
  En §4 la diferencia es crecimiento dentro de la repetición; en §6 es lo que
  la repetición conserva; en §8 se separa contenido (sentido) de señal. No es
  el mismo sentido: es la tensión entre diferencia como progreso y diferencia
  como estructura.
apariciones:
  - exploracion: /rizoma/que-se-conserva-cuando-algo-se-repite/
    seccion: volver
    material: /codigo/espiral-fibonacci/
    funcion: lente
  - exploracion: /rizoma/que-se-conserva-cuando-algo-se-repite/
    seccion: lo-que-queda
    funcion: contraste
```

```yaml
# anexo (compatible con el actual)
tipo: correccion           # se conserva como género público
operacion: corregir        # corregir | objetar | derivar | verificar | expandir | cortar
frente: redundancia
```

#### B.5 Ejemplo aplicado a 01

| Material / pieza | Representación actual | B: frente | B: funciones | B: motivo / efecto | Estado |
|---|---|---|---|---|---|
| Introducción personal | No está en corpus | `la-pregunta` | Procedencia | “La vida es un loop” abre la inquietud; la repetición como experiencia | Soportado por el texto |
| *Persistir en el algo* | `corpus` + nota | `persistir` | Procedencia + Lente | La palabra insiste para no desaparecer; la repetición como falta | Soportado; función hipótesis |
| *∞* | `corpus` + nota | `persistir` | Lente | La insistencia llevada al descenso; el mismo centro, otra caída | Soportado; función hipótesis |
| Rastros | `corpus` = `/fragmentos/` | `gastar` | Procedencia + Contraste | “El alfabeto se gasta al repetirlo”; conserva forma y gasta potencia | Soportado; requiere ancla a la línea |
| Fibonacci | `corpus` + nota | `volver` | Lente + Contraste | La recurrencia no cierra; la diferencia está dentro de la repetición | Soportado |
| Espiral | `corpus` + nota | `la-maquina` | Lente | La máquina vuelve visible la repetición como composición | Hipótesis de función |
| Experimento Shannon | `corpus` + nota | `redundancia` | Lente + Contraste | Las aproximaciones al lenguaje como repetición probabilística | Soportado por el texto; el anexo corrige la atribución |
| Voto por mayoría | `corpus` + nota | `redundancia` | Contraste | La repetición corrige y su límite: si el canal es peor que el azar, amplifica el error | Soportado |
| Hormiga de Langton | `corpus` + nota | `la-maquina` | Contraste + Lente | La repetición se vuelve periódica, no ordenada; “orden” es lectura | Soportado por el anexo |
| Anexo redundancia | `tipo: correccion` | `redundancia` | Lente + Contraste | Corrige la definición y cambia la lectura de §7 | Soportado |
| Anexo Langton | `tipo: correccion` | `la-maquina` | Lente + Contraste | Separa comportamiento de interpretación | Soportado |
| Anexo Shannon-Markov | `tipo: correccion` | `redundancia` | Lente | Distingue experimento de método | Soportado |
| Anexo autómata | `tipo: objecion` | `la-objecion` | Contraste | Resiste el atajo “repetición = redundancia” | Soportado |
| Ritual | Invisible | `la-maquina` | — | Corte: se borró la sección, sobrevivió la frase | Documentado en `lectura-01`; motivo desconocido |

**Nodos.** Los 12 nodos actuales se conservan como `campo`. Los cinco compartidos (Repetición, Memoria, Archivo, Automatización, Redundancia) pasan a `candidato`. Solo se promueven a `nodo` cuando el autor escribe una diferencia. Ejemplo:

- **Diferencia**: §4 (crecimiento), §6 (lo que se conserva), §8 (sentido vs señal). **[hipótesis de diferencia]**
- **Redundancia**: §7 (gasto/corrección), §8 (señal), anexo (definición de Shannon), 02 §6 (memoria). **[hipótesis de diferencia]**
- **Residuo**: definición actual “lo que queda cuando algo deja de funcionar”; el anexo Medusa propone “lo que sigue actuando cuando algo deja de significar”. **[diferencia explícita en el anexo]**

**Fortalezas de B.**
- Resuelve el problema del “por qué” con una capa liviana.
- Separa material, función, relación y transformación.
- Permite funciones múltiples y relaciones asimétricas.
- Introduce el corte, que hoy no tiene lugar.
- Conserva el corpus, los anexos y la lámina.
- Puede empezar con 3–5 inscripciones y crecer sin bloquear la escritura.
- No es un grafo: la lectura sigue siendo listas y márgenes.

**Debilidades.**
- Introduce dos conceptos nuevos (frente, inscripción) que hay que explicar bien.
- Si el autor no la mantiene, la capa se vuelve decorativa.
- Requiere una migración de nodos y anexos.
- El frente puede convertirse en una nueva taxonomía rígida si no se disciplina.

**Veredicto.** Es el mejor balance entre potencia conceptual y costo editorial. Es mi recomendación.

---

### Propuesta C — Modelo alternativo: trayectoria de frentes y movimientos

**Tesis.** La unidad primaria no es el material, ni el nodo, ni la exploración como contenedor. Es el **movimiento**: la operación que un material realiza sobre una pregunta o afirmación. La exploración es una **trayectoria de movimientos**.

**Ontología.**

- **Frente**: pregunta, tensión o afirmación.
- **Movimiento**: `originar` (procedencia), `enmarcar` (lente), `poner a prueba` (contraste), `objetar`, `derivar`, `ejemplificar`, `cortar`.
- **Material**: lo que el movimiento usa.
- **Nodo**: recurrencia/diferencia que emerge de varios movimientos.
- **Corte**: un movimiento que abandona o desplaza una línea.

**Diferencia con B.** En B, la inscripción es un registro relativamente estable (“este material, en este frente, con esta función”). En C, el movimiento es la unidad narrativa: “este material hizo esto con esta afirmación, y por eso la afirmación cambió de estado”. C es más explicativo y más cercano a un cuaderno de investigación; también es más exigente.

**Ejemplo en 01.**

| Movimiento | Material | Frente | Efecto |
|---|---|---|---|
| Origen | Introducción personal | `la-pregunta` | Abre la inquietud |
| Enmarcar | Shannon 1948 | `redundancia` | La repetición deja de ser solo gasto; también es corrección |
| Poner a prueba | Voto por mayoría | `redundancia` | La corrección funciona, pero tiene umbral |
| Objetar | Autómata | `la-objecion` | La homogeneización no es redundancia |
| Ejemplificar | Langton | `la-maquina` | La periodicidad no es orden |
| Derivar | Fibonacci | `volver` | La diferencia está dentro de la repetición |
| Cortar | Ritual | `la-maquina` | Se abandona la sección; sobrevive una frase |

**Fortalezas.**
- Es el modelo que mejor responde “qué cambió en la interpretación”.
- Representa contradicciones y transformaciones de forma natural.
- El historial se vuelve una trayectoria de decisiones, no un diff de frontmatter.
- El corte es un movimiento, no un objeto extraño.

**Debilidades.**
- Es el más burocrático: cada material exige un movimiento y un frente.
- Riesgo de convertir el ensayo en un esquema de argumentación.
- Puede sofocar la escritura y la intuición.
- La lectura pública puede volverse más difícil.
- El costo de migración es alto.

**Veredicto.** Es el modelo más potente para un **cuaderno de investigación**, pero demasiado pesado para la superficie pública de Rizoma. Recomiendo usarlo como **vocabulario de operaciones** dentro de B, no como arquitectura completa.

---

## 4. Evaluación comparada

Escala: **5 = muy bueno / bajo costo**, **1 = débil / alto costo**. En “complejidad” e “impacto”, 5 significa menor complejidad/impacto.

| Criterio | A | B | C | Comentario |
|---|---:|---:|---:|---|
| Coherencia conceptual | 3 | 5 | 5 | A mezcla funciones y relación; B separa niveles; C es coherente pero totalizante |
| Materiales heterogéneos | 4 | 5 | 4 | A y B aceptan cualquier material; C exige un movimiento para cada uno |
| Relaciones asimétricas | 2 | 4 | 5 | A no tiene dirección; B tiene material→frente y efecto; C tiene agente→operación→objeto |
| Contradicciones y transformaciones | 2 | 4 | 5 | A no tiene corte; B lo agrega; C lo convierte en movimiento |
| Flexibilidad ante lo imprevisto | 3 | 5 | 4 | B permite `sin función` y frentes nuevos; C puede rigidez |
| Experiencia de escritura | 5 | 4 | 2 | A es la más liviana; C es la más pesada |
| Experiencia de lectura | 4 | 4 | 3 | A y B pueden mostrar una margen clara; C puede volverse técnica |
| Complejidad editorial | 5 | 3 | 2 | A casi no agrega; B agrega una frase por material; C agrega un movimiento por material |
| Complejidad técnica | 5 | 3 | 2 | B requiere nuevos campos y validaciones; C requiere un motor de trayectoria |
| Impacto sobre el contenido existente | 5 | 3 | 2 | B es aditivo; C reinterpreta todo |
| Evolución sin taxonomía rígida | 2 | 5 | 3 | A cristiza cuatro roles; B tiene vocabulario pequeño y extensible; C tiene un esquema fuerte |

### Lo que cambiaría la recomendación

- Si el objetivo principal es **investigar**, no publicar un ensayo: C.
- Si el objetivo es **publicar sin agregar metadatos**: A, con relaciones derivadas y una capa de lectura, no de datos.
- Si el objetivo es **acompañar el proceso sin burocracia y preservar el ensayo**: B.

La recomendación es **B**, con dos elementos de C:

1. **El frente** como objeto de primera clase.
2. **La operación** como vocabulario del anexo (`corregir`, `objetar`, `derivar`, `verificar`, `expandir`, `cortar`).

---

## 5. Ejemplos aplicados a la exploración 01

### 5.1 El caso del Ritual: el corte que no existe

Hecho documentado:

- La versión `a5b277f` tenía “5. Ritual”, anclada en *Mescalina en Arkana Festival*.
- `c3e369c` borró la sección y la entrada de corpus.
- `d4bf639` retiró el nodo `Ritual`.
- El párrafo final sigue diciendo “un ritual no es una costumbre: es una máquina de producir presente”.
- `fields` todavía lista `ritual`.
- El historial solo muestra “Nodos retirados: Ritual”.

Fuente: `docs/rizoma/lectura-01.md:72-78`.

Lo que el sistema no puede decir:

- **Qué** se cortó: una sección, un nodo, una entrada de corpus.
- **Por qué** se cortó: no está documentado; no se debe inventar.
- **Qué sobrevivió**: una frase en §6.
- **Dónde sobrevivió**: `#lo-que-queda`.
- **Qué queda abierto**: si se recupera el ritual o se corta la frase.

Con B, el corte sería un registro:

```yaml
cortes:
  - id: ritual
    frente: la-maquina
    que_se_corto: "Sección 5, Ritual; nodo Ritual; entrada de corpus."
    por_que: "desconocido"
    sobrevive: "«un ritual no es una costumbre: es una máquina de producir presente»"
    donde_sobrevive: "#lo-que-queda"
    fecha: 2026-11-10
    estado: por-documentar
```

Esto no resuelve la decisión editorial, pero **la vuelve visible y discutible**. Es exactamente lo que `lectura-01` pide: que el sistema aprenda a decir “esto se abandonó”.

### 5.2 El nodo “Diferencia”

Hoy el nodo es una entrada:

```yaml
title: Diferencia
order: "08"
definition: "..."
```

La página `/rizoma/nodos/` muestra las exploraciones que contienen “Diferencia” en `nodos`. No muestra **qué diferencia**.

Con B, el nodo tendría una diferencia declarada:

```yaml
diferencia: >-
  En §4 la diferencia es crecimiento dentro de la repetición; en §6 es lo que
  la repetición conserva; en §8 se separa contenido (sentido) de señal. No es
  el mismo sentido: es la tensión entre diferencia como progreso y diferencia
  como estructura.
```

Y apariciones:

- §4 / Fibonacci / lente.
- §6 / “lo que queda” / contraste.
- §8 / objeción / contraste.

La página del nodo sería una **página de diferencia**: tres excerptos, tres sentidos, una tensión, una pregunta abierta. No un grafo. No una nube de tags.

### 5.3 El nodo “Redundancia”

Hoy es una entrada de `_nodos` usada por 01 y 02. El lector no sabe que en cada exploración significa algo distinto.

Con B:

- **01 §7**: redundancia como estructura que resiste el ruido; repetir corrige.
- **01 §8**: redundancia como señal, no como sentido; conservar señal no es conservar sentido.
- **Anexo “La redundancia no es lo que sobra”**: corrección de la definición de Shannon.
- **02 §6**: redundancia como práctica de memoria; lo que se copia, se cita y se vuelve a leer dura más.

Diferencia propuesta **[hipótesis]**: en 01 la redundancia es una propiedad técnica del mensaje; en 02 es una condición práctica de la memoria. El mismo término pasa de “lo que permite corregir” a “lo que permite persistir”. Esa diferencia abre una pregunta que hoy no está formulada: **¿la redundancia conserva el sentido o solo la señal?** El anexo ya la roza, pero no la convierte en nodo.

### 5.4 La introducción personal: procedencia sin inscripción

El texto de 01 empieza con una experiencia (“la vida es un loop”, los psicodélicos, el Diógenes digital, programar como iterar). Es la procedencia más clara de la exploración y no está en `corpus`. Hoy vive solo en el cuerpo.

Con B, no hace falta convertirla en obra ni en anexo. Alcanza una inscripción:

```yaml
- material: "#introduccion"
  frente: la-pregunta
  funciones: [procedencia]
  primaria: procedencia
  motivo: "La experiencia de la repetición como loop abre la pregunta."
  efecto: "La repetición aparece primero como biografía, no como concepto."
  estado: activa
```

Esto responde una pregunta que el lector se hace al leer: **¿de dónde sale esta inquietud?** Sin agregar un formulario: una frase.

### 5.5 Cruce con 02: Medusa

Medusa ya tiene un tipo explícito: `objecion`. Pero en la práctica cumple varias funciones:

- **Contraste**: resiste la tesis de §6 (la conservación como práctica).
- **Lente**: propone el cuerpo como soporte; cambia la lectura del archivo.
- **Procedencia**: es un poema del autor que vuelve sobre la memoria.

El modelo B permite declarar las tres funciones sin borrar `tipo: objecion`. El anexo seguiría siendo una objeción; la inscripción diría por qué está y qué cambió:

```yaml
- material: /poemas/medusa/
  frente: repetir-para-no-perderse
  funciones: [contraste, lente]
  primaria: contraste
  motivo: "Un caso de conservación sin soporte que resiste la tesis de §6."
  efecto: "La conservación deja de ser solo práctica: también puede ser adherencia."
  estado: en-tension
```

Esto es **soportado** por el anexo Medusa, no una invención. La función `lente` es una hipótesis razonable, no una afirmación del texto.

---

## 6. Recomendación argumentada

Recomiendo la **Propuesta B**, con dos préstamos de C:

1. **El frente** como objeto de primera clase.
2. **La operación** como vocabulario del anexo.

### Por qué no A

A es un buen vocabulario de lectura, pero no un modelo de datos:

- mezcla tres funciones con una relación emergente;
- no tiene frente, así que no responde “¿por qué está esto aquí?”;
- si se aplica como clasificación obligatoria, se convierte en un formulario;
- “Rastro” choca con el género Rastros; “Evidencia” tiene carga positivista.

A puede sobrevivir como **capa de nombres públicos** dentro de B. No como arquitectura completa.

### Por qué no C

C es el modelo más potente para un cuaderno de investigación, pero:

- exige un movimiento por material;
- convierte el ensayo en una cadena de argumentación;
- es el más costoso de migrar;
- puede sofocar la escritura y la intuición.

C es mejor como **vocabulario de operaciones** (`originar`, `enmarcar`, `poner a prueba`, `objetar`, `derivar`, `ejemplificar`, `cortar`) dentro de B.

### Por qué B

B separa cuatro niveles que hoy están confundidos:

| Nivel | Objeto | Pregunta que responde |
|---|---|---|
| Investigación | Frente | ¿Qué estamos tratando de pensar? |
| Uso | Inscripción | ¿Por qué está este material y qué hace? |
| Material | Obra, fuente, experimento | ¿Qué es? |
| Emergencia | Nodo | ¿Qué diferencia o tensión aparece? |
| Transformación | Corte | ¿Qué se abandonó y qué sobrevivió? |

B conserva:

- el ensayo como superficie principal;
- el corpus heterogéneo;
- los anexos largos;
- la lámina como artefacto;
- el taller con diff/promoción;
- la separación público/taller.

B agrega poco:

- `frentes` (opcional);
- `inscripciones` (una frase por material cuando importa);
- `diferencia` en los nodos;
- `cortes` (solo cuando hay un corte).

### Condiciones no negociables

1. **Preservar el corpus y la procedencia.** No reescribir cuerpos, no borrar anexos, no inventar motivos.
2. **No grafo, no dashboard, no kanban.** La lectura es listas, márgenes, anclas y una lámina fechada.
3. **Mantener el taller local-first con plan/diff/commit.**
4. **La inscripción es opcional.** Un material sin función declarada sigue siendo válido.
5. **Una frase por inscripción.** Si no se puede decir en una línea, no es una inscripción: es un anexo.
6. **El nodo se promueve por diferencia declarada, no por frecuencia.**
7. **El corte se registra cuando ocurre; no se inventa una razón.**
8. **El autor decide qué se publica; la IA puede proponer, no marcar.**

---

## 7. Arquitectura conceptual propuesta

### 7.1 Entidades

| Entidad | Definición | Cardinalidad | Público/Taller |
|---|---|---|---|
| **Exploración** | Deriva con pregunta, cuerpo y trayectoria | 1..n frentes | Público |
| **Frente** | Pregunta, tensión o afirmación que se está trabajando | 0..n por exploración | Público (curado) |
| **Material** | Obra, fuente, experimento, experiencia, fragmento, imagen, conversación | 0..n inscripciones | Público |
| **Inscripción** | Uso de un material en un frente, con funciones, motivo, efecto y estado | 0..n por frente/material | Público o taller |
| **Nodo** | Diferencia o tensión emergente entre 2..n inscripciones | 0..n por exploración; puede cruzar | Público (curado) |
| **Corte** | Transformación o abandono: qué se cortó, por qué, qué sobrevivió | 0..n por frente | Público o taller |
| **Anexo** | Operación larga sobre un frente/afirmación | 0..n por frente | Público |
| **Hito** | Decisión curada que cambia la lectura | 0..n por exploración | Público |
| **Lámina** | Artefacto fechado con esqueleto generado y anotación manual | 0..1 por exploración | Público |
| **Fuente** | Material con verificación y cita | 0..n por anexo/inscripción | Público |

### 7.2 Glosario

- **Procedencia**: de dónde surge o vuelve la inquietud.
- **Lente**: qué cambia la forma de ver la pregunta.
- **Contraste**: qué sostiene, cuestiona o tensiona una afirmación.
- **Frente**: la pregunta, tensión o afirmación que recibe el material.
- **Inscripción**: la relación “este material, en este frente, con esta función, por este motivo, con este efecto”.
- **Nodo**: una diferencia o tensión que emerge entre inscripciones.
- **Corte**: lo que se abandona o desplaza, con lo que sobrevive.
- **Operación**: lo que un anexo hace (`corregir`, `objetar`, `derivar`, `verificar`, `expandir`, `cortar`).

### 7.3 Estados

| Objeto | Estados |
|---|---|
| Frente | `abierto`, `en-tension`, `resuelto`, `cortado`, `latente` |
| Inscripción | `activa`, `en-tension`, `cortada`, `deprecada`, `por-definir` |
| Nodo | `campo`, `candidato`, `nodo`, `deprecado` |
| Corte | `documentado`, `por-documentar` |
| Anexo | `corregido`, `verificado`, `abierta`, `provisional`, `reemplazado` (se conserva) |

### 7.4 Reglas

1. **Una inscripción pertenece a un frente o a la exploración.** Si no hay frente, se ancla a una sección.
2. **Un material puede tener varias funciones.** La primaria se muestra; las secundarias quedan en detalle.
3. **Una función no es obligatoria.** `por-definir` es un estado válido.
4. **Un nodo requiere dos apariciones y una diferencia escrita por el autor.** La frecuencia sola no basta.
5. **Un nodo puede ser `campo` o `candidato` sin ser público.** La promoción es un acto editorial.
6. **Un corte requiere qué se cortó y qué sobrevivió.** La razón puede ser `desconocido`.
7. **Un anexo tiene una operación primaria.** Los cinco tipos actuales se conservan como género; `operacion` aclara el nivel.
8. **Un hito puede referenciar frentes, cortes y anexos.** Deja de ser solo una entrada de frontmatter.
9. **Una lámina puede leer frentes, inscripciones, nodos y cortes, pero su composición sigue siendo manual.**
10. **Nada de grafo.** La representación pública es una lista/margen; la lámina es una excepción fechada y manual.

### 7.5 Cómo responde a las preguntas del problema

| Pregunta | Respuesta en B |
|---|---|
| ¿De dónde surge la inquietud? | Inscripciones de procedencia + `procedencia` + notas de banco |
| ¿Por qué entra un material? | `motivo` de la inscripción + frente |
| ¿Qué aporta? | `funciones` + `efecto` |
| ¿Qué cambia en la interpretación? | `efecto` + estado del frente + hito |
| ¿Qué contradicciones/tensiones aparecen? | `contraste` + nodo con `diferencia` + corte |
| ¿Qué relaciones emergen? | Nodo (diferencia) + frentes relacionados |
| ¿Cómo evoluciona la pregunta? | Versiones del frente + hitos + cortes + trayectoria |

### 7.6 Lo que queda abierto por diseño

- No todas las relaciones se declaran; los nodos emergen.
- No todos los materiales se clasifican; el corpus sin función es válido.
- No todas las exploraciones se cierran; el frente puede quedar `latente`.
- No hay una representación total; la lámina es parcial y fechada.

---

## 8. Arquitectura de información y datos

### 8.1 Superficies públicas

| Superficie | Contenido | Cambio respecto de hoy |
|---|---|---|
| `/rizoma/` | Índice de exploraciones | Puede sumar frentes abiertos y nodos candidatos |
| `/rizoma/:slug/` | Ensayo + margen “Trayectoria” + aparato | Nueva margen: frentes, inscripciones, cortes |
| `/rizoma/:slug/#frente` | Ancla del frente | No hace falta página por frente |
| `/rizoma/nodos/` | Lista de diferencias | Deja de ser un tesauro; muestra diferencia y estado |
| `/rizoma/nodos/:slug/` | Página de diferencia | Apariciones, sentidos, tensión, pregunta abierta |
| `/rizoma/:slug/anexos/` | Aparato | Suma `operacion` y `frente` |
| `/rizoma/:slug/historial/` | Trayectoria | Hitos + cortes + versiones; Git como capa cruda |
| `/rizoma/buscar/` | Búsqueda estática | Hoy no existe; el protocolo la promete |
| `/rizoma/:slug/lamina/` | Lámina fechada | Puede leer frentes/cortes si están curados |

**Regla de lectura:** la página de exploración sigue siendo un ensayo. La trayectoria es una margen colapsable, no un dashboard. El lector puede ignorarla y leer el cuerpo; si la abre, entiende por qué está cada material.

### 8.2 Modelo de datos: frontmatter primero

Para v1 conceptual, propongo **frontmatter de la exploración** con cuatro claves nuevas:

```yaml
schema_version: 2
frentes: [...]
inscripciones: [...]
cortes: [...]
```

Ventajas:

- un archivo = una exploración;
- el diff sigue siendo atómico;
- Jekyll lo lee sin plugin;
- el taller ya sabe editar frontmatter;
- la migración es aditiva.

Riesgo: el frontmatter puede crecer. Mitigación:

- una inscripción es una frase;
- solo se inscriben los materiales que importan;
- si supera un umbral (por ejemplo, 40 inscripciones), se puede mover a un sidecar `_data/rizoma/<slug>/trayectoria.yml` sin cambiar la URL ni el cuerpo;
- el taller puede editar el sidecar con el mismo plan/diff.

### 8.3 Compatibilidad

Se conservan:

- `corpus`, `corpus_secciones`, `nodos`, `relacionadas`, `anexos`, `hitos`, `fields`, `lamina`;
- `tipo` de anexo;
- URLs y permisos;
- historial de Git.

Se agregan:

- `schema_version`;
- `frentes`, `inscripciones`, `cortes`;
- `operacion` y `frente` en anexos;
- `diferencia` y `apariciones` en nodos.

Se deprecan gradualmente:

- `fields` (se congela; no se usa en nuevas exploraciones);
- `corpus_secciones` (se mantiene para compatibilidad; las inscripciones lo reemplazan);
- `relacionadas` como lista de URLs (se puede enriquecer con `motivo`).

### 8.4 Taller: nuevas operaciones

| Operación | Qué hace | Validación |
|---|---|---|
| `abrir-frente` | Crea un frente en una exploración | id único, pregunta no vacía |
| `inscribir-material` | Agrega una inscripción | material existe, frente existe, motivo no vacío |
| `editar-inscripcion` | Cambia funciones, motivo, efecto, estado | no borra el material; diff explícito |
| `promover-nodo` | Pasa `campo`/`candidato` a `nodo` | ≥2 apariciones + `diferencia` escrita |
| `registrar-corte` | Agrega un corte | qué se cortó + qué sobrevive; razón opcional |
| `editar-trayectoria` | Reordena frentes/inscripciones | no rompe anclas |
| `publicar-anexo` | Ya existe | suma `operacion` y `frente` |
| `publicar-hito` | Ya existe | puede referenciar frente/corte |

Se mantiene el flujo `plan → diff → apply → commit`. Las validaciones nuevas son **overridables con motivo** cuando no son de integridad.

### 8.5 Historial y trayectoria

- **Git** sigue siendo la memoria técnica: versiones, diff, comparación.
- **Hitos** sigue siendo la memoria editorial: decisiones.
- **Cortes** se agrega como memoria de transformación: qué se abandonó y qué sobrevivió.
- **Trayectoria** es la vista pública que combina hitos, cortes, frentes y versiones; el diff de prosa se enlaza, no se inventa.
- El historial deja de ser solo un diff de frontmatter: muestra las decisiones y los cortes, y ofrece el enlace al diff real.

### 8.6 Lámina

- El esqueleto puede incluir frentes, inscripciones y cortes si están curados.
- La composición sigue siendo manual y fechada.
- No se autogenera la lectura; se anota.
- Se deshardcodean las placas: un registro `PLATES` por exploración, no dos entradas fijas.
- El taller puede verificar todas las láminas, no solo 01/02.

### 8.7 Búsqueda y tracking

- **Búsqueda pública**: índice estático (Pagefind, Lunr o similar), sin backend, sin tracking. Es una deuda del protocolo.
- **Tracking**: hoy GA4 contradice “Lector sin tracking”. Hay que decidir: quitar GA4 de Rizoma o revisar el protocolo. Mi recomendación es quitarlo de las superficies de Rizoma; el resto del sitio puede mantenerlo si el autor lo decide.

### 8.8 Restricciones técnicas a corregir

1. **Identidad**: pasar de path a ID estable para materiales y frentes; mantener path como alias.
2. **`order`**: separar orden editorial de nombre de asset de lámina.
3. **Láminas hardcodeadas**: registro de placas.
4. **Commit whitelist**: incluir `assets/media/rizoma/` y, si se editan, `_data`, `_includes`, `_layouts` con revisión.
5. **Tres fuentes del anexo**: una sola fuente de verdad (archivo) y el índice derivado.
6. **Taxonomía duplicada**: un solo registro (`_data/rizoma_taxonomia.yml`) leído por Jekyll y por el taller.
7. **Scaffold**: que `nueva-exploracion` cree la exploración en estado `borrador` o que pase por el gate del taller.

---

## 9. Estrategia de preservación y migración

### 9.1 Principios

1. **No reescribir cuerpos.** La prosa existente es el corpus; el rediseño no la toca.
2. **No borrar.** Los anexos, nodos, hitos y entradas de corpus se conservan.
3. **No inventar.** Si un motivo no está documentado, se marca `por-definir` o `desconocido`.
4. **Aditivo y reversible.** Cada fase agrega una capa; se puede volver atrás.
5. **Dual-read.** El sitio y el taller leen lo viejo y lo nuevo durante la transición.
6. **Versionar el modelo.** ADR 0007 + `schema_version` + changelog.
7. **Preservar URLs y procedencia.** Nada de redirects rotos; los enlaces externos siguen funcionando.

### 9.2 Fases

**Fase 0 — Inventario y congelamiento.**
- Extraer un inventario de exploraciones, corpus, nodos, anexos, hitos, URLs, anclas y `fields`.
- Snapshot del repo (tag) antes de tocar nada.
- Congelar `fields` para nuevas exploraciones.

**Fase 1 — Capa derivada, read-only.**
- Derivar `frentes` de las secciones y preguntas abiertas; marcar `derivado: true`.
- Derivar `inscripciones` de `corpus` y `corpus_secciones`; usar la nota existente como `motivo` provisional; marcar `por-definir`.
- Derivar nodos como `campo`/`candidato`; no público todavía.
- Registrar el corte del Ritual con lo documentado en `lectura-01`; marcar `por-que: desconocido`.
- No mostrar nada nuevo al lector.

**Fase 2 — Curaduría en el taller.**
- El autor revisa 5–10 inscripciones; escribe motivo/efecto; elige funciones.
- Promueve 1–2 nodos con diferencia.
- Abre 2–3 frentes.
- Documenta el corte del Ritual si quiere.
- Medir el tiempo: si una inscripción lleva más de 2 minutos, simplificar el modelo.

**Fase 3 — Render público.**
- Margen “Trayectoria” en la exploración.
- Página de diferencia por nodo.
- Historial con cortes/hitos.
- Búsqueda estática.
- La lámina puede leer la nueva capa, pero sigue manual.

**Fase 4 — Deprecación gradual.**
- `fields` deja de usarse en nuevas exploraciones.
- `corpus_secciones` se mantiene como compatibilidad; las inscripciones son la fuente nueva.
- `relacionadas` puede seguir como lista simple o enriquecerse con motivo.
- Actualizar `PUNTO-DE-ENTRADA`, protocolo, taxonomía y ADR.

**Fase 5 — Limpieza.**
- Solo después de un ciclo completo: retirar `fields` y `corpus_secciones` si no se usan.
- Conservar un export y el historial.
- No borrar nodos/anexos antiguos: se deprecan, no se eliminan.

### 9.3 Migración concreta de 01

| Material | Acción inicial | Marca |
|---|---|---|
| Introducción personal | Inscripción de procedencia en `la-pregunta` | Soportado |
| *Persistir en el algo* / *∞* | Inscripción en `persistir`; funciones procedencia/lente | Función hipótesis |
| Rastros | Inscripción en `gastar`; requiere ancla a la línea | Requiere cambio técnico |
| Fibonacci | Inscripción en `volver`; lente/contraste | Soportado |
| Espiral | Inscripción en `la-maquina`; lente | Hipótesis |
| Shannon/Markov | Inscripción en `redundancia`; lente/contraste | Soportado |
| Voto por mayoría | Inscripción en `redundancia`; contraste | Soportado |
| Langton | Inscripción en `la-maquina`; contraste/lente | Soportado |
| 4 anexos | Agregar `frente` y `operacion`; conservar `tipo` | Soportado |
| 9 nodos | `campo`; 5 compartidos a `candidato` | No público hasta curar |
| Ritual | Corte `ritual`; `por-que: desconocido` | Documentado |

### 9.4 Migración concreta de 02

| Material | Acción inicial | Marca |
|---|---|---|
| Rastros (dos líneas) | Inscripción en `dos-rastros`; procedencia/contraste | Requiere ancla |
| Página que ya no responde | Inscripción en `deprecar`; contraste | Soportado |
| Página doblada en cuatro | Inscripción en `deprecar` o `guardar`; contraste | Hipótesis de frente |
| Medusa | Inscripción en `repetir-para-no-perderse`; contraste/lente | Soportado por el anexo |
| Candil | Inscripción en `recuperar`; lente | Hipótesis |
| Grid de palabras | Inscripción en `repetir-para-no-perderse`; contraste | Soportado |
| 2 anexos | Agregar `frente` y `operacion` | Soportado |
| 8 nodos | `campo`; compartidos a `candidato` | No público hasta curar |
| Residuo | `candidato` con diferencia propuesta por Medusa | Hipótesis explícita |

### 9.5 Chequeos de integridad

- Toda inscripción apunta a un material existente y a un frente existente.
- Todo nodo promovido tiene ≥2 apariciones y una `diferencia` no vacía.
- Todo corte tiene `que_se_corto` y `sobrevive`; `por_que` puede ser `desconocido`.
- Todo anexo tiene `operacion` y `frente` (o `frente: general`).
- No hay URLs rotas; los permisos existentes se conservan.
- El historial de Git sigue siendo la fuente de las versiones.
- La lámina sigue verificando contra el esqueleto; las placas nuevas se registran.

### 9.6 Rollback

- Cada fase es un commit independiente.
- El sitio puede ignorar las claves nuevas y seguir leyendo las viejas.
- Si la capa nueva no se usa, se puede ocultar sin borrar datos.
- El tag de Fase 0 permite volver al estado anterior.

### 9.7 Criterios de éxito

1. Para el 80% de los materiales del corpus, un lector puede responder “¿por qué está aquí?” sin salir de la página.
2. El autor puede agregar una inscripción en menos de 2 minutos.
3. Al menos un nodo tiene una diferencia pública que no es una definición.
4. El historial muestra al menos un corte con lo que sobrevivió.
5. No hay materiales forzados a una categoría; `sin función` sigue siendo válido.
6. El ensayo sigue siendo legible sin abrir la trayectoria.
7. No hay grafo, dashboard ni métricas.

---

## 10. Preguntas antes de implementar

### Conceptuales

1. ¿El frente es una pregunta, una tensión o una afirmación? ¿Puede cambiar de tipo?
2. ¿Un material puede actuar sobre varios frentes? ¿Cómo se muestra sin duplicar?
3. ¿La diferencia de un nodo es una interpretación del autor o una hipótesis del sistema?
4. ¿Un nodo puede ser negativo (“lo que no es”) o solo positivo?
5. ¿El corte es público, de taller, o ambas cosas según el caso?

### Editoriales

6. ¿Cuál es la inscripción mínima aceptable? ¿Una frase, una palabra, un campo vacío?
7. ¿Quién escribe el motivo: el autor, el colaborador o la IA? ¿Cómo se marca la procedencia?
8. ¿Se permite `sin función` en la superficie pública o solo en el taller?
9. ¿Los anexos siguen siendo cinco tipos o se re-mapean a operaciones?
10. ¿Qué pasa con `fields`? ¿Se congela, se migra a frentes o se elimina?
11. ¿Las `relacionadas` se declaran o se derivan de frentes/nodos compartidos?

### Lector

12. ¿La trayectoria se muestra siempre o se despliega?
13. ¿El lector debe ver el motivo de cada material o solo los que el autor curó?
14. ¿La página de nodo es una página de diferencia o una lista de apariciones?
15. ¿La búsqueda pública es necesaria? ¿Qué busca: texto, nodos, frentes, materiales?
16. ¿Se quita GA4 de Rizoma o se revisa el protocolo “sin tracking”?

### Técnicas

17. ¿Frontmatter o sidecar para frentes/inscripciones/cortes?
18. ¿Cómo se da identidad estable a un fragmento de Rastros para poder inscribir una línea?
19. ¿Cómo se deshardcodean las láminas sin romper las URLs existentes?
20. ¿Qué pasa con el commit whitelist del taller cuando la lámina actualiza `assets/media/rizoma`?
21. ¿Cómo se versiona el modelo (ADR, `schema_version`, compatibilidad)?
22. ¿Cómo se evita que la capa nueva se convierta en un formulario?

### Migración

23. ¿Se migra 01 y 02 antes de abrir una 03, o se usa una 03 como piloto?
24. ¿Cuánto tiempo puede convivir `corpus_secciones` con `inscripciones`?
25. ¿Qué se hace con los documentos desfasados (`protocolo`, `spec 014`, `PUNTO-DE-ENTRADA`) durante la transición?

### Las cinco decisiones que necesito antes de implementar

1. **¿Aceptás que Nodo no es una cuarta categoría, sino una relación emergente?**
2. **¿Aceptás renombrar Rastro→Procedencia y Evidencia→Contraste?**
3. **¿Aceptás el frente como objeto de primera clase, aunque sea opcional?**
4. **¿Aceptás el corte como objeto de primera clase?**
5. **¿Preferís frontmatter o sidecar para la capa nueva?**

La recomendación es **B**, con frontmatter primero, inscripciones de una frase, nodos por diferencia declarada y cortes documentados.

---

## Apéndice — Archivos revisados

- `docs/rizoma/PUNTO-DE-ENTRADA.md`
- `docs/rizoma/protocolo-cartografia.md`
- `docs/rizoma/taxonomia-anexos.md`
- `docs/rizoma/adr/ADR-0001` a `ADR-0006`
- `docs/rizoma/lectura-01.md`
- `docs/rizoma/nota-archivo-memoria.md`
- `docs/rizoma/nota-transformador.md`
- `docs/rizoma/nota-diagram-design.md`
- `docs/rizoma/banco/2026-11-14-identidad-transformacion-multiplicidad.md`
- `docs/rizoma/ciclos/2026-11-10-archivo.md`
- `content/collections/_exploraciones/que-se-conserva-cuando-algo-se-repite.md`
- `content/collections/_exploraciones/archivo.md`
- `rizoma/que-se-conserva-cuando-algo-se-repite/anexos/*.md`
- `rizoma/archivo/anexos/*.md`
- `content/collections/_nodos/*.md`
- `_layouts/exploracion.html`, `_layouts/anexo.html`, `_layouts/anexos.html`, `_layouts/rizoma-historial.html`
- `_includes/rizoma-corpus.html`, `_includes/section-rail.html`, `_includes/back-button.html`
- `_plugins/rizoma_history.rb`, `_plugins/series_pages.rb`, `_plugins/empty_dates.rb`
- `taller/rizoma.config.mjs`, `taller/ops/*`, `taller/lib/*`
- `specs/014-taller-rizoma/spec.md`
- `docs/rizoma/build-lamina.py`
- `_config.yml`, `_data/navigation.yml`, `_data/anexos_tipos.yml`
- `scripts/nueva-exploracion.mjs`, `scripts/check-links.mjs`
