// p317-verify-served.ts — polish-317 served-bytes proof (struct-104 law).
// Chassis: p316-verify-served.ts. The store serves a DRACO re-encode; prove
// the rope mechanism survived:
//   (a) census: all polish-317 anchor NODES present (rope, knot, wrap,
//       tail, tail knot, pulley, sheave, bucket handle, both lugs);
//   (b) placement: rope column + knot + pulley + sheave + handle + lugs
//       mesh-local bounds + node translation = the authored y-bands;
//   (c) COLOR_0 families (p314 value-range lane law): rope/wrap/knot/tail
//       hemp tan (156,119,53), handle/lugs/sheave brass (90,92,17);
//   (d) regressions: water node + glow1, post_w_hi cast band 0.012,
//       lantern core glow3;
//   (e) 0 non-finite.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "605bb2c2eba1327d";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p317-served.glb", buf);
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
// decode positions AND colors (value-range lane law, p314)
function decodeMesh(meshIdx: number) {
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
    const posArr = new decoderModule.DracoFloat32Array();
    const pa = decoder.GetAttributeByUniqueId(dg, 0) ?? decoder.GetAttribute(dg, 0);
    decoder.GetAttributeFloatForAllPoints(dg, pa, posArr);
    const pos: number[] = [];
    let nf = 0;
    for (let i = 0; i < nPts * 3; i++) { const v = posArr.GetValue(i); pos.push(v); if (!Number.isFinite(v)) nf++; }
    decoderModule.destroy(posArr);
    // color attribute by value-range lane: unit-magnitude = normals, >1 = colors
    let color: number[] | null = null;
    const nAtt = dg.num_attributes();
    for (let ai = 0; ai < nAtt; ai++) {
        const att = decoder.GetAttribute(dg, ai);
        if (att.attribute_type() === decoderModule.COLOR) {
            const cArr = new decoderModule.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(dg, att, cArr);
            const vals: number[] = [];
            for (let i = 0; i < nPts * 3; i++) vals.push(cArr.GetValue(i));
            decoderModule.destroy(cArr);
            color = vals;
            break;
        }
    }
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { name, nPts, pos, nf, color };
}

const mats = (json.materials ?? []).map((m: any, i: number) => ({ i, name: m.name, ef: m.emissiveFactor ?? null }));
const byEf = (sig: number[]) => mats.find(m => Array.isArray(m.ef) && m.ef.length === sig.length && m.ef.every((v: number, k: number) => Math.abs(v - sig[k]) < 0.002));

const anchors = ["well_rope", "well_rope_knot", "well_rope_wrap", "well_rope_tail", "well_rope_tail_knot",
    "well_pulley", "well_pulley_sheave", "well_bucket_handle", "well_bucket_lug_w", "well_bucket_lug_e"];
const nodeTr: Record<string, any> = {};
for (const n of json.nodes ?? []) if (anchors.includes(n.name) || ["well_water", "well_post_w_hi", "well_lantern_core"].includes(n.name)) nodeTr[n.name] = n.translation ?? null;

const info: Record<string, any> = {};
for (let mi = 0; mi < json.meshes.length; mi++) {
    const nm = json.meshes[mi].name ?? "";
    if (anchors.includes(nm) || ["well_water", "well_post_w_hi", "well_lantern_core"].includes(nm)) {
        info[nm] = decodeMesh(mi);
    }
}

function band(name: string): { y: [number, number]; x: [number, number] } | null {
    const d = info[name];
    if (!d?.pos) return null;
    const t = nodeTr[name] ?? [0, 0, 0];
    let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
    for (let i = 0; i < d.nPts; i++) {
        minX = Math.min(minX, d.pos[i * 3] + t[0]); maxX = Math.max(maxX, d.pos[i * 3] + t[0]);
        minY = Math.min(minY, d.pos[i * 3 + 1] + t[1]); maxY = Math.max(maxY, d.pos[i * 3 + 1] + t[1]);
    }
    return { y: [+minY.toFixed(4), +maxY.toFixed(4)], x: [+minX.toFixed(4), +maxX.toFixed(4)] };
}
function firstColor(name: string): [number, number, number] | null {
    const c = info[name]?.color;
    if (!c) return null;
    // p314 law: classify by value range — UINT16 colors arrive scaled x257,
    // unit-range attributes are normals. Normalize both cases to 0..255.
    const s = c[0] > 300 ? 257 : 1; // 65535/255 = 257
    return [Math.round(c[0] / s), Math.round(c[1] / s), Math.round(c[2] / s)];
}

const out: Record<string, any> = {
    lib: `store/${SHA}.glb`,
    served_sha256: createHash("sha256").update(buf).digest("hex"),
    nodes: json.nodes.length, meshes: json.meshes.length,
    anchors: Object.fromEntries(anchors.map(a => [a, band(a)])),
    colors: Object.fromEntries(["well_rope", "well_rope_wrap", "well_rope_knot", "well_rope_tail", "well_bucket_handle", "well_bucket_lug_w", "well_pulley_sheave"].map(n => [n, firstColor(n)])),
    water: band("well_water"), postHi: band("well_post_w_hi"), lanternCore: band("well_lantern_core"),
    glow1: byEf([0.015, 0.0377, 0.0537])?.name ?? null,
    glow3: byEf([0.9, 0.5257, 0.2287])?.name ?? null,
    castBand: byEf([0.012, 0.007, 0.003])?.name ?? null,
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
decoderModule.destroy(decoder);

// GATES (p310 law: served dedupes meshes; node census + decode are the truth)
const g = (c: boolean, m: string) => { if (!c) { console.error("FAIL " + m); process.exit(1); } };
for (const a of anchors) g(!!nodeTr[a] || json.nodes.some((n: any) => n.name === a), `anchor node missing: ${a}`);
for (const a of anchors) g(!!info[a] && !info[a].err, `anchor mesh not decoded: ${a} (${info[a]?.err})`);
const rope = band("well_rope")!, wrap = band("well_rope_wrap")!, knot = band("well_rope_knot")!;
const sheave = band("well_pulley_sheave")!, lugE = band("well_bucket_lug_e")!, handle = band("well_bucket_handle")!;
g(Math.abs(rope.y[0] - 1.31) < 0.01 && Math.abs(rope.y[1] - 1.60) < 0.01, `rope band ${JSON.stringify(rope)}`);
g(Math.abs(wrap.y[0] - 1.587) < 0.01 && Math.abs(wrap.y[1] - 1.703) < 0.01, `wrap band ${JSON.stringify(wrap)}`);
g(Math.abs(knot.y[0] - 1.258) < 0.01 && Math.abs(knot.y[1] - 1.342) < 0.01, `knot band ${JSON.stringify(knot)}`);
g(Math.abs(sheave.y[0] - 1.632) < 0.01 && Math.abs(sheave.y[1] - 1.658) < 0.01, `sheave band ${JSON.stringify(sheave)}`);
g(lugE.y[0] > 1.213 && lugE.y[1] >= 1.24 && lugE.y[1] <= 1.244, `lug E band ${JSON.stringify(lugE)} (must crest 1.22 rim)`);
// handle: TorusGeometry(R 0.09, tube 0.011) centered y 1.22 -> apex 1.321
g(Math.abs(handle.y[0] - 1.209) < 0.012 && Math.abs(handle.y[1] - 1.321) < 0.012, `handle band ${JSON.stringify(handle)}`);
const cRope = firstColor("well_rope")!, cWrap = firstColor("well_rope_wrap")!;
const cHandle = firstColor("well_bucket_handle")!, cLug = firstColor("well_bucket_lug_w")!, cSheave = firstColor("well_pulley_sheave")!;
g(Math.abs(cRope[0] - 156) <= 6 && Math.abs(cRope[1] - 119) <= 6 && Math.abs(cRope[2] - 53) <= 6, `rope tan ${cRope}`);
g(Math.abs(cWrap[0] - 156) <= 6, `wrap tan ${cWrap}`);
g(Math.abs(cHandle[0] - 90) <= 6 && Math.abs(cHandle[1] - 92) <= 6 && Math.abs(cHandle[2] - 17) <= 6, `handle brass ${cHandle}`);
g(Math.abs(cLug[0] - 90) <= 6, `lug brass ${cLug}`);
g(Math.abs(cSheave[0] - 90) <= 6, `sheave brass ${cSheave}`);
g(out.glow1 && out.glow3 && out.castBand, "regression emissives missing");
const water = band("well_water")!;
g(Math.abs(water.y[0] - 0.315) < 0.01 && Math.abs(water.y[1] - 0.345) < 0.01, `water band ${JSON.stringify(water)}`);
g(nonFinite === 0, "accessor nonFinite");
let posNf = 0;
for (const a of anchors) posNf += info[a].nf ?? 0;
g(posNf === 0, `decoded pos nonFinite ${posNf}`);
console.log("P317_SERVED_PASS");
