// p342-decode.ts — polish-342 candidate decode audit: prove the cap
// articulation landed — steepened roof (same counts, taller y extent),
// collar bead (+42 verts x8 lamps = +336), finial widened/re-based (same
// counts, new locus), 0 non-finite, both emissive materials untouched.
// Usage: bun agents/arthur/p342-decode.ts <candidate.glb> <baseline.glb>
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
  let maxY = -Infinity, minY = Infinity;
  // cap band vert census (all caps across the 8 lamps): y 2.66..3.07 near ring r~10
  let roofBand = 0, collarBand = 0, finBand = 0;
  const lampXY = [20, 70, 110, 160, 200, 250, 290, 340].map(d => {
    const a = (d * Math.PI) / 180; return [Math.cos(a) * 10, Math.sin(a) * 10];
  });
  for (const n of json.nodes ?? []) {
    nodes++;
    if (n.mesh === undefined) continue;
    for (const prim of json.meshes[n.mesh].primitives) {
      meshPrims++;
      const pa = json.accessors[prim.attributes.POSITION];
      const arr = f32(pa);
      for (let i = 0; i < pa.count; i++) {
        const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
        totalVerts++;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) nonFinite++;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (y >= 2.66 && y <= 3.07) {
          // near one of the lamp axes (within 0.25 lateral)
          for (const [lx, lz] of lampXY) {
            if (Math.hypot(x - lx, z - lz) < 0.25) {
              if (y <= 2.9085) roofBand++;
              else if (y <= 2.9325) collarBand++;
              else finBand++;
              break;
            }
          }
        }
      }
    }
  }
  const emissives = (json.materials ?? []).map((m: any) => ({
    name: m.name,
    factor: m.emissiveFactor ?? null,
    intensity: m.emissiveStrength ?? 1,
    hasTex: !!m.emissiveTexture,
  })).sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
  return { nodes, meshPrims, materials: json.materials?.length ?? 0, totalVerts, nonFinite, minY, maxY, roofBand, collarBand, finBand, emissives };
}

const cand = decode(process.argv[2] ?? "");
const base = decode(process.argv[3] ?? "");
const dVerts = cand.totalVerts - base.totalVerts;
const report = {
  candidate: cand, baseline: base, deltaVerts: dVerts,
  emissivesIdentical: JSON.stringify(cand.emissives) === JSON.stringify(base.emissives),
};
console.log(JSON.stringify(report, null, 1));
const ok = cand.nonFinite === 0
  // collar bead = CylinderGeometry(0.055, 0.068, 0.035, 8) = 52 verts x8 lamps
  // (empirically derived from three.js; first draft guessed 42 and failed RED)
  && dVerts === 416
  && cand.collarBand > 0 && base.collarBand === 0
  && cand.maxY > base.maxY && Math.abs(cand.maxY - 3.06) < 0.01
  && JSON.stringify(cand.emissives) === JSON.stringify(base.emissives)
  && cand.materials === base.materials && cand.nodes === base.nodes;
console.log(ok ? "P342_DECODE_PASS" : "P342_DECODE_FAIL");
process.exit(ok ? 0 : 1);
