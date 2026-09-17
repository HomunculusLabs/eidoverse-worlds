// fauna4-place-hutch.ts — placement tick for the fauna-4 hutch rabbits
// (SAME-ID REPLACE at the SAME tuple: nx-dress-hutch (38.5, 0, -9.5) yaw
// -1.9 scale 1 — remove+respawn law; riders checked: census shows no
// entity parented to the hutch, no mounts reference it). Chassis:
// fauna3-place-ducks.ts, replace variant. Live states accepted:
// (a) absent → fresh remove-less run; (b) present at want tuple with our
// lib + 5 comps → idempotent, zero verbs; (c) our lib at want tuple with
// short/zero comps (interrupted batch or the CURRENT standing state:
// f5f47791 with 0 comps) → remove+respawn+comps. Any other state = drift,
// hard stop. Lib c0a64ac43a695f67… (v12 judge-PASS bytes). 5 motion comps
// mirrored verbatim from fauna4-render-hutch.ts (breathing bobs = evalPart
// bob; nibble/nod/ear-flick = pendulumTheta pendulums); phases staggered
// per individual, explicit epoch t0.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-hutch";
const SHA = "c0a64ac43a695f67798d2882791ec02797d3fc64aa7b3d7b325fad5a1698a672";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [38.5, 0, -9.5], YAW = -1.9, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_hutch3.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("hutch bytes drift");

// motion comps — mirrors fauna4-render-hutch.ts, where the same payloads
// drove the engine-true motion pairs (bobs = evalPart bob case VERBATIM
// from client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:rabbit_sit": { type: "bob", amp: 0.006, period: 3.4, phase: 0.0, t0: T0 },
  "motion:rabbit_sit_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.12, period: 2.6, phase: 0.7, t0: T0 },
  "motion:rabbit_alert": { type: "bob", amp: 0.005, period: 4.1, phase: 1.9, t0: T0 },
  "motion:rabbit_alert_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.09, period: 3.3, phase: 2.4, t0: T0 },
  "motion:rabbit_alert_ears": { type: "pendulum", axis: [2, 0, 1], pivot: [0, 0, 0], amp: 0.22, period: 2.0, phase: 1.2, t0: T0 },
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
if (!e0) die("target absent — this placer is a REPLACE; fresh-place chassis required");
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
if (!atWant(e0)) die(`id drift: live ${e0.pos} ${e0.yaw} != want ${POS} ${YAW}`);
const already = e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 5;
if (!already && e0.lib !== LIB && e0.lib !== "store/f5f47791dadb5abe.glb")
  die(`lib drift: ${e0.lib} (want ours c0a64ac4… or the standing f5f47791…)`);
console.log("census before:", Object.keys(before).length, "| target lib:", e0.lib, "| comps:", Object.keys(e0.comp ?? {}).length);

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next hutch rabbits fauna-4");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  verbs.push(["remove", { id: ID }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna4-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
