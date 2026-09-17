// fauna2-place-hens.ts — placement tick for the fauna-2 flock rebuild.
// Chassis: fauna1-place-goats.ts (proven). Same-id replace = remove +
// respawn (artwalk-33 law: spawn does NOT move an existing entity).
// Contract: nx-dress-hens moves from the lone-hen tuple (33.5, 0, -6) yaw
// -1.8 to the coop-yard flock tuple (34, -0.0335, -8) yaw -1.8 scale 1 —
// the open meadow W of the coop (terrain-preflighted flat, SAT-clear of
// coop/hutch/well/inn by >=1.6m); lib edc1a4c7ca62d56f -> 1ab461bd7b95aab2
// (the v4 three-hen flock); 6 motion comps (3 peck-bobs + 3 tail-flicks,
// quick hen periods, phases staggered per bird; explicit epoch t0).
// No riders/mounts reference this entity (census-checked 2026-09-17;
// nothing in the census mounts nx-dress-hens — it is a 0.38m micro-prop).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-hens";
const OLD = "store/edc1a4c7ca62d56f.glb";
const SHA = "1ab461bd7b95aab2c00345a5dc4f15859d6070bab54145727bb5ab12472553bf";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [34, -0.0335, -8], YAW = -1.8, SCALE = 1;
const PREV_POS = [33.5, 0, -6];

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_hens_flock.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("flock bytes drift");

// motion comps — phases staggered per bird (mirrors fauna2-render-hens.ts,
// where the same payloads drove the engine-true motion pairs)
const T0 = Date.now();
const MOTION = {
  "motion:hen_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.28, period: 2.2, phase: 0.0, t0: T0 },
  "motion:hen_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 0.9, phase: 0.2, t0: T0 },
  "motion:hen_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.09, period: 3.4, phase: 1.7, t0: T0 },
  "motion:hen_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.22, period: 1.1, phase: 0.8, t0: T0 },
  "motion:hen_c_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 2.7, phase: 4.2, t0: T0 },
  "motion:hen_c_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 1.0, phase: 2.6, t0: T0 },
};
const WANT = { ...MOTION }; // expected live bag (t0 compared modulo exact value)

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const e0 = before[ID];
if (!e0) die("hens entity missing from live census");
// tuple gate: this placer MOVES the entity — accept the known lone-hen
// tuple (fresh run) OR the flock tuple (idempotent rerun); anything else
// is real drift.
const atPrev = vec(e0.pos, PREV_POS) && near(e0.yaw, YAW) && e0.scale === SCALE;
const atWant = vec(e0.pos, POS) && near(e0.yaw, YAW) && e0.scale === SCALE;
if (!atPrev && !atWant) die(`tuple drift ${e0.pos} ${e0.yaw} ${e0.scale}`);
const already = atWant && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 6;

let verbs: Array<[string, any]> = [];
if (!already) {
  if (![OLD, LIB].includes(e0.lib)) die(`unexpected lib ${e0.lib}`);
  // upload (paced, 429 backoff — shared budget across lanes)
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next hens fauna-2");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  // same-id replace: remove, then respawn at the flock tuple
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna2-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
  // structural exact (type/axis/pivot/amp/period/phase); t0: fresh placement
  // must carry THIS run's epoch (<=60s old); an already-seated bag keeps its
  // original placement epoch (legitimate — any positive number)
  if (!eq(grest, wrest)) die(`comp drift ${k}: ${JSON.stringify(got)}`);
  if (typeof gt0 !== "number" || !(gt0 > 0)) die(`comp t0 invalid ${k}: ${gt0}`);
  if (!already && Math.abs(gt0 - T0) > 60_000) die(`fresh comp t0 not this epoch ${k}: ${gt0} vs ${T0}`);
}
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
