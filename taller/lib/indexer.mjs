import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { parseFrontmatter, metaString } from "./frontmatter.mjs";
import { sha256 } from "./paths.mjs";
import { backlinksFor, linkWarnings, resolveTarget } from "./links.mjs";

const IGNORED_DIRS = new Set([
  ".git",
  ".jekyll-cache",
  "_site",
  "node_modules",
  "vendor",
  "taller",
  ".bundle"
]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

export function globToRegExp(pattern) {
  const normalized = String(pattern).replaceAll("\\", "/").replace(/^\.\//, "");
  let re = "";
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char === "*") {
      if (normalized[i + 1] === "*") {
        i += 1;
        if (normalized[i + 1] === "/") {
          i += 1;
          re += "(?:.*/)?";
        } else {
          re += ".*";
        }
      } else {
        re += "[^/]*";
      }
    } else if (char === "?") {
      re += "[^/]";
    } else {
      re += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${re}$`);
}

export function globBase(pattern) {
  const normalized = String(pattern).replaceAll("\\", "/").replace(/^\.\//, "");
  const wildcard = normalized.search(/[*?]/);
  if (wildcard === -1) return dirname(normalized);
  const prefix = normalized.slice(0, wildcard);
  const slash = prefix.lastIndexOf("/");
  return slash === -1 ? "." : prefix.slice(0, slash);
}

function collectForType(root, type) {
  const files = new Set();
  const globs = Array.isArray(type.globs) ? type.globs : [];
  const excludes = (Array.isArray(type.exclude) ? type.exclude : []).map(globToRegExp);
  for (const glob of globs) {
    const matcher = globToRegExp(glob);
    const base = join(root, globBase(glob));
    const candidates = glob.includes("*") || glob.includes("?") ? walk(base) : [join(root, glob)];
    for (const abs of candidates) {
      const rel = relative(root, abs).replaceAll("\\", "/");
      if (!matcher.test(rel)) continue;
      if (excludes.some((exclude) => exclude.test(rel))) continue;
      if (extname(rel) !== ".md") continue;
      files.add(rel);
    }
  }
  return [...files];
}

function decodeFile(abs) {
  const buffer = readFileSync(abs);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buffer);
  } catch {
    return { error: "El archivo no es UTF-8 válido.", binary: true };
  }
  if (text.includes("\0")) return { error: "El archivo parece binario.", binary: true };
  const bom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  return { text, bom };
}

export function computeUrl(type, meta, path) {
  if (meta?.permalink) return String(meta.permalink);
  if (!type.urlPattern) return null;
  const slug = basename(path, ".md");
  const expMatch = path.match(/^rizoma\/([^/]+)\/anexos\//);
  return type.urlPattern.replaceAll(":slug", slug).replaceAll(":exp", expMatch?.[1] ?? "");
}

function normalizeUrl(url) {
  if (!url) return null;
  const value = String(url).trim();
  if (!value.startsWith("/")) return value;
  return value.endsWith("/") ? value : `${value}/`;
}

function requiredWarnings(type, meta) {
  const warnings = [];
  for (const key of type.required ?? []) {
    const value = meta?.[key];
    if (value === undefined || value === null || String(value).trim() === "") {
      warnings.push({ id: "campo-obligatorio", message: `Falta el campo obligatorio: ${key}`, field: key });
    }
  }
  return warnings;
}

export function buildIndex(root, registry) {
  const entries = [];
  const seen = new Set();
  const byType = {};
  const byEstado = {};
  const warnings = [];

  for (const type of registry.types) {
    const files = collectForType(root, type);
    files.sort();
    for (const path of files) {
      if (seen.has(path)) continue;
      seen.add(path);
      const abs = join(root, path);
      let info;
      try {
        info = statSync(abs);
      } catch {
        continue;
      }
      if (!info.isFile()) continue;

      const decoded = decodeFile(abs);
      const entry = {
        path,
        type: type.id,
        typeLabel: type.label,
        title: basename(path, ".md"),
        estado: type.public ? "publicado" : "banco",
        date: "",
        public: Boolean(type.public),
        readOnly: Boolean(type.readOnly),
        url: null,
        meta: {},
        body: "",
        rawFrontmatter: "",
        hash: "",
        warnings: [],
        binary: Boolean(decoded.binary),
        readError: decoded.error ?? null
      };

      if (decoded.error) {
        entry.warnings.push({ id: "lectura", message: decoded.error });
        entries.push(entry);
        continue;
      }

      entry.hash = sha256(decoded.text);
      if (decoded.bom) {
        entry.warnings.push({
          id: "bom",
          message: "El archivo tiene BOM; el taller lo conserva al guardar."
        });
      }

      try {
        const parsed = parseFrontmatter(decoded.text);
        entry.meta = parsed.meta;
        entry.body = parsed.body;
        entry.rawFrontmatter = parsed.raw ?? "";
        entry.title = String(parsed.meta.title ?? parsed.meta.name ?? entry.title);
        entry.estado = String(parsed.meta.estado ?? parsed.meta.status ?? entry.estado);
        entry.date = metaString(parsed.meta, "date") || metaString(parsed.meta, "updated");
        entry.url = computeUrl(type, parsed.meta, path);
        entry.warnings.push(...requiredWarnings(type, parsed.meta));
        if (typeof type.validate === "function") {
          const custom = type.validate(entry, { root });
          const list = Array.isArray(custom) ? custom : custom ? [custom] : [];
          for (const item of list) {
            if (!item || item.ok !== false) continue;
            entry.warnings.push({
              id: item.id ?? "validacion",
              message: item.message ?? "Validación fallida.",
              field: item.field ?? null
            });
          }
        }
      } catch (error) {
        entry.readError = error.message;
        entry.warnings.push({
          id: "frontmatter",
          message: error.message,
          line: error.line ?? null,
          column: error.column ?? null
        });
      }

      entries.push(entry);
      byType[type.id] = (byType[type.id] ?? 0) + 1;
      byEstado[entry.estado] = (byEstado[entry.estado] ?? 0) + 1;
    }
  }

  const publicByUrl = new Map();
  for (const entry of entries) {
    const url = normalizeUrl(entry.url);
    if (url) publicByUrl.set(url, entry.path);
  }

  for (const entry of entries) {
    if (entry.readError) continue;
    entry.warnings.push(...linkWarnings(entry, root, publicByUrl));
    const attachments = Array.isArray(entry.meta?.adjuntos) ? entry.meta.adjuntos : [];
    for (const adjunto of attachments) {
      const archivo = typeof adjunto === "object" ? adjunto?.archivo : null;
      if (!archivo) {
        entry.warnings.push({ id: "adjunto-forma", message: "Hay un adjunto sin archivo." });
        continue;
      }
      if (!String(archivo).startsWith("docs/rizoma/adjuntos/")) {
        entry.warnings.push({
          id: "adjunto-fuera",
          message: `Adjunto fuera de docs/rizoma/adjuntos/: ${archivo}`
        });
      } else if (!existsSync(join(root, String(archivo)))) {
        entry.warnings.push({
          id: "adjunto-faltante",
          message: `Falta el archivo adjunto: ${archivo}`
        });
      }
    }
    warnings.push(
      ...entry.warnings.map((warning) => ({
        ...warning,
        path: entry.path,
        title: entry.title
      }))
    );
  }

  return {
    entries,
    counts: {
      total: entries.length,
      byType,
      byEstado
    },
    warnings,
    publicByUrl
  };
}

const SOURCE_DIRS = [
  { dir: "content/collections/_exploraciones", type: "exploracion" },
  { dir: "content/collections/_poems", type: "poema" },
  { dir: "content/collections/_fragmentos", type: "fragmento" },
  { dir: "content/collections/_codigos", type: "codigo" },
  { dir: "content/collections/_dispositivos", type: "dispositivo" },
  { dir: "rizoma", type: "anexo", onlyAnexos: true }
];

export function loadSources(root) {
  const sources = [];
  const seen = new Set();
  for (const source of SOURCE_DIRS) {
    const base = join(root, source.dir);
    const files = walk(base);
    for (const abs of files) {
      if (!abs.endsWith(".md")) continue;
      const rel = relative(root, abs).replaceAll("\\", "/");
      if (source.onlyAnexos && !/\/anexos\/[^/]+\.md$/.test(rel)) continue;
      if (rel.endsWith("/index.md")) continue;
      if (seen.has(rel)) continue;
      seen.add(rel);
      let text;
      try {
        const decoded = decodeFile(abs);
        if (decoded.error) continue;
        text = decoded.text;
      } catch {
        continue;
      }
      try {
        const parsed = parseFrontmatter(text);
        sources.push({ path: rel, type: source.type, body: parsed.body });
      } catch {
        sources.push({ path: rel, type: source.type, body: text });
      }
    }
  }
  return sources;
}

export function readItem(root, index, path) {
  const entry = index.entries.find((candidate) => candidate.path === path);
  if (!entry) return null;
  const backlinks = backlinksFor(path, entry.url, index.entries, root, index.publicByUrl);
  const links = (Array.isArray(entry.meta?.vinculos) ? entry.meta.vinculos : [])
    .filter((vinculo) => vinculo && typeof vinculo === "object")
    .map((vinculo) => {
      const destino = String(vinculo.destino ?? "");
      const target = resolveTarget(root, path, destino, index.publicByUrl);
      const targetEntry = target.path
        ? index.entries.find((candidate) => candidate.path === target.path)
        : null;
      return {
        destino,
        motivo: String(vinculo.motivo ?? ""),
        fecha: String(vinculo.fecha ?? ""),
        external: target.kind === "external",
        missing: target.kind === "internal" ? !target.exists : target.kind !== "external",
        targetPath: target.path ?? null,
        targetTitle: targetEntry?.title ?? null,
        targetType: targetEntry?.typeLabel ?? null
      };
    });
  const attachments = (Array.isArray(entry.meta?.adjuntos) ? entry.meta.adjuntos : [])
    .filter((adjunto) => adjunto && typeof adjunto === "object")
    .map((adjunto) => {
      const archivo = String(adjunto.archivo ?? "");
      const abs = join(root, archivo);
      let size = null;
      try {
        size = statSync(abs).size;
      } catch {
        size = null;
      }
      return {
        archivo,
        titulo: String(adjunto.titulo ?? basename(archivo)),
        tipo: String(adjunto.tipo ?? ""),
        nota: String(adjunto.nota ?? ""),
        exists: size !== null,
        size,
        url: `/api/attachment?path=${encodeURIComponent(archivo)}`
      };
    });
  return { ...entry, backlinks, links, attachments };
}

export function serializeEntry(entry) {
  return {
    path: entry.path,
    type: entry.type,
    typeLabel: entry.typeLabel,
    title: entry.title,
    estado: entry.estado,
    date: entry.date,
    public: entry.public,
    readOnly: entry.readOnly,
    url: entry.url,
    warnings: entry.warnings,
    attachmentCount: Array.isArray(entry.meta?.adjuntos) ? entry.meta.adjuntos.length : 0,
    binary: entry.binary,
    readError: entry.readError
  };
}

export function serializeIndex(index) {
  return {
    entries: index.entries.map(serializeEntry),
    counts: index.counts,
    warnings: index.warnings
  };
}
