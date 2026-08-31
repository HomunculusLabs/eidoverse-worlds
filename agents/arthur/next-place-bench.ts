// next-place-bench.ts — polish lane (polish-275): re-place nx-dress-bench-plaza
// with the center-leg build (construction-logic repair). Empty comp bag.
// Chassis: next-place-banner.ts.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const ID = "nx-dress-bench-plaza";
const FILE = `${ROOT}/agents/arthur/assets/village_bench_arc.glb`;
const REVIEWED_SHA = "09f4d1741fdb24a631a42d0ecf8e89e03f95e1ea63ba557514b369bb64becc29";
const REVIEWED_LIB = `store/${REVIEWED_SHA.slice(0, 16)}.glb`;
const POSE = { pos: [-9.5, 0, -9.5] as [number, number, number], yaw: 0.7853981633974483, scale: 1 };
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
const live = before[ID];
if (!live) die(`${ID} missing before placement`);
if (Object.keys(live.comp ?? {}).length !== 0) die(`comp bag not empty: ${JSON.stringify(Object.keys(live.comp))}`);

const already = live.lib === REVIEWED_LIB
  && near(live.pos[0], POSE.pos[0]) && near(live.pos[1], POSE.pos[1]) && near(live.pos[2], POSE.pos[2])
  && near(live.yaw, POSE.yaw) && (live.scale ?? 1) === 1;

if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "plaza bench — polish-275 center leg");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (lib !== REVIEWED_LIB) die(`upload returned ${lib}, expected ${REVIEWED_LIB}`);

  const verbs: Array<[string, any]> = [["spawn", { id: ID, lib, pos: POSE.pos, yaw: POSE.yaw, scale: 1 }]];
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-polish-bench", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearInterval(paced); clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearInterval(paced); clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") joined = true;
    };
  });
} else {
  console.log("already live at reviewed tuple — no verbs");
}

const after = await geom();
const p = after[ID];
const ok = p?.lib === REVIEWED_LIB
  && near(p.pos[0], POSE.pos[0]) && near(p.pos[1], POSE.pos[1]) && near(p.pos[2], POSE.pos[2])
  && near(p.yaw, POSE.yaw) && (p.scale ?? 1) === 1
  && Object.keys(p.comp ?? {}).length === 0;
if (!ok) die(`post-place verification failed: ${JSON.stringify(p)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: p.lib, pos: p.pos, yaw: p.yaw, compKeys: Object.keys(p.comp ?? {}).sort() }));
