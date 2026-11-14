import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "../lib/frontmatter.mjs";
import { repoState, headContent, stageAndCommit, git } from "../lib/git.mjs";
import { resolveRepoPath } from "../lib/paths.mjs";
import { runChecks } from "../lib/checks.mjs";
import { createPlan, PlanError, validation } from "../lib/plan.mjs";
import { explorationChanges } from "../lib/validations.mjs";

const ALLOWED_PREFIXES = [
  "docs/rizoma/",
  "content/collections/_exploraciones/",
  "content/collections/_nodos/",
  "rizoma/"
];

function normalizePaths(paths) {
  if (!Array.isArray(paths)) return [];
  return [...new Set(paths.map((path) => String(path ?? "").trim()).filter(Boolean))];
}

async function runCommitChecks(root) {
  return runChecks(root);
}

function checkSummary(results) {
  return results.every((result) => result.ok) ? "Todos los chequeos pasaron." : "Hay chequeos fallidos.";
}

function buildMessage({ message, operation, origin, overrideReason, minorReason, overrides = [] }) {
  const lines = [String(message ?? "").trim()];
  const trailers = [];
  if (operation || origin) {
    trailers.push(`Taller: ${operation}${origin ? ` · ${origin}` : ""}`);
  }
  const reasons = [
    ...new Set([
      ...overrides.map((reason) => String(reason ?? "").trim()).filter(Boolean),
      String(overrideReason ?? "").trim()
    ])
  ];
  for (const reason of reasons) {
    trailers.push(`Override: ${reason}`);
  }
  if (String(minorReason ?? "").trim()) {
    trailers.push(`Cambio menor: ${String(minorReason).trim()}`);
  }
  if (trailers.length > 0) lines.push("", ...trailers);
  return lines.join("\n").trim();
}

async function explorationGate(root, paths, minorReason, validations) {
  for (const path of paths) {
    if (!path.startsWith("content/collections/_exploraciones/")) continue;
    const previous = await headContent(root, path);
    if (previous === null) continue;
    let previousParsed;
    let nextParsed;
    try {
      previousParsed = parseFrontmatter(previous);
      nextParsed = parseFrontmatter(readFileSync(join(root, path), "utf8"));
    } catch (error) {
      validations.push(
        validation("exploracion-yaml", false, `No se pudo comparar ${path}: ${error.message}`, {
          field: path
        })
      );
      continue;
    }
    const changes = explorationChanges(
      previousParsed.meta,
      previousParsed.body,
      nextParsed.meta,
      nextParsed.body
    );
    if (!changes.any) continue;
    if (String(minorReason ?? "").trim()) continue;
    if (changes.newHito) continue;
    const fields = [...changes.changed];
    if (changes.bodyChanged) fields.push("cuerpo");
    validations.push(
      validation(
        "hito",
        false,
        `La exploración ${path} cambió (${fields.join(", ")}) sin un hito nuevo. Agregá un hito o un motivo de cambio menor.`,
        { field: path }
      )
    );
  }
}

export default {
  id: "commit",
  label: "Commitear plan",
  description: "Corre los chequeos y commitea solo los paths seleccionados.",
  palette: false,
  fields: [
    { name: "paths", label: "Paths", type: "hidden" },
    { name: "message", label: "Mensaje", type: "textarea", required: true },
    { name: "minorReason", label: "Motivo de cambio menor", type: "textarea" },
    { name: "overrideReason", label: "Motivo de override", type: "textarea" },
    { name: "operation", label: "Operación", type: "hidden" },
    { name: "origin", label: "Origen", type: "hidden" }
  ],
  async plan(ctx, input) {
    const paths = normalizePaths(input.paths);
    const validations = [];
    if (paths.length === 0) {
      validations.push(validation("paths", false, "No hay paths en el plan de commit."));
    }

    for (const path of paths) {
      try {
        resolveRepoPath(ctx.root, path);
      } catch (error) {
        validations.push(
          validation("path", false, `Path inválido (${path}): ${error.message}`, { field: path })
        );
        continue;
      }
      if (!ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        validations.push(
          validation("path-scope", false, `El taller no commitea fuera de Rizoma: ${path}`, {
            field: path
          })
        );
      }
    }

    const state = await repoState(ctx.root);
    if (state.blockReason) {
      validations.push(validation("repo", false, state.blockReason));
    }
    if (!String(input.message ?? "").trim()) {
      validations.push(validation("message", false, "Falta el mensaje de commit.", { field: "message" }));
    }

    await explorationGate(ctx.root, paths, input.minorReason, validations);

    const checks = paths.length > 0 && !state.blockReason ? await runCommitChecks(ctx.root, paths) : [];
    if (checks.length > 0) {
      const ok = checks.every((check) => check.ok);
      validations.push(
        validation("checks", ok, checkSummary(checks), { overridable: true, detail: checks })
      );
    }

    const plan = createPlan({
      operation: "commit",
      summary: `Commit de ${paths.length} path(s)`,
      changes: [],
      preview: [],
      validations,
      message: String(input.message ?? ""),
      origin: String(input.origin ?? ""),
      meta: {
        paths,
        checks,
        repo: {
          branch: state.branch,
          head: state.head,
          blockReason: state.blockReason,
          dirty: state.dirty
        },
        operation: String(input.operation ?? ""),
        minorReason: String(input.minorReason ?? ""),
        overrideReason: String(input.overrideReason ?? ""),
        overrides: Array.isArray(input.overrides)
          ? input.overrides.map((reason) => String(reason)).filter(Boolean)
          : []
      }
    });
    plan.checks = checks;
    return plan;
  },
  async apply(ctx, plan, input, { overrideReason } = {}) {
    const paths = plan.meta.paths;
    const state = await repoState(ctx.root);
    if (state.blockReason) throw new PlanError(state.blockReason, 409);

    const checks = await runCommitChecks(ctx.root, paths);
    const failed = checks.filter((check) => !check.ok);
    if (failed.length > 0 && !String(overrideReason ?? "").trim()) {
      throw new PlanError("Los chequeos fallaron. Revisá la salida o agregá un motivo de override.", 422, {
        checks
      });
    }

    const message = buildMessage({
      message: input.message,
      operation: plan.meta.operation || plan.operation,
      origin: plan.origin,
      overrideReason,
      minorReason: input.minorReason,
      overrides: plan.meta.overrides ?? []
    });
    const committed = await stageAndCommit(ctx.root, paths, message);
    const log = await git(ctx.root, ["log", "-1", "--format=%h %s"]);
    return {
      paths,
      output: [
        ...checks.map(
          (check) => `${check.ok ? "ok" : "FALLA"} ${check.label}\n${check.stdout}${check.stderr}`
        ),
        committed.stdout.trim(),
        log.stdout.trim()
      ]
        .filter(Boolean)
        .join("\n\n"),
      diff: "",
      checks,
      commit: log.stdout.trim()
    };
  }
};
