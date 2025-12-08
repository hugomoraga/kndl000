---
layout: codigo
title: Incendio Forestal
date: 2025-01-15
language: JavaScript
concept: "El fuego que se propaga. La destrucción que crea. El ciclo que renace."
---

```javascript
// Incendio Forestal - Propagación del fuego
const generaciones = parseInt(input("¿Cuántas generaciones quieres observar?"));
const filas = 30;
const columnas = 60;

// Estados: 0 = vacío, 1 = árbol, 2 = fuego, 3 = ceniza
let grid = [];
for (let i = 0; i < filas; i++) {
  grid[i] = [];
  for (let j = 0; j < columnas; j++) {
    // 60% árboles, 40% vacío
    grid[i][j] = Math.random() > 0.4 ? 1 : 0;
  }
}

// Encender algunos árboles al azar (5% inicialmente)
for (let i = 0; i < filas; i++) {
  for (let j = 0; j < columnas; j++) {
    if (grid[i][j] === 1 && Math.random() < 0.05) {
      grid[i][j] = 2; // Fuego
    }
  }
}

// Reglas del incendio:
// 1. Fuego (2) → Ceniza (3) en la siguiente generación
// 2. Árbol (1) → Fuego (2) si tiene al menos 1 vecino en fuego
// 3. Ceniza (3) → Árbol (1) con probabilidad baja (renacimiento)
// 4. Vacío (0) → Árbol (1) con probabilidad muy baja (crecimiento)

function contarVecinosEnFuego(grid, x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nx = x + i;
      const ny = y + j;
      if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas) {
        if (grid[nx][ny] === 2) count++;
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
      const estado = grid[i][j];
      
      if (estado === 2) {
        // Fuego → Ceniza
        nuevoGrid[i][j] = 3;
      } else if (estado === 1) {
        // Árbol → Fuego si tiene vecinos en fuego
        const vecinosEnFuego = contarVecinosEnFuego(grid, i, j);
        nuevoGrid[i][j] = vecinosEnFuego > 0 ? 2 : 1;
      } else if (estado === 3) {
        // Ceniza → Árbol con 2% de probabilidad (renacimiento lento)
        nuevoGrid[i][j] = Math.random() < 0.02 ? 1 : 3;
      } else {
        // Vacío → Árbol con 0.5% de probabilidad (crecimiento muy lento)
        nuevoGrid[i][j] = Math.random() < 0.005 ? 1 : 0;
      }
    }
  }
  return nuevoGrid;
}

function contarEstados(grid) {
  let arboles = 0, fuego = 0, ceniza = 0, vacio = 0;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (grid[i][j] === 1) arboles++;
      else if (grid[i][j] === 2) fuego++;
      else if (grid[i][j] === 3) ceniza++;
      else vacio++;
    }
  }
  return { arboles, fuego, ceniza, vacio };
}

function mostrarEstado(grid, gen) {
  // Limpiar output anterior
  output("[CLEAR]");
  
  const estados = contarEstados(grid);
  let outputText = `Generación ${gen}:\n`;
  outputText += `Árboles: ${estados.arboles} | Fuego: ${estados.fuego} | Ceniza: ${estados.ceniza} | Vacío: ${estados.vacio}\n\n`;
  
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      if (grid[i][j] === 0) fila += " ";      // Vacío
      else if (grid[i][j] === 1) fila += "🌲"; // Árbol
      else if (grid[i][j] === 2) fila += "🔥"; // Fuego
      else fila += "░";                        // Ceniza
    }
    outputText += fila + "\n";
  }
  
  output(outputText);
}

// Detectar si el fuego se extinguió
function hayFuego(grid) {
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (grid[i][j] === 2) return true;
    }
  }
  return false;
}

// Mostrar estado inicial
mostrarEstado(grid, 0);

// Evolucionar
let genActual = 0;
function evolucionar() {
  if (genActual < generaciones) {
    setTimeout(() => {
      genActual++;
      grid = siguienteGeneracion(grid);
      mostrarEstado(grid, genActual);
      
      // Detectar si el fuego se extinguió
      if (!hayFuego(grid) && genActual > 5) {
        const estados = contarEstados(grid);
        output("");
        output("El fuego se ha extinguido en la generación " + genActual + ".");
        output("Quedan " + estados.arboles + " árboles y " + estados.ceniza + " cenizas.");
        output("La naturaleza se regenera. El ciclo continúa.");
        return; // Detener la evolución
      }
      
      evolucionar();
    }, 200); // 200 milisegundos entre generaciones
  } else {
    setTimeout(() => {
      const estados = contarEstados(grid);
      output("");
      output("Simulación completada después de " + generaciones + " generaciones.");
      output("El fuego destruye, pero también renueva.");
      output("En la ceniza, la semilla del renacimiento.");
    }, 100);
  }
}

evolucionar();
```

---

_El fuego que consume. La ceniza que fertiliza. El ciclo que renace._

