function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeUrl(raw) {
  const url = String(raw ?? "").trim();
  if (!url) return "#";
  if (/^(?:https?:|mailto:)/i.test(url)) return escapeHtml(url);
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("./") || url.startsWith("../")) {
    return escapeHtml(url);
  }
  return "#";
}

function inline(text) {
  let value = escapeHtml(text);
  value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => {
    return `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`;
  });
  value = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    return `<a href="${safeUrl(url)}" rel="noopener noreferrer">${label}</a>`;
  });
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  value = value.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  value = value.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  value = value.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  return value;
}

function splitTableRow(line) {
  let row = String(line ?? "").trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  const cells = [];
  let buffer = "";
  for (let index = 0; index < row.length; index++) {
    const char = row[index];
    if (char === "\\" && row[index + 1] === "|") {
      buffer += "|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(buffer.trim());
      buffer = "";
      continue;
    }
    buffer += char;
  }
  cells.push(buffer.trim());
  return cells;
}

function tableAlignment(line) {
  const cells = splitTableRow(line);
  if (cells.length === 0) return null;
  const alignments = cells.map((cell) => {
    if (!/^:?-{3,}:?$/.test(cell)) return null;
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.startsWith(":")) return "left";
    if (cell.endsWith(":")) return "right";
    return "left";
  });
  return alignments.some((value) => value === null) ? null : alignments;
}

function isTableStart(lines, index) {
  if (index + 1 >= lines.length) return false;
  if (!lines[index].includes("|")) return false;
  return tableAlignment(lines[index + 1]) !== null;
}

function renderTable(lines, startIndex) {
  const header = splitTableRow(lines[startIndex]);
  const alignments = tableAlignment(lines[startIndex + 1]);
  let index = startIndex + 2;
  const rows = [];
  while (index < lines.length && lines[index].includes("|") && lines[index].trim() !== "") {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }
  const renderCell = (tag, value, column) => {
    const alignment = alignments[column] ?? "left";
    return `<${tag} class="md-align-${alignment}">${inline(value)}</${tag}>`;
  };
  const head = header
    .map((cell, column) => renderCell("th", cell, column))
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${header
          .map((_, column) => renderCell("td", row[column] ?? "", column))
          .join("")}</tr>`
    )
    .join("");
  return {
    html: `<div class="md-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
    nextIndex: index
  };
}

function renderListItems(lines, startIndex, ordered) {
  const pattern = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
  const items = [];
  let index = startIndex;
  let hasTasks = false;
  while (index < lines.length && pattern.test(lines[index])) {
    const item = lines[index].replace(pattern, "");
    const task = item.match(/^\[([ xX])\]\s+(.*)$/);
    if (task) {
      hasTasks = true;
      const checked = task[1].toLowerCase() === "x";
      items.push(
        `<li class="md-task"><input type="checkbox" disabled${
          checked ? " checked" : ""
        }> <span>${inline(task[2])}</span></li>`
      );
    } else {
      items.push(`<li>${inline(item)}</li>`);
    }
    index += 1;
  }
  const tag = ordered ? "ol" : "ul";
  return {
    html: `<${tag}${hasTasks ? ' class="md-task-list"' : ""}>${items.join("")}</${tag}>`,
    nextIndex: index
  };
}

export function renderMarkdown(markdown) {
  const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (/^\s*$/.test(line)) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```\s*/, "").trim();
      const buffer = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        buffer.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(
        `<pre class="md-code"${language ? ` data-language="${escapeHtml(language)}"` : ""}><code>${escapeHtml(
          buffer.join("\n")
        )}</code></pre>`
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/\s*\{#[\w-]+\}\s*$/, "");
      out.push(`<h${level}>${inline(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = renderTable(lines, index);
      out.push(table.html);
      index = table.nextIndex;
      continue;
    }

    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
      out.push("<hr>");
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buffer = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        buffer.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      out.push(`<blockquote>${renderMarkdown(buffer.join("\n"))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const list = renderListItems(lines, index, false);
      out.push(list.html);
      index = list.nextIndex;
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const list = renderListItems(lines, index, true);
      out.push(list.html);
      index = list.nextIndex;
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      !/^\s*$/.test(lines[index]) &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^```/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(lines[index]) &&
      !isTableStart(lines, index)
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    out.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }

  return out.join("\n");
}
