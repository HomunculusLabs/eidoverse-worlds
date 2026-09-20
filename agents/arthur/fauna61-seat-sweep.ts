// fauna61-seat-sweep.ts — live-census SAT sweep for the fauna-61 white
// stork at the millrace channel margin. Host = nx-struct-millrace
// (-76.707,-0.0256,6.711) yaw 1.7516247, live lib 6e82dd2e == local bytes
// (verified this tick). Race local +z runs downhill (head WSW → basin
// ENE); the village reader approaches from the ENE (+x race side).
//
// Stork decoded OBB (fauna61-decode-stork.ts): entity-local center
// (0.0731, 0.000) half (0.8435, 0.225) — long axis = local x (facing).
// SEAT YAW (race-local) = +π/2: birds stand PARALLEL to the channel
// (the classic channel-margin stork), flank normals (±z local → race ±x)
// facing the ENE reader — the two-tone band contract view (peahen law).
// Footprint in race frame: half 0.225 (race-x) × 0.844 (race-z).
//
// THE RACE EXEMPTION (designed adjacency, source members from
// mkv3-millrace.ts — the census OBB is fat, pitfall 0b): margin gap ≥0.6
// from every race member:
//   steps x ±0.80, z 0..8.05 (slab tops 1.15..0.09);
//   head box x ±1.05, z −1.3..0; launder x ±0.35, z −3.6..−1.3;
//   basin OBB x ±1.55, z 7.65..10.7 (brim oval ~1.53×1.03 @ z 9.15).
// kfish nx-dress-kfish-001 (race-local center (0.99,6.95) half (0.52,
// 0.116) from fauna-50): SAT ≥ 1.4 (full gate — it is a separate solid).
// All OTHER census solids: worst SAT ≥ 1.4 (rotated-OBB both sides).
// Films: seat center not inside grown 0.3. Zone: race-local
// lx ∈ [1.45, 2.85], lz ∈ [2.3, 4.55] (SSW mid-race margin, sun side,
// clear of the kfish's z by construction). Preference: closest to the
// channel (smallest race margin gap), then best worst-SAT.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log("census:", ents.length, "entities");

const MR = ents.find((e: any) => e.id === "nx-struct-millrace");
if (!MR) throw Error("millrace absent");
if (!String(MR.lib ?? "").includes("6e82dd2e")) throw Error(`race lib drift ${MR.lib}`);
const PX = MR.pos[0], PZ = MR.pos[2], YAWR = MR.yaw;
const cR = Math.cos(YAWR), sR = Math.sin(YAWR);
const local2world = (lx: number, lz: number): [number, number] =>
  [PX + lx * cR + lz * sR, PZ - lx * sR + lz * cR];

// stork footprint half-extents in RACE frame at race-local yaw +π/2
// (v5 baked decode: entity half (1.1451, 0.4158) → race-x 0.4158, race-z 1.1451)
const HW = 0.4158, HD = 1.1451;   // race-x, race-z

// race member boxes (race-local axis-aligned)
const MEMBERS: { name: string; x0: number; x1: number; z0: number; z1: number }[] = [
  { name: "steps", x0: -0.8, x1: 0.8, z0: 0, z1: 8.05 },
  { name: "head", x0: -1.05, x1: 1.05, z0: -1.3, z1: 0 },
  { name: "launder", x0: -0.35, x1: 0.35, z0: -3.6, z1: -1.3 },
  { name: "basin", x0: -1.55, x1: 1.55, z0: 7.65, z1: 10.7 },
];

const solids = ents.filter((e: any) => {
    if (e.id === "nx-struct-millrace") return false;  // member-gated
    if (e.id === "nx-dress-stork-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films
    if (e.pos[1] >= 1.8) return false;             // suspended
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`${solids.length} solids, ${films.length} films in SAT set`);

const obb = (wx: number, wz: number, yaw: number, hw: number, hd: number) => {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return { x: wx, z: wz, yaw, hw, hd, ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
const gap = (a: any, b: any) => {
    const dx = a.x - b.x, dz = a.z - b.z;
    const axes: [number, number][] = [a.ax, a.az, b.ax, b.az];
    let best = -Infinity;
    for (const [ux, uz] of axes) {
        const pa = a.hw * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hd * Math.abs(a.az[0] * ux + a.az[1] * uz);
        const pb = b.hw * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hd * Math.abs(b.az[0] * ux + b.az[1] * uz);
        const g = Math.abs(dx * ux + dz * uz) - pa - pb;
        if (g > best) best = g;
    }
    return best;
};
const worldOBB = (e: any) => {
    const b = e.bbox;
    const cx = (b.min[0] + b.max[0]) / 2, cz = (b.min[2] + b.max[2]) / 2;
    const wx = e.pos[0] + cx * Math.cos(e.yaw) + cz * Math.sin(e.yaw);
    const wz = e.pos[2] - cx * Math.sin(e.yaw) + cz * Math.cos(e.yaw);
    return obb(wx, wz, e.yaw, b.size[0] / 2, b.size[2] / 2);
};
const insideFilm = (e: any, px2: number, pz2: number) => {
    const b = e.bbox;
    const ecx2 = (b.min[0] + b.max[0]) / 2, ecz2 = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx2 * Math.cos(e.yaw) + ecz2 * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx2 * Math.sin(e.yaw) + ecz2 * Math.cos(e.yaw);
    const dx = px2 - ewx, dz = pz2 - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};

// race-local OBB of the seat (axis-aligned in race frame)
const raceSeat = (lx: number, lz: number) => ({ lx, lz });

let best: { lx: number; lz: number; marginGap: number; worst: number; worstId: string } | null = null;
let tried = 0, passed = 0;
for (let lx = 1.45; lx <= 2.851; lx += 0.05) {
  for (let lz = 2.3; lz <= 4.551; lz += 0.05) {
    tried++;
    const s = raceSeat(+lx.toFixed(2), +lz.toFixed(2));
    // race member margin (designed adjacency ≥ 0.6)
    let marginGap = Infinity;
    for (const m of MEMBERS) {
      const dx = Math.max(m.x0 - (s.lx + HW), s.lx - HW - m.x1, 0);
      const dz = Math.max(m.z0 - (s.lz + HD), s.lz - HD - m.z1, 0);
      const g = Math.hypot(dx, dz);
      if (g < marginGap) marginGap = g;
    }
    if (marginGap < 0.6) continue;
    // world seat + census solids (entity halves 1.1451 × 0.4158 at world yaw)
    const [wx, wz] = local2world(s.lx, s.lz);
    const worldYaw = Math.PI / 2;
    const sOBB = obb(wx, wz, worldYaw, 1.1451, 0.4158);
    let worst = Infinity, worstId = "";
    let ok = true;
    for (const e of solids) {
      const g = gap(sOBB, worldOBB(e));
      if (g < worst) { worst = g; worstId = e.id; }
      if (g < 1.4) { ok = false; break; }
    }
    if (!ok) continue;
    // films
    let inFilm = false;
    for (const f of films) if (insideFilm(f, wx, wz)) { inFilm = true; break; }
    if (inFilm) continue;
    passed++;
    if (!best || marginGap < best.marginGap - 1e-9 || (Math.abs(marginGap - best.marginGap) < 1e-9 && worst > best.worst)) {
      best = { lx: s.lx, lz: s.lz, marginGap, worst, worstId };
    }
  }
}

if (!best) { console.log("NO QUALIFYING SEAT"); process.exit(1); }
const [bx, bz] = local2world(best.lx, best.lz);
console.log(JSON.stringify({
  best: { raceLocal: [best.lx, best.lz], world: [+bx.toFixed(3), +bz.toFixed(3)], yawWorld: +(Math.PI / 2).toFixed(4) },
  raceMarginGap: +best.marginGap.toFixed(3),
  worstOtherSolid: +best.worst.toFixed(3), worstId: best.worstId,
  tried, passed,
}));