---
title: Lectura 01 — repetición, archivo, memoria, automatización
date: 2026-11-10
estado: mapa de lectura · no es contenido publicable
---

# Lectura 01

Revisión del sitio, de la exploración 01 y de su historia, antes de proponer
cambios. No reescribe contenido. Ordena lo que ya está, separa lo que el texto
afirma de lo que solo sugiere, y deja abiertos los frentes que todavía no
tienen cuerpo.

## Fuentes revisadas

- `content/collections/_exploraciones/que-se-conserva-cuando-algo-se-repite.md`
  y sus tres versiones en Git (`a5b277f`, `c3e369c`, `d4bf639`).
- `_layouts/exploracion.html`, `_layouts/rizoma-historial.html`,
  `_plugins/rizoma_history.rb`, `_includes/rizoma-corpus.html`.
- Los 8 nodos, los 35 rastros, los 10 poemas, los 17 códigos, los 4
  dispositivos, los 6 vestigios y las 7 fichas de Melange.
- `PRODUCT.md`, `DESIGN.md`, `docs/VISUAL-IDENTITY.md` (histórico),
  `_data/navigation.yml`.
- `docs/rizoma/cartografia-repeticion-01.html` (sin commitear).
- Páginas publicadas en `kndl.quicio.qzz.io`: `/rizoma/`, la exploración y su
  `/historial/`.

No hubo acceso a fuentes externas en esta sesión. Todas las referencias que
aparecen abajo están sin verificar contra el texto original: **no deben entrar
al sitio sin comprobación previa**.

---

## 1. El archivo ya es la infraestructura del sitio

La palabra «archivo» no entra a Rizoma desde la filosofía: ya estaba en el
sitio antes de la exploración.

- `PRODUCT.md`: «archivo creativo personal y un laboratorio».
- Portada: «archivo en estado umbral».
- Rastros: «Archivo de pensamiento en curso. No son publicaciones. Son rastros.»
- `openspec/changes/archive-foundation`: el archivo como nombre del sistema.
- El CMS, Git, el sitemap, `corpus.txt` y `diccionario.txt` en la raíz: el
  archivo como soporte técnico real, no como tema.

Consecuencia [interpretación]: el frente de archivo no es una metáfora que se
agrega a la repetición. Es la condición material del proyecto. Por eso el
hallazgo más fuerte no está en citar a Derrida, sino en mirar lo que el propio
sitio hace cuando repite, guarda, indexa y publica.

## 2. Lo que la exploración afirma hoy

| # | Afirmación | Tipo |
|---|---|---|
| P1 | Repetir parece lo contrario de crear. | intuición |
| P2 | El cuerpo conserva procedimientos por reiteración; la repetición transmitía prácticas. | verificable, hoy sin fuente |
| P3 | El poema no repite por falta de lenguaje: repite porque el lenguaje no alcanza. | concepto propio |
| P4 | La repetición conserva una forma y gasta una potencia. | concepto propio |
| P5 | La recurrencia no vuelve al punto de partida: vuelve a otra escala. | concepto (matemática) |
| P6 | La diferencia no está fuera de la repetición: está en su manera de repetir. | concepto propio |
| P7 | La máquina no imita la repetición humana: la vuelve visible. | metáfora |
| P8 | «La repetición no conserva el contenido. Conserva la diferencia entre una vuelta y la siguiente.» | afirmación fuerte |
| P9 | Cinco preguntas abiertas, sin respuestas. | preguntas |

P4 y P8 no dicen lo mismo. El texto no las reconcilia (ver §4).

## 3. Relaciones establecidas y fricciones verificables

Estado: 8 nodos, 5 piezas de corpus, 0 relacionadas, 3 versiones en el
historial, 2 hitos.

**a) El ritual quedó huérfano.** La versión `a5b277f` tenía una sección
completa, «5. Ritual», anclada en *Mescalina en Arkana Festival*. `c3e369c`
borró la sección y la entrada de corpus. `d4bf639` retiró el nodo `Ritual`
(el historial lo muestra: «Nodos retirados: Ruido · Ritual»). Pero el párrafo
final sigue afirmando «un ritual no es una costumbre: es una máquina de
producir presente», y `fields` todavía lista `ritual`. La afirmación sobrevive
sin el material que la sostenía.

**b) El resumen se desplazó del cuerpo.** Promete «persistencia, lenguaje,
programación y ritualidad»; el cuerpo ya no desarrolla ritualidad y trata la
programación solo como matemática ejecutada.

**c) El corpus no puede citar un rastro.** Los dos fragmentos que abren el
frente de archivo («Memorias que se fragmentan…», «¿Solo somos una colección
de archivos markdown deprecados?») viven en una sección sin páginas
individuales. El corpus apunta a `/fragmentos/` entero: el frente más
importante no tiene dirección propia, y el índice cuenta «5 piezas» cuando una
de ellas son 35 rastros.

**d) Los títulos no coinciden con las referencias.** El poema que la
exploración llama *Persistir en el algo* se titula «Una constante en mi ser»;
la serie es «Persistir en el algo». La segunda parte se titula «∞», no «Cae»
—aunque el efecto de lectura sí se llama `descender-drip` y la sección de
diseño la llama Cae.

**e) Los nodos son etiquetas, no conexiones.** `/rizoma/nodos/` declara
«Puntos de conexión, no categorías»; la implementación es una lista filtrada
por `nodos contains title`, con `order` y vocabulario cerrado. Es un tesauro.
El texto de la página desmiente lo que hace el mecanismo.

**f) Taxonomía duplicada.** `fields` (memoria, lenguaje, código, ritual,
sonido, Programacion) y `nodos` (8 términos) cumplen funciones parecidas. Hay
una mayúscula y una tilde perdidas en el camino.

**g) Dos voces en el margen.** Las notas de corpus hablan en imperativo
(«Encuentra una obsesión y luego repite», «Entra y desciende…»); el cuerpo
habla en primera persona reflexiva. No es un error de estilo: es una decisión
de voz que todavía no se tomó.

## 4. Tensiones internas

**T1. Forma/potencia contra contenido/diferencia.** §3 dice que la repetición
conserva una forma y gasta una potencia. §6 dice que no conserva el contenido
y conserva la diferencia. Ambas pueden ser verdaderas si se distingue forma,
contenido y potencia; el texto no hace esa distinción y la contradicción queda
como sedimento. Es el lugar donde el pensamiento todavía no trabajó.

**T2. La espiral impone una teleología.** «Vuelve a una escala distinta»,
«si lo fuera, no habría crecimiento»: la diferencia se vuelve progreso. La
apuesta de Deleuze en *Diferencia y repetición* no es que repetir acumule
novedad; es que la repetición es diferencia sin concepto, y que el eterno
retorno selecciona solo lo que difiere. Usar a Deleuze como confirmación del
crecimiento es el uso más cómodo y el menos deleuziano. Las tres síntesis del
tiempo (hábito, memoria, eterno retorno) sirven como lente, no como rejilla a
completar.

**T3. Mecánica/generativa es una buena heurística con malos ejemplos.** El
propio archivo la desborda: la hormiga de Langton pasa de caos a un ciclo
periódico; el Juego de la vida produce emergencia sin progreso; Shannon
muestra que repetir es agregar redundancia, es decir, gastar capacidad para
conservar el mensaje. Son tres regímenes distintos —emergencia, corrección,
acumulación— metidos en una sola palabra.

**T4. La máquina abstracta contra las máquinas del archivo.** La sección «La
máquina» cita a Espiral, un instrumento diseñado para no romperse, cuando la
pregunta inicial prometía la máquina que insiste hasta romperse. Esa máquina
ya existe en Código: *Loop eterno*, *Infinito recursivo*, *Iteración infinito*,
*Meditación void*. El texto eligió el ejemplo luminoso y dejó el oscuro en el
archivo.

**T5. El frente de archivo está anunciado, no habitado.** Aparece en dos
fragmentos, un nodo y una pregunta. No tiene sección, no tiene corpus, no
tiene relación. Existe como deuda.

**T6. La pregunta 3 ya tiene respuesta en el sitio.** «¿Qué pasa cuando el
archivo se repite a sí mismo?» lo hace `grid-palabras`: un modelo de Markov
que lee `corpus.txt` y genera texto nuevo. Y lo hace la portada: un fragmento
elegido al azar en cada visita, evitando repetir el anterior. La exploración
pregunta lo que el sitio ya ejecuta.

## 5. Frentes no explorados

Cada ficha: pregunta, material que ya existe, referencia pertinente, riesgo.

**F1. Redundancia.** ¿Repetir conserva porque gasta, o gasta porque conserva?
`experimento-shannon`, `corpus.txt`. Shannon 1948: la redundancia es lo que
permite que un mensaje sobreviva al ruido, y se paga con capacidad. Riesgo:
confundir información con sentido. Salida posible: nota breve, no poema.

**F2. El archivo como fuente.** ¿Qué produce un archivo cuando se repite a sí
mismo? `grid-palabras` (Markov), `corpus.txt`, `diccionario.txt`. Borges,
«Pierre Menard»: el mismo texto, otro tiempo, otro sentido. Riesgo: celebrar
la generación automática como si fuera escritura. Salida: experimento con
salida visible y comparación con el original.

**F3. Deprecación.** ¿Qué se conserva cuando se conserva «sin soporte»?
«archivos markdown deprecados», el vestigio «Página que ya no responde»
(DNS_PROBE_FINISHED_NXDOMAIN), «Página doblada en cuatro». Deprecar no es
borrar: es mantener algo que ya no se actualiza. Derrida, *Mal de archivo*
(arkhē, consignación, el soporte decide qué puede decirse). Riesgo: melancolía
tecnológica de manual. Salida: ficha o vestigio, no ensayo.

**F4. Memoria sin archivo.** ¿Qué repite una máquina que no recuerda? Los
rastros del 24-02-2026 (adulación, precisión, «que se te grabe en la Memoria»),
la firma `∴` de Hermes. Un modelo no recupera el pasado: lo regenera. Es la
máquina que olvida, no la que insiste. Riesgo: antropomorfizar el modelo y
exponer una conversación privada. Decisión editorial pendiente.

**F5. Recolección y repetición.** ¿La memoria va hacia atrás y la repetición
hacia adelante? Kierkegaard, *La repetición* (1843): recordar y repetir son el
mismo movimiento en direcciones opuestas. Bergson, *Materia y memoria*: el
cerebro no almacena, selecciona. Riesgo: convertir la exploración en un
seminario. Salida: una nota al margen, una cita, una frase.

**F6. El ritual huérfano.** ¿Se recupera el ritual o se corta la frase? Es la
decisión más pequeña y la más reveladora: el sistema no tiene todavía una
forma de decir «esto se abandonó», solo «abierta».

## 6. Dos memorias del archivo

El historial tiene dos capas y ninguna de las dos conserva el pensamiento.

- **Git**: automático, pero solo lee frontmatter. Título, pregunta, resumen,
  estado, nodos, corpus, relacionadas. No hay cuerpo, no hay prosa, no hay
  diff de texto.
- **Hitos**: curados a mano. Dos entradas.

El acontecimiento más significativo en la vida del archivo —el borrado de la
sección Ritual y su reemplazo por un párrafo que la sobrevive— es invisible en
el historial. Solo se ve «Nodos retirados: Ritual». Si el objetivo es «ver cómo
una idea comenzó y en qué terminó convirtiéndose», la unidad interesante no es
la versión del expediente: es la decisión. Y las decisiones no están en el
archivo.

[interpretación] Hay dos tecnologías de memoria en juego: Git, que olvida lo
que no se commitea, y Rastros, que olvida lo que no se escribe. La exploración
vive entre las dos.

## 7. La cartografía 01

`docs/rizoma/cartografia-repeticion-01.html` (sin commitear) ya resuelve lo
visual mejor de lo que se podría pedir: campo de contornos, lámina de
topógrafo, leyenda que distingue trazo de cercanía, cierre «sin trazo ·
abierto». No es un dashboard.

Lo que decide demasiado pronto: fija cinco territorios, asigna la relación
(«fragmenta») desde el diseño y encierra el mapa en un rectángulo cerrado. La
misma lógica que critica —la representación que clausura— reaparece en su
composición.

Nota de identidad: Rizoma ya es forense, no orgánico. Expediente, folio,
corpus, nodos, evolución. El glifo `⋔` es una horquilla: una bifurcación, no
una red. Eso es un activo, no un defecto.

## 8. Preguntas para el próximo ciclo

1. ¿Se publica la memoria sin archivo (Hermes), con qué límite?
2. ¿El ritual se recupera o se corta? (Y si se corta, ¿el sistema aprende a
   decirlo?)
3. ¿El lenguaje se abre como tercera deriva o se sigue trabajando dentro de las
   dos existentes?

## 9. Registro del ciclo — 2026-11-10

Decisiones tomadas:

- **Archivo se abre como exploración 02**: «Lo que el archivo no conserva»,
  pregunta «¿Qué se pierde cuando algo se guarda?», 8 nodos, 5 piezas de corpus,
  2 hitos.
- **La 01 integra lo que faltaba**: §5 suma las otras máquinas (bucle, recursión,
  hormiga de Langton); §7 abre la redundancia (Shannon) como contra-cara del
  desgaste y cierra tendiendo el puente a la 02; corpus +2 piezas; +1 nodo;
  relacionadas recíprocas; +1 hito.
- **Cuatro nodos nuevos**: Olvido, Soporte, Redundancia, Residuo. Cinco nodos
  quedan compartidos por las dos exploraciones (Repetición, Memoria, Archivo,
  Automatización, Redundancia). Es el primer mapa con aristas reales. Desgaste
  queda solo en la 01: la 02 pierde, no se desgasta, y el nodo no se fuerza.
- **Correcciones mecánicas**: tildes y signos en §1 de la 01, «y» suelta en §2,
  «colección» en el rastro de junio. El resumen de la 01 se alinea con el cuerpo.
- **Protocolo aceptado y lámina 01 construida** (2026-11-10): roles, reglas y los
  tres instrumentos quedan vigentes; la primera lámina vive en
  `docs/rizoma/lamina-01-css.html` y en la versión SVG validable
  `docs/rizoma/lamina-01-svg.html`, todavía no como página.
- **Adaptación de diagram-design** (2026-11-10): se adopta su contrato SVG
  accesible, su grilla de 4 px, `self_check.py` y `export_svg.py`; se rechazan
  sus 45 tipos y sus cajas/radios. El generador es `docs/rizoma/build-lamina.py`.
  Ver `docs/rizoma/nota-diagram-design.md`.

Sigue pendiente:

- El ritual huérfano de la 01 (frase sin corpus y `fields` con `ritual`).
- El historial no lee prosa: solo frontmatter.
- Los nodos siguen siendo una taxonomía con copy de conexión.
- «5 piezas» cuenta la sección Rastros entera como una pieza.
- La voz de la 02 es más pulida que la de la 01: hay que decidir si se deja así
  o se ablanda.

## Referencias por verificar

Deleuze, *Diferencia y repetición* (1968), cap. 2 · Deleuze y Guattari, *Mil
mesetas* (1980), meseta 1 · Kierkegaard, *La repetición* (1843) · Bergson,
*Materia y memoria* (1896) · Derrida, *Mal de archivo* (1995) · Shannon,
*A Mathematical Theory of Communication* (1948) · Langton (1986) · Conway
(1970) · Borges, «Pierre Menard, autor del Quijote» (1939) y «Funes el
memorioso» (1942) · Bush, «As We May Think» (1945) · Assmann,
*Erinnerungsräume* (1999).
