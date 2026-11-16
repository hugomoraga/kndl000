---
title: "Evaluación del piloto B3.1.1"
date: 2026-11-15
estado: evaluación estructural · validación editorial pendiente · no publicable
---

# Evaluación del piloto B3.1.1

> **Actualización 2026-11-15.** Después de esta evaluación, la exploración 02 se reorganizó editorialmente y se abrió la sección §7 Adherir. El piloto estructural sigue siendo válido; las referencias al “cuerpo sin cambios” corresponden a la versión evaluada antes de esa reescritura.

## Alcance

Se probó una rebanada mínima de B3.1.1:

- composiciones 01 y 02;
- un frente transversal: `redundancia-memoria`;
- cuatro inscripciones: Shannon, voto por mayoría, autómata y Medusa;
- una cartografía revisada;
- una margen “Trayectoria” por exploración;
- una vista de cartografía no indexada;
- sin nodos ni cortes obligatorios;
- sin cambios al cuerpo de las exploraciones;
- sin migración de contenido.

## Qué se probó

1. Que un frente pueda atravesar dos composiciones con el mismo `id`.
2. Que una inscripción pueda ser seleccionada por dos composiciones sin duplicarse.
3. Que la composición sea la fuente de verdad de la selección, el orden, la etiqueta y el ancla.
4. Que la inscripción sea la fuente de verdad del material, el frente, la interpretación y la evidencia.
5. Que la evidencia distinga existencia, relación, interpretación e inferencia.
6. Que la margen no convierta la escritura en clasificación.
7. Que no haya grafo, dashboard ni páginas globales de frentes o nodos.
8. Que la trama no se copie a `_site`.

## Resultados estructurales

| Criterio | Resultado | Evidencia |
|---|---|---|
| Identidad del frente | **Pasa** | `redundancia-memoria` tiene tres formulaciones, dos etiquetas editoriales y un solo `id` |
| Continuidad entre composiciones | **Pasa** | Shannon es la misma inscripción en 01 y 02; “También en” enlaza al ancla de la otra composición |
| Fuente única de apariciones | **Pasa** | La inscripción no tiene `apariciones`; las composiciones seleccionan y anclan |
| Trazabilidad | **Pasa** | Las cuatro inscripciones tienen evidencia; la margen distingue `existencia`, `relacion`, `interpretacion`, `inferencia` |
| Relaciones explícitas | **Pasa** | Shannon y voto en el cuerpo; autómata en el aparato; Medusa en el aparato y, desde la reorganización, en 02 §7 |
| No inventar relaciones | **Pasa** | No se agregó ninguna relación nueva; Medusa se marca como inferencia en el frente transversal |
| Rechazo conservado | **Pasa estructuralmente** | `medusa-lente` queda en `rechazadas` con motivo |
| Autonomía editorial | **Pasa en el piloto original** | El cuerpo de 01 y 02 no cambió durante el piloto; luego 02 se reescribió por decisión editorial |
| Lectura | **Pasa en escritorio y móvil** | La Trayectoria aparece después de la lámina y antes del Aparato |
| No grafo / no dashboard | **Pasa** | No hay páginas globales de frentes o nodos; la cartografía es una lista |
| La trama no se publica completa | **Pasa** | `_site` no contiene `docs/`; solo se renderiza la margen y la cartografía seleccionada |

## Resultados editoriales pendientes

El piloto todavía no prueba la parte más importante: **la validación del autor**.

- La trama y la cartografía fueron escritas por el colaborador.
- El autor no revisó todavía si las funciones `lente` / `contraste` son correctas.
- El autor no ejerció el rechazo en una sesión real.
- No se midió si la margen ayuda a entender el “por qué” de los materiales.
- No se probó la generación de cartografía por IA sobre material no preparado.
- No se probó la edición multiarchivo desde el taller.
- No se probaron nodos, cortes, páginas globales, lámina ni privacidad.

## Relaciones explícitas e inferidas

| Inscripción | Relación con el frente | Interpretación | Límite |
|---|---|---|---|
| Shannon | Explícita en 01 §7 y 02 §6; también en anexos | `lente` + `contraste` es una lectura validada | La etiqueta de función no está escrita en el cuerpo |
| Voto por mayoría | Explícita en 01 §7 y anexo redundancia | `contraste` es una lectura de una demostración | El cuerpo lo describe como código, no como argumento |
| Autómata | Explícita en el anexo automata; **no** en el cuerpo ni en el corpus | `contraste` / `objeción` está en el aparato | El cuerpo de 01 no lo nombra |
| Medusa | Explícita en el anexo medusa; desde la reorganización, también en **02 §7** | `contraste` es explícito como objeción | La inscripción en el frente transversal sigue siendo una inferencia: 01 §8 → 02 §6/§7 + objeción de Medusa |

## Riesgos observados

1. **Sesgo de autoría.** La trama la escribió el colaborador; el piloto no prueba que el autor la mantenga.
2. **Evidencia de aparato.** El autómata sigue siendo explícito solo en el aparato; Medusa pasó al cuerpo en §7. La margen lo dice, pero un lector rápido puede sobreleer.
3. **Densidad de la margen.** La evidencia y las formulaciones están colapsadas; el lector ve motivo y efecto, pero debe abrir para auditar.
4. **Vista de cartografía pública.** La página es `noindex` y no está en el sitemap, pero el repo es público; no es privacidad real.
5. **Fricción no medida.** El piloto no prueba cuánto cuesta escribir o validar la trama.
6. **Nodos y cortes fuera.** La ontología los conserva, pero el piloto no los ejercita.

## Criterios B3.1.1

| Criterio | Estado |
|---|---|
| Un frente atraviesa dos composiciones con identidad estable | Probado |
| La inscripción no duplica apariciones | Probado |
| La evidencia es trazable y clasificada | Probado |
| La composición es autónoma | Probado |
| La escritura no exige clasificación | Probado en el cuerpo; no probado en autoría |
| El autor puede rechazar sin penalización | Probado estructuralmente; no ejercido |
| La cartografía no impone coherencia | Probado con una inferencia marcada; falta sesión de autor |
| El sistema no se vuelve grafo | Probado |
| El costo editorial se justifica | **Pendiente** |
| B3.1.1 se justifica frente a B | **Pendiente** |

## Decisión provisional

El piloto pasa la prueba **estructural**: el frente compartido, la fuente única de apariciones, la evidencia clasificada y la margen funcionan sin tocar el cuerpo ni crear un grafo.

No pasa todavía la prueba **editorial**: falta que el autor valide la cartografía, ejerza un rechazo y decida si la margen le sirve para leer o si solo agrega trabajo.

Por eso:

- **No declarar B3.1.1 validada todavía.**
- **No migrar contenido.**
- **No implementar el taller completo.**
- Mantener B como alternativa válida si la validación editorial falla.

## Checklist para el autor

1. Abrir la cartografía y leer las cuatro inscripciones aceptadas.
2. Confirmar o corregir la función de cada una.
3. Decidir si `medusa-lente` sigue rechazada.
4. Leer las márgenes de 01 y 02 y decidir si el frente se siente como la misma línea.
5. Decidir si la margen ayuda a entender por qué están esos materiales.
6. Decidir si mantendría esta trama después del piloto.
7. Decidir si B3.1.1 se queda o si B era suficiente.

## Próximo paso

Sesión corta de validación editorial. Después:

- si el autor acepta la trama y la margen, actualizar ADR/spec y pasar a especificación técnica del taller;
- si el autor la rechaza o no la mantiene, documentar el resultado negativo y volver a B.
