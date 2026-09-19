// fauna44-place-sqrl.ts — placement tick for the fauna-44 red squirrel
// (NEW entity, no replace — the census shows no sqrl in the domain;
// riders/mounts law: nothing mounts nx-dress-sqrl-001, first of its id).
// Chassis: fauna42-place-hog.ts (proven fresh-entity variant): the
// entity must NOT exist (fresh run), exist fully seated (idempotent
// rerun, zero verbs), or exist at the want tuple with our lib but short
// comps (interrupted mid-batch — recover by remove+respawn+comps). ANY
// other live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-sqrl-001 at world (59.602, 0.616, 52.028) yaw
// -3.927 scale 1 — ON the NE woodstack crown (host-rider concentric-
// above class; the fauna44-seat-sweep qualifying seat host-local
// (0.25,-0.10), worst non-host solid gap 2.013m vs nx-craft-hamlet-
// 0028; the judged composite renders used THIS exact tuple —
// falsified before mutation). PY = host-derived: host y -0.032 +
// crown top 0.648. Lib 186f227d9a407e34… (v6 judge-SHIP bytes:
// comp_near SHIP ×2 + runner SHIP + face SHIP + scope PRESENT; decode
// GREEN + RED control; deterministic ×2). 9 motion comps mirrored
// EXACTLY from fauna44-render-sqrl.ts (same payloads drove the
// engine-true motion pair 1462px at comp_near).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-sqrl-001";
const SHA = "186f227d9a407e340a186d82336f01ab9b7103e836c658a1eb59aede33126a70";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [59.602, 0.616, 52.028], YAW = -3.927, SCALE = 1;
const HOST = "nx-dress-ne-woodstack-001", HOST_LIB = "692bc54e02358cc1.glb";

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_sqrl1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("sqrl bytes drift");

// motion comps — mirrors fauna44-render-sqrl.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:sqrl_a": { type: "bob", amp: 0.005, period: 4.2, phase: 0.0, t0: T0 },
  "motion:sqrl_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 7.0, phase: 0.2, t0: T0 },
  "motion:sqrl_a_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.3, phase: 0.9, t0: T0 },
  "motion:sqrl_a_paws": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.12, period: 2.8, phase: 1.3, t0: T0 },
  "motion:sqrl_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 3.4, phase: 0.4, t0: T0 },
  "motion:sqrl_b": { type: "bob", amp: 0.004, period: 4.8, phase: 0.5, t0: T0 },
  "motion:sqrl_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.20, period: 2.9, phase: 0.2, t0: T0 },
  "motion:sqrl_b_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.12, period: 2.5, phase: 0.6, t0: T0 },
  "motion:sqrl_b_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 0.1, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const host = before[HOST];
if (!host) die("host woodstack absent at placement time");
if (!host.lib.endsWith(HOST_LIB)) die(`host lib drift at placement: ${host.lib}`); // artwalk-39 law
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 9;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next red squirrel fauna-44");
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna44-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
