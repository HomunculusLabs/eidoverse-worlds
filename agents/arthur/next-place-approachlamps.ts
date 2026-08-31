// next-place-approachlamps.ts — polish lane (polish-280): re-place all four
// approach lamps (nx-approach-lamp-n/s/e/w) with the post-finial build.
// One shared GLB, four entity slots, empty comp bags (companion -l lights are
// separate entities, untouched). Chassis: next-place-gates.ts.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_approach_lamp.glb`;
const REVIEWED_SHA = "18b69a6bb2f5862f9848ec25687981a1eba5cd07b23b90d1ed6e735086672b87";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const HALF = Math.PI / 2;
const SLOTS: Array<{ id: string; pos: [number, number, number]; yaw: number }> = [
  { id: "nx-approach-lamp-n", pos: [0, 0, 10], yaw: -HALF },
  { id: "nx-approach-lamp-s", pos: [0, 0, -10], yaw: HALF },
  { id: "nx-approach-lamp-e", pos: [10, 0, 0], yaw: Math.PI },
  { id: "nx-approach-lamp-w", pos: [-10, 0, 0], yaw: 0 },
];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

const bytes = readFileSync(FILE);
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== REVIEWED_SHA) die(`reviewed hash mismatch: ${sha}`);

const before = await geom();
const todo: typeof SLOTS = [];
for (const s of SLOTS) {
  const live = before[s.id];
  if (!live) die(`${s.id} missing before placement`);
  if (Object.keys(live.comp ?? {}).length !== 0) die(`${s.id} comp bag not empty: ${JSON.stringify(Object.keys(live.comp))}`);
  const already = live.lib === REVIEWED_LIB
    && near(live.pos[0], s.pos[0]) && near(live.pos[1], s.pos[1]) && near(live.pos[2], s.pos[2])
    && near(live.yaw, s.yaw) && (live.scale ?? 1) === 1;
  if (!already) todo.push(s);
}

if (todo.length > 0) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "approach lamp — polish-280 post finial");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (lib !== REVIEWED_LIB) die(`upload returned ${lib}, expected ${REVIEWED_LIB}`);

  const verbs: Array<[string, any]> = todo.map(s => ["spawn", { id: s.id, lib, pos: s.pos, yaw: s.yaw, scale: 1 }] as [string, any]);
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++];
      ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800);
    }, 700);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-polish-applamps", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") joined = true;
    };
  });
  console.log(`spawned ${todo.length} approach lamp slot(s)`);
} else {
  console.log("all approach lamps already live at reviewed tuples — no verbs");
}

const after = await geom();
for (const s of SLOTS) {
  const p = after[s.id];
  const ok = p?.lib === REVIEWED_LIB
    && near(p.pos[0], s.pos[0]) && near(p.pos[1], s.pos[1]) && near(p.pos[2], s.pos[2])
    && near(p.yaw, s.yaw) && (p.scale ?? 1) === 1
    && Object.keys(p.comp ?? {}).length === 0;
  if (!ok) die(`post-place verification failed for ${s.id}: ${JSON.stringify(p)}`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", slots: SLOTS.length, lib: REVIEWED_LIB }));
