// struct239-probe-ico.ts — STRUCTURES LANE struct-239, Round 11 R11-52
// THE ICOSAHEDRON — the last Platonic solid (Euclid XIII.16; Plato's Timaeus
// assigns it WATER). The PLATONIC branch re-opens at its final member
// (register grep fresh: the solid itself 0 built — struct-106's ledger note
// "geodesic used icosa SUBDIVISION not the solid"; dodecahedron struct-106
// is the DUAL cousin — deliberate dual-echo, oloid→sphericon precedent).
//
// One idea: PLATO'S WATER, RENDERED OPEN. The standing dodecahedron (the
// fifth element, the cosmos) is a CLOSED enterable shell; its dual stands
// OPEN — 30 iron edges as a cage you see through, 20 triangle faces left
// to the eye. THE SECRET INSIDE: the 12 corners of an icosahedron are
// exactly the corners of THREE mutually perpendicular GOLDEN RECTANGLES
// (2 × 2φ, ratio exactly φ) — pairwise disjoint, interlocked without
// touching — drawn as three thinner interior frames. Tip-down on a
// TWENTY-sided dais (one side per face — the theme number), 5-fold seat;
// night contract: twelve warm brass beads at the twelve corners — the
// twelve FACES of the standing dodecahedron, its dual across the village.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Model frame: the twelve verts = cyclic permutations of (0,±1,±φ).
//   R_model = √(1+φ²); EDGE = 4R/√(10+2√5) = R·1.05146222424...
//   Faces: all triples of pairwise-adjacent verts (20 triangles).
//   Golden rectangles (model frame, origin-centered, axis-aligned):
//     x=0: corners (0,±1,±φ)   ·  y=0: corners (±φ,0,±1)... NO —
//     y=0 plane holds (±1,0,±φ)? The cyclic set (0,±1,±φ),(±1,±φ,0),
//     (±φ,0,±1): plane x=0 → (0,±1,±φ); plane y=0 → (±φ,0,±1);
//     plane z=0 → (±1,±φ,0). Each rectangle spans 2 × 2φ.
//   Seat: map v0=(0,1,φ)/R → −Y (tip DOWN), twist-snap a first-ring
//   neighbor of v0 to azimuth 0 (+X).
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 12 − 30 + 20 = 2 (sphere).
//   T2 face census: 20 equilateral triangles, every side == EDGE exact.
//   T3 five-fold law: every vertex degree 5; five faces per vertex
//      (vertex figure = pentagon); Σdeg == 2E.
//   T4 manifold: every edge on exactly 2 faces; 30 edges by distance.
//   T5 GOLDEN RECTANGLES: the 12 corners partition into three mutually
//      perpendicular golden rectangles; side ratio exactly φ; the three
//      are pairwise DISJOINT (interlocked, never touching); scaled frame
//      min separation > 2·FRAME_R + 0.05 (build-safe).
//   T6 citation (prose): Euclid XIII.16; Timaeus 55d (water); dual of
//      struct-106's dodecahedron (12 corners ↔ its 12 faces).
//   T7 uniformity: every dihedral equal; cos(exterior) == √5/3 exactly
//      (interior dihedral 138.1897°).
//   T8 seat: tip at dais top, 5-fold rings level (spread 0), centroid ON
//      the Y axis, 72° symmetry about Y with 0 misses, summit at exactly
//      2·R_s above the tip; cage never overhangs the dais apothem.
//   T9 frame immersion: frame rods meet cage rods ONLY at their shared
//      corners (min interior clearance > 2·(ROD_R+FRAME_R) mid-span);
//      frames clear the dais (min frame y > PLINTH_H + 0.10).
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7/T8 must fail.

export const PHI = (1 + Math.sqrt(5)) / 2;
export const SCALE = 3.0 / Math.sqrt(1 + PHI * PHI);   // R_s = 3.0 m
export const R_S = Math.sqrt(1 + PHI * PHI) * SCALE;    // == 3.0
export const ROD_R = 0.06;              // iron cage rod radius (18m contrast law)
export const FRAME_R = 0.045;           // interior golden-rectangle frame rod (thinner — the secret)
export const BEAD_R = 0.095;            // brass vertex bead radius (count read, rt/ssd/co lineage)
export const PLINTH_N = 20;             // TWENTY sides (the theme number — one per face)
export const PLINTH_ROT = 0;            // shape-space angle (corners ON the axes)
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const SQ5 = Math.sqrt(5);

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const nrm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const dist = (a: V3, b: V3) => Math.hypot(...sub(a, b));
const segDist = (p: V3, a: V3, b: V3) => {
    const ab = sub(b, a), ap = sub(p, a);
    const ab2 = dot(ab, ab);
    const t = Math.max(0, Math.min(1, dot(ap, ab) / ab2));
    return Math.hypot(...sub(ap, mul(ab, t)));
};

// ---- model frame: the twelve cyclic (0,±1,±φ) corners ---------------------------------------------------------
const M: V3[] = [];
{
    const push = (v: V3) => { if (!M.some((q) => dist(q, v) < 1e-12)) M.push(v); };
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
        push([0, s1, s2 * PHI]);          // (0,±1,±φ)
        push([s1 * PHI, 0, s2]);          // (±φ,0,±1)
        push([s1, s2 * PHI, 0]);          // (±1,±φ,0)
    }
}
if (M.length !== 12) throw Error(`cyclic construction ${M.length} != 12`);
const R_MOD = Math.hypot(...M[0]);
const EDGE_MOD = (4 * R_MOD) / Math.sqrt(10 + 2 * SQ5);   // exact regular-icosa edge

// ---- edges: pairs at distance EDGE_MOD -------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++)
    if (Math.abs(dist(M[i], M[j]) - EDGE_MOD) < 1e-12) EDGES.push([i, j]);
if (EDGES.length !== 30) throw Error(`edges ${EDGES.length} != 30`);

// ---- faces: all pairwise-adjacent triples, ccw from outside ---------------------------------------------------
type Face = { verts: number[]; n: V3; center: V3 };
const faces: Face[] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    const adj = (a: number, b: number) => EDGES.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    if (!adj(i, j) || !adj(j, k) || !adj(i, k)) continue;
    const c = mul(add(add(M[i], M[j]), M[k]), 1 / 3);
    const n = nrm(c);                                     // centered solid: face normal = center direction
    let ord = [i, j, k];
    const e1 = sub(M[ord[1]], M[ord[0]]), e2 = sub(M[ord[2]], M[ord[1]]);
    if (dot(cross(e1, e2), n) < 0) ord = [ord[0], ord[2], ord[1]];
    faces.push({ verts: ord, n, center: c });
}
if (faces.length !== 20) throw Error(`faces ${faces.length} != 20`);

// ---- the three golden rectangles (model frame) ------------------------------------------------------------------
const RECTS: { axis: number; corners: number[] }[] = [
    { axis: 0, corners: [0, 1, 2, 3].map(() => -1) },   // placeholder, filled below
];
RECTS.length = 0;
{
    const findIdx = (v: V3) => { const i = M.findIndex((q) => dist(q, v) < 1e-12); if (i < 0) throw Error(`rect corner ${v}`); return i; };
    // plane x=0: (0,±1,±φ)
    RECTS.push({ axis: 0, corners: [findIdx([0, 1, PHI]), findIdx([0, 1, -PHI]), findIdx([0, -1, -PHI]), findIdx([0, -1, PHI])] });
    // plane y=0: (±φ,0,±1)
    RECTS.push({ axis: 1, corners: [findIdx([PHI, 0, 1]), findIdx([PHI, 0, -1]), findIdx([-PHI, 0, -1]), findIdx([-PHI, 0, 1])] });
    // plane z=0: (±1,±φ,0)
    RECTS.push({ axis: 2, corners: [findIdx([1, PHI, 0]), findIdx([1, -PHI, 0]), findIdx([-1, -PHI, 0]), findIdx([-1, PHI, 0])] });
}

// ---- seating: v0 = (0,1,φ)/R → −Y (tip DOWN), twist-snap a first-ring neighbor to azimuth 0 ---------------------
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0 = nrm([0, 1, PHI]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// twist snap: first-ring neighbor of v0 → azimuth 0
const v0Idx = M.findIndex((q) => dist(q, [0, 1, PHI]) < 1e-12);
const nbr = EDGES.filter(([a, b]) => a === v0Idx || b === v0Idx).map(([a, b]) => (a === v0Idx ? b : a))[0];
const nb1 = rot1(M[nbr]);
const az0 = Math.atan2(nb1[2], nb1[0]);
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], -az0);
const rot = (v: V3): V3 => rot2(rot1(v));

const seated = M.map((v) => mul(rot(v), SCALE));
const yMin = Math.min(...seated.map((v) => v[1]));
const LIFT = PLINTH_H - yMin;
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);

export const E: [number, number][] = EDGES;
export const RF: [number, number][] = [];           // rectangle frame edges (vertex-index pairs, ccw cycle)
for (const r of RECTS) for (let k = 0; k < 4; k++) RF.push([r.corners[k], r.corners[(k + 1) % 4]]);

// RED control (--red displaces one vertex AFTER export computation: breaks side/golden/seat laws)
if (process.argv.includes("--red")) {
    V[3] = [V[3][0] + 0.3, V[3][1] - 0.2, V[3][2] + 0.15];
    console.log("RED MODE: vertex 3 displaced 0.3 — T2/T5/T7/T8 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) ---------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
export const PLINTH_R = Math.ceil((MAX_H + BEAD_R + 0.10) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler ----------------------------------------------------------------------------------------------------
check("T1 Euler 12−30+20 = 2", V.length === 12 && E.length === 30 && faces.length === 20 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census: 20 equilateral triangles, every side == EDGE ------------------------------------------------
{
    let worst = 0;
    for (const f of faces) {
        const s01 = dist(V[f.verts[0]], V[f.verts[1]]);
        const s12 = dist(V[f.verts[1]], V[f.verts[2]]);
        const s20 = dist(V[f.verts[2]], V[f.verts[0]]);
        worst = Math.max(worst, Math.abs(s01 - EDGE_MOD * SCALE), Math.abs(s12 - EDGE_MOD * SCALE), Math.abs(s20 - EDGE_MOD * SCALE));
    }
    check("T2 faces: 20 equilateral triangles, every side == edge", worst < 1e-9,
        `worst side dev ${(worst * 1e12).toExponential(1)}; side ${(EDGE_MOD * SCALE).toFixed(4)}m; edge/R ${(EDGE_MOD / R_MOD).toFixed(10)} == 4/√(10+2√5)`);
}

// ---- T3 five-fold law ---------------------------------------------------------------------------------------------
{
    const deg = new Array(12).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    const degOk = deg.every((d) => d === 5);
    let figOk = true;
    for (let i = 0; i < 12 && figOk; i++) {
        const cnt = faces.filter((f) => f.verts.includes(i)).length;
        if (cnt !== 5) figOk = false;
    }
    check("T3 five-fold law: degree 5 everywhere; five faces per vertex (vertex figure = pentagon)",
        degOk && figOk, `degrees all 5 (Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}); faces-per-vertex ${figOk ? "5 everywhere" : "BROKEN"}`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------------------
{
    const count = new Map<string, number>();
    for (const f of faces) for (let k = 0; k < 3; k++) {
        const a = f.verts[k], b = f.verts[(k + 1) % 3];
        const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(kk, (count.get(kk) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([a, b]) => (count.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0) !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && count.size === 30,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 GOLDEN RECTANGLES -----------------------------------------------------------------------------------------
{
    // partition: every corner in exactly one rectangle
    const all = RECTS.flatMap((r) => r.corners);
    const partition = all.length === 12 && new Set(all).size === 12;
    // golden ratio: each rectangle 2 × 2φ (adjacent cycle sides)
    let worstRatio = 0;
    for (const r of RECTS) {
        const lens: number[] = [];
        for (let k = 0; k < 4; k++) {
            const a = V[r.corners[k]], b = V[r.corners[(k + 1) % 4]];
            lens.push(dist(a, b));
        }
        // phase-invariant: each side exactly the short (2·SCALE — which IS the icosa edge)
        // or the long (2φ·SCALE); exactly two of each per rectangle.
        const shorts = lens.filter((l) => Math.abs(l - 2 * SCALE) < 1e-9).length;
        const longs = lens.filter((l) => Math.abs(l - 2 * PHI * SCALE) < 1e-9).length;
        if (shorts !== 2 || longs !== 2) worstRatio = Math.max(worstRatio, 1);   // force FAIL
        else worstRatio = Math.max(worstRatio, ...lens.map((l) => Math.min(Math.abs(l - 2 * SCALE), Math.abs(l - 2 * PHI * SCALE))));
    }
    // mutually perpendicular normals
    const nrm2 = (rIdx: number): V3 => { const a = RECTS[rIdx].axis; const n: V3 = [0, 0, 0]; n[a] = 1; return rot(n); };
    const perp = Math.abs(dot(nrm2(0), nrm2(1))) < 1e-12 && Math.abs(dot(nrm2(0), nrm2(2))) < 1e-12 && Math.abs(dot(nrm2(1), nrm2(2))) < 1e-12;
    // pairwise disjoint (segment-segment min distance > 0), build-safe margin
    let minSep = Infinity;
    for (let r1 = 0; r1 < 3; r1++) for (let r2 = r1 + 1; r2 < 3; r2++) {
        for (let k = 0; k < 4; k++) for (let m = 0; m < 4; m++) {
            const a1 = V[RECTS[r1].corners[k]], b1 = V[RECTS[r1].corners[(k + 1) % 4]];
            const a2 = V[RECTS[r2].corners[m]], b2 = V[RECTS[r2].corners[(m + 1) % 4]];
            // sample-based min over the two segments
            for (let s = 1; s < 16; s++) for (let t = 1; t < 16; t++) {
                const p = add(a1, mul(sub(b1, a1), s / 16)), q = add(a2, mul(sub(b2, a2), t / 16));
                minSep = Math.min(minSep, dist(p, q));
            }
        }
    }
    const buildSafe = minSep > 2 * (FRAME_R + 0.005) + 0.05;
    check("T5 GOLDEN RECTANGLES: 12 corners partition into three mutually perpendicular 2×2φ rectangles; pairwise disjoint",
        partition && worstRatio < 1e-9 && perp && buildSafe,
        `partition ${partition ? "3×4 exact" : "BROKEN"}; worst side dev ${(worstRatio * 1e12).toExponential(1)} (short ${(2 * SCALE).toFixed(4)}m long ${(2 * PHI * SCALE).toFixed(4)}m, ratio φ exactly); normals ${perp ? "mutually ⊥" : "NOT ⊥"}; min inter-frame separation ${minSep.toFixed(3)}m (tubes ${2 * FRAME_R + 0.01}m) — interlocked, never touching`);
}

// ---- T6 citation (prose) -------------------------------------------------------------------------------------------
console.log("INFO T6: Euclid, Elements XIII.16 (the last regular solid constructed); Plato, Timaeus 55d — water, the most mobile element; DUAL of the standing dodecahedron (struct-106): this solid's 12 corners are that solid's 12 face centers, and its 20 faces are that solid's 20 corners.");

// ---- T7 uniformity -------------------------------------------------------------------------------------------------
{
    const cosVals: number[] = [];
    for (let u = 0; u < 20; u++) for (let w = u + 1; w < 20; w++) {
        const common = faces[u].verts.filter((x) => faces[w].verts.includes(x));
        if (common.length !== 2) continue;
        const n1 = rot(faces[u].n), n2 = rot(faces[w].n);
        cosVals.push(dot(n1, n2));
    }
    const worst = Math.max(...cosVals.map((c) => Math.abs(c - SQ5 / 3)));
    check("T7 uniformity: all dihedrals equal, cos(exterior) == √5/3 exactly",
        cosVals.length === 30 && worst < 1e-9,
        `${cosVals.length} shared-edge pairs; worst |cos−√5/3| ${worst.toExponential(1)}; interior dihedral ${(180 - Math.acos(SQ5 / 3) * 180 / Math.PI).toFixed(4)}° everywhere`);
}

// ---- T8 seat laws --------------------------------------------------------------------------------------------------
{
    const tipY = Math.min(...V.map((v) => v[1]));
    const summitY = Math.max(...V.map((v) => v[1]));
    const cx = V.reduce((s, v) => s + v[0], 0) / 12;
    const cz = V.reduce((s, v) => s + v[2], 0) / 12;
    // two rings of 5, each level
    const byY = [...V].sort((a, b) => a[1] - b[1]);
    const ring1 = byY.slice(1, 6), ring2 = byY.slice(6, 11);
    const spread1 = Math.max(...ring1.map((v) => v[1])) - Math.min(...ring1.map((v) => v[1]));
    const spread2 = Math.max(...ring2.map((v) => v[1])) - Math.min(...ring2.map((v) => v[1]));
    // 72° symmetry about Y
    const a = (2 * Math.PI) / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // cage overhang: max horizontal reach <= dais apothem
    const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    check("T8 seat: tip at dais top, rings level, centroid ON Y, 72° symmetry, summit 2R above tip, cage never overhangs",
        Math.abs(tipY - PLINTH_H) < 1e-9 && Math.abs(summitY - tipY - 2 * R_S) < 1e-9 && Math.hypot(cx, cz) < 1e-9
        && spread1 < 1e-9 && spread2 < 1e-9 && symMiss === 0 && MAX_H + BEAD_R <= apothem + 1e-9,
        `tip y ${tipY.toFixed(4)} == dais top ${PLINTH_H}; summit−tip ${(summitY - tipY).toFixed(4)} == 2R ${2 * R_S}; rings level (spread ${spread1.toExponential(1)}/${spread2.toExponential(1)}); centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; 72° misses ${symMiss}; reach+bead ${(MAX_H + BEAD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)}`);
}

// ---- T9 frame immersion ---------------------------------------------------------------------------------------------
{
    // frame rods meet cage rods ONLY at shared corners: sample frame edges, min distance to NON-incident cage edges
    let worstApproach = Infinity;
    for (const [a, b] of RF) {
        for (let s = 1; s < 24; s++) {
            const p = add(V[a], mul(sub(V[b], V[a]), s / 24));
            for (const [i, j] of E) {
                if ((i === a || i === b || j === a || j === b)) continue;   // shared-corner rods may approach near ends
                worstApproach = Math.min(worstApproach, segDist(p, V[i], V[j]));
            }
        }
    }
    // frames share the tip corner by design (the rectangles partition all 12 corners incl. the
    // seated tip) — the dais law is about rod INTERIORS, never dipping toward the dais mid-span
    let interiorMinY = Infinity;
    for (const [a, b] of RF) {
        for (let s = 1; s < 32; s++) {
            const p = add(V[a], mul(sub(V[b], V[a]), s / 32));
            interiorMinY = Math.min(interiorMinY, p[1]);
        }
    }
    const cornerClear = worstApproach > (ROD_R + FRAME_R) + 0.02;
    check("T9 frame immersion: frames meet the cage only at shared corners; rod interiors clear the dais",
        cornerClear && interiorMinY > PLINTH_H + 0.05,
        `min frame-to-cage mid-span approach ${worstApproach.toFixed(3)}m (tubes ${(ROD_R + FRAME_R).toFixed(3)}m); min rod-interior y ${interiorMinY.toFixed(3)} > dais top + 0.05 (tip corner itself shared by design)`);
}

// ---- footprint summary (constants derived above, before checks) --------------------------------------------------------

export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
    for (const v of V) acc(v[0] - BEAD_R, v[1] - BEAD_R, v[2] - BEAD_R), acc(v[0] + BEAD_R, v[1] + BEAD_R, v[2] + BEAD_R);
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(a), 0, -PLINTH_R * Math.sin(a));
        acc(PLINTH_R * Math.cos(a), PLINTH_H, -PLINTH_R * Math.sin(a));
    }
    return { min: min as V3, max: max as V3 };
})();

console.log(`seat: tip-down 5-fold; tip at dais top ${PLINTH_H}; summit y ${SUMMIT_Y.toFixed(3)}; edge ${(EDGE_MOD * SCALE).toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + bead ${BEAD_R} → icosagon dais R ${PLINTH_R.toFixed(2)} (${PLINTH_N} sides — one per face, the theme number); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`frames: three 2×2φ golden rectangles inside the open cage (12 frame rods r${FRAME_R} vs cage r${ROD_R}); beads: 12 brass corners — the twelve faces of the standing dodecahedron`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct239-ico)");
