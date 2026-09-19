// fauna35-place-heron.ts — place the fauna-35 grey heron. Chassis:
// fauna34-place-swallows.ts (proven two-pass placer). Seat: the reedpool
// E-bank open water — WADER class (inverse of the frog's pad seat): entity
// local y=0 IS the decoded water top +0.08093; legs wade below (invisible
// under the opaque water face — fauna-29 law a does the illusion).
// HOST-TUPLE HARD GATE (fauna-32 FRAME-COPY law): the pool host
// nx-struct-reedpool must stand at (9.723,−0.05907,−90.982) yaw 0 lib
// 7d770620bb1b7bdc — drift = die, never blind-reuse. Water-plane witness:
// the standing frog's live PY must be 0.08093 (±5mm) — a second lane's
// pinned seat confirms the plane before we seat on it.
// Member clearances (pool-local, mk header): reeds 1.93/2.03m, masts
// 4.34m, ducks 4.92m, frog 5.30m — water-rider concentric class (ducks
// fauna-3 precedent); no ground SAT beyond host-membership arithmetic.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-heron-001";
const SHA = "f6a10294784764bb1fab7771f1648c293a2900889f61a0ca42b9124378f69595";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [12.92, 0.08093, -91.38], YAW = -3 * Math.PI / 4, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna35_heron.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("heron bytes drift");

// motion comps — mirrored verbatim in fauna35-render-heron.ts (the same
// payloads drove the engine-true motion pairs: bob = motion.js bob case
// VERBATIM; pendulums = rotatePartAtPivot on the captured base)
const T0 = Date.now();
const MOTION = {
  "motion:heron": { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 4.6, phase: 0.0, t0: T0 },
  "motion:heron_neck": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.08, period: 6.4, phase: 1.2, t0: T0 },
  "motion:heron_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 2.4, t0: T0 },
  "motion:heron_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 2.6, phase: 0.6, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// HOST GATE: pool tuple + water-plane witness (frog seat)
const pool = before["nx-struct-reedpool"];
if (!pool) die("pool host absent");
if (!(vec(pool.pos, [9.723, -0.05907, -90.982]) || vec(pool.pos, [9.72, -0.059, -90.98]))) {
  // accept the rounded census values
  if (!(Math.abs(pool.pos[0] - 9.723) < 0.01 && Math.abs(pool.pos[1] - (-0.05907)) < 0.001 && Math.abs(pool.pos[2] - (-90.982)) < 0.01)) die(`pool host drift: ${pool.pos}`);
}
if (!(pool.lib ?? "").includes("7d770620bb1b7bdc")) die(`pool lib drift: ${pool.lib}`);
const frog = before["nx-dress-frog-001"];
if (!frog) die("frog witness absent");
if (Math.abs(frog.pos[1] - 0.08093) > 0.005) die(`water-plane witness drift: frog PY ${frog.pos[1]}`);
// seat inside the water ellipse (pool-local): |dx|/4.5² + |dz|/3.0² < 1
{
  const dx = POS[0] - 9.723, dz = POS[2] - (-90.982);
  const t = (dx * dx) / (4.5 * 4.5) + (dz * dz) / (3.0 * 3.0);
  if (t >= 1) die(`seat outside water ellipse: t=${t.toFixed(3)}`);
  console.log(`water ellipse membership: t=${t.toFixed(3)} (edge 1.0), ${(Math.sqrt(1 - t) * 100).toFixed(0)}% deep`);
}

const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 4;
if (e0 && !already) {
  die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next grey heron fauna-35");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna35-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
