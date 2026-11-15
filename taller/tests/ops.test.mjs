import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { loadRegistry } from "../lib/registry.mjs";
import { buildIndex, loadSources } from "../lib/indexer.mjs";
import { applyPlan } from "../lib/plan.mjs";
import { parseFrontmatter } from "../lib/frontmatter.mjs";

const configPath = fileURLToPath(new URL("../rizoma.config.mjs", import.meta.url));

function write(root, path, content) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "taller-ops-"));
  write(
    root,
    "content/collections/_exploraciones/a.md",
    `---
layout: exploracion
title: "A"
question: "¿Qué se conserva?"
summary: "Una deriva"
status: abierta
date: 2026-11-14
nodos: [Archivo]
---
## 1. La pregunta {#la-pregunta}

Texto.
`
  );
  write(
    root,
    "content/collections/_poems/uno.md",
    "---\nlayout: poems\ntitle: Uno\n---\n\nEl archivo guarda.\n"
  );
  write(
    root,
    "content/collections/_poems/dos.md",
    "---\nlayout: poems\ntitle: Dos\n---\n\nArchivo y olvido.\n"
  );
  write(root, "docs/rizoma/nota.md", "---\ntitle: \"Nota\"\ndate: 2026-11-14\nestado: banco\n---\n\nCuerpo.\n");
  write(
    root,
    "docs/rizoma/otra.md",
    "---\ntitle: \"Otra\"\ndate: 2026-11-14\nestado: banco\nvinculos:\n  - destino: docs/rizoma/nota.md\n    motivo: \"depende\"\n    fecha: 2026-11-14\n---\n\nCuerpo.\n"
  );
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

function operation(registry, id) {
  return registry.operations.find((candidate) => candidate.id === id);
}

test("nueva nota crea solo el archivo de banco", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const plan = await operation(ctx.registry, "nueva-nota").plan(ctx, {
      title: "Mi nota",
      pregunta: "¿Pregunta?",
      date: "2026-11-14"
    });
    assert.equal(plan.validations.some((item) => !item.ok), false);
    assert.deepEqual(plan.paths ?? plan.changes.map((change) => change.path), [
      "docs/rizoma/banco/2026-11-14-mi-nota.md"
    ]);
    const result = await applyPlan(root, plan);
    assert.deepEqual(result.paths, ["docs/rizoma/banco/2026-11-14-mi-nota.md"]);
    assert.equal(existsSync(join(root, "docs/rizoma/banco/2026-11-14-mi-nota.md")), true);
    assert.equal(existsSync(join(root, "content/collections/_exploraciones/mi-nota.md")), false);
    const parsed = parseFrontmatter(
      readFileSync(join(root, "docs/rizoma/banco/2026-11-14-mi-nota.md"), "utf8")
    );
    assert.equal(parsed.meta.estado, "banco");
    assert.equal(parsed.meta.pregunta, "¿Pregunta?");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("guardar nota rechaza hash obsoleto y guarda si coincide", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const entry = ctx.index.entries.find((item) => item.path === "docs/rizoma/nota.md");
    const save = operation(ctx.registry, "guardar-nota");
    const stale = await save.plan(ctx, {
      path: entry.path,
      hash: "hash-viejo",
      body: "Otro cuerpo.\n",
      updates: { estado: "publicada" }
    });
    assert.ok(stale.validations.some((item) => item.id === "conflicto"));
    const fresh = await save.plan(ctx, {
      path: entry.path,
      hash: entry.hash,
      body: "Otro cuerpo.\n",
      updates: { estado: "publicada", campoNuevo: "se conserva" }
    });
    assert.equal(fresh.validations.some((item) => !item.ok), false);
    const result = await applyPlan(root, fresh);
    assert.deepEqual(result.paths, ["docs/rizoma/nota.md"]);
    const parsed = parseFrontmatter(readFileSync(join(root, "docs/rizoma/nota.md"), "utf8"));
    assert.equal(parsed.meta.estado, "publicada");
    assert.equal(parsed.meta.campoNuevo, "se conserva");
    assert.equal(parsed.body, "Otro cuerpo.\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publicar nodo exige dos cuerpos distintos", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const publish = operation(ctx.registry, "publicar-nodo");
    const okPlan = await publish.plan(ctx, {
      word: "archivo",
      definition: "Una tecnología de la memoria.",
      order: "01"
    });
    assert.equal(okPlan.validations.find((item) => item.id === "word-count").ok, true);
    assert.equal(okPlan.validations.find((item) => item.id === "word-count").detail.length, 2);
    await applyPlan(root, okPlan);
    assert.equal(existsSync(join(root, "content/collections/_nodos/archivo.md")), true);

    const freshCtx = await context(root);
    const failPlan = await operation(freshCtx.registry, "publicar-nodo").plan(freshCtx, {
      word: "olvido",
      definition: "Lo que no se guarda.",
      order: "02"
    });
    const check = failPlan.validations.find((item) => item.id === "word-count");
    assert.equal(check.ok, false);
    assert.equal(check.overridable, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publicar anexo actualiza exploración e índice; corrección exige fuentes", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const publish = operation(ctx.registry, "publicar-anexo");
    const missingSources = await publish.plan(ctx, {
      exploracion: "a",
      title: "Corrección",
      slug: "correccion",
      tipo: "correccion",
      estado: "corregido",
      order: "01",
      permalink: "/rizoma/a/anexos/correccion/",
      fuentes: ""
    });
    assert.ok(missingSources.validations.some((item) => item.id === "fuentes" && !item.ok));

    const plan = await publish.plan(ctx, {
      exploracion: "a",
      title: "Concepto",
      slug: "concepto",
      tipo: "concepto",
      estado: "provisional",
      order: "01",
      permalink: "/rizoma/a/anexos/concepto/",
      nota: "Una idea",
      fuentes: ""
    });
    assert.equal(plan.validations.some((item) => !item.ok), false);
    assert.ok(plan.changes.some((change) => change.path === "rizoma/a/anexos/concepto.md"));
    assert.ok(plan.changes.some((change) => change.path === "rizoma/a/anexos/index.md"));
    assert.ok(plan.changes.some((change) => change.path === "content/collections/_exploraciones/a.md"));
    await applyPlan(root, plan);

    const exploration = parseFrontmatter(
      readFileSync(join(root, "content/collections/_exploraciones/a.md"), "utf8")
    );
    assert.equal(exploration.meta.anexos[0].url, "/rizoma/a/anexos/concepto/");
    assert.equal(existsSync(join(root, "rizoma/a/anexos/concepto.md")), true);
    assert.equal(existsSync(join(root, "rizoma/a/anexos/index.md")), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("borrar nota pide confirmación, muestra backlinks y no edita el origen", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const remove = operation(ctx.registry, "borrar-nota");
    const missingConfirm = await remove.plan(ctx, { path: "docs/rizoma/nota.md", confirm: false });
    assert.ok(missingConfirm.validations.some((item) => item.id === "confirm" && !item.ok));
    assert.equal(missingConfirm.changes.length, 0);

    const plan = await remove.plan(ctx, { path: "docs/rizoma/nota.md", confirm: true });
    assert.equal(plan.validations.some((item) => !item.ok), false);
    assert.ok(plan.warnings.some((warning) => warning.includes("docs/rizoma/otra.md")));
    assert.deepEqual(plan.meta.backlinks, ["docs/rizoma/otra.md"]);
    assert.equal(plan.meta.tracked, false);
    await applyPlan(root, plan);
    assert.equal(existsSync(join(root, "docs/rizoma/nota.md")), false);
    assert.equal(existsSync(join(root, "docs/rizoma/otra.md")), true);
    const source = parseFrontmatter(readFileSync(join(root, "docs/rizoma/otra.md"), "utf8"));
    assert.equal(source.meta.vinculos[0].destino, "docs/rizoma/nota.md");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("editar corpus agrega, edita y quita piezas con su sección", async () => {
  const root = fixture();
  try {
    const add = operation((await context(root)).registry, "editar-corpus");
    let ctx = await context(root);
    const addPlan = await add.plan(ctx, {
      path: "content/collections/_exploraciones/a.md",
      action: "add",
      index: -1,
      url: "/poemas/uno/",
      note: "Una pieza",
      seccion: "inicio"
    });
    assert.equal(addPlan.validations.some((item) => !item.ok), false);
    await applyPlan(root, addPlan);
    let parsed = parseFrontmatter(
      readFileSync(join(root, "content/collections/_exploraciones/a.md"), "utf8")
    );
    assert.equal(parsed.meta.corpus[0].url, "/poemas/uno/");
    assert.equal(parsed.meta.corpus_secciones[0].seccion, "inicio");
    assert.deepEqual(parsed.meta.corpus_secciones[0].piezas, ["/poemas/uno/"]);

    ctx = await context(root);
    const editPlan = await add.plan(ctx, {
      path: "content/collections/_exploraciones/a.md",
      action: "edit",
      index: 0,
      url: "/poemas/dos/",
      note: "Otra pieza",
      seccion: "inicio"
    });
    assert.equal(editPlan.validations.some((item) => !item.ok), false);
    await applyPlan(root, editPlan);
    parsed = parseFrontmatter(
      readFileSync(join(root, "content/collections/_exploraciones/a.md"), "utf8")
    );
    assert.equal(parsed.meta.corpus[0].url, "/poemas/dos/");
    assert.equal(parsed.meta.corpus[0].note, "Otra pieza");
    assert.deepEqual(parsed.meta.corpus_secciones[0].piezas, ["/poemas/dos/"]);

    ctx = await context(root);
    const removePlan = await add.plan(ctx, {
      path: "content/collections/_exploraciones/a.md",
      action: "remove",
      index: 0,
      url: "/poemas/dos/"
    });
    assert.equal(removePlan.validations.some((item) => !item.ok), false);
    await applyPlan(root, removePlan);
    parsed = parseFrontmatter(
      readFileSync(join(root, "content/collections/_exploraciones/a.md"), "utf8")
    );
    assert.deepEqual(parsed.meta.corpus, []);
    assert.deepEqual(parsed.meta.corpus_secciones[0].piezas, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("editar corpus rechaza duplicados", async () => {
  const root = fixture();
  try {
    let ctx = await context(root);
    const op = operation(ctx.registry, "editar-corpus");
    await applyPlan(
      root,
      await op.plan(ctx, {
        path: "content/collections/_exploraciones/a.md",
        action: "add",
        index: -1,
        url: "/poemas/uno/",
        note: "Una"
      })
    );
    ctx = await context(root);
    const duplicate = await op.plan(ctx, {
      path: "content/collections/_exploraciones/a.md",
      action: "add",
      index: -1,
      url: "/poemas/uno",
      note: "Duplicada"
    });
    assert.ok(duplicate.validations.some((item) => item.id === "duplicado" && !item.ok));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publicar hito agrega al frontmatter sin tocar el cuerpo", async () => {
  const root = fixture();
  try {
    const ctx = await context(root);
    const plan = await operation(ctx.registry, "publicar-hito").plan(ctx, {
      exploracion: "/rizoma/a/",
      date: "2026-11-14",
      title: "La pregunta cambia",
      text: "Se ajusta la lectura."
    });
    assert.equal(plan.validations.some((item) => !item.ok), false);
    await applyPlan(root, plan);
    const parsed = parseFrontmatter(
      readFileSync(join(root, "content/collections/_exploraciones/a.md"), "utf8")
    );
    assert.equal(parsed.meta.hitos[0].title, "La pregunta cambia");
    assert.equal(parsed.body, "## 1. La pregunta {#la-pregunta}\n\nTexto.\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
