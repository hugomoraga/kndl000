---
title: Nota — diagram-design, adaptado a la lámina
date: 2026-11-10
estado: evaluación y adaptación · no normativo
---

# diagram-design, adaptado

## Qué es

Repo de Cathryn Lavery: una skill para agentes (Claude Code, Codex, Copilot,
Cursor) con 45 tipos de diagrama técnico, HTML+SVG autocontenido, sin sombras,
contrato accesible, linter y export, y perfiles por cliente. No es una librería
de gráficos ni un generador de layouts: es un sistema de reglas y plantillas.

## Lo que ya estaba en la máquina

- `.diagram-design` en la raíz del proyecto: `profile: kndl`.
- `~/.diagram-design/profiles/kndl.md` (12 KB, 2026-11-10 03:29): traduce KNDL a
  tokens (paper `#060708`, ink `#e9e6dc`, accent `#9fc6c9`), tipografías
  (Newsreader, Lato, JetBrains Mono), contrato de contraste y grilla de 4 px.

El perfil es útil como mapa de tokens, pero conserva la gramática de la skill:
cajas de nodo, `radius-md: 6`, flechas, tratamientos. Para una lámina de KNDL
eso es un calco. Usé tokens y tipografía; no la forma.

## Lo que adopté

- **SVG como fuente de verdad**; el HTML es solo el marco.
- **Contrato accesible**: `role="img"`, `title` primero, `desc`, ids prefijados,
  `aria-labelledby`. `self_check.py` pasa.
- **Grilla de 4 px**: coordenadas explícitas, sin percentages.
- **`self_check.py`** para overflow y contrato; **`export_svg.py`** para el SVG.
- **Scroll horizontal** en pantalla angosta: el mapa no refluye.
- **Nav oculta** con los enlaces, porque `role="img"` oculta el subárbol del SVG.

## Lo que rechacé

- Los 45 tipos: son diagramas técnicos (arquitectura, flujo, Gantt, matriz).
  Ninguno es un campo de proximidad; forzar uno habría sido un calco.
- Cajas, radios, flechas y las tarjetas de resumen del template.
- El perfil como forma.
- La importación de fuentes del export: `export_svg.py` inyecta Instrument
  Serif / Geist, no las del perfil. Parcheé el `@import` a mano; es un gap real
  que conviene resolver si el flujo se adopta.

## Flujo

1. Editar datos y coordenadas en `build-lamina.py`.
2. `python3 docs/rizoma/build-lamina.py > docs/rizoma/lamina-01-svg.html`
3. `python3 …/self_check.py docs/rizoma/lamina-01-svg.html` → OK.
4. `python3 …/export_svg.py … docs/rizoma/lamina-01.svg`
5. Corregir el `@import` mientras el export no lea el perfil.
6. `qlmanage` para el preview PNG.

## Qué resuelve y qué no

Resuelve: contrato, export, grilla, una sola fuente de verdad, validación.

No resuelve: la composición editorial, los cortes de línea, la decisión de qué
va cerca de qué, qué se corta y dónde queda el blanco. Eso sigue siendo lectura.

El SVG exportado no arrastra la fuente: Quick Look cae a Georgia. En el navegador
con red, la fuente correcta es la del HTML. Para un artefacto offline habría que
embeber las fuentes.

## Claridad y lupa (pasada de Impeccable)

El detector marcó texto funcional por debajo de 11 px y tracking en cuerpo. La
revisión de heurísticas marcó el problema principal: los nodos flotaban y había
que recordar la clave del colofón para entender la lámina.

Cambios:

- Los nodos van debajo de la obra que los trabaja; la cercanía deja de ser un
  acertijo.
- La clave de lectura sube al encabezado: «cada bloque es una obra; cada
  palabra, un nodo».
- El SVG se ajusta por escala (no refluye) y una lupa 2× sigue al cursor en
  puntero fino; en táctil, pellizco.
- Los labels funcionales suben al piso de 11 px y el corte baja de tono.
- Se retira la nota del desplazamiento: era la única línea que concluía.

El detector queda con dos advisories: `0.875rem` fuera de la rampa de
DESIGN.md y 18 guiones largos (los ticks de nodo y la nav oculta; falso
positivo).

## Estado

- `lamina-01-svg.html` (fuente), `lamina-01.svg` (export estático),
  `lamina-01.png` (preview), `build-lamina.py` (generador).
- La página del sitio agrega la lupa y el ajuste por escala; el SVG exportado
  queda sin script.
- `lamina-01-css.html`: el test anterior en HTML/CSS; se conserva para comparar.
- Pendiente: si el export se vuelve profile-aware.
