// mkv3-dress-nw-hedge1.ts — dress-1, NW CULTIVATION hedgerow.
// Concept contract: a laid hedgerow edging the NW district's field plots,
// with a worker's gap (a stone step through) where a spur meets the plots.
// Grounds USE: cultivation districts edge their fields with hedges — stock
// barrier, windbreak, and boundary marker in one. The gap is where people
// and barrows pass; the stone step keeps boots out of the mud after rain.
// Species honesty: two canopy greens from the village palette canon, one
// hazel stub (bark) rising from the taller segment, field stones at the
// bank foot. Static, unlit — spends no lamp budget.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const SOIL = mat(0x44402e, .95, 0);            // dark soil bank
const CANOPY = mat(0x728e5a, .95, 0);          // palette canopy
const CANOPY_DK = mat(0x5c7648, .95, 0);       // palette canopy-dk
const ROCK = mat(0x8c887e, .95, 0);            // palette rock
const BARK = mat(0x6a6030, .95, 0);            // palette bark/trunk

// v2 after native-view rejection: v1's two plain slabs read as boxes, not a
// laid hedge. A hedge is MASS: overlapping irregular segments in both
// greens, ragged top, stones big enough to read. Same footprint/gap law.
const add = (n: string, m: THREE.Mesh) => { m.name = n; g.add(m); return m; };
const box = (n: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) =>
    add(n, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)).position.set(x, y, z);

// soil bank
box("soil_bank", 6.6, 0.24, 1.1, 0, 0.12, 0, SOIL);

// long segment massed: 5 overlapping blocks, ragged top (canopy + dk mix)
box("hedge_l1", 1.5, 1.10, 0.85, -2.55, 0.24 + 0.55, 0.02, CANOPY);
box("hedge_l2", 1.3, 1.30, 0.90, -1.65, 0.24 + 0.62, -0.05, CANOPY_DK);
box("hedge_l3", 1.1, 0.95, 0.75, -0.95, 0.24 + 0.46, 0.06, CANOPY);
box("hedge_l4", 0.7, 1.18, 0.8, -0.45, 0.24 + 0.57, -0.03, CANOPY_DK);
box("hedge_l5", 0.5, 0.80, 0.7, -0.05, 0.24 + 0.38, 0.04, CANOPY);

// gap: x 0.2..1.6 (1.4m clear), stone step + flanking kerb stones (readable)
box("gap_step", 1.0, 0.18, 0.9, 0.9, 0.09, 0, ROCK);
box("kerb_a", 0.5, 0.45, 0.45, 0.22, 0.24 + 0.1, 0, ROCK);
box("kerb_b", 0.45, 0.38, 0.4, 1.62, 0.24 + 0.08, 0.05, ROCK);

// short segment massed (canopy-dk dominant)
box("hedge_s1", 1.2, 0.90, 0.8, 2.25, 0.24 + 0.43, 0, CANOPY_DK);
box("hedge_s2", 0.9, 1.10, 0.85, 2.85, 0.24 + 0.53, -0.04, CANOPY);

// hazel stub with two branch nubs (reads as cut pleacher, not a post)
box("hazel_stub", 0.18, 1.7, 0.18, -1.65, 0.24 + 0.82, 0.05, BARK);
box("hazel_br1", 0.5, 0.12, 0.12, -1.42, 0.24 + 1.28, 0.05, BARK);
box("hazel_br2", 0.12, 0.4, 0.12, -1.78, 0.24 + 1.55, 0.02, BARK);

// field stones at the bank foot — sized to read at distance
box("stone_a", 0.55, 0.4, 0.5, -3.0, 0.2, 0.7, ROCK);
box("stone_b", 0.45, 0.32, 0.45, 3.0, 0.16, -0.66, ROCK);

mergeByMaterial(g, "dress_nw_hedge1");
writeFileSync("agents/arthur/assets/village_dress_nw_hedge1.glb", toGLB(g));
console.log("village_dress_nw_hedge1.glb —", g.children.length, "nodes");
