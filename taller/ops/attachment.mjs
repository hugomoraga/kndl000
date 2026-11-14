import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { appendToFrontmatterList } from "../lib/frontmatter.mjs";
import { diffForPaths } from "../lib/git.mjs";
import { sanitizeFilename, sha256, uniqueFilename } from "../lib/paths.mjs";
import { createPlan, validation } from "../lib/plan.mjs";
import { findEntry } from "./common.mjs";

export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;

const pending = new Map();
const MAX_AGE = 15 * 60 * 1000;

function inferType(filename) {
  const ext = extname(filename).toLowerCase().replace(".", "");
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"].includes(ext)) return "imagen";
  if (["txt", "md", "csv", "json", "yml", "yaml"].includes(ext)) return "texto";
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) return "audio";
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return "video";
  return "otro";
}

function cleanup() {
  const now = Date.now();
  for (const [token, item] of pending) {
    if (now - item.createdAt > MAX_AGE) pending.delete(token);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function planAttachment(ctx, input) {
  cleanup();
  const source = findEntry(ctx, input.note);
  const rawName = String(input.filename ?? "").trim();
  const size = Number(input.size ?? 0);
  const validations = [];

  if (!source) {
    validations.push(validation("note", false, `No existe la nota: ${input.note || "(vacía)"}`, { field: "note" }));
  } else if (source.readOnly) {
    validations.push(validation("readonly", false, "La nota es read-only."));
  }
  if (!rawName) {
    validations.push(validation("filename", false, "Falta el nombre del archivo.", { field: "filename" }));
  }
  if (!Number.isFinite(size) || size <= 0) {
    validations.push(validation("size", false, "El archivo está vacío.", { field: "filename" }));
  }
  if (size > MAX_ATTACHMENT_SIZE) {
    validations.push(
      validation("size", false, `El archivo supera el límite de ${formatSize(MAX_ATTACHMENT_SIZE)}.`, {
        field: "filename"
      })
    );
  }

  const filename = sanitizeFilename(rawName);
  const noteSlug = source ? basename(source.path, ".md") : "sin-nota";
  const directory = `docs/rizoma/adjuntos/${noteSlug}`;
  const absDirectory = join(ctx.root, directory);
  const unique = existsSync(absDirectory) ? uniqueFilename(absDirectory, filename) : filename;
  const archivo = `${directory}/${unique}`;
  const adjuntos = Array.isArray(source?.meta?.adjuntos) ? source.meta.adjuntos : [];
  if (adjuntos.some((adjunto) => String(adjunto?.archivo ?? "") === archivo)) {
    validations.push(validation("duplicado", false, `Ya existe el adjunto: ${archivo}`));
  }

  let content = null;
  if (source) {
    const current = readFileSync(join(ctx.root, source.path), "utf8");
    content = appendToFrontmatterList(current, "adjuntos", {
      archivo,
      titulo: String(input.title ?? "").trim() || unique,
      tipo: String(input.tipo ?? "").trim() || inferType(unique),
      nota: String(input.nota ?? "").trim()
    });
  }

  const token = randomUUID();
  pending.set(token, {
    token,
    root: ctx.root,
    note: source?.path ?? null,
    expectedHash: source?.hash ?? null,
    archivo,
    absArchivo: join(ctx.root, archivo),
    content,
    size,
    filename: unique,
    createdAt: Date.now()
  });

  const noValid = validations.some((item) => !item.ok);
  const plan = createPlan({
    operation: "adjuntar",
    summary: `Adjuntar ${unique} (${formatSize(size)}) a ${source?.path ?? input.note}`,
    changes: [],
    preview: noValid || !source ? [] : [{ type: "write", path: source.path, content }],
    validations,
    message: `taller: adjuntar ${archivo}`,
    origin: source?.path ?? input.note,
    meta: {
      token,
      archivo,
      filename: unique,
      size,
      directory,
      upload: true
    }
  });
  return plan;
}

export async function applyAttachment(ctx, token, buffer) {
  cleanup();
  const item = pending.get(token);
  if (!item || item.root !== ctx.root) {
    const error = new Error("El plan de adjunto expiró. Volvé a prepararlo.");
    error.status = 409;
    throw error;
  }
  if (buffer.length > MAX_ATTACHMENT_SIZE) {
    const error = new Error(`El archivo supera el límite de ${formatSize(MAX_ATTACHMENT_SIZE)}.`);
    error.status = 413;
    throw error;
  }
  if (buffer.length === 0) {
    const error = new Error("El archivo está vacío.");
    error.status = 422;
    throw error;
  }
  if (!item.note || !item.content) {
    const error = new Error("El plan de adjunto no tiene una nota válida.");
    error.status = 422;
    throw error;
  }

  const noteAbs = join(ctx.root, item.note);
  if (item.expectedHash) {
    const currentHash = sha256(readFileSync(noteAbs, "utf8"));
    if (currentHash !== item.expectedHash) {
      pending.delete(token);
      const error = new Error("La nota cambió en disco desde el plan de adjunto. Recargala.");
      error.status = 409;
      throw error;
    }
  }

  mkdirSync(dirname(item.absArchivo), { recursive: true });
  try {
    writeFileSync(item.absArchivo, buffer, { flag: "wx" });
  } catch (cause) {
    pending.delete(token);
    const error = new Error(`No se pudo escribir el adjunto: ${cause.message}`);
    error.status = 409;
    throw error;
  }

  try {
    writeFileSync(noteAbs, item.content, "utf8");
  } catch (cause) {
    try {
      unlinkSync(item.absArchivo);
    } catch {
      // Si tampoco se puede borrar, el error original sigue siendo el importante.
    }
    pending.delete(token);
    const error = new Error(`No se pudo actualizar el frontmatter: ${cause.message}`);
    error.status = 500;
    throw error;
  }

  pending.delete(token);
  return {
    paths: [item.archivo, item.note],
    output: `Adjunto guardado: ${item.archivo} (${formatSize(buffer.length)})`,
    diff: await diffForPaths(ctx.root, [item.archivo, item.note])
  };
}

export function attachmentContentType(path) {
  const ext = extname(path).toLowerCase();
  const types = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".json": "application/json",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm"
  };
  return types[ext] ?? "application/octet-stream";
}

export function attachmentDisposition(path) {
  const ext = extname(path).toLowerCase();
  const inline = new Set([".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".txt", ".md", ".csv", ".json"]);
  const name = basename(path).replace(/["\\]/g, "_");
  return `${inline.has(ext) ? "inline" : "attachment"}; filename="${name}"`;
}
