import { readFileSync } from "node:fs";
import { join } from "node:path";
import { removeFromFrontmatterList } from "../lib/frontmatter.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

export default {
  id: "desvincular-adjunto",
  label: "Desvincular adjunto",
  description: "Quita la entrada del frontmatter; el archivo queda en disco.",
  fields: [
    { name: "source", label: "Nota", type: "path", required: true },
    { name: "archivo", label: "Archivo", type: "text", required: true }
  ],
  async plan(ctx, input) {
    const source = findEntry(ctx, input.source);
    const archivo = String(input.archivo ?? "").trim();
    const validations = [];
    if (!source) {
      validations.push(validation("source", false, `No existe la nota: ${input.source || "(vacía)"}`, { field: "source" }));
    } else if (source.readOnly) {
      validations.push(validation("readonly", false, "La nota es read-only."));
    }
    const adjuntos = Array.isArray(source?.meta?.adjuntos) ? source.meta.adjuntos : [];
    if (source && !adjuntos.some((adjunto) => String(adjunto?.archivo ?? "") === archivo)) {
      validations.push(validation("adjunto", false, "El adjunto no está vinculado a la nota.", { field: "archivo" }));
    }
    let content = null;
    if (source) {
      const current = readFileSync(join(ctx.root, source.path), "utf8");
      content = removeFromFrontmatterList(
        current,
        "adjuntos",
        (adjunto) => String(adjunto?.archivo ?? "") === archivo
      );
    }
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "desvincular-adjunto",
      summary: `Desvincular adjunto ${archivo}`,
      changes:
        noValid || !source
          ? []
          : [{ type: "write", path: source.path, content, expectedHash: source.hash }],
      preview: noValid || !source ? [] : [{ type: "write", path: source.path, content }],
      validations,
      message: `taller: desvincular adjunto ${archivo}`,
      origin: source?.path ?? input.source
    });
  }
};
