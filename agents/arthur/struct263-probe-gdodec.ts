// struct263-probe-gdodec.ts — STRUCTURES LANE struct-263, Round 11 R11-71
// THE GREAT DODECAHEDRON {5,5/2} — Kepler's second star (Harmonices Mundi
// 1619). Twelve PENTAGON faces, FIVE meeting at every vertex — impossible
// for a convex solid, so the sails pass THROUGH one another: χ = 12−30+12
// = −6, GENUS FOUR, the tunnel star, dual of the small stellated dodeca-
// hedron {5/2,5} already standing (struct-231/232). Same twelve vertices
// as the icosahedron, same thirty edges — only the faces are new: the five
// triangles around each icosa vertex, their outer rims bound into one
// broad sail (probe T3: ring side IS the edge length).
//
// One idea: THE STAR THAT TUNNELS. Vertex-down seat — the bottom pole
// stands at the dais center, its own sail spread horizontal at 2.27m as a
// canopy you can walk beneath, five struts splayed from the point; the
// summit pole at 7.41m. IRON carries the thirty edges (the icosa's own);
// STONE carries the twelve pentagon sails + the TWELVE-sided dais (the
// theme number). Night contract: TWELVE warm brass vertex beads
// (glow_gdodec_12), the grounded one half-proud in the dais top.
//
// PARAMETRIZATION (exact, closed-form — derived, not remembered):
//   V = 12 icosahedron vertices: (0,±1,±φ), (±1,±φ,0), (±φ,0,±1);
//       R = √(φ+2) = √((5+√5)/2) ≈ 1.902113.
//   E = the 30 pairs at distance 2 (the icosa's own edges — and the
//       pentagon sides: consecutive ring members ARE at edge distance).
//   F = 12 pentagons: per pole, its 5-neighbor ring closes coplanar and
//       regular (side 2, chord 2φ — the pentagon's own golden diagonal,
//       NOT an edge class: the {5/2} vertex figure lives in the
//       connection, not the frame).
//
// THEOREMS machine-verified below (conchoid law struct-190):
//   T0 co-sphere, edge census.  T1 Euler 12−30+12 = −6 → genus 4.
//   T2 degree 5 at every vertex (figure {5/2}).  T3 twelve coplanar
//   regular pentagons over the EDGE class.  T4 manifold (every edge on
//   exactly 2 faces).  T5 five faces per vertex.  T6 golden laws:
//   face-plane distance h == ring circumradius R5 / 2 EXACTLY;
//   R == R5·√5/2; chord/side == √3 (no φ in the face's own geometry —
//   the fingerprint that separates this star from the {5/2,3} family).
//   T7 seat: tip vertex AT the dais top, its ring horizontal at exact
//   72° azimuths, summit antipodal; footprint law R5·S + BEAD ≤ apothem
//   (the 12-gon IS the true ground footprint).  T8 outlines on-plane,
//   monotone (simple convex sails).  T9 immersion: exactly 30
//   non-adjacent crossings, 5 per face; the 6 antipodal sail-pairs
//   parallel, never crossing — the symmetric interweave of genus four.
//   RED control: corrupt ring 0 → coplanarity/regularity must break and
//   the run must exit nonzero.

export const SCALE = 1.87;                 // overall scale (m) — summit 7.41m
export const ROD_R = 0.048;                // iron edge rod radius (18m contrast law)
export const BEAD_R = 0.095;               // brass vertex bead radius (count read, csaszár law)
export const PLATE_T = 0.09;               // stone sail thickness
export const PLATE_INSET = 0.05;           // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;            // sail recessed behind the ring plane (shadow gap)
export const PLINTH_APO = 3.30;            // dais APOTHEM (flats on the axes — TRUE box ±apothem)
export const PLINTH_N = 12;                // TWELVE sides (the theme number: the sails)
export const PLINTH_ROT = -Math.PI / 12;   // flats centered on the axes
export const PLINTH_R = PLINTH_APO / Math.cos(Math.PI / PLINTH_N);   // circumradius (corners at ±15°+k30°)
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- exact vertices: the icosahedron's 12 ---------------------------------------------------------------
const base: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    base.push([0, s1, s2 * PHI]);          // (0, ±1, ±φ)
    base.push([s1, s2 * PHI, 0]);          // (±1, ±φ, 0)
    base.push([s2 * PHI, 0, s1]);          // (±φ, 0, ±1)
}
if (base.length !== 12) throw Error(`vertex construction ${base.length} != 12`);
{
    const rs = base.map((v) => Math.hypot(...v));
    const spread = Math.max(...rs) - Math.min(...rs);
    const closed = Math.sqrt((5 + Math.sqrt(5)) / 2);
    check("T0a uniform sphere: all 12 vertices at one radius R = √((5+√5)/2)",
        spread < 1e-12 && Math.abs(rs[0] - closed) < 1e-12,
        `|v| spread ${spread.toExponential(1)}, R ${rs[0].toFixed(9)} (closed ${closed.toFixed(9)})`);
}

const d2 = (a: V3, b: V3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

// ---- distance-class census (printed — the derivation is honest about its options) ------------------------
{
    const classes = new Map<string, number>();
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        const k = d2(base[i], base[j]).toFixed(9);
        classes.set(k, (classes.get(k) ?? 0) + 1);
    }
    console.log(`distance classes (d² → count): ${[...classes.entries()].map(([k, c]) => `${k}×${c}`).join(", ")}`);
}

// ---- E: pairs at distance 2 (the icosa's own edges = the pentagon sides) ---------------------------------
const EDGE2 = 4;
const E0: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (Math.abs(d2(base[i], base[j]) - EDGE2) < 1e-9) E0.push([i, j]);
}

const adjAt = (dist2v: number) => {
    const adj: number[][] = Array.from({ length: 12 }, () => []);
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        if (Math.abs(d2(base[i], base[j]) - dist2v) < 1e-9) { adj[i].push(j); adj[j].push(i); }
    }
    return adj;
};
const adjEdge = adjAt(EDGE2);

// ---- ring search: all coplanar regular-pentagon 5-cycles over every distance class -----------------------
function findRings(dist2v: number): number[][] {
    const adj = adjAt(dist2v);
    const seen = new Set<string>();
    const rings: number[][] = [];
    const dfs = (path: number[]) => {
        if (path.length === 5) {
            if (!adj[path[4]].includes(path[0])) return;
            const chords: number[] = [];
            for (let k = 0; k < 5; k++) chords.push(d2(base[path[k]], base[path[(k + 2) % 5]]));
            if (Math.max(...chords) - Math.min(...chords) > 1e-9) return;
            const c: V3 = [0, 0, 0];
            for (const vi of path) { c[0] += base[vi][0] / 5; c[1] += base[vi][1] / 5; c[2] += base[vi][2] / 5; }
            const e1: V3 = [base[path[1]][0] - base[path[0]][0], base[path[1]][1] - base[path[0]][1], base[path[1]][2] - base[path[0]][2]];
            const e2: V3 = [base[path[2]][0] - base[path[0]][0], base[path[2]][1] - base[path[0]][1], base[path[2]][2] - base[path[0]][2]];
            const n: V3 = [
                e1[1] * e2[2] - e1[2] * e2[1],
                e1[2] * e2[0] - e1[0] * e2[2],
                e1[0] * e2[1] - e1[1] * e2[0],
            ];
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
            dfs([...path, w]);
        }
    };
    for (let i = 0; i < 12; i++) dfs([i]);
    return rings;
}

// honest class enumeration: the FACES are the rings whose SIDES are edges
// (side² == 4) — the {5}-faces of this edge set. Other classes' rings are
// printed and discarded.
const RINGS_RAW: number[][] = [];
{
    const classSet = new Set<number>();
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) classSet.add(Math.round(d2(base[i], base[j]) * 1e9) / 1e9);
    for (const c of classSet) {
        const rings = findRings(c);
        if (!rings.length) continue;
        if (Math.abs(c - EDGE2) < 1e-9) {
            RINGS_RAW.push(...rings);
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} regular pentagon rings with EDGE sides — THE FACES (sides are the icosa's own edges)`);
        } else {
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} rings, sides NOT the edge class (discarded — not {5}-faces of this edge set)`);
        }
    }
}
const RING_SIDE = 2;                       // model edge length (exact)

// RED control (destructive): with --red, corrupt ring 0's member set BEFORE
// the law checks (a swapped member is never coplanar with the true ring).
if (process.argv.includes("--red")) {
    const r0 = RINGS_RAW[0];
    const outside = base.findIndex((_, i) => !r0.includes(i));
    r0[r0.length - 1] = outside;
    console.log("RED MODE: ring 0 corrupted — the law checks below MUST fail");
}

// ---- seat: a POLE vertex down (BEFORE the checks — final coords feed the laws) ----------------------------
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

// ---- per-face sorted cycles + centers + normals + TRUE outlines (FINAL coords) -----------------------------
// ring → canonical angular order about the outward normal. The outline is
// the plain CONVEX pentagon (ring order; consecutive members are edges).
export const FACES: number[][] = [];
export const CENTERS: V3[] = [];
export const NORMALS: V3[] = [];
export const OUTLINES: V3[][] = [];
{
    for (const ring of RINGS_RAW) {
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
        const c: V3 = (() => { const r = rot(cModel); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE]; })();
        const nrm: V3 = rot(n);
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
        OUTLINES.push(sorted.map((vi) => V[vi]));   // convex pentagon, ring order
    }
}
const F = FACES;

// ---- theorem checks (fail-closed) ---------------------------------------------------------------------------
// T1 Euler + genus
check("T1 Euler 12−30+12 = −6 (GENUS FOUR — the tunnel star)",
    12 - E.length + F.length === -6 && E.length === 30,
    `V 12, E ${E.length}, F ${F.length}, χ ${12 - E.length + F.length}`);

// T2 degree 5 at every vertex (vertex figure {5/2})
{
    const deg = new Array(12).fill(0);
    for (const [i, j] of E) { deg[i]++; deg[j]++; }
    check("T2 every vertex degree 5 (vertex figure {5/2})", deg.every((d) => d === 5),
        `degrees all 5: ${deg.every((d) => d === 5)}`);
}

// T3 faces: coplanar regular pentagons over the EDGE class (side 2·S = the edge; chord 2φ·S — the pentagon's own golden diagonal)
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
    check("T3 12 coplanar regular pentagons over the EDGE class (side 2·S = the edge; chord 2φ·S — the golden diagonal)",
        F.length === 12 && worstPlane < 1e-9 && worstSide < 1e-9 && worstChord < 1e-9,
        `faces ${F.length}, plane ${worstPlane.toExponential(1)}, side ${worstSide.toExponential(1)} (side ${(RING_SIDE * SCALE).toFixed(9)}), chord ${worstChord.toExponential(1)} (chord ${(2 * PHI * SCALE).toFixed(9)})`);
}

// T4 manifold: every edge on exactly 2 faces (ring consecutive pairs == E)
{
    const count = new Map<string, number>();
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 5; k++) {
        const a = F[u][k], b = F[u][(k + 1) % 5];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(key, (count.get(key) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([i, j]) => (count.get(i < j ? `${i}-${j}` : `${j}-${i}`) ?? 0) !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces (ring consecutive pairs == E)", bad === 0 && missing === 0 && count.size === 30,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} edges unmatched`);
}

// T5 five faces at every vertex
{
    const per = new Array(12).fill(0);
    for (let u = 0; u < F.length; u++) for (const vi of F[u]) per[vi]++;
    check("T5 vertex figure: 5 faces at every vertex", per.every((p) => p === 5), `faces/vertex all 5: ${per.every((p) => p === 5)}`);
}

// T6 golden laws — the great dodeca's fingerprint: the face plane cuts at
// EXACTLY half the ring circumradius; R == R5·√5/2; and the ring's own
// golden diagonal law (chord/side == φ — the pentagon's own, measured 2φ).
{
    const R5 = RING_SIDE / (2 * Math.sin(Math.PI / 5));       // ring circumradius (model)
    // face-plane distance from the SPHERE CENTER (pre-lift seat coords)
    const cSeat = CENTERS[0];
    const centerOfSphere: V3 = [0, LIFT, 0];                   // seat origin lifted (rotation about origin, sphere center at 0 pre-lift)
    const dist = Math.abs((cSeat[0] - centerOfSphere[0]) * NORMALS[0][0] + (cSeat[1] - centerOfSphere[1]) * NORMALS[0][1] + (cSeat[2] - centerOfSphere[2]) * NORMALS[0][2]);
    const hModel = dist / SCALE;
    const Rmodel = Math.sqrt((5 + Math.sqrt(5)) / 2);
    check("T6 golden laws: face plane at EXACTLY R5/2; R == R5·√5/2; chord/side == φ (the pentagon's golden diagonal)",
        Math.abs(hModel - R5 / 2) < 1e-12 && Math.abs(Rmodel - (R5 * Math.sqrt(5)) / 2) < 1e-12 && Math.abs((2 * PHI) / RING_SIDE - PHI) < 1e-12,
        `h ${hModel.toFixed(12)} == R5/2 ${(R5 / 2).toFixed(12)}; R ${Rmodel.toFixed(12)} == R5·√5/2 ${((R5 * Math.sqrt(5)) / 2).toFixed(12)}; chord/side ${((2 * PHI) / RING_SIDE).toFixed(12)} == φ ${PHI.toFixed(12)}`);
    console.log("INFO T6 regularity: Schläfli {5,5/2}; Kepler, Harmonices Mundi (1619); dual of the small stellated dodecahedron {5/2,5} (standing: struct-231/232)");
}

// T7 seat law: pole vertex down
{
    const tipErr = Math.abs(V[tipIdx][1] - PLINTH_H);
    const minAbove = V.every((v) => v[1] >= PLINTH_H - 1e-9);
    const nbrs = adjEdge[tipIdx];
    const nbrY = nbrs.map((i) => V[i][1]);
    const spread = Math.max(...nbrY) - Math.min(...nbrY);
    const az = nbrs.map((i) => Math.atan2(V[i][2], V[i][0])).sort((p, q) => p - q);
    let azMiss = 0;
    for (let k = 0; k < az.length; k++) {
        const d = Math.abs((az[(k + 1) % az.length] - az[k] + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        if (Math.abs(d - (2 * Math.PI / 5)) > 1e-6) azMiss++;
    }
    // antipodal in SEAT (pre-lift) coords — the LIFT translation would
    // contaminate the naive |V[summit]+V[tip]| test (struct-261 self-catch)
    const antiSeat = Math.hypot(seat[summitIdx][0] + seat[tipIdx][0], seat[summitIdx][1] + seat[tipIdx][1], seat[summitIdx][2] + seat[tipIdx][2]);
    // footprint law: star extent + bead radius <= dais apothem at EVERY azimuth
    const R5s = (RING_SIDE / (2 * Math.sin(Math.PI / 5))) * SCALE;
    const extent = R5s + BEAD_R;
    const footOk = extent <= PLINTH_APO + 1e-6;
    check("T7 pole-down seat: tip vertex AT dais top, its ring horizontal at exact 72°, summit antipodal; footprint law extent+bead ≤ apothem",
        tipErr < 1e-9 && minAbove && spread < 1e-9 && azMiss === 0 && antiSeat < 1e-9 && footOk,
        `tip y ${V[tipIdx][1].toFixed(9)}, min y ${Math.min(...V.map((v) => v[1])).toFixed(6)}, tip-ring y ${nbrY[0].toFixed(3)} r ${R5s.toFixed(3)} (spread ${spread.toExponential(1)}, ${azMiss} azimuth misses), summit ${V[summitIdx][1].toFixed(3)} antipodal-in-seat ${antiSeat.toExponential(1)}; extent ${extent.toFixed(4)} ≤ apothem ${PLINTH_APO}`);
}

// T8 outline laws: on-plane, monotone angular order (simple convex sails)
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
    }
    check("T8 outlines: on-plane, monotone angular order (simple convex sails)", worstPlane < 1e-9 && badSign === 0,
        `worst plane dist ${(worstPlane * 1e3).toFixed(3)} mm; ${badSign} ordering violations`);
}

// T9 immersion: non-adjacent face pairs. Adjacent = share an edge; antipodal
// = opposite poles (parallel planes, never cross). The GENUS-FOUR law: the
// remaining 30 non-adjacent pairs ALL cross — the symmetric interweave,
// 5 per face (a malformed sail breaks the symmetry; the number decides).
{
    const tris: { f: number; p: V3[] }[] = [];
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 5; k++) {
        tris.push({ f: u, p: [CENTERS[u], OUTLINES[u][k], OUTLINES[u][(k + 1) % 5]] });
    }
    const adjacent = (a: number, b: number): boolean => {
        const fa = F[a], fb = F[b];
        for (let k = 0; k < 5; k++) {
            const p1 = fa[k], q1 = fa[(k + 1) % 5];
            for (let m = 0; m < 5; m++) {
                const p2 = fb[m], q2 = fb[(m + 1) % 5];
                if ((p1 === p2 && q1 === q2) || (p1 === q2 && q1 === p2)) return true;
            }
        }
        return false;
    };
    const antipodal = (a: number, b: number): boolean =>
        NORMALS[a][0] * NORMALS[b][0] + NORMALS[a][1] * NORMALS[b][1] + NORMALS[a][2] * NORMALS[b][2] < -1 + 1e-9;
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
    let adj = 0, nonAdj = 0, anti = 0;
    const perFace = new Map<number, number>();
    for (const key of pairSet) {
        const [a, b] = key.split("-").map(Number);
        if (adjacent(a, b)) adj++;
        else if (antipodal(a, b)) anti++;
        else {
            nonAdj++;
            perFace.set(a, (perFace.get(a) ?? 0) + 1);
            perFace.set(b, (perFace.get(b) ?? 0) + 1);
        }
    }
    const weaveOk = nonAdj === 30 && [...perFace.values()].every((c) => c === 5) && anti === 0;
    check("T9 immersion: the symmetric interweave — exactly 30 non-adjacent crossings, 5 per face; antipodal sails never cross",
        weaveOk,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed edge meetings) + ${nonAdj} non-adjacent (the woven sails, ${[...perFace.values()].every((c) => c === 5) ? "5-per-face symmetric" : "ASYMMETRIC"}) + ${anti} antipodal (MUST be 0 — parallel planes)`);
}

// (RED corruption is applied at the top, before the law checks — see the ring block.)

// ---- envelope + dais TRUE box ------------------------------------------------------------------------------
// Vertex extents carry BEAD_R (the r0.095 glow beads ride the vertices —
// struct-231 SSD envelope law). Dais: flats on the axes → TRUE box ±apothem.
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

console.log(`ring side (model) ${RING_SIDE} == the icosa edge — the sails' rims ARE the icosa's edges; chord ${(2 * PHI).toFixed(9)} (2φ, the golden diagonal — NOT an edge class)`);
console.log(`seat: tip vertex ${TIP_INDEX} at dais top (single point); tip-ring y ${V[adjEdge[TIP_INDEX][0]][1].toFixed(3)} r ${((RING_SIDE / (2 * Math.sin(Math.PI / 5))) * SCALE).toFixed(3)} — the CANOPY; summit ${V[SUMMIT_INDEX][1].toFixed(3)}`);
console.log(`envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).join("x")} min ${ENVELOPE.min.map((n) => n.toFixed(3)).join(",")} max ${ENVELOPE.max.map((n) => n.toFixed(3)).join(",")}`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct263-gdodec)");
