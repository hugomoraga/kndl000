import { existsSync } from "node:fs";
import { join } from "node:path";
import { resolveTarget } from "./links.mjs";
import { countWordInSources, normalizeText } from "./validations.mjs";
import { validation } from "./plan.mjs";

function urlKey(url) {
  if (!url) return null;
  const value = String(url).trim();
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function checkUrl(root, sourcePath, url, publicByUrl, label) {
  const raw = String(url ?? "").trim();
  if (!raw) return `${label}: URL vacía.`;
  if (/^https?:/i.test(raw)) return null;
  const target = resolveTarget(root, sourcePath, raw, publicByUrl);
  if (target.kind === "external") return null;
  if (target.kind === "internal" && target.exists) return null;
  return `${label}: no existe ${raw}.`;
}

function listValue(value) {
  return Array.isArray(value) ? value : [];
}

function checkExploration(root, entry, index, nodeTitles, problems) {
  const sourcePath = entry.path;
  const publicByUrl = index.publicByUrl;
  const nodos = listValue(entry.meta?.nodos);
  if (nodos.length === 0) {
    problems.push(`${sourcePath}: la exploración no declara nodos.`);
  }
  for (const nodo of nodos) {
    const name = normalizeText(typeof nodo === "string" ? nodo : nodo?.title ?? "");
    if (name && !nodeTitles.has(name)) {
      problems.push(`${sourcePath}: el nodo «${nodo}» no existe en _nodos.`);
    }
  }

  for (const item of listValue(entry.meta?.corpus)) {
    const problem = checkUrl(root, sourcePath, item?.url, publicByUrl, "corpus");
    if (problem) problems.push(`${sourcePath}: ${problem}`);
  }
  for (const section of listValue(entry.meta?.corpus_secciones)) {
    for (const piece of listValue(section?.piezas)) {
      const problem = checkUrl(root, sourcePath, piece, publicByUrl, `corpus_secciones/${section?.seccion ?? "?"}`);
      if (problem) problems.push(`${sourcePath}: ${problem}`);
    }
  }
  for (const url of listValue(entry.meta?.relacionadas)) {
    const problem = checkUrl(root, sourcePath, url, publicByUrl, "relacionadas");
    if (problem) problems.push(`${sourcePath}: ${problem}`);
  }
  for (const anexo of listValue(entry.meta?.anexos)) {
    const url = typeof anexo === "object" ? anexo?.url : anexo;
    const problem = checkUrl(root, sourcePath, url, publicByUrl, "anexos");
    if (problem) {
      problems.push(`${sourcePath}: ${problem}`);
      continue;
    }
    const key = urlKey(url);
    const target = index.entries.find((candidate) => urlKey(candidate.url) === key);
    if (!target) {
      problems.push(`${sourcePath}: el anexo ${url} no está indexado.`);
    }
  }
  for (const [indexHito, hito] of listValue(entry.meta?.hitos).entries()) {
    if (!hito || typeof hito !== "object") {
      problems.push(`${sourcePath}: hito #${indexHito + 1} inválido.`);
      continue;
    }
    for (const field of ["date", "title", "text"]) {
      if (String(hito[field] ?? "").trim() === "") {
        problems.push(`${sourcePath}: hito #${indexHito + 1} sin ${field}.`);
      }
    }
  }
}

function checkAnnex(root, entry, index, urlCounts, warnings, problems) {
  const key = urlKey(entry.url);
  const expUrl = String(entry.meta?.exploracion ?? "").trim();
  const target = expUrl ? resolveTarget(root, entry.path, expUrl, index.publicByUrl) : null;
  if (!target || target.kind !== "internal" || !target.exists) {
    problems.push(`${entry.path}: la exploración ${expUrl || "(vacía)"} no existe.`);
    return;
  }
  const exploration = index.entries.find(
    (candidate) => candidate.type === "exploracion" && candidate.path === target.path
  );
  if (!exploration) {
    problems.push(`${entry.path}: ${expUrl} no es una exploración indexada.`);
    return;
  }
  const listed = listValue(exploration.meta?.anexos).some((anexo) => {
    const url = typeof anexo === "object" ? anexo?.url : anexo;
    return urlKey(url) === key;
  });
  if (!listed) {
    warnings.push(`${entry.path}: no figura en anexos de ${exploration.path}.`);
  }
  const indexFile = join(
    root,
    "rizoma",
    exploration.path.split("/").pop().replace(/\.md$/, ""),
    "anexos",
    "index.md"
  );
  if (!existsSync(indexFile)) {
    warnings.push(`${entry.path}: falta rizoma/.../anexos/index.md.`);
  }
}

function checkNode(entry, sources, warnings) {
  const result = countWordInSources(entry.title, sources);
  if (result.count < 2) {
    warnings.push(
      `${entry.path}: «${entry.title}» aparece en ${result.count} cuerpo(s) (un nodo pide al menos dos).`
    );
  }
}

export function runAudit(ctx, paths) {
  const index = ctx.index;
  const selected = [...new Set(paths)];
  const problems = [];
  const warnings = [];
  const nodeTitles = new Set(
    index.entries.filter((entry) => entry.type === "nodo").map((entry) => normalizeText(entry.title))
  );
  const urlCounts = new Map();
  for (const entry of index.entries) {
    const key = urlKey(entry.url);
    if (key) urlCounts.set(key, (urlCounts.get(key) ?? 0) + 1);
  }

  for (const path of selected) {
    const entry = index.entries.find((candidate) => candidate.path === path);
    if (!entry) continue;
    for (const warning of entry.warnings) {
      if (warning.id === "bom") {
        warnings.push(`${entry.path}: ${warning.message}`);
        continue;
      }
      problems.push(`${entry.path}: ${warning.message}`);
    }
    const key = urlKey(entry.url);
    if (key && (urlCounts.get(key) ?? 0) > 1) {
      problems.push(`${entry.path}: permalink duplicado: ${entry.url}.`);
    }
    if (entry.type === "exploracion") {
      checkExploration(ctx.root, entry, index, nodeTitles, problems);
    } else if (entry.type === "anexo") {
      checkAnnex(ctx.root, entry, index, urlCounts, warnings, problems);
    } else if (entry.type === "nodo") {
      checkNode(entry, ctx.sources, warnings);
    }
  }

  const uniqueProblems = [...new Set(problems)];
  const auditValidation = validation(
    "auditoria",
    uniqueProblems.length === 0,
    uniqueProblems.length === 0
      ? `Auditoría OK (${selected.length} path(s)).`
      : `Auditoría: ${uniqueProblems.length} problema(s) en ${selected.length} path(s).`,
    { overridable: true, detail: uniqueProblems }
  );
  return {
    validations: [auditValidation],
    warnings: [...new Set(warnings)]
  };
}
