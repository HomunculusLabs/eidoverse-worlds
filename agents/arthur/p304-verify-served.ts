// p304-verify-served.ts — polish-304 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED lib for nx-dress-stringlights and answer two
// questions at the glTF level: (1) does a material with emissiveFactor
// exist in the served JSON (did the bulb glow survive the DRACO re-encode)?
// (2) which meshes reference it, and do their positions match the bulb
// spheres' authored locus (sagging strand, y below the wire, |x| < 3.1)?
// Chassis: p302-verify-served.ts decode loop (proven).
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB = process.argv[2] ?? "/tmp/polish304-served.glb";
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
const binLen = dv.getUint32(o, true);

// Q1: emissive materials in the served JSON
const emissive: Array<{ name: string; factor: number[] }> = (j.materials ?? [])
    .map((m: any) => ({ name: m.name, factor: m.emissiveFactor }))
    .filter((m: any) => Array.isArray(m.factor) && m.factor.some((v: number) => v > 0));
console.log("emissive materials in SERVED bytes:", JSON.stringify(emissive));
if (emissive.length === 0) { console.error("FAIL: no emissiveFactor in served JSON"); process.exit(1); }

// Q2: which meshes carry it + their decoded positions (bulb locus proof)
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const bin = buf.subarray(o + 8, o + 8 + binLen);
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

const emIdx = new Set<number>();
(j.materials ?? []).forEach((m: any, i: number) => {
    if (Array.isArray(m.emissiveFactor) && m.emissiveFactor.some((v: number) => v > 0)) emIdx.add(i);
});

let bulbMeshes = 0, nonFinite = 0, locusOK = true;
const bulbXs: number[] = [];
for (let ni = 0; ni < j.nodes.length; ni++) {
    const n = j.nodes[ni];
    if (n.mesh === undefined) continue;
    const prims = j.meshes[n.mesh].primitives;
    for (const prim of prims) {
        if (prim.material === undefined || !emIdx.has(prim.material)) continue;
        bulbMeshes++;
        const pts = decodeMeshPositions(n.mesh);
        if (!pts) continue;
        for (const [x, y] of pts) {
            if (!Number.isFinite(x) || !Number.isFinite(y)) nonFinite++;
            bulbXs.push(x);
            // bulb locus: hangs BELOW the wire (y in -0.62..-0.02 local), span |x|<=3.1
            if (!(y > -0.75 && y < 0.05 && Math.abs(x) <= 3.2)) locusOK = false;
        }
    }
}
console.log(JSON.stringify({
    bulbMeshesWithEmissive: bulbMeshes,
    nonFinite,
    bulbLocusOK: locusOK,
    xExtent: bulbXs.length ? [Math.min(...bulbXs), Math.max(...bulbXs)] : null,
    servedNodes: j.nodes?.length,
}));
if (bulbMeshes === 0 || nonFinite > 0 || !locusOK) { console.error("FAIL: bulb contract not met in served bytes"); process.exit(1); }
console.log("P304_SERVED_PASS");
