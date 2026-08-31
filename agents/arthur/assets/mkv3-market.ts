// mkv3-market.ts — THE MARKET CORNER (era-2 heritage): two trestle stalls at
// the NW plaza diagonal facing the hearth — a bread/fruit stall and a cloth
// stall. Counters on trestle legs, pole awnings w/ sagging cloth, baskets
// of goods, jugs, bolt of cloth. Small furniture scale (no room collider).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-8 TEXTILES II: the market's cloth joins the dye-trade weave family —
// awnings + weaver's bolts carry stripe weaves anchored on their old flat
// colors (rust 0x8a7448 / slate 0x5e6c7a, the alternating stall pair).
const weaveRust = texMat("weave-rust", [0x8a7448, 0x806c42], { rough: 0.9, scale: 3, stripe: 24, weights: [2, 1] });
const weaveSlate = texMat("weave-slate", [0x5e6c7a, 0x566472], { rough: 0.9, scale: 3, stripe: 24, weights: [2, 1] });
const awnMats = [weaveSlate, weaveRust];
// tex-57: the market's woodwork joins the village timber — counter
// tops, splayed trestle legs, awning poles, and the baker's baskets
// take the family tile (sawn/woven wood; the baskets read as wicker at
// distance but share the builder's wood tones). Loaves stay bone
// (bread is bread), jugs stay clay (goods, not construction).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// two stalls side by side (local frame: fronts face +z)
for (const [si, sx] of [[0, -1.0], [1, 1.0]] as const) {
    // trestle counter: plank top + 4 splayed legs
    texBox(`counter_${si}`, 1.7, 0.07, 0.75, sx, 0.82, 0, timberTex);
    for (const [li, lx, lz] of [[0, -0.72, -0.26], [1, 0.72, -0.26], [2, -0.72, 0.26], [3, 0.72, 0.26]] as const) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), timberTex);
        leg.name = `leg_${si}_${li}`;
        leg.position.set(sx + lx * 0.92, 0.4, lz);
        leg.rotation.z = lx > 0 ? 0.09 : -0.09;
        g.add(leg);
    }
    // awning: 2 poles + sagging cloth slab (slight pitch)
    texBox(`poleA_${si}`, 0.06, 2.1, 0.06, sx - 0.8, 1.05, -0.2, timberTex);
    texBox(`poleB_${si}`, 0.06, 2.1, 0.06, sx + 0.8, 1.05, -0.2, timberTex);
    // Wakeup-22: the awning cloth wraps in an mk_awn_${si} anchor group (KEEP
    // mk_awn) so wind comps have real targets — market cloth sways with the
    // same breeze that moves the laundry.
    const awnGrp = new THREE.Group();
    awnGrp.name = `mk_awn_${si}`;
    const awn = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 1.05), awnMats[si % 2]);
    awn.name = `awning_${si}`;
    awn.rotation.x = 0.14;
    awn.position.set(sx, 2.06, 0.02);
    awnGrp.add(awn);
    // polish-267: the bare 3.5cm slab read as a floating tabletop, not cloth.
    // A fascia strip on the front edge gives the canopy a visible hem thickness
    // at gameplay distance (the market-stall silhouette law: awnings read by
    // their edges). Rides the same mk_awn anchor, so the wind comp keeps its
    // target; no new named nodes (merges into the awning bucket).
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.11, 0.035), awnMats[si % 2]);
    fascia.name = `awning_fascia_${si}`;
    fascia.position.set(sx, 2.0, 0.545);
    fascia.rotation.x = 0.14;
    awnGrp.add(fascia);
    g.add(awnGrp);
}

// STALL 0 — the baker's: 3 baskets (loaves = small bone lumps)
for (const [bi, bx] of [[0, -1.45], [1, -1.0], [2, -0.55]] as const) {
    const bsk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.13, 7), timberTex);
    bsk.name = `basket_${bi}`;
    bsk.position.set(bx, 0.92, 0.1);
    g.add(bsk);
    for (let lo = 0; lo < 3; lo++) {
        const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 4), mat(C.BONE, 0.8, 0));
        loaf.name = `loaf_${bi}_${lo}`;
        loaf.scale.set(1.3, 0.8, 0.8);
        loaf.position.set(bx - 0.06 + lo * 0.06, 1.0, 0.1 + (lo % 2) * 0.05 - 0.02);
        g.add(loaf);
    }
}
// STALL 1 — the weaver's: cloth bolts + jugs
for (const [ci, cx] of [[0, 0.55], [1, 1.0]] as const) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.85, 6), awnMats[ci % 2]);
    bolt.name = `bolt_${ci}`;
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(cx, 0.93, -0.1);
    g.add(bolt);
}
for (const [ji, jx] of [[0, 1.55], [1, 1.32]] as const) {
    const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.24, 6), mat(0x9a9a58, 0.7, 0));
    jug.name = `jug_${ji}`;
    jug.position.set(jx, 0.97, 0.18);
    g.add(jug);
}

// interior-4: merchant-side storage and transaction tools stay behind the
// counters; the complete +Z visitor lane remains untouched.
for (const [si, sx] of [[0, -1.0], [1, 1.0]] as const) {
    texBox(`shelf_${si}`, 1.5, 0.06, 0.16, sx, 1.38, -0.38, timberTex);
    texBox(`shelfpost_l_${si}`, 0.05, 0.58, 0.08, sx - 0.68, 1.1, -0.38, timberTex);
    texBox(`shelfpost_r_${si}`, 0.05, 0.58, 0.08, sx + 0.68, 1.1, -0.38, timberTex);
}
// Baker's balance scale: central post, beam, and two shallow brass pans.
box(g, "scale_post", 0.05, 0.42, 0.05, -1.0, 1.08, -0.18, C.DARK);
box(g, "scale_beam", 0.7, 0.04, 0.04, -1.0, 1.28, -0.18, C.BRASS);
for (const [pi, px] of [[0, -1.29], [1, -0.71]] as const) {
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.035, 10), mat(C.BRASS, 0.45, 0.45));
    pan.name = `scale_pan_${pi}`;
    pan.position.set(px, 1.12, -0.18);
    g.add(pan);
    box(g, `scale_chain_${pi}`, 0.018, 0.14, 0.018, px, 1.21, -0.18, C.DARK);
}
// Weaver's coin box: compact, lidded, and wholly behind the counter line.
texBox("coinbox", 0.34, 0.22, 0.26, 1.52, 0.97, -0.2, timberTex);
box(g, "coinbox_slot", 0.18, 0.018, 0.025, 1.52, 1.09, -0.2, C.DARK);

// interior-14 (P2-5): EVENING SHUTTERS with brass tally inlay — the stalls
// close for the night. A timber shutter panel leans against each stall's
// back shelf posts (merchant side), reading as a closeable front; two
// five-bar brass tally groups are inlaid in the shutter face — the day's
// sales, counted. Everything stays behind the counter line inside the
// inherited AABB (z ≤ -0.38, tops ≤ 1.62 under the awnings); the complete
// +Z visitor lane remains untouched.
for (const [si, sx] of [[0, -1.0], [1, 1.0]] as const) {
    texBox(`shutter_${si}`, 1.5, 0.72, 0.045, sx, 1.2, -0.47, timberTex);
    // hinge dots where the shutter meets the shelf posts
    box(g, `shutter_hinge_${si}_l`, 0.05, 0.05, 0.02, sx - 0.68, 1.42, -0.44, C.BRASS);
    box(g, `shutter_hinge_${si}_r`, 0.05, 0.05, 0.02, sx + 0.68, 1.42, -0.44, C.BRASS);
    // two five-bar tally groups inlaid flush in the shutter face (brass)
    for (const [ti, tx] of [[0, sx - 0.35], [1, sx + 0.3]] as const) {
        for (let k = 0; k < 4; k++)
            box(g, `tally_${si}_${ti}_${k}`, 0.022, 0.14, 0.012, tx + k * 0.05, 1.24, -0.444, C.BRASS);
        box(g, `tally_${si}_${ti}_slash`, 0.2, 0.022, 0.012, tx + 0.075, 1.24, -0.444, C.BRASS);
    }
}

mergeByMaterial(g, "mk3");
writeFileSync("agents/arthur/assets/village_market3.glb", toGLB(g));
console.log("village_market3.glb —", g.children.length, "nodes");
