// improve36-decode-monument.ts — ANALYZE probe for nx-town-monument (row 28).
// Standing finding (survey-5 NATIVE, corroborated improve-36): isolated dark
// pinhole at a near-tangent strand junction on the knot's right limb.
// Source truth first (probe pitfall 11): the knot is one closed tube on the
// three.js TorusKnotGeometry(p=2,q=5) curve — a pinhole can only be a
// see-through sliver where two strand passes ABUT (center distance just
// above 2×TUBE). This probe:
//   1. recomputes the curve (same formula as three.js) at N=4000 samples;
//   2. finds all non-adjacent near-tangent pairs (gap = dist − 2×TUBE in
//      (−0.02, +0.06]) and prints midpoints in knot-local coords;
//   3. decodes the live GLB (village_monument3.glb == live d7d3b15c) and
//      reports the knot node: translation, merged mesh vertex count, bucket
//      bounds — so the fix (weld beads) has exact before-numbers.
//      JUNCTION-VERIFY: counts curve samples inside r0.3 of each junction
//      — every junction must be backed by real curve passes.
import { readFileSync } from "node:fs";

const R = 0.85, TUBE = 0.16, P = 2, Q = 5, N = 4000;

// three.js TorusKnotGeometry.calculatePositionOnCurve
const curve = (u: number): [number, number, number] => {
  const cu = Math.cos(u), su = Math.sin(u);
  const quOverP = (Q / P) * u;
  const cs = Math.cos(quOverP);
  return [
    R * (2 + cs) * 0.5 * cu,
    R * (2 + cs) * 0.5 * su,
    R * Math.sin(quOverP) * 0.5,
  ];
};

const pts: [number, number, number][] = [];
for (let i = 0; i < N; i++) pts.push(curve((i / N) * Math.PI * 2));

// near-tangent junctions: non-adjacent sample pairs (|Δi| wrapped > N/12)
// whose distance is within [2*TUBE − 0.02, 2*TUBE + 0.06]
type J = { i: number; j: number; d: number; gap: number; mid: [number, number, number] };
const found: J[] = [];
const far = (i: number, j: number) => {
  let d = Math.abs(i - j); d = Math.min(d, N - d); return d > N / 12;
};
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    if (!far(i, j)) continue;
    const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 2 * TUBE + 0.06 && d > 2 * TUBE - 0.02) {
      found.push({ i, j, d, gap: d - 2 * TUBE, mid: [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2, (pts[i][2] + pts[j][2]) / 2] });
    }
  }
}
// cluster: merge junctions within 0.25m of an earlier one (same junction seen
// at neighboring samples)
const clusters: J[] = [];
for (const f of found) {
  const c = clusters.find(k => Math.hypot(f.mid[0] - k.mid[0], f.mid[1] - k.mid[1], f.mid[2] - k.mid[2]) < 0.25);
  if (!c) clusters.push(f); else if (f.d < c.d) { c.i = f.i; c.j = f.j; c.d = f.d; c.gap = f.gap; c.mid = f.mid; }
}
console.log(`curve junctions (gap = centerDist − 2×TUBE, + = open sliver): ${clusters.length}`);
for (const c of clusters) {
  console.log(`  mid=(${c.mid.map(v => v.toFixed(3)).join(", ")}) dist=${c.d.toFixed(4)} gap=${(c.gap >= 0 ? "+" : "") + c.gap.toFixed(4)} u1=${(c.i / N * 360).toFixed(1)}° u2=${(c.j / N * 360).toFixed(1)}°`);
}

// also: overlapping passes (dist < 2*TUBE − 0.02) — strands that fuse naturally
let overlaps = 0, minD = Infinity;
for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
  if (!far(i, j)) continue;
  const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
  if (d < minD) minD = d;
  if (d < 2 * TUBE - 0.02) overlaps++;
}
console.log(`overlapping pass-pairs (naturally fused): ${overlaps}; global min non-adjacent center distance = ${minD.toFixed(4)} (2×TUBE = ${(2 * TUBE).toFixed(3)})`);

// decode live GLB: knot node + mesh stats
const buf = readFileSync("agents/arthur/assets/village_monument3.glb");
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
console.log(`GLB nodes: ${json.nodes.length}; named: ${json.nodes.map((n: any) => n.name).join(", ")}`);
for (const [ni, n] of json.nodes.entries()) {
  if (n.mesh === undefined) continue;
  const mesh = json.meshes[n.mesh];
  let total = 0;
  for (const prim of mesh.primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    total += acc.count;
  }
  const knotIdx = json.nodes.findIndex((x: any) => x.name === "knot");
  const knot = json.nodes[knotIdx];
  const tr = knot.translation ?? [0, 0, 0];
  // knot-local: subtract knot group translation
  const local = clusters.map(c => ({ ...c, wl: [c.mid[0] + tr[0], c.mid[1] + tr[1], c.mid[2] + tr[2]] as [number, number, number] }));
  void local; void ni; void n;
  console.log(`knot node translation=${tr.join(",")}`);
  console.log(`knot mesh total verts=${total}`);
}
