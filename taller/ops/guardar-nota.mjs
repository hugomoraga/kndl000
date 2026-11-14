import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, replaceBody, setFrontmatterFields } from "../lib/frontmatter.mjs";
import { sha256 } from "../lib/paths.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { metaString } from "../lib/frontmatter.mjs";

function requiredFailures(entry, ctx, meta) {
  const type = ctx.registry.types.find((candidate) => candidate.id === entry.type);
  return (type?.required ?? [])
    .filter((key) => {
      const value = meta?.[key];
      return value === undefined || value === null || String(value).trim() === "";
    })
    .map((key) =>
      validation("requerido", false, `Falta el campo obligatorio: ${key}`, { field: key })
    );
}

export default {
  id: "guardar-nota",
  label: "Guardar nota",
  description: "Previsualiza y guarda una edición explícita con detección de conflictos.",
  palette: false,
  fields: [
    { name: "path", label: "Archivo", type: "text", required: true },
    { name: "hash", label: "Hash", type: "hidden" },
    { name: "body", label: "Cuerpo", type: "textarea" },
    { name: "rawFrontmatter", label: "YAML crudo", type: "textarea" },
    { name: "updates", label: "Campos", type: "hidden" }
  ],
  async plan(ctx, input) {
    const entry = ctx.index.entries.find((candidate) => candidate.path === input.path);
    const validations = [];
    if (!entry) {
      return createPlan({
        operation: "guardar-nota",
        summary: "No se puede guardar: archivo inexistente.",
        validations: [validation("entry", false, `No existe: ${input.path}`)]
      });
    }
    if (entry.readOnly) {
      validations.push(validation("readonly", false, "El documento es read-only."));
    }
    if (entry.binary || entry.readError) {
      validations.push(
        validation("encoding", false, entry.readError ?? "El archivo no se puede editar.")
      );
    }

    const abs = join(ctx.root, entry.path);
    const current = readFileSync(abs, "utf8");
    const currentHash = sha256(current);
    if (input.hash && input.hash !== currentHash) {
      validations.push(
        validation(
          "conflicto",
          false,
          "El archivo cambió en disco desde que se abrió. Recargá o mirá el diff.",
          { field: "hash" }
        )
      );
    }

    const updates =
      input.updates && typeof input.updates === "object" ? input.updates : {};
    const rawProvided = typeof input.rawFrontmatter === "string";
    let next = current;
    try {
      if (rawProvided || Object.keys(updates).length > 0) {
        next = setFrontmatterFields(current, updates, rawProvided ? { rawFrontmatter: input.rawFrontmatter } : {});
      }
      if (typeof input.body === "string") {
        next = replaceBody(next, input.body);
      }
    } catch (error) {
      const lineInfo = error.line
        ? ` (línea ${error.line}${error.column ? `, columna ${error.column}` : ""})`
        : "";
      validations.push(
        validation("yaml", false, `${error.message}${lineInfo}`, {
          field: error.line ? `línea ${error.line}` : null
        })
      );
    }

    let nextMeta = {};
    try {
      nextMeta = parseFrontmatter(next).meta;
    } catch {
      nextMeta = {};
    }
    validations.push(...requiredFailures(entry, ctx, nextMeta));

    const noChanges = next === current;
    return createPlan({
      operation: "guardar-nota",
      summary: noChanges ? "Sin cambios." : `Guardar ${entry.path}`,
      changes: noChanges
        ? []
        : [
            {
              type: "write",
              path: entry.path,
              content: next,
              expectedHash: currentHash
            }
          ],
      preview: noChanges
        ? []
        : [{ type: "write", path: entry.path, content: next }],
      validations,
      message: `taller: guardar ${entry.path}`,
      origin: entry.path,
      meta: {
        originalContent: current,
        originalHash: currentHash,
        meta: nextMeta,
        date: metaString(nextMeta, "date")
      }
    });
  }
};
