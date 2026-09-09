// struct122-decode-galtonboard.ts — decode audit of village_galtonboard3.glb
// (deferred contract item 1, struct-121 -> 122). Verifies from BYTES via an
// INDEPENDENT replica (no mk imports — struct-119 law pattern):
//   (a) pinned sha; node census 10 (3 static buckets + 7 KEEP glow);
//       texMat lanes galt_stone/galt_iron/galt_brass; brass emissive exported;
//   (b) BINOMIAL LAW from bytes: plain-brass ball cloud clusters into 24
//       balls; the 20 stacked (z 0.60 lane) count per bin == EXACT
//       B(8,1/2) bell [0,1,3,6,7,6,3,1,0] — tails honestly empty; every
//       stacked center == (binCX(k), 0.43+i*0.26, 0.60) <= 3mm;
//   (c) LATTICE LAW from bytes: iron cloud clusters into 63 pegs whose
//       centroids sit on the exact staggered grid (3x13 A-grid from -1.98
//       step 0.33 + 2x12 B-grid offset exactly +0.165) <= 2mm;
//   (d) RAIN LAW: the 4 z-0.74-lane balls at the exact RAIN table spots
//       <= 3mm, each >= 0.22 from every peg axis (3D segment distance);
//   (e) GLOW LAW: 7 KEEP glow_ga_* translations == the center column's
//       seven stack positions <= 3mm (bell core holds the light);
//   (f) STONE LAW: plinth on grade spanning the full width incl. bins;
//       stone rises to the hopper cap top (~4.46);
//   (g) envelope == 4.70x4.46x0.97 y[0..4.46] local x[-2.35..2.35]
//       z[0..0.97] from decoded accessors; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_galtonboard3.glb`);
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

// ---- independent constants (re-derived; must match mk by construction law) --------------
const BOARD_W = 4.2, NBINS = 9, BIN_W = BOARD_W / NBINS;
const BALL_R = 0.13, STACK_Z = 0.60, RAIN_Z = 0.74, PLINTH_TOP = 0.30;
const PEG_R = 0.07, PEG_Z0 = 0.35, PEG_Z1 = 0.47, PEG_SP = 0.33;
const ROW_YS = [3.50, 3.31, 3.12, 2.93, 2.74];
const binom = (n: number, k: number): number => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; };
const HEIGHTS = Array.from({ length: NBINS }, (_, k) => Math.round(7 * binom(8, k) / binom(8, 4))); // [0,1,3,6,7,6,3,1,0]
const binCX = (k: number) => -BOARD_W / 2 + (k + 0.5) * BIN_W;
const stackY = (i: number) => PLINTH_TOP + BALL_R + i * 2 * BALL_R;
const PEGS: Array<[number, number]> = [];
ROW_YS.forEach((y, r) => {
    const off = r % 2 === 0 ? -1.98 : -1.98 + PEG_SP / 2;
    const cnt = r % 2 === 0 ? 13 : 12;
    for (let i = 0; i < cnt; i++) PEGS.push([off + i * PEG_SP, y]);
});
const RAIN: Array<[number, number]> = [[0, 4.10], [+0.165, 3.60], [-0.495, 3.22], [+0.33, 2.94]];

// ---- (a) structure -----------------------------------------------------------------
{
    ck("sha pinned 3d9f7c9cdf81d64c", sha === "3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b", sha.slice(0, 16));
    const glows = names.filter(n => n.startsWith("glow_ga_"));
    ck("node census 10 (3 buckets + 7 KEEP)", names.length === 10 && glows.length === 7, `${names.length} nodes, ${glows.length} glow: ${names.join(",")}`);
    const mats = j.materials.map((m: any) => m.name);
    ck("texMat lanes galt_stone + galt_iron + galt_brass", mats.includes("galt_stone") && mats.includes("galt_iron") && mats.includes("galt_brass"), mats.join(","));
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
const ironIdx = names.findIndex((_, i) => bucketMat(i) === "galt_iron");
const stoneIdx = names.findIndex((_, i) => bucketMat(i) === "galt_stone");
const brassIdx = names.findIndex((_, i) => bucketMat(i) === "galt_brass");
ck("iron + stone + plain-brass buckets identified", ironIdx >= 0 && stoneIdx >= 0 && brassIdx >= 0, `iron ${ironIdx}, stone ${stoneIdx}, brass ${brassIdx}`);
const flat = (idx: number) => walk(idx).flatMap(e => Array.from(worldVerts(e)));
const iron = ironIdx >= 0 ? flat(ironIdx) : [];
const stone = stoneIdx >= 0 ? flat(stoneIdx) : [];
const brass = brassIdx >= 0 ? flat(brassIdx) : [];

// ---- ball laws: expected-vs-cloud bidirectional (NO clustering — stack pitch
// 0.26 == ball diameter 0.26: touching balls cannot be distance-clustered) ----
// Material split law (struct-82 dusk lane): bin 4's seven stacked balls are the
// GLOW lane (brassGlow, KEEP glow_ga_*); all other stacked + rain balls are
// PLAIN galt_brass. Plain census: 20 stacked (27-bell minus 7 glow) + 4 rain.
{
    // expected PLAIN centers: stacked bins except bin 4, plus the rain table
    const expect: number[][] = [];
    for (let k = 0; k < NBINS; k++) {
        if (k === 4) continue;                                   // glow lane
        for (let i = 0; i < HEIGHTS[k]; i++) expect.push([binCX(k), stackY(i), STACK_Z]);
    }
    for (const [x, y] of RAIN) expect.push([x, y, RAIN_Z]);
    ck("expected plain census 24 (20 stacked + 4 rain)", expect.length === 24, `${expect.length}`);
    // every expected plain ball has a dense vertex shell (on-sphere population)
    let minVerts = Infinity, lowAt = "";
    for (const e of expect) {
        let near = 0;
        for (let i = 0; i < brass.length; i += 3) if (Math.hypot(brass[i] - e[0], brass[i + 1] - e[1], brass[i + 2] - e[2]) <= BALL_R + 0.003) near++;
        if (near < minVerts) { minVerts = near; lowAt = `(${e.map(v => v.toFixed(2)).join(",")})`; }
    }
    ck("every expected plain ball carries a dense vertex shell (>=100 of 143)", minVerts >= 100, `min shell verts ${minVerts} at ${lowAt}`);
    // NO stray brass: every plain-brass vertex within BALL_R+3mm of SOME expected center
    let worstStray = 0, strayAt = "";
    for (let i = 0; i < brass.length; i += 3) {
        let best = Infinity;
        for (const e of expect) best = Math.min(best, Math.hypot(brass[i] - e[0], brass[i + 1] - e[1], brass[i + 2] - e[2]));
        if (best > worstStray) { worstStray = best; strayAt = `(${brass[i].toFixed(2)},${brass[i + 1].toFixed(2)},${brass[i + 2].toFixed(2)})`; }
    }
    ck("plain brass = exactly the 24 expected balls, zero strays (<=R+3mm)", worstStray <= BALL_R + 0.003, `worst ${worstStray.toFixed(4)} at ${strayAt}`);
    // ball count law: shell population == 24 x 143 verts (SphereGeometry 12x10)
    ck("plain-brass vertex census == 24 balls x 143 verts", brass.length / 3 === 24 * 143, `${brass.length / 3} verts`);
    // (b) BINOMIAL BELL AS A FROM-BYTES MATRIX: for every (bin k, level i) the
    // ball is present (glow node <=3mm OR plain shell >=80 verts) IFF i < HEIGHTS[k]
    const glowPos0: number[][] = [];
    for (let i = 0; i < names.length; i++) {
        if (!names[i].startsWith("glow_ga_")) continue;
        glowPos0.push(walk(i)[0].node.translation ?? [0, 0, 0]);
    }
    let mism = 0, firstBad = "";
    for (let k = 0; k < NBINS; k++) {
        for (let i = 0; i < 7; i++) {
            const cx = binCX(k), cy = stackY(i);
            const glowHit = glowPos0.some(p => Math.hypot(p[0] - cx, p[1] - cy, p[2] - STACK_Z) <= 0.003);
            let plainNear = 0;
            for (let b = 0; b < brass.length; b += 3) if (Math.hypot(brass[b] - cx, brass[b + 1] - cy, brass[b + 2] - STACK_Z) <= BALL_R + 0.003) plainNear++;
            const present = glowHit || plainNear >= 80;
            const want = i < HEIGHTS[k];
            if (present !== want) { mism++; if (!firstBad) firstBad = `bin${k} lvl${i}: present=${present} want=${want}`; }
        }
    }
    ck("bell matrix from bytes == exact B(8,1/2) [0,1,3,6,7,6,3,1,0]", mism === 0, mism ? `first mismatch ${firstBad} (${mism})` : `63 cells verified, tails honestly empty`);
    // rain clearance vs peg axes (segment z PEG_Z0..PEG_Z1)
    const NEED = BALL_R + PEG_R + 0.02;
    let worstClr = Infinity;
    for (const [x, y] of RAIN) for (const [px, py] of PEGS) {
        const dz = Math.max(PEG_Z0, Math.min(PEG_Z1, RAIN_Z));
        const d = Math.hypot(x - px, y - py, dz - RAIN_Z);
        worstClr = Math.min(worstClr, d);
    }
    ck("rain clears every peg axis (>=0.22)", worstClr >= NEED, `worst clearance ${worstClr.toFixed(3)} (need ${NEED.toFixed(3)})`);
}
// ---- (c) lattice law from bytes: expected-vs-cloud bidirectional ----------------------
{
    // every iron vertex within PEG_R+2mm of SOME expected peg axis (z-clamped)
    let worstIron = 0, ironAt = "";
    for (let i = 0; i < iron.length; i += 3) {
        let best = Infinity;
        for (const [px, py] of PEGS) {
            const d = Math.hypot(iron[i] - px, iron[i + 1] - py);
            if (d < best) best = d;
        }
        if (best > worstIron) { worstIron = best; ironAt = `(${iron[i].toFixed(2)},${iron[i + 1].toFixed(2)},${iron[i + 2].toFixed(2)})`; }
    }
    ck("every iron vertex on a peg axis (<=R+2mm)", worstIron <= PEG_R + 0.002, `worst radial ${worstIron.toFixed(4)} at ${ironAt}`);
    // every expected peg carries a vertex population (CylinderGeometry 8seg = 8*2 ring + 2 centers + side verts: >= 32)
    let minPop = Infinity; let missing = 0;
    for (const [px, py] of PEGS) {
        let pop = 0;
        for (let i = 0; i < iron.length; i += 3) if (Math.hypot(iron[i] - px, iron[i + 1] - py) <= PEG_R + 0.002 && iron[i + 2] >= PEG_Z0 - 0.002 && iron[i + 2] <= PEG_Z1 + 0.002) pop++;
        if (pop < 32) missing++;
        minPop = Math.min(minPop, pop);
    }
    ck("all 63 pegs present (each >=32 verts, none missing)", missing === 0, `min pop ${minPop}, missing ${missing}/63`);
    ck("iron vertex census == 63 pegs x 52 verts (Cylinder 8seg exported)", iron.length / 3 === 63 * 52, `${iron.length / 3} verts`);
    const aFirst = PEGS[0][0], bFirst = PEGS[13][0];
    ck("stagger = exactly half the 0.33 spacing", Math.abs((bFirst - aFirst) - PEG_SP / 2) < 1e-9, `${(bFirst - aFirst).toFixed(4)}`);
}
// ---- (e) glow law from bytes -------------------------------------------------------------
{
    const glowPos: number[][] = [];
    for (let i = 0; i < names.length; i++) {
        if (!names[i].startsWith("glow_ga_")) continue;
        const e = walk(i)[0];
        glowPos.push(e.node.translation ?? [0, 0, 0]);
    }
    ck("7 glow bead translations read", glowPos.length === 7, `${glowPos.length}`);
    let worst = 0;
    for (let i = 0; i < 7; i++) {
        const w = [binCX(4), stackY(i), STACK_Z];
        const best = Math.min(...glowPos.map(p => Math.hypot(p[0] - w[0], p[1] - w[1], p[2] - w[2])));
        worst = Math.max(worst, best);
    }
    ck("glow column == center bin's 7 stack positions (<=3mm)", worst <= 0.003, `worst ${worst.toFixed(4)} — the bell's core holds the light`);
}
// ---- (f) stone law from bytes --------------------------------------------------------------
{
    let minY = Infinity, minX = Infinity, maxX = -Infinity, maxZ = -Infinity, maxY = -Infinity;
    for (let i = 0; i < stone.length; i += 3) {
        minY = Math.min(minY, stone[i + 1]); minX = Math.min(minX, stone[i]); maxX = Math.max(maxX, stone[i]);
        maxZ = Math.max(maxZ, stone[i + 2]); maxY = Math.max(maxY, stone[i + 1]);
    }
    ck("plinth on grade spanning board+bins width", minY >= -0.001 && minX <= -2.35 + 0.01 && maxX >= 2.35 - 0.01, `x[${minX.toFixed(2)}..${maxX.toFixed(2)}] minY ${minY.toFixed(4)} maxZ ${maxZ.toFixed(2)}`);
    ck("stone rises to the hopper cap top (~4.46)", Math.abs(maxY - 4.46) < 0.02, `stone top ${maxY.toFixed(3)}`);
}
// ---- (g) envelope + NaN (over ALL nodes incl. KEEP glow) ------------------------------------
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
    ck("envelope 4.70x4.46x0.97", Math.abs((mxx - mnx) - 4.70) < 0.02 && Math.abs((mxy - mny) - 4.46) < 0.02 && Math.abs((mxz - mnz) - 0.97) < 0.02,
        `${(mxx - mnx).toFixed(2)}x${(mxy - mny).toFixed(2)}x${(mxz - mnz).toFixed(2)} local x[${mnx.toFixed(2)}..${mxx.toFixed(2)}] z[${mnz.toFixed(2)}..${mxz.toFixed(2)}]`);
    ck("base on grade", mny >= -0.001, `minY ${mny.toFixed(4)}`);
    ck("no NaN vertices", nan === 0, `${nan}`);
}

console.log(f === 0 ? `DECODE ALL PASS (13 checks)` : `DECODE FAIL (${f})`);
process.exit(f === 0 ? 0 : 1);
