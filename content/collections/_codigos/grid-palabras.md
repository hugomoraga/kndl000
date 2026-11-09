---
layout: codigo
title: Grid de Palabras
date: 2025-01-15
language: JavaScript
concept: "El grid muta. Los caracteres se organizan. Las palabras emergen del caos. ¿Qué patrones se repiten?"
---

```javascript
// Grid de palabras — un modelo de Markov llena una grilla de caracteres.
// Cada generación es una muestra nueva; después buscamos palabras reales
// en filas, columnas y diagonales.

const pedidas = parseInt(input("¿Cuántas generaciones? (3–8)"), 10);
const generaciones = Math.max(3, Math.min(8, isNaN(pedidas) ? 5 : pedidas));
const pedidoNivel = parseInt(input("Nivel (1 caos → 7 lenguaje)"), 10);
const nivel = Math.max(1, Math.min(7, isNaN(pedidoNivel) ? 4 : pedidoNivel));

const ancho = 33;
const alto = 13;
const total = ancho * alto;
const LETRAS = "abcdefghijklmnopqrstuvwxyzáéíóúñü ";
const FRECUENCIAS = {
  "e": 0.137, "a": 0.125, "o": 0.087, "l": 0.082, "s": 0.079,
  "n": 0.075, "r": 0.069, "u": 0.046, "i": 0.042, "d": 0.037,
  "t": 0.033, "c": 0.030, "m": 0.029, "p": 0.025, "b": 0.014,
  "g": 0.010, "v": 0.009, "q": 0.009, "h": 0.007, "f": 0.005,
  "y": 0.004, "j": 0.004, "z": 0.004, "ñ": 0.003, "x": 0.001,
  " ": 0.150
};
const descripcionNivel = nivel === 1
  ? "letras uniformes"
  : nivel === 2
    ? "frecuencias del castellano"
    : `Markov orden ${nivel - 2}`;

const corpusEjemplo = `el lenguaje es un sistema de signos que permite la comunicación entre los seres humanos a través de la historia el lenguaje ha evolucionado desde formas simples hasta estructuras complejas que reflejan el pensamiento y la cultura de cada sociedad la palabra escrita preserva el conocimiento y permite que las ideas trasciendan el tiempo y el espacio`;

// Fallback si no se puede leer diccionario.txt. El archivo completo se carga
// desde el sitio y se suma a este conjunto.
const diccionarioBasico = new Set([
  "el", "la", "de", "que", "y", "a", "en", "un", "por", "con", "para",
  "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque",
  "esta", "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta",
  "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno",
  "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "esto", "mí",
  "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él",
  "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual",
  "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi",
  "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros",
  "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas",
  "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros",
  "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas",
  "estoy", "estás", "está", "estamos", "estáis", "están", "casa", "tiempo",
  "mundo", "vida", "palabra", "lenguaje", "texto", "luz", "sombra", "fuego",
  "agua", "tierra", "aire", "hombre", "mujer", "niño", "niña", "día", "noche",
  "año", "amor", "muerte", "palabra", "lengua", "lenguas", "signo", "signos",
  "historia", "memoria", "archivo", "ruido", "orden", "caos", "patrón"
]);

let corpus = corpusEjemplo;
let diccionario = diccionarioBasico;
let ngramas = null;
let grid = [];
let genActual = 0;
let metricasActuales = null;
let iniciado = false;
const historialDic = [];

output({ type: "meta", text: "Leyendo corpus y diccionario…" });

function iniciarUnaVez() {
  if (iniciado) return;
  iniciado = true;
  procesarCorpus();
}

function cargarDiccionario(texto) {
  const set = new Set(diccionarioBasico);
  texto.toLowerCase().split("\n").forEach((linea) => {
    const [baseRaw, variantesRaw] = linea.split(",");
    const base = (baseRaw || "").trim();
    if (base.length >= 3 && /^[a-záéíóúñü]+$/i.test(base)) set.add(base);
    if (!variantesRaw) return;
    variantesRaw.trim().split(/\s+/).forEach((variante) => {
      if (!variante) return;
      if (variante.length >= 3 && /^[a-záéíóúñü]+$/i.test(variante)) set.add(variante);
      if (base.length >= variante.length) {
        const completa = base.slice(0, -variante.length) + variante;
        if (completa.length >= 3 && /^[a-záéíóúñü]+$/i.test(completa)) set.add(completa);
      }
    });
  });
  return set;
}

Promise.all([
  fetch("/corpus.txt").then((r) => r.ok ? r.text() : null).catch(() => null),
  fetch("/diccionario.txt").then((r) => r.ok ? r.text() : null).catch(() => null)
]).then(([corpusTexto, diccionarioTexto]) => {
  if (corpusTexto && corpusTexto.trim().length > 10) corpus = corpusTexto;
  if (diccionarioTexto) {
    diccionario = cargarDiccionario(diccionarioTexto);
    output({ type: "legend", text: `Diccionario: ${diccionario.size} palabras` });
  } else {
    output({ type: "legend", text: `Diccionario básico: ${diccionario.size} palabras` });
  }
  iniciarUnaVez();
}).catch(() => {
  iniciarUnaVez();
});

// Si el fetch tarda demasiado, arrancamos con el corpus de ejemplo.
let intentos = 0;
const esperar = setInterval(() => {
  intentos++;
  if (iniciado) {
    clearInterval(esperar);
    return;
  }
  if (intentos >= 100) {
    clearInterval(esperar);
    iniciarUnaVez();
  }
}, 50);

function procesarCorpus() {
  corpus = corpus.toLowerCase().replace(/[^a-záéíóúñü\s]/g, " ").replace(/\s+/g, " ");
  if (nivel >= 3) ngramas = construirNGramas(corpus, nivel - 2);
  grid = Array.from({ length: alto }, () => Array(ancho).fill(" "));
  evolucionarGrid();
}

function construirNGramas(texto, orden) {
  const mapa = {};
  for (let i = 0; i < texto.length - orden; i++) {
    const contexto = texto.substring(i, i + orden);
    const siguiente = texto[i + orden];
    if (!mapa[contexto]) mapa[contexto] = {};
    mapa[contexto][siguiente] = (mapa[contexto][siguiente] || 0) + 1;
  }
  return mapa;
}

function elegirPonderado(pesos) {
  let totalPesos = 0;
  for (const clave in pesos) totalPesos += pesos[clave];
  let rand = Math.random() * totalPesos;
  let suma = 0;
  for (const clave in pesos) {
    suma += pesos[clave];
    if (rand < suma) return clave;
  }
  return Object.keys(pesos)[0] || " ";
}

function generarTextoSecuencial(longitud) {
  if (nivel === 1) {
    let texto = "";
    for (let i = 0; i < longitud; i++) texto += LETRAS[Math.floor(Math.random() * LETRAS.length)];
    return texto;
  }

  if (nivel === 2) {
    let texto = "";
    for (let i = 0; i < longitud; i++) texto += elegirPonderado(FRECUENCIAS);
    return texto;
  }

  const orden = nivel - 2;
  const inicio = Math.floor(Math.random() * Math.max(1, corpus.length - orden));
  let texto = corpus.substring(inicio, inicio + orden);

  while (texto.length < longitud) {
    const contexto = texto.substring(texto.length - orden);
    let siguiente = "";

    if (ngramas[contexto]) {
      siguiente = elegirPonderado(ngramas[contexto]);
    } else {
      for (let o = Math.min(orden - 1, contexto.length - 1); o > 0; o--) {
        const corto = contexto.substring(contexto.length - o);
        if (ngramas[corto]) {
          siguiente = elegirPonderado(ngramas[corto]);
          break;
        }
      }
    }

    if (!siguiente) siguiente = corpus[Math.floor(Math.random() * corpus.length)];
    texto += siguiente;
  }

  return texto.substring(0, longitud);
}


function lineasDelGrid() {
  const lineas = [];

  for (let y = 0; y < alto; y++) lineas.push(grid[y].join(""));

  for (let x = 0; x < ancho; x++) {
    let linea = "";
    for (let y = 0; y < alto; y++) linea += grid[y][x];
    lineas.push(linea);
  }

  for (let inicio = 0; inicio < alto + ancho - 1; inicio++) {
    let linea = "";
    for (let y = Math.max(0, inicio - ancho + 1); y < Math.min(alto, inicio + 1); y++) {
      const x = inicio - y;
      if (x >= 0 && x < ancho) linea += grid[y][x];
    }
    lineas.push(linea);
  }

  for (let inicio = 0; inicio < alto + ancho - 1; inicio++) {
    let linea = "";
    for (let y = Math.max(0, inicio - ancho + 1); y < Math.min(alto, inicio + 1); y++) {
      const x = ancho - 1 - (inicio - y);
      if (x >= 0 && x < ancho) linea += grid[y][x];
    }
    lineas.push(linea);
  }

  return lineas;
}

function analizarGrid() {
  const palabras = new Map();

  for (const linea of lineasDelGrid()) {
    const tokens = linea.match(/[a-záéíóúñü]+/gi) || [];
    for (const token of tokens) {
      if (token.length < 3) continue;
      const palabra = token.toLowerCase();
      const data = palabras.get(palabra) || { count: 0, enDiccionario: diccionario.has(palabra) };
      data.count++;
      palabras.set(palabra, data);
    }
  }

  let letras = 0;
  for (const fila of grid) {
    for (const caracter of fila) {
      if (caracter !== " ") letras++;
    }
  }

  const items = [...palabras.entries()].map(([palabra, data]) => ({
    palabra,
    count: data.count,
    enDiccionario: data.enDiccionario
  }));

  const top = items
    .filter((item) => item.enDiccionario)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.palabra.length - a.palabra.length;
    })
    .slice(0, 10);

  return {
    unicas: items.length,
    dic: items.filter((item) => item.enDiccionario).length,
    ocupacion: Math.round((letras / total) * 100),
    top
  };
}

function mostrarGrid() {
  output("[CLEAR]");
  metricasActuales = analizarGrid();

  let gridText = "";
  for (const fila of grid) gridText += fila.join("") + "\n";

  output({
    type: "meta",
    text: `Generación ${genActual}/${generaciones} · nivel ${nivel} · ${ancho} × ${alto}`
  });
  output({
    type: "legend",
    text: `${descripcionNivel}\n` +
          `secuencias ${metricasActuales.unicas} · diccionario ${metricasActuales.dic} · ocupación ${metricasActuales.ocupacion}%`
  });
  output({
    type: "grid",
    data: gridText,
    caption: "cada generación es una muestra nueva del modelo; las palabras se buscan después en filas, columnas y diagonales",
    label: `Grid de palabras, generación ${genActual}`
  });
}

function evolucionarGrid() {
  if (genActual >= generaciones) {
    finalizar();
    return;
  }

  setTimeout(() => {
    const texto = generarTextoSecuencial(total);
    let indice = 0;
    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        grid[y][x] = texto[indice++] || " ";
      }
    }

    genActual++;
    mostrarGrid();
    historialDic.push([genActual, metricasActuales.dic]);
    evolucionarGrid();
  }, 300);
}

function finalizar() {
  const m = metricasActuales || analizarGrid();

  output({ type: "meta", text: "Resultado" });
  output({
    type: "legend",
    text: `secuencias ${m.unicas} · diccionario ${m.dic} · ocupación ${m.ocupacion}%`
  });

  if (m.top.length > 0) {
    output({
      type: "meta",
      text: `Top ${m.top.length} ${m.top.length === 1 ? "palabra" : "palabras"} de diccionario`
    });
    const lineas = m.top.map((item, index) => {
      return `${(index + 1).toString().padStart(2, " ")}. "${item.palabra}" — ${item.count} ${item.count === 1 ? "vez" : "veces"}`;
    });
    output({ type: "legend", text: lineas.join("\n") });
  } else {
    output({ type: "legend", text: "No se encontraron palabras de diccionario en esta muestra." });
  }

  if (historialDic.length >= 2 && historialDic.some((punto) => punto[1] > 0)) {
    output({ type: "meta", text: "Diccionario por generación" });
    output({
      type: "trace",
      points: historialDic,
      label: "Palabras de diccionario encontradas por generación"
    });
  }

  const hayPalabras = m.dic > 0;
  const resultado = hayPalabras
    ? `Se encontraron ${m.dic} ${m.dic === 1 ? "palabra" : "palabras"} de diccionario en ${m.unicas} secuencias.`
    : "No se encontraron palabras de diccionario; el grid quedó más cerca del ruido. Probá un nivel más alto.";

  output({
    type: "conclusion",
    text:
      `El grid mutó durante ${generaciones} generaciones en ${descripcionNivel}.\n` +
      `${resultado}\n\n` +
      "¿Qué patrones se repiten?"
  });
}
```

---

_El grid muta. Los caracteres se organizan. Las palabras emergen del caos. ¿Qué patrones se repiten?_

