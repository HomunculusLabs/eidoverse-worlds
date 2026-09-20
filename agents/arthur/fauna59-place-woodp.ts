// fauna59-place-woodp.ts — placement tick for the fauna-59 great spotted
// woodpecker (NEW entity nx-dress-woodp-001, no replace — census shows
// zero woodpecker fauna; riders/mounts law: nothing mounts this new id).
// Chassis: fauna57-place-magpi.ts (proven fresh-entity variant).
// FRAME-COPY SEAT LAW (fauna-53 class): the bird is authored SEATED in
// the GLB at snag-local (0.4239, 1.726, -0.2382) ry 0.7752 on bark
// shell B — the entity copies the LIVE host tuple VERBATIM so
// entity-local == snag-local: (60.6, -0.0461, -30) yaw -2.3562 (the
// live census value -2.356194490192345). Host nx-dress-se-snagdead-001
// lib 7ac83203 hard-gated below (artwalk-39 law — dress-lane-owned,
// foreign domain, never touched; drift = die).
// SAT: AIR-CLASS RIDER exemption (fauna-44/53 concentric-above
// precedent): the entity bbox overlaps ONLY its hard-gated host by
// construction; nearest other solid (pheas-001 at (55.75,-30.5)) is
// 4.85m clear — asserted from the fresh census below.
// 4 motion comps (mirrored EXACTLY from fauna59-render-woodp.ts where
// the same payloads drove the engine-true motion pair, 23px @ the
// composition framing): THE SIDLE (woodp Y-pendulum about the grip),
// cling breath (body bob), THE DRUM (head Z-pendulum at the bill
// strike arc), prop flex (tail X-pendulum at the root).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-woodp-001";
const SHA = "5b7e177e282446f989e96c94776173525b6f325b3ee2628fc754309c08fc4113";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [60.6, -0.0461, -30], YAW = -2.356194490192345, SCALE = 1;
// host gate (artwalk-39 law — drift = die)
const HOST_ID = "nx-dress-se-snagdead-001", HOST_LIB_PREFIX = "7ac83203";

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_woodp1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("woodp bytes drift");

// motion comps — mirrors fauna59-render-woodp.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:woodp": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.10, period: 9.0, phase: 0.0, t0: T0 },
  "motion:woodp_body": { type: "bob", amp: 0.003, period: 4.2, phase: 0.6, t0: T0 },
  "motion:woodp_head": { type: "pendulum", axis: [0, 0, 1], pivot: [0.0717, 0.0759, 0], amp: 0.16, period: 4.8, phase: 1.2, t0: T0 },
  "motion:woodp_tail": { type: "pendulum", axis: [1, 0, 0], pivot: [-0.0043, -0.0608, 0], amp: 0.05, period: 3.1, phase: 2.1, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// host hard gate (frame-copy law)
const host = before[HOST_ID];
if (!host) die("snag host absent");
if (!String(host.lib ?? "").includes(HOST_LIB_PREFIX)) die(`snag host lib drift: ${host.lib}`);
for (const [k, v] of [[0, 60.6], [1, -0.0461], [2, -30]] as const) {
  if (Math.abs(host.pos[k] - v) > 0.02) die(`snag host tuple drift: ${host.pos}`);
}
if (Math.abs(host.yaw - YAW) > 0.01) die(`snag host yaw drift: ${host.yaw}`);
console.log("host gate: snag", host.pos, host.yaw, host.lib, "— EXACT (frame-copy)");
// SAT assertion: nearest non-host neighbor clear (rider exemption on the
// host itself — concentric-above class, hard-gated above)
{
  const cx = 60.6, cz = -30;
  let nearest = { id: "", d: Infinity };
  for (const [id, e] of Object.entries(before)) {
    if (id === HOST_ID || id === ID) continue;
    const d = Math.hypot(e.pos[0] - cx, e.pos[2] - cz);
    if (d < nearest.d) nearest = { id, d };
  }
  console.log(`SAT (rider-exempt vs host): nearest non-host ${nearest.id} @ ${nearest.d.toFixed(2)}m`);
  if (nearest.d < 2.0) die(`non-host neighbor inside 2m: ${nearest.id} @ ${nearest.d}`);
}
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
  u.searchParams.set("name", "commons-next woodpecker fauna-59");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna59-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!String(host2.lib ?? "").includes(HOST_LIB_PREFIX) || Math.abs(host2.pos[0] - 60.6) > 0.02) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
