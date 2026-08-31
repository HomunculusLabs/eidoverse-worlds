// mkvillage-civic.ts — plaza, paths, decor, art for the village.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box, gableRoof, coneRoof } from "./housekit.ts";
import { writeFileSync } from "node:fs";

// ---- WELL: stone ring + posts + tiny gable roof + bucket ----
const well = new THREE.Group();
{
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.75, 14, 1, true), mat(C.STONE, 0.95, 0));
    ring.name = "well_ring";
    ring.position.y = 0.375;
    well.add(ring);
    box(well, "well_base", 2.1, 0.12, 2.1, 0, 0.06, 0, C.DARK);
    // two posts + crossbar + tiny gable
    box(well, "well_post_w", 0.1, 1.7, 0.1, -0.8, 0.85, 0, C.DARK);
    box(well, "well_post_e", 0.1, 1.7, 0.1, 0.8, 0.85, 0, C.DARK);
    box(well, "well_crossbar", 1.8, 0.08, 0.08, 0, 1.72, 0, C.DARK);
    gableRoof(well, "well_roof", 1.6, 1.4, 0.5, 1.78, 0.2);
    // bucket on rope
    box(well, "well_rope", 0.03, 0.5, 0.03, 0, 1.45, 0, C.BONE);
    box(well, "well_bucket", 0.3, 0.28, 0.3, 0, 1.08, 0, C.MID);
}

// ---- MARKET STALL: 4 posts + counter + awning + goods ----
function stall(tag: string) {
    const g = new THREE.Group();
    const W = 2.2, D = 1.5, H = 2.2;
    box(g, `${tag}_counter`, W, 0.85, 0.7, 0, 0.425, D / 2 - 0.5, C.MID);
    for (const [dx, dz, t] of [[-W / 2, -D / 2, "p1"], [W / 2, -D / 2, "p2"], [-W / 2, D / 2, "p3"], [W / 2, D / 2, "p4"]] as const)
        box(g, `${tag}_${t}`, 0.09, H, 0.09, dx, H / 2, dz, C.DARK);
    // awning: tilted slab + stripes (two materials alternate — just two slabs)
    const aw = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.07, D + 0.6), mat(C.BRASS, 0.85, 0));
    aw.name = `${tag}_awning`;
    aw.rotation.x = -0.22;
    aw.position.set(0, H + 0.25, 0.1);
    g.add(aw);
    // goods on counter: crates + jars
    box(g, `${tag}_crate`, 0.5, 0.35, 0.4, -0.6, 1.02, D / 2 - 0.5, C.MID);
    box(g, `${tag}_jar_a`, 0.18, 0.26, 0.18, 0.3, 0.98, D / 2 - 0.45, C.BONE);
    box(g, `${tag}_jar_b`, 0.16, 0.22, 0.16, 0.62, 0.96, D / 2 - 0.5, C.BONE);
    return g;
}

// ---- LAMPPOST: post + arm + hanging lantern ----
function lamppost(tag: string) {
    const g = new THREE.Group();
    box(g, `${tag}_base`, 0.34, 0.22, 0.34, 0, 0.11, 0, C.DARK);
    box(g, `${tag}_post`, 0.09, 2.7, 0.09, 0, 1.35 + 0.22, 0, C.DARK);
    box(g, `${tag}_arm`, 0.5, 0.06, 0.06, 0.22, 2.98, 0, C.DARK);
    box(g, `${tag}_cage`, 0.24, 0.3, 0.24, 0.45, 2.8, 0, C.BONE);
    box(g, `${tag}_cap`, 0.3, 0.07, 0.3, 0.45, 2.98, 0, C.DARK);
    return g;
}

// ---- FIRE BOWL (plaza): wide bowl on triple legs ----
const firebowl = new THREE.Group();
{
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.8, 0.5, 12), mat(C.STONE, 0.95, 0));
    bowl.name = "fb_bowl";
    bowl.position.y = 0.85;
    firebowl.add(bowl);
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        box(firebowl, `fb_leg_${i}`, 0.12, 0.6, 0.12, Math.cos(a) * 0.55, 0.3, Math.sin(a) * 0.55, C.DARK);
    }
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), mat(0xffa050, 0.5, 0));
    ember.name = "fb_ember";
    ember.position.y = 1.0;
    ember.scale.y = 0.4;
    firebowl.add(ember);
}

// ---- MÖBIUS ARCH: parametric band spanning the plaza south entry ----
function mobiusArch() {
    const g = new THREE.Group();
    // strip the band into segments
    const SEG = 96, W = 4.2, H = 3.4, TW = 0.35;
    for (let i = 0; i < SEG; i++) {
        const t0 = (i / SEG) * Math.PI * 2, t1 = ((i + 1) / SEG) * Math.PI * 2;
        const P = (t: number) => {
            const th = t / 2; // half twist over the loop
            const x = Math.sin(t) * (W / 2) * 1.15;
            const y = H / 2 + Math.cos(t) * (H / 4) - H / 4 + 0.25; // arc-ish rise
            const z = Math.sin(t) * 0.0;
            // band width direction rotates with th
            const wx = Math.cos(th) * Math.cos(t) * TW / 2;
            const wy = Math.cos(th) * (-Math.sin(t)) * TW / 2;
            const wz = Math.sin(th) * TW / 2;
            return [x + wx, y + wy, z + wz];
        };
        const a = P(t0), b = P(t1);
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, TW * 0.92, TW * 0.92), mat(C.BRASS, 0.4, 0.8));
        seg.name = `mobius_seg_${i}`;
        seg.position.set(mid[0], mid[1], mid[2]);
        seg.lookAt(b[0], b[1], b[2]);
        g.add(seg);
    }
    return g;
}

// ---- MURAL STONES: two standing slabs with carved relief (inset boxes) ----
function muralStone(tag: string, pattern: number) {
    const g = new THREE.Group();
    box(g, `${tag}_slab`, 1.5, 2.4, 0.28, 0, 1.2, 0, C.STONE);
    box(g, `${tag}_base`, 1.8, 0.3, 0.6, 0, 0.15, 0, C.DARK);
    if (pattern === 0) {
        // spiral
        for (let i = 0; i < 14; i++) {
            const a = i * 0.55, r = 0.08 + i * 0.045;
            box(g, `${tag}_carve_${i}`, 0.09, 0.09, 0.05, Math.cos(a) * r, 1.35 + Math.sin(a) * r, 0.15, C.DARK);
        }
    } else {
        // waves
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 8; j++)
                box(g, `${tag}_carve_${i}_${j}`, 0.1, 0.07, 0.05, -0.55 + j * 0.16, 0.75 + i * 0.42 + Math.sin(j * 0.8) * 0.06, 0.15, C.DARK);
    }
    return g;
}

// ---- STEPPING STONES: one GLB = one path segment (5 stones) ----
function stones(tag: string, seed: number) {
    const g = new THREE.Group();
    let s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 5; i++) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.32 + rnd() * 0.14, 0.36 + rnd() * 0.14, 0.09, 7), mat(C.MID, 0.98, 0));
        m.name = `${tag}_s${i}`;
        m.position.set((rnd() - 0.5) * 0.5, 0.045, i * 0.95 - 1.9);
        m.rotation.y = rnd() * Math.PI;
        g.add(m);
    }
    return g;
}

// ---- PLANTER + BARREL + BANNER POLE ----
function planter(tag: string) {
    const g = new THREE.Group();
    box(g, `${tag}_box`, 0.9, 0.45, 0.45, 0, 0.225, 0, C.MID);
    box(g, `${tag}_soil`, 0.8, 0.08, 0.38, 0, 0.49, 0, C.DARK);
    box(g, `${tag}_bush`, 0.5, 0.4, 0.34, 0, 0.72, 0, 0x446632);
    return g;
}
function barrel(tag: string) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.85, 10), mat(C.MID, 0.9, 0));
    b.name = `${tag}_body`;
    b.position.y = 0.425;
    g.add(b);
    box(g, `${tag}_hoop_a`, 0.72, 0.05, 0.72, 0, 0.22, 0, C.DARK);
    box(g, `${tag}_hoop_b`, 0.72, 0.05, 0.72, 0, 0.63, 0, C.DARK);
    return g;
}
function bannerPole(tag: string) {
    const g = new THREE.Group();
    box(g, `${tag}_pole`, 0.08, 3.4, 0.08, 0, 1.7, 0, C.DARK);
    // polish-273: the rigid brass slab read as a sign board, not cloth.
    // Pennant: swallowtail notch cut into the outer edge (two triangles
    // forming the V), dropped slightly from the pole head; bottom hem bar
    // gives the cloth weight. Crown: bone cube → brass collar + gold spire
    // (the accepted crown language; polish-272's law — base crowns ABOVE
    // overhanging geometry: the pennant top is 3.22, collar clears it).
    const clothShape = new THREE.Shape();
    clothShape.moveTo(0, 0.65);
    clothShape.lineTo(0.7, 0.65);
    clothShape.lineTo(0.7, 0.44);   // outer edge down to the notch
    clothShape.lineTo(0.42, 0.22);  // swallowtail V bottom
    clothShape.lineTo(0.7, 0.0);    // back up to the outer corner
    clothShape.lineTo(0, 0);
    clothShape.closePath();
    const cloth = new THREE.Mesh(new THREE.ShapeGeometry(clothShape), mat(C.BRASS, 0.8, 0));
    cloth.name = `${tag}_cloth`;
    cloth.position.set(0.04, 2.02, 0);
    cloth.material.side = THREE.DoubleSide;
    g.add(cloth);
    box(g, `${tag}_hem`, 0.04, 0.66, 0.05, 0.055, 2.35, 0, C.DARK);
    box(g, `${tag}_collar`, 0.16, 0.08, 0.16, 0, 3.44, 0, C.BRASS);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), mat(0xdada70, 0.35, 0.6));
    spire.name = `${tag}_spire`;
    spire.position.set(0, 3.63, 0);
    g.add(spire);
    return g;
}

// write all
const OUT: Array<[string, THREE.Group]> = [
    ["village_well", well],
    ["village_stall_a", stall("stallA")],
    ["village_stall_b", stall("stallB")],
    ["village_lamppost", lamppost("lamp")],
    ["village_firebowl", firebowl],
    ["village_mobius_arch", mobiusArch()],
    ["village_mural_a", muralStone("muralA", 0)],
    ["village_mural_b", muralStone("muralB", 1)],
    ["village_stones_a", stones("stonesA", 7)],
    ["village_stones_b", stones("stonesB", 13)],
    ["village_stones_c", stones("stonesC", 29)],
    ["village_planter", planter("planter")],
    ["village_barrel", barrel("barrel")],
    ["village_banner", bannerPole("banner")],
];
for (const [name, g] of OUT) {
    writeFileSync(`agents/arthur/assets/${name}.glb`, toGLB(g));
}
console.log(OUT.map(([n, g]) => `${n}(${g.children.length})`).join("\n"));
