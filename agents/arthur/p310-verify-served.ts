// p310-verify-served.ts — polish-310 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the rope thicken survived:
//   (a) census: 11 nodes / 10 meshes; anchors bell, bell_0, bell_1, lamp;
//   (b) main rope column (axis x 0.12, z 0.58, y 0.55..4.62): max radial
//       distance MUST be in (0.025, 0.0305] — baseline r 0.018 cannot reach
//       0.025, so the gate proves the 0.030 cylinder is what players see;
//   (c) knot at (0.12, 1.35, 0.58): some vert radial >= 0.045 (baseline
//       0.035 fails), max <= 0.0565;
//   (d) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "b0b1e2766e145c02";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p310-served.glb", buf);
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
// rope column stats across all decoded meshes
const AX = 0.12, AZ = 0.58;
let ropeVerts = 0, ropeMaxRad = 0, ropeDeep = 0; // deep = radial >= 0.025 (impossible at r 0.018)
let knotVerts = 0, knotMaxRad = 0, knotDeep = 0; // knot deep = radial >= 0.045 (impossible at 0.035)
let maxY = -1e9;
for (let mi = 0; mi < json.meshes.length; mi++) {
    const d = decodePos(mi);
    if (!("pos" in d) || !d.pos) continue;
    for (let i = 0; i < d.nPts!; i++) {
        const x = d.pos[i * 3], y = d.pos[i * 3 + 1], z = d.pos[i * 3 + 2];
        if (y > maxY) maxY = y;
        const rad = Math.hypot(x - AX, z - AZ);
        // main rope span (exclude knot zone y 1.28..1.42 and tail y < 0.6)
        if (y >= 0.6 && y <= 4.62 && !(y >= 1.28 && y <= 1.42)) {
            if (rad <= 0.036) { ropeVerts++; ropeMaxRad = Math.max(ropeMaxRad, rad); if (rad >= 0.025) ropeDeep++; }
        }
        // knot bulge
        if (y >= 1.28 && y <= 1.42) {
            if (rad <= 0.06) { knotVerts++; knotMaxRad = Math.max(knotMaxRad, rad); if (rad >= 0.045) knotDeep++; }
        }
    }
}
decoderModule.destroy(decoder);
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    keepAnchors: keep,
    ropeVerts, ropeMaxRad: +ropeMaxRad.toFixed(4), ropeDeepRadGte025: ropeDeep,
    knotVerts, knotMaxRad: +knotMaxRad.toFixed(4), knotDeepRadGte045: knotDeep,
    sceneMaxY: +maxY.toFixed(3),
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
// GATES
if (out.nodes !== 11 || out.meshes !== 10) { console.error("FAIL census", out.nodes, out.meshes); process.exit(1); }
if (keep.join(",") !== "bell,bell_0,bell_1,lamp") { console.error("FAIL anchors", keep); process.exit(1); }
if (ropeVerts < 10) { console.error("FAIL rope verts not found", ropeVerts); process.exit(1); }
if (ropeMaxRad < 0.025 || ropeMaxRad > 0.0305) { console.error("FAIL rope radius not 0.030", ropeMaxRad); process.exit(1); }
if (ropeDeep < 3) { console.error("FAIL rope not provably thick (no verts >= 0.025)", ropeDeep); process.exit(1); }
if (knotDeep < 3) { console.error("FAIL knot not provably thick", knotDeep); process.exit(1); }
if (knotMaxRad > 0.0565) { console.error("FAIL knot radius", knotMaxRad); process.exit(1); }
if (Math.abs(maxY - 7.9) > 0.05) { console.error("FAIL scene maxY", maxY); process.exit(1); }
if (nonFinite !== 0) { console.error("FAIL nonfinite"); process.exit(1); }
console.log("P310_SERVED_PASS");
