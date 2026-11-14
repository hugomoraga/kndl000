# Taller de Rizoma

Backoffice local-first para el banco de Rizoma. Lee y escribe los mismos archivos
que Jekyll: notas en `docs/rizoma/`, exploraciones y nodos en
`content/collections/`, anexos en `rizoma/`. No hay base de datos, backend
remoto ni estado fuera de git. La decisión está en
[`ADR-0006`](../docs/rizoma/adr/ADR-0006-taller-de-rizoma.md) y el alcance en
[`specs/014-taller-rizoma/spec.md`](../specs/014-taller-rizoma/spec.md).

## Comandos

```bash
npm run taller          # servidor en http://127.0.0.1:4173
npm run test:taller     # tests puros con node --test
TALLER_PORT=4174 npm run taller
```

- El servidor solo escucha en `127.0.0.1`.
- Requiere Node 20+, git, Ruby/Bundler/Jekyll y Python 3 + PyYAML para los
  chequeos de commit. Si falta una herramienta, la operación afectada falla con
  un mensaje accionable; el banco sigue usable.
- `taller/` está excluido de Jekyll en `_config.yml`; no debe existir
  `_site/taller`.

## Qué hace v1

- **Banco**: indexa notas (`docs/rizoma/*.md`, `ciclos/`, `banco/`),
  exploraciones, nodos y anexos; los ADR, el protocolo, la taxonomía y el punto
  de entrada se listan read-only.
- **Edición con diff**: guardado explícito, sin autosave. El frontmatter conserva
  claves desconocidas, orden y comentarios; el cuerpo no editado queda
  byte-idéntico. Cada lectura devuelve un hash y una escritura con hash viejo
  termina en conflicto.
- **Adjuntos**: se guardan en `docs/rizoma/adjuntos/<slug>/` con límite de
  25 MB, nombre sanitizado y deduplicado. Se sirven read-only; nunca se copian a
  `assets/` ni a `_site`.
- **Vínculos**: lista `{destino, motivo, fecha}` en el frontmatter de la nota.
  Los backlinks se calculan al leer; no existe archivo central ni grafo.
- **Publicación**: promueve a exploración, nodo, anexo o hito con las reglas del
  protocolo como validaciones. Un override pide motivo y queda en el mensaje de
  commit.
- **Commit**: corre `bundle exec jekyll build`, `node scripts/check-links.mjs` y
  `build-lamina.py --verify --plate 01|02`, y commitea solo los paths del plan.
  El push es una acción aparte y explícita; no hay force push.
- **Descartar**: `git restore --source=HEAD --staged --worktree` sobre un path;
  si el archivo es nuevo (untracked), lo elimina.
- **Borrar nota**: solo notas de banco, con confirmación explícita. Muestra los
  backlinks y no edita automáticamente las notas que la referencian.

Fuera de v1: IA, deploy, base de datos, autenticación multiusuario, grafo,
kanban, dashboard, métricas, renombrar/mover archivos y promoción automática de
adjuntos a assets públicos.

## Arquitectura

```text
taller/
  server.mjs              # HTTP + API + static UI; built-ins de Node
  rizoma.config.mjs       # registro de tipos y operaciones
  lib/
    frontmatter.mjs       # parser/escritor YAML con comentarios y orden
    paths.mjs             # resolución segura, hashes, slugs, nombres
    git.mjs               # git sin shell, estado, diff, restore, commit, push
    plan.mjs              # plan de cambios, diff con git, apply atómico
    indexer.mjs           # banco, URLs, warnings, backlinks, fuentes
    links.mjs             # vínculos, backlinks, URLs del sitio
    validations.mjs       # reglas del protocolo
    checks.mjs            # build, links y láminas
    registry.mjs          # carga y valida el registro
  ops/                    # una operación por archivo
  ui/                     # HTML/CSS/JS sin framework ni build
  tests/                  # node --test
  vendor-yaml/            # parser YAML vendorizado (yaml 2.9.1, ISC)
```

- La UI habla con la API por `fetch`; no hay scripts de terceros.
- El servidor responde con CSP `default-src 'self'`, valida `Host` y `Origin`
  de loopback y rechaza requests cross-site.
- Los paths se resuelven contra la raíz del repo; se rechazan `..`, rutas
  absolutas y symlinks que escapan.
- Los errores se devuelven como JSON legible. El servidor loguea operación y
  paths, nunca contenido de notas ni claves.
- El parser YAML está vendorizado en `taller/vendor-yaml/` para que el taller no
  dependa de un `npm install` (el proyecto tiene una dependencia histórica no
  publicada). Versión 2.9.1, licencia ISC; ver `vendor-yaml/LICENSE`.

## Contrato de extensión

Todo tipo y operación vive en `rizoma.config.mjs`. El router HTTP y el núcleo de
la UI no saben qué tipos existen.

### Tipo

```js
{
  id: "corte",
  label: "Corte",
  globs: ["docs/rizoma/cortes/*.md"],
  exclude: [],                    // globs opcionales
  public: false,
  readOnly: false,
  urlPattern: null,               // ej. "/rizoma/:slug/"
  required: ["title", "date"],
  fields: [                       // campos del editor y formularios
    { name: "title", label: "Título", type: "text", required: true },
    { name: "date", label: "Fecha", type: "text" }
  ],
  validate(entry, { root }) {     // opcional; devuelve warnings
    return [];
  }
}
```

Agregar un tipo con `globs`, `fields` y `validate` lo hace aparecer en la UI
después de reiniciar. No se edita el router ni `ui/app.js`.

### Operación

```js
{
  id: "mover",                    // único
  label: "Mover pieza",
  description: "Mueve una pieza con plan y diff.",
  palette: true,                  // aparece en la paleta
  fields: [/* igual que un tipo */],
  async plan(ctx, input) {
    // ctx: { root, registry, index, sources }
    return {
      operation: "mover",
      summary: "…",
      changes: [/* write / delete / exec / frontmatter / append / restore */],
      preview: [/* cambios write/delete para mostrar el diff */],
      validations: [/* { id, ok, message, overridable } */],
      warnings: [],
      message: "taller: mover …",
      origin: input.path,
      meta: {}
    };
  },
  async apply(ctx, plan, input, { overrideReason }) {
    // opcional; si falta, se usa el motor de planes
  }
}
```

- `plan()` no escribe. Construye paths, contenido, validaciones y diff.
- `changes` se aplica en orden; `exec` corre un comando sin shell y `frontmatter`
  o `append` leen el archivo recién creado.
- `validations` con `overridable: false` bloquean. Las overridables exigen un
  motivo y el motivo se agrega al mensaje de commit.
- Un tipo u operación inválida se ignora al arrancar, con un warning en consola
  y en `/api/status`; el resto sigue funcionando.
- Tests: cubrir paths, frontmatter, validaciones, vínculos y planes con
  `node --test`.

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/registry` | tipos y operaciones serializables |
| GET | `/api/index` | banco, conteos y warnings |
| GET | `/api/item?path=` | pieza completa, hash, links, backlinks, adjuntos |
| GET | `/api/status` | repo, tools, warnings del registro |
| GET | `/api/preview-status` | si Jekyll responde en `localhost:4000` |
| POST | `/api/plan` | `{operation, input}` → plan + diff |
| POST | `/api/apply` | `{operation, input, fingerprint, overrideReason}` |
| POST | `/api/checks` | corre build, links y láminas |
| POST | `/api/attach/plan` | plan de adjunto (JSON) |
| POST | `/api/attach/apply?token=` | subida binaria |
| GET | `/api/attachment?path=` | adjunto read-only |

## Teclado

- `Ctrl/Cmd + K`: paleta de comandos.
- `Ctrl/Cmd + S`: guardar la pieza abierta.
- `Alt + 1/2/3`: foco en banco, editor y margen.
- `Esc`: cerrar el diálogo superior.

## Límites y decisiones

- Un solo autor y una sola máquina. No hay concurrencia real entre usuarios; dos
  pestañas con la misma nota producen conflicto por hash.
- Las notas nuevas van a `docs/rizoma/banco/`; las existentes se indexan donde
  están y no se migran.
- Los adjuntos son material de trabajo: no se publican.
- Las piezas públicas no se borran desde el taller: se editan o se descartan.
  Borrar una nota de banco deja los backlinks visibles como advertencia.
- El repo es público. El taller local no agrega privacidad, solo evita
  escrituras accidentales.
- `/admin/` sigue existiendo para las colecciones que no son de Rizoma.
- El push va a la rama actual, sin force. Commit y push se bloquean en detached
  HEAD, merge/rebase/cherry-pick/revert en curso o conflictos.
