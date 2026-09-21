// fauna85-place-bfly.ts — placement tick for the fauna-85 butterflies
// (NEW entity; census zero bfly fauna; nothing mounts nx-dress-bfly-001,
// first of its id). Chassis: fauna79-place-bats.ts.
// Contract: nx-dress-bfly-001 at world (-39.5826, 0.0402, 62.8918) yaw
// 2.3562 scale 1 — the FRAME-COPY AIR SEAT (bees fauna-32 / bats fauna-79
// law): entity origin == lavender host origin; entity yaw == host yaw so
// entity-local == field-local VERBATIM; PY = host live PY 0.0402 (host
// decode is the height source for air-rider seats — the flight band
// rides field-local y 0.62-0.85 = blossom working band, above the 0.55
// crowns, below the yham/towl crown riders at 1.48/1.53).
// Lib 77232f5398b06ab55206d4a7fd59e358edfce8e3119b358b83eb45378de21360
// (v3 judge-arc-closed bytes: 18m-edge pair read r3 both butterflies +
// tortoise anatomy PASS + admiral anatomy PASS, red bands the readable
// cue; decode GREEN + RED control; deterministic ×2). Host
// nx-cultivation-lavender-0040 (-39.5826, 0.0402, 62.8918) yaw 2.3562
// lib 5e04ce4b2ad6e90c hard-gated below (artwalk-39 law —
// cultivation-lane-owned, foreign domain, never touched). 10 motion
// comps mirrored EXACTLY from fauna85-render-bfly.ts where the same
// payloads drove the engine-true motion pairs (415px @ field-edge t8-vs-
// t11; 3707px @ encounter t8-vs-t8.13; rig drives REAL motion.js
// evalPart orbit face:true/false + bob + motioneval pendulumTheta
// rotatePartAtPivot).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-bfly-001";
const SHA = "77232f5398b06ab55206d4a7fd59e358edfce8e3119b358b83eb45378de21360";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [-39.5826, 0.0402, 62.8918], YAW = 2.3562, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-cultivation-lavender-0040", HOST_LIB_PREFIX = "5e04ce4b";
const HOST_POS = [-39.5826, 62.8918], HOST_YAW = 2.3562;
// co-resident context pins (printed, not gated — the flight band was
// seated against this tick's live table; a drifted resident is a FINDING)
const RESIDENTS: Array<[string, string]> = [
  ["nx-dress-nw-hedge-001", "3d5c7d44"],
  ["nx-dress-yham-001", "0f7fdfea"],
  ["nx-dress-towl-001", "4e8d0997"],
  ["nx-dress-dovecote-001", "8f33f97f"],
  ["nx-dress-peacock-001", "c9425f51"],
  ["nx-dress-peahen-001", "a1f5190f"],
];

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna85_bfly.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n, i) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("bfly bytes drift");

// motion comps — mirrors fauna85-render-bfly.ts, where the same payloads
// drove the engine-true motion pairs (orbit/bob = evalPart cases VERBATIM
// from client/lib/motion.js; pendulum = motioneval.js)
const T0 = Date.now();
const MOTION: Record<string, any> = {};
// 2 wander rings (face default — head +z leads velocity)
const RINGS: [string, number[], number, number, number][] = [
  ["bfly_a", [0, 0.72, 0], 1.30, 34, 5.895],
  ["bfly_b", [2.0, 0.78, 1.2], 1.70, 28, 2.400],
];
for (const [part, center, radius, degPerSec, phase] of RINGS)
  MOTION[`motion:${part}`] = { type: "orbit", center, radius, degPerSec, phase, t0: T0 };
// 2 jink orbits NESTED in the ring anchors (face:false — bank survives)
const JINKS: [string, number, number, number][] = [
  ["bfly_a_jink", 0.22, 42, 0.9],
  ["bfly_b_jink", 0.22, -40, 2.1],
];
for (const [part, radius, degPerSec, phase] of JINKS)
  MOTION[`motion:${part}`] = { type: "orbit", center: [0, 0, 0], radius, degPerSec, phase, face: false, t0: T0 };
// 2 hover bobs NESTED in the jinks (the nectar settle)
const HOVERS: [string, number, number, number][] = [
  ["bfly_a_hover", 0.006, 2.8, 0.3],
  ["bfly_b_hover", 0.006, 3.1, 1.7],
];
for (const [part, amp, period, phase] of HOVERS)
  MOTION[`motion:${part}`] = { type: "bob", amp, period, phase, t0: T0 };
// 4 wing pendulums (L mirrored negative; the flutter)
const WINGP: [string, number, number, number][] = [
  ["bfly_a", -0.85, 0.26, 0.0],
  ["bfly_b", -0.90, 0.24, 0.7],
];
for (const [base2, amp, period, phase] of WINGP) {
  MOTION[`motion:${base2}_wingL`] = { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp, period, phase, t0: T0 };
  MOTION[`motion:${base2}_wingR`] = { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -amp, period, phase, t0: T0 };
}
if (Object.keys(MOTION).length !== 10) die(`comp count ${Object.keys(MOTION).length} != 10`);
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// host gate
const host = before[HOST_ID];
if (!host) die("lavender host absent");
if (!String(host.lib ?? "").includes(HOST_LIB_PREFIX)) die(`lavender lib drift: ${host.lib}`);
if (Math.abs(host.pos[0] - HOST_POS[0]) > 0.05 || Math.abs(host.pos[2] - HOST_POS[1]) > 0.05) {
  die(`lavender tuple drift: ${host.pos}`);
}
if (Math.abs(host.yaw - HOST_YAW) > 0.01) die(`lavender yaw drift: ${host.yaw}`);
// PY = host live PY (air-rider frame copy — the host IS the height source)
POS[1] = host.pos[1];
// resident context print (not gated)
for (const [rid, rlib] of RESIDENTS) {
  const re = before[rid];
  console.log(`resident ${rid}: ${re ? `${re.pos.map((v: number) => +v.toFixed(3))} yaw ${(+re.yaw).toFixed(3)} lib ${re.lib}` : "ABSENT"}`);
}
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 10;
if (e0 && !already) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next butterflies fauna-85");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2500);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna85-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
  compKeys: keys.length, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
