// struct119-decode-brachistochrone.ts — decode audit of village_brachistochrone3.glb.
// Verifies from BYTES (independent replica of the construction, NO mk imports
// — the lorenz/borromean law pattern):
//   (a) pinned sha, node census 10 (3 static material buckets + 7 KEEP glow
//       beads), texMat lanes brr_stone + brr_iron, brass emissive exported;
//   (b) THE CYCLOID LAW from bytes: fresh replica of both rails (chord
//       segment + exact inverted cycloid, constants re-derived from
//       THETA/L only) — every iron vertex within RAIL+2mm of the replica
//       centerline union; every replica sample covered by the iron cloud;
//   (c) RACE LAW recomputed: cycloid descent time < chord descent time;
//   (d) LENS LAW from replica: mid-span rail separation > 1.0m;
//   (e) BEAD LAWS from bytes: 7 glow KEEP beads at release / 5 exact
//       cycloid time-fractions / landing; 5 plain brass bead clusters at
//       the exact closed-form chord time-fraction positions;
//   (f) STONE LAW from bytes: plinth slab at grade spanning the race, post
//       under the crest, pier under the dip, drum under the finish;
//   (g) envelope == 8.74x4.02x2.14 y[0..4.018] from decoded accessors,
//       base on grade, no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_brachistochrone3.glb`);
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

// ---- independent constants (re-derived; must match mk by construction law) ----------------
const THETA = 3.8, L = 7.2, FINY = 1.0, RAIL = 0.055, BEAD_R = 0.095;
const R = L / (THETA - Math.sin(THETA));
const H = R * (1 - Math.cos(THETA));
const cyc = (t: number): [number, number, number] => [R * (t - Math.sin(t)), FINY + H - R * (1 - Math.cos(t)), 0];
const chordPt = (t: number): [number, number, number] => [t * L, FINY + H * (1 - t), 0];
const GRAV = 9.81;
const T_CYC = Math.sqrt(R / GRAV) * THETA;
const SIN_A = H / Math.hypot(L, H);
const T_CHORD = Math.sqrt(2 * Math.hypot(L, H) / (GRAV * SIN_A));

// ---- (a) structure ---------------------------------------------------------------------
{
    ck("sha pinned f678c069e84e51a2", sha === "f678c069e84e51a2a6c1a980f46105f3330f0d3a8aa740237074bacca2130312", sha.slice(0, 16));
    const glows = names.filter(n => n.startsWith("glow_brr_"));
    ck("node census 10 (3 buckets + 7 KEEP)", names.length === 10 && glows.length === 7, `${names.length} nodes, ${glows.length} glow: ${names.join(",")}`);
    const mats = j.materials.map((m: any) => m.name);
    ck("texMat lanes brr_iron + brr_stone + brr_brass", mats.includes("brr_iron") && mats.includes("brr_stone") && mats.includes("brr_brass"), mats.join(","));
    const emissive = j.materials.filter((m: any) => (m as any).emissiveFactor);
    ck("brass emissive exported (glow lane)", emissive.length >= 1, `${emissive.length} emissive materials`);
}

// ---- mesh walker (children are INDICES — probe pitfall 3) --------------------------------
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
function bucketMat(nodeIdx: number): string {
    const e = walk(nodeIdx)[0];
    if (!e || !e.mesh?.primitives?.[0] || e.mesh.primitives[0].material === undefined) return "";
    return j.materials[e.mesh.primitives[0].material]?.name ?? "";
}
const ironIdx = names.findIndex((_, i) => bucketMat(i) === "brr_iron");
const stoneIdx = names.findIndex((_, i) => bucketMat(i) === "brr_stone");
const brassIdx = names.findIndex((_, i) => bucketMat(i) === "brr_brass");
ck("iron + stone + plain-brass buckets identified", ironIdx >= 0 && stoneIdx >= 0 && brassIdx >= 0, `iron ${ironIdx}, stone ${stoneIdx}, brass ${brassIdx}`);
const iron = walk(ironIdx).flatMap(e => Array.from(worldVerts(e)));
const stone = walk(stoneIdx).flatMap(e => Array.from(worldVerts(e)));
const brass = brassIdx >= 0 ? walk(brassIdx).flatMap(e => Array.from(worldVerts(e))) : [];

// ---- (b) cycloid law: iron cloud vs fresh replica centerline union ------------------------
function distToSeg(px: number, py: number, pz: number, a: number[], b: number[]): number {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * abx + (py - a[1]) * aby + (pz - a[2]) * abz) / (abx * abx + aby * aby + abz * abz)));
    return Math.hypot(px - (a[0] + abx * t), py - (a[1] + aby * t), pz - (a[2] + abz * t));
}
{
    // dense replica centerlines
    const cycLine: number[][] = Array.from({ length: 801 }, (_, i) => cyc((i / 800) * THETA));
    const chordLine: number[][] = Array.from({ length: 801 }, (_, i) => chordPt(i / 800));
    function railDist(x: number, y: number, z: number): number {
        let m = Infinity;
        for (let i = 0; i < 800; i++) {
            let d = distToSeg(x, y, z, cycLine[i], cycLine[i + 1]); if (d < m) m = d;
            d = distToSeg(x, y, z, chordLine[i], chordLine[i + 1]); if (d < m) m = d;
        }
        return m;
    }
    let worst = 0, worstAt = "";
    for (let i = 0; i < iron.length; i += 3) {
        const d = railDist(iron[i], iron[i + 1], iron[i + 2]);
        if (d > worst) { worst = d; worstAt = `(${iron[i].toFixed(2)},${iron[i + 1].toFixed(2)},${iron[i + 2].toFixed(2)})`; }
    }
    ck("every iron vertex on the replica rails (RAIL+2mm)", worst <= RAIL + 0.002, `worst ${worst.toFixed(4)} at ${worstAt}`);
    // coverage: every replica sample near some iron vertex (tube sampling is
    // discrete: chord 48 segs / cycloid 200 segs, radial 8)
    function cloudDist(p: number[]): number {
        let m = Infinity;
        for (let i = 0; i < iron.length; i += 3) {
            const d = Math.hypot(iron[i] - p[0], iron[i + 1] - p[1], iron[i + 2] - p[2]);
            if (d < m) m = d;
        }
        return m;
    }
    let wCov = 0;
    for (const p of cycLine) { const d = cloudDist(p); if (d > wCov) wCov = d; }
    let wCovC = 0;
    for (const p of chordLine) { const d = cloudDist(p); if (d > wCovC) wCovC = d; }
    // coverage tolerance documents DISCRETE tube sampling: a centerline
    // sample between two rings is up to half-segment from the nearest ring
    // plane, and ring vertices sit ON the tube circle (RAIL from the
    // centerline) — worst-case sqrt((seg/2)^2+RAIL^2). Cycloid: 200 segs /
    // 8.6m arc -> 43mm rings, bound ~59mm (+margin 75). Chord: 48 segs /
    // 7.58m -> 158mm rings, bound ~96mm (+margin 120).
    ck("replica covered by iron cloud (cycloid <75mm, discrete-ring bound)", wCov < 0.075, `worst ${wCov.toFixed(4)}`);
    ck("replica covered by iron cloud (chord <120mm, 48-seg tube)", wCovC < 0.12, `worst ${wCovC.toFixed(4)}`);
}

// ---- (c) race law recomputed ---------------------------------------------------------------
ck("race law: cycloid faster than chord", T_CYC < T_CHORD, `${T_CYC.toFixed(3)}s vs ${T_CHORD.toFixed(3)}s (ratio ${(T_CYC / T_CHORD).toFixed(3)})`);

// ---- (d) lens law from replica: the rails meet ONLY at the two endpoints -------------------
// (a lens legitimately closes at both ends — the first draft's "min interior
// gap > 1.0m" was a READER error; the true law: separation is zero at the
// endpoints, grows, peaks, returns — and the dive is DEEP: max > 1.0m).
{
    const gaps: number[] = [];
    for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * L;
        let lo = 0, hi = THETA;
        for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (R * (mid - Math.sin(mid)) < x) lo = mid; else hi = mid; }
        const p = cyc((lo + hi) / 2);
        const q = chordPt(x / L);
        gaps.push(Math.hypot(p[0] - q[0], p[1] - q[1]));
    }
    const maxGap = Math.max(...gaps);
    ck("lens law: dive depth (max separation) > 1.0m", maxGap > 1.0, `max gap ${maxGap.toFixed(3)}m`);
    ck("lens law: rails coincide only at endpoints", gaps[0] < 1e-9 && gaps[gaps.length - 1] < 1e-9 && gaps[1] > 0.01 && gaps[gaps.length - 2] > 0.01,
        `endpoints ${gaps[0].toExponential(1)}/${gaps[gaps.length - 1].toExponential(1)}, near-end ${gaps[1].toFixed(3)}/${gaps[gaps.length - 2].toFixed(3)}`);
}

// ---- (e) bead laws from bytes ----------------------------------------------------------------
{
    // glow KEEP beads by node translation
    const glowPos: number[][] = [];
    for (let i = 0; i < names.length; i++) {
        if (!names[i].startsWith("glow_brr_")) continue;
        const e = walk(i)[0];
        const t = e.node.translation ?? [0, 0, 0];
        glowPos.push(t);
    }
    ck("7 glow bead translations read", glowPos.length === 7, `${glowPos.length}`);
    // expected: release, 5 cycloid fractions, landing
    const want: number[][] = [cyc(0)];
    for (const fr of [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6]) want.push(cyc(fr * THETA));
    want.push([L, FINY + 0.02, 0]);
    let ok = 0;
    for (const w of want) {
        let best = Infinity;
        for (const p of glowPos) best = Math.min(best, Math.hypot(p[0] - w[0], p[1] - w[1], p[2] - w[2]));
        if (best <= 0.003) ok++;
    }
    ck("glow beads at exact law positions (<=3mm)", ok === 7, `${ok}/7 matched`);
    // plain brass beads: cluster by x, each centroid on the chord at exact time fractions
    const xs: number[] = [];
    for (let i = 0; i < brass.length; i += 3) xs.push(brass[i]);
    xs.sort((a, b) => a - b);
    const clusters: number[][] = [[]];
    for (const x of xs) {
        const c = clusters[clusters.length - 1];
        if (c.length && x - c[c.length - 1] > 0.3) clusters.push([x]); else c.push(x);
    }
    ck("plain brass clusters into 5 beads", clusters.length === 5, `${clusters.length} clusters`);
    let okB = 0;
    for (const fr of [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6]) {
        const T = fr * T_CHORD;
        const s = (GRAV * SIN_A / 2) * T * T;                 // closed-form arc at time fraction
        const t = s / Math.hypot(L, H);
        const w = chordPt(t);
        let best = Infinity;
        for (let i = 0; i < brass.length; i += 3) {
            const d = Math.hypot(brass[i] - w[0], brass[i + 1] - w[1]);
            if (d < best) best = d;
        }
        if (best <= BEAD_R + 0.003) okB++;
    }
    ck("plain beads at exact chord time-fractions (<=R+3mm)", okB === 5, `${okB}/5 matched`);
}
// ---- (f) stone law from bytes -------------------------------------------------------------------
{
    let minY = Infinity, maxX = -Infinity, minX = Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < stone.length; i += 3) {
        minY = Math.min(minY, stone[i + 1]); maxX = Math.max(maxX, stone[i]); minX = Math.min(minX, stone[i]);
        minZ = Math.min(minZ, stone[i + 2]); maxZ = Math.max(maxZ, stone[i + 2]);
    }
    ck("stone spans the race at grade", minY >= -0.001 && minX < -0.5 && maxX > L + 0.5, `x[${minX.toFixed(2)}..${maxX.toFixed(2)}] minY ${minY.toFixed(3)}`);
    // post under the crest: stone verts near x=0 with y > 1.0
    const postY = Math.max(...stone.filter((_, i) => i % 3 === 1 && Math.abs(stone[i - 1]) < 0.25 && i % 3 === 1 ? true : false));
    void postY;
    let postTop = -Infinity;
    for (let i = 0; i < stone.length; i += 3) if (Math.abs(stone[i]) < 0.25) postTop = Math.max(postTop, stone[i + 1]);
    ck("post rises under the crest bead", postTop > FINY + H - BEAD_R - 0.02 - 0.01 && postTop < FINY + H, `post top ${postTop.toFixed(3)} vs bead underside ${(FINY + H - BEAD_R).toFixed(3)}`);
    const DIP_X = R * Math.PI;
    let pierTop = -Infinity;
    for (let i = 0; i < stone.length; i += 3) if (Math.abs(stone[i] - DIP_X) < 0.25) pierTop = Math.max(pierTop, stone[i + 1]);
    const dipY = cyc(Math.PI)[1];
    ck("pier rises under the dip", Math.abs(pierTop - (dipY - RAIL)) < 0.02, `pier top ${pierTop.toFixed(3)} vs rail underside ${(dipY - RAIL).toFixed(3)}`);
    let drumTop = -Infinity;
    for (let i = 0; i < stone.length; i += 3) if (Math.abs(stone[i] - L) < 0.3 && Math.abs(stone[i + 2]) < 0.25) drumTop = Math.max(drumTop, stone[i + 1]);
    ck("drum rises to the finish rim", Math.abs(drumTop - FINY) < 0.02, `drum top ${drumTop.toFixed(3)} vs rim ${FINY}`);
}

// ---- (g) envelope + NaN (over ALL nodes incl. KEEP glow beads) --------------------------------
{
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity, nan = 0;
    for (let i = 0; i < names.length; i++) {
        for (const e of walk(i)) {
            const arr = worldVerts(e);
            for (let k = 0; k < arr.length; k += 3) {
                if ([arr[k], arr[k + 1], arr[k + 2]].some(isNaN)) { nan++; continue; }
                mnx = Math.min(mnx, arr[k]); mxx = Math.max(mxx, arr[k]);
                mny = Math.min(mny, arr[k + 1]); mxy = Math.max(mxy, arr[k + 1]);
                mnz = Math.min(mnz, arr[k + 2]); mxz = Math.max(mxz, arr[k + 2]);
            }
        }
    }
    ck("envelope 8.74x4.02x2.14", Math.abs((mxx - mnx) - 8.74) < 0.02 && Math.abs((mxy - mny) - 4.02) < 0.02 && Math.abs((mxz - mnz) - 2.14) < 0.02,
        `${(mxx - mnx).toFixed(2)}x${(mxy - mny).toFixed(2)}x${(mxz - mnz).toFixed(2)}`);
    ck("base on grade", mny >= -0.001, `minY ${mny.toFixed(4)}`);
    ck("no NaN vertices", nan === 0, `${nan}`);
}

console.log(f === 0 ? `DECODE ALL PASS (${16} checks)` : `DECODE FAIL (${f})`);
process.exit(f === 0 ? 0 : 1);
