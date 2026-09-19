// fauna50-seat-sweep.ts — live-census SAT sweep for the fauna-50
// kingfisher at the millrace bank. Host = nx-struct-millrace
// (-76.707,-0.0256,6.711) yaw 1.7516247, live lib 6e82dd2e == local
// bytes (verified this tick). Race local +z runs downhill (head WSW →
// basin ENE); the village reader approaches from the ENE.
// The kfish solid OBB from the v2 decode: entity-local center
// (0.3701,-0.0078) half (0.5216,0.1156) — the long axis IS the leaning
// snag (+x toward the water).
// THE RACE EXEMPTION (designed-adjacency class, source-decoded member
// gates from mkv3-millrace.ts — the census OBB is fat: 3.427×14.464
// spans the launder/head, pitfall 0b): a seat passes the race via
//   (a) step-column clearance: base local |x| − 0.80 ≥ 0.15;
//   (b) snag wall-crossing clearance: height at the x=±0.8 crossing
//       1.072·(|x|−0.80)+0.03 ≥ stepTop(lz)+0.15 (steps: tops
//       1.15,0.90,0.69,0.51,0.35,0.21,0.09 over z bands i·1.15..(i+1)·1.15);
//   (c) tip over a water film: |tipx| = |x|−0.716 ≤ 0.675;
//   (d) zone: lz ∈ [2.3, 7.6] (clear of the chute z 0..0.6 +1.5 margin
//       and the basin/brim/reeds z ≥ 8.0);
//   (e) launder/head members x ±1.05/±0.6/±0.25 all at z ≤ 0.6 —
//       outside zone (d), no further gate needed.
// All OTHER census solids: worst SAT gap ≥ 1.4m. Films: seat center not
// inside grown 0.3. Preference: deeper over water (|tipx| small), then
// the SSW bank (+x local — bill/cheek toward the NNE/ENE reader).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// host + reader constants
const MR = ents.find((e: any) => e.id === "nx-struct-millrace");
if (!MR) throw Error("millrace absent");
const PX = MR.pos[0], PZ = MR.pos[2], YAWR = MR.yaw;
const cR = Math.cos(YAWR), sR = Math.sin(YAWR);
const local2world = (lx: number, lz: number): [number, number] =>
  [PX + lx * cR + lz * sR, PZ - lx * sR + lz * cR];

// kfish decoded OBB
const CX = 0.3701, CZ = -0.0078, HW = 0.5216, HD = 0.1156;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-struct-millrace") return false; // member-gated below
    if (e.id === "nx-dress-kfish-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films
    if (e.pos[1] >= 1.8) return false;             // suspended
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`census ${ents.length} entities, ${solids.length} non-race solids, ${films.length} films in SAT set`);

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
const insideFilm = (e: any, px2: number, pz2: number) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const dx = px2 - ewx, dz = pz2 - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};

// race member gates
const STEP_TOPS = [1.15, 0.90, 0.69, 0.51, 0.35, 0.21, 0.09];
const stepTopAt = (lz: number) => {
    const i = Math.floor(lz / 1.15);
    if (i < 0 || i > 6) return null; // outside step run
    return STEP_TOPS[i];
};
const memberGates = (lx: number, lz: number) => {
    const b = Math.abs(lx);
    // (a) step-column clearance
    if (b - 0.80 < 0.15) return "step-column <0.15";
    // (d) zone
    if (lz < 2.3 || lz > 7.6) return "zone";
    // (b) wall-crossing clearance over the step containing the crossing z
    const top = stepTopAt(lz);
    if (top === null) return "no-step";
    const h = 1.072 * (b - 0.80) + 0.03;
    if (h < top + 0.15) return `crossing ${h.toFixed(2)} < top+0.15 ${(top + 0.15).toFixed(2)}`;
    // (c) tip over a film
    const tipx = b - 0.716;
    if (tipx > 0.675) return `tip ${tipx.toFixed(2)} not over film`;
    return null; // passes
};

const results: any[] = [];
let nearMiss: any = null;
for (const side of [-1, 1]) {
  for (let lz = 2.3; lz <= 7.6; lz += 0.15) {
    for (let b = 1.00; b <= 1.45; b += 0.05) {
      const lx = side * b;
      const gate = memberGates(lx, lz);
      if (gate) continue;
      // entity yaw: +x faces across the water (side +1 → race −x direction)
      const yawE = YAWR + (side === 1 ? Math.PI : 0);
      const [wx0, wz0] = local2world(lx, lz);
      const cosE = Math.cos(yawE), sinE = Math.sin(yawE);
      const wx = wx0 + CX * cosE + CZ * sinE, wz = wz0 - CX * sinE + CZ * cosE;
      let worst = Infinity, worstId = "";
      for (const e of solids) {
        if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 20) continue;
        const bb = e.bbox;
        const ecx = (bb.min[0] + bb.max[0]) / 2, ecz = (bb.min[2] + bb.max[2]) / 2;
        const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
        const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
        const g = gap(obb(wx, wz, yawE, HW, HD), obb(ewx, ewz, e.yaw, bb.size[0] / 2, bb.size[2] / 2));
        if (g < worst) { worst = g; worstId = e.id; }
      }
      if (worst < 1.4) {
        if (!nearMiss || worst > nearMiss.worst) nearMiss = { side, lz: +lz.toFixed(2), b: +b.toFixed(2), worst: +worst.toFixed(3), worstId };
        continue;
      }
      let onFilm = "";
      for (const f of films) {
        if (Math.hypot(f.pos[0] - wx0, f.pos[2] - wz0) > 22) continue;
        if (insideFilm(f, wx0, wz0)) { onFilm = f.id; break; }
      }
      if (onFilm) continue;
      results.push({ side, lz: +lz.toFixed(2), b: +b.toFixed(2), wx: +wx0.toFixed(2), wz: +wz0.toFixed(2), yawE: +yawE.toFixed(4), tipx: +(b - 0.716).toFixed(3), worst: +worst.toFixed(3), worstId });
    }
  }
}
console.log(`qualifying seats: ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: deeper over water (small |tipx|), then SSW bank (side +1 —
// bill toward the NNE/ENE village reader), then lower bank (closer read)
results.sort((a: any, b2: any) => Math.abs(a.tipx) - Math.abs(b2.tipx) || (b2.side - a.side) || a.b - b2.b);
for (const c of results.slice(0, 10)) console.log(JSON.stringify(c));
