---
layout: codigo
title: Experimento de Shannon
date: 2025-01-15
language: JavaScript
concept: "Las aproximaciones al lenguaje. Del caos a la estructura. La información que emerge del orden."
---

```javascript
// Experimento de Shannon - Aproximaciones al lenguaje en castellano
const longitud = parseInt(input("¿Cuántos caracteres quieres generar?"));
const nivel = parseInt(input("¿Qué nivel quieres ver? (1-7)"));

// Corpus de ejemplo en castellano (fallback si no se puede leer archivo)
const corpusEjemplo = `el lenguaje es un sistema de signos que permite la comunicación entre los seres humanos a través de la historia el lenguaje ha evolucionado desde formas simples hasta estructuras complejas que reflejan el pensamiento y la cultura de cada sociedad la palabra escrita preserva el conocimiento y permite que las ideas trasciendan el tiempo y el espacio`;

// Leer corpus: intentar desde corpus.txt, sino usar ejemplo
let corpus = null;
let corpusListo = false;

output("Leyendo corpus.txt...\n");

// Intentar leer corpus.txt desde la raíz
fetch('/corpus.txt')
  .then(response => {
    if (response.ok) {
      return response.text();
    }
    throw new Error('Archivo no encontrado');
  })
  .then(texto => {
    // Si el archivo existe y tiene contenido, usarlo
    if (texto && texto.trim().length > 10) {
      corpus = texto;
      corpusListo = true;
      procesarCorpus();
    } else {
      // Archivo vacío, usar ejemplo
      corpus = corpusEjemplo;
      corpusListo = true;
      procesarCorpus();
    }
  })
  .catch(error => {
    // Si no existe corpus.txt, usar ejemplo directamente (sin pedir input)
    corpus = corpusEjemplo;
    corpusListo = true;
    procesarCorpus();
  });

// Esperar a que el corpus esté listo (máximo 10 segundos)
let intentos = 0;
const maxIntentos = 200; // 10 segundos (200 * 50ms)

const esperarCorpus = setInterval(() => {
  intentos++;
  if (corpusListo || intentos >= maxIntentos) {
    clearInterval(esperarCorpus);
    if (!corpusListo) {
      // Timeout: usar ejemplo
      corpus = corpusEjemplo;
      corpusListo = true;
      procesarCorpus();
    }
  }
}, 50);

// Función para procesar el corpus y generar el texto
function procesarCorpus() {
  // Normalizar corpus: solo letras y espacios
  corpus = corpus.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').replace(/\s+/g, ' ');
  
  output("Corpus procesado: " + corpus.length + " caracteres\n");
  
  // Continuar con la generación
  generarTexto();
}

// Función para generar el texto según el nivel
function generarTexto() {
  // Validar nivel y longitud
  const nivelNum = typeof nivel === 'string' ? parseInt(nivel) : nivel;
  const longitudNum = typeof longitud === 'string' ? parseInt(longitud) : longitud;
  
  if (isNaN(nivelNum) || nivelNum < 1 || nivelNum > 7) {
    output("Error: Nivel inválido. Debe ser un número entre 1 y 7.");
    output("Recibido: " + nivel);
    return;
  }
  
  if (isNaN(longitudNum) || longitudNum <= 0) {
    output("Error: Longitud inválida. Debe ser un número mayor a 0.");
    output("Recibido: " + longitud);
    return;
  }

// Nivel 1 - Letras aleatorias uniformes
function nivel1(longitud) {
  const letras = "abcdefghijklmnopqrstuvwxyzáéíóúñü ";
  let texto = "";
  for (let i = 0; i < longitud; i++) {
    texto += letras[Math.floor(Math.random() * letras.length)];
  }
  return texto;
}

// Nivel 2 - Letras ponderadas por frecuencia del castellano
function nivel2(longitud) {
  const frecuencias = {
    'e': 0.137, 'a': 0.125, 'o': 0.087, 'l': 0.082, 's': 0.079,
    'n': 0.075, 'r': 0.069, 'u': 0.046, 'i': 0.042, 'd': 0.037,
    't': 0.033, 'c': 0.030, 'm': 0.029, 'p': 0.025, 'b': 0.014,
    'g': 0.010, 'v': 0.009, 'q': 0.009, 'h': 0.007, 'f': 0.005,
    'y': 0.004, 'j': 0.004, 'z': 0.004, 'ñ': 0.003, 'x': 0.001,
    ' ': 0.150 // Espacio
  };
  
  // Crear array acumulativo para selección ponderada
  const letras = [];
  const pesos = [];
  let acumulado = 0;
  for (let letra in frecuencias) {
    letras.push(letra);
    acumulado += frecuencias[letra];
    pesos.push(acumulado);
  }
  
  let texto = "";
  for (let i = 0; i < longitud; i++) {
    const rand = Math.random() * acumulado;
    let idx = 0;
    for (let j = 0; j < pesos.length; j++) {
      if (rand < pesos[j]) {
        idx = j;
        break;
      }
    }
    texto += letras[idx];
  }
  return texto;
}

// Nivel 3 - Cadena de Markov orden 1 (bigramas)
function construirBigramas(corpus) {
  const bigramas = {};
  
  for (let i = 0; i < corpus.length - 1; i++) {
    const actual = corpus[i];
    const siguiente = corpus[i + 1];
    
    if (!bigramas[actual]) {
      bigramas[actual] = {};
    }
    if (!bigramas[actual][siguiente]) {
      bigramas[actual][siguiente] = 0;
    }
    bigramas[actual][siguiente]++;
  }
  
  // Convertir a probabilidades
  for (let letra in bigramas) {
    const total = Object.values(bigramas[letra]).reduce((a, b) => a + b, 0);
    const probabilidades = {};
    let acumulado = 0;
    for (let siguiente in bigramas[letra]) {
      acumulado += bigramas[letra][siguiente] / total;
      probabilidades[siguiente] = acumulado;
    }
    bigramas[letra] = probabilidades;
  }
  
  return bigramas;
}

function nivel3(longitud, bigramas) {
  // Empezar con una letra aleatoria del corpus
  let texto = corpus[Math.floor(Math.random() * corpus.length)];
  
  for (let i = 1; i < longitud; i++) {
    const actual = texto[texto.length - 1];
    
    if (bigramas[actual]) {
      const rand = Math.random();
      let siguiente = ' ';
      for (let letra in bigramas[actual]) {
        if (rand < bigramas[actual][letra]) {
          siguiente = letra;
          break;
        }
      }
      texto += siguiente;
    } else {
      // Si no hay bigrama, usar letra aleatoria del corpus
      texto += corpus[Math.floor(Math.random() * corpus.length)];
    }
  }
  
  return texto;
}

// Nivel 4 - Cadena de Markov orden 2 (trigramas)
function construirTrigramas(corpus) {
  const trigramas = {};
  
  for (let i = 0; i < corpus.length - 2; i++) {
    const contexto = corpus.substring(i, i + 2);
    const siguiente = corpus[i + 2];
    
    if (!trigramas[contexto]) {
      trigramas[contexto] = {};
    }
    if (!trigramas[contexto][siguiente]) {
      trigramas[contexto][siguiente] = 0;
    }
    trigramas[contexto][siguiente]++;
  }
  
  // Convertir a probabilidades
  for (let contexto in trigramas) {
    const total = Object.values(trigramas[contexto]).reduce((a, b) => a + b, 0);
    const probabilidades = {};
    let acumulado = 0;
    for (let siguiente in trigramas[contexto]) {
      acumulado += trigramas[contexto][siguiente] / total;
      probabilidades[siguiente] = acumulado;
    }
    trigramas[contexto] = probabilidades;
  }
  
  return trigramas;
}

function nivel4(longitud, trigramas) {
  // Empezar con dos letras aleatorias del corpus
  let inicio = Math.floor(Math.random() * (corpus.length - 1));
  let texto = corpus.substring(inicio, inicio + 2);
  
  for (let i = 2; i < longitud; i++) {
    const contexto = texto.substring(texto.length - 2);
    
    if (trigramas[contexto]) {
      const rand = Math.random();
      let siguiente = ' ';
      for (let letra in trigramas[contexto]) {
        if (rand < trigramas[contexto][letra]) {
          siguiente = letra;
          break;
        }
      }
      texto += siguiente;
    } else {
      // Si no hay trigrama, usar bigrama o letra aleatoria
      const ultima = texto[texto.length - 1];
      if (trigramas[ultima + ' ']) {
        const rand = Math.random();
        for (let letra in trigramas[ultima + ' ']) {
          if (rand < trigramas[ultima + ' '][letra]) {
            texto += letra;
            break;
          }
        }
      } else {
        texto += corpus[Math.floor(Math.random() * corpus.length)];
      }
    }
  }
  
  return texto;
}

// Función genérica para construir n-gramas de cualquier orden
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

// Función genérica para generar texto con n-gramas
function generarConNGramas(longitud, ngramas, orden, corpus) {
  // Empezar con orden caracteres aleatorios del corpus
  let inicio = Math.floor(Math.random() * (corpus.length - orden));
  let texto = corpus.substring(inicio, inicio + orden);
  
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
      // Si no hay n-grama, intentar con contexto más corto (backoff)
      let encontrado = false;
      for (let j = orden - 1; j > 0; j--) {
        const contextoCorto = texto.substring(texto.length - j);
        // Buscar cualquier n-grama que empiece con este contexto
        for (let ctx in ngramas) {
          if (ctx.startsWith(contextoCorto)) {
            const rand = Math.random();
            for (let letra in ngramas[ctx]) {
              if (rand < ngramas[ctx][letra]) {
                texto += letra;
                encontrado = true;
                break;
              }
            }
            if (encontrado) break;
          }
        }
        if (encontrado) break;
      }
      
      // Si aún no se encontró, usar letra aleatoria del corpus
      if (!encontrado) {
        texto += corpus[Math.floor(Math.random() * corpus.length)];
      }
    }
  }
  
  return texto;
}

// Nivel 5 - Cadena de Markov orden 3 (cuatrigramas)
function nivel5(longitud, corpus) {
  const cuatrigramas = construirNGramas(corpus, 3);
  return generarConNGramas(longitud, cuatrigramas, 3, corpus);
}

// Nivel 6 - Cadena de Markov orden 4 (pentagramas)
function nivel6(longitud, corpus) {
  const pentagramas = construirNGramas(corpus, 4);
  return generarConNGramas(longitud, pentagramas, 4, corpus);
}

// Nivel 7 - Cadena de Markov orden 5 (hexagramas)
function nivel7(longitud, corpus) {
  const hexagramas = construirNGramas(corpus, 5);
  return generarConNGramas(longitud, hexagramas, 5, corpus);
}

  // Generar y mostrar resultado - Barrido desde nivel 1 hasta el nivel elegido
  output("\n=== PROGRESIÓN DEL EXPERIMENTO DE SHANNON ===\n");
  output("Mostrando niveles del 1 al " + nivelNum + "\n");
  output("=".repeat(60) + "\n\n");
  
  // Pre-construir modelos que se reutilizarán
  let bigramas = null;
  let trigramas = null;
  
  // Generar todos los niveles desde 1 hasta el elegido
  for (let n = 1; n <= nivelNum; n++) {
    let resultado = "";
    let descripcion = "";
    
    if (n === 1) {
      descripcion = "Nivel 1: Letras aleatorias uniformes (caos total)";
      resultado = nivel1(longitudNum);
    } else if (n === 2) {
      descripcion = "Nivel 2: Letras ponderadas por frecuencia del castellano";
      resultado = nivel2(longitudNum);
    } else if (n === 3) {
      descripcion = "Nivel 3: Cadena de Markov orden 1 (bigramas)";
      if (!bigramas) bigramas = construirBigramas(corpus);
      resultado = nivel3(longitudNum, bigramas);
    } else if (n === 4) {
      descripcion = "Nivel 4: Cadena de Markov orden 2 (trigramas)";
      if (!trigramas) trigramas = construirTrigramas(corpus);
      resultado = nivel4(longitudNum, trigramas);
    } else if (n === 5) {
      descripcion = "Nivel 5: Cadena de Markov orden 3 (cuatrigramas)";
      resultado = nivel5(longitudNum, corpus);
    } else if (n === 6) {
      descripcion = "Nivel 6: Cadena de Markov orden 4 (pentagramas)";
      resultado = nivel6(longitudNum, corpus);
    } else if (n === 7) {
      descripcion = "Nivel 7: Cadena de Markov orden 5 (hexagramas)";
      resultado = nivel7(longitudNum, corpus);
    }
    
    if (resultado) {
      output("\n" + descripcion + "\n");
      output("─".repeat(60) + "\n");
      
      // Mostrar en líneas de 60 caracteres
      for (let i = 0; i < resultado.length; i += 60) {
        output(resultado.substring(i, i + 60));
      }
      
      output("\n" + "─".repeat(60) + "\n");
      
      // Separador entre niveles (excepto el último)
      if (n < nivelNum) {
        output("\n");
      }
    }
  }
  
  output("\n");
  output("=".repeat(60) + "\n");
  output("Del caos al orden.");
  output("De la aleatoriedad a la estructura.");
  output("¿Dónde termina el ruido y comienza el lenguaje?");
  output("\n");
}
```

---

_Del caos al orden. De la aleatoriedad a la estructura. ¿Dónde termina el ruido y comienza el lenguaje?_
