---
layout: codigo
title: Iteración infinito
date: 2025-01-15
language: JavaScript
concept: "El loop como meditación. La repetición como forma de existencia."
---

```javascript
// Iteración infinito
let contador = 0;
const limite = input("¿Cuántas veces quieres existir?");

console.log("Iniciando iteración...");

while (contador < limite) {
  console.log(`Iteración ${contador + 1}: Estoy aquí`);
  contador++;
  
  if (contador < limite) {
    console.log("  → Continuando...");
  }
}

console.log("Iteración completada.");
console.log("Total de iteraciones:", contador);

// ¿Qué pasa si el límite fuera infinito?
// ¿El código que nunca termina es código?
// ¿La repetición infinita es existencia o ausencia?
```

---

_Un loop limitado. ¿Qué significa cuando el límite es infinito?_

