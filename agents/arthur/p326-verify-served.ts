// p326-verify-served.ts — polish-326 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-dress-fountain lib
// and prove the riveted-ring variance cure survived the re-encode:
//  (1) node census: 45 nodes, 12 strands / 6 pads / 6 fins;
//  (2) material census: 3 spray emissive classes (0.22/0.50/0.80 × the
//      pinned class-1 signature) + 3 foam classes (0.62/0.78/0.94), with
//      strand i bound to its WPROF tier and pads/fins to their tables;
//  (3) geometric variance in the SERVED decode: fin heights vary (authored
//      table), pad y-spans vary, fin quaternions carry the authored leans;
//  (4) regressions: ft_splash/dome/jet/crown keep the exact 0.78 connective
//      foam; ft_finial warm accent exact; crown squash + finial radius
//      (p321/322); drum courses stepped (p324); strands bowed (p323);
//  (5) 0 non-finite.
// Chassis: p325-verify-served.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import draco3dgltf from "draco3dgltf";
import * as THREE from "three";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/056157db8d860b08.glb";
const UPLOAD_SHA = "056157db8d860b083d5a0c96b835952d0c54cd58b788549d06596ebef2d917a6";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p326-served.glb", buf);
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

const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("nodes 45", names.length === 45, `got ${names.length}`);
ok("strand count 12", names.filter((n) => n.startsWith("ft_strand_")).length === 12);
ok("foam pads 6", names.filter((n) => /^ft_foam_\d+$/.test(n)).length === 6);
ok("vertical fins 6", names.filter((n) => /^ft_fin_\d+$/.test(n)).length === 6);

// classes
const SPRAY1 = [0.173, 0.292, 0.361];
const FOAM1 = [0.431, 0.605, 0.68];
const KS = [0.22 / 0.5, 1.0, 0.8 / 0.5];
const KS_FOAM = [0.62 / 0.78, 1.0, 0.94 / 0.78];
const near = (a: number, b: number, t = 0.004) => Math.abs(a - b) < t;
const classify = (e: number[], sig: number[], ks: number[]): number | null => {
    for (let k = 0; k < 3; k++) if (e.every((v, i) => near(v, sig[i] * ks[k]))) return k;
    return null;
};
const matEmis = (nodeName: string): number[] | null => {
    const n = json.nodes.find((x: any) => x.name === nodeName);
    if (!n || n.mesh === undefined) return null;
    const m = json.materials[(json.meshes[n.mesh].primitives[0] as any).material];
    return m?.emissiveFactor ? m.emissiveFactor.map((x: number) => +x.toFixed(4)) : null;
};
const sprayCount = [0, 0, 0], foamCount = [0, 0, 0];
for (const m of json.materials ?? []) {
    if (!m.emissiveFactor) continue;
    const e = m.emissiveFactor.map((x: number) => +x.toFixed(4));
    const s = classify(e, SPRAY1, KS), f = classify(e, FOAM1, KS_FOAM);
    if (s !== null) sprayCount[s]++;
    if (f !== null) foamCount[f]++;
}
ok("3 spray classes in served materials", sprayCount.every((c) => c >= 1), JSON.stringify(sprayCount));
ok("3 foam classes in served materials", foamCount.every((c) => c >= 1), JSON.stringify(foamCount));

const WPROF = [1.6, 0.5, 2.2, 1.1, 0, 1.8, 0.7, 0, 2.0, 0.9, 1.5, 0.6, 1.9, 1.2];
const cls = (wp: number) => (wp >= 1.8 ? 2 : wp >= 1.0 ? 1 : 0);
let assignOk = true, checked = 0;
for (const n of json.nodes) {
    if (!/^ft_strand_\d+$/.test(n.name ?? "")) continue;
    const i = +n.name.slice("ft_strand_".length);
    if (WPROF[i] === 0) continue;
    const t = classify(matEmis(n.name)!, SPRAY1, KS);
    checked++;
    if (t !== cls(WPROF[i])) assignOk = false;
}
ok("strand tiers in served", assignOk, `checked ${checked}`);

const PAD_B = [2, 2, 1, 2, 0, 1];
const FIN_B = [2, 1, 0, 2, 0, 1];
let tierOk = true;
for (let k = 0; k < 6; k++) {
    const pt = classify(matEmis(`ft_foam_${k}`)!, FOAM1, KS_FOAM);
    const ft = classify(matEmis(`ft_fin_${k}`)!, FOAM1, KS_FOAM);
    if (pt !== PAD_B[k] || ft !== FIN_B[k]) tierOk = false;
}
ok("pad/fin tiers in served", tierOk);

// DRACO decode
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeAttr(meshIdx: number, attr: "POSITION"): number[] | null {
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
    const att = decoder.GetAttributeByUniqueId(dg, uid) ?? decoder.GetAttribute(dg, uid);
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

// geometric variance in SERVED decode
const finStats = [0, 1, 2, 3, 4, 5].map((k) => stats(`ft_fin_${k}`));
const finSpans = finStats.map((s) => s?.ySpan ?? 0);
const expFin = [0.145, 0.209, 0.084, 0.179, 0.111, 0.145];
ok("served fin heights = authored table", finSpans.every((v, k) => Math.abs(v - expFin[k]) < 0.004), `got ${finSpans.map((v) => v.toFixed(3)).join("/")}`);
const padSpans = [0, 1, 2, 3, 4, 5].map((k) => stats(`ft_foam_${k}`)?.ySpan ?? 0);
ok("served pad squashes vary", Math.max(...padSpans) - Math.min(...padSpans) > 0.02, `spans ${padSpans.map((v) => v.toFixed(3)).join("/")}`);

// fin leans (quaternion) in served json
const FIN_L = [4, -5, -3, 6, -7, 2];
const fatLands: Array<[number, number]> = [[0, 1.6], [2, 2.2], [5, 1.8], [8, 2.0], [10, 1.5], [12, 1.9]];
const baseAngle = (i: number) => (i / 14) * Math.PI * 2 + (Math.sin(i * 12.9898) * 4.1147) % 1 * 0.22 - 0.11;
let leanOk = true;
fatLands.forEach(([i], k) => {
    const th = (i === 3 || i === 11) ? (i - 1 >= 0 ? ((i - 1) / 14) * Math.PI * 2 + (Math.sin((i - 1) * 12.9898) * 4.1147) % 1 * 0.22 - 0.11 : 0) + 0.045 : baseAngle(i);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -th + Math.PI / 2, THREE.MathUtils.degToRad(FIN_L[k]), "XYZ"));
    const node = json.nodes.find((x: any) => x.name === `ft_fin_${k}`);
    const rq = node.rotation;
    if (!(Math.abs(rq[0] - q.x) < 1e-5 && Math.abs(rq[1] - q.y) < 1e-5 && Math.abs(rq[2] - q.z) < 1e-5 && Math.abs(rq[3] - q.w) < 1e-5)) leanOk = false;
});
ok("served fin leans authored", leanOk);

// regressions
for (const key of ["ft_splash", "ft_dome", "ft_jet", "ft_crown"]) {
    const e = matEmis(key)!;
    ok(`${key} 0.78 connective`, e.every((v, i) => near(v, FOAM1[i], 0.0005)), JSON.stringify(e));
}
const finE = matEmis("ft_finial")!;
ok("ft_finial warm accent exact", finE.every((v, i) => near(v, [0.06, 0.035, 0.015][i], 0.0005)), JSON.stringify(finE));
const crown = stats("ft_crown"), finial = stats("ft_finial");
ok("crown radial width held (polish-321)", crown !== null && crown.maxXZ >= 0.22, `maxXZ=${crown?.maxXZ.toFixed(4)}`);
ok("crown squash BAKED (polish-322)", crown !== null && crown.ySpan > 0.11 && crown.ySpan < 0.16, `ySpan=${crown?.ySpan.toFixed(4)}`);
ok("finial control r<=0.141 (polish-322)", finial !== null && finial.maxXZ <= 0.141, `maxXZ=${finial?.maxXZ.toFixed(4)}`);
const d0 = stats("ft_drum_0"), d1 = stats("ft_drum_1"), d2 = stats("ft_drum_2");
ok("drum reveals STEPPED (polish-324)", d0 !== null && d1 !== null && d2 !== null && d0.maxXZ - d1.maxXZ > 0.05 && d1.maxXZ - d2.maxXZ > 0.05, `steps ${(d0?.maxXZ - d1?.maxXZ).toFixed(3)} / ${(d1?.maxXZ - d2?.maxXZ).toFixed(3)}`);
let minBow = Infinity;
for (const n of json.nodes.filter((n: any) => /^ft_strand_\d+$/.test(n.name ?? ""))) {
    const pos = n.mesh !== undefined ? decodeAttr(n.mesh, "POSITION") : null;
    if (pos) { let mx = 0; for (let i = 0; i < pos.length / 3; i++) mx = Math.max(mx, Math.abs(pos[i * 3])); minBow = Math.min(minBow, mx); }
}
ok("strands bowed (polish-323)", minBow > 0.10, `min maxX=${minBow.toFixed(3)}`);

// non-finite
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [...(acc.min ?? []), ...(acc.max ?? [])]) if (!Number.isFinite(v)) nonFinite++;
}
ok("nonFinite 0 (accessor bounds)", nonFinite === 0);
console.log(`served sha256 ${createHash("sha256").update(buf).digest("hex").slice(0, 16)} (upload sha ${UPLOAD_SHA.slice(0, 16)} — re-encode transform expected, struct-104)`);
console.log(fails === 0 ? "P326_SERVED_PASS" : `P326_SERVED_FAIL (${fails})`);
process.exit(fails === 0 ? 0 : 1);
