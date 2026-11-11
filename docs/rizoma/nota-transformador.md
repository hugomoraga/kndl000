---
title: "Nota — Lo que mira una palabra"
date: 2026-11-11
estado: experimento
---

# Lo que mira una palabra

## Qué es

Un experimento de Código que entrena un transformer carácter por carácter con
`corpus.txt` y lo usa para continuar una frase. La pieza se llama **Lo que mira
una palabra**; el mecanismo es **self-attention**: cada posición de la frase se
reescribe según las posiciones que mira. No es un modelo de lenguaje grande: es
una sola arquitectura mínima para ver el mecanismo.

- 2 capas, 1 cabeza, `d_model` 64, `d_ff` 128.
- Contexto de 40 caracteres.
- 91 símbolos (el vocabulario del corpus).
- 12.000 pasos de entrenamiento.
- Pérdida de validación final: **1,6324**.
- Pesos exportados: `assets/models/transformador.json` (≈666 KB).

## Cómo se entrenó

El script vive en `docs/rizoma/train-transformador.py`. Usa NumPy y backprop
manual; no depende de PyTorch ni de un modelo preentrenado.

```bash
python3 -m venv .venv-train
.venv-train/bin/pip install numpy
.venv-train/bin/python docs/rizoma/train-transformador.py
```

El script lee `corpus.txt`, entrena, exporta los pesos y deja una muestra. La
semilla y los pasos están en `CONFIG`; el resultado es reproducible.

## Qué hace la página

`/codigo/atencion/` carga los pesos, pide una frase, una longitud y una
temperatura, y genera una continuación. Después muestra:

- la continuación;
- la matriz de atención de la primera capa para el último paso;
- la cobertura de trigramas de la continuación contra una muestra del corpus.

La matriz de self-attention es la parte más interesante: muestra que el modelo
no “conserva” la frase, sino una traza de atenciones. La continuación
transforma; no traduce. Es el descendiente aprendido del experimento de
Shannon: allí se cuenta; acá se aprende una representación y se mira.

## Límites

- El texto generado es una sombra del corpus, no una respuesta coherente.
- El modelo no entiende: aprende transiciones de caracteres.
- La cobertura alta no significa comprensión; solo indica que muchas
  secuencias de tres caracteres ya existían.
- Es un experimento artístico y didáctico, no una herramienta.

## Relación con la 02

La pieza responde a §4 de **Lo que el archivo no conserva**. La integración como
corpus de esa sección y la actualización de la lámina 02 quedan pendientes de
decisión editorial: agregar una obra cambia el corpus y obliga a rehacer la
lámina fechada.
