// fauna14-place-pig.ts — placement tick for the fauna-14 pig sty (NEW
// entity, no replace). Chassis: fauna13-place-sheep.ts (proven fresh-entity
// variant): absent → place; fully seated → zero verbs; our lib + want tuple
// + short comps → interrupted-batch recovery. Any other state = hard stop.
// Contract: nx-dress-pig-001 at the meadow S of the kiln yard
// (15.0, −0.021261, 40.2) yaw 0.66 scale 1 — terrain 9pt spread 7.2mm at
// this exact tuple; heads face NE (local +z, facing = (sin,cos)) toward the
// mosaic-row visitor line; sty frame shelters SSW. Seat law: pigs root
// BESIDE art, never on it — mosaic 0048's film NE edge (12.9,43.2) keeps
// 3.49m normal clearance (0.05m ground film, ground-layer exemption both
// directions, sheep precedent). Nearest solid: harvest cart (12,36) paper
// SAT +3.2m (the acorn-cart pannage story holds at close range). Lib
// a49187024127dcd8… (v8 judge-SHIP bytes: 18m PASS + closeface SHIP).
// 6 motion comps: 2 breathing bobs (part bob) + rooter root-dig X-pendulum
// + wallower ear-flick swivel + 2 tail-curl flicks; phases staggered, t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-pig-001";
const SHA = "a49187024127dcd8a57d6d7ac8ee11ddf3127e0d27b753d56f564ed64a0fb471";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [15.0, -0.021261, 40.2], YAW = 0.66, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_pigsty.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("pig bytes drift");

// motion comps — mirrors fauna14-render-pig.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:pig_a": { type: "bob", amp: 0.006, period: 4.1, phase: 0.4, t0: T0 },
  "motion:pig_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.13, period: 3.0, phase: 0.9, t0: T0 },
  "motion:pig_a_tail": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.20, period: 1.7, phase: 0.2, t0: T0 },
  "motion:pig_b": { type: "bob", amp: 0.004, period: 5.0, phase: 1.8, t0: T0 },
  "motion:pig_b_ear": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.18, period: 2.2, phase: 1.3, t0: T0 },
  "motion:pig_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.15, period: 2.6, phase: 2.0, t0: T0 },
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
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 6;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

// live SAT preflight (interlane law: fresh census above). Our OBB from the
// decode envelope (bbox center offset applied): local x −1.491..1.711,
// z −1.274..1.917 → center (+0.110, +0.322), half (1.601, 1.596).
// Mosaic 0048 + artwalk riders are ≤0.5m films (ground-layer/rider
// exemption, height prong); harvest cart is the nearest solid.
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = (-1.4913442 + 1.7112464) / 2, cz = (-1.2735219 + 1.9168000) / 2; // (0.110, 0.322)
  const hw = (1.4913442 + 1.7112464) / 2, hd = (1.2735219 + 1.9168000) / 2;  // 1.601, 1.596
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const b = e.bbox;
    if (b.size[1] <= 0.5) continue; // film/rider exemption (height prong)
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const boxes: Array<[number, number, number, number, number]> = [[ewx, ewz, b.size[0] / 2, b.size[2] / 2, e.yaw]];
    for (const [bx, bz, bhx, bhz, byaw] of boxes) {
      const dx = wx - bx, dz = wz - bz;
      const bc = Math.cos(byaw), bs = Math.sin(byaw);
      const theirAxes: [number, number][] = [[bc, -bs], [bs, bc]];
      const theirHalf = [bhx, bhz];
      let best = -Infinity;
      for (const [ax, az] of [...myAxes, ...theirAxes]) {
        const myProj = myHalf[0] * Math.abs(myAxes[0][0] * ax + myAxes[0][1] * az) + myHalf[1] * Math.abs(myAxes[1][0] * ax + myAxes[1][1] * az);
        const tProj = theirHalf[0] * Math.abs(theirAxes[0][0] * ax + theirAxes[0][1] * az) + theirHalf[1] * Math.abs(theirAxes[1][0] * ax + theirAxes[1][1] * az);
        const gap = Math.abs(dx * ax + dz * az) - myProj - tProj;
        if (gap > best) best = gap;
      }
      if (best < worst) { worst = best; worstId = `${e.id}`; }
    }
  }
  console.log(`SAT preflight: ${neighbors.length} neighbors — worst gap ${worst.toFixed(3)}m (${worstId})`);
  if (worst < 0) die(`SAT overlap vs ${worstId} (${worst.toFixed(3)}m)`);
  if (worst < 1.4) die(`sub-1.4 solid adjacency vs ${worstId} (${worst.toFixed(3)}m)`);
}

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next pig fauna-14");
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
      if (verb === "remove") return; // spawn follows after the remove settles
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna14-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
