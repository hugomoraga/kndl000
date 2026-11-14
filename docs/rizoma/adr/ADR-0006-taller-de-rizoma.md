---
title: "ADR 0006 — Taller de Rizoma"
date: 2026-11-14
estado: aceptada
---

# ADR 0006 — Taller de Rizoma

## Contexto

Rizoma tiene tres superficies que hoy viven separadas:

- **Banco**: notas, ciclos, protocolos y ADR en `docs/rizoma/`.
- **Obra**: exploraciones y nodos en `content/collections/`, anexos en
  `rizoma/<exploración>/anexos/`.
- **Instrumentos**: láminas, historial y scripts en `docs/rizoma/` y
  `_plugins/`.

El CMS actual (`/admin/`, Sveltia) administra colecciones públicas con un PAT de
GitHub. No modela el proceso: no lee el banco, no adjunta documentos de trabajo,
no vincula notas con un motivo, no valida el protocolo y no permite iterar con
IA. El autor pidió un backoffice minimalista, basado en git, que permita
publicar, adjuntar documentos, unir ideas e iterar con IA, y que pueda crecer
con la sección.

La restricción del proyecto es fuerte: sitio estático en GitHub Pages, sin
backend, con git como único archivo. El protocolo prohíbe además el grafo, el
dashboard y el calco: la conexión se hace, no se declara de una vez.

Decisiones tomadas el 2026-11-14:

- Local-first: el taller corre en la máquina del autor sobre el working tree.
- IA en fase 2, desde el navegador contra una API, con clave en
  `sessionStorage`.
- v1 sin IA: banco, edición con diff, adjuntos, vínculos y publicación con
  validaciones y commit.
- Spec 014 y este ADR antes de escribir código.

## Decisión

1. **El taller es local-first y opera sobre el working tree.** Vive en
   `taller/`, se sirve desde un server Node sin dependencias pesadas en
   `127.0.0.1` y no se despliega. No hay backend, base de datos ni estado fuera
   de git. El repo no se modifica por una API remota: se modifica en disco y se
   commitea con git.

2. **El taller no es un CMS ni un modelo paralelo.** Lee y escribe los mismos
   archivos que Jekyll ya usa. Las notas nuevas van a `docs/rizoma/banco/`; los
   adjuntos de trabajo a `docs/rizoma/adjuntos/`; las iteraciones de IA (fase 2)
   a `docs/rizoma/iteraciones/`. Las exploraciones, nodos y anexos siguen en sus
   carpetas actuales.

3. **La unidad de trabajo es el plan de cambios.** Toda operación construye un
   plan con paths, contenido, diff, validaciones y chequeos; se aplica solo si
   es válido. El commit incluye solo esos paths. No hay `git add -A` ni
   escrituras silenciosas. El diff es la interfaz.

4. **Publicar es promover, no guardar.** Una nota se promueve a exploración,
   nodo, anexo o hito con las reglas del protocolo como validaciones: pregunta
   abierta, nodo en dos cuerpos, tipo y fuentes del anexo, hito cuando la
   lectura cambia. Los overrides piden motivo y quedan en el mensaje de commit.

5. **Los vínculos son salientes y con motivo.** Cada nota declara sus vínculos
   en el frontmatter; los backlinks se calculan al leer. No hay archivo central
   de relaciones ni grafo persistido. Un vínculo de trabajo no publica una
   relación: eso es una promoción explícita.

6. **La IA propone; el autor decide.** En fase 2, la iteración se llama desde el
   navegador con una clave en `sessionStorage`, se guarda append-only y nunca
   publica, commitea ni pushea sola. Aplicar una iteración solo cambia la nota
   de trabajo; la voz se promueve con el flujo normal.

7. **La UI es listas, texto y márgenes.** No hay grafo, kanban, dashboard ni
   métricas. El estado se lee en las notas. La estética puede reusar los tokens
   del sitio, pero la herramienta es utilitaria y keyboard-first.

8. **`/admin/` sigue existiendo.** El taller es solo para Rizoma; el CMS
   genérico sigue administrando poemas, imágenes, diario y el resto de las
   colecciones.

9. **Se reusan los instrumentos existentes.** El taller llama a
   `scripts/nueva-exploracion.mjs`, corre `bundle exec jekyll build`,
   `node scripts/check-links.mjs` y `build-lamina.py --verify`, y deja que
   `_plugins/rizoma_history.rb` genere el historial desde git.

## Consecuencias

- El taller solo existe en la máquina del autor en v1. No se puede publicar
  desde el teléfono ni desde otra computadora; para eso haría falta otro ADR
  (driver GitHub + PAT) y una spec aparte.
- Requiere Node, git, Ruby/Jekyll y Python + PyYAML instalados. Las operaciones
  que dependen de ellos fallan con un mensaje accionable, no en silencio.
- La traza es fuerte: cada cambio tiene diff, validaciones y commit. No hay
  changelog paralelo; el historial público sigue saliendo de git.
- El round-trip de YAML puede reformatear el frontmatter. Se acepta un diff
  mínimo y se exige preservar claves desconocidas, orden y comentarios; el
  cuerpo no se toca.
- La clave de IA en `sessionStorage` es un riesgo aceptado y acotado a la fase
  2. La página no carga scripts de terceros y la clave se borra al cerrar
  sesión. El proveedor concreto queda abierto.
- Aparece la convención `docs/rizoma/banco/` para notas nuevas. Las notas
  existentes se indexan donde están; no se migran en v1.
- `taller/` debe excluirse del build de Jekyll para no publicar la herramienta.
- El taller agrega una dependencia YAML y tests con `node --test`; no agrega
  framework, bundler ni tests de navegador.
- La sección puede crecer por registro: un tipo o una operación nueva no debería
  tocar el router ni el núcleo de la UI.

## Alternativas

- **Extender Sveltia (`/admin/`)**: rechazado. Sveltia administra archivos, pero
  no modela el banco, el diff previo, los adjuntos de trabajo, los vínculos con
  motivo ni las validaciones del protocolo. Forzarlo sería un CMS con campos
  nuevos, no un taller.
- **Desplegar primero una SPA con PAT + GitHub API**: rechazado para v1. Se
  puede usar desde cualquier lado, pero no corre el build local, no tiene
  commits atómicos simples, el preview no es Jekyll y la IA queda con la clave
  en el navegador. Queda como fase posterior si el uso lo pide.
- **GitHub Issues + Actions como backoffice**: rechazado. Es git-native y
  auditable, pero la UX no es un banco de trabajo y cada operación depende de
  una Action.
- **Obsidian o un vault local**: rechazado. Lee y escribe Markdown, pero no
  publica, no valida el protocolo y no tiene el flujo de promoción.
- **Una app con base de datos**: rechazada. Duplicaría el archivo, rompería la
  regla de git como única memoria y haría de la copia la fuente.
- **Un grafo o dashboard de Rizoma**: rechazado. El protocolo lo prohíbe
  explícitamente: el mapa se cartografía, no se calca.
- **Un CLI puro sin UI**: rechazado como única forma. Sería más chico, pero
  adjuntar, vincular y revisar diffs piden una superficie visual mínima.

## Referencias

- [`docs/rizoma/PUNTO-DE-ENTRADA.md`](../PUNTO-DE-ENTRADA.md) — ciclo, roles y
  reglas.
- [`docs/rizoma/protocolo-cartografia.md`](../protocolo-cartografia.md) — lo que
  el taller no debe hacer (grafo, dashboard, calco).
- [`docs/rizoma/taxonomia-anexos.md`](../taxonomia-anexos.md) — tipos, estados y
  fuentes del aparato.
- [`ADR-0005`](ADR-0005-historial-y-hitos.md) — historial de git e hitos.
- [`specs/014-taller-rizoma/spec.md`](../../../specs/014-taller-rizoma/spec.md) —
  alcance, criterios de aceptación y requisitos.
- [`admin/config.yml`](../../../admin/config.yml) — CMS actual, que se conserva
  para las demás colecciones.
- [`scripts/nueva-exploracion.mjs`](../../../scripts/nueva-exploracion.mjs) —
  scaffold que el taller reusa.
