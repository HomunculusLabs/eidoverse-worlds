// p305-verify-served.ts — polish-305 served-bytes proof (struct-104 law):
// fetch/decode the LIVE SERVED (DRACO) lib for nx-dress-stringlights and prove
// BOTH glow materials survived the re-encode with exact factors, count meshes
// per material, and check the wire/bulb loci. Chassis: p304-verify-served.ts.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB = process.argv[2] ?? "/tmp/polish305-served.glb";
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

const EXPECT = {
    glow1: [1, 0.6939, 0.3515],  // bulbs (polish-304, unchanged)
    glow0: [0.15, 0.1041, 0.0527], // wire sheen (polish-305)
};
const served = (j.materials ?? []).filter((m: any) => Array.isArray(m.emissiveFactor) && m.emissiveFactor.some((v: number) => v > 0));
console.log("emissive materials in SERVED bytes:", JSON.stringify(served.map((m: any) => ({ name: m.name, factor: m.emissiveFactor }))));
let factorsExact = true;
for (const [name, want] of Object.entries(EXPECT)) {
    const m = served.find((s: any) => JSON.stringify(s.emissiveFactor) === JSON.stringify(want));
    if (!m) { console.error(`FAIL: ${name} exact factor ${JSON.stringify(want)} not found in served JSON`); factorsExact = false; }
}
if (served.length === 0 || !factorsExact) process.exit(1);

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const bin = buf.subarray(o + 8, o + 8 + binLen);
const sliceView = (i: number) => { const v = j.bufferViews[i]; const off = v.byteOffset ?? 0; return bin.subarray(off, off + v.byteLength); };
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

const emIdx = new Map<number, string>();
(j.materials ?? []).forEach((m: any, i: number) => { if (emIdxOf(m)) emIdx.set(i, m.name); });
function emIdxOf(m: any) { return Array.isArray(m.emissiveFactor) && m.emissiveFactor.some((v: number) => v > 0); }

let bulbMeshes = 0, wireMeshes = 0, nonFinite = 0;
let bulbLocusOK = true, wireLocusOK = true, wireY: number[] = [];
for (const n of j.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        if (prim.material === undefined) continue;
        const isBulb = JSON.stringify(j.materials[prim.material]?.emissiveFactor) === JSON.stringify(EXPECT.glow1);
        const isWire = JSON.stringify(j.materials[prim.material]?.emissiveFactor) === JSON.stringify(EXPECT.glow0);
        if (!isBulb && !isWire) continue;
        const pts = decodeMeshPositions(n.mesh);
        if (!pts) continue;
        for (const [x, y] of pts) {
            if (!Number.isFinite(x) || !Number.isFinite(y)) nonFinite++;
            if (isBulb) { if (!(y > -0.75 && y < 0.05 && Math.abs(x) <= 3.2)) bulbLocusOK = false; }
            else { wireY.push(y); if (!(y >= -0.5 && y <= 0.02 && Math.abs(x) <= 3.15)) wireLocusOK = false; }
        }
        if (isBulb) bulbMeshes++; else wireMeshes++;
    }
}
console.log(JSON.stringify({
    bulbMeshes, wireMeshes, nonFinite, bulbLocusOK, wireLocusOK,
    wireYRange: wireY.length ? [Math.min(...wireY).toFixed(3), Math.max(...wireY).toFixed(3)] : null,
    servedNodes: j.nodes?.length,
}));
if (bulbMeshes === 0 || wireMeshes === 0 || nonFinite > 0 || !bulbLocusOK || !wireLocusOK) { console.error("FAIL: p305 contract not met in served bytes"); process.exit(1); }
console.log("P305_SERVED_PASS");
