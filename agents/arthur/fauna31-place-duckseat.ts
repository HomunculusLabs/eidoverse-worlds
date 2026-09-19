// fauna31-place-duckseat.ts — duck waterline re-seat (fauna-31): cure the
// fauna-29-recorded defect (ducks ~0.20m below the true water top) via
// same-id remove+respawn at corrected PY. Same bytes c156b6a1 (NO upload —
// law (d): the lib is live on the standing entity, verified by census).
//
// DERIVATION (this tick, three independent confirmations of the water top
// +0.08093: fauna-29 TRS decode of the pool lib, the angler lane's city-11
// arithmetic, and the live frog seat nx-dress-frog-001 PY 0.08093):
//   pool host (9.723,-0.05907,-90.982) yaw 0, water disc top host-local
//   y 0.140 -> world -0.05907+0.140 = +0.08093.
//   Build law (mkv3-ducks26.ts): group origins at entity-local WL y 0.02,
//   keels 15mm below the waterline, PY = water top - 0.02.
//   => PY = 0.08093 - 0.02 = +0.06093.  (The fauna-29 note's "-0.061" was
//   a sign slip in its own mid-sentence derivation; the render falsification
//   this tick confirmed +0.06093: cand PASS floating / ctrl DEFECT-CONFIRMED
//   sunk, discriminating — ZAI fallback glm vision, native debt NATIVE-21.)
//
// Verbs: remove + spawn + 6 comps = 8 (comp-wipe law; riders checked this
// tick: none parented, no mounts, duck-on-host null).
// Chassis: fauna3-place-ducks.ts (proven), migration variant — the tuple
// gate accepts the OLD defect tuple as the migration source and the NEW
// tuple as the idempotent target; any other state hard-stops.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-ducks-001";
const SHA = "c156b6a12a935495a091ba146b394c6e2a152fecf40abdd3eebdc5e36ac85f92";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const NEW_POS = [8.0, 0.06093, -91.0], YAW = 0, SCALE = 1;
const OLD_POS = [8.0, -0.139, -91.0]; // the defect tuple (migration source)

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_duckpair.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("duck bytes drift");

// motion comps — EXACTLY the standing live bag (fauna3-place-ducks.ts);
// phases preserved so the pair's idle life continues uninterrupted
const T0 = Date.now();
const MOTION = {
  "motion:duck_a": { type: "bob", amp: 0.018, period: 3.8, phase: 0.0, t0: T0 },
  "motion:duck_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 3.1, phase: 1.3, t0: T0 },
  "motion:duck_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.28, period: 1.6, phase: 0.4, t0: T0 },
  "motion:duck_b": { type: "orbit", center: [-2.3, 0.02, -0.75], radius: 0.55, degPerSec: 7, phase: Math.PI / 2, t0: T0 },
  "motion:duck_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.22, period: 4.4, phase: 2.8, t0: T0 },
  "motion:duck_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.24, period: 1.9, phase: 1.1, t0: T0 },
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
const at = (e: any, p: number[]) => vec(e.pos, p) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && at(e0, NEW_POS) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 6;
if (e0 && !already) {
  // sanctioned migration source ONLY: our lib at the OLD defect tuple
  // (any comp-bag state — remove+respawn cures a short bag too)
  if (!(at(e0, OLD_POS) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? (already ? "already seated" : "migration pending") : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  if (e0) {
    // law (d): same bytes already live in the store — NO upload. Verify the
    // standing entity carries our lib (checked above), then migrate.
    verbs.push(["remove", { id: ID }]);
    verbs.push(["spawn", { id: ID, lib: LIB, pos: NEW_POS, yaw: YAW, scale: SCALE }]);
  } else {
    die("entity absent — this placer is a migration only; run fauna3-place first");
  }
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna31-reseat", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!(e?.lib === LIB && vec(e.pos, NEW_POS) && near(e.yaw, YAW) && e.scale === SCALE)) die("post tuple/lib");
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
