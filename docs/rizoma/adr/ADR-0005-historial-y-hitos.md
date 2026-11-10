---
title: "ADR 0005 — Historial y hitos"
date: 2026-11-10
estado: aceptada
---

# ADR 0005 — Historial y hitos

## Contexto

Una exploración tiene dos memorias que no son la misma:

- **Git**: guarda cada versión del archivo, pero solo el generador lee el
  frontmatter. La prosa queda en el commit, no en la página.
- **Hitos**: una lista curada de decisiones editoriales. No se deduce de los
  commits; se escribe.

El historial público mezcla las dos y no siempre queda claro qué muestra cada
una. Sin una decisión escrita, el lector puede creer que ve la historia de la
prosa cuando en realidad ve metadatos y decisiones.

## Decisión

- El historial tiene **dos capas explícitas**: versiones de Git y hitos
  editoriales. No se presentan como lo mismo.
- **Versiones**: `_plugins/rizoma_history.rb` recorre `git log --follow`, lee el
  frontmatter de cada versión, calcula los cambios (título, pregunta, resumen,
  estado, nodos, corpus, relacionadas) y genera `/rizoma/:name/historial/`.
  Enlaza commit, archivo, texto plano y comparación. No sobrescribe nada.
- **Hitos**: se escriben en el frontmatter de la exploración (`date`, `title`,
  `text`, `commit` opcional). No se autogeneran. Registran la **razón** de una
  decisión, no el diff.
- Un hito se escribe cuando la decisión cambia la lectura: una corrección, un
  anexo nuevo, una sección nueva, un cambio de pregunta o de estado, un
  experimento nuevo. No se escribe por cada commit ni por una errata menor.
- El hito es la memoria editorial; Git es la memoria técnica. Se cruzan por
  fecha y, si existe, por commit; no se reemplazan.
- La página del historial no interpreta prosa. Para leer el cuerpo de una versión
  se abre el archivo en el commit. Un diff de prosa sería otra decisión (ADR
  futuro), no una promesa implícita de esta página.
- El generador asume un clon con historia; el workflow de Pages usa
  `fetch-depth: 0`. En un build sin Git, la página muestra que no hay historial.

## Consecuencias

- El lector ve qué cambió en el expediente y qué decisiones tomó el autor; no ve
  el diff de la prosa, y la página no finge verlo.
- Los hitos exigen disciplina editorial; son pocos y legibles.
- El historial de una exploración nueva queda vacío hasta el primer commit; es
  honesto, no un error.
- Si se quiere la historia de la prosa, hay que abrir otro ADR y decidir cómo se
  muestra (diff por commit, versión lado a lado, o solo enlace al archivo).

## Alternativas

- **Diff de prosa en la página**: rechazado por ahora. Agrega ruido y exige otro
  parser; el enlace al archivo ya permite auditarlo.
- **Hitos automáticos desde los mensajes de commit**: rechazado. Un commit no
  explica la decisión editorial; el hito sí.
- **Un changelog manual separado**: rechazado. Duplicaría Git y se
  desincronizaría.
- **Ocultar el historial**: rechazado. El proyecto quiere conservar la
  transformación, no solo el resultado.

## Referencias

- `_plugins/rizoma_history.rb` — generador.
- `_layouts/rizoma-historial.html` — página.
- `admin/config.yml` — campos de hitos.
- ADR 0001 — anexos de rectificación.
