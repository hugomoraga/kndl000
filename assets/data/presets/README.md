# Presets de Tracks Generativos

Los presets permiten guardar y cargar configuraciones completas del mixer, incluyendo volúmenes, efectos (delay, reverb), mute/solo, y BPM.

## Formato

Los presets pueden estar en formato **JSON** o **YAML**. JSON es más compatible con el navegador, YAML es más legible.

## Estructura

```json
{
  "name": "Nombre del Preset",
  "description": "Descripción opcional",
  "bpm": 120,
  "masterVolume": -4,
  "channels": {
    "kick": {
      "volume": -4,
      "muted": false,
      "solo": false,
      "effects": null
    },
    "hihat": {
      "volume": -10,
      "muted": false,
      "solo": false,
      "effects": {
        "delay": {
          "wet": 0.3,
          "feedback": 0.35,
          "delayTime": 0.125
        },
        "reverb": {
          "wet": 0.4,
          "roomSize": 0.8
        }
      }
    }
  }
}
```

## Parámetros

### Nivel raíz
- `name`: Nombre del preset (string)
- `description`: Descripción opcional (string)
- `bpm`: BPM del track (80-160)
- `masterVolume`: Volumen master en dB (-20 a 0)

### Canales
Cada canal puede tener:
- `volume`: Volumen en dB (-20 a 0)
- `muted`: Si está muteado (boolean)
- `solo`: Si está en solo (boolean)
- `effects`: Objeto con efectos o `null`

### Efectos

#### Delay
- `wet`: Cantidad de señal con delay (0-1)
- `feedback`: Feedback del delay (0-1)
- `delayTime`: Tiempo de delay en segundos (ej: 0.125 = 8n)

#### Reverb
- `wet`: Cantidad de señal con reverb (0-1)
- `roomSize`: Tamaño de la sala (0-1)

## Canales disponibles

- `kick`: Kick 4/4
- `bass`: Bass samples
- `hihat`: Hi-hat samples
- `drone`: Drone sample
- `pad`: Pad sintético
- `perc`: Perc sample
- `lead`: Lead sintético

## Ejemplo YAML

```yaml
name: "Mi Preset"
bpm: 120
masterVolume: -4

channels:
  kick:
    volume: -4
    muted: false
    solo: false
    effects: null
  
  hihat:
    volume: -10
    muted: false
    solo: false
    effects:
      delay:
        wet: 0.3
        feedback: 0.35
        delayTime: 0.125
      reverb:
        wet: 0.4
        roomSize: 0.8
```

## Añadir un nuevo preset

1. Crea un archivo `.json` o `.yaml` en `/assets/data/presets/`
2. Añade el preset al array en `mixer.js`:

```javascript
const presets = [
  { name: 'Mi Preset', file: '/assets/data/presets/mi-preset.json' }
];
```

## Notas

- Los valores de `delayTime` están en segundos. 0.125 = 8n a 120 BPM
- `wet` controla la mezcla entre señal seca y con efecto (0 = solo seco, 1 = solo efecto)
- `roomSize` en reverb: valores más altos = espacios más grandes
- `feedback` en delay: valores más altos = más repeticiones

