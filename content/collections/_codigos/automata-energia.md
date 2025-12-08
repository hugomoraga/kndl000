---
layout: codigo
title: Autómata de Energía
date: 2025-01-15
language: JavaScript
concept: "La energía busca equilibrio. Las anomalías emergen. El sistema fluye hacia la estabilidad."
---

```javascript
// Autómata de Energía - La búsqueda del equilibrio
const generaciones = parseInt(input("¿Cuántas generaciones quieres observar?"));
const WIDTH = 50;
const HEIGHT = 20;

// Crear grid inicial con valores aleatorios
function emptyGrid() {
  const grid = [];
  for (let y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      grid[y][x] = Math.random() * 0.3;
    }
  }
  return grid;
}

// Obtener vecinos (8 direcciones)
function neighbours(grid, x, y) {
  const vals = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
        vals.push(grid[ny][nx]);
      }
    }
  }
  return vals;
}

// Evolucionar el grid
function evolve(grid) {
  const newGrid = [];
  for (let y = 0; y < HEIGHT; y++) {
    newGrid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      let e = grid[y][x];
      const nb = neighbours(grid, x, y);
      const avg = nb.reduce((sum, val) => sum + val, 0) / nb.length;
      
      // La energía busca equilibrio con vecinos
      e = (e * 0.6) + (avg * 0.4);
      
      // Introducir pequeñas anomalías
      if (Math.random() < 0.01) {
        e += Math.random() * 0.6 - 0.3; // uniform(-0.3, 0.3)
      }
      
      // Limitar
      e = Math.max(0, Math.min(1, e));
      
      newGrid[y][x] = e;
    }
  }
  return newGrid;
}

// Renderizar grid
function render(grid) {
  const chars = " .:*O@";
  let out = "";
  for (let row of grid) {
    for (let val of row) {
      const idx = Math.floor(val * (chars.length - 1));
      out += chars[idx];
    }
    out += "\n";
  }
  return out;
}

// Mostrar estado
function mostrarEstado(gen, grid) {
  output("[CLEAR]");
  
  let outputText = `Generación ${gen}:\n`;
  outputText += `Grid: ${WIDTH}x${HEIGHT}\n`;
  outputText += `\n`;
  outputText += `Símbolos:\n`;
  outputText += `  (espacio) = energía 0.0-0.17 (muy baja)\n`;
  outputText += `  . = energía 0.17-0.33 (baja)\n`;
  outputText += `  : = energía 0.33-0.5 (media)\n`;
  outputText += `  * = energía 0.5-0.67 (alta)\n`;
  outputText += `  O = energía 0.67-0.83 (muy alta)\n`;
  outputText += `  @ = energía 0.83-1.0 (máxima)\n\n`;
  
  outputText += render(grid);
  
  output(outputText);
}

// Observador - Captura momentos peculiares
let momentosCapturados = [];
let gridAnterior = null;

// Detectar patrones interesantes
function detectarPatrones(grid) {
  const patrones = {
    variacion: 0,
    anomalias: 0,
    equilibrio: 0,
    concentracion: 0
  };
  
  let total = 0;
  let suma = 0;
  let maxVal = 0;
  let minVal = 1;
  let valoresExtremos = 0;
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const val = grid[y][x];
      total++;
      suma += val;
      maxVal = Math.max(maxVal, val);
      minVal = Math.min(minVal, val);
      
      // Detectar anomalías (valores extremos)
      if (val > 0.8 || val < 0.1) {
        valoresExtremos++;
      }
    }
  }
  
  const promedio = suma / total;
  const rango = maxVal - minVal;
  
  // Calcular variación (diferencia con generación anterior)
  if (gridAnterior) {
    let diferenciaTotal = 0;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        diferenciaTotal += Math.abs(grid[y][x] - gridAnterior[y][x]);
      }
    }
    patrones.variacion = diferenciaTotal / total;
  }
  
  patrones.anomalias = valoresExtremos / total;
  patrones.equilibrio = 1 - rango; // Menor rango = más equilibrio
  patrones.concentracion = Math.abs(promedio - 0.5); // Lejos del centro = más concentración
  
  return patrones;
}

// Capturar momento peculiar
function capturarMomento(gen, grid, patrones, razon) {
  // Guardar snapshot del grid
  const snapshot = [];
  for (let y = 0; y < HEIGHT; y++) {
    snapshot[y] = [...grid[y]];
  }
  
  momentosCapturados.push({
    generacion: gen,
    grid: snapshot,
    patrones: {
      variacion: patrones.variacion.toFixed(4),
      anomalias: patrones.anomalias.toFixed(4),
      equilibrio: patrones.equilibrio.toFixed(4),
      concentracion: patrones.concentracion.toFixed(4)
    },
    razon: razon
  });
}

// Observar y capturar momentos interesantes
function observar(gen, grid) {
  const patrones = detectarPatrones(grid);
  
  // Detectar momentos peculiares
  if (patrones.variacion > 0.15) {
    capturarMomento(gen, grid, patrones, "Alta variación - El sistema cambió bruscamente");
  } else if (patrones.anomalias > 0.1) {
    capturarMomento(gen, grid, patrones, "Muchas anomalías - Valores extremos emergieron");
  } else if (patrones.equilibrio > 0.9) {
    capturarMomento(gen, grid, patrones, "Alto equilibrio - El sistema se estabilizó");
  } else if (patrones.concentracion > 0.4) {
    capturarMomento(gen, grid, patrones, "Alta concentración - Energía se concentró");
  }
  
  // Guardar grid anterior para comparación
  gridAnterior = [];
  for (let y = 0; y < HEIGHT; y++) {
    gridAnterior[y] = [...grid[y]];
  }
}

// Mostrar momentos capturados
function mostrarMomentosCapturados() {
  if (momentosCapturados.length === 0) {
    output("\nEl observador no capturó momentos peculiares.");
    output("El sistema evolucionó de forma estable.");
    return;
  }
  
  let outputText = "\n=== MOMENTOS CAPTURADOS POR EL OBSERVADOR ===\n\n";
  
  for (let i = 0; i < momentosCapturados.length; i++) {
    const momento = momentosCapturados[i];
    outputText += `Momento ${i + 1} - Generación ${momento.generacion}:\n`;
    outputText += `Razón: ${momento.razon}\n`;
    outputText += `Variación: ${momento.patrones.variacion} | Anomalías: ${momento.patrones.anomalias}\n`;
    outputText += `Equilibrio: ${momento.patrones.equilibrio} | Concentración: ${momento.patrones.concentracion}\n\n`;
    outputText += render(momento.grid);
    outputText += "\n";
  }
  
  output(outputText);
}

// Inicializar
let grid = emptyGrid();
mostrarEstado(0, grid);
observar(0, grid);

// Evolucionar
let genActual = 0;
function evolucionar() {
  if (genActual < generaciones) {
    setTimeout(() => {
      genActual++;
      grid = evolve(grid);
      observar(genActual, grid); // Observar antes de mostrar
      mostrarEstado(genActual, grid);
      evolucionar();
    }, 10); // 50 milisegundos entre generaciones
  } else {
    setTimeout(() => {
      let finalText = "\n";
      finalText += "La energía ha evolucionado.\n";
      finalText += "Buscó equilibrio con sus vecinos.\n";
      finalText += "Las anomalías emergieron y se disiparon.\n";
      finalText += "El sistema fluyó hacia la estabilidad.\n";
      finalText += "\n";
      finalText += "El observador analizó " + generaciones + " generaciones.\n";
      finalText += "Capturó " + momentosCapturados.length + " momentos peculiares.\n";
      
      output(finalText);
      
      // Mostrar momentos capturados después de un pequeño delay
      setTimeout(() => {
        mostrarMomentosCapturados();
      }, 300);
    }, 100);
  }
}

evolucionar();
```

---

_La energía busca equilibrio. Las anomalías emergen. El sistema fluye hacia la estabilidad._

