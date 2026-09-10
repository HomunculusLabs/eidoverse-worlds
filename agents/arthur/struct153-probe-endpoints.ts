// struct153-probe-endpoints.ts — endpoint analysis for the gyroid end-caps
// refine (struct-131 recorded residual: "open tube end-caps can read
// dead-ending near cube edges (cap closure or slight extension into neighbor
// hems = next refine candidate)"). Decode-before-edit law: measure the REAL
// endpoint topology of the 18 analytic hem curves before designing the fix.
// Read-only; writes nothing. Run: bun agents/arthur/struct153-probe-endpoints.ts
//
// Questions answered:
//   Q1 how many endpoints (expect 18 x 2 = 36) and where — on cube edges
//      (two |S|=2 coords), on face interiors (one |S|=2), or mid-face?
//   Q2 do adjacent-face curves terminate at coincident points (the analytic
//      continuation across the edge) — cluster analysis at 0.05m
//   Q3 max intra-cluster gap (does a cap sphere at each endpoint read as a
//      welded joint, or is there a visible break needing extension?)
const F = (ax: number, ay: number, az: number) =>
    Math.sin(ax) * Math.cos(ay) + Math.sin(ay) * Math.cos(az) + Math.sin(az) * Math.cos(ax);
const CELL = 2, Y_OFF = 2.14;
const ang = (s: number) => (s * Math.PI) / 2;
const Fof = (sx: number, sy: number, sz: number) => F(ang(sx), ang(sy), ang(sz));
const bisect = (fn: (q: number) => number, lo: number, hi: number): number => {
    let flo = fn(lo);
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2, fm = fn(mid);
        if (fm === 0) return mid;
        if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
};

// replica march (same as struct131-decode-gyroid.ts law (d))
type Curve = { ax: number; val: number; pts: number[][] };
const curves: Curve[] = [];
for (const [ax, val] of [[0, CELL], [0, -CELL], [1, CELL], [1, -CELL], [2, CELL], [2, -CELL]] as Array<[number, number]>) {
    const p1 = (ax + 1) % 3, p2 = (ax + 2) % 3;
    const s = [0, 0, 0]; s[ax] = val;
    let live: Array<{ last: number; pts: number[][] }> = [];
    const STEPS = 512, RR = CELL;
    for (let i = 0; i <= STEPS; i++) {
        s[p1] = -RR + (2 * RR * i) / STEPS;
        const fq = (q: number) => { s[p2] = q; return Fof(s[0], s[1], s[2]); };
        const roots: number[] = [];
        let prev = fq(-RR);
        for (let jj = 1; jj <= 512; jj++) {
            const q = -RR + (2 * RR * jj) / 512, cur = fq(q);
            if (prev * cur < 0) roots.push(bisect(fq, q - 2 * RR / 512, q));
            prev = cur;
        }
        const used = new Set<number>();
        for (const L of live) {
            let bi = -1, bd = 0.25;
            roots.forEach((r, idx) => { if (!used.has(idx) && Math.abs(r - L.last) < bd) { bd = Math.abs(r - L.last); bi = idx; } });
            if (bi >= 0) { used.add(bi); s[p2] = roots[bi]; L.pts.push([s[0], s[1] + Y_OFF, s[2]]); L.last = roots[bi]; }
            else L.pts.push(L.pts[L.pts.length - 1]);
        }
        for (let idx = 0; idx < roots.length; idx++) {
            if (used.has(idx)) continue;
            s[p2] = roots[idx];
            live.push({ last: roots[idx], pts: [[s[0], s[1] + Y_OFF, s[2]]] });
        }
    }
    for (const L of live) {
        const dd: number[][] = [];
        for (const p of L.pts) if (!dd.length || Math.hypot(p[0] - dd[dd.length - 1][0], p[1] - dd[dd.length - 1][1], p[2] - dd[dd.length - 1][2]) > 1e-6) dd.push(p);
        let span = 0;
        for (let i = 1; i < dd.length; i++) span += Math.hypot(dd[i][0] - dd[i - 1][0], dd[i][1] - dd[i - 1][1], dd[i][2] - dd[i - 1][2]);
        if (dd.length >= 8 && span > 0.5) curves.push({ ax, val, pts: dd });
    }
}
console.log(`curves: ${curves.length} (expect 18)`);

// endpoints in S frame
type EP = { p: [number, number, number]; ax: number; val: number; end: 0 | 1 };
const eps: EP[] = [];
for (const c of curves) for (const end of [0, 1] as const) {
    const q = end === 0 ? c.pts[0] : c.pts[c.pts.length - 1];
    eps.push({ p: [q[0], q[1] - Y_OFF, q[2]], ax: c.ax, val: c.val, end });
}
console.log(`endpoints: ${eps.length} (expect 36)`);

// Q1: where do endpoints sit? edge = two |S|=2, face = one, interior = none
let onEdge = 0, onFace = 0, interior = 0;
for (const e of eps) {
    const n2 = e.p.filter(c => Math.abs(Math.abs(c) - CELL) < 1e-4).length;
    if (n2 >= 2) onEdge++; else if (n2 === 1) onFace++; else interior++;
}
console.log(`Q1 endpoint placement: on-edge ${onEdge}, face-only ${onFace}, interior ${interior}`);

// per-face span summary
for (let f = 0; f < 6; f++) {
    const ax = [0, 0, 1, 1, 2, 2][f], val = [CELL, -CELL, CELL, -CELL, CELL, -CELL][f];
    const fc = curves.filter(c => c.ax === ax && c.val === val);
    const spans = fc.map(c => {
        let s = 0;
        for (let i = 1; i < c.pts.length; i++) s += Math.hypot(c.pts[i][0] - c.pts[i - 1][0], c.pts[i][1] - c.pts[i - 1][1], c.pts[i][2] - c.pts[i - 1][2]);
        return s;
    }).sort((a, b) => b - a);
    console.log(`  face ax${ax}=${val}: ${fc.length} curves, spans ${spans.map(v => v.toFixed(2)).join(" / ")}`);
}

// Q2/Q3: cluster endpoints within 0.05 (world frame for distance)
const world = (e: EP) => [e.p[0], e.p[1] + Y_OFF, e.p[2]] as [number, number, number];
const clusters: EP[][] = [];
for (const e of eps) {
    let placed = false;
    for (const cl of clusters) {
        const w = world(e);
        if (cl.some(m => Math.hypot(world(m)[0] - w[0], world(m)[1] - w[1], world(m)[2] - w[2]) < 0.05)) { cl.push(e); placed = true; break; }
    }
    if (!placed) clusters.push([e]);
}
let maxIntra = 0;
for (const cl of clusters) {
    for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) {
        const a = world(cl[i]), b = world(cl[j]);
        maxIntra = Math.max(maxIntra, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
}
const sizes: Record<number, number> = {};
for (const cl of clusters) sizes[cl.length] = (sizes[cl.length] ?? 0) + 1;
console.log(`Q2 clusters@0.05m: ${clusters.length} — sizes ${JSON.stringify(sizes)}`);
console.log(`Q3 max intra-cluster gap: ${maxIntra.toFixed(6)}m (cap sphere r 0.05 at each endpoint welds any gap << 0.10)`);
// cross-face vs same-face cluster mix
let cross = 0, same = 0;
for (const cl of clusters) {
    const faces = new Set(cl.map(e => `${e.ax}${e.val > 0 ? "+" : "-"}`));
    if (faces.size > 1) cross++; else same++;
}
console.log(`   cluster mix: cross-face ${cross}, same-face-only ${same}`);
