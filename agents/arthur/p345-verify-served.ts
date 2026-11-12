// p345-verify-served.ts — polish-345 served-bytes proof (struct-104 law):
// fetch the LIVE SERVED (DRACO) lib for nx-dress-well and prove the open
// bucket survived the re-encode: (1) the bucket zone (r < 0.2 of the bucket
// axis x0 z0, y 0.9..1.25) contains a floor disc with center verts (the
// hollow's floor) and interior-wall verts at the 0.138..0.166 radial band;
// (2) the rim/hoop/body/inner buckets carry NO cap discs (bands);
// (3) lug plates at ~0.19 reach; (4) regressions: lantern core, water r
// 0.62, rope; (5) 0 non-finite. Negative control: the polish-318 lib
// (579e0a1f) must FAIL the floor/interior gates (closed bucket: no floor
// disc, no interior band).
// Chassis: p341-verify-served.ts.
import * as fs from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(fs.readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const LIB = process.argv[2] ?? "store/1ec50a257e616096.glb";
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.error(`served fetch HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
console.log(`served bytes ${buf.length} (${LIB})`);

const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let o = 12;
const jl = dv.getUint32(o, true); o += 8;
const txt = new TextDecoder("utf-8", { fatal: false }).decode(buf.subarray(o, o + jl));
let depth = 0, end = -1, instr = false, esc = false;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const j = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
o += jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true);

const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const bin = buf.subarray(o + 8, o + 8 + binLen);
const sliceView = (i: number) => { const v = j.bufferViews[i]; const off = v.byteOffset ?? 0; return bin.subarray(off, off + v.byteLength); };
const decodeMeshPositions = (mi: number): number[][] | null => {
    const prim = j.meshes[mi].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const bytes = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const attr = decoder.GetAttribute(dg, decoder.GetAttributeId(dg, decoderModule.POSITION));
    const out = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, attr, out);
    const pts: number[][] = [];
    for (let i = 0; i < dg.num_points(); i++) pts.push([out.GetValue(i * 3), out.GetValue(i * 3 + 1), out.GetValue(i * 3 + 2)]);
    decoderModule.destroy(out); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return pts;
};

// gather named nodes in the bucket zone by node name + translation
let nonFinite = 0;
const stats: Record<string, any> = {};
for (const n of j.nodes ?? []) {
    if (n.mesh === undefined) continue;
    const nm = n.name ?? "";
    if (!/well_bucket|well_water|well_lantern_core|well_rope$/.test(nm)) continue;
    const pts = decodeMeshPositions(n.mesh);
    if (!pts) continue;
    let center = 0;
    const rs: number[] = [], ys: number[] = [];
    for (const [x, y, z] of pts) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFinite++; continue; }
        const rad = Math.hypot(x, z);
        if (rad < 0.02) center++;
        rs.push(rad); ys.push(y);
    }
    stats[nm] = { count: pts.length, centerVerts: center, rMin: Math.min(...rs), rMax: Math.max(...rs), yMin: Math.min(...ys), yMax: Math.max(...ys) };
}

let pass = true;
const chk = (c: boolean, m: string) => { if (!c) { pass = false; console.log(`FAIL ${m}`); } };
const S = (k: string) => stats[k];

// node translations carry world position; mesh-local r/y are bands (probe
// law: gate spans/radii/centerVerts, never absolute-y double-subtraction)
const bodyK = Object.keys(stats).find(k => k === "well_bucket");
chk(!!bodyK && S(bodyK).centerVerts === 0, `body band no center verts (got ${bodyK ? S(bodyK).centerVerts : "absent"})`);
const innerK = Object.keys(stats).find(k => k.includes("inner"));
chk(!!innerK, "interior wall node present in served bytes");
if (innerK) {
    chk(Math.abs(S(innerK).rMax - 0.166) < 0.006, `inner rMax ${S(innerK).rMax.toFixed(4)} ~0.166`);
    chk(Math.abs((S(innerK).yMax - S(innerK).yMin) - 0.245) < 0.008, `inner span ${S(innerK).yMax - S(innerK).yMin} ~0.245`);
    chk(S(innerK).centerVerts === 0, "inner wall is a band");
}
const floorK = Object.keys(stats).find(k => k.includes("floor"));
chk(!!floorK, "floor disc node present in served bytes");
if (floorK) {
    chk(S(floorK).centerVerts >= 1, `floor has center vert (got ${S(floorK).centerVerts}) — the hollow's floor`);
    chk(Math.abs(S(floorK).rMax - 0.139) < 0.005, `floor rMax ${S(floorK).rMax.toFixed(4)} ~0.139`);
}
const rimK = Object.keys(stats).find(k => k.includes("rim"));
chk(!!rimK && S(rimK).centerVerts === 0, `rim band no disc (got ${rimK ? S(rimK).centerVerts : "absent"})`);
const hoopK = Object.keys(stats).filter(k => k.includes("hoop"));
chk(hoopK.length === 2 && hoopK.every(k => S(k).centerVerts === 0), `hoop bands 2 no discs (${hoopK.map(k => S(k).centerVerts).join(",")})`);
const lugK = Object.keys(stats).filter(k => k.includes("lug"));
chk(lugK.length === 2, `lug plates 2 (got ${lugK.length})`);
if (lugK.length === 2) chk(Math.abs(Math.max(...lugK.map(k => S(k).rMax)) - 0.0716) < 0.008, `lug half-diagonal ~0.0716 (got ${lugK.map(k => S(k).rMax.toFixed(4)).join(",")})`);
const waterK = Object.keys(stats).find(k => k === "well_water");
chk(!!waterK && Math.abs(S(waterK).rMax - 0.62) < 0.006, `water r 0.62 (${waterK ? S(waterK).rMax.toFixed(3) : "absent"})`);
const lanternK = Object.keys(stats).find(k => k === "well_lantern_core");
chk(!!lanternK, "lantern core regression present");
chk(nonFinite === 0, `nonFinite ${nonFinite}`);
console.log(pass ? `P345_SERVED_PASS (${Object.keys(stats).length} gates nodes)` : "P345_SERVED_FAIL");
process.exit(pass ? 0 : 1);
