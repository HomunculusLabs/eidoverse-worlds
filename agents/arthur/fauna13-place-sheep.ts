// fauna13-place-sheep.ts — placement tick for the fauna-13 sheep fold (NEW
// entity, no replace). Chassis: fauna11-place-geese.ts (proven fresh-entity
// variant): absent → place; fully seated → zero verbs; our lib + want tuple
// + short comps → interrupted-batch recovery. Any other state = hard stop.
// Contract: nx-dress-sheep-001 at the SW meadow W of the dyehouse
// (−27.5, −0.0517, −31.5) yaw 0.65 scale 1 — terrain 9pt spread 4.1mm at
// this exact tuple; fold opens NE toward the dye yard (facing = (sin,cos));
// hurdles shelter SW. Obstruction analysis (census-class law — the lane
// network's origin bbox is meaningless): nearest lane members are the baked
// lamp post (−25.2,−30.67) 2.70m and D4 bone pillar i15 (−23.95,−29.31)
// 3.92m — both > 1.4m from every fold member; mosaic 0059 is a 0.05m-tall
// ground film (ground-layer exemption both directions); milestones sw-005/
// 006 recorded pillar solids ≥ 2.05m. Lib 31a512ed7195f27a… (v8 judge-SHIP
// bytes: profile 5/5 + 18m 5/5 + closeface 5/5). 6 motion comps: 2 breathing
// bobs (part bob) + grazer graze-tug X-pendulum + watch Y-axis head-scan
// (owl/goose sentry family) + 2 tail-stub flicks; phases staggered, t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-sheep-001";
const SHA = "31a512ed7195f27ab16cbf3fee7af730d97841ffa5fd6e53af86429ee1afbab2";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-27.5, -0.0517, -31.5], YAW = 0.65, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_sheepfold.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("sheep bytes drift");

// motion comps — mirrors fauna13-render-sheep.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:sheep_a": { type: "bob", amp: 0.006, period: 4.4, phase: 0.3, t0: T0 },
  "motion:sheep_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.4, phase: 1.1, t0: T0 },
  "motion:sheep_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 1.9, phase: 0.7, t0: T0 },
  "motion:sheep_b": { type: "bob", amp: 0.006, period: 3.8, phase: 2.2, t0: T0 },
  "motion:sheep_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.35, period: 9.0, phase: 0.0, t0: T0 },
  "motion:sheep_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 2.2, phase: 1.5, t0: T0 },
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
// decode envelope (bbox center offset applied). Lane network + mosaic get
// DECODED MEMBER boxes (census-class law: a network's origin bbox spans the
// whole district and means nothing); pavers/verge are a walkable film
// (ground-layer exemption, both directions).
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = (-1.9313570 + 2.3446882) / 2, cz = (-2.6125000 + 1.5125000) / 2; // (0.207, −0.550)
  const hw = (1.9313570 + 2.3446882) / 2, hd = (2.6125000 + 1.5125000) / 2;  // 2.138, 2.063
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  // named pillar/mast solids allowed closer than 1.4 (milestone posts are
  // 0.42m columns — a fold may shelter near a waymarker without pinching;
  // measured values in FAUNA-PLAN)
  const PILLAR_OK: Record<string, number> = { "nx-mile-sw-006": 0.95, "nx-mile-sw-005": 0.95 };
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const boxes: Array<[number, number, number, number, number, number]> = []; // cx,cz,hx,hz,yaw,extra
    if (e.id === "nx-approach-sw-lane-003") {
      // decoded members (mkv3-sw-approach3.ts): lamp post + D4 bone pillars
      boxes.push([-25.20, -30.67, 0.10, 0.10, 0]);  // baked lamp post 1
      boxes.push([-34.69, -43.14, 0.10, 0.10, 0]);  // baked lamp post 2 (far, listed for completeness)
      boxes.push([-23.95, -29.31, 0.10, 0.10, 0]);  // pillar i15
      boxes.push([-29.52, -36.64, 0.10, 0.10, 0]);  // pillar i25
      // pavers/verge stones = walkable film → exempt (height ≤ 0.19)
    } else if (e.id === "nx-gallery-mosaic-0059") {
      continue; // 0.05m ground film (ground-layer exemption)
    } else {
      const b = e.bbox;
      if (b.size[1] <= 0.5) continue; // generic film exemption (height prong)
      const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
      const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
      const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
      boxes.push([ewx, ewz, b.size[0] / 2, b.size[2] / 2, e.yaw]);
    }
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
  if (worst < 1.4 && !(worstId in PILLAR_OK)) die(`sub-1.4 solid adjacency vs ${worstId} (${worst.toFixed(3)}m)`);
  if (worstId in PILLAR_OK && worst < PILLAR_OK[worstId]) die(`pillar adjacency under allowance vs ${worstId} (${worst.toFixed(3)}m)`);
}

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next sheep fauna-13");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna13-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
