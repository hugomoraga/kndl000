import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { loadRegistry } from "../lib/registry.mjs";
import { buildIndex, loadSources } from "../lib/indexer.mjs";
import { runAudit } from "../lib/audit.mjs";

const configPath = fileURLToPath(new URL("../rizoma.config.mjs", import.meta.url));

function write(root, path, content) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture({ nodos = ["Memoria"], corpus = "/poemas/uno/", relacionadas = "" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "taller-audit-"));
  write(
    root,
    "content/collections/_exploraciones/a.md",
    `---
layout: exploracion
title: "A"
question: "¿A?"
summary: "Resumen"
status: abierta
date: 2026-11-14
nodos:
${nodos.map((nodo) => `  - ${nodo}`).join("\n")}
corpus:
  - url: ${corpus}
    note: "Una obra"
${relacionadas ? `relacionadas:\n  - ${relacionadas}\n` : ""}anexos:
  - url: /rizoma/a/anexos/x/
hitos:
  - date: 2026-11-14
    title: "Inicio"
    text: "Empieza."
---
## 1. La pregunta {#la-pregunta}

Texto con memoria.
`
  );
  write(
    root,
    "content/collections/_exploraciones/b.md",
    `---
layout: exploracion
title: "B"
question: "¿B?"
summary: "Resumen"
status: abierta
date: 2026-11-14
nodos:
  - Memoria
---
## 1. La pregunta {#la-pregunta}

Texto.
`
  );
  write(
    root,
    "content/collections/_poems/uno.md",
    "---\nlayout: poems\ntitle: Uno\n---\n\nMemoria y archivo.\n"
  );
  write(
    root,
    "content/collections/_nodos/memoria.md",
    "---\ntitle: Memoria\norder: \"01\"\ndefinition: \"Una tecnología\"\n---\n"
  );
  write(
    root,
    "rizoma/a/anexos/x.md",
    `---
layout: anexo
title: "Anexo X"
order: "01"
tipo: concepto
date: 2026-11-14
estado: provisional
exploracion: /rizoma/a/
permalink: /rizoma/a/anexos/x/
---
## Qué concepto

Texto.
`
  );
  write(root, "rizoma/a/anexos/index.md", "---\nlayout: anexos\ntitle: Anexos\nexploracion: /rizoma/a/\npermalink: /rizoma/a/anexos/\n---\n");
  return root;
}

async function context(root) {
  const registry = await loadRegistry(configPath);
  return {
    root,
    registry,
    index: buildIndex(root, registry),
    sources: loadSources(root)
  };
}

test("auditoría válida de una exploración", async () => {
  const root = fixture({ relacionadas: "/rizoma/b/" });
  try {
    const ctx = await context(root);
    const audit = runAudit(ctx, ["content/collections/_exploraciones/a.md"]);
    assert.equal(audit.validations[0].ok, true, audit.validations[0].detail.join("\n"));
    assert.deepEqual(audit.validations[0].detail, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("auditoría detecta nodo inexistente y corpus roto", async () => {
  const root = fixture({ nodos: ["Memoria", "Falta"], corpus: "/poemas/no-existe/" });
  try {
    const ctx = await context(root);
    const audit = runAudit(ctx, ["content/collections/_exploraciones/a.md"]);
    const validation = audit.validations[0];
    assert.equal(validation.ok, false);
    assert.ok(validation.detail.some((item) => item.includes("Falta")));
    assert.ok(validation.detail.some((item) => item.includes("/poemas/no-existe/")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("auditoría detecta permalink duplicado de anexos", async () => {
  const root = fixture();
  try {
    write(
      root,
      "rizoma/a/anexos/y.md",
      `---
layout: anexo
title: "Anexo Y"
order: "02"
tipo: concepto
date: 2026-11-14
estado: provisional
exploracion: /rizoma/a/
permalink: /rizoma/a/anexos/x/
---
## Qué concepto

Texto.
`
    );
    const ctx = await context(root);
    const audit = runAudit(ctx, ["rizoma/a/anexos/y.md"]);
    assert.equal(audit.validations[0].ok, false);
    assert.ok(audit.validations[0].detail.some((item) => item.includes("permalink duplicado")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("auditoría de nota detecta adjunto faltante y nodo con menos de dos cuerpos", async () => {
  const root = fixture();
  try {
    write(
      root,
      "docs/rizoma/nota.md",
      `---
title: "Nota"
date: 2026-11-14
estado: banco
adjuntos:
  - archivo: docs/rizoma/adjuntos/nota/falta.pdf
    titulo: "Falta"
---
Cuerpo.
`
    );
    write(
      root,
      "content/collections/_nodos/solo.md",
      "---\ntitle: Solo\norder: \"02\"\ndefinition: \"Una vez\"\n---\n"
    );
    const ctx = await context(root);
    const noteAudit = runAudit(ctx, ["docs/rizoma/nota.md"]);
    assert.equal(noteAudit.validations[0].ok, false);
    assert.ok(noteAudit.validations[0].detail.some((item) => item.includes("Falta el archivo adjunto")));

    const nodeAudit = runAudit(ctx, ["content/collections/_nodos/solo.md"]);
    assert.equal(nodeAudit.validations[0].ok, true);
    assert.ok(nodeAudit.warnings.some((warning) => warning.includes("un nodo pide al menos dos")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
