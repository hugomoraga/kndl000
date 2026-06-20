# Data Model: Umbral Vision como submódulo y paquete npm

**Created**: 2026-06-20
**Feature**: `specs/010-umbral-vision-as-npm-package/spec.md`

## Entidades

### 1. Repositorio `hugomoraga/umbral-vision`

**Descripción**: Repo GitHub público, dueño del código del framework. Contiene la historia filtrada de los 7 archivos extraídos de `kndl000`.

**Atributos**:

| Atributo | Tipo | Valor/Formato | Restricciones |
|----------|------|---------------|---------------|
| name | string | `umbral-vision` | Único bajo `hugomoraga` |
| visibility | enum | `public` | Fijo |
| default_branch | string | `main` | Convención |
| description | string | "Framework modular para generación de visuales psicodélicos con p5.js" | <200 chars |
| topics | string[] | `["p5js", "visuals", "generative", "framework", "audio-reactive"]` | Opcional |
| has_issues | boolean | true | Default GitHub |
| has_projects | boolean | false | YAGNI |
| has_wiki | boolean | false | YAGNI (usar README) |
| secrets | string[] | `["NPM_TOKEN"]` | NPM publish automation |
| branches | string[] | `["main"]` | Por ahora |
| tags | semver[] | `["v0.1.0"]` inicial | SemVer estricto |

**Relaciones**:
- Contiene 7 archivos fuente en `src/` (migrados desde `kndl000/assets/js/umbral-vision/`).
- Contiene workflows en `.github/workflows/`.
- Es consumido por `kndl000` como submodule + npm dep.

### 2. Paquete npm `@hugomoraga/umbral-vision`

**Descripción**: Artefacto npm publicable en el registry público. Contiene código compilado (ESM+CJS), source, README, LICENSE, CHANGELOG.

**Atributos**:

| Atributo | Tipo | Valor/Formato | Restricciones |
|----------|------|---------------|---------------|
| name | string | `@hugomoraga/umbral-vision` | Scope válido |
| version | semver | `0.1.0` inicial | SemVer estricto, debe matchear tag |
| description | string | "Framework modular para generación de visuales psicodélicos con p5.js" | |
| type | enum | `module` | ESM por default |
| main | path | `./dist/index.cjs` | CJS fallback |
| module | path | `./dist/index.mjs` | ESM preferred |
| exports | object | Ver `contracts/exports.md` | Subpaths granulares |
| files | string[] | `["dist", "src", "README.md", "LICENSE", "CHANGELOG.md"]` | Whitelist |
| peerDependencies | object | `{ "p5": "^1.0.0 || ^2.0.0" }` | Sin semver estricto, ambos majors |
| keywords | string[] | `["p5js", "visuals", "generative", "psychedelic", "audio-reactive"]` | |
| license | SPDX | `MIT` | |
| repository | object | `{ type: "git", url: "git+https://github.com/hugomoraga/umbral-vision.git" }` | |
| bugs | object | `{ url: "https://github.com/hugomoraga/umbral-vision/issues" }` | |
| homepage | URL | `https://github.com/hugomoraga/umbral-vision#readme` | |
| engines | object | `{ node: ">=18" }` | |
| publishConfig | object | `{ access: "public", provenance: true }` | |

**Relaciones**:
- Publicado desde el tag del repo `hugomoraga/umbral-vision`.
- Consumido por `kndl000/package.json` y por terceros.

### 3. Git submodule en `kndl000`

**Descripción**: Puntero git a un commit/tag específico del repo nuevo, anclado en `assets/js/umbral-vision/`.

**Atributos**:

| Atributo | Tipo | Valor/Formato | Restricciones |
|----------|------|---------------|---------------|
| path | path | `assets/js/umbral-vision` | Fijo (preserva URLs internas) |
| url | URL | `https://github.com/hugomoraga/umbral-vision.git` | Repo público |
| ref | ref | `v0.1.0` (tag semver) | Inmutable |
| sha | sha | 40 chars hex | Apunta al commit del tag |
| mode | enum | `160000` (gitlink) | Distinto de archivo (100644) o dir (040000) |

**Archivos asociados**:
- `.gitmodules` en raíz de `kndl000`:
  ```ini
  [submodule "assets/js/umbral-vision"]
      path = assets/js/umbral-vision
      url = https://github.com/hugomoraga/umbral-vision.git
      branch = main
  ```

**Relaciones**:
- El path `assets/js/umbral-vision` se mantiene por compatibilidad con imports y `_layouts/generator.html`.
- La versión debe coincidir con la declarada en `package.json` de `kndl000`.

### 4. Dependencia npm en `kndl000/package.json`

**Descripción**: Entrada en `dependencies` que sincroniza la versión con el tag del submodule.

**Atributos**:

| Atributo | Tipo | Valor/Formato | Restricciones |
|----------|------|---------------|---------------|
| name | string | `@hugomoraga/umbral-vision` | Coincide con paquete |
| versionRange | semver range | `^0.1.0` | Caret permite minor/patch |
| type | enum | `dependencies` | Runtime, no devDep |

**Invariante**: `versionRange` superior debe ser ≥ versión del submodule. Si npm resuelve una versión que no coincide con el tag, falla la verificación SC-005.

## Diagrama de relaciones

```
┌─────────────────────────────────────────┐
│ github.com/hugomoraga/umbral-vision     │
│ ┌─────────────────────────────────────┐ │
│ │ src/ (7 archivos)                   │ │
│ │ dist/ (generado, no tracked)        │ │
│ │ tests/                              │ │
│ │ package.json (configura exports)    │ │
│ └─────────────────────────────────────┘ │
│ tags: v0.1.0                            │
└────────────────┬────────────────────────┘
                 │ git push
                 ▼
        npmjs.com registry
        @hugomoraga/umbral-vision@0.1.0
                 │
                 │ npm install
                 ▼
┌─────────────────────────────────────────┐
│ kndl000 (sitio Jekyll)                  │
│                                         │
│ .gitmodules ──► submodule pointer       │
│                 assets/js/umbral-vision │
│                      │                  │
│                      │ pinned a v0.1.0  │
│                      ▼                  │
│ package.json ──► @hugomoraga/...^0.1.0  │
│                      │                  │
│                      ▼                  │
│           node_modules/@hugomoraga/...  │
│                                         │
│ _layouts/generator.html                 │
│   └─► /visual/generator/ importa de:    │
│       assets/js/umbral-vision/app.js    │
└─────────────────────────────────────────┘
```

## Estados y transiciones

### Estado del paquete npm

```
draft (no publicado)
   │ npm publish
   ▼
published v0.1.0
   │ nuevo commit + tag
   ▼
published v0.2.0
   │ ...
```

### Estado del submodule en kndl000

```
no existe
   │ git submodule add + checkout v0.1.0
   ▼
pinned to v0.1.0
   │ cd assets/js/umbral-vision && git pull && git checkout v0.2.0
   │ + bump package.json a ^0.2.0
   ▼
pinned to v0.2.0
```

## Invariantes

- **I-001**: `paquete.version === tag.name` (sin excepción)
- **I-002**: `submodule.sha === tag.commit_sha` (mismo commit)
- **I-003**: `kndl000 package.json versionRange` cubre la versión del submodule
- **I-004**: El campo `exports` del paquete lista todos los entry points que `app.js` o consumidores puedan necesitar
- **I-005**: El contenido de `dist/` está sincronizado con `src/` al momento de publish (CI fuerza `npm run build` antes de `npm publish`)

## Out of scope

- Versionado nightly/canary
- Mirror del paquete en GitHub Packages (sólo registry público)
- Publicación automatizada por conventional commits (manual al tag por ahora)
- Multi-paquete (monorepo con `umbral-tone` también migrado, eso sería spec aparte)