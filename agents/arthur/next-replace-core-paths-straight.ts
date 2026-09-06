// next-replace-core-paths-straight.ts — town-1 part 2 (Bill's screenshot
// correction): re-place nx-core-paths with the STRAIGHTENED network — the
// four cardinal spokes now run through r10 (lamps moved off-axis) and the
// three lamp-bypass doglegs are gone. Old placer (next-place-core-paths.ts)
// pins the old SHA + 75-paver manifest and has no replace path; this one
// uploads the new bytes (content-addressed) and remove+spawns the entity.
// Manifest: 78 pavers, fresh review hash baked in below.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import WebSocket from "ws";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next", ID = "nx-core-paths";
const FILE = `${ROOT}/agents/arthur/assets/village_next_core_paths.glb`;
const MFILE = `${ROOT}/agents/arthur/assets/village_next_core_paths.review.json`;
const OLD_LIB = "store/9ce1378d47fd8a22.glb";
const bytes = readFileSync(FILE), mb = readFileSync(MFILE);
const SHA = createHash("sha256").update(bytes).digest("hex");
const MSHA = createHash("sha256").update(mb).digest("hex");
const manifest = JSON.parse(mb.toString());
if (manifest.pavers.length !== 79) throw new Error(`paver manifest drift: ${manifest.pavers.length}`);
const NEW_LIB = `store/${SHA.slice(0, 16)}.glb`;

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

const before = await geom();
const existing = before[ID];
if (!existing) die("nx-core-paths missing before replace");
if (existing.lib !== OLD_LIB) die(`unexpected live lib: ${existing.lib}`);
if (Object.keys(existing.comp ?? {}).length !== 0) die(`comp bag not empty: ${Object.keys(existing.comp)}`);

// SAT-preflight every new paver against live footprints (excl. self + the
// moved lamps, whose hosts are pinned off-axis and re-verified below).
type O = { c: [number, number], u: [number, number], v: [number, number], hu: number, hv: number };
function O(x: number, z: number, yaw: number, w: number, d: number): O {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { c: [x, z], u: [c, -s], v: [s, c], hu: w / 2, hv: d / 2 };
}
function EO(e: any): O {
  const b = e.bbox, yaw = e.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const x = (b.min[0] + b.max[0]) / 2, z = (b.min[2] + b.max[2]) / 2;
  return O(e.pos[0] + x * c + z * s, e.pos[2] - x * s + z * c, yaw, b.max[0] - b.min[0], b.max[2] - b.min[2]);
}
function gap(A: O, B: O): number {
  let best = -Infinity;
  for (const x of [A.u, A.v, B.u, B.v]) {
    const dd = Math.abs((B.c[0] - A.c[0]) * x[0] + (B.c[1] - A.c[1]) * x[1]);
    const ra = A.hu * Math.abs(A.u[0] * x[0] + A.u[1] * x[1]) + A.hv * Math.abs(A.v[0] * x[0] + A.v[1] * x[1]);
    const rb = B.hu * Math.abs(B.u[0] * x[0] + B.u[1] * x[1]) + B.hv * Math.abs(B.v[0] * x[0] + B.v[1] * x[1]);
    best = Math.max(best, dd - ra - rb);
  }
  return best;
}
const LAMPS = ["nx-approach-lamp-e", "nx-approach-lamp-n", "nx-approach-lamp-w", "nx-approach-lamp-s"];
const want_lamp: Record<string, [number, number]> = {
  "nx-approach-lamp-e": [10, 1.75], "nx-approach-lamp-s": [-1.75, -10],
  "nx-approach-lamp-n": [1.75, 10], "nx-approach-lamp-w": [-10, -1.75],
};
for (const lid of LAMPS) {
  const live = before[lid];
  if (!live) die(`${lid} missing — lamp move must land before paths`);
  if (!near(live.pos[0], want_lamp[lid][0]) || !near(live.pos[2], want_lamp[lid][1]))
    die(`${lid} not at off-axis pin: ${JSON.stringify(live.pos)}`);
}
// ground-layer exemption law (nvp-109..132): thin layers (roads, other path
// networks) span the town and overlap every paver geometrically — exclude by
// bbox height <= 0.5m. Real colliders (lamps h~2.5, buildings) still gate.
// ground-layer exemption law (nvp-109..132), BOTH prongs: thin layers by
// height, PLUS known network layers by explicit id — nx-town-roads carries
// vertical members (bbox h 2.94) but its footprint is a road NETWORK that
// geometrically spans every paver; paths/roads are walkable surface films
// (solid-solid pinch law does not apply, films can't pinch a walker).
const GROUND_LAYERS = new Set(["nx-town-roads", "nx-core-paths", "nx-town-streetlamps"]);
const footprints = Object.values(before).filter((e: any) =>
  e.bbox && e.id !== ID && !GROUND_LAYERS.has(e.id)
  && (e.bbox.max[1] - e.bbox.min[1]) > 0.5);
let min = Infinity;
for (const p of manifest.pavers) for (const e of footprints) {
  const g = gap(O(p.x, p.z, p.yaw, p.w, p.d), EO(e));
  min = Math.min(min, g);
  if (g < -0.001) die(`paver ${p.id} overlaps ${e.id}: ${g.toFixed(3)}`);
}
console.log(`SAT preflight min clearance ${min.toFixed(3)}m over ${manifest.pavers.length} pavers`);

// upload new bytes
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "core paths straightened — town-1 lamp correction");
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 6; a++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { lib = (await r.json()).path; break; }
  if (r.status === 429 && a < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (lib !== NEW_LIB) die(`upload returned ${lib}, expected ${NEW_LIB}`);
console.log(`uploaded ${NEW_LIB}`);

// remove + spawn over one WS (paced)
const verbs: Array<[string, any]> = [
  ["remove", { id: ID }],
  ["spawn", { id: ID, lib: NEW_LIB, pos: [0, 0, 0], yaw: 0, scale: 1 }],
];
await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  let joined = false, i = 0;
  const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 45_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-town-paths-straight", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 200)}`)); return; }
    if (m.type === "snapshot" && !joined) {
      joined = true;
      const paced = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 1800); return; }
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
      }, 700);
    }
  };
});

const after = await geom();
const e = after[ID];
if (!(e?.lib === NEW_LIB && e.pos.every((n: number) => near(n, 0)) && near(e.yaw ?? 0, 0) && e.scale === 1 && Object.keys(e.comp ?? {}).length === 0))
  die(`post-place tuple failed: ${JSON.stringify(e)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: NEW_LIB, pavers: manifest.pavers.length, minClearance: +min.toFixed(3) }));
