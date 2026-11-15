#!/usr/bin/env node
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

import { loadRegistry, serializeRegistry } from "./lib/registry.mjs";
import { buildIndex, loadSources, readItem, serializeEntry, serializeIndex } from "./lib/indexer.mjs";
import { repoState } from "./lib/git.mjs";
import { checkTools, runChecks } from "./lib/checks.mjs";
import { applyPlan, checkPlan, PlanError, planFingerprint, previewChanges, serializePlan } from "./lib/plan.mjs";
import { resolveRepoPath } from "./lib/paths.mjs";
import { FrontmatterError } from "./lib/frontmatter.mjs";
import { buildConflictPreview } from "./lib/conflict.mjs";
import {
  applyAttachment,
  attachmentContentType,
  attachmentDisposition,
  MAX_ATTACHMENT_SIZE,
  planAttachment
} from "./ops/attachment.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const UI_DIR = join(HERE, "ui");
const CONFIG = join(HERE, "rizoma.config.mjs");
const HOST = "127.0.0.1";
const PORT = Number(process.env.TALLER_PORT || 4173);
const STARTED = Date.now();

const registry = await loadRegistry(CONFIG);

class HttpError extends Error {
  constructor(message, status = 400, detail = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.detail = detail;
  }
}

function securityHeaders(res, { api = false } = {}) {
  res.setHeader(
    "Content-Security-Policy",
    api
      ? "default-src 'none'; frame-ancestors 'none'"
      : "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  securityHeaders(res, { api: true });
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function sendText(res, status, text) {
  securityHeaders(res, { api: true });
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function createContext() {
  const index = buildIndex(ROOT, registry);
  return { root: ROOT, registry, index, sources: loadSources(ROOT) };
}

function assertLocal(req) {
  const hostRaw = String(req.headers.host ?? "").toLowerCase();
  const host = hostRaw.startsWith("[")
    ? hostRaw.slice(1, hostRaw.indexOf("]"))
    : hostRaw.split(":")[0];
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
    throw new HttpError("El taller solo acepta requests desde loopback.", 403);
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.origin;
    if (origin) {
      let parsed;
      try {
        parsed = new URL(origin);
      } catch {
        throw new HttpError("Origin inválido.", 403);
      }
      if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(parsed.hostname)) {
        throw new HttpError("Origin externo rechazado.", 403);
      }
    }
    const site = req.headers["sec-fetch-site"];
    if (site && !["same-origin", "none"].includes(site)) {
      throw new HttpError("Request cross-site rechazado.", 403);
    }
  }
}

function readBody(req, limit) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(`El cuerpo supera el límite de ${limit} bytes.`, 413));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolvePromise(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req, limit = 10 * 1024 * 1024) {
  const type = String(req.headers["content-type"] ?? "");
  if (!type.includes("application/json")) {
    throw new HttpError("Content-Type debe ser application/json.", 415);
  }
  const buffer = await readBody(req, limit);
  if (buffer.length === 0) return {};
  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch (error) {
    throw new HttpError(`JSON inválido: ${error.message}`, 400);
  }
}

function findOperation(id) {
  const operation = registry.operations.find((candidate) => candidate.id === id);
  if (!operation) throw new HttpError(`Operación desconocida: ${id}`, 404);
  return operation;
}

async function planOperation(operation, input, ctx = createContext()) {
  const plan = await operation.plan(ctx, input ?? {});
  if (!Array.isArray(plan.validations)) plan.validations = [];
  if (!Array.isArray(plan.warnings)) plan.warnings = [];
  if (!Array.isArray(plan.changes)) plan.changes = [];
  plan.diff = await previewChanges(ctx.root, plan.preview ?? plan.changes);
  return { plan, ctx };
}

async function handlePlan(req, res) {
  const body = await readJson(req);
  const operation = findOperation(body.operation);
  const started = Date.now();
  const { plan } = await planOperation(operation, body.input);
  logOperation(operation.id, body.input, plan, Date.now() - started);
  sendJson(res, 200, serializePlan(plan));
}

async function handleApply(req, res) {
  const body = await readJson(req);
  const operation = findOperation(body.operation);
  const ctx = createContext();
  const { plan } = await planOperation(operation, body.input, ctx);
  const fingerprint = planFingerprint(plan);
  if (body.fingerprint && body.fingerprint !== fingerprint) {
    throw new HttpError("El plan cambió desde que se previsualizó. Volvé a revisarlo.", 409, {
      plan: serializePlan(plan)
    });
  }
  checkPlan(plan, { overrideReason: body.overrideReason });
  const started = Date.now();
  const result = operation.apply
    ? await operation.apply(ctx, plan, body.input ?? {}, { overrideReason: body.overrideReason })
    : await applyPlan(ctx.root, plan);
  logOperation(operation.id, body.input, plan, Date.now() - started, "apply");
  sendJson(res, 200, {
    ...result,
    plan: serializePlan(plan)
  });
}

function logOperation(operation, input, plan, duration, suffix = "plan") {
  const paths = (plan.changes ?? [])
    .map((change) => change.path)
    .filter(Boolean)
    .slice(0, 8);
  const origin = input?.path ?? input?.source ?? input?.notePath ?? input?.note ?? "";
  console.log(
    `[taller] op=${operation} ${suffix} origin=${origin || "-"} paths=${paths.join(",") || "-"} ${duration}ms`
  );
}

function serializeItem(ctx, item) {
  const type = registry.types.find((candidate) => candidate.id === item.type);
  return {
    ...serializeEntry(item),
    meta: item.meta,
    body: item.body,
    rawFrontmatter: item.rawFrontmatter,
    hash: item.hash,
    fields: type?.fields ?? [],
    backlinks: item.backlinks,
    links: item.links,
    attachments: item.attachments
  };
}

async function handleItem(res, url) {
  const path = url.searchParams.get("path");
  if (!path) throw new HttpError("Falta ?path=", 400);
  try {
    resolveRepoPath(ROOT, path, { mustExist: true });
  } catch (error) {
    throw new HttpError(error.message, error.status ?? 400);
  }
  const ctx = createContext();
  const item = readItem(ROOT, ctx.index, path);
  if (!item) throw new HttpError(`No está en el índice: ${path}`, 404);
  sendJson(res, 200, serializeItem(ctx, item));
}

async function handleStatus(res) {
  const [repo, tools] = await Promise.all([repoState(ROOT), checkTools(ROOT)]);
  sendJson(res, 200, {
    root: ROOT,
    port: PORT,
    uptime: Math.round((Date.now() - STARTED) / 1000),
    repo,
    tools,
    registryWarnings: registry.warnings
  });
}

function previewRunning() {
  return new Promise((resolvePromise) => {
    const request = http.request(
      { hostname: "127.0.0.1", port: 4000, path: "/", method: "HEAD", timeout: 800 },
      (response) => {
        response.resume();
        resolvePromise(response.statusCode < 500);
      }
    );
    request.on("timeout", () => {
      request.destroy();
      resolvePromise(false);
    });
    request.on("error", () => resolvePromise(false));
    request.end();
  });
}

async function handlePreviewStatus(res) {
  const running = await previewRunning();
  sendJson(res, 200, {
    running,
    url: running ? "http://localhost:4000" : null
  });
}

async function handleAttachmentPlan(req, res) {
  const body = await readJson(req);
  const ctx = createContext();
  const plan = await planAttachment(ctx, body);
  plan.diff = await previewChanges(ctx.root, plan.preview ?? plan.changes);
  sendJson(res, 200, serializePlan(plan));
}

async function handleAttachmentApply(req, res, url) {
  const token = url.searchParams.get("token");
  if (!token) throw new HttpError("Falta ?token=", 400);
  const type = String(req.headers["content-type"] ?? "");
  if (!type.includes("application/octet-stream")) {
    throw new HttpError("El adjunto debe enviarse como application/octet-stream.", 415);
  }
  const buffer = await readBody(req, MAX_ATTACHMENT_SIZE + 1);
  const ctx = createContext();
  const result = await applyAttachment(ctx, token, buffer);
  console.log(`[taller] op=adjuntar apply archivo=${result.paths[0] ?? "-"}`);
  sendJson(res, 200, result);
}

async function handleAttachmentFile(res, url) {
  const path = url.searchParams.get("path");
  if (!path || !path.startsWith("docs/rizoma/adjuntos/")) {
    throw new HttpError("Solo se sirven adjuntos de docs/rizoma/adjuntos/.", 403);
  }
  let abs;
  try {
    abs = resolveRepoPath(ROOT, path, { mustExist: true });
  } catch (error) {
    throw new HttpError(error.message, error.status ?? 404);
  }
  const info = statSync(abs);
  securityHeaders(res, { api: true });
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  res.setHeader("Content-Type", attachmentContentType(abs));
  res.setHeader("Content-Length", info.size);
  res.setHeader("Content-Disposition", attachmentDisposition(abs));
  res.writeHead(200);
  createReadStream(abs).pipe(res);
}

async function handleChecks(req, res) {
  await readJson(req);
  const started = Date.now();
  const results = await runChecks(ROOT);
  console.log(`[taller] checks ${results.filter((item) => item.ok).length}/${results.length} ${Date.now() - started}ms`);
  sendJson(res, 200, { checks: results });
}

async function handleConflictPreview(req, res) {
  const body = await readJson(req);
  const ctx = createContext();
  const entry = ctx.index.entries.find((candidate) => candidate.path === body.path);
  if (!entry) throw new HttpError(`No está en el índice: ${body.path}`, 404);
  if (entry.readOnly) throw new HttpError("El documento es read-only.", 403);
  const preview = buildConflictPreview(ctx.root, body.path, body.base ?? {}, body.edits ?? {});
  console.log(`[taller] conflict preview path=${body.path}`);
  sendJson(res, 200, preview);
}

const STATIC = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"],
  ["/markdown.js", "markdown.js"],
  ["/html-to-markdown.js", "html-to-markdown.js"]
]);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function handleStatic(res, pathname) {
  const file = STATIC.get(pathname);
  if (!file) return false;
  const abs = join(UI_DIR, file);
  if (!existsSync(abs)) return false;
  securityHeaders(res);
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream"
  });
  res.end(readFileSync(abs));
  return true;
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  let url;
  try {
    assertLocal(req);
    url = new URL(req.url, `http://${HOST}:${PORT}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, taller: "rizoma", version: 1 });
    }
    if (req.method === "GET" && pathname === "/api/registry") {
      return sendJson(res, 200, serializeRegistry(registry));
    }
    if (req.method === "GET" && pathname === "/api/index") {
      const ctx = createContext();
      return sendJson(res, 200, serializeIndex(ctx.index));
    }
    if (req.method === "GET" && pathname === "/api/item") {
      return await handleItem(res, url);
    }
    if (req.method === "GET" && pathname === "/api/status") {
      return await handleStatus(res);
    }
    if (req.method === "GET" && pathname === "/api/preview-status") {
      return await handlePreviewStatus(res);
    }
    if (req.method === "GET" && pathname === "/api/attachment") {
      return await handleAttachmentFile(res, url);
    }
    if (req.method === "POST" && pathname === "/api/plan") {
      return await handlePlan(req, res);
    }
    if (req.method === "POST" && pathname === "/api/conflict/preview") {
      return await handleConflictPreview(req, res);
    }
    if (req.method === "POST" && pathname === "/api/apply") {
      return await handleApply(req, res);
    }
    if (req.method === "POST" && pathname === "/api/checks") {
      return await handleChecks(req, res);
    }
    if (req.method === "POST" && pathname === "/api/attach/plan") {
      return await handleAttachmentPlan(req, res);
    }
    if (req.method === "POST" && pathname === "/api/attach/apply") {
      return await handleAttachmentApply(req, res, url);
    }
    if ((req.method === "GET" || req.method === "HEAD") && handleStatic(res, pathname)) {
      return;
    }
    sendText(res, 404, "No encontrado");
  } catch (error) {
    const status =
      error.status ?? (error instanceof PlanError ? error.status : error.name === "PathError" ? 403 : 500);
    if (status >= 500) {
      console.error(`[taller] error ${req.method} ${url?.pathname ?? req.url}: ${error.stack ?? error.message}`);
    }
    const payload = {
      error: error.message,
      detail: error.detail ?? null
    };
    if (error instanceof FrontmatterError) {
      payload.line = error.line;
      payload.column = error.column;
    }
    if (res.headersSent) {
      res.destroy();
      return;
    }
    sendJson(res, status, payload);
  } finally {
    const pathname = url?.pathname ?? req.url;
    console.log(`[taller] ${req.method} ${pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `[taller] El puerto ${PORT} está ocupado. Probá con otro: TALLER_PORT=4174 npm run taller`
    );
  } else {
    console.error(`[taller] No se pudo iniciar el servidor: ${error.message}`);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`[taller] Taller de Rizoma en http://${HOST}:${PORT}`);
  console.log(`[taller] Repo: ${ROOT}`);
  for (const warning of registry.warnings) {
    console.warn(`[taller] Registro: ${warning.message}`);
  }
  console.log("[taller] Escribí Ctrl+C para cerrar. El taller no se despliega.");
});

process.on("SIGINT", () => {
  console.log("\n[taller] Cerrando.");
  server.close(() => process.exit(0));
});
