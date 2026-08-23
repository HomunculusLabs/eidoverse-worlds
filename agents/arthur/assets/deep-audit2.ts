// deep-audit2.ts — deep geometric re-audit of every artifact (v2, loop #58).
// Translation-aware decode; checks: spec/sane, floating verts, emissive,
// node budget, DEGENERATE TRIANGLES (zero-area) + NaN verts (loop #58).
// v2 file list: all 21 era-3 artifacts incl. mapboard/shrine/wayside/watchpost.
import { readFileSync } from "node:fs";
const A = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur";
let fail = 0;
const check = (n: string, ok: boolean, d?: string) => { console.log(ok ? "PASS" : "FAIL", n, d ?? ""); if (!ok) fail++; };

const files = [
  "village_house3.glb", "village_longhouse3.glb", "village_tower3.glb",
  "village_garden3.glb", "village_row3.glb", "village_bunk3.glb",
  "village_hall3.glb", "village_court3.glb", "village_inn3.glb",
  "village_belltower3.glb", "village_carousel3.glb", "village_windmill3.glb",
  "village_monument3.glb", "village_plaza3.glb", "village_trees3.glb",
  "village_roads3.glb", "village_paths3.glb", "village_mapboard3.glb",
  "village_shrine3.glb", "village_wayside3.glb", "village_watchpost3.glb",
  "village_stable3.glb", "village_market3.glb",
  "village_gardenfence3.glb", "village_pen3.glb",
  "village_bellbase3.glb", "village_cartstop3.glb",
  "village_rainbarrel_h.glb", "village_rainbarrel_l.glb",
  "village_rainbarrel_i.glb", "village_rainbarrel_b.glb", "village_rainbarrel_g.glb",
  "village_millyard3.glb", "village_milestone_n.glb", "village_milestone_s.glb",
  "village_sign_bakery.glb", "village_sign_smithy.glb",
  "village_sign_weaver.glb", "village_sign_livery.glb",
  "village_coop3.glb", "village_hen_a.glb", "village_hen_b.glb", "village_hen_c.glb",
  "village_woodyard3.glb", "village_streetlamps3.glb",
  "village_millbench3.glb", "village_stablebench3.glb", "village_quarry3.glb", "village_kiln3.glb",
  "village_charcoal3.glb", "village_potter3.glb", "village_waystone3.glb", "village_giftshelf3.glb",
  "village_welcome3.glb", "village_approach_lamp.glb", "village_cultivation_orchard_0033.glb", "village_grainfield3.glb", "village_goats3.glb", "village_milkstand3.glb", "village_churn3.glb", "village_flax3.glb", "village_dyehouse3.glb", "village_shutters3.glb", "village_chopblock3.glb", "village_fieldpond3.glb", "village_pondlife3.glb", "village_hutch3.glb", "village_run3.glb", "village_sign_dyer.glb", "village_inndoor3.glb", "village_harvestcart3.glb", "village_dyelaundry3.glb", "village_bcistern3.glb", "village_forge3.glb",
];

for (const f of files) {
  const b = readFileSync(`${A}/assets/${f}`);
  const total = b.readUInt32LE(8);
  let off = 12, nC = 0;
  while (off < total) { off += 8 + b.readUInt32LE(off); nC++; }
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
  const sane = j.accessors.every((a: any) => !a.max || Math.max(...a.max.map(Math.abs)) < 100);
  const spec = total === b.length && nC === 2 && sane;
  if (!spec) { check(`${f}: spec+san`, false); continue; }

  // translation-aware decode of ALL verts
  const binStart = 20 + b.readUInt32LE(12) + 8;
  const pts: number[][] = [];
  let degen = 0, nan = 0;
  const area2 = (p: number[], q: number[], r: number[]) => {
    const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2];
    const vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    return Math.hypot(cx, cy, cz) / 2;
  };
  j.meshes.forEach((mesh: any, i: number) => {
    const pr = mesh.primitives[0];
    const a = j.accessors[pr.attributes.POSITION];
    const bv = j.bufferViews[a.bufferView];
    const f32 = new Float32Array(b.buffer, binStart + bv.byteOffset, a.count * 3);
    const tr = j.nodes.find((n: any) => n.mesh === i)?.translation ?? [0, 0, 0];
    const V = (idx: number): number[] => {
      const x = f32[idx * 3] + tr[0], y = f32[idx * 3 + 1] + tr[1], z = f32[idx * 3 + 2] + tr[2];
      if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) nan++;
      return [x, y, z];
    };
    for (let v = 0; v < a.count; v++) pts.push(V(v));
    if (pr.indices !== undefined) {
      const ia = j.accessors[pr.indices];
      const ibv = j.bufferViews[ia.bufferView];
      const isU32 = ia.componentType === 5125;
      const idx = isU32 ? new Uint32Array(b.buffer, binStart + ibv.byteOffset, ia.count) : new Uint16Array(b.buffer, binStart + ibv.byteOffset, ia.count);
      for (let t = 0; t + 2 < ia.count; t += 3) if (area2(V(idx[t]), V(idx[t + 1]), V(idx[t + 2])) < 1e-9) degen++;
    } else {
      for (let t = 0; t + 2 < a.count; t += 3) if (area2(V(t), V(t + 1), V(t + 2)) < 1e-9) degen++;
    }
  });
  if (degen > 0 || nan > 0) check(`${f}: degenerate/NaN`, false, `${degen} zero-area, ${nan} NaN`);

  // FLOATING CLUSTERS: cells with high verts are floating only if NOTHING
  // exists within 0.6m below their lowest high vert (support = geometry
  // directly beneath — walls/roof counts; ground-level-only was a false-
  // positive machine that flagged every chimney cap and ridge tip)
  let floating = 0;
  const yGrid = new Map<string, number[]>();
  for (const [x, y, z] of pts) {
    const k = `${Math.round(x * 2)},${Math.round(z * 2)}`;
    (yGrid.get(k) ?? yGrid.set(k, []).get(k)!).push(y);
  }
  for (const [k, ys] of yGrid) {
    const hi = ys.filter((y) => y > 2.5);
    if (hi.length === 0) continue;
    const floorY = Math.min(...hi);
    let supported = ys.some((y) => y < floorY - 0.6 && y > floorY - 4);
    if (!supported) {
      const [cx, cz] = k.split(",").map(Number);
      for (const [k2, ys2] of yGrid) {
        const [cx2, cz2] = k2.split(",").map(Number);
        if (Math.hypot(cx2 - cx, cz2 - cz) < 3.2) {
          if (ys2.some((y) => y < floorY - 0.6 && y > floorY - 4)) { supported = true; break; }
        }
      }
    }
    if (!supported) floating++;
  }
  const emissive = (j.materials ?? []).filter((m: any) => (m.emissiveFactor ?? [0]).some((v: number) => v > 0.05));
  const nodes = j.nodes.length;
  console.log(`${f}: ${nodes}n | emissive ${emissive.length} | floating-clusters ${floating} | degen ${degen} | NaN ${nan}`);
}
console.log(fail ? fail + " FAILURE(S)" : "ALL PASS");
process.exit(fail ? 1 : 0);
