// fauna3-place-ducks.ts — placement tick for the fauna-3 duck pair (NEW
// entity, no replace). Chassis: fauna2-place-hens.ts (proven), fresh-entity
// variant: the entity must NOT exist (fresh run), exist fully seated
// (idempotent rerun, zero verbs), or exist at the want tuple with our lib
// but short comps (interrupted mid-batch — recover by remove+respawn+comps).
// ANY other live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-ducks-001 at the reedpool water plane (8.0, -0.139,
// -91.0) yaw 0 scale 1 — host decode nx-struct-reedpool [9.723,-0.05907,
// -90.982]: pool center origin, water top host-local y 0.14 -> world
// -0.05907+0.119 = water top 0.060 at (8,-91); entity WL 0.02 below top
// => PY -0.139. Rider concentric with its water host (struct-19 class,
// BILL-APPROVED by commission: the mandate is life ON the pool). Pair
// rides the open W lobe (x -3.6..-1.2 host-local = world 6.1..8.5 — the
// 1.56m pair bbox at world x 7.2..8.8 clears the bridge |dx|<=0.95 and
// the bank reeds x<=5.6). Lib c156b6a12a935495… (v3 judge-PASS bytes).
// 6 motion comps: drake ripple-bob (part bob) + dabble neck pendulum +
// tail flick; duck slow swim orbit (part orbit, engine motion.js evalPart)
// + deeper dabble pendulum + tail flick; phases staggered, epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-ducks-001";
const SHA = "c156b6a12a935495a091ba146b394c6e2a152fecf40abdd3eebdc5e36ac85f92";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [8.0, -0.139, -91.0], YAW = 0, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_duckpair.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("duck bytes drift");

// motion comps — mirrors fauna3-render-ducks.ts, where the same payloads
// drove the engine-true motion pairs (bob + orbit = evalPart cases VERBATIM
// from client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:duck_a": { type: "bob", amp: 0.018, period: 3.8, phase: 0.0, t0: T0 },
  "motion:duck_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.1, phase: 1.3, t0: T0 },
  "motion:duck_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 1.6, phase: 0.4, t0: T0 },
  "motion:duck_b": { type: "orbit", center: [-2.3, 0.02, -0.75], radius: 0.55, degPerSec: 7, phase: Math.PI / 2, t0: T0 },
  "motion:duck_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 4.4, phase: 2.8, t0: T0 },
  "motion:duck_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 1.9, phase: 1.1, t0: T0 },
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

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next ducks fauna-3");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna3-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
