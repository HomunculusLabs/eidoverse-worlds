// p314-verify-served.ts — polish-314 served-bytes proof (struct-104 law).
// The store serves a DRACO re-encode; prove the wood-frame recolor survived:
//   (a) census: well_post_w / well_post_e / well_crossbar nodes present;
//   (b) COLOR_0 of each frame mesh = canon wood 0xa09832 (linear floats-as-
//       bytes, p307 law) with ZERO dark-olive 0x44402e remnants;
//   (c) node translations still place the frame (posts x ±0.8, y 0.85;
//       crossbar y 1.72) — the shape layer, p311 both-layers law;
//   (d) well_water disc (polish-313) still present with emissive;
//   (e) 0 non-finite accessor bounds + decoded positions.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "38ab2eef4aee6106";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p314-served.glb", buf);
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
    // p314 law: the served re-encode assigns generic attribute ids per-mesh
    // NON-deterministically (post_w COLOR=1/NORMAL=2, siblings swapped) and
    // GetAttributeId can disagree with GetAttribute. Classify candidates
    // neutrally instead: read every non-position attribute; the COLOR lane is
    // the one with any |v| > 1.5 (colors are ~[0..255]; normals are units).
    const readById = (id: number) => {
        const a = decoder.GetAttribute(dg, id);
        if (!a) return null;
        const out = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(dg, a, out);
        const nc = a.num_components() as number;
        if (nc !== 3) { decoderModule.destroy(out); return null; }
        const arr: number[] = [];
        for (let i = 0; i < nPts * nc; i++) arr.push(out.GetValue(i));
        decoderModule.destroy(out);
        return arr;
    };
    const pos = readById(0);
    let col: number[] | null = null;
    for (let id = 1; id < 4 && !col; id++) {
        const cand = readById(id);
        if (!cand) continue;
        const beyondUnit = cand.some((v) => Math.abs(v) > 1.5);
        if (beyondUnit) col = cand;
    }
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { name, nPts, pos, col };
}

// wood 0xa09832 sRGB (160,152,50); old dark 0x44402e (68,64,46)
const lin = (b: number[]) => b.map((v) => Math.round(((v / 255) ** 2.2) * 255));
const WOODL = lin([160, 152, 50]), DARKL = lin([68, 64, 46]);

const wanted = ["well_post_w", "well_post_e", "well_crossbar", "well_water"];
const found: Record<string, any> = {};
const nodeInfo: Record<string, any> = {};
for (const n of json.nodes ?? []) {
    if (wanted.includes(n.name)) nodeInfo[n.name] = n;
}
for (let mi = 0; mi < json.meshes.length; mi++) {
    const nm = json.meshes[mi].name ?? "";
    if (wanted.includes(nm)) found[nm] = decodeAttrs(mi);
}
decoderModule.destroy(decoder);

const frame: Record<string, any> = {};
for (const nm of ["well_post_w", "well_post_e", "well_crossbar"]) {
    const d = found[nm];
    if (!d || !("col" in d) || !d.col) { frame[nm] = { missing: true }; continue; }
    let wood = 0, dark = 0, other = 0, nf = 0;
    const seen = new Set<string>();
    for (let i = 0; i < d.nPts!; i++) {
        seen.add([0, 1, 2].map((k) => Math.round(d.col[i * 3 + k])).join(","));
        const rgb = [d.col[i * 3], d.col[i * 3 + 1], d.col[i * 3 + 2]].map(Math.round);
        if (rgb.every((v, k) => Math.abs(v - WOODL[k]) <= 5)) wood++;
        else if (rgb.every((v, k) => Math.abs(v - DARKL[k]) <= 5)) dark++;
        else other++;
        for (let k = 0; k < 3; k++) if (!Number.isFinite(d.pos![i * 3 + k])) nf++;
    }
    frame[nm] = { verts: d.nPts, wood, dark, other, nf, colors: [...seen] };
}
const water = found["well_water"];
const glow = (json.materials ?? []).find((m: any) => Array.isArray(m.emissiveFactor));
const out = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    frame, waterVerts: water && "nPts" in water ? water.nPts : null,
    waterEmissive: glow?.emissiveFactor ?? null,
    postTranslations: {
        w: nodeInfo["well_post_w"]?.translation ?? null,
        e: nodeInfo["well_post_e"]?.translation ?? null,
        crossbar: nodeInfo["well_crossbar"]?.translation ?? null,
    },
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
// GATES
const g = (c: boolean, m: string) => { if (!c) { console.error("FAIL " + m); process.exit(1); } };
for (const nm of ["well_post_w", "well_post_e", "well_crossbar"]) {
    const f = frame[nm];
    g(f && f.verts, `${nm} missing/not decoded`);
    g(f.wood >= f.verts * 0.9, `${nm} not wood-colored: ${JSON.stringify(f)}`);
    g(f.dark === 0, `${nm} dark remnants: ${JSON.stringify(f)}`);
    g(f.nf === 0, `${nm} non-finite pos`);
}
g(out.waterVerts !== null && out.waterVerts >= 14, "well_water lost in re-encode");
g(Array.isArray(out.waterEmissive), "water emissive lost");
const tw = out.postTranslations.w, te = out.postTranslations.e, tc = out.postTranslations.crossbar;
g(tw && Math.abs(tw[0] + 0.8) < 0.01 && Math.abs(tw[1] - 0.85) < 0.01, `post_w translation ${JSON.stringify(tw)}`);
g(te && Math.abs(te[0] - 0.8) < 0.01 && Math.abs(te[1] - 0.85) < 0.01, `post_e translation ${JSON.stringify(te)}`);
g(tc && Math.abs(tc[1] - 1.72) < 0.01, `crossbar translation ${JSON.stringify(tc)}`);
g(nonFinite === 0, "accessor nonFinite");
console.log("P314_SERVED_PASS");
