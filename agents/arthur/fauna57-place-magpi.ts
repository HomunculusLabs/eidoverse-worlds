// fauna57-place-magpi.ts — placement tick for the fauna-57 magpie
// (NEW entity, no replace — census shows no magpi/corvid in the domain;
// riders/mounts law: nothing mounts nx-dress-magpi-001, first of its
// id). Chassis: fauna55-place-pheas.ts (proven fresh-entity variant).
// Contract: nx-dress-magpi-001 at world (29.45, -0.02109, 2.05) yaw
// -π/2 (Math.PI-derived — the wire-yaw radians law) scale 1 — the
// fauna57-seat-sweep best of 129 qualifying (offWall 2.37 from the inn
// west face, cross 1.21 on the plaza spoke, worst solid 5.067 vs the
// well, far). PY = live heightAt (9pt spread 4.6mm). Lib
// c0cf8da71a6401baae2891d07d92c6b7b556b8c762228097d4f95843559a62d6
// (v6 judge-closed bytes: profile SHIP 7/7 + scope SHIP + face SHIP;
// decode GREEN + RED control; deterministic ×2). Host building
// nx-town-inn (36,0,0) yaw -1.571 lib 861225bb hard-gated below
// (artwalk-39 law — sibling-owned bytes, foreign domain, never
// touched). 4 motion comps (mirrored EXACTLY from
// fauna57-render-magpi.ts where the same payloads drove the
// engine-true motion pair: 374px @ the composition framing): breathing
// bob + head-scan Y + tail flick Z + THE HOP-STEP (magpi_body X
// pendulum pitching the body around the planted feet).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-magpi-001";
const SHA = "c0cf8da71a6401baae2891d07d92c6b7b556b8c762228097d4f95843559a62d6";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [29.45, -0.02109, 2.05], YAW = -Math.PI / 2, SCALE = 1;
// host building gate (artwalk-39 law — drift = die)
const INN_ID = "nx-town-inn", INN_LIB_PREFIX = "861225bb";

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_magpi1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("magpi bytes drift");

// motion comps — mirrors fauna57-render-magpi.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:magpi": { type: "bob", amp: 0.004, period: 4.6, phase: 0.0, t0: T0 },
  "motion:magpi_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 7.5, phase: 0.9, t0: T0 },
  "motion:magpi_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [-0.0868, 0.098, 0], amp: 0.14, period: 2.6, phase: 1.7, t0: T0 },
  "motion:magpi_body": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.05, period: 2.2, phase: 0.4, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// host building hard gate
const inn = before[INN_ID];
if (!inn) die("inn host absent");
if (!String(inn.lib ?? "").includes(INN_LIB_PREFIX)) die(`inn host lib drift: ${inn.lib}`);
if (Math.abs(inn.pos[0] - 36) > 0.05 || Math.abs(inn.pos[2] - 0) > 0.05) {
  die(`inn host tuple drift: ${inn.pos}`);
}
console.log("host gate: inn", inn.pos, inn.yaw, inn.lib, "— EXACT");
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
  u.searchParams.set("name", "commons-next magpie fauna-57");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna57-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
// host undisturbed post-placement (entity-domain law)
const inn2 = after[INN_ID];
if (!String(inn2.lib ?? "").includes(INN_LIB_PREFIX) || Math.abs(inn2.pos[0] - 36) > 0.05) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
