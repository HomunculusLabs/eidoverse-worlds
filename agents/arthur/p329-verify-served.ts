// p329-verify-served.ts — polish-329 served-bytes proof (struct-104 law):
// fetch the SERVED (DRACO re-encode) bytes of the live nx-town-monument lib
// and prove the plaque inscription rhythm survived the re-encode:
//  (1) pline bucket (the only geometry in the plaque band y 0.30..0.60,
//      z 0.85..0.97) carries THREE bar rows at y≈0.55/0.45/0.35 with
//      max|x| ≈ 0.25 / 0.20 / 0.13 (half-widths of the authored 0.50/0.40/
//      0.26 rhythm — the OLD build had 0.25 on all three rows);
//  (2) polish-328 regressions: bead material + PBR + on-path bucket;
//  (3) polish-319/327 regressions: knot emissive/PBR, lamp, textures >= 2,
//      anchors knot/lamp, both contact-shadow discs;
//  (4) 0 non-finite accessor bounds.
// Chassis: p328-verify-served.ts (DRACO decode by VALUE).
import { readFileSync, writeFileSync } from "node:fs";
import draco3dgltf from "draco3dgltf";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const LIB = "store/d4bc6c990c713c78.glb";

const r = await fetch(`${base}/library/${LIB}`);
if (!r.ok) { console.log(`FAIL [served fetch] HTTP ${r.status}`); process.exit(1); }
const buf = Buffer.from(await r.arrayBuffer());
writeFileSync("/tmp/p329-served.glb", buf);
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
const near = (a: number[], b: number[], eps = 0.002) => a.length >= 3 && b.length >= 3 && a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) <= eps);

// ---- DRACO decode chassis ----
const decoderModule = await draco3dgltf.createDecoderModule({});
const decoder = new decoderModule.Decoder();
const sliceView = (i: number) => {
    const v = json.bufferViews[i];
    const off = v.byteOffset ?? 0;
    return bin.subarray(off, off + v.byteLength);
};
function decodeMesh(meshIdx: number): { pos: number[] } | null {
    const prim = json.meshes[meshIdx].primitives[0];
    const ext = prim.extensions?.KHR_draco_mesh_compression;
    if (!ext) return null;
    const posAttrId = ext.attributes?.POSITION;
    const b = sliceView(ext.bufferView);
    const dbuf = new decoderModule.DecoderBuffer();
    dbuf.Init(new Int8Array(b.buffer, b.byteOffset, b.byteLength), b.byteLength);
    if (decoder.GetEncodedGeometryType(dbuf) !== decoderModule.TRIANGULAR_MESH) { decoderModule.destroy(dbuf); return null; }
    const dg = new decoderModule.Mesh();
    const st = decoder.DecodeBufferToMesh(dbuf, dg);
    if (!st.ok()) { decoderModule.destroy(dg); decoderModule.destroy(dbuf); return null; }
    const a = decoder.GetAttributeByUniqueId(dg, posAttrId);
    const arr = new decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(dg, a, arr);
    const out: number[] = [];
    for (let i = 0; i < arr.size(); i++) out.push(arr.GetValue(i));
    decoderModule.destroy(arr);
    decoderModule.destroy(dg); decoderModule.destroy(dbuf);
    return { pos: out };
}

// ---- (1) pline inscription rhythm by VALUE ----
// Collect decoded verts in the plaque band, PLAQUE ZONE ONLY (|x| <= 0.45:
// the offering bowls at |x| >= 0.71 share the y/z band and must not pollute
// row gates). Row tolerance 0.025 > bar half-height 0.0225 — box verts live
// only at y = center +- 0.0225, so a tighter gate finds nothing (probe
// self-catch RED->GREEN).
type V = { x: number; y: number; z: number };
const band: V[] = [];
for (const [mi] of (json.meshes ?? []).entries()) {
    const d = decodeMesh(mi);
    if (!d) continue;
    for (let i = 0; i < d.pos.length / 3; i++) {
        const x = d.pos[i * 3], y = d.pos[i * 3 + 1], z = d.pos[i * 3 + 2];
        if (Math.abs(x) <= 0.45 && y >= 0.30 && y <= 0.60 && z >= 0.855 && z <= 0.965) band.push({ x, y, z });
    }
}
const rowMax = (yc: number, halfTol: number) => {
    const xs = band.filter(v => Math.abs(v.y - yc) <= halfTol).map(v => Math.abs(v.x));
    return xs.length ? Math.max(...xs) : -1;
};
const r1 = rowMax(0.55, 0.025), r2 = rowMax(0.45, 0.025), r3 = rowMax(0.35, 0.025);
ok("pline-row1-halfwidth-0.25", Math.abs(r1 - 0.25) <= 0.01, `${r1.toFixed(4)} (authored 0.25)`);
ok("pline-row2-halfwidth-0.20", Math.abs(r2 - 0.20) <= 0.01, `${r2.toFixed(4)} (authored 0.20 — was 0.25 pre-329)`);
ok("pline-row3-halfwidth-0.13", Math.abs(r3 - 0.13) <= 0.01, `${r3.toFixed(4)} (authored 0.13 — was 0.25 pre-329)`);
ok("pline-rhythm-monotonic", r1 > r2 && r2 > r3 && r1 > 0.24 && r3 < 0.15, `${r1.toFixed(3)} > ${r2.toFixed(3)} > ${r3.toFixed(3)}`);
ok("pline-band-verts-present", band.length >= 24, `${band.length} verts in plaque band`);

// ---- (2)+(3) regressions: materials, anchors, discs ----
const mats: any[] = json.materials ?? [];
const bead = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.02, 0.0117, 0.0051], 0.002));
ok("bead-material-served", !!bead, `emissive ${JSON.stringify(bead?.emissiveFactor)}`);
ok("bead-pbr-served", !!bead && near(bead.pbrMetallicRoughness.baseColorFactor, [0.6939, 0.4125, 0.0844], 0.004) && bead.pbrMetallicRoughness.roughnessFactor === 0.45 && bead.pbrMetallicRoughness.metallicFactor === 0.15, JSON.stringify(bead?.pbrMetallicRoughness?.baseColorFactor));
const emissiveSet = mats.filter((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0.001));
ok("emissive-set-3-served", emissiveSet.length === 3, `${emissiveSet.length}`);

const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("knot-group-served", names.includes("knot"), names.join(","));
ok("lamp-anchor-served", names.includes("lamp"), "");

const knotMat = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.025, 0.0146, 0.0064]));
ok("knot-emissive-served", !!knotMat, JSON.stringify(knotMat?.emissiveFactor));
ok("knot-pbr-served", !!knotMat && near(knotMat.pbrMetallicRoughness.baseColorFactor, [0.5841, 0.3916, 0.1441]) && knotMat.pbrMetallicRoughness.roughnessFactor === 0.45 && knotMat.pbrMetallicRoughness.metallicFactor === 0.15, "");
ok("lamp-emissive-served", mats.some((m: any) => near(m.emissiveFactor ?? [], [0.9, 0.5257, 0.2287])), "");
ok("texture-materials-served", mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length >= 2, `${mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length} textured`);

let discCount = 0;
for (const [mi] of (json.meshes ?? []).entries()) {
    const d = decodeMesh(mi);
    if (!d || d.pos.length < 9) continue;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < d.pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(d.pos[i * 3], d.pos[i * 3 + 2]));
        minY = Math.min(minY, d.pos[i * 3 + 1]);
        maxY = Math.max(maxY, d.pos[i * 3 + 1]);
    }
    if (minY > -0.01 && maxY < 0.03 && maxXZ > 1.0) discCount++;
}
ok("discs-2-served", discCount === 2, `${discCount}`);

// ---- (4) non-finite ----
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [acc.min ?? [], acc.max ?? []].flat()) if (typeof v === "number" && !Number.isFinite(v)) nonFinite++;
}
ok("nonfinite-0-served", nonFinite === 0, `${nonFinite}`);

console.log(fails === 0 ? "P329_SERVED_PASS" : `P329_SERVED_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
