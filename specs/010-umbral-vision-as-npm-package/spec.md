# Feature Specification: Umbral Vision como submódulo y paquete npm

**Feature Branch**: `010-umbral-vision-as-npm-package`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "Primero dejarlo con submódulo git. Tenerlo como una especie de paquete instalable."

**Context**: `assets/js/umbral-vision/` (1.549 LOC, 7 archivos JS + README) es un framework modular de visuales con p5.js que actualmente vive embebido en el repo del sitio Jekyll `kndl000`. Se publica como descarga ZIP/clon desde `https://github.com/hugomoraga/kndl000/tree/main/assets/js/umbral-vision` y se carga vía `<script type="module">` desde `/visual/generator/`. El objetivo es extraerlo a su propio repositorio `hugomoraga/umbral-vision`, publicarlo en el registry público de npm con scope `@hugomoraga`, y consumirlo desde `kndl000` tanto como submódulo git (para desarrollo local y versionado pinned) como dependencia npm (para builds reproducibles).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Repositorio independiente con historia limpia (Priority: P1) 🎯 MVP

[Como mantenedor de Umbral Vision, quiero que el código viva en su propio repo `hugomoraga/umbral-vision` con historia git propia, releases semánticas y CI aislado, para poder evolucionarlo sin acoplarse al blog.]

**Why this priority**: Sin repo independiente no hay forma de versionar, ni de publicar en npm, ni de aceptar PRs externos al framework. Es el bloqueante de US2/US3.

**Independent Test**: Clonar `https://github.com/hugomoraga/umbral-vision` en limpio, correr `git log --oneline` y ver historia coherente desde el primer commit. `git tag -l` debe incluir `v0.1.0` o superior.

**Acceptance Scenarios**:

1. **Given** código actual en `kndl000/assets/js/umbral-vision/`, **When** ejecuto `git filter-repo --subdirectory-filter assets/js/umbral-vision` (o equivalente), **Then** obtengo un repo nuevo con sólo esos archivos y la historia filtrada de los archivos tocados.
2. **Given** el repo extraído, **When** abro `README.md`, **Then** las rutas relativas (`./Effects.js`, `./Utils.js`) son correctas y no quedan imports a `../../` propios de `kndl000`.
3. **Given** el repo limpio, **When** corro `git tag v0.1.0 && git push --tags`, **Then** el tag aparece en GitHub y puede consumirse vía `git+https://github.com/hugomoraga/umbral-vision.git#v0.1.0`.

---

### User Story 2 - Paquete npm `@hugomoraga/umbral-vision` (Priority: P1) 🎯 MVP

[Como desarrollador que quiere usar Umbral Vision en su propio proyecto, quiero instalarlo con `npm install @hugomoraga/umbral-vision` y consumirlo como módulo ES6, sin clonar ni copiar archivos.]

**Why this priority**: Sin publicación en npm no es realmente "instalable"; el submodule sólo cubre el caso `kndl000`. Esta US hace al framework reutilizable.

**Independent Test**: En un directorio vacío: `npm init -y && npm install @hugomoraga/umbral-vision`, abrir `node_modules/@hugomoraga/umbral-vision/dist/index.mjs`, ejecutar `import('./node_modules/@hugomoraga/umbral-vision/dist/index.mjs')` y verificar que `startVisualizer('tunnel')` está exportado.

**Acceptance Scenarios**:

1. **Given** un repo local con código de Umbral Vision, **When** corro `npm login` y `npm publish --access public`, **Then** el paquete aparece en `https://www.npmjs.com/package/@hugomoraga/umbral-vision` y es instalable.
2. **Given** `package.json` con `"name": "@hugomoraga/umbral-vision"`, **When** inspecciono los campos `main`, `module`, `exports`, **Then** apuntan a los bundles ESM/CJS y al README/CHANGELOG correctamente.
3. **Given** un consumidor con Node 20+ o browser moderno, **When** importa `import { startVisualizer } from '@hugomoraga/umbral-vision'`, **Then** la función está disponible y firma coincide con la documentación actual.
4. **Given** un consumidor que aún usa CommonJS, **When** hace `const { startVisualizer } = require('@hugomoraga/umbral-vision')`, **Then** recibe el mismo set de exports (vía `dist/index.cjs`).
5. **Given** un consumidor que quiere los archivos fuente sin transpilar, **When** importa desde `@hugomoraga/umbral-vision/src/...`, **Then** recibe ESM moderno (campo `exports` con subpath).

---

### User Story 3 - kndl000 consume el paquete (Priority: P1) 🎯 MVP

[Como mantenedor del blog, quiero que `kndl000` consuma Umbral Vision desde el submódulo git + npm, de modo que las versiones queden pinned y el sitio use exactamente la versión publicada.]

**Why this priority**: Sin esto, los US anteriores son trabajo en el vacío. Esta US cierra el ciclo: el blog se beneficia del nuevo packaging.

**Independent Test**: `kndl000/package.json` lista `@hugomoraga/umbral-vision: ^0.1.0` en dependencies; `kndl000/assets/js/umbral-vision/` ya no existe como archivos tracked; existe `.gitmodules` con `path = assets/js/umbral-vision` apuntando a `hugomoraga/umbral-vision`; `bundle exec jekyll build` produce un sitio cuyo `/visual/generator/` sigue funcionando idéntico.

**Acceptance Scenarios**:

1. **Given** el repo `hugomoraga/umbral-vision` con tag `v0.1.0`, **When** desde `kndl000` ejecuto `git submodule add https://github.com/hugomoraga/umbral-vision assets/js/umbral-vision && cd assets/js/umbral-vision && git checkout v0.1.0`, **Then** el submodule queda pinned a ese tag.
2. **Given** el submodule añadido, **When** corro `npm install` en `kndl000`, **Then** `@hugomoraga/umbral-vision` queda instalado bajo `node_modules/` y un `npm run update:umbral` (script npm) sincroniza ambos.
3. **Given** el sitio construido, **When** abro `https://kundala000.com/visual/generator/`, **Then** los visuales se renderizan igual que antes (sin regresión visual/funcional).
4. **Given** un cambio nuevo en Umbral Vision (`v0.2.0`), **When** actualizo el submodule y bumpeo la dep en `package.json`, **Then** un push a `main` redespliega con la nueva versión tras `npm ci` + `bundle exec jekyll build`.

---

### User Story 4 - Build reproducible y CI por repo (Priority: P2)

[Como mantenedor, quiero que cada repo tenga CI que verifique build + lint + smoke test del paquete, para no publicar versiones rotas.]

**Why this priority**: Útil pero no bloqueante. Se puede publicar v0.1.0 manualmente si el CI se agrega después. Por eso P2.

**Independent Test**: Push a `main` de `hugomoraga/umbral-vision` dispara workflow GitHub Actions que corre `npm ci`, `npm run lint`, `npm test` (smoke) y `npm pack` (sin publish). Status check verde.

**Acceptance Scenarios**:

1. **Given** `.github/workflows/ci.yml` en `hugomoraga/umbral-vision`, **When** ocurre un push/PR, **Then** el workflow corre en Node 18, 20 y 22 (matriz).
2. **Given** un smoke test mínimo, **When** corre `npm test`, **Then** importa el bundle en jsdom, verifica que los exports existen y que `Effects.tunnel(sketchStub).draw` no lanza.
3. **Given** el workflow, **When** se pushea un tag `v*`, **Then** un job de release (manual o via `npm publish --provenance`) publica a npm con provenance.

---

### Edge Cases

- ¿Qué pasa si `git filter-repo` reescribe SHA y rompe referencias en issues/PRs previos de kndl000? → Documentar en CHANGELOG del nuevo repo, no reescribir historia de `kndl000`.
- ¿Qué pasa si p5.js no está como peerDependency y el consumidor no la carga? → Declarar `p5` como `peerDependencies` con `^1.0.0 || ^2.0.0` y documentar en README que el consumidor debe incluir `<script src="...p5.min.js">` antes del módulo.
- ¿Submodule + npm duplica archivos en disco? → Sí, pero es esperado: submodule para tracking git pinned + dev local; `node_modules/` para builds de CI donde puede venir de registry. Documentar la coexistencia.
- ¿Cómo se manejan dependencias de desarrollo (lint, vitest, esbuild)? → Solo en `devDependencies` del repo `hugomoraga/umbral-vision`. El paquete publicado no las arrastra.
- ¿Cómo pinneo el commit en el submodule sin que CI lo desfase? → `git submodule update --init --recursive` en el workflow de `kndl000` antes de `npm ci`.
- ¿Qué pasa con el `app.js` actual que importa `./index.js` (ruta relativa)? → En el repo nuevo se mantiene; en `kndl000` se reemplaza por imports desde `@hugomoraga/umbral-vision` o desde la ruta del submodule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Un nuevo repositorio público `github.com/hugomoraga/umbral-vision` MUST contener el código actual de `assets/js/umbral-vision/` con historia git coherente.
- **FR-002**: El repo nuevo MUST incluir `package.json` con `name: "@hugomoraga/umbral-vision"`, `type: "module"`, `main`, `module`, `exports`, `files`, `peerDependencies` (p5), `keywords`, `license`, `repository`, `bugs`, `homepage`.
- **FR-003**: El paquete npm MUST publicarse en el registry público con `--access public` y `provenance: true`.
- **FR-004**: El campo `exports` MUST exponer al menos: `.` (root), `./effects` (Effects), `./visualizer`, `./audio`, `./transition`, `./utils`, y subpath `./src/*` para source.
- **FR-005**: El paquete MUST distribuir bundles ESM (`dist/index.mjs`) y CJS (`dist/index.cjs`) generados por un bundler (esbuild/rollup), preservando los source maps.
- **FR-006**: `kndl000` MUST eliminar `assets/js/umbral-vision/` como archivos tracked y reemplazarlo por un git submodule pinned a un tag semver de `hugomoraga/umbral-vision`.
- **FR-007**: `kndl000/package.json` MUST listar `@hugomoraga/umbral-vision` en `dependencies` (rango compatible con el tag del submodule).
- **FR-008**: El sitio Jekyll MUST construirse sin errores tras el cambio y `/visual/generator/` MUST funcionar idéntico (sin regresión).
- **FR-009**: El repo `hugomoraga/umbral-vision` MUST incluir `.github/workflows/ci.yml` con matriz Node, `npm run lint`, smoke test, y `npm pack` de verificación.
- **FR-010**: El README MUST documentar instalación (`npm i`), uso básico, API, peer dependency de p5, y un ejemplo mínimo runnable.
- **FR-011**: El CHANGELOG MUST seguir Keep a Changelog con sección inicial `0.1.0` describiendo el split desde `kndl000/assets/js/umbral-vision`.
- **FR-012**: El versionado MUST seguir SemVer: 0.x mientras la API no esté congelada; 1.0.0 cuando se publique la primera API estable post-improvements (US de 011/012/013).

### Key Entities *(include if feature involves data)*

- **Repositorio `hugomoraga/umbral-vision`**: entidad nueva, dueña del código del framework. Atributos: tags semver, releases GitHub, npm package.
- **Paquete `@hugomoraga/umbral-vision`**: artefacto npm publicable. Atributos: `name`, `version`, `main`, `module`, `exports`, `peerDependencies`, `files`, `provenance`.
- **Submodule en `kndl000`**: puntero git a commit/tag específico del repo nuevo, anclado en `assets/js/umbral-vision/`.
- **Dependencia npm en `kndl000/package.json`**: rango semver sincronizado con el tag del submodule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El paquete `@hugomoraga/umbral-vision` es instalable desde registry público (`npm view @hugomoraga/umbral-vision` retorna metadata válida).
- **SC-002**: `git ls-tree HEAD assets/js/umbral-vision` en `kndl000` retorna `commit <sha> ... umbral-vision` (formato gitlink de submodule, no archivos tracked).
- **SC-003**: `bundle exec jekyll build` en `kndl000` termina con código 0 y el sitio generado mantiene el hash/estructura del generador visual.
- **SC-004**: Smoke test (`npm test` en el repo nuevo) ejecuta en <5s y verifica ≥10 exports nombrados.
- **SC-005**: `kndl000/node_modules/@hugomoraga/umbral-vision/package.json` tiene `version` idéntica al tag del submodule.
- **SC-006**: CI workflow del repo nuevo tiene badge verde en `main` tras el primer push post-setup.

## Assumptions

- El usuario `hugomoraga` ya tiene cuenta en npmjs.com con 2FA y un token `NPM_TOKEN` agregado como secret en el repo nuevo.
- El usuario tiene GitHub CLI (`gh`) autenticado para crear el repo `hugomoraga/umbral-vision` con `gh repo create`.
- `git filter-repo` (o `git subtree split`) está disponible; alternativa documentada: copia limpia + cherry-pick manual.
- p5.js v1.x y v2.x son compatibles a nivel API para los efectos actuales (sólo cambia `WEBGL`/`createCanvas`); se admite `^1.0.0 || ^2.0.0`.
- El workflow de Jekyll existente en `kndl000` sigue funcionando si se le agrega un paso `git submodule update --init --recursive` antes de `npm ci`.
- El sitio `https://kundala000.com` sigue operativo durante el cutover (deploy atómico, sin ventana de downtime).
- El historial filtrado de los 7 archivos mantiene la atribución de autoría correcta (git filter-repo preserva autores originales).