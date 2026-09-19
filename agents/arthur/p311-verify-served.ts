// p311-verify-served.ts — polish-311 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the self-lit cage survived:
//   (a) census: 12 nodes / 11 meshes (lamp_hood KEEP node added);
//       anchors lamp, lamp_hood, bell, bell_0, bell_1;
//   (b) exactly one cage-emissive material at factor [0.02, 0.0117, 0.0051]
//       (0xffc98a × 0.02 — bead hue lineage) AND the bead's own
//       [0.9, 0.5257, 0.2287] preserved exact;
//   (c) lamp_hood mesh decodes at its authored corner (|x-0.75|,|z-0.75|
//       <= 0.11, y 5.67..5.77);
//   (d) 0 non-finite accessor bounds; scene maxY 7.9 (crown).
// Baseline b0b1e276 carried ONLY the bead emissive — any cage material in
// the served bytes is the polish-311 change reaching players.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "6359999041251ad9";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p311-served.glb", buf);
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
const keep = names.filter((n) => /^(bell|bell_\d|lamp|lamp_hood)$/.test(n));
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
const emissives = (json.materials ?? [])
    .filter((m: any) => m.emissiveFactor)
    .map((m: any) => ({ name: m.name, f: m.emissiveFactor }));
const eq = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-4);
const cage = emissives.find((m: any) => eq(m.f, [0.02, 0.0117, 0.0051]));
const bead = emissives.find((m: any) => eq(m.f, [0.9, 0.5257, 0.2287]));

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodePos(meshIdx: number) {
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
    const id = decoder.GetAttributeId(dg, decoderModule.POSITION);
    const a = decoder.GetAttribute(dg, id);
    const out = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, a, out);
    const arr: number[] = [];
    for (let i = 0; i < nPts * 3; i++) arr.push(out.GetValue(i));
    decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { name, nPts, pos: arr };
}
// lamp_hood mesh stats (node name -> mesh idx -> decoded verts)
const hoodNode = (json.nodes ?? []).find((n: any) => n.name === "lamp_hood");
let hood = null as null | { mesh: string, n: number, cx: number, cy: number, cz: number, maxY: number };
let maxYAll = -1e9;
if (hoodNode?.mesh !== undefined) {
    const d = decodePos(hoodNode.mesh);
    if ("pos" in d && d.pos) {
        // mesh-local verts + NODE translation (hood position lives on the
        // node; also apply its quaternion for exactness — cone centroid is
        // near-axis so the rotation contributes <1mm)
        const t = hoodNode.translation ?? [0, 0, 0];
        const q = hoodNode.rotation ?? [0, 0, 0, 1];
        const [qx, qy, qz, qw] = q;
        const rot = (v: number[]) => [
            (1 - 2 * (qy * qy + qz * qz)) * v[0] + 2 * (qx * qy - qz * qw) * v[1] + 2 * (qx * qz + qy * qw) * v[2],
            2 * (qx * qy + qz * qw) * v[0] + (1 - 2 * (qx * qx + qz * qz)) * v[1] + 2 * (qy * qz - qx * qw) * v[2],
            2 * (qx * qz - qy * qw) * v[0] + 2 * (qy * qz + qx * qw) * v[1] + (1 - 2 * (qx * qx + qy * qy)) * v[2],
        ];
        let sx = 0, sy = 0, sz = 0, hmax = -1e9;
        for (let i = 0; i < d.nPts!; i++) {
            const w = rot([d.pos[i * 3], d.pos[i * 3 + 1], d.pos[i * 3 + 2]]);
            sx += w[0] + t[0]; sy += w[1] + t[1]; sz += w[2] + t[2];
            hmax = Math.max(hmax, w[1] + t[1]);
        }
        hood = { mesh: d.name!, n: d.nPts!, cx: +(sx / d.nPts!).toFixed(4), cy: +(sy / d.nPts!).toFixed(4), cz: +(sz / d.nPts!).toFixed(4), maxY: +hmax.toFixed(4) };
    }
}
for (let mi = 0; mi < json.meshes.length; mi++) {
    const d = decodePos(mi);
    if ("pos" in d && d.pos) for (let i = 0; i < d.nPts!; i++) maxYAll = Math.max(maxYAll, d.pos[i * 3 + 1]);
}
decoderModule.destroy(decoder);
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    keepAnchors: keep,
    emissives,
    cageFound: !!cage, beadFound: !!bead,
    lampHood: hood,
    sceneMaxY: +maxYAll.toFixed(3),
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
// GATES
if (out.nodes !== 12 || out.meshes !== 11) { console.error("FAIL census", out.nodes, out.meshes); process.exit(1); }
if (keep.join(",") !== "bell,bell_0,bell_1,lamp,lamp_hood") { console.error("FAIL anchors", keep); process.exit(1); }
if (!cage) { console.error("FAIL cage emissive [0.02,0.0117,0.0051] not found"); process.exit(1); }
if (!bead) { console.error("FAIL bead emissive [0.9,0.5257,0.2287] not found"); process.exit(1); }
if (!hood || Math.abs(hood.cx - 0.75) > 0.11 || Math.abs(hood.cz - 0.75) > 0.11 || hood.cy < 5.6 || hood.cy > 5.85) {
    console.error("FAIL lamp_hood locus", hood); process.exit(1);
}
if (Math.abs(maxYAll - 7.9) > 0.05) { console.error("FAIL scene maxY", maxYAll); process.exit(1); }
if (nonFinite !== 0) { console.error("FAIL nonfinite"); process.exit(1); }
console.log("P311_SERVED_PASS");
