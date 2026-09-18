// struct221-probe-rupertfork.ts — STRUCTURES LANE struct-221, R11-36 RUPERT'S FORK
// (committed carry from struct-220's verdict: "the carved cube carrying two pillars of
// itself, the EQUAL solid cube caught mid-pass between them".)
//
// THE FORM (v5 BUILT + REJECTED this tick; v6 commission recorded below — the ARC:
//   three falsified iterations, every rejection caught BEFORE placement):
//   v3 (tilted, nose-out 35%) REJECTED — corner-stance crest towers (L1 ≥ L2 law).
//   v4 (FACE STANCE, exact identity fit s = DOOR−4mm, decode corner-match 0.00000)
//   REJECTED — "passer indistinguishable from the wall (same texture, flush)".
//   v5 (IRON passer + FLANK LAW station, decode ALL PASS 15/15) REJECTED from BOTH
//   the world-frame and the bore vantage — and the bore rejection is GEOMETRIC, not
//   cosmetic: from down-the-bore the passer's projected half-width (2.33m at ~10m)
//   EXCEEDS the fins' outer-edge projection (3.18m at ~14m) — the bigger cube
//   occludes both fins at the walker's own vantage. THE CONVERGED ROOT CAUSE (5
//   judge rounds): the door-width/fins-width tension is INTRINSIC to s > S through
//   a cube at the diagonal bore — a 1.03×S door leaves 0.85m fins, and ANY bigger-
//   than-wall passer covers them from most angles; smaller doors widen the fins but
//   shrink the bigger-than-wall margin toward zero. The two judge asks (visible fork
//   + visible bigger cube) fight each other THROUGH the door size at fixed wall
//   proportions. Material separation (v5, kept) solves figure-ground; it cannot
//   solve occlusion.
//
// V6 COMMISSION (next build tick — a proportion redesign, not a patch): the wall
//   becomes a DEEPER square-section prism (S×S×L, L ≈ 1.6–2.0×S along the bore —
//   the sandwich/interval pass-proof is cross-section-based, length-agnostic, so
//   the pass stays machine-true): the mouth becomes a real PORTAL with a dark
//   throat (the depth read every judge asked for), the fins gain depth-mass and
//   read from oblique angles at natural weight, and the door band is RE-CARVE-
//   MAPPED for the wider-prong family (target fin width ≥ 1.2m) with the passer
//   IRON at 1.02–1.03×S caught at the throat's thirdpoint. Nose-out, flank law,
//   bed course, door-frame pads, beads, and the iron lane all carry forward. The
//   monument's claim is stated honestly: a cube bigger than the wall's FACE passes
//   through the wall — verified by the same interval law (region + kept-cell).
//
// STRUCT-221 CORRECTIONS OF RECORD (probe law 0c spirit):
//   1. struct-220's "max section 1.250324649719 at n=(−0.2961,0.4688,−0.8322)" is
//      FALSIFIED — at that axis the section is a quadrilateral, max square 1.0107,
//      no hull-vertex square exists; its edge-quadruple search accepted a non-planar
//      quadrilateral. TRUE max square SECTION of a cube = 3√2/4 = 1.060660 (classic;
//      re-derived fresh here, agreeing to 5e-4).
//   2. struct-220's "at the max-section frame the remainder is TWO components" died
//      with the fake axis: the TRUE max-section axes QUARTER (4 comps, carve-mapped).
//      The fork lives at the DIAGONAL axis instead (carve-mapped: 6 axes × 6 doors).
//   3. The classic 3√2/4 is the size of the PASSING cube at the classic pose (Speer
//      1994 bound lineage), not of a section; at the diagonal bore the door prism
//      exceeds every section of the cube — which is exactly why the passer is BIGGER
//      than the wall here (1.0576× measured this tick at the classic door).
//
// STONE-CLEARANCE LAW (door frame): raster cells are axis-aligned in the door frame;
// a kept cell has NO corner inside the door square, and for axis-aligned boxes
// overlap ⟺ a corner of one lies in the other — so kept stone NEVER overlaps the
// door prism, and the passer (shadow ⊆ door, region-verified) touches no stone.
//
// All solve+verify in ONE process (struct-220 bug law). RED-first.
//
// DISPOSITION (end of tick): v2 (sha c5e3f78b…) is probe+decode ALL PASS but was judged
// REJECT by the ZAI fallback on ALL THREE primary vantages (gameplay dead-front, dead-
// mouth, oblique-40°): the tilted passer's silhouette (6.56m tall vs the fins' 5.43m)
// dominates every framing — the fork gestalt does not form ("reads as a big tilted cube
// + a pillar"). v1 (classic door, sha 3b0316ec…) was rejected for sliver fins [120,120];
// v2 doubled them [240,240] and still fails on occlusion. The judges' converged fix list
// for the NEXT build iteration (v3): (a) NOSE-OUT station — emergence ~35% (T_ST ≈
// T_HI − 0.3·tHalf) so the fins frame the composition and the passer reads as caught
// just emerging between them, not towering past them; (b) reopen a sky-gap sliver on at
// least one flank; (c) consider the entry-mouth presentation (passer deep in the throat
// as the plug). NOT PLACED — never place a rejected form. The floor-ride law holds at
// every t (the passer rides the bore axis at constant WALL_CY), so the station dial is
// free for v3.
type V3 = [number, number, number];
type P2 = [number, number];
const dot3 = (a: V3, b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3 = (a: V3, b: V3): V3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0]/l, a[1]/l, a[2]/l]; };
type M3 = [V3, V3, V3];
const rotAxis = (ax: V3, t: number): M3 => { const c = Math.cos(t), s = Math.sin(t), C = 1-c;
    return [[c+ax[0]*ax[0]*C, ax[0]*ax[1]*C-ax[2]*s, ax[0]*ax[2]*C+ax[1]*s],
            [ax[1]*ax[0]*C+ax[2]*s, c+ax[1]*ax[1]*C, ax[1]*ax[2]*C-ax[0]*s],
            [ax[2]*ax[0]*C-ax[1]*s, ax[2]*ax[1]*C+ax[0]*s, c+ax[2]*ax[2]*C]]; };
const RXf = (t: number): M3 => [[1,0,0],[0,Math.cos(t),-Math.sin(t)],[0,Math.sin(t),Math.cos(t)]];
const RYf = (t: number): M3 => [[Math.cos(t),0,Math.sin(t)],[0,1,0],[-Math.sin(t),0,Math.cos(t)]];
const applyM = (M: M3, v: V3): V3 => [dot3(M[0],v), dot3(M[1],v), dot3(M[2],v)];
const mulM = (A: M3, B: M3): M3 => { const o: M3 = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) o[i][j] = dot3(A[i], [B[0][j],B[1][j],B[2][j]]); return o; };
const hull2 = (pts: P2[]): P2[] => {
    const p2 = [...pts].sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
    const cr = (o:P2, x:P2, y:P2) => (x[0]-o[0])*(y[1]-o[1]) - (x[1]-o[1])*(y[0]-o[0]);
    const lo: P2[] = []; for (const p of p2) { while (lo.length>=2 && cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
    const up: P2[] = []; for (let i = p2.length-1; i>=0; i--) { const p = p2[i]; while (up.length>=2 && cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    return [...lo.slice(0,-1), ...up.slice(0,-1)];
};
const inPoly = (poly: P2[], p: P2): boolean => {
    let inside = false;
    for (let i = 0, j = poly.length-1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj-xi)*(p[1]-yi)/(yj-yi) + xi) inside = !inside;
    }
    return inside;
};

// ---- constants (frame + door first; heights resolve after the pose is known) -------------------------------
export const S = 4.5;                       // the WALL cube's side
export const CLASSIC = 3*Math.SQRT2/4;      // the classic constant (cross-check target)
// THE DOOR (ZAI-judged recomposition, this tick): the classic door's remainder fins are
// [120,120]-cell slivers (0.36m thick, lateral poke 0.11-0.65m past the passer's
// silhouette) — BOTH fallback judges rejected the mouth view ("reads as a single cube;
// the fork gestalt does not form"). The carve-map's wide-prong band [1.010..1.030]x
// gives [240,240]-cell fins (2x mass, 0.54m thick, full blade width visible past the
// passer's shadow). Door 1.03x: STILL BIGGER than the face, still non-section (no planar
// cut on this axis reaches it), and the passer stays BIGGER than the wall (~1.027x).
export const DOOR = 1.03 * S;               // the fork-band door
if (DOOR <= S) throw Error(`door ${DOOR} not bigger than the face — theorem surprise lost`);
export const NN: V3 = norm3([1, 0, 1]);     // the bore: horizontal diagonal; mouth at the (+x,+z) corner
export const UU: V3 = [0, 1, 0];            // door frame: vertical
export const VV: V3 = [-Math.SQRT1_2, 0, Math.SQRT1_2]; // door frame: horizontal diagonal
export const REVEAL = 0.012;                // passer bottom rides 12mm above grade
if (Math.abs(dot3(UU,VV)) > 1e-12 || Math.abs(dot3(UU,NN)) > 1e-12 || Math.abs(dot3(VV,NN)) > 1e-12) throw Error(`frame not orthonormal`);

// ---- S1: the max square section, derived fresh (cross-check vs classic) ------------------------------------
function sectionPoly(n: V3): { poly: P2[]; e1: V3; e2: V3 } {
    const t1: V3 = Math.abs(n[1]) < 0.9 ? [0,1,0] : [1,0,0];
    const e1 = norm3([t1[0]-dot3(t1,n)*n[0], t1[1]-dot3(t1,n)*n[1], t1[2]-dot3(t1,n)*n[2]]);
    const e2 = cross3(n, e1);
    const pts: P2[] = [];
    for (const ax of [0,1,2] as const) for (const a of [-0.5,0.5]) for (const b of [-0.5,0.5]) {
        const fixed: V3 = [0,0,0]; const others = [0,1,2].filter(x => x !== ax) as [number, number];
        fixed[others[0]] = a; fixed[others[1]] = b;
        const free = -(n[others[0]]*a + n[others[1]]*b) / n[ax];
        if (Math.abs(free) <= 0.5 + 1e-9) { const p: V3 = [...fixed]; p[ax] = free; pts.push([dot3(p,e1), dot3(p,e2)]); } // INCLUSIVE bounds (probe law 2)
    }
    return { poly: hull2(pts), e1, e2 };
}
function radial(poly: P2[], dx: number, dy: number): number {
    let best = Infinity;
    for (let i = 0, j = poly.length-1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        const ex = xj-xi, ey = yj-yi;
        const den = dx*ey - dy*ex;
        if (Math.abs(den) < 1e-14) continue;
        const t = (xi*dy - yi*dx) / den;
        const r = (xi*ey - yi*ex) / den;
        if (t >= -1e-12 && t <= 1+1e-12 && r > 1e-12 && r < best) best = r;
    }
    return best;
}
function centeredSquareSide(n: V3): number {
    const { poly } = sectionPoly(n);
    let best = 0;
    const ev = (th: number) => { const c = Math.cos(th), s = Math.sin(th); return Math.min(radial(poly, (c - s) / Math.SQRT2, (s + c) / Math.SQRT2), radial(poly, (c + s) / Math.SQRT2, (s - c) / Math.SQRT2)); };
    for (let k = 0; k < 360; k++) {
        const th = (k/360)*Math.PI/2;
        const side = Math.SQRT2 * ev(th);
        if (side > best) best = side;
    }
    let step = Math.PI/720, bth = 0;
    for (let it = 0; it < 40; it++) {
        let improved = false;
        for (const d of [1,-1]) {
            const th = bth + d*step;
            const side = Math.SQRT2 * ev(th);
            if (side > best + 1e-15) { best = side; bth = th; improved = true; }
        }
        if (!improved) step /= 2;
        if (step < 1e-7) break;
    }
    return best;
}
let MAXSEC_N: V3 = [0,0,1], MAXSEC_SIDE = 0;
{
    const deg = Math.PI/180;
    for (let pi = 0; pi <= 30; pi++) for (let ti = 1; ti <= 29; ti++) {
        const pol = ti*3*deg, az = pi*3*deg;
        const n: V3 = [Math.sin(pol)*Math.cos(az), Math.sin(pol)*Math.sin(az), Math.cos(pol)];
        const cs = centeredSquareSide(n);
        if (cs > MAXSEC_SIDE) { MAXSEC_SIDE = cs; MAXSEC_N = n; }
    }
    let step = 1.5*deg;
    for (let it = 0; it < 300; it++) {
        let improved = false;
        for (const ax of [[1,0,0],[0,1,0]] as V3[]) for (const d of [1,-1]) {
            const n2 = norm3(applyM(rotAxis(ax, d*step), MAXSEC_N));
            const cs = centeredSquareSide(n2);
            if (cs > MAXSEC_SIDE + 1e-14) { MAXSEC_SIDE = cs; MAXSEC_N = n2; improved = true; }
        }
        if (!improved) step /= 2;
        if (step < 1e-7) break;
    }
}
if (Math.abs(MAXSEC_SIDE - CLASSIC) > 5e-4) throw Error(`S1 fresh max-section ${MAXSEC_SIDE.toFixed(9)} != classic 3√2/4 — resolve before carving`);
export const MAX_SECTION = MAXSEC_SIDE; // == CLASSIC, fresh-verified

// ---- S2: the passer — the BIGGEST cube through the classic door, tilted pose (relative frame) ---------------
const wallShadowRel: P2[] = (() => { const q: P2[] = [];
    for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1]) {
        const p: V3 = [sx*S/2, sy*S/2, sz*S/2];
        q.push([dot3(p, UU), dot3(p, VV)]);
    } return hull2(q); })();
const doorHalf = DOOR / 2;
function passerShadow(R: M3, s: number): P2[] {
    const pts: P2[] = [];
    for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1]) {
        const c = applyM(R, [sx*s/2, sy*s/2, sz*s/2]);
        pts.push([dot3(c, UU), dot3(c, VV)]);
    }
    return hull2(pts);
}
function violationRel(R: M3, s: number): number {
    const Qp = passerShadow(R, s);
    let v = 0;
    const check = (p: P2) => { if (inPoly(wallShadowRel, p)) v = Math.max(v, Math.max(Math.abs(p[0]), Math.abs(p[1])) - doorHalf); };
    for (let i = 0; i < Qp.length; i++) {
        const A = Qp[i], B = Qp[(i+1)%Qp.length];
        for (let k = 0; k <= 60; k++) { const q = k/60; check([A[0]+q*(B[0]-A[0]), A[1]+q*(B[1]-A[1])]); }
        if (v > 0.05) return v;
    }
    for (let i = 0; i < wallShadowRel.length; i++) {
        const A = wallShadowRel[i], B = wallShadowRel[(i+1)%wallShadowRel.length];
        for (let k = 0; k <= 30; k++) { const q = k/30; const p: P2 = [A[0]+q*(B[0]-A[0]), A[1]+q*(B[1]-A[1])];
            if (inPoly(Qp, p)) v = Math.max(v, Math.max(Math.abs(p[0]), Math.abs(p[1])) - doorHalf); }
    }
    return v;
}
function poseSearch(s: number): { ok: boolean; a: number; b: number; g: number } {
    const deg = Math.PI/180;
    let best = { viol: Infinity, a: 0, b: 0, g: 0 };
    for (let ai = -15; ai <= 15; ai++) for (let bi = -15; bi <= 15; bi++) for (let gi = 0; gi < 16; gi++) {
        const R = mulM(rotAxis(NN, gi*11.25*deg), mulM(RYf(bi*6*deg), RXf(ai*6*deg)));
        const v = violationRel(R, s);
        if (v < best.viol) best = { viol: v, a: ai*6*deg, b: bi*6*deg, g: gi*11.25*deg };
        if (v <= 1e-6) return { ok: true, ...best };
    }
    let step = 2*deg;
    let cur = { ...best };
    const build = (a: number, b: number, g: number) => mulM(rotAxis(NN, g), mulM(RYf(b), RXf(a)));
    for (let it = 0; it < 300; it++) {
        let improved = false;
        for (const [da,db,dg] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const) {
            const a = cur.a+da*step, b = cur.b+db*step, g = cur.g+dg*step;
            const v = violationRel(build(a,b,g), s);
            if (v < cur.viol - 1e-12) { cur = { viol: v, a, b, g }; improved = true; }
            if (cur.viol <= 1e-6) return { ok: true, ...cur };
        }
        if (!improved) step /= 2;
        if (step < 1e-6) break;
    }
    return { ok: false, ...cur };
}
let PASS_S = 0, POSE = { a: 0, b: 0, g: 0 };
{
    let lo = 0.6*S, hi = 1.15*S;
    let flo = poseSearch(lo);
    if (!flo.ok) throw Error(`S2 base passer infeasible — regression`);
    for (let k = 0; k < 12; k++) {
        const mid = (lo+hi)/2;
        const f = poseSearch(mid);
        if (f.ok) { lo = mid; flo = f; } else hi = mid;
    }
    PASS_S = lo - 0.004; // 4mm honest margin off the searched bound
    POSE = { a: flo.a, b: flo.b, g: flo.g };
}
// ---- S2b (v4, struct-222): the FACE-STANCE pivot — the tilted stance is geometrically dead ----
// v2 (58% emerged) AND v3 (35% nose-out) were both REJECTED: the tilted passer stands on a
// CORNER, so its crest (WALL_CY + PASS_YHALF, PASS_YHALF = (s/2)·Σ|row| > s/2 for every
// non-identity rotation — L1 ≥ L2, face stance is the UNIQUE height minimizer) towers over
// the fin crowns at EVERY station: v3's nose-out still blanketed the fork ("only ONE blade
// visible; reads as a plank and a big cube"). No station fixes a stance problem.
// THE PIVOT: at this door the FACE stance fits at the SAME size (a square of side ≤ door
// passes a square door EXACTLY — the identity fit): PASS_S = DOOR − 4mm = 1.029×S, still
// BIGGER than the wall. The nose is a true square face parallel to the door plane (the
// strongest cube-identity read), its crest rides (PASS_S − S)/2 = 6.6cm ≈ 5px@18m over the
// fin crowns (a whisper, vs the tilted stance's 102cm blanket), and the fins' outer edges
// frame it from every azimuth. The tilted solve above is kept as the rejected-stance record.
const TILT_S = PASS_S, TILT_POSE_DEG = { a: POSE.a*180/Math.PI, b: POSE.b*180/Math.PI, g: POSE.g*180/Math.PI };
PASS_S = DOOR - 0.004;
POSE = { a: 0, b: 0, g: 0 }; // stance LABEL only — RP below is the door-frame basis, not an Euler product
export { PASS_S, POSE };
export const PASS_RATIO = PASS_S / S;
// RP = the door-frame basis as columns (local x→NN, y→UU, z→VV): proper rotation
// (det = NN·(UU×VV) = NN·NN = 1, asserted), nose face ⊥ NN, flat bottom ⊥ UU.
export const RP: M3 = [[NN[0], UU[0], VV[0]], [NN[1], UU[1], VV[1]], [NN[2], UU[2], VV[2]]];
{
    const det = dot3(NN, cross3(UU, VV));
    if (Math.abs(det - 1) > 1e-12) throw Error(`S2b frame basis improper (det ${det})`);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        if (Math.abs(dot3([RP[0][j], RP[1][j], RP[2][j]], [RP[0][(j+1)%3], RP[1][(j+1)%3], RP[2][(j+1)%3]])) > 1e-12) throw Error(`S2b frame not orthogonal`);
}
export const POSE_DEG = { a: 0, b: 0, g: 0 }; // FACE STANCE — axes aligned to the door frame
if (violationRel(RP, PASS_S) > 1e-6) throw Error(`S2b self-check: face-stance passer violates (square ⊆ door must fit EXACTLY)`);
if (PASS_S <= S) throw Error(`S2b the passer is NOT bigger than the wall (${PASS_S.toFixed(4)} vs ${S}) — the monument's claim fails; re-seat the design`);

// ---- heights resolve: the wall raised so the passer clears the grade ----------------------------------------
let EXT_Y = 0;
for (let j = 0; j < 3; j++) EXT_Y += Math.abs(RP[1][j]);
export const PASS_YHALF = (PASS_S/2) * EXT_Y;
export const WALL_CY = PASS_YHALF + REVEAL;    // passer center rides the bore line at WALL_CY -> bottom at REVEAL
export const PAD_H = WALL_CY - S/2;            // the raise: v4 bed course (the tilted stance needed 1.04m; the face-stance passer's flat bottom clears the floor intrinsically)
if (PAD_H < 0 || PAD_H > 1.2) throw Error(`pad height ${PAD_H.toFixed(3)} outside the bed-course band — pose regression`);
export const O_W: V3 = [0, WALL_CY, 0];
export const pOf = (u: number, v: number, t: number): V3 => [
    O_W[0] + u*UU[0] + v*VV[0] + t*NN[0],
    O_W[1] + u*UU[1] + v*VV[1] + t*NN[1],
    O_W[2] + u*UU[2] + v*VV[2] + t*NN[2]];
const invP = (p: V3): V3 => { const d: V3 = [p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]]; return [dot3(d,UU), dot3(d,VV), dot3(d,NN)]; };

// ---- S3: the carve — two fins --------------------------------------------------------------------------------
export const CELL = 0.18, LAYER = 0.24;
export type Box = { c: V3; s: [number, number, number] };
const inWallCube = (p: V3): boolean =>
    Math.abs(p[0]) <= S/2 + 1e-9 && Math.abs(p[1] - WALL_CY) <= S/2 + 1e-9 && Math.abs(p[2]) <= S/2 + 1e-9;
function carveComps(door: number, n: V3, UUc: V3, VVc: V3) {
    const pOfC = (u: number, v: number, t: number): V3 => [
        O_W[0] + u*UUc[0] + v*VVc[0] + t*n[0], O_W[1] + u*UUc[1] + v*VVc[1] + t*n[1], O_W[2] + u*UUc[2] + v*VVc[2] + t*n[2]];
    const shadExtU = (S/2) * (Math.abs(UUc[0]) + Math.abs(UUc[1]) + Math.abs(UUc[2]));
    const shadExtV = (S/2) * (Math.abs(VVc[0]) + Math.abs(VVc[1]) + Math.abs(VVc[2]));
    const tExt = (S/2) * (Math.abs(n[0]) + Math.abs(n[1]) + Math.abs(n[2]));
    const UV = Math.ceil((Math.max(shadExtU, shadExtV) + 0.2) * 10) / 10;
    const TR = Math.ceil((tExt + 0.2) * 10) / 10;
    const nU = Math.ceil((2*UV)/CELL), nL = Math.ceil((2*TR)/LAYER);
    const solid = new Set<string>();
    const cellMinY = new Map<string, number>();
    for (let li = 0; li < nL; li++) { const t = -TR + (li+0.5)*((2*TR)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UV + (vj+0.5)*((2*UV)/nU);
        for (let ui = 0; ui < nU; ui++) {
            const u = -UV + (ui+0.5)*((2*UV)/nU);
            const A = door/2;
            let cut = false;
            for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2])
                if (Math.max(Math.abs(u+du), Math.abs(v+dv)) <= A + 1e-9) cut = true;
            let inCube = true, minY = Infinity;
            for (const dt of [-LAYER/2, LAYER/2]) for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2]) {
                const p = pOfC(u+du, v+dv, t+dt);
                if (!inWallCube(p)) inCube = false;
                if (p[1] < minY) minY = p[1];
            }
            if (!cut && inCube) { solid.add(`${ui}|${vj}|${li}`); cellMinY.set(`${ui}|${vj}|${li}`, minY); }
        } } }
    const seen = new Set<string>(); const comps: { cells: string[] }[] = [];
    for (const st of solid) {
        if (seen.has(st)) continue;
        const cells: string[] = []; const stack = [st]; seen.add(st);
        while (stack.length) { const cur = stack.pop()!; cells.push(cur);
            const [a,b,c] = cur.split("|").map(Number);
            for (const [da,db,dc] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const) {
                const nb = `${a+da}|${b+db}|${c+dc}`;
                if (solid.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); } } }
        comps.push({ cells });
    }
    comps.sort((x,y)=>y.cells.length-x.cells.length);
    if (comps.reduce((s,c)=>s+c.cells.length,0) !== solid.size) throw Error(`S3 flood sizes != total (flood bug class)`);
    const grounded = comps.map(cp => cp.cells.some(k => (cellMinY.get(k) ?? Infinity) <= (WALL_CY - S/2) + LAYER/2 + 0.01));
    return { solid, comps, grounded, nU, nL, UV, TR };
}
const CARVE = carveComps(DOOR, NN, UU, VV);
export { CARVE };
if (CARVE.comps.length !== 2) throw Error(`S3 the fork FAILED: ${CARVE.comps.length} comps (${CARVE.comps.map(c=>c.cells.length).join(",")}) — committed-axis regression`);
if (!CARVE.grounded[0] || !CARVE.grounded[1]) throw Error(`S3 fin not grounded at the wall base: ${CARVE.grounded}`);
if (Math.abs(CARVE.comps[0].cells.length - CARVE.comps[1].cells.length) / CARVE.comps[0].cells.length > 0.05)
    throw Error(`S3 fins unequal: ${CARVE.comps.map(c=>c.cells.length).join(" / ")}`);
export const WALL_BOXES: Box[] = [];
{
    const { solid, nU, nL, UV, TR } = CARVE;
    for (let li = 0; li < nL; li++) { const t = -TR + (li+0.5)*((2*TR)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UV + (vj+0.5)*((2*UV)/nU);
        let run0 = -1;
        for (let ui = 0; ui <= nU; ui++) {
            const stone = ui < nU && solid.has(`${ui}|${vj}|${li}`);
            if (stone && run0 < 0) run0 = ui;
            if (!stone && run0 >= 0) {
                const u0 = -UV + run0*((2*UV)/nU), u1 = -UV + ui*((2*UV)/nU);
                WALL_BOXES.push({ c: pOf((u0+u1)/2, v, t), s: [u1-u0, LAYER, CELL] });
                run0 = -1;
            }
        } } }
    // fin anatomy (disclosed): two full-height knives, ~2-3 columns x 3 layers each —
    // the door ate the wall; the blades + the passer ARE the composition. Slender BY THEOREM.
    if (WALL_BOXES.length < 6) throw Error(`S3 raster degenerate: ${WALL_BOXES.length}`);
    if (WALL_BOXES.length * 24 > 130000) throw Error(`S3 vertex budget ${WALL_BOXES.length*24}`);
}
export const STATS = { boxes: WALL_BOXES.length, cells: CARVE.solid.size, comps: CARVE.comps.map(c => c.cells.length) };

// ---- S4: the station — FACE-STANCE NOSE-OUT (v4, struct-222: tilted stance geometrically disproven) ----
export const T_HI = Math.SQRT2 * (S/2);      // the mouth: the (x=+S/2, z=+S/2) corner edge
// The v2/v3 tilted pose's crest always towers over the fin crowns (Σ|row| ≥ 1 →
// PASS_YHALF ≥ s/2·√2 > S/2 at every tilted station — REJECTED twice). v4 = FACE
// STANCE: the passer's local axes ALIGN with the door frame (x→NN, y→UU, z→VV), the
// square nose face parallel to the door plane. Fit = the identity: a square of side
// ≤ door passes a square door exactly. Nose 1.6m proud of the mouth (~34% emerged,
// the judges' nose-out band), square silhouette fully INSIDE the fins' crown line.
const tHalfExt = (PASS_S/2) * (Math.abs(dot3([RP[0][0],RP[1][0],RP[2][0]], NN))
    + Math.abs(dot3([RP[0][1],RP[1][1],RP[2][1]], NN)) + Math.abs(dot3([RP[0][2],RP[1][2],RP[2][2]], NN)));
export const T_ST = T_HI + 1.335 - tHalfExt;  // v5: nose 1.335m proud, tail IN the fin band (FLANK LAW below — the fins are WAIST-LOCAL, t ∈ [−0.59, 0.59])
export const PASS_C: V3 = [O_W[0] + T_ST*NN[0], O_W[1] + T_ST*NN[1], O_W[2] + T_ST*NN[2]];
const passerCornerLocal: V3[] = [];
for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1]) passerCornerLocal.push([sx*PASS_S/2, sy*PASS_S/2, sz*PASS_S/2]);
export const passCorner = (c: V3): V3 => [
    PASS_C[0] + c[0]*RP[0][0] + c[1]*RP[0][1] + c[2]*RP[0][2],
    PASS_C[1] + c[0]*RP[1][0] + c[1]*RP[1][1] + c[2]*RP[1][2],
    PASS_C[2] + c[0]*RP[2][0] + c[1]*RP[2][1] + c[2]*RP[2][2]];
let S4_FRAC = 0;
{
    let yMin = Infinity, yMax = -Infinity, tMin = Infinity, tMax = -Infinity;
    for (const c of passerCornerLocal) {
        const p = passCorner(c);
        yMin = Math.min(yMin, p[1]); yMax = Math.max(yMax, p[1]);
        const t = dot3([p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]], NN);
        tMin = Math.min(tMin, t); tMax = Math.max(tMax, t);
    }
    const frac = (tMax - T_HI) / (tMax - tMin);
    if (frac < 0.12 || frac > 0.75) throw Error(`S4 emergence fraction ${frac.toFixed(3)} outside the caught-mid-pass band`);
    if (yMax < 2.2) throw Error(`S4 crest ${yMax.toFixed(2)} under room gate`);
    if (Math.abs(yMin - REVEAL) > 1e-9) throw Error(`S4 passer bottom ${yMin.toFixed(4)} != reveal ${REVEAL} — floor-ride regression`);
    S4_FRAC = frac;
}
export const EMERGED_FRAC = S4_FRAC;
{
    // FLANK LAW (v5, decode-rooted): the fins are WAIST-LOCAL (t ∈ [tFinLo, tFinHi] —
    // the door is wider than the wall's diagonal section everywhere except near the
    // waist), so the passer's TAIL must sit INSIDE the fin band or there is no flank
    // read at all (v5-draft nose 2.2m: tail t 0.751 slid past every fin — 0.0m flank).
    // Balance: nose out (S4 emergence) + tail-in (this law) pins the station window.
    let tFinLo = Infinity, tFinHi = -Infinity;
    for (const b of WALL_BOXES) { const t = invP(b.c)[2]; tFinLo = Math.min(tFinLo, t - b.s[1]/2); tFinHi = Math.max(tFinHi, t + b.s[1]/2); }
    const tailT = T_ST - PASS_S/2;
    if (tailT > tFinHi - 0.25) throw Error(`FLANK LAW: tail t ${tailT.toFixed(3)} not inside the fin band [${tFinLo.toFixed(3)}, ${tFinHi.toFixed(3)}] — no flank read (nose too far out)`);
    const noseOut = (T_ST + PASS_S/2) - T_HI;
    if (noseOut < 1.0) throw Error(`FLANK LAW: nose only ${noseOut.toFixed(3)}m proud — the mouth read needs ≥1.0m`);
    console.log(`FLANK LAW: nose ${(noseOut).toFixed(3)}m proud, tail t ${tailT.toFixed(3)} inside fin band [${tFinLo.toFixed(3)}, ${tFinHi.toFixed(3)}] (flank ${(tFinHi - tailT).toFixed(3)}m)`);
}
{
    // station-solid honesty: every passer point inside the wall's AABB lies in the door prism
    // (by the stone-clearance law this also means it touches no kept fin cell)
    let worst = -Infinity;
    const test = (c: V3) => {
        const p = passCorner(c);
        if (inWallCube(p)) { const [u, v] = invP(p); worst = Math.max(worst, Math.abs(u), Math.abs(v)); }
    };
    for (const c of passerCornerLocal) test(c);
    for (let i = 0; i < passerCornerLocal.length; i++) {
        const A = passerCornerLocal[i], B = passerCornerLocal[(i+1)%passerCornerLocal.length];
        for (let k = 1; k < 12; k++) {
            const q = k/12;
            test([A[0]+q*(B[0]-A[0]), A[1]+q*(B[1]-A[1]), A[2]+q*(B[2]-A[2])]);
        }
    }
    if (worst > doorHalf - 1e-6) throw Error(`S4 station-solid clash: passer point in wall outside the bore (${worst.toFixed(4)} > ${(doorHalf-0.001).toFixed(4)})`);
}

// ---- S5: the foot pads under the fins; the two fin-top beads; sleeve RETIRED -------------------------------
// SLEEVE RETIREMENT (recorded): at the waist plane t=0 the door (half 2.386) exceeds the
// cube's full section there — the center plane is ENTIRELY carved; no stone seats a ring.
export const PADS: { c: V3; s: [number, number, number] }[] = [];
export const BEADS: V3[] = [];
export const BEAD_R = 0.07;
{
    const nU2 = Math.ceil((2*CARVE.UV)/CELL), nL2 = Math.ceil((2*CARVE.TR)/LAYER);
    const boxComp: number[] = WALL_BOXES.map(b => {
        const [u, v, t] = invP(b.c);
        const ui = Math.round((u + CARVE.UV) / ((2*CARVE.UV)/nU2) - 0.5);
        const vj = Math.round((v + CARVE.UV) / ((2*CARVE.UV)/nU2) - 0.5);
        const li = Math.round((t + CARVE.TR) / ((2*CARVE.TR)/nL2) - 0.5);
        for (let ci = 0; ci < CARVE.comps.length; ci++) if (CARVE.comps[ci].cells.includes(`${ui}|${vj}|${li}`)) return ci;
        return -1;
    });
    // TRUE vertical extent per fin: the u-run (s[0]) is the VERTICAL axis of each box
    // (UU = +y) — c[1] ± s[0]/2. Using s[1] (the t-layer thickness) instead put the
    // beads at mid-wall and mis-sized the pads (DECODE-CAUGHT, this tick).
    // TRUE ground footprint per fin: project each box's (t,v)-corners (the u axis is
    // VERTICAL — no ground contribution). The old ±max(s)/2 inflation treated a 4.5m
    // knife blade as a 4.5m CUBE (caught by the S5 collision law).
    const groundXZ = (b: Box): P2[] => {
        const out: P2[] = [];
        for (const st of [-b.s[1]/2, b.s[1]/2]) for (const sv of [-b.s[2]/2, b.s[2]/2])
            out.push([b.c[0] + st*NN[0] + sv*VV[0], b.c[2] + st*NN[2] + sv*VV[2]]);
        return out;
    };
    let yTopAll = -Infinity; for (const b of WALL_BOXES) yTopAll = Math.max(yTopAll, b.c[1] + b.s[0]/2);
    for (let ci = 0; ci < 2; ci++) {
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        let vAbsMin = Infinity, finBot = Infinity, finTop = -Infinity;
        WALL_BOXES.forEach((b, i) => {
            if (boxComp[i] !== ci) return;
            for (const [gx, gz] of groundXZ(b)) { x0 = Math.min(x0, gx); x1 = Math.max(x1, gx); z0 = Math.min(z0, gz); z1 = Math.max(z1, gz); }
            const [u, v, t] = invP(b.c);
            vAbsMin = Math.min(vAbsMin, Math.abs(v) - b.s[2]/2);
            finBot = Math.min(finBot, b.c[1] - b.s[0]/2);   // the blade's true raster bottom
            finTop = Math.max(finTop, b.c[1] + b.s[0]/2);    // the blade's true raster top
        });
        // PAD CLEARANCE LAW (provable): kept cells lie entirely in |v| > doorHalf (every
        // corner of a kept cell has |v| > doorHalf — since |u| <= 2.25 < doorHalf, any
        // corner with |v| <= doorHalf would have been cut), and the passer lies in
        // |v| <= doorHalf (the region condition). Pads therefore extend OUTWARD ONLY:
        // their inner |v| edge = the blade's own inner edge > doorHalf >= the passer's
        // reach — disjoint for every station of the slide, not just this one.
        if (vAbsMin <= doorHalf) throw Error(`S5 kept-cell law violated: blade inner |v| ${vAbsMin.toFixed(3)} <= doorHalf ${doorHalf.toFixed(3)}`);
        // PAD HEIGHT LAW (decode-caught fix): the raster rounds INWARD — the blade's
        // bottom sits one conservative cell above the wall cube's base face. The pad
        // rises to the blade's TRUE raster bottom so the blades rest ON stone (no
        // float gap; the decode's grounding check enforces contact at 3mm).
        const M = 0.12;
        const outX = (x0 + x1) / 2 >= 0 ? 1 : -1;   // outward signs from the fin's corner
        const outZ = (z0 + z1) / 2 >= 0 ? 1 : -1;
        if (outX === outZ) throw Error(`S5 fin not on an anti-diagonal corner (x sign ${outX}, z sign ${outZ}) — frame regression`);
        // v4 PAD LAW (S5 exact-SAT RED catch): the v2/v3 AXIS-ALIGNED pad filled the
        // fin footprint's diagonal corner into the bore's |v| band — the high tilted
        // passer cleared it on Y, the low face-stance passer does NOT. The honest pad
        // is a DOOR-FRAME box (axes UU/NN/VV like the fin cells): its inner v edge IS
        // the fin's own inner |v| edge (> doorHalf >= the passer's reach), so the pad
        // clears the passer for EVERY station of the slide — by the same |v| law that
        // guards the fins, not by a vantage-dependent height.
        let vLo = Infinity, vHi = -Infinity, tLo = Infinity, tHi = -Infinity;
        WALL_BOXES.forEach((b, i) => {
            if (boxComp[i] !== ci) return;
            const [, v, t] = invP(b.c);
            vLo = Math.min(vLo, v - b.s[2] / 2); vHi = Math.max(vHi, v + b.s[2] / 2);
            tLo = Math.min(tLo, t - b.s[1] / 2); tHi = Math.max(tHi, t + b.s[1] / 2);
        });
        const vSign = (vLo + vHi) >= 0 ? 1 : -1;
        const vIn = vSign > 0 ? vLo : vHi;            // inner edge (nearest the bore)
        const vOut = (vSign > 0 ? vHi : vLo) + vSign * M; // outer edge + margin
        const padV0 = Math.min(vIn, vOut), padV1 = Math.max(vIn, vOut);
        const padT0 = tLo - M, padT1 = tHi + M;
        PADS.push({
            // u measured from O_W (world y = WALL_CY + u): the pad spans world
            // [0, finBot] -> u-center = finBot/2 − WALL_CY (DECODE-CAUGHT class:
            // pOf(finBot/2) alone floats the pad at mid-wall — O_W is the bore center).
            c: pOf(finBot / 2 - WALL_CY, (padV0 + padV1) / 2, (padT0 + padT1) / 2),
            s: [finBot, padT1 - padT0, padV1 - padV0],  // [u: height, t: along NN, v: along VV]
        });
        // ON-FIN law (fixed): bead at the fin's TRUE top (u-run max), footprint center
        BEADS.push([(x0+x1)/2, finTop + BEAD_R*0.4, (z0+z1)/2]);
    }
    void yTopAll;
    // pads must not collide the passer (EXACT box-box SAT: the passer is a rotated box,
    // its AABB overstates the corner reach — the tilted body clears the pad corner)
    const pAxes: V3[] = [
        [RP[0][0], RP[1][0], RP[2][0]], [RP[0][1], RP[1][1], RP[2][1]], [RP[0][2], RP[1][2], RP[2][2]],
    ];
    const pHalf = PASS_S / 2;
    for (const pad of PADS) {
        const d: V3 = [pad.c[0] - PASS_C[0], pad.c[1] - PASS_C[1], pad.c[2] - PASS_C[2]];
        const aHalf: V3[] = [[pad.s[0]/2, 0, 0], [0, pad.s[1]/2, 0], [0, 0, pad.s[2]/2]];
        const axes: V3[] = [
            [1,0,0], [0,1,0], [0,0,1],
            ...pAxes,
        ];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            // cross of world axis i and passer axis j
            const wi: V3 = [[1,0,0],[0,1,0],[0,0,1]][i];
            const pj: V3 = pAxes[j];
            const cr: V3 = [wi[1]*pj[2] - wi[2]*pj[1], wi[2]*pj[0] - wi[0]*pj[2], wi[0]*pj[1] - wi[1]*pj[0]];
            const len = Math.hypot(...cr);
            if (len > 1e-9) axes.push([cr[0]/len, cr[1]/len, cr[2]/len]);
        }
        let separated = false;
        for (const ax of axes) {
            const dist = Math.abs(dot3(d, ax));
            const rA = aHalf.reduce((s, h) => s + Math.abs(dot3(h, ax)), 0);
            const rB = pHalf * (Math.abs(dot3(pAxes[0], ax)) + Math.abs(dot3(pAxes[1], ax)) + Math.abs(dot3(pAxes[2], ax)));
            if (dist > rA + rB + 1e-9) { separated = true; break; }
        }
        if (!separated) throw Error(`S5 pad intersects the passer body (exact SAT) — pad x[${(pad.c[0]-pad.s[0]/2).toFixed(2)},${(pad.c[0]+pad.s[0]/2).toFixed(2)}] z[${(pad.c[2]-pad.s[2]/2).toFixed(2)},${(pad.c[2]+pad.s[2]/2).toFixed(2)}]`);
    }
}

// ---- S6: envelope, gates ------------------------------------------------------------------------------------
let ENV: { min: V3; max: V3 } = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] };
const grow = (p: V3) => { for (let i = 0; i < 3; i++) { ENV.min[i] = Math.min(ENV.min[i], p[i]); ENV.max[i] = Math.max(ENV.max[i], p[i]); } };
{
    const cornersOf = (b: Box): V3[] => {
        const out: V3[] = [];
        for (const su of [-b.s[0]/2, b.s[0]/2]) for (const st of [-b.s[1]/2, b.s[1]/2]) for (const sv of [-b.s[2]/2, b.s[2]/2]) {
            // the box axes in the door frame: u-run along UU, t-layer along NN, v-cell along VV
            const w = [b.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], b.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], b.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]];
            out.push(w as V3);
        }
        return out;
    };
    for (const b of WALL_BOXES) for (const p of cornersOf(b)) grow(p);
    for (const c of passerCornerLocal) grow(passCorner(c));
    for (const pad of PADS) for (const su of [-pad.s[0]/2, pad.s[0]/2]) for (const st of [-pad.s[1]/2, pad.s[1]/2]) for (const sv of [-pad.s[2]/2, pad.s[2]/2])
        grow([pad.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], pad.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], pad.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]]);
    // NOTE: the beads' contribution is measured live from the merged GLB (three.js
    // Box3.setFromObject); the probe's analytic corner AABB of a sphere INFLATES by
    // (1−1/√3)·r per axis — removed here to match the real rendered envelope exactly.
}
if (ENV.min[1] < -1e-9) throw Error(`S6 below grade ${ENV.min[1]}`);
export const ENVELOPE = { min: [...ENV.min] as V3, max: [...ENV.max] as V3 };
{
    let yTop = -Infinity; for (const c of passerCornerLocal) yTop = Math.max(yTop, passCorner(c)[1]);
    const foot = (ENV.max[0]-ENV.min[0]) * (ENV.max[2]-ENV.min[2]);
    if (foot < 16 || yTop < 2.2) throw Error(`S6 gates: foot ${foot.toFixed(1)} h ${yTop.toFixed(2)}`);
}

// ---- RED controls ---------------------------------------------------------------------------------------------
export function redChecks(): void {
    // RED-1: perturb the max-section axis 1 deg -> the max square section must shrink
    const nP = norm3(applyM(rotAxis([1,0,0], Math.PI/180), MAXSEC_N));
    if (!(centeredSquareSide(nP) < MAXSEC_SIDE - 1e-6)) throw Error(`RED-1 vacuous`);
    // RED-2: stance-control (v4, non-vacuous): the face-stance fit is EXACT — a +2.5cm
    // VV-offset passer must CLASH the kept fin boxes (its v interval [−s/2+off, s/2+off]
    // crosses the fins' inner |v| band 2.3258; both are door-frame axis-aligned, so
    // overlap ⟺ interval overlap — direct arithmetic on the carve boxes).
    // (Recorded geometry: the naive "inside wall shadow AND outside door" region is
    // EMPTY at this door — the door (half 2.3175) is WIDER than the wall's own v-shadow
    // (±2.25), which is exactly why the wall forks. The 2-deg-rotation control of
    // v1/v2/v3 is likewise vacuous at face stance — rotated regions leave the shadow.)
    {
        const off = 0.025;
        const uLo = -PASS_S/2, uHi = PASS_S/2;
        const vLo = -PASS_S/2 + off, vHi = PASS_S/2 + off;
        const tLo = T_ST - PASS_S/2, tHi = T_ST + PASS_S/2;
        let clash = false;
        for (const b of WALL_BOXES) {
            const [bu, bv, bt] = invP(b.c);
            const oU = Math.min(uHi, bu + b.s[0]/2) - Math.max(uLo, bu - b.s[0]/2);
            const oV = Math.min(vHi, bv + b.s[2]/2) - Math.max(vLo, bv - b.s[2]/2);
            const oT = Math.min(tHi, bt + b.s[1]/2) - Math.max(tLo, bt - b.s[1]/2);
            if (oU > 1e-9 && oV > 1e-9 && oT > 1e-9) { clash = true; break; }
        }
        if (!clash) throw Error(`RED-2 vacuous: +2.5cm-offset passer still clears every fin box — the exact-fit claim unproven`);
        // and the base passer (offset 0) must clear them all (the fit itself)
        for (const b of WALL_BOXES) {
            const [bu, bv, bt] = invP(b.c);
            const oU = Math.min(uHi, bu + b.s[0]/2) - Math.max(uLo, bu - b.s[0]/2);
            const oV = Math.min(PASS_S/2, bv + b.s[2]/2) - Math.max(-PASS_S/2, bv - b.s[2]/2);
            const oT = Math.min(tHi, bt + b.s[1]/2) - Math.max(tLo, bt - b.s[1]/2);
            if (oU > 1e-9 && oV > 1e-9 && oT > 1e-9) throw Error(`RED-2 base clash: the seated passer overlaps fin box at (${bu.toFixed(2)},${bv.toFixed(2)},${bt.toFixed(2)}) — fit regression`);
        }
    }
    // RED-3: the fork is the DIAGONAL axis's own: the TRUE max-section axes QUARTER and the
    // axis-aligned bore ANNIHILATES at this door (carve-map findings, re-proven live)
    const { e1, e2 } = sectionPoly(MAXSEC_N);
    const q4 = carveComps(DOOR, MAXSEC_N, e1, e2);
    if (q4.comps.length === 2) throw Error(`RED-3 vacuous: max-section axis forks at the classic door too`);
    const a0 = carveComps(DOOR, [1,0,0], [0,1,0], [0,0,1]);
    if (a0.comps.length !== 0) throw Error(`RED-3b unexpected: axis-aligned bore leaves ${a0.comps.length} comps`);
    // RED-4: the door exceeds the cube's own max section AT THE BORE AXIS (the honest
    // non-section claim: no planar cut on this axis could produce this door — the bore
    // is a prism, not a cut; its cross-section is the classic size, bigger than any
    // section the cube offers here)
    const own = centeredSquareSide(NN) * S;
    if (DOOR <= own + 1e-6) throw Error(`RED-4 vacuous: door ${DOOR.toFixed(4)} not above the bore axis's own max section ${own.toFixed(4)}`);
    // RED-5: non-vacuous carve
    const { nU, nL } = CARVE;
    if (CARVE.solid.size >= nU*nU*nL) throw Error(`RED-5 vacuous: nothing carved`);
    // RED-6: the passer is BIGGER than the wall (the monument's headline claim)
    if (PASS_S <= S) throw Error(`RED-6 vacuous: passer not bigger than the wall`);
}

// ---- main ------------------------------------------------------------------------------------------------------
if (import.meta.main) {
    redChecks();
    console.log(`S1 max square section (FRESH): ${MAXSEC_SIDE.toFixed(9)} == 3√2/4 ${CLASSIC.toFixed(9)} (classic; struct-220's 1.2503 RETRACTED — non-planar artifact, correction of record)`);
    console.log(`S2 the passer: ${PASS_S.toFixed(4)} m = ${PASS_RATIO.toFixed(5)}x S — ${((PASS_RATIO-1)*100).toFixed(2)}% BIGGER than the wall, FACE STANCE (axes = door frame; exact identity fit through the square door; whole-pass region condition verified). REJECTED-STANCE RECORD (v2/v3): tilted pose a ${TILT_POSE_DEG.a.toFixed(2)} b ${TILT_POSE_DEG.b.toFixed(2)} g ${TILT_POSE_DEG.g.toFixed(2)} deg at s ${TILT_S.toFixed(4)} — crest towers over the fin crowns at every station (L1 ≥ L2), twice judge-rejected`);
    console.log(`S3 the fork: diagonal bore (1,0,1)/√2, door ${DOOR.toFixed(4)} m = ${(DOOR/S).toFixed(5)}x the face — TWO grounded full-height fins ${STATS.comps.join(" / ")} cells, ${STATS.boxes} merged boxes (max-section axes quarter: 4; axis-aligned annihilates: 0)`);
    console.log(`S4 station: caught mid-pass at t ${T_ST.toFixed(3)} (mouth ${T_HI.toFixed(3)}), ${(EMERGED_FRAC*100).toFixed(0)}% emerged; floor-ride exact (bottom ${REVEAL*1000}mm above grade); wall raised ${PAD_H.toFixed(4)} m on its pads (the honest demo)`);
    console.log(`S5 pads 2 (exact-SAT clear of the passer body, verified; contact y ${(PADS[0].c[1]+PADS[0].s[0]/2).toFixed(4)}), fin-top beads 2 (on-fin law); sleeve RETIRED — the waist plane is fully carved (recorded)`);
    console.log(`S6 envelope x[${ENVELOPE.min[0].toFixed(2)},${ENVELOPE.max[0].toFixed(2)}] y[${ENVELOPE.min[1].toFixed(2)},${ENVELOPE.max[1].toFixed(2)}] z[${ENVELOPE.min[2].toFixed(2)},${ENVELOPE.max[2].toFixed(2)}] — asymmetric BY DESIGN (seat with the TRUE bbox); ${STATS.boxes} fin boxes = ${STATS.boxes*24} verts`);
    console.log(`RED 1-6 PASS`);
    console.log(`ALL PASS`);
}
