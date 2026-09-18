// fauna19-place-shorse.ts — placement tick for the fauna-19 stable horses
// (NEW entity, no replace). Chassis: fauna14-place-pig.ts (proven
// fresh-entity variant): absent → place; fully seated → zero verbs; our lib
// + want tuple + 7 comps → interrupted-batch recovery. Any other state =
// hard stop. Contract: nx-dress-shorse-001 at the livery east yard
// (49.5, −0.03564, 0) yaw −1.75 scale 1 — terrain 9pt spread 3.2mm at this
// exact tuple; heads face WSW (local +z, facing = (sin,cos)) toward the
// road-end approach; hitch rail shelters the local −z (NE) side. Seat law:
// fauna19-seat-sweep best of 91 qualifying — worst solid gap 1.637m vs the
// stable itself (the yard's own design adjacency, concentric-site class);
// owl post 2.9m+; road films end at |x|≤20.6 (no walking-line conflict,
// lamp-in-path law checked). Lib 6ef0e86c141774c… (v3 judge-SHIP bytes:
// 18m SHIP + near anatomy + profile tails; decode GREEN + RED control;
// lateral tail-swish analytically clear of the rail at full amplitude).
// 7 motion comps: 2 breathing bobs (part bob) + watch Y-scan head-scan +
// ear-flick swivel + graze-tug X-pendulum + 2 LATERAL tail swishes (axis
// [0,0,1] — the sweep-probe law: axis [1,0,0] clipped the rail beam at
// full amplitude); phases staggered, t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-shorse-001";
const SHA = "6ef0e86c1dc1774c63e3617b8ec4861295cf90a6a7d65d18a44abe329663af5b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [49.5, -0.03564, 0], YAW = -1.75, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_stablehorses.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("shorse bytes drift");

// motion comps — mirrors fauna19-render-shorse.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:shorse_a": { type: "bob", amp: 0.006, period: 4.6, phase: 0.3, t0: T0 },
  "motion:shorse_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.35, period: 9.0, phase: 0.0, t0: T0 },
  "motion:shorse_a_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.18, period: 2.4, phase: 1.1, t0: T0 },
  "motion:shorse_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.32, period: 2.6, phase: 0.5, t0: T0 },
  "motion:shorse_b": { type: "bob", amp: 0.005, period: 5.2, phase: 1.9, t0: T0 },
  "motion:shorse_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.13, period: 3.2, phase: 0.8, t0: T0 },
  "motion:shorse_b_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.26, period: 2.2, phase: 1.5, t0: T0 },
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
// decode envelope (bbox center offset applied): local x −1.500..1.600,
// z −1.509..1.832 → center (+0.050, +0.1615), half (1.550, 1.6705).
// Films/riders ≤0.5m exempt; suspended decor (b8 rail y 2.22) exempt.
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = (-1.5 + 1.6) / 2, cz = (-1.509 + 1.832) / 2; // (0.050, 0.1615)
  const hw = (1.5 + 1.6) / 2, hd = (1.509 + 1.832) / 2;   // 1.550, 1.6705
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
  u.searchParams.set("name", "commons-next shorse fauna-19");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna19-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
