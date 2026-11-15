import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../ui/markdown.js";

test("renderiza tablas Markdown con alineación sin estilos inline", () => {
  const html = renderMarkdown(`| Nombre | Dosis | Nota |
| :--- | :---: | ---: |
| MDMA | 300 ug | fuerte |
| LSD | 2 gotas | visual |
`);
  assert.match(html, /<div class="md-table">/);
  assert.match(html, /<table>/);
  assert.match(html, /<th class="md-align-left">Nombre<\/th>/);
  assert.match(html, /<th class="md-align-center">Dosis<\/th>/);
  assert.match(html, /<th class="md-align-right">Nota<\/th>/);
  assert.match(html, /<td class="md-align-center">300 ug<\/td>/);
  assert.doesNotMatch(html, /style=/);
});

test("renderiza listas de tareas y tachado", () => {
  const html = renderMarkdown(`- [ ] pendiente
- [x] hecho
- ~~descartado~~
`);
  assert.match(html, /class="md-task-list"/);
  assert.match(html, /<input type="checkbox" disabled>/);
  assert.match(html, /<input type="checkbox" disabled checked>/);
  assert.match(html, /<del>descartado<\/del>/);
});

test("quita anclas de encabezado y escapa HTML", () => {
  const html = renderMarkdown("## Título {#titulo}\n\n<script>alert(1)</script>");
  assert.match(html, /<h2>Título<\/h2>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("una tabla no se come el párrafo anterior ni el posterior", () => {
  const html = renderMarkdown(`Antes.

| A | B |
| --- | --- |
| 1 | 2 |

Después.
`);
  assert.match(html, /<p>Antes.<\/p>/);
  assert.match(html, /<table>/);
  assert.match(html, /<p>Después.<\/p>/);
});

test("mantiene tablas dentro de citas", () => {
  const html = renderMarkdown(`> | A | B |
> | --- | --- |
> | 1 | 2 |
`);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<table>/);
});
