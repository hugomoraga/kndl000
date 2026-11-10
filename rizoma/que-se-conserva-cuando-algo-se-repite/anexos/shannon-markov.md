---
layout: anexo
title: "Shannon, Markov y el experimento"
order: "03"
date: 2026-11-10
estado: corregido
exploracion: /rizoma/que-se-conserva-cuando-algo-se-repite/
permalink: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/shannon-markov/
fuentes:
  - autor: "Shannon, Claude E"
    titulo: "A Mathematical Theory of Communication"
    anio: 1948
    publicacion: "Bell System Technical Journal 27(3): 379–423; 27(4): 623–656"
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
    consultado: 2026-11-10
    tipo: "primaria"
    verifica: >-
      La sección 3, «The Series of Approximations to English» (p. 7 del PDF), y
      la sección 4, «Graphical Representation of a Markoff Process» (p. 8):
      «Stochastic processes of the type described above are known
      mathematically as discrete Markoff processes».
  - autor: "KNDL"
    titulo: "Experimento de Shannon"
    anio: 2025
    publicacion: "Código, KNDL"
    url: "https://kndl.quicio.qzz.io/codigo/experimento-shannon/"
    consultado: 2026-11-10
    tipo: "código"
    verifica: >-
      La introducción de la pieza dice que retoma la idea de Shannon y usa
      cadenas de Markov de orden creciente; el código implementa bigramas,
      trigramas y órdenes superiores.
---

## Qué decía

> Aproximaciones al lenguaje con cadenas de Markov: el texto como repetición
> probabilística.

La palabra «Shannon» de §7 enlazaba a esa pieza desde la frase sobre
redundancia.

## Qué se corrigió

> Las aproximaciones al lenguaje de Shannon, con cadenas de Markov de orden
> creciente.

## Por qué

El experimento es de Shannon; el método es Markov. La pieza retoma la idea de
Shannon de aproximarse al lenguaje por grados —letras al azar, frecuencias,
n-gramas— y la implementa con cadenas de Markov de orden creciente: bigramas,
trigramas y así. En el artículo de 1948, Shannon llama a esos procesos
«discrete Markoff processes» y los usa para construir las aproximaciones al
inglés.

La nota anterior nombraba el método pero no el experimento; el enlace desde la
redundancia confundía dos partes de la misma teoría: la redundancia mide la
estructura que permite resistir el ruido; las aproximaciones muestran el paso
del ruido a la sintaxis. El enlace se retiró y la nota se corrigió.

## Qué queda abierto

La relación entre ambas: la redundancia es una propiedad de la fuente; las
aproximaciones son una forma de construir fuentes cada vez más parecidas al
lenguaje. No son lo mismo, pero se tocan.
