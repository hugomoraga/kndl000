---
title: Protocolo de cartografía — borrador 01
date: 2026-11-10
estado: vigente desde 2026-11-10 · revisable
---

# Protocolo de cartografía

No es un manual de diseño ni una metodología cerrada. Es un acuerdo provisional
para que el mapa se construya mientras se recorre, y para que el marco visual no
se convierta en un calco del rizoma.

## 1. Los principios, leídos como operaciones

| Principio | Qué exige | Qué prohíbe en KNDL |
|---|---|---|
| 1. Conexión | Cualquier punto puede conectarse con cualquier otro; la conexión se hace, no se declara. | Un campo «relacionadas» que solo admite lo previsto. |
| 2. Heterogeneidad | Las cadenas conectadas son de distinta naturaleza: poema, código, vestigio, dispositivo. | Jerarquizar los kinds o reducir el corpus a textos. |
| 3. Multiplicidad | No hay sujeto ni objeto, solo dimensiones; el mapa no tiene unidad. | Un índice-raíz que sea «el» origen de la sección. |
| 4. Ruptura asignificante | Un corte no anuncia una estructura nueva: se vuelve a empezar sobre una línea vieja o sobre una nueva. | Convertir cada corte en «nueva sección» o en conclusión. |
| 5-6. Cartografía y calcomanía | El mapa es abierto, desmontable, reversible, modificable; tiene múltiples entradas. El calco reproduce una estructura y vuelve siempre al mismo lugar. | Un grafo, un dashboard, una lámina que fija territorios de una vez. |

Precisiones que conviene no perder:

- El principio se llama cartografía y calcomanía; la operación que combate es el
  **calco** (tracing): la copia que traduce el mapa en estructura.
- El calco no es el enemigo absoluto. Deleuze pide devolverlo al mapa. El
  historial es un calco; si solo lee frontmatter, está desprendido del texto y
  miente por omisión. No hay que borrarlo: hay que reconectarlo.
- El rizoma no comienza ni acaba: siempre está en el medio.
- El rizoma se define por una circulación de estados, sin memoria organizadora
  ni autómata central. KNDL tiene memoria central (Git, CMS) y autómata central
  (el generador de historial). No es una contradicción para resolver: es el
  material del frente de archivo.
- La meseta: una región de intensidades sin culminación. Cada exploración es una
  meseta, no un capítulo.

## 2. La advertencia

Un kit de componentes «rizomáticos» —grafo, constelación, red interactiva— es un
calco del rizoma. El rizoma no se diseña: se cartografía.

Por eso este marco no es una librería visual. Es un conjunto de **restricciones
de proceso** y **tres instrumentos que se rehacen**. La estética de KNDL ya es
forense —expediente, folio, lámina, traza— y eso no contradice el rizoma. Un
archivo puede ser rizomático si su mapa está abierto; una red dibujada puede ser
un árbol si fija el recorrido.

El protocolo también es una lámina: se fecha, se rehace, no se acumula. Este es
el borrador 01 y será reemplazado, no ampliado.

## 3. Roles

| Rol | Hace | No hace |
|---|---|---|
| **Autor** (Hugo) | Intuición, voz, corte final, abandono. | No delega qué se publica. |
| **Colaborador** (yo) | Investigación, lectura crítica, memoria estructural, redacción, implementación. | No decide la voz ni cierra preguntas; no promueve una idea al cuerpo sin marca del autor. |
| **Archivo** (sitio y repo) | Registra, fecha, versiona; produce historial y corpus. | No decide; olvida lo que no se commitea; solo ve frontmatter. |
| **Lector** | Recorre; entra por índice, nodo, corpus o búsqueda. | No deja traza (sin tracking). |

El archivo no es un contenedor: es un participante con límites. Sus límites son
método, no bug. Cuando el historial no ve la prosa, no está fallando: está
diciendo qué clase de memoria es.

## 4. Estados y lugares

| Estado | Dónde vive | Quién lo promueve | Señal de que está listo |
|---|---|---|---|
| Intuición | conversación / banco | autor | vuelve sola |
| Nota | `docs/rizoma/` | ambos | tiene pregunta |
| Rastro | Rastros | autor | una línea |
| Referencia | banco → cuerpo | colaborador (verificada) | fuente comprobada |
| Nodo | `_nodos` | ambos | palabra en dos cuerpos |
| Exploración | `_exploraciones` | autor decide, colaborador redacta | pregunta + corpus |
| Corpus | frontmatter | ambos | obra que el cuerpo lee |
| Corte | hito + lámina | ambos | decisión registrada |

## 5. Reglas de integración (provisionales)

1. Nada entra al cuerpo de una exploración sin haber pasado por nota o rastro.
2. Un nodo nace cuando una palabra aparece en dos cuerpos con sentido distinto;
   antes es un campo, no un nodo.
3. Una referencia entra solo verificada; si no, queda en el banco como «por
   verificar».
4. Una idea se abandona con hito y motivo; no se borra sin dejar traza.
5. El mapa puede agregar; quitar deja marca.
6. Ninguna exploración se publica sin al menos un nodo compartido y una pregunta
   abierta.
7. La lámina se fecha y se rehace; la anterior queda en el historial.

## 6. Instrumentos visuales

**La lámina.** Una por exploración. Muestra el corpus, los nodos y los cortes.
Se genera desde los datos y se anota a mano: las etiquetas son citas, no
categorías. Deja al menos un blanco. No numera territorios fijos. Se fecha.

**El margen.** Los nodos como marginalia: dónde más aparece la palabra
(«también en»), con el sigilo del kind. No es una nube de tags ni un ranking.

**El corte.** Convención para las rupturas: una línea que se detiene, un hueco,
un «sin trazo». No significa «nueva sección»: significa que algo se cortó.
Primer caso: el ritual de la 01.

## 7. Reglas de mutación

1. La lámina se versiona con la exploración; la vieja no se borra.
2. La leyenda nunca explica el mapa entero: claves locales.
3. El número de campos no se fija: lo pide el corpus.
4. Nada puede sugerir completitud.
5. Cualquier instrumento se puede quitar sin romper la lectura.

## 8. Primer trabajo: lámina 01

Qué muestra:

- 7 piezas de corpus, con sus kinds.
- 9 nodos, marcando los compartidos con la 02.
- El corte del ritual: sección borrada, frase que sobrevive.
- El desplazamiento de la pregunta.
- El blanco: lo que la 01 todavía no sabe (la memoria sin archivo).

Qué prueba:

- Si una lámina puede ser fiel sin ser un resumen.
- Si el corte se puede mostrar sin explicarlo.
- Si el margen puede mostrar lo compartido sin volverse un grafo.

## 9. Decisiones

Resueltas el 2026-11-10:

1. Se acepta el reparto de roles, con el archivo como participante y no como
   contenedor.
2. Se aceptan las reglas 1-7.
3. La lámina es híbrida: esqueleto generado desde los datos y anotación a mano.
4. El primer trabajo es la lámina 01; la 03 (lenguaje) queda para después.

Queda abierto: si la lámina 01 pasa el test, cómo se publica (página generada
bajo `/rizoma/:name/lamina/` o artefacto editorial fechado).
