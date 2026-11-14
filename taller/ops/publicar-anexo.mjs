import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseYamlValue, setFrontmatterFields, upsertInFrontmatterList } from "../lib/frontmatter.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import {
  ESTADOS_ANEXO,
  FUENTES_OBLIGATORIAS,
  TIPOS_ANEXO,
  validateAnnexSources
} from "../lib/validations.mjs";
import { ensureSlug, findEntry, findExploration, nextOrder, today } from "./common.mjs";

const BODY_TEMPLATES = {
  correccion: "## Qué decía\n\n## Qué se corrige\n\n## Qué queda abierto\n",
  fuente: "## Qué dice\n\n## Qué no dice\n\n## Qué se verificó\n",
  concepto: "## Qué concepto\n\n## Qué agrega\n\n## Qué queda abierto\n",
  objecion: "## Qué tesis resiste\n\n## El caso\n\n## Por qué no se resuelve\n",
  derivacion: "## Supuestos\n\n## Resultado\n\n## Límites\n"
};

function anexoDoc(meta, body) {
  let content = `---\n---\n${body}`;
  const fields = {
    layout: "anexo",
    title: meta.title,
    order: meta.order,
    tipo: meta.tipo,
    date: meta.date,
    estado: meta.estado,
    exploracion: meta.exploracion,
    permalink: meta.permalink
  };
  if (meta.fuentes.length > 0) fields.fuentes = meta.fuentes;
  if (meta.procedencia) fields.procedencia = meta.procedencia;
  content = setFrontmatterFields(content, fields);
  return content;
}

function annexIndex(expUrl) {
  return [
    "---",
    "layout: anexos",
    'title: "Anexos"',
    `exploracion: ${expUrl}`,
    `permalink: ${expUrl}anexos/`,
    'description: "El aparato de la exploración: objeciones, correcciones, fuentes, conceptos y derivaciones."',
    "---",
    ""
  ].join("\n");
}

export default {
  id: "publicar-anexo",
  label: "Publicar como anexo",
  description: "Crea un anexo, actualiza la exploración y el índice del aparato.",
  fields: [
    { name: "notePath", label: "Nota de origen", type: "path" },
    { name: "exploracion", label: "Exploración", type: "text", required: true, help: "Slug o URL: archivo, /rizoma/archivo/." },
    { name: "title", label: "Título", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text" },
    { name: "tipo", label: "Tipo", type: "select", required: true, options: TIPOS_ANEXO },
    { name: "estado", label: "Estado", type: "select", required: true, options: ESTADOS_ANEXO },
    { name: "order", label: "Orden", type: "text" },
    { name: "permalink", label: "Permalink", type: "text" },
    { name: "nota", label: "Nota del aparato", type: "text" },
    {
      name: "fuentes",
      label: "Fuentes (YAML)",
      type: "yaml",
      help: "Lista con autor, titulo, url, consultado y verifica."
    },
    { name: "copyBody", label: "Usar el cuerpo de la nota como base", type: "checkbox" },
    { name: "overwrite", label: "Sobrescribir si el anexo ya existe", type: "checkbox" }
  ],
  async plan(ctx, input) {
    const exp = findExploration(ctx, input.exploracion);
    const title = String(input.title ?? "").trim();
    const tipo = String(input.tipo ?? "").trim();
    const estado = String(input.estado ?? "").trim();
    const slug = ensureSlug(input.slug, title);
    const validations = [];

    if (!title) validations.push(validation("title", false, "Falta el título.", { field: "title" }));
    if (!slug) validations.push(validation("slug", false, "No se pudo derivar un slug.", { field: "slug" }));
    if (!exp) {
      validations.push(
        validation("exploracion", false, `No existe la exploración: ${input.exploracion || "(vacía)"}`, {
          field: "exploracion"
        })
      );
    }
    if (!TIPOS_ANEXO.includes(tipo)) {
      validations.push(
        validation("tipo", false, `Tipo inválido. Usá: ${TIPOS_ANEXO.join(", ")}.`, { field: "tipo" })
      );
    }
    if (!ESTADOS_ANEXO.includes(estado)) {
      validations.push(
        validation("estado", false, `Estado inválido. Usá: ${ESTADOS_ANEXO.join(", ")}.`, { field: "estado" })
      );
    }

    let fuentes = [];
    if (Array.isArray(input.fuentes)) {
      fuentes = input.fuentes;
    } else if (String(input.fuentes ?? "").trim()) {
      try {
        fuentes = parseYamlValue(input.fuentes, { source: "fuentes" });
      } catch (error) {
        const lineInfo = error.line
          ? ` (línea ${error.line}${error.column ? `, columna ${error.column}` : ""})`
          : "";
        validations.push(
          validation("fuentes-yaml", false, `${error.message}${lineInfo}`, { field: "fuentes" })
        );
      }
    }
    if (!Array.isArray(fuentes)) {
      validations.push(validation("fuentes-forma", false, "Las fuentes deben ser una lista.", { field: "fuentes" }));
      fuentes = [];
    }
    fuentes = fuentes.filter(
      (source) =>
        source &&
        typeof source === "object" &&
        Object.values(source).some((value) => String(value ?? "").trim() !== "")
    );
    if (FUENTES_OBLIGATORIAS.includes(tipo)) {
      const sources = validateAnnexSources(fuentes, tipo);
      validations.push(
        validation("fuentes", sources.ok, sources.message, { field: "fuentes" })
      );
    } else if (fuentes.length > 0) {
      const sources = validateAnnexSources(fuentes, tipo);
      validations.push(
        validation("fuentes", sources.ok, sources.message, { field: "fuentes" })
      );
    }

    const expSlug = exp ? exp.path.split("/").pop().replace(/\.md$/, "") : "";
    if (!expSlug) {
      validations.push(validation("exploracion-path", false, "No se pudo resolver el directorio de la exploración."));
    }
    const expUrl = exp?.url ?? (expSlug ? `/rizoma/${expSlug}/` : "");
    if (expSlug && slug === "index") {
      validations.push(validation("slug-index", false, "El slug no puede ser index.", { field: "slug" }));
    }

    const existingAnexos = ctx.index.entries.filter(
      (entry) => entry.type === "anexo" && entry.path.startsWith(`rizoma/${expSlug}/anexos/`)
    );
    const order = String(input.order ?? "").trim() || nextOrder(existingAnexos);
    const permalink =
      String(input.permalink ?? "").trim() || `/rizoma/${expSlug}/anexos/${slug}/`;
    if (!/^\d{1,3}$/.test(order)) {
      validations.push(validation("order", false, "El orden debe ser numérico.", { field: "order" }));
    }
    if (!permalink.startsWith("/")) {
      validations.push(validation("permalink", false, "El permalink debe empezar con /.", { field: "permalink" }));
    }

    const note = input.notePath ? findEntry(ctx, input.notePath) : null;
    if (input.copyBody && !note) {
      validations.push(
        validation("note", false, "Para usar el cuerpo de la nota falta una nota válida.", {
          field: "notePath"
        })
      );
    }
    if (note?.readOnly) {
      validations.push(validation("note-readonly", false, "La nota de origen es read-only."));
    }

    const path = `rizoma/${expSlug}/anexos/${slug}.md`;
    const exists = existsSync(join(ctx.root, path));
    if (exists && !input.overwrite) {
      validations.push(
        validation("overwrite", false, `Ya existe ${path}. Marcá “Sobrescribir” para reemplazarlo.`, {
          field: "overwrite"
        })
      );
    }

    const body = input.copyBody && note ? note.body : BODY_TEMPLATES[tipo] ?? "";
    const date = today();
    const meta = {
      title,
      order,
      tipo,
      date,
      estado,
      exploracion: expUrl,
      permalink,
      fuentes,
      procedencia: note ? `Promovido desde ${note.path} con el Taller de Rizoma.` : ""
    };
    const content = anexoDoc(meta, body);

    const changes = [];
    const preview = [];
    if (!validations.some((item) => !item.ok)) {
      changes.push({ type: "write", path, content, overwrite: Boolean(input.overwrite) });
      preview.push({ type: "write", path, content });

      if (exp) {
        const expAbs = join(ctx.root, exp.path);
        const expContent = readFileSync(expAbs, "utf8");
        const entry = { url: permalink, title, note: String(input.nota ?? ""), tipo };
        try {
          const expNext = upsertInFrontmatterList(
            expContent,
            "anexos",
            (item) => item && typeof item === "object" && item.url === permalink,
            entry
          );
          changes.push({
            type: "write",
            path: exp.path,
            content: expNext,
            expectedHash: exp.hash
          });
          preview.push({ type: "write", path: exp.path, content: expNext });
        } catch (error) {
          validations.push(
            validation("exploracion-anexos", false, error.message, { field: "exploracion" })
          );
        }
      }

      const indexPath = expSlug ? `rizoma/${expSlug}/anexos/index.md` : null;
      if (indexPath && !existsSync(join(ctx.root, indexPath))) {
        const indexContent = annexIndex(expUrl);
        changes.push({ type: "write", path: indexPath, content: indexContent, overwrite: false });
        preview.push({ type: "write", path: indexPath, content: indexContent });
      }
    }

    return createPlan({
      operation: "publicar-anexo",
      summary: `Publicar anexo: ${path}`,
      changes,
      preview,
      validations,
      warnings: exists ? [`Se sobrescribe el anexo existente: ${path}`] : [],
      message: `taller: publicar anexo ${slug}`,
      origin: input.notePath || path,
      meta: {
        path,
        tipo,
        estado,
        exploracion: expUrl,
        order,
        permalink,
        fuentes
      }
    });
  }
};
