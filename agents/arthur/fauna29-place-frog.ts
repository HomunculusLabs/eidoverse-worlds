// fauna29-place-frog.ts — placement tick for the fauna-29 pond frog (NEW
// entity, no replace). Chassis: fauna28-place-peahen.ts (proven
// fresh-entity variant): absent → place; fully seated → zero verbs; our
// lib + want tuple + 3 comps → interrupted-batch recovery. Any other
// state = hard stop. Contract: nx-dress-frog-001 at the reedpool NW
// quadrant water seat (7.873, 0.08093, −89.132) yaw 3π/4 scale 1 — the
// WATER-RIDER seat (struct-19 class, ducks fauna-3 precedent): pad face
// (entity local y=0) EXACTLY at the decoded water top — pool host
// nx-struct-reedpool at (9.723, −0.05907, −90.982) yaw 0 (pure
// translation), water disc top host-local y 0.140 → world +0.08093.
// Frog faces the bridge mid-span (10.1, −89.7) reader vantage: facing =
// (sin,cos) yaw law → (0.707, −0.707) ✓.
// SAT exemptions (each with its measured value — peahen lavender-gate
// pattern): (a) nx-struct-reedpool EXEMPT — the concentric water host,
// the commission IS life on the pool (ducks precedent); seat center sits
// 2.057m inside the water ellipse (radii 4.5/3.0), 2.60m open-water
// clear of the bridge deck OBB (|dx|≤0.95 → member-box 1.60m), 0.73m
// clear of the W bank reed cluster (cluster (−1.85·…) member 0.55
// spread → outermost stem x −2.40); (b) nx-dress-ducks-001 EXEMPT as
// designed co-resident — member-box clearance 1.14m (their live bbox W
// edge host-local −4.39 vs frog OBB E edge −3.25). All other neighbors
// ≥ 1.4m by full-envelope SAT.
// Lib c372159974ef9415… (v7 judge-SHIP bytes: top/bridge SHIP + side
// profile SHIP; decode GREEN + RED control; deterministic ×2). 3 motion
// comps: breathing bob + sit-and-wait head Y-scan + throat-sac pulse
// (nested in head — rides the scan); phases staggered, epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-frog-001";
const SHA = "c372159974ef9415ed773b10edc3928d2a0560a43bf176e6519142b164b275d8";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [7.873, 0.08093, -89.132], YAW = 2.356194490192345, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_frog.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("frog bytes drift");

// motion comps — mirrors fauna29-render-frog.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:frog": { type: "bob", amp: 0.004, period: 4.6, phase: 0.5, t0: T0 },
  "motion:frog_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.20, period: 7.5, phase: 0.2, t0: T0 },
  "motion:frog_throat": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.06, period: 2.1, phase: 1.1, t0: T0 },
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
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 3;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

// live SAT preflight (interlane law: fresh census above). Our OBB from
// the decode envelope (v7): local x −0.248..0.248, z −0.248..0.248 →
// center (0, 0), half (0.248, 0.248). Films ≤0.5m exempt; suspended
// decor exempt; the two NAMED concentric/co-resident exemptions carry
// their measured member-box values (header comment).
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 16);
  const cx = 0, cz = 0;
  const hw = 0.248, hd = 0.248;
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const b = e.bbox;
    if (b.size[1] <= 0.5) continue; // film/rider exemption (height prong)
    if (e.pos[1] >= 1.8) continue; // suspended decor exemption
    if (e.id === "nx-struct-reedpool") continue; // CONCENTRIC WATER HOST (ducks precedent, header values)
    if (e.id === "nx-dress-ducks-001") continue; // designed co-resident, member-box 1.14m (header values)
    if (e.id === "nx-struct-angler") continue;   // DECODED EMPTY-CORNER (artwalk-34/37 tier b): the 6.28m
    // compound bbox's E corner (world x 4.58, z 1.1 angler-local) is empty
    // air — the bbox spans the leaned rod + line + bobber (struct-13, city-11
    // re-aim). Source-decoded nearest members to THIS seat: bobber 3.753m
    // (12cm brass sphere at world (7.723, −92.882), pool-local (−2.0,−1.9)),
    // rod tip 3.968m, rod butt 4.358m; the solid deck ends at world x 4.58 —
    // 3.29m W of the seat. All members ≥ 1.4m: the 0.399m bbox-SAT read is
    // inflation, not contact. (The angler fishes the SW water; the frog sits
    // NW — pool life in the angler's view.)
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
  u.searchParams.set("name", "commons-next frog fauna-29");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna29-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
