"use strict";
// Connection + credentials ------------------------------------------------------
// ES URL: optional override sent as X-ES-URL (proxy validates + forwards).
// Auth modes: none | basic (user/pass) | apikey. Persisted to localStorage
// for convenience; sent to the same-origin proxy, which forwards to ES.
function proxyHeaders() {
  const h = {};
  const url = document.getElementById("esUrl").value.trim().replace(/\/+$/, "");
  if (url) h["X-ES-URL"] = url;
  const mode = document.getElementById("authMode").value;
  if (mode === "basic") {
    const user = document.getElementById("esUser").value.trim();
    if (user) h["Authorization"] = "Basic " + btoa(`${user}:${document.getElementById("esPass").value}`);
  } else if (mode === "apikey") {
    const key = document.getElementById("esApiKey").value.trim();
    if (key) h["Authorization"] = "ApiKey " + key;
  }
  return h;
}

function restoreConn() {
  try {
    const saved = JSON.parse(localStorage.getItem("esConn") || "{}");
    if (saved.url) document.getElementById("esUrl").value = saved.url;
    if (saved.mode) document.getElementById("authMode").value = saved.mode;
    if (saved.user) document.getElementById("esUser").value = saved.user;
    if (saved.pass) document.getElementById("esPass").value = saved.pass;
    if (saved.apiKey) document.getElementById("esApiKey").value = saved.apiKey;
  } catch { /* corrupted storage: ignore */ }
  syncAuthFields();
}

function persistConn() {
  try {
    localStorage.setItem("esConn", JSON.stringify({
      url: document.getElementById("esUrl").value,
      mode: document.getElementById("authMode").value,
      user: document.getElementById("esUser").value,
      pass: document.getElementById("esPass").value,
      apiKey: document.getElementById("esApiKey").value,
    }));
  } catch { /* private mode etc: ignore */ }
}

// Migrate credentials saved by the pre-auth-mode version of the UI.
function migrateLegacyAuth() {
  try {
    if (localStorage.getItem("esConn")) return;
    const legacy = JSON.parse(localStorage.getItem("esAuth") || "null");
    if (legacy && (legacy.user || legacy.pass)) {
      document.getElementById("authMode").value = "basic";
      document.getElementById("esUser").value = legacy.user || "";
      document.getElementById("esPass").value = legacy.pass || "";
      persistConn();
    }
    localStorage.removeItem("esAuth");
  } catch { /* ignore */ }
}

function syncAuthFields() {
  const basic = document.getElementById("authMode").value === "basic";
  const key = document.getElementById("authMode").value === "apikey";
  document.getElementById("basicFields").hidden = !basic;
  document.getElementById("basicPassLabel").hidden = !basic;
  document.getElementById("apiKeyLabel").hidden = !key;
}

async function es(path) {
  const r = await fetch("/api/es/" + path, { headers: proxyHeaders() });
  if (r.status === 401) {
    throw new Error(`${path} -> HTTP 401 Unauthorized: ES needs credentials — pick basic/API key above (or set ES_USER/ES_PASSWORD env for the proxy). Body: ${await r.text()}`);
  }
  if (!r.ok) throw new Error(`${path} -> HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

// "12.3mb" | "45kb" | "1.2gb" | "800b" | null -> bytes -------------------------
function parseBytes(s) {
  if (s == null) return 0;
  if (typeof s === "number") return s;
  const m = String(s).trim().toLowerCase().match(/^([\d.]+)\s*([kmgtp]?b)?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "b").toLowerCase();
  const mult = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4, pb: 1024 ** 5 }[unit] ?? 1;
  return Math.round(n * mult);
}

function formatBytes(b) {
  if (!b || b <= 0) return "0b";
  const units = ["b", "kb", "mb", "gb", "tb"];
  let i = 0, v = b;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)}${units[i]}`;
}

// light blue (#cfeaff) -> orange mid -> red (#d62728), log-normalized ---------
const COLD = [207, 234, 255];
const MID = [245, 176, 76];
const HOT = [214, 39, 40];
function colorFor(t) {
  const a = t < 0.5 ? [COLD, MID, t * 2] : [MID, HOT, (t - 0.5) * 2];
  const [c1, c2, k] = a;
  const c = c1.map((v, i) => Math.round(v + (c2[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
// Absolute scale: 0 bytes -> light blue, >= redAtBytes -> full red (log).
// Anchored to the recommended ~20-40GB shard size, so small shards can never
// look alarming; only genuinely oversized shards turn red.
function normAbs(v, max) {
  if (!(max > 0)) return 0;
  const t = Math.log10(v + 1) / Math.log10(max + 1);
  const clamped = Math.min(1, Math.max(0, t));
  // Gamma: plain log puts KB-shards mid-scale (orange). Squaring keeps
  // anything under ~100MB firmly blue and reserves orange/red for GB+.
  return clamped * clamped;
}

function redAtBytes() {
  const gb = parseFloat(document.getElementById("redAt").value);
  const sane = Number.isFinite(gb) && gb > 0 ? gb : 40;
  return Math.round(sane * 1024 ** 3);
}

// State -----------------------------------------------------------------------
const el = (id) => document.getElementById(id);
let timer = null;

async function load() {
  el("error").hidden = true;
  try {
    const [nodes, shards, indices, health] = await Promise.all([
      es("_cat/nodes?format=json&h=name,heap.percent,ram.percent,cpu,disk.used,disk.total,disk.avail,disk.used_percent,master,node.role,uptime"),
      es("_cat/shards?format=json&h=index,shard,prirep,state,docs,store,node,unassigned.reason"),
      es("_cat/indices?format=json&h=index,docs.count,store.size,health,status,pri,rep").catch(() => []),
      es("_cluster/health").catch(() => null),
    ]);
    render(nodes, shards, indices, health);
    el("updated").textContent = "updated " + new Date().toLocaleTimeString();
  } catch (e) {
    const box = el("error");
    box.hidden = false;
    box.textContent = "Failed to reach Elasticsearch via /api/es proxy.\n" +
      "Is `npm start` running and ES up at :9200?\n\n" + String(e && e.message || e);
  }
}

function render(nodes, shards, indices, health) {
  hideTooltip();
  // health pill
  const pill = el("health");
  const status = health && health.status ? health.status : "unknown";
  pill.className = "pill " + (status === "green" ? "green" : status === "yellow" ? "yellow" : status === "red" ? "red" : "unknown");
  pill.textContent = `health: ${status}` +
    (health ? ` · nodes ${health.number_of_nodes} · data ${health.number_of_data_nodes}` : "");

  // filters
  const hideSystem = el("hideSystem").checked;
  const onlyAssigned = el("onlyAssigned").checked;
  const q = el("filter").value.trim().toLowerCase();
  const visible = shards.filter((s) => {
    if (hideSystem && s.index.startsWith(".")) return false;
    if (q && !s.index.toLowerCase().includes(q)) return false;
    if (onlyAssigned && (!s.node || s.state === "UNASSIGNED")) return false;
    return true;
  });

  // absolute color domain: red means >= red-at threshold (default 40GB)
  const max = redAtBytes();
  el("scale").textContent = `absolute log scale 0 → ${formatBytes(max)} red (recommended shard size 20–40GB)`;

  // group by node
  const byNode = new Map();
  for (const n of nodes) byNode.set(n.name, []);
  const unassigned = [];
  for (const s of visible) {
    if (s.node && byNode.has(s.node)) byNode.get(s.node).push(s);
    else if (s.node) {
      if (!byNode.has(s.node)) byNode.set(s.node, []);
      byNode.get(s.node).push(s);
    } else unassigned.push(s);
  }
  for (const list of byNode.values()) list.sort((a, b) => parseBytes(b.store) - parseBytes(a.store));
  unassigned.sort((a, b) => parseBytes(b.store) - parseBytes(a.store));
  const nodeTotals = [...byNode.entries()].map(([name, list]) => ({
    name, total: list.reduce((s, x) => s + parseBytes(x.store), 0),
  }));
  const maxTotal = Math.max(1, ...nodeTotals.map((t) => t.total));
  const totalOf = (name) => nodeTotals.find((t) => t.name === name)?.total ?? 0;

  const host = el("nodes");
  host.innerHTML = "";
  const nodeInfo = Object.fromEntries(nodes.map((n) => [n.name, n]));

  for (const [name, list] of byNode) {
    host.appendChild(nodeCard(name, nodeInfo[name], list, totalOf(name), maxTotal, max));
  }
  if (unassigned.length && !onlyAssigned) {
    host.appendChild(nodeCard("UNASSIGNED", null, unassigned, 0, maxTotal, max, true));
  }
  if (!visible.length) {
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = "No shards match (cluster may be empty — try `npm run seed`).";
    host.appendChild(d);
  }
}

function nodeCard(name, info, list, total, maxTotal, absMax, isUnassigned = false) {
  const card = document.createElement("section");
  card.className = "node" + (isUnassigned ? " unassigned" : "");
  const count = list.length;
  const role = info ? (info["node.role"] || info.nodeRole || "") : "";
  const master = info && (info.master === "*" || info.master === "true") ? " ★master" : "";
  const diskPct = info ? (info["disk.used_percent"] ?? info.diskUsedPercent ?? "?") : "?";
  const diskUsed = info ? (info["disk.used"] ?? "") : "";
  const extra = info ? `heap ${info["heap.percent"] ?? "?"}% · ram ${info["ram.percent"] ?? "?"}% · cpu ${info.cpu ?? "?"}` : (list[0]?.["unassigned.reason"] ? `reason: ${list[0]["unassigned.reason"]}` : "");

  const head = document.createElement("div");
  head.className = "node-head";
  head.innerHTML = `<h2>${escapeHtml(name)}</h2><span class="muted">${escapeHtml(role)}${escapeHtml(master)}</span>`;
  card.appendChild(head);

  const stats = document.createElement("div");
  stats.className = "node-stats";
  stats.innerHTML = `shards <b>${count}</b> · shard bytes <b>${formatBytes(total)}</b>` +
    (isUnassigned ? "" : ` · disk <b>${escapeHtml(String(diskUsed))} (${escapeHtml(String(diskPct))}%)</b><br>${escapeHtml(extra)}`);
  card.appendChild(stats);

  if (!isUnassigned) {
    const share = document.createElement("div");
    share.className = "share";
    const fill = document.createElement("div");
    fill.style.width = `${(100 * total / maxTotal).toFixed(1)}%`;
    fill.title = `${formatBytes(total)} of max ${formatBytes(maxTotal)}`;
    share.appendChild(fill);
    card.appendChild(share);
  }

  const tiles = document.createElement("div");
  tiles.className = "tiles";
  if (!list.length) {
    tiles.innerHTML = `<div class="empty">no shards</div>`;
  }
  for (const s of list) {
    const bytes = parseBytes(s.store);
    const t = document.createElement("div");
    t.className = `tile ${s.prirep === "p" ? "p" : "r"} ${s.state}`;
    t.style.background = colorFor(normAbs(bytes, absMax));
    t._shard = { ...s, bytes };
    tiles.appendChild(t);
  }
  card.appendChild(tiles);
  return card;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Custom hover card -----------------------------------------------------------
// Single delegated listener (cheap even with thousands of tiles): shows a
// styled card next to the cursor with the shard's details.
function showTooltip(shard, x, y) {
  const tip = document.getElementById("tooltip");
  const reason = shard["unassigned.reason"];
  tip.innerHTML =
    `<div class="tt-size">${escapeHtml(formatBytes(shard.bytes))}</div>` +
    `<div class="tt-idx">${escapeHtml(shard.index)} [shard ${escapeHtml(String(shard.shard))}]</div>` +
    `<div class="tt-row">${shard.prirep === "p" ? "primary" : "replica"} · ` +
    `<b>${escapeHtml(String(shard.state))}</b> · ${escapeHtml(String(shard.docs))} docs</div>` +
    `<div class="tt-row">store: <b>${escapeHtml(String(shard.store || "?"))}</b> (${shard.bytes} B)</div>` +
    `<div class="tt-row">node: <b>${escapeHtml(shard.node || "UNASSIGNED")}</b></div>` +
    (reason ? `<div class="tt-row">reason: <b>${escapeHtml(reason)}</b></div>` : "");
  tip.hidden = false;
  // position near cursor, clamped to viewport
  const pad = 14;
  const r = tip.getBoundingClientRect();
  let left = x + pad, top = y + pad;
  if (left + r.width > window.innerWidth - 8) left = x - r.width - pad;
  if (top + r.height > window.innerHeight - 8) top = y - r.height - pad;
  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

function hideTooltip() {
  document.getElementById("tooltip").hidden = true;
}

document.getElementById("nodes").addEventListener("mousemove", (e) => {
  const tile = e.target.closest ? e.target.closest(".tile") : null;
  if (tile && tile._shard) showTooltip(tile._shard, e.clientX, e.clientY);
  else hideTooltip();
});
document.getElementById("nodes").addEventListener("mouseleave", hideTooltip);

function armRefresh() {
  if (timer) { clearInterval(timer); timer = null; }
  const ms = Number(el("interval").value);
  if (ms > 0) timer = setInterval(load, ms);
}

// wire up
el("reload").addEventListener("click", load);
el("interval").addEventListener("change", armRefresh);
el("hideSystem").addEventListener("change", load);
el("onlyAssigned").addEventListener("change", load);
el("redAt").addEventListener("input", () => load());
el("filter").addEventListener("input", () => load());
el("esUrl").addEventListener("input", persistConn);
el("esUrl").addEventListener("change", load);
el("authMode").addEventListener("change", () => { persistConn(); syncAuthFields(); load(); });
el("esUser").addEventListener("input", persistConn);
el("esPass").addEventListener("input", persistConn);
el("esApiKey").addEventListener("input", persistConn);
el("esUser").addEventListener("change", load);
el("esPass").addEventListener("change", load);
el("esApiKey").addEventListener("change", load);

migrateLegacyAuth();
restoreConn();
armRefresh();
load();
