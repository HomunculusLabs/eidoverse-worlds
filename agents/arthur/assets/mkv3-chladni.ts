// mkv3-chladni.ts — STRUCTURES LANE struct-112, Round 10 commission R10-13.
// THE CHLADNI PLATE: the form ledger's missing family — VIBRATION /
// STANDING WAVES (ledger grep fresh this tick: zero chladni/vibration
// presence across all nx-struct works and all sibling plans).
//
// ONE IDEA: A STANDING WAVE FROZEN IN STONE. A square plate — the Chladni
// plate of every physics demonstration — raised erect as a monument. Its
// faces carry the TRUE nodal pattern of the (5,2) square-plate eigenmode
//     w(u,v) = cos(5πu)·cos(2πv) − cos(2πu)·cos(5πv),  u,v ∈ [−1,1]
// drawn as iron inlay ridges along w = 0 — the curves where sand gathers
// on a real vibrating plate. The difference form makes the two diagonals
// nodal BY CONSTRUCTION and the exact center a still point (w(0,0)=0):
// one brass dusk bead pins the still center through the plate on each
// face (struct-82 lineage). Sand becomes iron; vibration becomes stone.
// Folly class (a frozen instrument, no rooms); no entry advertised, no
// walk owed. Static by honest design — the standing wave is already the
// motion, stopped.
//
// Geometry laws honored:
// - pattern from the REAL eigenfunction combination, not an invented
//   ornament: marching squares on w over the closed [−1,1]² domain.
// - ridges = iron tubes r 0.05 along every nodal curve, subsampled at
//   arc stride ~7cm world; open curves terminate exactly at the plate
//   edge (contour boundary crossings) with spherical end caps.
// - both faces carry the same pattern (the plate vibrates through).
// - plate 3.2×3.2×0.35 ashlar on a 3.7×0.45×1.0 plinth, base on grade.
// - no two layer planes coplanar (z-fight law): stone plate+plinth,
//   iron ridges, brass pin+beads.
// - sightline law: front bead visible from approach vantages —
//   raycast-asserted (occlusion-beats-emissive).
// Determinism: fixed grid N=176, fixed strides, fixed texMat seeds,
// deterministic chain ordering — no randomness anywhere.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the eigenmode -----------------------------------------------------------------
// Square-plate (5,2) degenerate-mode combination: antisymmetric under
// diagonal reflection, so u=±v are nodal lines and the center is still.
const N5 = 5, M2 = 2;
function W(u: number, v: number): number {
    return Math.cos(N5 * Math.PI * u) * Math.cos(M2 * Math.PI * v)
         - Math.cos(M2 * Math.PI * u) * Math.cos(N5 * Math.PI * v);
}
function gradW(u: number, v: number): [number, number] {
    const gu = -N5 * Math.PI * Math.sin(N5 * Math.PI * u) * Math.cos(M2 * Math.PI * v)
               + M2 * Math.PI * Math.sin(M2 * Math.PI * u) * Math.cos(N5 * Math.PI * v);
    const gv = -M2 * Math.PI * Math.cos(N5 * Math.PI * u) * Math.sin(M2 * Math.PI * v)
               + N5 * Math.PI * Math.cos(M2 * Math.PI * u) * Math.sin(N5 * Math.PI * v);
    return [gu, gv];
}

// ---- marching squares over the closed domain -----------------------------------------
const NG = 176;                       // grid resolution per side
const val = (i: number, j: number): number => {
    const u = -1 + 2 * i / NG, v = -1 + 2 * j / NG;
    const w = W(u, v);
    return w === 0 ? 1e-12 : w;       // degenerate-corner nudge (deterministic)
};
type Seg = { a: [number, number]; b: [number, number] };
const segs: Seg[] = [];
{
    const lerp = (p: [number, number], q: [number, number], wa: number, wb: number): [number, number] =>
        [p[0] + (q[0] - p[0]) * (wa / (wa - wb)), p[1] + (q[1] - p[1]) * (wa / (wa - wb))];
    for (let j = 0; j < NG; j++) {
        for (let i = 0; i < NG; i++) {
            const x0 = -1 + 2 * i / NG, x1 = -1 + 2 * (i + 1) / NG;
            const y0 = -1 + 2 * j / NG, y1 = -1 + 2 * (j + 1) / NG;
            const A: [number, number] = [x0, y0], B: [number, number] = [x1, y0];
            const C: [number, number] = [x1, y1], D: [number, number] = [x0, y1];
            const a = val(i, j), b = val(i + 1, j), c = val(i + 1, j + 1), d = val(i, j + 1);
            const idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (c > 0 ? 4 : 0) | (d > 0 ? 8 : 0);
            if (idx === 0 || idx === 15) continue;
            const ab = () => lerp(A, B, a, b), bc = () => lerp(B, C, b, c);
            const cd = () => lerp(C, D, c, d), da = () => lerp(D, A, d, a);
            // standard 16-case table (ambiguous 5/10 split by center sign)
            switch (idx) {
                case 1: case 14: segs.push({ a: da(), b: ab() }); break;
                case 2: case 13: segs.push({ a: ab(), b: bc() }); break;
                case 4: case 11: segs.push({ a: bc(), b: cd() }); break;
                case 8: case 7:  segs.push({ a: cd(), b: da() }); break;
                case 3: case 12: segs.push({ a: da(), b: bc() }); break;
                case 6: case 9:  segs.push({ a: ab(), b: cd() }); break;
                case 5: {
                    const ctr = W((x0 + x1) / 2, (y0 + y1) / 2);
                    if (ctr > 0) { segs.push({ a: da(), b: cd() }); segs.push({ a: bc(), b: ab() }); }
                    else { segs.push({ a: da(), b: ab() }); segs.push({ a: bc(), b: cd() }); }
                    break;
                }
                case 10: {
                    const ctr = W((x0 + x1) / 2, (y0 + y1) / 2);
                    if (ctr > 0) { segs.push({ a: ab(), b: da() }); segs.push({ a: cd(), b: bc() }); }
                    else { segs.push({ a: ab(), b: bc() }); segs.push({ a: cd(), b: da() }); }
                    break;
                }
            }
        }
    }
}

// ---- chain segments into curves (loops close; open curves end at the boundary) --------
const key = (p: [number, number]) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
const byEndpoint = new Map<string, number[]>();
segs.forEach((s, si) => {
    for (const k of [key(s.a), key(s.b)]) {
        const arr = byEndpoint.get(k); if (arr) arr.push(si); else byEndpoint.set(k, [si]);
    }
});
const used = new Array(segs.length).fill(false);
type Chain = { pts: [number, number][]; closed: boolean };
const chains: Chain[] = [];
for (let s0 = 0; s0 < segs.length; s0++) {
    if (used[s0]) continue;
    used[s0] = true;
    const pts: [number, number][] = [segs[s0].a, segs[s0].b];
    // extend forward from b, then backward from a
    for (const dir of [1, -1]) {
        while (true) {
            const end = dir === 1 ? pts[pts.length - 1] : pts[0];
            const cands = (byEndpoint.get(key(end)) ?? []).filter(si => !used[si]);
            if (!cands.length) break;
            const si = cands[0];
            used[si] = true;
            const s = segs[si];
            if (dir === 1) {
                if (key(s.a) === key(end)) pts.push(s.b); else pts.push(s.a);
            } else {
                if (key(s.a) === key(end)) pts.unshift(s.b); else pts.unshift(s.a);
            }
        }
    }
    // closure by DISTANCE tolerance — key equality misses loops whose seam
    // vertices differ in the 6th decimal (the four interior loops need this)
    const closed = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 5e-5;
    if (closed) pts.pop(); // drop duplicated endpoint
    chains.push({ pts, closed });
}
// deterministic order: lexicographic by first point
chains.sort((p, q) => p.pts[0][0] - q.pts[0][0] || p.pts[0][1] - q.pts[0][1]);

// drop marching noise: cell-scale sliver loops near the exactly-nodal
// diagonals (a real (5,2) curve is macroscopic; a chain under ~4 cells of
// arc length is a degenerate artifact). Count and bound the drops.
const MIN_CHAIN_LEN = 4 * (2 / NG) * Math.SQRT2;
const kept: Chain[] = [];
let dropped = 0, droppedLen = 0;
for (const ch of chains) {
    let L = 0;
    for (let i = 1; i < ch.pts.length; i++) L += Math.hypot(ch.pts[i][0] - ch.pts[i - 1][0], ch.pts[i][1] - ch.pts[i - 1][1]);
    if (L < MIN_CHAIN_LEN) { dropped++; droppedLen += L; continue; }
    kept.push(ch);
}
if (droppedLen > 0.5) throw Error(`noise filter dropped ${dropped} chains totaling ${droppedLen.toFixed(3)} local — not noise, wrong pattern`);
// the two exactly-nodal diagonals march as down-and-back DOUBLE-COVERS
// (L ≈ 2×2.828 = 5.65, vs real curves ≤ 1.1) — drop them; both diagonals
// are re-added analytically below (straight, exact).
const real: Chain[] = [];
let diagDrops = 0;
for (const ch of kept) {
    let L = 0;
    for (let i = 1; i < ch.pts.length; i++) L += Math.hypot(ch.pts[i][0] - ch.pts[i - 1][0], ch.pts[i][1] - ch.pts[i - 1][1]);
    if (L > 4.0) { diagDrops++; continue; }
    real.push(ch);
}
if (diagDrops !== 2) throw Error(`expected exactly 2 diagonal double-covers, saw ${diagDrops}`);
chains.length = 0; chains.push(...real);

// ---- arc-stride subsample (~7cm world) -------------------------------------------------
const STRIDE = 0.045; // local units (×1.6m scale = 7.2cm world)
const CURVES: Array<{ pts: [number, number][]; closed: boolean }> = [];
for (const ch of chains) {
    const out: [number, number][] = [ch.pts[0]];
    for (let i = 1; i < ch.pts.length - 1; i++) {
        const last = out[out.length - 1], p = ch.pts[i];
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= STRIDE) out.push(p);
    }
    out.push(ch.pts[ch.pts.length - 1]); // always keep the terminus
    CURVES.push({ pts: out, closed: ch.closed });
}
// the two exactly-nodal diagonals, analytic (w = 0 on u = ±v by construction):
for (const sgn of [1, -1]) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 63; i++) { const t = -1 + 2 * i / 63; pts.push([t, sgn * t]); }
    CURVES.push({ pts, closed: false });
}

// ---- construction asserts on the pattern ----------------------------------------------
{
    const loops = CURVES.filter(c => c.closed).length;
    const opens = CURVES.length - loops;
    let lenFront = 0;
    for (const c of CURVES) {
        if (c.pts.length < (c.closed ? 6 : 4)) throw Error(`curve too short: ${c.pts.length} pts (closed=${c.closed})`);
        for (let i = 1; i < c.pts.length; i++) {
            const d = Math.hypot(c.pts[i][0] - c.pts[i - 1][0], c.pts[i][1] - c.pts[i - 1][1]);
            if (d > STRIDE * 1.6 || (d < STRIDE * 0.5 && i < c.pts.length - 1))
                throw Error(`chord ${d.toFixed(4)} violates stride law (${STRIDE})`);
            lenFront += d;
        }
    }
    // (5,2) at NG=176 resolves to 22 curves: 2 analytic diagonals + 4 mid
    // arcs + 4 interior loops + 8 short arcs + 4 stub arcs (4-fold orbits).
    if (CURVES.length < 18 || CURVES.length > 30)
        throw Error(`pattern complexity ${CURVES.length} curves outside [18,30] — (5,2) read at risk`);
    if (lenFront < 15 || lenFront > 25)
        throw Error(`front ridge length ${lenFront.toFixed(1)} local outside [15,25]`);
    // boundary termini sit ON the domain edge (contour law)
    for (const c of CURVES) if (!c.closed) for (const p of [c.pts[0], c.pts[c.pts.length - 1]]) {
        if (Math.abs(Math.abs(p[0]) - 1) > 1e-4 && Math.abs(Math.abs(p[1]) - 1) > 1e-4)
            throw Error(`open curve terminates mid-domain at (${p[0].toFixed(3)},${p[1].toFixed(3)})`);
    }
    // every marched point is a nodal point of the true eigenfunction
    // (tolerance = linear-interpolation discretization at NG=176: cell
    // 2/176 ≈ 0.0114 local, curvature across a cell puts lerped crossing
    // points O(1e-3) off the true contour — measured max 1.6e-3)
    let worstW = 0;
    for (const c of CURVES) for (const p of c.pts) {
        const w = Math.abs(W(p[0], p[1])); if (w > worstW) worstW = w;
        if (w > 5e-3) throw Error(`marched point (${p[0].toFixed(4)},${p[1].toFixed(4)}) off node: |w|=${w.toExponential(2)}`);
    }
    // the diagonals are present (difference-form signature) and the center is still
    {
        let diag = 0;
        for (const c of CURVES) for (const p of c.pts)
            if (Math.abs(p[0] - p[1]) < 1e-3 || Math.abs(p[0] + p[1]) < 1e-3) diag++;
        if (diag < 40) throw Error(`diagonal signature weak (${diag} points) — wrong mode?`);
        if (Math.abs(W(0, 0)) > 1e-12) throw Error("center not nodal");
    }
    console.log(`chladni law OK: ${CURVES.length} curves (${loops} closed + ${opens} edge-terminated), front ridge ${lenFront.toFixed(1)} local (${(lenFront * 1.6).toFixed(1)}m), max |w| on march ${worstW.toExponential(1)}, diagonals ${diagRef()}`);
}
function diagRef(): string {
    let diag = 0;
    for (const c of CURVES) for (const p of c.pts)
        if (Math.abs(p[0] - p[1]) < 1e-3 || Math.abs(p[0] + p[1]) < 1e-3) diag++;
    return `${diag} pts`;
}

// ---- scale + materials -----------------------------------------------------------------
const FACE = 3.2;                    // plate face width (m)
const S = FACE / 2;                  // local [−1,1] → world half-face 1.6
const PLATE_T = 0.35;                // plate thickness
const PLINTH_H = 0.45, PLINTH_W = 3.7, PLINTH_D = 1.0;
const RIDGE_R = 0.05;
const RISE = 0.03;                   // ridge tube center proud of the face

const stoneTex = texMat("ch_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6502 });
const ironTex = texMat("ch_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.55, scale: 1, weights: [1, 1, 1], cell: 12, seed: 6501 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const plateCY = PLINTH_H + FACE / 2; // plate center height = 2.05

// ---- plinth + plate (one stone bucket) -------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(FACE, FACE, PLATE_T), stoneTex);
    plate.position.set(0, plateCY, 0);
    g.add(plate);
    if (Math.abs(plateCY - FACE / 2 - PLINTH_H) > 1e-9) throw Error("plate not seated on plinth");
}

// ---- iron nodal ridges on both faces (one iron bucket after merge) ----------------------
for (const faceZ of [PLATE_T / 2 + RISE, -(PLATE_T / 2 + RISE)]) {
    for (const c of CURVES) {
        const pts = c.pts.map(([u, v]) => new THREE.Vector3(u * S, plateCY + v * S, faceZ));
        const curve = new THREE.CatmullRomCurve3(pts, c.closed, "catmullrom", 0.5);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, c.pts.length * 2), RIDGE_R, 8, c.closed), ironTex);
        g.add(tube);
        if (!c.closed) for (const p of [pts[0], pts[pts.length - 1]]) {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(RIDGE_R, 8, 6), ironTex);
            cap.position.copy(p);
            g.add(cap);
        }
    }
}

// ---- brass still-center pin + dusk beads (one KEEP node) --------------------------------
// w(0,0) = 0 by construction: the exact center of the plate is a still point.
// A pin through the plate carries one bead per face — "now" at the node.
const brassMeshes: THREE.Mesh[] = []; // pin + 2 beads — the KEEP family
{
    // Decode-law catch (v1): mergekit applies node TRANSLATION but drops
    // node ROTATION — a rotated pin node exported as a vertical rod buried
    // inside the plate. Bake the rotation into the GEOMETRY instead.
    const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, PLATE_T + 0.24, 10);
    pinGeo.rotateX(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, brassGlow);
    pin.position.set(0, plateCY, 0);
    pin.name = "glow_ch_1";
    g.add(pin);
    brassMeshes.push(pin);
    for (const z of [PLATE_T / 2 + 0.06, -(PLATE_T / 2 + 0.06)]) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), brassGlow);
        bead.position.set(0, plateCY, z);
        bead.name = "glow_ch_1"; // same KEEP token — mergekit folds same-name siblings
        g.add(bead);
        brassMeshes.push(bead);
    }
}

// ---- bead sightline assertion (Raycaster; occlusion-beats-emissive law) -----------------
{
    g.updateMatrixWorld(true);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if ((o as any).isMesh && o.name !== "glow_ch_1") targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    let worst = "none";
    // Sightline v1 catch: testing the bead CENTER false-fails — the nodal
    // ridges crossing beneath the bead are proud of its center plane while
    // its outer POLE (what the eye reads) is 8cm clear of every ridge.
    // Test the outer pole of each BEAD (not the pin — same KEEP token, but
    // the through-pin lives inside the plate by design) on its own side.
    const beads = brassMeshes.filter(m => Math.abs(m.position.z) > 0.2);
    if (beads.length !== 2) throw Error(`expected 2 face beads, got ${beads.length}`);
    for (const [deg, dist] of [[0, 18], [30, 18], [-30, 18], [0, 6], [12, 6]] as Array<[number, number]>) {
        for (const side of [1, -1]) {
            const a = deg * Math.PI / 180;
            const eye = new THREE.Vector3(side * Math.sin(a) * dist, 1.65, side * Math.cos(a) * dist);
            for (const bead of beads) {
                const target = new THREE.Vector3();
                bead.getWorldPosition(target);
                if (side * target.z < 0) continue; // test each bead from its own side
                target.z += side * 0.10; // the outer pole
                const dir = target.clone().sub(eye).normalize();
                ray.set(eye, dir);
                const hits = ray.intersectObjects(targets, false);
                const beadDist = eye.distanceTo(target);
                if (hits.length && hits[0].distance < beadDist - 0.10 - 0.02) {
                    worst = `bead blocked from ${side > 0 ? "+" : "-"}Z ${deg}°@${dist}m by ${hits[0].object.name || hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${beadDist.toFixed(2)})`;
                    break;
                }
            }
            if (worst !== "none") break;
        }
        if (worst !== "none") break;
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    console.log(`bead sightline OK: both faces clear from 3×18m + 2×6m vantages (bead world y ${plateCY})`);
}

// ---- envelope + NaN assertions ----------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.0) throw Error(`crest ${sz.y.toFixed(2)} above dial-class ceiling`);
    if (Math.abs(sz.x - PLINTH_W) > 0.02) throw Error(`envelope x ${sz.x.toFixed(2)} unexpected`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}]`);
}

const merged = mergeByMaterial(g, "chladni");
writeFileSync("agents/arthur/assets/village_chladni3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_chladni3.glb`);
