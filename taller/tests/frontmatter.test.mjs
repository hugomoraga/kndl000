import test from "node:test";
import assert from "node:assert/strict";
import {
  FrontmatterError,
  appendToFrontmatterList,
  parseFrontmatter,
  removeFromFrontmatterList,
  setFrontmatterFields,
  splitFrontmatter,
  updateFrontmatter,
  upsertInFrontmatterList
} from "../lib/frontmatter.mjs";

const BODY = "## 1. La pregunta {#la-pregunta}\n\nTexto con **marcas** y `código`.\n";

test("preserva claves desconocidas, orden, comentarios y cuerpo byte-idéntico", () => {
  const content = `---
title: "Una nota" # comentario vivo
date: ""
unknown:
  anidado: true
  lista:
    - uno
block: |
  linea uno
  linea dos
ancla: &base
  valor: 1
alias: *base
---

${BODY}`;
  const originalBody = splitFrontmatter(content).body;
  const next = setFrontmatterFields(content, { estado: "banco" });
  const parsed = parseFrontmatter(next);
  assert.equal(parsed.meta.title, "Una nota");
  assert.equal(parsed.meta.estado, "banco");
  assert.deepEqual(parsed.meta.unknown.lista, ["uno"]);
  assert.deepEqual(parsed.meta.alias, { valor: 1 });
  assert.equal(parsed.meta.date, "");
  assert.equal(parsed.body, originalBody);
  assert.match(next, /# comentario vivo/);
  assert.ok(next.indexOf("title:") < next.indexOf("unknown:"));
  assert.ok(next.indexOf("unknown:") < next.indexOf("block:"));
});

test("preserva CRLF y el cuerpo exacto", () => {
  const body = "## Título\r\n\r\nTexto\r\n";
  const content = `---\r\ntitle: "Hola"\r\ndate: 2026-11-14\r\n---\r\n${body}`;
  const next = setFrontmatterFields(content, { estado: "banco" });
  const parts = splitFrontmatter(next);
  assert.equal(parts.body, body);
  assert.ok(next.includes("\r\n"));
  assert.doesNotMatch(next.replaceAll("\r\n", ""), /\n/);
});

test("appendToFrontmatterList agrega sin perder el resto", () => {
  const content = `---
title: "N"
vinculos:
  - destino: /rizoma/a/
    motivo: "primero"
---
cuerpo
`;
  const next = appendToFrontmatterList(content, "vinculos", {
    destino: "/rizoma/b/",
    motivo: "segundo",
    fecha: "2026-11-14"
  });
  const parsed = parseFrontmatter(next);
  assert.equal(parsed.meta.vinculos.length, 2);
  assert.equal(parsed.meta.vinculos[1].destino, "/rizoma/b/");
  assert.equal(parsed.body, "cuerpo\n");
});

test("quitar y actualizar items conserva comentarios del resto de la lista", () => {
  const content = `---
vinculos:
  # primero
  - destino: a
    motivo: uno
  # segundo
  - destino: b
    motivo: dos
otro: x
---
cuerpo
`;
  const removed = removeFromFrontmatterList(content, "vinculos", (item) => item.destino === "a");
  assert.match(removed, /# segundo/);
  assert.doesNotMatch(removed, /# primero[\s\S]*destino: a/);
  assert.deepEqual(parseFrontmatter(removed).meta.vinculos, [{ destino: "b", motivo: "dos" }]);

  const updated = upsertInFrontmatterList(
    content,
    "vinculos",
    (item) => item.destino === "b",
    { destino: "b", motivo: "DOS" }
  );
  assert.equal(parseFrontmatter(updated).meta.vinculos[1].motivo, "DOS");
  assert.match(updated, /# primero/);
});

test("updateFrontmatter acepta YAML crudo editado", () => {
  const content = "---\ntitle: \"Viejo\"\n---\n\ncuerpo\n";
  const originalBody = splitFrontmatter(content).body;
  const next = updateFrontmatter(
    content,
    (doc) => doc.set("title", "Nuevo"),
    { rawFrontmatter: 'title: "Crudo"\nunknown: 1\n' }
  );
  const parsed = parseFrontmatter(next);
  assert.equal(parsed.meta.title, "Nuevo");
  assert.equal(parsed.meta.unknown, 1);
  assert.equal(parsed.body, originalBody);
});

test("YAML inválido informa la línea y no se escribe", () => {
  assert.throws(
    () => updateFrontmatter("---\ntitle: [sin cierre\n---\ncuerpo\n", (doc) => doc.set("a", 1)),
    (error) => {
      assert.ok(error instanceof FrontmatterError);
      assert.equal(typeof error.line, "number");
      return true;
    }
  );
});
