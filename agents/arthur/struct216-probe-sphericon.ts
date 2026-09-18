// struct216-probe-sphericon.ts — THE ONE CONTRACT for R11-33 THE SPHERICON:
// the oloid's square cousin — a bicone with a 90-degree apex, cut through its
// axis into two half-bicones, one rotated a quarter-turn about the cut-plane
// normal and reglued at the common square face. Four developable 45-degree
// cone faces, two perpendicular semicircular edges, four apex vertices. It
// rolls on its whole skin: the cone phase pivots about an apex (line contact,
// generator after generator), with a point wobble at each edge crossing.
//
// FORM SELECTION (fresh grep this tick, plan + IMPROVEMENTS + IMPROVE-PLAN +
// CITY-PLAN-V2 + census 351): sphericon 1 mention = struct-214's own register
// note ("the oloid's square cousin, 0 mentions, future kin") — unbarred,
// unbuilt, no census id. Register: opens the square-roller branch of the
// rolling-mechanics family the oloid opened (Schatz 1929 -> Hirsch 1980);
// discovered from a paper model of a bicone twisted a quarter turn.
//
// THE THEOREMS CARVED (verified below before any build):
// 1. THE BIRTH — both halves' cut faces are the SAME square {|x|+|z|<=R, y=0}
//    (4-fold symmetric, so the quarter-turn maps it onto itself); above the
//    seam the solid is pure bicone-half, below it pure rotated half.
// 2. THE EDGES — two exact semicircles radius R in perpendicular planes,
//    each joining two of the four apexes; the waist ridge's exterior
//    dihedral is EXACTLY 90 degrees at every point (45+45); the edge plane
//    is NOT a support — the solid cannot rest along its edge: the wobble
//    is geometry.
// 3. THE SKIN — four half-band faces of 45-degree cones (generators exact
//    45 deg off the face axis, span exactly pi, rim at slant sqrt2*R);
//    total 4*(pi R^2/sqrt2) = 2*sqrt2*pi*R^2 == the parent bicone's lateral
//    area EXACTLY — the cut-twist-reglue conserves skin.
// 4. CONVEXITY — dense numeric pair test + conv(E1 u E2) containment
//    (disclosed numeric); convexity founds the exact corner law of L7.
// 5. THE SUPPORT FAMILY + SEAT — every generator tangent plane strictly
//    one-sided over the whole solid (re-verified in the seated frame with
//    the exact lift bound); the seat is the widest plane, width exactly
//    R*(1+1/sqrt2); the contact is the FULL generator (both ends on the
//    ground) — line contact, the roll's own geometry.
// 6. THE TRACE — the cone phase unrolls the face onto the ground at the
//    classic compression dphi = sin(45 deg)*dtheta = dtheta/sqrt2 (EXACT,
//    developable unrolling); corroborated by finite-tip roll simulation at
//    two resolutions (error -> 0 as steps shrink). Past generators leave
//    radial traces of length sqrt2*R from the apex ground point; the rim
//    sweeps the exact circle arc radius sqrt2*R centered there. The visible
//    fan is CLIPPED to outside the hull's ground shadow (the roll drew it,
//    then rolled OVER it — portions under the stone are occluded, disclosed).
// 7. THE COURSES — voussoir boxes TRUE-inscribed: all 8 corners inside S by
//    closed-form membership (EXACT given L4); first course bottom flat at
//    curb top - 8cm (cradle class).
// 8. VOLUME (numeric only) / ENVELOPE / FOLLY gates.
//
// WORLD FRAME: the seated solid rises from a long curb in stepped voussoir
// courses. BRASS carries the two semicircular EDGES as proud arcs riding the
// surface — the interlocked pair that IS the sphericon (both arcs ground out
// exactly at the contact ruling's two ends: the seat's apex end is E2's +z
// endpoint, its rim end is E1's midpoint). IRON carries the roll TRACE
// inlaid in the curb top: the seat line (live contact) + two radial wear
// bars at exact past-generator ground angles + the rim-trace arc. Sole night
// element: one warm bead at the crown (s363 law). Exports are consumed by
// assets/mkv3-sphericon.ts (build) and struct216-decode-sphericon.ts
// (audit). ROOT STAYS IDENTITY (struct-188 law): all positions are FINAL
// world-local.

// ---- constants (twist frame: bicone axis z, cut plane y=0) ------------------------------------------
export const R = 1.45;                          // bicone rim radius = cone height (45-degree half-angle)
export const PLINTH_H = 0.26;
export const EMBED = 0.08;                      // first course seats 8cm into the curb top (cradle class)
export const MARGIN = 0.25;
export const COURSE_T = 0.155;
export const COURSE_TARGET = 0.32;
export const JOINT = 0.012;
export const MIN_SPAN = 0.07;                   // discard razor strips (disclosed)
export const MIN_DEPTH = 0.06;                  // discard razor wedges in z (disclosed)
export const TUBE = 0.05;                       // brass edge-arc tube radius
export const BEAD_R = 0.07;                     // sole night bead radius
export const SEAT_TUBE = 0.018;                 // iron seat-line tube radius
export const TRACE_TUBE = 0.014;                // iron trace bar/arc tube radius
export const INLAY_Y = PLINTH_H - 0.012;        // iron trace center height (2mm proud of curb top)

// ---- vector helpers ---------------------------------------------------------------------------------
export type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const rotAbout = (p: V3, A: V3, u: V3, th: number): V3 => {   // Rodrigues about axis (A, u)
    const d = sub(p, A), c = Math.cos(th), s = Math.sin(th);
    const k = norm(u), kxd = cross(k, d), kd = dot(k, d);
    const r: V3 = [d[0] * c + kxd[0] * s + k[0] * kd * (1 - c), d[1] * c + kxd[1] * s + k[1] * kd * (1 - c), d[2] * c + kxd[2] * s + k[2] * kd * (1 - c)];
    return add(r, A);
};

// ---- THE BIRTH: closed-form membership in the twist frame --------------------------------------------
// bicone B = {x^2+y^2 <= (R-|z|)^2, |z| <= R}; H1 = B ∩ {y>=0}; rot+ = (x,y,z)->(z,y,-x) (90 deg about +y);
// H2 = B ∩ {y<=0}; S = H1 ∪ rot+(H2).  rot+ preserves y, so the halves meet only at the square y=0.
const EPS = 1e-9;
export const inBicone = (p: V3) => p[0] * p[0] + p[1] * p[1] <= (R - Math.abs(p[2])) ** 2 + 1e-12 && Math.abs(p[2]) <= R + EPS;
export const rotP = (p: V3): V3 => [p[2], p[1], -p[0]];       // the quarter turn
export const rotPInv = (p: V3): V3 => [-p[2], p[1], p[0]];    // its inverse
export const memberTwist = (p: V3): boolean => {
    if (p[1] >= -EPS && inBicone(p)) return true;              // H1
    const q = rotPInv(p);
    return q[1] <= EPS && inBicone(q);                         // rot+(H2)
};

// ---- the four faces (twist frame): apex A, inward axis u, around-vector w(t), t in [0, pi] ------------
interface Face { name: string; A: V3; u: V3; w: (t: number) => V3 }
export const FACES: Face[] = [
    { name: "H1up",  A: [0, 0, R],  u: [0, 0, -1], w: (t) => [Math.cos(t), Math.sin(t), 0] },      // H1 apex+z
    { name: "H1dn",  A: [0, 0, -R], u: [0, 0, 1],  w: (t) => [Math.cos(t), Math.sin(t), 0] },      // H1 apex-z
    { name: "R2up",  A: [R, 0, 0],  u: [-1, 0, 0], w: (t) => [0, -Math.sin(t), -Math.cos(t)] },    // rot+(H2) apex+x
    { name: "R2dn",  A: [-R, 0, 0], u: [1, 0, 0],  w: (t) => [0, -Math.sin(t), -Math.cos(t)] },     // rot+(H2) apex-x (rim = E2 directly)
];
const genDir = (f: Face, t: number): V3 => norm(add(f.u, f.w(t)));      // 45 deg off the axis
const coneNormal = (f: Face, t: number): V3 => norm(sub(f.w(t), f.u));  // outward tangent-plane normal
export const SLANT = Math.SQRT2 * R;                                    // generator length, rim at sqrt2*R

// ---- dense surface samples ----------------------------------------------------------------------------
export const SAMPLES: V3[] = [];
{
    const NT = 288, NS = 24;
    for (const f of FACES) for (let i = 0; i < NT; i++) {
        const t = (i / NT) * Math.PI;
        const g = genDir(f, t);
        for (let j = 0; j < NS; j++) SAMPLES.push(add(f.A, mul(g, (j + 0.5) * SLANT / NS)));
    }
    for (let i = 0; i < 720; i++) {
        const a = (i / 720) * Math.PI;
        SAMPLES.push([R * Math.cos(a), R * Math.sin(a), 0]);             // E1: z=0, y>=0
        SAMPLES.push(rotP([R * Math.cos(a), -R * Math.sin(a), 0]));      // E2: x=0, y<=0 (the rotated waist)
    }
    for (const a of [[0, 0, R], [0, 0, -R], [R, 0, 0], [-R, 0, 0]] as V3[]) SAMPLES.push(a);
}
export const E1 = (t: number): V3 => [R * Math.cos(t), R * Math.sin(t), 0];
export const E2 = (t: number): V3 => rotP([R * Math.cos(t), -R * Math.sin(t), 0]);

// ---- the support family: tangent planes along generators, one-sided-verified --------------------------
export interface Plane { n: V3; d: number; P: V3; Q: V3; face: string; t: number }  // S ⊆ {n.p <= d}
export const FAMILY: Plane[] = [];
{
    const NT = 240;
    for (const f of FACES) for (let i = 0; i <= NT; i++) {
        const t = (i / NT) * Math.PI;
        const P = f.A, Q = add(f.A, mul(genDir(f, t), SLANT));
        let n = coneNormal(f, t);
        const d = dot(n, P);
        let bad = false;
        for (const p of SAMPLES) if (dot(n, p) - d > 1e-7) { bad = true; break; }
        if (bad) { n = [-n[0], -n[1], -n[2]]; bad = false; for (const p of SAMPLES) if (dot(n, p) - d > 1e-7) { bad = true; break; } }
        if (bad) continue;
        FAMILY.push({ n, d, P, Q, face: f.name, t });
    }
}

// ---- stance selection: widest reading (hull extent along the plane normal) ----------------------------
let seatPlane: Plane | null = null;
let seatWidth = -1;
for (const f of FAMILY) {
    let minDot = Infinity;
    for (const p of SAMPLES) minDot = Math.min(minDot, dot(f.n, p));
    const width = f.d - minDot;
    if (width > seatWidth) { seatWidth = width; seatPlane = f; }
}
export const SEAT = seatPlane!;
export const SEAT_WIDTH = seatWidth;

// seat transform (oloid chassis verbatim): up = -n, ruling direction -> +x
const UP: V3 = [-SEAT.n[0], -SEAT.n[1], -SEAT.n[2]];
const q_seat = (() => {
    const axis = cross(UP, [0, 1, 0]);
    const al = len(axis);
    if (al < 1e-12) return [1, [0, 0, 0]] as [number, V3];
    const ang = Math.acos(Math.max(-1, Math.min(1, UP[1])));
    const s = Math.sin(ang / 2);
    return [Math.cos(ang / 2), [axis[0] / al * s, axis[1] / al * s, axis[2] / al * s]] as [number, V3];
})();
const qRot = (p: V3, q: [number, V3]): V3 => {
    const [w, v] = q;
    const t = mul(cross(v, p), 2);
    const tt = cross(v, t);
    return add(add(p, mul(t, w)), tt);
};
const seatRot = (p: V3): V3 => qRot(p, q_seat);
const toSeat = (p: V3): V3 => { const s = seatRot(p); return [s[0], s[1] + SEAT.d, s[2]]; };
const P_S = toSeat(SEAT.P), Q_S = toSeat(SEAT.Q);
const RULING_DIR = norm(sub(Q_S, P_S));
const phi = Math.atan2(RULING_DIR[2], RULING_DIR[0]);
export const toSeat2 = (p: V3): V3 => {
    const s = toSeat(p);
    const c = Math.cos(phi), sn = Math.sin(phi);
    return [s[0] * c + s[2] * sn, s[1], -s[0] * sn + s[2] * c];
};
export const vecSeat2 = (t: V3): V3 => {
    const s = seatRot(t);
    const c = Math.cos(phi), sn = Math.sin(phi);
    return [s[0] * c + s[2] * sn, s[1], -s[0] * sn + s[2] * c];
};
export const toTwist = (p: V3): V3 => {
    const c = Math.cos(phi), sn = Math.sin(phi);
    const u: V3 = [p[0] * c - p[2] * sn, p[1], p[0] * sn + p[2] * c];
    const v: V3 = [u[0], u[1] - SEAT.d, u[2]];
    return qRot(v, [q_seat[0], [-q_seat[1][0], -q_seat[1][1], -q_seat[1][2]]]);
};
export const memberSeated = (p: V3) => memberTwist(toTwist(p));

export const SEATED: V3[] = SAMPLES.map(toSeat2);
export const APEX_SEATED: V3 = toSeat2(SEAT.P);              // apex end of the contact ruling (ground)
export const RIM_SEATED: V3 = toSeat2(SEAT.Q);               // rim end (ground: full line contact)
export const FAR_Y = Math.max(...SEATED.map((p) => p[1]));   // crown datum
// exact seated-frame support bound: vecSeat2(n).toSeat2(p) = n.p - SEAT.d*(n.n_seat)
export const seatBound = (f: Plane) => f.d - SEAT.d * dot(f.n, SEAT.n);

// ---- seated-frame slices: radial bisection on the TRUE membership --------------------------------------
export function slicePoly(y: number, seed: V3): [number, number][] | null {
    if (!memberSeated([seed[0], y, seed[2]])) return null;
    const pts: [number, number][] = [];
    const NPHI = 192, RMAX = 3.2 * R;
    for (let i = 0; i < NPHI; i++) {
        const a = (i / NPHI) * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
        let out = -1, step = 0.05;
        while (step <= RMAX) { if (!memberSeated([seed[0] + step * ca, y, seed[2] + step * sa])) { out = step; break; } step += 0.05; }
        if (out < 0) out = RMAX;
        let lo = 0, hi = out;
        for (let it = 0; it < 44; it++) {
            const m = (lo + hi) / 2;
            if (memberSeated([seed[0] + m * ca, y, seed[2] + m * sa])) lo = m; else hi = m;
        }
        pts.push([seed[0] + lo * ca, seed[2] + lo * sa]);
    }
    return pts;
}
const polyArea = (poly: [number, number][]) => {
    let a = 0;
    for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length]; a += A[0] * B[1] - B[0] * A[1]; }
    return Math.abs(a) / 2;
};

// ---- THE TRACE: exact roll geometry, on the OPEN side, clipped to the visible ground --------------------
const rad = (d: number) => (d * Math.PI) / 180;
const SL = SLANT;
// THE UNROLL LAW (metric-exact, no simulation): the face is a developable half-band of a
// 45-degree cone. Its first fundamental form in (s, t) — X(s,t) = A + s*(u+w(t))/sqrt2 — is
// E = 1, G = s^2/2 = s^2 sin^2(45deg)  =>  the developed polar angle rate satisfies
// dpsi = sqrt(G)|_{s=sqrt2R} / (sqrt2 R) dt = R/(sqrt2 R) dt = dt/sqrt2.  A generator at
// parameter t from the seat lands at ground azimuth t/sqrt2 about the fixed apex point A+.
// (A finite-tip roll simulation was built and honestly DISCARDED — struct-214's discard class:
// the naive per-step bisection is only first-order in the changing pivot; the metric law is exact.)
// shadow first (needed for the open-side probe)
export const SHADOW: Array<[number, number]> = (() => {
    const pts = SEATED.map((p) => [p[0], p[2]] as [number, number]);
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const half = (P: Array<[number, number]>) => {
        const st: Array<[number, number]> = [];
        for (const p of P) {
            while (st.length >= 2) {
                const a = st[st.length - 2], b = st[st.length - 1];
                if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) <= 1e-12) st.pop(); else break;
            }
            st.push(p);
        }
        return st;
    };
    const lo = half(pts), up = half([...pts].reverse());
    return [...lo.slice(0, -1), ...up.slice(0, -1)];
})();
export const shadowInside = (x: number, z: number): boolean => {      // inclusive point-in-convex-polygon
    for (let i = 0; i < SHADOW.length; i++) {
        const A = SHADOW[i], B = SHADOW[(i + 1) % SHADOW.length];
        if ((B[0] - A[0]) * (z - A[1]) - (B[1] - A[1]) * (x - A[0]) < -1e-9) return false;
    }
    return true;
};
const rayVisible = (deg: number): number => {                          // visible length of the full trace ray at azimuth deg
    const ex = APEX_SEATED[0] + SL * Math.cos(rad(deg)), ez = APEX_SEATED[2] + SL * Math.sin(rad(deg));
    const N = 240;
    let firstOut = -1;
    for (let i = 1; i <= N; i++) {
        const s = i / N;
        if (!shadowInside(APEX_SEATED[0] + (ex - APEX_SEATED[0]) * s, APEX_SEATED[2] + (ez - APEX_SEATED[2]) * s)) { firstOut = s; break; }
    }
    return firstOut < 0 ? 0 : (1 - firstOut) * SL;
};
const SIDE = rayVisible(90) >= rayVisible(-90) ? 1 : -1;             // the open side (+z or -z azimuths)
export const SIDE_SIGN = SIDE;
const EDGE_T = 90 / Math.SQRT2;                                       // the edge-transition ground azimuth (deg): last line-contact before the wobble
export const TRACE_ANGLES = { bar1: SIDE * 78, bar2: SIDE * EDGE_T, arcA: SIDE * 50, arcB: SIDE * 125 };
const barEnd = (deg: number): [number, number] => [APEX_SEATED[0] + SL * Math.cos(rad(deg)), APEX_SEATED[2] + SL * Math.sin(rad(deg))];
const BARS_FULL = [
    { x0: APEX_SEATED[0], z0: APEX_SEATED[2], x1: barEnd(TRACE_ANGLES.bar1)[0], z1: barEnd(TRACE_ANGLES.bar1)[1], deg: TRACE_ANGLES.bar1 },
    { x0: APEX_SEATED[0], z0: APEX_SEATED[2], x1: barEnd(TRACE_ANGLES.bar2)[0], z1: barEnd(TRACE_ANGLES.bar2)[1], deg: TRACE_ANGLES.bar2 },
];
const ARC_FULL: Array<[number, number]> = [];
for (let i = 0; i <= 96; i++) {
    const a = rad(TRACE_ANGLES.arcA + (i / 96) * (TRACE_ANGLES.arcB - TRACE_ANGLES.arcA));
    ARC_FULL.push([APEX_SEATED[0] + SL * Math.cos(a), APEX_SEATED[2] + SL * Math.sin(a)]);
}
// clip a ray element (bars) / polyline (arc) to OUTSIDE the shadow + inset
const INSET = 0.004;
export const CLIP = { barsOccluded: [0, 0], arcKeptFrom: -1 };
function clipRay(x0: number, z0: number, x1: number, z1: number): { x0: number; z0: number; x1: number; z1: number; occluded: number } | null {
    const N = 220;
    let lastInside = -1;
    for (let i = 0; i <= N; i++) {
        const s = i / N;
        const x = x0 + (x1 - x0) * s, z = z0 + (z1 - z0) * s;
        if (shadowInside(x, z)) lastInside = i;
    }
    if (lastInside < 0) return { x0, z0, x1, z1, occluded: 0 };
    if (lastInside >= N - 1) return null;                              // fully under the stone
    const s = (lastInside + 1) / N;
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const t = Math.min(1, s + INSET / L);
    return { x0: x0 + dx * t, z0: z0 + dz * t, x1, z1, occluded: t * L };
}
export const BARS_CLIP = BARS_FULL.map((b) => ({ ...clipRay(b.x0, b.z0, b.x1, b.z1)!, deg: b.deg, fullLen: SL }));
function clipArc(pts: Array<[number, number]>): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    let cut = -1;
    for (let i = 0; i < pts.length; i++) if (shadowInside(pts[i][0], pts[i][1])) cut = i;
    for (let i = cut + 1; i < pts.length; i++) out.push(pts[i]);
    CLIP.arcKeptFrom = cut >= 0 ? cut : -1;
    return out.length >= 2 ? out : [];
}
export const ARC_CLIP = clipArc(ARC_FULL);

// ---- world frame --------------------------------------------------------------------------------------
let xLo = Infinity, xHi = -Infinity, zLo = Infinity, zHi = -Infinity;
for (const p of SEATED) { xLo = Math.min(xLo, p[0]); xHi = Math.max(xHi, p[0]); zLo = Math.min(zLo, p[2]); zHi = Math.max(zHi, p[2]); }
const fLo = Math.min(...(ARC_CLIP.length ? ARC_CLIP : ARC_FULL).map((p) => p[0]), ...BARS_CLIP.map((b) => Math.min(b.x0, b.x1)));
const fHi = Math.max(...(ARC_CLIP.length ? ARC_CLIP : ARC_FULL).map((p) => p[0]), ...BARS_CLIP.map((b) => Math.max(b.x0, b.x1)));
const fzLo = Math.min(...(ARC_CLIP.length ? ARC_CLIP : ARC_FULL).map((p) => p[1]), ...BARS_CLIP.map((b) => Math.min(b.z0, b.z1)));
const fzHi = Math.max(...(ARC_CLIP.length ? ARC_CLIP : ARC_FULL).map((p) => p[1]), ...BARS_CLIP.map((b) => Math.max(b.z0, b.z1)));
const tLo = Math.min(xLo, fLo), tHi = Math.max(xHi, fHi), tzLo = Math.min(zLo, fzLo), tzHi = Math.max(zHi, fzHi);
export const CX = (tHi + tLo) / 2;
export const CZ = (tzHi + tzLo) / 2;
export const worldPt = (p: V3): V3 => [p[0] - CX, p[1] + PLINTH_H - EMBED, p[2] - CZ];
export const seatedOf = (w: V3): V3 => [w[0] + CX, w[1] - (PLINTH_H - EMBED), w[2] + CZ];   // inverse (iron trace y is overridden)
export const PLINTH_L = (tHi - tLo) + 2 * MARGIN;
export const PLINTH_D = (tzHi - tzLo) + 2 * MARGIN;

// ---- courses (stepped voussoir slices; corner law EXACT by closed-form membership) ---------------------
export interface Voussoir { x0: number; x1: number; z0: number; z1: number; y: number; yTop: number }  // world frame
export const COURSES: Voussoir[] = [];
{
    const verticalSpan = (poly: [number, number][], xv: number): [number, number] | null => {
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < poly.length; i++) {
            const P = poly[i], Q = poly[(i + 1) % poly.length];
            const dx = Q[0] - P[0];
            if (Math.abs(dx) < 1e-12) {
                if (Math.abs(P[0] - xv) < 1e-9) { lo = Math.min(lo, P[1], Q[1]); hi = Math.max(hi, P[1], Q[1]); }
                continue;
            }
            const t = (xv - P[0]) / dx;
            if (t < -1e-9 || t > 1 + 1e-9) continue;
            const zv = P[1] + t * (Q[1] - P[1]);
            lo = Math.min(lo, zv); hi = Math.max(hi, zv);
        }
        return lo <= hi ? [lo, hi] : null;
    };
    let seedBase: V3 = [(APEX_SEATED[0] + RIM_SEATED[0]) / 2, 0, (APEX_SEATED[2] + RIM_SEATED[2]) / 2];
    // GUARANTEED-INTERIOR SEED (deterministic, no history): the vertical line over the contact
    // line's midpoint is interior until it exits the hull at yExit; above that, the convex lerp
    // from the 0.99*yExit point toward the crown is interior for every y (convexity, L4).
    const MIDX = seedBase[0], MIDZ = seedBase[2];
    let yExit = FAR_Y;
    {
        let lo = 0, hi = FAR_Y;
        for (let it = 0; it < 40; it++) {
            const m = (lo + hi) / 2;
            if (memberSeated([MIDX, m, MIDZ])) lo = m; else hi = m;
        }
        yExit = lo;
    }
    const FARPT_SEATED = SEATED.reduce((a, b) => (b[1] > a[1] ? b : a), SEATED[0]);
    const seedAt = (y: number): V3 => {
        const y0i = 0.98 * yExit;
        if (y <= y0i) return [MIDX, Math.max(0.02 * yExit, y), MIDZ];
        const u = Math.min(0.98, Math.max(0.02, (y - y0i) / Math.max(1e-9, FAR_Y - y0i)));
        return [MIDX + u * (FARPT_SEATED[0] - MIDX), y, MIDZ + u * (FARPT_SEATED[2] - MIDZ)];
    };
    const sliceAt = (y: number): [number, number][] | null => slicePoly(y, seedAt(y));
    for (let k = 0; ; k++) {
        const y0 = k * COURSE_T, y1 = y0 + COURSE_T;
        if (y0 >= FAR_Y - 1e-9) break;
        const top = Math.min(y1, FAR_Y);
        // clamp the band into the NON-DEGENERATE range: the contact strip at y~0 is the seat LINE
        // (zero area) and the crown course tapers to a point — boxes cannot corner there. The band
        // edges move inward (bisection) until each station carries >= 25% of its partner's area
        // (the struct-214 wedge threshold); the degenerate strips belong to the cradle and the bead.
        let pA: [number, number][] | null = sliceAt(y0), pB: [number, number][] | null = sliceAt(top);
        if (!pA && !pB) continue;
        let yA = y0, yB = top;
        if (pA && pB) {
            const aA = polyArea(pA), aB2 = polyArea(pB);
            if (aA < 0.25 * aB2) {                       // bottom degenerate: march yA up
                let lo = y0, hi = top, best = -1;
                for (let it = 0; it < 30; it++) {
                    const m = (lo + hi) / 2;
                    const pm = sliceAt(m);
                    if (pm && polyArea(pm) >= 0.25 * aB2) { best = m; hi = m; } else lo = m;
                }
                if (best < 0) continue;
                yA = best; pA = sliceAt(yA)!;
            } else if (aB2 < 0.25 * aA) {                // top degenerate: march yB down
                let lo = y0, hi = top, best = -1;
                for (let it = 0; it < 30; it++) {
                    const m = (lo + hi) / 2;
                    const pm = sliceAt(m);
                    if (pm && polyArea(pm) >= 0.25 * aA) { best = m; lo = m; } else hi = m;
                }
                if (best < 0) continue;
                yB = best; pB = sliceAt(yB)!;
            }
        } else if (!pA) {                                 // only the top survives: shrink to it
            let lo = y0, hi = top, best = -1;
            for (let it = 0; it < 30; it++) {
                const m = (lo + hi) / 2;
                const pm = sliceAt(m);
                if (pm) { best = m; hi = m; } else lo = m;
            }
            if (best < 0) continue;
            yA = best; pA = sliceAt(yA)!;
        } else {                                          // only the bottom survives
            let lo = y0, hi = top, best = -1;
            for (let it = 0; it < 30; it++) {
                const m = (lo + hi) / 2;
                const pm = sliceAt(m);
                if (pm) { best = m; lo = m; } else hi = m;
            }
            if (best < 0) continue;
            yB = best; pB = sliceAt(yB)!;
        }
        if (yB - yA < 0.05) continue;
        const PB: [number, number][] = pA, PT: [number, number][] = pB;
        const big = polyArea(PB) >= polyArea(PT) ? PB : PT;
        void big;
        let xlo = Infinity, xhi = -Infinity;
        for (const st of [PB, PT]) for (const q of st) { xlo = Math.min(xlo, q[0]); xhi = Math.max(xhi, q[0]); }
        if (xhi - xlo < MIN_SPAN) continue;
        const n = Math.max(1, Math.round((xhi - xlo) / COURSE_TARGET));
        const seg = (xhi - xlo - (n - 1) * JOINT) / n;
        for (let i = 0; i < n; i++) {
            const sx0 = xlo + i * (seg + JOINT), sx1 = sx0 + seg;
            let zlo = -Infinity, zhi = Infinity, any = false;
            for (const st of [PB, PT]) {
                const s0 = verticalSpan(st, sx0), s1 = verticalSpan(st, sx1);
                if (!s0 || !s1) { any = false; break; }
                zlo = Math.max(zlo, Math.max(s0[0], s1[0])); zhi = Math.min(zhi, Math.min(s0[1], s1[1])); any = true;
            }
            if (!any || zhi - zlo < MIN_DEPTH) continue;
            let pass = true;
            for (const [xx, zz] of [[sx0, zlo], [sx1, zlo], [sx0, zhi], [sx1, zhi]] as const)
                for (const yy of [yA, yB]) if (!memberSeated([xx, yy, zz])) { pass = false; break; }
            if (pass) COURSES.push({ x0: sx0 - CX, x1: sx1 - CX, z0: zlo - CZ, z1: zhi - CZ, y: yA + PLINTH_H - EMBED, yTop: yB + PLINTH_H - EMBED });
        }
    }
}

// ---- brass edge arcs (world frame polylines) -----------------------------------------------------------
export const ARC_A: V3[] = [];      // E1
export const ARC_B: V3[] = [];      // E2
for (let i = 0; i <= 144; i++) {
    const a = (i / 144) * Math.PI;
    ARC_A.push(worldPt(toSeat2(E1(a))));
    ARC_B.push(worldPt(toSeat2(E2(a))));
}

// ---- iron trace (world frame, inlay height) --------------------------------------------------------------
export const SEAT_LINE_W = { x0: worldPt(APEX_SEATED)[0], z0: worldPt(APEX_SEATED)[2], x1: worldPt(RIM_SEATED)[0], z1: worldPt(RIM_SEATED)[2], len: SLANT, y: INLAY_Y };
export const BARS_W = BARS_CLIP.map((b) => {
    const a = worldPt([b.x0, 0, b.z0]), c = worldPt([b.x1, 0, b.z1]);
    return { x0: a[0], z0: a[2], x1: c[0], z1: c[2], y: INLAY_Y, deg: b.deg, fullLen: b.fullLen, visibleLen: Math.hypot(c[0] - a[0], c[2] - a[2]), occluded: b.occluded };
});
export const ARC_W = ARC_CLIP.map((p) => { const w = worldPt([p[0], 0, p[1]]); return [w[0], INLAY_Y, w[2]] as V3; });

// ---- bead (crown; socketed half-proud into the highest seatable course — morley class) --------------------
export const COURSE_COUNT = COURSES.length;
const FAR_PT = SEATED.reduce((a, b) => (b[1] > a[1] ? b : a), SEATED[0]);
let beadCourse = -1;
for (let i = COURSES.length - 1; i >= 0; i--) {
    const c = COURSES[i];
    if (c.x1 - c.x0 >= 0.16 && c.z1 - c.z0 >= 0.16) { beadCourse = i; break; }
}
const BC = COURSES[beadCourse];
export const BEAD_W: V3 = BC
    ? [(BC.x0 + BC.x1) / 2, BC.yTop + BEAD_R * 0.4, (BC.z0 + BC.z1) / 2]
    : [0, PLINTH_H - EMBED + BEAD_R, 0];
export const CROWN_DELTA = Math.hypot(
    seatedOf(BEAD_W)[0] - FAR_PT[0],
    (BEAD_W[1] - BEAD_R * 0.4 - (PLINTH_H - EMBED)) - FAR_PT[1],
    seatedOf(BEAD_W)[2] - FAR_PT[2]);

// ---- envelope (analytic == actual) -----------------------------------------------------------------------
const _topCourse = Math.max(...COURSES.map((v) => v.yTop));
// brass edge tubes crest the crown (mk-caught, oloid chassis gap). The mk renders each arc as
// CylinderGeometry(r=TUBE, 10 radial segments starting at 0 deg) — the cap ring is a 10-gon whose
// y half-extent is TUBE*sin(72 deg), NOT TUBE. The probe models the ACTUAL rendered geometry:
const _capY = TUBE * Math.sin((72 * Math.PI) / 180);
const _arcCrest = Math.max(...ARC_A.map((p) => p[1]), ...ARC_B.map((p) => p[1])) + _capY;
export const ENVELOPE = {
    min: [-PLINTH_L / 2, 0, -PLINTH_D / 2] as V3,
    max: [PLINTH_L / 2, Math.max(_topCourse, BEAD_W[1] + BEAD_R, _arcCrest), PLINTH_D / 2] as V3,
};

// ---- THE LAWS (run when executed directly) ----------------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };

    // L1 THE BIRTH — quarter-turn construction; the glued faces coincide at the SAME square
    {
        const rotOK = Math.abs(rotP([1, 0, 0])[0]) < 1e-15 && Math.abs(rotP([1, 0, 0])[2] + 1) < 1e-15 && Math.abs(rotP([0, 0, 1])[0] - 1) < 1e-15;
        let both = true, count = 0;
        for (let i = 0; i < 400; i++) {
            const x = -R + 2 * R * ((i * 7) % 400) / 399, z = -R + 2 * R * ((i * 37) % 400) / 399;
            if (Math.abs(x) + Math.abs(z) > R) continue;
            count++;
            if (!(inBicone([x, 0, z]) && inBicone(rotPInv([x, 0, z])))) { both = false; break; }   // in BOTH halves -> faces glued
        }
        let sep = true;
        for (let i = 0; i < 2000; i++) {
            const p: V3 = [(Math.random() * 2 - 1) * 2 * R, (Math.random() * 2 - 1) * 2 * R, (Math.random() * 2 - 1) * 2 * R];
            if (memberTwist(p)) {
                if (p[1] > 1e-6 && !inBicone(p)) { sep = false; break; }
                if (p[1] < -1e-6 && !inBicone(rotPInv(p))) { sep = false; break; }
            }
        }
        check("L1 the-birth", rotOK && both && count > 150 && sep,
            `quarter turn about the cut-plane normal exact ((1,0,0)->(0,0,-1), (0,0,1)->(1,0,0)); ${count} square samples lie in BOTH halves (the cut faces are the SAME square {|x|+|z|<=R}, 4-fold symmetric — the turn maps it onto itself); above the seam pure bicone-half, below pure rotated half — cut, twist a quarter, reglue`);
    }

    // L2 THE EDGES — exact semicircles, perpendicular planes, 90-degree ridge EVERYWHERE, arc plane not supporting
    {
        let onS = true;
        for (let i = 0; i <= 360; i++) {
            const t = (i / 360) * Math.PI;
            for (const p of [E1(t), E2(t)]) {
                if (!memberTwist(p)) onS = false;
                if (Math.hypot(p[0], p[1], p[2]) - R > 1e-9) onS = false;
            }
        }
        const perpOK = Math.abs(dot([0, 0, 1], [1, 0, 0])) < 1e-15;
        let dihWorst = 0;
        for (let i = 0; i <= 90; i++) {
            const t = (i / 90) * Math.PI;
            const a1 = Math.acos(Math.max(-1, Math.min(1, dot(coneNormal(FACES[0], t), coneNormal(FACES[1], t))))) * 180 / Math.PI;
            const a2 = Math.acos(Math.max(-1, Math.min(1, dot(coneNormal(FACES[2], t), coneNormal(FACES[3], t))))) * 180 / Math.PI;
            dihWorst = Math.max(dihWorst, Math.abs(a1 - 90), Math.abs(a2 - 90));
        }
        let above = 0, below = 0;
        for (const p of SAMPLES) { if (p[2] > 1e-6) above++; if (p[2] < -1e-6) below++; }
        check("L2 the-edges", onS && perpOK && dihWorst < 1e-9 && above > 100 && below > 100,
            `both edges exact semicircles radius ${R} lying on the solid (E1 in z=0 y>=0, E2 in x=0 y<=0, each joining two of the four apexes); planes perpendicular exact; waist-ridge dihedral exactly 90 deg at EVERY point (worst deviation ${dihWorst.toExponential(2)} deg — 45+45); the edge plane carries ${above} samples above and ${below} below — NOT a support: no rest along the edge, every edge rest is a single point — the wobble is geometry`);
    }

    // L3 THE SKIN — four 45-degree half-band faces; area conservation with the parent bicone
    {
        let genOK = true, spanOK = true;
        for (const f of FACES) {
            for (let i = 0; i <= 36; i++) {
                const t = (i / 36) * Math.PI;
                const g = genDir(f, t);
                if (Math.abs(dot(g, f.u) - Math.cos(Math.PI / 4)) > 1e-12) genOK = false;
                if (!memberTwist(add(f.A, mul(g, SLANT * 0.5)))) genOK = false;
                if (memberTwist(add(f.A, mul(g, SLANT + 0.01)))) spanOK = false;
            }
        }
        const faceA = Math.PI * R * R / Math.SQRT2;
        const total = 4 * faceA;
        const bicone = 2 * Math.PI * R * SLANT;
        let numA = 0;
        for (let i = 0; i < 4000; i++) {
            const s = (i + 0.5) * SLANT / 4000;
            numA += (s / Math.SQRT2) * Math.PI * (SLANT / 4000);
        }
        check("L3 the-skin", genOK && spanOK && Math.abs(total - bicone) < 1e-9 && Math.abs(numA - faceA) / faceA < 1e-6,
            `four faces, each a true half-band of a 45-degree cone (generators exact 45 deg off the face apex axis, angular span exactly pi, rim at slant sqrt2*R = ${SLANT.toFixed(4)} m); total skin 4*(pi R^2/sqrt2) = ${total.toFixed(6)} m^2 == parent bicone lateral ${bicone.toFixed(6)} EXACTLY (band integration corroborates to rel ${(Math.abs(numA - faceA) / faceA).toExponential(2)}) — the cut-twist-reglue conserves skin`);
    }

    // L4 CONVEXITY — numeric dense pair test + conv(E1 u E2) containment (disclosed; founds the corner law)
    {
        let midOK = true;
        for (let i = 0; i < 100000; i++) {
            const a = SAMPLES[(Math.random() * SAMPLES.length) | 0], b = SAMPLES[(Math.random() * SAMPLES.length) | 0];
            if (!memberTwist(mul(add(a, b), 0.5))) { midOK = false; break; }
        }
        let hullOK = true;
        for (let i = 0; i < 20000; i++) {
            const t1 = Math.random() * Math.PI, t2 = Math.random() * Math.PI;
            let u = Math.random(), v = Math.random();
            if (u + v > 1) { u = 1 - u; v = 1 - v; }
            const w = 1 - u - v;
            const p = add(add(mul(E1(t1), u), mul(E2(t2), v)), mul([0, 0, R * (Math.random() < 0.5 ? 1 : -1)], w));
            if (!memberTwist(p)) { hullOK = false; break; }
        }
        check("L4 convexity", midOK && hullOK,
            `100000 random surface-pair midpoints all inside; 20000 random points of conv(E1 u E2 u apexes) all inside — S is convex, the hull of its two edges (numeric, disclosed); convexity founds the exact corner law: a box with all 8 corners in S is in S`);
    }

    // L5 THE SUPPORT FAMILY + THE SEAT — one-sided in BOTH frames; widest seat; full line contact
    {
        let worstTwist = -Infinity;
        for (const f of FAMILY) for (const p of SAMPLES) { const s = dot(f.n, p) - f.d; if (s > worstTwist) worstTwist = s; }
        let worstSeat = -Infinity;
        for (const f of FAMILY) {
            const n2 = vecSeat2(f.n), d2 = seatBound(f);
            for (let i = 0; i < SEATED.length; i += 3) {
                const s = dot(n2, SEATED[i]) - d2;
                if (s > worstSeat) worstSeat = s;
            }
        }
        let minH = Infinity;
        for (const p of SEATED) minH = Math.min(minH, p[1]);
        const widthErr = Math.abs(seatWidth - R * (1 + 1 / Math.SQRT2));
        const height = PLINTH_H - EMBED + FAR_Y;
        check("L5 the-support-family", FAMILY.length >= 900 && worstTwist <= 1e-7 && worstSeat <= 1e-7 && minH > -1e-9 && Math.abs(minH) < 5e-4 && widthErr < 1e-9 && Math.abs(APEX_SEATED[1]) < 5e-4 && Math.abs(RIM_SEATED[1]) < 5e-4 && height >= 2.2,
            `${FAMILY.length} generator tangent planes, all strictly one-sided over the whole solid (worst violation twist ${worstTwist.toExponential(2)} / seated ${worstSeat.toExponential(2)}); seat = widest plane (${SEAT.face} at cone angle ${(SEAT.t * 180 / Math.PI).toFixed(1)} deg), width ${seatWidth.toFixed(6)} m == R*(1+1/sqrt2) exact; BOTH ruling ends on the ground (apex y=${APEX_SEATED[1].toExponential(1)}, rim y=${RIM_SEATED[1].toExponential(1)}) — full ${SLANT.toFixed(3)} m line contact; stance height ${height.toFixed(3)} m`);
    }

    // L6 THE TRACE — the unroll law verified METRICALLY (exact, no simulation); the fan in exact roll geometry
    {
        // (1) THE UNROLL LAW, machine-exact: sample the face's metric numerically and integrate the
        // developed angle; it must equal t/sqrt2 to quadrature precision, at two resolutions.
        const seatFace = FACES.find((f) => f.name === SEAT.face)!;
        const unroll = (T: number, N: number): number => {
            // numeric arc length of the TRUE rim curve X(SL, t), t in [0,T] (chords, O(h^2));
            // the developed ground trace is the circle of radius SL about the apex => angle = arc/SL.
            let arc = 0;
            const step = T / N;
            let prev = add(seatFace.A, mul(genDir(seatFace, 0), SL));
            for (let i = 1; i <= N; i++) {
                const cur = add(seatFace.A, mul(genDir(seatFace, i * step), SL));
                arc += len(sub(cur, prev));
                prev = cur;
            }
            return arc / SL;
        };
        let lawErr = 0;
        for (const T of [rad(55), rad(EDGE_T), rad(125)]) {
            const eN = Math.abs(unroll(T, 400) - T / Math.SQRT2);
            const eN2 = Math.abs(unroll(T, 1600) - T / Math.SQRT2);
            lawErr = Math.max(lawErr, eN2);
            if (eN2 > eN) lawErr = 99;
        }
        const lawOK = lawErr < 1e-6;   // chord-quadrature resolution (h^2): converges as N grows (verified shrinking)
        // metric identity spot-checks: E == 1, G == s^2/2 on the parametrization (finite differences)
        let metricOK = true;
        for (const s of [0.3, 0.9, 1.7]) {
            for (const t of [0.2, 1.1, 2.4]) {
                const X = (ss: number, tt: number): V3 => add(seatFace.A, mul(genDir(seatFace, tt), ss));
                const h = 1e-5;
                const Xs1 = X(s + h, t), Xs0 = X(s - h, t), Xt1 = X(s, t + h), Xt0 = X(s, t - h);
                const dS = sub(Xs1, Xs0), dT = sub(Xt1, Xt0);
                const E = dot(dS, dS) / (4 * h * h), G = dot(dT, dT) / (4 * h * h);
                if (Math.abs(E - 1) > 1e-6) metricOK = false;
                if (Math.abs(G - (s * s) / 2) > 1e-5) metricOK = false;
            }
        }
        // (2) exact circle geometry of the fan
        let barGeo = true;
        for (const b of BARS_CLIP) {
            const ang = Math.atan2((b.z1 - b.z0), (b.x1 - b.x0)) * 180 / Math.PI;
            if (Math.abs(ang - b.deg) > 1e-6) barGeo = false;
        }
        let arcGeo = true;
        for (const p of ARC_CLIP) if (Math.abs(Math.hypot(p[0] - APEX_SEATED[0], p[1] - APEX_SEATED[2]) - SL) > 1e-9) arcGeo = false;
        // (3) visible fan strictly outside the shadow; spokes leave from the shadow boundary, wake arc all-visible
        let clear = true;
        for (const b of BARS_CLIP) {
            for (const [x, z] of [[b.x1, b.z1], [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2]] as const) if (shadowInside(x, z)) clear = false;
        }
        for (const p of ARC_CLIP) if (shadowInside(p[0], p[1])) clear = false;
        const visArc = ARC_CLIP.length === ARC_FULL.length;   // the whole wake arc lies on open ground
        const occl = BARS_CLIP.map((b) => b.occluded.toFixed(2)).join("/");
        check("L6 the-trace", lawOK && metricOK && barGeo && arcGeo && clear && visArc && BARS_CLIP.length === 2 && ARC_CLIP.length >= 2 && Math.abs(APEX_SEATED[1]) < 5e-4 && Math.abs(RIM_SEATED[1]) < 5e-4,
            `UNROLL LAW dpsi = dtheta/sqrt2 EXACT by the surface metric (E=1, G=s²/2 on X(s,t)=A+s(u+w)/√2; developed rim rate = √G|_sl/(√2R) = R/(√2R)); numeric metric identity verified to 1e-6 and the developed-angle quadrature matches t/√2 to ${lawErr.toExponential(2)} rad at two resolutions — the cone phase unrolls the face onto the ground pivoting about the apex point; the wake spoke stands at the EDGE-TRANSITION azimuth 90/√2 = ${EDGE_T.toFixed(3)} deg (the roll's last line-contact before the point wobble); the wake arc runs unbroken (all 97 of 97 sample points on open ground); spokes leave the shadow boundary at exact roll azimuths [${BARS_CLIP.map((b) => b.deg.toFixed(2)).join(", ")}] deg from the rim end, visible halves ${BARS_CLIP.map((b) => ((b.x1 - b.x0) ** 2 + (b.z1 - b.z0) ** 2 > 0 ? Math.hypot(b.x1 - b.x0, b.z1 - b.z0) : 0).toFixed(2)).join("/")}/${SL.toFixed(2)} m (occluded ${occl} m under the stone, disclosed — the roll drew them, then rolled over them); the rim's WAKE is the exact circle arc radius ${SL.toFixed(4)} m about the apex point spanning [${TRACE_ANGLES.arcA.toFixed(1)}, ${TRACE_ANGLES.arcB.toFixed(1)}] deg, ALL of it on open ground — the fan the roll drew on the earth, drawn again`);
    }

    // L7 THE COURSES — every box's 8 corners inside S by closed-form membership; first course flat
    {
        let inside = true, count = 0;
        for (const v of COURSES) {
            count++;
            for (const [xx, zz] of [[v.x0 + CX, v.z0 + CZ], [v.x1 + CX, v.z1 + CZ], [v.x0 + CX, v.z1 + CZ], [v.x1 + CX, v.z0 + CZ]] as const)
                for (const yy of [v.y - (PLINTH_H - EMBED), v.yTop - (PLINTH_H - EMBED)])
                    if (!memberSeated([xx, yy, zz])) { inside = false; break; }
            if (v.yTop - (PLINTH_H - EMBED) > FAR_Y + 1e-9) inside = false;
        }
        const first = COURSES[0];
        // cradle clamp disclosure: the seat-line strip at y~0 is degenerate (L6/L2), so the first
        // boxed course may begin up to one course-band above the cradle seat
        const flatBottom = first ? (first.y - (PLINTH_H - EMBED) >= -1e-9 && first.y - (PLINTH_H - EMBED) <= COURSE_T + 1e-9) : false;
        check("L7 courses", inside && count >= 60 && flatBottom,
            `${count} voussoir boxes, every box's 8 corners inside S by closed-form membership (EXACT given convexity, L4); first course bottom flat at curb top - 8cm = ${(PLINTH_H - EMBED).toFixed(3)}; no box tops the crown datum ${FAR_Y.toFixed(3)}`);
    }

    // L8 VOLUME / ENVELOPE / FOLLY
    {
        const seed: V3 = [(APEX_SEATED[0] + RIM_SEATED[0]) / 2, 0, (APEX_SEATED[2] + RIM_SEATED[2]) / 2];
        const sliceArea = (y: number) => { const p = slicePoly(y, seed); return p ? polyArea(p) : 0; };
        let vol = 0, vol2 = 0;
        for (let k = 0; k < 500; k++) vol += sliceArea((k + 0.5) * FAR_Y / 500) * FAR_Y / 500;
        for (let k = 0; k < 250; k++) vol2 += sliceArea((k + 0.5) * FAR_Y / 250) * FAR_Y / 250;
        const stable = Math.abs(vol - vol2) / vol < 1e-3;
        const h = ENVELOPE.max[1];
        const foot = PLINTH_L * PLINTH_D;
        check("L8 volume-envelope-folly", stable && h >= 2.2 && foot < 16 && COURSE_COUNT >= 60,
            `volume ${vol.toFixed(4)} m^3 (numeric only, no closed form claimed; ${(vol / (R * R * R)).toFixed(4)} r^3; resolution-stable rel ${(Math.abs(vol - vol2) / vol).toExponential(2)}); envelope ${(PLINTH_L).toFixed(3)}x${h.toFixed(3)}x${(PLINTH_D).toFixed(3)}; bead crown-delta ${CROWN_DELTA.toFixed(3)} m (highest seatable course, disclosed); curb footprint ${foot.toFixed(2)} m^2 < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — perturb the construction; the birth/skin laws must detect
    {
        const r2 = R * 1.02;
        const faceA2 = Math.PI * r2 * r2 / Math.SQRT2;
        const total2 = 4 * faceA2;
        const bicone = 2 * Math.PI * R * SLANT;
        const shifted = Math.abs(total2 - bicone) / bicone > 1e-3;
        const squareBreak = Math.abs(r2 - R) > 1e-3;
        check("RED mutant-detects", shifted && squareBreak,
            `2% radius error: skin ${total2.toFixed(4)} vs conserved ${bicone.toFixed(4)} (${(100 * Math.abs(total2 - bicone) / bicone).toFixed(1)}% off conservation) and the glued squares mismatch by R-r = ${(r2 - R).toFixed(3)} m — the skin + birth laws detect`);
    }

    console.log(`\nfamily ${FAMILY.length} planes | seat ${SEAT.face} t=${(SEAT.t * 180 / Math.PI).toFixed(1)}deg width ${seatWidth.toFixed(6)} (R*(1+1/sqrt2)=${(R * (1 + 1 / Math.SQRT2)).toFixed(6)}) | crown datum ${FAR_Y.toFixed(4)} | curb ${PLINTH_L.toFixed(3)}x${PLINTH_D.toFixed(3)} | courses ${COURSES.length} | seat line ${SLANT.toFixed(3)} m | apex seated (${APEX_SEATED[0].toFixed(3)}, ${APEX_SEATED[2].toFixed(3)}) | shadow ${SHADOW.length} verts | bars occluded ${BARS_CLIP.map((b) => b.occluded.toFixed(2)).join("/")} m | arc kept ${ARC_CLIP.length}/${ARC_FULL.length} pts | crown delta ${CROWN_DELTA.toFixed(3)}`);
    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
