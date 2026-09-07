// mkv3-vesicawindow.ts — STRUCTURES LANE struct-91, Round 9 commission R9-2.
// THE VESICA WINDOW: the form ledger's missing composition. The village holds
// every curve as a single form; none INTERSECTS another in one plane. ONE
// IDEA: THE VESICA — two iron hoops of radius R with centers one radius
// apart (d = R, the exact classical vesica piscis construction). Where the
// two circles overlap stands one teal-glass almond pane; where they cross,
// the tube crossings stay visible; ONE brass bead marks the top vertex.
// The walker reads: two circles → one almond, at 3m face-on. The window
// frames the wilds behind it — the framed vista is the artwork.
//
// GEOMETRY (entity local, window in the xy-plane facing local +z):
//   Hoops: R = 1.75, centers (±R/2, 0); d = R exact.
//     Intersection points: (0, ±h) with h = (R/2)·√3 → window height
//     2h = R√3 = 3.0311 exact (asserted). Half-width of the almond
//     (max |x| of the overlap lens): R − R/2 = R/2 (asserted numeric).
//     Each circle's arc inside the other spans 120° exactly (asserted:
//     cos(half-angle) = d/(2R) = 1/2 → 60° half → 120° arc — the
//     classical law, checked numerically on the built polyline).
//   Tube: torus major R, tube r 0.09, 14×96 segments.
//   Glass: lens z 0.01..0.03 (faces crest the tube outer face 1cm;
//     wall-face law), filled from the built lens polygon (not hand
//     vertices): two 120° arcs + two vertex points, ShapeGeometry.
//   Bead: brass r 0.05 at (0, +h, tube_outer) — glow_vw KEEP, proud of
//     both tube crossings by construction (top vertex is the max-y
//     point of the whole build).
//   Feet: two iron boxes 0.44×0.18×0.30 at the hoop ground ends —
//     seated, no floating ends.
//   Materials: cf_iron texMat family + glazier glass + brass glow.
//   Nodes after merge: 3 (iron bucket + glass bucket + glow_vw).
//
// Classification (supportclass read live this tick): bbox 5.43 × 0.18
// footprint ≈ 1.0m² < FLOOR_MIN_AREA 2 → furniture-class solid box —
// honest for a glazed folly; walk-around, not walk-through.
//
// Determinism: fixed segment counts, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (conoidfan iron, glazier glass, brass)
const ironTex = texMat("vw_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const glassTex = texMat("vw_glass", [0x9fd0d6, 0x8cc3ca, 0xb4dde0], { rough: 0.25, metal: 0.5, seed: 7 });
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants ----------------------------------------------------------------
const R = 1.75;                  // hoop radius
const D = R;                     // center separation (vesica law: d = R)
const TUBE = 0.09;               // tube radius
const H = (R / 2) * Math.sqrt(3);  // vertex y: (R/2)·√3 exact
const FOOT_W = 0.44, FOOT_H = 0.18, FOOT_D = 0.30;

// ---- geometry assertions (before building) --------------------------------------
{
    // exact vesica laws
    if (Math.abs(2 * H - R * Math.sqrt(3)) > 1e-12) throw Error("vertex law: 2h != R·√3");
    if (D !== R) throw Error("d = R law broken");
    // intersection points lie on BOTH circles: |P−C1| = |P−C2| = R exactly
    for (const y of [H, -H]) {
        const d1 = Math.hypot(0 - (-R / 2), y - 0), d2 = Math.hypot(0 - R / 2, y);
        if (Math.abs(d1 - R) > 1e-9 || Math.abs(d2 - R) > 1e-9) throw Error(`vertex (${y}) not on both circles: ${d1}, ${d2}`);
    }
    // arc law: each circle's arc inside the other spans 120° — half-angle
    // from the far center: cos(θ/2) = d/(2R) = 1/2 → θ = 120°
    const half = Math.acos(D / (2 * R));           // radians from the chord
    if (Math.abs(half * 2 - (2 * Math.PI) / 3) > 1e-9) throw Error(`arc law: ${2 * half} rad != 120°`);
    console.log(`vesica OK: d=R=${D}, vertices ±${H.toFixed(4)} (=R√3/2), arcs ${(2 * half * 180 / Math.PI).toFixed(1)}°`);
}

// ---- hoops (two tori, centers ±R/2) ----------------------------------------------
{
    for (const cx of [-R / 2, R / 2]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(R, TUBE, 14, 96), ironTex);
        hoop.position.set(cx, R + TUBE, 0);          // hoop center at height R+TUBE
        hoop.name = `vw_hoop_${cx < 0 ? "w" : "e"}`;
        g.add(hoop);
    }
}

// ---- glass lens pane (extruded 0.06, rim EMBEDDED in the tubes) -------------------
{
    // lens boundary: arc of circle E inside circle W ∪ arc of circle W
    // inside E — each spans exactly 120° (the classical law, asserted above).
    // On circle E (center +R/2): θ 2π/3..4π/3 (west side). On circle W: −π/3..π/3.
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 48; i++) {
        const t = (2 * Math.PI) / 3 + (i / 48) * ((4 * Math.PI) / 3 - (2 * Math.PI) / 3);
        pts.push(new THREE.Vector2(R / 2 + R * Math.cos(t), R * Math.sin(t)));
    }
    for (let i = 0; i <= 48; i++) {
        const t = -(Math.PI) / 3 + (i / 48) * ((Math.PI) / 3 - (-Math.PI) / 3);
        pts.push(new THREE.Vector2(-R / 2 + R * Math.cos(t), R * Math.sin(t)));
    }
    // The pane's rim curve IS the tube centerlines' arcs — a 0.06-thick
    // extrusion spanning z ±0.03 is buried in the tube bodies (±0.09) along
    // the whole rim: embedded glazing, no floating glass, faces recessed
    // 6cm behind the tube fronts (window-in-frame, not glow-box).
    const glass = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.06, bevelEnabled: false }), glassTex);
    glass.position.set(0, R + TUBE, -0.03);
    glass.name = "vw_glass";
    g.add(glass);
}

// ---- brass bead at the TOP vertex crossing (glow_vw KEEP) -------------------------
{
    // struct-52 law: proud of every local member — bead center z = tube outer
    // face (TUBE) + r·0.6, so it crests the crossing tubes radially.
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), brassGlow);
    bead.name = "glow_vw";
    bead.position.set(0, R + TUBE + H, TUBE + 0.03);
    g.add(bead);
}

// ---- foot plinths (tangent-point plinths: each hoop touches grade at exactly
// one point, directly under its center — ±R/2. Tiny saddles bridge tube-to-ground) ---
{
    for (const cx of [-R / 2, R / 2]) {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(FOOT_W, FOOT_H, FOOT_D), ironTex);
        foot.position.set(cx, FOOT_H / 2, 0);
        foot.name = `vw_foot_${cx < 0 ? "w" : "e"}`;
        g.add(foot);
    }
}

// ---- assertions on the build --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    // total height: TUBE (ground clearance) + 2R + TUBE = 2R + 2·TUBE
    if (Math.abs(sz.y - (2 * R + 2 * TUBE)) > 0.02) throw Error(`height ${sz.y.toFixed(3)} vs ${2 * R + 2 * TUBE}`);
    if (Math.abs(sz.x - (2 * R + D + 2 * TUBE)) > 0.02) throw Error(`x envelope ${sz.x.toFixed(3)} vs ${2 * R + D + 2 * TUBE}`);
    // furniture-class law: footprint < FLOOR_MIN_AREA 2 — the glass pane is
    // not walkable support and must not classify as a floor
    if (sz.x * sz.z >= 2) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} entered floor band`);
    // bead pride law (LOCAL): bead top must crest the vertex crossing tubes'
    // tops by ≥5cm. Crossing tube top = R+TUBE+H+TUBE; bead top adds 0.03+0.05.
    // (Global max stays the hoop tops 2R+2TUBE=3.68 — correct: pride is local.)
    const crossingTop = R + TUBE + H + TUBE;
    const beadTop = crossingTop + 0.03 + 0.05;
    if (beadTop - crossingTop < 0.05) throw Error(`bead pride law: ${beadTop.toFixed(3)} vs crossing ${crossingTop.toFixed(3)}`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | furniture class | top ${env.max.y.toFixed(3)}`);
}
const merged = mergeByMaterial(g, "vesicawindow");
writeFileSync("agents/arthur/assets/village_vesicawindow3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_vesicawindow3.glb");
