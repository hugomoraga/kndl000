# Implementation Plan: Umbral Vision como submódulo y paquete npm

**Branch**: `010-umbral-vision-as-npm-package` | **Date**: 2026-06-20 | **Spec**: `specs/010-umbral-vision-as-npm-package/spec.md`

**Input**: Feature specification from `/specs/010-umbral-vision-as-npm-package/spec.md`

## Summary

Extraer `assets/js/umbral-vision/` del repo Jekyll `kndl000` (sitio estático en `https://kundala000.com`) a un repositorio independiente `hugomoraga/umbral-vision`, publicarlo como paquete npm público con scope `@hugomoraga`, y consumirlo desde `kndl000` vía submódulo git pinned + dependencia npm. El framework es JS vanilla + p5.js (no build step hoy). El trabajo de empaquetado introduce esbuild como bundler, lint (ESLint) y smoke test (vitest en jsdom) en el repo nuevo; deja al `kndl000` con un paso de CI extra para sincronizar el submodule.

## Technical Context

**Language/Version**: JavaScript ES2022 (módulos ES6, async/await, Web Audio API, p5.js v1/v2).
**Primary Dependencies (consumidor)**: `p5` (`peerDependencies: ^1.0.0 || ^2.0.0`).
**Primary Dependencies (dev del repo)**: `esbuild` (bundler), `vitest` (smoke tests en jsdom), `eslint` (lint), `npm` (publish).
**Storage**: N/A (código fuente + artefactos en dist/, sin DB).
**Testing**: Vitest + jsdom para smoke test que importa el bundle ESM y verifica exports nombrados + `Effects.tunnel(sketchStub).draw()` no lanza.
**Target Platform**: Browsers modernos (Chrome/Edge/Firefox/Safari evergreen) vía bundle ESM; Node 18/20/22 para tooling y CI.
**Project Type**: Library (npm package publicable) + integración en sitio estático.
**Performance Goals**: Bundle ESM ≤200 KB minificado (sólo el framework, p5 viene aparte por el consumidor); cold import <50 ms en Node.
**Constraints**: Sin dependencias runtime nuevas (sólo `p5` como peer); sin TypeScript para mantener cero overhead; sin transpilación a ES5 (campo `engines.node: ">=18"`).
**Scale/Scope**: 7 archivos fuente (~1.549 LOC) + 1 README; 0 cambios al comportamiento runtime en esta spec.

## Constitution Check

*Ponytail gates aplicados (ver `AGENTS.md`)*:

- **YAGNI**: ✅ No se introduce TypeScript, ni bundler ultra-configurable, ni documentación generada por typedoc. Sólo esbuild (1 archivo de config), vitest (1 config), eslint (1 config plana).
- **Stdlib first**: ✅ El framework ya es zero-dep runtime; se mantiene.
- **Native platform**: ✅ Se prefiere `import maps` nativos para el consumidor en vez de bundler adicional en `kndl000`.
- **Already-installed**: N/A en repo nuevo (empezamos de cero, intencionalmente).
- **One-liner first**: El comando de split es `git subtree split -P assets/js/umbral-vision -b umbral-vision` (one-shot). El setup de npm publish es `npm init -y` + editar 5 campos.
- **Deletion over addition**: ✅ Se elimina `assets/js/umbral-vision/` como carpeta tracked en `kndl000` (reemplazada por gitlink de submodule).
- **Input validation at trust boundaries**: ✅ La función `initAudio()` ya valida `navigator.mediaDevices.getUserMedia`; el bundle exporta los mismos entry points.
- **ponytail markers**: Se marcan las simplificaciones explícitas (esbuild en vez de rollup multi-config, ESLint flat config plana, jsdom en vez de Playwright para smoke).

*Gates passed*. No violations que justifiquen complejidad extra.

## Project Structure

### Documentation (this feature)

```text
specs/010-umbral-vision-as-npm-package/
├── spec.md              # Este spec (entrada)
├── plan.md              # Este plan
├── tasks.md             # Task list por US
├── checklist.md         # Checklist de verificación final
├── research.md          # Decisiones: bundler, test runner, split strategy
├── data-model.md        # Modelo: paquete npm + submodule + versionado
├── contracts/
│   └── exports.md       # Contrato del campo `exports` del package.json
└── quickstart.md        # Pasos para arrancar el repo nuevo localmente
```

### Source Code (repos resultantes)

```text
# Repo NUEVO: github.com/hugomoraga/umbral-vision
umbral-vision/
├── src/                          # fuente del framework (migrada desde kndl000/assets/js/umbral-vision/)
│   ├── effects/
│   │   └── index.js              # antiguo Effects.js (re-exporta los 11 efectos)
│   ├── effects/*                 # un archivo por efecto (split opcional, P3)
│   ├── visualizer.js             # antiguo Visualizer.js
│   ├── audio.js                  # antiguo AudioReactive.js
│   ├── transition.js             # antiguo Transition.js
│   ├── utils.js                  # antiguo Utils.js
│   └── index.js                  # root entry, re-exporta todo
├── examples/
│   └── basic.html                # demo standalone
├── dist/                         # generado por esbuild (gitignored)
│   ├── index.mjs
│   ├── index.cjs
│   └── *.map
├── scripts/
│   └── build.mjs                 # wrapper de esbuild
├── tests/
│   └── smoke.test.js             # vitest + jsdom
├── .github/workflows/ci.yml      # matriz Node 18/20/22, lint, test, pack
├── esbuild.config.mjs            # config plana
├── eslint.config.mjs             # flat config
├── vitest.config.mjs             # config plana
├── package.json                  # name, exports, files, peerDependencies, provenance
├── README.md                     # instalación, uso, API
├── CHANGELOG.md                  # keep-a-changelog, sección 0.1.0
└── LICENSE                       # MIT (default de hugomoraga)
```

```text
# Repo MODIFICADO: kndl000 (Jekyll)
kndl000/
├── .gitmodules                   # NUEVO: registra submodule
├── assets/js/umbral-vision/      # AHORA gitlink (no tracked como árbol)
│   └── ...                       # contenido vive en hugomoraga/umbral-vision
├── package.json                  # MODIFICADO: agrega @hugomoraga/umbral-vision
├── visual/generator/index.md     # MODIFICADO: importa desde @hugomoraga (o ruta local del submodule)
└── .github/workflows/jekyll.yml  # MODIFICADO: paso git submodule update --init
```

**Structure Decision**: Repo `hugomoraga/umbral-vision` con estructura `src/` (fuente) + `dist/` (artefactos generados, gitignored) + `tests/` + `examples/`. Mantiene la simplicidad del flat layout original (no se introduce `lib/`, `bin/`, etc.). La carpeta actual `assets/js/umbral-vision/` se conserva como submodule pointer (el path no cambia para no tocar `_layouts/generator.html`).

## Complexity Tracking

> Solo se llena si Constitution Check tiene violaciones que justifiquen.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Ninguna | — | — |

**Decisiones explícitas que parecen complejidad pero están justificadas** (no son violaciones):

1. **Bundler (esbuild)** — sin bundler no hay `dist/index.mjs`+`index.cjs` publicable. Elegido esbuild sobre rollup porque esbuild es 1 archivo de config y ~10× más rápido (relevant cuando CI corre `npm run build` antes de pack).
2. **Vitest + jsdom** — smoke test mínimo para CI verde. Rechazado Playwright (overkill, requiere binarios browser en CI).
3. **Git submodule + npm dependency duales** — pareciera duplicación, pero el submodule fija el commit reproduciblemente (esencial cuando kndl000 hace deploys atómicos) y la dep npm permite a CI resolver rápido vía cache de registry. Documentado en README de kndl000.

## Implementation Strategy

### Split strategy (decisión clave)

Se elige **`git subtree split`** sobre `git filter-repo` por estas razones:

- `subtree split` produce una rama con historia preservada que se pushea directo al repo nuevo (`git push hugomoraga umb:v0.1.0`). Sin reescritura destructiva de `kndl000`.
- `filter-repo` reescribe SHA y borra archivos del repo origen, lo cual rompe la historia visible de los 7 archivos en `kndl000`. No queremos eso: el repo del blog debe poder mostrar `git log -- assets/js/umbral-vision/` hasta el día del split.
- El nuevo repo nace con una historia "lineal pero coherente" (todos los commits de esos 7 archivos, filtrados).

Comando (referencia, no se ejecuta aún):

```bash
# desde kndl000
git subtree split -P assets/js/umbral-vision -b umbral-vision-split
# crea rama temporal con la historia de esos archivos
# luego se pushea a hugomoraga/umbral-vision
git push hugomoraga/umbral-vision umbral-vision-split:main
git tag v0.1.0 main
git push hugomoraga/umbral-vision v0.1.0
```

### Versioning initial

- `0.1.0`: este split. Versión "moving target" porque la API va a cambiar con 011/012/013.
- `1.0.0`: después de que 011 (UX/UI) y 012 (performance) estabilicen la API pública.
- SemVer estricto desde el día 0 (campo `version` y tag coinciden).

### npm publishing

- `npm publish --access public` con `NPM_TOKEN` desde secret de GitHub.
- Provenance activado (`npm publish --provenance=true`) para que el badge de "verified" aparezca en npmjs.com.
- Scope `@hugomoraga` requiere que el usuario sea owner del scope (configurar una vez en npmjs.com).

### kndl000 integration

- `kndl000/package.json` agrega `"@hugomoraga/umbral-vision": "^0.1.0"` en `dependencies`.
- `assets/js/umbral-vision/` deja de tener archivos tracked; pasa a ser un gitlink.
- El import en `visual/generator/index.md` (vía `<script type="module">`) puede seguir apuntando a `./umbral-vision/app.js` porque el submodule preserva el path.
- `app.js` reescrito para importar de `./index.js` (que es el index del paquete dentro del submodule, no del node_modules).
- El CI de Jekyll gana un paso: `git submodule update --init --recursive` antes de `npm ci`.

### Rollback plan

Si algo rompe post-publish:
1. `npm unpublish @hugomoraga/umbral-vision@0.1.0` (dentro de las 72h).
2. `git push --delete hugomoraga/umbral-vision v0.1.0` y `git push --delete origin main` en el repo nuevo.
3. `kndl000`: `git rm --cached assets/js/umbral-vision && git submodule deinit -f assets/js/umbral-vision && rm -rf .git/modules/assets/js/umbral-vision`.
4. Restaurar los 7 archivos desde el último commit de kndl000 que los tenía tracked (pre-split).
5. Redeploy.

## Risks

| Riesgo | Mitigación |
|--------|-----------|
| Tag del submodule y versión npm se desfasan | Script `scripts/sync-version.sh` en repo nuevo + chequeo en CI de `kndl000` que falla si `package.json version !== git describe --tags` |
| `npm publish` accidental de código sin testear | CI obligatorio verde + workflow manual dispatch con environment `production` y required reviewers |
| p5.js v2 breaking changes en efectos existentes | Smoke test importa y stub-ea `p5` con mock mínimo; efectos se testean con `sketchStub = { createCanvas: () => {}, colorMode: () => {}, ... }` |
| Submodule vacío en clone fresco de `kndl000` | Workflow Jekyll corre `git submodule update --init --recursive`; documentado en README de `kndl000` |
| Historia filtrada demasiado profunda (cientos de commits) | Aceptable; el README del nuevo repo resume los hitos. No se aplana. |

## Dependencies & Execution Order

Ver `tasks.md` para el desglose. Resumen:

1. **US1 (P1)**: Crear repo + split → bloquea todo lo demás.
2. **US2 (P1)**: Configurar `package.json` + bundler → depende de US1.
3. **US4 (P2)**: CI del repo nuevo → depende de US2 (necesita `npm test` y `npm run build`).
4. **US3 (P1)**: Integrar en `kndl000` (submodule + dep + workflow) → depende de US2 (necesita versión publicable).

US4 puede correr en paralelo con US3.

## References

- `specs/010-umbral-vision-as-npm-package/spec.md` — requisitos y user stories
- `specs/010-umbral-vision-as-npm-package/tasks.md` — task list
- `specs/010-umbral-vision-as-npm-package/checklist.md` — verificación final
- `AGENTS.md` — gates de Ponytail
- `.specify/templates/spec-template.md` — formato del spec