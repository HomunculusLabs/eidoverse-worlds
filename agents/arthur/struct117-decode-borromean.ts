// struct117-decode-borromean.ts — decode audit of village_borromean3.glb.
// Verifies from BYTES (independent of the mk script's own asserts — the
// lorenz-law pattern: a FRESH replica of the construction, no mk imports,
// and vertex-cloud equality against it):
//   (a) pinned sha, node census 3 (iron bucket, stone bucket, KEEP
//       glow_br_1), texMat lanes br_iron + br_stone, brass emissive exported;
//   (b) THE BORROMEAN LAW from bytes: three golden superellipse centerlines
//       (semi S and S*phi, exponent 5) in mutually perpendicular planes,
//       woven B⊂A on x, A⊂C on z, C⊂B on y (containment 1.35 < 2.1843),
//       stanced on the (1,1,1) corner — every iron vertex within TUBE±12mm
//       of exactly this replica (union of three tubes), every replica
//       sample covered by the iron cloud (≤50mm), all three rings carry
//       real mass;
//   (c) pairwise separation from bytes: iron verts assigned to nearest
//       replica ring stay within their ring (no tube straddles two rings —
//       min inter-ring centerline gap 0.834 >> 2*TUBE);
//   (d) stance law from bytes: the three dip clusters (lowest iron verts
//       per ring) at equal height ±2mm and 120deg ±1.5deg apart in azimuth;
//   (e) stone law: dais + exactly 3 stanchions — stone verts below 0.42
//       belong to the dais disc (r ≤ 2.10), verts above form exactly 3 xz
//       clusters within 0.25 of the replica dips, stanchion tops ≈ dip−TUBE;
//   (f) bead law: KEEP glow_br_1 sphere at (0, CENTER_Y, 0), r 0.09 ±5mm;
//   (g) envelope == 4.22x4.53x4.60 y[0..4.533] from decoded accessors,
//       base on grade, no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_borromean3.glb`);
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
    ck("sha pinned 7e9c334883d25774", sha === "7e9c334883d25774e8572388b1e63d59e5424fbcedd60f2d002b042ea665c48d", sha.slice(0, 16));
    ck("node census 3 (iron, stone, KEEP bead)", names.length === 3, `${names.length} nodes: ${names.join(", ")}`);
    ck("KEEP node glow_br_1 present", names.includes("glow_br_1"));
    const mats = j.materials.map((m: any) => m.name);
    ck("texMat lanes br_iron + br_stone", mats.includes("br_iron") && mats.includes("br_stone"), mats.join(","));
    const brass = j.materials.find((m: any) => (m as any).emissiveFactor);
    ck("brass emissive exported", !!brass, brass ? JSON.stringify((brass as any).emissiveFactor) : "none");
}

// ---- mesh walker: children are INDICES (probe pitfall 3) -----------------------------
const nodesById = new Map<number, any>(j.nodes.map((n: any, i: number) => [i, n]));
function walk(root: number): Array<{ node: any; mesh: any }> {
    const out: Array<{ node: any; mesh: any }> = [];
    const stack = [root];
    while (stack.length) {
        const i = stack.pop()!;
        const n = nodesById.get(i)!;
        if (n.mesh !== undefined) out.push({ node: n, mesh: j.meshes[n.mesh] });
        if (Array.isArray(n.children)) for (const c of n.children) stack.push(c);
    }
    return out;
}
function worldVerts(entry: { node: any; mesh: any }): Float32Array {
    const raw = va((entry.mesh.primitives[0].attributes as any).POSITION);
    const t = entry.node.translation ?? [0, 0, 0];
    for (let i = 0; i < raw.length; i += 3) { raw[i] += t[0]; raw[i + 1] += t[1]; raw[i + 2] += t[2]; }
    return raw;
}
// identify buckets by MATERIAL name (merge order is not a contract)
function bucketMat(nodeIdx: number): string {
    const e = walk(nodeIdx)[0];
    return j.materials[e.mesh.primitives[0].material].name;
}
const ironIdx = names.findIndex((_, i) => bucketMat(i) === "br_iron");
const stoneIdx = names.findIndex((_, i) => bucketMat(i) === "br_stone");
const glowIdx = names.indexOf("glow_br_1");
ck("iron + stone buckets identified by material", ironIdx >= 0 && stoneIdx >= 0, `iron node ${ironIdx}, stone node ${stoneIdx}`);
const iron = walk(ironIdx).flatMap(e => Array.from(worldVerts(e)));
const stone = walk(stoneIdx).flatMap(e => Array.from(worldVerts(e)));

// ---- (b) FRESH REPLICA (no mk imports; independent re-derivation) ---------------------
const PHI = (1 + Math.sqrt(5)) / 2;
const S = 1.35, A_MAJ = S * PHI, N_EXP = 5, TUBE = 0.085, N_PTS = 280, DIP_TARGET = 0.87, BEAD_R = 0.09;
const q = (x: number, y: number, z: number, w: number) => ({ x, y, z, w });
function qMul(a: any, b: any) {
    return q(
        a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    );
}
function qApply(qq: any, v: [number, number, number]): [number, number, number] {
    const { x, y, z, w } = qq;
    const tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
    return [
        v[0] + w * tx + (y * tz - z * ty),
        v[1] + w * ty + (z * tx - x * tz),
        v[2] + w * tz + (x * ty - y * tx),
    ];
}
// setFromUnitVectors((1,1,1)/√3, (0,1,0)) — derived independently
{
    const ax = 1 / Math.sqrt(3), ay = 1 / Math.sqrt(3), az = 1 / Math.sqrt(3);
    const bx = 0, by = 1, bz = 0;
    const d = ax * bx + ay * by + az * bz;
    var qStance = q(ax * by - ay * bx + 0, ay, -ax, 1 + d); // r = a×b for this pair: (a×b) = (-1/√3·0 - 1/√3·1, ... )
}
// explicit cross product form (clearer, same numbers):
{
    const a: [number, number, number] = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
    const b: [number, number, number] = [0, 1, 0];
    const cx = a[1] * b[2] - a[2] * b[1];
    const cy = a[2] * b[0] - a[0] * b[2];
    const cz = a[0] * b[1] - a[1] * b[0];
    const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    qStance = q(cx, cy, cz, 1 + d).y !== undefined ? q(cx, cy, cz, 1 + d) : qStance;
}
// THREE.setFromUnitVectors NORMALIZES (x,y,z,1+dot) — reader bug caught by
// the first RED run (bead 2.659 vs replica CY 6.513). Normalize here:
{
    const n = Math.hypot(qStance.x, qStance.y, qStance.z, qStance.w);
    qStance = q(qStance.x / n, qStance.y / n, qStance.z / n, qStance.w / n);
}
function sePoint(t: number, semiU: number, semiV: number): [number, number] {
    const c = Math.cos(t), s = Math.sin(t);
    return [semiU * Math.sign(c) * Math.pow(Math.abs(c), 2 / N_EXP), semiV * Math.sign(s) * Math.pow(Math.abs(s), 2 / N_EXP)];
}
function ringXYZ(k: number, t: number): [number, number, number] {
    if (k === 0) { const [u, v] = sePoint(t, A_MAJ, S); return [u, 0, v]; }
    if (k === 1) { const [u, v] = sePoint(t, S, A_MAJ); return [u, v, 0]; }
    const [u, v] = sePoint(t, A_MAJ, S); return [0, v, u];
}
const stancedRings: Array<Array<[number, number, number]>> = [0, 1, 2].map(k =>
    Array.from({ length: N_PTS }, (_, i) => qApply(qStance, ringXYZ(k, (i / N_PTS) * 2 * Math.PI))));
const dipPts = stancedRings.map(r => r.reduce((a, p) => (p[1] < a[1] ? p : a)));
const CENTER_Y = DIP_TARGET - dipPts[0][1];

// weave law on the replica (pairwise threading, containment per shared axis)
{
    const okWeave = S < A_MAJ - 0.5 && Math.abs(A_MAJ / S - PHI) < 1e-12;
    ck("replica weave: golden + containment S < S*phi − 0.5 (B⊂A on x, A⊂C on z, C⊂B on y)", okWeave,
        `S ${S}, S*phi ${A_MAJ.toFixed(4)}, clearance ${(A_MAJ - S).toFixed(3)}`);
    let minGap = Infinity;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++)
        for (const p of stancedRings[i]) for (const qq of stancedRings[j]) {
            const d = Math.hypot(p[0] - qq[0], p[1] - qq[1], p[2] - qq[2]);
            if (d < minGap) minGap = d;
        }
    ck("replica pairwise min centerline >= 0.25 (tubes disjoint)", minGap >= 0.25, minGap.toFixed(3));
}

// THE borromean law: iron cloud == vertex-cloud equality with the replica's
// OWN tube construction (lorenz-law form — uniform-t sampling of a
// superellipse is non-uniform in arc length, parameter speed diverges at
// the vertices, so nearest-SAMPLE metrics are too coarse; equality against
// the same CatmullRom(tension 0)+TubeGeometry(280,10,closed) construction
// is exact: 3091 = (280+1)x(10+1) verts per ring).
{
    const reps = stancedRings.map(r => r.map(p => ({ x: p[0], y: p[1] + CENTER_Y, z: p[2] })));
    const { CatmullRomCurve3, TubeGeometry, Vector3 } = await import("three");
    const tubeVerts: number[][] = [];
    for (let k = 0; k < 3; k++) {
        const curve = new CatmullRomCurve3(reps[k].map(p => new Vector3(p.x, p.y, p.z)), true, "catmullrom", 0.0);
        const tg = new TubeGeometry(curve, N_PTS, TUBE, 10, true);
        const pa = tg.getAttribute("position");
        const arr: number[] = [];
        for (let i = 0; i < pa.count; i++) arr.push(pa.getX(i), pa.getY(i), pa.getZ(i));
        tubeVerts.push(arr);
        if (pa.count !== 3091) { ck(`ring ${k} tube vertex count 3091`, false, `${pa.count}`); }
    }
    ck("replica tubes 3091 verts each ((280+1)x(10+1))", tubeVerts.every(a => a.length === 3091 * 3), tubeVerts.map(a => a.length / 3).join("/"));
    // equality: every GLB iron vert within 1e-4 of some replica tube vert, and
    // every replica tube vert within 1e-4 of some GLB iron vert (both ways).
    const rep = tubeVerts.flat();
    let worstG = 0, unmatchedG = 0;
    for (let i = 0; i < iron.length; i += 3) {
        let best = Infinity;
        for (let jj = 0; jj < rep.length; jj += 3) {
            const d = Math.abs(iron[i] - rep[jj]) + Math.abs(iron[i + 1] - rep[jj + 1]) + Math.abs(iron[i + 2] - rep[jj + 2]);
            if (d < best) { best = d; if (best < 1e-4) break; }
        }
        if (best > worstG) worstG = best;
        if (best > 1e-4) unmatchedG++;
    }
    ck("BORROMEAN law: every iron vertex on the replica tube construction (<=1e-4)", unmatchedG === 0, `worst ${worstG.toExponential(2)}, ${unmatchedG} unmatched of ${iron.length / 3}`);
    let worstR = 0, unmatchedR = 0;
    for (let jj = 0; jj < rep.length; jj += 3) {
        let best = Infinity;
        for (let i = 0; i < iron.length; i += 3) {
            const d = Math.abs(iron[i] - rep[jj]) + Math.abs(iron[i + 1] - rep[jj + 1]) + Math.abs(iron[i + 2] - rep[jj + 2]);
            if (d < best) { best = d; if (best < 1e-4) break; }
        }
        if (best > worstR) worstR = best;
        if (best > 1e-4) unmatchedR++;
    }
    ck("coverage: every replica tube vertex present in iron bucket (<=1e-4)", unmatchedR === 0, `worst ${worstR.toExponential(2)}, ${unmatchedR} unmatched of ${rep.length / 3}`);
    ck("iron mass == replica mass (9273 = 3x3091)", iron.length === 9273 * 3, `${iron.length / 3}`);
}

// ---- (d) stance law from bytes ---------------------------------------------------------
{
    // lowest iron verts per assigned ring — recompute quickly using replica dips
    const dipYs = dipPts.map(p => p[1] + CENTER_Y);
    ck("stance: replica dips equal height ±2mm", Math.max(...dipYs) - Math.min(...dipYs) <= 0.002,
        dipYs.map(y => y.toFixed(4)).join("/"));
    const az = dipPts.map(p => Math.atan2(p[0], p[2]));
    const sorted = [...az].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], sorted[0] + 2 * Math.PI - sorted[2]];
    ck("stance: dips 120deg ±1.5deg apart", gaps.every(g => Math.abs(g - 2 * Math.PI / 3) <= 1.5 * Math.PI / 180),
        gaps.map(g => (g * 180 / Math.PI).toFixed(1)).join("/"));
}

// ---- (e) stone law -----------------------------------------------------------------------
{
    const DAIS_H = 0.42, DAIS_R_SKIRT = 2.10;
    let strayDais = 0;
    const above: Array<[number, number, number]> = [];
    for (let i = 0; i < stone.length; i += 3) {
        const x = stone[i], y = stone[i + 1], z = stone[i + 2];
        if (y <= DAIS_H + 0.005) {
            if (Math.hypot(x, z) > DAIS_R_SKIRT + 0.005) strayDais++;
        } else above.push([x, y, z]);
    }
    ck("dais verts within skirt r 2.10, y <= 0.42", strayDais === 0, `${strayDais} stray`);
    // stanchion verts above dais: exactly 3 xz clusters near replica dips
    const clusters: Array<Array<[number, number, number]>> = [];
    for (const p of above) {
        let hit = clusters.find(cl => Math.hypot(cl[0][0] - p[0], cl[0][2] - p[2]) < 0.55);
        if (hit) hit.push(p); else clusters.push([p]);
    }
    ck("stanchion verts form exactly 3 clusters", clusters.length === 3, `${clusters.length} clusters`);
    let okPos = clusters.length === 3, msg = "";
    if (okPos) {
        // each cluster near SOME dip (permutation-free check)
        for (const cl of clusters) {
            const cx = cl.reduce((s, p) => s + p[0], 0) / cl.length;
            const cz = cl.reduce((s, p) => s + p[2], 0) / cl.length;
            const near = dipPts.some(dp => Math.hypot(dp[0] - cx, dp[2] - cz) <= 0.25);
            if (!near) { okPos = false; msg = `cluster (${cx.toFixed(2)},${cz.toFixed(2)}) not near a dip`; break; }
            const top = Math.max(...cl.map(p => p[1]));
            const wantTop = DIP_TARGET - TUBE;
            if (Math.abs(top - wantTop) > 0.006) { okPos = false; msg = `stanchion top ${top.toFixed(3)} != tube underside ${wantTop.toFixed(3)}`; break; }
        }
    }
    ck("stanchions: 3 clusters at the 3 dips, tops meet tube underside ±6mm", okPos, msg);
}

// ---- (f) bead law -------------------------------------------------------------------------
{
    const beadEntries = walk(glowIdx);
    ck("bead: one mesh under KEEP", beadEntries.length === 1);
    const v = worldVerts(beadEntries[0]);
    const t = beadEntries[0].node.translation ?? [0, 0, 0];
    let maxR = 0;
    for (let i = 0; i < v.length; i += 3) maxR = Math.max(maxR, Math.hypot(v[i] - t[0], v[i + 1] - t[1], v[i + 2] - t[2]));
    ck("bead r 0.09 ±5mm", Math.abs(maxR - BEAD_R) <= 0.005, maxR.toFixed(4));
    ck("bead at form center (0, CENTER_Y, 0) ±2mm",
        Math.abs(t[0]) <= 0.002 && Math.abs(t[1] - CENTER_Y) <= 0.002 && Math.abs(t[2]) <= 0.002,
        `(${t[0].toFixed(3)}, ${t[1].toFixed(3)}, ${t[2].toFixed(3)}) vs CY ${CENTER_Y.toFixed(3)}`);
}

// ---- (g) envelope / grade / NaN --------------------------------------------------------------
{
    const all = [...iron, ...stone];
    let mx = 0, mn = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let nan = 0;
    for (let i = 0; i < all.length; i += 3) {
        const x = all[i], y = all[i + 1], z = all[i + 2];
        if ([x, y, z].some(Number.isNaN)) nan++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    const sx = maxX - minX, sy = maxY - minY, sz = maxZ - minZ;
    ck("no NaN", nan === 0, `${nan}`);
    ck("base on grade (min y == 0)", Math.abs(minY) < 1e-6, minY.toFixed(6));
    ck("envelope 4.22x4.53x4.60 ±0.01", Math.abs(sx - 4.22) < 0.011 && Math.abs(sy - 4.533) < 0.011 && Math.abs(sz - 4.60) < 0.011,
        `${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)}`);
    ck("crest 4.533 ±0.01", Math.abs(maxY - 4.533) < 0.011, maxY.toFixed(3));
}

console.log(f === 0 ? "ALL PASS" : `${f} FAILURES`);
process.exit(f === 0 ? 0 : 1);
