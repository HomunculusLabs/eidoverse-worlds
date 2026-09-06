// mkv3-mile-nw2.ts — mile-N lane, queue item 4 (mile-5): NW district ARRIVAL
// milestone PAIR, LIT variant (refine-198 milestone-lamp language). Boundary:
// the NW leg's arrival A = pol(71, 315°) = (-50.205, 50.205), end of the
// committed az315 home-straight polyline in mkv3-nw-approach1.ts (P2 = r71).
// Provably past every NW light: last live leg light is
// nx-approach-nw-lamp-002-l at r66.9 — so this marker MAY carry ONE warm
// milestone-lamp (range 8). NW lamp budget: 1 used here (per-pair, one lamp
// on the village-facing post only; the district-side twin stays unlit stone).
// Idiom: refine-295 heritage — stone post + ashlar cap + forge-iron lantern.
// v2: hook drop + open-bar cage + plinth flare (v1 arm read as a nub).
// v3 micro-pass (review): wider suspension gap (0.10m), cage enlarged
// (~25% of post height, carries silhouette hierarchy over the cap), arm
// shortened to 0.20m reach. HEIGHT LAW: overall top = arm top 0.91 <= 1.1m.
// Cage group is the KEEP anchor ("lamp"); the authored light verb provides
// the night read (GLB carries no emissive — stone unlit by day).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });

const g = new THREE.Group();
const put = (parent: THREE.Object3D, name: string, geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.name = name; mesh.position.set(x, y, z); parent.add(mesh);
};

// plinth flare (marker read), stone post, ashlar cap — tops 0.10 / 0.80 / 0.86
put(g, "mplinth", new THREE.BoxGeometry(0.40, 0.10, 0.40), stoneTex, 0, 0.05, 0);
put(g, "mpost", new THREE.BoxGeometry(0.30, 0.70, 0.30), stoneTex, 0, 0.45, 0);
put(g, "mcap", new THREE.BoxGeometry(0.42, 0.06, 0.42), stoneTex, 0, 0.83, 0);
// forge-iron arm off the cap's +x face: 0.20m reach, x 0.03 -> 0.23, top 0.91
put(g, "marm", new THREE.BoxGeometry(0.20, 0.04, 0.04), ironTex, 0.13, 0.89, 0);
// hook drop: 0.10m of open air below the arm tip (the suspension read)
put(g, "mhook", new THREE.CylinderGeometry(0.015, 0.015, 0.10, 6), ironTex, 0.23, 0.84, 0);
// OPEN cage lantern (KEEP anchor group "lamp"), enlarged: 0.19 wide x 0.24
// tall, top 0.77, bottom 0.53 — ~25% of the 0.91 top height, reads over cap.
const cage = new THREE.Group(); cage.name = "lamp"; g.add(cage);
put(cage, "ctop", new THREE.BoxGeometry(0.19, 0.03, 0.19), ironTex, 0.23, 0.755, 0);
put(cage, "cbot", new THREE.BoxGeometry(0.19, 0.03, 0.19), ironTex, 0.23, 0.545, 0);
for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
    put(cage, `cbar${sx}${sz}`, new THREE.BoxGeometry(0.025, 0.21, 0.025), ironTex, 0.23 + sx * 0.0825, 0.65, sz * 0.0825);
}
// light-verb target: cage center local (0.23, 0.65, 0).
// overall top = arm 0.91m <= 1.1m. 10 meshes -> 2 material buckets + 1 KEEP
// group by mergeByMaterial.
mergeByMaterial(g, "milenw2");
writeFileSync("agents/arthur/assets/village_mile_nw2.glb", toGLB(g));
console.log("village_mile_nw2.glb —", g.children.length, "top-level nodes before merge");
