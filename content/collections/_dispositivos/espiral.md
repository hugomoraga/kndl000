---
title: Espiral
symbol_suffix: false
date: 2026-11-06
kind: tool
tech: Tone.js · Web Audio
demo_url: https://quicio.github.io/espiral/
repo: https://github.com/quicio/espiral
formats: Web
platform: Browser
description: "Instrumento generativo de ritmos, escalas y automatización."
---

**Espiral** es un instrumento de performance y exploración musical: siete canales, patrones de 16 pasos, semilla reproducible, escenas, escalas y automatización.

→ [Abrir Espiral](https://quicio.github.io/espiral/)

## Qué tiene

- **Performance:** anillo de pulso colectivo y actividad por canal.
- **Sequencer:** editor radial, Euclid, densidad, giro, copiar/pegar, undo y matriz de comparación.
- **Sound:** faders, mute/solo, freeze, delay y reverb por canal.
- **Generativo:** semilla, escenas, mutación, evolución y freeze.
- **Tonalidad:** 12 raíces, 7 escalas y 4 progresiones.
- **Duración de notas:** acordes largos y lead legato.
- **Automatización:** curva de 16 pasos sobre reverb/delay.
- **Sesiones:** guardado local y JSON exportable.

## Motor

El audio y las reglas generativas viven en [`@quicio/umbral-tone`](https://github.com/quicio/umbral-tone), un motor independiente con Tone.js. Espiral lo usa como base y aporta el instrumento, la interfaz y la performance.

## Repositorio

Código abierto: [quicio/espiral](https://github.com/quicio/espiral).
