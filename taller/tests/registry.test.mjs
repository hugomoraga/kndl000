import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { loadRegistry, serializeRegistry } from "../lib/registry.mjs";

const configPath = fileURLToPath(new URL("../rizoma.config.mjs", import.meta.url));

test("el registro real declara tipos y operaciones del taller", async () => {
  const registry = await loadRegistry(configPath);
  assert.deepEqual(registry.warnings, []);
  const types = registry.types.map((type) => type.id);
  assert.ok(types.includes("nota"));
  assert.ok(types.includes("exploracion"));
  assert.ok(types.includes("nodo"));
  assert.ok(types.includes("anexo"));
  assert.ok(types.includes("adr"));
  const operations = registry.operations.map((operation) => operation.id);
  for (const id of [
    "nueva-nota",
    "guardar-nota",
    "descartar",
    "borrar-nota",
    "publicar-exploracion",
    "publicar-nodo",
    "publicar-anexo",
    "publicar-hito",
    "vincular",
    "commit",
    "push"
  ]) {
    assert.ok(operations.includes(id), `falta ${id}`);
  }
  const serialized = serializeRegistry(registry);
  assert.equal(JSON.stringify(serialized).includes("function"), false);
  assert.ok(serialized.operations.every((operation) => operation.plan === undefined));
});

test("un tipo u operación inválida se ignora y el resto sigue", async () => {
  const root = mkdtempSync(join(tmpdir(), "taller-registry-"));
  try {
    const path = join(root, "config.mjs");
    writeFileSync(
      path,
      `export default {
        types: [
          { id: "ok", label: "OK", globs: ["docs/*.md"] },
          { id: "roto", label: "Roto" }
        ],
        operations: [
          { id: "ok-op", label: "OK", plan: async () => ({}) },
          { id: "roto-op", label: "Roto" }
        ]
      };`
    );
    const registry = await loadRegistry(path);
    assert.deepEqual(registry.types.map((type) => type.id), ["ok"]);
    assert.deepEqual(registry.operations.map((operation) => operation.id), ["ok-op"]);
    assert.equal(registry.warnings.length, 2);
    assert.match(registry.warnings[0].message, /Tipo ignorado/);
    assert.match(registry.warnings[1].message, /Operación ignorada/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
