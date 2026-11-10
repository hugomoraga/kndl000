---
layout: codigo
title: Voto por mayoría
date: 2026-11-10
language: JavaScript
concept: "Tres copias, un voto. La redundancia que corrige errores y el umbral donde deja de corregir."
---

Un código de repetición es la forma más simple de redundancia: cada bit se transmite varias veces y el receptor vota por mayoría. Si el canal se equivoca en menos de la mitad de las copias, el bit se recupera. Si se equivoca en más de la mitad, el voto se invierte.

El experimento codifica un mensaje de ocho bits, lo pasa por un canal binario simétrico y compara el mensaje decodificado con el original. Después barre la probabilidad de error del canal para mostrar el umbral: la redundancia ayuda mientras el canal sea mejor que el azar; cuando deja de serlo, amplifica el error.

El ejemplo de abajo fuerza un error en el primer bloque para mostrar la corrección; la simulación y la curva usan la probabilidad que elijas.

El [autómata de información](/codigo/automata-informacion/) muestra el caso opuesto: la repetición que vuelve coherente el mensaje sin decodificarlo.

```javascript
// Voto por mayoría — código de repetición.
// Cada bit viaja n veces; el receptor elige el valor mayoritario.

const pEntrada = parseFloat(String(input("Probabilidad de error del canal (0–1)")).replace(",", "."));
const nEntrada = parseInt(input("Repetición (3, 5 o 7)"), 10);

const p = Math.max(0, Math.min(1, isNaN(pEntrada) ? 0.1 : pEntrada));
const n = [3, 5, 7].includes(nEntrada) ? nEntrada : 3;

const original = "01001101";
const ensayos = 200;
const pasos = 20;

function codificar(bits, repeticion) {
  let salida = "";
  for (const bit of bits) salida += bit.repeat(repeticion);
  return salida;
}

function transmitir(bits, probabilidad) {
  let salida = "";
  for (const bit of bits) {
    salida += Math.random() < probabilidad ? (bit === "1" ? "0" : "1") : bit;
  }
  return salida;
}

function decodificar(bits, repeticion) {
  let salida = "";
  for (let i = 0; i < bits.length; i += repeticion) {
    let unos = 0;
    for (let j = 0; j < repeticion; j++) {
      if (bits[i + j] === "1") unos++;
    }
    salida += unos * 2 > repeticion ? "1" : "0";
  }
  return salida;
}

function errores(a, b) {
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) total++;
  }
  return total;
}

function simular(probabilidad, repeticion, vueltas) {
  const codificado = codificar(original, repeticion);
  let bitsMalos = 0;
  let mensajesMalos = 0;
  for (let v = 0; v < vueltas; v++) {
    const recibido = transmitir(codificado, probabilidad);
    const decodificado = decodificar(recibido, repeticion);
    const malos = errores(decodificado, original);
    bitsMalos += malos;
    if (malos > 0) mensajesMalos++;
  }
  return {
    tasaBits: bitsMalos / (vueltas * original.length),
    tasaMensajes: mensajesMalos / vueltas
  };
}

const codificado = codificar(original, n);
// Ejemplo forzado: un bit invertido en el primer bloque. El voto lo corrige.
const recibido = (codificado[0] === "0" ? "1" : "0") + codificado.slice(1);
const decodificado = decodificar(recibido, n);
const erroresCanal = errores(recibido, codificado);
const residuales = errores(decodificado, original);

let corregidos = 0;
for (let i = 0; i < original.length; i++) {
  const bloqueCod = codificado.slice(i * n, (i + 1) * n);
  const bloqueRec = recibido.slice(i * n, (i + 1) * n);
  if (bloqueRec !== bloqueCod && decodificado[i] === original[i]) corregidos++;
}

function fila(etiqueta, bits) {
  return etiqueta.padEnd(13) + bits;
}

output({ type: "meta", text: `Canal p = ${p.toFixed(2)} · repetición ${n}× · ejemplo: 1 bit invertido · mensaje ${original}` });
output({
  type: "grid",
  data: [
    fila("original", original),
    fila("codificado", codificado),
    fila("recibido", recibido),
    fila("decodificado", decodificado)
  ].join("\n"),
  caption: "ejemplo: un bit invertido en el primer bloque; el voto lo corrige",
  label: "Mensaje original, codificado, recibido y decodificado"
});

output({
  type: "legend",
  text: `errores del canal en esta vuelta: ${erroresCanal}\n` +
        `bloques corregidos por el voto: ${corregidos}\n` +
        `bits residuales después de decodificar: ${residuales}`
});

output({ type: "metric", label: "bits transmitidos por bit", value: n });
output({ type: "metric", label: "errores corregibles por bloque", value: Math.floor((n - 1) / 2) });
output({ type: "metric", label: "tasa de código", value: `1/${n}` });

const muestra = simular(p, n, 500);
output({
  type: "legend",
  text: `500 mensajes con p = ${p.toFixed(2)}: ` +
        `${(muestra.tasaBits * 100).toFixed(1)}% de bits mal · ` +
        `${(muestra.tasaMensajes * 100).toFixed(1)}% de mensajes con al menos un error`
});

const puntos = [];
for (let i = 0; i <= pasos; i++) {
  const q = i / pasos;
  puntos.push([q, simular(q, n, ensayos).tasaBits]);
}

output({
  type: "trace",
  points: puntos,
  label: `Tasa de error decodificada con repetición ${n}× frente al ruido del canal`
});
output({
  type: "legend",
  text: "x: probabilidad de error del canal (0–1) · y: tasa de error del mensaje decodificado\n" +
        "la diagonal sería no codificar; el cruce está en 0,5"
});

output({
  type: "conclusion",
  text:
    "La redundancia no elimina el ruido: lo reparte.\n" +
    "Con p < 0,5 el voto por mayoría reduce el error; en p = 0,5 no tiene ventaja; " +
    "con p > 0,5 el código amplifica el error.\n" +
    "La redundancia tiene un umbral, y el umbral es el canal, no el código."
});
```
