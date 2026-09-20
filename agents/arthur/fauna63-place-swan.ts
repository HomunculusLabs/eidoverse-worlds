// fauna63-place-swan.ts — placement tick for the fauna-63 mute swan
// (NEW entity; census shows no swan/cygnid in the domain; nothing mounts
// nx-dress-swan-001, first of its id). Chassis: fauna61-place-stork.ts.
// Contract: nx-dress-swan-001 at world (8.123, 0.05493, -92.482) yaw 0
// scale 1 — the FRAME-COPY WATER-RIDER seat (ducks fauna-3 / frog
// fauna-29 class): entity origin == reedpool host origin (9.723,
// -90.982) + host-local swan_a baked seat (-1.6, -1.5); entity yaw ==
// host yaw (0) so entity-local == host-local VERBATIM. PY = water top
// world 0.08093 − baked WL 0.026 = 0.05493 (duck/fauna-31 waterline
// law). Lib 9206edbedd472f6195afd093bc742c0ddd5fbd4a7d6cf966defadb340c7779e9
// (v12 judge-SHIP bytes: 18m identity SHIP 6/6 ×2; decode GREEN + RED
// control; deterministic ×2). Host nx-struct-reedpool (9.723,-0.05907,
// -90.982) yaw 0 lib 7d770620bb1b7bdc hard-gated below (artwalk-39 law
// — sibling-owned bytes, foreign domain, never touched). 5 motion comps
// mirrored EXACTLY from fauna63-render-swan.ts where the same payloads
// drove the engine-true motion pair (432px @ 18m, band x 468-509).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-swan-001";
const SHA = "9206edbedd472f6195afd093bc742c0ddd5fbd4a7d6cf966defadb340c7779e9";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [8.123, 0.05493, -92.482], YAW = 0, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-struct-reedpool", HOST_LIB_PREFIX = "7d770620";
const HOST_POS = [9.723, -90.982], HOST_YAW = 0;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna63_swan.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("swan bytes drift");

// motion comps — mirrors fauna63-render-swan.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:swan_a": { type: "bob", axis: [0, 1, 0], amp: 0.006, period: 6.2, phase: 0.0, t0: T0 },
  "motion:swan_a_neck": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.07, period: 8.0, phase: 1.2, t0: T0 },
  "motion:swan_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 9.5, phase: 2.4, t0: T0 },
  "motion:swan_b": { type: "bob", axis: [0, 1, 0], amp: 0.005, period: 5.6, phase: 0.6, t0: T0 },
  "motion:swan_b_neck": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.10, period: 3.8, phase: 1.8, t0: T0 },
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
  u.searchParams.set("name", "commons-next mute swan fauna-63");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna63-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
