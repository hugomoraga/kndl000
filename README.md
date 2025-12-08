# Umbral Vision

Framework modular y extensible para generación de visuales psicodélicos con p5.js.

## Principios de Diseño

- **KISS**: Keep It Simple, Stupid - Cada módulo tiene una responsabilidad clara
- **Modular**: Componentes independientes que se pueden combinar
- **Extensible**: Fácil de añadir nuevos efectos visuales

## Estructura

```
umbral-vision/
├── Effects.js         # Efectos visuales psicodélicos
├── Visualizer.js      # Gestor principal del canvas y p5.js
├── AudioReactive.js   # Manejo de reactividad al audio
├── Transition.js      # Sistema de transiciones automáticas
├── Utils.js           # Utilidades y funciones helper
├── index.js           # Framework - Punto de entrada (exporta todas las funciones)
├── app.js             # Aplicación - UI y controles (usa el framework)
└── README.md          # Esta documentación
```

## Uso Básico

### 1. Cargar el framework

El framework usa módulos ES6. Solo necesitas cargar p5.js y tu script principal:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.0.3/p5.min.js"></script>
<script type="module" src="tu-script.js"></script>
```

### 2. Importar el framework

En tu script JavaScript, importa lo que necesites:

```javascript
import { Effects, Visualizer, AudioReactive } from './umbral-vision/index.js';
```

O importa módulos individuales:

```javascript
import { Effects } from './umbral-vision/Effects.js';
import { startVisualizer } from './umbral-vision/Visualizer.js';
```

### 3. Iniciar un visualizador

```javascript
import { startVisualizer } from './umbral-vision/index.js';

// Iniciar con un efecto específico
startVisualizer('tunnel');
```

### 4. Cambiar efecto

```javascript
import { changeEffect } from './umbral-vision/index.js';

changeEffect('spiral');
```

### 5. Activar reactividad al audio

```javascript
import { initAudio, stopAudio, getAudioState } from './umbral-vision/index.js';

// Iniciar micrófono
await initAudio();

// Obtener estado
const { enabled, level } = getAudioState();

// Detener
stopAudio();
```

### 6. Transiciones automáticas

```javascript
import { startAutoTransition, stopAutoTransition } from './umbral-vision/index.js';

const effectNames = ['tunnel', 'spiral', 'mandala'];
const interval = 10000; // 10 segundos

startAutoTransition(interval, effectNames, (effectName) => {
  changeEffect(effectName);
});
```

## API

### Visualizer

- `startVisualizer(effectName, container)` - Inicia visualizador con un efecto
- `changeEffect(effectName)` - Cambia el efecto actual
- `getCurrentEffect()` - Obtiene el efecto actual
- `getAvailableEffects()` - Lista de efectos disponibles
- `stopVisualizer()` - Detiene el visualizador

### AudioReactive

- `initAudio()` - Inicializa análisis de audio del micrófono
- `stopAudio()` - Detiene análisis de audio
- `getAudioState()` - Obtiene estado del audio `{ enabled, level }`
- `getFrequencyData()` - Obtiene datos de frecuencia (array)

### Transition

- `startAutoTransition(interval, effectNames, callback)` - Inicia transiciones automáticas
- `stopAutoTransition()` - Detiene transiciones
- `isAutoTransitionEnabled()` - Verifica si están activas

### Effects

- `Effects.tunnel(sketch)` - Efecto túnel
- `Effects.spiral(sketch)` - Espiral psicodélico
- `Effects.mandala(sketch)` - Mandala rotativo
- `Effects.particles(sketch)` - Partículas reactivas
- `Effects.waves(sketch)` - Olas de audio
- `Effects.fractal(sketch)` - Árbol fractal
- `Effects.matrix(sketch)` - Lluvia Matrix

### Utils

- `getInputValue(id, defaultValue, parser)` - Obtiene valor de input
- `normalize(value, min, max)` - Normaliza valor
- `map(value, inMin, inMax, outMin, outMax)` - Mapea valor
- `constrain(value, min, max)` - Limita valor
- `lerp(start, end, t)` - Interpola entre valores

## Crear Nuevos Efectos

Para crear un nuevo efecto, agrégalo a `Effects.js`:

```javascript
export const Effects = {
  // ... efectos existentes ...
  
  miEfecto: (sketch) => {
    let t = 0;
    
    return {
      draw: () => {
        const { enabled: audioEnabled, level: audioLevel } = getAudioState();
        
        sketch.background(0, 10);
        // Tu código de dibujo aquí
        
        t += 0.01;
      }
    };
  }
};
```

## Ejemplo Completo

Ver `app.js` para un ejemplo completo de uso del framework. Este archivo muestra cómo:
- Inicializar el visualizador
- Configurar controles de UI
- Manejar el micrófono
- Implementar transiciones automáticas
- Gestionar fullscreen

## Estructura de Archivos

- **`index.js`** - Framework puro, exporta todas las funciones. Úsalo cuando quieras importar el framework en otro proyecto.
- **`app.js`** - Aplicación completa con UI. Se carga directamente en el HTML y maneja todos los controles.

