---
layout: codigo
title: Hormiga de Langton
date: 2025-01-15
language: JavaScript
concept: "Una hormiga que sigue reglas simples. El caos que emerge del orden. El orden que emerge del caos."
---

```javascript
// Hormiga de Langton - Reglas simples, patrones complejos
const pasos = parseInt(input("¿Cuántos pasos quieres observar?"));
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

function mostrarEstado(paso) {
  // Limpiar output anterior
  output("[CLEAR]");
  
  // Construir output
  let outputText = `Paso ${paso}:\n\n`;
  
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      if (i === hormiga.x && j === hormiga.y) {
        // Mostrar la hormiga
        fila += "●";
      } else if (grid[i][j] === 1) {
        // Celda negra
        fila += "█";
      } else {
        // Celda blanca
        fila += " ";
      }
    }
    outputText += fila + "\n";
  }
  
  output(outputText);
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
    }, 50); // 50 milisegundos entre pasos
  } else {
    setTimeout(() => {
      output("");
      output("La hormiga ha completado su camino.");
      output("De reglas simples emergen patrones complejos.");
      output("¿El orden crea el caos o el caos crea el orden?");
    }, 100);
  }
}

evolucionar();
```

---

_Una hormiga que sigue reglas. Un camino que se construye. Un patrón que emerge._

