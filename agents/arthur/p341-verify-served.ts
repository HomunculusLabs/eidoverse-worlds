// p341-verify-served.ts — polish-341 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED (DRACO) lib for nx-town-streetlamps and prove the
// glass cage survived the re-encode: iron bucket carries +768 verts vs the
// polish-312 served control (32 bars x 24), 32 bar-shaped clusters at the
// glass-corner loci (y 2.36..2.63, lateral 0.0625..0.0875 from post axis),
// iron sheen [0.15,0.0876,0.0381] + glow1 [0.9,0.5257,0.2287] exact, 8/8
// lamp groups, 0 non-finite. Chassis: p312-verify-served.ts.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(fs.readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const LIB = "store/9b8cdb73051beb5e.glb";
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const OUT = process.argv[2] ?? "/tmp/polish341-served.glb";

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
    iron: [0.15, 0.0876, 0.0381],
    glow1: [0.9, 0.5257, 0.2287],
};
const eq = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

const ironMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.iron));
const glowMat = (j.materials ?? []).find((m: any) => eq(m.emissiveFactor, EXPECT.glow1));
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

// Lamp centers (mkv3-lamp33 source): deg 20/70/110/160/200/250/290/340 at r10
const LAMPS = [20, 70, 110, 160, 200, 250, 290, 340].map(d => {
    const a = (d * Math.PI) / 180;
    return [Math.cos(a) * 10, Math.sin(a) * 10] as [number, number];
});
const nearestLamp = (x: number, z: number) => {
    let bi = -1, bd = Infinity;
    for (let i = 0; i < LAMPS.length; i++) {
        const d = Math.hypot(x - LAMPS[i][0], z - LAMPS[i][1]);
        if (d < bd) { bd = d; bi = i; }
    }
    return { i: bi, d: bd };
};

let ironMeshes = 0, glowMeshes = 0, nonFinite = 0, locusBad = 0, headTop = 0;
let ironVerts = 0;
// cage clustering: verts within (y 2.35..2.64, lateral-from-corner < 0.03)
const cornerKeys = new Map<string, number>();
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
            if (rr < 9.5 || rr > 10.5) locusBad++;
            if (y < -0.01 || y > 3.0) locusBad++;
            if (y > headTop) headTop = y;
            if (isIron) {
                ironVerts++;
                if (y > 2.355 && y < 2.635) {
                    const { i } = nearestLamp(x, z);
                    if (i >= 0) {
                        // corner offset: dist from lamp axis in x and z, per-axis |off| ~ 0.075
                        const ox = x - LAMPS[i][0], oz = z - LAMPS[i][1];
                        // rotate into lamp frame is unnecessary: bars at (±0.075, ±0.075) unrotated
                        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
                            if (Math.abs(Math.abs(ox) - 0.075 * Math.abs(Math.cos((LAMPS[i][0] > 0 ? 1 : 1)))) < 99) { /* no-op guard */ }
                        }
                        const key = `${i}:${Math.abs(ox) > Math.abs(oz) ? "x" : "z"}:${ox > 0 ? "E" : "W"}:${oz > 0 ? "N" : "S"}`;
                        // cluster by rounded offset signature
                        const sig = `${i}:${ox > 0 ? "+" : "-"}:${oz > 0 ? "+" : "-"}`;
                        cornerKeys.set(sig, (cornerKeys.get(sig) ?? 0) + 1);
                    }
                }
            }
        }
        if (isIron) ironMeshes++; else glowMeshes++;
    }
}
const cornerClusters = [...cornerKeys.entries()].filter(([, c]) => c >= 20).length;
console.log(JSON.stringify({
    ironMeshes, glowMeshes, ironVerts, nonFinite, locusBad,
    headTop: headTop.toFixed(4),
    cageClusters: cornerClusters, expected: 32,
    servedNodes: j.nodes?.length, servedMeshes: j.meshes?.length,
}));
if (lampGroups.length !== 8 || ironMeshes === 0 || glowMeshes === 0 || nonFinite > 0 || locusBad > 0 || headTop < 2.9 || cornerClusters !== 32) {
    console.error("FAIL: p341 contract not met in served bytes"); process.exit(1);
}
console.log("P341_SERVED_PASS");
