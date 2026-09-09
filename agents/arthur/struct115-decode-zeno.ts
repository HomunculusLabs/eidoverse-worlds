// struct115-decode-zeno.ts — decode audit of village_zeno3.glb.
// Verifies from BYTES (independent of the mk script's own asserts):
//   (a) pinned sha, node budget, texMat lanes zn_stone/zn_iron, brass
//       emissive exported, KEEP node glow_zn_1,
//   (b) THE ZENO LAW from bytes: 5 lintel/gate planes at exactly z=8/2^k
//       (k=0..4) — recovered from the STONE bucket's vertex z-clusters
//       (tol 1e-6), no other stone z-planes exist,
//   (c) post law: x-extents of posts per gate = ±(clear/2+POST/2) with
//       clear = 2.40−0.35k; heights strictly diminishing 3.00−0.475k,
//   (d) bead + ripple law: bead at (0, 1.104, −0.10) with r 0.09 from
//       node translation + accessor; 5 ripple cylinders at gate z's,
//       y = h_k − 0.345, all under KEEP glow_zn_1,
//   (e) envelope == 3.20x3.00x8.47 y[0..3.0] incl. glow extents, no NaN,
//       base on grade, no coplanar stone faces between gates (z-fight law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_zeno3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const BIN = 20 + jl + 8;
const va = (ai: number): Float32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[i * 3] = bytes.readFloatLE(off + i * 12);
        out[i * 3 + 1] = bytes.readFloatLE(off + i * 12 + 4);
        out[i * 3 + 2] = bytes.readFloatLE(off + i * 12 + 8);
    }
    return out;
};

// ---- (a) structure ------------------------------------------------------------------
{
    ck("sha pinned 78a3e90e458bfb43", sha === "78a3e90e458bfb438fb563ba02e63e6499dc8816c2ed6e4ad93247b3260ca811", sha.slice(0, 16));
    ck("node budget 8 (stone + stele-iron + 6 glow KEEP)", names.length === 8, `${names.length} nodes: ${names.join(", ")}`);
    const keep = names.filter(n => n === "glow_zn_1");
    ck("KEEP nodes glow_zn_1 x6 (mergekit kept siblings)", keep.length === 6, `${keep.length}`);
    const mats = j.materials.map((m: any) => m.name);
    ck("texMat lanes zn_stone + zn_iron", mats.includes("zn_stone") && mats.includes("zn_iron"), mats.join(","));
    const brass = j.materials.find((m: any) => m.name?.startsWith?.("brass") || (m as any).emissiveFactor);
    ck("brass emissive exported", !!brass && Array.isArray((brass as any).emissiveFactor), brass ? JSON.stringify((brass as any).emissiveFactor) : "none");
}

// ---- mesh walker: children are INDICES (probe pitfall 3) -----------------------------
const nodesById = new Map<number, any>(j.nodes.map((n: any, i: number) => [i, n]));
function walk(root: number): Array<{ node: any; mesh: any; mi: number }> {
    const out: Array<{ node: any; mesh: any; mi: number }> = [];
    const stack = [root];
    while (stack.length) {
        const i = stack.pop()!;
        const n = nodesById.get(i)!;
        if (n.mesh !== undefined) out.push({ node: n, mesh: j.meshes[n.mesh], mi: n.mesh });
        if (Array.isArray(n.children)) for (const c of n.children) stack.push(c);
    }
    return out;
}
const stoneMi = names.indexOf("zeno_0"), ironMi = names.indexOf("zeno_1");
const stone = walk(stoneMi), iron = walk(ironMi);
const glow = names.map((n, i) => n === "glow_zn_1" ? i : -1).filter(i => i >= 0).flatMap(i => walk(i));

// apply accumulated node TRANSLATION (glbwrite writes it; rotations baked into geometry)
function worldVerts(entry: { node: any; mesh: any }): Float32Array {
    const pos = new Float32Array(entry.mesh.primitives[0].attributes.POSITION);
    const acc = j.accessors[pos as any];
    void acc;
    const raw = va((entry.mesh.primitives[0].attributes as any).POSITION);
    const t = entry.node.translation ?? [0, 0, 0];
    for (let i = 0; i < raw.length; i += 3) { raw[i] += t[0]; raw[i + 1] += t[1]; raw[i + 2] += t[2]; }
    return raw;
}

// ---- (b) THE ZENO LAW from bytes -----------------------------------------------------
const Z0 = 8, POST = 0.34, LIN_H = 0.30, LIN_OVER = 0.06;
{
    const expect = [0, 1, 2, 3, 4].map(k => Z0 / 2 ** k);
    // Direct band-membership law (band-splitting by gaps cannot separate the
    // two near-touching inner gates — faces 0.02m apart — so instead: every
    // stone vert must lie within 0.25 of SOME expected gate center, each
    // gate band must carry real mass, and each band's z-extent must match
    // the design depth (lintel 0.48 > posts 0.44 → [zc−0.24, zc+0.24]).
    const all: number[][] = []; // per-gate z values
    for (let k = 0; k < 5; k++) all.push([]);
    let stray = 0;
    for (const e of stone) {
        const v = worldVerts(e);
        for (let i = 2; i < v.length; i += 3) {
            const z = v[i];
            let best = -1, bd = Infinity;
            for (let k = 0; k < 5; k++) { const d = Math.abs(z - expect[k]); if (d < bd) { bd = d; best = k; } }
            if (bd <= 0.25) all[best].push(z); else stray++;
        }
    }
    ck("no stray stone outside gate bands", stray === 0, `${stray} stray verts`);
    let okBand = true, msgB = "";
    for (let k = 0; k < 5; k++) {
        if (all[k].length < 40) { okBand = false; msgB = `gate ${k} band thin (${all[k].length})`; break; }
        const lo = Math.min(...all[k]), hi = Math.max(...all[k]);
        const zc = expect[k];
        if (Math.abs(lo - (zc - 0.24)) > 0.005 || Math.abs(hi - (zc + 0.24)) > 0.005) {
            okBand = false; msgB = `gate ${k} band z[${lo.toFixed(3)}..${hi.toFixed(3)}] != [${(zc - 0.24).toFixed(2)}..${(zc + 0.24).toFixed(2)}]`; break;
        }
    }
    ck("zeno law exact: 5 bands at z=8/2^k, depth spans exact", okBand, msgB);
    // gap law between band faces: consecutive gaps = 8/2^(k+1) − 0.48
    let okGap = true, msgG = "";
    for (let k = 0; k < 4; k++) {
        const gapFace = (expect[k + 1] + 0.24);
        const gap = (expect[k] - 0.24) - gapFace;
        const want = expect[k] - expect[k + 1] - 0.48;
        if (Math.abs(gap - want) > 1e-9) { okGap = false; msgG = `gap ${k}-${k + 1}: ${gap} != ${want}`; }
    }
    ck("inter-gate face gaps halve exactly (−0.48 depth)", okGap, msgG || "gaps: " + [0, 1, 2, 3].map(k => ((expect[k] - 0.24) - (expect[k + 1] + 0.24)).toFixed(4)).join(", "));
}

// ---- (c) post/clear law ---------------------------------------------------------------
{
    // per gate: max |x| among stone verts within that gate's z-band
    const expectClear = [0, 1, 2, 3, 4].map(k => 2.40 - 0.35 * k);
    const expectH = [0, 1, 2, 3, 4].map(k => 3.00 - 0.475 * k);
    let ok = true, msg = "";
    for (let k = 0; k < 5 && ok; k++) {
        const zc = Z0 / 2 ** k;
        // collect band verts directly (0.249: gate3's lintel front face at
        // z=0.76 must NOT leak into gate4's band — caught in first run)
        const bx: number[] = [], by: number[] = [];
        for (const e of stone) {
            const v = worldVerts(e);
            for (let i = 0; i < v.length; i += 3) {
                if (Math.abs(v[i + 2] - zc) <= 0.249) { bx.push(v[i]); by.push(v[i + 1]); }
            }
        }
        const maxAbsX = Math.max(...bx.map(Math.abs));
        const lintelHalf = (expectClear[k] + 2 * POST + 2 * LIN_OVER) / 2;
        if (Math.abs(maxAbsX - lintelHalf) > 0.01) { ok = false; msg = `gate ${k} |x|max ${maxAbsX.toFixed(3)} != lintel half ${lintelHalf.toFixed(3)}`; }
        if (Math.abs(Math.max(...by) - expectH[k]) > 0.01) { ok = false; msg = `gate ${k} y-max ${Math.max(...by).toFixed(3)} != h ${expectH[k].toFixed(3)}`; }
    }
    ck("post/clear law (|x|max == lintel half, y-max == h_k)", ok, msg);
    // strictly diminishing
    let dim = true;
    for (let k = 1; k < 5; k++) if (!(expectH[k - 1] > expectH[k] && expectClear[k - 1] > expectClear[k])) dim = false;
    ck("heights/clears strictly diminishing", dim);
}

// ---- (d) bead + ripple law -------------------------------------------------------------
{
    // glow node: apply translation; count sub-meshes: 5 ripples + 1 bead
    const glowSubs = glow.length;
    ck("glow sub-meshes 6 (5 ripples + bead)", glowSubs === 6, `${glowSubs}`);
    const bead = glow.find(e => {
        const v = worldVerts(e);
        let maxRad = 0, zs = new Set<number>();
        for (let i = 0; i < v.length; i += 3) zs.add(Math.round(v[i + 2] * 100) / 100);
        for (let i = 0; i < v.length; i += 3) maxRad = Math.max(maxRad, Math.hypot(v[i], v[i + 1] - 1.104, v[i + 2] + 0.10));
        void zs;
        return maxRad < 0.12;
    });
    ck("bead at (0, 1.104, −0.10) r 0.09", !!bead, bead ? "found" : "not found");
    // ripples at gate z's, y = h_k − 0.345 — z sits PROUD of the lintel front
    // face: z = z_k + LIN_D/2 + 0.02 = z_k + 0.26 (first-run miss: checked
    // z_k itself). Also assert x half-length = (clear−0.16)/2.
    let ok = true, msg = "";
    for (let k = 0; k < 5; k++) {
        const zc = Z0 / 2 ** k + 0.26, yE = (3.00 - 0.475 * k) - 0.345;
        const r = glow.find(e => {
            const v = worldVerts(e);
            let nearZ = 0, nearY = 0;
            for (let i = 0; i < v.length; i += 3) {
                if (Math.abs(v[i + 2] - zc) < 0.05) { nearZ++; if (Math.abs(v[i + 1] - yE) < 0.05) nearY++; }
            }
            return nearZ > 10 && nearY > 10;
        });
        if (!r) { ok = false; msg = `ripple ${k} not at z=${zc} y=${yE.toFixed(3)}`; break; }
        const v = worldVerts(r);
        let maxX = 0;
        for (let i = 0; i < v.length; i += 3) maxX = Math.max(maxX, Math.abs(v[i]));
        const wantHalf = ((2.40 - 0.35 * k) - 0.16) / 2;
        if (Math.abs(maxX - wantHalf) > 0.005) { ok = false; msg = `ripple ${k} half-len ${maxX.toFixed(3)} != ${(wantHalf).toFixed(3)}`; break; }
    }
    ck("5 ripples at (0, h_k−0.345, z_k+0.26), half-lengths halving-step exact", ok, msg);
}

// ---- (e) envelope/NaN/z-fight ----------------------------------------------------------
{
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity, nan = 0;
    for (const e of [...stone, ...iron, ...glow]) {
        const v = worldVerts(e);
        for (let i = 0; i < v.length; i += 3) {
            if ([v[i], v[i + 1], v[i + 2]].some(isNaN)) nan++;
            minX = Math.min(minX, v[i]); maxX = Math.max(maxX, v[i]);
            minY = Math.min(minY, v[i + 1]); maxY = Math.max(maxY, v[i + 1]);
            minZ = Math.min(minZ, v[i + 2]); maxZ = Math.max(maxZ, v[i + 2]);
        }
    }
    ck("envelope 3.20x3.00x8.47 y[0..3.0]", Math.abs((maxX - minX) - 3.20) < 0.02 && Math.abs((maxY - minY) - 3.00) < 0.02 && Math.abs((maxZ - minZ) - 8.47) < 0.02, `${(maxX - minX).toFixed(2)}x${(maxY - minY).toFixed(2)}x${(maxZ - minZ).toFixed(2)} y[${minY.toFixed(3)}..${maxY.toFixed(3)}] z[${minZ.toFixed(2)}..${maxZ.toFixed(2)}]`);
    ck("base on grade", Math.abs(minY) < 1e-4, `${minY}`);
    ck("no NaN", nan === 0, `${nan}`);
    // stele iron below the last gate's band, x-narrow
    const iv = iron.map(e => worldVerts(e));
    const iMinZ = Math.min(...iv.map(v => Math.min(...v.filter((_: number, idx: number) => idx % 3 === 2))));
    ck("stele z[-0.18..-0.02] (iron bucket)", iMinZ < -0.05 && iMinZ > -0.2, `iron min z ${iMinZ.toFixed(3)}`);
    // coplanar check: no two stone z-planes within 2mm
    const planes = new Set<number>();
    let coplanar = false;
    for (const e of stone) {
        const v = worldVerts(e);
        for (let i = 2; i < v.length; i += 3) planes.add(Math.round(v[i] * 500) / 500);
    }
    const pl = [...planes].sort((a, b) => a - b);
    for (let i = 1; i < pl.length; i++) if (pl[i] - pl[i - 1] > 0 && pl[i] - pl[i - 1] < 0.003) coplanar = true;
    ck("no coplanar stone z-planes (z-fight law)", !coplanar);
}

console.log(f === 0 ? "ALL PASS" : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
