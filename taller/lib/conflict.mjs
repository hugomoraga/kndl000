import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, setFrontmatterFields, splitFrontmatter } from "./frontmatter.mjs";
import { sha256 } from "./paths.mjs";

function normalizeLines(text) {
  return String(text ?? "").replaceAll("\r\n", "\n").split("\n");
}

export function mergeBodies(baseBody, currentBody, mineBody) {
  const targetEol = String(currentBody ?? "").includes("\r\n") ? "\r\n" : "\n";
  const base = String(baseBody ?? "").replaceAll("\r\n", "\n");
  const current = String(currentBody ?? "").replaceAll("\r\n", "\n");
  const mine = String(mineBody ?? "").replaceAll("\r\n", "\n");

  if (base === current) return { text: mine, conflict: false };
  if (base === mine) return { text: current, conflict: false };
  if (current === mine) return { text: current, conflict: false };

  const b = base.split("\n");
  const c = current.split("\n");
  const m = mine.split("\n");
  let start = 0;
  while (start < b.length && b[start] === c[start] && b[start] === m[start]) start++;
  let end = 0;
  while (
    end < b.length - start &&
    b[b.length - 1 - end] === c[c.length - 1 - end] &&
    b[b.length - 1 - end] === m[m.length - 1 - end]
  ) {
    end += 1;
  }

  const baseMiddle = b.slice(start, b.length - end).join("\n");
  const currentMiddle = c.slice(start, c.length - end).join("\n");
  const mineMiddle = m.slice(start, m.length - end).join("\n");

  let middle;
  let conflict = false;
  if (baseMiddle === currentMiddle) {
    middle = mineMiddle;
  } else if (baseMiddle === mineMiddle) {
    middle = currentMiddle;
  } else if (currentMiddle === mineMiddle) {
    middle = currentMiddle;
  } else {
    conflict = true;
    middle = `<<<<<<< Tu edición\n${mineMiddle}\n=======\n${currentMiddle}\n>>>>>>> Disco`;
  }

  const merged = [...b.slice(0, start), ...(middle === "" ? [] : [middle]), ...b.slice(b.length - end)].join("\n");
  return {
    text: targetEol === "\n" ? merged : merged.replaceAll("\n", targetEol),
    conflict
  };
}

function asValue(value) {
  return JSON.stringify(value ?? null);
}

function parseBase(base) {
  const raw = String(base?.rawFrontmatter ?? "");
  const body = String(base?.body ?? "");
  const withNewline = raw === "" || raw.endsWith("\n") ? raw : `${raw}\n`;
  return parseFrontmatter(`---\n${withNewline}---\n${body}`);
}

export function buildConflictPreview(root, path, base, edits = {}) {
  const abs = join(root, path);
  const currentContent = readFileSync(abs, "utf8");
  const current = parseFrontmatter(currentContent);
  const baseParsed = parseBase(base);
  const baseRaw = baseParsed.raw ?? "";
  const baseBody = baseParsed.body ?? "";
  const currentRaw = current.raw ?? "";
  const updates = edits.updates && typeof edits.updates === "object" ? edits.updates : {};
  const editedBody = typeof edits.body === "string" ? edits.body : baseBody;
  const rawEdited =
    typeof edits.rawFrontmatter === "string" && edits.rawFrontmatter !== baseRaw;
  const mineRaw = (() => {
    if (rawEdited) return edits.rawFrontmatter;
    if (Object.keys(updates).length === 0) return baseRaw;
    const baseContent = `---\n${baseRaw === "" || baseRaw.endsWith("\n") ? baseRaw : `${baseRaw}\n`}---\n${baseBody}`;
    return splitFrontmatter(setFrontmatterFields(baseContent, updates)).raw ?? baseRaw;
  })();

  const frontmatterConflicts = [];
  let mergedRaw = currentRaw;
  if (rawEdited) {
    if (currentRaw === baseRaw) {
      mergedRaw = edits.rawFrontmatter;
    } else {
      frontmatterConflicts.push("frontmatter");
    }
  } else if (Object.keys(updates).length > 0) {
    const apply = {};
    for (const [key, value] of Object.entries(updates)) {
      const baseValue = baseParsed.meta?.[key];
      const currentValue = current.meta?.[key];
      if (asValue(currentValue) === asValue(baseValue) || asValue(currentValue) === asValue(value)) {
        apply[key] = value;
      } else {
        frontmatterConflicts.push(key);
      }
    }
    if (Object.keys(apply).length > 0) {
      const mergedContent = setFrontmatterFields(currentContent, apply);
      mergedRaw = splitFrontmatter(mergedContent).raw ?? currentRaw;
    }
  }

  const mergedBody = mergeBodies(baseBody, current.body, editedBody);

  return {
    path,
    base: {
      hash: base?.hash ?? null,
      rawFrontmatter: baseRaw,
      body: baseBody
    },
    current: {
      hash: sha256(currentContent),
      rawFrontmatter: currentRaw,
      body: current.body
    },
    mine: {
      rawFrontmatter: mineRaw,
      body: editedBody
    },
    merged: {
      rawFrontmatter: mergedRaw,
      body: mergedBody.text
    },
    conflicts: {
      frontmatter: frontmatterConflicts,
      body: mergedBody.conflict
    }
  };
}
