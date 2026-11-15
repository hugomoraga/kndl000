import { renderMarkdown } from "./markdown.js";
import { htmlToMarkdown } from "./html-to-markdown.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const LINKABLE_TYPES = new Set(["banco", "ciclo", "nota"]);
const PLAN_PREFIXES = [
  "docs/rizoma/",
  "content/collections/_exploraciones/",
  "content/collections/_nodos/",
  "rizoma/"
];
const PLANNED_KEY = "kndl-taller-plan";

const state = {
  registry: null,
  index: null,
  status: null,
  previewStatus: { running: false, url: null },
  filters: { q: "", type: "", estado: "" },
  current: null,
  editor: {
    mode: "body",
    rawDirty: false,
    dirty: false,
    plan: null,
    timer: null,
    previewError: null
  },
  dirtyResolver: null,
  planned: new Map(),
  planDialog: null,
  palette: { commands: [], selected: 0, filtered: [] },
  commit: { plan: null, input: null },
  conflict: null,
  linkSuggestions: { items: [], selected: 0 }
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function breadcrumb(path) {
  return esc(path);
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function today() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

async function api(path, { method = "GET", body, headers = {} } = {}) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.detail = data.detail ?? null;
    error.payload = data;
    throw error;
  }
  return data;
}

function formatError(error) {
  const line = error?.payload?.line ?? error?.line;
  if (!line) return error.message;
  const column = error?.payload?.column ?? error?.column;
  return `${error.message} (línea ${line}${column ? `, columna ${column}` : ""})`;
}

let toastTimer = null;
function toast(message, { error = false } = {}) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.toggle("error", error);
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), error ? 7000 : 3500);
}

function showDialog(dialog) {
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function dialogFor(element) {
  return element.closest("dialog");
}

async function boot() {
  bindEvents();
  applyTheme(document.documentElement.dataset.theme || "dark", { persist: false });
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  if (!isMac) {
    for (const key of $$("kbd")) {
      if (key.textContent.includes("⌘")) key.textContent = key.textContent.replaceAll("⌘", "Ctrl+");
    }
    const statusShortcuts = $(".status-shortcuts");
    if (statusShortcuts) {
      statusShortcuts.textContent = "Ctrl+S guardar · Ctrl+K comandos · Alt+Z enfoque";
    }
  }
  const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
  themeMedia.addEventListener?.("change", () => {
    try {
      if (!localStorage.getItem("kndl-taller-theme")) {
        applyTheme(themeMedia.matches ? "light" : "dark", { persist: false });
      }
    } catch {
      // Sin preferencia guardada disponible.
    }
  });
  if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(location.hostname)) {
    $("#host-warning").hidden = false;
  }
  try {
    const [registry, index, status, preview] = await Promise.all([
      api("/api/registry"),
      api("/api/index"),
      api("/api/status"),
      api("/api/preview-status")
    ]);
    state.registry = registry;
    state.index = index;
    state.status = status;
    state.previewStatus = preview;
    restorePlanned();
    renderFilters();
    renderAll();
    if (status.registryWarnings?.length) {
      toast(status.registryWarnings.map((item) => item.message).join("\n"));
    }
  } catch (error) {
    toast(`No se pudo abrir el taller: ${formatError(error)}`, { error: true });
    $("#repo-status").textContent = `Error: ${formatError(error)}`;
  }
  setInterval(refreshStatus, 30000);
}

async function refreshStatus() {
  try {
    state.status = await api("/api/status");
    state.previewStatus = await api("/api/preview-status");
    renderStatus();
    if (state.current) renderMargin();
  } catch {
    // El estado se reintenta en el próximo ciclo.
  }
}

async function refreshIndex() {
  state.index = await api("/api/index");
  renderFilters();
  renderAll();
}

function renderAll() {
  renderFilters();
  renderCounts();
  renderList();
  renderStatus();
  updateCommitCount();
}

function bindEvents() {
  $("#filter-q").addEventListener("input", (event) => {
    state.filters.q = event.target.value;
    renderList();
  });
  $("#filter-type").addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderList();
  });
  $("#filter-estado").addEventListener("change", (event) => {
    state.filters.estado = event.target.value;
    renderList();
  });

  $("#btn-palette").addEventListener("click", () => openPalette());
  $("#btn-theme").addEventListener("click", toggleTheme);
  $("#btn-focus").addEventListener("click", () => toggleFocusMode());
  $("#btn-back-list").addEventListener("click", () => {
    document.body.classList.remove("mobile-editor-open");
    scrollCurrentIntoView();
    $("#filter-q").focus();
  });
  initSplitHandle();
  $("#btn-new-note").addEventListener("click", () => openOperation("nueva-nota"));
  $("#btn-publish").addEventListener("click", () => openPalette("publicar"));
  $("#btn-commit").addEventListener("click", openCommitDialog);
  $("#btn-save").addEventListener("click", saveCurrent);
  $("#btn-discard").addEventListener("click", discardCurrent);
  $("#btn-reload").addEventListener("click", () => {
    if (state.current) openEntry(state.current.path);
  });

  $("#md-toolbar").addEventListener("mousedown", (event) => {
    if (event.target.closest("[data-md]")) event.preventDefault();
  });
  $("#md-toolbar").addEventListener("click", (event) => {
    const button = event.target.closest("[data-md]");
    if (button) applyMarkdownAction(button.dataset.md);
  });

  $("#tab-body").addEventListener("click", () => setTab("body"));
  $("#tab-split").addEventListener("click", () => setTab("split"));
  $("#tab-preview").addEventListener("click", () => setTab("preview"));
  $("#tab-yaml").addEventListener("click", () => setTab("yaml"));

  $("#meta-form").addEventListener("input", onEditorInput);
  $("#editor-body").addEventListener("input", onEditorInput);
  $("#editor-body").addEventListener("keydown", onEditorKeydown);
  $("#editor-body").addEventListener("paste", onEditorPaste);
  $("#editor-yaml").addEventListener("input", () => {
    state.editor.rawDirty = true;
    onEditorInput();
  });

  $("#link-destino").addEventListener("input", () => {
    state.linkSuggestions.selected = 0;
    $("#link-destino-hint").textContent = "";
    renderLinkSuggestions();
  });
  $("#link-destino").addEventListener("keydown", onLinkKeydown);
  $("#link-destino").addEventListener("blur", () => {
    setTimeout(() => hideLinkSuggestions(), 120);
  });

  $("#link-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.current) return;
    if (!LINKABLE_TYPES.has(state.current.type) || state.current.readOnly) {
      toast("Los vínculos viven solo en notas de banco.", { error: true });
      return;
    }
    const destino = $("#link-destino").value.trim();
    const motivo = $("#link-motivo").value.trim();
    if (!destino || !motivo) {
      toast("Un vínculo necesita destino y motivo.", { error: true });
      return;
    }
    openOperation("vincular", { source: state.current.path, destino, motivo });
    $("#link-destino").value = "";
    $("#link-destino-hint").textContent = "";
    $("#link-motivo").value = "";
    hideLinkSuggestions();
  });

  const input = $("#attach-input");
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) prepareAttachment(file);
    input.value = "";
  });
  const drop = $("#drop-zone");
  for (const type of ["dragenter", "dragover"]) {
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.add("dragover");
    });
  }
  for (const type of ["dragleave", "drop"]) {
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.remove("dragover");
    });
  }
  drop.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) prepareAttachment(file);
  });
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  $("#palette-input").addEventListener("input", () => renderPalette());
  $("#palette-input").addEventListener("keydown", onPaletteKeydown);

  $("#plan-cancel").addEventListener("click", () => closeDialog($("#plan-dialog")));
  $("#plan-apply").addEventListener("click", applyCurrentPlan);
  $("#result-close").addEventListener("click", () => closeDialog($("#result-dialog")));
  $("#dirty-cancel").addEventListener("click", () => resolveDirty(false));
  $("#dirty-discard").addEventListener("click", () => {
    state.editor.dirty = false;
    state.editor.plan = null;
    resolveDirty(true);
  });
  $("#dirty-save").addEventListener("click", async () => {
    const saved = await saveCurrent({ reload: false });
    if (saved) {
      state.editor.dirty = false;
      resolveDirty(true);
    } else {
      resolveDirty(false);
    }
  });
  $("#dirty-dialog").addEventListener("close", () => {
    if (state.dirtyResolver) resolveDirty(false);
  });
  $("#conflict-cancel").addEventListener("click", () => closeDialog($("#conflict-dialog")));
  $("#conflict-save").addEventListener("click", saveConflictResult);
  $("#conflict-use-current").addEventListener("click", () => useConflictSide("current"));
  $("#conflict-use-mine").addEventListener("click", () => useConflictSide("mine"));
  $("#conflict-use-merged").addEventListener("click", () => useConflictSide("merged"));
  $("#override-reason").addEventListener("input", updatePlanApplyState);

  $("#operation-form").addEventListener("submit", submitOperation);
  $("#operation-cancel").addEventListener("click", () => closeDialog($("#operation-dialog")));

  $("#commit-prepare").addEventListener("click", prepareCommit);
  $("#commit-apply").addEventListener("click", applyCommit);
  $("#adopt-dirty").addEventListener("click", adoptDirtyChanges);
  $("#commit-dirty").addEventListener("change", updateAdoptButton);
  $("#push-button").addEventListener("click", () => openOperation("push"));
  $("#commit-override").addEventListener("input", updateCommitApplyState);
  $("#commit-dialog").addEventListener("close", () => {
    state.commit.plan = null;
    state.commit.input = null;
  });

  for (const button of $$("[data-close]")) {
    button.addEventListener("click", () => closeDialog(dialogFor(button)));
  }

  document.addEventListener("keydown", onGlobalKeydown);
  window.addEventListener("beforeunload", (event) => {
    if (!state.editor.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function onGlobalKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openPalette();
    return;
  }
  const target = event.target;
  const typing =
    target instanceof Element &&
    (target.matches("input, textarea, select, [contenteditable='true']") ||
      Boolean(target.closest("dialog[open]")));
  if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key === "/") {
    event.preventDefault();
    toggleFocusMode(false);
    $("#filter-q").focus();
    $("#filter-q").select();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    if (state.current) {
      event.preventDefault();
      saveCurrent();
    }
    return;
  }
  if (event.altKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    toggleFocusMode();
    return;
  }
  if (event.altKey && event.key.toLowerCase() === "t") {
    event.preventDefault();
    toggleTheme();
    return;
  }
  if (event.altKey && event.key === "1") {
    event.preventDefault();
    toggleFocusMode(false);
    $("#filter-q").focus();
    return;
  }
  if (event.altKey && event.key === "2") {
    event.preventDefault();
    if (state.current && ["preview", "yaml"].includes(state.editor.mode)) {
      setTab("split", false);
    }
    $("#editor-body").focus();
    return;
  }
  if (event.altKey && event.key === "3") {
    event.preventDefault();
    toggleFocusMode(false);
    $("#margen").querySelector("button, a, input, textarea")?.focus();
    return;
  }
  if (event.key === "Escape") {
    const open = $$("dialog[open]");
    if (open.length > 0) {
      event.preventDefault();
      closeDialog(open.at(-1));
    }
  }
}

function renderFilters() {
  const typeSelect = $("#filter-type");
  const currentType = typeSelect.value;
  typeSelect.innerHTML = '<option value="">Todos</option>';
  for (const type of state.registry?.types ?? []) {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.label;
    typeSelect.append(option);
  }
  typeSelect.value = currentType;

  const estadoSelect = $("#filter-estado");
  const currentEstado = estadoSelect.value;
  const estados = [...new Set((state.index?.entries ?? []).map((entry) => entry.estado))].sort();
  estadoSelect.innerHTML = '<option value="">Todos</option>';
  for (const estado of estados) {
    const option = document.createElement("option");
    option.value = estado;
    option.textContent = estado;
    estadoSelect.append(option);
  }
  estadoSelect.value = currentEstado;
}

function parseSearchQuery(raw) {
  const filters = {};
  const terms = [];
  const tokens = String(raw ?? "").match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  for (const token of tokens) {
    const match = token.match(/^(estado|tipo|path|titulo|publico|readonly|vinculo|adjunto):(.+)$/i);
    if (!match) {
      terms.push(normalize(token));
      continue;
    }
    filters[match[1].toLowerCase()] = normalize(match[2].replace(/^"|"$/g, ""));
  }
  return { filters, terms };
}

function entryMatchesQuery(entry, { filters, terms }) {
  const text = normalize(`${entry.title} ${entry.path} ${entry.estado} ${entry.typeLabel} ${entry.url ?? ""}`);
  if (!terms.every((term) => text.includes(term))) return false;
  if (filters.estado && !normalize(entry.estado).includes(filters.estado)) return false;
  if (filters.tipo && entry.type !== filters.tipo) return false;
  if (filters.path && !normalize(entry.path).includes(filters.path)) return false;
  if (filters.titulo && !normalize(entry.title).includes(filters.titulo)) return false;
  const truthy = (value) => ["si", "sí", "true", "1"].includes(value);
  const falsy = (value) => ["no", "false", "0"].includes(value);
  if (filters.publico) {
    if (truthy(filters.publico) && !entry.public) return false;
    if (falsy(filters.publico) && entry.public) return false;
  }
  if (filters.readonly) {
    if (truthy(filters.readonly) && !entry.readOnly) return false;
    if (falsy(filters.readonly) && entry.readOnly) return false;
  }
  if (filters.vinculo === "roto") {
    if (!entry.warnings?.some((warning) => warning.id === "vinculo-roto")) return false;
  }
  if (filters.adjunto === "roto") {
    if (!entry.warnings?.some((warning) => warning.id === "adjunto-faltante")) return false;
  } else if (filters.adjunto) {
    const hasAttachments = (entry.attachmentCount ?? 0) > 0;
    if (truthy(filters.adjunto) && !hasAttachments) return false;
    if (falsy(filters.adjunto) && hasAttachments) return false;
  }
  return true;
}

function filteredEntries() {
  const query = parseSearchQuery(state.filters.q);
  return (state.index?.entries ?? []).filter((entry) => {
    if (state.filters.type && entry.type !== state.filters.type) return false;
    if (state.filters.estado && entry.estado !== state.filters.estado) return false;
    return entryMatchesQuery(entry, query);
  });
}

function sortedEntries(entries) {
  const order = new Map((state.registry?.types ?? []).map((type, index) => [type.id, index]));
  return [...entries].sort((a, b) => {
    const typeDiff = (order.get(a.type) ?? 99) - (order.get(b.type) ?? 99);
    if (typeDiff !== 0) return typeDiff;
    const dateDiff = String(b.date).localeCompare(String(a.date));
    if (dateDiff !== 0) return dateDiff;
    return a.title.localeCompare(b.title, "es");
  });
}

function renderCounts() {
  const visible = filteredEntries();
  const byType = new Map();
  for (const entry of visible) byType.set(entry.type, (byType.get(entry.type) ?? 0) + 1);
  const chips = [...byType.entries()]
    .map(([type, count]) => {
      const label = state.registry?.types.find((candidate) => candidate.id === type)?.label ?? type;
      return `<span class="chip">${esc(label)} ${count}</span>`;
    })
    .join("");
  $("#counts").innerHTML = `<span class="chip">${visible.length} visibles</span><span class="chip">${
    state.index?.counts?.total ?? 0
  } en total</span>${chips}`;
  $("#list-total").textContent = `${visible.length} / ${state.index?.entries?.length ?? 0}`;
}

function renderList() {
  renderCounts();
  const list = $("#entry-list");
  list.innerHTML = "";
  const entries = sortedEntries(filteredEntries());
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No hay piezas con esos filtros.";
    list.append(li);
    return;
  }
  for (const entry of entries) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "entry";
    button.dataset.path = entry.path;
    button.setAttribute("aria-current", state.current?.path === entry.path ? "true" : "false");
    const warningText =
      entry.warnings?.length > 0
        ? `<span class="badge warn">${entry.warnings.length} advertencia${
            entry.warnings.length === 1 ? "" : "s"
          }</span>`
        : "";
    const publicText = entry.public
      ? '<span class="badge public">público</span>'
      : '<span class="badge work">trabajo</span>';
    const readonlyText = entry.readOnly ? '<span class="badge readonly">read-only</span>' : "";
    button.innerHTML = `
      <span class="entry-title">${esc(entry.title)}</span>
      <span class="entry-meta">
        <span class="badge">${esc(entry.typeLabel)}</span>
        <span class="badge">${esc(entry.estado)}</span>
        ${publicText}
        ${readonlyText}
        ${warningText}
      </span>
      <span class="entry-path" title="${esc(entry.path)}">${esc(entry.path)}</span>
    `;
    button.addEventListener("click", () => openEntry(entry.path));
    li.append(button);
    list.append(li);
  }
}

function scrollCurrentIntoView() {
  const active = document.querySelector('#entry-list .entry[aria-current="true"]');
  active?.scrollIntoView({ block: "nearest" });
}

function renderStatus() {
  const node = $("#repo-status");
  if (!state.status) {
    node.textContent = "Estado desconocido";
    return;
  }
  const { repo, tools } = state.status;
  const dirty = repo?.dirty ?? [];
  const dotClass = repo?.blockReason ? "blocked" : dirty.length > 0 ? "dirty" : "";
  const toolMissing = Object.entries(tools ?? {})
    .filter(([, tool]) => !tool.ok)
    .map(([id]) => id);
  const dirtyText =
    dirty.length > 0
      ? ` · ${dirty.length} cambio${dirty.length === 1 ? "" : "s"} fuera del plan`
      : "";
  const renameText = repo?.renames?.length
    ? " · rename detectado: los vínculos no se actualizan solos"
    : "";
  const toolText = toolMissing.length > 0 ? ` · faltan: ${toolMissing.join(", ")}` : "";
  const blockText = repo?.blockReason ? ` · ${repo.blockReason}` : "";
  node.innerHTML = `
    <span class="dot ${dotClass}" aria-hidden="true"></span>
    <span title="${esc(dirty.map((item) => item.path).join("\n"))}">
      ${esc(repo?.branch ?? "sin rama")} · ${esc((repo?.head ?? "").slice(0, 7))}${esc(dirtyText)}${esc(
        renameText
      )}${esc(toolText)}${esc(blockText)}
    </span>
  `;
  node.title = dirty.map((item) => `${item.status} ${item.path}`).join("\n");
}

async function openEntry(path, { force = false } = {}) {
  if (!force && state.editor.dirty) {
    const proceed = await confirmDirty();
    if (!proceed) return;
  }
  try {
    const item = await api(`/api/item?path=${encodeURIComponent(path)}`);
    clearTimeout(state.editor.timer);
    state.current = item;
    state.editor.mode = defaultEditorMode();
    state.editor.rawDirty = false;
    state.editor.dirty = false;
    state.editor.plan = null;
    state.editor.previewError = null;
    renderEditor();
    renderMargin();
    renderList();
    if (window.matchMedia("(min-width: 901px)").matches) scrollCurrentIntoView();
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.body.classList.add("mobile-editor-open");
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    $("#link-destino").value = "";
    $("#link-destino-hint").textContent = "";
    hideLinkSuggestions();
    $("#btn-publish").disabled = false;
  } catch (error) {
    toast(`No se pudo abrir ${path}: ${formatError(error)}`, { error: true });
  }
}

function renderEditor() {
  const item = state.current;
  if (!item) return;
  $("#editor-empty").hidden = true;
  $("#editor").hidden = false;
  $("#editor-type").textContent = `${item.typeLabel}${item.readOnly ? " · read-only" : ""}`;
  $("#editor-title").textContent = item.title;
  $("#editor-path").textContent = item.path;
  $("#editor-badges").innerHTML = `
    <span class="badge ${item.public ? "public" : "work"}">${item.public ? "público" : "trabajo"}</span>
    <span class="badge">${esc(item.estado)}</span>
    ${item.readOnly ? '<span class="badge readonly">read-only</span>' : ""}
    ${item.hash ? `<span class="badge">sha ${esc(item.hash.slice(0, 8))}</span>` : ""}
  `;

  renderMetaForm(item);
  const metaDetails = $("#meta-details");
  if (metaDetails) metaDetails.open = false;
  const metaSummary = $("#meta-summary");
  if (metaSummary) {
    metaSummary.textContent = [item.typeLabel, item.estado, item.date].filter(Boolean).join(" · ");
  }
  $("#editor-body").value = item.body ?? "";
  $("#editor-yaml").value = item.rawFrontmatter ?? "";
  $("#editor-body").disabled = item.readOnly;
  $("#editor-yaml").disabled = item.readOnly;
  $("#btn-save").disabled = item.readOnly;
  $("#btn-discard").disabled = item.readOnly;
  for (const button of $$("#md-toolbar [data-md]")) button.disabled = item.readOnly;
  $("#diff-state").textContent = "sin cambios";
  $("#editor-diff").textContent = "Sin cambios.";
  const details = $("#diff-details");
  if (details) details.open = false;
  setEditorState("clean", "en disco");
  updateEditorStats();
  $("#editor-hint").textContent = item.readOnly
    ? "Documento read-only: se puede leer, no editar."
    : "";

  setTab(state.editor.mode, false);
  renderPreviewPane();
}

function clearCurrent() {
  clearTimeout(state.editor.timer);
  document.body.classList.remove("mobile-editor-open");
  state.current = null;
  state.editor.plan = null;
  $("#editor").hidden = true;
  $("#editor-empty").hidden = false;
  $("#margin-content").hidden = true;
  $("#margin-empty").hidden = false;
  $("#btn-publish").disabled = true;
  renderList();
}

function renderMetaForm(item) {
  const form = $("#meta-form");
  form.innerHTML = "";
  const fields = item.fields ?? [];
  for (const field of fields) {
    if (field.type === "hidden") continue;
    const wrapper = document.createElement("label");
    wrapper.className = `field${
      field.type === "textarea" || field.type === "yaml" ? " wide" : ""
    }`;
    const label = document.createElement("span");
    label.textContent = field.label ?? field.name;
    wrapper.append(label);

    let input;
    if (field.type === "textarea" || field.type === "yaml") {
      input = document.createElement("textarea");
      input.rows = field.type === "yaml" ? 5 : 2;
    } else if (field.type === "select") {
      input = document.createElement("select");
      const values = [...(field.options ?? [])];
      const current = item.meta?.[field.name];
      if (current !== undefined && current !== null && !values.includes(String(current))) {
        values.push(String(current));
      }
      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        input.append(option);
      }
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.dataset.metaField = field.name;
    input.disabled = Boolean(item.readOnly);
    if (field.type === "checkbox") {
      input.checked = Boolean(item.meta?.[field.name]);
    } else {
      const value = item.meta?.[field.name];
      input.value =
        value === undefined || value === null
          ? ""
          : Array.isArray(value)
            ? value.join(", ")
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value);
    }
    wrapper.append(input);
    form.append(wrapper);
  }
  if (fields.length === 0) {
    form.innerHTML = '<p class="hint">Este tipo no declara campos de metadatos.</p>';
  }
}

function defaultEditorMode() {
  return "split";
}

function setTab(mode, focus = true) {
  state.editor.mode = mode;
  const isBody = mode === "body";
  const isSplit = mode === "split";
  const isPreview = mode === "preview";
  const isYaml = mode === "yaml";
  const sourcePane = $(".pane-source");
  const previewPane = $(".pane-preview");
  const yamlPane = $(".pane-yaml");
  if (sourcePane) sourcePane.hidden = !(isBody || isSplit);
  if (previewPane) previewPane.hidden = !(isPreview || isSplit);
  if (yamlPane) yamlPane.hidden = !isYaml;
  $(".body-wrap").classList.toggle("split", isSplit);
  $("#md-toolbar").hidden = !(isBody || isSplit) || Boolean(state.current?.readOnly);
  $("#md-help").hidden = !(isBody || isSplit) || Boolean(state.current?.readOnly);
  for (const [id, active] of [
    ["#tab-body", isBody],
    ["#tab-split", isSplit],
    ["#tab-preview", isPreview],
    ["#tab-yaml", isYaml]
  ]) {
    const button = $(id);
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  }
  if (isPreview || isSplit) renderPreviewPane();
  if (focus && isYaml) $("#editor-yaml").focus();
  if (focus && (isBody || isSplit)) $("#editor-body").focus();
}

function setEditorState(stateName, label) {
  const node = $("#editor-state");
  if (!node) return;
  node.dataset.state = stateName;
  node.textContent = label;
}

function updateEditorStats() {
  const text = $("#editor-body")?.value ?? "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const stats = $("#editor-stats");
  if (stats) {
    const charLabel = chars === 1 ? "carácter" : "caracteres";
    stats.textContent = `${words} palabra${words === 1 ? "" : "s"} · ${chars} ${charLabel}`;
  }
  const meta = $("#source-meta");
  if (meta) {
    const lines = text.split("\n").length;
    meta.textContent = `${lines} línea${lines === 1 ? "" : "s"}`;
  }
}

function applyTheme(theme, { persist = true } = {}) {
  const normalized = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = normalized;
  if (persist) {
    try {
      localStorage.setItem("kndl-taller-theme", normalized);
    } catch {
      // Preferencia de UI: si el navegador la bloquea, el tema sigue funcionando.
    }
  }
  const button = $("#btn-theme");
  if (button) {
    const next = normalized === "light" ? "oscuro" : "claro";
    button.setAttribute("aria-label", `Cambiar a modo ${next}`);
    button.title = `Cambiar a modo ${next} (Alt+T)`;
    button.setAttribute("aria-pressed", String(normalized === "light"));
  }
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
}

function toggleFocusMode(force) {
  const active =
    typeof force === "boolean" ? force : !document.body.classList.contains("focus-mode");
  document.body.classList.toggle("focus-mode", active);
  const button = $("#btn-focus");
  if (button) {
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Salir del modo enfoque" : "Modo enfoque");
  }
}

function initSplitHandle() {
  const handle = $("#split-handle");
  const wrap = $(".body-wrap");
  if (!handle || !wrap) return;
  let dragging = false;

  const setRatio = (ratio) => {
    const clamped = Math.min(0.75, Math.max(0.25, ratio));
    wrap.style.setProperty("--split-left", `${Math.round(clamped * 1000) / 10}%`);
    handle.setAttribute("aria-valuenow", String(Math.round(clamped * 100)));
  };

  const stop = (event) => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove("dragging");
    if (event?.pointerId !== undefined) {
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {
        // El puntero ya no está capturado.
      }
    }
  };

  handle.addEventListener("pointerdown", (event) => {
    if (!wrap.classList.contains("split")) return;
    dragging = true;
    handle.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const rect = wrap.getBoundingClientRect();
    setRatio((event.clientX - rect.left) / rect.width);
  });
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
  handle.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const current =
      parseFloat(wrap.style.getPropertyValue("--split-left")) || 50;
    setRatio((current + (event.key === "ArrowRight" ? 5 : -5)) / 100);
  });
}

const TABLE_TEMPLATE = "| Columna | Columna |\n| --- | --- |\n|  |  |";

function dispatchEditorInput(textarea) {
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function insertBlock(text) {
  const textarea = $("#editor-body");
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const lead = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const trail = after && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
  textarea.setRangeText(`${lead}${text}${trail}`, start, end, "end");
  dispatchEditorInput(textarea);
}

function wrapSelection(prefix, suffix, placeholder) {
  const textarea = $("#editor-body");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  textarea.setRangeText(`${prefix}${selected}${suffix}`, start, end, "end");
  if (start === end) {
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  }
  dispatchEditorInput(textarea);
}

function insertLink() {
  const textarea = $("#editor-body");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const label = textarea.value.slice(start, end) || "texto";
  const insertion = `[${label}](url)`;
  textarea.setRangeText(insertion, start, end, "end");
  const urlStart = start + label.length + 3;
  textarea.setSelectionRange(urlStart, urlStart + 3);
  dispatchEditorInput(textarea);
}

function prefixSelectedLines(prefix) {
  const textarea = $("#editor-body");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const from = value.lastIndexOf("\n", start - 1) + 1;
  let to = value.indexOf("\n", end);
  if (to === -1) to = value.length;
  const block = value.slice(from, to);
  const lines = block.split("\n").map((line) => {
    if (line.startsWith(prefix)) return line.slice(prefix.length);
    return `${prefix}${line}`;
  });
  textarea.setRangeText(lines.join("\n"), from, to, "end");
  dispatchEditorInput(textarea);
}

function applyMarkdownAction(action) {
  if (!state.current || state.current.readOnly) return;
  if (action === "h2") prefixSelectedLines("## ");
  else if (action === "bold") wrapSelection("**", "**", "texto");
  else if (action === "italic") wrapSelection("*", "*", "texto");
  else if (action === "code") wrapSelection("`", "`", "código");
  else if (action === "link") insertLink();
  else if (action === "table") insertBlock(TABLE_TEMPLATE);
  else if (action === "ul") prefixSelectedLines("- ");
  else if (action === "ol") prefixSelectedLines("1. ");
  else if (action === "quote") prefixSelectedLines("> ");
  else if (action === "hr") insertBlock("---");
}

function onEditorKeydown(event) {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "b" && !event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    applyMarkdownAction("bold");
  } else if (key === "i" && !event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    applyMarkdownAction("italic");
  } else if (key === "k" && event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    applyMarkdownAction("link");
  }
}

function looksLikeMarkdown(text) {
  const source = String(text ?? "");
  if (!source.trim()) return false;
  return (
    /(^|\n)\s*(?:#{1,6}\s|```|>\s|[-*+]\s|\d+[.)]\s)/.test(source) ||
    /(^|\n)\s*\|?\s*:?-{3,}:?\s*\|/.test(source)
  );
}

function onEditorPaste(event) {
  if (!state.current || state.current.readOnly) return;
  const clipboard = event.clipboardData;
  if (!clipboard) return;
  const html = clipboard.getData("text/html");
  const text = clipboard.getData("text/plain");
  if (!html) return;

  const htmlHasTable = /<table\b/i.test(html);
  const textHasTable = /(^|\n)\s*\|?\s*:?-{3,}:?\s*\|/.test(text);
  if (textHasTable) return;
  if (!htmlHasTable && looksLikeMarkdown(text)) return;
  if (!/<(table|h[1-6]|ul|ol|pre|blockquote|p|strong|em|a|code)\b/i.test(html)) return;

  const markdown = htmlToMarkdown(html);
  if (!markdown.trim()) return;
  event.preventDefault();
  insertBlock(markdown);
  toast("HTML pegado y convertido a Markdown.");
}

function renderPreviewPane() {
  const body = $("#editor-body").value;
  $("#editor-preview").innerHTML = renderMarkdown(body);
}

function onEditorInput() {
  state.editor.dirty = true;
  if (state.editor.mode === "preview" || state.editor.mode === "split") renderPreviewPane();
  setEditorState("dirty", "sin guardar");
  updateEditorStats();
  $("#diff-state").textContent = "actualizando…";
  clearTimeout(state.editor.timer);
  state.editor.timer = setTimeout(() => {
    previewSave().catch((error) => {
      state.editor.plan = null;
      $("#diff-state").textContent = "error";
      $("#editor-diff").textContent = `No se pudo previsualizar: ${formatError(error)}`;
    });
  }, 200);
}

function collectSaveInput() {
  const item = state.current;
  const updates = {};
  for (const input of $$("[data-meta-field]", $("#meta-form"))) {
    if (input.disabled) continue;
    const name = input.dataset.metaField;
    let next;
    if (input.type === "checkbox") next = input.checked;
    else next = input.value;
    const original = item.meta?.[name];
    const originalText =
      original === undefined || original === null
        ? ""
        : Array.isArray(original)
          ? original.join(", ")
          : typeof original === "object"
            ? JSON.stringify(original)
            : String(original);
    if (String(next) !== originalText) updates[name] = next;
  }
  const input = {
    path: item.path,
    hash: item.hash,
    body: $("#editor-body").value,
    updates
  };
  if (state.editor.rawDirty) input.rawFrontmatter = $("#editor-yaml").value;
  return input;
}

async function previewSave() {
  if (!state.current || state.current.readOnly) return null;
  const input = collectSaveInput();
  const plan = await api("/api/plan", { method: "POST", body: { operation: "guardar-nota", input } });
  state.editor.plan = { plan, input };
  const diff = plan.diff?.trim();
  $("#editor-diff").textContent = diff || "Sin cambios.";
  $("#diff-state").textContent = diff
    ? `${plan.paths.length} archivo(s) · ${plan.validations.filter((item) => !item.ok).length} aviso(s)`
    : "sin cambios";
  state.editor.dirty =
    Boolean(diff) || plan.validations.some((item) => item.id !== "conflicto" && !item.ok);
  setEditorState(diff ? "dirty" : "clean", diff ? "cambios sin guardar" : "sin cambios");
  if (plan.validations.some((item) => !item.ok)) {
    $("#diff-state").textContent += " · revisar validaciones";
  }
  return plan;
}

async function saveCurrent({ reload = true } = {}) {
  if (!state.current) return false;
  if (state.current.readOnly) {
    toast("Este documento es read-only.", { error: true });
    return false;
  }
  try {
    const plan = await previewSave();
    if (!plan) return false;
    if (plan.validations.some((item) => item.id === "conflicto" && !item.ok)) {
      await openConflictDialog();
      return false;
    }
    const result = await api("/api/apply", {
      method: "POST",
      body: {
        operation: "guardar-nota",
        input: state.editor.plan.input,
        fingerprint: plan.fingerprint
      }
    });
    toast(result.paths.length ? `Guardado: ${result.paths.join(", ")}` : "Sin cambios.");
    state.editor.dirty = false;
    setEditorState("saved", "guardado");
    addPlanned(result.paths, { operation: "guardar-nota", origin: state.current.path });
    await refreshIndex();
    await refreshStatus();
    if (reload) await openEntry(state.current.path, { force: true });
    return true;
  } catch (error) {
    if (error.status === 409) {
      $("#diff-state").textContent = "conflicto";
      setEditorState("conflict", "conflicto");
      $("#editor-hint").textContent =
        "El archivo cambió en disco. Abriendo la resolución de conflicto.";
      await openConflictDialog();
      return false;
    }
    toast(formatError(error), { error: true });
    return false;
  }
}

function resolveDirty(result) {
  const resolver = state.dirtyResolver;
  state.dirtyResolver = null;
  closeDialog($("#dirty-dialog"));
  resolver?.(result);
}

function confirmDirty() {
  if (!state.editor.dirty) return Promise.resolve(true);
  if (state.dirtyResolver) return Promise.resolve(false);
  $("#dirty-path").textContent = state.current?.path ?? "";
  showDialog($("#dirty-dialog"));
  return new Promise((resolve) => {
    state.dirtyResolver = resolve;
  });
}

function formatConflictSide(side) {
  const raw = String(side?.rawFrontmatter ?? "");
  const body = String(side?.body ?? "");
  const withNewline = raw === "" || raw.endsWith("\n") ? raw : `${raw}\n`;
  return `---\n${withNewline}---\n${body}`;
}

async function openConflictDialog({ baseItem = state.current, edits = null } = {}) {
  if (!baseItem) return;
  try {
    const current = await api(`/api/item?path=${encodeURIComponent(baseItem.path)}`);
    if (current.hash === baseItem.hash) {
      toast("No hay conflicto: el disco coincide con la base abierta.");
      return;
    }
    const editInput = edits ?? collectSaveInput();
    const editPayload = {
      body: editInput.body,
      updates: editInput.updates ?? {}
    };
    if (editInput.rawFrontmatter !== undefined) {
      editPayload.rawFrontmatter = editInput.rawFrontmatter;
    }
    const preview = await api("/api/conflict/preview", {
      method: "POST",
      body: {
        path: baseItem.path,
        base: {
          hash: baseItem.hash,
          rawFrontmatter: baseItem.rawFrontmatter,
          body: baseItem.body
        },
        edits: editPayload
      }
    });
    state.conflict = { preview, current, baseItem };
    $("#conflict-summary").textContent =
      `${baseItem.path} cambió en disco desde que lo abriste. Revisá las tres versiones y editá el resultado.`;
    $("#conflict-base").textContent = formatConflictSide(preview.base);
    $("#conflict-current").textContent = formatConflictSide(preview.current);
    $("#conflict-mine").textContent = formatConflictSide(preview.mine);
    $("#conflict-frontmatter").value = preview.merged.rawFrontmatter;
    $("#conflict-body").value = preview.merged.body;
    const warnings = [];
    if (preview.conflicts.frontmatter.length > 0) {
      warnings.push(
        `Frontmatter en conflicto: ${preview.conflicts.frontmatter.join(
          ", "
        )}. El resultado parte de la versión del disco; revisalo.`
      );
    }
    if (preview.conflicts.body) {
      warnings.push(
        "El cuerpo cambió en ambos lados y el merge propuesto tiene marcas de conflicto. Editá el resultado antes de guardar."
      );
    }
    $("#conflict-warnings").innerHTML = warnings
      .map((warning) => `<div class="warning">${esc(warning)}</div>`)
      .join("");
    $("#conflict-error").hidden = true;
    showDialog($("#conflict-dialog"));
    $("#conflict-frontmatter").focus();
  } catch (error) {
    toast(formatError(error), { error: true });
  }
}

function useConflictSide(side) {
  const conflict = state.conflict;
  if (!conflict) return;
  const data =
    side === "current"
      ? conflict.preview.current
      : side === "mine"
        ? conflict.preview.mine
        : conflict.preview.merged;
  $("#conflict-frontmatter").value = data.rawFrontmatter;
  $("#conflict-body").value = data.body;
}

async function saveConflictResult() {
  const conflict = state.conflict;
  if (!conflict || !state.current) return;
  const button = $("#conflict-save");
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Preparando…";
  $("#conflict-error").hidden = true;
  try {
    const input = {
      path: state.current.path,
      hash: conflict.current.hash,
      rawFrontmatter: $("#conflict-frontmatter").value,
      body: $("#conflict-body").value
    };
    const plan = await api("/api/plan", {
      method: "POST",
      body: { operation: "guardar-nota", input }
    });
    if (plan.validations.some((item) => item.id === "conflicto" && !item.ok)) {
      const baseItem = {
        path: state.current.path,
        hash: conflict.current.hash,
        rawFrontmatter: conflict.preview.current.rawFrontmatter,
        body: conflict.preview.current.body
      };
      await openConflictDialog({
        baseItem,
        edits: { rawFrontmatter: input.rawFrontmatter, body: input.body, updates: {} }
      });
      return;
    }
    closeDialog($("#conflict-dialog"));
    showPlan({ plan, label: "Resolver conflicto", input });
  } catch (error) {
    $("#conflict-error").hidden = false;
    $("#conflict-error").textContent = formatError(error);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function discardCurrent() {
  if (!state.current) return;
  openOperation("descartar", { path: state.current.path });
}

function renderMargin() {
  const item = state.current;
  if (!item) return;
  $("#margin-empty").hidden = true;
  $("#margin-content").hidden = false;
  $("#margin-state").textContent = `${item.typeLabel} · ${item.estado}`;
  $("#links-count").textContent = String(item.links?.length ?? 0);
  $("#backlinks-count").textContent = String(item.backlinks?.length ?? 0);
  $("#attachments-count").textContent = String(item.attachments?.length ?? 0);

  const canLink = LINKABLE_TYPES.has(item.type) && !item.readOnly;
  $("#link-form").hidden = !canLink;
  const warnings = item.warnings ?? [];
  $("#margin-warnings").innerHTML = warnings.length
    ? warnings
        .map(
          (warning) =>
            `<div class="warning${warning.id === "frontmatter" || warning.id === "lectura" ? " danger" : ""}">${esc(
              warning.message
            )}${warning.line ? ` <span class="meta">(línea ${warning.line})</span>` : ""}</div>`
        )
        .join("")
    : '<p class="hint">Sin advertencias.</p>';

  renderPreviewStatus(item);
  renderLinks(item);
  renderBacklinks(item);
  renderAttachments(item);
}

function renderPreviewStatus(item) {
  const node = $("#preview-status");
  if (!state.previewStatus.running) {
    node.innerHTML =
      'Jekyll no está corriendo. <span class="hint">El editor y el índice siguen disponibles.</span>';
    return;
  }
  if (item.url) {
    node.innerHTML = `<a href="${esc(state.previewStatus.url + item.url)}" target="_blank" rel="noopener noreferrer">Abrir ${esc(
      item.url
    )}</a>`;
  } else {
    node.innerHTML =
      'Jekyll está corriendo, pero esta pieza no tiene una página pública propia.';
  }
}

function renderLinks(item) {
  const node = $("#links-list");
  const links = item.links ?? [];
  const canLink = LINKABLE_TYPES.has(item.type) && !item.readOnly;
  if (links.length === 0) {
    node.innerHTML = `<p class="hint">${
      canLink
        ? "Sin vínculos salientes."
        : "Los vínculos se editan en notas de banco, no en piezas públicas."
    }</p>`;
    return;
  }
  node.innerHTML = "";
  for (const link of links) {
    const card = document.createElement("div");
    card.className = "margin-item";
    const badges = [
      link.external ? '<span class="badge">externo</span>' : "",
      link.missing ? '<span class="badge warn">destino faltante</span>' : ""
    ].join("");
    card.innerHTML = `
      <div class="row"><span class="destino">${esc(link.destino)}</span>${badges}</div>
      ${
        link.targetTitle
          ? `<div class="hint">→ ${esc(link.targetTitle)}${
              link.targetType ? ` · ${esc(link.targetType)}` : ""
            }</div>`
          : ""
      }
      <div class="motivo">${esc(link.motivo)}</div>
      <div class="meta">${esc(link.fecha)}</div>
    `;
    if (canLink) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn small ghost";
      remove.textContent = "Quitar";
      remove.addEventListener("click", () =>
        openOperation("desvincular", { source: item.path, destino: link.destino })
      );
      card.append(remove);
    }
    node.append(card);
  }
}

function linkDestinoFor(entry) {
  return entry.url || entry.path;
}

function linkCandidates(query) {
  if (!state.current || !LINKABLE_TYPES.has(state.current.type)) return [];
  const normalized = normalize(query).trim();
  const matches = (state.index?.entries ?? []).filter((entry) => {
    if (entry.path === state.current.path) return false;
    if (!normalized) return true;
    return normalize(
      `${entry.title} ${entry.path} ${entry.url ?? ""} ${entry.typeLabel} ${entry.estado}`
    ).includes(normalized);
  });
  return sortedEntries(matches).slice(0, 8);
}

function renderLinkSuggestions() {
  const list = $("#link-destino-list");
  state.linkSuggestions.items = linkCandidates($("#link-destino").value);
  if (state.linkSuggestions.selected >= state.linkSuggestions.items.length) {
    state.linkSuggestions.selected = Math.max(0, state.linkSuggestions.items.length - 1);
  }
  if (state.linkSuggestions.items.length === 0) {
    hideLinkSuggestions();
    return;
  }
  list.innerHTML = "";
  state.linkSuggestions.items.forEach((entry, index) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", String(index === state.linkSuggestions.selected));
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `
      <span class="title">${esc(entry.title)}</span>
      <span class="meta">${esc(entry.typeLabel)} · ${esc(entry.estado)} · ${esc(
        linkDestinoFor(entry)
      )}</span>
    `;
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      selectLinkSuggestion(entry);
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      selectLinkSuggestion(entry);
    });
    li.append(button);
    list.append(li);
  });
  list.hidden = false;
  $("#link-destino").setAttribute("aria-expanded", "true");
}

function hideLinkSuggestions() {
  $("#link-destino-list").hidden = true;
  $("#link-destino").setAttribute("aria-expanded", "false");
}

function selectLinkSuggestion(entry) {
  $("#link-destino").value = linkDestinoFor(entry);
  $("#link-destino-hint").textContent = `→ ${entry.title} · ${entry.typeLabel}${
    entry.estado ? ` · ${entry.estado}` : ""
  }`;
  hideLinkSuggestions();
  $("#link-motivo").focus();
}

function onLinkKeydown(event) {
  const list = $("#link-destino-list");
  if (list.hidden) return;
  const items = state.linkSuggestions.items;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.linkSuggestions.selected = Math.min(state.linkSuggestions.selected + 1, items.length - 1);
    renderLinkSuggestions();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.linkSuggestions.selected = Math.max(state.linkSuggestions.selected - 1, 0);
    renderLinkSuggestions();
  } else if (event.key === "Enter") {
    const entry = items[state.linkSuggestions.selected];
    if (entry) {
      event.preventDefault();
      selectLinkSuggestion(entry);
    }
  } else if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    hideLinkSuggestions();
  } else if (event.key === "Tab") {
    hideLinkSuggestions();
  }
}

function renderBacklinks(item) {
  const node = $("#backlinks-list");
  const backlinks = item.backlinks ?? [];
  if (backlinks.length === 0) {
    node.innerHTML = '<p class="hint">Sin backlinks.</p>';
    return;
  }
  node.innerHTML = "";
  for (const backlink of backlinks) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "entry";
    button.innerHTML = `
      <span class="entry-title">${esc(backlink.title)}</span>
      <span class="entry-path">${esc(backlink.path)}</span>
      <span class="hint">${esc(backlink.motivo)}</span>
    `;
    button.addEventListener("click", () => openEntry(backlink.path));
    node.append(button);
  }
}

function renderAttachments(item) {
  const node = $("#attachments-list");
  const attachments = item.attachments ?? [];
  if (attachments.length === 0) {
    node.innerHTML = '<p class="hint">Sin adjuntos.</p>';
    return;
  }
  node.innerHTML = "";
  for (const attachment of attachments) {
    const card = document.createElement("div");
    card.className = "margin-item";
    const size = attachment.size === null ? "falta" : formatBytes(attachment.size);
    card.innerHTML = `
      <div class="row"><strong>${esc(attachment.titulo)}</strong><span class="badge">${esc(
        attachment.tipo || "otro"
      )}</span></div>
      <div class="destino">${esc(attachment.archivo)}</div>
      <div class="meta">${esc(size)}${attachment.nota ? ` · ${esc(attachment.nota)}` : ""}</div>
    `;
    const actions = document.createElement("div");
    actions.className = "actions";
    if (attachment.exists) {
      const open = document.createElement("a");
      open.className = "btn small ghost";
      open.href = attachment.url;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "Abrir";
      actions.append(open);
    }
    const unlink = document.createElement("button");
    unlink.type = "button";
    unlink.className = "btn small ghost";
    unlink.textContent = "Desvincular";
    unlink.addEventListener("click", () =>
      openOperation("desvincular-adjunto", { source: item.path, archivo: attachment.archivo })
    );
    actions.append(unlink);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn small ghost";
    remove.textContent = "Borrar…";
    remove.addEventListener("click", () =>
      openOperation("borrar-adjunto", { source: item.path, archivo: attachment.archivo, confirm: false })
    );
    actions.append(remove);
    card.append(actions);
    node.append(card);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function persistPlanned() {
  try {
    localStorage.setItem(PLANNED_KEY, JSON.stringify([...state.planned.entries()]));
  } catch {
    // Si el navegador bloquea localStorage, el plan sigue en memoria.
  }
}

function restorePlanned() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(PLANNED_KEY) ?? "null");
  } catch {
    data = null;
  }
  if (!Array.isArray(data)) {
    updateCommitCount();
    return;
  }
  const dirty = new Set((state.status?.repo?.dirty ?? []).map((item) => item.path));
  const entries = [];
  for (const pair of data) {
    if (!Array.isArray(pair) || pair.length !== 2) continue;
    const [path, info] = pair;
    if (typeof path !== "string" || !path || !PLAN_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      continue;
    }
    if (dirty.size > 0 && !dirty.has(path)) continue;
    entries.push([
      path,
      {
        operation: String(info?.operation ?? "cambios manuales"),
        origin: String(info?.origin ?? ""),
        override: info?.override ?? null
      }
    ]);
  }
  state.planned = new Map(entries);
  updateCommitCount();
}

function addPlanned(paths, info) {
  for (const path of paths ?? []) {
    state.planned.set(path, info);
  }
  updateCommitCount();
}

function updateCommitCount() {
  $("#commit-count").textContent = String(state.planned.size);
  $("#btn-commit").disabled = state.planned.size === 0;
  persistPlanned();
}

async function prepareAttachment(file) {
  if (!state.current) {
    toast("Abrí una nota antes de adjuntar.", { error: true });
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    toast("El archivo supera el límite de 25 MB.", { error: true });
    return;
  }
  try {
    const plan = await api("/api/attach/plan", {
      method: "POST",
      body: {
        note: state.current.path,
        filename: file.name,
        size: file.size,
        title: file.name,
        tipo: "",
        nota: ""
      }
    });
    const label = `Adjuntar ${plan.meta?.filename ?? file.name}`;
    showPlan({
      plan,
      label,
      input: null,
      apply: async () => {
        const response = await fetch(
          `/api/attach/apply?token=${encodeURIComponent(plan.meta.token)}`,
          {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/octet-stream" },
            body: file
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data.error || `HTTP ${response.status}`);
          error.status = response.status;
          throw error;
        }
        return data;
      }
    });
  } catch (error) {
    toast(formatError(error), { error: true });
  }
}

function openPalette(filterText = "") {
  const filter = typeof filterText === "string" ? filterText : "";
  const commands = paletteCommands();
  state.palette.commands = commands;
  state.palette.selected = 0;
  $("#palette-input").value = filter;
  $("#palette-dialog").querySelector(".dialog-head h2").textContent = filter
    ? "Publicar…"
    : "Comandos";
  renderPalette();
  showDialog($("#palette-dialog"));
  $("#palette-input").focus();
  $("#palette-input").select();
}

function paletteCommands() {
  const commands = [];
  for (const operation of state.registry?.operations ?? []) {
    if (!operation.palette) continue;
    commands.push({
      label: operation.label,
      description: operation.description,
      run: () => openOperation(operation.id)
    });
  }
  commands.push(
    {
      label: "Guardar la pieza abierta",
      description: "Guarda con diff explícito. Atajo ⌘S.",
      run: () => saveCurrent()
    },
    {
      label: "Descartar cambios de la pieza",
      description: "Vuelve a HEAD o elimina el archivo nuevo.",
      run: () => discardCurrent()
    },
    {
      label: "Recargar la pieza desde disco",
      description: "Descarta la edición en memoria, no el archivo.",
      run: () => state.current && openEntry(state.current.path)
    },
    {
      label: "Abrir commit",
      description: "Revisa paths, chequeos y mensaje.",
      run: () => openCommitDialog()
    },
    {
      label: "Cambiar tema",
      description: "Alterna cámara oscura y arena clara.",
      run: () => toggleTheme()
    },
    {
      label: "Modo enfoque",
      description: "Oculta banco y margen. Atajo Alt+Z.",
      run: () => toggleFocusMode()
    },
    {
      label: "Ir al banco",
      description: "Foco en la búsqueda.",
      run: () => {
        toggleFocusMode(false);
        $("#filter-q").focus();
      }
    },
    {
      label: "Ir al editor",
      description: "Foco en el cuerpo.",
      run: () => {
        if (!state.current) return;
        if (["preview", "yaml"].includes(state.editor.mode)) setTab("split", false);
        $("#editor-body").focus();
      }
    },
    {
      label: "Recargar índice",
      description: "Vuelve a leer el working tree.",
      run: () => refreshIndex()
    }
  );
  return commands;
}

function renderPalette() {
  const query = normalize($("#palette-input").value);
  const filtered = state.palette.commands.filter((command) =>
    normalize(`${command.label} ${command.description}`).includes(query)
  );
  state.palette.filtered = filtered;
  if (state.palette.selected >= filtered.length) state.palette.selected = 0;
  const list = $("#palette-list");
  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = '<li class="palette-empty hint">Sin comandos.</li>';
    return;
  }
  filtered.forEach((command, index) => {
    const li = document.createElement("li");
    li.setAttribute("aria-selected", String(index === state.palette.selected));
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `
      <span class="label">${esc(command.label)}</span>
      <span class="description">${esc(command.description)}</span>
    `;
    button.addEventListener("click", () => {
      closeDialog($("#palette-dialog"));
      command.run();
    });
    li.append(button);
    list.append(li);
  });
}

function onPaletteKeydown(event) {
  const filtered = state.palette.filtered;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.palette.selected = Math.min(state.palette.selected + 1, filtered.length - 1);
    renderPalette();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.palette.selected = Math.max(state.palette.selected - 1, 0);
    renderPalette();
  } else if (event.key === "Enter") {
    event.preventDefault();
    const command = filtered[state.palette.selected];
    if (command) {
      closeDialog($("#palette-dialog"));
      command.run();
    }
  }
}

function operationPrefill(operationId) {
  const item = state.current;
  if (!item) return {};
  if (operationId === "nueva-nota") return {};
  const prefill = {
    path: item.path,
    source: item.path,
    notePath: item.path,
    note: item.path,
    title: item.meta?.title ?? item.title
  };
  if (item.meta?.question) prefill.question = item.meta.question;
  if (item.meta?.pregunta) prefill.pregunta = item.meta.pregunta;
  if (item.meta?.summary) prefill.summary = item.meta.summary;
  if (item.meta?.definition) prefill.definition = item.meta.definition;
  if (Array.isArray(item.meta?.nodos)) prefill.nodos = item.meta.nodos.join(", ");
  if (item.meta?.exploracion) prefill.exploracion = item.meta.exploracion;
  if (item.type === "exploracion" && item.url) prefill.exploracion = item.url;
  if (item.meta?.estado) prefill.estado = item.meta.estado;
  if (item.meta?.status) prefill.status = item.meta.status;
  prefill.word = item.title;
  if (operationId === "nueva-exploracion" && ["nota", "banco", "ciclo"].includes(item.type)) {
    prefill.copyBodyFrom = item.path;
  }
  return prefill;
}

function openOperation(operationId, extra = {}) {
  const operation = state.registry?.operations?.find((candidate) => candidate.id === operationId);
  if (!operation) {
    toast(`Operación desconocida: ${operationId}`, { error: true });
    return;
  }
  const prefill = { ...operationPrefill(operationId), ...extra };
  $("#operation-title").textContent = operation.label;
  $("#operation-description").textContent = operation.description ?? "";
  const form = $("#operation-form");
  form.innerHTML = "";
  form.dataset.operation = operationId;

  for (const field of operation.fields ?? []) {
    form.append(renderOperationField(field, prefill[field.name]));
  }
  if ((operation.fields ?? []).length === 0) {
    form.innerHTML = '<p class="hint">Esta operación no tiene campos.</p>';
  }
  showDialog($("#operation-dialog"));
  const focusable = form.querySelector("input:not([type=hidden]), textarea, select, button");
  focusable?.focus();
}

function renderOperationField(field, value) {
  if (field.type === "hidden") {
    const input = document.createElement("input");
    input.type = "hidden";
    input.dataset.inputName = field.name;
    input.value = value ?? "";
    return input;
  }

  const wrapper = document.createElement("label");
  wrapper.className = `form-field${field.type === "checkbox" ? " checkbox" : ""}`;

  let input;
  if (field.type === "checkbox") {
    input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(value ?? false);
  } else if (field.type === "select") {
    input = document.createElement("select");
    for (const optionValue of field.options ?? []) {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      input.append(option);
    }
    if (value !== undefined && value !== null && value !== "") input.value = String(value);
  } else if (field.type === "textarea" || field.type === "yaml") {
    input = document.createElement("textarea");
    input.rows = field.type === "yaml" ? 7 : 3;
    input.value =
      value ??
      (field.name === "fuentes"
        ? `- autor: ""\n  titulo: ""\n  url: ""\n  consultado: ${today()}\n  verifica: ""\n`
        : "");
  } else {
    input = document.createElement("input");
    input.type = "text";
    input.value = value ?? field.default ?? "";
  }

  input.dataset.inputName = field.name;
  if (field.type === "path") {
    const listId = `paths-${field.name}`;
    input.setAttribute("list", listId);
    const datalist = document.createElement("datalist");
    datalist.id = listId;
    for (const entry of state.index?.entries ?? []) {
      const option = document.createElement("option");
      option.value = entry.path;
      option.label = entry.title;
      datalist.append(option);
    }
    wrapper.append(datalist);
  }

  if (field.type === "checkbox") {
    wrapper.append(input);
    const text = document.createElement("span");
    text.textContent = field.label ?? field.name;
    wrapper.append(text);
  } else {
    const label = document.createElement("span");
    label.textContent = `${field.label ?? field.name}${field.required ? " *" : ""}`;
    wrapper.append(label, input);
    if (field.help) {
      const help = document.createElement("span");
      help.className = "help";
      help.textContent = field.help;
      wrapper.append(help);
    }
  }
  return wrapper;
}

function readOperationForm() {
  const input = {};
  for (const element of $$("[data-input-name]", $("#operation-form"))) {
    const name = element.dataset.inputName;
    if (element.type === "checkbox") input[name] = element.checked;
    else input[name] = element.value;
  }
  return input;
}

async function submitOperation(event) {
  event.preventDefault();
  const operationId = $("#operation-form").dataset.operation;
  const operation = state.registry?.operations?.find((candidate) => candidate.id === operationId);
  const input = readOperationForm();
  try {
    const plan = await api("/api/plan", {
      method: "POST",
      body: { operation: operationId, input }
    });
    closeDialog($("#operation-dialog"));
    showPlan({ plan, label: operation?.label ?? operationId, input });
  } catch (error) {
    toast(formatError(error), { error: true });
  }
}

function renderPlanDetails(plan) {
  const validations = plan.validations ?? [];
  const warnings = plan.warnings ?? [];
  const validationHtml = validations.length
    ? `<ul class="validations">${validations
        .map((item) => {
          const cls = item.ok ? "ok" : item.overridable ? "warn" : "fail";
          const suffix = !item.ok && item.overridable ? " · override posible con motivo" : "";
          const detail = item.detail && item.id !== "checks"
            ? `<div class="detail">${esc(
                Array.isArray(item.detail)
                  ? item.detail
                      .map((entry) =>
                        typeof entry === "string"
                          ? entry
                          : [entry.type, entry.path].filter(Boolean).join(": ") ||
                            JSON.stringify(entry)
                      )
                      .join("\n")
                  : JSON.stringify(item.detail)
              )}</div>`
            : "";
          return `<li class="${cls}">${item.ok ? "ok" : "falta"} · ${esc(item.message)}${esc(
            suffix
          )}${detail}</li>`;
        })
        .join("")}</ul>`
    : "";

  const warningHtml = warnings.length
    ? `<div class="warnings">${warnings
        .map((warning) => `<div class="warning">${esc(warning)}</div>`)
        .join("")}</div>`
    : "";

  const pathsHtml = (plan.paths ?? []).length
    ? `<div class="hint">Paths: ${plan.paths.map((path) => `<code>${esc(path)}</code>`).join(" · ")}</div>`
    : "";

  const checksHtml = plan.checks?.length
    ? `<div class="checks">${plan.checks
        .map(
          (check) => `
            <div class="check ${check.ok ? "ok" : "fail"}">
              <strong>${check.ok ? "ok" : "falla"} · ${esc(check.label)}</strong>
              <div class="hint">${esc(check.command)} ${esc((check.args ?? []).join(" "))}</div>
              ${
                `${check.stdout ?? ""}${check.stderr ?? ""}`.trim()
                  ? `<details><summary>salida</summary><pre>${esc(
                      `${check.stdout ?? ""}${check.stderr ?? ""}`.trim()
                    )}</pre></details>`
                  : ""
              }
            </div>
          `
        )
        .join("")}</div>`
    : "";

  const overrides = plan.meta?.overrides ?? [];
  const overridesHtml = overrides.length
    ? `<div class="warnings">${overrides
        .map((reason) => `<div class="warning">Override registrado en el commit: ${esc(reason)}</div>`)
        .join("")}</div>`
    : "";

  const diffHtml = plan.diff
    ? `<pre class="diff">${esc(plan.diff)}</pre>`
    : '<p class="hint">Sin diff de archivos.</p>';

  return `
    <p class="plan-summary">${esc(plan.summary)}</p>
    ${validationHtml}
    ${overridesHtml}
    ${warningHtml}
    ${checksHtml}
    ${pathsHtml}
    ${diffHtml}
  `;
}

function showPlan({ plan, label, input, apply }) {
  state.planDialog = { plan, input, apply };
  $("#plan-title").textContent = label ?? "Plan de cambios";
  $("#plan-body").innerHTML = renderPlanDetails(plan);
  $("#plan-error").hidden = true;
  $("#plan-error").textContent = "";

  const failed = (plan.validations ?? []).filter((item) => !item.ok);
  const needsOverride = failed.some((item) => item.overridable);
  $("#override-wrap").hidden = !needsOverride;
  $("#override-reason").value = "";
  updatePlanApplyState();
  showDialog($("#plan-dialog"));
  (needsOverride ? $("#override-reason") : $("#plan-apply")).focus();
}

function updatePlanApplyState() {
  const current = state.planDialog;
  if (!current) return;
  const failed = (current.plan.validations ?? []).filter((item) => !item.ok);
  const blocking = failed.some((item) => !item.overridable);
  const needsOverride = failed.some((item) => item.overridable);
  const override = $("#override-reason").value.trim();
  $("#plan-apply").disabled = blocking || (needsOverride && !override);
}

async function applyCurrentPlan() {
  const current = state.planDialog;
  if (!current) return;
  const button = $("#plan-apply");
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Aplicando…";
  $("#plan-error").hidden = true;
  try {
    const overrideReason = $("#override-reason").value.trim();
    let result;
    if (current.apply) {
      result = await current.apply(overrideReason);
    } else {
      result = await api("/api/apply", {
        method: "POST",
        body: {
          operation: current.plan.operation,
          input: current.input,
          fingerprint: current.plan.fingerprint,
          overrideReason
        }
      });
    }
    closeDialog($("#plan-dialog"));
    await afterApply(result, current.plan, overrideReason);
  } catch (error) {
    $("#plan-error").hidden = false;
    $("#plan-error").textContent = formatError(error);
    if (error.detail?.plan) {
      state.planDialog = { ...current, plan: error.detail.plan };
      $("#plan-body").innerHTML = renderPlanDetails(error.detail.plan);
    }
  } finally {
    button.textContent = original;
    updatePlanApplyState();
  }
}

async function afterApply(result, plan, overrideReason = "") {
  if (plan.operation === "descartar") {
    for (const path of result.paths ?? []) state.planned.delete(path);
    updateCommitCount();
    await refreshIndex();
    await refreshStatus();
    toast("Cambios descartados.");
    if (state.current && (result.paths ?? []).includes(state.current.path)) {
      state.editor.dirty = false;
      const stillExists = state.index.entries.some((entry) => entry.path === state.current.path);
      if (stillExists) await openEntry(state.current.path, { force: true });
      else clearCurrent();
    }
    return;
  }
  if (plan.operation === "commit") {
    for (const path of result.paths ?? []) state.planned.delete(path);
    updateCommitCount();
    await refreshIndex();
    await refreshStatus();
    closeDialog($("#commit-dialog"));
    toast(result.commit ? `Commit: ${result.commit}` : "Commit completado.");
    if (state.current) await openEntry(state.current.path);
    showResult({
      title: "Commit",
      paths: result.paths ?? [],
      output: result.output ?? "",
      commit: result.commit ?? null
    });
    return;
  }
  if (plan.operation === "borrar-nota") {
    if (plan.meta?.tracked) {
      addPlanned(result.paths, {
        operation: plan.operation,
        origin: plan.origin,
        override: String(overrideReason ?? "").trim() || null
      });
    } else {
      for (const path of result.paths ?? []) state.planned.delete(path);
      updateCommitCount();
    }
    await refreshIndex();
    await refreshStatus();
    toast("Nota borrada.");
    if (state.current && (result.paths ?? []).includes(state.current.path)) {
      clearCurrent();
    }
    return;
  }
  addPlanned(result.paths, {
    operation: plan.operation,
    origin: plan.origin,
    override: String(overrideReason ?? "").trim() || null
  });
  await refreshIndex();
  await refreshStatus();
  const output = String(result.output ?? "").trim();
  toast(output ? output.split("\n")[0] : plan.summary);
  if (state.current && (result.paths ?? []).includes(state.current.path)) {
    if (plan.operation === "guardar-nota") state.editor.dirty = false;
    await openEntry(state.current.path);
  } else if (plan.operation === "nueva-nota" && result.paths?.[0]) {
    await openEntry(result.paths[0]);
  } else if (plan.operation === "nueva-exploracion" || plan.operation === "publicar-exploracion") {
    const target = (result.paths ?? []).find((path) =>
      path.startsWith("content/collections/_exploraciones/")
    );
    if (target) await openEntry(target);
  }
  if (output) {
    showResult({
      title: operationLabel(plan.operation),
      paths: result.paths ?? [],
      output
    });
  }
}

function operationLabel(id) {
  return state.registry?.operations?.find((operation) => operation.id === id)?.label ?? id;
}

function showResult({ title = "Resultado", paths = [], output = "", commit = null }) {
  $("#result-title").textContent = title;
  const body = $("#result-body");
  body.innerHTML = "";
  if (paths.length > 0) {
    const list = document.createElement("ul");
    list.className = "result-paths";
    for (const path of paths) {
      const item = document.createElement("li");
      item.textContent = path;
      list.append(item);
    }
    body.append(list);
  }
  if (commit) {
    const paragraph = document.createElement("p");
    paragraph.className = "hint";
    paragraph.textContent = `Commit: ${commit}`;
    body.append(paragraph);
  }
  if (output) {
    const pre = document.createElement("pre");
    pre.textContent = output;
    body.append(pre);
  }
  if (!body.children.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "Sin salida.";
    body.append(empty);
  }
  showDialog($("#result-dialog"));
}

function openCommitDialog() {
  if (state.planned.size === 0) {
    toast("No hay cambios planificados para commitear.", { error: true });
    return;
  }
  renderCommitDialog();
  showDialog($("#commit-dialog"));
}

function renderCommitDialog() {
  const paths = [...state.planned.keys()].sort();
  $("#commit-paths").innerHTML = paths
    .map(
      (path, index) => `
        <label>
          <input type="checkbox" data-commit-path value="${esc(path)}" checked>
          <span>${esc(path)}<br><span class="hint">${esc(
            state.planned.get(path)?.operation ?? ""
          )} · ${esc(state.planned.get(path)?.origin ?? "")}</span></span>
        </label>
      `
    )
    .join("");

  const dirty = (state.status?.repo?.dirty ?? []).filter((item) => !state.planned.has(item.path));
  $("#commit-dirty").innerHTML = dirty.length
    ? dirty
        .map((item) =>
          PLAN_PREFIXES.some((prefix) => item.path.startsWith(prefix))
            ? `<label class="dirty"><input type="checkbox" data-adopt-path value="${esc(
                item.path
              )}"> ${esc(item.status)} ${esc(item.path)}<br><span class="hint">fuera del plan; se puede adoptar</span></label>`
            : `<div class="dirty">${esc(item.status)} ${esc(item.path)}<br><span class="hint">fuera del alcance del taller</span></div>`
        )
        .join("")
    : '<p class="hint">El repo no tiene cambios ajenos al plan.</p>';
  updateAdoptButton();

  if (!$("#commit-message").value) {
    const operations = [...new Set([...state.planned.values()].map((item) => item.operation))];
    const origins = [...new Set([...state.planned.values()].map((item) => item.origin).filter(Boolean))];
    $("#commit-message").value = `taller: ${operations.join(", ") || "cambios de Rizoma"}${
      origins.length ? ` · ${origins.join(", ")}` : ""
    }`;
  }
  $("#commit-plan").innerHTML = '<p class="hint">Prepará el commit para correr build, links y láminas.</p>';
  $("#commit-apply").disabled = true;
  $("#commit-error").hidden = true;
  state.commit.plan = null;
  state.commit.input = null;
}

function updateAdoptButton() {
  const button = $("#adopt-dirty");
  if (!button) return;
  button.disabled = !$$("[data-adopt-path]").some((input) => input.checked);
}

function adoptDirtyChanges() {
  const paths = $$("[data-adopt-path]")
    .filter((input) => input.checked)
    .map((input) => input.value);
  if (paths.length === 0) {
    toast("Elegí al menos un cambio sucio.", { error: true });
    return;
  }
  for (const path of paths) {
    state.planned.set(path, { operation: "adopción manual", origin: "", override: null });
  }
  updateCommitCount();
  renderCommitDialog();
  toast(`${paths.length} path(s) adoptados al plan.`);
}

function commitPaths() {
  return $$("[data-commit-path]")
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function commitInput() {
  const selected = new Set(commitPaths());
  const overrides = [
    ...new Set(
      [...state.planned.entries()]
        .filter(([path]) => selected.has(path))
        .map(([, item]) => String(item.override ?? "").trim())
        .filter(Boolean)
    )
  ];
  return {
    paths: commitPaths(),
    message: $("#commit-message").value,
    minorReason: $("#commit-minor").value,
    overrideReason: $("#commit-override").value,
    overrides,
    operation: [...new Set([...state.planned.values()].map((item) => item.operation))].join(", "),
    origin: [...new Set([...state.planned.values()].map((item) => item.origin).filter(Boolean))].join(", ")
  };
}

async function prepareCommit() {
  const input = commitInput();
  if (input.paths.length === 0) {
    toast("Elegí al menos un path.", { error: true });
    return;
  }
  const button = $("#commit-prepare");
  button.disabled = true;
  button.textContent = "Preparando…";
  $("#commit-error").hidden = true;
  try {
    await refreshStatus();
    const plan = await api("/api/plan", { method: "POST", body: { operation: "commit", input } });
    state.commit.plan = plan;
    state.commit.input = input;
    $("#commit-plan").innerHTML = renderPlanDetails(plan);
    $("#commit-apply").disabled = false;
    updateCommitApplyState();
    const failed = plan.validations.filter((item) => !item.ok);
    if (failed.length > 0) {
      $("#commit-plan").scrollIntoView({ block: "nearest" });
    }
  } catch (error) {
    $("#commit-error").hidden = false;
    $("#commit-error").textContent = formatError(error);
  } finally {
    button.disabled = false;
    button.textContent = "Preparar";
  }
}

function updateCommitApplyState() {
  const plan = state.commit.plan;
  if (!plan) {
    $("#commit-apply").disabled = true;
    return;
  }
  const failed = plan.validations.filter((item) => !item.ok);
  const blocking = failed.some((item) => !item.overridable);
  const needsOverride = failed.some((item) => item.overridable);
  const override = $("#commit-override").value.trim();
  $("#commit-apply").disabled = blocking || (needsOverride && !override);
}

async function applyCommit() {
  if (!state.commit.plan || !state.commit.input) return;
  const button = $("#commit-apply");
  button.disabled = true;
  button.textContent = "Commiteando…";
  $("#commit-error").hidden = true;
  try {
    const input = commitInput();
    const result = await api("/api/apply", {
      method: "POST",
      body: {
        operation: "commit",
        input,
        fingerprint: state.commit.plan.fingerprint,
        overrideReason: $("#commit-override").value.trim()
      }
    });
    await afterApply(result, state.commit.plan);
  } catch (error) {
    $("#commit-error").hidden = false;
    $("#commit-error").textContent = formatError(error);
    button.disabled = false;
    button.textContent = "Commitear";
  }
}

boot();
