// mkv3-meridianstair.ts — STRUCTURES LANE struct-47: R4-1 THE MERIDIAN STAIR.
// Round-4 commission: the honest compact reading of the struct-22
// infeasibility proof — the hypar language returns as a portal, not a
// 19m gate. One idea: ASCENDING STEPS. Three true-hypar saddle panels
// side by side across a 5.0m walk lane, each stepped +0.55m above its
// left neighbor, so the canopy climbs left→right over the walker's head —
// three parabola arcs rising like a stair frozen mid-ascent. Silhouette
// at gameplay distance: compact arch, stepped crown, ascending read.
//
// Panel truth: each panel is the patch z = k(u² − v²), u across (X,
// half-width a=1.0667), v along the lane (Z, half-depth b=2.5), k=0.08.
// Slats are TRUE rulings (v = u + c family — straight lines on the
// surface), hyparShell's law; the saddle dips 0.5m at each face center
// and rises 0.09m at the side edges. Entrance clearance under the LOWEST
// panel edge: panelY0 3.2 − k·b² = 2.70m ≥ 2.2 ✓.
//
// Steps: panel i rides at panelY = 3.2 + i·0.55 (3.2 / 3.75 / 4.3).
// Edge beams at v = ±b trace y = panelY + k(u² − b²) — the front
// elevation shows three stepped arcs; the step read IS the silhouette.
//
// Posts: hypar_iron square posts at the four panel-boundary X positions
// (−3.2, −1.067, +1.067, +3.2) × Z faces (±2.5) = 8 posts; each shared
// boundary post rises to its HIGHER panel's corner. The two rightmost
// posts (3.89m — the work's summit) carry gold glow pins: the ascent's
// summit markers at dusk (struct-21/30/33 lineage; no new light entity).
//
// COLLIDER CLASS: bbox ≈ 6.58×4.0×5.14 → 33.8m² ≥ 16 and 4.0 ≥ 2.2 —
// honest room gates, real trimesh. Door lane: between the inner posts at
// x = ±1.067 (half 0.09) the clear span is 1.95m ≥ 1.4 ✓; MCPL walk-test
// through the lane is the falsifier.
//
// Materials: standing families only, texMat lanes per the struct-38/39/
// 40/42 law (timber / hypar_iron / hypar_gold buckets + one emissive
// glow bucket). Static, no motion, no comps. 4 merged nodes.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const timber = texMat("timber", [0x6e5a3e, 0x77654a, 0x5c4c34], { rough: 0.85, scale: 1.5 });
const iron = texMat("hypar_iron", [0x44423a, 0x4c4a40, 0x3a3830], { rough: 0.9, scale: 1.2 });
const gold = texMat("hypar_gold", [0xa09832, 0x887c2a, 0xa89a40], { rough: 0.55, scale: 0.8 });
// warm dusk glow bucket (struct-21/30/33 lineage — the pins ARE the lamps)
const glow = mat(C.BRASS, 0.55, 0);
(glow as any).emissive = new THREE.Color(0x8a5a20);
(glow as any).emissiveIntensity = 0.6;

// ── geometry constants ──────────────────────────────────────────────
const PANEL_W = 6.4 / 3;   // 2.1333m per panel along X
const A = PANEL_W / 2;     // panel half-width u ∈ [−A, A]
const B = 2.5;             // lane half-depth v ∈ [−B, B]
const K = 0.08;            // hypar curvature
const STEP = 0.55;         // ascent per panel
const BASE_Y = 3.2;        // panel 0 ride height

const zOf = (u: number, v: number) => K * (u * u - v * v);

// ── three stepped saddle panels ─────────────────────────────────────
for (let i = 0; i < 3; i++) {
    const cx = -3.2 + A + i * PANEL_W; // panel center X
    const panelY = BASE_Y + i * STEP;

    // ruling slats: lines v = u + c in panel-local coords, one family
    // covers the patch. Slat = box between P(t0) and P(t1).
    const slats = 11;
    const start = new THREE.Vector3(), end = new THREE.Vector3();
    for (let s = 0; s < slats; s++) {
        const c = -(A + B) + (2 * (A + B) * (s + 0.5)) / slats;
        // t range where |t|<=A and |t+c|<=B
        const tMin = Math.max(-A, -B - c), tMax = Math.min(A, B - c);
        if (tMax - tMin < 0.25) continue;
        const p = (t: number) => [cx + t, panelY + zOf(t, t + c), t + c] as [number, number, number];
        const [x0, y0, z0] = p(tMin), [x1, y1, z1] = p(tMax);
        start.set(x0, y0, z0); end.set(x1, y1, z1);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const len = start.distanceTo(end);
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, len), timber);
        slat.name = `panel${i}_s${s}`;
        slat.position.copy(mid);
        slat.lookAt(end);
        g.add(slat);
    }

    // stepped parabola edge beams at the two lane faces (v = ±B):
    // y = panelY + K(u² − B²), u across the panel. 4 segments each.
    for (const side of [-1, 1]) {
        const segs = 4;
        for (let sgm = 0; sgm < segs; sgm++) {
            const u0 = -A + (2 * A * sgm) / segs, u1 = -A + (2 * A * (sgm + 1)) / segs;
            const p0 = new THREE.Vector3(cx + u0, panelY + zOf(u0, side * B), side * B);
            const p1 = new THREE.Vector3(cx + u1, panelY + zOf(u1, side * B), side * B);
            const mid = p0.clone().add(p1).multiplyScalar(0.5);
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, p0.distanceTo(p1)), timber);
            beam.name = `panel${i}_eb${side < 0 ? "f" : "b"}${sgm}`;
            beam.position.copy(mid);
            beam.lookAt(p1);
            g.add(beam);
        }
    }
}

// ── iron posts at panel boundaries ──────────────────────────────────
// corner height of panel i = panelY_i + K(A² − B²) = panelY_i − 0.409
const CORNER_DIP = K * (A * A - B * B); // −0.409
const postX = [
    { x: -3.2, top: BASE_Y + 0 * STEP + CORNER_DIP },      // panel 0 left
    { x: -3.2 + PANEL_W, top: BASE_Y + 1 * STEP + CORNER_DIP }, // shared 0|1 (higher)
    { x: -3.2 + 2 * PANEL_W, top: BASE_Y + 2 * STEP + CORNER_DIP }, // shared 1|2
    { x: 3.2, top: BASE_Y + 2 * STEP + CORNER_DIP },       // panel 2 right (summit)
];
for (const [pi, p] of postX.entries()) {
    for (const side of [-1, 1]) {
        const h = p.top;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), iron);
        post.name = `post${pi}${side < 0 ? "f" : "b"}`;
        post.position.set(p.x, h / 2, side * B);
        g.add(post);
        // summit pins: the two rightmost posts carry gold bead + glow core
        if (pi === 3) {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), gold);
            bead.name = `pin_${side < 0 ? "f" : "b"}`;
            bead.position.set(p.x, h + 0.09, side * B);
            g.add(bead);
            const core = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), glow);
            core.name = `pincore_${side < 0 ? "f" : "b"}`;
            core.position.set(p.x, h + 0.09, side * B);
            g.add(core);
        }
    }
}

const merged = mergeByMaterial(g, "meridianstair");
writeFileSync("agents/arthur/assets/village_meridianstair3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_meridianstair3.glb");
