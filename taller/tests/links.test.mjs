import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  backlinksFor,
  isExternal,
  linkWarnings,
  resolveDestino,
  resolveTarget,
  siteUrlToRepoPath
} from "../lib/links.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "taller-links-"));
  mkdirSync(join(root, "docs", "rizoma"), { recursive: true });
  mkdirSync(join(root, "content", "collections", "_exploraciones"), { recursive: true });
  writeFileSync(join(root, "content", "collections", "_exploraciones", "a.md"), "---\ntitle: A\n---\n");
  return root;
}

test("clasifica externos y resuelve destinos internos", () => {
  const root = fixture();
  try {
    assert.equal(isExternal("https://example.com"), true);
    assert.equal(isExternal("mailto:x@y.z"), true);
    assert.equal(isExternal("/rizoma/a/"), false);
    assert.equal(siteUrlToRepoPath("/rizoma/a/"), "content/collections/_exploraciones/a.md");
    assert.equal(
      siteUrlToRepoPath("/rizoma/a/anexos/b/"),
      "rizoma/a/anexos/b.md"
    );
    const target = resolveDestino(root, "docs/rizoma/nota.md", "/rizoma/a/");
    assert.equal(target.kind, "internal");
    assert.equal(target.exists, true);
    const relative = resolveDestino(root, "content/collections/_exploraciones/a.md", "b.md");
    assert.equal(relative.path, "content/collections/_exploraciones/b.md");
    assert.equal(relative.exists, false);
    const repoRelative = resolveDestino(
      root,
      "docs/rizoma/nota.md",
      "content/collections/_exploraciones/a.md"
    );
    assert.equal(repoRelative.path, "content/collections/_exploraciones/a.md");
    assert.equal(repoRelative.exists, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("warning de vínculo interno roto y backlinks derivados", () => {
  const root = fixture();
  try {
    const entries = [
      {
        path: "docs/rizoma/a.md",
        title: "A",
        meta: { vinculos: [{ destino: "/rizoma/archivo/", motivo: "conecta", fecha: "2026-11-14" }] }
      },
      {
        path: "docs/rizoma/b.md",
        title: "B",
        meta: { vinculos: [{ destino: "/rizoma/no-existe/", motivo: "roto", fecha: "2026-11-14" }] }
      }
    ];
    const publicByUrl = new Map([["/rizoma/archivo/", "content/collections/_exploraciones/a.md"]]);
    const warningsA = linkWarnings(entries[0], root, publicByUrl);
    const warningsB = linkWarnings(entries[1], root, publicByUrl);
    assert.equal(warningsA.length, 0);
    assert.equal(warningsB[0].id, "vinculo-roto");

    const backlinks = backlinksFor(
      "content/collections/_exploraciones/a.md",
      "/rizoma/archivo/",
      entries,
      root,
      publicByUrl
    );
    assert.equal(backlinks.length, 1);
    assert.equal(backlinks[0].path, "docs/rizoma/a.md");

    const target = resolveTarget(root, "docs/rizoma/b.md", "/rizoma/archivo/", publicByUrl);
    assert.equal(target.path, "content/collections/_exploraciones/a.md");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
