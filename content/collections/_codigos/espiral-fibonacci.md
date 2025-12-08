---
layout: codigo
title: Espiral de Fibonacci
date: 2025-01-15
language: JavaScript
concept: "La recursión como principio universal. La proporción que se encuentra en todo. La belleza matemática que emerge de patrones simples."
---

```javascript
// La Recursión Universal - La Proporción que se Encuentra - La Belleza Emergente
// Cada número contiene los anteriores. La proporción aparece en todo. La belleza emerge de lo simple.

const iteraciones = parseInt(input("¿Cuántas generaciones quieres observar?"));
const filas = 60;
const columnas = 60;

// Calcular proporción áurea (φ) - La proporción que se encuentra en todo
const phi = (1 + Math.sqrt(5)) / 2; // ≈ 1.618...

// Generar secuencia de Fibonacci - La recursión como principio universal
// Cada número contiene los anteriores: F(n) = F(n-1) + F(n-2)
function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b]; // Cada número es la suma de los dos anteriores
  }
  return b;
}

// Mostrar la recursión: cómo cada número contiene los anteriores
function mostrarRecursion(n) {
  if (n <= 1) return String(n);
  const fibN = fibonacci(n);
  const fibN1 = fibonacci(n - 1);
  const fibN2 = fibonacci(n - 2);
  return `${fibN} = ${fibN1} + ${fibN2}`;
}

// Crear grid inicial
let grid = [];
for (let i = 0; i < filas; i++) {
  grid[i] = [];
  for (let j = 0; j < columnas; j++) {
    grid[i][j] = 0; // 0 = vacío, números = generación
  }
}

// Células vivas: {x, y, generacion, edad}
let celulas = [];
let generacionActual = 0;

// Iniciar con una célula en el centro
const centroX = Math.floor(filas / 2);
const centroY = Math.floor(columnas / 2);
celulas.push({ x: centroX, y: centroY, gen: 0, edad: 0 });
grid[centroX][centroY] = 1;

// Función para obtener posiciones en espiral desde un punto
function obtenerPosicionesEspiral(x, y, radio) {
  const posiciones = [];
  
  // Generar posiciones en espiral usando φ
  for (let angulo = 0; angulo < Math.PI * 2 * 3; angulo += Math.PI / 4) {
    const r = radio * (1 + angulo / (Math.PI * 2));
    const nx = Math.floor(x + Math.cos(angulo) * r);
    const ny = Math.floor(y + Math.sin(angulo) * r);
    
    if (nx >= 0 && nx < filas && ny >= 0 && ny < columnas) {
      posiciones.push({ x: nx, y: ny, distancia: r });
    }
  }
  
  // Ordenar por distancia y eliminar duplicados
  posiciones.sort((a, b) => a.distancia - b.distancia);
  const unicas = [];
  const vistas = new Set();
  
  for (let pos of posiciones) {
    const key = `${pos.x},${pos.y}`;
    if (!vistas.has(key)) {
      vistas.add(key);
      unicas.push({ x: pos.x, y: pos.y });
    }
  }
  
  return unicas;
}

// Crecer según Fibonacci en espiral: 1, 1, 2, 3, 5, 8, 13...
function crecerGeneracion() {
  if (generacionActual >= iteraciones) return;
  
  generacionActual++;
  const fibValue = fibonacci(generacionActual);
  
  // Limitar crecimiento para que dure más pero mantenga el patrón
  const nuevasCelulas = [];
  let celulasCreadas = 0;
  // Crecimiento más sostenible: mínimo 3, máximo basado en Fibonacci pero limitado
  const objetivoTotal = Math.min(Math.max(fibValue, 3), 40); // Mínimo 3, máximo 40
  
  // Obtener todas las posiciones en espiral desde el centro
  const radio = generacionActual * 2;
  const posicionesEspiral = obtenerPosicionesEspiral(centroX, centroY, radio);
  
  // Crear nuevas células en espiral
  for (let i = 0; i < posicionesEspiral.length && celulasCreadas < objetivoTotal; i++) {
    const pos = posicionesEspiral[i];
    
    // Regla de pisado: solo reemplazar si la célula es muy vieja (más de 5 generaciones)
    const celulaExistente = celulas.find(c => c.x === pos.x && c.y === pos.y);
    
    if (!celulaExistente) {
      // Celda vacía, crear nueva
      grid[pos.x][pos.y] = generacionActual + 1;
      nuevasCelulas.push({ x: pos.x, y: pos.y, gen: generacionActual, edad: 0 });
      celulasCreadas++;
    } else if (celulaExistente.gen < generacionActual - 6) {
      // Solo reemplazar células muy viejas (más de 6 generaciones)
      grid[pos.x][pos.y] = generacionActual + 1;
      // Remover la vieja
      celulas = celulas.filter(c => !(c.x === pos.x && c.y === pos.y));
      nuevasCelulas.push({ x: pos.x, y: pos.y, gen: generacionActual, edad: 0 });
      celulasCreadas++;
    }
  }
  
  // Envejecer células existentes (más lento)
  for (let celula of celulas) {
    celula.edad++;
    // Las células muy viejas (más de 8 generaciones) pueden desaparecer con baja probabilidad
    // Esto mantiene el patrón visible por más tiempo
    if (celula.edad > 8 && Math.random() < 0.05) {
      grid[celula.x][celula.y] = 0;
    }
  }
  
  // Filtrar células que desaparecieron
  celulas = celulas.filter(c => grid[c.x][c.y] > 0);
  
  // Asegurar que siempre haya un mínimo de células para mantener el patrón
  if (celulas.length === 0 && generacionActual > 0) {
    // Si todas desaparecieron, crear algunas nuevas desde el centro
    const nuevasDesdeCentro = obtenerPosicionesEspiral(centroX, centroY, 3);
    for (let i = 0; i < Math.min(5, nuevasDesdeCentro.length); i++) {
      const pos = nuevasDesdeCentro[i];
      if (grid[pos.x][pos.y] === 0) {
        grid[pos.x][pos.y] = generacionActual + 1;
        celulas.push({ x: pos.x, y: pos.y, gen: generacionActual, edad: 0 });
      }
    }
  }
  
  // Agregar las nuevas células
  celulas = celulas.concat(nuevasCelulas);
}

function mostrarPatron(generacion) {
  // Limpiar output anterior
  output("[CLEAR]");
  
  const fibActual = fibonacci(generacion);
  const celulasVivas = celulas.length;
  const ratio = generacion > 1 ? (fibonacci(generacion) / fibonacci(Math.max(generacion - 1, 1))).toFixed(6) : "0";
  const recursion = generacion > 1 ? mostrarRecursion(generacion) : "0 = base";
  
  let outputText = `Generación ${generacion}:\n`;
  outputText += `Fibonacci[${generacion}] = ${fibActual}\n`;
  outputText += `Células vivas: ${celulasVivas}\n`;
  outputText += `Recursión: ${recursion}\n`;
  outputText += `Proporción áurea (φ) = ${phi.toFixed(6)}\n`;
  outputText += `Ratio actual: ${ratio} → ${ratio > 0 && Math.abs(parseFloat(ratio) - phi) < 0.1 ? "≈ φ" : "convergiendo a φ"}\n\n`;
  
  // Dibujar grid con más símbolos (un símbolo por cada dígito/generación)
  const simbolos = ["·", "○", "◉", "◐", "◑", "◒", "◓", "◔", "◕", "●", "◆", "▲", "■", "□", "▪", "▫", "▬", "▭", "▮", "▯"];
  
  for (let i = 0; i < filas; i++) {
    let fila = "";
    for (let j = 0; j < columnas; j++) {
      const valor = grid[i][j];
      if (valor === 0) {
        fila += " ";
      } else {
        // Un símbolo diferente por cada generación (módulo para ciclar si hay muchas)
        const gen = valor - 1;
        const simboloIdx = gen % simbolos.length;
        fila += simbolos[simboloIdx];
      }
    }
    outputText += fila + "\n";
  }
  
  output(outputText);
}

// Mostrar estado inicial
mostrarPatron(0);

// Evolucionar mostrando el crecimiento progresivo
function evolucionar() {
  if (generacionActual < iteraciones) {
    setTimeout(() => {
      crecerGeneracion();
      mostrarPatron(generacionActual);
      evolucionar();
    }, 600); // 600 milisegundos entre generaciones para ver el crecimiento
  } else {
    setTimeout(() => {
      output("");
      output("La recursión se ha completado.");
      output("Cada número contenía los anteriores.");
      output("La proporción áurea (φ = " + phi.toFixed(6) + ") se encontró en todo.");
      output("La belleza matemática emergió de patrones simples.");
      output("");
      output("¿La recursión es el principio universal?");
      output("¿La proporción se encuentra o se impone?");
      output("¿La belleza es matemática o las matemáticas son bellas?");
    }, 100);
  }
}

evolucionar();
```

---

_La recursión como principio universal. La proporción que se encuentra en todo. La belleza matemática que emerge de patrones simples._

