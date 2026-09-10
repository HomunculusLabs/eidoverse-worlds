// struct138-design-probe-enneper.ts — refine iteration design probe (READ-ONLY, no GLB written).
// Question: pick R_DOMAIN for the v3 fix-class iteration, quantitatively, against the
// three judge fixes from struct-135's fallback verdict:
//   (1) sheet differentiation, (2) seams 2-3x weight, (3) crossing within ~15% of silhouette.
// The crossing locus of the FULL Enneper surface is fixed (4 arcs from pole outward);
// the disk cut R truncates it. At R=2.05 the locus arcs stop at ~66% of petal radius.
// Widening R includes more true locus AND grows the double-cover "over/under" region.
// Per candidate R this probe measures: petal span (horizontal extreme), |z| extreme,
// locus reach = max horizontal radial distance of locus points (within cut), locus z band,
// double-cover area fraction of the disk, and the silhouette metric
//   sil = locus_reach / petal_span   (judge's fix: crossing within ~15% of silhouette -> sil >= ~0.85)
// Baseline v2 = R 2.05. Nothing written; prints a table.
import * as THREE from "three";

const S3 = Math.sqrt(3);
const X = (u: number, v: number): THREE.Vector3 =>
    new THREE.Vector3(u - (u * u * u) / 3 + u * v * v, v - (v * v * v) / 3 + v * u * u, u * u - v * v);

// ---- 1. trace the FULL crossing locus once (dense probe to R_MAX_PROBE) --------------------------
const R_MAX_PROBE = 3.2;
const NT = 1440, NR = 300;
type P = { p: THREE.Vector3; pu: number; pv: number };
const probe: P[] = [];
for (let ri = 0; ri < NR; ri++) {
    const r = 0.25 + (R_MAX_PROBE - 0.25) * (ri / (NR - 1));
    for (let ti = 0; ti < NT; ti++) {
        const t = (2 * Math.PI * ti) / NT;
        const pu = r * Math.cos(t), pv = r * Math.sin(t);
        probe.push({ p: X(pu, pv), pu, pv });
    }
}
const cell = 0.02;
const grid = new Map<string, number[]>();
const gkey = (x: number, y: number, z: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
probe.forEach((w, i) => { const k = gkey(w.p.x, w.p.y, w.p.z); const a = grid.get(k); if (a) a.push(i); else grid.set(k, [i]); });
const raw: P[] = [];
for (const [k, idxs] of grid) {
    const [cx, cy, cz] = k.split(",").map(Number);
    const cand = [...idxs];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        if (dx || dy || dz) { const o = grid.get(gkey((cx + dx) * cell, (cy + dy) * cell, (cz + dz) * cell)); if (o) cand.push(...o); }
    }
    for (const i of idxs) for (const j of cand) {
        if (j <= i) continue;
        const a = probe[i], b = probe[j];
        if (a.p.distanceTo(b.p) < 0.008 && Math.hypot(a.pu - b.pu, a.pv - b.pv) >= 0.35) raw.push(a);
    }
}
// dedupe on 1.5cm snap (keep the pair-average point like the mk script)
const snap = new Map<string, THREE.Vector3>();
for (const w of raw) {
    // recompute the pair midpoint would need j; approximate with w.p (locus position, fine for reach metrics)
    snap.set(`${Math.round(w.p.x / 0.015)},${Math.round(w.p.y / 0.015)},${Math.round(w.p.z / 0.015)}`, w.p);
}
const locusFull = [...snap.values()];
console.log(`full-surface locus pts (to R${R_MAX_PROBE}): ${locusFull.length}`);

// sanity: locus passes through the two axis crossings (0,0,+-3)
const near = (q: THREE.Vector3) => locusFull.some(m => m.distanceTo(q) < 0.05);
console.log(`locus through (0,0,+3): ${near(new THREE.Vector3(0, 0, 3))}, through (0,0,-3): ${near(new THREE.Vector3(0, 0, -3))}`);

// ---- 2. per-candidate-R table --------------------------------------------------------------------
const CANDS = [2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.65, 2.75, 2.85, 2.95, 3.05];
console.log("R     petal  zmax  locusR  locZ   dcover%  sil    minInnerRim");
for (const R of CANDS) {
    // petal span: horizontal extreme of boundary X(R cos t, R sin t)
    let hx = 0, zmax = 0;
    for (let i = 0; i < 2048; i++) {
        const t = (2 * Math.PI * i) / 2048;
        const p = X(R * Math.cos(t), R * Math.sin(t));
        hx = Math.max(hx, Math.hypot(p.x, p.y));
        zmax = Math.max(zmax, Math.abs(p.z));
    }
    // locus points whose BOTH generating params lie inside the cut r<=R stay visible as crossings
    // (pair midpoint position is on the locus; both sheets at the crossing have r<=R approx when
    // midpoint r is comfortably inside — measure reach as max horizontal radial dist of midpoints
    // whose midpoint r <= R*0.999, then verify pair-inside separately for the chosen R)
    // here: use raw pairs with both params inside cut
    const pairsInside: { mid: THREE.Vector3; ra: number; rb: number }[] = [];
    // rebuild pair list cheaply for this R by re-filtering raw with param info
    // (raw kept only one side; redo the pair scan for correctness per R)
    const cellR = 0.02;
    const gridR = new Map<string, number[]>();
    const sub = probe.filter(w => Math.hypot(w.pu, w.pv) <= R);
    sub.forEach((w, i) => { const k = gkey(w.p.x, w.p.y, w.p.z); const a = gridR.get(k); if (a) a.push(i); else gridR.set(k, [i]); });
    for (const [k, idxs] of gridR) {
        const [cx, cy, cz] = k.split(",").map(Number);
        const cand = [...idxs];
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
            if (dx || dy || dz) { const o = gridR.get(gkey((cx + dx) * cellR, (cy + dy) * cellR, (cz + dz) * cellR)); if (o) cand.push(...o); }
        }
        for (const i of idxs) for (const j of cand) {
            if (j <= i) continue;
            const a = sub[i], b = sub[j];
            if (a.p.distanceTo(b.p) < 0.008 && Math.hypot(a.pu - b.pu, a.pv - b.pv) >= 0.35)
                pairsInside.push({ mid: a.p.clone().add(b.p).multiplyScalar(0.5), ra: Math.hypot(a.pu, a.pv), rb: Math.hypot(b.pu, b.pv) });
        }
    }
    let locusReach = 0, locZ = 0;
    for (const q of pairsInside) { locusReach = Math.max(locusReach, Math.hypot(q.mid.x, q.mid.y)); locZ = Math.max(locZ, Math.abs(q.mid.z)); }
    // double-cover area fraction: area of disk where the map is 2:1. Approximate: for each sample
    // point inside cut, check whether some OTHER param point maps within 8mm (same spatial hash trick,
    // single-sided count on a coarse sub-grid to keep cost sane)
    const NT2 = 720, NR2 = 150;
    let dbl = 0, tot = 0;
    const seen = new Map<string, number>();
    for (let ri = 0; ri < NR2; ri++) {
        const r = (R * ri) / (NR2 - 1);
        for (let ti = 0; ti < NT2; ti++) {
            const t = (2 * Math.PI * ti) / NT2;
            const pu = r * Math.cos(t), pv = r * Math.sin(t);
            if (r > R) continue;
            tot++;
            const p = X(pu, pv);
            const k = gkey(p.x, p.y, p.z);
            const a = seen.get(k);
            if (a !== undefined) { dbl += 0.5; seen.set(k, a + 1); } else seen.set(k, 1);
        }
    }
    const dcover = (100 * dbl) / Math.max(1, tot);
    const sil = locusReach / hx;
    // min inner rim self-distance: closest approach between distinct boundary points
    // (the v2 hem-fuse disclosure was 6.6mm at R 2.05; wider R worsens it — measure)
    const bnd: THREE.Vector3[] = [];
    for (let i = 0; i < 720; i++) { const t = (2 * Math.PI * i) / 720; const p = X(R * Math.cos(t), R * Math.sin(t)); bnd.push(new THREE.Vector3(p.x, p.y, p.z)); }
    let minRim = Infinity;
    for (let i = 0; i < bnd.length; i++) for (let j = i + 1; j < bnd.length; j++) {
        const d = bnd[i].distanceTo(bnd[j]);
        if (d > 1e-9 && d < minRim) minRim = d;
    }
    console.log(`${R.toFixed(2)}  ${hx.toFixed(3)} ${zmax.toFixed(3)}  ${locusReach.toFixed(3)}  ${locZ.toFixed(3)}  ${dcover.toFixed(1)}    ${sil.toFixed(3)}  ${(minRim * 1000).toFixed(1)}mm`);
}
console.log("done — no files written");
