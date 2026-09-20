// fauna53-place-towl.ts — placement tick for the fauna-53 tawny owls
// (NEW entity, no replace — census shows no towl in the domain;
// riders/mounts law: nothing mounts nx-dress-towl-001, first of its
// id). Chassis: fauna52-place-yham.ts (proven fresh-entity variant).
// Contract: nx-dress-towl-001 at world (-49.455, 1.534, 65.953) yaw
// 2.3562 scale 1 — the FRAME-COPY HOST-RIDER seat (yham fauna-52 /
// bees fauna-32 class): entity origin at rows-host-local (2.10, +1.50,
// 0.13) = plant-2 crown mid; entity yaw == host yaw → entity-local ==
// rows-host-local VERBATIM (the owls' baked crown positions demand it —
// no seat degree of freedom to sweep). PY = host py 0.034 + decoded
// plant-2 crown 1.50 (host decode is the height source — terrain
// preflight does not apply to crown-rider seats, fauna-44/yham law).
// HOST HARD-GATE (artwalk-39 law — drift = die, never blind-reuse):
// nx-dress-nw-orchard-rows-001 must stand at (-48.062, 0.034, 67.53)
// yaw 2.3562 lib store/962c5fb041d19c.glb (local bytes hash-exact
// this tick). SAT: towl OBB (decode v8: x [-0.478,0.458] z
// [-0.180,0.214] → center (-0.010,0.017) half (0.468,0.197)) vs every
// NON-HOST solid ≥1.4m — the host is the concentric commission (owls
// IN the crown, measured value recorded). Lib
// 4e8d09972f2cc811a210887c395d51eee2efd8e2b4ccc3b4c4a7d1ce647c49d9 (v8
// judge-closed bytes: encounter SHIP r8 + 18m PRESENT + night SHIP;
// decode GREEN + RED control; deterministic ×2).
// 5 motion comps (mirrored EXACTLY from fauna53-render-towl.ts, where
// the same payloads drove the engine-true motion pair: 2479px band
// 390-585 @ rows_discover): 2 breathing bobs + sentinel slow Y-scan
// + tail settle-twitch + sleeper doze head-scan.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-towl-001";
const SHA = "4e8d09972f2cc811a210887c395d51eee2efd8e2b4ccc3b4c4a7d1ce647c49d9";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-49.455, 1.534, 65.953], YAW = 2.3562, SCALE = 1;
const HOST = { id: "nx-dress-nw-orchard-rows-001", pos: [-48.062, 0.034, 67.53], yaw: 2.3562, lib: "store/962c5fb041d19c63.glb" };

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_towl1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("towl bytes drift");

// motion comps — mirrors fauna53-render-towl.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:towl_a": { type: "bob", amp: 0.004, period: 5.2, phase: 0.0, t0: T0 },
  "motion:towl_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 0.3, t0: T0 },
  "motion:towl_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.1, phase: 1.2, t0: T0 },
  "motion:towl_b": { type: "bob", amp: 0.003, period: 7.0, phase: 2.1, t0: T0 },
  "motion:towl_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.10, period: 11.0, phase: 0.8, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const e0 = before[ID];
// HOST HARD-GATE — the frame-copy contract dies on host drift
const h0 = before[HOST.id];
if (!h0) die("host rows absent from census");
if (!vec(h0.pos, HOST.pos) || !near(h0.yaw, HOST.yaw) || h0.lib !== HOST.lib)
  die(`host drift: ${h0.pos} ${h0.yaw} ${h0.lib} (want ${HOST.pos} ${HOST.yaw} ${HOST.lib})`);
// SAT vs non-host solids (live census law — fresh set, right now)
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const CX = -0.010, CZ = 0.017, HW = 0.468, HD = 0.197;
  const wx = POS[0] + CX * cos + CZ * sin, wz = POS[2] - CX * sin + CZ * cos;
  const yOBB = { x: wx, z: wz, yaw: YAW, hw: HW, hd: HD, ax: [cos, -sin], az: [sin, cos] };
  const gap = (a: any, b: any) => {
    const dx = a.x - b.x, dz = a.z - b.z;
    const axes: [number, number][] = [a.ax, a.az, b.ax, b.az];
    let best = -Infinity;
    for (const [ux, uz] of axes) {
      const pa = a.hw * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hd * Math.abs(a.az[0] * ux + a.az[1] * uz);
      const pb = b.hw * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hd * Math.abs(b.az[0] * ux + b.az[1] * uz);
      const g = Math.abs(dx * ux + dz * uz) - pa - pb;
      if (g > best) best = g;
    }
    return best;
  };
  let worst = Infinity, worstId = "";
  for (const e of Object.values(before)) {
    if (e.id === ID || e.id === HOST.id) continue;      // host = the concentric commission
    if (!e.bbox) continue;                               // lights/riders
    if (e.bbox.size[1] <= 0.5) continue;                 // films/planted fields
    // LAVENDER BED EXEMPTION — standing precedent fauna-25/16/17/52
    // register: walkable planting films that the 0.5m height proxy
    // false-blocks at 0.55. Measured by fauna52-decode-lavender40.ts on
    // live bytes 5e04ce4b: plant tops max y 0.55, zero verticals above;
    // the owls stand at y 1.5+ (crown) → ≥0.9m vertical clearance.
    if (e.id.startsWith("nx-cultivation-lavender-")) continue;
    if (e.pos[1] >= 1.8) continue;                       // suspended decor
    if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 20) continue;
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const g = gap(yOBB, { x: ewx, z: ewz, yaw: e.yaw, hw: b.size[0] / 2, hd: b.size[2] / 2, ax: [Math.cos(e.yaw), -Math.sin(e.yaw)], az: [Math.sin(e.yaw), Math.cos(e.yaw)] });
    if (g < worst) { worst = g; worstId = e.id; }
  }
  console.log(`SAT (non-host): worst gap ${worst.toFixed(3)}m vs ${worstId}`);
  if (worst < 1.4) die(`non-host solid within pinch law: ${worstId} ${worst}`);
}

const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 5;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent", "| host:", "gated OK");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next tawny owls fauna-53");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  if (e0) verbs.push(["remove", { id: ID }]); // interrupted-batch recovery only
  verbs.push(["spawn", { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: SCALE }]);
  for (const [type, data] of Object.entries(MOTION)) verbs.push(["comp", { id: ID, type, data }]);
}

if (verbs.length) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const t = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++];
      ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna53-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket"));
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") reject(Error(`server ${m.error}`));
      else if (m.type === "snapshot") joined = true;
    };
  });
}

const after = await geom();
const e = after[ID];
if (!(e?.lib === LIB && vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE)) die("post tuple/lib");
const bag = e.comp ?? {};
const keys = Object.keys(bag).sort();
const wantKeys = Object.keys(WANT).sort();
if (!eq(keys, wantKeys)) die(`post comp keys ${keys}`);
for (const k of wantKeys) {
  const got = bag[k], want = WANT[k];
  const { t0: gt0, ...grest } = got ?? {};
  const { t0: _wt0, ...wrest } = want;
  void _wt0;
  if (!eq(grest, wrest)) die(`comp drift ${k}: ${JSON.stringify(got)}`);
  if (typeof gt0 !== "number" || !(gt0 > 0)) die(`comp t0 invalid ${k}: ${gt0}`);
  if (!already && Math.abs(gt0 - T0) > 60_000) die(`fresh comp t0 not this epoch ${k}: ${gt0} vs ${T0}`);
}
// host re-verify post-placement (the rider must not have disturbed it)
const h1 = after[HOST.id];
if (!vec(h1.pos, HOST.pos) || !near(h1.yaw, HOST.yaw) || h1.lib !== HOST.lib) die("host disturbed by placement");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
