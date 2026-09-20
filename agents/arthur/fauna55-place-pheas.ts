// fauna55-place-pheas.ts — placement tick for the fauna-55 pheasants
// (NEW entity, no replace — census shows no pheas in the domain;
// riders/mounts law: nothing mounts nx-dress-pheas-001, first of its
// id). Chassis: fauna50-place-kfish.ts (proven fresh-entity variant).
// Contract: nx-dress-pheas-001 at world (55.75, -0.03754, -30.5) yaw
// -1.835 scale 1 — the fauna55-seat-sweep best of 530 qualifying
// (worst solid gap 5.978m vs nx-struct-northneedle, far; snag member
// disc 4.88m clear; on-spoke cross 2.59). PY = live heightAt (9pt
// spread 2.4mm). Lib 793f6fabad825b88aa639353a775a430b1fe768f538640
// a7ac1c9a00f1bcb744 (v9 judge-closed bytes: profile SHIP r1 + cockface
// SHIP r2 + scope SHIP r3 + near fill-lit SHIP r8; decode GREEN + RED
// control; deterministic ×2). Anchor host nx-dress-se-snagdead-001
// (60.6,-0.046,-30) lib 7ac83203 hard-gated below (artwalk-39 law).
// 6 motion comps (mirrored EXACTLY from fauna55-render-pheas.ts where
// the same payloads drove the engine-true motion pair: 344px @ the
// composition framing): 2 breathing bobs + cock strut head-scan Y +
// cock tail sway Z + hen head Y-scan + hen tail flick Z.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-pheas-001";
const SHA = "793f6fabad825b88aa639353a775a430b1fe768f538640a7ac1c9a00f1bcb744";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const POS = [55.75, -0.03754, -30.5], YAW = -1.835, SCALE = 1;
// anchor host gate (artwalk-39 law — drift = die)
const SNAG_ID = "nx-dress-se-snagdead-001", SNAG_LIB_PREFIX = "7ac8320374482a3c";

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_pheas1.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("pheas bytes drift");

// motion comps — mirrors fauna55-render-pheas.ts, where the same payloads
// drove the engine-true motion pair (bob = evalPart case VERBATIM from
// client/lib/motion.js; pendulums = motioneval.js pendulumTheta)
const T0 = Date.now();
const MOTION = {
  "motion:pheas_a": { type: "bob", amp: 0.005, period: 4.4, phase: 0.0, t0: T0 },
  "motion:pheas_a_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.26, period: 7.5, phase: 0.8, t0: T0 },
  "motion:pheas_a_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0.14, 0], amp: 0.06, period: 5.5, phase: 1.4, t0: T0 },
  "motion:pheas_b": { type: "bob", amp: 0.004, period: 5.0, phase: 2.1, t0: T0 },
  "motion:pheas_b_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.20, period: 8.5, phase: 1.9, t0: T0 },
  "motion:pheas_b_tail": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0.16, 0], amp: 0.05, period: 6.2, phase: 0.5, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
// anchor host hard gate
const snag = before[SNAG_ID];
if (!snag) die("snag host absent");
if (!String(snag.lib ?? "").includes(SNAG_LIB_PREFIX)) die(`snag host lib drift: ${snag.lib}`);
if (Math.abs(snag.pos[0] - 60.6) > 0.05 || Math.abs(snag.pos[2] - -30.0) > 0.05) {
  die(`snag host tuple drift: ${snag.pos}`);
}
console.log("host gate: snag", snag.pos, snag.yaw, snag.lib, "— EXACT");
const e0 = before[ID];
const atWant = (e: any) => vec(e.pos, POS) && near(e.yaw, YAW) && e.scale === SCALE;
const already = e0 && atWant(e0) && e0.lib === LIB && Object.keys(e0.comp ?? {}).length === 6;
if (e0 && !already) {
  if (!(atWant(e0) && e0.lib === LIB)) die(`id collision/drift: ${e0.pos} ${e0.yaw} ${e0.lib}`);
}
console.log("census before:", Object.keys(before).length, "| target:", e0 ? "present" : "absent");

let verbs: Array<[string, any]> = [];
if (!already) {
  const u = new URL(`${base}/upload`);
  u.searchParams.set("token", cfg.agentToken);
  u.searchParams.set("name", "commons-next pheasants fauna-55");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna55-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
const snag2 = after[SNAG_ID];
if (!String(snag2.lib ?? "").includes(SNAG_LIB_PREFIX) || Math.abs(snag2.pos[0] - 60.6) > 0.05) die("host disturbed");
console.log(JSON.stringify({
  status: "PLACED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length, alreadySeated: !verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
