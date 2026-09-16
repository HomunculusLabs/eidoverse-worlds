// fauna1-place-goats.ts — placement tick for the fauna-1 goats rebuild.
// Chassis: interior-place-forge.ts (proven). Same-id replace = remove +
// respawn (artwalk-33 law: spawn does NOT move an existing entity).
// Contract: nx-dress-goats stays at its standing tuple (34, 0, 13) yaw -1.2
// scale 1; lib c47861e473e6f088 -> 7e9af5a59d4b77ad (the v4 rebuild);
// 6 motion comps (3 head-nods + 3 tail-swishes, phases staggered per
// individual; explicit epoch t0 — local-part-motion-review law).
// No riders/mounts reference this entity (census-checked 2026-09-16).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-goats";
const OLD = "store/c47861e473e6f088.glb";
const SHA = "7e9af5a59d4b77adb0eceffcb7b13c22072d8140c7803f6d178ef04b4451df52";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [34, 0, 13], YAW = -1.2, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_goats3.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("goats bytes drift");

// motion comps — phases staggered per individual (pen never moves in unison)
const T0 = Date.now();
const MOTION = {
  "motion:goat_a_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.16, period: 4.6, phase: 0.0, t0: T0 },
  "motion:goat_a_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.45, period: 1.9, phase: 1.3, t0: T0 },
  "motion:goat_b_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.075, period: 5.8, phase: 2.1, t0: T0 },
  "motion:goat_b_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.5, period: 1.7, phase: 0.4, t0: T0 },
  "motion:goat_c_head": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.11, period: 3.9, phase: 4.0, t0: T0 },
  "motion:goat_c_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.4, period: 2.1, phase: 2.7, t0: T0 },
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
if (!e0) die("goats entity missing from live census");
// tuple gate: standing pose must match the contract exactly
if (!vec(e0.pos, POS) || !near(e0.yaw, YAW) || e0.scale !== SCALE) die(`tuple drift ${e0.pos} ${e0.yaw} ${e0.scale}`);
const already = e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 6;

let verbs: Array<[string, any]> = [];
if (!already) {
  if (![OLD, LIB].includes(e0.lib)) die(`unexpected lib ${e0.lib}`);
  // upload (paced, 429 backoff — shared budget across lanes)
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next goats fauna-1");
  u.searchParams.set("by", cfg.id);
  let lib = "";
  for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await Bun.sleep(25_000); continue; }
    die(`upload ${r.status}`);
  }
  if (lib !== LIB) die(`upload path ${lib}`);
  // same-id replace: remove, then respawn at the exact tuple
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna1-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
  bbox: e.bbox?.size,
}));
