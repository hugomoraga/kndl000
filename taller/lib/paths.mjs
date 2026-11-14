import { createHash } from "node:crypto";
import { existsSync, lstatSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

export class PathError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PathError";
    this.status = status;
  }
}

export function isInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function realRoot(root) {
  try {
    return realpathSync(root);
  } catch {
    throw new PathError(`La raíz del repo no existe: ${root}`, 500);
  }
}

function assertNoSymlinkEscape(root, abs, mustExist) {
  const base = realRoot(root);
  let probe = abs;
  while (!existsSync(probe)) {
    const parent = dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  let realProbe;
  try {
    realProbe = realpathSync(probe);
  } catch {
    throw new PathError(`No se pudo resolver la ruta: ${abs}`, 400);
  }
  if (!isInside(base, realProbe)) {
    throw new PathError(`La ruta escapa del repo (symlink): ${abs}`, 403);
  }
  if (mustExist) {
    let info;
    try {
      info = lstatSync(abs);
    } catch {
      throw new PathError(`No existe: ${abs}`, 404);
    }
    if (!info.isFile()) throw new PathError(`No es un archivo: ${abs}`, 400);
    if (info.isSymbolicLink()) {
      const real = realpathSync(abs);
      if (!isInside(base, real)) {
        throw new PathError(`El symlink escapa del repo: ${abs}`, 403);
      }
    }
  }
}

export function resolveRepoPath(root, requested, { mustExist = false } = {}) {
  if (typeof requested !== "string" || requested.trim() === "") {
    throw new PathError("Path vacío.", 400);
  }
  if (requested.includes("\0")) throw new PathError("Path inválido.", 400);
  if (isAbsolute(requested)) {
    throw new PathError(`El path debe ser relativo al repo: ${requested}`, 400);
  }
  const normalized = requested.replaceAll("\\", "/");
  if (normalized.split("/").some((part) => part === "..")) {
    throw new PathError(`Path traversal rechazado: ${requested}`, 403);
  }
  const abs = resolve(root, normalized);
  if (!isInside(resolve(root), abs)) {
    throw new PathError(`La ruta escapa del repo: ${requested}`, 403);
  }
  assertNoSymlinkEscape(root, abs, mustExist);
  return abs;
}

export function toRepoPath(root, abs) {
  return relative(resolve(root), abs).replaceAll(sep, "/");
}

export function fileInfo(abs) {
  try {
    return statSync(abs);
  } catch {
    return null;
  }
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function slugify(value, max = 64) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

export function localDate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function sanitizeFilename(name) {
  const raw = String(name ?? "");
  const base = raw.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  const extRaw = dot > 0 ? base.slice(dot) : "";
  const ext = extRaw
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "")
    .slice(0, 16)
    .toLowerCase();
  let stem = (dot > 0 ? base.slice(0, dot) : base)
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[.\-]+|[.\-]+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
  if (!stem) stem = "archivo";
  return `${stem}${ext}`;
}

export function uniqueFilename(directory, filename) {
  if (!existsSync(resolve(directory, filename))) return filename;
  const dot = filename.lastIndexOf(".");
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : "";
  for (let i = 2; i < 1000; i++) {
    const candidate = `${stem}-${i}${ext}`;
    if (!existsSync(resolve(directory, candidate))) return candidate;
  }
  throw new PathError("No se pudo resolver un nombre de archivo único.", 409);
}

export function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}
