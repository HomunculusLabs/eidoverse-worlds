// fauna79-place-bats.ts — placement tick for the fauna-79 pipistrelle
// bats (NEW entity; census zero bat fauna; nothing mounts
// nx-dress-bats-001, first of its id). Chassis: fauna75-place-carp.ts.
// Contract: nx-dress-bats-001 at world (9.723, 0.06093, -90.982) yaw 0
// scale 1 — the FRAME-COPY AIR SEAT (swallows fauna-34 / bees fauna-32
// pure-motion class, frame-copy law from ducks/swan/carp): entity origin
// == reedpool host XZ; entity yaw == host yaw (0) so entity-local ==
// host-local VERBATIM; PY = host PY + 0.12 (the authored flight band y
// 2.45..2.90 host-local carries to world 2.39..2.84 above the water —
// the dusk-feeding band; +0.12 keeps all five rest-pose anchor origins
// clear of the host's own water disc bbox top by geometry, not luck).
// Lib 0555aa9786c4de57e9165adc47d30fc7b51273985467ffaaf61ebf7f00a577c0
// (v5 judge-SHIP bytes: duskEye 18m SHIP r5 — five distinct kinked
// silhouettes, cohesive band, zero contact — + nearSolo encounter SHIP
// r6; decode GREEN 24/24 + RED control; deterministic ×2). Host
// nx-struct-reedpool (9.723,-0.05907,-90.982) yaw 0 lib 7d770620bb1b7bdc
// hard-gated below (artwalk-39 law — struct-lane-owned, foreign domain,
// never touched). 20 motion comps mirrored EXACTLY from
// fauna79-render-bats.ts where the same payloads drove the engine-true
// motion pairs (801px @ dusk18 t8-vs-t11; 8092px @ nearSolo t8-vs-8.3;
// rig drives REAL motion.js evalPart orbit face:true AND face:false +
// motioneval pendulumTheta rotatePartAtPivot). Swarm plan v5: five
// CONCENTRIC rings center (0,·,0.3) at five altitudes, phases SOLVED
// for evenly-spread reader-instant slots (±1.6/±0.8/0 along the SW
// reader's screen axis); jink orbits face:false nested in the ring
// anchors; wing pendulums nested in the jinks.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-bats-001";
const SHA = "d89f04bbceef2f9833cfd9b1898a19c20ea52afbeb327f4aecd9b7f91ff3e7c7";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [9.723, 0.06093, -90.982], YAW = 0, SCALE = 1;
// the v5 first placement's lib (rest-pose defect: all five bats stacked
// in a +z column in the unanimated GLB — spawn-instant pop + untruthful
// census bbox; v6 corrects the rest poses to their ring points)
const OLD_LIB = "store/0555aa9786c4de57.glb";
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-struct-reedpool", HOST_LIB_PREFIX = "7d770620";
const HOST_POS = [9.723, -90.982], HOST_YAW = 0;
// co-resident context pins (printed, not gated — the swarm was seated
// against this tick's live table; a drifted resident is a FINDING)
const RESIDENTS: Array<[string, string]> = [
  ["nx-dress-ducks-001", "c156b6a1"],
  ["nx-dress-swan-001", "9206edbe"],
  ["nx-dress-heron-001", "f6a10294"],
  ["nx-dress-frog-001", "c3721599"],
  ["nx-dress-carp-001", "2f91932d"],
];

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna79_bats.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n, i) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("bats bytes drift");

// motion comps — mirrors fauna79-render-bats.ts, where the same payloads
// drove the engine-true motion pairs (orbit = evalPart case VERBATIM from
// client/lib/motion.js, BOTH face modes; pendulum = motioneval.js)
const T0 = Date.now();
const MOTION: Record<string, any> = {};
// five ring orbits (face default — head leads along velocity)
const RINGS: [string, number[], number, number, number][] = [
  ["bats_1", [0, 2.45, 0.3], 0.50, 84, 5.895],
  ["bats_2", [0, 2.70, 0.3], 0.90, 66, 2.973],
  ["bats_3", [0, 2.55, 0.3], 1.20, 52, 3.821],
  ["bats_4", [0, 2.90, 0.3], 1.55, 76, 1.806],
  ["bats_5", [0, 2.60, 0.3], 1.80, 60, 2.560],
];
for (const [part, center, radius, degPerSec, phase] of RINGS)
  MOTION[`motion:${part}`] = { type: "orbit", center, radius, degPerSec, phase, t0: T0 };
// five jink orbits (face:false — authored bank survives; center [0,0,0]
// in the ANCHOR's frame)
const JINKS: [string, number, number, number][] = [
  ["bats_1_jink", 0.18, 170, 0.7],
  ["bats_2_jink", 0.16, -150, 2.3],
  ["bats_3_jink", 0.20, 135, 4.1],
  ["bats_4_jink", 0.15, -190, 1.1],
  ["bats_5_jink", 0.17, 160, 3.3],
];
for (const [part, radius, degPerSec, phase] of JINKS)
  MOTION[`motion:${part}`] = { type: "orbit", center: [0, 0, 0], radius, degPerSec, phase, face: false, t0: T0 };
// ten wing pendulums (L mirrored negative; fast flutter)
const WINGP: [string, number, number, number][] = [
  ["bats_1", -0.62, 0.22, 0.0],
  ["bats_2", -0.58, 0.24, 0.8],
  ["bats_3", -0.66, 0.20, 1.6],
  ["bats_4", -0.55, 0.26, 2.4],
  ["bats_5", -0.60, 0.23, 3.2],
];
for (const [base2, amp, period, phase] of WINGP) {
  MOTION[`motion:${base2}_wingL`] = { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp, period, phase, t0: T0 };
  MOTION[`motion:${base2}_wingR`] = { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: -amp, period, phase, t0: T0 };
}
if (Object.keys(MOTION).length !== 20) die(`comp count ${Object.keys(MOTION).length} != 20`);
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
if (!host) die("reedpool host absent");
if (!String(host.lib ?? "").includes(HOST_LIB_PREFIX)) die(`reedpool lib drift: ${host.lib}`);
if (Math.abs(host.pos[0] - HOST_POS[0]) > 0.05 || Math.abs(host.pos[2] - HOST_POS[1]) > 0.05) {
  die(`reedpool tuple drift: ${host.pos}`);
}
if (Math.abs(host.yaw - HOST_YAW) > 0.01) die(`reedpool yaw drift: ${host.yaw}`);
// resident context print (not gated)
for (const [rid, rlib] of RESIDENTS) {
  const re = before[rid];
  console.log(`resident ${rid}: ${re ? `${re.pos.map((v: number) => +v.toFixed(3))} yaw ${(+re.yaw).toFixed(3)} lib ${re.lib}` : "ABSENT"}`);
}
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 20;
if (e0 && !already) {
  const plannedUpgrade = atWant(e0) && e0.lib === OLD_LIB; // v6 rest-pose cure
  if (!(atWant(e0) && e0.lib === LIB) && !plannedUpgrade) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next pipistrelle bats fauna-79");
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2500);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna79-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
