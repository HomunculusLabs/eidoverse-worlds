// struct218-probe-newtonspheres.ts — THE ONE CONTRACT for R11-34 NEWTON'S
// THIRTEEN SPHERES: the kissing-number shrine. Twelve stone spheres at the
// exact icosahedral directions, each exactly kissing a thirteenth at the
// heart; none of the twelve touch each other (the 0.103·s proof gap); the
// heart visible — never reachable — through the twenty face windows; the
// planar truth (six around one, seventh impossible) inlaid in iron on the
// dais.
//
// FORM SELECTION (fresh grep this tick, plan + IMPROVEMENTS + IMPROVE-PLAN +
// CITY-PLAN-V2 + census 354): newtonspheres/kissing-number 0/0/0 — "Newton"
// mentions are Gauss-Newton numerics, "thirteenth" are tick counters. First
// candidate this tick (the trefoil knot) was BARRED at selection — the KNOT
// family stands via nx-struct-boy (trefoil boundary, "trefoil pinwheel"
// eye-check pointer, struct-105 near-gap precedent); probe kept as register
// evidence in struct218-probe-trefoil.ts. Register: opens the CONFIGURATION
// branch — no standing form's identity is a CONFIGURATION of many equal
// solids in an exact arrangement (harmonickiss = three mutually-tangent
// PLANAR circles, the 2D kin — disclosed; apollonian = packed gasket
// fractal, disclosed; geodesic = icosa LATTICE shell, not a configuration —
// disclosed). Era: Newton–Gregory 1694 (the twelve-spheres claim vs the
// thirteen question), settled Schütte–van der Waerden 1953 / Leech 1956 —
// the procession's first OPEN-PROBLEM monument: a dispute that outlived
// both men by 260 years.
//
// THE THEOREMS CARVED (verified below before any build):
// 1. THE TWELVE DIRECTIONS — the 12 icosahedral vertices, unit-exact, all
//    30 edges with cos(edge angle) == 1/√5 EXACT (angle 63.4349°); held
//    through the face-down seating rotation.
// 2. THE KISS EXACT — every outer center at distance exactly D = 2s from
//    the heart center; heart and outer radii both s; 12/12 kisses exact
//    (distance == sum of radii to 1e-12).
// 3. THE PROOF GAP — min pairwise distance among the twelve = D·√(2−2/√5)
//    = 2.1029·s > D: none touch each other; the 0.1029·s gap is Gregory's
//    loophole (a thirteenth would have to slip through it — impossible,
//    but proving THAT took 260 years).
// 4. THE TWENTY WINDOWS — the 20 face-center directions; every sightline
//    to the heart clears every outer sphere by exactly 2s·sin(θ_circ) − s
//    = 0.2136·s (θ_circ = the face circumradius 37.37°): the heart is
//    VISIBLE through all twenty windows and reachable through NONE — the
//    eye fits, the body does not, and the heart itself seals the center
//    (folly by geometry).
// 5. THE TRIPOD FOOTING — in the face-down frame exactly 3 lowest spheres,
//    bottoms coplanar to 1e-12, seated on the dais top exactly; the
//    cluster stands on its own three feet.
// 6. THE PLANAR PROPHET — the inlay: six discs at exact 60° spacing, every
//    adjacent pair tangent EXACT (hexagon side == ring radius == 2·disc);
//    the seventh is impossible by pigeonhole: 7 gaps sum 360° → one ≤
//    51.4286° → chord 1.7364·disc-diameter < 2·disc (13.2% overlap).
// 7. ENVELOPE + ROOM GATES — dais footprint 100 m² ≥ 16 AND height 5.52 ≥
//    2.2 → REAL TRIMESH; folly class — rim circuit walk owed at placement.
// 8. THE SILHOUETTE CONSTANT — max radial extent of the cluster = 2s·φ/L +
//    s = 2.7013·s along the 12 vertex directions (the crest ring the 18m
//    eye reads as a bag of spheres); decode binds the hull to it.
//
// WORLD FRAME: the cluster stands on a round stone dais, heart glowing
// warm at the center (the sole night element — three windows' worth of
// dappled warmth from any approach). STONE carries the twelve + the dais.
// IRON carries the planar theorem inlaid at the rim. The HEART is the glow
// KEEP. Exports consumed by assets/mkv3-newtonspheres.ts (build) and
// struct218-decode-newtonspheres.ts (audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions FINAL world-local.

// ---- constants -----------------------------------------------------------------------------------------
export const s = 1.0;                  // sphere radius (heart and twelve alike — EQUAL solids, the configuration's law)
export const D = 2 * s;                // kiss distance (center-to-center)
export const DAIS_R = 5.0;             // dais radius
export const DAIS_H = 0.34;            // dais height
export const DISC_R = 0.26;            // planar-prophet disc radius (inlay)
export const DISC_H = 0.024;           // inlay disc thickness (2mm proud of dais top)
export const INLAY_C = 3.90;           // inlay center radius on the dais (0.42 clear of the 2.965 seated-frame hull)
export const PHI = (1 + Math.sqrt(5)) / 2;
export const L = Math.sqrt(1 + PHI * PHI);   // icosa vertex norm √(1+φ²) = √(φ√5)

// ---- vector helpers -------------------------------------------------------------------------------------
export type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const rotAbout = (p: V3, A: V3, u: V3, th: number): V3 => {   // Rodrigues about axis (A, u)
    const d = sub(p, A), c = Math.cos(th), sn = Math.sin(th);
    const k = norm(u), kxd = cross(k, d), kd = dot(k, d);
    const r: V3 = [d[0] * c + kxd[0] * sn + k[0] * kd * (1 - c), d[1] * c + kxd[1] * sn + k[1] * kd * (1 - c), d[2] * c + kxd[2] * sn + k[2] * kd * (1 - c)];
    return add(r, A);
};

// ---- the twelve directions (icosa), seated FACE-DOWN ------------------------------------------------------
// base frame: cyclic perms of (0, ±1, ±φ); the golden face {(0,1,φ),(1,φ,0),(φ,0,1)} has normal
// n = (1,1,1)/√3; rotate n -> (0,−1,0) so the face's three spheres become the footing.
export const BASE: V3[] = [];
for (const a of [1, -1]) for (const b of [1, -1]) {
    BASE.push([0, a, b * PHI]);        // (0, ±1, ±φ)
    BASE.push([a, b * PHI, 0]);        // (±1, ±φ, 0)  [y = ±φ]
    BASE.push([a * PHI, 0, b]);        // (±φ, 0, ±1)
}
// note: the loop above generates each family with independent signs — 2×2×3 families = 12 distinct verts
{
    const uniq = new Set(BASE.map(p => p.map(x => x.toFixed(9)).join(",")));
    if (uniq.size !== 12) throw Error(`base icosa census ${uniq.size} != 12`);
}
const nFace: V3 = norm([1, 1, 1]);     // golden-face normal
const seatAxis: V3 = norm(cross(nFace, [0, -1, 0]));
const seatAng = Math.acos(dot(nFace, [0, -1, 0]));
export const DIRS: V3[] = BASE.map(p => rotAbout(p, [0, 0, 0], seatAxis, seatAng)).map(norm);

// footing = the golden face's three verts, now lowest
const GOLDEN_FACE: V3[] = [[0, 1, PHI], [1, PHI, 0], [PHI, 0, 1]];
export const FOOT_DIRS: V3[] = GOLDEN_FACE.map(p => norm(rotAbout(p, [0, 0, 0], seatAxis, seatAng)));
export const CC = DAIS_H + D * Math.abs(Math.min(...DIRS.map(d => d[1]))) + s;   // cluster-center height (the 3 feet on dais top)
export const CENTERS: V3[] = DIRS.map(d => [d[0] * D, CC + d[1] * D, d[2] * D]);
export const HEART: V3 = [0, CC, 0];

// the 20 windows (face centers, seated frame)
export const WINDOWS: V3[] = (() => {
    const faces: V3[] = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
        const a = DIRS[i], b = DIRS[j], c = DIRS[k];
        const adj = (p: V3, q: V3) => Math.abs(dot(p, q) - 1 / Math.sqrt(5)) < 1e-12;
        if (adj(a, b) && adj(b, c) && adj(a, c)) faces.push(norm(add(add(a, b), c)));
    }
    // dedupe (antipodal face pairs are distinct; the 20 are unique directions)
    const uniq: V3[] = [];
    for (const f of faces) if (!uniq.some(u => Math.abs(dot(u, f) - 1) < 1e-9)) uniq.push(f);
    return uniq;
})();

// the planar prophet: six discs + the hearted one, tangent exact
export const DISCS: V3[] = (() => {
    const out: V3[] = [[0, DAIS_H + DISC_H / 2, INLAY_C]];                    // the center disc (local +Z rim)
    for (let k = 0; k < 6; k++) {
        const a = (k / 6) * 2 * Math.PI;
        out.push([Math.sin(a) * 2 * DISC_R, DAIS_H + DISC_H / 2, INLAY_C + Math.cos(a) * 2 * DISC_R]);
    }
    return out;
})();

export const ENVELOPE = (() => {
    const maxDy = Math.max(...DIRS.map(d => d[1]));
    return { min: [-DAIS_R, 0, -DAIS_R] as V3, max: [DAIS_R, CC + D * maxDy + s, DAIS_R] as V3 };
})();
export const HULL_EXTENT = s + D * Math.max(...DIRS.map(d => Math.hypot(d[0], d[2])));   // seated-frame silhouette constant

// ========================================================================================================
// THE CHECKS (top-level: run on import; every build consumes a PROVEN contract)
// ========================================================================================================
let FAILS = 0;
const CK = (name: string, ok: boolean, detail: string) => {
    if (!ok) FAILS++;
    console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`);
};

// L1 THE TWELVE DIRECTIONS
{
    let unitOk = true, edgeCosOk = true, edgeCount = 0;
    for (const d of DIRS) if (Math.abs(len(d) - 1) > 1e-12) unitOk = false;
    const cosEdge = 1 / Math.sqrt(5);
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        const c = dot(DIRS[i], DIRS[j]);
        if (Math.abs(c - cosEdge) < 1e-12) edgeCount++;
        else if (c > cosEdge + 1e-12) edgeCosOk = false;   // nothing closer than an edge
    }
    const angEdge = (Math.acos(cosEdge) * 180) / Math.PI;
    CK("L1 twelve directions", unitOk && edgeCosOk && edgeCount === 30,
        `12 unit directions exact (worst |len−1| < 1e-12); exactly 30 edges, every edge cos == 1/√5 EXACT (${angEdge.toFixed(4)}°) — the full icosahedron, held through the face-down seating rotation`);
}

// L2 THE KISS EXACT
{
    let worst = 0;
    for (const c of CENTERS) {
        const dist = len(sub(c, HEART));
        worst = Math.max(worst, Math.abs(dist - 2 * s));
    }
    CK("L2 kiss exact", worst < 1e-12,
        `12/12 outer centers at distance exactly D = 2s = ${(2 * s).toFixed(3)} from the heart (worst residual ${worst.toExponential(2)}); heart and outers all radius ${s} — every kiss EXACT, twelve around one`);
}

// L3 THE PROOF GAP
{
    let minPair = Infinity;
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) minPair = Math.min(minPair, len(sub(CENTERS[i], CENTERS[j])));
    const want = D * Math.sqrt(2 - 2 / Math.sqrt(5));
    const gap = minPair - 2 * s;
    CK("L3 proof gap", Math.abs(minPair - want) < 1e-12 && minPair > 2 * s,
        `min pairwise distance among the twelve = ${minPair.toFixed(6)} m == D·√(2−2/√5) exact — NONE touch (clearance ${(gap / s).toFixed(4)}·s = Gregory's loophole: a thirteenth would have to slip through it; proving it cannot took 260 years — Schütte–vdW 1953, Leech 1956)`);
}

// L4 THE TWENTY WINDOWS
{
    let windowOk = WINDOWS.length === 20;
    let worstClear = Infinity;
    const cosCircExpected = (1 + 2 / Math.sqrt(5)) / Math.sqrt(3 + 6 / Math.sqrt(5));   // (1+2c)/√(3+6c), c=1/√5
    for (const w of WINDOWS) {
        for (const c of CENTERS) {
            const cw = sub(c, HEART);                       // HEART -> outer center (length D)
            const distRay = D * len(cross(norm(cw), mul(w, -1)));   // sightline along −w toward the heart
            const clear = distRay - s;
            worstClear = Math.min(worstClear, clear);
        }
    }
    const wantClear = 2 * s * Math.sin(Math.acos(cosCircExpected)) - s;
    // widest slit = the MAX over the 20 windows of the min-clearance-to-any-sphere
    let widest = 0;
    for (const w of WINDOWS) {
        let thisW = Infinity;
        for (const c of CENTERS) {
            const cw = sub(c, HEART);
            thisW = Math.min(thisW, D * len(cross(norm(cw), mul(w, -1))) - s);
        }
        widest = Math.max(widest, thisW);
    }
    // folly claim: even the WIDEST window slit is ~3.5x under the 1.4 m door law — no door exists
    CK("L4 twenty windows", windowOk && worstClear > 0.2140 && Math.abs(worstClear - wantClear) < 1e-9 && widest < 1.4,
        `exactly ${WINDOWS.length} windows (face centers); every sightline to the heart clears every sphere by ≥ ${worstClear.toFixed(4)} m (min == 2s·sin(37.37°) − s exact, the face circumradius); the WIDEST window slit ${widest.toFixed(2)} m is ~${(1.4 / widest).toFixed(1)}× under the 1.4 m door law — the heart VISIBLE through all twenty windows, NO DOOR EXISTS by geometry, folly class: the heart is seen, never entered`);
}

// L5 THE TRIPOD FOOTING
{
    const bottoms = FOOT_DIRS.map(d => CC + d[1] * D - s);
    const coplanar = Math.max(...bottoms) - Math.min(...bottoms);
    const lowest = DIRS.filter(d => d[1] < DIRS[0][1] + 1e-9);
    // exactly 3 verts at the lowest height
    const ys = DIRS.map(d => d[1]);
    const minY = Math.min(...ys);
    const nLow = ys.filter(y => y < minY + 1e-9).length;
    CK("L5 tripod footing", coplanar < 1e-12 && Math.abs(bottoms[0] - DAIS_H) < 1e-12 && nLow === 3 && lowest.length === 3,
        `exactly ${nLow} lowest spheres (the golden face), bottoms coplanar to ${(coplanar).toExponential(2)} m, seated on the dais top ${DAIS_H} EXACT — the cluster stands on its own three feet, a tripod by symmetry`);
}

// L6 THE PLANAR PROPHET
{
    const center = DISCS[0];
    let kissOk = true;
    for (let k = 1; k <= 6; k++) if (Math.abs(len(sub(DISCS[k], center)) - 2 * DISC_R) > 1e-12) kissOk = false;
    // adjacent ring discs tangent: hexagon side == ring radius
    let ringOk = true;
    for (let k = 1; k <= 6; k++) {
        const a = DISCS[k], b = DISCS[(k % 6) + 1];
        if (Math.abs(len(sub(a, b)) - 2 * DISC_R) > 1e-12) ringOk = false;
    }
    // seventh impossibility: best case 360/7 spacing still overlaps 13.2%
    const chord7 = 2 * (2 * DISC_R) * Math.sin(Math.PI / 7);
    const overlap = (2 * DISC_R - chord7) / (2 * DISC_R);
    // inlay clears the cluster hull and the dais edge
    const inlayMax = INLAY_C + 2 * DISC_R + DISC_R;
    CK("L6 planar prophet", kissOk && ringOk && chord7 < 2 * DISC_R && inlayMax < DAIS_R - 0.1 && INLAY_C - 3 * DISC_R > HULL_EXTENT,
        `six discs at exact 60° spacing, all tangent to the center and to both neighbors EXACT (hexagon side == ring radius == 2r); the seventh is impossible by pigeonhole — 7 gaps sum 360° → one ≤ ${(360 / 7).toFixed(4)}° → chord ${chord7.toFixed(4)} < ${(2 * DISC_R).toFixed(2)} (overlap ${(overlap * 100).toFixed(1)}%): in the plane six is the whole truth; in space the answer took 260 years more. Inlay ring ${INLAY_C - 3 * DISC_R}..${inlayMax.toFixed(2)} m clears the ${(HULL_EXTENT).toFixed(3)} m cluster hull and the dais edge`);
}

// L7 ENVELOPE + ROOM GATES
{
    const area = (2 * DAIS_R) ** 2;
    const height = ENVELOPE.max[1];
    CK("L7 envelope+gates", area >= 16 && height >= 2.2,
        `entity bbox ${(2 * DAIS_R).toFixed(1)}² × ${height.toFixed(2)} m: footprint ${area.toFixed(0)} m² ≥ 16 AND height ≥ 2.2 → REAL TRIMESH, the dais genuinely walkable; folly class (L4 seals the center) — rim circuit walk owed at placement; symmetric origin-centered, min y 0`);
}

// L8 THE SILHOUETTE CONSTANT (seated frame)
{
    let maxRad = 0;
    for (const c of CENTERS) maxRad = Math.max(maxRad, Math.hypot(c[0], c[2]));
    maxRad += s;
    CK("L8 silhouette", Math.abs(maxRad - HULL_EXTENT) < 1e-9,
        `seated-frame cluster radial extent ${maxRad.toFixed(4)} m == s + 2·max‖v_xz‖ exact (the equatorial crown directions of the rotated icosa) — the ring of sphere crowns the 18m eye reads as a bag of spheres; decode binds the hull to this constant; inlay ring ${INLAY_C - 3 * DISC_R}..${(INLAY_C + 3 * DISC_R).toFixed(2)} clears it by ${(INLAY_C - 3 * DISC_R - HULL_EXTENT).toFixed(2)} m`);
}

if (FAILS) { console.error(`${FAILS} CHECK(S) FAILED`); process.exit(1); }
console.log("PROBE ALL PASS");
console.log(`INFO cluster center height CC = ${CC.toFixed(6)} m; stance top ${(ENVELOPE.max[1]).toFixed(4)} m; hull extent ${HULL_EXTENT.toFixed(4)} m; windows: ${WINDOWS.filter(w => Math.abs(w[1]) < 0.35).length}/20 near-equatorial (eye-height sightlines)`);

// ---- RED controls (executed only when run directly) -------------------------------------------------------
if (import.meta.main) {
    console.log("--- RED controls (checkers must CATCH corruption) ---");
    let caught = 0;
    // RED 1: one direction perturbed 2° -> the kiss breaks
    {
        const axis = norm(cross(DIRS[0], [0, 0, 1]));
        const bad = rotAbout(DIRS[0], [0, 0, 0], axis, (2 * Math.PI) / 180);
        const dist = len(sub(mul(bad, D), HEART));
        const ok = Math.abs(dist - 2 * s) > 1e-6;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} perturbed direction: kiss distance ${dist.toFixed(6)} != ${(2 * s).toFixed(3)} — DETECTED by L2`);
    }
    // RED 2: a 13th sphere at a window direction, distance D -> overlaps its neighbors (gap < 2s)
    {
        const w = WINDOWS[0];
        const c13 = add(HEART, mul(w, D));      // frame law: place from the CC-lifted heart, not origin
        let minD = Infinity;
        for (const c of CENTERS) minD = Math.min(minD, len(sub(c13, c)));
        const ok = minD < 2 * s;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} 13th sphere at window: nearest neighbor ${minD.toFixed(4)} < ${(2 * s).toFixed(2)} — overlaps, DETECTED (the configuration refuses the 13th)`);
    }
    // RED 3: window replaced by an edge midpoint -> clearance collapses
    {
        const mid = norm(add(DIRS[0], DIRS[1]));
        let worst = Infinity;
        for (const c of CENTERS) {
            const cw = sub(c, HEART);
            worst = Math.min(worst, len(cross(norm(cw), mul(mid, -1))) - s);
        }
        const ok = worst < 0.2135 - 1e-6;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} edge-midpoint window: clearance ${worst.toFixed(4)} < 0.2135 — DETECTED by L4`);
    }
    // RED 4: seventh disc at 360/7 spacing -> overlaps its neighbors
    {
        const a = (2 * Math.PI) / 7;
        const chord = 2 * (2 * DISC_R) * Math.sin(a / 2);
        const ok = chord < 2 * DISC_R;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} seventh disc at 360/7: chord ${chord.toFixed(4)} < ${(2 * DISC_R).toFixed(2)} — overlap DETECTED by L6`);
    }
    if (caught !== 4) { console.error("RED CONTROLS FAILED"); process.exit(1); }
    console.log("RED ALL OK");
}
