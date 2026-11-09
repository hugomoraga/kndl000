---
title: Parametrica
date: 2026-11-09
kind: tool
tech: p5.js · Vite · JavaScript
version: v0.1.0
status: activo
demo_url: https://quicio.github.io/parametrica/
repo: https://github.com/quicio/parametrica
formats: Web
platform: Browser
description: "Banco de trabajo de geometría paramétrica: ecuaciones, armónicos y operadores para descubrir formas de una sola línea."
---

**Parametrica** es un banco de trabajo de geometría paramétrica. No se dibuja: se parametriza. Escribís una ecuación, la ves convertirse en línea, apilás operadores, mutás, animás y exportás.

→ [Abrir Parametrica](https://quicio.github.io/parametrica/)

## Qué tiene

- **Generadores:** ecuaciones paramétricas, polares, Fourier, superformula, Lissajous, rosas, hipotrocoides/epitrocoides, espirógrafos, campos de ruido, osciladores armónicos y programas de varias líneas.
- **Parámetros:** panel que cambia según el generador, con números, booleanos y selects.
- **Armónicos:** tablas de Fourier interactivas para agregar, quitar y reordenar filas.
- **Operadores:** 37 etapas puras — trasladar, rotar, escalar, espejar, arrays radiales/lineales, kaleidoscopio, simetría, remuestreo, deformar, proyectar, trazo, booleanos y voronoi.
- **Vista:** passes de curva, puntos, normales/tangentes, curvatura, epiciclos, wireframe y overlays de inflexiones, muestras, regla y bbox.
- **Animación:** cualquier parámetro numérico acepta expresiones con `time`; play, pausa, scrub y velocidad.
- **Mutación:** perturba parámetros y literales de las ecuaciones, siempre dentro de la misma familia matemática.
- **Fabricación:** export STL validado de una sola pieza.
- **Presets:** biblioteca agrupada y buscable, favoritos, recientes y guardados propios.
- **Export:** SVG, SVG para plotter, PNG, GIF, STL, JSON y clipboard.

## Motor

El documento JSON es la forma: generador + pila de operadores + parámetros. Cada etapa es pura, sin DOM y ejecutable en Node; el mismo documento, la misma semilla y el mismo tiempo producen la misma geometría. p5.js dibuja el canvas y un parser de expresiones propio resuelve las ecuaciones.

## Estado

Versión v0.1.0. 25 generadores registrados, 37 operadores y una suite de verificación de más de 2.000 checks. La demo corre en GitHub Pages.

## Repositorio

Código abierto: [quicio/parametrica](https://github.com/quicio/parametrica).
