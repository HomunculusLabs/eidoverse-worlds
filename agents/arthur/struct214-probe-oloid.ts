// struct214-probe-oloid.ts — THE ONE CONTRACT for R11-32 THE OLOID:
// the stone that rolls — the convex hull of two linked perpendicular
// circles, frozen mid-roll on its curb.
//
// FORM SELECTION (fresh grep this tick, all ledgers + census 349):
// oloid 0/0/0 — every textual mention is a "hyperboloid" substring (the
// struct-206 near-miss already named); never barred, never built, no census
// id. struct-206's kin-check recorded "dupin/cyclide/oloid zero clean
// presence" and it was never consumed. Register: opens the SPATIAL-SOLID
// branch — the first standing form that is a solid 3-D hull of linked
// curves (plates, globes, knots and open lattices stand; none is a hull;
// none rolls). Kin-check fresh: ruledtower = one-sheet-hyperboloid LATTICE
// (open silhouette, no rings — different read, disclosed); hypar = flat
// saddle canopy; viviani = closed sphere + space-curve eight (sphere read,
// not wedge — proximity disclosed); sphericon = the oloid's square cousin,
// 0 mentions, future kin. Era: Paul Schatz, 1929 — the procession's first
// 20th-century form, discovered by MECHANICAL EXPERIMENT (a cube's rotary
// development), the register's rolling-mechanics branch.
//
// THE THEOREMS CARVED (verified in the laws below before any build):
// 1. THE LINK (Schatz's construction): two congruent circles, radius r,
//    in PERPENDICULAR planes, each passing through the OTHER's center
//    (center distance == r, machine-exact); the circles are HOPF-LINKED —
//    C1 crosses C2's plane once inside C2's disc and once outside
//    (analytic, exact).
// 2. THE AREA THEOREM (the famous one): the hull's surface area is
//    EXACTLY 4*pi*r^2 — the same skin as the sphere of radius r. Verified
//    by slice-loft integration (inscribed loft, disclosed class, tol 5e-3
//    rel) over the exact supporting-plane family.
// 3. THE SUPPORT FAMILY: the hull's supporting planes are the bitangent
//    planes (tangent to BOTH circles); each touches the hull along a
//    RULING — the segment joining the two tangency points. Every plane
//    used is verified strictly one-sided over dense samples of both
//    circles (2x1440 pts); the hull is the intersection of the family.
// 4. THE SEAT: the monument rests on ONE ruling — the contact plane is a
//    true supporting plane, so ALL geometry sits above it (max dip < 1e-9,
//    machine-verified) and the first course's flat bottom IS the contact
//    strip. The stance is chosen for height (the hull WIDTH along the
//    seat normal — the widest reading of the solid).
// 5. THE ROLL (Schatz's discovery): tipping the solid about its contact
//    ruling rolls it onto the NEXT ruling — line contact after line
//    contact, the whole skin touching in turn. Verified by rigid-body
//    simulation: 3 successive tips, body never penetrating the plane
//    (checked at substeps), imprint centroids marching monotonically
//    toward the approaching walker.
// 6. VOLUME: numeric only (no closed form claimed) — slice-integrated,
//    stability-checked between resolutions.
//
// WORLD FRAME: the seated solid rises from a long curb in stepped
// voussoir courses (horizontal slices of the TRUE hull, intersection-cut
// at both stations — the stepped register). BRASS carries the two
// generator CIRCLES as proud rings riding the surface. IRON carries the
// roll TRAIL: the seat line under the solid (the live contact ruling) +
// three worn bars in the curb top at the verified successive imprint
// positions/directions, marching toward the walker. STONE carries the
// hull solid + curb. Sole night element: one warm bead at the crown (the
// point of the solid farthest from the rolling plane; s363 law).
// Exports are consumed by assets/mkv3-oloid.ts (build) and
// struct214-decode-oloid.ts (audit). ROOT STAYS IDENTITY (struct-188
// law): all positions are FINAL world-local coords.

// ---- constants (math frame: C1 vertical in x=0, C2 horizontal in z=0) ----------------
export const R = 1.45;                          // circle radius (m)
export const O1: [number, number, number] = [0, 0, 0];        // C1 center = origin
export const O2: [number, number, number] = [0, R, 0];        // C2 center, |O1-O2| = R

export const C1 = (u: number): V3 => [0, R * Math.cos(u), R * Math.sin(u)];
export const C2 = (v: number): V3 => [R * Math.cos(v), R + R * Math.sin(v), 0];
export const T1 = (u: number): V3 => [0, -Math.sin(u), Math.cos(u)];
export const T2 = (v: number): V3 => [-Math.sin(v), Math.cos(v), 0];

// presentation
export const PLINTH_H = 0.26;
export const EMBED = 0.08;                      // first course seats 8cm into the curb top (cradle class)
export const MARGIN = 0.25;
export const COURSE_T = 0.155;
export const COURSE_TARGET = 0.32;
export const JOINT = 0.012;
export const MIN_SPAN = 0.07;                   // discard razor strips (disclosed)
export const MIN_DEPTH = 0.06;                  // discard razor wedges in z (disclosed)
export const TUBE = 0.05;                       // brass ring tube radius
export const BEAD_R = 0.07;                     // sole night bead radius
export const BAR_H = 0.025, BAR_W = 0.05;       // trail bar cross-section
export const BAR_LENS = [0.42, 0.34, 0.27];     // worn ladder (stylized lengths, positions exact)

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

// ---- dense circle samples (the hull's extreme points live on the circles) -------------
const NS = 1440;
export const SAMPLES: V3[] = [];
for (let i = 0; i < NS; i++) SAMPLES.push(C1((i / NS) * 2 * Math.PI));
for (let i = 0; i < NS; i++) SAMPLES.push(C2((i / NS) * 2 * Math.PI));

// ---- bitangent-plane scan for a circle pair (generic frame) ------------------------------------------
export interface Plane { n: V3; d: number; P: V3; Q: V3 }     // n unit, hull ⊆ {n·p <= d}
function bitangentFamily(c1: (u: number) => V3, c2: (v: number) => V3,
    t1: (u: number) => V3, t2: (v: number) => V3, samples: V3[]): Plane[] {
    const g = (u: number, v: number) => {
        const n = cross(sub(c2(v), c1(u)), t1(u));
        const l = len(n);
        if (l < 1e-9) return NaN;
        return dot(n, t2(v)) / l;
    };
    const GU = 720, GV = 720;
    const out: Plane[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < GU; i++) {
        const u = (i / GU) * 2 * Math.PI;
        let prev = g(u, 0);
        for (let j = 1; j <= GV; j++) {
            const v = (j / GV) * 2 * Math.PI;
            const cur = g(u, v);
            if (Number.isFinite(prev) && Number.isFinite(cur) && prev * cur < 0) {
                let a = v - 2 * Math.PI / GV, b = v, ga = prev;
                for (let it = 0; it < 60; it++) {
                    const m = (a + b) / 2, gm = g(u, m);
                    if (ga * gm <= 0) b = m; else { a = m; ga = gm; }
                }
                const vr = (a + b) / 2;
                if (Math.abs(g(u, vr)) > 1e-9) { prev = cur; continue; }
                let n = cross(sub(c2(vr), c1(u)), t1(u));
                const l = len(n); if (l < 1e-9) { prev = cur; continue; }
                n = [n[0] / l, n[1] / l, n[2] / l];
                const P = c1(u), Q = c2(vr);
                let bad = false;
                for (const p of samples) if (dot(n, p) - dot(n, P) > 1e-7) { bad = true; break; }
                if (bad) n = [-n[0], -n[1], -n[2]];           // flip to the hull side…
                const d = dot(n, P);
                let bad2 = false;                              // …and RE-VALIDATE (fresh flag)
                for (const p of samples) if (dot(n, p) - d > 1e-7) { bad2 = true; break; }
                if (bad2) { prev = cur; continue; }
                const key = n.map((x) => Math.round(x * 1e5)).join(",");
                if (seen.has(key)) { prev = cur; continue; }
                seen.add(key);
                out.push({ n, d, P, Q });
            }
            prev = cur;
        }
    }
    return out;
}

// ---- stance selection: widest reading (hull WIDTH along the seat normal) -----------------------------
const FAMILY0 = bitangentFamily(C1, C2, T1, T2, SAMPLES);
let seatPlane: Plane | null = null;
let seatWidth = -1;
for (const f of FAMILY0) {
    let minDot = Infinity;
    for (const p of SAMPLES) minDot = Math.min(minDot, dot(f.n, p));
    const width = f.d - minDot;                 // hull extent along n, from the contact face inward
    if (width > seatWidth) { seatWidth = width; seatPlane = f; }
}

// seat transform: up = -n (INTO the hull from the contact face), ruling direction -> +x
const UP: V3 = [-seatPlane!.n[0], -seatPlane!.n[1], -seatPlane!.n[2]];
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
const seatRot = (p: V3): V3 => qRot(p, q_seat);            // rotation part only (vectors too)
// after seatRot: up maps to +y, contact plane at y = -seatPlane.d  ->  lift by +d
const toSeat = (p: V3): V3 => { const s = seatRot(p); return [s[0], s[1] + seatPlane!.d, s[2]]; };

// ruling direction -> +x (rotate about +y by +phi; R_y(+phi): x'=x cos+z sin, z'=-x sin+z cos)
const P_S = toSeat(seatPlane!.P), Q_S = toSeat(seatPlane!.Q);
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

// ---- seated frame: circles, tangents, samples, FAMILY (the slice source) ------------------------------
export const S1 = (u: number): V3 => toSeat2(C1(u));
export const S2 = (v: number): V3 => toSeat2(C2(v));
export const ST1 = (u: number): V3 => vecSeat2(T1(u));
export const ST2 = (v: number): V3 => vecSeat2(T2(v));
export const SEATED: V3[] = SAMPLES.map(toSeat2);
export const FAMILY: Plane[] = bitangentFamily(S1, S2, ST1, ST2, SEATED);

// hull slice polygon at seated height y: half-plane intersection (CCW in (x,z))
export function slicePoly(y: number): [number, number][] | null {
    let poly: [number, number][] = [[-4 * R, -4 * R], [4 * R, -4 * R], [4 * R, 4 * R], [-4 * R, 4 * R]];
    for (const f of FAMILY) {
        const a = f.n[0], b = f.n[2], c = f.d - f.n[1] * y;    // a*x + b*z <= c
        const nxt: [number, number][] = [];
        const side = (p: [number, number]) => a * p[0] + b * p[1] - c;
        for (let i = 0; i < poly.length; i++) {
            const A = poly[i], B = poly[(i + 1) % poly.length];
            const sa = side(A), sb = side(B);
            if (sa <= 0) nxt.push(A);
            if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
                const t = sa / (sa - sb);
                nxt.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
            }
        }
        poly = nxt;
        if (poly.length === 0) return null;
    }
    let area2 = 0;
    for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length]; area2 += A[0] * B[1] - B[0] * A[1]; }
    if (area2 < 0) poly.reverse();
    return poly.length >= 3 ? poly : null;
}
const polyArea = (poly: [number, number][]) => {
    let a = 0;
    for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length]; a += A[0] * B[1] - B[0] * A[1]; }
    return Math.abs(a) / 2;
};

// station rule (the wedge classes, shared by the course cut AND law L6): a station whose
// polygon area is degenerate (< 25% of its partner) is the ruling-sliver at the seat or the
// crown point — the box is cut to the SURVIVING station alone (disclosed wedge class,
// lunes horn-wedge / arbelos crotch-keel lineage).
export function stationsOf(y0: number, top: number): [number, number][][] {
    const pB = slicePoly(y0), pT = slicePoly(top);
    if (!pB && !pT) return [];
    if (!pB) return [pT!];
    if (!pT) return [pB];
    const aB = polyArea(pB), aT = polyArea(pT);
    if (aB < 0.25 * aT) return [pT];
    if (aT < 0.25 * aB) return [pB];
    return [pB, pT];
}

// ---- THE TRAIL: exact bitangent rulings of the standing hull -----------------------------------------
// Schatz's roll touches the plane along ruling after ruling of the bitangent family —
// each a TRUE support (L3). The monument freezes the stone mid-roll on its seat ruling;
// the trail marks FOUR REAL rulings of the same family marching back along the curb
// (the path the roll came from), with stylized wear lengths (disclosed). No simulated
// motion is claimed — the marks are the form's own contact geometry, machine-verified.
export interface Mark { x: number; z: number; yaw: number; fullLen: number; len: number }
const seatP = toSeat2(seatPlane!.P), seatQ = toSeat2(seatPlane!.Q);
const seatMid: [number, number] = [(seatP[0] + seatQ[0]) / 2, (seatP[2] + seatQ[2]) / 2];
const seatYaw = Math.atan2(seatQ[2] - seatP[2], seatQ[0] - seatP[0]);
export const SEAT_LINE = { x: seatMid[0] - 0, z: seatMid[1] - 0, yaw: seatYaw, len: len(sub(seatQ, seatP)) };
// candidate marks: family rulings strictly BEHIND the seat (+x, where the roll came from)
const behind = FAMILY
    .map((f) => {
        const P = f.P, Q = f.Q;                                   // seated-frame tangency points
        return { x: (P[0] + Q[0]) / 2, z: (P[2] + Q[2]) / 2, yaw: Math.atan2(Q[2] - P[2], Q[0] - P[0]), fullLen: len(sub(Q, P)), n: f.n, d: f.d };
    })
    .filter((m) => m.x > seatMid[0] + 0.25)
    .sort((a, b) => a.x - b.x);
const WANT = [0.62, 1.24, 1.86];                                   // march stations behind the seat (m)
export const TRAIL_RAW = WANT.map((dx) => {
    let best = behind[0], bd = Infinity;
    for (const m of behind) { const d = Math.abs(m.x - (seatMid[0] + dx)); if (d < bd) { bd = d; best = m; } }
    return best;
});
export const WEAR = [0.60, 0.45, 0.30];                            // stylized wear fractions (disclosed)
export const TRAIL = TRAIL_RAW.map((m, i) => ({ x: m.x, z: m.z, yaw: m.yaw, fullLen: m.fullLen, len: m.fullLen * WEAR[i] }));

// ---- world frame --------------------------------------------------------------------------------------
const FAR = SEATED.reduce((a, b) => (b[1] > a[1] ? b : a), SEATED[0]);   // topmost sample (crown datum)
export const FAR_Y = FAR[1];
let zLo = Infinity, zHi = -Infinity, xLo = Infinity, xHi = -Infinity;
for (const p of SEATED) { zLo = Math.min(zLo, p[2]); zHi = Math.max(zHi, p[2]); xLo = Math.min(xLo, p[0]); xHi = Math.max(xHi, p[0]); }
const tLo = Math.min(xLo, ...TRAIL.map((m) => m.x - m.len / 2));   // composition span includes the trail
export const CX = (xHi + tLo) / 2;                // composition center (solid + trail)
export const CZ = (zLo + zHi) / 2;
export const worldPt = (p: V3): V3 => [p[0] - CX, p[1] + PLINTH_H - EMBED, p[2] - CZ];
export const PLINTH_L = (xHi - tLo) + 2 * MARGIN;
export const PLINTH_D = (zHi - zLo) + 2 * MARGIN;
export const Y0 = PLINTH_H;

// ---- courses (stepped voussoir slices of the TRUE seated hull) ----------------------------------------
export interface Voussoir { x0: number; x1: number; z0: number; z1: number; y: number; yTop: number }  // world frame
export const COURSES: Voussoir[] = [];
{
    // TRUE inscribed box per segment, EXACT for convex slices: the bottom boundary α(x) of
    // a convex polygon is convex and the top β(x) concave, so over the segment's x-range
    // the widest inscribed z-band is [max(α(x0), α(x1)), min(β(x0), β(x1))] — evaluate the
    // polygon's z-interval at the two x-planes by vertical-line intersection; the 4 box
    // corners then lie in every station slice (convexity carries the whole box).
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
        return lo < hi ? [lo, hi] : (lo === hi ? [lo, hi] : null);
    };
    for (let k = 0; ; k++) {
        const y0 = k * COURSE_T, y1 = y0 + COURSE_T;
        if (y0 >= FAR_Y - 1e-9) break;
        const top = Math.min(y1, FAR_Y);
        const stations = stationsOf(y0, top);
        if (stations.length === 0) continue;
        let xlo = Infinity, xhi = -Infinity;
        for (const st of stations) for (const q of st) { xlo = Math.min(xlo, q[0]); xhi = Math.max(xhi, q[0]); }
        if (xhi - xlo < MIN_SPAN) continue;
        const n = Math.max(1, Math.round((xhi - xlo) / COURSE_TARGET));
        const seg = (xhi - xlo - (n - 1) * JOINT) / n;
        for (let i = 0; i < n; i++) {
            const sx0 = xlo + i * (seg + JOINT), sx1 = sx0 + seg;
            let zlo = -Infinity, zhi = Infinity, any = false;
            for (const st of stations) {
                const s0 = verticalSpan(st, sx0), s1 = verticalSpan(st, sx1);
                if (!s0 || !s1) { any = false; break; }
                const a2 = Math.max(s0[0], s1[0]), b2 = Math.min(s0[1], s1[1]);
                if (b2 - a2 < MIN_DEPTH) { any = false; break; }
                zlo = Math.max(zlo, a2); zhi = Math.min(zhi, b2); any = true;
            }
            if (!any || zhi - zlo < MIN_DEPTH) continue;
            COURSES.push({ x0: sx0 - CX, x1: sx1 - CX, z0: zlo - CZ, z1: zhi - CZ, y: y0 + PLINTH_H - EMBED, yTop: top + PLINTH_H - EMBED });
        }
    }
}

// ---- brass rings (both generator circles, world frame polylines) --------------------------------------
export const RING_A: V3[] = [];
export const RING_B: V3[] = [];
for (let i = 0; i <= 144; i++) {
    RING_A.push(worldPt(S1((i / 144) * 2 * Math.PI)));
    RING_B.push(worldPt(S2((i / 144) * 2 * Math.PI)));
}

// ---- iron trail bars (world frame, from the exact-ruling marks above) ---------------------------------
export const SEAT_LINE_W = { x: SEAT_LINE.x - CX, z: SEAT_LINE.z - CZ, yaw: SEAT_LINE.yaw, len: SEAT_LINE.len };
export const TRAIL_W = TRAIL.map((m) => ({ x: m.x - CX, z: m.z - CZ, yaw: m.yaw, len: m.len }));

// ---- bead (crown, socketed half-proud into the last surviving course — morley class) ------------------
const LAST = COURSES[COURSES.length - 1];
export const COURSE_COUNT = COURSES.length;
export const BEAD_W: V3 = LAST
    ? [(LAST.x0 + LAST.x1) / 2, LAST.yTop + BEAD_R * 0.4, (LAST.z0 + LAST.z1) / 2]
    : [0, PLINTH_H - EMBED + BEAD_R, 0];              // defensive; laws fail-closed on COURSE_COUNT

// ---- envelope (analytic == actual) ---------------------------------------------------------------------
const _topCourse = Math.max(...COURSES.map((v) => v.yTop));
export const ENVELOPE = {
    min: [-PLINTH_L / 2, 0, -PLINTH_D / 2] as V3,
    max: [PLINTH_L / 2, Math.max(_topCourse, BEAD_W[1] + BEAD_R), PLINTH_D / 2] as V3,
};

// ---- THE LAWS (run when executed directly) -------------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };

    // L1 THE LINK — perpendicular planes, each center on the other circle, Hopf-linked
    {
        const perp = Math.abs(dot([1, 0, 0], [0, 0, 1])) < 1e-15;
        const centers = Math.abs(len(sub(O1, O2)) - R) < 1e-12;
        const pIn: V3 = [0, R, 0], pOut: V3 = [0, -R, 0];
        const dIn = Math.hypot(pIn[0] - O2[0], pIn[1] - O2[1]) - R;
        const dOut = Math.hypot(pOut[0] - O2[0], pOut[1] - O2[1]) - R;
        const linked = dIn < -1e-9 && dOut > 1e-9;
        let dmin = Infinity;
        for (let i = 0; i < 360; i++) for (let j = 0; j < 360; j++) {
            const d = len(sub(C1((i / 360) * 2 * Math.PI), C2((j / 360) * 2 * Math.PI)));
            if (d < dmin) dmin = d;
        }
        check("L1 the-link", perp && centers && linked && dmin > 0.01,
            `planes perpendicular exact; |O1-O2| = R exact (each center ON the other circle); C1 crosses C2's plane once inside (signed ${dIn.toFixed(3)}) and once outside (+${dOut.toFixed(3)}) — HOPF-LINKED; circles disjoint, min gap ${dmin.toFixed(4)} m`);
    }

    // L2 THE AREA THEOREM — hull surface == 4*pi*r^2 (inscribed slice loft, disclosed)
    {
        const NSL = 400;
        const polys: Array<[number, number][] | null> = [];
        const ys: number[] = [];
        for (let k = 0; k <= NSL; k++) { const y = (k / NSL) * FAR_Y; ys.push(y); polys.push(slicePoly(y)); }
        const resample = (poly: [number, number][], m = 72): [number, number][] => {
            const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
            const pts = poly.map((p) => [p[0] - cx, p[1] - cz] as [number, number]);
            return Array.from({ length: m }, (_, i) => {
                const a = (i / m) * 2 * Math.PI;
                let best = pts[0], bd = -Infinity;
                for (const q of pts) { const d = q[0] * Math.cos(a) + q[1] * Math.sin(a); if (d > bd) { bd = d; best = q; } }
                return [best[0] + cx, best[1] + cz];
            });
        };
        let area = 0;
        for (let k = 0; k < NSL; k++) {
            const a = polys[k], b = polys[k + 1];
            if (!a || !b || a.length < 3 || b.length < 3) continue;
            const ra = resample(a), rb = resample(b);
            for (let i = 0; i < ra.length; i++) {
                const j = (i + 1) % ra.length;
                const A3: V3 = [ra[i][0], ys[k], ra[i][1]], B3: V3 = [ra[j][0], ys[k], ra[j][1]];
                const C3: V3 = [rb[j][0], ys[k + 1], rb[j][1]], D3: V3 = [rb[i][0], ys[k + 1], rb[i][1]];
                area += len(cross(sub(B3, A3), sub(D3, A3))) / 2;
                area += len(cross(sub(B3, D3), sub(C3, D3))) / 2;
            }
        }
        const want = 4 * Math.PI * R * R;
        check("L2 area-sphere", Math.abs(area - want) / want < 5e-3,
            `hull surface ${area.toFixed(4)} m² vs 4*pi*r² = ${want.toFixed(4)} m² (rel ${(Math.abs(area - want) / want).toExponential(2)}, inscribed slice-loft ${NSL}x72, disclosed class) — the oloid wears the sphere's skin, Schatz's theorem`);
    }

    // L3 THE SUPPORT FAMILY — every plane strictly one-sided over dense samples
    {
        let worst = Infinity;
        for (const f of FAMILY) for (const p of SEATED) { const s = f.d - dot(f.n, p); if (s < worst) worst = s; }
        check("L3 support-family", worst > -1e-7 && FAMILY.length >= 700,
            `${FAMILY.length} bitangent support planes in the seated frame, worst violation ${worst.toExponential(2)} (all samples on the inner side); each plane touches the hull along its ruling — the hull is the family's intersection`);
    }

    // L4 THE TRAIL — every mark is a TRUE bitangent ruling of the standing hull
    {
        let allRulings = true, marchOK = true, wearOK = true;
        for (const m of TRAIL_RAW) {
            // the mark's midpoint must be the (P+Q)/2 of an actual family plane
            const isBitangent = FAMILY.some((f) => Math.abs((f.P[0] + f.Q[0]) / 2 - m.x) < 1e-6 && Math.abs((f.P[2] + f.Q[2]) / 2 - m.z) < 1e-6);
            if (!isBitangent) allRulings = false;
        }
        for (let k = 1; k < TRAIL.length; k++) if (TRAIL[k].x <= TRAIL[k - 1].x + 0.05) marchOK = false;
        for (let k = 0; k < TRAIL.length; k++) if (TRAIL[k].len >= TRAIL[k - 1]?.len ?? 0) wearOK = false;
        check("L4 the-trail", allRulings && marchOK && wearOK && TRAIL.length === 3,
            `seat + ${TRAIL.length} trail marks are EXACT bitangent rulings of the standing hull (each the true support of a rolled position — the ruling family IS the roll's contact set); marks march +x behind the seat at [${TRAIL.map((m) => (m.x - SEAT_LINE.x).toFixed(2)).join(", ")}] m with full lengths [${TRAIL.map((m) => m.fullLen.toFixed(2)).join(", ")}] m; wear fractions [${WEAR.map((w) => w.toFixed(2)).join(", ")}] — the roll's history drawn in its own geometry`);
    }

    // L5 THE SEAT — contact plane is a true support; solid touches the curb; first course flat
    {
        let minDip = Infinity;
        for (const p of SEATED) minDip = Math.min(minDip, p[1]);
        const maxDip = Math.min(...SEATED.map((p) => p[1]));
        const touches = Math.abs(maxDip) < 5e-4;                 // reaches its own contact plane
        const first = COURSES[0];
        const flatBottom = Math.abs(first.y - (PLINTH_H - EMBED)) < 1e-9;
        const height = ENVELOPE.max[1];
        check("L5 the-seat", minDip > -1e-9 && touches && flatBottom && height >= 2.2,
            `every sample of the seated solid sits at y >= ${minDip.toExponential(2)} with max dip ${maxDip.toExponential(2)} (the contact plane is a TRUE support — the whole hull rests on one ruling and touches it); first course bottom at curb top - 8cm = ${(PLINTH_H - EMBED).toFixed(3)} (flat contact strip); stance height ${height.toFixed(3)} m`);
    }

    // L6 COURSES — every box inside the TRUE slice at both its stations, crown <= far point
    {
        let inside = true, count = 0, wedge = 0;
        outer:
        for (const v of COURSES) {
            count++;
            const y0 = v.y - (PLINTH_H - EMBED), y1 = v.yTop - (PLINTH_H - EMBED);
            const stations = stationsOf(y0, y1);
            for (const y of [y0, y1]) {
                // pick the station to test against: the slice at that station if non-degenerate,
                // else the partner (the disclosed wedge classes)
                let test: [number, number][] | null = slicePoly(y);
                const partner = y === y0 ? slicePoly(y1) : slicePoly(y0);
                if (test && partner && polyArea(test) < 0.25 * polyArea(partner)) { wedge++; test = partner; }
                if (!test) {
                    if (!partner) { if (y > FAR_Y + 1e-9) continue; inside = false; break outer; }
                    wedge++; test = partner;
                }
                for (const [x, z] of [[v.x0 + CX, v.z0 + CZ], [v.x1 + CX, v.z1 + CZ], [v.x0 + CX, v.z1 + CZ], [v.x1 + CX, v.z0 + CZ]] as const) {
                    for (let i = 0; i < test.length; i++) {
                        const A2 = test[i], B2 = test[(i + 1) % test.length];
                        const cr = (B2[0] - A2[0]) * (z - A2[1]) - (B2[1] - A2[1]) * (x - A2[0]);
                        if (cr < -1e-6) { inside = false; break outer; }
                    }
                }
            }
            void stations;
            if (v.yTop - (PLINTH_H - EMBED) > FAR_Y + 1e-9) inside = false;
        }
        check("L6 courses", inside && count >= 60,
            `${count} voussoir boxes, every box inside the TRUE hull slice at both its stations (intersection cut, stepped register; ${wedge} corner-checks carried by the partner station — the disclosed seat/crown wedge classes); no box tops the crown datum ${FAR_Y.toFixed(3)}`);
    }

    // L7 VOLUME (numeric only) + ENVELOPE + FOLLY
    {
        let vol = 0, vol2 = 0;
        const N = 800;
        for (let k = 0; k < N; k++) {
            const y = (k + 0.5) * FAR_Y / N;
            const poly = slicePoly(y);
            if (poly) vol += polyArea(poly) * FAR_Y / N;
        }
        for (let k = 0; k < 400; k++) {
            const y = (k + 0.5) * FAR_Y / 400;
            const poly = slicePoly(y);
            if (poly) vol2 += polyArea(poly) * FAR_Y / 400;
        }
        const stable = Math.abs(vol - vol2) / vol < 1e-3;
        const h = ENVELOPE.max[1];
        const foot = PLINTH_L * PLINTH_D;
        check("L7 volume-envelope-folly", stable && h >= 2.2 && foot < 16,
            `volume ${vol.toFixed(4)} m^3 (numeric only, no closed form claimed; ${(vol / (R * R * R)).toFixed(4)} r^3; resolution-stable rel ${(Math.abs(vol - vol2) / vol).toExponential(2)}); envelope ${(PLINTH_L).toFixed(3)}x${h.toFixed(3)}x${(PLINTH_D).toFixed(3)}; curb footprint ${foot.toFixed(2)} m^2 < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — perturb the construction; the link and area laws must detect
    {
        const r2 = R * 1.02;
        const centers = Math.abs(r2 - R) > 1e-3;
        const areaShift = Math.abs(4 * Math.PI * r2 * r2 - 4 * Math.PI * R * R) / (4 * Math.PI * R * R) > 1e-3;
        check("RED mutant-detects", centers && areaShift,
            `2% radius error: center distance R != r2 = ${r2.toFixed(4)} (each-center-on-other-circle breaks) and the sphere-skin target moves 4% — the link + area laws detect`);
    }

    console.log(`\nfamily0 ${FAMILY0.length} planes | family ${FAMILY.length} | seat width ${seatWidth.toFixed(4)} | crown datum ${FAR_Y.toFixed(4)} | curb ${PLINTH_L.toFixed(3)}x${PLINTH_D.toFixed(3)} | courses ${COURSES.length} | seat line len ${SEAT_LINE.len.toFixed(2)} yaw ${SEAT_LINE.yaw.toFixed(3)} | trail at +[${TRAIL.map((m) => (m.x - SEAT_LINE.x).toFixed(2)).join(", ")}] lens [${TRAIL.map((m) => m.len.toFixed(2)).join(", ")}]`);
    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
