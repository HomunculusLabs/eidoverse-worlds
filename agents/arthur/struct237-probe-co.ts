// struct237-probe-co.ts — STRUCTURES LANE struct-237, Round 11 R11-50
// THE CUBOCTAHEDRON — the equal measure (Archimedes; recorded by Pappus,
// "Collection" Book V ~340 AD; Fuller's "vector equilibrium", 1940s).
// The ARCHIMEDEAN/QUASIREGULAR BRANCH OPENS (register grep fresh: cubocta/
// hypercube-family aside, 0 cuboctahedron mentions across STRUCTURES-PLAN +
// IMPROVEMENTS + IMPROVE-PLAN + CITY-PLAN + CITY-PLAN-V2 — never named,
// never barred, never built).
//
// One idea: THE EQUAL MEASURE. Eight triangles and six squares in a
// checkerboard — every edge shared by exactly ONE triangle + ONE square
// (the quasiregular law), and the edge length EXACTLY equals the
// circumradius (unique among uniform polyhedra: corner-to-center ==
// corner-to-corner). Seated on a TRIANGLE face (the point-down family's
// face-contact cousin: SSD = 5-fold tip, rt = 3-fold tripod tip, this =
// the flat triangular seat — solid contact, no tip bead). IRON draws the
// 24 edges; STONE fills the 14 membranes and the TWELVE-sided dais (the
// theme number: the twelve corners). Night contract: TWELVE warm brass
// beads at the twelve corners — the FCC kissing-twelve, the exact
// coordinate class of the standing newtonspheres' outer spheres (deliberate
// cross-lane echo: "when the twelve spheres touch, their centers are these
// corners"); the three base corners ride half-proud in the dais top
// (struct-231/235 lineage).
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Model frame: the twelve verts = all (±1,±1,0),(±1,0,±1),(0,±1,±1).
//   R_model = √2, EDGE = √2 (the signature: edge == circumradius).
//   Squares: the six planes coord_axis = ±1 (4 verts each).
//   Triangles: the eight planes ±x±y±z = 2 (3 verts each).
//   Seat: map n̂=(1,1,1)/√3 → +Y (base face x+y+z=−2 flat on the dais),
//   then snap the twist so base corner 0 sits at azimuth 0 (+X).
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 12 − 24 + 14 = 2 (sphere).
//   T2 quasiregular: every edge on exactly ONE triangle + ONE square.
//   T3 THE EQUAL MEASURE: every edge length == circumradius, worst < 1e-9.
//   T4 manifold: every edge on exactly 2 faces.
//   T5 face census: 8 equilateral triangles + 6 squares, all sides == edge.
//   T6 FCC law: every vert an even permutation of (±1,±1,0); degree 4
//      everywhere; 2 tris + 2 sqs incident per vertex (vertex figure).
//   T7 citation (prose): Archimedes via Pappus Book V; Fuller's vector
//      equilibrium; the jitterbug relation (prose only).
//   T8 uniformity: every dihedral angle equal, cos = +1/√3 exactly
//      (exterior normal angle 54.7356°, interior 125.2644°).
//   T9 seat: base triangle flat (3 verts one height, spread 0), centroid
//      ON the Y axis, 120° symmetry about Y with 0 misses, summit face
//      parallel at exactly 2·r_tri above the base plane.
//   T10 immersion: zero non-adjacent face interpenetrations.
//   RED control: --order corrupts square 0's cycle → T2/T4 must fail.

export const SCALE = 2.7;                 // overall scale (m) — edge/_radius √2·S ≈ 3.818, height 2·r_tri·S ≈ 6.235
export const ROD_R = 0.06;                // iron edge rod radius (long edges, 18m contrast law)
export const BEAD_R = 0.095;              // brass vertex bead radius (count read, rt/ssd lineage)
export const PLATE_T = 0.09;              // stone membrane thickness
export const PLATE_INSET = 0.05;          // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;           // membrane recessed behind rod outer surface
export const PLINTH_N = 12;               // TWELVE sides (the theme number — the twelve corners)
export const PLINTH_ROT = 0;              // shape-space angle (corners ON the axes)
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const SQ3 = Math.sqrt(3);

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
const key = (p: V3) => p.map((x) => x.toFixed(9)).join(",");

// ---- model frame: the twelve FCC corners ------------------------------------------------------------------
const M: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    M.push([s1, s2, 0]);
    M.push([s1, 0, s2]);
    M.push([0, s1, s2]);
}
if (M.length !== 12) throw Error(`FCC construction ${M.length} != 12`);
const R_MOD = Math.hypot(...M[0]);              // √2
const A_MOD = Math.SQRT2;                        // edge in model units — == R (the signature)
if (Math.abs(R_MOD - Math.SQRT2) > 1e-12) throw Error("model radius != √2");

// ---- faces: 6 squares (axis planes) + 8 triangles (cube-corner planes) ------------------------------------
type Face = { kind: "sq" | "tri"; n: V3; verts: V3[]; center: V3 };
const faces: Face[] = [];
{
    // squares: coord_axis = ±1, ordered cycle
    const AX: [number, number][] = [[0, 1], [1, 2], [2, 0]];   // (axis, other-axis-a) pairs
    for (const [ax, _oa] of AX) void _oa;
    for (let ax = 0; ax < 3; ax++) for (const s of [1, -1]) {
        const inPlane = M.filter((v) => Math.abs(v[ax] - s) < 1e-12);
        if (inPlane.length !== 4) throw Error(`square axis ${ax} sign ${s}: ${inPlane.length} != 4`);
        // order by angle in the plane about its center
        const c: V3 = [0, 0, 0];
        const n: V3 = [0, 0, 0]; n[ax] = s;
        const [u, w] = [[0, 1], [1, 2], [2, 0]].filter(([a, b]) => a !== ax && b !== ax)[0] as [number, number];
        const eu: V3 = [0, 0, 0]; eu[u] = 1;
        const ew: V3 = [0, 0, 0]; ew[w] = 1;
        // outward normal must be RIGHT-HANDED with the cycle (ccw seen from outside)
        const ordered = inPlane
            .map((v) => ({ v, ang: Math.atan2(dot(v, ew), dot(v, eu)) }))
            .sort((a, b) => a.ang - b.ang)
            .map(({ v }) => v);
        // cross(first-edge, second-edge) must point along +n; else reverse
        const e1 = sub(ordered[1], ordered[0]), e2 = sub(ordered[2], ordered[1]);
        const cyc = cross(e1, e2);
        if (dot(cyc, n) < 0) ordered.reverse();
        const ctr = mul(ordered.reduce((acc, v) => add(acc, v), [0, 0, 0] as V3), 1 / 4);
        faces.push({ kind: "sq", n, verts: ordered, center: ctr });
    }
    // triangles: ±x±y±z = 2
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) for (const s3 of [1, -1]) {
        const n0: V3 = [s1, s2, s3];
        const inPlane = M.filter((v) => Math.abs(dot(v, n0) - 2) < 1e-12);
        if (inPlane.length !== 3) throw Error(`triangle (${s1},${s2},${s3}): ${inPlane.length} != 3`);
        const n = nrm(n0);
        const eu = nrm(cross([0, 1, 0], n).every((x) => Math.abs(x) < 1e-12) ? cross([1, 0, 0], n) : cross([0, 1, 0], n));
        const ew = cross(n, eu);
        const ordered = inPlane
            .map((v) => ({ v, ang: Math.atan2(dot(v, ew), dot(v, eu)) }))
            .sort((a, b) => a.ang - b.ang)
            .map(({ v }) => v);
        const e1 = sub(ordered[1], ordered[0]), e2 = sub(ordered[2], ordered[1]);
        if (dot(cross(e1, e2), n) < 0) ordered.reverse();
        const ctr = mul(ordered.reduce((acc, v) => add(acc, v), [0, 0, 0] as V3), 1 / 3);
        faces.push({ kind: "tri", n, verts: ordered, center: ctr });
    }
}
if (faces.length !== 14) throw Error(`faces ${faces.length} != 14`);
if (faces.filter((f) => f.kind === "sq").length !== 6 || faces.filter((f) => f.kind === "tri").length !== 8)
    throw Error("face kind census wrong");

// ---- edges: pairs at distance √2 ---------------------------------------------------------------------------
const EDGES: [V3, V3][] = [];
{
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        if (Math.abs(dist(M[i], M[j]) - A_MOD) < 1e-12) {
            const k1 = key(M[i]) < key(M[j]) ? `${key(M[i])}|${key(M[j])}` : `${key(M[j])}|${key(M[i])}`;
            if (!seen.has(k1)) { seen.add(k1); EDGES.push([M[i], M[j]]); }
        }
    }
}
if (EDGES.length !== 24) throw Error(`edges ${EDGES.length} != 24`);

// ---- seating: map n̂=(1,1,1)/√3 → +Y, snap twist so base corner 0 → azimuth 0 ------------------------------
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const U: V3 = nrm([1, 1, 1]);
const cr0 = cross(U, [0, 1, 0]);
const cl = Math.hypot(...cr0);
const dU = dot(U, [0, 1, 0]);
const angU = Math.atan2(cl, dU);
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// twist snap: base face = the triangle with outward normal −U (plane x+y+z = −2)
const baseFace = faces.find((f) => f.kind === "tri" && dot(f.n, mul(U, -1)) > 1 - 1e-9);
if (!baseFace) throw Error("base face not found");
const b0 = rot1(baseFace.verts[0]);
const az0 = Math.atan2(b0[2], b0[0]);
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], -az0);
const rot = (v: V3): V3 => rot2(rot1(v));

const seated = M.map((v) => mul(rot(v), SCALE));
const yMin = Math.min(...seated.map((v) => v[1]));
const LIFT = PLINTH_H - yMin;
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
const vIdx = (p: V3): number => {
    const i = V.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-6);
    if (i < 0) throw Error(`vert not found ${p}`);
    return i;
};
export const FACE_V: V3[][] = faces.map((f) => f.verts.map((v) => {
    const r = rot(v); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE] as V3;
}));
export const CENTERS: V3[] = faces.map((f) => {
    const r = rot(f.center); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE] as V3;
});
export const NORMALS: V3[] = faces.map((f) => rot(f.n));
export const KINDS = faces.map((f) => f.kind);
export const FACE_IDX: number[][] = FACE_V.map((fv) => fv.map(vIdx));
export const E: [number, number][] = EDGES.map(([a, b]) => {
    const ra = rot(a), rb = rot(b);
    return [vIdx([ra[0] * SCALE, ra[1] * SCALE + LIFT, ra[2] * SCALE]),
            vIdx([rb[0] * SCALE, rb[1] * SCALE + LIFT, rb[2] * SCALE])];
});
export const TRI_FACES = faces.map((f, i) => (f.kind === "tri" ? i : -1)).filter((i) => i >= 0);
export const SQ_FACES = faces.map((f, i) => (f.kind === "sq" ? i : -1)).filter((i) => i >= 0);
export const BASE_FACE_IDX = faces.indexOf(baseFace);

// RED control (--red corrupts square 0's cycle AFTER indexing: a bowtie cycle)
if (process.argv.includes("--red")) {
    const s0 = SQ_FACES[0];
    FACE_IDX[s0] = [FACE_IDX[s0][0], FACE_IDX[s0][2], FACE_IDX[s0][1], FACE_IDX[s0][3]];
    console.log("RED MODE: square 0 cycle corrupted — T2/T4 MUST fail");
}

// ---- T1 Euler -----------------------------------------------------------------------------------------------
check("T1 Euler 12−24+14 = 2", V.length === 12 && E.length === 24 && faces.length === 14 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length} (8 tri + 6 sq), χ ${V.length - E.length + faces.length}`);

// ---- T2 quasiregular: every edge on exactly ONE triangle + ONE square ---------------------------------------
{
    const edgeFaceCount = new Map<string, { tri: number; sq: number }>();
    for (const f of FACE_IDX.map((fi, u) => ({ fi, kind: KINDS[u] }))) {
        for (let k = 0; k < f.fi.length; k++) {
            const a = f.fi[k], b = f.fi[(k + 1) % f.fi.length];
            const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
            const rec = edgeFaceCount.get(kk) ?? { tri: 0, sq: 0 };
            if (f.kind === "tri") rec.tri++; else rec.sq++;
            edgeFaceCount.set(kk, rec);
        }
    }
    const bad = [...edgeFaceCount.entries()].filter(([, r]) => r.tri !== 1 || r.sq !== 1);
    const onEdges = E.filter(([a, b]) => !edgeFaceCount.has(a < b ? `${a}-${b}` : `${b}-${a}`)).length;
    check("T2 quasiregular: every edge on exactly ONE triangle + ONE square",
        edgeFaceCount.size === 24 && bad.length === 0 && onEdges === 0,
        `${edgeFaceCount.size} face-edges, ${bad.length} with wrong tri/sq mix, ${onEdges} rods faceless`);
}

// ---- T3 THE EQUAL MEASURE: edge length == circumradius --------------------------------------------------------
{
    const R_S = R_MOD * SCALE;
    let worst = 0;
    for (const [a, b] of E) worst = Math.max(worst, Math.abs(dist(V[a], V[b]) - R_S));
    const radSpread = Math.max(...V.map((v) => Math.abs(Math.hypot(v[0] - 0, v[1] - (PLINTH_H + 2 / SQ3 * SCALE), v[2] - 0) - R_S)));
    check("T3 THE EQUAL MEASURE: every edge == circumradius", worst < 1e-9 && radSpread < 1e-6,
        `worst |edge−R| ${(worst * 1e12).toExponential(1)}; edge ${ (A_MOD * SCALE).toFixed(4)}m == R ${(R_S).toFixed(4)}m; seated radius spread ${radSpread.toExponential(1)} about the solid center`);
}

// ---- T4 manifold ---------------------------------------------------------------------------------------------
{
    const count = new Map<string, number>();
    for (const f of FACE_IDX) for (let k = 0; k < f.length; k++) {
        const a = f[k], b = f[(k + 1) % f.length];
        const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(kk, (count.get(kk) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([a, b]) => (count.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0) !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && count.size === 24,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 face census: 8 equilateral triangles + 6 squares, all sides == edge ----------------------------------
{
    let worstSide = 0, worstSq = 0;
    for (const fv of FACE_V) {
        const sides = fv.map((_, k) => dist(fv[(k + 1) % fv.length], fv[k]));
        for (const s of sides) worstSide = Math.max(worstSide, Math.abs(s - A_MOD * SCALE));
        if (fv.length === 4) {
            const diag1 = dist(fv[2], fv[0]), diag2 = dist(fv[3], fv[1]);
            worstSq = Math.max(worstSq, Math.abs(diag1 - Math.SQRT2 * A_MOD * SCALE), Math.abs(diag2 - Math.SQRT2 * A_MOD * SCALE));
        }
    }
    check("T5 faces: 8 equilateral triangles + 6 squares, all sides == edge",
        worstSide < 1e-9 && worstSq < 1e-9,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst square-diagonal dev ${(worstSq * 1e12).toExponential(1)}; side ${(A_MOD * SCALE).toFixed(4)}m`);
}

// ---- T6 FCC law + vertex figure ------------------------------------------------------------------------------
{
    // every model vert is an even permutation of (±1,±1,0)
    const patterns: V3[] = [];
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
        patterns.push([s1, s2, 0]); patterns.push([s1, 0, s2]); patterns.push([0, s1, s2]);
    }
    const patMatch = M.every((v) => patterns.some((p) => dist(v, p) < 1e-12));
    const deg = new Array(V.length).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    const degOk = deg.every((d) => d === 4);
    // vertex figure: 2 tris + 2 sqs incident per vertex, alternating
    let figOk = true;
    for (let i = 0; i < V.length && figOk; i++) {
        const tris = FACE_IDX.filter((f, u) => KINDS[u] === "tri" && f.includes(i)).length;
        const sqs = FACE_IDX.filter((f, u) => KINDS[u] === "sq" && f.includes(i)).length;
        if (tris !== 2 || sqs !== 2) figOk = false;
    }
    check("T6 FCC law: 12 = even perms of (±1,±1,0) (the kissing-twelve); degree 4; vertex figure 2 tri + 2 sq",
        patMatch && degOk && figOk,
        `patterns ${patMatch}; degrees all 4 (Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}); vertex figure ${figOk ? "2+2 everywhere" : "BROKEN"}`);
}

// ---- T7 citation (prose) ---------------------------------------------------------------------------------------
console.log("INFO T7: Archimedes (~250 BC, lost treatise; recorded by Pappus, Collection Book V ~340 AD) — rectified cube/octahedron; Fuller (1940s) \"vector equilibrium\"; jitterbug transform (prose only — no motion claim)");

// ---- T8 uniformity: every dihedral equal, cos(exterior) == +1/√3 exactly ---------------------------------------
{
    const cosVals: number[] = [];
    for (let u = 0; u < 14; u++) for (let w = u + 1; w < 14; w++) {
        // shared edge?
        const common = FACE_IDX[u].filter((x) => FACE_IDX[w].includes(x));
        if (common.length !== 2) continue;
        cosVals.push(dot(NORMALS[u], NORMALS[w]));
    }
    const worst = Math.max(...cosVals.map((c) => Math.abs(c - 1 / SQ3)));
    check("T8 uniformity: all dihedrals equal, cos(exterior angle) == +1/√3 exactly",
        cosVals.length === 24 && worst < 1e-9,
        `${cosVals.length} shared-edge pairs; worst |cos−1/√3| ${worst.toExponential(1)}; interior dihedral ${(180 - Math.acos(1 / SQ3) * 180 / Math.PI).toFixed(4)}° everywhere`);
}

// ---- T9 seat laws ----------------------------------------------------------------------------------------------
{
    const bf = FACE_IDX[BASE_FACE_IDX];
    const nY = bf.map((i) => V[i][1]);
    const spread = Math.max(...nY) - Math.min(...nY);
    const cx = bf.reduce((s, i) => s + V[i][0], 0) / 3;
    const cz = bf.reduce((s, i) => s + V[i][2], 0) / 3;
    const a = 2 * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) {
        const r = Ry(v);
        if (!V.some((q) => Math.hypot(q[0] - r[0], q[1] - r[1], q[2] - r[2]) < 1e-6)) symMiss++;
    }
    // summit face parallel: base plane normal == -Y; top face normal == +Y; heights exact
    const baseY = nY[0];
    const wantH = 2 * (2 / SQ3) * SCALE;
    const topFace = faces.findIndex((f, u) => KINDS[u] === "tri" && dot(NORMALS[u], [0, 1, 0]) > 1 - 1e-9);
    const topY = topFace >= 0 ? FACE_V[topFace][0][1] : NaN;
    // base normal check
    const bn = NORMALS[BASE_FACE_IDX];
    check("T9 seat: base triangle flat on the dais, centroid ON Y, 120° symmetry, summit face parallel",
        spread < 1e-9 && Math.hypot(cx, cz) < 1e-9 && symMiss === 0 && dot(bn, [0, -1, 0]) > 1 - 1e-9
        && topFace >= 0 && Math.abs(topY - baseY - wantH) < 1e-9,
        `spread ${spread.toExponential(1)}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; 120° misses ${symMiss}; base↔top ${(topY - baseY).toFixed(4)}m == 2·r_tri ${wantH.toFixed(4)}m; base at dais top ${baseY.toFixed(3)}`);
}

// ---- T10 immersion ----------------------------------------------------------------------------------------------
{
    const segTri = (a: V3, b: V3, t: V3[]): boolean => {
        const e1 = sub(t[1], t[0]), e2 = sub(t[2], t[0]), d = sub(b, a);
        const p = cross(d, e2);
        const det = dot(e1, p);
        if (Math.abs(det) < 1e-12) return false;
        const inv = 1 / det;
        const tt = sub(a, t[0]);
        const uu = inv * dot(tt, p);
        if (uu < -1e-9 || uu > 1 + 1e-9) return false;
        const q = cross(tt, e1);
        const vv = inv * dot(d, q);
        if (vv < -1e-9 || uu + vv > 1 + 1e-9) return false;
        const tr = inv * dot(e2, q);
        return tr > 1e-9 && tr < 1 - 1e-9;
    };
    const tris: { f: number; p: V3[] }[] = [];
    faces.forEach((_, u) => {
        const fv = FACE_V[u], c = CENTERS[u];
        for (let k = 0; k < fv.length; k++) tris.push({ f: u, p: [c, fv[k], fv[(k + 1) % fv.length]] });
    });
    const pairSet = new Set<string>();
    for (let i = 0; i < tris.length; i++) for (let j = i + 1; j < tris.length; j++) {
        if (tris[i].f === tris[j].f) continue;
        const kk = tris[i].f < tris[j].f ? `${tris[i].f}-${tris[j].f}` : `${tris[j].f}-${tris[i].f}`;
        if (pairSet.has(kk)) continue;
        const A = tris[i].p, B = tris[j].p;
        let hit = false;
        outer: for (const T of [A, B]) {
            const O = T === A ? B : A;
            for (const [a, b] of [[0, 1], [1, 2], [2, 0]] as [number, number][]) {
                if (segTri(T[a], T[b], O)) { hit = true; break outer; }
            }
        }
        if (hit) pairSet.add(kk);
    }
    let adj = 0, nonAdj = 0;
    for (const kk of pairSet) {
        const [a, b] = kk.split("-").map(Number);
        const common = FACE_IDX[a].filter((x) => FACE_IDX[b].includes(x)).length;
        if (common >= 2) adj++; else nonAdj++;
    }
    check("T10 immersion: ZERO non-adjacent interpenetrations", nonAdj === 0,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed edge meetings) + ${nonAdj} non-adjacent (defect class)`);
}

// ---- footprint → dais radius (derived export) --------------------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
export const PLINTH_R = Math.ceil((MAX_H + BEAD_R + 0.10) * 20) / 20;
export const BASE_IDX = FACE_IDX[BASE_FACE_IDX];
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

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

console.log(`seat: base triangle ${BASE_IDX.join("/")} flat at dais top ${PLINTH_H.toFixed(2)}; summit y ${SUMMIT_Y.toFixed(3)}; footprint max horiz ${MAX_H.toFixed(3)} + bead ${BEAD_R} → dais R ${PLINTH_R.toFixed(2)} (${PLINTH_N} sides); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`beads: 12 at ALL corners (the FCC kissing-twelve — newtonspheres echo); 3 base beads half-proud in the dais top`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct237-co)");
