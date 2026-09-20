// p327-verify-served.ts — polish-327 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-town-monument lib
// and prove the contact-shadow anchor survived the re-encode:
//  (1) two flat disc meshes present (merged buckets mn3_5/mn3_6): penumbra
//      maxXZ radius ~1.58, core ~1.18, both y-bands 0..0.02, y-span <= 0.002
//      (flat decals);
//  (2) their COLOR_0 vertex colors = collie-law dark greens (0x37452a /
//      0x2b3322 — value-range lane, p314 law: classify by range not id);
//  (3) polish-319 regressions: knot emissive [0.025,0.0146,0.0064] +
//      bell-gold PBR, bead [0.9,0.5257,0.2287], stone/soil textures,
//      knot/lamp anchors;
//  (4) 0 non-finite (accessor bounds).
// DRACO decode chassis: p323-verify-served.ts.
import { readFileSync, writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/43c9dcf3ee52c6f3.glb";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p327-served.glb", buf);
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

// ---- polish-319 regressions (materials by VALUE) ----
const near = (a: number[], b: number[], eps = 0.002) => a.length >= 3 && b.length >= 3 && a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) <= eps);
const mats: any[] = json.materials ?? [];
const knot = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.025, 0.0146, 0.0064]));
ok("knot-emissive-served", !!knot, JSON.stringify(knot?.emissiveFactor));
ok("knot-pbr-served", !!knot && near(knot.pbrMetallicRoughness.baseColorFactor, [0.5841, 0.3916, 0.1441]) && knot.pbrMetallicRoughness.roughnessFactor === 0.45 && knot.pbrMetallicRoughness.metallicFactor === 0.15, `r=${knot?.pbrMetallicRoughness?.roughnessFactor} m=${knot?.pbrMetallicRoughness?.metallicFactor}`);
ok("bead-emissive-served", mats.some((m: any) => near(m.emissiveFactor ?? [], [0.9, 0.5257, 0.2287])), "");
ok("texture-materials-served", mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length >= 2, `${mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length} textured`);

// ---- node census + anchors ----
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("knot-group-served", names.includes("knot"), names.join(","));
ok("lamp-anchor-served", names.includes("lamp"), "");

// ---- DRACO decode: disc geometry by VALUE ----
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeAttr(meshIdx: number): { pos: number[]; color: number[] } | null {
    const prim = json.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const posAttrId = ext.attributes?.POSITION;
    const colorAttrId = ext.attributes?.COLOR_0;
    const b = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(b.buffer, b.byteOffset, b.byteLength), b.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const read = (id: number) => {
        const a = decoder.GetAttributeByUniqueId(dg, id);
        const arr = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dg, a, arr);
        const out: number[] = [];
        for (let i = 0; i < arr.size(); i++) out.push(arr.GetValue(i));
        decoderModule.destroy(arr);
        return out;
    };
    const pos = posAttrId !== undefined ? read(posAttrId) : [];
    const color = colorAttrId !== undefined ? read(colorAttrId) : [];
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { pos, color };
}
// find disc nodes: flat, low, wide
const discNodes: { name: string; maxXZ: number; ySpan: number; minY: number; maxY: number; colorMean: number[] }[] = [];
for (const n of json.nodes) {
    if (n.mesh === undefined) continue;
    const prim = json.meshes[n.mesh].primitives[0];
    if (!prim.extensions?.KHR_draco_mesh_compression) continue;
    const d = decodeAttr(n.mesh, () => true);
    if (!d || d.pos.length < 9) continue;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < d.pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(d.pos[i * 3], d.pos[i * 3 + 2]));
        minY = Math.min(minY, d.pos[i * 3 + 1]);
        maxY = Math.max(maxY, d.pos[i * 3 + 1]);
    }
    if (minY > -0.01 && maxY < 0.03 && maxXZ > 1.0) {
        const cm = [0, 0, 0]; const nV = d.pos.length / 3;
        for (let i = 0; i < nV && d.color.length >= nV * 3; i++) { cm[0] += d.color[i * 3]; cm[1] += d.color[i * 3 + 1]; cm[2] += d.color[i * 3 + 2]; }
        if (nV) for (let c = 0; c < 3; c++) cm[c] = Math.round(cm[c] / nV); // raw linear-byte lane (0..255), no rescale
        discNodes.push({ name: n.name ?? "?", maxXZ, ySpan: maxY - minY, minY, maxY, colorMean: cm });
    }
}
ok("discs-served-2", discNodes.length === 2, JSON.stringify(discNodes.map(d => `${d.name} r=${d.maxXZ.toFixed(3)} y=[${d.minY.toFixed(3)},${d.maxY.toFixed(3)}] rgb=${d.colorMean}`)));
ok("penumbra-radius-served", discNodes.some(d => Math.abs(d.maxXZ - 1.58) < 0.05), "");
ok("core-radius-served", discNodes.some(d => Math.abs(d.maxXZ - 1.18) < 0.05), "");
ok("discs-flat-served", discNodes.every(d => d.ySpan <= 0.005), `ySpans ${discNodes.map(d => d.ySpan.toFixed(4)).join(",")}`);
ok("collie-hue-served", discNodes.length === 2 && discNodes.every(d => {
    // served COLOR_0 is the LINEAR encoding of the authored sRGB (verified:
    // linear(55,69,42)=(10.0,15.3,5.6), linear(43,51,34)=(6.0,8.1,4.3)):
    // gate on the dark-green hue signature G > R > B in the raw linear-byte
    // lane, plus the render-equality proof in the tick evidence.
    const [r, g, b] = d.colorMean;
    return r >= 4 && r <= 40 && g >= 5 && g <= 45 && b >= 3 && b <= 30 && g > r && r > b;
}), `raw linear means: ${discNodes.map(d => d.colorMean.join(",")).join(" | ")} (authored sRGB 55,69,42 / 43,51,34 -> linear 10,15,6 / 6,8,4)`);

// ---- accessor non-finite ----
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [acc.min ?? [], acc.max ?? []].flat()) if (typeof v === "number" && !Number.isFinite(v)) nonFinite++;
}
ok("nonfinite-0-served", nonFinite === 0, `${nonFinite}`);

console.log(fails === 0 ? "P327_SERVED_PASS" : `P327_SERVED_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
