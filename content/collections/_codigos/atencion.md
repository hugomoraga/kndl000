---
layout: codigo
title: Atención
date: 2026-11-11
language: JavaScript
concept: "Un transformador mínimo entrenado con el corpus. La frase se convierte en lo que sus palabras miran."
---

Un transformador de dos capas —64 dimensiones, 12.000 pasos— entrenado con `corpus.txt`. Continúa una frase carácter por carácter. No traduce: transforma. La matriz de atención muestra qué mira el modelo en el último paso; la cobertura de trigramas compara la continuación con el corpus.

El modelo es mínimo y se equivoca: la pérdida de validación quedó en 1,63. No es un modelo de lenguaje grande; es una forma de ver el mecanismo. Responde a §4 de [Lo que el archivo no conserva](/rizoma/archivo/#transformar).

```javascript
// Un transformador mínimo, entrenado con corpus.txt.
// Carga los pesos, continúa una frase y muestra la atención de la primera capa.

const MODEL_URL = "/assets/models/transformador.json";
const model = await (await fetch(MODEL_URL)).json();
const cfg = model.config;
const W = model.weights;
const vocab = model.vocab;
const stoi = new Map(vocab.map((c, i) => [c, i]));
const spaceId = stoi.get(" ") ?? 0;

output({
  type: "meta",
  text: `Modelo cargado · ${cfg.layers} capas · ${cfg.d_model} dimensiones · contexto ${cfg.context} · pérdida ${cfg.val_loss ?? "—"}`
});

const semilla = String(input("Frase inicial (máx. 40 caracteres)") || "").trim();
const pedidaLongitud = parseInt(input("Caracteres a generar (40–160)"), 10);
const pedidaTemp = parseFloat(input("Temperatura (0.2–1.2)"), 10);
const longitud = Math.max(40, Math.min(160, isNaN(pedidaLongitud) ? 80 : pedidaLongitud));
const temperatura = Math.max(0.2, Math.min(1.2, isNaN(pedidaTemp) ? 0.8 : pedidaTemp));

const dot = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

const matVec = (x, matrix, bias) => {
  const out = new Array(matrix[0].length).fill(0);
  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    const row = matrix[i];
    for (let j = 0; j < row.length; j++) out[j] += xi * row[j];
  }
  for (let j = 0; j < out.length; j++) out[j] += bias[j];
  return out;
};

const rmsnorm = (x, gamma) => {
  let ss = 0;
  for (let i = 0; i < x.length; i++) ss += x[i] * x[i];
  const rms = Math.sqrt(ss / x.length + 1e-6);
  return x.map((v, i) => (v / rms) * gamma[i]);
};

const softmax = (x) => {
  let max = -Infinity;
  for (let i = 0; i < x.length; i++) if (x[i] > max) max = x[i];
  const exps = x.map((v) => Math.exp(v - max));
  let sum = 0;
  for (let i = 0; i < exps.length; i++) sum += exps[i];
  return exps.map((v) => v / sum);
};

const forward = (ids) => {
  const T = ids.length;
  const D = cfg.d_model;
  let h = ids.map((id, t) =>
    W.tok_emb[id].map((v, d) => v + W.pos_emb[t][d])
  );
  let attention = null;

  for (let layer = 0; layer < cfg.layers; layer++) {
    const n1 = h.map((x) => rmsnorm(x, W["ln1_" + layer]));
    const q = n1.map((x) => matVec(x, W["Wq_" + layer], W["bq_" + layer]));
    const k = n1.map((x) => matVec(x, W["Wk_" + layer], W["bk_" + layer]));
    const v = n1.map((x) => matVec(x, W["Wv_" + layer], W["bv_" + layer]));

    const attn = [];
    for (let i = 0; i < T; i++) {
      const scores = [];
      for (let j = 0; j < T; j++) {
        scores.push(j <= i ? dot(q[i], k[j]) / Math.sqrt(D) : -1e9);
      }
      attn.push(softmax(scores));
    }

    const ctx = attn.map((row) => {
      const out = new Array(D).fill(0);
      for (let j = 0; j < T; j++) {
        const a = row[j];
        if (a === 0) continue;
        const vj = v[j];
        for (let d = 0; d < D; d++) out[d] += a * vj[d];
      }
      return out;
    });

    const attnOut = ctx.map((x) => matVec(x, W["Wo_" + layer], W["bo_" + layer]));
    const h1 = h.map((x, i) => x.map((val, d) => val + attnOut[i][d]));
    const n2 = h1.map((x) => rmsnorm(x, W["ln2_" + layer]));
    const rel = n2.map((x) =>
      matVec(x, W["W1_" + layer], W["b1_" + layer]).map((val) => Math.max(0, val))
    );
    const ff = rel.map((x) => matVec(x, W["W2_" + layer], W["b2_" + layer]));
    h = h1.map((x, i) => x.map((val, d) => val + ff[i][d]));

    if (layer === 0) attention = attn;
  }

  const nf = rmsnorm(h[T - 1], W.lnf);
  const logits = matVec(nf, W.Wout, W.bout);
  return { logits, attention };
};

const sample = (logits, temp, topK) => {
  const scaled = logits.map((v) => v / temp);
  const ranked = scaled
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, topK);
  const max = ranked[0][0];
  const probs = ranked.map(([v]) => Math.exp(v - max));
  let sum = 0;
  for (let i = 0; i < probs.length; i++) sum += probs[i];
  let r = Math.random() * sum;
  for (let i = 0; i < ranked.length; i++) {
    r -= probs[i];
    if (r <= 0) return ranked[i][1];
  }
  return ranked[0][1];
};

let seedIds = [...semilla].map((c) => stoi.get(c) ?? spaceId);
if (seedIds.length === 0) seedIds = [spaceId];
let windowIds = seedIds.slice(-cfg.context);
while (windowIds.length < cfg.context) windowIds.unshift(spaceId);

const generatedIds = [];
let lastAttention = null;
let lastContext = null;

for (let step = 0; step < longitud; step++) {
  lastContext = windowIds.slice();
  const { logits, attention } = forward(windowIds);
  lastAttention = attention;
  const next = sample(logits, temperatura, vocab.length);
  generatedIds.push(next);
  windowIds = windowIds.concat([next]).slice(-cfg.context);
}

const continuation = generatedIds.map((i) => vocab[i]).join("");
const contextText = lastContext.map((i) => vocab[i]).join("");

output({ type: "legend", text: `Semilla: ${semilla || "—"}` });
output({ type: "text", text: continuation });
output({
  type: "grid",
  data: lastAttention,
  label: "Atención de la primera capa",
  caption: "Filas: posición que mira. Columnas: posición mirada. La mitad superior está enmascarada."
});
output({
  type: "legend",
  text: `Contexto del último paso: ${contextText.replace(/ /g, "·").replace(/\n/g, "⏎")}`
});

let coverage = null;
try {
  const corpus = await (await fetch("/corpus.txt")).text();
  const sampleText = corpus
    .slice(0, 200000)
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^a-záéíóúñü\s]/g, " ")
    .replace(/\s+/g, " ");
  const trigrams = new Set();
  for (let i = 0; i < sampleText.length - 2; i++) {
    trigrams.add(sampleText.slice(i, i + 3));
  }
  const generated = continuation
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^a-záéíóúñü\s]/g, " ")
    .replace(/\s+/g, " ");
  let total = 0;
  let found = 0;
  for (let i = 0; i < generated.length - 2; i++) {
    total++;
    if (trigrams.has(generated.slice(i, i + 3))) found++;
  }
  coverage = total ? (found / total) * 100 : 0;
} catch (error) {
  coverage = null;
}

if (coverage !== null) {
  output({
    type: "metric",
    label: "Cobertura de trigramas de la continuación",
    value: coverage.toFixed(1),
    unit: "%"
  });
}

output({
  type: "conclusion",
  text:
    "El modelo no conserva la frase: conserva una traza de atenciones.\n" +
    "La continuación no traduce el original; lo transforma.\n" +
    "Lo que se pierde es el resto."
});
```
