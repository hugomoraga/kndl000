# Umbral Tone

Framework modular y extensible para generación de música con Tone.js.

## Principios de Diseño

- **KISS**: Keep It Simple, Stupid - Cada módulo tiene una responsabilidad clara
- **Modular**: Componentes independientes que se pueden combinar
- **Extensible**: Fácil de añadir nuevos canales, efectos y generadores

## Estructura

```
umbral-tone/
├── index.js           # Framework - Punto de entrada (exporta todas las funciones)
├── app.js             # Aplicación - Mixer con UI y controles (usa el framework)
│
├── Channel.js         # Clase para manejar un canal individual
├── Mixer.js           # Clase para manejar múltiples canales
├── Transport.js       # Control de tempo y reproducción
├── Effects.js         # Utilidades para efectos de audio
├── Generators.js      # Utilidades para generar patrones
├── PresetLoader.js    # Cargador de presets
├── PatternEditor.js   # Editor de patrones
│
└── README.md          # Documentación
```

## Uso Básico

### 1. Cargar el framework

El framework usa módulos ES6. Solo necesitas cargar Tone.js y tu script principal:

```html
<script src="https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js"></script>
<script type="module" src="tu-script.js"></script>
```

### 2. Importar el framework

En tu script JavaScript, importa lo que necesites:

```javascript
import { Channel, Mixer, Transport, Effects, Generators } from './umbral-tone/index.js';
```

O importa módulos individuales:

```javascript
import { Channel } from './umbral-tone/Channel.js';
import { Effects } from './umbral-tone/Effects.js';
```

### 3. Crear un canal

```javascript
// Canal con sintetizador
const channel = new Channel({
  name: 'Kick',
  volume: -4
});
channel.source = new Tone.MembraneSynth({
  oscillator: { type: 'sine' }
});
channel._rebuildChain();

// Añadir efectos
channel.addEffects(Effects.ambient({
  delay: { delayTime: '8n', feedback: 0.3 },
  reverb: { roomSize: 0.8, wet: 0.4 }
}));
```

### 4. Crear un mixer

```javascript
const mixer = new Mixer({ masterVolume: -4 });
mixer.addChannel('kick', channel);
```

### 5. Crear transport y loops

```javascript
const transport = new Transport({ bpm: 120 });

// Loop con acceso al stepCount
channel.setLoop((time, stepCount) => {
  const step = stepCount % 16;
  if (step === 0 || step === 4 || step === 8 || step === 12) {
    channel.source.triggerAttackRelease('C1', '8n', time);
  }
}, '16n', transport);

// Iniciar
await transport.start();
mixer.startLoops();
```

## API

### Channel

- `new Channel(config)` - Crea un canal
- `addEffect(effect)` - Añade un efecto
- `addEffects(effects)` - Añade múltiples efectos
- `setVolume(db)` - Establece volumen
- `setMute(muted)` - Mute/unmute
- `setSolo(solo)` - Solo
- `setLoop(callback, interval, transport)` - Establece un loop
- `startLoop(time)` - Inicia el loop
- `stopLoop()` - Detiene el loop
- `connect(destination)` - Conecta a un destino
- `dispose()` - Limpia recursos

### Mixer

- `new Mixer(config)` - Crea un mixer
- `addChannel(key, channel)` - Añade un canal
- `getChannel(key)` - Obtiene un canal
- `updateChannelStates()` - Actualiza mute/solo
- `setMasterVolume(db)` - Volumen master
- `startLoops(time)` - Inicia todos los loops
- `stopLoops()` - Detiene todos los loops
- `dispose()` - Limpia recursos

### Transport

- `new Transport(config)` - Crea un transport
- `setBPM(bpm)` - Establece BPM
- `start()` - Inicia reproducción
- `stop()` - Detiene reproducción
- `getStepCount()` - Obtiene contador de steps
- `createLoop(callback, interval)` - Crea loop con stepCount

### Effects

- `Effects.delay(config)` - Crea delay
- `Effects.reverb(config)` - Crea reverb
- `Effects.filter(config)` - Crea filtro
- `Effects.chorus(config)` - Crea chorus
- `Effects.compressor(config)` - Crea compressor
- `Effects.ambient(config)` - Crea cadena delay + reverb

### Generators

- `Generators.pattern(steps, callback)` - Genera patrón de steps
- `Generators.kick4_4(callback)` - Patrón 4/4
- `Generators.random(probability, callback)` - Patrón aleatorio
- `Generators.every(n, callback)` - Cada N steps
- `Generators.energyCycle(length, callback)` - Ciclo de energía
- `Generators.randomFrom(array)` - Selecciona elemento aleatorio
- `Generators.pitchVariation(base, range)` - Variación de pitch

## Ejemplo Completo

Ver `app.js` para un ejemplo completo de uso del framework. Este archivo muestra cómo:
- Crear canales de audio
- Configurar un mixer
- Usar transport y loops
- Aplicar efectos
- Cargar presets
- Gestionar patrones

## Estructura de Archivos

- **`index.js`** - Framework puro, exporta todas las funciones. Úsalo cuando quieras importar el framework en otro proyecto.
- **`app.js`** - Aplicación completa del Mixer. Se carga directamente en el HTML y maneja todos los controles de UI.

