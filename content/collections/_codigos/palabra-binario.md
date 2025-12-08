---
layout: codigo
title: Palabra a binario
date: 2025-01-15
language: JavaScript
concept: "La palabra como código. El lenguaje convertido en binario."
---

```javascript
// Convertir palabra a binario
const palabra = input("Ingresa una palabra: ");

console.log(`Palabra: "${palabra}"`);
console.log("");

// Convertir cada carácter a binario
for (let i = 0; i < palabra.length; i++) {
  const char = palabra[i];
  const charCode = char.charCodeAt(0);
  
  // Convertir a binario (8 bits)
  let binario = charCode.toString(2);
  binario = binario.padStart(8, '0');
  
  console.log(`${char} → ${charCode} → ${binario}`);
}

console.log("");
console.log("Binario completo:");
const binarioCompleto = palabra
  .split('')
  .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
  .join(' ');
console.log(binarioCompleto);
```

---

_La palabra convertida en código. El lenguaje como secuencia de ceros y unos._

