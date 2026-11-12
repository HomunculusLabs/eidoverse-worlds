// struct208-probe-oloid.ts — THE ONE CONTRACT for R11-28 THE OLOID:
// THE SOLID AND ITS SKIN.
//
// FORM SELECTION (fresh grep this tick, all ledgers + census 344): oloid
// 0/0/0 — never named, never barred, never built (only hyperboloid
// substrings, already named in struct-206's kin-check). Kin-check fresh:
// reuleaux TAKEN (struct-83/84), unduloid is a Delaunay CMC roulette (a
// surface of revolution — different read class: string-of-beads water),
// sphericon zero presence (disclosed proximity: the oloid's sibling; the
// oloid is the classical Schatz 1929 form). Register: opens the
// BITANGENT-DEVELOPABLE / ROLLING-SOLID branch — the hull of two linked
// perpendicular circles, the village's first CLOSED developable solid.
//
// THE THEOREMS CARVED (all machine-verified in LAWS below before any build):
// 1. THE HULL: two congruent circles C1 (plane z=0, center O) and C2 (plane
//    y=0, center (1,0,0) — in R=1 units), each passing through the other's
//    center, perpendicular planes. The convex hull's ENTIRE boundary is the
//    union of ruling segments [P1(u), P2±(v(u))] plus the two crease arcs.
//    Closed-form pairing: cos v = cos u / (1 − cos u), u ∈ [π/3, 5π/3] (a
//    240° arc on EACH circle), two mirror branches ±.
// 2. CONSTANT RULING: every ruling has length exactly √3·R (|D|² = 3).
// 3. THE AREA THEOREM (Dirnböck): total surface area = 4πR² EXACTLY — the
//    oloid's skin equals a sphere's skin of the same radius. Verified by
//    mesh integration convergence + the development's plane area.
// 4. THE DEVELOPMENT (exact closed forms, derived this tick): the w=0 walk
//    is arc1 itself (unit speed); geodesic curvature of the walk
//    κg(u) = sinλ(u) = s·√(1−2cos u)/√(2−2cos u) EXACT — from
//    κ·N = κn·n̂ + κg·(n̂×T1) with N = −P1 and n̂×T1 = cosλ·ẑ − sinλ·P1;
//    the ruling's intrinsic angle β from the walk tangent carries sign
//    σβ = (T1×d̂)·n̂; ruling prints are STRAIGHT, length √3 (rulings are
//    geodesics of a developable). Isometry evidence: per-band plane area ==
//    3D band area, far-edge cusp closure, band-mirror congruence (σ), total
//    == 4π.
// 5. THE TUMBLE: the solid placed mid-roll on the apron plane, touching
//    EXACTLY along one ruling (the contact ruling lies in the plane, the
//    whole hull above it) — how an oloid actually rolls: on its rulings,
//    paving its whole skin onto the ground.
//
// WORLD FRAME (Math Avenue convention, root stays identity — struct-188
// law): apron slab top at y=APRON_H; the oloid above it in the tumble
// pose; the development inlaid proud on the apron behind the contact
// ruling; sole night bead at the leading hull point (s363 sole-bead law).
//
// Exports are consumed by assets/mkv3-oloid.ts (the build) and
// struct208-decode-oloid.ts (the audit). Run directly: executes LAWS L1..L8
// + RED control, exits 0 only if ALL pass.

// ---- constants ---------------------------------------------------------------------------------------
export const RW = 1.1;                        // world scale: math R=1 -> world R=RW metres
export const APRON_H = 0.12;                  // apron slab thickness (walkable film on grade)
export const INLAY_W = 0.06;                  // development outline ribbon width
export const INLAY_T = 0.025;                 // inlay thickness
export const PROUD = 0.022;                   // inlay rides this far above apron top (no coplanar z-fight)
export const LINE_W = 0.03;                   // ruling print line width
export const CONTACT_W = 0.07;                // contact (frontier) ruling print width
export const BEAD_R = 0.07;                   // sole night bead radius
export const NU = 240;                        // strip u-stations (arc-uniform on C1's 240° arc)
export const NW = 8;                          // ruling-subdivision (w stations between the arcs)
export const U_A = Math.PI / 3, U_B = 5 * Math.PI / 3;   // C1 crease arc extent (240°)
export const U_STAR = Math.PI;                // contact ruling: mid-strip, the balanced tumble

// ---- math frame (R = 1) ------------------------------------------------------------------------------
export const P1 = (u: number): [number, number, number] => [Math.cos(u), Math.sin(u), 0];
export const cosV = (u: number) => Math.cos(u) / (1 - Math.cos(u));           // the pairing
export const P2 = (u: number, s: number): [number, number, number] => {       // s = +1/-1 branch
    const cv = cosV(u), sv = s * Math.sqrt(Math.max(0, 1 - cv * cv));
    return [1 + cv, 0, sv];
};
export const ruling = (u: number, s: number): [[number, number, number], [number, number, number]] =>
    [P1(u), P2(u, s)];
// outward support normal at the tie (u, s)
export function nHat(u: number, s: number): [number, number, number] {
    const t = Math.sqrt(Math.max(0, 1 - 2 * Math.cos(u)));
    const inv = 1 / Math.sqrt(1 + t * t);
    const cl = inv, sl = s * t * inv;
    const p = P1(u);
    return [cl * p[0], cl * p[1], sl];
}

// ---- L1: hull laws ------------------------------------------------------------------------------------
export function supportOK(u: number, s: number, samples = 1440): { ok: boolean; worst: number } {
    const n = nHat(u, s);
    const h = 1 / Math.sqrt(1 + (1 - 2 * Math.cos(u)));   // cosλ
    let worst = -Infinity;
    for (let i = 0; i < samples; i++) {
        const a = (2 * Math.PI * i) / samples;
        const q1 = P1(a);
        worst = Math.max(worst, n[0] * q1[0] + n[1] * q1[1] + n[2] * q1[2] - h);
        if (a >= U_A && a <= U_B) {
            for (const q of [P2(a, +1), P2(a, -1)]) {
                worst = Math.max(worst, n[0] * q[0] + n[1] * q[1] + n[2] * q[2] - h);
            }
        }
    }
    return { ok: worst <= 1e-9, worst };
}

// ---- strips (math frame grids) ------------------------------------------------------------------------
export function stripGrid(s: number, nu = NU, nw = NW) {
    const P: [number, number, number][][] = [];
    for (let i = 0; i <= nu; i++) {
        const u = U_A + ((U_B - U_A) * i) / nu;
        const [a, b] = ruling(u, s);
        const row: [number, number, number][] = [];
        const m = Math.max(1, nw);
        for (let j = 0; j <= m; j++) {
            const t = j / m;
            row.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
        }
        P.push(row);
    }
    return P;
}

// robust triangulation of a row-tapered grid (last row one vertex short)
function gridTriangles(G: [number, number, number][][]): [number[], number[], number[]][] {
    const tris: [number[], number[], number[]][] = [];
    for (let i = 0; i < G.length - 1; i++) {
        const Ri = G[i], Rj = G[i + 1];
        const n = Math.max(Ri.length, Rj.length) - 1;
        for (let j = 0; j < n; j++) {
            const a = Ri[j];
            const b = j + 1 < Ri.length ? Ri[j + 1] : a;
            const c = j + 1 < Rj.length ? Rj[j + 1] : Rj[j];
            const d = Rj[j];
            if (b !== a || c !== d) tris.push([a, c, d]);
            if (b !== a || c !== d) tris.push([a, b, c]);
        }
    }
    return tris;
}
const Ekey = (p: number[]) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)},${Math.round(p[2] * 1e6)}`;
function triStats(a: number[], b: number[], c: number[]) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const area = 0.5 * Math.hypot(cx, cy, cz);
    const vol = (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    return { area, vol };
}
export function stripArea3D(s: number, nu = 240, nw = 4): number {
    let area = 0;
    for (const [a, b, c] of gridTriangles(stripGrid(s, nu, nw))) area += triStats(a, b, c).area;
    return area;
}
export function hullMetrics(nu: number, nw: number) {
    let area = 0, vol = 0;
    const edgeMap = new Map<string, number>();
    for (const s of [1, -1] as const) {
        let sv = 0;
        for (const [a, b, c] of gridTriangles(stripGrid(s, nu, nw))) {
            const st = triStats(a, b, c);
            area += st.area;
            sv += st.vol;
            for (const [p, q] of [[a, b], [b, c], [c, a]] as [number[], number[]][]) {
                const key = [Ekey(p), Ekey(q)].sort().join("|");
                edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
            }
        }
        vol += Math.abs(sv);
    }
    let open = 0; for (const c of edgeMap.values()) if (c !== 2) open++;
    return { area, vol, open };
}

// ---- L3 helper ----------------------------------------------------------------------------------------
export function sigma(p: [number, number, number]): [number, number, number] { return [1 - p[0], p[2], p[1]]; }

// ---- small vec helpers --------------------------------------------------------------------------------
function norm3(v: [number, number, number]): [number, number, number] { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
function cross3(a: [number, number, number], b: [number, number, number]): [number, number, number] { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot3(a: [number, number, number], b: [number, number, number]) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

// ---- L4: development (unroll one band; EXACT closed forms) --------------------------------------------
// Walk q(u) = development of arc1 (unit speed). ψ' = κg = sinλ (signed by branch).
// Ruling print direction angle = ψ + β, β signed by (T1×d̂)·n̂. Prints straight, length √3.
export function developBand(s: number, nu = NU) {
    const SQ3 = Math.sqrt(3);
    const q: [number, number][] = [[0, 0]];
    const far: [number, number][] = [];
    const lines: [number, number][][] = [];
    let psi = 0;
    const step = (U_B - U_A) / nu;
    for (let i = 0; i <= nu; i++) {
        const u = U_A + step * i;
        const [p1, p2] = ruling(u, s);
        const dRaw: [number, number, number] = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        const dh = norm3(dRaw);
        const T1: [number, number, number] = [-Math.sin(u), Math.cos(u), 0];
        const nh = nHat(u, s);
        const cosb = dot3(T1, dh);
        const sinb = dot3(cross3(T1, dh), nh);
        const beta = Math.atan2(sinb, cosb);
        const base = q[q.length - 1];
        const ea = psi + beta;
        const e: [number, number] = [Math.cos(ea), Math.sin(ea)];
        lines.push([base, [base[0] + SQ3 * e[0], base[1] + SQ3 * e[1]]]);
        far.push(lines[lines.length - 1][1]);
        if (i === nu) break;
        const t = Math.sqrt(Math.max(0, 1 - 2 * Math.cos(u)));
        const kg = s * t / Math.sqrt(1 + t * t);        // κg = sinλ, exact
        psi += kg * step;
        q.push([q[q.length - 1][0] + Math.cos(psi) * step, q[q.length - 1][1] + Math.sin(psi) * step]);
    }
    return { q, far, lines };
}

export function polyArea(pts: [number, number][]): number {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i], r = pts[(i + 1) % pts.length];
        a += p[0] * r[1] - r[0] * p[1];
    }
    return Math.abs(a) / 2;
}

// ---- L5: tumble pose ----------------------------------------------------------------------------------
export const TUMBLE = (() => {
    const [a, b] = ruling(U_STAR, +1);
    const d = norm3([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    const n = nHat(U_STAR, +1);                          // outward support normal at the contact tie
    const f1 = d;                                        // ruling -> +X
    const f2: [number, number, number] = [-n[0], -n[1], -n[2]];   // up into the solid side
    const f3 = norm3(cross3(f1, f2));                    // trail -> +Z
    return { f1, f2, f3, a, b };
})();
export function toWorld(p: [number, number, number]): [number, number, number] {
    const { f1, f2, f3 } = TUMBLE;
    const rel: [number, number, number] = [(p[0] - TUMBLE.a[0]) * RW, (p[1] - TUMBLE.a[1]) * RW, (p[2] - TUMBLE.a[2]) * RW];
    return [dot3(rel, f1), dot3(rel, f2) + APRON_H, dot3(rel, f3)];
}

// ---- final composition --------------------------------------------------------------------------------
export const SOLVE = (() => {
    const devA = developBand(+1), devB = developBand(-1);
    const wa = toWorld(TUMBLE.a), wb = toWorld(TUMBLE.b);
    const iStar = NU / 2;
    const ax = wa[0], az = wa[2], bx = wb[0], bz = wb[2];
    const DX = bx - ax, DZ = bz - az, L2 = Math.hypot(DX, DZ);
    const mk = (seg: [number, number][]) => {
        const sx = seg[0][0], sy = seg[0][1];
        const dx = seg[1][0] - sx, dy = seg[1][1] - sy, L1 = Math.hypot(dx, dy);
        const co = (dx * DX + dy * DZ) / (L1 * L2), si = (dx * DZ - dy * DX) / (L1 * L2);
        return (p: [number, number]): [number, number] => {
            const x = p[0] - sx, y = p[1] - sy;
            return [ax + x * co - y * si, az + x * si + y * co];
        };
    };
    const mapA = mk(devA.lines[iStar]);
    const mapB = mk(devB.lines[iStar]);
    const spine = devA.q.map(mapA), spineB = devB.q.map(mapB);
    const farA = devA.far.map(mapA), farB = devB.far.map(mapB);
    const linesA = devA.lines.map((l) => l.map(mapA));
    const linesB = devB.lines.map((l) => l.map(mapB));
    const hullA = stripGrid(+1).map((row) => row.map((p) => toWorld(p)));
    const hullB = stripGrid(-1).map((row) => row.map((p) => toWorld(p)));
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxY = -Infinity;
    for (const G of [hullA, hullB]) for (const row of G) for (const p of row) {
        minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
        minZ = Math.min(minZ, p[2]); maxZ = Math.max(maxZ, p[2]); maxY = Math.max(maxY, p[1]);
    }
    for (const p of [...spine, ...farA, ...farB, ...spineB]) {
        minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
        minZ = Math.min(minZ, p[1]); maxZ = Math.max(maxZ, p[1]);
    }
    const M = 0.45;
    minX -= M; maxX += M; minZ -= M; maxZ += M;
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const shift = (p: [number, number, number]): [number, number, number] => [p[0] - cx, p[1], p[2] - cz];
    const shift2 = (p: [number, number]): [number, number] => [p[0] - cx, p[1] - cz];
    return {
        hullA: hullA.map((row) => row.map(shift)), hullB: hullB.map((row) => row.map(shift)),
        spine: spine.map(shift2), spineB: spineB.map(shift2),
        farA: farA.map(shift2), farB: farB.map(shift2),
        linesA: linesA.map((l) => l.map(shift2)), linesB: linesB.map((l) => l.map(shift2)),
        apron: { min: [minX - cx, 0, minZ - cz] as number[], max: [maxX - cx, APRON_H, maxZ - cz] as number[] },
        maxY,
        contact: [shift(wa), shift(wb)] as [[number, number, number], [number, number, number]],
    };
})();

// ---- L6: bead — leading hull point along the roll (+Z) ------------------------------------------------
export const BEAD_W = (() => {
    let best: [number, number, number] = [0, 0, 0], bz = -Infinity;
    for (const G of [SOLVE.hullA, SOLVE.hullB]) for (const row of G) for (const p of row) if (p[2] > bz) { bz = p[2]; best = p; }
    return best;
})();

export const ENVELOPE = (() => {
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    const acc = (p: number[]) => { for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } };
    for (const G of [SOLVE.hullA, SOLVE.hullB]) for (const row of G) for (const p of row) acc(p);
    acc(SOLVE.apron.min); acc(SOLVE.apron.max);
    acc([BEAD_W[0], BEAD_W[1] + BEAD_R, BEAD_W[2]]);
    return { min: mn as number[], max: mx as number[] };
})();

// ---- LAWS (run when executed directly) ----------------------------------------------------------------
if (import.meta.main) {
    let fails = 0;
    const law = (id: string, ok: boolean, detail: string) => { console.log(`${ok ? "PASS" : "FAIL"} [${id}] ${detail}`); if (!ok) fails++; };

    // L1: pairing + arcs + constant ruling + support
    {
        let worstD = 0, worstSup = -Infinity;
        for (let i = 0; i <= 400; i++) {
            const u = U_A + ((U_B - U_A) * i) / 400;
            for (const s of [1, -1]) {
                const [a, b] = ruling(u, s);
                worstD = Math.max(worstD, Math.abs(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) - Math.sqrt(3)));
                worstSup = Math.max(worstSup, supportOK(u, s, 720).worst);
            }
        }
        law("L1a", worstD < 1e-12, `constant ruling √3: worst dev ${(worstD * 1e12).toFixed(2)}e-12`);
        law("L1b", worstSup <= 1e-9, `support planes: worst excess ${worstSup.toExponential(2)} (≤1e-9, boundary sampling 720/rev + valid arc, 802 stations)`);
        const arcSpan = (U_B - U_A) * 180 / Math.PI;
        law("L1c", Math.abs(arcSpan - 240) < 1e-9, `crease arcs 240° each (C1 span ${arcSpan.toFixed(6)}°; C2 span 240° by the mirror σ)`);
    }
    // L2: closed surface + area theorem + volume convergence
    {
        const m1 = hullMetrics(120, 6), m2 = hullMetrics(240, 12);
        law("L2a", m1.open === 0 && m2.open === 0, `closed surface: open edges ${m1.open}/${m2.open} at 121×7 / 241×13 grids (taper-aware census)`);
        const target = 4 * Math.PI;
        const rel1 = Math.abs(m1.area - target) / target, rel2 = Math.abs(m2.area - target) / target;
        law("L2b", rel2 < 2e-3 && rel2 < rel1, `area theorem 4πR²: coarse ${m1.area.toFixed(5)} (rel ${(rel1 * 100).toFixed(4)}%) -> fine ${m2.area.toFixed(5)} (rel ${(rel2 * 100).toFixed(4)}%) convergent`);
        const vrel = Math.abs(m2.vol - m1.vol) / Math.abs(m2.vol);
        law("L2c", vrel < 5e-3, `volume convergence (per-strip signed|abs|sum): ${m1.vol.toFixed(5)} -> ${m2.vol.toFixed(5)} R³ (rel ${(vrel * 100).toFixed(3)}%)`);
    }
    // L3: band mirror congruence (σ symmetry) — σ maps band + w=1 edge onto band − w=1 edge
    {
        const A = stripGrid(+1, 240, 2), B = stripGrid(-1, 240, 2);
        let worst = 0;
        for (let i = 0; i <= 240; i++) {
            const a = A[i][A[i].length - 1], b = sigma(B[i][B[i].length - 1]);
            worst = Math.max(worst, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
        }
        const w0 = Math.hypot(A[0][0][0] - B[0][0][0], A[0][0][1] - B[0][0][1], A[0][0][2] - B[0][0][2]);
        law("L3", worst < 1e-12 && w0 < 1e-12, `σ symmetry σ(x,y,z)=(1−x,z,y) swaps the bands: w=1 edge deviation ${worst.toExponential(2)}, shared w=0 spine ${w0.toExponential(2)}`);
    }
    // L4: development isometry
    {
        const dA = developBand(+1, 480), dB = developBand(-1, 480);
        const cuspA = Math.hypot(dA.far[0][0] - dA.far[dA.far.length - 1][0], dA.far[0][1] - dA.far[dA.far.length - 1][1]);
        const cuspB = Math.hypot(dB.far[0][0] - dB.far[dB.far.length - 1][0], dB.far[0][1] - dB.far[dB.far.length - 1][1]);
        law("L4a", cuspA < 5e-3 && cuspB < 5e-3, `far-edge cusp closure at the nose print: ${cuspA.toExponential(2)} / ${cuspB.toExponential(2)} (481-station walk)`);
        const aA = polyArea([...dA.q, ...[...dA.far].reverse()]);
        const aB = polyArea([...dB.q, ...[...dB.far].reverse()]);
        const sA = stripArea3D(+1, 480, 4), sB = stripArea3D(-1, 480, 4);
        const relA = Math.abs(aA - sA) / sA, relB = Math.abs(aB - sB) / sB;
        law("L4b", relA < 3e-3 && relB < 3e-3, `band isometry: plane ${aA.toFixed(4)}/${aB.toFixed(4)} vs 3D ${sA.toFixed(4)}/${sB.toFixed(4)} R² (rel ${(relA * 100).toFixed(3)}%/${(relB * 100).toFixed(3)}%)`);
        const devTotal = aA + aB, target = 4 * Math.PI;
        law("L4c", Math.abs(devTotal - target) / target < 3e-3, `total developed skin == 4πR²: ${devTotal.toFixed(4)} vs ${target.toFixed(4)}`);
    }
    // L5: tumble pose + glue
    {
        const wa = toWorld(TUMBLE.a), wb = toWorld(TUMBLE.b);
        law("L5a", Math.abs(wa[1] - APRON_H) < 1e-12 && Math.abs(wb[1] - APRON_H) < 1e-12, `contact ruling lies in the apron plane: y ${wa[1].toFixed(12)} / ${wb[1].toFixed(12)} == ${APRON_H}`);
        let minY = Infinity;
        for (const G of [SOLVE.hullA, SOLVE.hullB]) for (const row of G) for (const p of row) minY = Math.min(minY, p[1]);
        law("L5b", minY > APRON_H - 1e-6, `whole hull above the plane: min y ${minY.toFixed(6)} ≥ ${APRON_H}`);
        const c = SOLVE.contact;
        const dContact = Math.hypot(c[0][0] - c[1][0], c[0][2] - c[1][2]);
        law("L5c", Math.abs(dContact - Math.sqrt(3) * RW) < 1e-9, `frontier ruling length √3·RW = ${(Math.sqrt(3) * RW).toFixed(6)} (decoded ${dContact.toFixed(6)})`);
        const glueA = SOLVE.linesA[NU / 2], glueB = SOLVE.linesB[NU / 2];
        const t = [
            Math.hypot(glueA[0][0] - SOLVE.contact[0][0], glueA[0][1] - SOLVE.contact[0][2]),
            Math.hypot(glueA[1][0] - SOLVE.contact[1][0], glueA[1][1] - SOLVE.contact[1][2]),
            Math.hypot(glueB[0][0] - SOLVE.contact[0][0], glueB[0][1] - SOLVE.contact[0][2]),
            Math.hypot(glueB[1][0] - SOLVE.contact[1][0], glueB[1][1] - SOLVE.contact[1][2]),
        ];
        law("L5d", Math.max(...t) < 1e-9, `both bands' developments glue at the world contact ruling: terms ${t.map((v) => v.toExponential(1)).join(" ")}`);
    }
    // L6: grounding + bead + sole-night
    {
        const s = SOLVE;
        const inside = (p: number[]) => p[0] >= s.apron.min[0] - 0.02 && p[0] <= s.apron.max[0] + 0.02 && p[2] >= s.apron.min[2] - 0.02 && p[2] <= s.apron.max[2] + 0.02;
        let all = true;
        for (const G of [s.hullA, s.hullB]) for (const row of G) for (const p of row) if (!inside(p)) all = false;
        law("L6a", all, `hull footprint rides the apron (all grid verts inside apron AABB + 2cm)`);
        law("L6b", BEAD_W[1] > APRON_H + 0.25, `sole bead at the leading hull point (${BEAD_W.map((v) => v.toFixed(3)).join(", ")}) — above the tumble, s363 sole-bead law`);
    }
    // L7: envelope + class
    {
        const e = ENVELOPE;
        const sx = e.max[0] - e.min[0], sy = e.max[1] - e.min[1], sz = e.max[2] - e.min[2];
        const fp = sx * sz;
        law("L7", sy > 0 && fp > 0, `envelope ${sx.toFixed(2)}x${sy.toFixed(2)}x${sz.toFixed(2)} footprint ${fp.toFixed(1)} m², h ${sy.toFixed(2)}; origin-centered by construction (shift applied)`);
    }
    // L8: RED control — corrupt pairing, laws must detect
    {
        const bad = (u: number) => Math.cos(u) / (1.2 - Math.cos(u));
        let worstD = 0;
        for (let i = 0; i <= 50; i++) {
            const u = U_A + ((U_B - U_A) * i) / 50;
            const cv = bad(u), sv = Math.sqrt(Math.max(0, 1 - cv * cv));
            const b: [number, number, number] = [1 + cv, 0, sv], a = P1(u);
            worstD = Math.max(worstD, Math.abs(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) - Math.sqrt(3)));
        }
        law("L8", worstD > 1e-3, `RED: mutated pairing violates the constant-ruling law by ${worstD.toFixed(4)} (law detects)`);
    }

    console.log(fails === 0 ? "PROBE ALL PASS" : `PROBE FAILURES: ${fails}`);
    process.exit(fails === 0 ? 0 : 1);
}
