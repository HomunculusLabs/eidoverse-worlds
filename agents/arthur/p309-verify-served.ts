// p309-verify-served.ts — polish-309 served-bytes proof (struct-104 law):
// fetch/decode the LIVE SERVED (DRACO) lib for nx-dress-stringlights and prove
// the polish-309 contract survived the re-encode: glow1 bulbs (9), glow0
// strand (24 segs, y in [-0.5, 0.02]), glow0 POLES (2, |x| ~3.04, y reaching
// -2.6), stone feet present as nodes, zero non-finite. Chassis: p305-verify-served.ts.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const GLB = process.argv[2] ?? "/tmp/p309-served.glb";
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
    glow1: [1, 0.6939, 0.3515],   // bulbs (polish-304)
    glow0: [0.15, 0.1041, 0.0527], // wire sheen + poles (polish-305/309)
};
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
const served = (j.materials ?? []).filter((m: any) => Array.isArray(m.emissiveFactor) && m.emissiveFactor.some((v: number) => v > 0));
console.log("emissive materials in SERVED bytes:", JSON.stringify(served.map((m: any) => ({ name: m.name, factor: m.emissiveFactor }))));
if (!served.some((s: any) => eq(s.emissiveFactor, EXPECT.glow1))) { console.error("FAIL: glow1 exact factor missing"); process.exit(1); }
if (!served.some((s: any) => eq(s.emissiveFactor, EXPECT.glow0))) { console.error("FAIL: glow0 exact factor missing"); process.exit(1); }

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

let bulbMeshes = 0, wireMeshes = 0, poleMeshes = 0, nonFinite = 0;
let bulbLocusOK = true, wireLocusOK = true, poleLocusOK = true;
let poleMinY = Infinity, poleMaxY = -Infinity;
for (const n of j.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        if (prim.material === undefined) continue;
        const f = j.materials[prim.material]?.emissiveFactor;
        const isBulb = eq(f, EXPECT.glow1);
        const isGlow0 = eq(f, EXPECT.glow0);
        if (!isBulb && !isGlow0) continue;
        const pts = decodeMeshPositions(n.mesh);
        if (!pts) continue;
        // fold node translation into mesh-local positions (poles/wire segs are
        // translated nodes; mesh-local y alone spans the box, not the strand)
        const t = n.translation ?? [0, 0, 0];
        // classify glow0 as POLE if any vertex is below the wire band (y < -0.55)
        const isPole = isGlow0 && pts.some(([, y]) => y + t[1] < -0.55);
        for (const [x, y] of pts) {
            const X = x + t[0], Y = y + t[1];
            if (!Number.isFinite(x) || !Number.isFinite(y)) nonFinite++;
            if (isBulb) { if (!(Y > -0.75 && Y < 0.05 && Math.abs(X) <= 3.2)) bulbLocusOK = false; }
            else if (isPole) { if (Y < poleMinY) poleMinY = Y; if (Y > poleMaxY) poleMaxY = Y; if (!(Math.abs(X) >= 2.8 && Math.abs(X) <= 3.25 && Y >= -2.7 && Y <= 0.05)) poleLocusOK = false; }
            else { if (!(Y >= -0.5 && Y <= 0.02 && Math.abs(X) <= 3.15)) wireLocusOK = false; }
        }
        if (isBulb) bulbMeshes++; else if (isPole) poleMeshes++; else wireMeshes++;
    }
}
const feetNodes = (j.nodes ?? []).filter((n: any) => typeof n.name === "string" && n.name.includes("polefoot")).length;
console.log(JSON.stringify({
    bulbMeshes, wireMeshes, poleMeshes, nonFinite, feetNodes,
    bulbLocusOK, wireLocusOK, poleLocusOK,
    poleYRange: poleMinY < Infinity ? [Number(poleMinY.toFixed(3)), Number(poleMaxY.toFixed(3))] : null,
    servedNodes: j.nodes?.length,
}));
if (bulbMeshes !== 9 || wireMeshes !== 24 || poleMeshes !== 2 || feetNodes !== 2 || nonFinite > 0 || !bulbLocusOK || !wireLocusOK || !poleLocusOK) {
    console.error("FAIL: p309 contract not met in served bytes"); process.exit(1);
}
console.log("P309_SERVED_PASS");
