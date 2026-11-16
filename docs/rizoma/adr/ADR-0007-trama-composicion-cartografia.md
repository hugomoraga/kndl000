---
title: "ADR 0007 — Trama, composición y cartografía (piloto B3.1.1)"
date: 2026-11-15
estado: aceptada para piloto · no normativa fuera del piloto
---

# ADR 0007 — Trama, composición y cartografía

## Contexto

Rizoma creció con un modelo hub-and-spoke: la exploración es el contenedor de
corpus, nodos, anexos, hitos y relaciones. Ese modelo funciona para dos
exploraciones, pero no representa bien una investigación que atraviesa varias
obras ni distingue investigación, escritura y publicación.

Las iteraciones B, B2 y B3.1.1 separaron tres regímenes:

- **Trama**: archivo abierto de investigación, con materiales, frentes,
  inscripciones, nodos y cortes. No es un grafo que deba completarse.
- **Composición**: obra editorial autónoma que selecciona y ordena parte de la
  trama. Puede existir sin trama.
- **Cartografía**: lectura posterior, fechada y revisable de la trama. La IA
  propone; el autor valida.

La escritura no exige clasificar ni cartografiar. La publicación es una
decisión editorial, no una consecuencia automática de la investigación.

## Decisión

1. Se adopta una ontología mínima de seis entidades: **Material, Frente,
   Inscripción, Nodo, Corte y Composición**.
2. Una **inscripción** es el uso situado de un material respecto de un frente.
   Tiene exactamente un material, exactamente un frente, una interpretación
   compatible y evidencia rastreable. No tiene funciones permanentes ni
   apariciones duplicadas.
3. Un **frente** es una línea de indagación con identidad estable (`id`) y
   formulaciones sucesivas. Puede atravesar varias composiciones y cambiar de
   nombre editorial sin perder identidad.
4. Un **nodo** es una diferencia o tensión emergente entre inscripciones. No
   se promueve por frecuencia: requiere una diferencia escrita y al menos dos
   apariciones.
5. Un **corte** conserva la memoria de una transformación o abandono: qué se
   cortó, por qué y qué sobrevivió. El motivo puede quedar como `desconocido`.
6. La **composición** es la fuente única de verdad de la selección, el orden,
   la etiqueta contextual y el ancla. La inscripción es la fuente única de
   verdad del material, el frente, la interpretación y la evidencia.
7. Las **apariciones** se derivan consultando las composiciones; no se guardan
   en la inscripción.
8. La **evidencia** distingue `existencia`, `relacion`, `interpretacion`,
   `inferencia` y `hipotesis`. La presencia de un material en el corpus no
   prueba su relación con un frente.
9. La **trama de trabajo** vive separada del contenido público. `output: false`
   no significa privado. Si se necesita privacidad real, se usará un repo
   privado o un directorio local-only; el piloto no decide esa infraestructura.
10. La **cartografía** conserva revisiones significativas y rechazos valiosos,
    no todas las ejecuciones de IA. Git es el historial. En la interfaz pública
    la vista se llama **Trayectoria**; el artefacto de investigación sigue
    llamándose cartografía.

## Piloto

Se implementa una rebanada mínima:

- composiciones 01 y 02;
- un frente transversal: `redundancia-memoria`;
- cuatro inscripciones: Shannon, voto por mayoría, autómata y Medusa;
- una cartografía revisada;
- una vista de trayectoria no indexada; la exploración solo enlaza a ella;
- sin nodos ni cortes obligatorios, sin páginas globales, sin migración.

La trama vive en `docs/rizoma/trama/`; las composiciones en
`_data/composiciones/`; las cartografías en `docs/rizoma/cartografias/`. Un
plugin de Jekyll resuelve la trama y adjunta `page.trayectoria`; la exploración
enlaza a la trayectoria desde el aparato. La trama no se copia a `_site`.

## Consecuencias

- La exploración deja de ser el contenedor propietario de la investigación.
- La composición conserva su voz y puede publicarse sin trama.
- Un frente puede atravesar varias composiciones con un `id` estable.
- La trayectoria muestra el “por qué” de los materiales sin convertir la escritura
  en un formulario; la exploración queda limpia.
- El modelo es más complejo que el hub anterior; el piloto debe demostrar que
  el valor intelectual compensa la complejidad.
- Si el piloto falla, se vuelve a B sin migrar el contenido.
- Quedan abiertas la ubicación definitiva de la trama, la publicación de
  páginas globales, la privacidad real y la migración de nodos y `fields`.

## Referencias

- `specs/015-rizoma-piloto-b3/spec.md`
- `docs/rizoma/trama/piloto-redundancia-memoria.yml`
- `_data/composiciones/`
- `docs/rizoma/cartografias/2026-11-15-piloto.yml`
- `_plugins/rizoma_trayectoria.rb`
- `_layouts/cartografia.html`
- `_plugins/rizoma_cartografia.rb`
