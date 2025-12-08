---
layout: codigo
title: Autómata de Información
date: 2025-01-15
language: JavaScript
concept: "El emisor y el receptor. La información que se degrada hacia el ruido. La coherencia que se optimiza. La estabilización que emerge."
---

```javascript
// Emisor y Receptor - La información que tiende al ruido y la estabilización
const mensajes = parseInt(input("¿Cuántos mensajes quieres observar?"));
const filas = 30;
const columnas = 60;

// Crear grid
let grid = [];
for (let i = 0; i < filas; i++) {
  grid[i] = [];
  for (let j = 0; j < columnas; j++) {
    grid[i][j] = 0; // 0 = vacío, números = intensidad del mensaje
  }
}

// Posiciones del emisor y receptor
const emisorX = Math.floor(filas / 2);
const emisorY = 5;
const receptorX = Math.floor(filas / 2);
const receptorY = columnas - 5;

// Mensajes en tránsito: {x, y, binario, coherence, novelty, paso}
let mensajesEnTransito = [];

// Generar cadena binaria inicial
function generarBinario(longitud = 8) {
  let binario = "";
  for (let i = 0; i < longitud; i++) {
    binario += Math.random() > 0.5 ? "1" : "0";
  }
  return binario;
}

// Calcular coherencia de una cadena binaria (patrones repetitivos = más coherencia)
function calcularCoherencia(binario) {
  if (binario.length === 0) return 0;
  
  // Contar patrones repetitivos (más repetición = más coherencia = más máquina)
  let patrones = 0;
  for (let i = 0; i < binario.length - 1; i++) {
    if (binario[i] === binario[i + 1]) patrones++;
  }
  
  return patrones / (binario.length - 1);
}

// Calcular novedad (diversidad de bits = más novedad = más humano)
function calcularNovedad(binario) {
  if (binario.length === 0) return 0;
  
  const unos = (binario.match(/1/g) || []).length;
  const ceros = (binario.match(/0/g) || []).length;
  const diversidad = Math.abs(unos - ceros) / binario.length;
  
  // Más diversidad = más novedad = más humano
  return 1 - diversidad;
}

// Introducir ruido en la cadena binaria (degradación)
function introducirRuido(binario, probabilidad) {
  let nuevoBinario = "";
  for (let i = 0; i < binario.length; i++) {
    if (Math.random() < probabilidad) {
      // Cambiar bit (ruido)
      nuevoBinario += binario[i] === "1" ? "0" : "1";
    } else {
      nuevoBinario += binario[i];
    }
  }
  return nuevoBinario;
}

// Optimizar cadena (reducir tokens, aumentar coherencia)
function optimizarCadena(binario) {
  // Reducir longitud (tokens se achican)
  if (binario.length > 4 && Math.random() < 0.1) {
    // Eliminar bits redundantes
    const mitad = Math.floor(binario.length / 2);
    binario = binario.substring(0, mitad) + binario.substring(mitad + 1);
  }
  
  // Aumentar coherencia (patrones más repetitivos)
  if (Math.random() < 0.2) {
    // Reemplazar bits para crear patrones
    let nuevoBinario = "";
    for (let i = 0; i < binario.length; i++) {
      if (i > 0 && binario[i - 1] === binario[i]) {
        nuevoBinario += binario[i]; // Mantener patrón
      } else {
        nuevoBinario += Math.random() > 0.5 ? binario[i] : binario[i - 1] || binario[i];
      }
    }
    binario = nuevoBinario;
  }
  
  return binario;
}

// Crear un nuevo mensaje desde el emisor
function crearMensaje() {
  const binarioInicial = generarBinario(8);
  const coherenceInicial = calcularCoherencia(binarioInicial);
  const noveltyInicial = calcularNovedad(binarioInicial);
  
  mensajesEnTransito.push({
    x: emisorX,
    y: emisorY,
    binario: binarioInicial,
    coherence: coherenceInicial,
    novelty: noveltyInicial,
    paso: 0,
    objetivoX: receptorX,
    objetivoY: receptorY
  });
}

// Mover mensajes hacia el receptor
function moverMensajes() {
  for (let i = mensajesEnTransito.length - 1; i >= 0; i--) {
    const msg = mensajesEnTransito[i];
    
    // Calcular dirección hacia el receptor
    const dx = msg.objetivoX - msg.x;
    const dy = msg.objetivoY - msg.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    
    if (distancia < 2) {
      // Llegó al receptor
      mensajesEnTransito.splice(i, 1);
      continue;
    }
    
    // Movimiento hacia el receptor
    const paso = 1.2;
    const ruidoX = (Math.random() - 0.5) * 0.2;
    const ruidoY = (Math.random() - 0.5) * 0.2;
    
    const dirX = dx / distancia;
    const dirY = dy / distancia;
    
    const nuevoX = msg.x + dirX * paso + ruidoX;
    const nuevoY = msg.y + dirY * paso + ruidoY;
    
    msg.x = Math.max(0, Math.min(filas - 1, nuevoX));
    msg.y = Math.max(0, Math.min(columnas - 1, nuevoY));
    
    // Degradación: la información tiende al ruido
    const probabilidadRuido = 0.02 + (msg.paso * 0.001); // Aumenta con el tiempo
    msg.binario = introducirRuido(msg.binario, probabilidadRuido);
    
    // Optimización: la coherencia aumenta (más máquina)
    // Los tokens se achican, todo se vuelve más inmediato
    if (msg.coherence < 0.9) {
      msg.binario = optimizarCadena(msg.binario);
    }
    
    // Recalcular coherencia y novedad
    msg.coherence = calcularCoherencia(msg.binario);
    msg.novelty = calcularNovedad(msg.binario);
    
    // La información tiende a estabilizarse
    // Más coherencia = más máquina = menos novedad
    if (msg.coherence > 0.7) {
      msg.novelty = Math.max(0, msg.novelty - 0.01);
    }
    
    msg.paso++;
    
    // Si la cadena se vuelve completamente ruido o muy corta, se pierde
    if (msg.binario.length < 2 || msg.coherence < 0.1) {
      mensajesEnTransito.splice(i, 1);
    }
  }
}

// Actualizar grid con los mensajes
function actualizarGrid() {
  // Limpiar grid
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      grid[i][j] = 0;
    }
  }
  
  // Marcar emisor y receptor
  grid[emisorX][emisorY] = 2;
  grid[receptorX][receptorY] = 2;
  
  // Marcar mensajes en tránsito
  for (let msg of mensajesEnTransito) {
    const x = Math.round(msg.x);
    const y = Math.round(msg.y);
    if (x >= 0 && x < filas && y >= 0 && y < columnas) {
      // La intensidad depende de la coherencia (más coherencia = más visible)
      grid[x][y] = Math.max(grid[x][y] || 0, msg.coherence);
    }
  }
}

// Mostrar estado
function mostrarEstado(mensajeActual) {
  output("[CLEAR]");
  
  let outputText = `Mensaje ${mensajeActual}:\n`;
  outputText += `Mensajes en tránsito: ${mensajesEnTransito.length}\n`;
  
  if (mensajesEnTransito.length > 0) {
    const msg = mensajesEnTransito[0]; // Mostrar primer mensaje como ejemplo
    outputText += `Ejemplo: "${msg.binario}" (${msg.binario.length} bits)\n`;
    outputText += `Coherencia: ${msg.coherence.toFixed(3)} ${msg.coherence > 0.7 ? "(máquina)" : "(humano)"}\n`;
    outputText += `Novedad: ${msg.novelty.toFixed(3)} ${msg.novelty < 0.3 ? "(estabilizado)" : "(variable)"}\n`;
    outputText += `Pasos: ${msg.paso}\n`;
  }
  
  outputText += `\n`;
  outputText += `Símbolos:\n`;
  outputText += `  E = Emisor\n`;
  outputText += `  R = Receptor\n`;
  outputText += `  · = coherencia 0.0-0.3 (humano, ruido)\n`;
  outputText += `  ○ = coherencia 0.3-0.5 (transición)\n`;
  outputText += `  ◉ = coherencia 0.5-0.7 (optimizando)\n`;
  outputText += `  ◐ = coherencia 0.7-0.9 (máquina)\n`;
  outputText += `  █ = coherencia máxima (estabilizado)\n`;
  outputText += `  (espacio) = vacío\n\n`;
  
  // Dibujar grid
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      const valor = grid[i][j];
      if (i === emisorX && j === emisorY) {
        fila += "E";
      } else if (i === receptorX && j === receptorY) {
        fila += "R";
      } else if (valor === 0) {
        fila += " ";
      } else if (valor >= 0.9) {
        fila += "█";
      } else if (valor >= 0.7) {
        fila += "◐";
      } else if (valor >= 0.5) {
        fila += "◉";
      } else if (valor >= 0.3) {
        fila += "○";
      } else {
        fila += "·";
      }
    }
    outputText += fila + "\n";
  }
  
  output(outputText);
}

// Mostrar estado inicial
mostrarEstado(0);

// Evolucionar
let mensajeActual = 0;
let pasoActual = 0;

function evolucionar() {
  if (mensajeActual < mensajes) {
    setTimeout(() => {
      pasoActual++;
      
      // Crear nuevo mensaje cada 8 pasos
      if (pasoActual % 8 === 0 && mensajeActual < mensajes) {
        crearMensaje();
        mensajeActual++;
      }
      
      // Mover mensajes
      moverMensajes();
      
      // Actualizar grid
      actualizarGrid();
      
      // Mostrar estado
      mostrarEstado(mensajeActual);
      
      evolucionar();
    }, 150);
  } else {
    // Esperar a que los mensajes restantes lleguen
    if (mensajesEnTransito.length > 0) {
      setTimeout(() => {
        moverMensajes();
        actualizarGrid();
        mostrarEstado(mensajeActual);
        evolucionar();
      }, 150);
    } else {
      setTimeout(() => {
        output("");
        output("La información ha viajado.");
        output("Algunos mensajes se degradaron hacia el ruido.");
        output("Otros se optimizaron, aumentando su coherencia.");
        output("Los tokens se achicaron. Todo se volvió más inmediato.");
        output("La información tiende a estabilizarse.");
        output("¿Más coherencia es más máquina? ¿Menos coherencia es más humano?");
      }, 100);
    }
  }
}

evolucionar();
```

---

_El emisor y el receptor. La información que se degrada hacia el ruido. La coherencia que se optimiza. La estabilización que emerge._
