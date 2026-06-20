# Contract: Campo `exports` del paquete npm

**Created**: 2026-06-20
**Feature**: `specs/010-umbral-vision-as-npm-package/spec.md`

## Forma final esperada

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./effects": {
      "import": "./dist/effects/index.mjs",
      "require": "./dist/effects/index.cjs",
      "default": "./dist/effects/index.mjs"
    },
    "./visualizer": {
      "import": "./dist/visualizer.mjs",
      "require": "./dist/visualizer.cjs",
      "default": "./dist/visualizer.mjs"
    },
    "./audio": {
      "import": "./dist/audio.mjs",
      "require": "./dist/audio.cjs",
      "default": "./dist/audio.mjs"
    },
    "./transition": {
      "import": "./dist/transition.mjs",
      "require": "./dist/transition.cjs",
      "default": "./dist/transition.mjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs",
      "default": "./dist/utils.mjs"
    },
    "./src/*": "./src/*",
    "./package.json": "./package.json",
    "./README.md": "./README.md"
  }
}
```

## Razón de cada subpath

### `.` — root

API pública completa. Lo que la mayoría de consumidores importan:

```js
import { startVisualizer, Effects } from '@hugomoraga/umbral-vision';
```

Equivalente al `index.js` actual.

### `./effects`

Sólo los efectos, sin el visualizer (que los monta). Útil para usuarios que quieren construir su propio visualizer sobre los efectos.

```js
import { Effects } from '@hugomoraga/umbral-vision/effects';
```

### `./visualizer`, `./audio`, `./transition`, `./utils`

Módulos individuales. Para tree-shaking agresivo o para evitar cargar `audio.js` cuando no se necesita micrófono.

```js
import { startVisualizer } from '@hugomoraga/umbral-vision/visualizer';
import { initAudio } from '@hugomoraga/umbral-vision/audio';
```

**Nota**: estos subpaths requieren que el bundler emita un bundle por archivo. Si se opta por un único bundle (más simple), `./visualizer` puede apuntar al mismo `dist/index.mjs`. **Decisión a tomar en T015** — empezar con single-bundle y agregar split sólo si SC-001 lo justifica.

### `./src/*`

Acceso a la fuente sin transpilar. Para consumidores que quieren extender o leer el código.

```js
import { Effects } from '@hugomoraga/umbral-vision/src/Effects.js';
```

Sin `.js` extension en el import es OK en Node moderno.

### `./package.json` y `./README.md`

Convenciones estándar del ecosistema. Algunos bundlers/tests hacen `require('@scope/pkg/package.json')` para leer metadata.

## Garantías del contrato

### G-001: Tree-shaking

Las herramientas modernas (Rollup, esbuild, Webpack 5+, Vite) respetan `exports` y pueden tree-shakear entre subpaths.

### G-002: CommonJS compatibility

Cada subpath tiene una condición `require` que apunta a `.cjs`. Consumers en Node con `require()` funcionan.

### G-003: ESM preferred

Node ≥18 y todos los browsers modernos usan la condición `import` automáticamente.

### G-004: No breaking changes sin SemVer

Añadir nuevos subpaths es MINOR. Cambiar la ruta de uno existente es MAJOR. Borrar es MAJOR.

## Cómo se genera

En `esbuild.config.mjs`:

```js
// Opción A: single bundle (más simple)
const entry = {
  'index': 'src/index.js'
};

// Opción B: split por módulo (mejor para tree-shaking)
const entry = {
  'index': 'src/index.js',
  'effects/index': 'src/effects/index.js',
  'visualizer': 'src/visualizer.js',
  'audio': 'src/audio.js',
  'transition': 'src/transition.js',
  'utils': 'src/utils.js'
};

await build({
  entryPoints: entry,
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
  target: ['es2022'],
  splitting: false  // ponytail: single-bundle es suficiente para 7 archivos
});
```

**Recomendación**: Opción A (single bundle). Razones:
- 7 archivos, ~1.500 LOC → bundle único sigue siendo pequeño (<50 KB).
- Splitting agrega complejidad al config y al campo `exports` (un bundle por subpath).
- Tree-shaking del single-bundle funciona porque cada export es named.

Si en el futuro (después de spec 013) se agregan 10+ efectos y el bundle supera 100 KB, se reconsidera.

## Testing del contrato

El smoke test verifica que el campo `exports` del `package.json` del paquete instalado es parseable y apunta a archivos existentes:

```js
// tests/smoke.test.js (extracto)
import pkg from '../package.json' assert { type: 'json' };
import { existsSync } from 'node:fs';

test('campo exports apunta a archivos que existen', () => {
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === 'string') {
      expect(existsSync(target.replace(/^\.\//, ''))).toBe(true);
    } else if (target.import) {
      expect(existsSync(target.import.replace(/^\.\//, ''))).toBe(true);
    }
  }
});
```

## Compatibilidad

- **Node ≥18**: ✅ Soporta `exports` y condiciones desde 12.x.
- **Browsers modernos**: El bundler del consumidor resuelve; el browser nunca lee `exports`.
- **Bundlers legacy (Webpack 4)**: ❌ No soportan `exports` correctamente. Documentar en README que se requiere Webpack 5+ / Vite / esbuild / Rollup reciente.