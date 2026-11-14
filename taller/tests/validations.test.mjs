import test from "node:test";
import assert from "node:assert/strict";
import {
  countSections,
  countWordInSources,
  explorationChanges,
  normalizeText,
  sharedNodes,
  validateAnnexSources,
  validateExplorationFields,
  validateNodeWord
} from "../lib/validations.mjs";

const sources = [
  { path: "content/collections/_exploraciones/a.md", type: "exploracion", body: "La Memoria insiste." },
  { path: "content/collections/_poems/b.md", type: "poema", body: "memória y memoria." },
  { path: "content/collections/_poems/c.md", type: "poema", body: "memorias no cuentan." }
];

test("cuenta palabra con acentos, mayúsculas y límite de palabra", () => {
  const result = countWordInSources("memoria", sources);
  assert.equal(result.count, 2);
  assert.equal(result.matches.length, 2);
  assert.equal(countWordInSources("memorias", sources).count, 1);
  assert.equal(countWordInSources("memoria", [{ path: "x", body: "memorias" }]).count, 0);
  assert.equal(normalizeText("Óscar  Á."), "oscar a.");
});

test("un nodo necesita dos cuerpos distintos", () => {
  assert.equal(validateNodeWord("memoria", sources).ok, true);
  assert.equal(validateNodeWord("insiste", sources).ok, false);
  assert.equal(validateNodeWord("memorias", sources).ok, false);
});

test("nodos compartidos entre exploraciones", () => {
  const others = [
    { path: "a.md", title: "A", meta: { nodos: ["Repetición", "Memoria"] } },
    { path: "b.md", title: "B", meta: { nodos: ["Archivo"] } }
  ];
  const result = sharedNodes(["memoria", "Archivo", "Soledad"], others);
  assert.deepEqual(result.shared.sort(), ["archivo", "memoria"]);
  assert.equal(result.byExploration.length, 2);
});

test("validación de exploración: pregunta, resumen, estado, sección y nodo compartido", () => {
  const others = [{ path: "a.md", title: "A", meta: { nodos: ["Memoria"] } }];
  const result = validateExplorationFields(
    {
      question: "¿Qué se conserva?",
      summary: "Una deriva.",
      status: "abierta",
      body: "## 1. La pregunta\n\nTexto",
      nodos: ["Memoria"]
    },
    others
  );
  assert.ok(result.validations.every((item) => item.ok));
  assert.equal(result.shared.shared[0], "memoria");

  const missing = validateExplorationFields(
    { question: "", summary: "", status: "", body: "sin secciones", nodos: ["Soledad"] },
    others
  );
  const failed = missing.validations.filter((item) => !item.ok).map((item) => item.id);
  assert.deepEqual(failed.sort(), ["question", "sections", "shared-node", "status", "summary"]);
  assert.equal(missing.validations.find((item) => item.id === "shared-node").overridable, true);
});

test("fuentes de anexo completas", () => {
  const complete = {
    autor: "KNDL",
    titulo: "Poema",
    url: "https://example.com",
    consultado: "2026-11-14",
    verifica: "Se leyó completo."
  };
  assert.equal(validateAnnexSources([complete], "correccion").ok, true);
  assert.equal(validateAnnexSources([{ ...complete, verifica: "" }], "correccion").ok, false);
  assert.match(validateAnnexSources([], "fuente").message, /no tiene fuentes/);
});

test("cambios de exploración y detección de hito nuevo", () => {
  const previous = {
    question: "¿A?",
    summary: "S",
    status: "abierta",
    nodos: ["a"],
    hitos: [{ date: "2026-01-01", title: "Inicio" }]
  };
  const next = { ...previous, question: "¿B?", status: "cerrada", hitos: [...previous.hitos, { title: "Nuevo" }] };
  const result = explorationChanges(previous, "cuerpo", next, "cuerpo");
  assert.deepEqual(result.changed.sort(), ["question", "status"]);
  assert.equal(result.newHito, true);
  assert.equal(result.bodyChanged, false);
  assert.equal(countSections("## a\n### b"), 1);
});
