---
layout: anexo
title: "La redundancia no es lo que sobra"
order: "01"
date: 2026-11-10
estado: corregido
tipo: correccion
exploracion: /rizoma/que-se-conserva-cuando-algo-se-repite/
permalink: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/redundancia/
fuentes:
  - autor: "Shannon, Claude E"
    titulo: "A Mathematical Theory of Communication"
    anio: 1948
    publicacion: "Bell System Technical Journal 27(3): 379–423; 27(4): 623–656"
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
    consultado: 2026-11-10
    tipo: "primaria"
    verifica: >-
      En la p. 14 del PDF: «One minus the relative entropy is the redundancy».
      En la p. 22: «by sending the information in a redundant form the probability
      of errors can be reduced».
  - autor: "KNDL"
    titulo: "Voto por mayoría"
    anio: 2026
    publicacion: "Código, KNDL"
    url: "https://kndl.quicio.qzz.io/codigo/voto-por-mayoria/"
    consultado: 2026-11-10
    tipo: "código"
    verifica: >-
      Implementa repetición 3/5/7 y voto por mayoría; el barrido de p muestra
      que el umbral está en p = 0,5.
---

## Qué decía

> Shannon llamó redundancia a lo que sobra: la parte que no hace falta para
> entender el mensaje y que sirve para que llegue.

## Qué se corrigió

> Shannon llamó redundancia a la diferencia entre la entropía máxima de una
> fuente y su entropía real: la parte del mensaje que está determinada por su
> estructura. No es un resto: es lo que permite detectar o corregir errores y
> resistir el ruido.

## Por qué

«Lo que sobra» sugiere excedente o ruido; la redundancia es estructura que
restringe el mensaje. Shannon la define como uno menos la entropía relativa: la
parte que la fuente determina y que no hace falta elegir. Su ejemplo es el
inglés: alrededor de la mitad de lo que escribimos está determinado por la
estructura del idioma y la otra mitad se elige.

Esa estructura tiene una función. En un canal con ruido, enviar la información
en forma redundante reduce la probabilidad de error; el código de repetición es
el caso mínimo: se repite cada bit, se vota por mayoría y se paga con ancho de
banda. La redundancia no es un adorno del mensaje: es lo que lo sostiene cuando
el canal falla.

La frase anterior no era solo imprecisa: el enlace a «Experimento de Shannon»
apuntaba a una pieza de aproximaciones al lenguaje, no a la redundancia. El
enlace se retiró; la pieza quedó en el corpus con una nota que describe lo que
hace.

## Qué queda abierto

La distinción entre conservar el sentido y conservar la señal. La redundancia
conserva el mensaje; no garantiza el sentido. Esa diferencia es la objeción de
<a class="seccion-ref" href="/rizoma/que-se-conserva-cuando-algo-se-repite/#la-objecion" aria-label="Sección 8: La objeción" title="Sección 8: La objeción">§8</a>.
