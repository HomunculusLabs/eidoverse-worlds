// fauna69-place-pigeon.ts — place the fauna-69 feral pigeon market flock.
// Chassis: fauna67-place-guinea.ts (proven two-pass placer). Seat law:
// the market stall's plaza-side fore-court — entity at (-6.25, PY, 2)
// yaw 0.4354 (fauna69-seat-sweep best of 45 qualifying: stall-local
// fore-court front corner (+3.0,+3.4 along the face diagonal); worst gap
// 2.122m vs the market itself — the food-host designed adjacency; hearth
// clear 2.0m). Reader lines: the W-gate spoke (~2m S of the flock) +
// the plaza→stall diagonal (~3m E) — the flock feeds BESIDE the reader
// line, never on it (lamp-in-path law). SAT solids mirror the sweep
// EXACTLY (one placement contract, one tuple): films + suspended
// stringlights + the streetlamp NETWORK exempt (its 8 real posts are
// decoded point solids, fauna69-lampposts.ts).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-pigeon-001";
const SHA = "2a46634ff0d0a2b8c93930315d1336e79c1a9ee235ad964c64d99fb367faa34b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-6.25, 0, 2], YAW = 0.4354, SCALE = 1;
// v7 decode whole-envelope: min[-0.717,-0.002,-0.369] max[0.385,0.243,0.36]
const FLOCK = { hx: 0.551, hz: 0.3645, cx: -0.166, cz: -0.0045 };
const FILM_IDS = /^(nx-town-roads|nx-roads|nx-paths|nx-artwalk-|nx-dress-lavender|nx-orchard|nx-mosaic|nx-core-paths|nx-approach-)/;
const SUSPENDED_IDS = /^(nx-dress-stringlights)$/;
const POSTS: [number, number][] = [
  [9.397, 3.42], [9.397, -3.42], [3.42, 9.397], [3.42, -9.397],
  [-3.42, 9.397], [-3.42, -9.397], [-9.397, 3.42], [-9.397, -3.42],
];

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_pigeon1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("pigeon bytes drift");

// motion comps — mirrored verbatim in fauna69-render-pigeon.ts (the same
// payloads drove the engine-true motion pairs + the judge-arc renders).
// 3 breathing bobs + peck-bob X (the double-nod pigeon peck) + strut
// head-bob scan Y + THE COURTING BOW on the cock (deepest display comp)
// + walker tail flick — phases staggered per individual.
const T0 = Date.now();
const MOTION = {
  "motion:pige_a": { type: "bob", amp: 0.005, period: 3.6, phase: 0.0, t0: T0 },
  "motion:pige_b": { type: "bob", amp: 0.005, period: 4.1, phase: 1.3, t0: T0 },
  "motion:pige_c": { type: "bob", amp: 0.004, period: 4.6, phase: 2.4, t0: T0 },
  "motion:pige_a_head": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.7, phase: 0.5, t0: T0 },
  "motion:pige_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 6.5, phase: 2.1, t0: T0 },
  "motion:pige_c_head": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.30, period: 3.4, phase: 1.6, t0: T0 },
  "motion:pige_b_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 0.9, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return { map: Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>, list: d.entities as any[] };
}

const before = await geom();
const e0 = before.map[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 7;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before.map).length, "| target:", e0 ? "present" : "absent");

// ---- LIVE SAT PREFLIGHT (fresh census — interlane law; mirrors the sweep) ----
const proj = (o: any, ux: number, uz: number) => {
  const lx = Math.cos(o.yaw), lz = Math.sin(o.yaw);
  const zx = -Math.sin(o.yaw), zz = Math.cos(o.yaw);
  return o.hx * Math.abs(lx * ux + lz * uz) + o.hz * Math.abs(zx * ux + zz * uz);
};
const gap = (a: any, b: any) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  let best = -Infinity;
  for (const o of [a, b]) {
    for (const [ux, uz] of [[Math.cos(o.yaw), -Math.sin(o.yaw)], [Math.sin(o.yaw), Math.cos(o.yaw)]]) {
      const g = Math.abs(dx * ux + dz * uz) - proj(a, ux, uz) - proj(b, ux, uz);
      if (g > best) best = g;
    }
  }
  return best;
};
const me = {
  x: POS[0] + FLOCK.cx * Math.cos(YAW) + FLOCK.cz * Math.sin(YAW),
  z: POS[2] - FLOCK.cx * Math.sin(YAW) + FLOCK.cz * Math.cos(YAW),
  hx: FLOCK.hx, hz: FLOCK.hz, yaw: YAW,
};
let worst = Infinity, worstId = "";
const check = (id: string, x: number, z: number, hx: number, hz: number, yaw: number) => {
  const g2 = gap(me, { id, x, z, hx, hz, yaw });
  if (g2 < worst) { worst = g2; worstId = id; }
};
for (const e of before.list) {
  if (e.id === ID || !e.pos || !e.bbox) continue;
  if (FILM_IDS.test(e.id) || SUSPENDED_IDS.test(e.id)) continue;
  if (e.id === "nx-town-streetlamps") continue; // replaced by the 8 decoded posts
  if (e.bbox.max?.[1] !== undefined && (e.bbox.max[1] - e.bbox.min[1]) <= 0.5) continue;
  if (Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) > 22) continue;
  const s = e.bbox.size, c = e.bbox.center;
  const cx = Array.isArray(c) ? c[0] : c.x, cz = Array.isArray(c) ? c[2] : c.z;
  const ex = e.pos[0] + cx * Math.cos(e.yaw) + cz * Math.sin(e.yaw);
  const ez = e.pos[2] - cx * Math.sin(e.yaw) + cz * Math.cos(e.yaw);
  check(e.id, ex, ez, s[0] / 2, s[2] / 2, e.yaw);
}
for (const [px, pz] of POSTS) check("lamp-post", px, pz, 0.23, 0.23, 0);
console.log(JSON.stringify({ satWorst: +worst.toFixed(3), satWorstId: worstId }));
if (worst < 1.4) die(`live SAT failed: ${worstId} gap ${worst.toFixed(3)} < 1.4`);

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next feral pigeon market flock fauna-69");
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
    const t = setTimeout(() => reject(Error("verb timeout")), 120_000);
    const paced = setInterval(() => {
      if (!joined || i >= verbs.length) return;
      const [verb, args] = verbs[i++];
      ws.send(JSON.stringify({ type: "verb", verb, args }));
      if (verb === "remove") return; // spawn follows after the remove settles
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna69-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket"));
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") reject(Error(`server ${m.error}`));
      else if (m.type === "snapshot") joined = true;
    };
  });
}

const after = await geom();
const e = after.map[ID];
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
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after.map).length,
}));
