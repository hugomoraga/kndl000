---
layout: codigo
title: Autómata de Información
date: 2025-01-15
language: JavaScript
concept: "El emisor y el receptor. La información que se degrada hacia el ruido. La coherencia que se optimiza. La estabilización que emerge."
---

```javascript
// Autómata de información — un mensaje cruza del emisor al receptor.
// En el camino se degrada con ruido y se optimiza con repetición: la
// coherencia y la novedad son las dos fuerzas que se ven en la grilla.

const pedidos = parseInt(input("¿Cuántos mensajes? (1–3)"), 10);
const mensajes = Math.max(1, Math.min(3, isNaN(pedidos) ? 2 : pedidos));

const filas = 15;
const columnas = 41;
const emisorX = Math.floor(filas / 2);
const emisorY = 3;
const receptorX = emisorX;
const receptorY = columnas - 4;

let grid = Array.from({ length: filas }, () => Array(columnas).fill(0));
let trail = Array.from({ length: filas }, () => Array(columnas).fill(0));
let mensajesEnTransito = [];
let recibidos = [];
let perdidos = [];
let proximoId = 1;
let pasoActual = 0;
let creados = 0;

let m1Inicial = 0;
let m1Final = 0;
let m1NovedadFinal = 0;
let m1Estado = "—";
const historialM1 = [];

function generarBinario(longitud = 8) {
  let binario = "";
  for (let i = 0; i < longitud; i++) {
    binario += Math.random() > 0.5 ? "1" : "0";
  }
  return binario;
}

// Coherencia: proporción de bits consecutivos iguales.
function calcularCoherencia(binario) {
  if (binario.length < 2) return 0;
  let patrones = 0;
  for (let i = 0; i < binario.length - 1; i++) {
    if (binario[i] === binario[i + 1]) patrones++;
  }
  return patrones / (binario.length - 1);
}

// Novedad: cuánto se equilibran unos y ceros.
function calcularNovedad(binario) {
  if (binario.length === 0) return 0;
  const unos = (binario.match(/1/g) || []).length;
  const ceros = (binario.match(/0/g) || []).length;
  return 1 - Math.abs(unos - ceros) / binario.length;
}

// El ruido cambia bits al azar.
function introducirRuido(binario, probabilidad) {
  let nuevo = "";
  for (let i = 0; i < binario.length; i++) {
    nuevo += Math.random() < probabilidad
      ? (binario[i] === "1" ? "0" : "1")
      : binario[i];
  }
  return nuevo;
}

// La optimización repite patrones y achica el token.
function optimizarCadena(binario) {
  if (binario.length > 4 && Math.random() < 0.12) {
    const mitad = Math.floor(binario.length / 2);
    binario = binario.substring(0, mitad) + binario.substring(mitad + 1);
  }

  if (Math.random() < 0.2) {
    let nuevo = "";
    for (let i = 0; i < binario.length; i++) {
      if (i > 0 && binario[i - 1] === binario[i]) {
        nuevo += binario[i];
      } else {
        nuevo += Math.random() > 0.5 ? binario[i] : binario[i - 1] || binario[i];
      }
    }
    binario = nuevo;
  }

  return binario;
}

function crearMensaje() {
  const binario = generarBinario(8);
  const msg = {
    id: proximoId++,
    x: emisorX,
    y: emisorY,
    binario,
    coherence: calcularCoherencia(binario),
    novelty: calcularNovedad(binario),
    paso: 0,
    objetivoX: receptorX,
    objetivoY: receptorY
  };

  if (msg.id === 1) {
    m1Inicial = msg.coherence;
    m1Final = msg.coherence;
    m1NovedadFinal = msg.novelty;
  }

  trail[emisorX][emisorY] = 1;
  mensajesEnTransito.push(msg);
}

function moverMensajes() {
  for (let i = mensajesEnTransito.length - 1; i >= 0; i--) {
    const msg = mensajesEnTransito[i];
    const dx = msg.objetivoX - msg.x;
    const dy = msg.objetivoY - msg.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia < 2) {
      msg.estado = "recibido";
      recibidos.push(msg);
      if (msg.id === 1) {
        m1Final = msg.coherence;
        m1NovedadFinal = msg.novelty;
        m1Estado = "recibido";
        historialM1.push([pasoActual, msg.coherence]);
      }
      mensajesEnTransito.splice(i, 1);
      continue;
    }

    const velocidad = 2;
    const ruidoX = (Math.random() - 0.5) * 0.12;
    const ruidoY = (Math.random() - 0.5) * 0.12;
    msg.x = Math.max(0, Math.min(filas - 1, msg.x + (dx / distancia) * velocidad + ruidoX));
    msg.y = Math.max(0, Math.min(columnas - 1, msg.y + (dy / distancia) * velocidad + ruidoY));
    trail[Math.round(msg.x)][Math.round(msg.y)] = 1;

    // Degradación: el ruido crece con los pasos.
    msg.binario = introducirRuido(msg.binario, 0.02 + msg.paso * 0.001);

    // Optimización: la repetición gana terreno.
    if (msg.coherence < 0.9) {
      msg.binario = optimizarCadena(msg.binario);
    }

    msg.coherence = calcularCoherencia(msg.binario);
    msg.novelty = calcularNovedad(msg.binario);
    if (msg.coherence > 0.7) {
      msg.novelty = Math.max(0, msg.novelty - 0.01);
    }
    msg.paso++;

    if (msg.binario.length < 2 || msg.coherence < 0.1) {
      msg.estado = "perdido";
      perdidos.push(msg);
      if (msg.id === 1) {
        m1Final = msg.coherence;
        m1NovedadFinal = msg.novelty;
        m1Estado = "perdido";
        historialM1.push([pasoActual, msg.coherence]);
      }
      mensajesEnTransito.splice(i, 1);
    }
  }
}

function actualizarGrid() {
  grid = Array.from({ length: filas }, () => Array(columnas).fill(0));
  grid[emisorX][emisorY] = 2;
  grid[receptorX][receptorY] = 2;

  for (const msg of mensajesEnTransito) {
    const x = Math.round(msg.x);
    const y = Math.round(msg.y);
    if (x >= 0 && x < filas && y >= 0 && y < columnas) {
      grid[x][y] = Math.max(grid[x][y], Math.max(0.05, msg.coherence));
    }
  }
}

function simboloCoherencia(valor) {
  if (valor >= 0.75) return "█";
  if (valor >= 0.5) return "▓";
  if (valor >= 0.25) return "▒";
  return "░";
}

function mostrarEstado(paso) {
  output("[CLEAR]");

  let gridText = "";
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      if (i === emisorX && j === emisorY) fila += "E";
      else if (i === receptorX && j === receptorY) fila += "R";
      else {
        const valor = grid[i][j];
        if (valor === 0) fila += trail[i][j] ? "·" : " ";
        else fila += simboloCoherencia(valor);
      }
    }
    gridText += fila + "\n";
  }

  output({
    type: "meta",
    text: `Paso ${paso} · ${mensajesEnTransito.length} en tránsito · ` +
          `${recibidos.length} ${recibidos.length === 1 ? "recibido" : "recibidos"}`
  });

  if (mensajesEnTransito.length > 0) {
    const lineas = mensajesEnTransito.map((msg) => {
      const rango = Math.max(1, receptorY - emisorY);
      const avance = Math.max(0, Math.min(100, Math.round(((msg.y - emisorY) / rango) * 100)));
      return `M${msg.id} ${msg.binario} · coh ${msg.coherence.toFixed(2)} · nov ${msg.novelty.toFixed(2)} · ${avance}%`;
    });
    output({ type: "legend", text: lineas.join("\n") });
  } else {
    output({ type: "legend", text: "Sin mensajes en tránsito." });
  }

  output({
    type: "legend",
    text: "E emisor · R receptor · · recorrido\n" +
          "█ coherencia alta · ▓ media-alta · ▒ media · ░ baja"
  });

  output({
    type: "grid",
    data: gridText,
    caption: "un mensaje cruza el espacio; el sombreado indica su coherencia",
    label: `Autómata de información, paso ${paso}`
  });
}

function finalizar() {
  output({
    type: "meta",
    text: `Resultado · ${recibidos.length} ${recibidos.length === 1 ? "recibido" : "recibidos"} · ` +
          `${perdidos.length} ${perdidos.length === 1 ? "perdido" : "perdidos"}`
  });
  output({
    type: "legend",
    text: `M1 · coherencia ${m1Inicial.toFixed(3)} → ${m1Final.toFixed(3)} · ` +
          `novedad final ${m1NovedadFinal.toFixed(3)} · ${m1Estado}`
  });

  if (historialM1.length >= 2) {
    output({ type: "meta", text: "Coherencia de M1" });
    output({
      type: "trace",
      points: historialM1,
      label: "Coherencia del primer mensaje a lo largo del recorrido"
    });
  }

  output({
    type: "conclusion",
    text:
      "La información cruzó el espacio.\n" +
      `${recibidos.length} ${recibidos.length === 1 ? "mensaje llegó" : "mensajes llegaron"} al receptor; ` +
      `${perdidos.length} ${perdidos.length === 1 ? "se perdió" : "se perdieron"} en el ruido.\n` +
      "La coherencia sube cuando el mensaje se repite; la novedad baja cuando se estabiliza.\n\n" +
      "¿Más coherencia es más máquina?\n" +
      "¿Menos coherencia es más humano?"
  });
}

function tick() {
  pasoActual++;

  if (creados < mensajes && (pasoActual === 1 || pasoActual % 6 === 0)) {
    crearMensaje();
    creados++;
  }

  moverMensajes();
  actualizarGrid();
  mostrarEstado(pasoActual);

  const m1 = mensajesEnTransito.find((msg) => msg.id === 1);
  if (m1) historialM1.push([pasoActual, m1.coherence]);

  if (creados >= mensajes && mensajesEnTransito.length === 0) {
    setTimeout(finalizar, 120);
    return;
  }

  setTimeout(tick, 90);
}

mostrarEstado(0);
setTimeout(tick, 90);
```
