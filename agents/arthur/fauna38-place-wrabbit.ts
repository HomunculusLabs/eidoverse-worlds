// fauna38-place-wrabbit.ts — placement tick for the fauna-38 wild
// rabbits (NEW entity, no replace — the census shows no wrabbit in the
// domain). Chassis: fauna37-place-dog.ts (proven fresh-entity variant):
// the entity must NOT exist (fresh run), exist fully seated (idempotent
// rerun, zero verbs), or exist at the want tuple with our lib but short
// comps (interrupted mid-batch — recover by remove+respawn+comps). ANY
// other live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-wrabbit-001 at world (-23, 0.00041, 15.25) yaw
// 0.585 scale 1 — the fauna38-seat-sweep best seat (worst solid gap
// 1.426m vs nx-town-garden-cottage = the garden-edge designed
// adjacency; facing SE toward the plaza reader); PY = live heightAt
// (9pt spread 0.4mm). Lib 57edb8a9b7cc076b… (v4 judge-PASS bytes:
// encounter PASS r3 + 18m PASS final; decode GREEN + RED control).
// 7 motion comps (mirrored EXACTLY from fauna38-render-wrabbit.ts,
// where the same payloads drove the engine-true motion pairs):
// 2 breathing bobs + alert scan Y + grazer nibble X + 2 nested ear
// flicks + scut flick Z.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-wrabbit-001";
const SHA = "57edb8a9b7cc076b9051abbbcedaba265c6dbc0a3db237d336b44d10950d1dc3";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-23, 0.00041, 15.25], YAW = 0.585, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_wrabbit1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("wrabbit bytes drift");

// motion comps — mirrors fauna38-render-wrabbit.ts, where the same payloads
// drove the engine-true motion pairs (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:wrabbit_a": { type: "bob", amp: 0.005, period: 3.6, phase: 0.0, t0: T0 },
  "motion:wrabbit_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 6.5, phase: 1.1, t0: T0 },
  "motion:wrabbit_a_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.2, phase: 0.7, t0: T0 },
  "motion:wrabbit_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.20, period: 1.9, phase: 2.1, t0: T0 },
  "motion:wrabbit_b": { type: "bob", amp: 0.004, period: 4.2, phase: 0.5, t0: T0 },
  "motion:wrabbit_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.20, period: 2.8, phase: 1.7, t0: T0 },
  "motion:wrabbit_b_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.12, period: 2.5, phase: 1.3, t0: T0 },
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

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next wild rabbits fauna-38");
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna38-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
