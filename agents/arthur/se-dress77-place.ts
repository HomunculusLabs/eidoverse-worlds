// se-dress77-place.ts — dress-77 deferred placement: hash-gated placer for the
// SE fungus-log deadfall (nx-dress-se-funguslogs-001) at (40.0, -63.0) yaw
// 210° on the west shoulder of forest-0044. Siting math + occupancy scan +
// terrain preflight in DRESSING-PLAN.md dress-77/78.
//
// SAT exemption (artwalk-34/36/37 ladder, tier-b gap-bounded):
//   nx-wild-forest-0044 is a fat compound bbox (13.9 × 13.2m, center offset
//   (+0.219, -0.029)) spanning a whole multi-tree forest blob. Its 2D SAT
//   contact is a false-contact class (struct-19 disc law / probe discipline
//   0b: census bbox overlap is not per-object obstruction). The deadfall is
//   sited SOURCE-TRUE against the live forest-0044 bytes (local retex copy
//   sha 43e4c8c3… == live lib store/43e4c8c3a843881d.glb, re-verified this
//   tick): occupied-1m-cell clearance 2.05m to the nearest trunk cell
//   (44.6, -62.5). Exemption bound: skip SAT for forest-0044 ONLY when the
//   measured census-SAT gap is within ±0.01 of +1.255 — real drift against
//   the forest still hard-fails. All other entities: SAT ≥ 0 required, and
//   the sub-1.4m adjacency set must be exactly the exempted pair.
// Terrain (dress78-terrain.ts, this tick): corners −0.0382..−0.0317
//   (6.5mm spread — flat); py pinned to origin heightAt −0.0349.
// Rim: 70.3..77.0 ∈ [66,108] (SE district rim law). Static, no comps —
//   spawn-only family; SE lamp spend 0 of 8.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt),
// post-place tuple verify, idempotent rerun. dress-76 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_se_funguslogs1.glb`;
const SHA = "fbc626eb3f016bd7072228b5ef08ce07ce855b39db660abd12ebbafc8a773ce7";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-se-funguslogs-001";
const POS = [40.0, -0.0349, -63.0], YAW = 210 * Math.PI / 180; // 3.665191429188092
// local bbox (v6 decode): x -2.329..4.187 (center +0.929, half 3.258),
// z -1.272..0.758 (center -0.257, half 1.015)
const HALF = { x: 3.258, z: 1.015 }, CLOCAL = { x: 0.929, z: -0.257 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-wild-forest-0044", "nx-wild-forest-0018",
  "nx-dress-se-stones-001", "nx-dress-se-cairn-001"];
// the SAT-exempted pair (see header): measured gap must match +1.255 ± 0.01
const EXEMPT_ID = "nx-wild-forest-0044", EXEMPT_GAP = 1.255;

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

// 2D OBB SAT, max separating-axis gap (axis convention align-1:
// local-x -> (cos,-sin), local-z -> (sin,cos); positive = separated).
type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  return {
    cx: pos[0] + c.x * cos + c.z * sin,
    cz: pos[2] - c.x * sin + c.z * cos,
    ux: [cos, -sin], uz: [sin, cos],
    hu: [half.x, half.z],
  };
}
const radius = (o: OBB, ax: number[]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] +
  Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let gap = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
    const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
    if (g > gap) gap = g;
  }
  return gap;
}

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);

// SAT preflight vs fresh live set
const A = obb(POS, YAW, HALF, CLOCAL);
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (id === EXEMPT_ID) {
    // gap-bounded exemption tier: must match the measured value, else drift
    if (Math.abs(g - EXEMPT_GAP) > 0.01) die(`${EXEMPT_ID} SAT gap ${g.toFixed(3)} ≠ pinned ${EXEMPT_GAP} (±0.01) — re-derive siting`);
    continue;
  }
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
if (adjacencies.length) die(`unexplained sub-1.4m solid adjacency: ${adjacencies.join(", ")}`);
console.log(`SAT preflight clear; forest-0044 exempted (gap-bounded +${EXEMPT_GAP}, source-true cell clearance 2.05m); no other sub-1.4m adjacency`);
// district rim law (the deadfall is a district piece, unlike dress-76 core)
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
  const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  if (lo < 66 || hi > 108) die(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside [66,108]`);
  console.log(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} ∈ [66,108]`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SE fungus-log deadfall dress-77");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { uploaded = (await r.json()).path; break; }
  if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// spawn verb (single, paced; only if not already live at the exact tuple)
if (!before[ID]) {
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-se-dress77-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") {
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), 800);
        setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 2600);
      }
    };
  });
} else console.log(`${ID} already live at exact tuple — no verbs`);

// post-place verify
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: before[ID] ? 0 : 1 }));
