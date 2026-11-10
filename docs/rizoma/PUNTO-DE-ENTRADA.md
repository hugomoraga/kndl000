---
title: "Punto de entrada — Rizoma"
date: 2026-11-10
estado: vigente
---

# Punto de entrada — Rizoma

Si empezás una sesión nueva, leé esto primero. No reemplaza a los ADR ni al
protocolo: los ordena.

## Qué es

KNDL es un archivo creativo personal donde convergen escritura, poesía,
fragmentos, código, música, dispositivos e ideas. Rizoma es la sección de
exploraciones abiertas: no una tesis, no un blog, no una colección de
publicaciones. Cada exploración parte de una pregunta y se desplaza; puede
terminar hablando de otra cosa.

## Estado actual

- **01 — ¿Qué se conserva cuando algo se repite?** Persistencia, desgaste,
  recurrencia, redundancia y la objeción entre contenido y diferencia.
- **02 — Lo que el archivo no conserva.** Registro, pérdida, soporte,
  deprecación y la memoria del archivo.
- **Nodos**: vocabulario compartido; un nodo nace cuando una palabra aparece en
  dos cuerpos con sentido distinto. Hay cinco nodos compartidos entre 01 y 02.
- **Aparato**: anexos agrupados por tipo —corrección, fuente, concepto,
  objeción, derivación—. Hoy hay tres correcciones y una objeción.
- **Láminas**: 01 y 02 publicadas.

## Cómo se trabaja

Roles:

- **Autor**: intuición, voz, corte final, abandono. Decide qué se publica.
- **Colaborador** (el agente): investigación, lectura crítica, memoria
  estructural, redacción, implementación. No decide la voz; no promueve una idea
  al cuerpo sin la marca del autor.
- **Archivo**: Git, el CMS, el corpus. Registra, no decide. Olvida lo que no se
  commitea y solo ve frontmatter.
- **Lector**: entra por índice, nodo, corpus o búsqueda.

Ciclo:

1. Intuición o pregunta.
2. Nota en el banco de trabajo (`docs/rizoma/`), no en el sitio.
3. Si sobrevive, rastro o exploración.
4. Si conecta, nodo.
5. Si hay una obra que la sostiene, corpus.
6. Si hay una decisión, hito.
7. Si hay una rectificación, anexo con fuente.
8. Si hay una tensión abierta, objeción.

Reglas:

- **No inventar fuentes.** Verificar; si no se pudo consultar completo, se
  declara.
- **No corregir en silencio.** Toda rectificación factual deja un anexo con
  fuente. El cuerpo se corrige; el anexo conserva la formulación anterior.
- **Un anexo, un tipo primario.** La taxonomía y el procedimiento están en
  [`taxonomia-anexos.md`](taxonomia-anexos.md).
- **Una palabra no es un nodo hasta que aparece en dos cuerpos.**
- **Un hito cuando la decisión cambia la lectura**, no por cada commit. Ver
  ADR 0005.
- **Las referencias de sección usan `§N` y un ancla por título**, no por número.
  Ver ADR 0002.
- **Lo público es el mapa; el taller es el proceso.** Las notas, los ADR y los
  descartes viven en `docs/rizoma/`; el sitio muestra exploraciones, nodos,
  corpus, anexos, láminas e historial.

## Decisiones

| ADR | Decisión |
|---|---|
| [0001](adr/ADR-0001-anexos-de-rectificacion.md) | Anexos de rectificación con fuentes. |
| [0002](adr/ADR-0002-referencias-de-seccion.md) | Referencias de sección con `§N` y anclas por título. |
| [0003](adr/ADR-0003-anexos-como-aparato.md) | Anexos como aparato: cinco tipos. |
| [0004](adr/ADR-0004-taxonomia-de-anexos.md) | Taxonomía: un tipo primario, procedimiento y estados. |
| [0005](adr/ADR-0005-historial-y-hitos.md) | Historial: versiones de Git y hitos curados, sin fingir prosa. |

## Nueva exploración

```bash
node scripts/nueva-exploracion.mjs \
  --title "Título de la deriva" \
  --question "¿La pregunta inicial?"
```

El scaffold crea:

- `content/collections/_exploraciones/<slug>.md` con el frontmatter mínimo, un
  hito inicial y dos secciones con anclas.
- `docs/rizoma/ciclos/<fecha>-<slug>.md` con la pregunta, el material por
  completar y las decisiones.

No crea nodos, corpus, anexos ni relaciones: eso se agrega cuando existe. Después:

1. Escribí la pregunta y la primera sección en el cuerpo.
2. Agregá corpus solo cuando una obra se lea de verdad.
3. Agregá nodos solo cuando la palabra aparezca en dos cuerpos.
4. Si hay una fuente, un concepto, una objeción o una derivación, abrí un anexo
   con su tipo.
5. `bundle exec jekyll build` y `node scripts/check-links.mjs`.
6. El autor decide si se publica; después, commit y push.

## Lámina

Las láminas no son una vista automática de la exploración: son artefactos
fechados. Hay dos: la 01 (repetición) y la 02 (archivo); se eligen con
`--plate 01` o `--plate 02`. El **esqueleto** (obras, nodos, tipos, compartidos, fechas) se genera
con `--sync` desde la exploración y las colecciones. La **anotación**
(posiciones, citas, corte, blanco, colofón) vive en `lamina-01.annotations.yml`
y es manual.

`--check` falla si el corpus o los nodos cambiaron sin anotar, o si la
exploración se actualizó después de la fecha de la lámina. `--verify` hace lo
mismo pero recalcula el esqueleto en memoria y lo compara con el archivo: es el
chequeo de CI. `--write` regenera el HTML de la lámina, la página del sitio y el
SVG exportado. La composición no se autogenera: se decide.

El workflow `.github/workflows/rizoma-plate.yml` corre `--verify` en cada cambio
de exploraciones, nodos o lámina. Es un chequeo aparte: no bloquea el deploy del
sitio, pero deja visible el desfase.

## Comandos

```bash
bundle exec jekyll build          # construir el sitio
node scripts/check-links.mjs      # verificar enlaces internos
node scripts/nueva-exploracion.mjs --help
python3 docs/rizoma/build-lamina.py --sync    # esqueleto desde la exploración
python3 docs/rizoma/build-lamina.py --check   # fechas, corpus y nodos
python3 docs/rizoma/build-lamina.py --verify  # recalcula en memoria y compara
python3 docs/rizoma/build-lamina.py --write   # HTML, página y SVG
# la 02 usa los mismos comandos con --plate 02
```

## Mapa de archivos

- `content/collections/_exploraciones/` — exploraciones públicas.
- `content/collections/_nodos/` — vocabulario compartido.
- `content/collections/_fragmentos/` — Rastros.
- `docs/rizoma/protocolo-cartografia.md` — roles, estados, instrumentos.
- `docs/rizoma/taxonomia-anexos.md` — tipos y estándares de anexo.
- `docs/rizoma/adr/` — decisiones durables.
- `docs/rizoma/lectura-01.md` — banco de lectura de la 01.
- `docs/rizoma/nota-diagram-design.md` — pipeline de las láminas.
- `docs/rizoma/lamina-01.data.yml` y `lamina-02.data.yml` — esqueletos generados.
- `docs/rizoma/lamina-01.annotations.yml` y `lamina-02.annotations.yml` — posiciones, citas, corte, blanco.
- `docs/rizoma/build-lamina.py` — generador; `--plate 01|02`.
- `docs/rizoma/ciclos/` — notas de cada vuelta.
- `_layouts/anexo.html`, `_layouts/anexos.html`, `_layouts/exploracion.html` — superficies.

## Decisiones abiertas

- §8: ¿queda como sección o se pliega en §7?
- ¿«Sentido / señal» o «sentido / mensaje»?
- ¿El historial muestra prosa o solo enlace al archivo? (ADR futuro).
- Faltan anexos de tipo **fuente**, **concepto** y **derivación** para probar la
  taxonomía.
- Posible 03 sobre lenguaje y su lámina.
