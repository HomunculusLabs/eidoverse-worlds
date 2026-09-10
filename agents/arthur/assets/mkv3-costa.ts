// mkv3-costa.ts — STRUCTURES LANE struct-166, Round 11 commission R11-5 THE COSTA.
// struct-165's committed carry: probe C5 fixed to 13/13 this tick (check-side
// cdiv(real) type bug — machinery itself was exact), THEN build+judge, bank
// for the struct-167 placement slot.
//
// ONE IDEA (contract committed in STRUCTURES-PLAN struct-165, unchanged):
// THE SURFACE THAT ENDED A TWO-CENTURY WAIT. Costa 1984, genus one, three
// ends — completing the ancient trio (plane/catenoid/helicoid) this village
// already owns (catenoid struct-102, helicoid screw-well struct-78) with the
// modern surprise. TWO TRUMPETS AND A SKIRT: two vertical catenoid bells
// joined at the waist by a flaring horizontal skirt with one hole — the
// handle of the surface. At 18m: a three-lobed star — bell up, bell down,
// brim out. Folly class, no walk owed (enneper/gyroid precedent).
//
// MATH (Gray parametrization via theta functions — struct165-probe-costa v2,
// 13/13 machine-exact, re-gated this tick before build). Orientation truth
// from the probe's C7 survey: skirt lies flat at z=0 (the planar end);
// trumpets along +-z with catenoid law z ~ -1.4 log r; w1-class ends DOWN
// (fz<0), w3-class ends UP (fz>0). X is lattice-invariant: x/y absorb the
// zeta quasi-period shifts exactly (verified in the spot-law block).
//
// MESHING LAW (replaces the first draft's polar fan — REJECTED at review,
// never built): the compact piece |X_xy| <= R_CUT is a torus minus THREE
// discs (chi = -3, THREE boundary loops), and a single polar fan from the
// saddle would drag chords across the air between end-rims. Correct chassis:
// TRIMMED UNIFORM GRID on the fundamental domain —
//   - grid verts (i,j) mod N shared across domain edges (torus gluings
//     automatic; crossing edges bisected along the UNWRAPPED segment, X
//     lattice-invariant);
//   - |X_xy| >= R_CUT verts are OUT; each crossing grid edge gets ONE exact
//     on-level vertex (48-step bisection on that edge);
//   - marching-triangles case table per cell (CCW winding);
//   - topology law: every interior edge in exactly 2 faces, boundary edges
//     in exactly 1, exactly 3 closed boundary loops, V-E+F = -3.
// ALL THREE rims land at exactly K*R_CUT world radius (balanced three-lobed
// star by construction; rim-radius law exact, not pinned to a printout).
//
// DRESSING: skirt brim hemmed by a brass tube along the skirt loop
// (enneper iron-rim family); up mouth closed by a shallow brass dome whose
// base ring IS the exact rim loop (no gap — closes the see-through class);
// down mouth embedded whole into the stone drum plinth (embed law: rim max y
// 12mm under the drum top); ONE glow KEEP bead seated at the dome apex
// (dusk lineage, struct-82).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes cs_bone (film,
// DoubleSide — interior visible through the geometry), cs_brass (tensegrity
// v6 bright-brass wire lane), cs_stone. Glow census exactly 1 KEEP
// (glow_cs_1). Deterministic: pure grid + bisection + seeded texMat only.
// Node budget 4 (bone film + brass + stone + glow KEEP).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- theta machinery (verbatim from the 13/13-verified probe) --------------------------------------
const Q = Math.exp(-Math.PI);            // tau = i
const NTERMS = 14;                        // q^{(13.5)^2} ~ 1e-248: machine-exact
const AN: number[] = [], KK: number[] = [];
for (let n = 0; n < NTERMS; n++) {
    AN.push(2 * (n % 2 ? -1 : 1) * Math.pow(Q, (n + 0.5) * (n + 0.5)));
    KK.push(2 * n + 1);
}
const sin = Math.sin, cos = Math.cos;
type C = { re: number; im: number };
const cc = (re: number, im = 0): C => ({ re, im });
const cadd = (a: C, b: C): C => cc(a.re + b.re, a.im + b.im);
const csub = (a: C, b: C): C => cc(a.re - b.re, a.im - b.im);
const cmul = (a: C, b: C): C => cc(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a: C, b: C): C => { const d = b.re * b.re + b.im * b.im; return cc((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cscl = (a: C, s: number): C => cc(a.re * s, a.im * s);
const cabs = (a: C) => Math.hypot(a.re, a.im);
function sinC(z: C): C { return cc(sin(z.re) * Math.cosh(z.im), cos(z.re) * Math.sinh(z.im)); }
function cosC(z: C): C { return cc(cos(z.re) * Math.cosh(z.im), -sin(z.re) * Math.sinh(z.im)); }
function th1(z: C, d: number): C {
    let s = cc(0, 0);
    for (let n = 0; n < NTERMS; n++) {
        const k = KK[n];
        const arg = cc(k * z.re + (d * Math.PI) / 2, k * z.im);
        s = cadd(s, cscl(sinC(arg), AN[n] * Math.pow(k, d)));
    }
    return s;
}
const PI = Math.PI;
function zeta(w: C): C {
    const zt = cscl(w, PI);
    return cadd(cscl(w, PI), cscl(cdiv(th1(zt, 1), th1(zt, 0)), PI));
}
function wp(w: C): C {
    const zt = cscl(w, PI);
    const t0 = th1(zt, 0), t1 = th1(zt, 1), t2 = th1(zt, 2);
    return csub(cscl(cc(1, 0), -PI), cscl(cdiv(csub(cmul(t2, t0), cmul(t1, t1)), cmul(t0, t0)), PI * PI));
}
function wpd(w: C): C {
    const zt = cscl(w, PI);
    const t0 = th1(zt, 0), t1 = th1(zt, 1), t2 = th1(zt, 2), t3 = th1(zt, 3);
    const f = csub(cmul(t2, t0), cmul(t1, t1));
    const fp = csub(cmul(t3, t0), cmul(t1, t2));
    const g = cmul(t0, t0);
    const gp = cscl(cmul(t0, t1), 2);
    return cscl(cdiv(csub(cmul(fp, g), cmul(f, gp)), cmul(g, g)), -Math.pow(PI, 3));
}
const LGC = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function gammaC(z: number): number {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaC(1 - z));
    z -= 1; let x = LGC[0];
    for (let i = 1; i < 9; i++) x += LGC[i] / (z + i);
    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
const G2 = Math.pow(gammaC(0.25), 8) / (16 * PI * PI);
const SQG2 = Math.sqrt(G2);
function Xuvw(w: C): { x: number; y: number; z: number } {
    const p = wp(w), pd = wpd(w), zt = zeta(w);
    const qterm = cmul(cc(PI), cdiv(p, pd));
    const A = csub(cscl(zt, 0.5), qterm);
    const B = cadd(cscl(zt, 0.5), qterm);
    const denom = cadd(cc(0.5), cdiv(p, cc(SQG2)));
    const dm = cabs(denom);
    const cosArg = denom.re / dm;
    const modDiff = Math.sqrt(1 / (dm * dm) - 2 * cosArg / dm + 1);
    return { x: (PI * w.re) / 2 - A.re, y: (PI * w.im) / 2 + B.im, z: Math.sqrt(PI / 8) * Math.log(modDiff) };
}

// ---- in-file math spot-laws (probe is the committed 13/13 gate; these guard edits) ------------------
{
    if (Math.abs(gammaC(0.25) - 3.625609908221908) > 1e-9) throw Error("gamma(1/4) drifted");
    if (cabs(csub(wp(cc(0.5, 0)), cc(SQG2 / 2))) > 1e-9) throw Error("wp(w1) != +sqrt(g2)/2 — machinery broken");
    const q1 = csub(zeta(cadd(cc(0.3, 0.4), cc(1, 0))), zeta(cc(0.3, 0.4)));
    if (cabs(csub(q1, cc(PI))) > 1e-9) throw Error("zeta quasi-period broken");
    // LATTICE-INVARIANCE LAW (the trimmed-grid gluing depends on it): X(w+m+ni) == X(w)
    for (const [um, vn] of [[1, 0], [0, 1], [1, 1], [-1, 2]] as Array<[number, number]>) {
        const w = cc(0.3, 0.42), wt = cadd(w, cc(um, vn));
        const A = Xuvw(w), Bt = Xuvw(wt);
        if (Math.hypot(A.x - Bt.x, A.y - Bt.y, A.z - Bt.z) > 1e-9) throw Error(`X not lattice-invariant at shift (${um},${vn})`);
    }
    // orientation law (C7 truth): skirt flat at z=0; w1-class down, w3-class up
    const sk = Xuvw(cc(0.04, 0.04)), t1 = Xuvw(cc(0.5, 0.04)), t3 = Xuvw(cc(0.04, 0.5));
    if (Math.abs(sk.z) > 1e-6) throw Error(`skirt not flat: z=${sk.z}`);
    if (!(t1.z < -2 && t3.z > 2)) throw Error(`trumpet orientation flipped: w1 z=${t1.z} w3 z=${t3.z}`);
    console.log("costa math spot-laws OK (gamma, wp half-period, zeta quasi-period, X lattice-invariance x4, skirt-flat, trumpet signs)");
}

// ---- constants -------------------------------------------------------------------------------------
const R_CUT = 2.85;                 // image-space cut cylinder for ALL THREE ends
const K = 1.46 / R_CUT;             // world scale: every rim lands at exactly 1.46m radius
const N = 180;                      // domain grid (trimmed)
const SNAP_IMG = 0.02;              // image-space snap radius (see SNAP LAW)
const PLR = 1.58;                   // stone drum plinth radius (rim 1.46 floats inside it)
const EMBED = 0.05;                 // down-mouth deepest rim point sits this deep under drum top
const HEM_R = 0.035;                // skirt brim brass hem tube radius
const DOME_H = 0.30;                // up-mouth brass dome rise (span ~2.9 -> shallow)
const BEAD_R = 0.11;
const WRIM = K * R_CUT;             // 1.46 exactly

// ---- grid values + IN/OUT ---------------------------------------------------------------------------
const rXY = (X: { x: number; y: number }) => Math.hypot(X.x, X.y);
const gval: { X: { x: number; y: number; z: number }; r: number }[] = new Array(N * N);
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const X = Xuvw(cc(i / N, j / N));
    gval[j * N + i] = { X, r: rXY(X) };
}
const isIN = (i: number, j: number) => gval[((j + N) % N) * N + ((i + N) % N)].r < R_CUT;

// on-level vertex per crossing edge (memoized). Edge H(i,j): (i,j)->(i+1,j) unwrapped
// +u; edge V(i,j): (i,j)->(i,j+1) unwrapped +v. Bisection on the exact level.
const hEdge = new Map<number, number>(), vEdge = new Map<number, number>();
const posArr: number[] = [], uvArr: number[] = [];          // FILM verts, IMAGE space + fz (z stored)
const fzArr: number[] = [];
const gidx = (i: number, j: number) => ((j + N) % N) * N + ((i + N) % N);   // grid vert index (0..N^2-1)
const emitv = (X: { x: number; y: number; z: number }, u: number, v: number): number => {
    posArr.push(X.x, X.y, X.z); fzArr.push(X.z); uvArr.push(u, v);
    return posArr.length / 3 - 1;
};
// grid verts emitted first, in index order (construction lock for the decoder)
{
    for (let k = 0; k < N * N; k++) { const g = gval[k]; emitv(g.X, (k % N) / N, Math.floor(k / N) / N); }
    // sanity: gidx() must agree with the emission order
    if (gidx(3, 5) !== 5 * N + 3) throw Error("gidx/emission order mismatch");
}
function bisectLevel(w0: C, w1: C): { X: { x: number; y: number; z: number }; t: number } {
    // DIRECTION LAW (rim-radius defect class): the case table queries each edge
    // from BOTH sides (IN->OUT and OUT->IN, e.g. the ia&&ic diagonal asks eBC()
    // with b=OUT, c=IN). An unoriented bisection silently converges to the OUT
    // endpoint and emits it as a rim vert (r=3.16 on the trumpet). Orient here,
    // always return t in the w0->w1 parameterization.
    const r0 = rXY(Xuvw(w0)), r1 = rXY(Xuvw(w1));
    if (r0 >= R_CUT && r1 >= R_CUT) throw Error("bisectLevel: no crossing (both OUT)");
    if (r0 < R_CUT && r1 < R_CUT) throw Error("bisectLevel: no crossing (both IN)");
    const fwd = r0 < R_CUT;                        // IN at w0 -> level crossed going out
    let lo = 0, hi = 1;
    for (let it = 0; it < 48; it++) {
        const tm = (lo + hi) / 2;
        const X = Xuvw(cadd(w0, cscl(csub(w1, w0), tm)));
        const inside = rXY(X) < R_CUT;
        if (inside === fwd) lo = tm; else hi = tm;
    }
    const t = (lo + hi) / 2;
    return { X: Xuvw(cadd(w0, cscl(csub(w1, w0), t))), t };
}
const getH = (i: number, j: number): number => {
    const key = ((j + N) % N) * N + ((i + N) % N);
    let v = hEdge.get(key);
    if (v === undefined) {
        const i0 = ((i + N) % N), j0 = ((j + N) % N);
        const w0 = cc(i0 / N, j0 / N), w1 = cc(i0 / N + 1 / N, j0 / N);   // unwrapped +u (crosses u=1 fine: X invariant)
        const { X, t } = bisectLevel(w0, w1);
        // SNAP LAW (chi=-6 defect class, IMAGE-space): a crossing landing within
        // SNAP_IMG of a grid endpoint merges INTO that endpoint. Parameter-space
        // eps is the wrong control — near the ends dz/dt explodes logarithmically
        // and a 1.7e-4 domain shift yanks the rim vert 0.3 image units off the
        // cut cylinder. 0.02 image (~1cm world) still engulfs every ghost sliver
        // (they are ~1e-3 image wide) while keeping legit crossings exact.
        const X0 = Xuvw(w0), X1 = Xuvw(w1);
        const d0 = Math.hypot(X.x - X0.x, X.y - X0.y, X.z - X0.z);
        const d1 = Math.hypot(X.x - X1.x, X.y - X1.y, X.z - X1.z);
        if (d0 < SNAP_IMG) { v = gidx(i, j); }
        else if (d1 < SNAP_IMG) { v = gidx(i + 1, j); }
        else { v = emitv(X, i0 / N + t / N, j0 / N); }
        hEdge.set(key, v);
    }
    return v;
};
const getV = (i: number, j: number): number => {
    const key = ((j + N) % N) * N + ((i + N) % N);
    let v = vEdge.get(key);
    if (v === undefined) {
        const i0 = ((i + N) % N), j0 = ((j + N) % N);
        const w0 = cc(i0 / N, j0 / N), w1 = cc(i0 / N, j0 / N + 1 / N);   // unwrapped +v
        const { X, t } = bisectLevel(w0, w1);
        const X0 = Xuvw(w0), X1 = Xuvw(w1);
        const d0 = Math.hypot(X.x - X0.x, X.y - X0.y, X.z - X0.z);
        const d1 = Math.hypot(X.x - X1.x, X.y - X1.y, X.z - X1.z);
        if (d0 < SNAP_IMG) { v = gidx(i, j); }
        else if (d1 < SNAP_IMG) { v = gidx(i, j + 1); }
        else { v = emitv(X, i0 / N, j0 / N + t / N); }
        vEdge.set(key, v);
    }
    return v;
};

// ---- marching triangles ------------------------------------------------------------------------------
const idx: number[] = [];
{
    const tri = (a: number, b: number, c: number) => {
        if (a === b || b === c || a === c) return;          // exact duplicate verts only —
        const ax = posArr[3 * a], ay = posArr[3 * a + 1], az = posArr[3 * a + 2];   // an area threshold
        const bx = posArr[3 * b], by = posArr[3 * b + 1], bz = posArr[3 * b + 2];   // silently dropped a
        const cx = posArr[3 * c], cy = posArr[3 * c + 1], cz = posArr[3 * c + 2];   // real sliver and cut a
        const e1 = [bx - ax, by - ay, bz - az], e2 = [cx - ax, cy - ay, cz - az];   // 3-vert pinhole
        const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        if (cr[0] === 0 && cr[1] === 0 && cr[2] === 0) return;                     // exactly collinear
        idx.push(a, b, c);
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const a = gidx(i, j), b = gidx(i + 1, j), c = gidx(i + 1, j + 1), d = gidx(i, j + 1);
        const ia = isIN(i, j), ib = isIN(i + 1, j), ic = isIN(i + 1, j + 1), id = isIN(i, j + 1);
        const nin = (ia ? 1 : 0) + (ib ? 1 : 0) + (ic ? 1 : 0) + (id ? 1 : 0);
        if (nin === 0) continue;
        // crossing edges, resolved lazily only when a case needs them
        const eAB = () => getH(i, j), eBC = () => getV(i + 1, j), eCD = () => getH(i, j + 1), eDA = () => getV(i, j);
        if (nin === 4) { tri(a, b, c); tri(a, c, d); continue; }
        if (nin === 3) {
            // pentagon decompositions, cyclic (CCW) order; ONLY the two crossing
            // edges adjacent to the OUT corner exist — the first draft's !ia/!id
            // cases referenced nonexistent crossing verts (topology law caught it)
            if (!id) { const cd = eCD(), da = eDA(); tri(a, b, c); tri(a, c, cd); tri(a, cd, da); }
            else if (!ia) { const da = eDA(), ab = eAB(); tri(b, c, d); tri(b, d, da); tri(b, da, ab); }
            else if (!ib) { const ab = eAB(), bc = eBC(); tri(c, d, a); tri(c, a, ab); tri(c, ab, bc); }
            else { const bc = eBC(), cd = eCD(); tri(d, a, b); tri(d, b, bc); tri(d, bc, cd); }
            continue;
        }
        if (nin === 2) {
            if (ia && ib) { const bc = eBC(), da = eDA(); tri(a, b, bc); tri(a, bc, da); }
            else if (ib && ic) { const ab = eAB(), cd = eCD(); tri(b, c, cd); tri(b, cd, ab); }
            else if (ic && id) { const bc = eBC(), da = eDA(); tri(d, c, bc); tri(d, bc, da); }
            else if (id && ia) { const ab = eAB(), cd = eCD(); tri(a, d, cd); tri(a, cd, ab); }
            else if (ia && ic) { const ab = eAB(), da = eDA(), cd = eCD(), bc = eBC(); tri(a, ab, da); tri(c, cd, bc); }
            else { const ab = eAB(), bc = eBC(), cd = eCD(), da = eDA(); tri(b, bc, ab); tri(d, da, cd); }
            continue;
        }
        // nin === 1
        if (ia) { const ab = eAB(), da = eDA(); tri(a, ab, da); }
        else if (ib) { const ab = eAB(), bc = eBC(); tri(b, bc, ab); }
        else if (ic) { const bc = eBC(), cd = eCD(); tri(c, cd, bc); }
        else { const cd = eCD(), da = eDA(); tri(d, da, cd); }
    }
}

// ---- topology law: every interior edge exactly 2 faces; exactly 3 closed boundary loops; chi = -3 ----
type Loop = { verts: number[] };
const loops: Loop[] = [];
{
    const ecount = new Map<string, number>();
    for (let f = 0; f < idx.length; f += 3) {
        const es: [number, number][] = [[idx[f], idx[f + 1]], [idx[f + 1], idx[f + 2]], [idx[f + 2], idx[f]]];
        for (const [u, v] of es) {
            const k = u < v ? `${u}_${v}` : `${v}_${u}`;
            ecount.set(k, (ecount.get(k) ?? 0) + 1);
        }
    }
    let badEdges = 0, boundaryEdges = 0;
    const bndVerts = new Map<number, number[]>();      // vert -> boundary edge list
    for (const [k, c] of ecount) {
        if (c === 2) continue;
        if (c > 2) { badEdges++; continue; }
        boundaryEdges++;
        const [u, v] = k.split("_").map(Number);
        (bndVerts.get(u) ?? bndVerts.set(u, []).get(u)!).push(v);
        (bndVerts.get(v) ?? bndVerts.set(v, []).get(v)!).push(u);
    }
    if (badEdges) throw Error(`${badEdges} edges with >2 faces`);    // walk loops
    const visitedEdge = new Set<string>();
    const ek = (u: number, v: number) => (u < v ? `${u}_${v}` : `${v}_${u}`);
    let startVerts = [...bndVerts.keys()];
    startVerts.sort((x, y) => x - y);                    // deterministic walk order
    for (const s of startVerts) {
        for (const first of bndVerts.get(s) ?? []) {
            if (visitedEdge.has(ek(s, first))) continue;
            const loop: number[] = [s];
            let prev = s, cur = first;
            while (true) {
                visitedEdge.add(ek(prev, cur));
                loop.push(cur);
                const nxt = (bndVerts.get(cur) ?? []).find((n) => n !== prev && !visitedEdge.has(ek(cur, n)));
                if (nxt === undefined) {
                    // closed only if we can step back to start through an unvisited edge
                    const back = (bndVerts.get(cur) ?? []).some((n) => n === s && !visitedEdge.has(ek(cur, n)));
                    if (back) { visitedEdge.add(ek(cur, s)); loop.push(s); }
                    break;
                }
                prev = cur; cur = nxt;
            }
            if (loop[0] !== loop[loop.length - 1]) throw Error(`boundary walk did not close (len ${loop.length})`);
            loops.push({ verts: loop.slice(0, -1) });
        }
    }
    const V = posArr.length / 3, E = ecount.size, F = idx.length / 3;
    // COMPACT LAW (chi=-6 defect class): every emitted vert must be used by the
    // index — marching cells emit grid verts wholesale, so OUT verts would sit
    // dead in the buffer (and corrupt the Euler count). Compact before counting.
    const used = new Set<number>(); for (const v of idx) used.add(v);
    const remap = new Int32Array(V).fill(-1);
    let nv = 0;
    for (let v = 0; v < V; v++) if (used.has(v)) { remap[v] = nv; nv++; }
    const newIdx = new Array<number>(idx.length);
    for (let f = 0; f < idx.length; f++) newIdx[f] = remap[idx[f]];
    for (let v = 0, w = 0; v < V; v++) if (used.has(v)) {
        posArr[3 * w] = posArr[3 * v]; posArr[3 * w + 1] = posArr[3 * v + 1]; posArr[3 * w + 2] = posArr[3 * v + 2];
        fzArr[w] = fzArr[v]; uvArr[2 * w] = uvArr[2 * v]; uvArr[2 * w + 1] = uvArr[2 * v + 1];
        w++;
    }
    posArr.length = 3 * nv; uvArr.length = 2 * nv; fzArr.length = nv;
    for (let f = 0; f < idx.length; f++) idx[f] = newIdx[f];
    // remap loop vert lists (loops were walked over the pre-compact indices)
    for (const l of loops) for (let q = 0; q < l.verts.length; q++) l.verts[q] = remap[l.verts[q]];
    const chi = nv - E + F;
    if (loops.length !== 3) {
        const mfz = loops.map((l) => l.verts.reduce((s, v) => s + fzArr[v], 0) / l.verts.length);
        throw Error(`boundary loops ${loops.length} != 3 (torus minus 3 discs) — lengths ${loops.map((l) => l.verts.length).join("/")} mean fz ${mfz.map((f) => f.toFixed(2)).join(",")}`);
    }
    if (chi !== -3) throw Error(`Euler characteristic ${chi} != -3 (torus minus 3 discs) — V=${nv} E=${E} F=${F}`);
    console.log(`topology law OK: V=${nv} E=${E} F=${F} chi=${chi}, boundary edges ${boundaryEdges}, 3 closed loops (lengths ${loops.map((l) => l.verts.length).join("/")})`);
}

// ---- loop classification + world map ----------------------------------------------------------------
// classify by mean fz: lowest = DOWN (embed), highest = UP (dome), middle = SKIRT (hem)
const meanFz = (l: Loop) => l.verts.reduce((s, v) => s + fzArr[v], 0) / l.verts.length;
const sorted = [...loops].sort((p, q) => meanFz(p) - meanFz(q));
const downLoop = sorted[0], skirtLoop = sorted[1], upLoop = sorted[2];
{
    const fzD = downLoop.verts.map((v) => fzArr[v]), fzU = upLoop.verts.map((v) => fzArr[v]), fzS = skirtLoop.verts.map((v) => fzArr[v]);
    const mm = (a: number[]) => [Math.min(...a), Math.max(...a)];
    const [dMin, dMax] = mm(fzD), [uMin, uMax] = mm(fzU), [sMin, sMax] = mm(fzS);
    if (!(dMax < sMin - 0.3 && sMax < uMin - 0.3)) throw Error(`loop fz classes overlap: down[${dMin.toFixed(2)},${dMax.toFixed(2)}] skirt[${sMin.toFixed(2)},${sMax.toFixed(2)}] up[${uMin.toFixed(2)},${uMax.toFixed(2)}]`);
    if (downLoop.verts.length < 40 || skirtLoop.verts.length < 40 || upLoop.verts.length < 40)
        throw Error(`loop too thin: ${downLoop.verts.length}/${skirtLoop.verts.length}/${upLoop.verts.length}`);
    (globalThis as any).__fz = { dMin, dMax, uMin, uMax, sMin, sMax };
    console.log(`loops: down[${dMin.toFixed(3)},${dMax.toFixed(3)}] n=${downLoop.verts.length}  skirt[${sMin.toFixed(3)},${sMax.toFixed(3)}] n=${skirtLoop.verts.length}  up[${uMin.toFixed(3)},${uMax.toFixed(3)}] n=${upLoop.verts.length}`);
}
// rim-radius law (image space): EXACT crossing verts on the cut cylinder to
// bisection precision; SNAPPED verts (merged into grid endpoints by the
// SNAP LAW to kill ghost slivers) within SNAP_IMG. Two-tier, honest.
{
    let worstExact = 0, worstSnap = 0, nSnap = 0, worstV = -1;
    const gridish = (u: number, v: number) => Math.abs(u * N - Math.round(u * N)) < 1e-9 && Math.abs(v * N - Math.round(v * N)) < 1e-9;
    for (const l of loops) for (const v of l.verts) {
        const d = Math.abs(Math.hypot(posArr[3 * v], posArr[3 * v + 1]) - R_CUT);
        if (gridish(uvArr[2 * v], uvArr[2 * v + 1])) { worstSnap = Math.max(worstSnap, d); if (d > 0.005) nSnap++; }
        else if (d > worstExact) { worstExact = d; worstV = v; }
    }
    if (worstExact > 1e-6) {
        console.log(`RIM DIAG exact vert ${worstV} off ${worstExact.toExponential(2)}: uv (${uvArr[2 * worstV].toFixed(4)},${uvArr[2 * worstV + 1].toFixed(4)})`);
        throw Error(`rim radius law: exact vert off cylinder ${worstExact.toExponential(2)}`);
    }
    if (worstSnap > SNAP_IMG + 1e-9) throw Error(`rim radius law: snapped vert off ${worstSnap.toExponential(2)} > SNAP_IMG ${SNAP_IMG}`);
    console.log(`rim radius law OK: exact verts on r=${R_CUT} (worst ${worstExact.toExponential(1)}), ${nSnap} snapped verts within ${SNAP_IMG} (worst ${worstSnap.toFixed(4)})`);
}
// plinth height + Y0 from the DOWN loop (whole rim embeds under the drum top)
const fz = (globalThis as any).__fz as { dMin: number; dMax: number; uMin: number; uMax: number; sMin: number; sMax: number };
const PLH = K * (fz.dMax - fz.dMin) + EMBED + 0.03;
if (PLH < 0.08 || PLH > 0.5) throw Error(`plinth height ${PLH.toFixed(3)} outside [0.08, 0.5]`);
const Y0 = PLH - 0.012 - K * fz.dMax;                  // rim max lands 12mm under drum top
{
    const skirtClear = Y0 + K * fz.sMin - PLH;
    if (skirtClear < 0.8) throw Error(`skirt clearance ${skirtClear.toFixed(3)} < 0.8`);
    console.log(`world map: K ${K.toFixed(6)} PLH ${PLH.toFixed(3)} Y0 ${Y0.toFixed(3)}; skirt clears drum by ${skirtClear.toFixed(2)}m; down rim embeds [${(Y0 + K * fz.dMin).toFixed(3)}, ${(Y0 + K * fz.dMax).toFixed(3)}] under top ${PLH.toFixed(3)}`);
}
const toWorld = (i: number): THREE.Vector3 => new THREE.Vector3(K * posArr[3 * i], K * fzArr[i] + Y0, K * posArr[3 * i + 1]);

// ---- scene --------------------------------------------------------------------------------------------
const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
const boneTex = texMat("cs_bone", [0xd8d2c4, 0xcfc8b8, 0xbfb8a8], { rough: 0.9, scale: 2, weights: [3, 1, 1], seed: 9661 });
boneTex.side = THREE.DoubleSide;      // interior visible through the geometry (boy film law)
(boneTex as any).userData = { ...(boneTex as any).userData, texName: "cs_bone", glTFDoubleSide: true }; // glbwrite v3.4 lane
// struct-167 material cure: v1 used the tensegrity-v6 lane (metal 0.9) —
// with no env map the diffuse term is killed and the dome rendered near-black
// (#211d15) / hem dark-olive at 18m (fallback-judged FAIL, corroborated at
// source + enneper same-rig control: its metal-0 brass reads #a8823f gold).
// v6 is banked behind Bill's eye-gate (never hero-ready); the PROVEN accepted
// lane is enneper ep_brass (struct-141 native PASS). Adopted verbatim below.
const brassTex = texMat("cs_brass", [0xa8823f, 0x9c7838, 0xb28c46], { rough: 0.42, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9662 });
const stoneTex = texMat("cs_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9663 });

// film (image-space geometry -> world; mergekit computes normals when absent)
{
    const wpos = new Float32Array(posArr.length);
    for (let i = 0; i < posArr.length / 3; i++) {
        const p = toWorld(i);
        wpos[3 * i] = p.x; wpos[3 * i + 1] = p.y; wpos[3 * i + 2] = p.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2));
    geo.setIndex(idx);
    g.add(new THREE.Mesh(geo, boneTex));
}

// skirt brim hem: brass tube along the skirt rim loop (closed), + end caps are not needed (closed loop)
{
    const pts = skirtLoop.verts.map(toWorld);
    const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(64, pts.length), HEM_R, 8, true), brassTex));
}

// up-mouth brass dome: base ring = exact rim loop, single apex (closes the see-through class)
let apexY = 0;
{
    const ring = upLoop.verts.map(toWorld);
    let ybar = 0; for (const p of ring) ybar += p.y; ybar /= ring.length;
    const ALPHAS = [1, 0.78, 0.58, 0.40, 0.24, 0.11];
    const pos: number[] = [], uv: number[] = [], didx: number[] = [];
    const ringIdx: number[][] = [];
    for (const al of ALPHAS) {
        const row: number[] = [];
        for (const p of ring) {
            pos.push(al * p.x, ybar + (1 - al * al) * DOME_H + (p.y - ybar) * al, al * p.z);
            uv.push(0, 0);
            row.push(pos.length / 3 - 1);
        }
        ringIdx.push(row);
    }
    pos.push(0, ybar + DOME_H, 0); uv.push(0, 0);
    const apex = pos.length / 3 - 1;
    apexY = ybar + DOME_H;
    const nR = ringIdx[0].length;
    for (let a = 0; a < ringIdx.length - 1; a++) {
        const r0 = ringIdx[a], r1r = ringIdx[a + 1];
        for (let i = 0; i < nR; i++) {
            didx.push(r0[i], r0[(i + 1) % nR], r1r[(i + 1) % nR]);
            didx.push(r0[i], r1r[(i + 1) % nR], r1r[i]);
        }
    }
    const last = ringIdx[ringIdx.length - 1];
    for (let i = 0; i < nR; i++) didx.push(last[i], last[(i + 1) % nR], apex);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(didx);
    g.add(new THREE.Mesh(geo, brassTex));
}

// stone drum plinth (the down trumpet grows out of it)
{
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(PLR, PLR, PLH, 48), stoneTex);
    plinth.position.set(0, PLH / 2, 0);
    g.add(plinth);
}

// the one glow KEEP: bead seated at the dome apex (dusk lineage)
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;   // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, apexY + BEAD_R * 0.45, 0);   // mostly sunken into the apex — seated, not pasted
    bead.name = "glow_cs_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- census + envelope/NaN laws (measured-truth pinning) ----------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - 2 * PLR) > 0.02 || Math.abs(sz.z - 2 * PLR) > 0.02)
        throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != plinth ${2 * PLR} (film must stay inside PLR)`);
    if (sz.y < 2.5 || sz.y > 4.2) throw Error(`height ${sz.y.toFixed(2)} outside [2.5, 4.2]`);
    // film world radius law: film verts bounded by the cut cylinder + snap slack
    // (SNAP verts may sit up to SNAP_IMG image units outside; still inside PLR)
    let maxFilmR = 0;
    for (let i = 0; i < posArr.length / 3; i++) maxFilmR = Math.max(maxFilmR, Math.hypot(K * posArr[3 * i], K * posArr[3 * i + 1]));
    if (maxFilmR > WRIM + SNAP_IMG * K + 1e-9) throw Error(`film world radius ${maxFilmR.toFixed(4)} > ${(WRIM + SNAP_IMG * K).toFixed(4)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const p = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < p.count; i++) if ([p.getX(i), p.getY(i), p.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[0..${env.max.y.toFixed(3)}], film max r ${maxFilmR.toFixed(4)}, 1 glow KEEP (glow_cs_1), apex ${apexY.toFixed(3)}`);
}

const merged = mergeByMaterial(g, "costa");
writeFileSync("agents/arthur/assets/village_costa3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_costa3.glb`);
