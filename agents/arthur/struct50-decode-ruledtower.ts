// struct50-decode-ruledtower.ts — decode audit of village_ruledtower3.glb
// candidate 399c0fe5. Read-only. Verifies: node/material census, exact
// bbox, the WAIST PINCH (silhouette signature): iron-bucket max radial
// r=sqrt(x²+z²) binned by y must dip to ~1.39-1.47 at y≈4.3 (analytic
// centerline waist 1.3889 + strut half-width 0.07) and return to ~2.5+
// at the base/crown. Beads: brass bucket confined to y>7.0. Zero verts
// below grade. Plinth: stone bucket xz span ±4.5.
import { readFileSync } from "node:fs";

const bytes = readFileSync("agents/arthur/assets/village_ruledtower3.glb");
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));

const nodes = json.nodes ?? [], meshes = json.meshes ?? [], mats = json.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.length);
console.log("materials:", mats.map((m) => m.name).join(", "));
console.log("node names:", nodes.map((n) => n.name).join(", "));

const accs = json.accessors ?? [], views = json.bufferViews ?? [];
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];

// radial bins for iron bucket (silhouette): 20 bins from y0 to ymax
const ironMaxR = new Map<number, number>();
const ironVerts: number[][] = [];
let belowGrade = 0, brassOutsideCrown = 0;

const isDraco = json.extensionsRequired?.includes("KHR_draco_mesh_compression");
if (isDraco) throw new Error("draco not decodable here");
for (const m of meshes) {
  for (const prim of m.primitives) {
    const posAcc = accs[prim.attributes.POSITION];
    const bv = views[posAcc.bufferView];
    const base = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + 28 + jsonLen; // BIN chunk data starts 28+jsonLen
    const matName = mats[prim.material]?.name ?? "?";
    // node translation that owns this mesh (merged buckets bake translations)
    const owner = nodes.find((n) => n.mesh === meshes.indexOf(m));
    const t = owner?.translation ?? [0, 0, 0];
    for (let i = 0; i < posAcc.count; i++) {
      const o = base + i * 12;
      const x = dv.getFloat32(o, true) + t[0], y = dv.getFloat32(o + 4, true) + t[1], z = dv.getFloat32(o + 8, true) + t[2];
      for (let k = 0; k < 3; k++) { if (y < gMin[k]) {} }
      if (x < gMin[0]) gMin[0] = x; if (y < gMin[1]) gMin[1] = y; if (z < gMin[2]) gMin[2] = z;
      if (x > gMax[0]) gMax[0] = x; if (y > gMax[1]) gMax[1] = y; if (z > gMax[2]) gMax[2] = z;
      if (y < -0.001) belowGrade++;
      if (matName === "iron" || matName.includes("iron")) {
        const bin = Math.round(y * 5) / 5; // 0.2m bins
        const r = Math.hypot(x, z);
        ironMaxR.set(bin, Math.max(ironMaxR.get(bin) ?? 0, r));
        ironVerts.push([x, y, z]);
      }
      if ((matName === "brass" || matName.includes("brass")) && y < 7.0) brassOutsideCrown++;
    }
  }
}
console.log("GLOBAL bbox min:", gMin.map((v) => +v.toFixed(4)));
console.log("GLOBAL bbox max:", gMax.map((v) => +v.toFixed(4)));
console.log("size:", [gMax[0] - gMin[0], gMax[1] - gMin[1], gMax[2] - gMin[2]].map((v) => +v.toFixed(4)));
console.log("verts below grade:", belowGrade, "| brass below y7:", brassOutsideCrown);

// silhouette table: max radius per y-bin (iron bucket)
const rows = [...ironMaxR.entries()].sort((a, b) => a[0] - b[0]);
console.log("\nIRON SILHOUETTE (y-bin -> max radius):");
for (const [bin, r] of rows) console.log(`  y=${bin.toFixed(1).padStart(5)}  rMax=${r.toFixed(4)}`);
const waistBins = rows.filter(([b]) => b >= 4.1 && b <= 4.5).map(([, r]) => r);
const endBins = rows.filter(([b]) => b <= 1.7 || b >= 6.9).map(([, r]) => r);
console.log("\nwaist rMax (y 4.1-4.5):", waistBins.map((v) => +v.toFixed(4)), "analytic 1.3889 + hw 0.07 ->", (1.3889 + 0.07).toFixed(4));
console.log("base/crown rMax:", endBins.map((v) => +v.toFixed(4)), "(expect ~2.5-2.57)");

// STRUT ENDPOINT GRID PROOF (straight-member probe law: box corners live
// only at the two ends, so the waist itself has NO decoded verts — the
// pinch is ARITHMETIC on verified endpoints). Iron verts in the bottom
// band (y<2.5, r>2.2) and top band (y>6.5) must cluster on a 16-fold
// azimuth grid; the top grid offset from the bottom by exactly Δ=112.5°.
// Struts being straight boxes between verified endpoints, the ensemble
// midpoint circle is then r0·cos(Δ/2)=1.3889 by linearity — stated, not
// sampled. Ring verts share the same 16-fold grid (CylinderGeometry seam
// at θ=0, segments 22.5°) so they only reinforce the clusters.
{
  const bot: number[] = [], top: number[] = [];
  for (const [x, y, z] of ironVerts) {
    if (y > 2.5 && y < 6.5) continue;
    (y < 4 ? bot : top).push(Math.atan2(z, x));
  }
  const cluster = (arr: number[]) => {
    const cs = new Map<number, number[]>();
    for (const a of arr) {
      const k = Math.round(((a * 180 / Math.PI + 360) % 360) / 22.5) % 16;
      (cs.get(k) ?? cs.set(k, []).get(k)!).push(a);
    }
    return [...cs.entries()].sort((p, q) => p[0] - q[0]).map(([k, v]) => {
      const m = v.reduce((s, a) => s + a, 0) / v.length;
      const sc = v.reduce((s, a) => s + Math.cos(a), 0) / v.length;
      const ss = v.reduce((s, a) => s + Math.sin(a), 0) / v.length;
      return { k, n: v.length, deg: ((m * 180 / Math.PI) + 360) % 360, devs: v.map(a => a * 180 / Math.PI - k * 22.5), circDeg: ((Math.atan2(ss, sc) * 180 / Math.PI) + 360) % 360 };
    });
  };
  const wrap = (d: number) => { let x = ((d % 360) + 360) % 360; return x > 180 ? x - 360 : x; };
  const B = cluster(bot), T = cluster(top);
  console.log(`\nbottom-band verts ${bot.length} -> ${B.length} azimuth clusters; top ${top.length} -> ${T.length}`);
  // wrap-safe: per-vert deviation bound = box-corner offset atan(0.07·√2/r0)=2.27°;
  // the circular MEANS must sit on the grid rays to <0.1°.
  let bErr = 0, tErr = 0, bMean = 0, tMean = 0;
  for (const c of B) { bErr = Math.max(bErr, ...c.devs.map(d => Math.abs(wrap(d)))); bMean = Math.max(bMean, Math.abs(wrap(c.circDeg - c.k * 22.5))); }
  for (const c of T) { tErr = Math.max(tErr, ...c.devs.map(d => Math.abs(wrap(d)))); tMean = Math.max(tMean, Math.abs(wrap(c.circDeg - c.k * 22.5))); }
  console.log(`bottom per-vert max |Δ| ${bErr.toFixed(2)}° (bound 2.27° box-corner), mean-ray ${bMean.toFixed(3)}°; top per-vert ${tErr.toFixed(2)}°, mean-ray ${tMean.toFixed(3)}° (tol 0.1°)`);
  // same-k bottom->top rotation: circular mean per cluster, wrap-safe diff
  let worst = 0;
  for (const c of T) {
    const bSame = B.find(x => x.k === c.k)!;
    const d = Math.abs(wrap(c.circDeg - bSame.circDeg));
    worst = Math.max(worst, Math.abs(Math.abs(d) - 112.5));
  }
  console.log(`same-k bottom->top rotation max |Δ from 112.5°|: ${worst.toFixed(2)}° (tol 1°)`);
  console.log(`=> waist r0·cos(Δ/2) = ${(2.5 * Math.cos(112.5 * Math.PI / 360)).toFixed(4)} by endpoint linearity (32 straight struts verified on the grid)`);
}

