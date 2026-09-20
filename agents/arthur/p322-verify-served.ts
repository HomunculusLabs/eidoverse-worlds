// p322-verify-served.ts — polish-322 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-dress-fountain lib
// and prove the polish-322 cures survived the re-encode:
//  (1) ft_finial now carries a REAL glTF material (glow*, warm accent
//      emissive [0.06,0.035,0.015] = 0xffc98a@0.06) — was COLOR_0-only;
//  (2) the crown squash is BAKED INTO GEOMETRY: ft_crown mesh-local y-span
//      ≈ 0.134 (2r*0.28) — was ~0.48 unscaled sphere (scale-drop law);
//  (3) polish-320/321 regressions intact (3 emissive water families, strand
//      census 12, foam census 15, named anchors, crown radial width);
//  (4) 0 non-finite. DRACO decode chassis: p317/p321-verify-served.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/657f3c222e2ba98d.glb";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p322-served.glb", buf);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

// JSON chunk
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

// material regressions (polish-320 families, exact linear factors)
const emis = (json.materials ?? []).map((m: any) => m.emissiveFactor ? m.emissiveFactor.map((x: number) => +x.toFixed(3)).join(",") : "-");
ok("calm-water mat", emis.some((e: string) => e === "0.015,0.038,0.054"));
ok("spray mat", emis.some((e: string) => e === "0.173,0.292,0.361"));
ok("foam mat", emis.some((e: string) => e === "0.304,0.427,0.479"));
// polish-322: finial warm-accent material exists (bell-gold + accent)
ok("finial warm-accent mat", emis.some((e: string) => e === "0.06,0.035,0.015"), `(0xffc98a@0.06 linear; families: ${emis.join(" | ")})`);

// finial material is REALLY bound to the ft_finial mesh (not merely present)
const finialNode = json.nodes.find((n: any) => n.name === "ft_finial");
let finialMatIdx: number | undefined;
if (finialNode && finialNode.mesh !== undefined) {
    const prim = json.meshes[finialNode.mesh].primitives[0];
    finialMatIdx = prim.material;
}
let finialBound = false, finialEmisFactor = "";
if (finialMatIdx !== undefined) {
    const m = json.materials[finialMatIdx];
    finialBound = !!m && !!m.emissiveFactor;
    if (finialBound) finialEmisFactor = m.emissiveFactor.map((x: number) => +x.toFixed(3)).join(",");
}
ok("ft_finial binds emissive glTF mat", finialBound && finialEmisFactor === "0.06,0.035,0.015", `matIdx=${finialMatIdx} emis=[${finialEmisFactor}] (baseline was COLOR_0-only, no material)`);

// node census + anchors
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
const strands = names.filter((n) => n.startsWith("ft_strand_")).length;
const foamEls = names.filter((n) => /^ft_(foam|lobe|drop)_/.test(n)).length;
ok("strand count 12", strands === 12, `strands=${strands}`);
ok("foam elements 15", foamEls === 15, `foam=${foamEls}`);
for (const key of ["ft_lip", "ft_splash", "ft_dome", "ft_jet", "ft_crown", "ft_finial", "ft_basin_water", "ft_bowl_water"]) ok(`node ${key}`, names.includes(key));

// DRACO mesh decode (p317/p321 chassis)
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodePositions(meshIdx: number): number[] | null {
    const prim = json.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const b = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(b.buffer, b.byteOffset, b.byteLength), b.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const nPts = dg.num_points();
    const posArr = new decoderModule.DracoFloat32Array();
    const pa = decoder.GetAttributeByUniqueId(dg, 0) ?? decoder.GetAttribute(dg, 0);
    decoder.GetAttributeFloatForAllPoints(dg, pa, posArr);
    const pos: number[] = [];
    for (let i = 0; i < nPts * 3; i++) pos.push(posArr.GetValue(i));
    decoderModule.destroy(posArr); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return pos;
}
function meshRadius(name: string): { maxXZ: number; ySpan: number } | null {
    const node = json.nodes.find((n: any) => n.name === name);
    if (!node || node.mesh === undefined) return null;
    const pos = decodePositions(node.mesh);
    if (!pos) return null;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(pos[i * 3], pos[i * 3 + 2]));
        minY = Math.min(minY, pos[i * 3 + 1]); maxY = Math.max(maxY, pos[i * 3 + 1]);
    }
    return { maxXZ, ySpan: maxY - minY };
}
const crown = meshRadius("ft_crown");
const finial = meshRadius("ft_finial");
ok("crown radial width held (polish-321)", crown !== null && crown.maxXZ >= 0.22, `maxXZ=${crown?.maxXZ.toFixed(4)} (authored 0.24)`);
// polish-322 CORE GATE: squash baked into geometry — mesh-local y-span must
// be the FLATTENED value ~0.134 (2r 0.48 * 0.28), NOT the ~0.48 full sphere.
ok("crown squash BAKED (y-span ~0.134)", crown !== null && crown.ySpan > 0.11 && crown.ySpan < 0.16, `ySpan=${crown?.ySpan.toFixed(4)} (baseline shipped ~0.48 unscaled — ball was entombed; polish-321 scale-drop law cured)`);
ok("finial control r<=0.141", finial !== null && finial.maxXZ <= 0.141, `maxXZ=${finial?.maxXZ.toFixed(4)}`);

// non-finite via accessor min/max (served re-encode keeps these)
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
ok("nonFinite 0 (accessor bounds)", nonFinite === 0);
console.log(`served sha256 ${createHash("sha256").update(buf).digest("hex").slice(0, 16)} (upload sha 657f3c222e2ba98d — re-encode transform expected, struct-104)`);
console.log(fails === 0 ? "P322_SERVED_PASS" : "P322_SERVED_FAIL");
process.exit(fails === 0 ? 0 : 1);
