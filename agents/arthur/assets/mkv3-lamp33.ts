// mkv3-lamp33.ts — new-era loop 33: STREET LAMPS. The plaza, gates, and
// yards are lit — but the SPOKES between (the walk home at dusk) are dark
// corridors. Four iron street lamps at spoke midpoints (r10, the quiet
// stretch between plaza ring and door paths): post, crossarm w/ hanging
// lantern (emissive core), drip pan.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// tex-33 METAL III: the street lamps join the iron family — posts, drip
// pans, caps, and finials all take the forge iron tile (one smith's iron
// through every lamp on the walk home). The emissive cores stay
// untouched — the light is the light, not the metal.
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });

const lamp = (deg: number, tag: string) => {
    const g = new THREE.Group();
    const a = (deg * Math.PI) / 180;
    const x = Math.cos(a) * 10, z = Math.sin(a) * 10;
    // post w/ taper
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.3, 7), ironTex);
    post.name = `${tag}_post`;
    post.position.set(x, 1.15, z);
    g.add(post);
    // drip pan at base
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 8), ironTex);
    pan.name = `${tag}_pan`;
    pan.position.set(x, 0.05, z);
    g.add(pan);
    // lantern cage + emissive core
    {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), ironTex);
        cap.name = `${tag}_cap`;
        cap.position.set(x, 2.42, z);
        g.add(cap);
    }
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.13), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    core.name = `${tag}_core`;
    core.position.set(x, 2.3, z);
    g.add(core);
    // finial
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), ironTex);
    fin.name = `${tag}_fin`;
    fin.position.set(x, 2.5, z);
    g.add(fin);
    return g;
};

const g = new THREE.Group();
for (const [si, deg, tag] of [[0, 20, "sl0"], [1, 70, "sl1"], [2, 110, "sl2"], [3, 160, "sl3"], [4, 200, "sl4"], [5, 250, "sl5"], [6, 290, "sl6"], [7, 340, "sl7"]] as const) {
    g.add(lamp(deg, tag));
}
mergeByMaterial(g, "sl3x");
writeFileSync("agents/arthur/assets/village_streetlamps3.glb", toGLB(g));
console.log("village_streetlamps3.glb —", g.children.length, "nodes");
