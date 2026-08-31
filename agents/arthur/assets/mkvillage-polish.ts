// mkvillage-polish.ts — polish pieces: curved plaza benches (2), house
// interior lamp GLBs already exist as lights; this adds: well bucket crank,
// stall goods variety, plaza tree (trunk + canopy blobs), and 2 more banners.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { writeFileSync } from "node:fs";

// ---- curved bench: 4 slabs in an arc + 2 legs each ----
function arcBench(tag: string) {
    const g = new THREE.Group();
    const R = 2.6, segs = 5, arc = Math.PI / 2.2;
    for (let i = 0; i < segs; i++) {
        const a = -arc / 2 + (i / (segs - 1)) * arc;
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.07, 0.42), mat(C.MID, 0.9, 0));
        s.name = `${tag}_slab_${i}`;
        s.position.set(Math.sin(a) * R, 0.45, Math.cos(a) * R - R + 0.6);
        s.rotation.y = a;
        g.add(s);
    }
    for (const i of [0, Math.floor(segs / 2), segs - 1]) {
        const a = -arc / 2 + (i / (segs - 1)) * arc;
        box(g, `${tag}_leg_${i}`, 0.1, 0.42, 0.3, Math.sin(a) * R, 0.21, Math.cos(a) * R - R + 0.6, C.DARK);
    }
    return g;
}

// ---- plaza tree: trunk + 3 canopy blobs ----
function tree(tag: string) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.6, 8), mat(C.DARK, 0.95, 0));
    trunk.name = `${tag}_trunk`;
    trunk.position.y = 1.3;
    g.add(trunk);
    for (const [dx, dy, dz, r] of [[0, 3.0, 0, 1.0], [0.6, 2.6, 0.3, 0.7], [-0.55, 2.7, -0.2, 0.75]] as const) {
        const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(0x446632, 0.95, 0));
        blob.name = `${tag}_canopy_${dx.toFixed(1)}`;
        blob.position.set(dx, dy, dz);
        g.add(blob);
    }
    return g;
}

const OUT: Array<[string, THREE.Group]> = [
    ["village_bench_arc", arcBench("benchArc")],
    ["village_tree", tree("tree")],
];
for (const [n, g] of OUT) writeFileSync(`agents/arthur/assets/${n}.glb`, toGLB(g));
console.log(OUT.map(([n, g]) => `${n}(${g.children.length})`).join(", "));
