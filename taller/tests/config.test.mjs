import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const YAML = require("../vendor-yaml/dist/index.js");
const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("_config.yml excluye taller y _site/taller no existe", () => {
  const config = YAML.parse(readFileSync(join(ROOT, "_config.yml"), "utf8"));
  assert.ok(Array.isArray(config.exclude), "exclude debe ser una lista");
  assert.ok(config.exclude.includes("taller"), "taller debe estar en exclude");
  const site = join(ROOT, "_site");
  if (existsSync(site)) {
    assert.equal(
      existsSync(join(site, "taller")),
      false,
      "el build de Jekyll no debe publicar _site/taller"
    );
  }
});
