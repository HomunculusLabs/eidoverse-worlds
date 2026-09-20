// p325-verify-served.ts — polish-325 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-dress-fountain lib
// and prove the polish-325 bowl cure survived the re-encode:
//  (1) ft_bowl now binds the drum/bowl cool-spill material (emissive
//      [0.017,0.029,0.036]) — NOT material-null;
//  (2) ft_bowl geometry unchanged (y span 1.50..1.80, top radius ~0.75);
//  (3) all p320..324 regressions intact (5 emissive families, 3 drum
//      courses with stepped radii, 12 strands, 6 pads, 6 fins, crown +
//      finial controls);
//  (4) 0 non-finite (accessor bounds).
// Chassis: p324-verify-served.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/68e5b75e73a14058.glb";
const UPLOAD_SHA = "68e5b75e73a1405840c9a24137f283928816bc1dbdfcf01edcf5cb3d46f93999";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p325-served.glb", buf);
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

// (1) THE CURE: ft_bowl material binding
const bowlNode = (json.nodes ?? []).find((n: any) => n.name === "ft_bowl");
if (!bowlNode || bowlNode.mesh === undefined) { ok("ft_bowl node+mesh", false); }
else {
    const prim = json.meshes[bowlNode.mesh].primitives[0];
    const matIdx = prim.material;
    ok("ft_bowl binds a glTF material (not null)", matIdx !== undefined && matIdx !== null, `matIdx=${matIdx}`);
    if (matIdx !== undefined && matIdx !== null) {
        const m = json.materials[matIdx];
        const e = (m.emissiveFactor ?? []).map((x: number) => +x.toFixed(3)).join(",");
        ok("ft_bowl = cool-spill emissive [0.017,0.029,0.036]", e === "0.017,0.029,0.036", `emissive=${e} name=${m.name}`);
        ok("ft_bowl baseColor = limestone (linear ~0.178,0.162,0.102)", Math.abs(m.pbrMetallicRoughness.baseColorFactor[0] - 0.178) < 0.01 && Math.abs(m.pbrMetallicRoughness.baseColorFactor[2] - 0.102) < 0.01, JSON.stringify(m.pbrMetallicRoughness.baseColorFactor.slice(0, 3)));
    }
}

// (3a) emissive families — all five
const emis = (json.materials ?? []).map((m: any) => m.emissiveFactor ? m.emissiveFactor.map((x: number) => +x.toFixed(3)).join(",") : "-");
ok("cool-spill family present", emis.some((e: string) => e === "0.017,0.029,0.036"), `(families: ${emis.join(" | ")})`);
ok("calm-water mat", emis.some((e: string) => e === "0.015,0.038,0.054"));
ok("spray mat", emis.some((e: string) => e === "0.173,0.292,0.361"));
ok("foam mat", emis.some((e: string) => e === "0.431,0.605,0.68"));
ok("finial warm-accent mat", emis.some((e: string) => e === "0.06,0.035,0.015"));

// node census
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("drum courses 3", names.filter((n) => /^ft_drum_\d$/.test(n)).length === 3);
ok("old ft_pedestal ABSENT", !names.includes("ft_pedestal"));
ok("strand count 12", names.filter((n) => n.startsWith("ft_strand_")).length === 12);
ok("foam pads 6", names.filter((n) => /^ft_foam_\d+$/.test(n)).length === 6);
ok("vertical fins 6", names.filter((n) => /^ft_fin_\d+$/.test(n)).length === 6);
for (const key of ["ft_bowl", "ft_lip", "ft_splash", "ft_dome", "ft_jet", "ft_crown", "ft_finial", "ft_basin_water", "ft_bowl_water", "ft_basin"]) ok(`node ${key}`, names.includes(key));

// DRACO decode chassis (p324 proven)
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
    const out: number[] = [];
    for (let i = 0; i < nPts * 3; i++) out.push(arr.GetValue(i));
    decoderModule.destroy(arr); decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return out;
}
function stats(name: string): { maxXZ: number; ySpan: number; maxY: number } | null {
    const node = json.nodes.find((n: any) => n.name === name);
    if (!node || node.mesh === undefined) return null;
    const pos = decodeAttr(node.mesh, "POSITION");
    if (!pos) return null;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(pos[i * 3], pos[i * 3 + 2]));
        minY = Math.min(minY, pos[i * 3 + 1]); maxY = Math.max(maxY, pos[i * 3 + 1]);
    }
    return { maxXZ, ySpan: maxY - minY, maxY };
}

// (2) ft_bowl geometry unchanged
const bowl = stats("ft_bowl");
ok("ft_bowl y span ~0.30 (1.50..1.80)", bowl !== null && Math.abs(bowl.ySpan - 0.30) < 0.02, `ySpan=${bowl?.ySpan.toFixed(3)} maxY=${bowl?.maxY.toFixed(3)}`);
ok("ft_bowl top radius ~0.75", bowl !== null && Math.abs(bowl.maxXZ - 0.75) < 0.02, `maxXZ=${bowl?.maxXZ.toFixed(3)}`);

// (3b) drum regressions
const d0 = stats("ft_drum_0"), d1 = stats("ft_drum_1"), d2 = stats("ft_drum_2");
ok("drum_0 base radius ~0.435", d0 !== null && Math.abs(d0.maxXZ - 0.435) < 0.01, `maxXZ=${d0?.maxXZ.toFixed(4)}`);
ok("drum reveals STEPPED", d0 !== null && d1 !== null && d2 !== null && d0.maxXZ - d1.maxXZ > 0.05 && d1.maxXZ - d2.maxXZ > 0.05, `steps ${(d0?.maxXZ - d1?.maxXZ).toFixed(3)} / ${(d1?.maxXZ - d2?.maxXZ).toFixed(3)}`);

// (3c) p320..323 regressions
let minBow = Infinity;
for (const n of json.nodes.filter((n: any) => /^ft_strand_\d+$/.test(n.name ?? ""))) {
    const pos = n.mesh !== undefined ? decodeAttr(n.mesh, "POSITION") : null;
    if (pos) { let mx = 0; for (let i = 0; i < pos.length / 3; i++) mx = Math.max(mx, Math.abs(pos[i * 3])); minBow = Math.min(minBow, mx); }
}
ok("strands bowed", minBow > 0.10, `min maxX=${minBow.toFixed(3)}`);
const crown = stats("ft_crown");
const finial = stats("ft_finial");
ok("crown radial width held (polish-321)", crown !== null && crown.maxXZ >= 0.22, `maxXZ=${crown?.maxXZ.toFixed(4)}`);
ok("crown squash BAKED (polish-322)", crown !== null && crown.ySpan > 0.11 && crown.ySpan < 0.16, `ySpan=${crown?.ySpan.toFixed(4)}`);
ok("finial control r<=0.141 (polish-322)", finial !== null && finial.maxXZ <= 0.141, `maxXZ=${finial?.maxXZ.toFixed(4)}`);

// (4) non-finite
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
ok("nonFinite 0 (accessor bounds)", nonFinite === 0);
console.log(`served sha256 ${createHash("sha256").update(buf).digest("hex").slice(0, 16)} (upload sha ${UPLOAD_SHA.slice(0, 16)} — re-encode transform expected, struct-104)`);
console.log(fails === 0 ? "P325_SERVED_PASS" : "P325_SERVED_FAIL");
process.exit(fails === 0 ? 0 : 1);
