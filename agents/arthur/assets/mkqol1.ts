// mkqol1.ts — QOL PACK: wall sconce, chess set (board + 12 pieces), pantry
// shelf with jars, boot pair by door, broom, laundry line with clothes.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { writeFileSync } from "node:fs";

let seed = 33;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

// ---- wall sconce: bracket + glass + flame ----
const sconce = new THREE.Group();
{
    box(sconce, "sc_back", 0.05, 0.22, 0.05, 0, 1.6, 0, C.DARK);
    box(sconce, "sc_arm", 0.03, 0.03, 0.22, 0, 1.68, 0.1, C.DARK);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 7), mat(0xdcdcba, 0.25, 0.1));
    glass.name = "sc_glass";
    glass.position.set(0, 1.6, 0.2);
    sconce.add(glass);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), mat(0xffa050, 0.3, 0));
    flame.name = "sc_flame";
    flame.scale.y = 1.6;
    flame.position.set(0, 1.59, 0.2);
    sconce.add(flame);
}

// ---- chess set: 4×4 mini board + 6 pieces a side (abstract forms) ----
const chess = new THREE.Group();
{
    // polish-276: the board previously sat at y=0 — a mat on the grass,
    // not furniture. Pedestal post + foot + tabletop raise the board to
    // playing height (~0.75m, bench-table height).
    const BOARD_Y = 0.75;
    box(chess, "ch_foot", 0.34, 0.05, 0.34, 0, 0.025, 0, C.DARK);
    box(chess, "ch_pedestal", 0.09, 0.68, 0.09, 0, 0.4, 0, C.DARK);
    const B = 0.5, S = B / 4;
    for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) {
        const sq = new THREE.Mesh(new THREE.BoxGeometry(S, 0.02, S), mat((x + z) % 2 ? 0x44402e : 0xdcdcba, 0.85, 0));
        sq.name = `ch_sq_${x}${z}`;
        sq.position.set((x - 1.5) * S, BOARD_Y + 0.01, (z - 1.5) * S);
        chess.add(sq);
    }
    box(chess, "ch_frame", B + 0.06, 0.035, B + 0.06, 0, BOARD_Y, 0, C.MID);
    // pieces: pawns (small cones) + kings (tall cylinders) abstract
    const piece = (tag: string, x: number, z: number, kind: string) => {
        let m: THREE.Mesh;
        if (kind === "king") m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.11, 6), mat(0xa0a248, 0.4, 0.7));
        else if (kind === "rook") m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.05), mat(0xa0a248, 0.4, 0.7));
        else m = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.08, 6), mat(0xa0a248, 0.4, 0.7));
        m.name = `ch_${tag}`;
        m.position.set(x, BOARD_Y + 0.05, z);
        chess.add(m);
    };
    piece("pawn_a1", -1.5 * S, -1.5 * S, "pawn");
    piece("pawn_a2", -0.5 * S, -1.5 * S, "pawn");
    piece("rook_a", -1.5 * S, 1.5 * S, "rook");
    piece("king_a", 0.5 * S, 1.5 * S, "king");
    piece("pawn_b1", 1.5 * S, 1.5 * S, "pawn_b");
    piece("king_b", -0.5 * S, -1.5 * S, "king_b");
}

// ---- pantry shelf: 3 shelves + 9 jars (varied) ----
const pantry = new THREE.Group();
{
    const W = 1.2, H = 1.6;
    for (const [i, s] of [[0, 0.4], [1, 0.85], [2, 1.3]].entries() as [number, number][]) {
        void i;
        box(pantry, `pn_shelf_${s}`, W, 0.04, 0.3, 0, s, 0, C.MID);
    }
    for (const sx of [-1, 1]) box(pantry, `pn_side_${sx}`, 0.05, H, 0.32, sx * (W / 2), H / 2, 0, C.DARK);
    for (let i = 0; i < 9; i++) {
        const shelf = [0.4, 0.85, 1.3][i % 3];
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1 + rnd() * 0.06, 7), mat(i % 3 ? 0xbaae62 : 0x787250, 0.7, 0.1));
        jar.name = `pn_jar_${i}`;
        jar.position.set(-W / 2 + 0.15 + (i % 3) * 0.45 + rnd() * 0.1, shelf + 0.07, 0);
        pantry.add(jar);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 7), mat(0xdcdcba, 0.7, 0.2));
        lid.name = `pn_lid_${i}`;
        lid.position.copy(jar.position);
        lid.position.y += 0.07;
        pantry.add(lid);
    }
}

// ---- boots + broom ----
const bootsbroom = new THREE.Group();
{
    for (const s of [-1, 1]) {
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.24), mat(0x44402e, 0.9, 0));
        boot.name = `bt_boot_${s < 0 ? "l" : "r"}`;
        boot.position.set(s * 0.09, 0.07, 0.05);
        bootsbroom.add(boot);
    }
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 6), mat(C.MID, 0.9, 0));
    handle.name = "bt_broom_handle";
    handle.position.set(0.3, 0.65, -0.15);
    handle.rotation.z = 0.22;
    bootsbroom.add(handle);
    const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 7), mat(0xd2da7e, 0.95, 0));
    bristles.name = "bt_broom_bristles";
    bristles.rotation.z = Math.PI - 0.22;
    bristles.position.set(0.16, 0.1, -0.15);
    bootsbroom.add(bristles);
}

// ---- laundry line: 2 posts + line + 4 garments ----
const laundry = new THREE.Group();
{
    for (const s of [-1, 1]) {
        box(laundry, `ld_post_${s < 0 ? "w" : "e"}`, 0.07, 1.7, 0.07, s * 1.5, 0.85, 0, C.DARK);
    }
    const line = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.012, 0.012), mat(0x44402e, 0.9, 0));
    line.name = "ld_line";
    line.position.y = 1.55;
    laundry.add(line);
    const cols = [0xdcdcba, 0xa0a248, 0xbaae62, 0x787250];
    for (let i = 0; i < 4; i++) {
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.02), mat(cols[i], 0.95, 0));
        cloth.name = `ld_garment_${i}`;
        cloth.position.set(-0.9 + i * 0.6, 1.32, 0);
        laundry.add(cloth);
        const peg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.02), mat(C.DARK, 0.9, 0));
        peg.name = `ld_peg_${i}`;
        peg.position.set(-0.9 + i * 0.6, 1.52, 0);
        laundry.add(peg);
    }
}

const OUT: Array<[string, THREE.Group]> = [
    ["village_sconce", sconce],
    ["village_chess", chess],
    ["village_pantry", pantry],
    ["village_bootsbroom", bootsbroom],
    ["village_laundry", laundry],
];
for (const [n, g] of OUT) writeFileSync(`agents/arthur/assets/${n}.glb`, toGLB(g));
console.log(OUT.map(([n, g]) => `${n}(${g.children.length})`).join(", "));
