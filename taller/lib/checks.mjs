import { run } from "./git.mjs";

export const CHECK_DEFINITIONS = [
  {
    id: "jekyll",
    label: "Jekyll build",
    command: "bundle",
    args: ["exec", "jekyll", "build"],
    timeout: 240000,
    hint: "Instalá Ruby, Bundler y Jekyll (bundle install)."
  },
  {
    id: "links",
    label: "Check de enlaces internos",
    command: "node",
    args: ["scripts/check-links.mjs"],
    timeout: 120000,
    hint: "Corré bundle exec jekyll build antes del check de enlaces."
  },
  {
    id: "lamina-01",
    label: "Lámina 01",
    command: "python3",
    args: ["docs/rizoma/build-lamina.py", "--verify", "--plate", "01"],
    timeout: 120000,
    hint: "Instalá Python 3 y PyYAML (python3 -m pip install pyyaml)."
  },
  {
    id: "lamina-02",
    label: "Lámina 02",
    command: "python3",
    args: ["docs/rizoma/build-lamina.py", "--verify", "--plate", "02"],
    timeout: 120000,
    hint: "Instalá Python 3 y PyYAML (python3 -m pip install pyyaml)."
  }
];

function missingToolMessage(definition, result) {
  if (result.error?.includes("ENOENT") || result.code === "ENOENT") {
    return `${definition.command} no está instalado. ${definition.hint}`;
  }
  return null;
}

export async function runChecks(root, definitions = CHECK_DEFINITIONS) {
  const results = [];
  for (const definition of definitions) {
    const result = await run(definition.command, definition.args, {
      cwd: root,
      timeout: definition.timeout
    });
    const missing = missingToolMessage(definition, result);
    results.push({
      id: definition.id,
      label: definition.label,
      command: definition.command,
      args: definition.args,
      ok: result.ok,
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      message: missing ?? (result.ok ? "OK" : `Falló: ${definition.command} ${definition.args.join(" ")}`)
    });
  }
  return results;
}

export async function checkTools(root) {
  const checks = [
    { id: "node", command: "node", args: ["--version"] },
    { id: "git", command: "git", args: ["--version"] },
    {
      id: "python3",
      command: "python3",
      args: ["-c", "import yaml,sys; print('ok ' + yaml.__version__)"]
    },
    { id: "bundle", command: "bundle", args: ["--version"] }
  ];
  const tools = {};
  for (const check of checks) {
    const result = await run(check.command, check.args, { cwd: root, timeout: 20000 });
    tools[check.id] = {
      ok: result.ok,
      version: (result.stdout || result.stderr || "").trim().split("\n")[0] ?? "",
      message: result.ok ? null : `No se pudo ejecutar ${check.command}.`
    };
  }
  return tools;
}
