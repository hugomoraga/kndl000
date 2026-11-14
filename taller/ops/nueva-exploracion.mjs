import { createPlan, validation } from "../lib/plan.mjs";
import { ensureSlug, findEntry } from "./common.mjs";
import {
  dryRunExploration,
  explorationValidations,
  predictedExploration,
  scaffoldChanges
} from "./exploration.mjs";

export default {
  id: "nueva-exploracion",
  label: "Nueva exploración",
  description: "Ejecuta scripts/nueva-exploracion.mjs y muestra su salida y los paths creados.",
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    { name: "question", label: "Pregunta", type: "textarea", required: true },
    { name: "slug", label: "Slug", type: "text", help: "Opcional; si falta se deriva del título." },
    { name: "copyBodyFrom", label: "Copiar cuerpo de la nota", type: "path", help: "Opcional." },
    { name: "copyBody", label: "Confirmar copia del cuerpo", type: "checkbox" }
  ],
  async plan(ctx, input) {
    const title = String(input.title ?? "").trim();
    const question = String(input.question ?? "").trim();
    const slug = ensureSlug(input.slug, title);
    const validations = explorationValidations(ctx, { title, question, slug });
    const source = input.copyBodyFrom ? findEntry(ctx, input.copyBodyFrom) : null;
    if (input.copyBodyFrom && !source) {
      validations.push(
        validation("source", false, `No existe la nota de origen: ${input.copyBodyFrom}`, {
          field: "copyBodyFrom"
        })
      );
    }
    if (input.copyBody && !input.copyBodyFrom) {
      validations.push(
        validation("body-source", false, "Para copiar el cuerpo falta la nota de origen.", {
          field: "copyBodyFrom"
        })
      );
    }
    const copyBody = input.copyBody && source ? source.body : "";

    let dry = { ok: false, output: "", files: new Map() };
    if (slug && !validations.some((item) => item.id === "exists")) {
      dry = await dryRunExploration(ctx, { title, question, slug });
      if (!dry.ok) {
        validations.push(
          validation("script", false, `El scaffold falló:\n${dry.output}`, { field: "title" })
        );
      } else if (!dry.files.has(`content/collections/_exploraciones/${slug}.md`)) {
        validations.push(
          validation("scaffold", false, "El scaffold no anunció el archivo de exploración.")
        );
      }
    }

    const noValid = validations.some((item) => !item.ok);
    const preview = noValid
      ? []
      : [...dry.files.entries()].map(([path, content]) => ({
          type: "write",
          path,
          content:
            path === `content/collections/_exploraciones/${slug}.md`
              ? predictedExploration(dry.files, slug, { copyBody })
              : content
        }));

    return createPlan({
      operation: "nueva-exploracion",
      summary: `Nueva exploración: /rizoma/${slug}/`,
      changes: noValid
        ? []
        : scaffoldChanges({
            title,
            question,
            slug,
            copyBody,
            expectedPaths: [...dry.files.keys()]
          }),
      preview,
      validations,
      message: `taller: nueva exploración ${slug}`,
      origin: input.copyBodyFrom || `content/collections/_exploraciones/${slug}.md`,
      meta: { title, question, slug, copyBodyFrom: input.copyBodyFrom || null }
    });
  }
};
