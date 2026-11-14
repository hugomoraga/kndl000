import { existsSync } from "node:fs";
import { join } from "node:path";
import { createPlan, validation } from "../lib/plan.mjs";
import { validateNodeWord } from "../lib/validations.mjs";
import { ensureSlug, findEntry, nextNodeOrder, quote } from "./common.mjs";

function nodeDoc({ word, order, definition }) {
  return [
    "---",
    `title: ${quote(word)}`,
    `order: ${quote(order)}`,
    `definition: ${quote(definition)}`,
    "---",
    ""
  ].join("\n");
}

export default {
  id: "publicar-nodo",
  label: "Publicar como nodo",
  description: "Crea un nodo solo si la palabra aparece en al menos dos cuerpos distintos.",
  fields: [
    { name: "notePath", label: "Nota de origen", type: "path" },
    { name: "word", label: "Palabra o expresión", type: "text", required: true },
    { name: "definition", label: "Definición", type: "textarea", required: true },
    { name: "order", label: "Orden", type: "text" },
    { name: "slug", label: "Slug", type: "text" }
  ],
  async plan(ctx, input) {
    const source = input.notePath ? findEntry(ctx, input.notePath) : null;
    const word = String(input.word ?? source?.title ?? "").trim();
    const definition = String(input.definition ?? "").trim();
    const slug = ensureSlug(input.slug, word);
    const order = String(input.order ?? "").trim() || nextNodeOrder(ctx);
    const validations = [];

    if (!word) validations.push(validation("word", false, "Falta la palabra.", { field: "word" }));
    if (!definition) {
      validations.push(validation("definition", false, "Falta la definición.", { field: "definition" }));
    }
    if (!slug) validations.push(validation("slug", false, "No se pudo derivar un slug.", { field: "slug" }));
    if (!/^\d{1,3}$/.test(order)) {
      validations.push(validation("order", false, "El orden debe ser numérico.", { field: "order" }));
    }
    if (source?.readOnly) {
      validations.push(validation("readonly", false, "La nota de origen es read-only."));
    }

    const path = `content/collections/_nodos/${slug}.md`;
    if (existsSync(join(ctx.root, path))) {
      validations.push(
        validation("exists", false, `Ya existe el nodo: ${path}.`, { field: "slug" })
      );
    }

    const wordCheck = validateNodeWord(word, ctx.sources);
    validations.push(
      validation("word-count", wordCheck.ok, wordCheck.message, {
        field: "word",
        overridable: true,
        detail: wordCheck.matches
      })
    );

    const content = nodeDoc({ word, order, definition });
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "publicar-nodo",
      summary: `Publicar nodo: ${word} (${wordCheck.count} cuerpos)`,
      changes: noValid ? [] : [{ type: "write", path, content, overwrite: false }],
      preview: noValid ? [] : [{ type: "write", path, content }],
      validations,
      warnings: wordCheck.matches.map((match) => `${match.type}: ${match.path}`),
      message: `taller: publicar nodo ${slug}`,
      origin: input.notePath || path,
      meta: { word, definition, order, slug, matches: wordCheck.matches, count: wordCheck.count }
    });
  }
};
