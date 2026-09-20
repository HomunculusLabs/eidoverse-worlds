// p324-verify-served.ts — polish-324 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-dress-fountain lib
// and prove the polish-324 drum cure survived the re-encode:
//  (1) ft_drum_0/1/2 present with STEPPED radii (0.435 > 0.365 > 0.295 —
//      the 7cm reveals) and course heights 0.36/0.36/0.38;
//  (2) the old smooth ft_pedestal node ABSENT;
//  (3) top course carries the cool night-spill emissive [0.017,0.029,0.036]
//      (glow family) while drum_0/1 are COLOR_0 limestone 0x75705a;
//  (4) polish-320..323 regressions intact (4 emissive water/finial families,
//      12 bowed strands, 6 squashed pads, 6 vertical fins, crown squash +
//      radial width, finial radius);
//  (5) 0 non-finite (accessor bounds).
// Chassis: p323-verify-served.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/9e6b197741bdd227.glb";
const UPLOAD_SHA = "9e6b197741bdd227e25de9fbc76999f97dc0ae525c03e17f352422dd3e3ae980";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p324-served.glb", buf);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

const jl = dv.getUint32(12, true);
const txt = new TextDecoder().decode(buf.subarray(20, 20 + jl));
let depth = 0, instr = false, esc = false, end = -1;
for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (instr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') instr = false; }
    else if (c === '"') instr = true;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const json = JSON.parse(txt.slice(0, end === -1 ? txt.length : end));
let o = 20 + jl + ((4 - (jl % 4)) % 4);
const binLen = dv.getUint32(o, true); o += 8;
const bin = buf.subarray(o, o + binLen);

let fails = 0;
const ok = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} [${n}] ${d}`); if (!c) fails++; };

// (3a) emissive families — drum cool spill + all four p323 regressions
const emis = (json.materials ?? []).map((m: any) => m.emissiveFactor ? m.emissiveFactor.map((x: number) => +x.toFixed(3)).join(",") : "-");
ok("drum cool-spill mat [0.017,0.029,0.036]", emis.some((e: string) => e === "0.017,0.029,0.036"), `(families: ${emis.join(" | ")})`);
ok("calm-water mat", emis.some((e: string) => e === "0.015,0.038,0.054"));
ok("spray mat", emis.some((e: string) => e === "0.173,0.292,0.361"));
ok("foam mat", emis.some((e: string) => e === "0.431,0.605,0.68"));
ok("finial warm-accent mat", emis.some((e: string) => e === "0.06,0.035,0.015"));

// (1a) node census
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("drum courses 3", names.filter((n) => /^ft_drum_\d$/.test(n)).length === 3, `drums=${names.filter((n) => /^ft_drum_\d$/.test(n)).length}`);
ok("old ft_pedestal ABSENT", !names.includes("ft_pedestal"));
const strands = names.filter((n) => n.startsWith("ft_strand_")).length;
const pads = names.filter((n) => /^ft_foam_\d+$/.test(n)).length;
const fins = names.filter((n) => /^ft_fin_\d+$/.test(n)).length;
ok("strand count 12", strands === 12, `strands=${strands}`);
ok("foam pads 6", pads === 6, `pads=${pads}`);
ok("vertical fins 6", fins === 6, `fins=${fins}`);
for (const key of ["ft_lip", "ft_splash", "ft_dome", "ft_jet", "ft_crown", "ft_finial", "ft_basin_water", "ft_bowl_water", "ft_basin", "ft_bowl"]) ok(`node ${key}`, names.includes(key));

// DRACO decode chassis
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeAttr(meshIdx: number, attr: "POSITION" | "COLOR_0"): number[] | null {
    const prim = json.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const uid = ext.attributes[attr];
    if (uid === undefined) return null;
    const b = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(b.buffer, b.byteOffset, b.byteLength), b.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const nPts = dg.num_points();
    const arr = new decoderModule.DracoFloat32Array();
    // p317 law: resolve the attribute by TYPE (COLOR attrs decode VEC3 at
    // nPts*3 values — a hardcoded 4-stride misreads every channel).
    const att = attr === "COLOR_0"
        ? ((): any => {
            const nAtt = dg.num_attributes();
            for (let ai = 0; ai < nAtt; ai++) {
                const a = decoder.GetAttribute(dg, ai);
                if (a.attribute_type() === decoderModule.COLOR) return a;
            }
            return null;
        })()
        : (decoder.GetAttributeByUniqueId(dg, uid) ?? decoder.GetAttribute(dg, uid));
    if (!att) { decoderModule.destroy(arr); decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    decoder.GetAttributeFloatForAllPoints(dg, att, arr);
    const comp = attr === "POSITION" ? 3 : 3; // both VEC3 in this build
    const out: number[] = [];
    for (let i = 0; i < nPts * comp; i++) out.push(arr.GetValue(i));
    decoderModule.destroy(arr); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return out;
}
function stats(name: string): { maxXZ: number; ySpan: number; maxX: number } | null {
    const node = json.nodes.find((n: any) => n.name === name);
    if (!node || node.mesh === undefined) return null;
    const pos = decodeAttr(node.mesh, "POSITION");
    if (!pos) return null;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity, maxX = 0;
    for (let i = 0; i < pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(pos[i * 3], pos[i * 3 + 2]));
        minY = Math.min(minY, pos[i * 3 + 1]); maxY = Math.max(maxY, pos[i * 3 + 1]);
        maxX = Math.max(maxX, Math.abs(pos[i * 3]));
    }
    return { maxXZ, ySpan: maxY - minY, maxX };
}

// (1b) stepped radii + course heights
const d0 = stats("ft_drum_0"), d1 = stats("ft_drum_1"), d2 = stats("ft_drum_2");
ok("drum_0 base radius ~0.435", d0 !== null && Math.abs(d0.maxXZ - 0.435) < 0.01, `maxXZ=${d0?.maxXZ.toFixed(4)}`);
ok("drum_1 base radius ~0.365", d1 !== null && Math.abs(d1.maxXZ - 0.365) < 0.01, `maxXZ=${d1?.maxXZ.toFixed(4)}`);
ok("drum_2 base radius ~0.295", d2 !== null && Math.abs(d2.maxXZ - 0.295) < 0.01, `maxXZ=${d2?.maxXZ.toFixed(4)}`);
ok("drum reveals STEPPED (strictly decreasing)", d0 !== null && d1 !== null && d2 !== null && d0.maxXZ - d1.maxXZ > 0.05 && d1.maxXZ - d2.maxXZ > 0.05, `steps ${(d0!.maxXZ - d1!.maxXZ).toFixed(3)} / ${(d1!.maxXZ - d2!.maxXZ).toFixed(3)}`);
ok("course heights 0.36/0.36/0.38", d0 !== null && d1 !== null && d2 !== null
    && Math.abs(d0.ySpan - 0.36) < 0.01 && Math.abs(d1.ySpan - 0.36) < 0.01 && Math.abs(d2.ySpan - 0.38) < 0.01,
    `ySpans ${d0?.ySpan.toFixed(3)}/${d1?.ySpan.toFixed(3)}/${d2?.ySpan.toFixed(3)}`);

// (3b) drum_0/1 COLOR_0 = dressed limestone 0x75705a (117,112,90)/255
// p317/p314 law: COLOR is VEC3 (nPts*3 values) and arrives scaled x257
// when the re-encode widened bytes to UINT16 — classify by value range.
function meanColor(name: string): [number, number, number] | null {
    const node = json.nodes.find((n: any) => n.name === name);
    if (!node || node.mesh === undefined) return null;
    const c = decodeAttr(node.mesh, "COLOR_0");
    if (!c) return null;
    const comp = 3;
    const n = Math.floor(c.length / comp);
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < n; i++) { r += c[i * comp]; g += c[i * comp + 1]; b += c[i * comp + 2]; }
    if (!n) return null;
    const s = (r / n) > 300 ? 257 : 1; // 65535/255 = 257
    return [Math.round((r / n) / s), Math.round((g / n) / s), Math.round((b / n) / s)];
}
for (const nm of ["ft_drum_0", "ft_drum_1"]) {
    const c = meanColor(nm);
    // p318/p322 class: THREE.Color(hex) converts sRGB->LINEAR before glbwrite
    // bakes COLOR_0, and glTF COLOR_0 is linear — 0x75705a lands as (45,41,26).
    ok(`${nm} limestone COLOR_0 ~ linear (45,41,26)`, c !== null
        && Math.abs(c[0] - 45) < 6 && Math.abs(c[1] - 41) < 6 && Math.abs(c[2] - 26) < 6,
        c ? `mean (${c[0]},${c[1]},${c[2]}) (x257 lane; sRGB origin 0x75705a)` : "no COLOR_0");
}

// (4) p323 regressions
let minBow = Infinity;
for (const n of json.nodes.filter((n: any) => /^ft_strand_\d+$/.test(n.name ?? ""))) {
    const s = stats(n.name);
    if (s) minBow = Math.min(minBow, s.maxX);
}
ok("strands bowed", minBow > 0.10, `min maxX=${minBow.toFixed(3)}`);
let padSpanMax = 0;
for (const n of json.nodes.filter((n: any) => /^ft_foam_\d+$/.test(n.name ?? ""))) {
    const s = stats(n.name);
    if (s) padSpanMax = Math.max(padSpanMax, s.ySpan);
}
ok("pad squash BAKED (y-span <= 0.16)", padSpanMax <= 0.16, `max pad ySpan=${padSpanMax.toFixed(3)}`);
let finMinSpan = Infinity;
for (const n of json.nodes.filter((n: any) => /^ft_fin_\d+$/.test(n.name ?? ""))) {
    const s = stats(n.name);
    if (s) finMinSpan = Math.min(finMinSpan, s.ySpan);
}
ok("fins vertical (y-span >= 0.12)", finMinSpan >= 0.12, `min fin ySpan=${finMinSpan.toFixed(3)}`);
const crown = stats("ft_crown");
const finial = stats("ft_finial");
ok("crown radial width held (polish-321)", crown !== null && crown.maxXZ >= 0.22, `maxXZ=${crown?.maxXZ.toFixed(4)}`);
ok("crown squash BAKED (polish-322)", crown !== null && crown.ySpan > 0.11 && crown.ySpan < 0.16, `ySpan=${crown?.ySpan.toFixed(4)}`);
ok("finial control r<=0.141 (polish-322)", finial !== null && finial.maxXZ <= 0.141, `maxXZ=${finial?.maxXZ.toFixed(4)}`);

// (5) non-finite
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
ok("nonFinite 0 (accessor bounds)", nonFinite === 0);
console.log(`served sha256 ${createHash("sha256").update(buf).digest("hex").slice(0, 16)} (upload sha ${UPLOAD_SHA.slice(0, 16)} — re-encode transform expected, struct-104)`);
console.log(fails === 0 ? "P324_SERVED_PASS" : "P324_SERVED_FAIL");
process.exit(fails === 0 ? 0 : 1);
