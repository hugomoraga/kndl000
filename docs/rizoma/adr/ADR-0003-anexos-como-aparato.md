---
title: "ADR 0003 — Anexos como aparato"
date: 2026-11-10
estado: aceptada
---

# ADR 0003 — Anexos como aparato

## Contexto

Los primeros anexos eran correcciones. El lector ve el texto ya corregido y el
anexo se lee como una errata: sirve para auditar, no para pensar. El aparato de
una exploración también incluye fuentes, conceptos, objeciones y derivaciones
que no caben en la deriva.

## Decisión

- Los anexos se agrupan por **tipo**: corrección, fuente, concepto, objeción y
  derivación.
- El tipo es una **operación**, no una categoría de contenido: corregir,
  documentar, pensar, objetar, derivar.
- La corrección es un tipo entre varios; no define qué es un anexo.
- Cada tipo tiene un estándar:
  - **Corrección**: qué decía, qué se corrigió, fuente y qué queda abierto.
  - **Fuente**: qué dice el documento, qué no dice, cómo se verificó y qué no se
    pudo consultar.
  - **Concepto**: una idea o teoría que se expande; la interpretación se declara
    como tal.
  - **Objeción**: qué tesis resiste, con qué caso o experimento, y por qué no se
    resuelve todavía.
  - **Derivación**: pasos, supuestos y límites.
- El índice `/rizoma/<slug>/anexos/` agrupa los anexos por tipo; el margen de la
  exploración muestra los grupos y enlaza al índice.
- Los grupos vacíos no se muestran. No hay que llenar los cinco tipos: existen
  para cuando hacen falta.

## Consecuencias

- El lector puede entrar al aparato por lo que le interesa: una corrección, una
  fuente, un concepto, una objeción o una derivación.
- El texto principal queda limpio; el aparato no es una pila de erratas.
- El sistema escala sin convertir cada idea en una sección nueva.
- Riesgo: que el aparato se vuelva un depósito. Se mitiga con cinco tipos
  operativos y con la regla de que un anexo debe tener una función, no solo un
  tema.

## Alternativas

- **Solo correcciones**: rechazada. El lector no ve el trabajo abierto.
- **Lista plana**: menos legible; el tipo es la primera señal de qué esperar.
- **Una sección por tipo**: fragmenta la exploración; el aparato es un índice,
  no cinco secciones nuevas.

## Referencias

- `_data/anexos_tipos.yml` — tipos, etiquetas y estándares.
- `/rizoma/que-se-conserva-cuando-algo-se-repite/anexos/` — índice del aparato.
- ADR 0001 — anexos de rectificación. ADR 0002 — referencias de sección.
