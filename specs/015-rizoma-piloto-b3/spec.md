# Feature Specification: Piloto Rizoma B3.1.1

**Feature Branch**: `015-rizoma-piloto-b3`
**Created**: 2026-11-15
**Status**: Implemented (piloto)
**Input**: Decisiones B3.1.1: trama de trabajo separada, composición editorial autónoma, cartografía posterior y legible. El piloto comprueba si un frente puede atravesar dos composiciones sin convertir la escritura en clasificación.

## Contexto

B3.1.1 consolidó una ontología mínima de seis entidades: Material, Frente, Inscripción, Nodo, Corte y Composición. La trama es un archivo abierto de investigación; la composición es una obra editorial autónoma que selecciona parte de la trama. La cartografía es una lectura posterior, fechada y revisable. La escritura no exige clasificar materiales.

Este piloto implementa una rebanada mínima:

- dos composiciones: 01 y 02;
- un frente transversal: `redundancia-memoria`;
- cuatro inscripciones: Shannon, voto por mayoría, autómata y Medusa;
- una cartografía revisada;
- sin nodos ni cortes obligatorios;
- sin cambios al cuerpo de las exploraciones;
- sin migración de contenido.

## Decisiones de implementación

- La trama de trabajo vive en `docs/rizoma/trama/` (excluida de Jekyll).
- Las composiciones viven en `_data/composiciones/` y se leen en build.
- La cartografía revisada vive en `docs/rizoma/cartografias/`.
- Un plugin de Jekyll (`_plugins/rizoma_trayectoria.rb`) resuelve la trama y las composiciones, y adjunta `page.trayectoria` a cada exploración.
- La única superficie pública nueva en las exploraciones es una margen read-only. No hay páginas globales de frentes o nodos.
- La cartografía revisada se publica como vista de trabajo no indexada en `/rizoma/cartografia/<id>/`, solo si `publicar: true`.
- La composición no reescribe la interpretación de una inscripción. Si otra interpretación fuera necesaria, se crearía otra inscripción.
- Las apariciones se derivan de las composiciones; no se guardan en la inscripción.
- La evidencia tiene `modo` y, cuando corresponde, `nivel`.

## No objetivos

- Implementar el taller completo o sus operaciones.
- Migrar nodos, `fields` o `corpus_secciones`.
- Crear páginas globales de frentes/nodos.
- Modificar la lámina.
- Publicar desde una trama privada.
- Agregar búsqueda.
- Introducir nuevas entidades fundamentales.
- Convertir la trama en grafo o dashboard.

## Modelo de datos del piloto

### Trama

`docs/rizoma/trama/piloto-redundancia-memoria.yml`

Contiene:

- `frentes`: id, nombre canónico, estado, formulaciones, tensiones.
- `inscripciones`: id, material, frente, interpretación (`principal`, `compatibles`, `motivo`, `efecto`), evidencia (`modo`, `nivel`, `fuente`, `cita`, `nota`), estado y procedencia.

### Composición

`_data/composiciones/<slug>.yml`

Contiene:

- `id`, `exploracion`;
- `frentes`: selección con `id`, `etiqueta`, `ancla`, `orden`;
- `inscripciones`: selección con `id`, `etiqueta`, `ancla`, `orden`.

La composición es la fuente única de verdad de la selección, el orden, la etiqueta y el ancla. La inscripción es la fuente única de verdad del material, el frente, la interpretación y la evidencia.

### Cartografía

`docs/rizoma/cartografias/<fecha>-<slug>.yml`

Contiene: alcance, evidencia, decisión, aceptadas, rechazadas, pendientes y notas. No es una entidad de la trama; es un artefacto editorial.

## Comportamiento esperado

1. Al construir el sitio, el plugin lee la trama y las composiciones.
2. Para cada composición, resuelve la exploración por path o slug.
3. Adjunta `page.trayectoria` con los frentes seleccionados y sus inscripciones.
4. Resuelve el material a título, tipo y URL a partir de las colecciones existentes.
5. Deriva las apariciones de cada inscripción consultando todas las composiciones.
6. La página de exploración incluye la margen si `page.trayectoria` existe.
7. La margen muestra el frente, sus formulaciones, sus inscripciones, la interpretación, la evidencia y “también en” cuando la inscripción aparece en otra composición.
8. Si la trama o una referencia son inválidas, el build falla con un mensaje claro. Si no hay composiciones, no se renderiza nada.
9. El cuerpo de la exploración no cambia.
10. No se generan páginas globales ni se expone la trama completa.

## Criterios de aceptación

- **AC-01**: `bundle exec jekyll build` pasa con la trama y las composiciones del piloto.
- **AC-02**: `/rizoma/que-se-conserva-cuando-algo-se-repite/` muestra una margen “Trayectoria” con el frente `redundancia-memoria` y las inscripciones Shannon, voto y autómata.
- **AC-03**: `/rizoma/archivo/` muestra el mismo frente y las inscripciones Shannon y Medusa.
- **AC-04**: Shannon aparece en ambas composiciones con etiquetas contextuales distintas y sin duplicar la inscripción.
- **AC-05**: La margen muestra la evidencia de cada inscripción y distingue `existencia`, `relacion`, `interpretacion`, `inferencia`.
- **AC-06**: La margen indica “también en” para Shannon en ambas composiciones.
- **AC-07**: No se crean páginas para frentes o nodos.
- **AC-07b**: La cartografía revisada se renderiza en `/rizoma/cartografia/2026-11-15-piloto/` con `noindex` y sin entrada en el sitemap.
- **AC-07c**: La margen de cada exploración enlaza a la cartografía revisada.
- **AC-08**: Las exploraciones 01 y 02 conservan su cuerpo y sus URLs.
- **AC-09**: `node scripts/check-links.mjs` pasa.
- **AC-10**: La trama no se copia a `_site`.

## Validación

```bash
bundle exec jekyll build
node scripts/check-links.mjs
```

El plugin falla si:

- una composición referencia un frente o una inscripción inexistente;
- una inscripción no tiene exactamente un material y un frente;
- una inscripción seleccionada no pertenece al frente seleccionado;
- una inscripción no tiene evidencia;
- una composición no resuelve su exploración.

## Fuera de alcance

Nodos, cortes, páginas globales, lámina, búsqueda, taller, privacidad real, migración de nodos y `fields`, y cualquier cambio al cuerpo de las exploraciones.
