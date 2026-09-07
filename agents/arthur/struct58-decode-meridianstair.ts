// struct58-decode-meridianstair.ts — struct-58: decode-first tie-break for
// the meridianstair verify cluster (survey-19..23, split 3-2 toward defect).
// Read-only. Answers arithmetically, on the exact live-pinned bytes:
//   F1 "middle-gate right post base terminates ~24px above the contact
//       line, bare unshadowed ground beneath" — are all 8 post bases at
//       y=0 in the GLB (source: BoxGeometry(0.18,h,0.18) at y=h/2)?
//   F2 "only 1-of-3 gold pins reads; if pin-per-gate is intent, two gates
//       fail" — how many pins does the build actually carry, and where?
//   F3 envelope vs live census bbox.
import { readFileSync } from "node:fs";

const bytes = readFileSync("agents/arthur/assets/village_meridianstair3.glb");
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));

const nodes = json.nodes ?? [], meshes = json.meshes ?? [], mats = json.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.map((m: any) => m.name).join(", "));
console.log("node names:", nodes.map((n: any) => n.name).join(", "));

const accs = json.accessors ?? [], views = json.bufferViews ?? [];
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];

// source-truth post table (mkv3-meridianstair.ts): 4 x-positions × z=±2.5
const PANEL_W = 6.4 / 3, A = PANEL_W / 2, B = 2.5, K = 0.08, STEP = 0.55, BASE_Y = 3.2;
const CORNER_DIP = K * (A * A - B * B);
const postXs = [
  -3.2, -3.2 + PANEL_W, -3.2 + 2 * PANEL_W, 3.2,
];
const expectedTops = postXs.map((_, i) =>
  BASE_Y + Math.min(i, 2) * STEP + CORNER_DIP); // pi 0,1,2,3 tops per source

interface V { x: number; y: number; z: number }
const ironVerts: V[] = [], goldVerts: V[] = [], glowVerts: V[] = [];

if (json.extensionsRequired?.includes("KHR_draco_mesh_compression")) throw new Error("draco");
for (const m of meshes) {
  for (const prim of m.primitives) {
    const posAcc = accs[prim.attributes.POSITION];
    const bv = views[posAcc.bufferView];
    const base = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + 28 + jsonLen;
    const matName = mats[prim.material]?.name ?? "?";
    const owner = nodes.find((n: any) => n.mesh === meshes.indexOf(m));
    const t = owner?.translation ?? [0, 0, 0];
    for (let i = 0; i < posAcc.count; i++) {
      const o = base + i * 12;
      const v = {
        x: dv.getFloat32(o, true) + t[0],
        y: dv.getFloat32(o + 4, true) + t[1],
        z: dv.getFloat32(o + 8, true) + t[2],
      };
      if (v.x < gMin[0]) gMin[0] = v.x; if (v.y < gMin[1]) gMin[1] = v.y; if (v.z < gMin[2]) gMin[2] = v.z;
      if (v.x > gMax[0]) gMax[0] = v.x; if (v.y > gMax[1]) gMax[1] = v.y; if (v.z > gMax[2]) gMax[2] = v.z;
      if (matName.includes("iron")) ironVerts.push(v);
      else if (matName.includes("gold")) goldVerts.push(v);
      else if (/glow|brass|emissive/i.test(matName)) glowVerts.push(v);
    }
  }
}

console.log("GLOBAL bbox min:", gMin.map((v) => +v.toFixed(4)));
console.log("GLOBAL bbox max:", gMax.map((v) => +v.toFixed(4)));

// F1: per-post iron base contact. A post = iron verts within 0.30m of
// (postX, ±2.5). Report min-y (base) and max-y (top) per post.
console.log("\nF1 post bases (iron verts within 0.30m of each post axis):");
let worstBase = 0;
postXs.forEach((px, pi) => {
  for (const side of [-1, 1]) {
    const near = ironVerts.filter((v) => Math.abs(v.x - px) <= 0.30 && Math.abs(v.z - side * B) <= 0.30);
    if (near.length === 0) { console.log(`  post P${pi}${side < 0 ? "F" : "B"} @x=${px.toFixed(3)} z=${side * B}: NO VERTS (bucket merge loss?)`); continue; }
    const minY = Math.min(...near.map((v) => v.y));
    const maxY = Math.max(...near.map((v) => v.y));
    worstBase = Math.max(worstBase, Math.abs(minY));
    console.log(`  post P${pi}${side < 0 ? "F" : "B"} @x=${px.toFixed(3)} z=${(side * B).toFixed(1)}: n=${near.length} baseY=${minY.toFixed(4)} topY=${maxY.toFixed(4)} (expected top ${expectedTops[pi].toFixed(4)})`);
  }
});
console.log(`F1 VERDICT: worst |baseY| across all 8 posts = ${worstBase.toFixed(4)} m ${worstBase < 0.01 ? "→ ALL BASES AT CONTACT (y=0), source-true" : "→ FLOAT DETECTED"}`);

// any iron verts at all below the post tops but outside post columns? (stubs)
const strayIron = ironVerts.filter((v) =>
  !postXs.some((px) => Math.abs(v.x - px) <= 0.30 && Math.abs(Math.abs(v.z) - B) <= 0.30));
console.log(`iron verts outside post columns (stubs/steps): ${strayIron.length}`);

// F2: pin census — gold+glow clusters.
const allPin = [...goldVerts, ...glowVerts];
const clusters: { x: number; y: number; z: number; n: number }[] = [];
for (const v of allPin) {
  const c = clusters.find((c) => Math.hypot(c.x - v.x, c.y - v.y, c.z - v.z) < 0.25);
  if (c) { c.n++; c.x = (c.x * (c.n - 1) + v.x) / c.n; c.y = (c.y * (c.n - 1) + v.y) / c.n; c.z = (c.z * (c.n - 1) + v.z) / c.n; }
  else clusters.push({ ...v, n: 1 });
}
console.log(`\nF2 pin clusters (gold+glow): ${clusters.length}`);
clusters.forEach((c, i) => console.log(`  pin${i}: (${c.x.toFixed(3)}, ${c.y.toFixed(3)}, ${c.z.toFixed(3)}) n=${c.n}`));
console.log(`F2 expected by source: exactly 2, at x=+3.2 (summit), z=±2.5, bead center y≈${(expectedTops[3] + 0.09).toFixed(3)}`);
