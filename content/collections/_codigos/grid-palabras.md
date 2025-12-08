---
layout: codigo
title: Grid de Palabras
date: 2025-01-15
language: JavaScript
concept: "El grid muta. Los caracteres se organizan. Las palabras emergen del caos. ¿Qué patrones se repiten?"
---

```javascript
// Grid de Palabras - Mutación y emergencia de patrones
const ancho = parseInt(input("Ancho del grid:"));
const alto = parseInt(input("Alto del grid:"));
const generaciones = parseInt(input("Número de generaciones:"));
const nivel = parseInt(input("Nivel de Markov (1-7):"));

// Corpus de ejemplo
const corpusEjemplo = `el lenguaje es un sistema de signos que permite la comunicación entre los seres humanos a través de la historia el lenguaje ha evolucionado desde formas simples hasta estructuras complejas que reflejan el pensamiento y la cultura de cada sociedad la palabra escrita preserva el conocimiento y permite que las ideas trasciendan el tiempo y el espacio`;

// Diccionario básico de palabras comunes en castellano
const diccionarioBasico = new Set([
  'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar', 'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'venir', 'pensar', 'casa', 'trabajar', 'preguntar', 'mujer', 'sin', 'hacer', 'mismo', 'mundo', 'año', 'decir', 'cada', 'primero', 'querer', 'hablar', 'dar', 'ver', 'poder', 'saber', 'tener', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'haber', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'venir', 'pensar', 'trabajar', 'preguntar', 'casa', 'mujer', 'mundo', 'tiempo', 'día', 'año', 'hombre', 'vida', 'parte', 'cosa', 'mismo', 'grande', 'nuevo', 'siempre', 'nada', 'poco', 'mucho', 'más', 'menos', 'tan', 'tanto', 'bien', 'mal', 'ahora', 'después', 'entonces', 'cuando', 'donde', 'porque', 'así', 'sí', 'no', 'también', 'ni', 'o', 'pero', 'sin', 'con', 'por', 'para', 'sobre', 'entre', 'desde', 'hasta', 'durante', 'según', 'contra', 'hacia', 'hasta', 'mediante', 'durante', 'según', 'contra', 'hacia', 'caballero', 'sancho', 'dormía', 'enjuto', 'cuando', 'buenos', 'punto', 'pecho', 'sobre', 'gusto', 'parece', 'uscar', 'aviso', 'tenga', 'admirado', 'lástima', 'sospecho', 'razones', 'aperciba', 'parecer', 'hermosura', 'caballeriza', 'compadre', 'buscar', 'finísimo', 'polvo', 'noticia', 'vencidos', 'adulterador', 'varas', 'bellísimas', 'lunes', 'mayor'
]);

// Leer corpus y diccionario
let corpus = null;
let corpusListo = false;
let diccionario = diccionarioBasico;

output("Leyendo corpus.txt...\n");

// Cargar corpus y diccionario
Promise.all([
  fetch('/corpus.txt').then(r => r.ok ? r.text() : null).catch(() => null),
  fetch('/diccionario.txt').then(r => r.ok ? r.text() : null).catch(() => null)
]).then(([corpusTexto, diccionarioTexto]) => {
  // Procesar corpus
  if (corpusTexto && corpusTexto.trim().length > 10) {
    corpus = corpusTexto;
  } else {
    corpus = corpusEjemplo;
  }
  
  // Procesar diccionario
  if (diccionarioTexto) {
    const lineas = diccionarioTexto.toLowerCase().split('\n');
    lineas.forEach(linea => {
      linea = linea.trim();
      if (!linea) return;
      
      // Procesar formato: "palabra" o "palabra, variante1 variante2"
      // Ejemplo: "abanderado, da" -> "abanderado" y "abanderada"
      const partes = linea.split(',');
      const palabraBase = partes[0].trim();
      
      // Agregar palabra base si es válida
      if (palabraBase.length >= 3 && /^[a-záéíóúñü]+$/i.test(palabraBase)) {
        diccionario.add(palabraBase);
      }
      
      // Procesar variantes (si las hay)
      if (partes.length > 1) {
        const variantesTexto = partes[1].trim();
        const variantes = variantesTexto.split(/\s+/);
        
        variantes.forEach(variante => {
          variante = variante.trim();
          if (!variante) return;
          
          // Construir palabra completa con variante
          // Ejemplo: "abanderado, da" -> base="abanderado", variante="da" -> "abanderada"
          // La variante reemplaza el final de la palabra base
          if (variante.length >= 2 && palabraBase.length >= variante.length) {
            const palabraCompleta = palabraBase.slice(0, -variante.length) + variante;
            if (palabraCompleta.length >= 3 && /^[a-záéíóúñü]+$/i.test(palabraCompleta)) {
              diccionario.add(palabraCompleta);
            }
          }
          
          // Si la variante es una palabra completa por sí sola (mínimo 3 caracteres)
          if (variante.length >= 3 && /^[a-záéíóúñü]+$/i.test(variante)) {
            diccionario.add(variante);
          }
        });
      }
    });
    output(`Diccionario cargado: ${diccionario.size} palabras\n`);
  } else {
    output(`Usando diccionario básico: ${diccionario.size} palabras\n`);
  }
  
  corpusListo = true;
  procesarCorpus();
}).catch(error => {
  corpus = corpusEjemplo;
  corpusListo = true;
  procesarCorpus();
});

// Esperar corpus
let intentos = 0;
const maxIntentos = 200;

const esperarCorpus = setInterval(() => {
  intentos++;
  if (corpusListo || intentos >= maxIntentos) {
    clearInterval(esperarCorpus);
    if (!corpusListo) {
      corpus = corpusEjemplo;
      corpusListo = true;
      procesarCorpus();
    }
  }
}, 50);

// Normalizar corpus
function procesarCorpus() {
  corpus = corpus.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').replace(/\s+/g, ' ');
  iniciarGrid();
}

// Construir n-gramas
function construirNGramas(corpus, orden) {
  const ngramas = {};
  
  for (let i = 0; i < corpus.length - orden; i++) {
    const contexto = corpus.substring(i, i + orden);
    const siguiente = corpus[i + orden];
    
    if (!ngramas[contexto]) {
      ngramas[contexto] = {};
    }
    if (!ngramas[contexto][siguiente]) {
      ngramas[contexto][siguiente] = 0;
    }
    ngramas[contexto][siguiente]++;
  }
  
  // Convertir a probabilidades
  for (let contexto in ngramas) {
    const total = Object.values(ngramas[contexto]).reduce((a, b) => a + b, 0);
    const probabilidades = {};
    let acumulado = 0;
    for (let siguiente in ngramas[contexto]) {
      acumulado += ngramas[contexto][siguiente] / total;
      probabilidades[siguiente] = acumulado;
    }
    ngramas[contexto] = probabilidades;
  }
  
  return ngramas;
}

// Obtener siguiente carácter según nivel con mejor contexto
function obtenerSiguienteCaracter(contextoCompleto, ngramas, nivel, corpus) {
  if (nivel === 1) {
    // Letras aleatorias uniformes
    const letras = "abcdefghijklmnopqrstuvwxyzáéíóúñü ";
    return letras[Math.floor(Math.random() * letras.length)];
  } else if (nivel === 2) {
    // Frecuencias del castellano
    const frecuencias = {
      'e': 0.137, 'a': 0.125, 'o': 0.087, 'l': 0.082, 's': 0.079,
      'n': 0.075, 'r': 0.069, 'u': 0.046, 'i': 0.042, 'd': 0.037,
      't': 0.033, 'c': 0.030, 'm': 0.029, 'p': 0.025, 'b': 0.014,
      'g': 0.010, 'v': 0.009, 'q': 0.009, 'h': 0.007, 'f': 0.005,
      'y': 0.004, 'j': 0.004, 'z': 0.004, 'ñ': 0.003, 'x': 0.001,
      ' ': 0.150
    };
    const letras = Object.keys(frecuencias);
    const pesos = Object.values(frecuencias);
    let acumulado = 0;
    for (let i = 0; i < pesos.length; i++) {
      acumulado += pesos[i];
    }
    const rand = Math.random() * acumulado;
    let suma = 0;
    for (let i = 0; i < pesos.length; i++) {
      suma += pesos[i];
      if (rand < suma) {
        return letras[i];
      }
    }
    return ' ';
  } else {
    // Markov de orden (nivel - 2)
    const orden = nivel - 2;
    // Usar el contexto completo, tomando los últimos 'orden' caracteres
    const contextoRelevante = contextoCompleto.length >= orden 
      ? contextoCompleto.substring(contextoCompleto.length - orden) 
      : contextoCompleto;
    
    // Intentar con el contexto exacto
    if (ngramas[contextoRelevante]) {
      const rand = Math.random();
      for (let letra in ngramas[contextoRelevante]) {
        if (rand < ngramas[contextoRelevante][letra]) {
          return letra;
        }
      }
    }
    
    // Backoff: intentar con contexto más corto (limitado y optimizado)
    for (let o = Math.min(orden - 1, contextoRelevante.length - 1, 3); o > 0; o--) {
      const contextoCorto = contextoRelevante.substring(contextoRelevante.length - o);
      if (ngramas[contextoCorto]) {
        const rand = Math.random();
        for (let letra in ngramas[contextoCorto]) {
          if (rand < ngramas[contextoCorto][letra]) {
            return letra;
          }
        }
      }
    }
    
    // Fallback: letra aleatoria del corpus
    return corpus[Math.floor(Math.random() * corpus.length)];
  }
}

// Inicializar grid
let grid = [];
let ngramas = null;

function iniciarGrid() {
  // Construir modelo según nivel
  if (nivel >= 3) {
    const orden = nivel - 2;
    ngramas = construirNGramas(corpus, orden);
  }
  
  // Inicializar grid vacío
  grid = [];
  for (let y = 0; y < alto; y++) {
    grid[y] = [];
    for (let x = 0; x < ancho; x++) {
      grid[y][x] = ' ';
    }
  }
  
  // Semilla inicial: para niveles altos, usar una secuencia coherente del corpus
  if (nivel >= 4) {
    // Empezar con una secuencia real del corpus
    const inicioCorpus = Math.floor(Math.random() * (corpus.length - ancho));
    let x = 0;
    let y = 0;
    for (let i = 0; i < Math.min(ancho * alto, corpus.length - inicioCorpus); i++) {
      grid[y][x] = corpus[inicioCorpus + i];
      x++;
      if (x >= ancho) {
        x = 0;
        y++;
        if (y >= alto) break;
      }
    }
  } else {
    // Para niveles bajos, usar caracteres aleatorios
    for (let i = 0; i < Math.min(ancho * alto / 10, 20); i++) {
      const x = Math.floor(Math.random() * ancho);
      const y = Math.floor(Math.random() * alto);
      grid[y][x] = corpus[Math.floor(Math.random() * corpus.length)];
    }
  }
  
  evolucionarGrid();
}

// Generar texto secuencial para el grid (como en el experimento de Shannon)
function generarTextoSecuencial(longitud, nivel, ngramas, corpus) {
  let texto = '';
  
  if (nivel === 1) {
    // Letras aleatorias uniformes
    const letras = "abcdefghijklmnopqrstuvwxyzáéíóúñü ";
    for (let i = 0; i < longitud; i++) {
      texto += letras[Math.floor(Math.random() * letras.length)];
    }
  } else if (nivel === 2) {
    // Frecuencias del castellano
    const frecuencias = {
      'e': 0.137, 'a': 0.125, 'o': 0.087, 'l': 0.082, 's': 0.079,
      'n': 0.075, 'r': 0.069, 'u': 0.046, 'i': 0.042, 'd': 0.037,
      't': 0.033, 'c': 0.030, 'm': 0.029, 'p': 0.025, 'b': 0.014,
      'g': 0.010, 'v': 0.009, 'q': 0.009, 'h': 0.007, 'f': 0.005,
      'y': 0.004, 'j': 0.004, 'z': 0.004, 'ñ': 0.003, 'x': 0.001,
      ' ': 0.150
    };
    const letras = Object.keys(frecuencias);
    const pesos = Object.values(frecuencias);
    let acumulado = pesos.reduce((a, b) => a + b, 0);
    for (let i = 0; i < longitud; i++) {
      const rand = Math.random() * acumulado;
      let suma = 0;
      for (let j = 0; j < pesos.length; j++) {
        suma += pesos[j];
        if (rand < suma) {
          texto += letras[j];
          break;
        }
      }
    }
  } else {
    // Markov de orden (nivel - 2)
    const orden = nivel - 2;
    
    // Empezar con orden caracteres aleatorios del corpus
    let inicio = Math.floor(Math.random() * (corpus.length - orden));
    texto = corpus.substring(inicio, inicio + orden);
    
    for (let i = orden; i < longitud; i++) {
      const contexto = texto.substring(texto.length - orden);
      
      if (ngramas[contexto]) {
        const rand = Math.random();
        let siguiente = ' ';
        for (let letra in ngramas[contexto]) {
          if (rand < ngramas[contexto][letra]) {
            siguiente = letra;
            break;
          }
        }
        texto += siguiente;
      } else {
        // Fallback: letra aleatoria del corpus
        texto += corpus[Math.floor(Math.random() * corpus.length)];
      }
    }
  }
  
  return texto;
}

// Evolucionar grid - ahora genera texto secuencial
let genActual = 0;

function evolucionarGrid() {
  if (genActual >= generaciones) {
    analizarPalabras();
    return;
  }
  
  setTimeout(() => {
    // Generar texto completo usando el nivel de Markov
    const textoCompleto = generarTextoSecuencial(ancho * alto, nivel, ngramas, corpus);
    
    // Llenar grid secuencialmente (de izquierda a derecha, arriba a abajo)
    let indiceTexto = 0;
    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        if (indiceTexto < textoCompleto.length) {
          grid[y][x] = textoCompleto[indiceTexto];
          indiceTexto++;
        } else {
          // Si se acaba el texto, usar caracteres aleatorios
          grid[y][x] = corpus[Math.floor(Math.random() * corpus.length)];
        }
      }
    }
    
    genActual++;
    
    // Mostrar grid cada generación
    mostrarGrid();
    
    evolucionarGrid();
  }, 200); // 200ms entre generaciones
}

// Mostrar grid
function mostrarGrid() {
  output("[CLEAR]");
  output(`Generación ${genActual}/${generaciones} - Nivel ${nivel}\n`);
  output("─".repeat(ancho + 2) + "\n");
  
  for (let y = 0; y < alto; y++) {
    let linea = "│";
    for (let x = 0; x < ancho; x++) {
      linea += grid[y][x];
    }
    linea += "│";
    output(linea);
  }
  
  output("─".repeat(ancho + 2) + "\n");
}

// Analizar palabras más repetidas
function analizarPalabras() {
  output("\n");
  output("=".repeat(60) + "\n");
  output("ANÁLISIS DE PALABRAS\n");
  output("=".repeat(60) + "\n\n");
  
  // Extraer palabras reales (secuencias de letras separadas por espacios)
  const palabras = {};
  
  // Función para extraer palabras de una línea
  function extraerPalabrasReales(linea) {
    // Dividir por espacios y encontrar palabras completas (prioridad alta)
    const palabrasEnLinea = linea.match(/[a-záéíóúñü]+/gi) || [];
    palabrasEnLinea.forEach(palabra => {
      // Considerar palabras de cualquier longitud razonable (mínimo 3 caracteres)
      if (palabra.length >= 3) {
        const palabraLower = palabra.toLowerCase();
        const enDiccionario = diccionario.has(palabraLower);
        
        if (!palabras[palabraLower]) {
          palabras[palabraLower] = { count: 0, esCompleta: true, enDiccionario: false };
        }
        palabras[palabraLower].count++;
        palabras[palabraLower].esCompleta = true; // Marcar como palabra completa
        if (enDiccionario) {
          palabras[palabraLower].enDiccionario = true; // Marcar si está en diccionario
        }
      }
    });
  }
  
  // Función para verificar si una secuencia parece una palabra real
  function parecePalabraReal(secuencia) {
    // Filtrar secuencias que no parecen palabras
    // - No más de 2 vocales o consonantes consecutivas (excepto casos comunes)
    // - Debe tener al menos una vocal
    // - No debe tener patrones muy raros
    
    const tieneVocal = /[aeiouáéíóúü]/.test(secuencia);
    if (!tieneVocal) return false;
    
    // Rechazar si tiene más de 3 consonantes consecutivas
    if (/[bcdfghjklmnñpqrstvwxyz]{4,}/i.test(secuencia)) return false;
    
    // Rechazar si tiene más de 3 vocales consecutivas (excepto casos como "aie")
    if (/[aeiouáéíóúü]{4,}/i.test(secuencia)) return false;
    
    // Rechazar patrones muy raros como "uyroji", "qtorvl"
    const patronesRaros = /(uy|qy|qj|qk|qx|qz|jw|jx|jz|kx|kz|zx|zy)/i;
    if (patronesRaros.test(secuencia)) return false;
    
    return true;
  }
  
  // Analizar líneas horizontales
  for (let y = 0; y < alto; y++) {
    let linea = '';
    for (let x = 0; x < ancho; x++) {
      linea += grid[y][x];
    }
    extraerPalabrasReales(linea);
  }
  
  // Analizar líneas verticales
  for (let x = 0; x < ancho; x++) {
    let linea = '';
    for (let y = 0; y < alto; y++) {
      linea += grid[y][x];
    }
    extraerPalabrasReales(linea);
  }
  
  // Analizar diagonales principales
  for (let inicio = 0; inicio < alto + ancho - 1; inicio++) {
    let linea = '';
    for (let y = Math.max(0, inicio - ancho + 1); y < Math.min(alto, inicio + 1); y++) {
      const x = inicio - y;
      if (x >= 0 && x < ancho) {
        linea += grid[y][x];
      }
    }
    extraerPalabrasReales(linea);
  }
  
  // Analizar diagonales secundarias
  for (let inicio = 0; inicio < alto + ancho - 1; inicio++) {
    let linea = '';
    for (let y = Math.max(0, inicio - ancho + 1); y < Math.min(alto, inicio + 1); y++) {
      const x = ancho - 1 - (inicio - y);
      if (x >= 0 && x < ancho) {
        linea += grid[y][x];
      }
    }
    extraerPalabrasReales(linea);
  }
  
  // Convertir el objeto de palabras a formato simple para ordenar
  const palabrasSimples = Object.entries(palabras).map(([palabra, data]) => ({
    palabra,
    count: typeof data === 'object' ? data.count : data,
    esCompleta: typeof data === 'object' ? (data.esCompleta || false) : false,
    enDiccionario: typeof data === 'object' ? (data.enDiccionario || false) : false
  }));
  
  // Ordenar palabras por frecuencia y prioridad
  const palabrasOrdenadas = palabrasSimples
    .filter(({ palabra }) => {
      // Filtrar palabras muy cortas (mínimo 3), con caracteres repetidos, o que no sean solo letras
      const sinEspacios = palabra.replace(/\s/g, '');
      return sinEspacios.length >= 3 && 
             !/^(.)\1+$/.test(sinEspacios) &&
             /^[a-záéíóúñü]+$/i.test(palabra);
    })
    .sort((a, b) => {
      // Priorizar palabras en diccionario
      if (a.enDiccionario && !b.enDiccionario) return -1;
      if (!a.enDiccionario && b.enDiccionario) return 1;
      
      // Luego priorizar palabras completas
      if (a.esCompleta && !b.esCompleta) return -1;
      if (!a.esCompleta && b.esCompleta) return 1;
      
      // Luego por frecuencia
      if (b.count !== a.count) return b.count - a.count;
      
      // Finalmente por longitud (más largas primero)
      return b.palabra.length - a.palabra.length;
    })
    .slice(0, 50); // Top 50
  
  if (palabrasOrdenadas.length === 0) {
    output("No se encontraron palabras significativas.\n");
    output("El grid permaneció en el caos.\n");
  } else {
    output(`Top ${palabrasOrdenadas.length} palabras más repetidas:\n\n`);
    
    palabrasOrdenadas.forEach(({ palabra, count, enDiccionario }, index) => {
      const marcador = enDiccionario ? '★' : (palabra.esCompleta ? '✓' : ' ');
      const etiqueta = enDiccionario ? ' [diccionario]' : '';
      output(`${(index + 1).toString().padStart(2, ' ')}. ${marcador} "${palabra}" - ${count} ${count === 1 ? 'vez' : 'veces'}${etiqueta}`);
    });
  }
  
  output("\n" + "=".repeat(60) + "\n");
  output("\nEl grid mutó.");
  output("Los caracteres se organizaron.");
  output("Las palabras emergieron del caos.");
  output("¿Qué patrones se repiten?");
  output("\n");
}
```

---

_El grid muta. Los caracteres se organizan. Las palabras emergen del caos. ¿Qué patrones se repiten?_

