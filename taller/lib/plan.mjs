import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { diffForPaths, restorePath, run } from "./git.mjs";
import { setFrontmatterFields } from "./frontmatter.mjs";
import { resolveRepoPath, sha256 } from "./paths.mjs";

export class PlanError extends Error {
  constructor(message, status = 422, detail = null) {
    super(message);
    this.name = "PlanError";
    this.status = status;
    this.detail = detail;
  }
}

export function validation(id, ok, message, options = {}) {
  return {
    id,
    ok: Boolean(ok),
    message,
    overridable: Boolean(options.overridable),
    field: options.field ?? null,
    detail: options.detail ?? null
  };
}

export function createPlan({
  operation,
  summary = "",
  changes = [],
  preview = null,
  validations = [],
  warnings = [],
  message = "",
  origin = "",
  meta = null
}) {
  return {
    operation,
    summary,
    changes,
    preview,
    validations,
    warnings,
    message,
    origin,
    meta,
    generatedAt: new Date().toISOString()
  };
}

export function planFingerprint(plan) {
  const meta = { ...(plan.meta ?? {}) };
  delete meta.checks;
  delete meta.repo;
  const validations = (plan.validations ?? []).map((item) => ({
    id: item.id,
    ok: item.ok,
    message: item.message,
    overridable: item.overridable,
    field: item.field
  }));
  return sha256(
    JSON.stringify({
      operation: plan.operation,
      summary: plan.summary,
      message: plan.message,
      origin: plan.origin,
      changes: plan.changes,
      preview: plan.preview,
      validations,
      meta
    })
  );
}

export function planPaths(plan) {
  const paths = new Set();
  for (const change of plan.changes ?? []) {
    if (change.path) paths.add(change.path);
  }
  for (const change of plan.preview ?? []) {
    if (change.path) paths.add(change.path);
  }
  return [...paths];
}

export function checkPlan(plan, { overrideReason } = {}) {
  const failed = (plan.validations ?? []).filter((item) => !item.ok);
  const blocking = failed.filter((item) => !item.overridable);
  if (blocking.length > 0) {
    throw new PlanError(
      `El plan tiene validaciones bloqueantes: ${blocking.map((item) => item.message).join(" · ")}`,
      422,
      { validations: plan.validations }
    );
  }
  if (failed.length > 0 && !String(overrideReason ?? "").trim()) {
    throw new PlanError(
      "Hay validaciones con override pendiente. Escribí un motivo para continuar.",
      422,
      { validations: plan.validations }
    );
  }
}

export function serializePlan(plan) {
  return {
    operation: plan.operation,
    summary: plan.summary,
    message: plan.message,
    origin: plan.origin,
    meta: plan.meta,
    fingerprint: planFingerprint(plan),
    validations: plan.validations,
    warnings: plan.warnings,
    paths: planPaths(plan),
    changes: (plan.changes ?? []).map((change) => ({
      type: change.type,
      path: change.path ?? null,
      command: change.command ?? null,
      args: change.args ?? null
    })),
    diff: plan.diff ?? "",
    checks: plan.checks ?? null
  };
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function tempFile(directory, relativePath, content) {
  const path = join(directory, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return relativePath;
}

export async function previewChanges(root, changes) {
  const preview = (changes ?? []).filter(
    (change) => change.type === "write" || change.type === "delete"
  );
  if (preview.length === 0) return "";
  const dir = mkdtempSync(join(tmpdir(), "taller-diff-"));
  const chunks = [];
  try {
    for (let index = 0; index < preview.length; index++) {
      const change = preview[index];
      const abs = join(root, change.path);
      const oldContent = safeRead(abs);
      const newContent = change.type === "delete" ? "" : String(change.content ?? "");
      if (oldContent === newContent) continue;
      const oldPath =
        oldContent === "" ? "/dev/null" : tempFile(dir, `a/${change.path}`, oldContent);
      const newPath =
        newContent === "" ? "/dev/null" : tempFile(dir, `b/${change.path}`, newContent);
      if (oldContent === "" && change.type === "delete") continue;
      if (newContent === "" && change.type === "write" && oldContent === "") continue;
      const result = await run(
        "git",
        ["diff", "--no-color", "--no-index", "--no-prefix", oldPath, newPath],
        { cwd: dir }
      );
      if (result.stdout) chunks.push(result.stdout.trimEnd());
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return chunks.length ? `${chunks.join("\n")}\n` : "";
}

function atomicWrite(abs, content) {
  mkdirSync(dirname(abs), { recursive: true });
  const temp = join(
    dirname(abs),
    `.${basename(abs)}.taller-${process.pid}-${Math.random().toString(36).slice(2)}`
  );
  writeFileSync(temp, content, "utf8");
  renameSync(temp, abs);
}

function assertExpectedHash(abs, expectedHash, label) {
  if (!expectedHash) return;
  if (!existsSync(abs)) {
    throw new PlanError(`El archivo desapareció: ${label}`, 409);
  }
  const current = sha256(readFileSync(abs, "utf8"));
  if (current !== expectedHash) {
    throw new PlanError(
      `Conflicto: ${label} cambió en disco desde que se leyó. Recargá o mirá el diff.`,
      409,
      { path: label, currentHash: current }
    );
  }
}

function safeChangePath(root, path) {
  try {
    resolveRepoPath(root, path);
  } catch (error) {
    throw new PlanError(`Path inválido en el plan (${path}): ${error.message}`, 403);
  }
}

function preflight(root, plan) {
  const future = new Set();
  for (const change of plan.changes ?? []) {
    if (change.path) safeChangePath(root, change.path);
    if (change.type === "exec" && change.cwd) safeChangePath(root, change.cwd);
    const abs = change.path ? join(root, change.path) : null;
    const existsNow = abs ? existsSync(abs) : false;

    if (change.type === "exec") {
      for (const path of change.expectedPaths ?? []) future.add(path);
      continue;
    }
    if (change.type === "write") {
      if (change.overwrite === false && (existsNow || future.has(change.path))) {
        throw new PlanError(`Ya existe y no se sobrescribe: ${change.path}`, 409);
      }
      if (existsNow) assertExpectedHash(abs, change.expectedHash, change.path);
      future.add(change.path);
      continue;
    }
    if (change.type === "delete") {
      if (existsNow) assertExpectedHash(abs, change.expectedHash, change.path);
      future.delete(change.path);
      continue;
    }
    if (change.type === "frontmatter" || change.type === "append") {
      if (!existsNow && !future.has(change.path)) {
        throw new PlanError(`No existe el archivo a modificar: ${change.path}`, 409);
      }
      if (existsNow) assertExpectedHash(abs, change.expectedHash, change.path);
      future.add(change.path);
      continue;
    }
  }
}

export async function applyPlan(root, plan) {
  const blocking = (plan.validations ?? []).filter((item) => !item.ok && !item.overridable);
  if (blocking.length > 0) {
    throw new PlanError(
      `El plan no se aplica: ${blocking.map((item) => item.message).join(" · ")}`,
      422,
      { validations: plan.validations }
    );
  }
  preflight(root, plan);
  const applied = [];
  const output = [];
  for (const change of plan.changes ?? []) {
    if (change.type === "exec") {
      const result = await run(change.command, change.args ?? [], {
        cwd: change.cwd ? join(root, change.cwd) : root,
        timeout: change.timeout ?? 180000
      });
      const combined = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
      if (combined) output.push(combined);
      if (!result.ok) {
        throw new PlanError(
          `Falló el comando ${change.command}: ${combined || result.error || "sin salida"}`,
          500
        );
      }
      for (const path of change.expectedPaths ?? []) {
        if (!existsSync(join(root, path))) {
          throw new PlanError(`El comando no creó el path esperado: ${path}`, 500, {
            output: combined
          });
        }
        applied.push(path);
      }
      continue;
    }

    if (change.type === "frontmatter" || change.type === "append") {
      const abs = join(root, change.path);
      assertExpectedHash(abs, change.expectedHash, change.path);
      if (!existsSync(abs)) {
        throw new PlanError(`No existe el archivo a modificar: ${change.path}`, 409);
      }
      const current = readFileSync(abs, "utf8");
      let next = current;
      if (change.type === "frontmatter") {
        next = setFrontmatterFields(current, change.updates ?? {});
      } else {
        const separator = current.endsWith("\n") || current === "" ? "" : "\n";
        next = `${current}${separator}${change.text ?? ""}`;
      }
      atomicWrite(abs, next);
      applied.push(change.path);
      continue;
    }

    if (change.type === "write") {
      const abs = join(root, change.path);
      if (change.overwrite === false && existsSync(abs)) {
        throw new PlanError(`Ya existe y no se sobrescribe: ${change.path}`, 409);
      }
      assertExpectedHash(abs, change.expectedHash, change.path);
      atomicWrite(abs, String(change.content ?? ""));
      applied.push(change.path);
      continue;
    }

    if (change.type === "delete") {
      const abs = join(root, change.path);
      assertExpectedHash(abs, change.expectedHash, change.path);
      if (existsSync(abs)) unlinkSync(abs);
      applied.push(change.path);
      continue;
    }

    if (change.type === "restore") {
      await restorePath(root, change.path);
      applied.push(change.path);
      continue;
    }

    throw new PlanError(`Cambio desconocido: ${change.type}`, 500);
  }

  const uniqueApplied = [...new Set(applied)];
  return {
    paths: uniqueApplied,
    output: output.join("\n"),
    diff: await diffForPaths(root, uniqueApplied)
  };
}
