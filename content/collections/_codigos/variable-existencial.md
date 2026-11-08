---
layout: codigo
title: Variable existencial
date: 2025-01-15
language: JavaScript
concept: "La existencia precede a la esencia. ¿Qué es una variable antes de ser asignada?"
---

```javascript
output({ type: "meta", text: "Antes de la asignación" });
let existencia;

// ¿Qué es existencia?
console.log("Antes de asignar:", existencia);
console.log("Tipo:", typeof existencia);

output({ type: "meta", text: "La existencia precede a la esencia" });
existencia = "soy";

// Ahora tiene esencia
console.log("Después de asignar:", existencia);
console.log("Tipo:", typeof existencia);

// Pero ¿qué era antes?
// ¿Era nada o era potencialidad?
// ¿El undefined es ausencia o posibilidad?
console.log("¿undefined === null?", undefined === null);
console.log("¿undefined == null?", undefined == null);

output({
  type: "conclusion",
  text: "Una variable sin valor.\n¿Es nada o es todo lo que puede ser?"
});
```

---

_Una variable sin valor. ¿Es nada o es todo lo que puede ser?_

