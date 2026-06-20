# Research: Umbral Vision como submódulo y paquete npm

**Created**: 2026-06-20
**Feature**: `specs/010-umbral-vision-as-npm-package/spec.md`

Decisiones técnicas tomadas durante la planificación, con su rationale.

## 1. Bundler: esbuild vs rollup vs tsup

**Decisión**: esbuild.

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| esbuild | 1 archivo config, ~10× más rápido que rollup, formato ESM+CJS nativo | API menos idiomática que rollup, menos plugins | ✅ Elegido |
| rollup | Idiomático para libraries, tree-shaking excelente | Config verbose, plugins necesarios para CJS, más lento | ❌ Overkill |
| tsup | Wrapper de esbuild con defaults razonables | Capa extra sobre esbuild, menos control | ❌ YAGNI: agregaría dep sin valor |

**Umbral Vision** no tiene dependencias runtime (sólo p5 como peer), no usa dynamic imports, no necesita code splitting. esbuild resuelve el bundling trivial sin plugins. **Configuración esperada**: 10-15 líneas.

```js
// esbuild.config.mjs (referencia)
import { build } from 'esbuild';
await build({
  entryPoints: ['src/index.js'],
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
  target: ['es2022']
});
await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.cjs',
  format: 'cjs',
  sourcemap: true,
  platform: 'neutral'
});
```

## 2. Test runner: vitest vs jest vs node:test

**Decisión**: vitest.

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| vitest | ESM nativo, config mínima, watch mode, integrado con esbuild | Dependencia extra (~30 MB) | ✅ Elegido |
| jest | Maduro, ampliamente conocido | Config Babel para ESM, lento, opinionated | ❌ |
| node:test | Built-in en Node 18+, cero deps | API menos rica, sin watch UI | ❌ Pierde demasiado por evitar 30 MB |

**Justificación**: El smoke test es trivial (importar bundle + verificar exports + ejecutar stub). vitest corre en jsdom y en menos de 5s. La "dependencia extra" es aceptable porque es dev-only.

## 3. Split strategy: git subtree vs git filter-repo

**Decisión**: `git subtree split`.

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| git subtree split | No destructivo en origen, preserva historia visible en kndl000, builtin en git | Tag mapping no automático | ✅ Elegido |
| git filter-repo | Repo resultante más "limpio", rewrite completo | Destructivo (altera SHA del origen), borra archivos del path en kndl000 | ❌ Rompe `git log -- assets/js/umbral-vision/` en kndl000 |

**Consecuencia**: `kndl000` mantiene sus commits originales de los 7 archivos. El repo nuevo hereda esa historia filtrada a una rama lineal. Quien clone `kndl000` puede seguir viendo la evolución de Umbral Vision dentro del blog hasta el día del split.

**Trade-off aceptado**: El repo nuevo tiene historia "extraída" sin un commit "Initial commit" propio. Se mitiga con un README que enlaza al repo origen y un CHANGELOG que documenta el split.

## 4. Submodule + npm dual

**Decisión**: Usar ambos en `kndl000`.

¿Suena redundante? Sí. Pero cada uno cumple un rol distinto:

| Mecanismo | Para qué sirve |
|-----------|----------------|
| git submodule | Tracking git pinned a commit/tag específico. Permite que `kndl000` deploye siempre con la misma versión de Umbral Vision, byte-por-byte. |
| npm dependency | Resolución rápida en CI (cache de registry), instalable con `npm ci` estándar, futura compatibilidad con bundlers de kndl000 si se desea tree-shaking. |

**Cómo se sincronizan**:
- Al agregar el submodule, se elige un tag (`v0.1.0`).
- El `package.json` de kndl000 declara `"@hugomoraga/umbral-vision": "^0.1.0"`.
- Si `npm ci` resuelve una versión mayor a la del submodule, falla el check (ver SC-005).
- Para actualizar: bump tag → push tag → CI publica nueva versión → bumpear submodule + `package.json` en kndl000.

## 5. Field `exports` del package.json

**Decisión**: Subpaths granulares + `./src/*` para acceso al source sin transpilar.

Razón: consumidores que quieran extender efectos (caso de uso esperado de un framework "extensible") pueden importar la fuente directo, no el bundle compilado. Esto evita forkear el proyecto para personalizaciones menores.

Ver `contracts/exports.md` para el detalle.

## 6. Sin TypeScript

**Decisión**: Mantener JS puro.

El código actual es JS vanilla con JSDoc (algunos archivos tienen bloques `/** */` pero sin tipos formales). Introducir TypeScript ahora:
- obligaría a configurar tsconfig, build step adicional, declaraciones `.d.ts`.
- retrasaría el packaging 2-3× sin beneficio inmediato.
- el consumidor puede agregar tipos vía JSDoc + `// @ts-check` si lo necesita.

**Cuándo reconsiderar**: Si para v1.0.0 se quiere ofrecer tipos first-class. Hoy es YAGNI.

## 7. Sin transpilación a ES5

**Decisión**: `engines.node: ">=18"`, target esbuild `es2022`.

Todos los browsers evergreen (Chrome/Edge/Firefox/Safari 14+) soportan ES2022. No tiene sentido agregar Babel/SWC para soportar IE11 (que está muerto desde junio 2022). **ponytail**: la API actual usa `async/await`, `let/const`, `class`, módulos ES6 — todo nativo desde hace años.

## 8. Publicación: access public + provenance

**Decisión**: `npm publish --access public --provenance`.

- `--access public`: requerido por npm para scopes (sino asume private y falla).
- `--provenance`: genera attestation firmada por GitHub Actions que prueba que el paquete fue construido por nuestro CI. Badge "verified" en npmjs.com.

Configurar en `package.json`:
```json
"publishConfig": {
  "access": "public",
  "provenance": true
}
```

## 9. Licencia: MIT

**Decisión**: MIT.

Default razonable para un framework open source. Compatible con uso comercial. Compatible con p5.js (LGPL-friendly, MIT).

## 10. Sin .npmignore (usar campo `files`)

**Decisión**: Campo `files` en `package.json` controla qué se incluye; no se crea `.npmignore`.

Más explícito que ignorararchivos uno por uno. `files: ["dist", "src", "README.md", "LICENSE", "CHANGELOG.md"]` whitelist clara.

## References

- `specs/010-umbral-vision-as-npm-package/plan.md`
- `specs/010-umbral-vision-as-npm-package/contracts/exports.md`
- npm docs: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
- git subtree docs: https://git-scm.com/docs/git-subtree
- esbuild docs: https://esbuild.github.io/