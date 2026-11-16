# Feature Specification: Presentación de exploraciones

**Feature Branch**: `016-rizoma-presentacion`
**Created**: 2026-11-15
**Status**: Implemented
**Input**: La exploración 02 quedaba densa. Se necesitaba un mapa de lectura, respiros y un diagrama de tensión, reutilizables por cualquier exploración y sin datos hardcodeados.

## Contexto

La presentación de una exploración se resuelve con datos, no con HTML por página. El generador `RizomaPresentacionGenerator` lee cualquier exploración y, si existe un sidecar, agrega mapa, respiros y diagrama. Si no existe, deriva el mapa de los encabezados y deja el aparato cerrado.

## Alcance

- `_plugins/rizoma_presentacion.rb`: generador genérico.
- `_data/presentaciones/<slug>.yml`: datos editoriales opcionales.
- `_includes/rizoma-presentacion-mapa.html`, `rizoma-respiro.html`, `rizoma-presentacion-diagrama.html`.
- `_layouts/exploracion.html`: inserta mapa, respiros y diagrama; aparato cerrado por defecto.
- `assets/js/core/rizoma-apparatus.js`: respeta `data-keep-closed`.
- CSS compartido.

## No objetivos

- Generar una lámina.
- Listar todo el corpus o todos los nodos.
- Crear un grafo o un dashboard.
- Reemplazar el aparato.
- Introducir entidades nuevas en la trama.

## Modelo del sidecar

```yaml
mapa:
  - seccion: dos-rastros
    etiqueta: "Dos rastros"
    movimiento: "origen"

respiros:
  - antes_de: guardar
    texto: "..."
    fuente: /fragmentos/

diagrama:
  tipo: regimenes
  titulo: "Archivo y residuo"
  antes_de: dos-rastros
  izquierda:
    etiqueta: "Archivo"
    nota: "conserva por repetición"
    obras: [/dispositivos/candil/, /codigo/grid-palabras/]
  derecha:
    etiqueta: "Residuo"
    nota: "conserva por adherencia"
    obras: [/poemas/medusa/, /vestigios/pagina-que-ya-no-responde/]
  corte: "Deprecación"
  blanco: "Lo que no se puede clasificar"

aparato: cerrado
```

Todo es opcional. Sin `mapa`, se deriva de los `##`. Sin `respiros` o `diagrama`, no se renderizan. `aparato` puede ser `abierto` o `cerrado`; el default es cerrado.

## Comportamiento

1. El generador recorre `site.exploraciones`, no una lista de slugs.
2. Busca el sidecar por `basename_without_ext`.
3. Deriva las secciones del cuerpo, ignorando bloques de código.
4. Valida que cada `seccion`, `antes_de` y `fuente` exista.
5. Valida que cada obra del diagrama esté en el corpus de la exploración.
6. Resuelve títulos y tipos de obra desde las colecciones.
7. Adjunta `page.presentacion`.
8. El layout inserta el mapa después del encabezado, y respiros/diagrama antes de la sección indicada.
9. El aparato se abre solo si `aparato: abierto`; si no, el resumen queda visible y el contenido cerrado.

## Criterios de aceptación

- **AC-01**: 02 muestra mapa, diagrama, tres respiros y aparato cerrado.
- **AC-02**: 01 muestra un mapa derivado de sus encabezados y aparato cerrado, sin sidecar.
- **AC-03**: Un sidecar inválido falla el build con un mensaje claro.
- **AC-04**: No hay slugs ni rutas de 01/02 en el generador.
- **AC-05**: El build, los enlaces y las láminas internas siguen pasando.
- **AC-06**: El mapa y el diagrama no crean un grafo ni listan todo el corpus.

## Fuera de alcance

Láminas públicas, búsqueda, taller, migración de nodos y cambios en la trama.
