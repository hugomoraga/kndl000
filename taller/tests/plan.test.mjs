import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { sha256 } from "../lib/paths.mjs";
import {
  PlanError,
  applyPlan,
  checkPlan,
  createPlan,
  planFingerprint,
  previewChanges,
  validation
} from "../lib/plan.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "taller-plan-"));
  writeFileSync(join(root, "nota.md"), "linea vieja\n");
  return root;
}

test("el diff sale de git diff y muestra el cambio exacto", async () => {
  const root = fixture();
  try {
    const diff = await previewChanges(root, [
      { type: "write", path: "nota.md", content: "linea nueva\n" }
    ]);
    assert.match(diff, /-linea vieja/);
    assert.match(diff, /\+linea nueva/);
    const newDiff = await previewChanges(root, [
      { type: "write", path: "nueva.md", content: "hola\n" }
    ]);
    assert.match(newDiff, /\+hola/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("checkPlan bloquea lo no overridable y exige motivo en lo overridable", () => {
  const plan = createPlan({
    operation: "test",
    validations: [
      validation("a", false, "bloquea"),
      validation("b", false, "override", { overridable: true })
    ]
  });
  assert.throws(() => checkPlan(plan, {}), /bloqueantes/);
  const overridable = createPlan({
    operation: "test",
    validations: [validation("b", false, "override", { overridable: true })]
  });
  assert.throws(() => checkPlan(overridable, {}), /motivo/);
  assert.doesNotThrow(() => checkPlan(overridable, { overrideReason: "razón" }));
});

test("applyPlan escribe solo si el plan es válido", async () => {
  const root = fixture();
  try {
    const invalid = createPlan({
      operation: "test",
      changes: [{ type: "write", path: "nota.md", content: "no\n" }],
      validations: [validation("x", false, "no")]
    });
    assert.throws(() => checkPlan(invalid, {}), PlanError);
    const result = await applyPlan(root, invalid).catch((error) => error);
    assert.ok(result instanceof PlanError);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "linea vieja\n");

    const valid = createPlan({
      operation: "test",
      changes: [{ type: "write", path: "nota.md", content: "nueva\n" }],
      validations: []
    });
    const applied = await applyPlan(root, valid);
    assert.deepEqual(applied.paths, ["nota.md"]);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "nueva\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("expectedHash obsoleto produce conflicto y no escribe", async () => {
  const root = fixture();
  try {
    const plan = createPlan({
      operation: "test",
      changes: [
        {
          type: "write",
          path: "nota.md",
          content: "nueva\n",
          expectedHash: sha256("otra cosa")
        }
      ],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, plan), /Conflicto/);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "linea vieja\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("write con overwrite false no pisa archivos existentes", async () => {
  const root = fixture();
  try {
    const plan = createPlan({
      operation: "test",
      changes: [{ type: "write", path: "nota.md", content: "otra\n", overwrite: false }],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, plan), /Ya existe/);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "linea vieja\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("applyPlan rechaza paths que escapan del repo", async () => {
  const root = fixture();
  const outside = mkdtempSync(join(tmpdir(), "taller-outside-"));
  try {
    const traversal = createPlan({
      operation: "test",
      changes: [{ type: "delete", path: "../../etc/passwd" }],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, traversal), /Path inválido/);
    const external = join(outside, "x.md");
    writeFileSync(external, "no tocar\n");
    const absolute = createPlan({
      operation: "test",
      changes: [{ type: "write", path: external, content: "x\n" }],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, absolute), /Path inválido/);
    assert.equal(readFileSync(external, "utf8"), "no tocar\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("applyPlan rollback restaura escrituras previas si falla un cambio posterior", async () => {
  const root = fixture();
  try {
    writeFileSync(join(root, "segunda.md"), "segunda vieja\n");
    const plan = createPlan({
      operation: "test",
      changes: [
        { type: "write", path: "nota.md", content: "primera nueva\n" },
        {
          type: "write",
          path: "segunda.md",
          content: "segunda nueva\n",
          expectedHash: sha256("otra cosa")
        }
      ],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, plan), /Conflicto/);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "linea vieja\n");
    assert.equal(readFileSync(join(root, "segunda.md"), "utf8"), "segunda vieja\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("applyPlan rollback elimina archivos creados por exec si falla después", async () => {
  const root = fixture();
  try {
    const plan = createPlan({
      operation: "test",
      changes: [
        {
          type: "exec",
          command: "node",
          args: ["-e", "require('fs').writeFileSync('creado.md','x')"],
          expectedPaths: ["creado.md"]
        },
        {
          type: "frontmatter",
          path: "creado.md",
          updates: { title: "x" },
          expectedHash: "hash-que-no-coincide"
        }
      ],
      validations: []
    });
    await assert.rejects(() => applyPlan(root, plan), /Conflicto/);
    assert.equal(existsSync(join(root, "creado.md")), false);
    assert.equal(readFileSync(join(root, "nota.md"), "utf8"), "linea vieja\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("delete y huella estable", async () => {
  const root = fixture();
  try {
    const plan = createPlan({
      operation: "test",
      changes: [{ type: "delete", path: "nota.md" }],
      validations: []
    });
    const fingerprint = planFingerprint(plan);
    assert.equal(fingerprint, planFingerprint(plan));
    const result = await applyPlan(root, plan);
    assert.deepEqual(result.paths, ["nota.md"]);
    assert.equal(existsSync(join(root, "nota.md")), false);
    const changed = createPlan({
      operation: "test",
      changes: [{ type: "delete", path: "nota.md" }],
      validations: [validation("a", true, "ok")]
    });
    assert.notEqual(planFingerprint(changed), fingerprint);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
