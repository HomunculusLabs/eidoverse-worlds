// p344-decode.ts — polish-344 candidate decode audit: prove the cage base
// plate landed — iron plate 0.25 sq x 0.04 @ y 2.35 (planes 2.33/2.37)
// seating the bar feet that polish-343's outward move left in open air.
// Probe laws applied (p343 lineage): (a) classify by material NAME (both
// materials carry emissiveFactor); (b) box verts exist ONLY at their end
// planes — the plate's planes y 2.33/2.37 are unique in the anatomy (post
// ends 2.30, collar planes 2.29/2.36, glass 2.36/2.62, bars 2.36/2.63, all
// >3mm away), so any iron vert at 2.33/2.37 within the plate envelope
// (|dx|,|dz| <= 0.127) is plate geometry and nothing else; (c) empirical
// box multiset: 24 verts/box (12/plane) -> 8 plates = 192.
// Gates: candidate plateVerts 192 & baseline 0 (probe discriminates);
// deltaVerts +192 exact; p343 bar gates still hold in the candidate
// (beyondOld 576 / innerOld 0 — plate planes do not touch the bar-plane
// filter); glass 192 verts extent 0.075 untouched; maxY 3.06; nodes/meshes/
// materials/emissives identical; 0 non-finite.
// Usage: bun agents/arthur/p344-decode.ts <candidate.glb> <baseline.glb>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function decode(path: string) {
  const GLB = readFileSync(resolve(path));
  const dv = new DataView(GLB.buffer, GLB.byteOffset, GLB.byteLength);
  let off = 12; const chunks: Record<string, Uint8Array> = {};
  while (off < GLB.byteLength) {
    const len = dv.getUint32(off, true); const typ = dv.getUint32(off + 4, true);
    const id = String.fromCharCode(typ & 255, (typ >> 8) & 255, (typ >> 16) & 255, (typ >> 24) & 255);
    chunks[id.replace(/[^A-Z]/g, "")] = GLB.subarray(off + 8, off + 8 + len); off += 8 + len;
  }
  const json = JSON.parse(new TextDecoder().decode(chunks.JSON!));
  const bin = chunks.BIN!;
  const f32 = (a: any) => {
    const bv = json.bufferViews[a.bufferView];
    const o = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    return new Float32Array(bin.buffer, bin.byteOffset + o, a.count * 3);
  };
  let nodes = 0, meshPrims = 0, nonFinite = 0, totalVerts = 0;
  let maxY = -Infinity;
  let plateVerts = 0;
  let beyondOld = 0, innerOld = 0;
  let glassVerts = 0, glassMaxAbs = 0;
  const lampXY = [20, 70, 110, 160, 200, 250, 290, 340].map(d => {
    const a = (d * Math.PI) / 180; return [Math.cos(a) * 10, Math.sin(a) * 10];
  });
  const near = (y: number, t: number) => Math.abs(y - t) < 0.003;
  for (const n of json.nodes ?? []) {
    nodes++;
    if (n.mesh === undefined) continue;
    for (const prim of json.meshes[n.mesh].primitives) {
      meshPrims++;
      const pa = json.accessors[prim.attributes.POSITION];
      const arr = f32(pa);
      const mat = String(json.materials?.[prim.material]?.name ?? "");
      const isGlass = mat === "glow1";
      const isIron = mat === "iron";
      for (let i = 0; i < pa.count; i++) {
        const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
        totalVerts++;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) nonFinite++;
        if (y > maxY) maxY = y;
        const onPlatePlane = near(y, 2.33) || near(y, 2.37);
        const onBarPlane = near(y, 2.36) || near(y, 2.63);
        const onGlassPlane = near(y, 2.36) || near(y, 2.62);
        for (const [lx, lz] of lampXY) {
          if (Math.hypot(x - lx, z - lz) < 0.3) {
            const dx = Math.abs(x - lx), dz = Math.abs(z - lz);
            if (isIron && onPlatePlane && dx <= 0.127 && dz <= 0.127) plateVerts++;
            if (isGlass && onGlassPlane) {
              glassVerts++;
              glassMaxAbs = Math.max(glassMaxAbs, dx, dz);
            } else if (isIron && onBarPlane && dx >= 0.055 && dz >= 0.055) {
              if (Math.max(dx, dz) >= 0.0950) beyondOld++;
              if (dx <= 0.0630 && dz <= 0.0630) innerOld++;
            }
            break;
          }
        }
      }
    }
  }
  const emissives = (json.materials ?? []).map((m: any) => ({
    name: m.name, factor: m.emissiveFactor ?? null, hasTex: !!m.emissiveTexture,
  })).sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
  return { nodes, meshPrims, materials: json.materials?.length ?? 0, totalVerts, nonFinite, maxY, plateVerts, beyondOld, innerOld, glassVerts, glassMaxAbs, emissives };
}

const cand = decode(process.argv[2] ?? "");
const base = decode(process.argv[3] ?? "");
const report = {
  candidate: cand, baseline: base,
  deltaVerts: cand.totalVerts - base.totalVerts,
  emissivesIdentical: JSON.stringify(cand.emissives) === JSON.stringify(base.emissives),
};
console.log(JSON.stringify(report, null, 1));
const ok = cand.nonFinite === 0
  && report.deltaVerts === 192
  && cand.plateVerts === 192 && base.plateVerts === 0
  // p343 bar gates still hold (plate planes don't touch the bar filter)
  && cand.beyondOld === 576 && base.beyondOld === 576
  && cand.innerOld === 0 && base.innerOld === 0
  // glass box untouched: 24 verts/lamp x 8 at extent 0.075
  && cand.glassVerts === 192 && Math.abs(cand.glassMaxAbs - 0.075) < 0.003
  && Math.abs(cand.maxY - 3.06) < 0.01
  && JSON.stringify(cand.emissives) === JSON.stringify(base.emissives)
  && cand.materials === base.materials && cand.nodes === base.nodes
  && cand.meshPrims === base.meshPrims;
console.log(ok ? "P344_DECODE_PASS" : "P344_DECODE_FAIL");
process.exit(ok ? 0 : 1);
