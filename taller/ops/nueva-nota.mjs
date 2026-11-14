import { existsSync } from "node:fs";
import { join } from "node:path";
import { createPlan, validation } from "../lib/plan.mjs";
import { ensureSlug, quote, today } from "./common.mjs";

export function notebookDoc({ title, pregunta, date }) {
  const lines = [
    "---",
    `title: ${quote(title)}`,
    `date: ${date}`,
    "estado: banco"
  ];
  if (pregunta) lines.push(`pregunta: ${quote(pregunta)}`);
  lines.push("---", "", "");
  return lines.join("\n");
}

export default {
  id: "nueva-nota",
  label: "Nueva nota",
  description: "Crea solo una nota de trabajo en docs/rizoma/banco/.",
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "pregunta", label: "Pregunta", type: "textarea" },
    { name: "slug", label: "Slug", type: "text", help: "Opcional; si falta se deriva del título." },
    { name: "date", label: "Fecha", type: "text", help: "Por defecto, hoy." }
  ],
  async plan(ctx, input) {
    const title = String(input.title ?? "").trim();
    const pregunta = String(input.pregunta ?? "").trim();
    const date = String(input.date ?? "").trim() || today();
    const slug = ensureSlug(input.slug, title);
    const validations = [];
    if (!title) validations.push(validation("title", false, "Falta el título.", { field: "title" }));
    if (!slug) validations.push(validation("slug", false, "No se pudo derivar un slug.", { field: "slug" }));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      validations.push(validation("date", false, "La fecha debe ser YYYY-MM-DD.", { field: "date" }));
    }

    const path = `docs/rizoma/banco/${date}-${slug}.md`;
    if (existsSync(join(ctx.root, path))) {
      validations.push(
        validation("exists", false, `Ya existe: ${path}. Elegí otro slug o fecha.`, {
          field: "slug"
        })
      );
    }

    const content = notebookDoc({ title, pregunta, date });
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "nueva-nota",
      summary: `Nueva nota de trabajo: ${path}`,
      changes: noValid
        ? []
        : [{ type: "write", path, content, overwrite: false }],
      preview: noValid ? [] : [{ type: "write", path, content }],
      validations,
      message: `taller: nueva nota ${path}`,
      origin: path,
      meta: { title, pregunta, date, slug }
    });
  }
};
