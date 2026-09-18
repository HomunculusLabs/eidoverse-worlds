// fauna16-place-dovecote.ts — placement tick for the fauna-16 dovecote (NEW
// entity, no replace). Chassis: fauna14-place-pig.ts (proven fresh-entity
// variant): absent → place; fully seated → zero verbs; our lib + want tuple
// + 6 comps → interrupted-batch recovery. Any other state = hard stop.
// Contract: nx-dress-dovecote-001 at the orchard-edge meadow
// (-50.5, 0.0367, 62.55) yaw 2.577 scale 1 — facing SE toward the stile/
// visitor approach; 1.559m clear of the espalier row OBB (worst solid —
// fauna-17: the fauna-16 seat (62.75) hard-stopped at 1.390m, sub-1.4
// pinch law; pure-north 0.2m move re-swept against the LIVE census),
// lavender-0040 film exempt (h 0.55), 2.64m from orchard-0033's
// easternmost decoded trunk (-53.10, 62.08).
//
// PY DISCLOSURE (fauna-17): terrain WS door REOPENED (fauna-16's 3 join
// timeouts cleared) — PY = 0.0367 is a LIVE heightAt at the FINAL tuple
// (fauna16 law f: live heightAt outranks sibling-IDW; the fauna-16 IDW
// 0.030 with low-embed bias is superseded). 5-pt spread 1.7mm.
//
// SAT notes: orchard-0033's 14.5m bbox is CROWN OVERHEAD (decoded meshes
// y 1.51..3.79; ground solids are the 41-trunk decoded map, easternmost
// (-53.10, 62.08) = 2.81m center-dist from the seat — exempted from bbox
// SAT with this comment per the struct-19 exact-geometry law). Lavender
// beds + garden 0058 are ≤0.78m films (height-prong exemption).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-dovecote-001";
const SHA = "8f33f97f97b0e4de4a8a64961aca3dc02e59d3cd42bfd5d5629adfa3dc53be3f";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-50.5, 0.0367, 62.55], YAW = 2.577, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_dovecote.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("dovecote bytes drift");

// motion comps — mirrors fauna16-render-dovecote.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:dove_a": { type: "bob", amp: 0.005, period: 3.9, phase: 0.2, t0: T0 },
  "motion:dove_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 7.5, phase: 0.5, t0: T0 },
  "motion:dove_b": { type: "bob", amp: 0.005, period: 4.4, phase: 1.7, t0: T0 },
  "motion:dove_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.32, period: 8.5, phase: 1.1, t0: T0 },
  "motion:dove_c": { type: "bob", amp: 0.004, period: 4.8, phase: 1.3, t0: T0 },
  "motion:dove_c_head": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.26, period: 2.9, phase: 0.8, t0: T0 },
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
// decode envelope: local x -0.970..0.815, z -0.283..1.290 → center
// (-0.0775, +0.5035), half (0.8925, 0.7865).
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = (-0.9700665 + 0.8148347) / 2, cz = (-0.2828427 + 1.2900000) / 2; // (-0.0776, 0.5036)
  const hw = (0.9700665 + 0.8148347) / 2, hd = (0.2828427 + 1.2900000) / 2;   // 0.8925, 0.7864
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    if (e.id === "nx-cultivation-orchard-0033") continue; // crown overhead — decoded trunk map in header (2.81m clear)
    const b = e.bbox;
    if (b.size[1] <= 0.6) continue; // film/rider exemption (height prong)
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
  u.searchParams.set("name", "commons-next dovecote fauna-16");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna16-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
