import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { headContent } from "../lib/git.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

export default {
  id: "descartar",
  label: "Descartar cambios",
  description: "Vuelve el archivo a HEAD con git restore; si es nuevo, lo elimina.",
  palette: true,
  fields: [{ name: "path", label: "Archivo", type: "path", required: true }],
  async plan(ctx, input) {
    const entry = findEntry(ctx, input.path);
    const validations = [];
    if (!entry) {
      validations.push(validation("entry", false, `No existe en el banco: ${input.path}`, { field: "path" }));
    } else if (entry.readOnly) {
      validations.push(
        validation("readonly", false, "Documento read-only: el taller no lo descarta.", {
          field: "path"
        })
      );
    }
    const head = await headContent(ctx.root, input.path);
    const abs = join(ctx.root, input.path);
    const exists = existsSync(abs);
    const tracked = head !== null;
    if (!tracked && !exists) {
      validations.push(validation("missing", false, "El archivo no existe en disco ni en HEAD."));
    }
    if (!tracked) {
      validations.push(
        validation(
          "untracked",
          true,
          "El archivo no está en HEAD: descartar lo elimina del disco."
        )
      );
    }

    const changes = [];
    const preview = [];
    if (tracked) {
      changes.push({ type: "restore", path: input.path });
      if (exists) preview.push({ type: "write", path: input.path, content: head });
    } else if (exists) {
      changes.push({ type: "delete", path: input.path });
      preview.push({ type: "delete", path: input.path });
    }

    const noValid = validations.some((item) => !item.ok);
    return createPlan({
      operation: "descartar",
      summary: tracked
        ? `Volver ${input.path} a HEAD`
        : `Eliminar archivo nuevo ${input.path}`,
      changes: noValid ? [] : changes,
      preview: noValid ? [] : preview,
      validations,
      warnings: tracked ? [] : ["El archivo no está versionado: se borra del disco."],
      message: `taller: descartar ${input.path}`,
      origin: input.path
    });
  }
};
