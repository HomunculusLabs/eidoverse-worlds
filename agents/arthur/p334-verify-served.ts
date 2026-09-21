// p334-verify-served.ts — polish-334 served-bytes proof (struct-104 law).
// Chassis: p333-verify-served.ts (DRACO decode). Proves the pile fire-rim
// survived the store's DRACO re-encode:
//   (a) NEW: the pile bark bucket (pz3_6) binds a real glTF material whose
//       emissiveFactor is EXACTLY [0.055, 0.0321, 0.014] (the fire-rim);
//   (b) pile geometry gates (radial 2.95..4.25, grounding, height) and the
//       p330..333 regressions — potIron kettle underglow, cut faces,
//       benches/grain, both contact-shadow discs, anchors — all intact;
//   (c) 0 non-finite accessor bounds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "8f095330ef8bc1c7";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p334-served.glb", buf);
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
// (a) anchors + material census
const names = (json.nodes ?? []).map((n: any) => n.name);
for (const want of ["pz_kettle", "pz_kettle_0", "fire", "well_drum", "well_", "well_rope", "well_bucket", "well_water"]) {
    if (!names.includes(want)) fails.push(`node missing: ${want}`);
}
// NEW GATE: pile fire-rim material present with the exact factor, and bound
// by the pile bark bucket.
const WANT = [0.055, 0.0321, 0.014];
const rim = (json.materials ?? []).find((m: any) => Array.isArray(m.emissiveFactor) && Math.abs(m.emissiveFactor[0] - 0.055) < 1e-4);
if (!rim) {
    fails.push(`fire-rim material missing in served bytes (emissive set: ${JSON.stringify((json.materials ?? []).map((m: any) => [m.name, m.emissiveFactor]))})`);
} else {
    const f = rim.emissiveFactor;
    for (let i = 0; i < 3; i++) if (Math.abs(f[i] - WANT[i]) > 1e-4) fails.push(`fire-rim factor drift ch${i}: ${f[i]} (want ${WANT[i]})`);
    console.log(`fire-rim material '${rim.name}' emissiveFactor ${JSON.stringify(f)} EXACT`);
}
// binding: find the node whose primitive's material === rim
if (rim) {
    const rimIdx = (json.materials ?? []).indexOf(rim);
    const binders: string[] = [];
    for (const nd of json.nodes ?? []) {
        if (nd.mesh === undefined) continue;
        for (const prim of json.meshes[nd.mesh].primitives ?? []) {
            if (prim.material === rimIdx) binders.push(nd.name ?? `mesh#${nd.mesh}`);
        }
    }
    console.log("fire-rim bound by:", JSON.stringify(binders));
    if (binders.length === 0) fails.push("fire-rim material present but UNBOUND in served bytes");
    if (!binders.every((n) => /^pz3_\d+$/.test(n))) fails.push(`fire-rim bound by unexpected nodes: ${JSON.stringify(binders)}`);
}
// potIron regression (kettle underglow)
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
        const d = Math.abs(tt - 202.5); const dw = Math.min(d, 360 - d);
        if (dw < 90) { mnT = Math.min(mnT, tt); mxT = Math.max(mxT, tt); }
    }
    return { y: [mnY, mxY], rMin, rMax, th: [mnT, mxT], n: positions!.length / 3 };
}

// (b) p333 contact-shadow disc gates — unchanged regression
const discGates: Array<[string, number, number]> = [["pz3_8", 0.004, 0.0012], ["pz3_9", 0.008, 0.0012]];
for (const [nm, wantY, tol] of discGates) {
    const d = decodeNode(nm);
    if (!d) { fails.push(`${nm} (disc bucket) missing or undecodable in served bytes`); continue; }
    console.log(`disc ${nm}: verts ${d.n} y ${d.y[0].toFixed(4)}..${d.y[1].toFixed(4)} r ${d.rMin.toFixed(3)}..${d.rMax.toFixed(3)} theta ${d.th[0].toFixed(1)}..${d.th[1].toFixed(1)}`);
    if (Math.abs(d.y[0] - wantY) > tol || Math.abs(d.y[1] - wantY) > tol) fails.push(`${nm} y drift: ${d.y[0].toFixed(4)}..${d.y[1].toFixed(4)} (want flat ${wantY})`);
    if (d.rMin < 3.50 || d.rMax > 4.00) fails.push(`${nm} radial breach: r ${d.rMin.toFixed(3)}..${d.rMax.toFixed(3)}`);
    if (d.n < 20) fails.push(`${nm} vertex count ${d.n} (want >= 20)`);
}

// p332 pile geometry gates (bark + faces) — geometry unchanged by this edit
const bark = decodeNode("pz3_6");
if (!bark) fails.push("pz3_6 (pile bark bucket) missing or undecodable in served bytes");
else {
    console.log(`pile bark bucket: verts ${bark.n} y ${bark.y[0].toFixed(3)}..${bark.y[1].toFixed(3)} r ${bark.rMin.toFixed(3)}..${bark.rMax.toFixed(3)} theta ${bark.th[0].toFixed(1)}..${bark.th[1].toFixed(1)}`);
    if (bark.rMin < 2.95) fails.push(`pile radial breach inward: rMin ${bark.rMin.toFixed(3)}`);
    if (bark.rMax > 4.25) fails.push(`pile overshoot: rMax ${bark.rMax.toFixed(3)}`);
    if (bark.y[0] < -0.005 || bark.y[0] > 0.02) fails.push(`pile grounding drift: min y ${bark.y[0].toFixed(3)}`);
    if (bark.y[1] < 0.32 || bark.y[1] > 0.40) fails.push(`pile height drift: max y ${bark.y[1].toFixed(3)}`);
}
const faces = decodeNode("pz3_7");
if (!faces) fails.push("pz3_7 (pile cut-face bucket) missing or undecodable in served bytes");
else {
    console.log(`pile face bucket: verts ${faces.n} y ${faces.y[0].toFixed(3)}..${faces.y[1].toFixed(3)} r ${faces.rMin.toFixed(3)}..${faces.rMax.toFixed(3)}`);
    if (faces.rMin < 2.95) fails.push(`face radial breach inward: rMin ${faces.rMin.toFixed(3)}`);
    if (faces.rMax > 4.25) fails.push(`face overshoot: rMax ${faces.rMax.toFixed(3)}`);
}
const bench = decodeNode("pz3_1");
const grain = decodeNode("pz3_2");
if (!bench) fails.push("pz3_1 (bench bucket) missing or undecodable in served bytes");
else {
    console.log(`bench bucket: verts ${bench.n} y ${bench.y[0].toFixed(3)}..${bench.y[1].toFixed(3)} rMax ${bench.rMax.toFixed(3)}`);
    if (bench.y[0] < -0.005 || bench.y[0] > 0.005) fails.push(`bench grounding drift: min y ${bench.y[0].toFixed(3)}`);
    if (bench.y[1] < 0.17 || bench.y[1] > 0.22) fails.push(`bench top drift: max y ${bench.y[1].toFixed(3)}`);
    if (bench.rMax < 2.3 || bench.rMax > 2.55) fails.push(`bench length drift: rMax ${bench.rMax.toFixed(3)}`);
}
if (!grain) fails.push("pz3_2 (grain bucket) missing or undecodable in served bytes");
else {
    console.log(`grain bucket: verts ${grain.n} y ${grain.y[0].toFixed(3)}..${grain.y[1].toFixed(3)} rMax ${grain.rMax.toFixed(3)}`);
    if (grain.rMax < 2.3 || grain.rMax > 2.55) fails.push(`grain radial drift: rMax ${grain.rMax.toFixed(3)}`);
    if (Math.abs(grain.y[1] - 0.19) > 0.03) fails.push(`grain y drift: max ${grain.y[1].toFixed(3)}`);
}

if (fails.length) { console.error("P334_SERVED_FAIL:"); for (const f of fails) console.error(" -", f); process.exit(1); }
console.log("P334_SERVED_PASS");
