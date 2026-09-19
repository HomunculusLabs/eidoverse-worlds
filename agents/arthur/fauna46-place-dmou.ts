// fauna46-place-dmou.ts — placement tick for the fauna-46 dormouse
// (NEW entity, no replace — the census shows no dmou in the domain;
// riders/mounts law: nothing mounts nx-dress-dmou-001, first of its id).
// Chassis: fauna45-place-hmou.ts (proven fresh-entity variant): the
// entity must NOT exist (fresh run), exist fully seated (idempotent
// rerun, zero verbs), or exist at the want tuple with our lib but short
// comps (interrupted mid-batch — recover by remove+respawn+comps). ANY
// other live state under this id = real drift/collision: hard stop.
// Contract: nx-dress-dmou-001 at world (-51.5, 0.03391, 64.25) yaw
// 0.744 scale 1 — the fauna46-seat-sweep best of 4 lawful seats (the
// hedge-line corridor between the dovecote and the espalier rows SW
// end — the plan row-31 anchor; worst solid gap 1.565m vs the rows;
// facing back down the stile-approach reader line, facing =
// (cos,−sin) yaw law). PY = live heightAt (9pt spread 0.2mm). Lib
// c21430641ffadf67fba81efe968359f7695f1573f119a4619259265bdb4aac78
// (v6 judge-closed bytes: close SHIP r6 + encounter PASS + 18m PASS
// sub-visible-disclosed; decode GREEN + RED control). 4 motion comps
// (mirrored EXACTLY from fauna46-render-dmou.ts, where the same
// payloads drove the engine-true motion pair).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-dmou-001";
const SHA = "c21430641ffadf67fba81efe968359f7695f1573f119a4619259265bdb4aac78";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-51.5, 0.03391, 64.25], YAW = 0.744, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_dmou1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("dmou bytes drift");

// motion comps — mirrors fauna46-render-dmou.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta).
// Motion-sweep law (fauna-19 a): all amplitudes clear their furniture
// by construction — head sway ±0.14 rad arcs the head ±3.5mm (rim
// clearance 30mm), ear twitch ±0.16 rotates the embedded ear pair,
// tail settle ±0.08 swings the drape tip ±2.5mm (15mm proud of the
// wall face) — the rig's orch_near pair at true phases rendered 289px
// localized with zero strike artifacts.
const T0 = Date.now();
const MOTION = {
  "motion:dmou": { type: "bob", amp: 0.004, period: 4.8, phase: 0.0, t0: T0 },
  "motion:dmou_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.14, period: 11.0, phase: 0.7, t0: T0 },
  "motion:dmou_ear": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.1, phase: 0.35, t0: T0 },
  "motion:dmou_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.08, period: 6.4, phase: 1.2, t0: T0 },
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
  u.searchParams.set("name", "commons-next dormouse fauna-46");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna46-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
