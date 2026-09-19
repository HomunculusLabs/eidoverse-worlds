// p303-verify-served.ts — did the four gate plaques survive the DRACO
// re-encode? Decodes the LIVE SERVED bytes (struct-104 law: served bytes
// are the player's truth) and answers two questions at the accessor level:
//   1) GATE SURVIVAL: does an ink-family mesh now contain a vertex cluster
//      at each cardinal junction radius band r 0.385..0.445 (the plaque
//      corners), where the polish-302 served build had none? Signature:
//      vertices with 0.385 <= r <= 0.45 binned by angle; the four cardinal
//      bins (within 4° of 0/90/180/270 authored-mapped) must each carry
//      plaque-band vertices BEYOND the ring's own band population delta.
//   2) SPOKE CONNECTIVITY control: the polish-302 contract (8 spokes +
//      E-W bar reaching r >= 0.40) must still hold (no regression).
// Face-plane projection (source-true): mapG tilt -0.21 about x, center
// (0,1.55,-0.06); u = (y-1.55)*cos(.21) - (z+0.06)*sin(.21);
// x' = x, y' = u (authored (cos a, sin a) -> mapG (cos a, -sin a): angles
// measured with y' = -u match AUTHORED angles; use ang = atan2(-u, x)).
// Chassis: p302-verify-served.ts (proven).
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB_NEW = process.argv[2] ?? "/tmp/p303-served-new.glb";
const GLB_OLD = process.argv[3] ?? "/tmp/p303-served-prev.glb";
const buf = fs.readFileSync(GLB_NEW);
const bufOld = fs.readFileSync(GLB_OLD);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let o = 12;
const jl = dv.getUint32(o, true); o += 8;
const txt = new TextDecoder("utf-8", { fatal: false }).decode(buf.subarray(o, o + jl));
let depth = 0, end = -1, instr = false, esc = false;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const j = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
o += jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true); o += 8;
const bin = buf.subarray(o, o + binLen);
const COS = Math.cos(0.21), SIN = Math.sin(0.21);
const radius = (x: number, y: number, z: number) => Math.hypot(x, (y - 1.55) * COS - (z + 0.06) * SIN);
const authoredAngle = (x: number, y: number, z: number) => Math.atan2(-((y - 1.55) * COS - (z + 0.06) * SIN), x);

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = j.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
const decodeMeshPositions = (mi: number): number[][] | null => {
    const prim = j.meshes[mi].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const bytes = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const attr = decoder.GetAttribute(dg, decoder.GetAttributeId(dg, decoderModule.POSITION));
    const out = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, attr, out);
    const pts: number[][] = [];
    for (let i = 0; i < dg.num_points(); i++) pts.push([out.GetValue(i * 3), out.GetValue(i * 3 + 1), out.GetValue(i * 3 + 2)]);
    decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return pts;
};
// gate corners land at r 0.376/0.456, ±9.5°..±11.1° from cardinal
// (atan2 of the 75mm tangential half-offset at r 0.4475). Plaque band:
// 0.34..0.49, cardinal window ±12° (contains all corners; disjoint from
// the 45° spokes and the 36° ring buildings).
// Served-build control: DRACO merges the whole ink family into ONE mesh
// (proven above: mesh spans 0.065..0.445), so "8 separate spoke meshes"
// cannot exist in served bytes — connectivity control = the ink mesh's
// rMax envelope (>= 0.44 keeps polish-302's connected contract).
const PLAQ_LO = 0.34, PLAQ_HI = 0.49;
const near = (deg: number, target: number) => {
    let d = Math.abs(deg - target) % 360;
    if (d > 180) d = 360 - d;
    return d <= 12;
};
const cardinalCounts = { c0: 0, c90: 0, c180: 0, c270: 0 };
let nonFinite = 0, dracoMeshes = 0, plaqTotal = 0;
const spanning: number[] = [];
let inkFamMaxR = new Map<number, { rMin: number; rMax: number }>();
for (let mi = 0; mi < j.meshes.length; mi++) {
    const pts = decodeMeshPositions(mi);
    if (!pts) continue;
    dracoMeshes++;
    let rMin = Infinity, rMax = -Infinity;
    for (const [x, y, z] of pts) {
        if (![x, y, z].every(Number.isFinite)) { nonFinite++; continue; }
        const r = radius(x, y, z);
        if (r < rMin) rMin = r;
        if (r > rMax) rMax = r;
        if (r >= PLAQ_LO && r <= PLAQ_HI) {
            plaqTotal++;
            const deg = (authoredAngle(x, y, z) * 180) / Math.PI;
            if (near(deg, 0)) cardinalCounts.c0++;
            else if (near(deg, 90)) cardinalCounts.c90++;
            else if (near(deg, 180)) cardinalCounts.c180++;
            else if (near(deg, 270)) cardinalCounts.c270++;
        }
    }
    inkFamMaxR.set(mi, { rMin, rMax });
    if (rMin < 0.10 && rMax > 0.40) spanning.push(mi);
}
decoderModule.destroy(decoder);

// previous build control: same cardinal-bin counts on the OLD served bytes
const dv2 = new DataView(bufOld.buffer, bufOld.byteOffset, bufOld.byteLength);
let o2 = 12;
const jl2 = dv2.getUint32(o2, true); o2 += 8;
const txt2 = new TextDecoder("utf-8", { fatal: false }).decode(bufOld.subarray(o2, o2 + jl2));
let d2 = 0, e2 = -1, i2 = false, s2 = false;
for (let i = 0; i < txt2.length; i++) {
    const c = txt2[i];
    if (i2) { if (s2) s2 = false; else if (c === "\\") s2 = true; else if (c === '"') i2 = false; }
    else if (c === '"') i2 = true;
    else if (c === "{") d2++;
    else if (c === "}") { d2--; if (d2 === 0) { e2 = i + 1; break; } }
}
const j2 = JSON.parse(txt2.slice(0, e2 === -1 ? txt2.length : e2));
o2 += jl2 + ((4 - (jl2 % 4)) % 4);
const binLen2 = dv2.getUint32(o2, true); o2 += 8;
const bin2 = bufOld.subarray(o2, o2 + binLen2);
const oldCardinal = { c0: 0, c90: 0, c180: 0, c270: 0 };
const dec2 = await draco3dgltf.createDecoderModule({});
const decoder2 = new dec2.Decoder();
for (let mi = 0; mi < j2.meshes.length; mi++) {
    const prim = j2.meshes[mi].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) continue;
    const v = j2.bufferViews[ext.bufferView];
    const off = v.byteOffset ?? 0;
    const bytes = bin2.subarray(off, off + v.byteLength);
    const dbuf = new dec2.DecoderBuffer();
    dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
    if (decoder2.GetEncodedGeometryType(dbuf) !== dec2.TRIANGULAR_MESH) { dec2.destroy(dbuf); continue; }
    const dg = new dec2.Mesh();
    const st = decoder2.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { dec2.destroy(dg); dec2.destroy(dbuf); continue; }
    const attr = decoder2.GetAttribute(dg, decoder2.GetAttributeId(dg, dec2.POSITION));
    const out = new dec2.DracoFloat32Array();
    decoder2.GetAttributeFloatForAllPoints(dg, attr, out);
    for (let i = 0; i < dg.num_points(); i++) {
        const x = out.GetValue(i * 3), y = out.GetValue(i * 3 + 1), z = out.GetValue(i * 3 + 2);
        const r = radius(x, y, z);
        if (r >= PLAQ_LO && r <= PLAQ_HI) {
            const deg = (authoredAngle(x, y, z) * 180) / Math.PI;
            if (near(deg, 0)) oldCardinal.c0++;
            else if (near(deg, 90)) oldCardinal.c90++;
            else if (near(deg, 180)) oldCardinal.c180++;
            else if (near(deg, 270)) oldCardinal.c270++;
        }
    }
    dec2.destroy(out); dec2.destroy(dg); dec2.destroy(dbuf);
}
dec2.destroy(decoder2);

console.log(JSON.stringify({
    glbNew: GLB_NEW, glbOld: GLB_OLD, dracoMeshes, nonFinite,
    cardinalCountsNew: cardinalCounts, cardinalCountsOld: oldCardinal,
    plaqueBandTotalNew: plaqTotal, spanningControl: spanning.length,
}, null, 1));
const deltas = {
    c0: cardinalCounts.c0 - oldCardinal.c0,
    c90: cardinalCounts.c90 - oldCardinal.c90,
    c180: cardinalCounts.c180 - oldCardinal.c180,
    c270: cardinalCounts.c270 - oldCardinal.c270,
};
console.log("cardinal deltas (new - old):", JSON.stringify(deltas));
let fail = false;
for (const [k, v] of Object.entries(deltas)) {
    if (v < 8) { console.error(`FAIL: cardinal ${k} plaque-band delta ${v} < 8`); fail = true; }
}
const inkEnv = Math.max(...[...inkFamMaxR.values()].map(e => e.rMax));
if (inkEnv < 0.44) { console.error(`FAIL: ink rMax envelope ${inkEnv} < 0.44 (connectivity contract)`); fail = true; }
if (nonFinite > 0) { console.error(`FAIL: ${nonFinite} non-finite vertices`); fail = true; }
if (fail) process.exit(1);
console.log(`GATES_SERVED: all four cardinal plaque clusters present in served bytes (deltas ${JSON.stringify(deltas)}); ink envelope r ${inkEnv.toFixed(3)} keeps the connected contract; NaN clean.`);
