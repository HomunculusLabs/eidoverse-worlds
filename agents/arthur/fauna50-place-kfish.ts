// fauna50-place-kfish.ts — placement tick for the fauna-50 kingfisher
// (NEW entity, no replace — census shows no kfish in the domain;
// riders/mounts law: nothing mounts nx-dress-kfish-001, first of its
// id). Chassis: fauna48-place-sparrow.ts (proven fresh-entity
// variant): the entity must NOT exist (fresh run), exist fully seated
// (idempotent rerun, zero verbs), or exist at the want tuple with our
// lib but short comps (interrupted mid-batch — recover by
// remove+respawn+comps). ANY other live state under this id = real
// drift/collision: hard stop.
// Contract: nx-dress-kfish-001 at world (-70.05, -0.02224, 4.48) yaw
// 4.8932 scale 1 — the fauna50-seat-sweep best (202 qualifying; worst
// non-race solid gap 4.567m vs nx-struct-nodoid, far; race member
// gates passed at source: base 1.0m from the step column edge, snag
// crossing 0.31m clear of step-6's top, tip 0.284m into the film band,
// zone clear of chute + basin/reeds). PY = live heightAt (9pt spread
// 0.8mm). Lib cdf3bf7a4020b34e1f200ed92e024fa96b7403df1bff2b6c791e2
// 25bdb2af147 (v5 judge-closed bytes: lone SHIP r3 7/7 + encounter
// SHIP r5 + night SHIP r6; decode GREEN + RED control; deterministic
// ×2).
// 4 motion comps (mirrored EXACTLY from fauna50-render-kfish.ts, where
// the same payloads drove the engine-true motion pair: 2759px @ the
// profile discover framing): breathing bob + the pre-dive lean + head
// Y-scan + tail flick.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-kfish-001";
const SHA = "cdf3bf7a4020b34e1f200ed92e024fa96b7403df1bff2b6c791e225bdb2af147";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-70.05, -0.02224, 4.48], YAW = 4.8932, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_kfish1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("kfish bytes drift");

// motion comps — mirrors fauna50-render-kfish.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:kfish": { type: "bob", amp: 0.005, period: 4.6, phase: 0.0, t0: T0 },
  "motion:kfish_body": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.10, period: 5.8, phase: 0.4, t0: T0 },
  "motion:kfish_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 7.5, phase: 0.9, t0: T0 },
  "motion:kfish_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.14, period: 2.2, phase: 1.5, t0: T0 },
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
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 4;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next kingfisher fauna-50");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna50-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
