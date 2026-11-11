---
layout: exploracion
title: "¿Qué se conserva cuando algo se repite?"
question: "¿La repetición conserva algo o solo lo gasta?"
summary: "Una deriva por la persistencia, el desgaste, la recurrencia y la redundancia."
order: "01"
status: abierta
date: 2026-11-09
updated: 2026-11-10
lamina: true
fields:
  - memoria
  - lenguaje
  - código
  - ritual
  - sonido
  - Programación
nodos:
  - Repetición
  - Persistencia
  - Memoria
  - Desgaste
  - Archivo
  - Recurrencia
  - Automatización
  - Diferencia
  - Redundancia
corpus:
  - url: /poemas/persistencias-del-algo/
    note: La palabra que insiste para no desaparecer. Encuentra una obsesión y luego repite.
  - url: /poemas/cae/
    note: Entra y desciende para poder ser consumido y desde adentro volver.
  - url: /codigo/espiral-fibonacci/
    note: Relación de recurrencia en la que cada término resulta de la suma de los dos anteriores. Una repetición que acumula, transforma y se expande.
  - url: /fragmentos/
    note: ¿Las palabras se gastan?
  - url: /dispositivos/espiral/
    note: La máquina que repite para producir diferencia.
  - url: /codigo/experimento-shannon/
    note: "Las aproximaciones al lenguaje de Shannon, con cadenas de Markov de orden creciente."
  - url: /codigo/voto-por-mayoria/
    note: "Tres copias, un voto: la redundancia que corrige y su umbral."
  - url: /codigo/hormiga-langton/
    note: "Dos reglas que van del caos a un ciclo de 104 pasos: la repetición que se vuelve periódica."
# Corpus que corresponde a cada sección (ancla del h2).
corpus_secciones:
  - seccion: persistir
    piezas:
      - /poemas/persistencias-del-algo/
      - /poemas/cae/
  - seccion: gastar
    piezas:
      - /fragmentos/
  - seccion: volver
    piezas:
      - /codigo/espiral-fibonacci/
  - seccion: la-maquina
    piezas:
      - /dispositivos/espiral/
      - /codigo/hormiga-langton/
  - seccion: redundancia
    piezas:
      - /codigo/experimento-shannon/
      - /codigo/voto-por-mayoria/
relacionadas:
  - /rizoma/archivo/
anexos:
  - url: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/redundancia/
    title: "La redundancia no es lo que sobra"
    note: "Corrección de la definición de Shannon."
    tipo: correccion
  - url: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/langton/
    title: "La hormiga no se ordenó"
    note: "Comportamiento periódico e interpretación."
    tipo: correccion
  - url: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/shannon-markov/
    title: "Shannon, Markov y el experimento"
    note: "Atribución correcta del método."
    tipo: correccion
  - url: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/automata/
    title: "El autómata no es redundancia"
    note: "Una objeción al atajo repetición = redundancia."
    tipo: objecion
hitos:
  - date: 2026-11-09
    title: "La pregunta inicial"
    text: "La exploración comienza con una pregunta sobre la repetición."
  - date: 2026-11-10
    title: "Migración a Rizoma"
    text: "La exploración se integra al mapa abierto; se suman nodos, historial y relaciones."
  - date: 2026-11-10
    title: "Redundancia y archivo"
    text: "Se integra la redundancia como contra-cara del desgaste y la deriva se enlaza con Archivo."
  - date: 2026-11-10
    title: "Precisión y objeción"
    text: "Se corrige la definición de redundancia, se separa el comportamiento de Langton de su lectura y se abre la objeción entre contenido y diferencia. Las correcciones quedan como anexos con fuentes."
  - date: 2026-11-10
    title: "Un código de repetición"
    text: "Se suma un experimento de redundancia con voto por mayoría y se enlaza desde §7."
  - date: 2026-11-10
    title: "El aparato se abre"
    text: "Los anexos se agrupan por tipo y se suma una objeción abierta sobre el autómata."
---

No es una tesis. Es una deriva.

## 1. La pregunta {#la-pregunta}

Repetir parece lo contrario de crear. La repetición se asocia con el hábito, con el error, con la máquina que insiste hasta romperse. Pero también es un gesto antiguo, antes de los archivos. De la escritura y el mismo lenguaje. 
¿Cómo conservábamos el conocimiento?

El cuerpo conserva procedimientos mediante la reiteración. La repetición permitía transmitir prácticas y mantener una continuidad colectiva. Luego vinieron los registros y símbolos. Y ahora estamos acá derivando sobre por qué seguimos repitiendo. ¿Es acaso una forma de persistir? y si ahondamos más. ¿Qué conservamos de cada repetición?

## 2. Persistir {#persistir}

En [Persistir en el algo](/poemas/persistencias-del-algo/) la palabra aparece dos veces para no desaparecer: _persistir_ y _algo_. El poema no repite por falta de lenguaje; repite porque el lenguaje, solo, no alcanza. La segunda parte, [∞](/poemas/cae/), lleva esa insistencia al descenso: el mismo centro, el mismo vacío, otra caída.

Leídas juntas, las dos partes no cuentan una historia. Se corrigen. La primera busca un significado; la segunda comprueba que buscarlo también es una forma de caer.

Y repetir el ciclo es parte del proceso de persistir.

## 3. Gastar {#gastar}

En [Rastros](/fragmentos/) hay una frase que vuelve: _el alfabeto se gasta al repetirlo. Las palabras también._ No es una metáfora del cansancio. Es una advertencia sobre el archivo: cada vez que una palabra se usa para nombrar algo, pierde una parte de su capacidad de nombrar otra cosa.

La repetición conserva una forma y gasta una potencia. El poema puede volver a leerse; la palabra que lo sostiene ya no es exactamente la misma. 

## 4. Volver {#volver}

En [Espiral de Fibonacci](/codigo/espiral-fibonacci/) la repetición es una operación. Cada término se obtiene de los dos anteriores; el sistema no vuelve al punto de partida, vuelve a una escala distinta. La recursión no cierra: desplaza.

La espiral es una forma de repetición que no puede ser idéntica. Si lo fuera, no habría crecimiento. La diferencia no está fuera de la repetición; está en su manera de repetir.

## 5. La máquina {#la-maquina}

[Espiral](/dispositivos/espiral/) hace lo mismo con el sonido. Repite una secuencia, una escala, una automatización; pero cada vuelta produce una diferencia. La máquina no imita la repetición humana: la vuelve visible. Nos muestra que repetir es una forma de componer.

En Código hay otras máquinas: un bucle que no termina, una recursión que desborda la pila, una iteración que pregunta cuántas veces querés existir. Esas no producen diferencia: insisten.

Y hay una que empieza en cualquier parte y termina en un ciclo. La [hormiga de Langton](/codigo/hormiga-langton/) sigue dos reglas, pinta el tablero y, después de miles de pasos, entra en un ciclo de 104 pasos que ya no abandona. No creció: se volvió periódico. Que eso sea orden es una lectura nuestra, no un resultado del sistema.

La máquina no es una sola.

## 6. Lo que queda {#lo-que-queda}

La repetición no conserva el contenido. Conserva la diferencia entre una vuelta y la siguiente. Lo que llamamos memoria no es el archivo intacto: es la serie de transformaciones que el archivo sufrió al volver a ser leído.

Por eso una serie de poemas no es la suma de sus partes. Es la conversación entre ellas. Por eso un ritual no es una costumbre: es una máquina de producir presente. Por eso un código que se llama a sí mismo no es un bucle: es una espiral.

## 7. Redundancia {#redundancia}

La repetición gasta, pero también sostiene. Un mensaje dicho una sola vez se pierde en el ruido; uno que se repite llega. Shannon llamó redundancia a la diferencia entre la entropía máxima de una fuente y su entropía real: la parte del mensaje que está determinada por su estructura. No es un resto: es lo que permite detectar o corregir errores y resistir el ruido.

Repetir, entonces, no solo consume potencia: también corrige. Y lo que se conservó no fue lo más valioso, sino lo que se repitió lo suficiente para llegar hasta acá. Una copia, una cita, una lista, un índice: formas de redundancia.

En Código hay una versión mínima de esa corrección: un [código de repetición](/codigo/voto-por-mayoria/) que triplica cada bit, vota por mayoría y mide cuánto se corrige. También muestra el límite: si el canal es peor que el azar, la repetición amplifica el error.

Pero la redundancia tiene un costo. Ocupa lugar, vuelve previsible el mensaje, gasta la atención de quien lo recibe. Lo que se repite demasiado se vuelve paisaje: se deja de oír. Ahí vuelve la frase de Rastros, ya no como advertencia sino como descripción: el alfabeto se gasta al repetirlo.

La diferencia no está, entonces, entre conservar y gastar. Está entre dos maneras de gastar: la que pierde el mensaje y la que lo sostiene.

## 8. La objeción {#la-objecion}

<a class="seccion-ref" href="#lo-que-queda" aria-label="Sección 6: Lo que queda" title="Sección 6: Lo que queda">§6</a> dijo que la repetición no conserva el contenido. <a class="seccion-ref" href="#redundancia" aria-label="Sección 7: Redundancia" title="Sección 7: Redundancia">§7</a> mostró que a veces sí: la redundancia conserva lo suficiente para que un mensaje llegue.

No es una contradicción que se resuelva. Es una distinción que falta. <a class="seccion-ref" href="#lo-que-queda" aria-label="Sección 6: Lo que queda" title="Sección 6: Lo que queda">§6</a> hablaba del contenido como sentido; <a class="seccion-ref" href="#redundancia" aria-label="Sección 7: Redundancia" title="Sección 7: Redundancia">§7</a>, del contenido como señal. Conservar el sentido no es lo mismo que conservar la señal. La repetición puede conservar una y gastar la otra; puede conservar la señal y no el sentido, o el sentido y no la señal.

La pregunta no es si la repetición conserva. Es qué conserva, para quién y a costa de qué.

¿Cuánta redundancia necesita una memoria para no desaparecer? De eso se ocupa la segunda deriva: [Lo que el archivo no conserva](/rizoma/archivo/).

## 9. Preguntas abiertas {#preguntas-abiertas}

- ¿Qué se pierde cuando una obra se convierte en corpus de otra?
- ¿La repetición conserva la memoria o solo su forma?
- ¿Qué pasa cuando el archivo se repite a sí mismo?
- ¿Puede una máquina repetir sin gastar?
- ¿Qué diferencia hay entre insistir y persistir?
- ¿Conservar el sentido y conservar la señal son la misma cosa?

No tengo respuestas. Tengo una serie de vueltas. Por ahora, eso alcanza.
