// p312-verify-served.ts — polish-312 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED (DRACO) lib for nx-town-streetlamps and prove the
// iron sheen emissiveFactor [0.15, 0.0876, 0.0381] (WITH baseColorTexture)
// and the core glow1 [0.9, 0.5257, 0.2287] survived the re-encode, all 8
// lamp groups are present, verts sit on the r10 locus, 0 non-finite.
// Chassis: p305-verify-served.ts.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(fs.readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const LIB = "store/a7b05aefe1e971e8.glb";
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const OUT = process.argv[2] ?? "/tmp/polish312-served.glb";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.error(`served fetch HTTP ${r.status}`); process.exit(1); }
const ab = Buffer.from(await r.arrayBuffer());
fs.writeFileSync(OUT, ab);
console.log(`served bytes ${ab.length} -> ${OUT}`);

const buf = ab;
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
    iron: [0.15, 0.0876, 0.0381],   // polish-312 night sheen
    glow1: [0.9, 0.5257, 0.2287],   // lamp cores (tex-33, unchanged)
};
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

const ironMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.iron));
const glowMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.glow1));
console.log("emissive materials in SERVED bytes:", JSON.stringify((j.materials ?? []).filter((m: any) => Array.isArray(m.emissiveFactor)).map((m: any) => ({ name: m.name, factor: m.emissiveFactor, tex: !!m.pbrMetallicRoughness?.baseColorTexture }))));
let pass = true;
if (!ironMat) { console.error("FAIL: iron sheen factor not found in served JSON"); pass = false; }
else if (!ironMat.pbrMetallicRoughness?.baseColorTexture) { console.error("FAIL: iron lost its baseColorTexture"); pass = false; }
if (!glowMat) { console.error("FAIL: glow1 core factor not found in served JSON"); pass = false; }
if (!pass) process.exit(1);

const lampGroups = (j.nodes ?? []).filter((n: any) => /^lampsl[0-7]$/.test(n.name ?? ""));
console.log(`lamp groups: ${lampGroups.length}/8`);

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

let ironMeshes = 0, glowMeshes = 0, nonFinite = 0, locusBad = 0, headTop = 0;
for (const n of j.nodes ?? []) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        if (prim.material === undefined) continue;
        const isIron = eq(j.materials[prim.material]?.emissiveFactor, EXPECT.iron);
        const isGlow = eq(j.materials[prim.material]?.emissiveFactor, EXPECT.glow1);
        if (!isIron && !isGlow) continue;
        const pts = decodeMeshPositions(n.mesh);
        if (!pts) continue;
        for (const [x, y, z] of pts) {
            if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFinite++; continue; }
            const rr = Math.hypot(x, z);
            if (rr < 9.5 || rr > 10.5) locusBad++;   // lamps at r10: verts span ~9.82..10.18
            if (y < -0.01 || y > 3.0) locusBad++;
            if (y > headTop) headTop = y;
        }
        if (isIron) ironMeshes++; else glowMeshes++;
    }
}
console.log(JSON.stringify({ ironMeshes, glowMeshes, nonFinite, locusBad, headTop: headTop.toFixed(4), servedNodes: j.nodes?.length }));
if (lampGroups.length !== 8 || ironMeshes === 0 || glowMeshes === 0 || nonFinite > 0 || locusBad > 0 || headTop < 2.9) { console.error("FAIL: p312 contract not met in served bytes"); process.exit(1); }
console.log("P312_SERVED_PASS");
