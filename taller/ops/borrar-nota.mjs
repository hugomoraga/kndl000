import { isTracked } from "../lib/git.mjs";
import { readItem } from "../lib/indexer.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

const DELETABLE = new Set(["banco", "ciclo", "nota"]);

export default {
  id: "borrar-nota",
  label: "Borrar nota",
  description:
    "Borra una nota de trabajo con confirmación explícita. Muestra los backlinks y no los edita.",
  fields: [
    { name: "path", label: "Nota", type: "path", required: true },
    { name: "confirm", label: "Confirmo borrar la nota", type: "checkbox" }
  ],
  async plan(ctx, input) {
    const entry = findEntry(ctx, input.path);
    const validations = [];
    if (!entry) {
      validations.push(
        validation("entry", false, `No existe la nota: ${input.path || "(vacía)"}`, {
          field: "path"
        })
      );
    } else {
      if (entry.readOnly) {
        validations.push(validation("readonly", false, "El documento es read-only."));
      }
      if (!DELETABLE.has(entry.type)) {
        validations.push(
          validation(
            "tipo",
            false,
            "Solo se borran notas de banco. Las piezas públicas se editan o se descartan, no se borran desde acá.",
            { field: "path" }
          )
        );
      }
    }
    if (!input.confirm) {
      validations.push(
        validation("confirm", false, "Borrar una nota requiere una confirmación explícita.", {
          field: "confirm"
        })
      );
    }

    let warnings = [];
    let tracked = false;
    if (entry) {
      const item = readItem(ctx.root, ctx.index, entry.path);
      tracked = await isTracked(ctx.root, entry.path);
      warnings = [
        ...item.backlinks.map(
          (backlink) =>
            `Backlink: ${backlink.path} (${backlink.title}) — queda sin editar y con el vínculo roto.`
        ),
        ...(item.attachments.length > 0
          ? [
              `La nota tiene ${item.attachments.length} adjunto(s); los archivos quedan en docs/rizoma/adjuntos/.`
            ]
          : []),
        ...(tracked ? [] : ["La nota no está versionada: se elimina del disco."])
      ];
    }

    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "borrar-nota",
      summary: entry ? `Borrar ${entry.path}` : "Borrar nota inexistente",
      changes: noValid || !entry ? [] : [{ type: "delete", path: entry.path }],
      preview: noValid || !entry ? [] : [{ type: "delete", path: entry.path }],
      validations,
      warnings,
      message: `taller: borrar nota ${input.path}`,
      origin: input.path,
      meta: {
        tracked,
        backlinks: entry
          ? readItem(ctx.root, ctx.index, entry.path).backlinks.map((backlink) => backlink.path)
          : []
      }
    });
  }
};
