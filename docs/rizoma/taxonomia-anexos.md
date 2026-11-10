---
title: "Taxonomía de anexos"
date: 2026-11-10
estado: vigente
---

# Taxonomía de anexos

## Principio

Un anexo es una pieza del **aparato** de una exploración. No es una sección de la
deriva ni una nota suelta: hace una operación sobre el material de la
exploración.

Dos reglas:

1. **Un anexo, un tipo primario.** El tipo se elige por la operación que hace,
   no por el tema que toca. Si un anexo hace dos cosas, se divide o se elige la
   operación dominante y la otra queda en el cuerpo.
2. **Si no hace ninguna de las cinco operaciones, no es un anexo.** Puede ser una
   nota de trabajo, un rastro, un hito o una exploración nueva.

## Las cinco operaciones

### 1. Corrección

**Pregunta:** ¿Qué afirmamos mal y qué lo corrige?

**Hace:** rectifica una afirmación factual de la exploración o de otro anexo.
Cambia el texto o lo debería cambiar.

**Criterios:**
- Hay una formulación anterior identificable.
- La corrección se apoya en una fuente verificable.
- El anexo declara qué decía, qué se corrigió y qué queda abierto.

**No es:** un dossier de fuente que no cambia el texto; una idea nueva; una
objeción que deja la tesis en pie.

**Ejemplos:** la definición de redundancia; «se ordenó» en Langton; la
atribución Shannon/Markov.

### 2. Fuente

**Pregunta:** ¿Qué dice esta fuente, qué no dice y cómo lo verificamos?

**Hace:** examina un documento, un corpus o un conjunto de fuentes. Puede
apoyar, complicar o contradecir una afirmación, pero no cambia el texto por sí
misma.

**Criterios:**
- Cita completa, URL y fecha de consulta.
- Qué se verificó y con qué método.
- Qué no se pudo consultar o qué queda fuera.
- Distingue lo que la fuente dice de lo que se le atribuye.

**No es:** una corrección; una derivación (no produce un resultado nuevo).

**Ejemplos:** un dossier sobre el artículo de Shannon de 1948; una comparación
de ediciones; una fuente que contradice un dato.

### 3. Concepto

**Pregunta:** ¿Qué idea expandimos y cómo se relaciona?

**Hace:** desarrolla una idea, un término o una teoría que necesita más espacio
que el cuerpo. Puede ser provisional.

**Criterios:**
- Define el concepto y su linaje.
- Declara qué es interpretación y qué es cita.
- Dice qué agrega a la exploración y qué deja abierto.

**No es:** una objeción (no resiste la tesis); una derivación (no produce un
resultado formal).

**Ejemplos:** sentido y señal; mesa/plateau; calco y mapa.

### 4. Objeción

**Pregunta:** ¿Qué caso resiste la tesis y por qué no se resuelve?

**Hace:** presenta un caso, un experimento o una lectura que complica o
contradice la tesis. No la corrige: la pone en tensión.

**Criterios:**
- Identifica qué tesis resiste.
- Aporta el caso con evidencia o con un experimento reproducible.
- Explica por qué no se resuelve todavía y qué lo resolvería.

**No es:** una corrección (el texto no cambia); un concepto (hay resistencia).

**Ejemplos:** el autómata de información frente a la redundancia.

### 5. Derivación

**Pregunta:** ¿Qué se sigue de estos supuestos y con qué límites?

**Hace:** produce un resultado formal, matemático o ejecutable a partir de
supuestos explícitos.

**Criterios:**
- Supuestos y pasos visibles.
- Resultado reproducible (cálculo o código).
- Límites y casos donde falla.

**No es:** un concepto (no hay pasos formales); una fuente (no produce un
resultado nuevo).

**Ejemplos:** la fórmula del voto por mayoría; el umbral en p = 0,5.

## Procedimiento de clasificación

En orden:

1. ¿La afirmación anterior era falsa y el texto cambia? → **Corrección**.
2. ¿El anexo examina principalmente una fuente externa? → **Fuente**.
3. ¿El anexo presenta principalmente un caso que resiste la tesis? → **Objeción**.
4. ¿El anexo produce principalmente un resultado formal o ejecutable? → **Derivación**.
5. ¿El anexo expande principalmente una idea o un término? → **Concepto**.
6. Ninguna → no es un anexo.

## Casos de frontera

- **Corrección vs Fuente:** si el texto cambia, es corrección; la fuente va en su
  sección de fuentes. Si lo que importa es examinar la fuente y el texto no
  cambia, es fuente.
- **Concepto vs Objeción:** una idea que expande es concepto; un caso que
  resiste es objeción. Si el concepto solo tiene sentido contra la tesis, es
  objeción.
- **Objeción vs Derivación:** si el resultado formal es el que resiste, la
  objeción es el tipo primario y la derivación va dentro; si el resultado es el
  centro y la tensión es secundaria, es derivación.
- **Fuente vs Derivación:** la fuente examina lo que otro dijo; la derivación
  produce lo que se sigue de los supuestos.
- **Dos operaciones:** dividir en dos anexos o elegir la dominante. No hay tipos
  híbridos.

## Lo que no es un anexo

- Una exploración: tiene pregunta, corpus y deriva propias.
- Un nodo: es una palabra compartida, no un texto.
- Una obra del corpus: es material leído, no aparato.
- Un hito: es una marca pública en el historial.
- Una nota de trabajo: vive en el banco, no en la obra.
- Un rastro: es una línea suelta, no una operación.

## Estados

- `corregido`: la corrección se aplicó.
- `verificado`: la fuente se verificó y no cambia el texto.
- `abierta`: la tensión o la pregunta sigue abierta.
- `provisional`: el concepto o la derivación es un borrador.
- `reemplazado`: otro anexo lo reemplaza; se conserva.

No todos los estados aplican a todos los tipos. La corrección suele estar
`corregido` o `reemplazado`; la objeción, `abierta`; la fuente, `verificado`; el
concepto y la derivación, `provisional` o `abierta`.

## Campos

- `tipo`: obligatorio, uno de los cinco.
- `estado`: obligatorio.
- `order`, `title`, `date`, `exploracion`, `permalink`.
- `fuentes`: obligatorio para corrección, fuente y derivación; opcional para
  concepto y objeción si hay afirmaciones factuales.
- El cuerpo: qué decía, qué se corrigió, por qué, qué queda abierto, según el
  tipo. No hay que copiar la plantilla de corrección a los otros tipos.

## Extensión

Un tipo nuevo requiere:

1. Un ADR que justifique la operación.
2. Actualizar `_data/anexos_tipos.yml`.
3. Actualizar este documento.
4. Actualizar el índice del aparato.

No se inventan tipos en el frontmatter. Si un anexo no encaja, primero se
pregunta si no es otra cosa: nota, rastro, hito o exploración.
