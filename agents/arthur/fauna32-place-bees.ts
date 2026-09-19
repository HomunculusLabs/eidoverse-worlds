// fauna32-place-bees.ts — place the fauna-32 skep-bee cloud.
// Chassis: fauna3-place-ducks.ts (proven two-pass placer). Seat law:
// FRAME COPY of the standing hive row (frog-on-pool class) — the entity
// seats at nx-dress-nw-skeps-001's exact origin+yaw+py so entity-local ==
// row-local VERBATIM: the four orbit rings center on the real hives at
// row-local (-1.9,0),(-0.6,0.15),(0.7,-0.1),(2.0,0.05). Pure-air entity
// (no ground geometry) riding a frame-shared origin — first of its class.
// SAT law for this class: the entity is AIRBORNE-only (local y
// 0.586..0.741, all members above every neighbor's solid top within the
// seat footprint: skeps 0.95 tall, lavender plants 0.538, windbreak 0.57,
// plinths 0.14) — exempt from ground-plane OBB SAT by construction, like
// suspended decor (nvp-134), with the vertical separation PROVEN by the
// decoded envelopes (values in the decode GREEN output).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-bees-001";
const SHA = "e6ac8fac5e1d4228d3df4a51ba0fb11faf63b402b35eb104db8972efc061f84d";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const HOST = "nx-dress-nw-skeps-001";
const POS = [-53.566, 0.038, 54.5], YAW = 2.3562, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna32_bees.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("bee bytes drift");

// motion comps — mirrored in fauna32-render-bees.ts (the same payloads
// drove the engine-true motion pairs: orbit = motion.js evalPart orbit
// case VERBATIM, duck fauna-3 precedent; bob likewise)
const T0 = Date.now();
const MOTION = {
  "motion:bee_1": { type: "orbit", center: [-1.9, 0.62, 0], radius: 0.8, degPerSec: 24, phase: 0, t0: T0 },
  "motion:bee_2": { type: "orbit", center: [-0.6, 0.68, 0.15], radius: 0.8, degPerSec: 28, phase: 2.1, t0: T0 },
  "motion:bee_3": { type: "orbit", center: [0.7, 0.64, -0.0], radius: 0.8, degPerSec: 22, phase: 4.0, t0: T0 },
  "motion:bee_4": { type: "orbit", center: [2.0, 0.72, 0.05], radius: 0.8, degPerSec: 26, phase: 5.2, t0: T0 },
  "motion:bee_5": { type: "bob", amp: 0.05, period: 1.4, phase: 0.3, t0: T0 },
  "motion:bee_6": { type: "bob", amp: 0.06, period: 1.2, phase: 2.2, t0: T0 },
  "motion:bee_7": { type: "bob", amp: 0.04, period: 1.6, phase: 4.4, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const host = before[HOST];
if (!host) die(`host ${HOST} absent — frame copy impossible`);
// frame-copy gate: the live host tuple IS our seat
if (!vec(host.pos, POS) || !near(host.yaw, YAW)) {
  die(`host drifted: ${host.pos} yaw ${host.yaw} — re-derive the frame copy (artwalk-39 law)`);
}
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 7;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent", "| host frame:", host.pos, host.yaw);

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next skep bees fauna-32");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna32-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
