#!/usr/bin/env node
/**
 * Abre una exploración nueva en Rizoma.
 *
 *   node scripts/nueva-exploracion.mjs --title "Título" --question "¿Pregunta?"
 *
 * Crea el documento público y una nota de ciclo en el banco de trabajo.
 * No crea nodos, corpus, anexos ni relaciones: eso se agrega cuando existe.
 * No escribe si el archivo ya existe. --dry-run imprime sin crear.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const EXPLORACIONES = join(ROOT, "content/collections/_exploraciones");
const CICLOS = join(ROOT, "docs/rizoma/ciclos");

function usage() {
  console.log(`Uso:
  node scripts/nueva-exploracion.mjs --title "Título" --question "¿Pregunta?" [--slug slug] [--dry-run] [--no-note]

Crea content/collections/_exploraciones/<slug>.md y, salvo --no-note,
docs/rizoma/ciclos/<fecha>-<slug>.md.`);
}

function parseArgs(argv) {
  const opts = { dryRun: false, note: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--title") opts.title = argv[++i];
    else if (arg === "--question") opts.question = argv[++i];
    else if (arg === "--slug") opts.slug = argv[++i];
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--no-note") opts.note = false;
    else if (arg === "-h" || arg === "--help") { usage(); process.exit(0); }
    else { console.error(`Argumento desconocido: ${arg}`); usage(); process.exit(1); }
  }
  return opts;
}

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function localDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function nextOrder() {
  if (!existsSync(EXPLORACIONES)) return "01";
  const orders = readdirSync(EXPLORACIONES)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const content = readFileSync(join(EXPLORACIONES, file), "utf8");
      const match = content.match(/^order:\s*"?(\d+)"?/m);
      return match ? Number(match[1]) : 0;
    });
  const next = (orders.length ? Math.max(...orders) : 0) + 1;
  return String(next).padStart(2, "0");
}

const q = (value) => JSON.stringify(String(value));

function explorationDoc({ title, question, order, date }) {
  return `---
layout: exploracion
title: ${q(title)}
question: ${q(question)}
order: "${order}"
status: abierta
date: ${date}
updated: ${date}
hitos:
  - date: ${date}
    title: "La pregunta inicial"
    text: "La exploración comienza con una pregunta."
---

No es una tesis. Es una deriva.

## 1. La pregunta {#la-pregunta}

${question}

## 2. Preguntas abiertas {#preguntas-abiertas}

No tengo respuestas. Tengo una serie de vueltas. Por ahora, eso alcanza.
`;
}

function cycleDoc({ title, question, date, slug }) {
  return `---
title: "Ciclo — ${title}"
date: ${date}
exploracion: /rizoma/${slug}/
estado: abierto
---

## Pregunta

${question}

## Material

-

## Decisiones

-

## Próximo

-
`;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.title || !opts.question) {
  console.error("Faltan --title y --question.");
  usage();
  process.exit(1);
}

const slug = opts.slug ? String(opts.slug) : slugify(opts.title);
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Slug inválido: ${slug}`);
  process.exit(1);
}

const date = localDate();
const order = nextOrder();
const docPath = join(EXPLORACIONES, `${slug}.md`);
const notePath = join(CICLOS, `${date}-${slug}.md`);

if (existsSync(docPath)) {
  console.error(`Ya existe: ${docPath}`);
  process.exit(1);
}

const doc = explorationDoc({ title: opts.title, question: opts.question, order, date });
const note = cycleDoc({ title: opts.title, question: opts.question, date, slug });

if (opts.dryRun) {
  console.log(`# ${docPath}\n${doc}`);
  if (opts.note) console.log(`# ${notePath}\n${note}`);
  process.exit(0);
}

mkdirSync(dirname(docPath), { recursive: true });
writeFileSync(docPath, doc, { flag: "wx" });

if (opts.note) {
  mkdirSync(CICLOS, { recursive: true });
  if (existsSync(notePath)) {
    console.warn(`La nota ya existe, no se sobrescribe: ${notePath}`);
  } else {
    writeFileSync(notePath, note, { flag: "wx" });
  }
}

console.log(`Exploración creada: ${docPath}`);
if (opts.note) console.log(`Nota de ciclo: ${notePath}`);
console.log(`URL: /rizoma/${slug}/`);
console.log(`Orden: ${order} · fecha: ${date}`);
console.log(`
Próximos pasos:
  1. Leé docs/rizoma/PUNTO-DE-ENTRADA.md si es una sesión nueva.
  2. Escribí la pregunta y la primera sección del cuerpo.
  3. Agregá corpus/nodos/anexos solo cuando existan.
  4. bundle exec jekyll build && node scripts/check-links.mjs
`);
