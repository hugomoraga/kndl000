export const TIPOS_ANEXO = ["correccion", "fuente", "concepto", "objecion", "derivacion"];
export const ESTADOS_ANEXO = [
  "corregido",
  "verificado",
  "abierta",
  "provisional",
  "reemplazado"
];
export const FUENTES_OBLIGATORIAS = ["correccion", "fuente", "derivacion"];

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function countWordInSources(word, sources) {
  const normalized = normalizeText(word);
  if (!normalized) return { word: String(word ?? ""), count: 0, matches: [] };
  const expression = normalized
    .split(" ")
    .map(escapeRegExp)
    .join("\\s+");
  let re;
  try {
    re = new RegExp(`(?<![\\p{L}\\p{N}])${expression}(?![\\p{L}\\p{N}])`, "iu");
  } catch {
    re = new RegExp(escapeRegExp(normalized), "i");
  }
  const matches = [];
  for (const source of sources) {
    const body = normalizeText(source.body);
    if (re.test(body)) {
      matches.push({ path: source.path, type: source.type });
    }
  }
  return { word: String(word ?? ""), count: matches.length, matches };
}

export function countSections(body) {
  return (String(body ?? "").match(/^##\s+\S/gm) ?? []).length;
}

export function normalizeList(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => {
      if (typeof value === "string") return normalizeText(value);
      if (value && typeof value === "object") {
        return normalizeText(value.title ?? value.nombre ?? value.name ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

export function sharedNodes(candidateNodes, otherExplorations) {
  const candidate = new Set(normalizeList(candidateNodes));
  const shared = new Set();
  const byExploration = [];
  for (const exploration of otherExplorations) {
    const nodes = normalizeList(exploration.meta?.nodos ?? []);
    const intersection = nodes.filter((node) => candidate.has(node));
    if (intersection.length > 0) {
      for (const node of intersection) shared.add(node);
      byExploration.push({ path: exploration.path, title: exploration.title, nodes: intersection });
    }
  }
  return { shared: [...shared], byExploration };
}

export function sourceComplete(source) {
  if (!source || typeof source !== "object") return false;
  return ["autor", "titulo", "url", "consultado", "verifica"].every((key) => {
    const value = source[key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
}

export function validateAnnexSources(fuentes, tipo) {
  if (!Array.isArray(fuentes) || fuentes.length === 0) {
    return {
      ok: false,
      message: "El anexo no tiene fuentes."
    };
  }
  const incomplete = fuentes
    .map((source, index) => ({ source, index }))
    .filter(({ source }) => !sourceComplete(source));
  if (incomplete.length > 0) {
    return {
      ok: false,
      message: `Hay fuentes incompletas (${incomplete
        .map(({ index }) => `#${index + 1}`)
        .join(", ")}). Se requieren autor, título, URL, consultado y verifica.`
    };
  }
  return { ok: true, message: `${fuentes.length} fuente(s) completa(s).` };
}

export function validateExplorationFields({ question, summary, status, body, nodos }, others = []) {
  const validations = [];
  validations.push({
    id: "question",
    ok: String(question ?? "").trim() !== "",
    message: "Falta la pregunta abierta."
  });
  validations.push({
    id: "summary",
    ok: String(summary ?? "").trim() !== "",
    message: "Falta el resumen."
  });
  validations.push({
    id: "status",
    ok: String(status ?? "").trim() !== "",
    message: "Falta el estado."
  });
  const sections = countSections(body);
  validations.push({
    id: "sections",
    ok: sections > 0,
    message:
      sections > 0
        ? `${sections} sección(es) en el cuerpo.`
        : "La exploración necesita al menos una sección (§)."
  });
  const shared = sharedNodes(nodos, others);
  validations.push({
    id: "shared-node",
    ok: shared.shared.length > 0,
    message:
      shared.shared.length > 0
        ? `Nodo compartido: ${shared.shared.join(", ")}.`
        : "Ningún nodo se comparte con otra exploración publicada.",
    overridable: true,
    detail: shared
  });
  return { validations, shared };
}

export function validateNodeWord(word, sources) {
  const result = countWordInSources(word, sources);
  return {
    ...result,
    ok: result.count >= 2,
    message:
      result.count >= 2
        ? `«${word}» aparece en ${result.count} cuerpos distintos.`
        : `«${word}» aparece en ${result.count} cuerpo(s); un nodo necesita al menos dos.`,
    overridable: true
  };
}

export function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalValue(value[key]);
    return out;
  }
  return value;
}

export function explorationChanges(previousMeta, previousBody, nextMeta, nextBody) {
  const keys = ["question", "summary", "status", "nodos", "corpus", "relacionadas"];
  const changed = keys.filter(
    (key) =>
      JSON.stringify(canonicalValue(previousMeta?.[key] ?? null)) !==
      JSON.stringify(canonicalValue(nextMeta?.[key] ?? null))
  );
  const bodyChanged = String(previousBody ?? "") !== String(nextBody ?? "");
  const previousHitos = Array.isArray(previousMeta?.hitos) ? previousMeta.hitos.length : 0;
  const nextHitos = Array.isArray(nextMeta?.hitos) ? nextMeta.hitos.length : 0;
  return {
    changed,
    bodyChanged,
    newHito: nextHitos > previousHitos,
    any: changed.length > 0 || bodyChanged
  };
}

export function validation(id, ok, message, options = {}) {
  return {
    id,
    ok,
    message,
    overridable: Boolean(options.overridable),
    field: options.field ?? null,
    detail: options.detail ?? null
  };
}
