---
layout: codigo
title: Objeto vacío
date: 2025-01-15
language: JavaScript
concept: "El objeto sin propiedades. La estructura sin contenido. ¿Qué es un objeto vacío?"
---

```javascript
// Un objeto vacío
const vacio = {};

// ¿Está vacío?
console.log("Claves del objeto:", Object.keys(vacio));
console.log("Cantidad de claves:", Object.keys(vacio).length);

// Pero existe
console.log("El objeto:", vacio);
console.log("Tipo:", typeof vacio);

// Tiene forma
// Pero no tiene contenido
// Como un recipiente sin nada
// O un recipiente lleno de nada

// ¿Es nada o es algo?
// ¿El objeto vacío es ausencia o presencia?
const algo = vacio;
console.log("¿algo === vacio?", algo === vacio);
console.log("¿algo == vacio?", algo == vacio);

// El vacío es algo
// La ausencia es presencia
// El objeto vacío existe
console.log("JSON.stringify(vacio):", JSON.stringify(vacio));
```

---

_Un objeto sin propiedades. ¿Es nada o es la forma más pura de algo?_

