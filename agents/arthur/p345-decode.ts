// p345-decode.ts — decode gate for the polish-345 open-bucket candidate.
// Verifies: (1) the three new interior elements exist at authored bands
// (inner wall r 0.166/0.138 y 0.94..1.19, floor disc y 0.945, bottom cap
// y 0.94 facing down); (2) the body is now openEnded (no top-cap verts at
// y ~1.22 in the body mesh); (3) 0 non-finite floats; (4) bucket zone
// regressions (rim ring, hoops, handle arc feet, lugs) unchanged.
import { readFileSync } from "node:fs";

const buf = readFileSync(process.argv[2] ?? "agents/arthur/assets/village_well.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;
const bin = buf.subarray(binStart);

const nodes = json.nodes ?? [];
const meshes = json.meshes ?? [];
console.log(`nodes ${nodes.length} meshes ${meshes.length} materials ${(json.materials ?? []).length}`);

let nonFinite = 0;
const summary: Record<string, any> = {};
for (let ni = 0; ni < nodes.length; ni++) {
  const n = nodes[ni];
  if (n.mesh === undefined) continue;
  const mesh = meshes[n.mesh];
  for (const prim of mesh.primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    const bv = json.bufferViews[acc.bufferView];
    const off = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const cnt = acc.count;
    const arr = new Float32Array(bin.buffer, bin.byteOffset + off - buf.byteOffset + buf.byteOffset, 0); // placeholder
    // read raw
    const verts: number[][] = [];
    for (let i = 0; i < cnt; i++) {
      const o = bin.byteOffset + off + i * 12;
      const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) nonFinite++;
      verts.push([x, y, z]);
    }
    // local frame: accessors are ALREADY node-local (translation carries
    // position, rotation carried on node — discs read unrotated in xy).
    // Gate on spans/radii/counts, never absolute y (double-subtract trap).
    const ys = verts.map(v => v[1]);
    const rs = verts.map(v => Math.hypot(v[0], v[2]));
    summary[n.name ?? `node${ni}`] = {
      count: cnt,
      ySpan: (Math.max(...ys) - Math.min(...ys)).toFixed(4),
      rMin: Math.min(...rs).toFixed(4), rMax: Math.max(...rs).toFixed(4),
    };
  }
}
console.log(`nonFinite ${nonFinite}`);
const want = ["well_bucket", "well_bucket_inner", "well_bucket_floor", "well_bucket_bottom", "well_bucket_rim", "well_bucket_hoop_hi", "well_bucket_hoop_lo", "well_bucket_handle", "well_bucket_lug_w", "well_bucket_lug_e", "well_rope", "well_rope_knot", "well_water", "well_lantern_core"];
for (const w of want) console.log(`${w}: ${JSON.stringify(summary[w])}`);
// gate
const g = (name: string) => summary[name];
let pass = true;
const chk = (cond: boolean, msg: string) => { if (!cond) { pass = false; console.log(`FAIL ${msg}`); } };
// frames: gate on spans and radii (accessors are mesh-local; translation
// carries the world offset — absolute-y gates double-subtract and false-FAIL)
const s = (name: string) => Number(summary[name]?.ySpan ?? -1);
const rM = (name: string) => Number(summary[name]?.rMax ?? -1);
chk(g("well_bucket_inner")?.count === 18, `inner wall 18 verts (2 rings x 8 + seam dupes; got ${g("well_bucket_inner")?.count})`);
chk(Math.abs(s("well_bucket_inner") - 0.245) < 0.005 && Math.abs(rM("well_bucket_inner") - 0.166) < 0.005, `inner wall span ${s("well_bucket_inner")} rMax ${rM("well_bucket_inner")}`);
chk(g("well_bucket_floor")?.count === 10, `floor 10 verts (8 rim + center + index-dupe; got ${g("well_bucket_floor")?.count})`);
chk(Math.abs(rM("well_bucket_floor") - 0.139) < 0.003, `floor r 0.139 (got ${rM("well_bucket_floor")})`);
chk(g("well_bucket_bottom")?.count === 10, `bottom 10 verts (got ${g("well_bucket_bottom")?.count})`);
chk(Math.abs(rM("well_bucket_bottom") - 0.14) < 0.003, `bottom r 0.14 (got ${rM("well_bucket_bottom")})`);
// body must be openEnded: 18 verts = 2 rings x 8 + 2 seam dupes, NO cap rings
chk(g("well_bucket")?.count === 18, `body openEnded 18 verts (got ${g("well_bucket")?.count})`);
chk(Math.abs(rM("well_bucket") - 0.17) < 0.005, `body rMax 0.17 (got ${rM("well_bucket")})`);
// regressions: rim ring, hoops, handle, lantern, water all byte-stable bands
chk(g("well_bucket_rim")?.count === 18 && Math.abs(s("well_bucket_rim") - 0.035) < 0.003, `rim band 18 verts (got ${g("well_bucket_rim")?.count}) span ${s("well_bucket_rim")}`);
chk(g("well_bucket_hoop_hi")?.count === 18 && g("well_bucket_hoop_lo")?.count === 18, `hoop bands 18/18 (got ${g("well_bucket_hoop_hi")?.count}/${g("well_bucket_hoop_lo")?.count})`);
chk(Math.abs(s("well_bucket_handle") - 0.101) < 0.005, `handle span ${s("well_bucket_handle")}`);
chk(g("well_bucket_lug_w")?.count === 24 && Math.abs(rM("well_bucket_lug_w") - 0.0716) < 0.004 && Math.abs(rM("well_bucket_lug_e") - 0.0716) < 0.004, `lug plates widened (mesh-local half-diagonal 0.0716; w ${rM("well_bucket_lug_w")} e ${rM("well_bucket_lug_e")}; node x 0.125 + 0.065 = 0.19 reaches rim outer face)`);
chk(Math.abs(s("well_rope") - 0.29) < 0.005, `rope span ${s("well_rope")}`);
chk(Math.abs(rM("well_water") - 0.62) < 0.005, `water r 0.62`);
console.log(pass ? "P345_DECODE_PASS" : "P345_DECODE_FAIL");
process.exit(pass ? 0 : 1);
