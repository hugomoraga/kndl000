import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, updateFrontmatter } from "../lib/frontmatter.mjs";
import { resolveTarget } from "../lib/links.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

function normalizeUrl(value) {
  const url = String(value ?? "").trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function cloneSections(meta) {
  return (Array.isArray(meta?.corpus_secciones) ? meta.corpus_secciones : []).map((section) => ({
    ...section,
    piezas: Array.isArray(section?.piezas) ? [...section.piezas] : []
  }));
}

function replaceSectionUrl(sections, oldUrl, newUrl) {
  let changed = false;
  for (const section of sections) {
    section.piezas = section.piezas.map((piece) => {
      if (normalizeUrl(piece) !== normalizeUrl(oldUrl)) return piece;
      changed = true;
      return newUrl;
    });
  }
  return changed;
}

function removeSectionUrl(sections, url) {
  let changed = false;
  for (const section of sections) {
    const next = section.piezas.filter((piece) => normalizeUrl(piece) !== normalizeUrl(url));
    if (next.length !== section.piezas.length) changed = true;
    section.piezas = next;
  }
  return changed;
}

function addSectionUrl(sections, sectionName, url) {
  let section = sections.find(
    (candidate) => normalizeUrl(candidate.seccion) === normalizeUrl(sectionName)
  );
  if (!section) {
    section = { seccion: sectionName, piezas: [] };
    sections.push(section);
  }
  if (!section.piezas.some((piece) => normalizeUrl(piece) === normalizeUrl(url))) {
    section.piezas.push(url);
  }
}

export default {
  id: "editar-corpus",
  label: "Editar corpus",
  description: "Agrega, edita o quita piezas del corpus de una exploración.",
  palette: false,
  fields: [
    { name: "path", label: "Exploración", type: "hidden" },
    { name: "action", label: "Acción", type: "hidden" },
    { name: "index", label: "Índice", type: "hidden" },
    { name: "url", label: "URL", type: "text" },
    { name: "note", label: "Nota", type: "textarea" },
    { name: "seccion", label: "Sección", type: "text" }
  ],
  async plan(ctx, input) {
    const entry = findEntry(ctx, input.path);
    const action = String(input.action ?? "");
    const validations = [];
    const warnings = [];

    if (!entry) {
      validations.push(validation("entry", false, `No existe la exploración: ${input.path}`, { field: "path" }));
    } else {
      if (entry.type !== "exploracion") {
        validations.push(validation("tipo", false, "El corpus solo se edita en exploraciones.", { field: "path" }));
      }
      if (entry.readOnly) {
        validations.push(validation("readonly", false, "La exploración es read-only."));
      }
    }
    if (!["add", "edit", "remove"].includes(action)) {
      validations.push(validation("action", false, "Acción de corpus inválida.", { field: "action" }));
    }
    if (!entry) {
      return createPlan({
        operation: "editar-corpus",
        summary: "No se puede editar el corpus.",
        validations
      });
    }

    const current = readFileSync(join(ctx.root, entry.path), "utf8");
    const parsed = parseFrontmatter(current);
    const corpus = Array.isArray(parsed.meta.corpus) ? parsed.meta.corpus : [];
    if (parsed.meta.corpus !== undefined && !Array.isArray(parsed.meta.corpus)) {
      validations.push(validation("corpus", false, "El campo corpus no es una lista.", { field: "path" }));
    }

    const index = action === "add" ? -1 : Number(input.index);
    if (action !== "add" && (!Number.isInteger(index) || index < 0 || index >= corpus.length)) {
      validations.push(validation("index", false, "La pieza del corpus no existe.", { field: "index" }));
    }

    const url = String(input.url ?? "").trim();
    const note = String(input.note ?? "").trim();
    const sectionName = String(input.seccion ?? "").trim();
    const oldUrl =
      action !== "add" && corpus[index] && typeof corpus[index] === "object"
        ? String(corpus[index].url ?? "")
        : "";
    if (action !== "remove") {
      if (!url) {
        validations.push(validation("url", false, "Falta la URL de la pieza.", { field: "url" }));
      } else if (!url.startsWith("/") && !/^https?:/i.test(url)) {
        validations.push(
          validation("url-forma", false, "La URL debe empezar con / o ser http(s).", { field: "url" })
        );
      }
      const duplicate = corpus.some(
        (item, itemIndex) =>
          itemIndex !== index && normalizeUrl(item?.url) === normalizeUrl(url)
      );
      if (duplicate) {
        validations.push(validation("duplicado", false, "Esa pieza ya está en el corpus.", { field: "url" }));
      }
      if (url.startsWith("/")) {
        const target = resolveTarget(ctx.root, entry.path, url, ctx.index.publicByUrl);
        if (target.kind !== "external" && !target.exists) {
          warnings.push(`No se pudo verificar la URL en el repo: ${url}`);
        }
      }
    }

    const sections = cloneSections(parsed.meta);
    let sectionsChanged = false;
    if (action === "add") {
      if (sectionName) {
        addSectionUrl(sections, sectionName, url);
        sectionsChanged = true;
      }
    } else if (action === "edit") {
      if (oldUrl && normalizeUrl(oldUrl) !== normalizeUrl(url)) {
        sectionsChanged = replaceSectionUrl(sections, oldUrl, url) || sectionsChanged;
      }
      if (sectionName) {
        const currentSection = sections.find((section) =>
          section.piezas.some((piece) => normalizeUrl(piece) === normalizeUrl(oldUrl || url))
        );
        if (!currentSection || normalizeUrl(currentSection.seccion) !== normalizeUrl(sectionName)) {
          sectionsChanged = removeSectionUrl(sections, oldUrl || url) || sectionsChanged;
          addSectionUrl(sections, sectionName, url);
          sectionsChanged = true;
        }
      }
    } else if (action === "remove") {
      if (oldUrl) sectionsChanged = removeSectionUrl(sections, oldUrl) || sectionsChanged;
    }

    const noValid = validations.some((item) => !item.ok);
    let next = current;
    if (!noValid) {
      next = updateFrontmatter(current, (doc) => {
        if (action === "add") {
          const currentCorpus = doc.get("corpus", true);
          if (currentCorpus === undefined || currentCorpus === null) {
            doc.set("corpus", [{ url, note }]);
          } else {
            doc.addIn(["corpus"], { url, note });
          }
        } else if (action === "edit") {
          const existing =
            corpus[index] && typeof corpus[index] === "object" ? { ...corpus[index] } : {};
          doc.setIn(["corpus", index], { ...existing, url, note });
        } else if (action === "remove") {
          doc.deleteIn(["corpus", index]);
        }
        if (sectionsChanged) doc.set("corpus_secciones", sections);
      });
    }

    const labels = { add: "agregar", edit: "editar", remove: "quitar" };
    return createPlan({
      operation: "editar-corpus",
      summary: `${labels[action] ?? action} corpus${url ? `: ${url}` : ""}`,
      changes: noValid
        ? []
        : [{ type: "write", path: entry.path, content: next, expectedHash: entry.hash }],
      preview: noValid ? [] : [{ type: "write", path: entry.path, content: next }],
      validations,
      warnings,
      message: `taller: ${labels[action] ?? action} corpus ${entry.path}${url ? ` · ${url}` : ""}`,
      origin: entry.path,
      meta: { action, index, url, section: sectionName, sectionsChanged }
    });
  }
};
