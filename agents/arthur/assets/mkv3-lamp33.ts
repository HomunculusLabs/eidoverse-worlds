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
// polish-312 night sheen (polish-305 wire lineage): the iron itself reads
// faintly warm after dark so posts/roofs support the glow instead of
// leaving floating dots on hairline sticks.
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
ironTex.emissive = new THREE.Color(0xffc98a);
ironTex.emissiveIntensity = 0.15;

const lamp = (deg: number, tag: string) => {
    const g = new THREE.Group();
    g.name = `lamp${tag}`; // KEEP: per-lamp statics fold into one group node
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
    // lantern head (polish-312): collar → glass core under an overhanging
    // eave plate → 4-sided pyramid roof → finial re-based on the roof apex
    // (village crown language, polish-272 overhang law). Head 0.38 → 0.66m.
    {
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.075, 0.07, 8), ironTex);
        collar.name = `${tag}_collar`;
        collar.position.set(x, 2.325, z);
        g.add(collar);
    }
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.26, 0.15), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    core.name = `${tag}_core`;
    core.position.set(x, 2.49, z);
    g.add(core);
    // polish-341 glass cage: day+night judges' convergent #1 — the core read
    // as a bare glowing slab clamped between plates, not lantern glass in a
    // frame. Four iron corner posts (0.025 sq, half-proud of the glass face
    // at ±0.0875 vs glass ±0.075 — no coplanarity) from the collar-top plane
    // 2.36 up into the eave body to 2.63 (solid seat, ends hidden).
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.27, 0.025), ironTex);
        bar.name = `${tag}_cage`;
        bar.position.set(x + sx * 0.075, 2.495, z + sz * 0.075);
        g.add(bar);
    }
    {
        const eave = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.045, 0.27), ironTex);
        eave.name = `${tag}_eave`;
        eave.position.set(x, 2.645, z);
        g.add(eave);
    }
    {
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.16, 4), ironTex);
        roof.name = `${tag}_roof`;
        roof.position.set(x, 2.7475, z);
        roof.rotation.y = Math.PI / 4;
        g.add(roof);
    }
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), ironTex);
    fin.name = `${tag}_fin`;
    fin.position.set(x, 2.8875, z);
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
