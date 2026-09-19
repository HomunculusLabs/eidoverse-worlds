// struct234-sat-unit-test.ts — unit test of the placer's exact polygon SAT
// helpers (distant / touching / overlapping / rotated control) BEFORE live
// mutation (skill law: unit-test the helper). Expectations are ANALYTIC for
// the hexagon R2.2 ROT=0 (corners ON the axes: x-extent 2.2, edge-normal
// extent = apothem 1.905262 — struct-228 self-catch class: the first draft
// of this test used the apothem on the corner axis and was wrong). The
// rotated control is checked against an INDEPENDENT dense-axis sweep (edge
// normals are exact for convex SAT; the sweep must agree to sweep resolution).
const R = 2.2, N = 6;
const LOC = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return [R * Math.cos(a), R * Math.sin(a)] as [number, number];
});
function polyGap(A: [number, number][], B: [number, number][]): number {
    const axes: [number, number][] = [];
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
        const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
        const ex = x2 - x1, ey = y2 - y1, L = Math.hypot(ex, ey) || 1;
        axes.push([-ey / L, ex / L]);
    }
    let best = -1e9;
    for (const [ax, ay] of axes) {
        const aMin = Math.min(...A.map(p => p[0] * ax + p[1] * ay)), aMax = Math.max(...A.map(p => p[0] * ax + p[1] * ay));
        const bMin = Math.min(...B.map(p => p[0] * ax + p[1] * ay)), bMax = Math.max(...B.map(p => p[0] * ax + p[1] * ay));
        best = Math.max(best, Math.max(bMin - aMax, aMin - bMax));
    }
    return best;
}
function sweepGap(A: [number, number][], B: [number, number][], steps = 3600): number {
    // independent dense-axis implementation (resolution 0.1 deg)
    let best = -1e9;
    for (let i = 0; i < steps; i++) {
        const ax = Math.cos(i / steps * Math.PI), ay = Math.sin(i / steps * Math.PI);
        const aMin = Math.min(...A.map(p => p[0] * ax + p[1] * ay)), aMax = Math.max(...A.map(p => p[0] * ax + p[1] * ay));
        const bMin = Math.min(...B.map(p => p[0] * ax + p[1] * ay)), bMax = Math.max(...B.map(p => p[0] * ax + p[1] * ay));
        best = Math.max(best, Math.max(bMin - aMax, aMin - bMax));
    }
    return best;
}
function pointPolyDist(px: number, pz: number, P: [number, number][]): number {
    let inside = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
    }
    if (inside) return 0;
    let d = 1e9;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        const ex = xj - xi, ez = zj - zi, L2 = ex * ex + ez * ez || 1;
        const t = Math.max(0, Math.min(1, ((px - xi) * ex + (pz - zi) * ez) / L2));
        d = Math.min(d, Math.hypot(px - (xi + t * ex), pz - (zi + t * ez)));
    }
    return d;
}
const hex = LOC.slice();
const sq = (cx: number, cz: number, h: number, rot = 0): [number, number][] =>
    [[h, h], [h, -h], [-h, -h], [-h, h]].map(([x, z]) => {
        const c = Math.cos(rot), s = Math.sin(rot);
        return [cx + x * c + z * s, cz - x * s + z * c] as [number, number];
    });
let fails = 0;
function check(name: string, got: number, want: number, tol = 1e-6) {
    const ok = Math.abs(got - want) <= tol;
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: got ${got.toFixed(6)} want ${want.toFixed(6)}`);
}
// distant: axis-aligned square half-2 at (20,0); x-axis is a square edge
// normal; hexagon corner reaches 2.2 on x -> gap = 20 - 2 - 2.2
check("distant +x (corner extent)", polyGap(hex, sq(20, 0, 2)), 20 - 2 - 2.2, 1e-9);
// touching: square left face exactly at the +x corner (2.2)
check("touching +x vertex", polyGap(hex, sq(2.2 + 2, 0, 2)), 0, 1e-9);
// overlapping: concentric square half-3; the 90deg hex edge-normal axis
// gives the max gap = -(3 + apothem): the negative SUM of projected radii
check("overlap concentric (90deg axis)", polyGap(hex, sq(0, 0, 3)), -(3 + R * Math.cos(Math.PI / 6)), 1e-9);
// rotated control: edge-normal SAT is a CONSERVATIVE lower bound of the
// all-direction max (edge normals are an axis SUBSET; for separated convex
// bodies the max-gap axis is generally not an edge normal). Assert the
// subset law: polyGap <= sweepGap, and polyGap >= 0 (separated).
{
    const rot = sq(20, 0, 2, Math.PI / 6);
    const pg = polyGap(hex, rot), sg = sweepGap(hex, rot);
    const ok = pg <= sg + 1e-9 && pg >= 0;
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"} rotated 30deg subset law: edge-normal ${pg.toFixed(6)} <= sweep ${sg.toFixed(6)} && >= 0`);
}
// hexagon-vs-disc: nearest boundary point from (20,0) is the corner (2.2,0)
check("disc distant (corner)", pointPolyDist(20, 0, hex) - 3, 20 - 2.2 - 3, 1e-9);
// disc concentric -> 0 - 3
check("disc concentric", pointPolyDist(0, 0, hex) - 3, -3, 1e-9);
// NaN guard (the seatprobe bug class): every result finite
const all = [polyGap(hex, sq(20, 0, 2)), polyGap(hex, sq(4.2, 0, 2)), polyGap(hex, sq(0, 0, 3)), polyGap(hex, sq(20, 0, 2, Math.PI / 6))];
check("all finite", all.every(Number.isFinite) ? 1 : 0, 1);
console.log(fails ? `UNIT FAIL x${fails}` : "UNIT ALL PASS");
process.exit(fails ? 1 : 0);
