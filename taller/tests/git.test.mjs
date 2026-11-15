import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { commitsAhead, repoState, statusPorcelain } from "../lib/git.mjs";

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

test("commitsAhead lista los commits locales contra el upstream", async () => {
  const base = mkdtempSync(join(tmpdir(), "taller-git-ahead-"));
  const remote = join(base, "remote.git");
  const work = join(base, "work");
  try {
    execFileSync("git", ["init", "-q", "--bare", "-b", "main", remote]);
    execFileSync("git", ["init", "-q", "-b", "main", work]);
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: work });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: work });
    writeFileSync(join(work, "a.txt"), "a");
    execFileSync("git", ["add", "a.txt"], { cwd: work });
    execFileSync("git", ["commit", "-q", "-m", "inicial"], { cwd: work });
    execFileSync("git", ["remote", "add", "origin", remote], { cwd: work });
    execFileSync("git", ["push", "-q", "-u", "origin", "main"], { cwd: work });
    writeFileSync(join(work, "b.txt"), "b");
    execFileSync("git", ["add", "b.txt"], { cwd: work });
    execFileSync("git", ["commit", "-q", "-m", "segundo"], { cwd: work });

    const ahead = await commitsAhead(work);
    assert.equal(ahead.upstream, "origin/main");
    assert.equal(ahead.error, null);
    assert.equal(ahead.commits.length, 1);
    assert.equal(ahead.commits[0].subject, "segundo");
    assert.match(ahead.commits[0].hash, /^[0-9a-f]+$/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("commitsAhead sin upstream no inventa commits", async () => {
  const root = mkdtempSync(join(tmpdir(), "taller-git-noup-"));
  try {
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: root });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: root });
    writeFileSync(join(root, "a.txt"), "a");
    execFileSync("git", ["add", "a.txt"], { cwd: root });
    execFileSync("git", ["commit", "-q", "-m", "inicial"], { cwd: root });

    const ahead = await commitsAhead(root);
    assert.equal(ahead.upstream, null);
    assert.deepEqual(ahead.commits, []);
    assert.equal(ahead.error, null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
