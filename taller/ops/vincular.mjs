import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendToFrontmatterList } from "../lib/frontmatter.mjs";
import { resolveDestino } from "../lib/links.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry, today } from "./common.mjs";

export default {
  id: "vincular",
  label: "Vincular idea",
  description: "Agrega un vínculo saliente con motivo al frontmatter de una nota.",
  fields: [
    { name: "source", label: "Nota de origen", type: "path", required: true },
    { name: "destino", label: "Destino (path o URL)", type: "text", required: true },
    { name: "motivo", label: "Motivo", type: "textarea", required: true }
  ],
  async plan(ctx, input) {
    const source = findEntry(ctx, input.source);
    const destino = String(input.destino ?? "").trim();
    const motivo = String(input.motivo ?? "").trim();
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
    if (!motivo) {
      validations.push(validation("motivo", false, "Un vínculo necesita un motivo.", { field: "motivo" }));
    }
    if (source) {
      const vinculos = Array.isArray(source.meta?.vinculos) ? source.meta.vinculos : [];
      const normalizedDestino = destino.replace(/\/$/, "");
      const duplicate = vinculos.some(
        (vinculo) =>
          vinculo &&
          String(vinculo.destino ?? "").trim().replace(/\/$/, "") === normalizedDestino
      );
      if (duplicate) {
        validations.push(
          validation("duplicado", false, "Ya existe un vínculo con ese destino.", { field: "destino" })
        );
      }
    }

    const target = source && destino ? resolveDestino(ctx.root, source.path, destino) : null;
    const warnings = [];
    if (target?.kind === "internal" && !target.exists) {
      warnings.push(`El destino interno no existe todavía: ${destino}`);
    }

    let content = null;
    if (source) {
      const current = readFileSync(join(ctx.root, source.path), "utf8");
      content = appendToFrontmatterList(current, "vinculos", {
        destino,
        motivo,
        fecha: today()
      });
    }
    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "vincular",
      summary: `Vincular ${source?.path ?? input.source} → ${destino}`,
      changes:
        noValid || !source
          ? []
          : [{ type: "write", path: source.path, content, expectedHash: source.hash }],
      preview: noValid || !source ? [] : [{ type: "write", path: source.path, content }],
      validations,
      warnings,
      message: `taller: vincular ${source?.path ?? input.source} → ${destino}`,
      origin: source?.path ?? input.source,
      meta: { destino, motivo, target: target?.path ?? target?.url ?? null }
    });
  }
};
