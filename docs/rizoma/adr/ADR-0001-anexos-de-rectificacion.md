---
title: "ADR 0001 — Anexos de rectificación"
date: 2026-11-10
estado: aceptada
---

# ADR 0001 — Anexos de rectificación

## Contexto

La exploración 01 corrigió dos afirmaciones factuales —la definición de
redundancia de Shannon y la lectura del ciclo de Langton— y una atribución —el
experimento de Shannon y las cadenas de Markov—. El historial de Git conserva
las versiones, pero no le explica al lector por qué cambió el texto ni con qué
fuente. Una corrección silenciosa borra la historia y no permite verificar.

## Decisión

Toda rectificación de información factual en una exploración se registra en un
**anexo público**, enlazado desde el margen de la exploración.

Cada anexo declara:

1. **Qué decía** la formulación anterior.
2. **Qué se corrigió** y por qué.
3. **Fuentes**: autor, título, año, publicación, URL, fecha de consulta, tipo
   (primaria, secundaria, derivación o código) y **qué se verificó** en cada una.
4. **Qué queda abierto**, si algo queda.

Reglas:

- El cuerpo de la exploración se corrige; el anexo conserva la formulación
  anterior. La historia no se reescribe: se documenta.
- Una fuente que no se pudo consultar completa se declara como tal. No se cita
  de memoria ni se completa un dato que no se verificó.
- Las interpretaciones se separan de los hechos. Una lectura como «orden» no se
  presenta como un resultado del sistema.
- El anexo no es un foro ni una nota privada: es parte de la obra y se publica.

## Consecuencias

- La exploración gana una capa de auditoría: el lector puede ver el error, la
  corrección y la fuente.
- El cuerpo no se vuelve un archivo de erratas: las correcciones viven en los
  anexos, no interrumpen la deriva.
- El coste es real: cada corrección exige verificar, citar y redactar. No toda
  intuición merece un anexo; solo la información factual que se rectifica.
- El historial de Git y los anexos se complementan: Git guarda la versión, el
  anexo explica la decisión.

## Alternativas

- **Corregir en silencio**: rechazada. Borra la historia y no permite auditar.
- **Confiar solo en Git**: insuficiente para el lector; el commit no explica la
  fuente ni el error.
- **Notas privadas**: rechazadas. La verificación tiene que ser pública para
  servir como prueba.

## Anexos

- [Anexo 01 — La redundancia no es lo que sobra](/rizoma/que-se-conserva-cuando-algo-se-repite/anexos/redundancia/)
- [Anexo 02 — La hormiga no se ordenó](/rizoma/que-se-conserva-cuando-algo-se-repite/anexos/langton/)
- [Anexo 03 — Shannon, Markov y el experimento](/rizoma/que-se-conserva-cuando-algo-se-repite/anexos/shannon-markov/)
