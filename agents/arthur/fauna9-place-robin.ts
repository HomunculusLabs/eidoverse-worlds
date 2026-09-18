// fauna9-place-robin.ts — placement tick for the fauna-9 European robin
// (NEW entity, no replace — no robin in census). Chassis: fauna8-place-owl.ts
// (proven fresh-entity variant): absent (fresh), fully seated (idempotent
// zero verbs), or seated-at-want-with-our-lib-short-comps (interrupted —
// recover via remove+respawn+comps). Any other live state = hard stop.
// Contract: nx-dress-robin-001 at world (6.3, -0.029115, -86.35) yaw 3π/2
// (facing +z N toward the village approach — yaw law fauna-9: facing =
// (cos yaw, −sin yaw), 3π/2 = +z; π/2 showed the camera its back twice).
// Seat: grass OUTSIDE the reedpool N rim — pool decode (fauna9-pool-bank-
// sample.ts): local z-extent 4.0 → world −86.98 rim edge; robin bbox rear
// (local −0.220 at yaw 3π/2 → +z 0.220) = −86.130, 0.63m clear of the rim
// face; terrain preflight 9pt spread 0.8mm, PY −0.029115. DESIGN ADJACENCY
// (not collision): the robin forages 0.6m from the pond it lives beside —
// concentric-site class, struct-19; the rim is the pool's own face.
// Lib 5ba5598fbca0ff46… (v5 judge-PASS bytes: encounter 5/5 PASS — "the
// breast anchors the eye immediately"; profile 5/5 PASS — attached 54°
// cocked tail; 18m framing-limited disclosed, encounter-space species,
// fauna-4 law). 3 motion comps (mirrored EXACTLY from fauna9-render-
// robin.ts, where the same payloads drove engine-true motion pairs
// 1041px/596px): robin breathing bob, robin_head peck pendulum,
// robin_tail flick — phases staggered, epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-robin-001";
const SHA = "5ba5598fbca0ff46d63822b810f1aed58f07e98675b69bf015f27390cb5284b2";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [6.3, -0.029115, -86.35], YAW = 3 * Math.PI / 2, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_robin1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("robin bytes drift");

// motion comps — mirrors fauna9-render-robin.ts COMPS exactly
const T0 = Date.now();
const MOTION = {
  "motion:robin": { type: "bob", amp: 0.006, period: 3.6, phase: 0.0, t0: T0 },
  "motion:robin_head": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.30, period: 3.8, phase: 0.6, t0: T0 },
  "motion:robin_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.16, period: 2.4, phase: 1.4, t0: T0 },
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
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 3;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next robin fauna-9");
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
      if (verb === "remove") return; // spawn follows after the remove settles
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna9-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
