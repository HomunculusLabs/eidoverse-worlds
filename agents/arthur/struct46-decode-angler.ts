// struct46-decode-angler.ts — decode audit of village_angler3.glb candidate 8c1a5047
// Read-only. Verifies: rod/line/bobber verts exist, exact bbox, node/material census.
import { readFileSync } from "node:fs";

const bytes = readFileSync("agents/arthur/assets/village_angler3.glb");
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));

const nodes = json.nodes ?? [];
const meshes = json.meshes ?? [];
const mats = json.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.length);
console.log("materials:", mats.map((m) => m.name).join(", "));

// accessors
const accs = json.accessors ?? [];
const views = json.bufferViews ?? [];
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];
let meshCount = 0;
const perMesh = [];

// iterative index-stack walk (pitfall 3: children are INDICES)
const root = json.scenes?.[json.scene ?? 0]?.nodes ?? [];
const stack = [...root];
const seen = new Set();
while (stack.length) {
  const ni = stack.pop();
  if (ni === undefined || seen.has(ni)) continue;
  seen.add(ni);
  const n = nodes[ni];
  if (n.children) for (const c of n.children) stack.push(c);
  if (n.mesh === undefined) continue; // pitfall 3b: index 0 is falsy
  meshCount++;
  const m = meshes[n.mesh];
  const t = n.translation ?? [0, 0, 0];
  for (const prim of m.primitives) {
    const posAcc = accs[prim.attributes.POSITION];
    const bv = views[posAcc.bufferView];
    const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + 8; // chunk header
    const min = posAcc.min, max = posAcc.max;
    // baked translation (pitfall 4: merged buckets bake translations)
    const wmin = [min[0] + t[0], min[1] + t[1], min[2] + t[2]];
    const wmax = [max[0] + t[0], max[1] + t[1], max[2] + t[2]];
    for (let i = 0; i < 3; i++) {
      gMin[i] = Math.min(gMin[i], wmin[i]);
      gMax[i] = Math.max(gMax[i], wmax[i]);
    }
    perMesh.push({
      node: n.name ?? `(node ${ni})`,
      mat: mats[prim.material]?.name ?? "?",
      min: wmin.map((v) => +v.toFixed(3)),
      max: wmax.map((v) => +v.toFixed(3)),
      count: posAcc.count,
      _off: off,
    });
  }
}
console.log("mesh-bearing nodes (walk):", meshCount);
console.log("GLOBAL bbox min:", gMin.map((v) => +v.toFixed(4)));
console.log("GLOBAL bbox max:", gMax.map((v) => +v.toFixed(4)));
console.log("size:", [gMax[0] - gMin[0], gMax[1] - gMin[1], gMax[2] - gMin[2]].map((v) => +v.toFixed(4)));

// rod zone probe: rod runs butt(1.18,0.59,-0.76) -> tip(1.93,2.78,-1.02); line to bobber(2.6,0.28,-1.9)
// dark-material bucket verts in the rod corridor: x in [1.0,2.1], y in [0.5,2.9], z in [-1.2,-0.6]
let rodVerts = 0, lineVerts = 0, brassHigh = 0;
for (const pm of perMesh) {
  if (pm.mat !== "dark" && pm.mat !== "brass") continue;
  const accIdx = meshes[nodes.find((n, i) => (n.name ?? "") === pm.node)?.mesh] ? null : null; // not needed; re-read raw
}
// simpler: raw vertex scan over all accessors for the zones (merged buckets: count verts in zone per material via primitives)
// We'll scan each mesh primitive's POSITION accessor raw bytes if not DRACO:
const isDraco = json.extensionsRequired?.includes("KHR_draco_mesh_compression");
console.log("draco:", !!isDraco);
if (!isDraco) {
  for (const m of meshes) {
    for (const prim of m.primitives) {
      const posAcc = accs[prim.attributes.POSITION];
      const bv = views[posAcc.bufferView];
      const base = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + 8;
      const matName = mats[prim.material]?.name ?? "?";
      for (let i = 0; i < posAcc.count; i++) {
        const o = base + i * 12;
        const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
        if (matName === "dark" && x >= 1.0 && x <= 2.1 && y >= 0.5 && y <= 2.9 && z >= -1.2 && z <= -0.6) rodVerts++;
        if (x >= 1.9 && x <= 2.7 && y >= 0.15 && y <= 0.45 && z >= -2.0 && z <= -1.7) {
          if (matName === "brass") brassHigh++;
        }
        if (x >= 1.9 && x <= 2.66 && y >= 0.2 && y <= 2.8 && z >= -2.0 && z <= -0.9) {
          if (matName === "brass" || matName === "dark") lineVerts++;
        }
      }
    }
  }
  console.log("rod-zone dark verts (butt->tip corridor):", rodVerts);
  console.log("bobber-zone brass verts:", brassHigh);
  console.log("line/bobber corridor dark+brass verts:", lineVerts);
}
for (const pm of perMesh.slice(0, 12)) console.log(JSON.stringify(pm));
