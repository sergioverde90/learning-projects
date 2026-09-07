// Creates imbalanced demo indices so the visualizer shows a loaded vs idle node.
// Usage: npm run seed  (optional: ES_URL=http://localhost:9200 node seed.mjs --clean)
// Auth (if the cluster has security enabled): ES_USER / ES_PASSWORD env vars.
// Zero dependencies, Node >= 18 (global fetch).
const ES_URL = (process.env.ES_URL || "http://localhost:9200").replace(/\/$/, "");
const CLEAN_ONLY = process.argv.includes("--clean");

const AUTH = process.env.ES_USER
  ? { "Authorization": "Basic " + Buffer.from(`${process.env.ES_USER}:${process.env.ES_PASSWORD || ""}`).toString("base64") }
  : {};

const BIG = "viz-big";       // 4 primaries, bulky docs, pinned to `es`
const MEDIUM = "viz-medium"; // 2 primaries, medium docs, free allocation
const TINY = "viz-tiny";     // 1 primary,  few docs, pinned to `es2`

async function req(method, path, body) {
  const r = await fetch(`${ES_URL}/${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...AUTH },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${text.slice(0, 500)}`);
  return json;
}

async function deleteIfExists(index) {
  const r = await fetch(`${ES_URL}/${index}`, { method: "DELETE", headers: { ...AUTH } });
  if (r.ok || r.status === 404) return;
  throw new Error(`DELETE ${index} -> ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

async function create(index, settings) {
  await req("PUT", index, { settings: { number_of_shards: settings.shards, number_of_replicas: 0, ...settings.extra } });
}

async function bulk(index, docs) {
  // docs: array of objects -> NDJSON bulk body
  let body = "";
  for (const d of docs) body += JSON.stringify({ index: { _index: index } }) + "\n" + JSON.stringify(d) + "\n";
  const r = await fetch(`${ES_URL}/_bulk?refresh=true`, {
    method: "POST",
    headers: { "Content-Type": "application/x-ndjson", ...AUTH },
    body,
  });
  if (!r.ok) throw new Error(`bulk ${index} -> ${r.status}: ${(await r.text()).slice(0, 500)}`);
}

const lorem = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ".repeat(40);

function docs(n, big) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    group: `g${i % 7}`,
    payload: big ? `${lorem} #${i} ` + "x".repeat(4000) : `small doc #${i}`,
  }));
}

async function main() {
  console.log("ES:", ES_URL);
  for (const idx of [BIG, MEDIUM, TINY]) await deleteIfExists(idx);
  if (CLEAN_ONLY) { console.log("cleaned seed indices"); return; }

  // Pin big shards to `es`, tiny to `es2` to force a visible imbalance.
  await create(BIG, { shards: 4, extra: { "index.routing.allocation.require._name": "es" } });
  await create(MEDIUM, { shards: 2, extra: {} });
  await create(TINY, { shards: 1, extra: { "index.routing.allocation.require._name": "es2" } });

  console.log("bulk-loading docs…");
  await bulk(BIG, docs(3000, true));     // several MB spread over 4 shards on es
  await bulk(MEDIUM, docs(400, false));  // small, free allocation
  await bulk(TINY, docs(20, false));     // tiny, on es2

  // Force Lucene flush per index so _cat/shards `store` reports real sizes
  // immediately (freshly indexed shards can show 0b until segments hit disk;
  // wildcard _flush proved unreliable, so flush each index explicitly).
  for (const idx of [BIG, MEDIUM, TINY]) await req("POST", `${idx}/_flush`);
  await new Promise((r) => setTimeout(r, 1500));

  const shards = await req("GET", "_cat/shards?format=json&h=index,shard,prirep,store,node");
  console.table(shards.filter((s) => s.index.startsWith("viz-")));
  console.log("\nDone. Open the UI and you should see red/large tiles piled on `es`.");
}

main().catch((e) => { console.error("seed failed:", e.message); process.exit(1); });
