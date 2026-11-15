import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { repoState, statusPorcelain } from "../lib/git.mjs";

test("status lista archivos untracked dentro de directorios, no el directorio", async () => {
  const root = mkdtempSync(join(tmpdir(), "taller-git-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    mkdirSync(join(root, "docs", "rizoma", "banco"), { recursive: true });
    writeFileSync(join(root, "docs", "rizoma", "banco", "nota.md"), "---\ntitle: N\n---\n");
    const dirty = await statusPorcelain(root);
    assert.ok(dirty.some((item) => item.path === "docs/rizoma/banco/nota.md"));
    assert.equal(dirty.some((item) => item.path === "docs/rizoma/banco/"), false);
    const state = await repoState(root);
    assert.ok(state.dirty.some((item) => item.path === "docs/rizoma/banco/nota.md"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
