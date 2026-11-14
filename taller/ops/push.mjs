import { repoState, push as gitPush } from "../lib/git.mjs";
import { createPlan, PlanError, validation } from "../lib/plan.mjs";

export default {
  id: "push",
  label: "Push explícito",
  description: "Empuja la rama actual sin force push. Es una acción separada del commit.",
  fields: [{ name: "confirm", label: "Confirmo el push", type: "checkbox" }],
  async plan(ctx, input) {
    const state = await repoState(ctx.root);
    const validations = [];
    if (!input.confirm) {
      validations.push(validation("confirm", false, "El push requiere confirmación explícita.", { field: "confirm" }));
    }
    if (state.blockReason) {
      validations.push(validation("repo", false, state.blockReason));
    }
    if (state.detached) {
      validations.push(validation("branch", false, "No hay una rama para pushear."));
    }
    return createPlan({
      operation: "push",
      summary: `Push de ${state.branch ?? "(sin rama)"} (sin force)`,
      changes: [],
      preview: [],
      validations,
      message: `taller: push ${state.branch ?? ""}`.trim(),
      origin: state.branch ?? "",
      meta: { branch: state.branch, head: state.head }
    });
  },
  async apply(ctx) {
    const result = await gitPush(ctx.root);
    return {
      paths: [],
      output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim() || "Push completado.",
      diff: ""
    };
  }
};
