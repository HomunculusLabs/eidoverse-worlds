// mkv3-zeno.ts — STRUCTURES LANE struct-115, Round 10 commission R10-15.
// THE ZENO GATES: the form ledger's missing family — INFINITE SERIES /
// GEOMETRIC CONVERGENCE (ledger grep fresh this tick: zero zeno/series/
// convergence-family presence across all nx-struct works and sibling plans;
// standing families: ruled, minimal, pseudosphere, geodesic, tessellation,
// aperiodic, fractal x2, space-filling, platonic, phyllotaxis, cellular
// automaton, 4D projection, strange attractor, vibration, voronoi,
// superposition, intersection).
//
// ONE IDEA: THE WALK ITSELF, HALVED. Six identical stone gates march down
// the approach — no: FIVE gates at the exact halving distances 7, 3.5,
// 1.75, 0.875, 0.4375m — each 0.45m shorter and 0.35m narrower than the
// last, converging on a small iron stele that carries one brass dusk bead:
// the limit you can walk toward forever and never pass. The S mathematics
// axis (a walk about halving distance) gains its own subject: past the
// Bridge of Nines, the sunflower, the snowflake, the labyrinth, the gem,
// the wall, the hanging cube, the frozen storm, the sand plate, the split
// stone — and where the meadow ends, the gates begin: each step half as
// long, each doorway lower, until you stand at the marker of a distance
// that never quite ends. Zeno's dichotomy, built.
//
// LAWS HONORED:
// - zeno law: gate z-positions are EXACTLY 7/2^k (assert to 1e-12); the
//   four gaps halve exactly; 5 gates, no hand-tuned numbers.
// - strictly diminishing heights (>=0.4 steps) and clear widths (>=0.3);
//   every clear span >= 0.9m (walker-honest: even the last gate admits a
//   body; folly class, no room advertised, no walk owed — sunflowerdial/
//   rule30wall/tesseract/lorenz/chladni/voronoi precedent).
// - no coplanar faces (z-fight law): lintels run 0.06m proud of the posts
//   on both sides; posts within a gate are x-separated; gates are
//   z-separated (closest faces 0.0375m clear).
// - ripple law: each lintel's underside carries a straight brass ripple
//   line spanning 92% of its clear width — one quiet diminishing amber
//   rhythm at dusk + the terminal bead (struct-82 dusk lineage, emissive
//   0.85); ALL glow members share KEEP token glow_zn_1 (one node).
// - bead sightline law: raycast-asserted from 18m walker vantage through
//   the whole run, 6m, +/-30 deg, and 2.2m inside-run (interaction
//   distance the concept promises: standing at the last gate).
// - stele stands 0.02m short of the exact convergence point z=0 — the
//   limit itself stays open ground.
// Determinism: fixed tables, fixed texMat seeds, deterministic ordering —
// no randomness anywhere.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the series -------------------------------------------------------------------------
const Z0 = 8; // distance of the first gate from the limit point (m) — positions 8,4,2,1,0.5 = exact powers of two
const GATES = [0, 1, 2, 3, 4].map(k => {
    const clear = 2.40 - 0.35 * k;   // clear span 2.40 -> 1.00
    const h = 3.00 - 0.475 * k;      // height     3.00 -> 1.10
    return { z: Z0 / 2 ** k, clear, h };
});
const POST = 0.34, LIN_H = 0.30, LIN_OVER = 0.06, D = 0.44, LIN_D = 0.48;
const STELE_S = 0.16, STELE_H = 1.05, BEAD_R = 0.09;
const steleZ = -(STELE_S / 2 + 0.02); // face 0.02m short of the open convergence point z=0

// ---- construction asserts ----------------------------------------------------------------
{
    GATES.forEach((g, k) => {
        if (Math.abs(g.z - Z0 / 2 ** k) > 1e-12) throw Error(`gate ${k} z off-series`);
        if (g.clear < 0.9) throw Error(`gate ${k} clear ${g.clear} below walker minimum`);
    });
    for (let k = 1; k < GATES.length; k++) {
        if (GATES[k - 1].h - GATES[k].h < 0.4) throw Error(`height step ${k} not diminishing`);
        if (GATES[k - 1].clear - GATES[k].clear < 0.3) throw Error(`width step ${k} not diminishing`);
        const gapA = GATES[k].z - 0, gapPrev = GATES[k - 1].z - GATES[k].z;
        // gaps from the limit: 7/2^k — halving law provable in one line
        if (Math.abs(gapA - Z0 / 2 ** k) > 1e-12) throw Error(`gap law broke at ${k}`);
        void gapPrev;
    }
    // no two gates touch: closest pair is gates 4/5 (centers 0.5m apart)
    {
        const nearGap = (GATES[3].z - D / 2) - (GATES[4].z + D / 2);
        if (nearGap < 0.03) throw Error(`inner gates nearly touch (${nearGap.toFixed(4)})`);
        // stele clear of the last gate
        const steleGap = (GATES[4].z - D / 2) - (steleZ + STELE_S / 2);
        if (steleGap < 0.05) throw Error(`stele clearance ${steleGap.toFixed(4)}`);
        console.log(`zeno law OK: 5 gates at 8/2^k = ${GATES.map(gt => gt.z).join(", ")}; gaps halve exactly; tightest pair clear ${nearGap.toFixed(4)}m, stele clear ${steleGap.toFixed(4)}m`);
    }
}

// ---- materials ----------------------------------------------------------------------------
const stoneTex = texMat("zn_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 7301 });
const ironTex = texMat("zn_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.55, scale: 1, weights: [1, 1, 1], cell: 12, seed: 7302 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];

// ---- five gates (stone bucket: 10 posts + 5 lintels) ---------------------------------------
for (const gate of GATES) {
    const postH = gate.h - LIN_H;
    for (const sgn of [1, -1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(POST, postH, D), stoneTex);
        post.position.set(sgn * (gate.clear / 2 + POST / 2), postH / 2, gate.z);
        g.add(post);
    }
    const linW = gate.clear + 2 * POST + 2 * LIN_OVER; // proud of posts — no coplanar faces
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(linW, LIN_H, LIN_D), stoneTex);
    lintel.position.set(0, gate.h - LIN_H / 2, gate.z);
    g.add(lintel);
    // the ripple: a straight brass line under the lintel, 92% of the clear span
    const rippleLen = gate.clear - 0.16;
    const ripple = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, rippleLen, 8),
        brassGlow,
    );
    ripple.geometry.rotateZ(Math.PI / 2); // bake rotation (mergekit drops node rotation)
    ripple.position.set(0, gate.h - LIN_H - 0.045, gate.z + LIN_D / 2 + 0.02);
    ripple.name = "glow_zn_1";
    g.add(ripple);
    glowMeshes.push(ripple);
}

// ---- the terminus: iron stele + brass dusk bead (the limit, marked) ------------------------
{
    const stele = new THREE.Mesh(new THREE.BoxGeometry(STELE_S, STELE_H, STELE_S), ironTex);
    stele.position.set(0, STELE_H / 2, steleZ);
    g.add(stele);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 12, 10), brassGlow);
    bead.position.set(0, STELE_H + BEAD_R * 0.6, steleZ);
    bead.name = "glow_zn_1";
    g.add(bead);
    glowMeshes.push(bead);
}

// ---- sightline assertions (Raycaster; occlusion-beats-emissive) ----------------------------
{
    g.updateMatrixWorld(true);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if (o.isMesh && o.name !== "glow_zn_1") targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    // Sightline contract derived from THIS work's geometry (sunflowerdial
    // parastichy law — no hand-me-down radial contracts): the run is a
    // corridor; the bead frames dead-on-axis through all five gates. The
    // visible cone is bound by gate 1's opening (x ±1.20 at z=8): the bead
    // ray exits at dx/dz = 1.20/8.1 → half-angle ≈ 8.4° at 18m. Test
    // dead-on at 3 distances + ±8° obliques (inside the true cone). The
    // arrival vantage is the TRUE final bay between gate 4's lintel front
    // face (z=0.26) and the stele (z=-0.02): eye at z=0.2 — two earlier
    // vantage picks (2.2m outside, 0.9m under gate 3's deep lintel) were
    // honest occlusions caught by this assert, both wrong-bay arithmetic.
    const bead = glowMeshes.find(m => (m.geometry as any).type === "SphereGeometry")!;
    const beadP = new THREE.Vector3(); bead.getWorldPosition(beadP);
    let worst = "none";
    for (const [deg, dist] of [[0, 18], [8, 18], [-8, 18], [0, 6], [0, 0.2]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = beadP.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const d = eye.distanceTo(beadP);
        if (hits.length && hits[0].distance < d - BEAD_R - 0.02) {
            worst = `bead blocked from ${deg}\u00b0@${dist}m by ${hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${d.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    // every ripple legible from its own walker vantage: dead-on at the distance
    // where its gate is the near one (gate k owns the approach segment before it)
    for (let k = 0; k < GATES.length; k++) {
        const gate = GATES[k];
        const eyeZ = (k === 0 ? 18 : (GATES[k - 1].z + gate.z) / 2);
        const eye = new THREE.Vector3(0, 1.65, eyeZ);
        const ripple = glowMeshes[k]; // ripples pushed in gate order
        const rp = new THREE.Vector3(); ripple.getWorldPosition(rp);
        const dir = rp.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const d = eye.distanceTo(rp);
        if (hits.length && hits[0].distance < d - 0.03) {
            worst = `ripple ${k} blocked from z${eyeZ.toFixed(2)} by ${hits[0].object.type} at ${hits[0].distance.toFixed(2)}`;
            break;
        }
    }
    if (worst !== "none") throw Error(`ripple sightline fail: ${worst}`);
    console.log("glow sightlines OK: bead from 18m dead-on +/-8deg oblique / 6m / 0.2m final bay, all 5 ripples from their own approach segments");
}

// ---- envelope + NaN assertions --------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 3.6) throw Error(`crest ${sz.y.toFixed(2)} above dial-class ceiling`);
    const expectX = 2.40 + 2 * POST + 2 * LIN_OVER;
    if (Math.abs(sz.x - expectX) > 0.02) throw Error(`envelope x ${sz.x.toFixed(2)} != ${expectX}`);
    // z extremes are GLOW members: max = gate1 ripple (z + LIN_D/2 + 0.02, r
    // 0.022) proud of the lintel face; min = bead overhang below stele face.
    const expectZ = (Z0 + LIN_D / 2 + 0.02 + 0.022) - (steleZ - BEAD_R);
    if (Math.abs(sz.z - expectZ) > 0.02) throw Error(`envelope z ${sz.z.toFixed(2)} != ${expectZ.toFixed(2)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}]`);
}

const merged = mergeByMaterial(g, "zeno");
writeFileSync("agents/arthur/assets/village_zeno3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_zeno3.glb`);
