// improve26-lane-overlap.ts — exact decode-vs-decode obstruction analysis:
// hamlet-0041 fixed build (caa851af, world-frame corners from decode) vs
// nx-approach-ne-lane-002 committed pin (dc52264c, pos (0,0,0) yaw 0 —
// world == local frame by construction). Both entities at yaw 0/known yaw in
// the SAME world coordinate space: lane local coords ARE world coords.
// Probe-discipline 0b applied: bbox overlap is NOT an obstruction test.
import { readFileSync } from "node:fs";

function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
  let binHdr = 20 + jsonLen; binHdr = (binHdr + 3) & ~3;
  const binHdrLen = dv.getUint32(binHdr, true);
  if (dv.getUint32(binHdr + 4, true) !== 0x004e4942) throw Error(`BIN magic at ${binHdr}`);
  const base0 = binHdr + 8;
  const meshes = json.meshes ?? [];
  const nodes = json.nodes ?? [];
  const out: { node: string; verts: [number, number, number][] }[] = [];
  for (const node of nodes) {
    if (node.mesh === undefined) continue;
    const mesh = meshes[node.mesh];
    if (!mesh) continue;
    const t = node.translation ?? [0, 0, 0];
    for (const prim of mesh.primitives) {
      const posAcc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[posAcc.bufferView];
      const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
      const n = posAcc.count;
      const verts: [number, number, number][] = [];
      for (let i = 0; i < n; i++) {
        const o = base0 + off + i * 12;
        verts.push([
          dv.getFloat32(o, true) + t[0],
          dv.getFloat32(o + 4, true) + t[1],
          dv.getFloat32(o + 8, true) + t[2],
        ]);
      }
      out.push({ node: node.name ?? `#${nodes.indexOf(node)}`, verts });
    }
  }
  return { json, buckets: out };
}

// ---- hamlet: local frame, yaw -2.35619449, pos (46.632895, 74.628232) ----
const H = decodeGLB("agents/arthur/mason/glb-retex/work_1661_hamlet.glb");
const PX = 46.632895, PZ = 74.628232, YAW = -2.35619449;
const hc = Math.cos(YAW), hs = Math.sin(YAW);
const ham: [number, number, number][] = [];
for (const b of H.buckets) for (const [x, y, z] of b.verts)
  ham.push([PX + x * hc + z * hs, y, PZ - x * hs + z * hc]);

// ---- lane: pos (0,0,0) yaw 0 — local == world ----
const L = decodeGLB("agents/arthur/assets/village_ne_approach2.glb");
const lane: { node: string; verts: [number, number, number][] }[] = L.buckets;

// lane solid-set envelope in the hamlet zone (x 39-54.6, z 67-82.3)
let zoneMinY = Infinity, zoneMaxY = -Infinity;
const inZone: [number, number, number][] = [];
for (const b of lane) {
  for (const [x, y, z] of b.verts) {
    if (x > 39 && x < 54.6 && z > 67 && z < 82.3) { inZone.push([x, y, z]); zoneMinY = Math.min(zoneMinY, y); zoneMaxY = Math.max(zoneMaxY, y); }
  }
}
console.log(JSON.stringify({
  laneNodes: L.buckets.map(b => b.node),
  laneVertsInHamletZone: inZone.length,
  zoneMinY: +zoneMinY.toFixed(3), zoneMaxY: +zoneMaxY.toFixed(3),
}));
// which lane nodes contribute verts in the zone
for (const b of lane) {
  const c = b.verts.filter(([x, , z]) => x > 39 && x < 54.6 && z > 67 && z < 82.3);
  if (c.length) console.log(`lane node ${b.node}: ${c.length} verts in zone, y ${Math.min(...c.map(v => v[1])).toFixed(3)}..${Math.max(...c.map(v => v[1])).toFixed(3)}`);
}
// hamlet solid-set in the SAME zone (world frame)
let hzMinY = Infinity, hzMaxY = -Infinity, hzCount = 0;
for (const [x, y, z] of ham) if (x > 39 && x < 54.6 && z > 67 && z < 82.3) { hzCount++; hzMinY = Math.min(hzMinY, y); hzMaxY = Math.max(hzMaxY, y); }
console.log(JSON.stringify({ hamletVertsInZone: hzCount, hzMinY: +hzMinY.toFixed(3), hzMaxY: +hzMaxY.toFixed(3) }));
