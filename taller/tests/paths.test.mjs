import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  PathError,
  localDate,
  resolveRepoPath,
  sanitizeFilename,
  sha256,
  slugify,
  uniqueFilename
} from "../lib/paths.mjs";

function fixture() {
  return mkdtempSync(join(tmpdir(), "taller-paths-"));
}

test("resolveRepoPath acepta paths relativos dentro del repo", () => {
  const root = fixture();
  try {
    mkdirSync(join(root, "docs", "rizoma"), { recursive: true });
    writeFileSync(join(root, "docs", "rizoma", "nota.md"), "hola");
    const abs = resolveRepoPath(root, "docs/rizoma/nota.md", { mustExist: true });
    assert.equal(abs, join(root, "docs", "rizoma", "nota.md"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rechaza traversal, absolutas y symlinks que escapan", () => {
  const root = fixture();
  const outside = fixture();
  try {
    writeFileSync(join(outside, "secreto.txt"), "no");
    mkdirSync(join(root, "docs"), { recursive: true });
    symlinkSync(join(outside, "secreto.txt"), join(root, "docs", "escape.txt"));

    assert.throws(() => resolveRepoPath(root, "../../etc/passwd"), PathError);
    assert.throws(() => resolveRepoPath(root, "/etc/passwd"), PathError);
    assert.throws(
      () => resolveRepoPath(root, "docs/escape.txt", { mustExist: true }),
      /symlink|escapa/
    );
    assert.throws(() => resolveRepoPath(root, "docs/../otro.md"), PathError);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("slug, hash, fecha y sanitización de nombres", () => {
  assert.equal(slugify("¿Qué se conserva cuando algo se repite?"), "que-se-conserva-cuando-algo-se-repite");
  assert.equal(slugify("  Año / Niño  "), "ano-nino");
  assert.equal(sha256("abc").length, 64);
  assert.match(localDate(new Date("2026-11-14T12:00:00Z")), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(sanitizeFilename("../../secreto.pdf"), "secreto.pdf");
  assert.equal(sanitizeFilename("mi archivo (1).pdf"), "mi-archivo-1.pdf");
});

test("uniqueFilename agrega sufijo sin pisar", () => {
  const root = fixture();
  try {
    writeFileSync(join(root, "a.pdf"), "1");
    writeFileSync(join(root, "a-2.pdf"), "2");
    assert.equal(uniqueFilename(root, "a.pdf"), "a-3.pdf");
    assert.equal(uniqueFilename(root, "b.pdf"), "b.pdf");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
