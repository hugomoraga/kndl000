import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { localDate, slugify } from "../lib/paths.mjs";
import { validation } from "../lib/plan.mjs";

export function today() {
  return localDate();
}

export function findEntry(ctx, path) {
  if (!path) return null;
  return ctx.index.entries.find((entry) => entry.path === path) ?? null;
}

export function requireEntry(ctx, path, { writable = false } = {}) {
  const entry = findEntry(ctx, path);
  if (!entry) {
    return {
      entry: null,
      validation: validation("entry", false, `No existe en el banco: ${path || "(sin path)"}`, {
        field: "path"
      })
    };
  }
  if (writable && entry.readOnly) {
    return {
      entry,
      validation: validation("readonly", false, `Es un documento read-only: ${path}`, {
        field: "path"
      })
    };
  }
  if (writable && entry.type === "anexo") {
    return {
      entry,
      validation: validation("anexo-write", false, "Los anexos se editan con su promoción, no desde el taller.", {
        field: "path"
      })
    };
  }
  return { entry, validation: null };
}

export function readNoteBody(ctx, path) {
  const entry = findEntry(ctx, path);
  if (!entry) return null;
  return entry.body;
}

export function ensureSlug(value, fallback) {
  const slug = slugify(value ?? fallback);
  if (!slug) return null;
  return slug;
}

export function nextOrder(entries) {
  const orders = entries
    .map((entry) => Number(String(entry.meta?.order ?? "").replace(/[^\d]/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  const next = (orders.length ? Math.max(...orders) : 0) + 1;
  return String(next).padStart(2, "0");
}

export function nextNodeOrder(ctx) {
  return nextOrder(ctx.index.entries.filter((entry) => entry.type === "nodo"));
}

export function publicExplorations(ctx) {
  return ctx.index.entries.filter((entry) => entry.type === "exploracion" && !entry.readError);
}

export function findExploration(ctx, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const clean = raw.replace(/\/$/, "");
  const slug = basename(clean);
  return (
    publicExplorations(ctx).find(
      (entry) =>
        entry.path === raw ||
        entry.path === `${raw}.md` ||
        entry.url === raw ||
        entry.url?.replace(/\/$/, "") === clean ||
        basename(entry.path, ".md") === slug
    ) ?? null
  );
}

export function attachmentPathFor(ctx, notePath, filename) {
  const slug = basename(notePath, ".md");
  return `docs/rizoma/adjuntos/${slug}/${filename}`;
}

export function readText(root, path) {
  return readFileSync(join(root, path), "utf8");
}

export function fileExists(root, path) {
  return existsSync(join(root, path));
}

export function rowSummary(paths) {
  return paths.length === 1 ? paths[0] : `${paths.length} archivos`;
}

export function quote(value) {
  return JSON.stringify(String(value ?? ""));
}
