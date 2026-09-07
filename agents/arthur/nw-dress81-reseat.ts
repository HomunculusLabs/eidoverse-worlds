// nw-dress81-reseat.ts — dress-81 cure reseat for nx-dress-nw-orchard-rows-001
// (survey-23 routed intake, executed by the OWNING dress lane).
// v2 (7359f025, dress-74) -> v7 (962c5fb0, dress-81): 18m fence-read cure.
// Migration law: the standing entity must match the EXACT known old pin
// (artwalk migration class — any OTHER live mismatch is hard drift: stop).
// Reseat = remove verb, 600ms, spawn over the same join WS (artwalk-33
// chassis; spawn alone does NOT move a standing entity).
// Pose UNCHANGED from dress-74: (-48.062, 0.034, 67.530) yaw 2.3562 — only
// the lib changes. TRUE v7 decoded dims: x -3.06..3.1265 (half 3.09325,
// center +0.03325), z -0.15..0.3855 (half 0.26775, center +0.11775),
// y 0..1.772 (uneven-top topGrid class, same as v2). Static unlit, comps
// empty both sides (comp-wipe law: empty bag, nothing to restore).
// Gates: exact SHA, old-pin migration check, blocker-epoch guard, fresh
// live-set SAT (thin ground films exempt; solid-solid 1.4m pinch law),
// rim [66,108]. Shared upload budget: one slot, 429 backoff; verbs paced.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_orchardrows1.glb`;
const SHA = "962c5fb041d19c634514836daf086c7390a90fce781a8a22e9de85f01a3da33e";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const OLD_LIB = "store/7359f025c59a0ef2.glb"; // dress-74 v2 standing pin
const ID = "nx-dress-nw-orchard-rows-001";
const POS = [-48.062, 0.034, 67.530], YAW = 2.3562;
// v7 decode: x half 3.09325 center +0.03325; z half 0.26775 center +0.11775
const HALF = { x: 3.09325, z: 0.26775 }, CLOCAL = { x: 0.03325, z: 0.11775 };
const BLOCKERS = ["nx-cultivation-garden-0058", "nx-cultivation-orchard-0033",
  "nx-dress-nw-hedge-001", "nx-dress-nw-skeps-001"];

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return {
    cx: pos[0] + c.x * cos + c.z * sin,
    cz: pos[2] - c.x * sin + c.z * cos,
    ux: [cos, -sin], uz: [sin, cos],
    hu: [half.x, half.z],
  };
}
const radius = (o: OBB, ax: number[]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] +
  Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let gap = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
    const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
    if (g > gap) gap = g;
  }
  return gap;
}

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
// migration gate: standing entity must be the EXACT old contract, the NEW
// contract (idempotent no-op), or absent
if (e && !(e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) {
  if (e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1) {
    console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: 0, idempotent: true }));
    process.exit(0);
  }
  die(`${ID} unexpected live state (not the known dress-74 pin): ${JSON.stringify({ lib: e.lib, pos: e.pos, yaw: e.yaw })}`);
}

// SAT preflight vs fresh live set at TRUE v7 dims (self excluded)
const A = obb(POS, YAW, HALF, CLOCAL);
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — exempt class
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight clear; sub-1.4m solid adjacencies:", adjacencies.length ? adjacencies.join(", ") : "none");
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
  const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
  const mn = Math.min(...rs), mx = Math.max(...rs);
  if (mn < 66 || mx > 108) die(`rim corners ${mn.toFixed(2)}..${mx.toFixed(2)} outside [66,108]`);
  console.log(`rim corners ${mn.toFixed(2)}..${mx.toFixed(2)} in [66,108]`);
}

// upload (content-addressed; 429 backoff, shared 4/min budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NW espalier fruit rows dress-81 v7");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { uploaded = (await r.json()).path; break; }
  if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// reseat: if the old entity stands, remove first (spawn alone never moves it);
// then spawn at the unchanged tuple. Verbs paced 600ms+.
{
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress81-reseat", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") {
        const verbs: any[] = [];
        if (e) verbs.push({ type: "verb", verb: "remove", args: { id: ID } });
        verbs.push({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } });
        verbs.forEach((v, i) => setTimeout(() => ws.send(JSON.stringify(v)), 800 + i * 700));
        setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 800 + verbs.length * 700 + 2200);
      }
    };
  });
}

// post-place verify (fresh)
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: e ? 2 : 1, migrated_from: e ? OLD_LIB : null }));
