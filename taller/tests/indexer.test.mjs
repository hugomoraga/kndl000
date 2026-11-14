import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { loadRegistry } from "../lib/registry.mjs";
import { buildIndex, readItem } from "../lib/indexer.mjs";

const configPath = fileURLToPath(new URL("../rizoma.config.mjs", import.meta.url));

function write(root, path, content) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "taller-index-"));
  write(
    root,
    "docs/rizoma/nota.md",
    `---
title: "Nota de trabajo"
date: 2026-11-14
estado: banco
vinculos:
  - destino: /rizoma/a/
    motivo: "Conecta con la deriva"
    fecha: 2026-11-14
---
Cuerpo de la nota.
`
  );
  write(
    root,
    "docs/rizoma/rota.md",
    `---
title: "Nota con vínculo roto"
date: 2026-11-14
vinculos:
  - destino: /rizoma/no-existe/
    motivo: "Todavía no existe"
    fecha: 2026-11-14
---
Cuerpo.
`
  );
  write(root, "docs/rizoma/sin-fecha.md", "---\ntitle: \"Sin fecha\"\n---\n\nCuerpo.\n");
  write(
    root,
    "docs/rizoma/banco/2026-11-14-prueba.md",
    "---\ntitle: \"Prueba\"\ndate: 2026-11-14\nestado: banco\n---\n\nCuerpo.\n"
  );
  write(
    root,
    "docs/rizoma/ciclos/2026-11-14-a.md",
    "---\ntitle: \"Ciclo\"\ndate: 2026-11-14\nexploracion: /rizoma/a/\n---\n\nCuerpo.\n"
  );
  write(
    root,
    "docs/rizoma/adr/ADR-0001.md",
    "---\ntitle: \"ADR\"\ndate: 2026-11-14\nestado: aceptada\n---\n\nCuerpo.\n"
  );
  write(
    root,
    "docs/rizoma/protocolo-cartografia.md",
    "---\ntitle: \"Protocolo\"\ndate: 2026-11-14\nestado: vigente\n---\n\nCuerpo.\n"
  );
  write(
    root,
    "content/collections/_exploraciones/a.md",
    `---
layout: exploracion
title: "A"
question: "¿Pregunta?"
summary: "Resumen"
status: abierta
date: 2026-11-14
nodos: [Memoria]
---
## 1. La pregunta {#la-pregunta}

Texto.
`
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
  write(
    root,
    "rizoma/a/anexos/index.md",
    "---\nlayout: anexos\ntitle: Anexos\nexploracion: /rizoma/a/\npermalink: /rizoma/a/anexos/\n---\n"
  );
  return root;
}

test("indexa notas, exploraciones, nodos, anexos y documentos read-only", async () => {
  const registry = await loadRegistry(configPath);
  const root = fixture();
  try {
    const index = buildIndex(root, registry);
    assert.equal(index.counts.byType.exploracion, 1);
    assert.equal(index.counts.byType.nodo, 1);
    assert.equal(index.counts.byType.anexo, 1, "index.md de anexos no se indexa");
    assert.equal(index.counts.byType.adr, 1);
    assert.equal(index.counts.byType.documento, 1);
    assert.equal(index.counts.byType.banco, 1);
    assert.equal(index.counts.byType.ciclo, 1);
    assert.equal(index.counts.byType.nota, 3);

    const exploration = index.entries.find((entry) => entry.type === "exploracion");
    assert.equal(exploration.url, "/rizoma/a/");
    assert.equal(exploration.public, true);
    const annex = index.entries.find((entry) => entry.type === "anexo");
    assert.equal(annex.url, "/rizoma/a/anexos/x/");
    const adr = index.entries.find((entry) => entry.type === "adr");
    assert.equal(adr.readOnly, true);
    const protocol = index.entries.find((entry) => entry.path === "docs/rizoma/protocolo-cartografia.md");
    assert.equal(protocol.readOnly, true);

    const missingDate = index.entries.find((entry) => entry.path === "docs/rizoma/sin-fecha.md");
    assert.ok(missingDate.warnings.some((warning) => warning.id === "campo-obligatorio"));

    const broken = index.entries.find((entry) => entry.path === "docs/rizoma/rota.md");
    assert.ok(broken.warnings.some((warning) => warning.id === "vinculo-roto"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readItem calcula backlinks escaneando notas", async () => {
  const registry = await loadRegistry(configPath);
  const root = fixture();
  try {
    const index = buildIndex(root, registry);
    const item = readItem(root, index, "content/collections/_exploraciones/a.md");
    assert.ok(item);
    assert.equal(item.backlinks.length, 1);
    assert.equal(item.backlinks[0].path, "docs/rizoma/nota.md");
    assert.equal(item.backlinks[0].motivo, "Conecta con la deriva");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
