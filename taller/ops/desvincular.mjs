import { readFileSync } from "node:fs";
import { join } from "node:path";
import { removeFromFrontmatterList } from "../lib/frontmatter.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

export default {
  id: "desvincular",
  label: "Quitar vínculo",
  description: "Quita un vínculo del frontmatter. No borra ninguna nota.",
  fields: [
    { name: "source", label: "Nota de origen", type: "path", required: true },
    { name: "destino", label: "Destino a quitar", type: "text", required: true }
  ],
  async plan(ctx, input) {
    const source = findEntry(ctx, input.source);
    const destino = String(input.destino ?? "").trim();
    const validations = [];
    if (!source) {
      validations.push(validation("source", false, `No existe la nota: ${input.source || "(vacía)"}`, { field: "source" }));
    } else if (source.readOnly) {
      validations.push(validation("readonly", false, "La nota es read-only."));
    } else if (!["banco", "ciclo", "nota"].includes(source.type)) {
      validations.push(
        validation("source-banco", false, "Los vínculos del taller viven solo en notas de banco.", {
          field: "source"
        })
      );
    }
    if (!destino) {
      validations.push(validation("destino", false, "Falta el destino.", { field: "destino" }));
    }
    const vinculos = Array.isArray(source?.meta?.vinculos) ? source.meta.vinculos : [];
    const normalizedDestino = destino.replace(/\/$/, "");
    if (
      source &&
      destino &&
      !vinculos.some(
        (vinculo) =>
          vinculo && String(vinculo.destino ?? "").trim().replace(/\/$/, "") === normalizedDestino
      )
    ) {
      validations.push(
        validation("vinculo", false, "No existe ese vínculo en la nota.", { field: "destino" })
      );
    }

    let content = null;
    if (source) {
      const current = readFileSync(join(ctx.root, source.path), "utf8");
      content = removeFromFrontmatterList(
        current,
        "vinculos",
        (vinculo) => String(vinculo?.destino ?? "").trim().replace(/\/$/, "") === normalizedDestino
      );
    }
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "desvincular",
      summary: `Quitar vínculo de ${source?.path ?? input.source} → ${destino}`,
      changes:
        noValid || !source
          ? []
          : [{ type: "write", path: source.path, content, expectedHash: source.hash }],
      preview: noValid || !source ? [] : [{ type: "write", path: source.path, content }],
      validations,
      message: `taller: desvincular ${source?.path ?? input.source} → ${destino}`,
      origin: source?.path ?? input.source
    });
  }
};
