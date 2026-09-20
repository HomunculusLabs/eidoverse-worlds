// p318-verify-served.ts — polish-318 served-bytes proof (struct-104 law).
// Chassis: p317-verify-served.ts. The store serves a DRACO re-encode; prove
// the coopered bucket survived:
//   (a) census: the new bucket anchor NODES present (body, rim, both hoops)
//       + all polish-317 mechanism anchors + regressions;
//   (b) placement: bucket body tapered octagon bands (y 0.94..1.22, r_top
//       0.17 > r_base 0.14), rim ring y 1.205..1.24 r 0.185, hoops at
//       1.148..1.172 / 1.008..1.032 — mesh-local bounds + node translation;
//   (c) COLOR_0 families (p314 value-range lane law): hoops/rim gunmetal
//       (61,64,70 = 0x3d4046), rope tan, handle/lug/sheave brass;
//   (d) regressions: water glow1, post_w_hi cast band 0.012, lantern glow3;
//   (e) 0 non-finite.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const base = "https://eidoverse.billding.dev";
const SHA = "579e0a1faa446680";
const r = await fetch(`${base}/library/store/${SHA}.glb`);
if (!r.ok) { console.error("HTTP", r.status); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p318-served.glb", buf);
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

const anchors = ["well_bucket", "well_bucket_rim", "well_bucket_hoop_hi", "well_bucket_hoop_lo",
    "well_rope", "well_rope_knot", "well_rope_wrap", "well_pulley", "well_pulley_sheave",
    "well_bucket_handle", "well_bucket_lug_w", "well_bucket_lug_e"];
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
function maxRad(name: string): number | null {
    const d = info[name];
    if (!d?.pos) return null;
    const t = nodeTr[name] ?? [0, 0, 0];
    let m = 0;
    for (let i = 0; i < d.nPts; i++) {
        const x = d.pos[i * 3] + t[0], z = d.pos[i * 3 + 2] + t[2];
        m = Math.max(m, Math.hypot(x, z));
    }
    return +m.toFixed(4);
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
    bucket: {
        body: { band: band("well_bucket"), maxRad: maxRad("well_bucket") },
        rim: { band: band("well_bucket_rim"), maxRad: maxRad("well_bucket_rim") },
        hoop_hi: { band: band("well_bucket_hoop_hi"), maxRad: maxRad("well_bucket_hoop_hi") },
        hoop_lo: { band: band("well_bucket_hoop_lo"), maxRad: maxRad("well_bucket_hoop_lo") },
    },
    colors: Object.fromEntries(["well_bucket", "well_bucket_rim", "well_bucket_hoop_hi", "well_bucket_hoop_lo", "well_rope", "well_bucket_handle", "well_pulley_sheave"].map(n => [n, firstColor(n)])),
    water: band("well_water"), lanternCore: band("well_lantern_core"),
    glow1: byEf([0.015, 0.0377, 0.0537])?.name ?? null,
    glow3: byEf([0.9, 0.5257, 0.2287])?.name ?? null,
    castBand: byEf([0.012, 0.007, 0.003])?.name ?? null,
    nonFinite,
};
console.log(JSON.stringify(out, null, 1));
decoderModule.destroy(decoder);

// GATES (p310 law: served dedupes meshes; node census + decode are the truth)
const g = (c: boolean, m: string) => { if (!c) { console.error("FAIL " + m); process.exit(1); } };
for (const a of anchors) g(json.nodes.some((n: any) => n.name === a), `anchor node missing: ${a}`);
for (const a of anchors) g(!!info[a] && !info[a].err, `anchor mesh not decoded: ${a} (${info[a]?.err})`);
const body = band("well_bucket")!, rim = band("well_bucket_rim")!;
const hoopHi = band("well_bucket_hoop_hi")!, hoopLo = band("well_bucket_hoop_lo")!;
g(Math.abs(body.y[0] - 0.94) < 0.01 && Math.abs(body.y[1] - 1.22) < 0.01, `body band ${JSON.stringify(body)}`);
// taper: top radius > base radius (authored 0.17 vs 0.14); maxRad of the
// whole body is the top 0.17; prove the base is narrower via y-stratified radii
const dBody = info["well_bucket"];
const tBody = nodeTr["well_bucket"] ?? [0, 0, 0];
let rTop = 0, rBase = 0;
for (let i = 0; i < dBody.nPts; i++) {
    const y = dBody.pos[i * 3 + 1] + tBody[1];
    const rr = Math.hypot(dBody.pos[i * 3] + tBody[0], dBody.pos[i * 3 + 2] + tBody[2]);
    if (y > 1.18) rTop = Math.max(rTop, rr);
    if (y < 0.99) rBase = Math.max(rBase, rr);
}
g(Math.abs(rTop - 0.17) < 0.01, `body top radius ${rTop.toFixed(4)} (want 0.17)`);
g(Math.abs(rBase - 0.14) < 0.01, `body base radius ${rBase.toFixed(4)} (want 0.14 — TAPER)`);
g(Math.abs(rim.y[0] - 1.205) < 0.01 && Math.abs(rim.y[1] - 1.24) < 0.01, `rim band ${JSON.stringify(rim)}`);
g(Math.abs(maxRad("well_bucket_rim")! - 0.185) < 0.01, `rim radius ${maxRad("well_bucket_rim")}`);
g(Math.abs(hoopHi.y[0] - 1.148) < 0.01 && Math.abs(hoopHi.y[1] - 1.172) < 0.01, `hoop_hi band ${JSON.stringify(hoopHi)}`);
g(Math.abs(hoopLo.y[0] - 1.008) < 0.01 && Math.abs(hoopLo.y[1] - 1.032) < 0.01, `hoop_lo band ${JSON.stringify(hoopLo)}`);
const cRim = firstColor("well_bucket_rim")!, cHoop = firstColor("well_bucket_hoop_hi")!;
// p318 law (calibration self-catch): served COLOR_0 on material-lane meshes
// is LINEAR-space — 0x3d4046 (61,64,70) sRGB -> (12,13,16) linear (same
// class as p317's rope "tan (156,119,53)" = linear of 0xcdb67e).
g(Math.abs(cRim[0] - 12) <= 4 && Math.abs(cRim[1] - 13) <= 4 && Math.abs(cRim[2] - 16) <= 4, `rim gunmetal linear ${cRim} (authored 0x3d4046)`);
g(Math.abs(cHoop[0] - 12) <= 4, `hoop gunmetal linear ${cHoop}`);
const cBody = firstColor("well_bucket")!;
g(Math.abs(cBody[0] - 48) <= 6, `body C.MID linear ${cBody} (authored 0x787250)`);
const cRope = firstColor("well_rope")!;
g(Math.abs(cRope[0] - 156) <= 6, `rope tan regression ${cRope}`);
const cHandle = firstColor("well_bucket_handle")!;
g(Math.abs(cHandle[0] - 90) <= 6, `handle brass regression ${cHandle}`);
g(out.glow1 && out.glow3 && out.castBand, "regression emissives missing");
const water = band("well_water")!;
g(Math.abs(water.y[0] - 0.315) < 0.01 && Math.abs(water.y[1] - 0.345) < 0.01, `water band ${JSON.stringify(water)}`);
g(nonFinite === 0, "accessor nonFinite");
let posNf = 0;
for (const a of anchors) posNf += info[a].nf ?? 0;
g(posNf === 0, `decoded pos nonFinite ${posNf}`);
console.log("P318_SERVED_PASS");
