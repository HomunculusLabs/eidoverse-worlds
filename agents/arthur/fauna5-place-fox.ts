// fauna5-place-fox.ts — placement tick for the fauna-5 den fox (NEW
// entity, no replace — the census shows no fox entity at the den).
// Chassis: fauna3-place-ducks.ts (proven fresh-entity variant): the entity
// must NOT exist (fresh run), exist fully seated (idempotent rerun, zero
// verbs), or exist at the want tuple with our lib but short comps
// (interrupted mid-batch — recover by remove+respawn+comps). ANY other
// live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-se-fox-001 at world (72.62, -0.041, -9.66) yaw
// 5.052389 (fox-local +x = nose direction; world yaw = den yaw
// 4.712389 + fox-local yaw 0.34) — the SAME tuple the review rig seated
// (compFox.position.set(0.84,0.012,0.38), rotation.y 0.34 over the den
// at origin yaw 0) and the judges passed. Derivation (village transform,
// den yaw 3π/2: cos=0, sin=-1): wx = 73 + 0.84·0 + 0.38·(-1) = 72.62;
// wz = -10.5 - 0.84·(-1) + 0.38·0 = -9.66. Anchor math (den-local):
// mouth face plane x 0.55 vs fox x-span [0.67,1.02] — mouth clear 0.12m;
// anchor stone (0.42,0.55) r~0.2 vs fox rear corner (0.67,0.64) — nestle
// 0.09m gap; rim chunks max x 0.46 — 0.21m clear; counter-lobe mound
// (1.15,1.10) r~0.40 vs fox front corner (1.02,0.64) — 0.10m clear; fox
// fully on the worn pad (pad x 0.05..1.15, z -0.20..0.64).
// PY -0.041 = den base -0.0532 + 0.012 (the same ground the den stands
// on; the pad is at grade, terrain preflight dress-106 center -0.0532).
// Lib bc7376b3d17f1fad… (v10 judge-PASS bytes, 5/5 encounter + 4/4 18m).
// 3 motion comps: fox breathing bob, fox_head doze sway pendulum,
// fox_tail lazy flick — phases staggered, epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-se-fox-001";
const SHA = "bc7376b3d17f1fad3dcafb63a8d1e9c7e49b641a75d61d0513b3018177a37644";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [72.62, -0.041, -9.66], YAW = 5.052389, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_se_fox2.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("fox bytes drift");

// motion comps — mirrors fauna5-render-fox.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:fox": { type: "bob", amp: 0.006, period: 3.4, phase: 0.0, t0: T0 },
  "motion:fox_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.07, period: 5.2, phase: 1.7, t0: T0 },
  "motion:fox_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 2.8, phase: 2.6, t0: T0 },
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

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next den fox fauna-5");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna5-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
