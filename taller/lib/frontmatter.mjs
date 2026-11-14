import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const YAML = require("../vendor-yaml/dist/index.js");

const { Document, parseDocument, isMap, isSeq } = YAML;

export class FrontmatterError extends Error {
  constructor(message, { line = null, column = null } = {}) {
    super(message);
    this.name = "FrontmatterError";
    this.line = line;
    this.column = column;
    this.status = 422;
  }
}

function detectEol(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function offsetToPosition(text, offset) {
  if (!Number.isFinite(offset)) return { line: null, column: null };
  const before = text.slice(0, offset);
  const lastBreak = before.lastIndexOf("\n");
  return {
    line: before.split("\n").length,
    column: offset - lastBreak
  };
}

function yamlErrorPosition(text, error) {
  const linePos = error.linePos?.[0];
  if (linePos?.line) return { line: linePos.line, column: linePos.col ?? null };
  const offset = Array.isArray(error.pos) ? error.pos[0] : error.pos;
  return offsetToPosition(text, offset);
}

export function splitFrontmatter(content) {
  if (typeof content !== "string") {
    throw new FrontmatterError("El contenido debe ser texto.");
  }
  let bom = "";
  let text = content;
  if (text.charCodeAt(0) === 0xfeff) {
    bom = "\ufeff";
    text = text.slice(1);
  }
  const openingMatch = text.match(/^---[ \t]*(\r?\n)/);
  if (!openingMatch) {
    return {
      bom,
      opening: "",
      raw: null,
      closing: "",
      body: text,
      eol: detectEol(text),
      hasFrontmatter: false
    };
  }

  const opening = openingMatch[0];
  const eol = openingMatch[1];
  const closeRe = /^---[ \t]*(?:\r?\n|$)/gm;
  closeRe.lastIndex = opening.length;
  const close = closeRe.exec(text);
  if (!close) {
    throw new FrontmatterError("El frontmatter no tiene cierre ---.", { line: 1 });
  }

  return {
    bom,
    opening,
    raw: text.slice(opening.length, close.index),
    closing: close[0],
    body: text.slice(close.index + close[0].length),
    eol,
    hasFrontmatter: true
  };
}

export function parseYaml(raw, { source = "frontmatter" } = {}) {
  const doc = parseDocument(raw ?? "", { keepSourceTokens: true, prettyErrors: false });
  const errors = doc.errors ?? [];
  if (errors.length > 0) {
    const first = errors[0];
    const pos = yamlErrorPosition(raw ?? "", first);
    throw new FrontmatterError(`YAML inválido en ${source}: ${first.message}`, {
      line: pos.line,
      column: pos.column
    });
  }
  if (doc.contents && !isMap(doc.contents)) {
    throw new FrontmatterError("El frontmatter debe ser un mapa YAML.", { line: 1 });
  }
  let meta = {};
  if (doc.contents) {
    try {
      meta = doc.toJS({ maxAliasCount: 100 }) ?? {};
    } catch (error) {
      throw new FrontmatterError(`No se pudo leer el frontmatter: ${error.message}`);
    }
    if (meta === null || typeof meta !== "object" || Array.isArray(meta)) {
      throw new FrontmatterError("El frontmatter debe ser un mapa YAML.", { line: 1 });
    }
  }
  return { doc, meta };
}

export function parseFrontmatter(content) {
  const parts = splitFrontmatter(content);
  if (!parts.hasFrontmatter) {
    return { ...parts, meta: {}, doc: null };
  }
  let parsed;
  try {
    parsed = parseYaml(parts.raw);
  } catch (error) {
    if (error instanceof FrontmatterError) {
      const offset = parts.bom ? 1 : 0;
      const line = error.line ? error.line + 1 : null;
      throw new FrontmatterError(error.message, { line, column: error.column });
    }
    throw error;
  }
  return { ...parts, ...parsed };
}

export function parseYamlValue(text, options = {}) {
  const doc = parseDocument(text ?? "", { prettyErrors: false });
  if (doc.errors?.length) {
    const first = doc.errors[0];
    const pos = yamlErrorPosition(text ?? "", first);
    throw new FrontmatterError(`YAML inválido en ${options.source ?? "valor"}: ${first.message}`, {
      line: pos.line,
      column: pos.column
    });
  }
  try {
    return doc.toJS({ maxAliasCount: 100 });
  } catch (error) {
    throw new FrontmatterError(`No se pudo leer el YAML: ${error.message}`);
  }
}

function normalizeDocText(docText, eol) {
  const normalized = String(docText ?? "").replace(/\r?\n/g, eol);
  if (normalized === "") return "";
  return normalized.endsWith(eol) ? normalized : `${normalized}${eol}`;
}

export function serializeFrontmatter(parts, doc) {
  const docText = doc ? normalizeDocText(doc.toString({ lineWidth: 0 }), parts.eol) : "";
  if (!parts.hasFrontmatter) {
    if (!docText) return `${parts.bom}${parts.body}`;
    return `${parts.bom}---${parts.eol}${docText}---${parts.eol}${parts.body}`;
  }
  if (!docText) return `${parts.bom}${parts.opening}${parts.closing}${parts.body}`;
  return `${parts.bom}${parts.opening}${docText}${parts.closing}${parts.body}`;
}

export function replaceBody(content, body) {
  const parts = splitFrontmatter(content);
  if (!parts.hasFrontmatter) return `${parts.bom}${body}`;
  return `${parts.bom}${parts.opening}${parts.raw ?? ""}${parts.closing}${body}`;
}

export function ensureDocument(doc) {
  if (doc && doc.contents) return doc;
  const fresh = new Document({});
  return fresh;
}

export function updateFrontmatter(content, updater, { rawFrontmatter } = {}) {
  const parts = splitFrontmatter(content);
  let raw = parts.raw ?? "";
  if (rawFrontmatter !== undefined && rawFrontmatter !== null) {
    const candidate = String(rawFrontmatter).replace(/^\ufeff/, "");
    if (/^---[ \t]*(?:\r?\n|$)/.test(candidate)) {
      throw new FrontmatterError("La vista YAML no debe incluir los delimitadores ---.", {
        line: 1
      });
    }
    raw = candidate;
  }

  let doc;
  if (parts.hasFrontmatter || raw !== "") {
    const parsed = parseYaml(raw);
    doc = ensureDocument(parsed.doc);
  } else {
    doc = ensureDocument(null);
  }

  if (typeof updater === "function") {
    updater(doc);
  }
  return serializeFrontmatter(parts, doc);
}

export function setFrontmatterFields(content, updates, options = {}) {
  return updateFrontmatter(
    content,
    (doc) => {
      for (const [key, value] of Object.entries(updates ?? {})) {
        if (value === undefined) continue;
        if (value === null) {
          doc.delete(key);
        } else {
          doc.set(key, value);
        }
      }
    },
    options
  );
}

export function appendToFrontmatterList(content, key, value) {
  return updateFrontmatter(content, (doc) => {
    const current = doc.get(key, true);
    if (current === undefined || current === null) {
      doc.set(key, [value]);
      return;
    }
    if (!isSeq(current)) {
      throw new FrontmatterError(`El campo ${key} debe ser una lista.`);
    }
    doc.addIn([key], value);
  });
}

export function removeFromFrontmatterList(content, key, predicate) {
  return updateFrontmatter(content, (doc) => {
    const current = doc.get(key, true);
    if (!isSeq(current)) return;
    const items = current.toJSON();
    for (let index = items.length - 1; index >= 0; index--) {
      if (predicate(items[index])) doc.deleteIn([key, index]);
    }
  });
}

export function upsertInFrontmatterList(content, key, predicate, value) {
  return updateFrontmatter(content, (doc) => {
    const current = doc.get(key, true);
    if (current === undefined || current === null) {
      doc.set(key, [value]);
      return;
    }
    if (!isSeq(current)) {
      throw new FrontmatterError(`El campo ${key} debe ser una lista.`);
    }
    const items = current.toJSON();
    const index = items.findIndex(predicate);
    if (index >= 0) doc.setIn([key, index], value);
    else doc.addIn([key], value);
  });
}

export function getFrontmatterValue(content, key) {
  const parts = parseFrontmatter(content);
  return parts.meta?.[key];
}

export function metaString(meta, key) {
  const value = meta?.[key];
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
