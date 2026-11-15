import { existsSync } from "node:fs";
import { join } from "node:path";
import { countSections, ESTADOS_ANEXO, FUENTES_OBLIGATORIAS, TIPOS_ANEXO, validateAnnexSources } from "./lib/validations.mjs";
import { siteUrlToRepoPath } from "./lib/links.mjs";

import guardarNota from "./ops/guardar-nota.mjs";
import descartar from "./ops/descartar.mjs";
import borrarNota from "./ops/borrar-nota.mjs";
import nuevaNota from "./ops/nueva-nota.mjs";
import nuevaExploracion from "./ops/nueva-exploracion.mjs";
import publicarExploracion from "./ops/publicar-exploracion.mjs";
import publicarNodo from "./ops/publicar-nodo.mjs";
import publicarAnexo from "./ops/publicar-anexo.mjs";
import publicarHito from "./ops/publicar-hito.mjs";
import editarCorpus from "./ops/editar-corpus.mjs";
import vincular from "./ops/vincular.mjs";
import desvincular from "./ops/desvincular.mjs";
import desvincularAdjunto from "./ops/desvincular-adjunto.mjs";
import borrarAdjunto from "./ops/borrar-adjunto.mjs";
import commit from "./ops/commit.mjs";
import push from "./ops/push.mjs";

const DATE_FIELD = { name: "date", label: "Fecha", type: "text" };

function explorationValidate(entry) {
  const sections = countSections(entry.body);
  if (sections === 0) {
    return {
      ok: false,
      id: "secciones",
      message: "La exploración no tiene secciones (§).",
      field: "body"
    };
  }
  return null;
}

function anexoValidate(entry, { root }) {
  const problems = [];
  if (!TIPOS_ANEXO.includes(String(entry.meta?.tipo ?? ""))) {
    problems.push({
      ok: false,
      id: "tipo",
      message: `Tipo de anexo inválido: ${entry.meta?.tipo ?? "(vacío)"}.`,
      field: "tipo"
    });
  }
  if (!ESTADOS_ANEXO.includes(String(entry.meta?.estado ?? ""))) {
    problems.push({
      ok: false,
      id: "estado",
      message: `Estado de anexo inválido: ${entry.meta?.estado ?? "(vacío)"}.`,
      field: "estado"
    });
  }
  const mapped = entry.meta?.exploracion
    ? siteUrlToRepoPath(String(entry.meta.exploracion))
    : null;
  if (entry.meta?.exploracion && (!mapped || !existsSync(join(root, mapped)))) {
    problems.push({
      ok: false,
      id: "exploracion",
      message: `La exploración del anexo no existe: ${entry.meta.exploracion}.`,
      field: "exploracion"
    });
  }
  if (FUENTES_OBLIGATORIAS.includes(String(entry.meta?.tipo ?? ""))) {
    const sources = validateAnnexSources(entry.meta?.fuentes, entry.meta?.tipo);
    if (!sources.ok) {
      problems.push({
        ok: false,
        id: "fuentes",
        message: sources.message,
        field: "fuentes"
      });
    }
  }
  return problems;
}

const NOTE_FIELDS = [
  { name: "title", label: "Título", type: "text", required: true },
  DATE_FIELD,
  { name: "estado", label: "Estado", type: "text" },
  { name: "pregunta", label: "Pregunta", type: "textarea" }
];

const EXPLORATION_FIELDS = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "question", label: "Pregunta", type: "textarea", required: true },
  { name: "summary", label: "Resumen", type: "textarea" },
  { name: "status", label: "Estado", type: "select", options: ["abierta", "pausa", "cerrada"] },
  DATE_FIELD
];

const ANNEX_FIELDS = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "tipo", label: "Tipo", type: "select", options: TIPOS_ANEXO },
  { name: "estado", label: "Estado", type: "select", options: ESTADOS_ANEXO },
  DATE_FIELD,
  { name: "order", label: "Orden", type: "text" },
  { name: "exploracion", label: "Exploración", type: "text" },
  { name: "permalink", label: "Permalink", type: "text" }
];

export default {
  types: [
    {
      id: "exploracion",
      label: "Exploración",
      globs: ["content/collections/_exploraciones/*.md"],
      public: true,
      urlPattern: "/rizoma/:slug/",
      required: ["title", "question", "summary", "status", "date"],
      fields: EXPLORATION_FIELDS,
      validate: explorationValidate
    },
    {
      id: "nodo",
      label: "Nodo",
      globs: ["content/collections/_nodos/*.md"],
      public: true,
      required: ["title", "order", "definition"],
      fields: [
        { name: "title", label: "Título", type: "text", required: true },
        { name: "order", label: "Orden", type: "text" },
        { name: "definition", label: "Definición", type: "textarea" }
      ]
    },
    {
      id: "anexo",
      label: "Anexo",
      globs: ["rizoma/**/anexos/*.md"],
      exclude: ["rizoma/**/anexos/index.md"],
      public: true,
      urlPattern: "/rizoma/:exp/anexos/:slug/",
      required: ["title", "tipo", "estado", "exploracion", "order", "permalink"],
      fields: ANNEX_FIELDS,
      validate: anexoValidate
    },
    {
      id: "adr",
      label: "ADR",
      globs: ["docs/rizoma/adr/*.md"],
      readOnly: true,
      required: ["title", "date", "estado"],
      fields: [
        { name: "title", label: "Título", type: "text" },
        DATE_FIELD,
        { name: "estado", label: "Estado", type: "text" }
      ]
    },
    {
      id: "documento",
      label: "Documento",
      globs: [
        "docs/rizoma/PUNTO-DE-ENTRADA.md",
        "docs/rizoma/protocolo-cartografia.md",
        "docs/rizoma/taxonomia-anexos.md"
      ],
      readOnly: true,
      required: ["title", "date"],
      fields: [
        { name: "title", label: "Título", type: "text" },
        DATE_FIELD,
        { name: "estado", label: "Estado", type: "text" }
      ]
    },
    {
      id: "banco",
      label: "Nota de banco",
      globs: ["docs/rizoma/banco/*.md"],
      required: ["title", "date", "estado"],
      fields: NOTE_FIELDS
    },
    {
      id: "ciclo",
      label: "Ciclo",
      globs: ["docs/rizoma/ciclos/*.md"],
      required: ["title", "date", "exploracion"],
      fields: [
        ...NOTE_FIELDS,
        { name: "exploracion", label: "Exploración", type: "text" }
      ]
    },
    {
      id: "nota",
      label: "Nota",
      globs: ["docs/rizoma/*.md"],
      required: ["title", "date"],
      fields: NOTE_FIELDS
    }
  ],
  operations: [
    nuevaNota,
    guardarNota,
    descartar,
    borrarNota,
    nuevaExploracion,
    publicarExploracion,
    publicarNodo,
    publicarAnexo,
    publicarHito,
    editarCorpus,
    vincular,
    desvincular,
    desvincularAdjunto,
    borrarAdjunto,
    commit,
    push
  ]
};
