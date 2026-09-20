// p330-verify-served.ts — polish-330 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the kettle re-author survived:
//   (a) census: pz_kettle KEEP group + merged child present; potIron
//       emissive material with factor [0.15,0.0876,0.0381] present;
//   (b) kettle mesh POSITION y-band 0.90..1.80 (pot+links envelope),
//       x/z radius < 0.30 (confined to the fire column);
//   (c) anchors survive: fire, well_drum, well_, well_rope, well_bucket,
//       well_water;
//   (d) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "0bb8fb0e973e6b35";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p330-served.glb", buf);
console.log("served sha256:", createHash("sha256").update(buf).digest("hex").slice(0, 16), "bytes:", buf.length);
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

const fails: string[] = [];
// (a) census
const names = (json.nodes ?? []).map((n: any) => n.name);
for (const want of ["pz_kettle", "pz_kettle_0", "fire", "well_drum", "well_", "well_rope", "well_bucket", "well_water"]) {
    if (!names.includes(want)) fails.push(`node missing: ${want}`);
}
const pot = (json.materials ?? []).find((m: any) => m.name === "potIron");
if (!pot) fails.push("potIron material missing in served bytes");
else {
    const f = pot.emissiveFactor;
    if (!Array.isArray(f) || Math.abs(f[0] - 0.15) > 1e-4 || Math.abs(f[1] - 0.0876) > 1e-4 || Math.abs(f[2] - 0.0381) > 1e-4)
        fails.push(`potIron emissiveFactor drift: ${JSON.stringify(f)}`);
    if (!pot.pbrMetallicRoughness?.baseColorTexture) fails.push("potIron lost its baseColorTexture");
}
console.log("served nodes:", json.nodes.length, "meshes:", json.meshes.length, "materials:", json.materials?.length);

// (d) non-finite accessor bounds
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
if (nonFinite > 0) fails.push(`${nonFinite} non-finite accessor bounds`);

// (b) decode the kettle mesh
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const kNode = (json.nodes ?? []).find((n: any) => n.name === "pz_kettle_0");
const mi = kNode?.mesh;
if (mi === undefined) fails.push("pz_kettle_0 has no mesh");
else {
    const prim = json.meshes[mi].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    const posAcc = ext ? null : prim.attributes.POSITION;
    let positions: Float32Array | null = null;
    if (ext) {
        const v = json.bufferViews[ext.bufferView];
        const off = v.byteOffset ?? 0;
        const bytes = bin.subarray(off, off + v.byteLength);
        const dbuf = new decoderModule.DecoderBuffer();
        dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
        const dmesh = new decoderModule.Mesh();
        const st = decoder.DecodeBufferToMesh(dbuf, dmesh);
        if (!st.ok()) { fails.push("draco decode failed: " + st.error()); }
        else {
            // p313 proven pattern: POSITION enum + GetAttribute +
            // DracoFloat32Array receiver (raw Float32Array writes nothing)
            const id = decoder.GetAttributeId(dmesh, decoderModule.POSITION);
            const a = decoder.GetAttribute(dmesh, id);
            const out = new decoderModule.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(dmesh, a, out);
            const n = dmesh.num_points();
            positions = new Float32Array(n * 3);
            for (let i = 0; i < n * 3; i++) positions[i] = out.GetValue(i);
            decoderModule.destroy(out);
        }
        decoderModule.destroy(dmesh); decoderModule.destroy(dbuf);
    } else {
        const acc = json.accessors[posAcc];
        const v = json.bufferViews[acc.bufferView];
        const off = (v.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        positions = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
    }
    if (positions) {
        let mnY = Infinity, mxY = -Infinity, mxR = 0, bad = 0;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i], y = positions[i + 1], z = positions[i + 2];
            if (![x, y, z].every(Number.isFinite)) { bad++; continue; }
            mnY = Math.min(mnY, y); mxY = Math.max(mxY, y);
            mxR = Math.max(mxR, Math.hypot(x, z));
        }
        console.log(`kettle verts ${positions.length / 3}: y ${mnY.toFixed(3)}..${mxY.toFixed(3)} maxR ${mxR.toFixed(3)} nonFinite ${bad}`);
        if (mnY < 0.90 || mxY > 1.80) fails.push(`kettle y-band drift: ${mnY.toFixed(3)}..${mxY.toFixed(3)}`);
        if (mxR > 0.30) fails.push(`kettle radius drift: ${mxR.toFixed(3)}`);
        if (bad > 0) fails.push(`${bad} non-finite kettle verts`);
    }
}

if (fails.length) { console.error("P330_SERVED_FAIL:"); for (const f of fails) console.error(" -", f); process.exit(1); }
console.log("P330_SERVED_PASS");
