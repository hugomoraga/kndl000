---
layout: codigo
title: Autómata de Energía
date: 2025-01-15
language: JavaScript
concept: "La energía busca equilibrio. Las anomalías emergen. El sistema fluye hacia la estabilidad."
---

```javascript
// Autómata de Energía - La búsqueda del equilibrio
const pedidas = parseInt(input("¿Cuántas generaciones? (2–30)"), 10);
const generaciones = Math.max(2, Math.min(30, isNaN(pedidas) ? 8 : pedidas));
const WIDTH = 50;
const HEIGHT = 20;

// Crear grid inicial con valores aleatorios
function emptyGrid() {
  const grid = [];
  for (let y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      grid[y][x] = Math.random();
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

// Resumen numérico del estado de energía.
function resumenEnergia(grid) {
  let total = 0;
  let suma = 0;
  let maxVal = 0;
  let minVal = 1;
  let extremos = 0;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const val = grid[y][x];
      total++;
      suma += val;
      maxVal = Math.max(maxVal, val);
      minVal = Math.min(minVal, val);
      if (val > 0.8 || val < 0.1) extremos++;
    }
  }

  const promedio = suma / total;
  const rango = maxVal - minVal;

  return {
    promedio,
    rango,
    max: maxVal,
    min: minVal,
    anomalias: extremos / total,
    equilibrio: 1 - rango
  };
}

// Mostrar estado
function mostrarEstado(gen, grid) {
  output("[CLEAR]");

  const resumen = resumenEnergia(grid);
  historialRango.push([gen, resumen.rango]);
  energiaFinal = resumen.promedio;

  output({ type: "meta", text: `Generación ${gen} · ${WIDTH} × ${HEIGHT}` });
  output({
    type: "legend",
    text: `energía media ${resumen.promedio.toFixed(3)} · rango ${resumen.rango.toFixed(3)} · ` +
          `anomalías ${(resumen.anomalias * 100).toFixed(1)}%`
  });
  output({ type: "legend", text: "energía: espacio 0 · . baja · : media · * alta · O muy alta · @ máxima" });
  output({
    type: "grid",
    data: render(grid),
    caption: "la energía se difunde entre vecinos hasta encontrar equilibrio",
    label: "Autómata de energía, generación " + gen
  });
}

// Observador - Captura momentos peculiares
let momentosCapturados = [];
let gridAnterior = null;
const historialRango = [];
let energiaFinal = 0;

// Detectar patrones interesantes
function detectarPatrones(grid) {
  const resumen = resumenEnergia(grid);
  const patrones = {
    variacion: 0,
    anomalias: resumen.anomalias,
    equilibrio: resumen.equilibrio,
    concentracion: Math.abs(resumen.promedio - 0.5)
  };

  if (gridAnterior) {
    let diferenciaTotal = 0;
    const total = WIDTH * HEIGHT;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        diferenciaTotal += Math.abs(grid[y][x] - gridAnterior[y][x]);
      }
    }
    patrones.variacion = diferenciaTotal / total;
  }

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

// Mostrar momentos capturados (los primeros, para no saturar la lectura)
function mostrarMomentosCapturados() {
  if (momentosCapturados.length === 0) {
    output({
      type: "legend",
      text: "El observador no capturó momentos peculiares. El sistema evolucionó de forma estable."
    });
    return;
  }

  const visibles = momentosCapturados.slice(0, 1);
  output({
    type: "meta",
    text: `Momentos capturados: ${momentosCapturados.length} · mostrando ${visibles.length}`
  });

  visibles.forEach((momento, i) => {
    output({ type: "meta", text: `Momento ${i + 1} · generación ${momento.generacion}` });
    output({
      type: "legend",
      text: `${momento.razon}\n` +
            `variación ${momento.patrones.variacion} · anomalías ${momento.patrones.anomalias} · ` +
            `equilibrio ${momento.patrones.equilibrio} · concentración ${momento.patrones.concentracion}`
    });
    output({
      type: "grid",
      data: render(momento.grid),
      caption: "instantánea del sistema en un momento peculiar",
      label: `Momento ${i + 1}, generación ${momento.generacion}`
    });
  });
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
      mostrarMomentosCapturados();

      if (historialRango.length >= 2) {
        output({ type: "meta", text: "Rango de energía por generación" });
        output({
          type: "trace",
          points: historialRango,
          label: "Rango de energía del sistema a lo largo de las generaciones"
        });
      }

      const rangoInicial = historialRango[0] ? historialRango[0][1] : 0;
      const rangoFinal = historialRango.length
        ? historialRango[historialRango.length - 1][1]
        : 0;
      const cantidadMomentos = momentosCapturados.length;
      output({
        type: "conclusion",
        text: "La energía ha evolucionado.\n" +
              "Buscó equilibrio con sus vecinos.\n" +
              "Las anomalías emergieron y se disiparon.\n" +
              "El sistema fluyó hacia la estabilidad.\n\n" +
              "Energía media final: " + energiaFinal.toFixed(3) + ".\n" +
              "Rango de energía: " + rangoInicial.toFixed(3) + " → " + rangoFinal.toFixed(3) + ".\n" +
              "El observador analizó " + generaciones + " generaciones.\n" +
              "Capturó " + cantidadMomentos + " " +
              (cantidadMomentos === 1 ? "momento peculiar." : "momentos peculiares.")
      });
    }, 100);
  }
}

evolucionar();
```
