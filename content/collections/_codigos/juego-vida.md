---
layout: codigo
title: Juego de la vida
date: 2025-01-15
language: JavaScript
concept: "La vida como reglas simples. La complejidad emergente de la simplicidad."
---

```javascript
// Juego de la vida - Reglas simples, vida compleja
const generaciones = parseInt(input("¿Cuántas generaciones quieres observar?"));
const filas = 20; // Altura del grid
const columnas = 50; // Ancho del grid (más horizontal)

// Crear grid inicial aleatorio
let grid = [];
for (let i = 0; i < filas; i++) {
  grid[i] = [];
  for (let j = 0; j < columnas; j++) {
    grid[i][j] = Math.random() > 0.7 ? 1 : 0;
  }
}

// Reglas de la vida:
// 1. Célula viva con 2-3 vecinos vive
// 2. Célula muerta con 3 vecinos nace
// 3. Todo lo demás muere

function contarVecinos(grid, x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nx = x + i;
      const ny = y + j;
      if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas) {
        count += grid[nx][ny];
      }
    }
  }
  return count;
}

function siguienteGeneracion(grid) {
  const nuevoGrid = [];
  for (let i = 0; i < filas; i++) {
    nuevoGrid[i] = [];
    for (let j = 0; j < columnas; j++) {
      const vecinos = contarVecinos(grid, i, j);
      if (grid[i][j] === 1) {
        nuevoGrid[i][j] = (vecinos === 2 || vecinos === 3) ? 1 : 0;
      } else {
        nuevoGrid[i][j] = (vecinos === 3) ? 1 : 0;
      }
    }
  }
  return nuevoGrid;
}

// Detectar si el grid cambió
function hayCambios(gridAnterior, gridNuevo) {
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (gridAnterior[i][j] !== gridNuevo[i][j]) {
        return true; // Hay cambios
      }
    }
  }
  return false; // No hay cambios, la vida se estabilizó
}

// Contar células vivas
function contarVivas(grid) {
  let count = 0;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (grid[i][j] === 1) count++;
    }
  }
  return count;
}

function mostrarGrid(grid, gen) {
  output("[CLEAR]");

  let gridText = "";
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      fila += grid[i][j] === 1 ? "█" : " ";
    }
    gridText += fila + "\n";
  }

  output({
    type: "meta",
    text: `Generación ${gen} · ${filas} × ${columnas} · ${contarVivas(grid)} células vivas`
  });
  output({
    type: "grid",
    data: gridText,
    caption: "█ célula viva · espacio = célula muerta",
    label: "Juego de la vida, generación " + gen
  });
}

// Mostrar generación inicial
mostrarGrid(grid, 0);

// Evolucionar con delay
let genActual = 0;
let gridAnterior = null;

function evolucionar() {
  if (genActual < generaciones) {
    setTimeout(() => {
      genActual++;
      const gridNuevo = siguienteGeneracion(grid);
      
      // Detectar si hay cambios
      if (gridAnterior !== null && !hayCambios(gridAnterior, gridNuevo)) {
        // No hay cambios, la vida se estabilizó
        const vivas = contarVivas(gridNuevo);
        mostrarGrid(gridNuevo, genActual);
        output({
          type: "conclusion",
          text: vivas === 0
            ? "La vida ha muerto. Extinción total en la generación " + genActual + ".\nLa estabilidad es también una forma de existencia."
            : "La vida se ha estabilizado en la generación " + genActual + ".\nQuedan " + vivas + " células vivas en un patrón estático.\nLa estabilidad es también una forma de existencia."
        });
        return; // Detener la evolución
      }
      
      gridAnterior = grid.map(fila => [...fila]); // Copiar grid anterior
      grid = gridNuevo;
      mostrarGrid(grid, genActual);
      evolucionar();
    }, 100); // 100 milisegundos
  } else {
    // Esperar un momento antes de mostrar el mensaje final
    setTimeout(() => {
      const vivas = contarVivas(grid);
      output({
        type: "conclusion",
        text: "Evolución completada después de " + generaciones + " generaciones.\n" +
              "Quedan " + vivas + " células vivas.\n" +
              "La vida emerge de reglas simples.\n" +
              "¿Qué es la vida sino reglas que se siguen?"
      });
    }, 100);
  }
}

// Iniciar evolución
evolucionar();

```

---

_La vida como algoritmo. Reglas simples que generan complejidad infinita._

