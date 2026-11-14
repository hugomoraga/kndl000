import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { removeFromFrontmatterList } from "../lib/frontmatter.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

export default {
  id: "borrar-adjunto",
  label: "Borrar archivo adjunto",
  description: "Borra el archivo con segunda confirmación y muestra las notas que lo referencian.",
  fields: [
    { name: "source", label: "Nota", type: "path", required: true },
    { name: "archivo", label: "Archivo", type: "text", required: true },
    { name: "confirm", label: "Confirmo borrar el archivo", type: "checkbox" }
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
    if (!input.confirm) {
      validations.push(
        validation("confirm", false, "Borrar el archivo requiere una segunda confirmación.", {
          field: "confirm"
        })
      );
    }
    if (!archivo.startsWith("docs/rizoma/adjuntos/")) {
      validations.push(
        validation("archivo", false, "Solo se borran adjuntos de docs/rizoma/adjuntos/.", {
          field: "archivo"
        })
      );
    }
    if (archivo && !existsSync(join(ctx.root, archivo))) {
      validations.push(validation("missing", false, `No existe el archivo: ${archivo}`, { field: "archivo" }));
    }

    const refs = ctx.index.entries.filter((entry) =>
      (Array.isArray(entry.meta?.adjuntos) ? entry.meta.adjuntos : []).some(
        (adjunto) => String(adjunto?.archivo ?? "") === archivo
      )
    );
    const adjuntos = Array.isArray(source?.meta?.adjuntos) ? source.meta.adjuntos : [];
    if (source && !adjuntos.some((adjunto) => String(adjunto?.archivo ?? "") === archivo)) {
      validations.push(
        validation("vinculo", false, "El adjunto no está vinculado a la nota de origen.", {
          field: "archivo"
        })
      );
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

    const changes = [];
    if (!validations.some((item) => !item.ok) && source) {
      changes.push({ type: "delete", path: archivo });
      changes.push({ type: "write", path: source.path, content, expectedHash: source.hash });
    }

    return createPlan({
      operation: "borrar-adjunto",
      summary: `Borrar adjunto ${archivo}`,
      changes,
      preview: [],
      validations,
      warnings: refs.map(
        (entry) => `Referenciado por: ${entry.path}${entry.path === source?.path ? " (se desvincula)" : " (queda como referencia rota)"}`
      ),
      message: `taller: borrar adjunto ${archivo}`,
      origin: source?.path ?? input.source
    });
  }
};
