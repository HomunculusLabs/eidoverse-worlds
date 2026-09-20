// fauna61-place-stork.ts — placement tick for the fauna-61 white stork
// (NEW entity; census shows no stork/ciconiiform in the domain; nothing
// mounts nx-dress-stork-001, first of its id). Chassis:
// fauna57-place-magpi.ts (proven fresh-entity variant).
// Contract: nx-dress-stork-001 at world (-74.777, -0.01219, 4.478) yaw
// Math.PI/2 scale 1 — the fauna61-seat-sweep best of 966 qualifying
// (race-local (1.85, 2.3), race margin gap 0.634m = designed channel
// adjacency; worst other solid 4.178m vs kfish). PY = live heightAt
// (9pt spread 4.4mm at the final yaw). Yaw π/2: the pair faces due N
// (bills along the channel margin), presenting the TRUE PROFILE flank
// to the plaza-spoke reader due E (peahen law; the v1 seat yaw 3.3224
// showed the reader the birds' backs — re-seated this tick).
// Lib ff10aad02365d6ab74bed6ca38b8717ac3922ab162568a793a7a806f601c4eb5
// (v6 judge-closed bytes: 18m TRUE-vantage SHIP + profile SHIP +
// encounter SHIP; decode GREEN + RED control; deterministic ×2).
// Host nx-struct-millrace (-76.707,-0.0256,6.711) yaw 1.7516 lib
// 6e82dd2e hard-gated below (artwalk-39 law — sibling-owned bytes,
// foreign domain, never touched). 5 motion comps mirrored EXACTLY from
// fauna61-render-stork.ts where the same payloads drove the engine-true
// motion pair (335px @ 18m).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-stork-001";
const SHA = "ff10aad02365d6ab74bed6ca38b8717ac3922ab162568a793a7a806f601c4eb5";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-74.777, -0.01219, 4.478], YAW = Math.PI / 2, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const MR_ID = "nx-struct-millrace", MR_LIB_PREFIX = "6e82dd2e";
const MR_POS = [-76.707, 6.711], MR_YAW = 1.7516;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna61_stork.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("stork bytes drift");

// motion comps — mirrors fauna61-render-stork.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:stork_a": { type: "bob", amp: 0.005, period: 5.2, phase: 0.0, t0: T0 },
  "motion:stork_a_neck": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.06, period: 7.5, phase: 1.3, t0: T0 },
  "motion:stork_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 9.0, phase: 2.6, t0: T0 },
  "motion:stork_b": { type: "bob", amp: 0.004, period: 4.6, phase: 0.7, t0: T0 },
  "motion:stork_b_neck": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.13, period: 3.2, phase: 1.9, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// host gate
const mr = before[MR_ID];
if (!mr) die("millrace host absent");
if (!String(mr.lib ?? "").includes(MR_LIB_PREFIX)) die(`millrace lib drift: ${mr.lib}`);
if (Math.abs(mr.pos[0] - MR_POS[0]) > 0.05 || Math.abs(mr.pos[2] - MR_POS[1]) > 0.05) {
  die(`millrace tuple drift: ${mr.pos}`);
}
if (Math.abs(mr.yaw - MR_YAW) > 0.01) die(`millrace yaw drift: ${mr.yaw}`);
console.log("host gate: millrace", mr.pos, mr.yaw, mr.lib, "— EXACT");
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 5;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next white stork fauna-61");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna61-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
const mr2 = after[MR_ID];
if (!String(mr2.lib ?? "").includes(MR_LIB_PREFIX) || Math.abs(mr2.pos[0] - MR_POS[0]) > 0.05) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
