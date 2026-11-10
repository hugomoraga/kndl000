---
title: "ADR 0004 — Taxonomía de anexos"
date: 2026-11-10
estado: aceptada
---

# ADR 0004 — Taxonomía de anexos

## Contexto

El ADR 0003 abrió los anexos a cinco tipos, pero sin una taxonomía los tipos se
confunden: una corrección puede parecer una fuente, una objeción puede parecer
un concepto, y el índice pierde sentido. El lector necesita saber por qué un
anexo está en un grupo y no en otro.

## Decisión

Se adopta [`docs/rizoma/taxonomia-anexos.md`](../taxonomia-anexos.md) como
referencia normativa:

- Un anexo declara **un solo tipo primario**, elegido por la operación que hace,
  no por el tema.
- Las operaciones son cinco: corrección, fuente, concepto, objeción, derivación.
- El procedimiento de clasificación es ordenado; los casos de frontera se
  resuelven por la operación dominante o dividiendo el anexo.
- Si no encaja en ninguna, no es un anexo: es nota, rastro, hito o exploración.
- Los estados (`corregido`, `verificado`, `abierta`, `provisional`,
  `reemplazado`) se declaran.
- Un tipo nuevo requiere ADR, actualización de `_data/anexos_tipos.yml`, de la
  taxonomía y del índice.
- El índice público y el margen de la exploración muestran la **pregunta** de
  cada tipo, no una etiqueta temática.

## Consecuencias

- El aparato se vuelve legible: cada grupo responde una pregunta distinta.
- Clasificar exige una decisión; no se puede archivar cualquier cosa como
  «anexo».
- El riesgo de burocracia se limita con cinco operaciones y la regla de que, si
  no hay operación, no hay anexo.
- La taxonomía puede crecer, pero solo por ADR; no por acumulación de etiquetas.

## Alternativas

- **Etiquetas libres**: rechazadas. No permiten navegar ni comparar.
- **Un solo tipo «nota»**: rechazado. Pierde la función de cada pieza.
- **Subtipos dentro de cada tipo**: rechazados por ahora. Agregan profundidad sin
  resolver la ambigüedad principal; el cuerpo puede desarrollar el matiz.

## Referencias

- ADR 0003 — Anexos como aparato.
- `docs/rizoma/taxonomia-anexos.md`.
- `_data/anexos_tipos.yml`.
