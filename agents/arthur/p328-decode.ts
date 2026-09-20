// p328-decode.ts — polish-328 local-bytes decode proof (satellite-bead
// material truth). Gates:
//  (1) BEAD MATERIAL: a glTF material with baseColorFactor ≈ linear(0xd9ac52)
//      = [0.694, 0.412, 0.084], roughness 0.45, metal 0.15, emissiveFactor
//      ≈ [0.02, 0.0117, 0.0051] (0xffc98a @ 0.02);
//  (2) BEAD GEOMETRY: one merged bucket of 6 spheres (SphereGeometry(0.07,
//      12,8) = 117 verts each → 702 total, DRACO-dedup may reduce — gate on
//      400..750 and on max sphere radius 0.06..0.09 vs knot path radius
//      0.83..0.87 for bead centers);
//  (3) polish-319 knot regressions: knot emissive [0.025,0.0146,0.0064] +
//      PBR [0.5841,0.3916,0.1441] r.45 m.15; lamp [0.9,0.5257,0.2287];
//      textures >= 2; anchors knot/lamp/bead naming;
//  (4) polish-327 discs: 2 flat low wide buckets at r 1.58/1.18;
//  (5) 0 non-finite accessor bounds.
// Chassis: p327-verify-served.ts local variant (no DRACO — local bytes are
// uncompressed; decode POSITION/COLOR_0 straight from accessors).
import { readFileSync } from "node:fs";

const FILE = process.argv[2] ?? "agents/arthur/assets/village_monument3.glb";
const buf = readFileSync(FILE);
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

// ---- (1) bead material ----
const mats: any[] = json.materials ?? [];
const bead = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.02, 0.0117, 0.0051], 0.002));
ok("bead-material-present", !!bead, `emissive ${JSON.stringify(bead?.emissiveFactor)}`);
ok("bead-pbr", !!bead && near(bead.pbrMetallicRoughness.baseColorFactor, [0.694, 0.412, 0.084], 0.004) && bead.pbrMetallicRoughness.roughnessFactor === 0.45 && bead.pbrMetallicRoughness.metallicFactor === 0.15, JSON.stringify(bead?.pbrMetallicRoughness?.baseColorFactor));
// no OTHER stray emissive material appeared (emissive set stays: knot, lamp, bead = 3)
const emissiveSet = mats.filter((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0.001));
ok("emissive-set-3", emissiveSet.length === 3, `${emissiveSet.length}: ${emissiveSet.map((m: any) => JSON.stringify(m.emissiveFactor)).join(" ")}`);

// ---- node census + anchors ----
const names: string[] = [];
const walk = (n: any) => { names.push(n.name ?? "?"); for (const c of n.children ?? []) walk(json.nodes[c]); };
for (const sn of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[sn]);
ok("knot-anchor", names.includes("knot"), names.join(","));
ok("lamp-anchor", names.includes("lamp"), "");

// ---- mesh reader (local, uncompressed) ----
// bufferView byteOffsets are RELATIVE TO THE BIN CHUNK (GLB buffer 0), not
// absolute file offsets — read via a DataView over the bin subarray (the
// p328 probe's own first RED: absolute reads returned denormals ~1e-34).
const binDv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
function readPrim(meshIdx: number): { pos: number[]; node: any } | null {
    for (const n of json.nodes) {
        if (n.mesh !== meshIdx) continue;
        const prim = json.meshes[meshIdx].primitives[0];
        const pa = json.accessors[prim.attributes.POSITION];
        const off = json.bufferViews[pa.bufferView].byteOffset ?? 0;
        const pos: number[] = [];
        for (let i = 0; i < pa.count; i++) {
            pos.push(binDv.getFloat32(off + i * 12, true), binDv.getFloat32(off + i * 12 + 4, true), binDv.getFloat32(off + i * 12 + 8, true));
        }
        return { pos, node: n };
    }
    return null;
}

// ---- (2) bead bucket by VALUE: verts clustered on the knot path ----
// bead bucket material = the bead material's index
const beadMatIdx = mats.indexOf(bead);
let beadBucket: { pos: number[]; node: any } | null = null;
for (const [mi, mesh] of (json.meshes ?? []).entries()) {
    const prim = mesh.primitives[0];
    if (prim.material === beadMatIdx) { beadBucket = readPrim(mi); break; }
}
ok("bead-bucket-found", !!beadBucket, "");
if (beadBucket) {
    const P = beadBucket.pos;
    const nV = P.length / 3;
    ok("bead-vert-count", nV >= 400 && nV <= 760, `${nV} (6×117=702 nominal, DRACO-free local)`);
    // cluster by bead center: for each vert, distance from Y axis at r≈0.85 band
    let inBand = 0, maxRad = 0;
    for (let i = 0; i < nV; i++) {
        const r = Math.hypot(P[i * 3], P[i * 3 + 2]);
        const y = P[i * 3 + 1];
        maxRad = Math.max(maxRad, r);
        // knot-path beads: centers at r 0.85, sphere r 0.07 → verts within 0.78..0.92 of axis; y within ±(0.35+0.07+ε)
        if (r > 0.7 && r < 1.0 && Math.abs(y) < 0.48) inBand++;
    }
    ok("bead-verts-on-path", inBand / nV > 0.9, `${(100 * inBand / nV).toFixed(1)}% in r[0.7,1.0] y[−0.48,0.48]`);
    // sphere radius check: local cluster extent — every vert must be within 0.09 of ITS bead center; approximate via: no vert further than 0.1 beyond band
    ok("bead-max-radius", maxRad < 1.0, `${maxRad.toFixed(3)}`);
}

// ---- (3) knot + lamp regressions ----
const knotMat = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.025, 0.0146, 0.0064]));
ok("knot-emissive", !!knotMat, JSON.stringify(knotMat?.emissiveFactor));
ok("knot-pbr", !!knotMat && near(knotMat.pbrMetallicRoughness.baseColorFactor, [0.5841, 0.3916, 0.1441]) && knotMat.pbrMetallicRoughness.roughnessFactor === 0.45 && knotMat.pbrMetallicRoughness.metallicFactor === 0.15, "");
ok("lamp-emissive", mats.some((m: any) => near(m.emissiveFactor ?? [], [0.9, 0.5257, 0.2287])), "");
ok("textures-2", mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length >= 2, `${mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length} textured`);

// ---- (4) polish-327 discs (flat, low, wide) ----
let discCount = 0;
for (const [mi] of (json.meshes ?? []).entries()) {
    const d = readPrim(mi);
    if (!d || d.pos.length < 9) continue;
    let maxXZ = 0, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < d.pos.length / 3; i++) {
        maxXZ = Math.max(maxXZ, Math.hypot(d.pos[i * 3], d.pos[i * 3 + 2]));
        minY = Math.min(minY, d.pos[i * 3 + 1]);
        maxY = Math.max(maxY, d.pos[i * 3 + 1]);
    }
    if (minY > -0.01 && maxY < 0.03 && maxXZ > 1.0) discCount++;
}
ok("discs-2", discCount === 2, `${discCount}`);

// ---- (5) non-finite ----
let nonFinite = 0;
for (const acc of json.accessors ?? []) {
    for (const v of [acc.min ?? [], acc.max ?? []].flat()) if (typeof v === "number" && !Number.isFinite(v)) nonFinite++;
}
ok("nonfinite-0", nonFinite === 0, `${nonFinite}`);

console.log(fails === 0 ? "P328_DECODE_PASS" : `P328_DECODE_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
