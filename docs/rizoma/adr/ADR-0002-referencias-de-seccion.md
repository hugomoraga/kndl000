---
title: "ADR 0002 — Referencias de sección"
date: 2026-11-10
estado: aceptada
---

# ADR 0002 — Referencias de sección

## Contexto

La objeción de §8 hablaba de «§6» y «§7» sin enlaces. Para argumentar,
contra-argumentar o expandir una idea, el lector necesita llegar a la sección
exacta, incluso cuando la referencia cruza a otra exploración.

## Decisión

- Cada sección de una exploración tiene un `id` estable derivado de su título,
  no de su número: `#lo-que-queda`, `#redundancia`, `#la-objecion`.
- Las referencias visibles usan `§N` y enlazan al ancla. El número es el que se
  ve; el ancla es el título.
- Una referencia a otra exploración usa `/rizoma/<slug>/#<ancla>`.
- El enlace lleva `aria-label` con el título de la sección; el destino se marca
  con `:target` para que el lector vea dónde aterrizó.
- Si una sección se renumera, el ancla no se rompe; solo cambia el `§N` visible.

## Consecuencias

- Las ideas se pueden citar por sección, no solo por exploración entera.
- Una exploración puede contra-argumentar o expandir una sección concreta de
  otra, con un enlace verificable.
- El `§` da un tono de expediente y evita la prosa «como dijimos antes».
- Las anclas dependen del título: si se cambia el título, hay que actualizar el
  `id` y los enlaces. Es un coste pequeño y visible.

## Alternativas

- **Anclas numéricas** (`#s6`): se rompen al insertar o mover secciones.
- **Sin anclas**: obliga a citar la exploración entera y a buscar a mano.
- **Solo enlaces entre exploraciones**: no permite señalar una sección.

## Ejemplos

- Dentro de una exploración: `§6` → `#lo-que-queda`.
- Entre exploraciones: `/rizoma/que-se-conserva-cuando-algo-se-repite/#redundancia`.
- En un anexo: enlace absoluto a `#la-objecion`.
