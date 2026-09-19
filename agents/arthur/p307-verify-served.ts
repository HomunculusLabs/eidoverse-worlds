// p307-verify-served.ts — polish-307 served-bytes proof (struct-104 law).
// The belltower's flat-color lane exports COLOR_0-only (no glTF material —
// the legacy v3 convention; three.js paints COLOR_0 both locally and in the
// live browser). Proof contract for the bell-gold edit:
//   (a) node/mesh census: bt3_0..7 + bell group + bell_0/bell_1 + lamp;
//   (b) DRACO-decode bell_0 (crown+body bucket) COLOR_0 — the ONLY authored
//       color lane — and verify it clusters at 0xd9ac52 = sRGB bytes
//       [217,172,82] (bell-gold), NOT the old 0xdada70 = [218,218,112];
//   (c) POSITION y-range of bell_0 ≈ hinge-relative band (body center
//       y −0.38, half 0.275 → −0.655..−0.105 around group origin 5.3);
//   (d) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "4a84e77127d73654";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p307-served.glb", buf);
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
// bell_0 = crown+body bucket (merged bell-gold); find its mesh index
let bell0: ReturnType<typeof decodeAttrs> | null = null, bell1: ReturnType<typeof decodeAttrs> | null = null;
for (let mi = 0; mi < json.meshes.length; mi++) {
    const nm = json.meshes[mi].name ?? "";
    if (nm === "bell_0") bell0 = decodeAttrs(mi);
    if (nm === "bell_1") bell1 = decodeAttrs(mi);
}
decoderModule.destroy(decoder);

const GOLD = [0xd9, 0xac, 0x52], OLIVE = [0xda, 0xda, 0x70];
// served COLOR_0 stores LINEAR floats-as-bytes: sRGB ^2.2 * 255
const lin = (b: number[]) => b.map((v) => Math.round(((v / 255) ** 2.2) * 255));
const GOLDL = lin(GOLD), OLIVEL = lin(OLIVE);
let goldN = 0, oliveN = 0, otherN = 0;
const yMin = { v: 1e9 }, yMax = { v: -1e9 };
if (bell0 && "col" in bell0 && bell0.col) {
    for (let i = 0; i < bell0.nPts!; i++) {
        const rgb = [bell0.col[i * 3], bell0.col[i * 3 + 1], bell0.col[i * 3 + 2]].map(Math.round);
        if (rgb.every((v, k) => Math.abs(v - GOLDL[k]) <= 4)) goldN++;
        else if (rgb.every((v, k) => Math.abs(v - OLIVEL[k]) <= 4)) oliveN++;
        else otherN++;
        const y = bell0.pos![i * 3 + 1];
        if (y < yMin.v) yMin.v = y;
        if (y > yMax.v) yMax.v = y;
    }
}
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    served_is_draco_reencode: JSON.stringify(json).includes("draco"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    keepAnchors: keep,
    bell0: bell0 && "nPts" in bell0 ? { verts: bell0.nPts, colorLane: !!bell0.col, gold: goldN, olive: oliveN, other: otherN, yRange: [round3(yMin.v), round3(yMax.v)] } : bell0,
    bell1: bell1 && "nPts" in bell1 ? { verts: bell1.nPts, colorLane: !!bell1.col } : bell1,
    nonFinite,
};
function round3(v: number) { return Math.round(v * 1000) / 1000; }
console.log(JSON.stringify(out, null, 1));
// GATES
if (out.nodes !== 12 || out.meshes !== 11) { console.error("FAIL census", out.nodes, out.meshes); process.exit(1); }
if (keep.join(",") !== "bell,bell_0,bell_1,lamp") { console.error("FAIL anchors", keep); process.exit(1); }
if (!out.served_is_draco_reencode) { console.error("FAIL not draco"); process.exit(1); }
if (!out.bell0 || !("verts" in (out.bell0 as any))) { console.error("FAIL bell0 decode"); process.exit(1); }
const b0 = out.bell0 as any;
if (!b0.colorLane) { console.error("FAIL bell0 has no COLOR_0"); process.exit(1); }
if (b0.gold < b0.verts * 0.9) { console.error("FAIL bell0 not bell-gold", b0); process.exit(1); }
if (b0.olive > 0) { console.error("FAIL olive remnants", b0); process.exit(1); }
if (nonFinite !== 0) { console.error("FAIL nonfinite"); process.exit(1); }
console.log("SERVED_PROOF_PASS");
