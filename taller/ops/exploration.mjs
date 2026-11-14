import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { setFrontmatterFields } from "../lib/frontmatter.mjs";
import { run } from "../lib/git.mjs";
import { validation } from "../lib/plan.mjs";

export function parseScriptOutput(root, stdout) {
  const files = new Map();
  let current = null;
  let buffer = [];
  const flush = () => {
    if (!current) return;
    const content = buffer.join("\n").replace(/\n$/, "");
    files.set(current, content);
    current = null;
    buffer = [];
  };
  for (const line of stdout.split("\n")) {
    const match = line.match(/^# (\/.+)$/);
    if (match) {
      flush();
      current = relative(root, match[1]).replaceAll("\\", "/");
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  return files;
}

export async function dryRunExploration(ctx, { title, question, slug }) {
  const result = await run(
    "node",
    [
      "scripts/nueva-exploracion.mjs",
      "--title",
      title,
      "--question",
      question,
      "--slug",
      slug,
      "--dry-run"
    ],
    { cwd: ctx.root, timeout: 30000 }
  );
  return {
    ok: result.ok,
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
    files: result.ok ? parseScriptOutput(ctx.root, result.stdout) : new Map()
  };
}

export function explorationPath(slug) {
  return `content/collections/_exploraciones/${slug}.md`;
}

export function explorationValidations(ctx, { title, question, slug, files = null }) {
  const validations = [];
  if (!String(title ?? "").trim()) {
    validations.push(validation("title", false, "Falta el título.", { field: "title" }));
  }
  if (!String(question ?? "").trim()) {
    validations.push(validation("question", false, "Falta la pregunta.", { field: "question" }));
  }
  if (!slug) {
    validations.push(validation("slug", false, "No se pudo derivar un slug.", { field: "slug" }));
  }
  if (slug && existsSync(join(ctx.root, explorationPath(slug)))) {
    validations.push(
      validation("exists", false, `Ya existe la exploración: ${slug}.`, { field: "slug" })
    );
  }
  if (files) {
    const target = explorationPath(slug);
    if (!files.has(target)) {
      validations.push(
        validation("scaffold", false, "El scaffold no anunció el archivo de exploración.")
      );
    }
  }
  return validations;
}

export function scaffoldChanges({
  title,
  question,
  slug,
  copyBody = "",
  summary = "",
  nodos = null,
  status = "",
  expectedPaths = null
}) {
  const exec = {
    type: "exec",
    command: "node",
    args: [
      "scripts/nueva-exploracion.mjs",
      "--title",
      title,
      "--question",
      question,
      "--slug",
      slug
    ],
    expectedPaths: expectedPaths ?? [explorationPath(slug)]
  };
  const changes = [exec];
  if (copyBody.trim()) {
    changes.push({ type: "append", path: explorationPath(slug), text: copyBody });
  }
  if (summary || nodos || status) {
    const updates = {};
    if (summary) updates.summary = summary;
    if (nodos) updates.nodos = nodos;
    if (status) updates.status = status;
    changes.push({ type: "frontmatter", path: explorationPath(slug), updates });
  }
  return changes;
}

export function predictedExploration(files, slug, { copyBody = "", summary = "", nodos = null, status = "" } = {}) {
  const target = explorationPath(slug);
  let content = files.get(target) ?? "";
  if (copyBody.trim()) {
    const separator = content.endsWith("\n") ? "" : "\n";
    content = `${content}${separator}${copyBody}`;
  }
  if (summary || nodos || status) {
    const updates = {};
    if (summary) updates.summary = summary;
    if (nodos) updates.nodos = nodos;
    if (status) updates.status = status;
    try {
      content = setFrontmatterFields(content, updates);
    } catch {
      // La validación del plan mostrará el error de YAML.
    }
  }
  return content;
}
