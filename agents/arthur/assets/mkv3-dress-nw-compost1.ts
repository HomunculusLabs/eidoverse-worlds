// mkv3-dress-nw-compost1.ts — dress-80, NW CULTIVATION compost (round-3 item 2).
// Concept contract: three-bin compost frame in the headland strip at the EAST
// end of garden-0019's plaza-facing (+z) edge, (-72.67, 57.57) yaw 2.3562 —
// the working corner at the head of the garden rows, 7.5m off the NW corridor
// (readable at closest approach), 3.0m clear of the plot edge. Grounds USE:
// kitchen gardens run a fill/cook/finish cycle — the three bays ARE the cycle
// (fresh green mound -> settled dark bay -> heaped finished soil with a filled
// bucket), the leaning slat + fork say IN USE, not abandoned. Idiom: village
// timber (orchardrows 0x9c8a6a) posts with pale sawn tops (district tell
// 0xf2eed0 — stile caps, espalier post caps), air-gapped front slats (the
// compost read: slatted not paneled), STRAW 0xc9a35c clumps (skeps value —
// same village), plot greens for fresh waste, dark loam for finished. Static,
// unlit — spends no lamp budget. Site: see DRESSING-PLAN dress-80.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

// material families (NW dressing precedent values)
const TIMBER = mat(0x9c8a6a, 0.9, 0);      // posts (orchardrows timber)
const TIMBER_DK = mat(0x94866c, 0.9, 0);   // slats (v6: post-adjacent value — frame separates from dark fills)
const CUT = mat(0xf2eed0, 0.95, 0);        // pale sawn post-tops (district tell)
const SOIL = mat(0x55483a, 0.98, 0);       // worked-earth pad (softened v5)
const LOAM = mat(0x3d3226, 0.98, 0);       // cooking fill (mid dark)
const LOAM_DK = mat(0x241c13, 0.98, 0);    // finished rich compost (darkest)
const GREEN = mat(0x8a9a4e, 0.95, 0);      // fresh waste (v6: yellowed clippings — NOT leaf-canopy value)
const GREEN_DK = mat(0x748544, 0.95, 0);   // fresh waste shadow value (v6 shifted)
const STRAW = mat(0xc9a35c, 0.9, 0);       // straw clumps (skeps value)
const IRON = mat(0x4a4a50, 0.5, 0.15);     // fork head + bucket bands

// deterministic jitter (splitmix-style trig hash, no Math.random)
const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// ---- footprint: three bays along local x, total x -1.65..1.65, z -0.48..0.48
// front face = local +z (toward plaza/corridor). Bay layout west->east:
//   bay 1 (x -1.5..-0.5): FILLING — fresh green+straw mound above slats
//   bay 2 (x -0.45..0.45): COOKING — settled dark, level below slat tops
//   bay 3 (x 0.5..1.5): FINISHED — dark loam heap + spill + bucket row
const POST_H = 0.95, POST_R = 0.058;
const FRONT_Z = 0.46, BACK_Z = -0.46;
const postXs = [-1.58, -0.5, 0.48, 1.56]; // 4 frames -> 3 bays (2 dividing)

for (const px of postXs) {
    for (const pz of [FRONT_Z, BACK_Z]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(POST_R, POST_R * 1.12, POST_H, 8), TIMBER);
        post.position.set(px + jit(px * 7 + pz) * 0.012, POST_H / 2, pz + jit(px * 3 + pz * 2) * 0.012);
        post.rotation.z = jit(px + pz * 5) * 0.006;
        g.add(post);
        // pale sawn top — the district worked-wood tell
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(POST_R * 1.15, POST_R * 1.05, 0.05, 8), CUT);
        cap.position.set(post.position.x, POST_H + 0.025, post.position.z);
        g.add(cap);
    }
}

// ---- air-gapped horizontal slats, front + back, two rails high
// gaps 0.035: at 18m the slat/gap rhythm reads as value banding = "slatted"
const SLAT_H = 0.13;
const bays: [number, number][] = [[-1.54, -0.54], [-0.44, 0.42], [0.52, 1.52]];
for (const [bx0, bx1] of bays) {
    const len = bx1 - bx0 - 0.08;
    for (const pz of [FRONT_Z, BACK_Z]) {
        for (let r = 0; r < 2; r++) {
            const y = 0.30 + r * 0.30;
            // slat run split into planks with air gaps
            const nPl = 3;
            const pl = (len - (nPl - 1) * 0.035) / nPl;
            for (let p = 0; p < nPl; p++) {
                const x = bx0 + 0.04 + pl / 2 + p * (pl + 0.035);
                const slat = new THREE.Mesh(new THREE.BoxGeometry(pl, SLAT_H, 0.03), TIMBER_DK);
                slat.position.set(x, y, pz);
                slat.rotation.y = jit(x * 5 + r * 7) * 0.004;
                g.add(slat);
            }
        }
    }
    // low sill plank front only (retains the heap)
    const sill = new THREE.Mesh(new THREE.BoxGeometry(len, 0.10, 0.03), TIMBER_DK);
    sill.position.set((bx0 + bx1) / 2, 0.07, FRONT_Z);
    g.add(sill);
}

// ---- bay fills
// bay 1 FILLING: layered strata — dark base, straw middle, green top
// (compost's layer icon; bands read at 18m where lumps cannot)
{
    const b1x = -1.02, b1w = 0.95;
    const strata: [number, number, number, THREE.Material][] = [
        [0.16, 0.30, 0.80, LOAM],       // dark settled base
        [0.44, 0.16, 0.82, STRAW],      // brown layer
        [0.62, 0.22, 0.78, GREEN],      // fresh green cap
        [0.78, 0.10, 0.74, GREEN_DK],   // green shadow band
    ];
    for (const [sy, sh, sd, m] of strata) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(b1w, sh, sd), m);
        band.position.set(b1x, sy + sh / 2 - 0.1, -0.05);
        g.add(band);
    }
    // irregular top edge: two green lumps breaking the flat cap (modest)
    const lumpA = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), GREEN);
    lumpA.scale.set(1.5, 0.5, 0.8);
    lumpA.position.set(-1.25, 0.80, -0.05);
    lumpA.rotation.set(0.3, 1.1, 0.2);
    g.add(lumpA);
    const lumpB = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), GREEN_DK);
    lumpB.scale.set(1.4, 0.45, 0.75);
    lumpB.position.set(-0.80, 0.78, -0.08);
    lumpB.rotation.set(0.2, 2.3, 0.15);
    g.add(lumpB);
    // straw wisp on top (one, hugging)
    const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.02), STRAW);
    wisp.position.set(-1.02, 0.84, 0.0);
    wisp.rotation.set(0.1, 0.8, 0.2);
    g.add(wisp);
    // toss debris at the bay mouth (two clumps, hugging the sill)
    for (let i = 0; i < 2; i++) {
        const clump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055, 0), i % 2 ? GREEN_DK : GREEN);
        clump.position.set(-1.28 + i * 0.30, 0.03, 0.52);
        clump.rotation.set(jit(243 + i) * 2, jit(245 + i) * 3, jit(247 + i) * 2);
        g.add(clump);
    }
}
// bay 2 COOKING: strata mid-cook — straw-dominant turning zone
{
    const strata: [number, number, number, THREE.Material][] = [
        [0.14, 0.26, 0.80, LOAM_DK],    // dark bottom (oldest)
        [0.38, 0.20, 0.82, LOAM],       // mid dark
        [0.58, 0.20, 0.80, STRAW],      // turned straw cap (bright warm band)
    ];
    for (const [sy, sh, sd, m] of strata) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.88, sh, sd), m);
        band.position.set(-0.01, sy + sh / 2 - 0.1, -0.04);
        g.add(band);
    }
    // two green flecks half-turned into the straw cap
    for (const gx of [-0.18, 0.26]) {
        const cl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), GREEN);
        cl.position.set(gx, 0.56, -0.06);
        cl.rotation.set(1.1, 2.3, 0.4);
        g.add(cl);
    }
}
// bay 3 FINISHED: darkest strata + taller staggered fill + spill + buckets
{
    const strata: [number, number, number, THREE.Material][] = [
        [0.16, 0.34, 0.80, LOAM_DK],
        [0.50, 0.24, 0.82, LOAM_DK],
        [0.74, 0.12, 0.78, LOAM],       // crumbly top slightly lighter
    ];
    for (const [sy, sh, sd, m] of strata) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.95, sh, sd), m);
        band.position.set(1.02, sy + sh / 2 - 0.1, -0.06);
        g.add(band);
    }
    const spill = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), LOAM_DK);
    spill.scale.set(1.5, 0.24, 1.1);
    spill.position.set(1.30, 0.06, 0.52);
    g.add(spill);
    for (const [bx, bz, bs] of [[1.66, 0.30, 1.15], [1.88, 0.06, 1.0]] as [number, number, number][]) {
        const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * bs, 0.105 * bs, 0.26 * bs, 10), TIMBER_DK);
        bucket.position.set(bx, 0.13 * bs, bz);
        bucket.rotation.z = jit(bx * 31) * 0.05;
        g.add(bucket);
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.128 * bs, 0.008, 6, 12), IRON);
        band.rotation.x = Math.PI / 2;
        band.position.set(bx, 0.20 * bs, bz);
        g.add(band);
        if (bs > 1.05) {
            const fillb = new THREE.Mesh(new THREE.CylinderGeometry(0.115 * bs, 0.115 * bs, 0.03, 10), LOAM_DK);
            fillb.position.set(bx, 0.245 * bs, bz);
            g.add(fillb);
        }
    }
}
// ---- ground: compacted working pad, slightly larger than the frame
{
    const pad = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.016, 1.30), SOIL);
    pad.position.set(0.0, 0.008, 0.02);
    g.add(pad);
}

mergeByMaterial(g, "dress_nw_compost1");
writeFileSync("agents/arthur/assets/village_dress_nw_compost1.glb", toGLB(g));
console.log("village_dress_nw_compost1.glb —", g.children.length, "top-level nodes");
