// improve30-decode-court.ts — decode audit for the nx-court improve-30 fix (v2).
// Merged statics (bench legs, beam, flags) have no own node — detect by
// position inside material buckets. Emissive beads KEEP-named (lamp_scale_,
// flame_sconce_, lamp).
// Falsifies: (1) gable horn gone (gable z within ±2.46); (2) lamp post
// grounded column at (-4.6, 0.12..2.47, 2.2); (3) bench seats/legs, beam,
// flags, beads, sconces present by position; (4) rider keep-outs clean;
// (5) envelope strict-subset; (6) KEEP nodes survive.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const P = "agents/arthur/assets/village_court3.glb";
const bytes = readFileSync(P);
const sha = createHash("sha256").update(bytes).digest("hex");
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const binBase = 28 + ((jl + 3) & ~3);

let fails = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) fails++; };

function acc(mi: number) {
  const m = j.meshes[mi];
  const out: number[][] = [];
  for (const prim of m.primitives) {
    const a = j.accessors[prim.attributes.POSITION];
    const bv = j.bufferViews[a.bufferView];
    const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binBase + off + i * 12;
      out.push([bytes.readFloatLE(o), bytes.readFloatLE(o + 4), bytes.readFloatLE(o + 8)]);
    }
  }
  return out;
}

const nodes = j.nodes.filter((n: any) => n.mesh !== undefined);
console.log(`sha16 ${sha.slice(0, 16)}  nodes ${nodes.length}`);
const OLD = { min: [-6.5, -0.2, -2.94], max: [6.5, 4.169, 3.0] };

let gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
const buckets: Record<string, number[][]> = {};
let all: number[][] = [];
for (const n of nodes) {
  const t = n.translation ?? [0, 0, 0];
  const vs = acc(n.mesh).map(v => [v[0] + t[0], v[1] + t[1], v[2] + t[2]]);
  buckets[n.name] = vs;
  all = all.concat(vs);
  for (const v of vs) for (let k = 0; k < 3; k++) {
    if (v[k] < gmin[k]) gmin[k] = v[k];
    if (v[k] > gmax[k]) gmax[k] = v[k];
  }
}
console.log(`envelope x[${gmin[0].toFixed(3)},${gmax[0].toFixed(3)}] y[${gmin[1].toFixed(3)},${gmax[1].toFixed(3)}] z[${gmin[2].toFixed(3)},${gmax[2].toFixed(3)}]`);

// (1) horn: gable triangles merged into the plaster bucket — detect by
// position: any vert in the roof band (y>2.75) at a shed x-band (±3.4±1.5)
// with |z| > 2.46 IS the horn (roof slabs span z ±2.45 = (BD+2over)/2).
function hornMaxZ(bytesBuf: Buffer): number {
  const jl2 = bytesBuf.readUInt32LE(12);
  const j2 = JSON.parse(bytesBuf.subarray(20, 20 + jl2).toString());
  const bb = 28 + ((jl2 + 3) & ~3);
  let mz = 0;
  for (const n of j2.nodes.filter((x: any) => x.mesh !== undefined)) {
    const t = n.translation ?? [0, 0, 0];
    for (const prim of j2.meshes[n.mesh].primitives) {
      const a = j2.accessors[prim.attributes.POSITION];
      const bv = j2.bufferViews[a.bufferView];
      const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
      for (let i = 0; i < a.count; i++) {
        const o = bb + off + i * 12;
        const x = bytesBuf.readFloatLE(o) + t[0], y = bytesBuf.readFloatLE(o + 4) + t[1], z = bytesBuf.readFloatLE(o + 8) + t[2];
        if (y > 2.75 && y < 4.25 && ([-6.1, -0.7, 0.7, 6.1].some(bx => Math.abs(x - bx) < 0.35)) && Math.abs(z) > mz) mz = Math.abs(z);
      }
    }
  }
  return mz;
}
const newMz = hornMaxZ(bytes);
// 2.48 bound: rake boards legitimately reach |z| = 2.45 + (0.09/2)·sin(26°) ≈
// 2.470 at their rotated corners (verge boards close under the roof ends —
// designed); the plaster horn sat at 2.70. Baseline reads 2.70 (RED).
ck("F4 horn killed (roof-band |z| max ≤ 2.48, rake-corner bound)", newMz <= 2.48, `new max|z|=${newMz.toFixed(3)}`);
try {
  const base = readFileSync("/tmp/court-baseline.glb");
  const baseMz = hornMaxZ(base);
  ck("F4 RED on baseline (horn present > 2.5)", baseMz > 2.5, `baseline max|z|=${baseMz.toFixed(3)} (store-re-encoded bytes)`);
} catch { console.log("SKIP baseline RED (no /tmp/court-baseline.glb)"); }

// (2) lamp post column
const post = buckets["lamp_post"];
ck("F5 post node present", !!post, post ? `${post.length} verts` : "missing");
if (post) {
  const xs = post.map(v => v[0]), ys = post.map(v => v[1]), zs = post.map(v => v[2]);
  ck("F5 post grounded at (-4.6, 0.12..2.47, 2.2)",
    Math.min(...xs) < -4.56 && Math.max(...xs) > -4.63 && Math.min(...ys) < 0.13 && Math.max(...ys) > 2.46 && Math.min(...zs) > 2.16 && Math.max(...zs) < 2.24,
    `x[${Math.min(...xs).toFixed(3)},${Math.max(...xs).toFixed(3)}] y[${Math.min(...ys).toFixed(3)},${Math.max(...ys).toFixed(3)}] z[${Math.min(...zs).toFixed(3)},${Math.max(...zs).toFixed(3)}]`);
}
const foot = all.filter(v => Math.abs(v[0] + 4.6) < 0.15 && Math.abs(v[2] - 2.2) < 0.15 && v[1] < 0.14 && v[1] > 0.0);
ck("F5 stone foot at grade", foot.length >= 8, `${foot.length} verts y~${foot.length ? foot[0][1].toFixed(3) : "-"}`);

// (3a) bench seats: 3 timber slabs at y≈0.46..0.53 in the yard gap
const seatW = buckets[Object.keys(buckets).find(k => /timber/.test(k)) ?? ""] ?? [];
const seats = all.filter(v => v[1] > 0.44 && v[1] < 0.55 && Math.abs(v[0]) < 1.4 && Math.abs(v[2]) < 1.2);
ck("F1a bench seats present (3 slabs, yard gap)", seats.length >= 60, `${seats.length} verts`);
const seatLegs = all.filter(v => v[1] > 0.04 && v[1] < 0.46 && Math.abs(v[0]) < 1.2 && Math.abs(v[2]) < 1.2);
ck("F1a bench legs present", seatLegs.length >= 24, `${seatLegs.length} verts`);
// (3b) justice beam: timber box at y 2.54..2.70 spanning x -2.9..2.7, z 1.68..1.82
const beam = all.filter(v => v[1] > 2.53 && v[1] < 2.71 && v[2] > 1.6 && v[2] < 1.9 && v[0] > -3.0 && v[0] < 2.8);
ck("F1b justice beam spans both fronts", beam.length >= 20, `${beam.length} verts`);
// (3c) flagstones: flat stone at y≈0.03..0.09 under bench
const flags = all.filter(v => v[1] > 0.02 && v[1] < 0.1 && Math.abs(v[0]) < 0.9 && Math.abs(v[2]) < 0.4);
ck("F3 flagstones present under bench", flags.length >= 16, `${flags.length} verts`);
// (3d) scale beads + sconces: KEEP-named emissive nodes
let beadN = 0; for (const n of nodes) if (/lamp_scale/.test(n.name)) beadN += buckets[n.name].length;
ck("scale beads present (2, KEEP lamp_scale_)", beadN >= 12, `${beadN} verts`);
let scN = 0; for (const n of nodes) if (/flame_sconce/.test(n.name)) scN += buckets[n.name].length;
ck("F2 sconces present (4, KEEP flame_sconce_)", scN >= 60, `${scN} verts`);

// (4) rider keep-outs (new geometry only — KEEP nodes + the audit's
// new-element position bands above; merged statics cannot be name-filtered,
// so test the bands themselves for rider-zone intrusion)
const KO = [
  { n: "b28", x: [-3.35, -2.65], z: [-2.3, -1.6] },
  { n: "b29", x: [2.85, 3.55], z: [-2.2, -1.5] },
];
// bench/beam/flags/scale bands are all |x|<3.0,z>-1.2..1.9 — disjoint by
// construction from KO boxes; post at x -4.6 z 2.2 also disjoint. Explicit
// check on the full NEW-name set (KEEP nodes):
let koCount = 0;
for (const n of nodes) {
  if (!/lamp_scale|flame_sconce|lamp_post|lamp_arm|lamp_collar/.test(n.name)) continue;
  for (const v of buckets[n.name]) for (const k of KO) {
    if (v[0] >= k.x[0] && v[0] <= k.x[1] && v[2] >= k.z[0] && v[2] <= k.z[1]) koCount++;
  }
}
ck("rider keep-outs clean (new KEEP nodes)", koCount === 0, `${koCount} in-zone`);

// (5) envelope strict-subset
let sub = true, subDetail = "";
for (let k = 0; k < 3; k++) {
  if (gmin[k] < OLD.min[k] - 0.01 || gmax[k] > OLD.max[k] + 0.01) { sub = false; subDetail += ` axis${k} [${gmin[k].toFixed(3)},${gmax[k].toFixed(3)}]`; }
}
ck("envelope strict-subset of live bbox", sub, subDetail);

// (6) KEEP nodes survive
for (const k of ["lamp", "fire", "fire2", "flame"]) ck(`KEEP node '${k}' survives`, !!buckets[k], buckets[k] ? `${buckets[k].length} verts` : "MISSING");

console.log(fails ? `AUDIT FAIL (${fails})` : "AUDIT ALL PASS");
process.exit(fails ? 1 : 0);
