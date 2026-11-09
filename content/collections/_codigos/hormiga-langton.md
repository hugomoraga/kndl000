---
layout: codigo
title: Hormiga de Langton
date: 2025-01-15
language: JavaScript
concept: "Una hormiga que sigue reglas simples. El caos que emerge del orden. El orden que emerge del caos."
---

```javascript
// Hormiga de Langton - Reglas simples, patrones complejos
const pedidos = parseInt(input("¿Cuántos pasos? (10–300)"), 10);
const pasos = Math.max(10, Math.min(300, isNaN(pedidos) ? 60 : pedidos));
const filas = 40;
const columnas = 60;

// Crear grid inicial (todo blanco/0)
let grid = [];
for (let i = 0; i < filas; i++) {
  grid[i] = [];
  for (let j = 0; j < columnas; j++) {
    grid[i][j] = 0; // 0 = blanco, 1 = negro
  }
}

// La hormiga: posición y dirección
// Direcciones: 0 = arriba, 1 = derecha, 2 = abajo, 3 = izquierda
let hormiga = {
  x: Math.floor(filas / 2),
  y: Math.floor(columnas / 2),
  direccion: 0
};

// Reglas de Langton:
// 1. Si está en blanco: girar 90° derecha, cambiar a negro, avanzar
// 2. Si está en negro: girar 90° izquierda, cambiar a blanco, avanzar

function girarDerecha(direccion) {
  return (direccion + 1) % 4;
}

function girarIzquierda(direccion) {
  return (direccion + 3) % 4;
}

function avanzar(x, y, direccion) {
  switch(direccion) {
    case 0: return [x - 1, y]; // Arriba
    case 1: return [x, y + 1]; // Derecha
    case 2: return [x + 1, y]; // Abajo
    case 3: return [x, y - 1]; // Izquierda
  }
}

function siguientePaso() {
  const celda = grid[hormiga.x][hormiga.y];
  
  if (celda === 0) {
    // Blanco: girar derecha, cambiar a negro
    hormiga.direccion = girarDerecha(hormiga.direccion);
    grid[hormiga.x][hormiga.y] = 1;
  } else {
    // Negro: girar izquierda, cambiar a blanco
    hormiga.direccion = girarIzquierda(hormiga.direccion);
    grid[hormiga.x][hormiga.y] = 0;
  }
  
  // Avanzar
  const [nuevoX, nuevoY] = avanzar(hormiga.x, hormiga.y, hormiga.direccion);
  
  // Verificar bordes (wrap around)
  if (nuevoX < 0) hormiga.x = filas - 1;
  else if (nuevoX >= filas) hormiga.x = 0;
  else hormiga.x = nuevoX;
  
  if (nuevoY < 0) hormiga.y = columnas - 1;
  else if (nuevoY >= columnas) hormiga.y = 0;
  else hormiga.y = nuevoY;
}

const historialNegras = [];
let negrasFinal = 0;

function mostrarEstado(paso) {
  output("[CLEAR]");

  let gridText = "";
  let negras = 0;
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      if (i === hormiga.x && j === hormiga.y) {
        fila += "●";
      } else if (grid[i][j] === 1) {
        fila += "█";
        negras++;
      } else {
        fila += " ";
      }
    }
    gridText += fila + "\n";
  }

  negrasFinal = negras;
  historialNegras.push([paso, negras]);

  output({ type: "meta", text: `Paso ${paso} · ${filas} × ${columnas} · ${negras} celdas negras` });
  output({
    type: "grid",
    data: gridText,
    caption: "● hormiga · █ celda negra · espacio = celda blanca",
    label: "Hormiga de Langton, paso " + paso
  });
}

// Mostrar estado inicial
mostrarEstado(0);

// Evolucionar
let pasoActual = 0;
function evolucionar() {
  if (pasoActual < pasos) {
    setTimeout(() => {
      pasoActual++;
      siguientePaso();
      mostrarEstado(pasoActual);
      evolucionar();
    }, 40); // 40 milisegundos entre pasos
  } else {
    setTimeout(() => {
      if (historialNegras.length >= 2) {
        output({ type: "meta", text: "Celdas negras por paso" });
        output({
          type: "trace",
          points: historialNegras,
          label: "Celdas negras construidas por la hormiga"
        });
      }
      output({
        type: "conclusion",
        text:
          `La hormiga completó ${pasos} pasos y dejó ${negrasFinal} celdas negras.\n` +
          "De reglas simples emergen patrones complejos.\n" +
          "¿El orden crea el caos o el caos crea el orden?"
      });
    }, 100);
  }
}

evolucionar();
```

---

_Una hormiga que sigue reglas. Un camino que se construye. Un patrón que emerge._

