// p343-decode.ts — polish-343 candidate decode audit: prove the pane recess
// landed — cage bars moved from corner offset ±0.075 to ±0.095 so the glass
// faces (±0.075) sit BEHIND the bar inner faces (±0.0825).
// Probe laws applied: (a) classify by material NAME (both materials carry
// emissiveFactor — the iron night-sheen — so emissive-presence cannot
// discriminate; p314 lane law); (b) box verts exist ONLY at their end planes
// (bars y 2.36/2.63; glass y 2.36/2.62 — test each box's OWN planes); (c)
// the 0.02 shift is smaller than the 0.025 bar width, so middle shells
// overlap — discriminate with UNAMBIGUOUS shells only: beyond-old
// (max(dx,dz) ≥ 0.0950: impossible in the old build whose max is 0.0875)
// and inner-old (both ≤ 0.0630: the old bars' inner corners at 0.0625,
// impossible in the new build whose min is 0.0825).
// Gates: candidate beyondOld 640 (20 verts/bar × 4 × 8) & innerOld 0;
// baseline beyondOld 0 & innerOld 192 (6 verts/bar × 4 × 8) — the probe
// discriminates; glass 192 verts (24/lamp at its own two planes) extent
// 0.075 untouched; emissives + node/mesh/material counts identical;
// 0 non-finite.
// Usage: bun agents/arthur/p343-decode.ts <candidate.glb> <baseline.glb>
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
        // this vert's box end-planes: bars (iron, y 2.36/2.63), glass (2.36/2.62)
        const onBarPlane = near(y, 2.36) || near(y, 2.63);
        const onGlassPlane = near(y, 2.36) || near(y, 2.62);
        if (!onBarPlane && !onGlassPlane) continue;
        for (const [lx, lz] of lampXY) {
          if (Math.hypot(x - lx, z - lz) < 0.3) {
            const dx = Math.abs(x - lx), dz = Math.abs(z - lz);
            if (isGlass && onGlassPlane) {
              glassVerts++;
              glassMaxAbs = Math.max(glassMaxAbs, dx, dz);
            } else if (isIron && onBarPlane && dx >= 0.055 && dz >= 0.055) {
              // head-zone iron at the bar planes in the corner region only
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
  return { nodes, meshPrims, materials: json.materials?.length ?? 0, totalVerts, nonFinite, maxY, beyondOld, innerOld, glassVerts, glassMaxAbs, emissives };
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
  && report.deltaVerts === 0
  // the move: candidate bars reach the new outer plane; baseline cannot.
  // Empirical multiset (dumped, not modeled): per bar per plane THREE emits
  // 12 verts = 4 corners x 3 face-duplicates; max-coord corners are 3 of 4
  // patterns -> 36/plane -> 72/lamp -> 576 across 8 lamps.
  && cand.beyondOld === 576 && base.beyondOld === 0
  // and the old flush inner corners are gone (24/lamp -> 192 in baseline)
  && cand.innerOld === 0 && base.innerOld === 192
  // glass box untouched: 24 verts/lamp x 8 at extent 0.075
  && cand.glassVerts === 192 && Math.abs(cand.glassMaxAbs - 0.075) < 0.003
  && Math.abs(cand.maxY - 3.06) < 0.01
  && JSON.stringify(cand.emissives) === JSON.stringify(base.emissives)
  && cand.materials === base.materials && cand.nodes === base.nodes;
console.log(ok ? "P343_DECODE_PASS" : "P343_DECODE_FAIL");
process.exit(ok ? 0 : 1);
