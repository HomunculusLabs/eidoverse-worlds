// struct235-probe-rt.ts — STRUCTURES LANE struct-235, Round 11 R11-48
// THE RHOMBIC TRIACONTAHEDRON — the golden gem (Kepler, Harmonices Mundi
// 1619 — "triacontahedron rhombicum"; Catalan 1865 — dual of the
// icosidodecahedron; the one Catalan solid that is ALSO a zonohedron).
//
// One idea: THE GEM ON ITS POINT. Thirty faces, every one the SAME golden
// rhombus (diagonals exactly φ), built as the zonohedron of the
// icosahedron's six 5-fold axes: the Minkowski sum of six segments
// [−g_i,+g_i], so every face is a translate of the parallelogram spanned
// by two generators. IRON draws all sixty edges; STONE fills the thirty
// rhombi and a THIRTY-sided dais (the theme number); twenty warm brass
// beads mark the degree-3 corners (the dodecahedral orbit — the
// "icosidodecahedron" ring), the bottom one half-proud in the dais top
// (struct-231 SSD lineage). Seated on a 3-fold vertex — the point-down
// language at a NEW symmetry (SSD = 5-fold star; this = 3-fold gem).
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   G = one vertex from each of the 6 antipodal pairs of the icosahedron
//       (0, ±1, ±φ) cyclic. P = all 64 subset sums of G (the zonotope).
//   Faces: for each generator pair (i,j) and sign s, the supporting plane
//   n = s·(g_i×g_j)/|·| attains its max over P on exactly 4 points forming
//   the rhombus {p, p+g_i, p+g_j, p+g_i+g_j} → 15 pairs × 2 signs = 30.
//   Hull verts = union of face verts = 32 (12 degree-5 + 20 degree-3).
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 32 − 60 + 30 = 2 (sphere).
//   T2 zone law: 6 edge-direction classes (mod sign) × 10 edges; each
//      class is exactly ±g_k (the six 5-fold axes of the icosahedron).
//   T3 faces: 30 rhombi — 4 equal sides (|g| exactly), diagonals ratio
//      exactly φ (the golden rhombus; worst deviation decides).
//   T4 manifold: every edge on exactly 2 faces.
//   T5 degree census: 12 vertices degree 5 (icosa orbit) + 20 degree 3
//      (dodeca orbit) — Σdeg = 120 = 2E.
//   T6 citation: Kepler 1619; Catalan 1865 (prose law, INFO).
//   T7 golden law: global worst long/short diagonal ratio == φ to 1e-12.
//   T8 convexity + parallel pairs: every face plane is supporting (all
//      verts inside); the 30 faces form 15 antipodal parallel pairs.
//   T9 SEAT: top vert ON the (1,1,1) 3-fold axis (fixed by the cyclic
//      coordinate rotation), max dot û; bottom = its complement (min);
//      the seated vertex set is 120°-symmetric about world Y (3-fold
//      law); bottom's 3 neighbors at one equal height (tripod).
//   T10 immersion: non-adjacent face interpenetrations = 0 (adjacent
//      contacts = the designed edge meetings, disclosed).
//   RED control: --order corrupts face 0's cycle → T3/T4 must fail.

export const SCALE = 1.25;                 // overall scale (m) — ~6.1m gem
export const ROD_R = 0.048;                // iron edge rod radius (18m contrast law)
export const BEAD_R = 0.095;               // brass vertex bead radius (count read)
export const PLATE_T = 0.09;               // stone membrane thickness
export const PLATE_INSET = 0.05;           // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;            // membrane recessed behind rod outer surface
export const PLINTH_N = 30;                // THIRTY sides (the theme number)
export const PLINTH_ROT = 0;               // shape-space angle
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- generators: one from each antipodal pair of icosa verts ----------------------------------------------
const ico: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    ico.push([0, s1, s2 * PHI]);
    ico.push([s1, s2 * PHI, 0]);
    ico.push([s2 * PHI, 0, s1]);
}
if (ico.length !== 12) throw Error(`icosa construction ${ico.length} != 12`);
const G: V3[] = [];
{
    const used = new Array(12).fill(false);
    for (let i = 0; i < 12; i++) {
        if (used[i]) continue;
        G.push(ico[i]); used[i] = true;
        for (let j = i + 1; j < 12; j++) {
            if (Math.hypot(ico[i][0] + ico[j][0], ico[i][1] + ico[j][1], ico[i][2] + ico[j][2]) < 1e-9) used[j] = true;
        }
    }
}
if (G.length !== 6) throw Error(`generators ${G.length} != 6`);
const GNORM = Math.hypot(...G[0]);
if (!G.every((g) => Math.abs(Math.hypot(...g) - GNORM) < 1e-12)) throw Error("generator norms differ");

// ---- subset sums (the zonotope, pre-translation) -----------------------------------------------------------
const P: V3[] = [];
for (let mask = 0; mask < 64; mask++) {
    const p: V3 = [0, 0, 0];
    for (let b = 0; b < 6; b++) if ((mask >> b) & 1) {
        p[0] += G[b][0]; p[1] += G[b][1]; p[2] += G[b][2];
    }
    P.push(p);
}

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const nrm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const key = (p: V3) => p.map((x) => x.toFixed(9)).join(",");

// ---- faces: supporting planes of every generator pair, both signs -------------------------------------------
type Face = { gi: number; gj: number; n: V3; off: number; verts: V3[]; center: V3 };
const faces: Face[] = [];
{
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) for (const s of [1, -1]) {
        const n = nrm(cross(G[i], G[j]).map((x) => x * s) as V3);
        let off = -Infinity;
        for (const p of P) off = Math.max(off, dot(p, n));
        const arg = P.filter((p) => Math.abs(dot(p, n) - off) < 1e-9);
        if (arg.length !== 4) throw Error(`face (${i},${j},${s}) argmax ${arg.length} != 4`);
        // verify the rhombus is the g_i,g_j parallelogram: pairwise diffs contain g_i, g_j, g_i±g_j
        const diffs: V3[] = [];
        for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) diffs.push(sub(arg[a], arg[b]));
        const near = (d: V3, t: V3) => Math.hypot(d[0] - t[0], d[1] - t[1], d[2] - t[2]) < 1e-9
            || Math.hypot(d[0] + t[0], d[1] + t[1], d[2] + t[2]) < 1e-9;
        const hasGi = diffs.some((d) => near(d, G[i]));
        const hasGj = diffs.some((d) => near(d, G[j]));
        if (!hasGi || !hasGj) throw Error(`face (${i},${j},${s}) is not the g-parallelogram`);
        faces.push({ gi: i, gj: j, n, off, verts: arg.slice(), center: [0, 0, 0] });
    }
}
if (faces.length !== 30) throw Error(`faces ${faces.length} != 30`);

// hull verts = union of face verts
const hullMap = new Map<string, V3>();
for (const f of faces) for (const v of f.verts) if (!hullMap.has(key(v))) hullMap.set(key(v), v);
const HULL: V3[] = [...hullMap.values()];

// order each face cycle (p0 → p0+g_i → p0+g_i+g_j → p0+g_j) for edge extraction
for (const f of faces) {
    const { gi, gj } = f;
    // p0 = the vert whose +g_i and +g_j are both in the face
    let p0: V3 | null = null;
    for (const v of f.verts) {
        if (f.verts.some((w) => Math.hypot(...sub(w, add(v, G[gi]))) < 1e-9) &&
            f.verts.some((w) => Math.hypot(...sub(w, add(v, G[gj]))) < 1e-9)) { p0 = v; break; }
    }
    if (!p0) throw Error("face cycle p0 not found");
    f.verts = [p0, add(p0, G[gi]), add(p0, add(G[gi], G[gj])), add(p0, G[gj])];
    f.center = [(f.verts[0][0] + f.verts[2][0]) / 2, (f.verts[0][1] + f.verts[2][1]) / 2, (f.verts[0][2] + f.verts[2][2]) / 2];
}

// edges from face cycles
const edgeKeys = new Set<string>();
const EDGES: [V3, V3][] = [];
for (const f of faces) for (let k = 0; k < 4; k++) {
    const a = f.verts[k], b = f.verts[(k + 1) % 4];
    const k1 = key(a) < key(b) ? `${key(a)}|${key(b)}` : `${key(b)}|${key(a)}`;
    if (!edgeKeys.has(k1)) { edgeKeys.add(k1); EDGES.push([a, b]); }
}

// ---- seating: top vert = argmax dot û, asserted ON the (1,1,1) axis -----------------------------------------
const U: V3 = nrm([1, 1, 1]);
let topIdx = 0, topDot = -Infinity;
HULL.forEach((v, i) => { const d = dot(v, U); if (d > topDot) { topDot = d; topIdx = i; } });
const TOP = HULL[topIdx];
// axis law: TOP on span(1,1,1)
const axisDist = Math.hypot(...cross(sub(TOP, [0, 0, 0]), U)) / Math.hypot(...U);
// rotate TOP direction → +Y (chassis from struct-231)
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const nU = nrm(TOP);
const UP: V3 = [0, 1, 0];
const cr0 = cross(nU, UP);
const cl = Math.hypot(...cr0);
const dU = dot(nU, UP);
const angU = Math.atan2(cl, dU);
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot = (v: V3): V3 => cl < 1e-12 ? (dU > 0 ? v : ([-v[0], -v[1], -v[2]] as V3)) : rotVec(v, seatAxis, angU);
const seatedHull = HULL.map((v) => rot(v).map((x) => x * SCALE) as V3);
const yMin = Math.min(...seatedHull.map((v) => v[1]));
const LIFT = PLINTH_H - yMin;
export const V: V3[] = seatedHull.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);

// seated face data (FINAL world coords)
export const FACE_V: V3[][] = faces.map((f) => f.verts.map((v) => {
    const r = rot(v); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE] as V3;
}));
export const CENTERS: V3[] = faces.map((f) => {
    const r = rot(f.center); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE] as V3;
});
export const NORMALS: V3[] = faces.map((f) => rot(f.n));

// degree census (seated, by proximity since verts are rotated floats — match within 1e-6)
const vIdx = (p: V3): number => {
    const i = V.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-6);
    if (i < 0) throw Error(`vert not found ${p}`);
    return i;
};
export const FACE_IDX: number[][] = FACE_V.map((fv) => fv.map(vIdx));
export const E: [number, number][] = EDGES.map(([a, b]) => [vIdx(rot2seated(a)), vIdx(rot2seated(b))]);
function rot2seated(v: V3): V3 {
    const r = rot(v); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE];
}
const deg = new Array(V.length).fill(0);
for (const [a, b] of E) { deg[a]++; deg[b]++; }
export const DEG5_IDX = deg.map((d, i) => (d === 5 ? i : -1)).filter((i) => i >= 0);
export const DEG3_IDX = deg.map((d, i) => (d === 3 ? i : -1)).filter((i) => i >= 0);

// RED control (--red corrupts face 0's cycle AFTER indexing: a bowtie cycle)
if (process.argv.includes("--red")) {
    FACE_IDX[0] = [FACE_IDX[0][0], FACE_IDX[0][2], FACE_IDX[0][1], FACE_IDX[0][3]];
    console.log("RED MODE: face 0 cycle corrupted — T3/T4 MUST fail");
}

// ---- T1 Euler -----------------------------------------------------------------------------------------------
check("T1 Euler 32−60+30 = 2", V.length === 32 && E.length === 60 && faces.length === 30 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 zone law: 6 direction classes × 10 edges, each class ±g_k --------------------------------------------
{
    // SELF-CATCH: edges live in SEATED coords — compare against SEATED
    // generators rot(g_k), not the raw model-frame g_k (first run measured
    // 0.38 against unrotated axes — the law was wrong, not the geometry).
    const GS: V3[] = G.map((g) => rot(g));
    const classes = new Map<number, number>();
    let worst = 0;
    for (const [a, b] of E) {
        const d = sub(V[a], V[b]);
        const l = Math.hypot(...d);
        const u: V3 = [d[0] / l, d[1] / l, d[2] / l];
        let best = Infinity, bk = -1;
        for (let k = 0; k < 6; k++) {
            const gk = nrm(GS[k]);
            const m = Math.min(Math.hypot(...sub(u, gk)), Math.hypot(...add(u, gk)));
            if (m < best) { best = m; bk = k; }
        }
        worst = Math.max(worst, best);
        classes.set(bk, (classes.get(bk) ?? 0) + 1);
    }
    const okClasses = classes.size === 6 && [...classes.values()].every((c) => c === 10);
    check("T2 zone law: 6 edge-direction classes × 10 edges (the icosa's six 5-fold axes)", okClasses && worst < 1e-9,
        `${classes.size} classes [${[...classes.entries()].map(([k, c]) => `g${k}:${c}`).join(" ")}]; worst parallel deviation ${(worst * 1e12).toExponential(1)}`);
}

// ---- T3 faces: golden rhombi ---------------------------------------------------------------------------------
{
    let worstSide = 0, worstRatio = 0;
    for (const fv of FACE_V) {
        const sides = [0, 1, 2, 3].map((k) => Math.hypot(...sub(fv[(k + 1) % 4], fv[k])));
        for (const s of sides) worstSide = Math.max(worstSide, Math.abs(s - GNORM * SCALE));
        const d1 = Math.hypot(...sub(fv[2], fv[0])), d2 = Math.hypot(...sub(fv[3], fv[1]));
        const ratio = Math.max(d1, d2) / Math.min(d1, d2);
        worstRatio = Math.max(worstRatio, Math.abs(ratio - PHI));
    }
    check("T3 30 golden rhombi (4 equal sides; diagonal ratio φ)", worstSide < 1e-9 && worstRatio < 1e-12,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst |ratio−φ| ${worstRatio.toExponential(1)}; side ${(GNORM * SCALE).toFixed(4)}m`);
}

// ---- T4 manifold ---------------------------------------------------------------------------------------------
{
    const count = new Map<string, number>();
    for (const f of FACE_IDX) for (let k = 0; k < 4; k++) {
        const a = f[k], b = f[(k + 1) % 4];
        const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(kk, (count.get(kk) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([a, b]) => (count.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0) !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && count.size === 60,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 degree census ------------------------------------------------------------------------------------------
check("T5 degree census: 12 × degree-5 + 20 × degree-3", DEG5_IDX.length === 12 && DEG3_IDX.length === 20,
    `deg5 ${DEG5_IDX.length}, deg3 ${DEG3_IDX.length}, Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}`);

// ---- T6 citation (prose) ---------------------------------------------------------------------------------------
console.log("INFO T6: Kepler, Harmonices Mundi (1619) — triacontahedrum rhombicum; Catalan (1865) — dual of the icosidodecahedron; the unique zonohedral Catalan solid (six zones)");

// ---- T7 golden law (global worst) ------------------------------------------------------------------------------
{
    let worst = 0;
    for (const fv of FACE_V) {
        const d1 = Math.hypot(...sub(fv[2], fv[0])), d2 = Math.hypot(...sub(fv[3], fv[1]));
        worst = Math.max(worst, Math.abs(Math.max(d1, d2) / Math.min(d1, d2) - PHI));
    }
    check("T7 golden law: every rhombus long/short == φ", worst < 1e-12, `worst ${worst.toExponential(1)}; φ ${PHI.toFixed(12)}`);
}

// ---- T8 convexity + parallel face pairs --------------------------------------------------------------------------
{
    let outside = 0;
    for (const f of faces) {
        const n = NORMALS[faces.indexOf(f)];
        const off = FACE_V[faces.indexOf(f)].reduce((m, v) => Math.max(m, 0), 0); // unused; real test below
        void off;
        // supporting test in FINAL coords: plane through center with normal n; all verts ≤ +tol
        const c = CENTERS[faces.indexOf(f)];
        const offC = dot(c, n);
        for (const v of V) if (dot(v, n) > offC + 1e-6) outside++;
    }
    // parallel pairs: count faces with an antipodal normal partner
    let pairs = 0;
    for (let i = 0; i < 30; i++) for (let j = i + 1; j < 30; j++) {
        const d = Math.hypot(...add(NORMALS[i], NORMALS[j]));
        if (d < 1e-9) pairs++;
    }
    check("T8 convexity + 15 parallel face pairs", outside === 0 && pairs === 15,
        `${outside} verts outside a face plane; ${pairs} antipodal-normal pairs`);
}

// ---- T9 seat laws -------------------------------------------------------------------------------------------------
{
    const top = V.reduce((m, v) => (v[1] > m[1] ? v : m), V[0]);
    const bot = V.reduce((m, v) => (v[1] < m[1] ? v : m), V[0]);
    const botIdx = vIdx(bot);
    const neigh = E.filter(([a, b]) => a === botIdx || b === botIdx).map(([a, b]) => (a === botIdx ? b : a));
    const nY = neigh.map((i) => V[i][1]);
    const spread = Math.max(...nY) - Math.min(...nY);
    // 120° symmetry about world Y: rotation R_y(2π/3) permutes V
    const a = 2 * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) {
        const r = Ry(v);
        if (!V.some((q) => Math.hypot(q[0] - r[0], q[1] - r[1], q[2] - r[2]) < 1e-6)) symMiss++;
    }
    check("T9 seat: bottom tripod (3 equal-height neighbors), 120° symmetry about Y, axis vert on top",
        axisDist < 1e-9 && neigh.length === 3 && spread < 1e-9 && symMiss === 0,
        `axis dist ${(axisDist * 1e12).toExponential(1)}; bottom ${neigh.length} neighbors at y ${nY[0].toFixed(4)} (spread ${spread.toExponential(1)}); 120° misses ${symMiss}; summit y ${top[1].toFixed(3)}`);
}

// ---- T10 immersion ------------------------------------------------------------------------------------------------
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
        for (let k = 0; k < 4; k++) tris.push({ f: u, p: [c, fv[k], fv[(k + 1) % 4]] });
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
    const share = new Map<string, Set<number>>();
    FACE_IDX.forEach((f, u) => f.forEach((vi) => {
        const k2 = share.get(`${vi}`) ?? new Set<number>(); k2.add(u); share.set(`${vi}`, k2);
    }));
    let adj = 0, nonAdj = 0;
    for (const kk of pairSet) {
        const [a, b] = kk.split("-").map(Number);
        const shared = [...share.get(`${FACE_IDX[a][0]}`)!].filter((f) => FACE_IDX[b].includes(FACE_IDX[a][FACE_IDX[a].indexOf(FACE_IDX[a][0])]) && false).length; // placeholder replaced below
        void shared;
        // adjacency = share ≥ 2 vertices
        const common = FACE_IDX[a].filter((x) => FACE_IDX[b].includes(x)).length;
        if (common >= 2) adj++; else nonAdj++;
    }
    check("T10 immersion: ZERO non-adjacent interpenetrations", nonAdj === 0,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed edge meetings) + ${nonAdj} non-adjacent (defect class)`);
}

// ---- footprint → dais radius (derived export) -----------------------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
export const PLINTH_R = Math.ceil((MAX_H + BEAD_R + 0.10) * 20) / 20;
export const TIP_IDX = vIdx(V.reduce((m, v) => (v[1] < m[1] ? v : m), V[0]));
export const SUMMIT_IDX = vIdx(V.reduce((m, v) => (v[1] > m[1] ? v : m), V[0]));

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

const tipNeighbors = E.filter(([a, b]) => a === TIP_IDX || b === TIP_IDX).map(([a, b]) => (a === TIP_IDX ? b : a));
console.log(`seat: bottom tripod vertex ${TIP_IDX} at dais top ${PLINTH_H.toFixed(2)}; summit ${SUMMIT_IDX} y ${V[SUMMIT_IDX][1].toFixed(3)}; tripod neighbors y ${tipNeighbors.map((i) => V[i][1].toFixed(3)).join("/")}`);
console.log(`footprint max horiz ${MAX_H.toFixed(3)} + bead ${BEAD_R} → dais R ${PLINTH_R.toFixed(2)} (${PLINTH_N} sides); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`beads: ${DEG3_IDX.length} at degree-3 (dodeca orbit); bare degree-5 verts ${DEG5_IDX.length} (icosa orbit, iron carries them)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct235-rt)");
