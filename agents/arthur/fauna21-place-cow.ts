// fauna21-place-cow.ts — placement tick for the fauna-21 dairy cows
// (NEW entity, no replace). Chassis: fauna19-place-shorse.ts (proven
// fresh-entity variant): absent → place; fully seated → zero verbs; our lib
// + want tuple + 7 comps → interrupted-batch recovery. Any other state =
// hard stop. Contract: nx-dress-cow-001 at the meadow E of the pig sty
// (24, −0.02489, 40.75) yaw 0.66 scale 1 — terrain 9pt spread 8.0mm at
// this exact tuple; heads face NE (local +z, facing = (sin,cos)) toward
// the mosaic-row visitor line; the hay rack shelters the grazer's SW flank.
// Seat law: fauna21-seat-sweep best of 598 qualifying — worst solid gap
// 3.361m vs the pig sty (the pannage meadow's own adjacency); artwalk
// b31/b32/b33 riders are film-class + SAT-set members, NEVER touched
// (entity-domain law). Lib 943beb2b1931d85e… (v5 judge-SHIP bytes:
// 18m SHIP + closeface SHIP + profile SHIP + ultraface SHIP; decode GREEN
// + RED control; lateral tail swishes analytically clear of the rack at
// full amplitude — sweep probe). 7 motion comps: 2 breathing bobs (part
// bob) + watch Y-scan head-scan + ear-flick swivel + graze-tug X-pendulum
// + 2 LATERAL tail swishes (axis [0,0,1] — shorse law); phases staggered.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-cow-001";
const SHA = "943beb2b1931d85e45706eb863e746ff2a9ace4ff9ad040f3d413603ac8763f8";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [24, -0.02489, 40.75], YAW = 0.66, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_dairycows.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("cow bytes drift");

// motion comps — mirrors fauna21-render-cow.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:cow_a": { type: "bob", amp: 0.006, period: 4.7, phase: 0.4, t0: T0 },
  "motion:cow_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.35, period: 8.5, phase: 0.0, t0: T0 },
  "motion:cow_a_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.20, period: 2.3, phase: 1.2, t0: T0 },
  "motion:cow_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.34, period: 2.7, phase: 0.6, t0: T0 },
  "motion:cow_b": { type: "bob", amp: 0.005, period: 5.4, phase: 2.0, t0: T0 },
  "motion:cow_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.13, period: 3.4, phase: 0.9, t0: T0 },
  "motion:cow_b_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.28, period: 2.3, phase: 1.6, t0: T0 },
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
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 7;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

// live SAT preflight (interlane law: fresh census above). Our OBB from the
// decode envelope (bbox center offset applied): local x −1.700..1.400,
// z −1.150..1.864 → center (−0.150, +0.357), half (1.550, 1.507).
// Films/riders ≤0.5m exempt; suspended decor exempt.
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = (-1.7 + 1.4) / 2, cz = (-1.15 + 1.864) / 2; // (−0.150, 0.357)
  const hw = (1.7 + 1.4) / 2, hd = (1.15 + 1.864) / 2;   // 1.550, 1.507
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const b = e.bbox;
    if (b.size[1] <= 0.5) continue; // film/rider exemption (height prong)
    if (e.pos[1] >= 1.8) continue; // suspended decor exemption
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
  u.searchParams.set("name", "commons-next cow fauna-21");
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2500);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna21-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
