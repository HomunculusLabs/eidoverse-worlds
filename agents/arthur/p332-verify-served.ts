// p332-verify-served.ts — polish-332 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the woodpile rebuild survived:
//   (a) anchors: pz_kettle group + merged child, fire, well_* family;
//   (b) potIron emissive (p330 regression) exact;
//   (c) NEW pile buckets: pz3_6 (bark) confined to the pile radial band
//       rMin > 3.0 (nothing inside the ring) and rMax <= 4.25 (no
//       overshoot), y 0.005..0.36 (grounded on bearers); pz3_7 (cut faces)
//       y 0.1..0.35, rMax <= 4.25;
//   (d) REGRESSIONS: bench bucket pz3_1 y 0..0.21 rMax ~2.475, grain
//       bucket pz3_2 rMax ~2.485 (polish-331 gates);
//   (e) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "ad165b6ee4f0d0e4";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p332-served.glb", buf);
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
// (a) anchors
const names = (json.nodes ?? []).map((n: any) => n.name);
for (const want of ["pz_kettle", "pz_kettle_0", "fire", "well_drum", "well_", "well_rope", "well_bucket", "well_water"]) {
    if (!names.includes(want)) fails.push(`node missing: ${want}`);
}
// (b) potIron emissive (p330)
const pot = (json.materials ?? []).find((m: any) => m.name === "potIron");
if (!pot) fails.push("potIron material missing in served bytes");
else {
    const f = pot.emissiveFactor;
    if (!Array.isArray(f) || Math.abs(f[0] - 0.15) > 1e-4 || Math.abs(f[1] - 0.0876) > 1e-4 || Math.abs(f[2] - 0.0381) > 1e-4)
        fails.push(`potIron emissiveFactor drift: ${JSON.stringify(f)}`);
}
console.log("served nodes:", json.nodes.length, "meshes:", json.meshes.length, "materials:", json.materials?.length);

// (e) non-finite accessor bounds
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
if (nonFinite > 0) fails.push(`${nonFinite} non-finite accessor bounds`);

// draco decode helper: y band + radial min/max + theta band
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
function decodeNode(name: string): { y: [number, number]; rMin: number; rMax: number; th: [number, number]; n: number } | null {
    const node = (json.nodes ?? []).find((n: any) => n.name === name);
    const mi = node?.mesh;
    if (mi === undefined) return null;
    const prim = json.meshes[mi].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    let positions: Float32Array | null = null;
    if (ext) {
        const v = json.bufferViews[ext.bufferView];
        const off = v.byteOffset ?? 0;
        const axes = bin.subarray(off, off + v.byteLength);
        const dbuf = new decoderModule.DecoderBuffer();
        dbuf.Init(new Int8Array(axes.buffer, axes.byteOffset, axes.byteLength), axes.byteLength);
        const dmesh = new decoderModule.Mesh();
        const st = decoder.DecodeBufferToMesh(dbuf, dmesh);
        if (!st.ok()) { console.error("draco fail", name, st.error()); return null; }
        const id = decoder.GetAttributeId(dmesh, decoderModule.POSITION);
        const a = decoder.GetAttribute(dmesh, id);
        const out = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dmesh, a, out);
        const n = dmesh.num_points();
        positions = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i++) positions[i] = out.GetValue(i);
        decoderModule.destroy(out); decoderModule.destroy(dmesh); decoderModule.destroy(dbuf);
    } else {
        const acc = json.accessors[prim.attributes.POSITION];
        const v = json.bufferViews[acc.bufferView];
        const off = (v.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        positions = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
    }
    let mnY = Infinity, mxY = -Infinity, rMin = Infinity, rMax = 0, mnT = 360, mxT = 0;
    for (let i = 0; i < positions!.length; i += 3) {
        const x = positions![i], y = positions![i + 1], z = positions![i + 2];
        if (![x, y, z].every(Number.isFinite)) continue;
        mnY = Math.min(mnY, y); mxY = Math.max(mxY, y);
        const rr = Math.hypot(x, z); rMin = Math.min(rMin, rr); rMax = Math.max(rMax, rr);
        const tt = (Math.atan2(z, x) * 180 / Math.PI + 360) % 360;
        // angular proximity to 202.5deg, handling wrap
        const d = Math.abs(tt - 202.5); const dw = Math.min(d, 360 - d);
        if (dw < 90) { mnT = Math.min(mnT, tt); mxT = Math.max(mxT, tt); }
    }
    return { y: [mnY, mxY], rMin, rMax, th: [mnT, mxT], n: positions!.length / 3 };
}

// (c) NEW pile gates
const bark = decodeNode("pz3_6");
if (!bark) fails.push("pz3_6 (pile bark bucket) missing or undecodable in served bytes");
else {
    console.log(`pile bark bucket: verts ${bark.n} y ${bark.y[0].toFixed(3)}..${bark.y[1].toFixed(3)} r ${bark.rMin.toFixed(3)}..${bark.rMax.toFixed(3)} theta ${bark.th[0].toFixed(1)}..${bark.th[1].toFixed(1)}`);
    if (bark.rMin < 2.95) fails.push(`pile radial breach inward: rMin ${bark.rMin.toFixed(3)} (want > 3.0 — nothing inside the ring)`);
    if (bark.rMax > 4.25) fails.push(`pile overshoot: rMax ${bark.rMax.toFixed(3)} (want <= 4.25)`);
    if (bark.y[0] < -0.005 || bark.y[0] > 0.02) fails.push(`pile grounding drift: min y ${bark.y[0].toFixed(3)} (want ~0)`);
    if (bark.y[1] < 0.32 || bark.y[1] > 0.40) fails.push(`pile height drift: max y ${bark.y[1].toFixed(3)} (want ~0.36)`);
}
const faces = decodeNode("pz3_7");
if (!faces) fails.push("pz3_7 (pile cut-face bucket) missing or undecodable in served bytes");
else {
    console.log(`pile face bucket: verts ${faces.n} y ${faces.y[0].toFixed(3)}..${faces.y[1].toFixed(3)} r ${faces.rMin.toFixed(3)}..${faces.rMax.toFixed(3)}`);
    if (faces.rMin < 2.95) fails.push(`face radial breach inward: rMin ${faces.rMin.toFixed(3)}`);
    if (faces.rMax > 4.25) fails.push(`face overshoot: rMax ${faces.rMax.toFixed(3)}`);
}

// (d) REGRESSIONS (p331 gates)
const bench = decodeNode("pz3_1");
const grain = decodeNode("pz3_2");
if (!bench) fails.push("pz3_1 (bench bucket) missing or undecodable in served bytes");
else {
    console.log(`bench bucket: verts ${bench.n} y ${bench.y[0].toFixed(3)}..${bench.y[1].toFixed(3)} rMax ${bench.rMax.toFixed(3)}`);
    if (bench.y[0] < -0.005 || bench.y[0] > 0.005) fails.push(`bench grounding drift: min y ${bench.y[0].toFixed(3)} (want 0)`);
    if (bench.y[1] < 0.17 || bench.y[1] > 0.22) fails.push(`bench top drift: max y ${bench.y[1].toFixed(3)} (want ~0.198)`);
    if (bench.rMax < 2.3 || bench.rMax > 2.55) fails.push(`bench length drift: rMax ${bench.rMax.toFixed(3)} (want ~2.475 tip)`);
}
if (!grain) fails.push("pz3_2 (grain bucket) missing or undecodable in served bytes");
else {
    console.log(`grain bucket: verts ${grain.n} y ${grain.y[0].toFixed(3)}..${grain.y[1].toFixed(3)} rMax ${grain.rMax.toFixed(3)}`);
    if (grain.rMax < 2.3 || grain.rMax > 2.55) fails.push(`grain radial drift: rMax ${grain.rMax.toFixed(3)} (want ~2.485)`);
    if (Math.abs(grain.y[1] - 0.19) > 0.03) fails.push(`grain y drift: max ${grain.y[1].toFixed(3)}`);
}

if (fails.length) { console.error("P332_SERVED_FAIL:"); for (const f of fails) console.error(" -", f); process.exit(1); }
console.log("P332_SERVED_PASS");
