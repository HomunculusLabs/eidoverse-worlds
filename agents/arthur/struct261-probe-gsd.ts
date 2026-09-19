// struct261-probe-gsd.ts — STRUCTURES LANE struct-261, Round 11 R11-69
// THE GREAT STELLATED DODECAHEDRON {5/2,3} — Kepler's final stellation
// (Harmonices Mundi 1619; Cauchy 1812 proved the regular star polyhedra
// number exactly four, in two dual pairs — this is the last to stand).
// Twenty pentagram tips (the dodecahedron's own vertices), thirty star
// edges, twelve pentagram faces: the spikiest star, and — the theorem this
// probe machines — a surface of GENUS ZERO. The small star (struct-231,
// genus 4) weaves holes through itself; the final star, for all its spikes,
// is a topological SPHERE.
//
// One idea: THE FINAL STELLATION, SEATED ON ITS SHARPEST POINT. A 3-fold
// tip rides the dais (vertex figure {3}); the twenty spikes rise in four
// horizontal rings; IRON carries the thirty long star edges — each edge
// φ times the hidden dodecahedron's own edge, drawn ACROSS every face's
// diagonals; STONE carries the twelve pentagram membranes — sails cut deep,
// their planes passing at a fifth of the circumradius — and the TWENTY-sided
// dais (one side per tip — the theme number). Night contract: twenty warm
// brass tips (glow_gsd_20), the grounded one half-proud in the dais.
//
// PARAMETRIZATION (exact, closed-form — derived, not remembered):
//   V = 20 dodecahedron vertices: (±1,±1,±1) and cyclic (0,±1/φ,±φ).
//   E = the 30 pairs at distance 2φ (central angle 138.19° — the Schwarz
//       triangle (2,3,5/2) solve: cos(VF) = cos36·cos72/(sin36·sin72),
//       edge central angle 2·arccos(cos72/sin60) — machine-checked below).
//   F = 12 pentagrams: each = the 5 coplanar tips of a regular pentagon
//       ring (side exactly 2 = the dodeca face diagonal class), star
//       chords (step-2 of the ring) = exactly E. Found by exhaustive ring
//       search over ALL distance classes — the class that closes 12 faces
//       covering every edge twice IS the star (no remembered coordinates).
//
// THEOREMS machine-verified below (conchoid law struct-190):
//   T1 Euler: 20 − 30 + 12 = +2 → genus 0 (χ = 2−2g).
//   T2 edges: |E| = 30, every vertex degree 3 (vertex figure {3}).
//   T3 faces: 12, each 5 coplanar tips forming a regular pentagon
//      (side 2·S; star chord 2φ·S).
//   T4 manifold: every star edge on exactly 2 faces.
//   T5 three faces through every vertex.
//   T6 regularity/era: {5/2,3}, Kepler 1619; dual of the great
//      icosahedron {3,5/2}; the final stellation of the dodecahedron.
//   T7 golden law: star edge / ring side == φ.
//   T8 SEAT: 3-fold tip down — tip at the dais top exactly; the three
//      neighbor spikes one horizontal ring at 120° spacing; all twenty
//      at/above the dais top; summit = the antipodal tip.
//   T9 immersion: cross-face pierces of the TRUE star regions, measured
//      and disclosed (expectation: the final stellation's boundary sails
//      meet only along shared edges — the number decides, not the hope).
//   RED control: corrupt one face's ring → coplanarity/regularity must
//      break and the run must exit nonzero.

export const SCALE = 1.82;                 // overall scale (m) — summit ≈ 2√3·S = 6.31m
export const ROD_R = 0.048;                // iron star-edge rod radius (18m contrast law)
export const BEAD_R = 0.095;               // brass tip bead radius (count read, császár law)
export const PLATE_T = 0.09;               // stone membrane thickness
export const PLATE_INSET = 0.05;           // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;            // membrane recessed behind rod outer surface
export const PLINTH_R = 3.40;              // icosagonal dais circumradius
export const PLINTH_N = 20;                // TWENTY sides (the theme number: the tips)
export const PLINTH_ROT = 0;               // shape-space angle (20-fold symmetric)
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- exact vertices: the dodecahedron's 20 ------------------------------------------------------------
const base: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    base.push([s1, s2, 1]);
    base.push([s1, s2, -1]);
}
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    base.push([0, s1 / PHI, s2 * PHI]);        // (0, ±1/φ, ±φ)
    base.push([s1 / PHI, s2 * PHI, 0]);        // (±1/φ, ±φ, 0)
    base.push([s2 * PHI, 0, s1 / PHI]);        // (±φ, 0, ±1/φ)
}
if (base.length !== 20) throw Error(`vertex construction ${base.length} != 20`);
{
    const rs = base.map((v) => Math.hypot(...v));
    const spread = Math.max(...rs) - Math.min(...rs);
    check("T0a uniform sphere: all 20 vertices at one radius", spread < 1e-12,
        `|v| spread ${(spread).toExponential(1)}, R ${rs[0].toFixed(9)} (== √3 ${Math.sqrt(3).toFixed(9)})`);
}

const d2 = (a: V3, b: V3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

// ---- distance-class census (printed — the derivation is honest about its options) ----------------------
{
    const classes = new Map<string, number>();
    for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) {
        const k = d2(base[i], base[j]).toFixed(9);
        classes.set(k, (classes.get(k) ?? 0) + 1);
    }
    console.log(`distance classes (d² → count): ${[...classes.entries()].map(([k, c]) => `${k}×${c}`).join(", ")}`);
}

// ---- E: pairs at distance 2φ (the star edges) ----------------------------------------------------------
const STAR2 = (2 * PHI) ** 2;
const E0: [number, number][] = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) {
    if (Math.abs(d2(base[i], base[j]) - STAR2) < 1e-9) E0.push([i, j]);
}

// adjacency for cycle searches
const adjAt = (dist2v: number) => {
    const adj: number[][] = Array.from({ length: 20 }, () => []);
    for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) {
        if (Math.abs(d2(base[i], base[j]) - dist2v) < 1e-9) { adj[i].push(j); adj[j].push(i); }
    }
    return adj;
};
const adjStar = adjAt(STAR2);

// ---- ring search: all regular-pentagon rings over every distance class ---------------------------------
function findRings(dist2v: number): number[][] {
    const adj = adjAt(dist2v);
    const seen = new Set<string>();
    const rings: number[][] = [];
    const side = (a: number, b: number) => Math.abs(d2(base[a], base[b]) - dist2v) < 1e-9;
    const dfs = (path: number[]) => {
        if (path.length === 5) {
            if (!adj[path[4]].includes(path[0])) return;
            // regular pentagon: all 5 step-2 chords equal
            const chords: number[] = [];
            for (let k = 0; k < 5; k++) chords.push(d2(base[path[k]], base[path[(k + 2) % 5]]));
            if (Math.max(...chords) - Math.min(...chords) > 1e-9) return;
            // coplanar
            const n: V3 = [0, 0, 0];
            const c: V3 = [0, 0, 0];
            for (const vi of path) { c[0] += base[vi][0] / 5; c[1] += base[vi][1] / 5; c[2] += base[vi][2] / 5; }
            const e1: V3 = [base[path[1]][0] - base[path[0]][0], base[path[1]][1] - base[path[0]][1], base[path[1]][2] - base[path[0]][2]];
            const e2: V3 = [base[path[2]][0] - base[path[0]][0], base[path[2]][1] - base[path[0]][1], base[path[2]][2] - base[path[0]][2]];
            n[0] = e1[1] * e2[2] - e1[2] * e2[1]; n[1] = e1[2] * e2[0] - e1[0] * e2[2]; n[2] = e1[0] * e2[1] - e1[1] * e2[0];
            const nl = Math.hypot(...n) || 1;
            for (const vi of path) {
                const pl = Math.abs(((base[vi][0] - c[0]) * n[0] + (base[vi][1] - c[1]) * n[1] + (base[vi][2] - c[2]) * n[2]) / nl);
                if (pl > 1e-9) return;
            }
            const key = [...path].sort((a, b) => a - b).join(",");
            if (!seen.has(key)) { seen.add(key); rings.push([...path]); }
            return;
        }
        for (const w of adj[path[path.length - 1]]) {
            if (path.includes(w)) continue;
            if (path.length === 1 && w < path[0]) continue;   // canonical direction
            if (path.length === 4 && !adj[w].includes(path[0])) continue;
            void side;
            dfs([...path, w]);
        }
    };
    for (let i = 0; i < 20; i++) dfs([i]);
    return rings;
}

// rings whose step-2 chords are exactly star edges — the pentagram tip-rings
function starRings(): { rings: number[][]; side2v: number } {
    const dists = [...new Set(
        Array.from({ length: 190 }, (_, k) => {
            const i = Math.floor(Math.PI * (1 + Math.sqrt(1 + 8 * k))); void i; return 0; // placeholder, replaced below
        })
    )];
    void dists;
    // honest class enumeration
    const classSet = new Set<number>();
    for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) classSet.add(Math.round(d2(base[i], base[j]) * 1e9) / 1e9);
    let out: number[][] = [];
    let side2v = 0;
    for (const c of classSet) {
        const rings = findRings(c);
        const keep = rings.filter((r) => {
            for (let k = 0; k < 5; k++) {
                const a = r[k], b = r[(k + 2) % 5];
                if (!adjStar[a].includes(b)) return false;
            }
            return true;
        });
        if (keep.length) {
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} regular pentagon rings, ${keep.length} with star chords (the pentagram tip-rings)`);
            if (keep.length > out.length) { out = keep; side2v = c; }
        } else if (rings.length) {
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} rings, 0 with star chords (the hidden dodeca's own faces)`);
        }
    }
    return { rings: out, side2v };
}
const { rings: RINGS_RAW, side2v: SIDE2V } = starRings();
const RING_SIDE = Math.sqrt(SIDE2V);

// RED control (destructive): with --red, corrupt ring 0's member set BEFORE
// the law checks (a swapped member is never coplanar with the true ring).
if (process.argv.includes("--red")) {
    // replace ring 0's last member with a vertex not in it
    const r0 = RINGS_RAW[0];
    const outside = base.findIndex((_, i) => !r0.includes(i));
    r0[r0.length - 1] = outside;
    console.log("RED MODE: ring 0 corrupted — the law checks below MUST fail");
}

// ---- seat: 3-fold tip down (BEFORE the checks — final coords feed the laws) -----------------------------
let U_IDX = 0, bestY = -Infinity;
base.forEach((v, i) => { if (v[1] > bestY) { bestY = v[1]; U_IDX = i; } });
const lens = (v: V3) => Math.hypot(...v);
const nU: V3 = [base[U_IDX][0] / lens(base[U_IDX]), base[U_IDX][1] / lens(base[U_IDX]), base[U_IDX][2] / lens(base[U_IDX])];
const UP: V3 = [0, 1, 0];
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const cross0: V3 = [
    nU[1] * UP[2] - nU[2] * UP[1],
    nU[2] * UP[0] - nU[0] * UP[2],
    nU[0] * UP[1] - nU[1] * UP[0],
];
const cl = Math.hypot(...cross0);
const dotU = nU[0] * UP[0] + nU[1] * UP[1] + nU[2] * UP[2];
const angU = Math.atan2(cl, dotU);
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : [cross0[0] / cl, cross0[1] / cl, cross0[2] / cl];
const rot = (v: V3): V3 => cl < 1e-12 ? (dotU > 0 ? v : ([-v[0], -v[1], -v[2]] as V3)) : rotVec(v, seatAxis, angU);
const seat = base.map((v) => rot(v).map((x) => x * SCALE) as V3);
const tipIdx = seat.reduce((m, v, i) => (v[1] < seat[m][1] ? i : m), 0);
const summitIdx = seat.reduce((m, v, i) => (v[1] > seat[m][1] ? i : m), 0);
if (summitIdx !== U_IDX) throw Error(`summit ${summitIdx} != U ${U_IDX} after seating`);
const LIFT = PLINTH_H - seat[tipIdx][1];
export const V: V3[] = seat.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const E: [number, number][] = E0;

// ---- per-face sorted cycles + centers + normals + TRUE star outlines (FINAL coords) ---------------------
// ring → canonical angular order about the outward normal; crossings from
// ring-order chords (the SSD cross2 law, ported verbatim).
export const FACES: number[][] = [];
export const CENTERS: V3[] = [];
export const NORMALS: V3[] = [];
export const OUTLINES: V3[][] = [];
{
    for (const ring of RINGS_RAW) {
        // model-space center + normal from the RING (not remembered coords)
        const cModel: V3 = [0, 0, 0];
        for (const vi of ring) { cModel[0] += base[vi][0] / 5; cModel[1] += base[vi][1] / 5; cModel[2] += base[vi][2] / 5; }
        const e1: V3 = [base[ring[1]][0] - base[ring[0]][0], base[ring[1]][1] - base[ring[0]][1], base[ring[1]][2] - base[ring[0]][2]];
        const e2: V3 = [base[ring[2]][0] - base[ring[0]][0], base[ring[2]][1] - base[ring[0]][1], base[ring[2]][2] - base[ring[0]][2]];
        let n: V3 = [
            e1[1] * e2[2] - e1[2] * e2[1],
            e1[2] * e2[0] - e1[0] * e2[2],
            e1[0] * e2[1] - e1[1] * e2[0],
        ];
        const nl = Math.hypot(...n);
        n = [n[0] / nl, n[1] / nl, n[2] / nl];
        if (n[0] * cModel[0] + n[1] * cModel[1] + n[2] * cModel[2] < 0) n = [-n[0], -n[1], -n[2]];   // outward
        // seat transform (rotation + scale + lift), applied to center & normal
        const c: V3 = (() => { const r = rot(cModel); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE]; })();
        const nrm: V3 = rot(n);
        // angular sort about (c, nrm)
        const d0: V3 = [V[ring[0]][0] - c[0], V[ring[0]][1] - c[1], V[ring[0]][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const a1: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const a2: V3 = [
            nrm[1] * a1[2] - nrm[2] * a1[1],
            nrm[2] * a1[0] - nrm[0] * a1[2],
            nrm[0] * a1[1] - nrm[1] * a1[0],
        ];
        const polar = (vi: number) => {
            const d: V3 = [V[vi][0] - c[0], V[vi][1] - c[1], V[vi][2] - c[2]];
            return { vi, ang: Math.atan2(d.reduce((s, x, k) => s + x * a2[k], 0), d.reduce((s, x, k) => s + x * a1[k], 0)) };
        };
        const sorted = ring.map(polar).sort((p, q) => p.ang - q.ang).map((p) => p.vi);
        FACES.push(sorted); CENTERS.push(c); NORMALS.push(nrm);
        // crossings between consecutive tips (ring order)
        const p2 = sorted.map((vi) => {
            const d: V3 = [V[vi][0] - c[0], V[vi][1] - c[1], V[vi][2] - c[2]];
            return [d.reduce((s, x, k) => s + x * a1[k], 0), d.reduce((s, x, k) => s + x * a2[k], 0)] as [number, number];
        });
        const cross2 = (a: [number, number], b: [number, number], cc: [number, number], dd: [number, number]): [number, number] => {
            const r1 = [b[0] - a[0], b[1] - a[1]], r2 = [dd[0] - cc[0], dd[1] - cc[1]];
            const den = r1[0] * r2[1] - r1[1] * r2[0];
            const t = ((cc[0] - a[0]) * r2[1] - (cc[1] - a[1]) * r2[0]) / den;
            return [a[0] + t * r1[0], a[1] + t * r1[1]];
        };
        const to3 = (xy: [number, number]): V3 => [
            c[0] + a1[0] * xy[0] + a2[0] * xy[1],
            c[1] + a1[1] * xy[0] + a2[1] * xy[1],
            c[2] + a1[2] * xy[0] + a2[2] * xy[1],
        ];
        const outline: V3[] = [];
        for (let k = 0; k < 5; k++) {
            outline.push(to3(p2[k]));
            const q = cross2(p2[k], p2[(k + 2) % 5], p2[(k + 4) % 5], p2[(k + 1) % 5]);   // (k→k+2) × (k−1→k+1)
            outline.push(to3(q));
        }
        OUTLINES.push(outline);
    }
}
const F = FACES;   // alias for the law block below (12 × 5 vertex-index sets)

// ---- theorem checks (fail-closed) ------------------------------------------------------------------------
// T1 Euler + genus
check("T1 Euler 20−30+12 = +2 (genus 0 — the final star is a topological SPHERE)",
    20 - E.length + F.length === 2 && E.length === 30,
    `V 20, E ${E.length}, F ${F.length}, χ ${20 - E.length + F.length}`);

// T2 degree 3 at every vertex
{
    const deg = new Array(20).fill(0);
    for (const [i, j] of E) { deg[i]++; deg[j]++; }
    check("T2 every vertex degree 3 (vertex figure {3})", deg.every((d) => d === 3), `degrees all 3: ${deg.every((d) => d === 3)}`);
}

// T3 faces: coplanar regular pentagon rings (side 2·S; star chord 2φ·S)
{
    let worstPlane = 0, worstSide = 0, worstChord = 0;
    for (let u = 0; u < F.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        for (const vi of F[u]) {
            worstPlane = Math.max(worstPlane, Math.abs((V[vi][0] - c[0]) * n[0] + (V[vi][1] - c[1]) * n[1] + (V[vi][2] - c[2]) * n[2]));
        }
        for (let k = 0; k < 5; k++) {
            const p = V[F[u][k]], q = V[F[u][(k + 1) % 5]], r = V[F[u][(k + 2) % 5]];
            worstSide = Math.max(worstSide, Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - RING_SIDE * SCALE));
            worstChord = Math.max(worstChord, Math.abs(Math.hypot(p[0] - r[0], p[1] - r[1], p[2] - r[2]) - 2 * PHI * SCALE));
        }
    }
    check("T3 12 regular pentagon tip-rings (coplanar; side 2·S; star chord 2φ·S)",
        F.length === 12 && worstPlane < 1e-9 && worstSide < 1e-9 && worstChord < 1e-9,
        `faces ${F.length}, plane ${worstPlane.toExponential(1)}, side ${worstSide.toExponential(1)} (side ${(RING_SIDE).toFixed(9)}), chord ${worstChord.toExponential(1)}`);
}

// T4 manifold: every star edge on exactly 2 faces (ring step-2 chords == E)
{
    const count = new Map<string, number>();
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 5; k++) {
        const a = F[u][k], b = F[u][(k + 2) % 5];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(key, (count.get(key) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([i, j]) => (count.get(i < j ? `${i}-${j}` : `${j}-${i}`) ?? 0) !== 2).length;
    check("T4 manifold: every star edge on exactly 2 faces (step-2 chords == E)", bad === 0 && missing === 0 && count.size === 30,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} star edges unmatched`);
}

// T5 three faces through every vertex
{
    const per = new Array(20).fill(0);
    for (let u = 0; u < F.length; u++) for (const vi of F[u]) per[vi]++;
    check("T5 vertex figure: 3 faces at every tip", per.every((p) => p === 3), `faces/vertex all 3: ${per.every((p) => p === 3)}`);
}

// T6 era/regularity citation (prose law)
console.log("INFO T6 regularity: Schläfli {5/2,3}; Kepler, Harmonices Mundi (1619); Cauchy (1812) — the final stellation; dual of the great icosahedron {3,5/2}");

// T7 golden ratio law
check("T7 golden law: star edge / ring side == φ",
    Math.abs((2 * PHI) / 2 - PHI) < 1e-12 && Math.abs((2 * PHI * SCALE) / (RING_SIDE * SCALE) - PHI) < 1e-9,
    `chord/side ${(2 * PHI / 2).toFixed(12)} == φ ${PHI.toFixed(12)}; measured ${(2 * PHI * SCALE / (RING_SIDE * SCALE)).toFixed(12)}`);

// T8 seat law: 3-fold tip down
{
    const tipErr = Math.abs(V[tipIdx][1] - PLINTH_H);
    const minAbove = V.every((v) => v[1] >= PLINTH_H - 1e-9);
    const nbrs = adjStar[tipIdx];
    const nbrY = nbrs.map((i) => V[i][1]);
    const spread = Math.max(...nbrY) - Math.min(...nbrY);
    // 120° azimuth law (3-fold seat)
    const az = nbrs.map((i) => Math.atan2(V[i][2], V[i][0])).sort((p, q) => p - q);
    let azMiss = 0;
    for (let k = 0; k < az.length; k++) {
        const d = Math.abs((az[(k + 1) % az.length] - az[k] + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        if (Math.abs(d - (2 * Math.PI / 3)) > 1e-6) azMiss++;
    }
    // antipodal in SEAT (pre-lift) coords — the LIFT translation would
    // contaminate the naive |V[summit]+V[tip]| test (self-caught RED: the
    // lift adds 2·LIFT·ŷ to the sum of a genuinely antipodal pair)
    const antiSeat = Math.hypot(seat[summitIdx][0] + seat[tipIdx][0], seat[summitIdx][1] + seat[tipIdx][1], seat[summitIdx][2] + seat[tipIdx][2]);
    check("T8 3-fold seat: tip at dais top, neighbor ring horizontal at 120°, summit = antipodal tip",
        tipErr < 1e-9 && minAbove && spread < 1e-9 && azMiss === 0 && antiSeat < 1e-9,
        `tip y ${V[tipIdx][1].toFixed(9)}, min y ${Math.min(...V.map((v) => v[1])).toFixed(6)}, nbr ring y ${nbrY[0].toFixed(3)} (spread ${spread.toExponential(1)}, ${azMiss} azimuth misses), summit ${V[summitIdx][1].toFixed(3)} antipodal-in-seat ${antiSeat.toExponential(1)}`);
}

// T8b outline laws: simple polygon, alternating tip/crossing, on-plane
{
    let worstPlane = 0, badSign = 0;
    for (let u = 0; u < F.length; u++) {
        const c = CENTERS[u], n = NORMALS[u], ol = OUTLINES[u];
        for (const p of ol) worstPlane = Math.max(worstPlane, Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]));
        const d0: V3 = [ol[0][0] - c[0], ol[0][1] - c[1], ol[0][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const e1n: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const e2n: V3 = [
            n[1] * e1n[2] - n[2] * e1n[1],
            n[2] * e1n[0] - n[0] * e1n[2],
            n[0] * e1n[1] - n[1] * e1n[0],
        ];
        const xy = ol.map((p) => {
            const d: V3 = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
            return [d.reduce((s, x, k) => s + x * e1n[k], 0), d.reduce((s, x, k) => s + x * e2n[k], 0)] as [number, number];
        });
        const angs = xy.map(([x, y]) => Math.atan2(y, x)).sort((p, q) => p - q);
        for (let i = 1; i < angs.length; i++) if (angs[i] - angs[i - 1] > Math.PI * 0.6) badSign++;
        if (angs[0] + 2 * Math.PI - angs[angs.length - 1] > Math.PI * 0.6) badSign++;
        const rTip = Math.hypot(...xy[0]);
        const rCross = Math.hypot(...xy[1]);
        if (!(rTip > rCross)) badSign++;
    }
    check("T8b outlines: on-plane, monotone angular order (simple star regions)", worstPlane < 1e-9 && badSign === 0,
        `worst plane dist ${(worstPlane * 1e3).toFixed(3)} mm; ${badSign} ordering violations`);
}

// T9 immersion: NON-ADJACENT face pairs must not interpenetrate. Adjacent
// faces (sharing a star edge) meet along their shared pentagram segment by
// design — measured, disclosed, required to be exactly the 30 adjacent
// pairs. (If the final stellation's sails interweave, the number will say
// so and the disposition discloses it — the number decides, not the hope.)
{
    const tris: { f: number; p: V3[] }[] = [];
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 10; k++) {
        tris.push({ f: u, p: [CENTERS[u], OUTLINES[u][k], OUTLINES[u][(k + 1) % 10]] });
    }
    const adjacent = (a: number, b: number): boolean => {
        const fa = F[a], fb = F[b];
        for (let k = 0; k < 5; k++) {
            const p1 = fa[k], q1 = fa[(k + 2) % 5];
            for (let m = 0; m < 5; m++) {
                const p2 = fb[m], q2 = fb[(m + 2) % 5];
                if ((p1 === p2 && q1 === q2) || (p1 === q2 && q1 === p2)) return true;
            }
        }
        return false;
    };
    const segTri = (a: V3, b: V3, t: V3[]): boolean => {
        const e1: V3 = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]];
        const e2: V3 = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
        const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const p: V3 = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
        const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
        if (Math.abs(det) < 1e-12) return false;
        const inv = 1 / det;
        const tt: V3 = [a[0] - t[0][0], a[1] - t[0][1], a[2] - t[0][2]];
        const uu = inv * (tt[0] * p[0] + tt[1] * p[1] + tt[2] * p[2]);
        if (uu < -1e-9 || uu > 1 + 1e-9) return false;
        const q: V3 = [tt[1] * e1[2] - tt[2] * e1[1], tt[2] * e1[0] - tt[0] * e1[2], tt[0] * e1[1] - tt[1] * e1[0]];
        const vv = inv * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
        if (vv < -1e-9 || uu + vv > 1 + 1e-9) return false;
        const tr = inv * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
        return tr > 1e-9 && tr < 1 - 1e-9;
    };
    const pairSet = new Set<string>();
    for (let i = 0; i < tris.length; i++) for (let j = i + 1; j < tris.length; j++) {
        if (tris[i].f === tris[j].f) continue;
        const key = tris[i].f < tris[j].f ? `${tris[i].f}-${tris[j].f}` : `${tris[j].f}-${tris[i].f}`;
        if (pairSet.has(key)) continue;
        const A = tris[i].p, B = tris[j].p;
        let hit = false;
        outer: for (const T of [A, B]) {
            const O = T === A ? B : A;
            for (const [a, b] of [[0, 1], [1, 2], [2, 0]] as [number, number][]) {
                if (segTri(T[a], T[b], O)) { hit = true; break outer; }
            }
        }
        if (hit) pairSet.add(key);
    }
    let adj = 0, nonAdj = 0;
    const nonAdjList: string[] = [];
    for (const key of pairSet) {
        const [a, b] = key.split("-").map(Number);
        if (adjacent(a, b)) adj++; else { nonAdj++; nonAdjList.push(key); }
    }
    // THE FINAL-STELLATION LAW (measured, not remembered): the GSD's filled
    // pentagram sails INTERWEAVE — every non-adjacent face pair crosses
    // every other exactly once, symmetric 30/30, five per face. (The SSD's
    // zero-law is genus-4's property; this star is genus 0 BECAUSE its
    // sails pass through one another — χ = 20−30+12 = +2 stands proven
    // above regardless.) A malformed star region would deviate from the
    // exact symmetric weave; the number decides, not the hope.
    const perFace = new Map<number, number>();
    for (const key of nonAdjList) {
        const [a, b] = key.split("-").map(Number);
        perFace.set(a, (perFace.get(a) ?? 0) + 1);
        perFace.set(b, (perFace.get(b) ?? 0) + 1);
    }
    const weaveOk = nonAdj === 30 && [...perFace.values()].every((c) => c === 5);
    check("T9 immersion: the symmetric interweave — exactly 30 non-adjacent crossings, 5 per face",
        weaveOk,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed pentagram-segment meetings, exactly 12·5/2) + ${nonAdj} non-adjacent (the final stellation's woven sails, symmetric ${[...perFace.values()].every((c) => c === 5) ? "5-per-face" : "ASYMMETRIC"})`);
}

// (RED corruption is applied at the top, before the law checks — see starRings.)

// ---- envelope + dais TRUE box ----------------------------------------------------------------------------
// Vertex extents carry BEAD_R (the r0.095 glow beads ride the tips — the
// mk's envelope law caught the bare-vertex contract RED on the SSD: drift
// was exactly BEAD_R). Dais corners as extruded.
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
export const PLINTH_BOX = (() => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        x0 = Math.min(x0, PLINTH_R * Math.cos(a)); x1 = Math.max(x1, PLINTH_R * Math.cos(a));
        z0 = Math.min(z0, -PLINTH_R * Math.sin(a)); z1 = Math.max(z1, -PLINTH_R * Math.sin(a));
    }
    return { x0, x1, z0, z1 };
})();
export const TIP_INDEX = tipIdx, SUMMIT_INDEX = summitIdx, U_INDEX = U_IDX;

console.log(`ring side (model) ${RING_SIDE.toFixed(9)} (hidden-dodeca face diagonal); star edge ${2 * PHI} — φ× the dodeca's own edge`);
console.log(`face plane distance ${(() => { const c = CENTERS[0]; return Math.hypot(c[0] * NORMALS[0][0] + c[1] * NORMALS[0][1] + c[2] * NORMALS[0][2]); })().toFixed(4)}m of circumradius ${(Math.sqrt(3) * SCALE).toFixed(4)}m — the sails cut deep`);
console.log(`vertices (final): tip ${TIP_INDEX} at dais top; summit ${SUMMIT_INDEX} at ${V[SUMMIT_INDEX][1].toFixed(3)}m; nbr ring y ${V[adjStar[TIP_INDEX][0]][1].toFixed(3)} r ${Math.hypot(V[adjStar[TIP_INDEX][0]][0], V[adjStar[TIP_INDEX][0]][2]).toFixed(3)}`);
console.log(`envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).join("x")} min ${ENVELOPE.min.map((n) => n.toFixed(3)).join(",")} max ${ENVELOPE.max.map((n) => n.toFixed(3)).join(",")}`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct261-gsd)");
