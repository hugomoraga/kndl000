import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendToFrontmatterList } from "../lib/frontmatter.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findExploration, today } from "./common.mjs";

export default {
  id: "publicar-hito",
  label: "Publicar hito",
  description: "Agrega un hito curado al frontmatter de una exploración.",
  fields: [
    { name: "exploracion", label: "Exploración", type: "text", required: true },
    { name: "date", label: "Fecha", type: "text" },
    { name: "title", label: "Título del hito", type: "text", required: true },
    { name: "text", label: "Texto", type: "textarea", required: true }
  ],
  async plan(ctx, input) {
    const exp = findExploration(ctx, input.exploracion);
    const date = String(input.date ?? "").trim() || today();
    const title = String(input.title ?? "").trim();
    const text = String(input.text ?? "").trim();
    const validations = [];

    if (!exp) {
      validations.push(
        validation("exploracion", false, `No existe la exploración: ${input.exploracion || "(vacía)"}`, {
          field: "exploracion"
        })
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      validations.push(validation("date", false, "La fecha debe ser YYYY-MM-DD.", { field: "date" }));
    }
    if (!title) validations.push(validation("title", false, "Falta el título del hito.", { field: "title" }));
    if (!text) validations.push(validation("text", false, "Falta el texto del hito.", { field: "text" }));
    if (exp) {
      const hitos = Array.isArray(exp.meta?.hitos) ? exp.meta.hitos : [];
      const duplicate = hitos.some(
        (hito) => hito && String(hito.title ?? "") === title && String(hito.date ?? "") === date
      );
      if (duplicate) {
        validations.push(
          validation("duplicado", false, "Ya existe un hito con esa fecha y ese título.", {
            field: "title"
          })
        );
      }
    }

    let content = null;
    if (exp) {
      const current = readFileSync(join(ctx.root, exp.path), "utf8");
      content = appendToFrontmatterList(current, "hitos", { date, title, text });
    }
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "publicar-hito",
      summary: `Hito para ${exp?.title ?? input.exploracion}: ${title}`,
      changes:
        noValid || !exp
          ? []
          : [{ type: "write", path: exp.path, content, expectedHash: exp.hash }],
      preview: noValid || !exp ? [] : [{ type: "write", path: exp.path, content }],
      validations,
      message: `taller: hito ${title}`,
      origin: exp?.path ?? input.exploracion,
      meta: { exploracion: exp?.path ?? null, date, title }
    });
  }
};
