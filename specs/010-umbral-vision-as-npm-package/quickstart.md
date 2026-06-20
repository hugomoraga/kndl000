# Quickstart: Repo `hugomoraga/umbral-vision` desde cero

**Created**: 2026-06-20
**Feature**: `specs/010-umbral-vision-as-npm-package/spec.md`

Pasos mínimos para clonar el repo nuevo y verificar que está sano. Se asume que el repo ya fue creado y el código extraído (Phase 2-3 del tasks.md ya completas).

## Pre-flight

```bash
node --version    # ≥ 18
npm --version     # ≥ 9
git --version     # ≥ 2.30
```

## Clonar e instalar

```bash
git clone https://github.com/hugomoraga/umbral-vision.git
cd umbral-vision
npm ci
```

## Verificar que todo funciona

```bash
# Lint
npm run lint
# Esperado: 0 errores, 0 warnings (o warnings documentados)

# Tests
npm test
# Esperado: 3-5 tests, todos verde, <5s

# Build
npm run build
# Esperado: dist/index.mjs y dist/index.cjs creados, <50 KB cada uno

# Pack dry-run (sin publicar)
npm pack --dry-run
# Esperado: tarball contiene dist/, src/, README.md, LICENSE, CHANGELOG.md, package.json
```

## Consumir el paquete en otro proyecto

```bash
mkdir test-consumer && cd test-consumer
npm init -y
npm install @hugomoraga/umbral-vision
```

Crear `index.js`:

```js
import { startVisualizer, Effects } from '@hugomoraga/umbral-vision';

console.log('Efectos disponibles:', Object.keys(Effects));
// Esperado: ['tunnel', 'spiral', 'mandala', 'particles', 'waves', 'fractal', 'matrix', 'glitch', 'melt', 'biomech', 'dune']

// startVisualizer('tunnel') requiere p5 + DOM; sólo se prueba en browser.
```

Y verificar:

```bash
node index.js
# Esperado: imprime los 11 efectos sin error
```

## Consumir en el browser

`examples/basic.html` (referencia):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Umbral Vision - Demo</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js"></script>
</head>
<body>
  <script type="module">
    import { startVisualizer } from '@hugomoraga/umbral-vision';
    startVisualizer('tunnel');
  </script>
</body>
</html>
```

Servir:

```bash
npx http-server -p 8080
# Abrir http://localhost:8080/examples/basic.html
# Esperado: efecto túnel animado en pantalla completa
```

## Verificar el workflow de CI

Tras mergear `.github/workflows/ci.yml` a `main`:

1. Ir a `https://github.com/hugomoraga/umbral-vision/actions`
2. Verificar que el último run está ✅ verde en matriz Node 18/20/22
3. Click en el run → "Run npm pack" debe mostrar el tarball esperado

## Publicar nueva versión

```bash
# 1. Hacer cambios, commitear
git add .
git commit -m "feat: nuevo efecto plasma"

# 2. Bumpear versión (manual por ahora)
npm version minor  # o patch, o major

# 3. Push con tags
git push && git push --tags

# 4. CI publica automáticamente (release.yml)
# 5. Verificar
npm view @hugomoraga/umbral-vision version
```

## Troubleshooting

### `npm ci` falla por peer dep de p5

```bash
npm install --no-save p5@^2.0.0
# Sólo para que el smoke test pueda importar; no se commitea
```

O más simple: agregar `p5` a `devDependencies` (no ideal pero resuelve el smoke test en jsdom). **Discusión en research.md decisión 1.**

### El submodule en kndl000 queda vacío tras clone

```bash
cd kndl000
git submodule update --init --recursive
```

### `npm publish` falla con 403

El `NPM_TOKEN` no tiene scope de publish para `@hugomoraga`. Regenerar token con scope correcto:

```bash
npm token revoke <token-id>
npm login
npm token create --type=automation
# Actualizar secret en GitHub repo settings
```

## Next steps

Tras verificar este quickstart, continuar con spec 011 (UX/UI) o spec 012 (performance). El repo `hugomoraga/umbral-vision` ya está listo para recibir cambios upstream.