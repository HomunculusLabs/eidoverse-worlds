// fauna75-place-carp.ts — placement tick for the fauna-75 common carp
// (NEW entity; census shows zero fish fauna in the domain; nothing mounts
// nx-dress-carp-001, first of its id). Chassis: fauna63-place-swan.ts.
// Contract: nx-dress-carp-001 at world (9.723, 0.06093, -90.982) yaw 0
// scale 1 — the FRAME-COPY WATER-RIDER seat (ducks fauna-3 / swan
// fauna-63 class): entity origin == reedpool host origin; entity yaw ==
// host yaw (0) so entity-local == host-local VERBATIM. PY = water top
// world 0.08093 − WL 0.02 = 0.06093 (duck/fauna-31 waterline law).
// Lib 2f91932ddbd14ff4028f6f03b2ef61982a84b44f18b4bd86e82f0c614f003b8a
// (v10 judge-SHIP bytes: topdown SHIP 4/4/4 + exact-ring YES/YES
// confirm; decode GREEN + RED control; deterministic ×2). Host
// nx-struct-reedpool (9.723,-0.05907,-90.982) yaw 0 lib 7d770620bb1b7bdc
// hard-gated below (artwalk-39 law — struct-lane-owned, foreign domain,
// never touched). 3 motion comps mirrored EXACTLY from
// fauna75-render-carp.ts where the same payloads drove the engine-true
// motion pair (16388px @ topdown t8-vs-t11; rig drives REAL motion.js
// evalPart orbit/bob + motioneval pendulumTheta). Cruise ring: center
// (1.95, 1.05) r 0.5 @ 8°/s — the NE open water, the pool's only
// unoccupied quadrant (orbit-swept worst radius 2.95 < rim 3.05).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-carp-001";
const SHA = "2f91932ddbd14ff4028f6f03b2ef61982a84b44f18b4bd86e82f0c614f003b8a";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [9.723, 0.06093, -90.982], YAW = 0, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-struct-reedpool", HOST_LIB_PREFIX = "7d770620";
const HOST_POS = [9.723, -90.982], HOST_YAW = 0;
// co-resident context pins (printed, not gated — the ring was seated
// against this tick's live table; a drifted resident is a FINDING)
const RESIDENTS: Array<[string, string]> = [
  ["nx-dress-ducks-001", "c156b6a1"],
  ["nx-dress-swan-001", "9206edbe"],
  ["nx-dress-heron-001", "f6a10294"],
  ["nx-dress-frog-001", "c3721599"],
];

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna75_carp.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("carp bytes drift");

// motion comps — mirrors fauna75-render-carp.ts, where the same payloads
// drove the engine-true motion pair (orbit = evalPart case VERBATIM from
// client/lib/motion.js; bob = motion.js evalPart; pendulum = motioneval.js)
const T0 = Date.now();
const MOTION = {
  "motion:carp": { type: "orbit", center: [1.95, 0.02, 1.05], radius: 0.5, degPerSec: 8, phase: 0, t0: T0 },
  "motion:carp_dfin": { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 3.0, phase: 0.5, t0: T0 },
  "motion:carp_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 4.2, phase: 1.3, t0: T0 },
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
const host = before[HOST_ID];
if (!host) die("reedpool host absent");
if (!String(host.lib ?? "").includes(HOST_LIB_PREFIX)) die(`reedpool lib drift: ${host.lib}`);
if (Math.abs(host.pos[0] - HOST_POS[0]) > 0.05 || Math.abs(host.pos[2] - HOST_POS[1]) > 0.05) {
  die(`reedpool tuple drift: ${host.pos}`);
}
if (Math.abs(host.yaw - HOST_YAW) > 0.01) die(`reedpool yaw drift: ${host.yaw}`);
console.log("host gate: reedpool", host.pos, host.yaw, host.lib, "— EXACT");
// co-resident context
for (const [rid, rlib] of RESIDENTS) {
  const e = before[rid];
  console.log(`resident ${rid}:`, e ? `${e.pos.map((n: number) => +n.toFixed(2))} lib ${String(e.lib).slice(5, 13)}${String(e.lib).includes(rlib) ? "" : ` (LIB DRIFT — expected ${rlib})`}` : "ABSENT");
}
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
  u.searchParams.set("name", "commons-next common carp fauna-75");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna75-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
const host2 = after[HOST_ID];
if (!String(host2.lib ?? "").includes(HOST_LIB_PREFIX) || Math.abs(host2.pos[0] - HOST_POS[0]) > 0.05) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
