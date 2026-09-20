// fauna65-place-kestrel.ts — place the fauna-65 common kestrel.
// Chassis: fauna34-place-swallows.ts (proven two-pass placer). Seat law:
// the SE wild-edge AIR SEAT — entity at (57.5, PY, -24) yaw -2.4 (open
// vole meadow between the pheasant seat and the chainvault spoke; the
// plaza-spoke 18m reader vantage world (40.9,-17.1)). Pure-air rider:
// the bird wanders r 0.4 at PY+6.0 (5.95m world) — clear of every tall
// solid (snag 6.75m horiz, needle 12.9m; decode CLEARANCES GREEN); the
// post + tufts anchor the ground read. Airborne-only entity exempt from
// ground SAT by construction (nvp-134 suspended-decor kin; bees fauna-32
// / swallows fauna-34 precedent).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-kestr-001";
const SHA = "941d1db792e25010af572b79f60de411a30ddf4f0e96e35da8572b004bcdc308";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [57.5, -0.05137, -24], YAW = -2.4, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_fauna65_kestrel.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("kestrel bytes drift");

// motion comps — mirrored verbatim in fauna65-render-kestrel.ts (the same
// payloads drove the engine-true motion pairs + the judge-arc renders).
// kestr_head carries NO comp — THE HEAD-LOCK: the head holds dead still in
// anchor space while kestr_body bobs under it (the species' stabilization).
const T0 = Date.now();
const MOTION = {
  "motion:kestr": { type: "orbit", center: [0, 6.0, 0], radius: 0.4, degPerSec: 6, phase: 0, face: false, t0: T0 },
  "motion:kestr_body": { type: "bob", amp: 0.035, period: 0.52, phase: 0, t0: T0 },
  "motion:kestr_wingL": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: -0.40, period: 0.48, phase: 0, t0: T0 },
  "motion:kestr_wingR": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.40, period: 0.48, phase: 0, t0: T0 },
  "motion:kestr_tail": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.06, period: 0.9, phase: 1.2, t0: T0 },
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
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 5;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next common kestrel fauna-65");
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
      if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2000);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna65-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
