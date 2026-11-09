#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';

const SITE = resolve('_site');
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) walk(path);
    else if (path.endsWith('.html')) files.push(path);
  }
}

walk(SITE);

const attr = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const skip = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const missing = [];
let checked = 0;

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  let match;
  while ((match = attr.exec(html)) !== null) {
    let raw = match[1].trim().replace(/&amp;/g, '&');
    if (!raw || skip.test(raw)) continue;

    let clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;

    // Los slugs con acentos se publican con la ruta UTF-8, pero el HTML los
    // escribe percent-encoded. Decodificamos para comparar contra el archivo real.
    try {
      clean = decodeURIComponent(clean);
    } catch {
      // Si el porcentaje está mal formado, dejamos la ruta tal cual.
    }

    const target = clean.startsWith('/')
      ? join(SITE, clean)
      : resolve(dirname(file), clean);

    const candidates = [];
    if (clean.endsWith('/')) {
      candidates.push(join(target, 'index.html'));
    } else {
      candidates.push(target);
      if (!extname(clean)) {
        candidates.push(target + '.html');
        candidates.push(join(target, 'index.html'));
      }
    }

    checked += 1;
    if (!candidates.some(isFile)) {
      missing.push({ source: relative(process.cwd(), file), target: raw });
    }
  }
}

if (missing.length > 0) {
  console.error(`\nEnlaces internos roto(s): ${missing.length}\n`);
  for (const item of missing) {
    console.error(`  ${item.source} -> ${item.target}`);
  }
  process.exit(1);
}

console.log(`OK: ${files.length} HTML, ${checked} enlaces internos comprobados.`);
