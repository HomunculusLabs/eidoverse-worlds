// p331-verify-served.ts — polish-331 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the bench re-author survived:
//   (a) anchors present: pz_kettle KEEP group + merged child, fire, well
//       family (motion comp targets must survive);
//   (b) the bench bucket (pz3_1) + grain bucket (pz3_2) decode to the
//       authored geometry: benches y 0.00..0.21 (grounded, 0.198 top),
//       extent radius ~1.86 (full-length union with discs removed in
//       polish-331 — benches alone reach r 2.475); grain discs concentric
//       with the bench ring, y band matching the bench centerline;
//   (c) 0 non-finite accessor bounds.
// Bench-vs-grain identification: pz3_1 (mat index of the 0x6c5426 rough-0.9
// flat log material) and pz3_2 (0x9e8e46 grain material) — the plain-mat
// buckets are unmapped in glbwrite (COLOR_0 carries color); identify by
// accessor count (232 = 4 logs / 4 discs) and by DECODED geometry: the
// grain discs are thin (y-extent < 0.16 ell = 0.198 at the widest points),
// benches thick. Cross-check: log-material bucket (COLOR_0 0x6c5426-major)
// spans y 0..0.2 with radius up to ~2.48 incl. its discs.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "74f16c88b1e9c739";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p331-served.glb", buf);
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
const pot = (json.materials ?? []).find((m: any) => m.name === "potIron");
if (!pot) fails.push("potIron material missing in served bytes");
else {
    const f = pot.emissiveFactor;
    if (!Array.isArray(f) || Math.abs(f[0] - 0.15) > 1e-4 || Math.abs(f[1] - 0.0876) > 1e-4 || Math.abs(f[2] - 0.0381) > 1e-4)
        fails.push(`potIron emissiveFactor drift: ${JSON.stringify(f)}`);
}
console.log("served nodes:", json.nodes.length, "meshes:", json.meshes.length, "materials:", json.materials?.length);

// (c) non-finite accessor bounds
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
if (nonFinite > 0) fails.push(`${nonFinite} non-finite accessor bounds`);

// (b) decode bench + grain buckets
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
function decodeNode(name: string): { y: [number, number]; rMax: number; n: number } | null {
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
    let mnY = Infinity, mxY = -Infinity, rMax = 0;
    for (let i = 0; i < positions!.length; i += 3) {
        const x = positions![i], y = positions![i + 1], z = positions![i + 2];
        if (![x, y, z].every(Number.isFinite)) continue;
        mnY = Math.min(mnY, y); mxY = Math.max(mxY, y);
        rMax = Math.max(rMax, Math.hypot(x, z));
    }
    return { y: [mnY, mxY], rMax, n: positions!.length / 3 };
}
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

if (fails.length) { console.error("P331_SERVED_FAIL:"); for (const f of fails) console.error(" -", f); process.exit(1); }
console.log("P331_SERVED_PASS");
