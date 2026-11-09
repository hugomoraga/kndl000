---
layout: codigo
title: Espiral de Fibonacci
date: 2025-01-15
language: JavaScript
concept: "La recursión como principio universal. La proporción que se encuentra en todo. La belleza matemática que emerge de patrones simples."
---

```javascript
// Espiral de Fibonacci — la proporción que emerge de sumar los dos términos anteriores.
// Cada generación agrega un término, revela un tramo de la espiral áurea y muestra
// el ratio F(n)/F(n−1) acercándose a φ.

const pedidos = parseInt(input("¿Cuántos términos de Fibonacci? (3–12)"), 10);
const iteraciones = Math.max(3, Math.min(12, isNaN(pedidos) ? 8 : pedidos));

const phi = (1 + Math.sqrt(5)) / 2;
const filas = 31;
const columnas = 31;
const centro = Math.floor(filas / 2);

// Espiral logarítmica: r = a · φ^(θ / (π/2)).
// El radio se multiplica por φ en cada cuarto de giro.
const maxR = centro - 1;
const a = 1.5;
const thetaMax = (Math.PI / 2) * Math.log(maxR / a) / Math.log(phi);
const espiral = [];
for (let theta = 0; theta <= thetaMax; theta += 0.006) {
  const r = a * Math.pow(phi, theta / (Math.PI / 2));
  espiral.push({ theta, r, x: Math.cos(theta) * r, y: Math.sin(theta) * r });
}

// Encajar la espiral completa en la grilla sin deformarla.
const xs = espiral.map((p) => p.x).concat(0);
const ys = espiral.map((p) => p.y).concat(0);
const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);
const margen = 1;
const escala = (filas - 1 - 2 * margen) / Math.max(maxX - minX, maxY - minY);
const offsetX = (columnas - (maxX - minX) * escala) / 2 - minX * escala;
const offsetY = (filas - (maxY - minY) * escala) / 2 - minY * escala;

function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

function secuenciaHasta(n) {
  const terminos = [];
  for (let i = 1; i <= n; i++) terminos.push(fibonacci(i));
  return terminos;
}

function recursion(n) {
  if (n <= 2) return `${fibonacci(n)} = base`;
  return `${fibonacci(n)} = ${fibonacci(n - 1)} + ${fibonacci(n - 2)}`;
}

function ratio(n) {
  if (n < 2) return null;
  return fibonacci(n) / fibonacci(n - 1);
}

function dibujarEspiral(progreso) {
  const grid = Array.from({ length: filas }, () => Array(columnas).fill(" "));
  const thetaFin = thetaMax * progreso;
  const vistos = new Set();

  for (const punto of espiral) {
    if (punto.theta > thetaFin) break;
    const x = Math.round(offsetX + punto.x * escala);
    const y = Math.round(offsetY + punto.y * escala);
    if (x < 0 || x >= columnas || y < 0 || y >= filas) continue;

    const key = x + "," + y;
    if (vistos.has(key)) continue;
    vistos.add(key);

    let simbolo = "░";
    if (punto.r < maxR * 0.3) simbolo = "█";
    else if (punto.r < maxR * 0.55) simbolo = "▓";
    else if (punto.r < maxR * 0.8) simbolo = "▒";

    grid[y][x] = simbolo;
  }

  const cx = Math.round(offsetX);
  const cy = Math.round(offsetY);
  if (cx >= 0 && cx < columnas && cy >= 0 && cy < filas) {
    grid[cy][cx] = "●";
  }

  return grid.map((fila) => fila.join("")).join("\n");
}

function mostrar(generacion) {
  output("[CLEAR]");

  const fib = fibonacci(generacion);
  const terminos = secuenciaHasta(generacion);
  const r = ratio(generacion);
  const error = r === null ? null : (Math.abs(r - phi) / phi) * 100;
  const progreso = generacion / iteraciones;

  output({
    type: "meta",
    text: `Generación ${generacion} · F(${generacion}) = ${fib} · ${filas} × ${columnas}`
  });
  output({
    type: "legend",
    text: `Secuencia: ${terminos.length ? terminos.join(" · ") : "—"}`
  });
  output({
    type: "legend",
    text: `Recursión: ${recursion(generacion)}`
  });
  output({
    type: "legend",
    text: r === null
      ? `φ = ${phi.toFixed(6)} · ratio = —`
      : `φ = ${phi.toFixed(6)} · ratio = ${r.toFixed(6)} · error = ${error.toFixed(3)}%`
  });

  output({
    type: "grid",
    data: dibujarEspiral(progreso),
    caption: "espiral áurea · el radio crece φ cada cuarto de giro",
    label: `Espiral de Fibonacci, generación ${generacion}`
  });
  output({
    type: "legend",
    text: "● centro · █ núcleo · ▓ medio · ▒ exterior · ░ borde"
  });

  if (generacion >= 3) {
    const puntos = [];
    for (let n = 2; n <= generacion; n++) {
      puntos.push([n, fibonacci(n) / fibonacci(n - 1)]);
    }
    output({ type: "meta", text: "Convergencia del ratio" });
    output({
      type: "trace",
      points: puntos,
      label: `Ratio F(n)/F(n−1) hasta la generación ${generacion}`
    });
  }
}

mostrar(0);

let gen = 0;

function evolucionar() {
  if (gen < iteraciones) {
    setTimeout(() => {
      gen++;
      mostrar(gen);
      evolucionar();
    }, 450);
  } else {
    setTimeout(() => {
      const r = ratio(iteraciones);
      const error = r === null ? 0 : (Math.abs(r - phi) / phi) * 100;
      output({
        type: "conclusion",
        text:
          `La espiral se completó después de ${iteraciones} términos.\n` +
          `F(${iteraciones}) = ${fibonacci(iteraciones)}. ` +
          `El ratio ${r === null ? "—" : r.toFixed(6)} se acerca a φ = ${phi.toFixed(6)}.\n` +
          `La diferencia es ${error.toFixed(3)}%. La proporción no se impone: ` +
          `emerge de sumar los dos términos anteriores.\n\n` +
          `¿La proporción se encuentra o se impone?\n` +
          `¿La belleza es matemática o las matemáticas son bellas?`
      });
    }, 100);
  }
}

evolucionar();
```
