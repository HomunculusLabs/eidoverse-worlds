// p328-verify-served.ts — polish-328 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-town-monument lib
// and prove the bead material truth survived the re-encode:
//  (1) a served glTF material with baseColorFactor ≈ linear(0xd9ac52) =
//      [0.6939,0.4125,0.0844], roughness 0.45, metal 0.15, emissiveFactor
//      ≈ [0.02,0.0117,0.0051] (the polish-328 bead signature);
//  (2) DRACO-decoded bead bucket: ~702 verts clustered on the knot path
//      (r 0.7..1.0 of the Y axis, |y| < 0.48), max radius < 1.0;
//  (3) polish-319/327 regressions: knot emissive [0.025,0.0146,0.0064] +
//      bell-gold PBR, lamp [0.9,0.5257,0.2287], textures >= 2, anchors
//      knot/lamp, both contact-shadow discs at r 1.58/1.18 flat/low;
//  (4) 0 non-finite accessor bounds.
// Chassis: p327-verify-served.ts (DRACO decode by VALUE).
import { readFileSync, writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/cfbb31a637ea7b74.glb";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p328-served.glb", buf);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

const jl = dv.getUint32(12, true);
const txt = new TextDecoder().decode(buf.subarray(20, 20 + jl));
let depth = 0, instr = false, esc = false, end = -1;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const json = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
let o = 20 + jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true); o += 8;
const bin = buf.subarray(o, o + binLen);

let fails = 0;
const ok = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} [${n}] ${d}`); if (!c) fails++; };
const near = (a: number[], b: number[], eps = 0.002) => a.length >= 3 && b.length >= 3 && a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) <= eps);

// ---- (1) bead material served ----
const mats: any[] = json.materials ?? [];
const bead = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.02, 0.0117, 0.0051], 0.002));
ok("bead-material-served", !!bead, `emissive ${JSON.stringify(bead?.emissiveFactor)}`);
ok("bead-pbr-served", !!bead && near(bead.pbrMetallicRoughness.baseColorFactor, [0.6939, 0.4125, 0.0844], 0.004) && bead.pbrMetallicRoughness.roughnessFactor === 0.45 && bead.pbrMetallicRoughness.metallicFactor === 0.15, JSON.stringify(bead?.pbrMetallicRoughness?.baseColorFactor));
const emissiveSet = mats.filter((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0.001));
ok("emissive-set-3-served", emissiveSet.length === 3, `${emissiveSet.length}`);

// ---- node census + anchors ----
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("knot-group-served", names.includes("knot"), names.join(","));
ok("lamp-anchor-served", names.includes("lamp"), "");

// ---- DRACO decode ----
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeMesh(meshIdx: number): { pos: number[] } | null {
    const prim = json.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const posAttrId = ext.attributes?.POSITION;
    const b = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(b.buffer, b.byteOffset, b.byteLength), b.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const a = decoder.GetAttributeByUniqueId(dg, posAttrId);
    const arr = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, a, arr);
    const out: number[] = [];
    for (let i = 0; i < arr.size(); i++) out.push(arr.GetValue(i));
    decoderModule.destroy(arr);
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { pos: out };
}

// ---- (2) bead bucket by VALUE (material-matched, DRACO-dedup tolerant) ----
const beadMatIdx = mats.indexOf(bead);
let beadStats: { n: number; inBand: number; maxRad: number } | null = null;
for (const [mi, mesh] of (json.meshes ?? []).entries()) {
    if (mesh.primitives[0].material !== beadMatIdx) continue;
    const d = decodeMesh(mi);
    if (!d || d.pos.length < 9) continue;
    const nV = d.pos.length / 3;
    let inBand = 0, maxRad = 0;
    for (let i = 0; i < nV; i++) {
        const rr = Math.hypot(d.pos[i * 3], d.pos[i * 3 + 2]);
        const y = d.pos[i * 3 + 1];
        maxRad = Math.max(maxRad, rr);
        if (rr > 0.7 && rr < 1.0 && Math.abs(y) < 0.48) inBand++;
    }
    beadStats = { n: nV, inBand: inBand / nV, maxRad };
}
ok("bead-bucket-served", !!beadStats, "");
if (beadStats) {
    ok("bead-vert-count-served", beadStats.n >= 300 && beadStats.n <= 760, `${beadStats.n} (local 702; DRACO dedup may trim)`);
    ok("bead-verts-on-path-served", beadStats.inBand > 0.9, `${(100 * beadStats.inBand).toFixed(1)}%`);
    ok("bead-max-radius-served", beadStats.maxRad < 1.0, `${beadStats.maxRad.toFixed(3)}`);
}

// ---- (3) knot + lamp + discs regressions ----
const knotMat = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.025, 0.0146, 0.0064]));
ok("knot-emissive-served", !!knotMat, JSON.stringify(knotMat?.emissiveFactor));
ok("knot-pbr-served", !!knotMat && near(knotMat.pbrMetallicRoughness.baseColorFactor, [0.5841, 0.3916, 0.1441]) && knotMat.pbrMetallicRoughness.roughnessFactor === 0.45 && knotMat.pbrMetallicRoughness.metallicFactor === 0.15, "");
ok("lamp-emissive-served", mats.some((m: any) => near(m.emissiveFactor ?? [], [0.9, 0.5257, 0.2287])), "");
ok("texture-materials-served", mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length >= 2, `${mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length} textured`);

let discCount = 0;
for (const [mi] of (json.meshes ?? []).entries()) {
    const d = decodeMesh(mi);
    if (!d || d.pos.length < 9) continue;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < d.pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(d.pos[i * 3], d.pos[i * 3 + 2]));
        minY = Math.min(minY, d.pos[i * 3 + 1]);
        maxY = Math.max(maxY, d.pos[i * 3 + 1]);
    }
    if (minY > -0.01 && maxY < 0.03 && maxXZ > 1.0) discCount++;
}
ok("discs-2-served", discCount === 2, `${discCount}`);

// ---- (4) non-finite ----
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [acc.min ?? [], acc.max ?? []].flat()) if (typeof v === "number" && !Number.isFinite(v)) nonFinite++;
}
ok("nonfinite-0-served", nonFinite === 0, `${nonFinite}`);

console.log(fails === 0 ? "P328_SERVED_PASS" : `P328_SERVED_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
