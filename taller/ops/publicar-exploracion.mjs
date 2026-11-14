import { createPlan, validation } from "../lib/plan.mjs";
import { validateExplorationFields } from "../lib/validations.mjs";
import { ensureSlug, findEntry, publicExplorations } from "./common.mjs";
import {
  dryRunExploration,
  explorationValidations,
  predictedExploration,
  scaffoldChanges
} from "./exploration.mjs";

function parseNodes(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default {
  id: "publicar-exploracion",
  label: "Publicar como exploración",
  description: "Promueve una nota a exploración con el scaffold y las validaciones del protocolo.",
  fields: [
    { name: "notePath", label: "Nota de origen", type: "path", required: true },
    { name: "title", label: "Título", type: "text", required: true },
    { name: "question", label: "Pregunta", type: "textarea", required: true },
    { name: "summary", label: "Resumen", type: "textarea", required: true },
    { name: "status", label: "Estado", type: "text", default: "abierta" },
    { name: "slug", label: "Slug", type: "text" },
    { name: "nodos", label: "Nodos (separados por coma)", type: "text" },
    { name: "copyBody", label: "Copiar el cuerpo de la nota al archivo público", type: "checkbox" }
  ],
  async plan(ctx, input) {
    const note = findEntry(ctx, input.notePath);
    const title = String(input.title ?? note?.title ?? "").trim();
    const question = String(input.question ?? note?.meta?.question ?? note?.meta?.pregunta ?? "").trim();
    const summary = String(input.summary ?? note?.meta?.summary ?? "").trim();
    const status = String(input.status ?? "abierta").trim() || "abierta";
    const slug = ensureSlug(input.slug, title);
    const nodos = parseNodes(input.nodos ?? note?.meta?.nodos ?? note?.meta?.nodo ?? []);
    const validations = explorationValidations(ctx, { title, question, slug });

    if (!note) {
      validations.push(
        validation("note", false, `No existe la nota de origen: ${input.notePath || "(sin path)"}`, {
          field: "notePath"
        })
      );
    } else if (note.readOnly) {
      validations.push(validation("note-readonly", false, "La nota de origen es read-only."));
    }

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

    const copyBody = input.copyBody && note ? note.body : "";
    const scaffoldBody = dry.files.get(`content/collections/_exploraciones/${slug}.md`) ?? "";
    const bodyForSections = copyBody || scaffoldBody;
    const target = `content/collections/_exploraciones/${slug}.md`;
    const others = publicExplorations(ctx).filter((entry) => entry.path !== target);
    const exploration = validateExplorationFields(
      { question, summary, status, body: bodyForSections, nodos },
      others
    );
    validations.push(...exploration.validations);

    const noValid = validations.some((item) => !item.ok);
    const preview = noValid
      ? []
      : [...dry.files.entries()].map(([path, content]) => ({
          type: "write",
          path,
          content:
            path === target
              ? predictedExploration(dry.files, slug, { copyBody, summary, nodos, status })
              : content
        }));

    return createPlan({
      operation: "publicar-exploracion",
      summary: `Publicar exploración: /rizoma/${slug}/`,
      changes: noValid
        ? []
        : scaffoldChanges({
            title,
            question,
            slug,
            copyBody,
            summary,
            nodos,
            status,
            expectedPaths: [...dry.files.keys()]
          }),
      preview,
      validations,
      warnings: exploration.shared.shared.length
        ? []
        : ["Ningún nodo compartido: se requiere override con motivo."],
      message: `taller: publicar exploración ${slug}`,
      origin: input.notePath || target,
      meta: {
        title,
        question,
        summary,
        status,
        slug,
        nodos,
        shared: exploration.shared,
        scriptOutput: dry.output,
        target
      }
    });
  }
};
