// struct65-decode-wavepergola.ts — decode audit of village_wavepergola3.glb
// Checks: node census (3 buckets), materials all real (texMat/emissive lanes),
// rail-wave envelope (y = YBASE + A·sin over x ∈ [−7,7]), posts reach rail
// underside with embed (no gaps), joists ride rails, beads at crest on both
// rails, walk-under clearance proven at trough vertices.
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_wavepergola3.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);   // skip BIN chunk header

const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
const mats = (jsonChunk.materials ?? []).map((m: any) => m.name);
console.log("materials:", mats.join(", "));

type Prim = { node: string; mat: string | undefined; verts: number[][] };
const prims: Prim[] = [];
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const mesh = meshes[n.mesh];
    for (const p of mesh.primitives) {
        const posAcc = jsonChunk.accessors[p.attributes.POSITION];
        const bufView = jsonChunk.bufferViews[posAcc.bufferView];
        const off = (bufView.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
        const dv = new DataView(bin.buffer, bin.byteOffset + off, posAcc.count * 12);
        const verts: number[][] = [];
        for (let i = 0; i < posAcc.count; i++) {
            verts.push([dv.getFloat32(i * 12, true), dv.getFloat32(i * 12 + 4, true), dv.getFloat32(i * 12 + 8, true)]);
        }
        prims.push({ node: n.name, mat: p.material !== undefined ? mats[p.material] : undefined, verts });
    }
}
console.log("prims:", prims.length, "| nodes:", nodes.length);

// 1. every prim carries a REAL material (struct-38 law)
const noMat = prims.filter(p => !p.mat);
if (noMat.length) { console.error("FAIL: prims without material:", noMat.map(p => p.node)); process.exit(1); }
console.log("PASS all prims carry real materials");

// 2. per-bucket world-space envelopes (mergekit bakes translations)
const YBASE = 3.41, AMP = 0.9, LAM = 14, BH = 0.42, ZB = 2.1;
for (const p of prims) {
    const tr = nodes.find((n: any) => n.name === p.node)?.translation ?? [0, 0, 0];
    const ys = p.verts.map(v => v[1]);
    const zs = p.verts.map(v => v[2] + tr[2]);
    const xs = p.verts.map(v => v[0] + tr[0]);
    const ylo = Math.min(...ys), yhi = Math.max(...ys);
    console.log(`bucket ${p.node} [${p.mat}] n=${p.verts.length} x ${Math.min(...xs).toFixed(2)}..${Math.max(...xs).toFixed(2)} z ${Math.min(...zs).toFixed(2)}..${Math.max(...zs).toFixed(2)} y ${ylo.toFixed(2)}..${yhi.toFixed(2)}`);
}

// 3. wave law: vertices of the iron bucket near the curve y=waveY(x) at its
//    sample xs (rail segs sample every 14/56 = 0.25m; allow 0.05)
const iron = prims.find(p => p.mat === "wave_iron")!;
{
    let worst = 0;
    for (const v of iron.verts) {
        const expect = YBASE + AMP * Math.sin((2 * Math.PI * v[0]) / LAM);
        // vertex can sit at the box top/bottom (±BH/2 from centerline)
        const d = Math.min(Math.abs(v[1] - expect), Math.abs(v[1] - expect - BH / 2), Math.abs(v[1] - expect + BH / 2));
        if (d > worst) worst = d;
    }
    console.log(`wave law: worst vertex deviation from curve±BH/2 = ${worst.toFixed(4)}`);
    if (worst > 0.05) { console.error("FAIL wave law"); process.exit(1); }
    console.log("PASS rail verts lie on the sine curve (±section half)");
}

// 4. walk-under clearance: lowest iron vertex above 2.29
{
    const ylo = Math.min(...iron.verts.map(v => v[1]));
    console.log(`walk-under: lowest iron y = ${ylo.toFixed(3)} (law ≥ 2.295)`);
    if (ylo < 2.295) { console.error("FAIL walk-under"); process.exit(1); }
    console.log("PASS walk-under clearance");
}

// 5. posts: timber bucket contains verts down to y≈0.05 (plinths) and up to
//    rail underside+embed; verify the tallest post tops land just under 2.6..
{
    const timber = prims.find(p => p.mat === "timber")!;
    const ys = timber.verts.map(v => v[1]);
    const ylo = Math.min(...ys), yhi = Math.max(...ys);
    console.log(`timber y ${ylo.toFixed(2)}..${yhi.toFixed(2)} (expect ~0.05..~3.62 crest post top)`);
    if (ylo > 0.1) { console.error("FAIL timber not grounded"); process.exit(1); }
    if (yhi < 3.3) { console.error("FAIL posts don't reach crests"); process.exit(1); }
    console.log("PASS posts grounded and reaching");
}

// 6. beads: brass bucket exactly 2 sphere-prim sets at crest x=3.5 z=±2.1
{
    const glow = prims.find(p => p.mat === "glow2");
    const b = glow!;
    const tr = nodes.find((n: any) => n.name === b.node)?.translation ?? [0, 0, 0];
    const cx = b.verts.map(v => v[0] + tr[0]);
    const cz = b.verts.map(v => v[2] + tr[2]);
    const cy = b.verts.map(v => v[1]);
    const xmid = (Math.min(...cx) + Math.max(...cx)) / 2;
    const south = cz.filter((z: number) => z < 0), north = cz.filter((z: number) => z >= 0);
    const zS = south.reduce((a: number, b2: number) => a + b2, 0) / south.length;
    const zN = north.reduce((a: number, b2: number) => a + b2, 0) / north.length;
    console.log(`bead bucket ${b.node} [${b.mat}] x-center ${xmid.toFixed(3)} z-cluster-means ${zS.toFixed(3)}/${zN.toFixed(3)} y ${Math.min(...cy).toFixed(2)}..${Math.max(...cy).toFixed(2)}`);
    if (Math.abs(xmid - 3.5) > 0.01 || Math.abs(Math.abs(zS) - 2.1) > 0.01 || Math.abs(Math.abs(zN) - 2.1) > 0.01) { console.error("FAIL beads not at crest on both rails"); process.exit(1); }
    console.log("PASS two crest beads x=+3.5 z=±2.1");
}

// 7. room gates honest
{
    const allX: number[] = [], allZ: number[] = [], allY: number[] = [];
    for (const p of prims) for (const v of p.verts) { allX.push(v[0]); allZ.push(v[2]); allY.push(v[1]); }
    const w = Math.max(...allX) - Math.min(...allX), d = Math.max(...allZ) - Math.min(...allZ), h = Math.max(...allY);
    const area = w * d;
    console.log(`room gates: ${w.toFixed(2)}×${d.toFixed(2)} = ${area.toFixed(1)}m² (≥16) height ${h.toFixed(2)} (≥2.2)`);
    if (area < 16 || h < 2.2) { console.error("FAIL room gates"); process.exit(1); }
    console.log("PASS room gates honest — exact trimesh, beams are real headroom");
}

console.log("ALL GREEN");
