// mkv3-mile-nw.ts — mile-N lane, queue item 1: NW leg bend milestone PAIR.
// Boundary: the NW approach lane's bend (az306 run -> az315 home), B =
// (-46.923, 34.092) from the committed polyline in mkv3-nw-approach1.ts
// (P1 = 58·sin(306°), 58·cos(306°)). ONE pair = TWO entities: a single GLB
// (village_mile_nw.glb) spawned twice — nx-mile-nw-001 at the outer (NW)
// verge post, nx-mile-nw-002 at the inner (SE) verge post, each sited on the
// bend bisector (az 310.5°) at ±2.3m perpendicular offset from B. 2.3m clears
// the paver film (half-width 0.46m), the verge-stone hem (1.35m), and the
// 1.4m walker pinch law against the film edge with margin.
// Idiom: refine-295 heritage (mkv3-miles14.ts) — stone post + ashlar cap +
// forge-iron language. WAYMARKER scale per the height law: post top 1.00m
// (not 1.5m field-edge scale) — the marker is found BY the eye on the lane,
// it never competes with gate or district works. UNLIT: the bend sits between
// the leg's own lamps (-001 at t=-8.6, -002 at +12.7 along the walk), so no
// lamp budget is spent; the iron ferrule carries the smith idiom by day.
// Materials: village stone tile (tex-27 law), forge iron (tex-63 law).
// No lamp / no KEEP anchors -> mergeByMaterial may merge fully; budget 3-10
// nodes is satisfied trivially (post, cap, ferrule buckets).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });

const g = new THREE.Group();
const put = (name: string, geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.name = name; mesh.position.set(x, y, z); g.add(mesh);
};

// stone post: 0.30 x 0.86 x 0.30, top at y=0.86; ashlar cap 0.42 x 0.08 x 0.42 at top 0.94
put("mpost", new THREE.BoxGeometry(0.30, 0.86, 0.30), stoneTex, 0, 0.43, 0);
put("mcap", new THREE.BoxGeometry(0.42, 0.08, 0.42), stoneTex, 0, 0.90, 0);
// forge-iron ferrule band + finial (the smith's mark, unlit)
put("mferrule", new THREE.CylinderGeometry(0.185, 0.185, 0.06, 10), ironTex, 0, 0.845, 0);
put("mfinial", new THREE.CylinderGeometry(0.035, 0.035, 0.10, 8), ironTex, 0, 0.99, 0);
// post total top: 1.04m — under the 1.1m waymarker law. 5 meshes -> merged
// into 2 material buckets (stone, iron) by mergeByMaterial.

mergeByMaterial(g, "milenw");
writeFileSync("agents/arthur/assets/village_mile_nw.glb", toGLB(g));
console.log("village_mile_nw.glb —", g.children.length, "top-level nodes before merge");
