---
layout: anexo
title: "El autómata no es redundancia"
order: "04"
tipo: objecion
date: 2026-11-10
estado: abierta
exploracion: /rizoma/que-se-conserva-cuando-algo-se-repite/
permalink: /rizoma/que-se-conserva-cuando-algo-se-repite/anexos/automata/
fuentes:
  - autor: "KNDL"
    titulo: "Autómata de información"
    anio: 2025
    publicacion: "Código, KNDL"
    url: "https://kndl.quicio.qzz.io/codigo/automata-informacion/"
    consultado: 2026-11-10
    tipo: "código"
    verifica: >-
      El receptor recibe el mensaje sin decodificar; el programa mide coherencia
      y novedad, no errores.
  - autor: "Shannon, Claude E"
    titulo: "A Mathematical Theory of Communication"
    anio: 1948
    publicacion: "Bell System Technical Journal 27(3): 379–423; 27(4): 623–656"
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
    consultado: 2026-11-10
    tipo: "primaria"
    verifica: >-
      p. 14: la redundancia es 1 − entropía relativa. p. 22: enviar la
      información en forma redundante reduce la probabilidad de errores.
  - autor: "KNDL"
    titulo: "Voto por mayoría"
    anio: 2026
    publicacion: "Código, KNDL"
    url: "https://kndl.quicio.qzz.io/codigo/voto-por-mayoria/"
    consultado: 2026-11-10
    tipo: "código"
    verifica: >-
      Codifica, transmite, decodifica por mayoría y compara con el original;
      el autómata no hace ninguna de esas cosas.
---

## Qué se parece

El autómata de información comparte el escenario: un mensaje binario cruza del
emisor al receptor, el ruido lo degrada y la repetición aparece en el camino. La
coherencia sube; la novedad baja.

## Qué no

No hay codificador ni decodificador. El receptor recibe el mensaje sin
compararlo con el original. No hay bits de control, ni voto por mayoría, ni
corrección. La «optimización» acorta la cadena y homogeneiza los bits; no agrega
estructura para reconstruir. La coherencia —proporción de bits vecinos
iguales— no es redundancia en el sentido de Shannon: una cadena de todo ceros
tiene coherencia máxima y entropía cero.

## Por qué importa

Si llamamos redundancia a cualquier repetición, perdemos la diferencia entre
corregir y homogeneizar. La redundancia agrega estructura para que el mensaje
pueda reconstruirse; el autómata usa la repetición para volverlo más previsible.
Las dos repiten; solo una conserva el mensaje.

La exploración lo trata en <a class="seccion-ref" href="/rizoma/que-se-conserva-cuando-algo-se-repite/#redundancia" aria-label="Sección 7: Redundancia" title="Sección 7: Redundancia">§7</a> y en <a class="seccion-ref" href="/rizoma/que-se-conserva-cuando-algo-se-repite/#la-objecion" aria-label="Sección 8: La objeción" title="Sección 8: La objeción">§8</a>.

## Qué queda abierto

¿Puede una homogeneización ser una forma de redundancia sin corrección? ¿Qué se
conserva cuando el mensaje se vuelve más coherente y menos novedoso? La objeción
no se resuelve: se sostiene.
