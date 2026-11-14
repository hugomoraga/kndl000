import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildConflictPreview, mergeBodies } from "../lib/conflict.mjs";

function fixture(content) {
  const root = mkdtempSync(join(tmpdir(), "taller-conflict-"));
  writeFileSync(join(root, "nota.md"), content);
  return root;
}

test("mergeBodies elige el lado que cambió y marca conflictos reales", () => {
  assert.deepEqual(mergeBodies("a\nb\n", "a\nb\n", "a\nB\n"), {
    text: "a\nB\n",
    conflict: false
  });
  assert.deepEqual(mergeBodies("a\nb\n", "a\nC\n", "a\nb\n"), {
    text: "a\nC\n",
    conflict: false
  });
  const conflict = mergeBodies("a\nb\nc\n", "a\nB\nc\n", "a\nb\nC\n");
  assert.equal(conflict.conflict, true);
  assert.match(conflict.text, /<<<<<<< Tu edición/);
  assert.match(conflict.text, /=======/);
  assert.match(conflict.text, />>>>>>> Disco/);
});

test("preview de conflicto mezcla campos no conflictivos y conserva los del disco", () => {
  const current = `---
title: "Base"
estado: banco
extra: disco
---
linea uno
linea dos
`;
  const root = fixture(current);
  try {
    const base = {
      hash: "base",
      rawFrontmatter: 'title: "Base"\nestado: banco\n',
      body: "linea uno\nlinea dos\n"
    };
    const preview = buildConflictPreview(root, "nota.md", base, {
      body: base.body,
      updates: { estado: "publicable", title: "Base" }
    });
    assert.deepEqual(preview.conflicts.frontmatter, []);
    assert.equal(preview.conflicts.body, false);
    assert.equal(preview.current.hash.length, 64);
    assert.match(preview.merged.rawFrontmatter, /estado: publicable/);
    assert.match(preview.merged.rawFrontmatter, /extra: disco/);
    assert.equal(preview.merged.body, base.body);
    assert.match(preview.mine.rawFrontmatter, /estado: publicable/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("preview marca campos de frontmatter en conflicto", () => {
  const current = `---
title: "Base"
estado: otro
---
cuerpo
`;
  const root = fixture(current);
  try {
    const preview = buildConflictPreview(
      root,
      "nota.md",
      {
        hash: "base",
        rawFrontmatter: 'title: "Base"\nestado: banco\n',
        body: "cuerpo\n"
      },
      { body: "cuerpo\n", updates: { estado: "publicable" } }
    );
    assert.deepEqual(preview.conflicts.frontmatter, ["estado"]);
    assert.match(preview.merged.rawFrontmatter, /estado: otro/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("preview detecta cuerpo editado en ambos lados y edición cruda de YAML", () => {
  const current = `---
title: "Disco"
---
linea nueva
`;
  const root = fixture(current);
  try {
    const base = {
      hash: "base",
      rawFrontmatter: 'title: "Base"\n',
      body: "linea vieja\n"
    };
    const bodyPreview = buildConflictPreview(root, "nota.md", base, {
      body: "linea mía\n",
      updates: {}
    });
    assert.equal(bodyPreview.conflicts.body, true);
    assert.match(bodyPreview.merged.body, /Tu edición/);

    const rawPreview = buildConflictPreview(root, "nota.md", base, {
      rawFrontmatter: 'title: "Mía"\n',
      body: base.body,
      updates: {}
    });
    assert.deepEqual(rawPreview.conflicts.frontmatter, ["frontmatter"]);
    assert.match(rawPreview.merged.rawFrontmatter, /title: "Disco"/);
    assert.match(rawPreview.mine.rawFrontmatter, /title: "Mía"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("preview usa el crudo propio si el disco no tocó el frontmatter", () => {
  const current = `---
title: "Base"
---
cuerpo del disco
`;
  const root = fixture(current);
  try {
    const base = {
      hash: "base",
      rawFrontmatter: 'title: "Base"\n',
      body: "cuerpo\n"
    };
    const preview = buildConflictPreview(root, "nota.md", base, {
      rawFrontmatter: 'title: "Mía"\n',
      body: "cuerpo\n",
      updates: {}
    });
    assert.deepEqual(preview.conflicts.frontmatter, []);
    assert.match(preview.merged.rawFrontmatter, /title: "Mía"/);
    assert.equal(preview.merged.body, "cuerpo del disco\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
