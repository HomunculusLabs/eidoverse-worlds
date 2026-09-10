// struct157-probe-unduloid.ts — v2. Fixes the v1 CMC-check bug: finite
// differences on ψ-uniform samples explode where x is stationary. v2
// resamples the profile onto a UNIFORM-x grid (linear interp over the dense
// ψ-polyline) before taking r'(x), r''(x) — intrinsic-form curvatures.
const N = 7200;

function profile(a: number, e: number) {
    const b = a * Math.sqrt(1 - e * e), c = a * e;
    const psi0 = -Math.PI / 2;
    const speed = (psi: number) => Math.hypot(a * Math.sin(psi), b * Math.cos(psi));
    const s = new Float64Array(N + 1);
    for (let i = 1; i <= N; i++) {
        const p0 = psi0 + ((i - 1) / N) * 2 * Math.PI, p1 = psi0 + (i / N) * 2 * Math.PI;
        s[i] = s[i - 1] + 0.5 * (speed(p0) + speed(p1)) * (p1 - p0);
    }
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
        const psi = psi0 + (i / N) * 2 * Math.PI;
        const Px = a * Math.cos(psi), Py = b * Math.sin(psi);
        const alpha = Math.atan2(b * Math.cos(psi), -a * Math.sin(psi));
        const th = -alpha;
        const dx = c - Px, dy = -Py;
        pts.push({ x: s[i] + dx * Math.cos(th) - dy * Math.sin(th), y: dx * Math.sin(th) + dy * Math.cos(th) });
    }
    return { pts, period: s[N] };
}

// v3: parametric intrinsic curvatures in ψ (no resampling; conditioned):
// k_m = (r'x''−x'r'')/(x'²+r'²)^{3/2}, k_p = x'/(r·√(x'²+r'²)), H=1/(2a).
function cmcParam(a: number, pts: { x: number; y: number }[]) {
    const n = pts.length;
    const d1 = (i: number) => ({ x: (pts[i + 1].x - pts[i - 1].x) / 2, y: (pts[i + 1].y - pts[i - 1].y) / 2 });
    const d2 = (i: number) => ({ x: pts[i + 1].x - 2 * pts[i].x + pts[i - 1].x, y: pts[i + 1].y - 2 * pts[i].y + pts[i - 1].y });
    let worst = 0, worstI = 0, mono = 0;
    const H0 = 1 / (2 * a);
    for (let i = 2; i < n - 2; i++) {
        if (pts[i + 1].x < pts[i].x) mono++; // x-monotonicity census
        const p1 = d1(i), p2 = d2(i);
        const den = Math.pow(p1.x * p1.x + p1.y * p1.y, 1.5);
        const k_m = (p1.y * p2.x - p1.x * p2.y) / den;
        const k_p = p1.x / (pts[i].y * Math.sqrt(p1.x * p1.x + p1.y * p1.y));
        const H = (k_m + k_p) / 2;
        if (Math.abs(H - H0) / Math.abs(H0) > worst) { worst = Math.abs(H - H0) / Math.abs(H0); worstI = i; }
    }
    return { worst, worstI, mono };
}

const circ = profile(1, 1e-9);
const cc = cmcParam(1, circ.pts);
console.log(`control e~0: CMC worst ${(cc.worst * 100).toFixed(4)}% monotone-breaks ${cc.mono} (want ~0)`);
for (const e of [0.5, 0.55, 0.6]) {
    const { pts, period } = profile(1, e);
    let bulge = 0, neck = Infinity;
    for (const p of pts) { bulge = Math.max(bulge, p.y); neck = Math.min(neck, p.y); }
    const chk = cmcParam(1, pts);
    // Ramanujan ellipse perimeter as independent period truth (correct form)
    const b = Math.sqrt(1 - e * e);
    const ram = Math.PI * (3 * (1 + b) - Math.sqrt((3 + b) * (1 + 3 * b)));
    console.log(`e=${e.toFixed(2)} bulge ${bulge.toFixed(6)} (law a(1+e)=${(1 + e).toFixed(2)}) neck ${neck.toFixed(6)} (law a(1-e)=${(1 - e).toFixed(2)}) period ${period.toFixed(5)} (ramanujan ${ram.toFixed(5)}, diff ${(100 * (period - ram) / ram).toFixed(3)}%) CMC worst ${(chk.worst * 100).toFixed(4)}% at i=${chk.worstI} monotone-breaks ${chk.mono}`);
}
