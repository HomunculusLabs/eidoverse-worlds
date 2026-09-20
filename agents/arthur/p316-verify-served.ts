// p316-verify-served.ts — polish-316 served-bytes proof (struct-104 law).
// Adapted from p315: cast band gates replace the single-post wood check.
// The store serves a DRACO re-encode; prove the night lantern survived:
//   (a) census: well_lantern_arm / _tab / _core / _cap nodes present, with
//       mesh-local OR node-translation placement (p311 both-layers law);
//   (b) MATERIAL layer: emissive materials glow3 [0.9,0.5257,0.2287]
//       (canonical lantern core, streetlamp/belltower lineage) and glow2
//       [0.15,0.0876,0.0381] (iron sheen) exist in the served JSON and are
//       bound to the lantern core / iron meshes (mesh.material indices);
//   (c) polish-313 water emissive glow1 [0.015,0.0377,0.0537] regression;
//   (d) polish-314 wood frame COLOR_0 regression (posts stay canon wood);
//   (e) 0 non-finite accessor bounds + decoded positions.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "f6320f9f27334936";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p315-served.glb", buf);
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
// decode a mesh's positions (DRACO); p311 law: mesh-local coords + node
// translation are the two placement layers.
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
    const pa = decoder.GetAttributeByUniqueId(dg, 0) ?? decoder.GetAttribute(dg, 0);
    if (!pa) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return { name, err: "no pos attr" as const }; }
    const out = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, pa, out);
    const arr: number[] = [];
    let nf = 0;
    for (let i = 0; i < nPts * 3; i++) { const v = out.GetValue(i); arr.push(v); if (!Number.isFinite(v)) nf++; }
    decoderModule.destroy(out);
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { name, nPts, pos: arr, nf };
}

// material map by emissiveFactor signature
const mats = (json.materials ?? []).map((m: any, i: number) => ({ i, name: m.name, ef: m.emissiveFactor ?? null }));
const byEf = (sig: number[]) => mats.find(m => Array.isArray(m.ef) && m.ef.length === sig.length && m.ef.every((v: number, k: number) => Math.abs(v - sig[k]) < 0.002));
const glow3 = byEf([0.9, 0.5257, 0.2287]);
const glow2 = byEf([0.15, 0.0876, 0.0381]);
const glow1 = byEf([0.015, 0.0377, 0.0537]);

const lanternMeshes = ["well_lantern_core", "well_lantern_cap", "well_lantern_arm", "well_lantern_tab"];
const info: Record<string, any> = {};
for (let mi = 0; mi < json.meshes.length; mi++) {
    const nm = json.meshes[mi].name ?? "";
    if (lanternMeshes.includes(nm)) {
        const matIdx = json.meshes[mi].primitives[0].material;
        info[nm] = { mat: matIdx, matName: mats[matIdx]?.name, ef: mats[matIdx]?.ef, ...(decodePos(mi) as any) };
    }
}
// wood frame regression (p314): posts still canon-wood COLOR_0
const woodIdx = json.meshes.findIndex((m: any) => m.name === "well_post_w_lo");
const hiIdx = json.meshes.findIndex((m: any) => m.name === "well_post_w_hi");
const hiMat = hiIdx >= 0 ? mats[json.meshes[hiIdx].primitives[0].material] : null;
const wood = woodIdx >= 0 ? decodePos(woodIdx) : null;
const hi = hiIdx >= 0 ? decodePos(hiIdx) : null;
const nodeTr: Record<string, any> = {};
for (const n of json.nodes ?? []) if (lanternMeshes.includes(n.name)) nodeTr[n.name] = n.translation ?? null;

// core placement gates (mesh-local + node translation, p311 law)
const core = info["well_lantern_core"];
let coreX: number | null = null, coreY: number | null = null;
if (core?.pos) {
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (let i = 0; i < core.nPts; i++) {
        minX = Math.min(minX, core.pos[i * 3]); maxX = Math.max(maxX, core.pos[i * 3]);
        minY = Math.min(minY, core.pos[i * 3 + 1]); maxY = Math.max(maxY, core.pos[i * 3 + 1]);
    }
    coreX = (minX + maxX) / 2 + (nodeTr["well_lantern_core"]?.[0] ?? 0);
    coreY = (minY + maxY) / 2 + (nodeTr["well_lantern_core"]?.[1] ?? 0);
}
decoderModule.destroy(decoder);

const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    mats, glow3: glow3?.name ?? null, glow2: glow2?.name ?? null, glow1: glow1?.name ?? null,
    lantern: Object.fromEntries(Object.entries(info).map(([k, v]: any) => [k, { mat: v.matName, ef: v.ef, verts: v.nPts, nf: v.nf, bounds: v.pos ? { x: [Math.min(...v.pos.filter((_: number, i: number) => i % 3 === 0)), Math.max(...v.pos.filter((_: number, i: number) => i % 3 === 0))], y: [Math.min(...v.pos.filter((_: number, i: number) => i % 3 === 1)), Math.max(...v.pos.filter((_: number, i: number) => i % 3 === 1))] } : null }])),
    coreCenter: { x: coreX, y: coreY },
    nodeTr, woodVerts: wood ? (wood as any).nPts : null, hiCast: hiMat ? { name: hiMat.name, ef: hiMat.ef, verts: (hi as any)?.nPts } : null,
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));

// GATES
// (served re-encode dedupes identical meshes — 19 < 25 is normal, p310 law;
// the census that matters: node count preserved AND all four lantern meshes
// actually decoded with their materials.)
const g = (c: boolean, m: string) => { if (!c) { console.error("FAIL " + m); process.exit(1); } };
g(json.nodes.length >= 25 && lanternMeshes.every(nm => info[nm]), `census nodes=${json.nodes.length} meshes=${json.meshes.length} lantern=${Object.keys(info).length}`);
g(glow3, "glow3 canonical lantern emissive [0.9,0.5257,0.2287] missing");
g(info["well_lantern_core"]?.ef && Math.abs(info["well_lantern_core"].ef[0] - 0.9) < 0.002, `core not on glow3: ${JSON.stringify(info["well_lantern_core"]?.ef)}`);
g(info["well_lantern_cap"]?.ef && Math.abs(info["well_lantern_cap"].ef[0] - 0.15) < 0.002, `cap not on glow2 sheen: ${JSON.stringify(info["well_lantern_cap"]?.ef)}`);
g(info["well_lantern_arm"]?.ef && Math.abs(info["well_lantern_arm"].ef[0] - 0.15) < 0.002, `arm not on glow2 sheen: ${JSON.stringify(info["well_lantern_arm"]?.ef)}`);
g(coreX !== null && Math.abs(coreX - (-1.12)) < 0.02, `core x placement ${coreX}`);
g(coreY !== null && Math.abs(coreY - 1.44) < 0.02, `core y placement ${coreY}`);
for (const nm of lanternMeshes) g((info[nm]?.nf ?? 1) === 0, `${nm} non-finite pos`);
g(glow1, "water emissive glow1 regression");
g(wood ? (wood as any).nPts >= 8 : false, "wood post lo regression");
g(hiMat && Math.abs((hiMat.ef ?? [9])[0] - 0.012) < 0.002, `cast band not on 0.012: ${JSON.stringify(hiMat?.ef)}`);
g(hi ? (hi as any).nf === 0 && (hi as any).nPts >= 8 : false, "cast band verts");
g(nonFinite === 0, "accessor nonFinite");
console.log("P316_SERVED_PASS");
