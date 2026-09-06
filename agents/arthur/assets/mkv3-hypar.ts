// mkv3-hypar.ts — STRUCTURES LANE struct-4: S-3 HYPAR PAVILION.
// Ruled Sky at building scale: a hyperbolic-paraboloid canopy expressed
// entirely as its own straight rulings — 24 timber slats of the y=x+c
// family on z = k(x²−y²), edge beams tracing the parabolic boundary, four
// slender dark posts to the high corners, brass saddle pins at the high
// corners, stone plinth deck. One idea: the saddle built from straight
// lines. Consumes the new housekit hyparShell primitive.
// Collider honesty: bbox 10.4×10.4 = 108m² >= 16, height ~5.3 >= 2.2 ->
// real trimesh, open sides (a shade pavilion — walk in from any side).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { hyparShell } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-38/40 law: plain mat() buckets export material:undefined and render
// COLOR_0 × loader-default (near-black) — brass pins read as dark specks and
// the posts lost their iron read. Textured lanes only (waysign gold family).
const goldTex = texMat("hypar_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });
const darkTex = texMat("hypar_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1] });

const A = 4.5;         // half-plan
const K = 0.13;        // curvature: corner rise = K*A² = 2.63m
const CANOPY_Y = 3.15; // canopy mean plane

// stone deck (paved square, rise 0.22 <= 0.25)
{
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2 * A + 0.6, 0.22, 2 * A + 0.6), stoneTex);
    deck.name = "deck";
    deck.position.y = 0.11;
    g.add(deck);
}

// THE SADDLE: 24 straight rulings, one material, one merged node.
// struct-40: over=0 — FLUSH rim. The parabolic edge beams own the silhouette
// entirely; every slat terminates on its beam (Judd-clean margin; judged
// v1 0.7m-tails and v2 0.30m-budget tails both read as spears at 18m).
hyparShell(g, "hypar", A, CANOPY_Y, K, 24, 0, timberTex);

// edge beams: the two parabolic boundary curves x=±a (and y=±a) traced as
// segmented straight chords (6 chords each, 2 boundary families on the two
// low + two high edges) — the rim the eye follows
{
    const N = 8;
    const mkEdge = (axis: "x" | "y", sign: 1 | -1, tag: string) => {
        const z = (u: number, v: number) => K * (u * u - v * v);
        for (let i = 0; i < N; i++) {
            const t0 = -A + (2 * A * i) / N, t1 = -A + (2 * A * (i + 1)) / N;
            const p0 = axis === "x" ? [sign * A, t0, z(sign * A, t0)] : [t0, sign * A, z(t0, sign * A)];
            const p1 = axis === "x" ? [sign * A, t1, z(sign * A, t1)] : [t1, sign * A, z(t1, sign * A)];
            const a = new THREE.Vector3(p0[0], CANOPY_Y + p0[2], p0[1]);
            const b = new THREE.Vector3(p1[0], CANOPY_Y + p1[2], p1[1]);
            const seg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, a.distanceTo(b) + 0.04), timberTex);
            seg.name = `${tag}_${i}`;
            seg.position.copy(a.clone().add(b).multiplyScalar(0.5));
            seg.lookAt(b);
            g.add(seg);
        }
    };
    mkEdge("x", 1, "edge_xp");
    mkEdge("x", -1, "edge_xn");
    mkEdge("y", 1, "edge_yp");
    mkEdge("y", -1, "edge_yn");
}

// four slender posts to the CORNERS — on z = k(x²−y²) the corners sit at
// the mean plane (z=0), edges arch: crest at (±a,0) +K·a², dip at (0,±a)
// −K·a². Posts carry the canopy at its four corner points.
for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
    const topY = CANOPY_Y; // corner ruling height = mean plane
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, topY, 10), darkTex);
    post.name = `post_${sx}${sz}`;
    post.position.set(sx * A, topY / 2, sz * A);
    g.add(post);
}
// brass saddle pins at the two CREST midpoints (±a, 0) — the saddle's high
// anchors, riding just above the boundary beam apex
for (const sx of [1, -1] as const) {
    const crestY = CANOPY_Y + K * A * A;
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), goldTex);
    pin.name = `pin_${sx}`;
    pin.position.set(sx * A, crestY + 0.14, 0);
    g.add(pin);
}

const merged = mergeByMaterial(g, "hypar");
writeFileSync("agents/arthur/assets/village_hypar3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_hypar3.glb");
