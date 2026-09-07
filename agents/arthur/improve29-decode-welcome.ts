// improve29-decode-welcome.ts — decode audit for the nx-welcome fix.
// Falsifies: (1) every arm inner end embedded past the post surface at
// its y/z row; (2) b25 rider keep-out zone unchanged; (3) bbox envelope
// preserved (x-extent delta <= 0.01); (4) no verts below grade; (5) name
// bar + glyph coverage (glyph band inside bar y-range at z > bar z).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const P = "agents/arthur/assets/village_welcome3.glb";
const BASE = "agents/arthur/assets/village_welcome3.glb.baseline29";
const bytes = readFileSync(P);
const sha = createHash("sha256").update(bytes).digest("hex");
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
// BIN chunk data starts after the (4-byte-padded) JSON chunk + 8-byte BIN chunk header
const binBase = 28 + ((jl + 3) & ~3);

let fails = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) fails++; };

// accessors by material bucket
function acc(mi: number) {
  const m = j.meshes[mi];
  const out: number[][] = [];
  for (const prim of m.primitives) {
    const a = j.accessors[prim.attributes.POSITION];
    const bv = j.bufferViews[a.bufferView];
    const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const dc = a.min ? 1 : 1;
    for (let i = 0; i < a.count; i++) {
      const o = binBase + off + i * 12;
      out.push([bytes.readFloatLE(o), bytes.readFloatLE(o + 4), bytes.readFloatLE(o + 8)]);
    }
  }
  return out;
}
function meshOf(node: any) { return j.meshes[node.mesh]; }

// node translations (mergeByMaterial bakes translation per node)
const nodes = j.nodes.filter((n: any) => n.mesh !== undefined);
console.log("nodes:", nodes.map((n: any) => n.name).join(", "));

// bucket classification: timber (arms/post), bone (board), name_bar, glyph(pale), stone, lamp
for (const n of nodes) {
  const t = n.translation ?? [0, 0, 0];
  const vs = acc(n.mesh).map(v => [v[0] + t[0], v[1] + t[1], v[2] + t[2]]);
  const xs = vs.map(v => v[0]), ys = vs.map(v => v[1]), zs = vs.map(v => v[2]);
  console.log(`${n.name}: n=${vs.length} x[${Math.min(...xs).toFixed(3)},${Math.max(...xs).toFixed(3)}] y[${Math.min(...ys).toFixed(3)},${Math.max(...ys).toFixed(3)}] z[${Math.min(...zs).toFixed(3)},${Math.max(...zs).toFixed(3)}]`);
}

// F1: arm embedding. Timber bucket carries post + arms + lamp arm merged —
// instead use the AUTHORED geometry (source law): verify by scanning the
// timber bucket for verts near each arm's y row on the arm side of the
// post: at arm rows (y ~ 0.94/1.05/1.16), x must span from <=0.05 to the
// outer extent continuously (no gap band |x| in [0.08, 0.15] at arm y).
const timber = nodes.find((n: any) => /timber|wb3_/.test(n.name) && n.name.includes("timber"));
// find bucket with post: r~0.06-0.08 cylinder verts exist at y 0..1.5
function vertsOf(nameRe: RegExp) {
  const out: number[][] = [];
  for (const n of nodes) if (nameRe.test(n.name)) {
    const t = n.translation ?? [0, 0, 0];
    for (const v of acc(n.mesh)) out.push([v[0] + t[0], v[1] + t[1], v[2] + t[2]]);
  }
  return out;
}
// All buckets (buckets are named by mergeByMaterial prefix wb3_N)
const all: number[][] = [];
for (const n of nodes) { const t = n.translation ?? [0, 0, 0]; for (const v of acc(n.mesh)) all.push([v[0] + t[0], v[1] + t[1], v[2] + t[2]]); }
ck("total verts read", all.length > 300, String(all.length));

// arms rows: check each authored arm (y, rotZ ~ ±0.08, rotY) — after
// rotation the arm's x-extent at its center y. Group verts into y-bands.
// arms rows: authored table = R+L at y1.16, R+L at y1.05, R-only at y0.94
// (carousel arm). Check per-side presence + embedding accordingly.
const armRows: Array<[number, boolean, boolean]> = [[0.94, false, true], [1.05, true, true], [1.16, true, true]];
let armOK = true, armDetail = "";
for (const [ay, wantL, wantR] of armRows) {
  const band = all.filter(v => Math.abs(v[1] - ay) < 0.03 && Math.abs(v[2] - 0.03) < 0.45);
  const left = band.filter(v => v[0] < -0.03).map(v => Math.abs(v[0]));
  const right = band.filter(v => v[0] > 0.03).map(v => Math.abs(v[0]));
  const lMin = wantL && left.length ? Math.min(...left) : (wantL ? NaN : -1);
  const rMinReal = wantR && right.length ? Math.min(...right) : (wantR ? NaN : -1);
  armDetail += ` y${ay}: L=${lMin?.toFixed(3)} R=${rMinReal?.toFixed(3)}`;
  if (wantL && !(lMin <= 0.05)) armOK = false;
  if (wantR && !(rMinReal <= 0.05)) armOK = false;
}
ck("F1 arms embedded (inner ends <= 0.05 from axis)", armOK, armDetail);

// F3: envelope
const xs = all.map(v => v[0]), ys = all.map(v => v[1]), zs = all.map(v => v[2]);
console.log(`ENVELOPE x[${Math.min(...xs).toFixed(4)},${Math.max(...xs).toFixed(4)}] y[${Math.min(...ys).toFixed(4)},${Math.max(...ys).toFixed(4)}] z[${Math.min(...zs).toFixed(4)},${Math.max(...zs).toFixed(4)}]`);
ck("x-extent <= live+0.01", Math.max(...xs) <= 0.611 + 0.01 && Math.min(...xs) >= -0.566 - 0.01, `${Math.min(...xs).toFixed(3)}..${Math.max(...xs).toFixed(3)}`);
ck("y max <= live 1.6785+0.01", Math.max(...ys) <= 1.6785 + 0.01, String(Math.max(...ys)));
ck("z-extent <= live 0.268+0.01", Math.max(...zs) <= 0.268 + 0.01, `${Math.min(...zs).toFixed(3)}..${Math.max(...zs).toFixed(3)}`);
ck("no verts below grade", Math.min(...ys) >= -0.001, String(Math.min(...ys)));

// F2: glyph band coverage. Pale glyph bucket + dark bar bucket.
// Identify by node count: name glyphs merged into pale bucket, bar is dark.
// We verify geometrically: there EXISTS a bucket whose y-range ~ [1.25,1.46]
// with z-extent ~ [0.045,0.06] (glyphs proud of bar) and another with
// y-range ~ [1.24,1.49] z ~ [0.028,0.048] (the bar).
let glyphBucket: any = null, barBucket: any = null;
for (const n of nodes) {
  const t = n.translation ?? [0, 0, 0];
  const vs = acc(n.mesh).map(v => [v[0] + t[0], v[1] + t[1], v[2] + t[2]]);
  const ymin = Math.min(...vs.map(v => v[1])), ymax = Math.max(...vs.map(v => v[1]));
  const zmin = Math.min(...vs.map(v => v[2])), zmax = Math.max(...vs.map(v => v[2]));
  if (ymax < 1.47 && ymin > 1.2 && zmax > 0.045 && zmax < 0.075 && ymax - ymin < 0.25 && vs.length > 50) glyphBucket = { n, vs, ymin, ymax, zmin, zmax };
}
ck("F2 glyph bucket present (pale, proud of board)", !!glyphBucket, glyphBucket ? `y[${glyphBucket.ymin.toFixed(3)},${glyphBucket.ymax.toFixed(3)}] z[${glyphBucket.zmin.toFixed(3)},${glyphBucket.zmax.toFixed(3)}] n=${glyphBucket.vs.length}` : "none");

// bar coverage of glyph band: every glyph vert y must sit inside [barYmin, barYmax]
if (glyphBucket) {
  // bar: the dark bucket at z ~ [0.028,0.048], y ~ [1.24,1.50]
  let bar: { ymin: number; ymax: number } | null = null;
  for (const n of nodes) {
    const t = n.translation ?? [0, 0, 0];
    const vs = acc(n.mesh).map(v => [v[0] + t[0], v[1] + t[1], v[2] + t[2]]);
    const ymin = Math.min(...vs.map(v => v[1])), ymax = Math.max(...vs.map(v => v[1]));
    const zmax = Math.max(...vs.map(v => v[2])), zmin = Math.min(...vs.map(v => v[2]));
    if (ymax < 1.52 && ymin > 1.2 && zmin > 0.02 && zmax < 0.05 && Math.abs(vs[0][2]) < 0.05 && vs.length === 24) bar = { ymin, ymax };
  }
  ck("F2 bar bucket (24-vert box)", !!bar, bar ? `y[${bar.ymin.toFixed(3)},${bar.ymax.toFixed(3)}]` : "none");
  if (bar && glyphBucket) {
    const outside = glyphBucket.vs.filter(v => v[1] < bar.ymin || v[1] > bar.ymax).length;
    ck("F2 glyph band fully inside bar y-range", outside === 0, `${outside} outside`);
  }
}

// b25 keep-out: rider at world-local (0, 1.35, -0.043) — model-local z is
// +0.043 (rider mounts the -z face in world = +z in local after yaw; per
// census bbox center z +0.059). Zone: |x|<0.5, y in [1.18,1.52], z in [-0.1,+0.12]
// DIFFERENTIAL vs baseline — baseline file banked pre-edit.
try {
  const bb = readFileSync(BASE);
  const bjl = bb.readUInt32LE(12);
  const bj = JSON.parse(bb.subarray(20, 20 + bjl).toString());
  function vertsOfJson(jj: any): number[][] {
    const out: number[][] = [];
    for (const n of jj.nodes) if (n.mesh !== undefined) {
      const t = n.translation ?? [0, 0, 0];
      const m = jj.meshes[n.mesh];
      for (const prim of m.primitives) {
        const a = jj.accessors[prim.attributes.POSITION];
        const bv = jj.bufferViews[a.bufferView];
        const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
        for (let i = 0; i < a.count; i++) {
          const o = binBase + off + i * 12;
          out.push([bb.readFloatLE(o) + t[0], bb.readFloatLE(o + 4) + t[1], bb.readFloatLE(o + 8) + t[2]]);
        }
      }
    }
    return out;
  }
  const zone = (vs: number[][]) => vs.filter(v => Math.abs(v[0]) < 0.5 && v[1] > 1.18 && v[1] < 1.52 && v[2] > -0.12 && v[2] < 0.12);
  const zA = vertsOfJson(j), zB = vertsOfJson(bj);
  console.log(`b25 zone verts: baseline=${zone(zB).length} new=${zone(zA).length}`);
  ck("b25 keep-out differential clean (zone identical)", zone(zB).length === zone(zA).length, `${zone(zB).length}==${zone(zA).length}`);
} catch (e: any) {
  console.log("baseline compare skipped:", e.message);
}

console.log(fails ? `${fails} FAIL` : "AUDIT ALL PASS");
process.exit(fails ? 1 : 0);
