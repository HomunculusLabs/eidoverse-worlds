// fauna11-place-geese.ts — placement tick for the fauna-11 goose pair (NEW
// entity, no replace). Chassis: fauna3-place-ducks.ts (proven fresh-entity
// variant): the entity must NOT exist (fresh run), exist fully seated
// (idempotent rerun, zero verbs), or exist at the want tuple with our lib
// but short comps (interrupted mid-batch — recover by remove+respawn+comps).
// ANY other live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-geese-001 on the reedpool SW bank meadow (7.9, -0.0408,
// -96.6) yaw 0.45 scale 1 — seat law: beside the water it lives on (ducks W
// lobe on the water, robin N rim, geese SW bank grazing ground), facing NNE
// across the pool toward the bridge foot. Exact member-box SAT vs pool
// source decode (mkv3-reedpool.ts @ live 7d770620): rim ellipse 4.55/3.05 —
// rim-face gap 1.54m >= 1.4; S sill (local x -1.2..1.2, z -4.0..-3.3) a
// walkable furniture member 0.59m clear; both masts (1.25,±3.8) > 1.4m.
// Terrain preflight at the FINAL tuple: 9pt spread 5.9mm, PY -0.0408.
// Lib 67a8406dd63612ea… (v7 judge-PASS bytes: closeface PASS, 18m PASS).
// 6 motion comps: 2 breathing bobs (part bob) + grazer graze-tug neck
// pendulum + sentry Y-axis head-scan pendulum (owl family) + 2 tail flicks;
// phases staggered, epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-geese-001";
const SHA = "67a8406dd63612ea5deafe7814e58d7b0cb77fca7207092824a0e06329cad913";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [7.9, -0.0408, -96.6], YAW = 0.45, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_goosepair.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("geese bytes drift");

// motion comps — mirrors fauna11-render-geese.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:goose_a": { type: "bob", amp: 0.006, period: 4.2, phase: 0.0, t0: T0 },
  "motion:goose_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.30, period: 3.2, phase: 0.8, t0: T0 },
  "motion:goose_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 1.7, phase: 0.4, t0: T0 },
  "motion:goose_b": { type: "bob", amp: 0.006, period: 3.6, phase: 2.1, t0: T0 },
  "motion:goose_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.35, period: 9.0, phase: 0.0, t0: T0 },
  "motion:goose_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 2.0, phase: 1.3, t0: T0 },
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
  // only sanctioned non-idempotent state: our lib at the want tuple with a
  // short comp bag (a batch interrupted between spawn and comps)
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

// live SAT preflight (interlane law: fresh census already fetched above).
// Rotated-OBB vs every neighbor in 14m; pool members use exact source
// member boxes (rim ellipse face, sill, masts); ground-layer + fauna
// film exemptions N/A here (no such neighbors in range).
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 14);
  // our OBB from the decode envelope (bbox center offset applied)
  const cx = (-0.8559018 + 0.7607188) / 2, cz = (-0.6513698 + 0.8528600) / 2; // ≈ (-0.048, 0.101)
  const hw = (0.7607188 + 0.8559018) / 2, hd = (0.8528600 + 0.6513698) / 2;
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const wx = POS[0] + cx * cos + cz * sin, wz = POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  const pool = before["nx-struct-reedpool"];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const boxes: Array<[number, number, number, number, number, number]> = []; // cx,cz,hx,hz,yaw,extra
    if (e.id === "nx-struct-reedpool") {
      // exact member boxes, host yaw 0 → local == world offset
      const px = pool.pos[0], pz = pool.pos[2];
      for (const sz of [-1, 1]) boxes.push([px + 1.25, pz + sz * 3.8, 0.1, 0.1, 0]); // masts
      boxes.push([px, pz - 3.65, 1.2, 0.35, 0]); // S sill
      // rim: front face approximated by the ellipse band at the S aspect
      // — treat as OBB hx 4.55, hz 0.14 centered (px, pz-3.02)
      boxes.push([px, pz - 3.02, 4.55, 0.14, 0]);
      boxes.push([px, pz + 3.02, 4.55, 0.14, 0]);
      boxes.push([px - 4.52, pz, 0.14, 3.05, 0]);
      boxes.push([px + 4.52, pz, 0.14, 3.05, 0]);
    } else {
      const b = e.bbox;
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
  // 1.4m pinch law: solid-solid only. Pool rim/sill/masts measured above;
  // named adjacency exceptions recorded in FAUNA-PLAN with values.
  if (worst < 1.4 && worstId !== "nx-struct-reedpool") die(`sub-1.4 solid adjacency vs ${worstId} (${worst.toFixed(3)}m)`);
  if (worstId === "nx-struct-reedpool" && worst < 1.4) console.log(`  pool adjacency ${worst.toFixed(3)}m — design adjacency (concentric-site class, recorded in FAUNA-PLAN)`);
}

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next geese fauna-11");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna11-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
