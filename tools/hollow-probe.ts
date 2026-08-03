// Will this model be walkable, and will it flatten the grass under it?
//
// Both answers live in colliders.js decide(), inside a running client, which
// makes them annoying to ask. This reproduces them offline from the GLB:
//
//   bun tools/hollow-probe.ts <file.glb> [scale]
//
//   walkable  — room-sized (footprint >= 16m^2, height >= 2.2m) gets an exact
//               trimesh collider you can walk into. Size is the whole rule.
//   clearing  — only models carrying their own FLOOR suppress the meadow, so a
//               tree keeps its grass while a pavilion gets a clean interior.
//
// It also reports the old centre-probe distance, which used to gate walkability
// and rejected every bell tower and pavilion we own (bell2: 0.20m). Kept only
// as a diagnostic — it decides nothing now.

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

const HOLLOW_MIN_DIST = 0.9;   // retired gate — reported for diagnosis only
const MIN_FOOTPRINT = 16;      // m², colliders.js decide()
const MIN_HEIGHT = 2.2;        // m
const FLOOR_FRAC = 0.35;       // colliders.js hasFloor()

const path = process.argv[2];
const scale = Number(process.argv[3] ?? 1);
if (!path) { console.error("usage: bun tools/hollow-probe.ts <file.glb> [scale]"); process.exit(1); }

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(path);

const inScene = new Set<any>();
for (const s of doc.getRoot().listScenes()) s.traverse((n: any) => inScene.add(n));

/** World-space triangles of every scene-reachable primitive. */
function* triangles(): Generator<number[][]> {
  for (const node of doc.getRoot().listNodes()) {
    if (!inScene.has(node)) continue;
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      const idx = prim.getIndices();
      const n = idx ? idx.getCount() : pos.getCount();
      const xf = (i: number) => {
        const v = [0, 0, 0]; pos.getElement(i, v);
        return [
          m[0]! * v[0]! + m[4]! * v[1]! + m[8]! * v[2]! + m[12]!,
          m[1]! * v[0]! + m[5]! * v[1]! + m[9]! * v[2]! + m[13]!,
          m[2]! * v[0]! + m[6]! * v[1]! + m[10]! * v[2]! + m[14]!,
        ];
      };
      for (let i = 0; i + 2 < n; i += 3) {
        yield [xf(idx ? idx.getScalar(i) : i),
               xf(idx ? idx.getScalar(i + 1) : i + 1),
               xf(idx ? idx.getScalar(i + 2) : i + 2)];
      }
    }
  }
}

// bbox
const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
let tris = 0;
for (const t of triangles()) {
  tris++;
  for (const p of t) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k]!, p[k]!); mx[k] = Math.max(mx[k]!, p[k]!); }
}
const size = [mx[0]! - mn[0]!, mx[1]! - mn[1]!, mx[2]! - mn[2]!];
const centre = [(mn[0]! + mx[0]!) / 2, (mn[1]! + mx[1]!) / 2, (mn[2]! + mx[2]!) / 2];

/** Squared distance from point to triangle (Ericson, Real-Time Collision Detection). */
function distToTri(p: number[], a: number[], b: number[], c: number[]): number {
  const sub = (u: number[], v: number[]) => [u[0]! - v[0]!, u[1]! - v[1]!, u[2]! - v[2]!];
  const dot = (u: number[], v: number[]) => u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!;
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return dot(ap, ap);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return dot(bp, bp);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3), q = [a[0]! + ab[0]! * v, a[1]! + ab[1]! * v, a[2]! + ab[2]! * v];
    return dot(sub(p, q), sub(p, q));
  }
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return dot(cp, cp);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6), q = [a[0]! + ac[0]! * w, a[1]! + ac[1]! * w, a[2]! + ac[2]! * w];
    return dot(sub(p, q), sub(p, q));
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    const q = [b[0]! + (c[0]! - b[0]!) * w, b[1]! + (c[1]! - b[1]!) * w, b[2]! + (c[2]! - b[2]!) * w];
    return dot(sub(p, q), sub(p, q));
  }
  const denom = 1 / (va + vb + vc), v = vb * denom, w = vc * denom;
  const q = [a[0]! + ab[0]! * v + ac[0]! * w, a[1]! + ab[1]! * v + ac[1]! * w, a[2]! + ab[2]! * v + ac[2]! * w];
  return dot(sub(p, q), sub(p, q));
}

let best = Infinity, bestTri: number[][] | null = null;
for (const t of triangles()) {
  const d2 = distToTri(centre, t[0]!, t[1]!, t[2]!);
  if (d2 < best) { best = d2; bestTri = t; }
}
const dist = Math.sqrt(best) * scale;

const footprint = size[0]! * size[2]! * scale * scale;
const height = size[1]! * scale;
const roomScale = footprint >= MIN_FOOTPRINT && height >= MIN_HEIGHT;
const hollow = dist > HOLLOW_MIN_DIST;

// ---- does it carry its own floor? (colliders.js hasFloor) -------------------
// Rays straight down from mid-height, over the inset middle of the footprint.
// A deck/platform is hit by most of them; a tree's open understorey by almost
// none. Same 4×4 grid and 0.35 threshold as the client.
const tris3: number[][][] = [...triangles()];
function rayDownHitsFloor(ox: number, oz: number): boolean {
  const midY = centre[1]!;
  let bestT = Infinity, bestNy = 0;
  for (const [a, b, c] of tris3 as [number[], number[], number[]][]) {
    // Möller–Trumbore against direction (0,-1,0)
    const e1 = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!];
    const e2 = [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!];
    // p = dir × e2, dir = (0,-1,0) → p = (-e2[2], 0, e2[0])
    const px = -e2[2]!, pz = e2[0]!;
    const det = e1[0]! * px + e1[2]! * pz;
    if (Math.abs(det) < 1e-12) continue;
    const inv = 1 / det;
    const t0 = [ox - a[0]!, midY - a[1]!, oz - a[2]!];
    const u = (t0[0]! * px + t0[2]! * pz) * inv;
    if (u < 0 || u > 1) continue;
    // q = t0 × e1 ; v = dir · q * inv = -q[1] * inv
    const qy = t0[2]! * e1[0]! - t0[0]! * e1[2]!;
    const v = -qy * inv;
    if (v < 0 || u + v > 1) continue;
    const t = (e2[0]! * (t0[1]! * e1[2]! - t0[2]! * e1[1]!)
             + e2[1]! * (t0[2]! * e1[0]! - t0[0]! * e1[2]!)
             + e2[2]! * (t0[0]! * e1[1]! - t0[1]! * e1[0]!)) * inv;
    if (t <= 1e-6 || t >= bestT) continue;
    const nx = e1[1]! * e2[2]! - e1[2]! * e2[1]!;
    const ny = e1[2]! * e2[0]! - e1[0]! * e2[2]!;
    const nz = e1[0]! * e2[1]! - e1[1]! * e2[0]!;
    const len = Math.hypot(nx, ny, nz) || 1;
    bestT = t; bestNy = ny / len;
  }
  return bestT < Infinity && Math.abs(bestNy) > 0.5;
}
let floorHits = 0;
const w = size[0]!, d = size[2]!;
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    if (rayDownHitsFloor(mn[0]! + w * (0.2 + 0.2 * i), mn[2]! + d * (0.2 + 0.2 * j))) floorHits++;
  }
}
const floorFrac = floorHits / 16;
const hasFloor = floorFrac >= FLOOR_FRAC;

const f = (n: number) => n.toFixed(2);
console.log(`\n${path}${scale !== 1 ? `  (scale ${scale})` : ""}`);
console.log(`  triangles      ${tris}`);
console.log(`  size           ${size.map((v) => f(v * scale)).join(" × ")} m`);
console.log(`  footprint      ${f(footprint)} m²   ${footprint >= MIN_FOOTPRINT ? "✓" : "✗"} (needs ≥ ${MIN_FOOTPRINT})`);
console.log(`  height         ${f(height)} m      ${height >= MIN_HEIGHT ? "✓" : "✗"} (needs ≥ ${MIN_HEIGHT})`);
console.log(`  room-scale     ${roomScale ? "YES" : "NO"}`);
console.log(`  own floor      ${floorHits}/16 rays  ${hasFloor ? "✓" : "✗"} (needs ≥ ${FLOOR_FRAC * 100}%)`);
console.log(`  [retired] centre probe ${f(dist)} m ${hollow ? "clear" : "blocked"}`
  + (bestTri ? ` by geometry at (${[0, 1, 2].map((k) => f((bestTri![0]![k]! + bestTri![1]![k]! + bestTri![2]![k]!) / 3)).join(", ")})` : ""));
console.log(`\n  WALKABLE: ${roomScale ? "YES — exact trimesh collider" : `no — ${height > 2.4 ? "pillar" : "box"} collider`}`);
console.log(`  CLEARS GRASS: ${roomScale && hasFloor ? "yes — it has a floor" : "no"}\n`);
