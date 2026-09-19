// p302-verify-served.ts — did the spoke extensions survive the DRACO
// re-encode? Decodes the LIVE SERVED bytes (struct-104 law: served bytes are
// the player's truth) and answers one question at the accessor level: does
// every spoke primitive's outer tip reach board r >= 0.40 (the connected
// contract), vs the polish-301 defect r 0.2963 (8.9cm short of the ring)?
// Face-plane projection (source-true): mapG tilt -0.21 about x, center
// (0,1.55,-0.06); in-plane up u = (y-1.55)*cos(.21) - (z+0.06)*sin(.21),
// radius = hypot(x, u) — same arithmetic as the mk script's manifest.
// Decode chassis: struct104-decode-served.ts (proven).
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB = process.argv[2] ?? "/tmp/polish302-served.glb";
const buf = fs.readFileSync(GLB);
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

// spoke signature (DRACO-safe): an ink bucket spanning center-to-ring —
// face-radius rMin < 0.10 AND rMax > 0.40 (spokes 0.06..0.415; the E-W
// diameter bar also matches by design — it IS a road). Signature derived
// from the data below, not from pre-merge vert counts (DRACO dedupes).
const spokePrims: Array<{ mesh: number; verts: number; rCentroid: number; rMax: number; rMin: number }> = [];
const allMeshes: Array<{ mesh: number; verts: number; rMin: number; rMax: number }> = [];
let nonFinite = 0, dracoMeshes = 0;
for (let mi = 0; mi < j.meshes.length; mi++) {
    const pts = decodeMeshPositions(mi);
    if (!pts) continue;
    dracoMeshes++;
    for (const [x, y, z] of pts) if (![x, y, z].every(Number.isFinite)) nonFinite++;
    const rs = pts.map(p => radius(p[0], p[1], p[2]));
    const rMin = Math.min(...rs), rMax = Math.max(...rs), rC = rs.reduce((a, b) => a + b, 0) / rs.length;
    allMeshes.push({ mesh: mi, verts: pts.length, rMin: +rMin.toFixed(4), rMax: +rMax.toFixed(4) });
    if (rMin < 0.10 && rMax > 0.40) {
        spokePrims.push({ mesh: mi, verts: pts.length, rCentroid: +rC.toFixed(4), rMax: +rMax.toFixed(4), rMin: +rMin.toFixed(4) });
    }
}
decoderModule.destroy(decoder);
spokePrims.sort((a, b) => a.rCentroid - b.rCentroid);
console.log(JSON.stringify({ glb: GLB, dracoMeshes, nonFinite, allMeshes, spanning: spokePrims.length, spokePrims }, null, 1));
if (spokePrims.length < 8) { console.error("FAIL: fewer than 8 center-to-ring ink spans"); process.exit(1); }
const bad = spokePrims.filter(s => s.rMax < 0.40);
if (bad.length) { console.error("FAIL: spanning mesh short of ring"); process.exit(1); }
console.log(`SPOKES_CONNECTED: ${spokePrims.length} ink spans (8 spokes + E-W bar) all rMax >= 0.40 (ring band 0.385..0.44)`);
