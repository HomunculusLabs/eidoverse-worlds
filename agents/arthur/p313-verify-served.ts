// p313-verify-served.ts — polish-313 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the well-water disc survived:
//   (a) census: well_water node present; emissive material (glow lane) with
//       the water-blue factor present;
//   (b) the water mesh's POSITION: radius band within (0.60..0.64) — the
//       baseline had NO such disc at all, so any verts in this band at
//       y≈0.33 prove the cure survived the re-encode;
//   (c) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "c02d594e0873f4e4";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p313-served.glb", buf);
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

// (a) census
const node = (json.nodes ?? []).find((n: any) => n.name === "well_water");
if (!node) { console.error("FAIL: well_water node missing in served bytes"); process.exit(1); }
const glow = (json.materials ?? []).find((m: any) => Array.isArray(m.emissiveFactor));
if (!glow) { console.error("FAIL: no emissive material in served bytes"); process.exit(1); }
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
// (b) the well_water mesh: node.mesh indexes json.meshes
// (mesh-LOCAL coords: the disc is centered at local origin, thickness ±0.015;
//  the NODE translation carries world y 0.33 — gate BOTH layers, p311 law)
const nodeY = (node.translation ?? [0, 0, 0])[1];
const d = decodePos(node.mesh);
if (!("pos" in d) || !d.pos) { console.error("FAIL water mesh decode:", (d as any).err); process.exit(1); }
let waterVerts = 0, maxRad = 0, minRad = 9, yMin = 9, yMax = -9, nf = 0;
for (let i = 0; i < d.nPts!; i++) {
    const x = d.pos[i * 3], y = d.pos[i * 3 + 1], z = d.pos[i * 3 + 2];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nf++; continue; }
    const rad = Math.hypot(x, z);
    waterVerts++; if (rad > maxRad) maxRad = rad; if (rad < minRad) minRad = rad;
    if (y < yMin) yMin = y; if (y > yMax) yMax = y;
}
decoderModule.destroy(decoder);
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    wellWaterVerts: waterVerts, radius: [+minRad.toFixed(4), +maxRad.toFixed(4)],
    yLocal: [+yMin.toFixed(4), +yMax.toFixed(4)], nodeTranslationY: +nodeY.toFixed(4),
    emissive: glow.emissiveFactor, nonFinite: nonFinite + nf,
};
console.log(JSON.stringify(out, null, 1));
// GATES (RED impossible on baseline: no disc existed)
if (waterVerts < 14) { console.error("FAIL water verts", waterVerts); process.exit(1); }
if (maxRad < 0.60 || maxRad > 0.64) { console.error("FAIL water radius", maxRad); process.exit(1); }
if (Math.abs(yMin + 0.015) > 0.01 || Math.abs(yMax - 0.015) > 0.01) { console.error("FAIL water local y band", yMin, yMax); process.exit(1); }
if (Math.abs(nodeY - 0.33) > 0.01) { console.error("FAIL water node translation y", nodeY); process.exit(1); }
if (out.nonFinite !== 0) { console.error("FAIL nonfinite"); process.exit(1); }
console.log("P313_SERVED_PASS");
