// p308-verify-served.ts — polish-308 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the crown re-author survived:
//   (a) census: 11 nodes / 10 meshes; anchors bell, bell_0, bell_1, lamp;
//   (b) find the crown mesh (static bucket holding y >= 7.19 verts —
//       collar 7.2..7.3 + spire 7.3..7.9); verify its COLOR_0 clusters at
//       bell-gold 0xd9ac52 sRGB (217,172,82) = linear (177,105,22),
//       NOT the old collar 0xa0a248 linear (90,92,17) nor old spire
//       0xb98245 linear (124,57,15);
//   (c) bell_0 still bell-gold (untouched control);
//   (d) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "3e4f470b38d94bb7";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p308-served.glb", buf);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let o = 12;
const jl = dv.getUint32(o, true); o += 8;
const jsonRaw = buf.subarray(o, o + jl);
const txt = new TextDecoder("utf-8", { fatal: false }).decode(jsonRaw);
let depth = 0, end = -1, instr = false, esc = false;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const json = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
o += jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true); o += 8;
const bin = buf.subarray(o, o + binLen);

const names: string[] = (json.nodes ?? []).map((n: any) => n.name ?? "(unnamed)");
const keep = names.filter((n) => /^(bell|bell_\d|lamp)$/.test(n));
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeAttrs(meshIdx: number) {
    const prim = json.meshes[meshIdx].primitives[0];
    const name = json.meshes[meshIdx].name;
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return { name, err: "not draco" as const };
    const bytes = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return { name, err: "not mesh" as const }; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return { name, err: st.error() }; }
    const nPts = dg.num_points();
    const read = (kind: any) => {
        const id = decoder.GetAttributeId(dg, kind);
        if (id === -1) return null;
        const a = decoder.GetAttribute(dg, id);
        const out = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dg, a, out);
        const arr: number[] = [];
        for (let i = 0; i < nPts * (a.num_components() as number); i++) arr.push(out.GetValue(i));
        decoderModule.destroy(out);
        return arr;
    };
    const pos = read(decoderModule.POSITION);
    const col = read(decoderModule.COLOR);
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { name, nPts, pos, col };
}
type Attrs = ReturnType<typeof decodeAttrs>;
const decoded: Attrs[] = [];
for (let mi = 0; mi < json.meshes.length; mi++) decoded.push(decodeAttrs(mi));
decoderModule.destroy(decoder);

const lin = (b: number[]) => b.map((v) => Math.round(((v / 255) ** 2.2) * 255));
const GOLDL = lin([0xd9, 0xac, 0x52]);   // (177,105,22)
const COLL = lin([0xa0, 0xa2, 0x48]);    // old C.BRASS collar (90,92,17)
const SPIRE = lin([0xb9, 0x82, 0x45]);   // old spire (124,57,15)
const classify = (rgb: number[]) => {
    if (rgb.every((v, k) => Math.abs(v - GOLDL[k]) <= 4)) return "gold";
    if (rgb.every((v, k) => Math.abs(v - COLL[k]) <= 4)) return "oldCollar";
    if (rgb.every((v, k) => Math.abs(v - SPIRE[k]) <= 4)) return "oldSpire";
    return "other";
};
function bandReport(d: Attrs, yCut: number) {
    let n = 0, gold = 0, oldCollar = 0, oldSpire = 0, other = 0, yMin = 1e9, yMax = -1e9;
    if (!("pos" in d) || !d.pos || !d.col) return null;
    for (let i = 0; i < d.nPts!; i++) {
        const y = d.pos![i * 3 + 1];
        yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
        if (y < yCut) continue;
        n++;
        const rgb = [d.col![i * 3], d.col![i * 3 + 1], d.col![i * 3 + 2]].map(Math.round);
        const c = classify(rgb);
        if (c === "gold") gold++; else if (c === "oldCollar") oldCollar++; else if (c === "oldSpire") oldSpire++; else other++;
    }
    return { verts: n, gold, oldCollar, oldSpire, other, meshYRange: [Math.round(yMin * 1000) / 1000, Math.round(yMax * 1000) / 1000] };
}
// crown = the static mesh whose verts reach y >= 7.19 (collar+spire band)
let crown: { name: string } & ReturnType<typeof bandReport> | null = null;
let bell0: { name: string } & ReturnType<typeof bandReport> | null = null;
for (const d of decoded) {
    if (!("pos" in d) || !d.pos) continue;
    const yMax = Math.max(...d.pos.filter((_, i) => i % 3 === 1));
    if (d.name === "bell_0") bell0 = { name: d.name, ...bandReport(d, -1e9)! };
    else if (yMax >= 7.5 && !crown) crown = { name: d.name ?? "(unnamed)", ...bandReport(d, 7.19)! };
}
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    served_is_draco_reencode: JSON.stringify(json).includes("draco"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    keepAnchors: keep,
    crown, bell0,
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
// GATES
if (out.nodes !== 11 || out.meshes !== 10) { console.error("FAIL census", out.nodes, out.meshes); process.exit(1); }
if (keep.join(",") !== "bell,bell_0,bell_1,lamp") { console.error("FAIL anchors", keep); process.exit(1); }
if (!out.served_is_draco_reencode) { console.error("FAIL not draco"); process.exit(1); }
if (!crown) { console.error("FAIL crown mesh not found"); process.exit(1); }
if (crown.gold < crown.verts * 0.95) { console.error("FAIL crown not bell-gold", crown); process.exit(1); }
if (crown.oldCollar > 0 || crown.oldSpire > 0) { console.error("FAIL old-color remnants", crown); process.exit(1); }
if (crown.meshYRange[1] < 7.85 || crown.meshYRange[1] > 7.95) { console.error("FAIL crown y-envelope", crown); process.exit(1); }
if (!bell0 || bell0.gold < bell0.verts * 0.9) { console.error("FAIL bell0 control", bell0); process.exit(1); }
if (nonFinite !== 0) { console.error("FAIL nonfinite"); process.exit(1); }
console.log("SERVED_PROOF_PASS");
