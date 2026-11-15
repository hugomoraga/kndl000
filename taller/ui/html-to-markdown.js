const SKIP_TAGS = new Set([
  "script",
  "style",
  "head",
  "noscript",
  "template",
  "svg",
  "iframe",
  "video",
  "audio"
]);

const BLOCK_TAGS = new Set([
  "address",
  "article",
  "aside",
  "details",
  "div",
  "figcaption",
  "figure",
  "footer",
  "header",
  "main",
  "nav",
  "section",
  "summary"
]);

function escapeText(value) {
  return String(value).replace(/([\\*_`[\]])/g, "\\$1");
}

function safeUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) return "";
  if (/^(?:https?:|mailto:)/i.test(url)) return /[\s()<>]/.test(url) ? `<${url}>` : url;
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("./") || url.startsWith("../")) {
    return /\s/.test(url) ? `<${url}>` : url;
  }
  return "";
}

function codeFence(text) {
  let fence = "```";
  while (text.includes(fence)) fence += "`";
  return fence;
}

function inlineContent(node) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && ["UL", "OL"].includes(child.tagName)) continue;
    out += nodeToMarkdown(child);
  }
  return out;
}

function listToMarkdown(list, ordered) {
  const items = [...list.children].filter((child) => child.tagName === "LI");
  return items
    .map((item, index) => {
      const checkbox = [...item.querySelectorAll('input[type="checkbox"]')][0] ?? null;
      let body = inlineContent(item).replace(/\s+/g, " ").trim();
      if (checkbox) body = body.replace(/^\[[ xX]\]\s*/, "").trim();
      let prefix = ordered ? `${index + 1}. ` : "- ";
      if (checkbox) prefix += checkbox.checked ? "[x] " : "[ ] ";
      let line = `${prefix}${body}`;
      for (const child of item.children) {
        if (!["UL", "OL"].includes(child.tagName)) continue;
        const nested = listToMarkdown(child, child.tagName === "OL");
        line += `\n${nested
          .split("\n")
          .map((part) => (part ? `  ${part}` : part))
          .join("\n")}`;
      }
      return line;
    })
    .join("\n");
}

function tableAlignment(cell) {
  const explicit = String(cell.getAttribute("align") ?? "").toLowerCase();
  if (["left", "center", "right"].includes(explicit)) return explicit;
  const style = String(cell.style?.textAlign ?? "").toLowerCase();
  if (["left", "center", "right"].includes(style)) return style;
  return "left";
}

function tableToMarkdown(table) {
  const rows = [...table.querySelectorAll("tr")];
  if (rows.length === 0) return "";
  const data = rows.map((row) =>
    [...row.children]
      .filter((cell) => ["TH", "TD"].includes(cell.tagName))
      .map((cell) => ({
        text: inlineContent(cell)
          .replace(/\s+/g, " ")
          .replaceAll("|", "\\|")
          .trim(),
        align: tableAlignment(cell)
      }))
  );
  const columns = Math.max(...data.map((row) => row.length));
  if (columns === 0) return "";
  const formatRow = (row) =>
    `| ${Array.from({ length: columns }, (_, index) => row[index]?.text ?? "").join(" | ")} |`;
  const alignments = Array.from(
    { length: columns },
    (_, index) => data[0][index]?.align ?? "left"
  );
  const separator = `| ${alignments
    .map((align) => (align === "center" ? ":---:" : align === "right" ? "---:" : "---"))
    .join(" | ")} |`;
  return [formatRow(data[0]), separator, ...data.slice(1).map(formatRow)].join("\n");
}

function blockChildren(node) {
  let out = "";
  for (const child of node.childNodes) out += nodeToMarkdown(child);
  return out;
}

function nodeToMarkdown(node) {
  if (node.nodeType === 3) return escapeText(String(node.nodeValue ?? "").replace(/\s+/g, " "));
  if (node.nodeType !== 1) return "";
  const tag = String(node.tagName ?? "").toLowerCase();
  if (SKIP_TAGS.has(tag)) return "";
  if (tag === "br") return "  \n";
  if (tag === "hr") return "---\n\n";
  if (/^h[1-6]$/.test(tag)) {
    return `${"#".repeat(Number(tag[1]))} ${inlineContent(node).trim()}\n\n`;
  }
  if (tag === "p") return `${inlineContent(node).trim()}\n\n`;
  if (tag === "blockquote") {
    const inner = blockChildren(node).trim();
    return `${inner
      .split("\n")
      .map((line) => (line ? `> ${line}` : ">"))
      .join("\n")}\n\n`;
  }
  if (tag === "pre") {
    const codeNode = node.querySelector?.("code") ?? null;
    const language =
      [...node.classList].find((name) => name.startsWith("language-")) ??
      [...(codeNode?.classList ?? [])].find((name) => name.startsWith("language-"));
    const code = node.textContent ?? "";
    const fence = codeFence(code);
    return `${fence}${language ? language.replace("language-", "") : ""}\n${code}${
      code.endsWith("\n") ? "" : "\n"
    }${fence}\n\n`;
  }
  if (tag === "ul" || tag === "ol") return `${listToMarkdown(node, tag === "ol")}\n\n`;
  if (tag === "table") return `${tableToMarkdown(node)}\n\n`;
  if (tag === "strong" || tag === "b") return `**${inlineContent(node).trim()}**`;
  if (tag === "em" || tag === "i") return `*${inlineContent(node).trim()}*`;
  if (tag === "del" || tag === "s" || tag === "strike") {
    return `~~${inlineContent(node).trim()}~~`;
  }
  if (tag === "code" || tag === "kbd" || tag === "samp") {
    const code = node.textContent ?? "";
    const fence = code.includes("`") ? "``" : "`";
    return `${fence}${code}${fence}`;
  }
  if (tag === "a") {
    const label = inlineContent(node).trim() || node.textContent || "";
    const url = safeUrl(node.getAttribute("href"));
    return url ? `[${label}](${url})` : label;
  }
  if (tag === "img") {
    const alt = String(node.getAttribute("alt") ?? "").replaceAll("[", "\\[").replaceAll("]", "\\]");
    const url = safeUrl(node.getAttribute("src"));
    return url ? `![${alt}](${url})` : alt;
  }
  if (tag === "input") {
    if (String(node.getAttribute("type") ?? "").toLowerCase() === "checkbox") {
      return node.checked ? "[x] " : "[ ] ";
    }
    return "";
  }
  if (BLOCK_TAGS.has(tag)) return blockChildren(node);
  return inlineContent(node);
}

export function htmlToMarkdown(html) {
  if (typeof DOMParser === "undefined") return "";
  const source = String(html ?? "");
  if (source.trim() === "") return "";
  const document = new DOMParser().parseFromString(source, "text/html");
  return blockChildren(document.body)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
