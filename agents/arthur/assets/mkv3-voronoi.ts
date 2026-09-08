// mkv3-voronoi.ts — STRUCTURES LANE struct-113, Round 10 commission R10-14.
// THE SHATTERED MONOLITH: the form ledger's missing family — NATURAL
// PARTITION / VORONOI (ledger grep fresh this tick: zero voronoi presence
// across all nx-struct works and all sibling plans).
//
// ONE IDEA: A MONOLITH FRACTURED BY ITS OWN SEEDS. A single ashlar obelisk
// is split by eleven seeds embedded at its heart into exactly eleven cells
// — Voronoi cells on a sphere, the partition a droplet's mist makes. The
// cracks fan radially from the heart; the cells shear apart along their
// own seed bearings; the gaps open baring the darker unweathered
// heart-stone; and where each seed's own ray pierces the rind, one brass
// dusk bead (struct-82 lineage) marks the heart of its territory — eleven
// ember studs scattered over the shattered flank, the seeds that made the
// break, glowing in the dark. Outside: the weathered rind. Inside the
// cracks: the cut. Stone becomes territory.
//
// Construction is EXACT spherical Voronoi by half-space clipping, centered
// at the monolith's HEART: a point x of the body is angularly closer to
// seed a than seed b iff (x−c)·(sa − sb) ≥ 0 (unit seeds ⇒ the bisector
// plane through the heart ⊥ sa−sb IS the great-circle bisector, lifted
// through the body). So cell_a = hull ∩ ⋂_b {(x−c)·(sa − sb) ≥ 0} — every
// face a true plane, every edge the meet of two bisector planes, and the
// partition law holds: Σ vol(cell_a) == vol(hull), exact tiling pre-drift.
// Seeds live on a TRUNCATED lattice (heart-local y ≥ −0.24): every seed
// owns real body volume (the body subtends ±~44° from the heart) and
// every seed-ray exits a flank or the crown, never the base.
//
// Plane-list polyhedron chassis (no quickhull dependency): a polyhedron is
// a list of half-spaces {n·x ≤ d}; vertices are plane-triple intersections
// satisfying every plane; face_j = its on-plane vertices angle-sorted with
// Newell winding. FLAT MERGE LAW (struct-108): mergeByMaterial is flat —
// every mesh is added at the TOP level of the group (no nested groups),
// drift baked into geometry via translate().
//
// Drift law (the separation guarantee): each cell moves along its own
// seed's HORIZONTAL bearing by t_a; for every pair the separation along
// the shared bisector is (t_b·sb_h − t_a·sa_h)·n̂ ≥ 0 — moving each piece
// along its own seed direction can only EXPLODE the partition, never
// interpenetrate. Asserted for all 55 pairs (≥ 0.02m: no z-fight cracks).
//
// Folly class; no entry advertised, no walk owed. Static by honest design.
//
// Geometry laws honored:
// - seeds: deterministic Fibonacci lattice (11, golden angle) — no
//   randomness anywhere; bead = ray-exit of the seed direction through
//   the hull, exactly at each territory's angular center.
// - drift HORIZONTAL ONLY — base stays on grade, crest never sinks.
// - distinct material planes (z-fight law): flank rind, cut heart, brass.
// - sightline law: bead poles raycast-visible (occlusion-beats-emissive,
//   struct-52 class) — ≥3 beads from every main vantage, every bead from
//   at least one.
// Determinism: fixed lattice, fixed drift table, fixed texMat seeds,
// stable sorts — byte-identical rebuilds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the monolith: rings and half-spaces -------------------------------------------
type V3 = [number, number, number];
const v3 = (p: V3) => new THREE.Vector3(...p);
const FOOT: V3[] = [[-2.2, 0, -1.5], [2.2, 0, -1.5], [2.2, 0, 1.5], [-2.2, 0, 1.5]];
const WAIST: V3[] = [[-2.42, 2.8, -1.62], [2.42, 2.8, -1.62], [2.42, 2.8, 1.62], [-2.42, 2.8, 1.62]];
const SHOULDER: V3[] = [[-1.72, 4.7, -1.18], [1.72, 4.7, -1.18], [1.72, 4.7, 1.18], [-1.72, 4.7, 1.18]];
const APEX: V3[] = [[-0.62, 6.4, -0.42], [0.62, 6.4, -0.0], [0.62, 6.4, 0.42], [-0.62, 6.4, 0.0]];
const RINGS = [FOOT, WAIST, SHOULDER, APEX];
const CREST = 6.4;

type Plane = { n: THREE.Vector3; d: number; kind: "base" | "top" | "flank" | "cut"; src: string };
const planes: Plane[] = [];
{
    const mk = (a: V3, b: V3, c: V3, src: string): Plane => {
        const n = new THREE.Vector3().subVectors(v3(b), v3(a)).cross(new THREE.Vector3().subVectors(v3(c), v3(a)));
        if (n.lengthSq() < 1e-12) throw Error(`degenerate plane ${src}`);
        n.normalize();
        return { n, d: n.dot(v3(a)), kind: "flank", src };
    };
    planes.push({ n: new THREE.Vector3(0, -1, 0), d: 0, kind: "base", src: "base" });
    planes.push({ n: new THREE.Vector3(0, 1, 0), d: CREST, kind: "top", src: "top" });
    const RINGNAMES = ["lower", "mid", "crown"];
    for (let r = 0; r < 3; r++) {
        const L = RINGS[r], U = RINGS[r + 1];
        for (let i = 0; i < 4; i++) {
            const j = (i + 1) % 4;
            planes.push(mk(L[i], U[i], L[j], `${RINGNAMES[r]}${i}`)); // (L[i],U[i],L[j]) winding: outward
        }
    }
    // centroid-flip guard: every flank normal points AWAY from the hull centroid
    const centroid = new THREE.Vector3();
    for (const p of RINGS.flat()) centroid.add(v3(p));
    centroid.divideScalar(RINGS.flat().length);
    for (const pl of planes) {
        if (pl.kind !== "flank") continue;
        const onPlane = v3(FOOT[0]); // any vertex of the source face? use plane point via projection
        const pt = centroid.clone().addScaledVector(pl.n, (pl.d - pl.n.dot(centroid)) / pl.n.lengthSq()); // closest plane point to centroid
        void onPlane;
        if (pl.n.dot(centroid.clone().sub(pt)) > 0) { pl.n.negate(); pl.d = -pl.d; }
    }
}
// convexity assert: every ring vertex inside every plane (n·x ≤ d + eps)
{
    const all = RINGS.flat();
    for (const pl of planes) for (const p of all) {
        if (pl.n.dot(v3(p)) > pl.d + 1e-9) throw Error(`hull not convex: ${pl.src} rejects ${p}`);
    }
}

// ---- plane-list polyhedron engine ---------------------------------------------------
type Poly = { P: Plane[]; verts: V3[]; faces: Array<{ pi: number; loop: number[]; n: THREE.Vector3 }> };
function buildPoly(P: Plane[]): Poly {
    const verts: V3[] = [];
    const seen = new Set<string>();
    // Tolerances at physical scale: degenerate vertices (4+ planes meeting
    // at ring corners) carry ~1e-6 solver error — a genuine violation in
    // this hand-set geometry is ≥1e-3, so 2e-5 separates them cleanly.
    const TOL_DET = 1e-9, TOL_IN = 2e-5, TOL_ON = 1e-4;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) for (let k = j + 1; k < P.length; k++) {
        const M = new THREE.Matrix3().set(
            P[i].n.x, P[i].n.y, P[i].n.z,
            P[j].n.x, P[j].n.y, P[j].n.z,
            P[k].n.x, P[k].n.y, P[k].n.z,
        );
        const det = M.determinant();
        if (Math.abs(det) < TOL_DET) continue;
        const Minv = M.clone().invert();
        const x = new THREE.Vector3(P[i].d, P[j].d, P[k].d).applyMatrix3(Minv);
        if (!isFinite(x.x) || !isFinite(x.y) || !isFinite(x.z)) continue;
        const p: V3 = [x.x, x.y, x.z];
        let inside = true;
        for (const pl of P) if (pl.n.dot(x) > pl.d + TOL_IN) { inside = false; break; }
        if (!inside) continue;
        const key = p.map(n => n.toFixed(6)).join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        verts.push(p);
    }
    if (verts.length < 4) throw Error(`poly degenerate: ${verts.length} verts from ${P.length} planes`);
    const faces: Poly["faces"] = [];
    for (let pi = 0; pi < P.length; pi++) {
        const pl = P[pi];
        const on = verts.map((p, idx) => idx).filter(vi => Math.abs(pl.n.dot(v3(verts[vi])) - pl.d) < TOL_ON);
        if (on.length < 3) continue;
        const ctr = new THREE.Vector3();
        for (const vi of on) ctr.add(v3(verts[vi]));
        ctr.divideScalar(on.length);
        let t1 = new THREE.Vector3(0, 1, 0);
        if (Math.abs(pl.n.y) > 0.9) t1 = new THREE.Vector3(1, 0, 0);
        t1.addScaledVector(pl.n, -pl.n.dot(t1)).normalize();
        const t2 = new THREE.Vector3().crossVectors(pl.n, t1);
        const ang = (vi: number) => {
            const d = v3(verts[vi]).sub(ctr);
            return Math.atan2(t2.dot(d), t1.dot(d));
        };
        on.sort((u, w) => ang(u) - ang(w));
        const nn = new THREE.Vector3();
        for (let e = 0; e < on.length; e++) {
            const A = v3(verts[on[e]]), B = v3(verts[on[(e + 1) % on.length]]);
            nn.x += (A.y - B.y) * (A.z + B.z);
            nn.y += (A.z - B.z) * (A.x + B.x);
            nn.z += (A.x - B.x) * (A.y + B.y);
        }
        if (nn.dot(pl.n) < 0) on.reverse();
        faces.push({ pi, loop: on, n: pl.n.clone() });
    }
    if (faces.length < 4) throw Error(`poly degenerate: ${faces.length} faces`);
    return { P, verts, faces };
}
function polyVolume(poly: Poly): number {
    let vol = 0;
    for (const f of poly.faces) {
        for (let e = 1; e < f.loop.length - 1; e++) {
            const a = v3(poly.verts[f.loop[0]]), b = v3(poly.verts[f.loop[e]]), d = v3(poly.verts[f.loop[e + 1]]);
            vol += a.dot(new THREE.Vector3().crossVectors(b, d)) / 6;
        }
    }
    return Math.abs(vol);
}

// ---- seeds: truncated Fibonacci lattice, centered at the heart ----------------------
const N_SEEDS = 11;
const N_RAW = 18; // raw lattice; keep the top 11 above the cutoff = a Fibonacci cap
const HEART = new THREE.Vector3(0, 3.2, 0); // sphere center = monolith's heart
const GA = Math.PI * (3 - Math.sqrt(5)); // 137.5078°
const CAP_Y = -0.24; // heart-local cutoff: every kept seed rays out a flank/crown
const seedsRaw: THREE.Vector3[] = [];
for (let i = 0; i < N_RAW; i++) {
    const y = 1 - (2 * (i + 0.5)) / N_RAW;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * GA;
    seedsRaw.push(new THREE.Vector3(r * Math.cos(th), y, r * Math.sin(th)));
}
// truncate: keep seeds with heart-local y >= CAP_Y; assert exactly N_SEEDS kept
const KEPT = seedsRaw.filter(s => s.y >= CAP_Y);
if (KEPT.length !== N_SEEDS) throw Error(`truncated lattice kept ${KEPT.length}, want ${N_SEEDS}`);
const seeds = KEPT;
if (seeds.some(s => Math.abs(s.length() - 1) > 1e-12)) throw Error("seeds not unit");

// ---- cells: exact spherical Voronoi by bisector half-spaces (heart-centered) ---------
const hull = buildPoly(planes);
const hullVol = polyVolume(hull);
if (hullVol < 10) throw Error(`hull volume ${hullVol.toFixed(2)} implausible`);
const cells: Poly[] = [];
for (let a = 0; a < N_SEEDS; a++) {
    const P: Plane[] = [...planes];
    for (let b = 0; b < N_SEEDS; b++) {
        if (a === b) continue;
        // keep side (heart-local): (x−c)·(sa − sb) ≥ 0  ⇔  x·n ≤ d with n = sb−sa, d = n·c
        const n = seeds[b].clone().sub(seeds[a]);
        P.push({ n, d: n.dot(HEART), kind: "cut", src: `bis${a}-${b}` });
    }
    cells.push(buildPoly(P));
}
{
    let sum = 0;
    cells.forEach((c, i) => {
        const vol = polyVolume(c);
        if (vol <= 0.02) throw Error(`cell ${i} near-empty (${vol}) — silhouette/lattice mismatch`);
        sum += vol;
    });
    if (Math.abs(sum - hullVol) / hullVol > 2e-3)
        throw Error(`partition law violated: Σcells ${sum.toFixed(4)} vs hull ${hullVol.toFixed(4)}`);
    console.log(`voronoi law OK: ${N_SEEDS} cells tile the monolith — Σvol ${sum.toFixed(3)} == hull ${hullVol.toFixed(3)} (${(sum / hullVol * 100).toFixed(2)}%)`);
}
for (let a = 0; a < N_SEEDS; a++) for (const p of cells[a].verts) for (let b = 0; b < N_SEEDS; b++) {
    if (a === b) continue;
    if (seeds[a].dot(v3(p).sub(HEART)) - seeds[b].dot(v3(p).sub(HEART)) < -1e-5)
        throw Error(`cell ${a} vertex violates bisector vs seed ${b}`);
}

// ---- drift: horizontal shear, provably exploding the partition ----------------------
// LAW (probe-verified numerically, then asserted): each cell drifts along
// the UNNORMALIZED horizontal projection of its seed (s.x, 0, s.z) by a
// uniform t. Cell a's shared face with b moves by t·(sbh − sah)·n̂ ≥ 0 by
// the Voronoi half-space law itself — the drift can only open the crack,
// never close it (this lattice at t=0.26: min +0.045, zero negatives,
// every cell ≥9 pairs open ≥6cm). Locked cells and per-cell magnitudes
// removed; the construction is uniform, exact, and deterministic.
const T_DRIFT = 0.26;
const driftOf: THREE.Vector3[] = seeds.map(s => new THREE.Vector3(s.x * T_DRIFT, 0, s.z * T_DRIFT));
{
    let minSep = Infinity, minPair = "", neg = 0, open6 = 0;
    const perCell = new Array(N_SEEDS).fill(0);
    for (let a = 0; a < N_SEEDS; a++) for (let b = 0; b < N_SEEDS; b++) {
        if (a === b) continue;
        const nHat = seeds[b].clone().sub(seeds[a]).normalize();
        const sep = nHat.dot(driftOf[b].clone().sub(driftOf[a]));
        if (sep < minSep) { minSep = sep; minPair = `${a}-${b}`; }
        if (sep < 0) neg++;
        if (sep >= 0.06) { open6++; perCell[a]++; }
    }
    if (neg > 0 || minSep < 0.02) throw Error(`drift separation law violated: pair ${minPair} sep ${minSep.toFixed(4)} (${neg} negatives)`);
    if (Math.min(...perCell) < 8) throw Error(`a cell has <8 open pairs — shattered read at risk`);
    console.log(`drift law OK: 55/55 pairs non-negative, min ${minSep.toFixed(3)}m, min per-cell ≥6cm-open pairs ${Math.min(...perCell)}, drift magnitude ≤ ${(T_DRIFT * Math.max(...seeds.map(s => Math.hypot(s.x, s.z)))).toFixed(2)}m`);
}

// ---- materials -----------------------------------------------------------------------
const flankTex = texMat("vo_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2.4, weights: [3, 1, 1], seed: 6511 });
const cutTex = texMat("vo_core", [0x4c5054, 0x545a5e, 0x44484c], { rough: 0.85, scale: 1.6, weights: [1, 1, 1], cell: 10, seed: 6510 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- build: FLAT top-level meshes, drift baked in (flat-group law, struct-108) -------
const g = new THREE.Group();
const beadWorld: THREE.Vector3[] = [];
const BEAD_R = 0.09, BEAD_PROUD = 0.05;
let triFlank = 0, triCut = 0;
for (let a = 0; a < N_SEEDS; a++) {
    const cell = cells[a];
    const flankPos: number[] = [], cutPos: number[] = [];
    for (const f of cell.faces) {
        const isCut = cell.P[f.pi].kind === "cut";
        const dst = isCut ? cutPos : flankPos;
        for (let e = 1; e < f.loop.length - 1; e++) {
            for (const vi of [f.loop[0], f.loop[e], f.loop[e + 1]]) {
                const p = cell.verts[vi];
                dst.push(p[0] + driftOf[a].x, p[1], p[2] + driftOf[a].z);
            }
            if (isCut) triCut++; else triFlank++;
        }
    }
    for (const [pos, mat, tag] of [[flankPos, flankTex, "flank"], [cutPos, cutTex, "cut"]] as Array<[number[], THREE.Material, string]>) {
        if (!pos.length) continue;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, mat));
        void tag;
    }
    // bead: ray from the HEART along the seed direction, riding the cell
    {
        let tExit = Infinity, exitPlane = "";
        for (const pl of planes) {
            // ray: x = c + t·s (t ≥ 0); half-space n·x ≤ d ⇒ t ≤ (d − n·c)/n·s
            const denom = pl.n.dot(seeds[a]);
            if (denom > 1e-9) {
                const t = (pl.d - pl.n.dot(HEART)) / denom;
                if (t >= 0 && t < tExit) { tExit = t; exitPlane = pl.src; }
            }
        }
        if (!isFinite(tExit) || tExit <= 0) throw Error(`seed ${a} ray never exits hull`);
        if (exitPlane === "base") throw Error(`seed ${a} ray exits the BASE (lattice law broken)`);
        const exit = HEART.clone().addScaledVector(seeds[a], tExit);
        const w = exit.add(driftOf[a]).addScaledVector(seeds[a], BEAD_PROUD);
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 12, 10), brassGlow);
        bead.position.copy(w);
        bead.name = "glow_vo_1";
        g.add(bead);
        beadWorld.push(w.clone());
    }
}

// bead non-embedding: no sample point of any bead sphere sits strictly
// inside ANOTHER cell's stone (beads hover in the open cracks, outside
// all cells). Point-in-convex-poly: inside iff n·q ≤ d for EVERY plane.
// Deterministic sample set: 6 axis poles + 8 diagonal points.
for (let a = 0; a < N_SEEDS; a++) {
    const samples: THREE.Vector3[] = [];
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]] as const) {
        const v = new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(BEAD_R * 0.71); // ~inner shell
        samples.push(beadWorld[a].clone().add(v));
    }
    for (let b = 0; b < N_SEEDS; b++) {
        if (a === b) continue;
        for (const q of samples) {
            let inside = true;
            for (const pl of cells[b].P) {
                const moved = pl.d + pl.n.dot(driftOf[b]);
                if (pl.n.dot(q) > moved - 0.003) { inside = false; break; }
            }
            if (inside) throw Error(`bead ${a} sample embedded in cell ${b} stone`);
        }
    }
}
// bead legitimacy: each bead center sits ≤ proud offset beyond its own cell's surface
for (let a = 0; a < N_SEEDS; a++) {
    let worst = -Infinity;
    for (const pl of cells[a].P) {
        const moved = pl.d + pl.n.dot(driftOf[a]);
        worst = Math.max(worst, pl.n.dot(beadWorld[a]) - moved);
    }
    if (worst > BEAD_PROUD + 1e-6 || worst < -1e-6)
        throw Error(`bead ${a} not seated proud on own flank (worst ${worst.toFixed(4)})`);
}

// ---- sightline law (occlusion-beats-emissive, struct-52 class) -----------------------
{
    g.updateMatrixWorld(true);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if (o.isMesh && o.name !== "glow_vo_1") targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    const VANTAGES: Array<[number, number]> = [[0, 18], [90, 18], [180, 18], [270, 18], [30, 18], [0, 6], [180, 6]];
    const perBead = new Array(N_SEEDS).fill(0);
    let worst = "";
    for (const [deg, dist] of VANTAGES) {
        let vis = 0;
        const ang = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(ang) * dist, 1.65, Math.cos(ang) * dist);
        for (let a = 0; a < N_SEEDS; a++) {
            const pole = beadWorld[a].clone().addScaledVector(seeds[a], BEAD_R); // outer pole
            const dir = pole.clone().sub(eye).normalize();
            ray.set(eye, dir);
            const hits = ray.intersectObjects(targets, false);
            const dBeak = eye.distanceTo(pole);
            if (!(hits.length && hits[0].distance < dBeak - 0.05)) { vis++; perBead[a]++; }
        }
        if (vis < 3) worst = `vantage ${deg}°@${dist}m sees only ${vis} bead poles`;
    }
    if (worst) throw Error(`bead sightline fail: ${worst}`);
    const orphan = perBead.findIndex(c => c === 0);
    if (orphan >= 0) throw Error(`bead ${orphan} invisible from ALL vantages`);
    console.log(`bead sightline OK: ≥3 poles per vantage, all ${N_SEEDS} beads seen (min per-bead ${Math.min(...perBead)})`);
}

// ---- envelope + NaN assertions --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > CREST + 1e-6) throw Error(`crest ${sz.y.toFixed(3)} above ${CREST}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], tris flank ${triFlank} + cut ${triCut}`);
}

const merged = mergeByMaterial(g, "voronoi");
{
    let nodes = 0;
    merged.traverse((o: any) => { if (o.isMesh) nodes++; });
    if (nodes !== 2 + N_SEEDS) throw Error(`node census ${nodes} != ${2 + N_SEEDS} (2 stone buckets + ${N_SEEDS} beads)`);
    console.log(`node census OK: ${nodes} (2 stone buckets + ${N_SEEDS} KEEP beads, budget 5-45)`);
}
writeFileSync("agents/arthur/assets/village_voronoi3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_voronoi3.glb`);
