import { existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { isInside } from "./paths.mjs";

const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function isExternal(destino) {
  return EXTERNAL_RE.test(String(destino ?? "").trim());
}

export function cleanDestino(destino) {
  return String(destino ?? "").trim().replace(/[?#].*$/, "");
}

const SITE_PATTERNS = [
  { re: /^\/rizoma\/([^/]+)\/anexos\/([^/]+)\/?$/, to: (m) => `rizoma/${m[1]}/anexos/${m[2]}.md` },
  { re: /^\/rizoma\/([^/]+)\/?$/, to: (m) => `content/collections/_exploraciones/${m[1]}.md` },
  { re: /^\/poemas\/([^/]+)\/?$/, to: (m) => `content/collections/_poems/${m[1]}.md` },
  { re: /^\/codigo\/([^/]+)\/?$/, to: (m) => `content/collections/_codigos/${m[1]}.md` },
  { re: /^\/dispositivos\/([^/]+)\/?$/, to: (m) => `content/collections/_dispositivos/${m[1]}.md` },
  { re: /^\/vestigios\/([^/]+)\/?$/, to: (m) => `content/collections/_vestigios/${m[1]}.md` },
  { re: /^\/imaginario\/([^/]+)\/?$/, to: (m) => `content/collections/_images/${m[1]}.md` },
  {
    re: /^\/melange-reports\/([^/]+)\/?$/,
    to: (m) => `content/collections/_melange_reports/${m[1]}.md`
  },
  { re: /^\/fragmentos\/?$/, to: () => "fragmentos/index.md" },
  { re: /^\/rizoma\/?$/, to: () => "rizoma/index.md" },
  { re: /^\/rizoma\/nodos\/?$/, to: () => "rizoma/nodos.md" },
  { re: /^\/$/, to: () => "index.md" }
];

export function siteUrlToRepoPath(url) {
  const clean = cleanDestino(url);
  for (const pattern of SITE_PATTERNS) {
    const match = clean.match(pattern.re);
    if (match) return pattern.to(match);
  }
  return null;
}

export function resolveDestino(root, sourcePath, destino) {
  const clean = cleanDestino(destino);
  if (!clean) return { kind: "empty" };
  if (isExternal(destino)) return { kind: "external", url: clean };

  if (clean.startsWith("/")) {
    const mapped = siteUrlToRepoPath(clean);
    if (!mapped) return { kind: "unknown-url", url: clean };
    const abs = join(root, mapped);
    return { kind: "internal", path: mapped, url: clean, exists: existsSync(abs) };
  }

  const isRepoRelative = ["docs/", "content/", "rizoma/"].some((prefix) =>
    clean.startsWith(prefix)
  );
  const relativePath = isRepoRelative
    ? normalize(clean).replaceAll("\\", "/")
    : normalize(join(dirname(sourcePath), clean)).replaceAll("\\", "/");
  if (relativePath.startsWith("..")) {
    return { kind: "invalid", path: relativePath };
  }
  const abs = join(root, relativePath);
  if (!isInside(root, abs)) return { kind: "invalid", path: relativePath };
  return { kind: "internal", path: relativePath, url: clean, exists: existsSync(abs) };
}

export function resolveTarget(root, sourcePath, destino, publicByUrl = new Map()) {
  const clean = cleanDestino(destino);
  if (!clean) return { kind: "empty" };
  if (isExternal(destino)) return { kind: "external", url: clean };

  if (clean.startsWith("/")) {
    const known = publicByUrl.get(clean.replace(/\/$/, "") + "/") ?? publicByUrl.get(clean);
    if (known) return { kind: "internal", path: known, url: clean, exists: true };
    const mapped = siteUrlToRepoPath(clean);
    if (mapped) {
      return {
        kind: "internal",
        path: mapped,
        url: clean,
        exists: existsSync(join(root, mapped))
      };
    }
    return { kind: "unknown-url", url: clean };
  }

  return resolveDestino(root, sourcePath, destino);
}

export function linkWarnings(entry, root, publicByUrl) {
  const warnings = [];
  const vinculos = Array.isArray(entry.meta?.vinculos) ? entry.meta.vinculos : [];
  for (const vinculo of vinculos) {
    if (!vinculo || typeof vinculo !== "object") {
      warnings.push({ id: "vinculo-forma", message: "Hay un vínculo con forma inválida." });
      continue;
    }
    const destino = String(vinculo.destino ?? "").trim();
    if (!destino) {
      warnings.push({ id: "vinculo-vacio", message: "Hay un vínculo sin destino." });
      continue;
    }
    const target = resolveTarget(root, entry.path, destino, publicByUrl);
    if (target.kind === "unknown-url" || target.kind === "invalid") {
      warnings.push({
        id: "vinculo-roto",
        message: `Vínculo interno roto: ${destino}`,
        destino
      });
    } else if (target.kind === "internal" && !target.exists) {
      warnings.push({
        id: "vinculo-roto",
        message: `Vínculo interno roto: ${destino}`,
        destino
      });
    }
  }
  return warnings;
}

export function backlinksFor(targetPath, targetUrl, entries, root, publicByUrl) {
  const result = [];
  const targetClean = targetUrl ? targetUrl.replace(/\/$/, "") + "/" : null;
  for (const entry of entries) {
    const vinculos = Array.isArray(entry.meta?.vinculos) ? entry.meta.vinculos : [];
    for (const vinculo of vinculos) {
      if (!vinculo || typeof vinculo !== "object") continue;
      const destino = String(vinculo.destino ?? "").trim();
      if (!destino) continue;
      const target = resolveTarget(root, entry.path, destino, publicByUrl);
      if (target.kind === "external") continue;
      const matchesPath = target.path === targetPath;
      const matchesUrl = targetClean && destino.replace(/\/$/, "") + "/" === targetClean;
      if (matchesPath || matchesUrl) {
        result.push({
          path: entry.path,
          title: entry.title,
          destino,
          motivo: String(vinculo.motivo ?? ""),
          fecha: String(vinculo.fecha ?? "")
        });
        break;
      }
    }
  }
  return result;
}
