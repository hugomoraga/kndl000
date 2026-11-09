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

output({ type: "meta", text: `Palabra: "${palabra}" · ${palabra.length} caracteres` });

// Convertir cada carácter a binario
const filas = [];
for (let i = 0; i < palabra.length; i++) {
  const char = palabra[i];
  const charCode = char.charCodeAt(0);
  const binario = charCode.toString(2).padStart(8, "0");
  filas.push(`${char} → ${charCode} → ${binario}`);
}

output({
  type: "legend",
  text: "carácter → código → binario\n\n" + filas.join("\n")
});

const binarioCompleto = palabra
  .split("")
  .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
  .join(" ");

output({ type: "legend", text: "Binario completo\n" + binarioCompleto });
output({ type: "metric", label: "bits totales", value: palabra.length * 8, unit: "bits" });
output({
  type: "conclusion",
  text:
    "La palabra convertida en código.\n" +
    `Ocupa ${palabra.length * 8} bits: ${palabra.length} caracteres de 8 bits.\n` +
    "El lenguaje como secuencia de ceros y unos."
});
```

---

_La palabra convertida en código. El lenguaje como secuencia de ceros y unos._

