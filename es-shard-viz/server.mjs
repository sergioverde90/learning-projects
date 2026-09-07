// Zero-dependency static server + Elasticsearch proxy.
// Serves this directory on PORT (default 8000).
// Proxies /api/es/<es-path>?<query> -> ES_URL (default http://localhost:9200).
// This avoids browser CORS issues when talking to ES _cat APIs.
//
// Basic auth (for clusters with security enabled), two ways:
//   1. Server-side: ES_USER / ES_PASSWORD env vars (used for every request).
//   2. Per-request: UI sends `Authorization: Basic ...`, the proxy forwards it.
//      Per-request takes precedence over env vars. Credentials are forwarded
//      but never logged.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8000);
const ES_URL = (process.env.ES_URL || "http://localhost:9200").replace(/\/$/, "");
const ES_USER = process.env.ES_USER || "";
const ES_PASSWORD = process.env.ES_PASSWORD || "";
const ENV_AUTH = ES_USER
  ? "Basic " + Buffer.from(`${ES_USER}:${ES_PASSWORD}`).toString("base64")
  : null;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function serveStatic(req, res) {
  let urlPath = new URL(req.url, "http://x").pathname;
  if (urlPath === "/") urlPath = "/index.html";
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safe);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("not found: " + urlPath);
  }
}

async function proxyEs(req, res) {
  const u = new URL(req.url, "http://x");
  const esPath = u.pathname.replace(/^\/api\/es\/?/, "");
  const target = `${ES_URL}/${esPath}${u.search}`;
  try {
    const headers = { "Content-Type": "application/json" };
    const incomingAuth = req.headers["authorization"];
    if (incomingAuth) headers["Authorization"] = incomingAuth;
    else if (ENV_AUTH) headers["Authorization"] = ENV_AUTH;
    const upstream = await fetch(target, { method: req.method, headers });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "cannot reach Elasticsearch", target, detail: String(err) }));
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }
  if (new URL(req.url, "http://x").pathname.startsWith("/api/es/")) return proxyEs(req, res);  if (req.method !== "GET") {
    res.writeHead(405).end("method not allowed");
    return;
  }
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`es-shard-viz on http://localhost:${PORT}`);
  console.log(`proxying /api/es/* -> ${ES_URL}`);
  console.log(`auth: ${ENV_AUTH ? "ES_USER from env (+ per-request override)" : "per-request only (set ES_USER/ES_PASSWORD env for fixed creds)"}`);
});
