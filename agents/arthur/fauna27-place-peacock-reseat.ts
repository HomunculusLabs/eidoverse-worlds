// fauna27-place-peacock-reseat.ts — fauna-27 RE-SEAT placement tick: cures
// sweep-319 R-125 (peacock plinth/bird interpenetrated lavender-0040 plant
// bodies 0.004/0.001m — the fauna-25 seat landed INSIDE the bed's planted
// rectangle; its standing-precedent FILM exemption kept the bed out of the
// SAT set, so nothing caught it).
// NEW tuple: (−43.3, 0.03399, 69.7) yaw −2.318 (fauna27-seat-sweep best of
// 2 qualifying with the bed-rectangle gate: worst solid 1.401m vs the
// espalier rows — the orchard show-corner designed adjacency; bedClear
// 0.511m = 1.44m beyond the bed's planted edge; 5.23m off the stroll
// polyline). Terrain 9pt spread 1.27mm, PY 0.03399 = live heightAt.
// Yaw −2.318: display faces the dovecote/stroll side (dot 0.991 vs the
// seat→dovecote direction); FALSIFIED by render pre-mutation — candidate
// 18° front-oblique judge FRONT/READS/clean vs rear control BACK
// (discriminating; ZAI fallback judge, native debt owed). Same v8 judge-
// SHIP bytes (no upload, no rebuild) — the orientation reads (18m oblique
// /trainprobe/faceprobe) hold for the same presentation.
// Chassis: struct152-reseat-gyroid-yaw.ts + fauna25-place comps. Verbs:
// remove → spawn → 6 comps (comp-wipe law), paced 1200/650ms.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds", W = "commons-next", ID = "nx-dress-peacock-001";
const SHA = "c9425f51b43a71a1535557530330f7166af10f0d9d4ec20882bf86b6ed1e7098";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const OLD_POS = [-47.5, 0.04167, 60.0], OLD_YAW = 2.58;
const NEW_POS = [-43.3, 0.03399, 69.7], NEW_YAW = -2.318, SCALE = 1;

const cfg = JSON.parse(readFileSync(`${R}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = new Uint8Array(readFileSync(`${R}/agents/arthur/assets/village_dress_peacock.glb`));
const die = (s: string): never => { throw Error(s); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("peacock bytes drift");

// motion comps — verbatim from fauna25 (judge-arc payloads; T0 re-epoch)
const T0 = Date.now();
const MOTION = {
  "motion:peacock": { type: "bob", amp: 0.005, period: 4.8, phase: 0.4, t0: T0 },
  "motion:peacock_head": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.30, period: 8.0, phase: 0.0, t0: T0 },
  "motion:peacock_crest": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.12, period: 3.4, phase: 1.1, t0: T0 },
  "motion:peacock_train": { type: "pendulum", axis: [0, 1, 0], pivot: [0, 0, 0], amp: 0.04, period: 6.0, phase: 1.9, t0: T0 },
  "motion:peacock_wings": { type: "pendulum", axis: [0, 0, 1], pivot: [0, 0, 0], amp: 0.05, period: 1.3, phase: 0.7, t0: T0 },
  "motion:peacock_tail": { type: "pendulum", axis: [1, 0, 0], pivot: [0, 0, 0], amp: 0.10, period: 2.6, phase: 1.5, t0: T0 },
};
const WANT = { ...MOTION };

async function geom() {
  const r = await fetch(`${base}/geom?world=${W}`, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) die(`geom ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries(d.entities.map((e: any) => [e.id, e])) as Record<string, any>;
}

const before = await geom();
const e0 = before[ID] ?? die(`${ID} ABSENT — re-seat requires the standing entity (census ${Object.keys(before).length})`);
const atNew = (e: any) => vec(e.pos, NEW_POS) && near(e.yaw, NEW_YAW) && e.scale === SCALE;
const bagOk = (e: any) => e.lib === LIB && Object.keys(e.comp ?? {}).length === 6;
const already = atNew(e0) && bagOk(e0);
if (already) { console.log(`ALREADY_SEATED ${ID} @ ${JSON.stringify(NEW_POS)} yaw ${NEW_YAW} — zero verbs`); process.exit(0); }
// the contract being retired: exact fauna-25 tuple (verified live this tick)
const isOld = vec(e0.pos, OLD_POS) && near(e0.yaw, OLD_YAW) && e0.lib === LIB;
if (!isOld) die(`live tuple is not the fauna-25 contract: ${e0.pos} ${e0.yaw} ${e0.lib}`);
console.log(`live fauna-25 contract verified: ${e0.lib} @ ${e0.pos} yaw ${e0.yaw}, comp keys ${Object.keys(e0.comp ?? {}).length}`);
console.log("census before:", Object.keys(before).length);

// ---- live SAT preflight at the NEW tuple (fresh census; R-125 gates) ----
{
  const neighbors = Object.values(before).filter((e: any) => e.id !== ID && e.bbox && Math.hypot(e.pos[0] - NEW_POS[0], e.pos[2] - NEW_POS[2]) < 16);
  const cx = 0.022, cz = -0.1225, hw = 0.903, hd = 0.6175;
  const cos = Math.cos(NEW_YAW), sin = Math.sin(NEW_YAW);
  const wx = NEW_POS[0] + cx * cos + cz * sin, wz = NEW_POS[2] - cx * sin + cz * cos;
  const myAxes: [number, number][] = [[cos, -sin], [sin, cos]];
  const myHalf = [hw, hd];
  const BEDS = ["nx-cultivation-lavender-0040", "nx-cultivation-lavender-0027"];
  let worst = Infinity, worstId = "";
  for (const e of neighbors) {
    const b = e.bbox;
    if (b.size[1] <= 0.5) continue; // film/rider exemption (height prong)
    if (e.pos[1] >= 1.8) continue; // suspended decor exemption
    if (BEDS.includes(e.id)) continue; // beds: dedicated rectangle gate below (fauna-27 law)
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const bc = Math.cos(e.yaw), bs = Math.sin(e.yaw);
    const theirAxes: [number, number][] = [[bc, -bs], [bs, bc]];
    const theirHalf = [b.size[0] / 2, b.size[2] / 2];
    const dx = wx - ewx, dz = wz - ewz;
    let best = -Infinity;
    for (const [ax, az] of [...myAxes, ...theirAxes]) {
      const myProj = myHalf[0] * Math.abs(myAxes[0][0] * ax + myAxes[0][1] * az) + myHalf[1] * Math.abs(myAxes[1][0] * ax + myAxes[1][1] * az);
      const tProj = theirHalf[0] * Math.abs(theirAxes[0][0] * ax + theirAxes[0][1] * az) + theirHalf[1] * Math.abs(theirAxes[1][0] * ax + theirAxes[1][1] * az);
      const gap = Math.abs(dx * ax + dz * az) - myProj - tProj;
      if (gap > best) best = gap;
    }
    if (best < worst) { worst = best; worstId = `${e.id}`; }
  }
  // R-125 bed rectangle gate: ≥0.25m beyond BOTH bed planting envelopes
  let bedWorst = Infinity, bedId = "";
  for (const bid of BEDS) {
    const e = before[bid] ?? die(`bed ${bid} absent from census`);
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const bc = Math.cos(e.yaw), bs = Math.sin(e.yaw);
    const theirAxes: [number, number][] = [[bc, -bs], [bs, bc]];
    const theirHalf = [b.size[0] / 2, b.size[2] / 2];
    const dx = wx - ewx, dz = wz - ewz;
    let best = -Infinity;
    for (const [ax, az] of [...myAxes, ...theirAxes]) {
      const myProj = myHalf[0] * Math.abs(myAxes[0][0] * ax + myAxes[0][1] * az) + myHalf[1] * Math.abs(myAxes[1][0] * ax + myAxes[1][1] * az);
      const tProj = theirHalf[0] * Math.abs(theirAxes[0][0] * ax + theirAxes[0][1] * az) + theirHalf[1] * Math.abs(theirAxes[1][0] * ax + theirAxes[1][1] * az);
      const gap = Math.abs(dx * ax + dz * az) - myProj - tProj;
      if (gap > best) best = gap;
    }
    if (best < bedWorst) { bedWorst = best; bedId = bid; }
  }
  console.log(`SAT preflight: ${neighbors.length} neighbors — worst gap ${worst.toFixed(3)}m (${worstId})`);
  console.log(`R-125 bed gate: worst bed clear ${bedWorst.toFixed(3)}m (${bedId})`);
  if (worst < 1.4) die(`sub-1.4 solid adjacency vs ${worstId} (${worst.toFixed(3)}m)`);
  if (bedWorst < 0.25) die(`bed rectangle too close: ${bedId} (${bedWorst.toFixed(3)}m)`);
}

// ---- verbs: remove → spawn (same bytes, NO upload) → 6 comps ----
const verbs: Array<[string, any]> = [["remove", { id: ID }]];
verbs.push(["spawn", { id: ID, lib: LIB, pos: NEW_POS, yaw: NEW_YAW, scale: SCALE }]);
for (const [type, data] of Object.entries(MOTION)) verbs.push(["comp", { id: ID, type, data }]);

await new Promise<void>((resolve, reject) => {
  const ws = new WebSocket(cfg.url);
  let joined = false, i = 0;
  const t = setTimeout(() => reject(Error("verb timeout")), 180_000);
  // uniform 1200ms: remove→spawn real spacing (artwalk-33 / struct152 law),
  // well clear of the 12-verbs/4s shared limit.
  const paced = setInterval(() => {
    if (!joined || i >= verbs.length) return;
    const [verb, args] = verbs[i++];
    ws.send(JSON.stringify({ type: "verb", verb, args }));
    console.log(`verb: ${verb}`);
    if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(t); ws.close(); resolve(); }, 2500);
  }, 1200);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: W, id: "arthur-fauna27-reseat", avatar: cfg.avatar, token: cfg.joinToken }));
  ws.onerror = () => reject(Error("websocket"));
  ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") reject(Error(`server ${m.error}`));
    else if (m.type === "snapshot") joined = true;
  };
});

// ---- post-place verify: exact tuple + lib + full comp bag ----
await Bun.sleep(1500);
const after = await geom();
const e = after[ID] ?? die(`${ID} absent after verbs`);
if (!(e.lib === LIB && vec(e.pos, NEW_POS) && near(e.yaw, NEW_YAW) && e.scale === SCALE)) die(`post tuple/lib: ${JSON.stringify({ pos: e.pos, yaw: e.yaw, lib: e.lib })}`);
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
  if (Math.abs(gt0 - T0) > 60_000) die(`fresh comp t0 not this epoch ${k}: ${gt0} vs ${T0}`);
}
console.log(JSON.stringify({
  status: "RESEATED_VERIFIED", id: ID, lib: e.lib, pos: e.pos, yaw: e.yaw,
  compKeys: keys, verbs: verbs.length,
  bbox: e.bbox?.size, censusTotal: Object.keys(after).length,
}));
