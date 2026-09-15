// mkv3-melencolia.ts — STRUCTURES LANE struct-182, Round 11 commission R11-13
// THE MELENCOLIA STELE: Dürer's 4×4 magic square (Melencolia I, 1514).
//
// ONE IDEA: THE SQUARE THAT ALWAYS ANSWERS 34. Every row, column, diagonal,
// quadrant, the central 2×2, the four corners, all eight center-symmetric
// pairs — 34. A tall ashlar stele carries the sixteen numerals as BONE
// inlay on a brass wire grid; beneath the grid, small brass glyphs read
// "34" — the square's own answer, glowing quietly after dark. Silhouette
// at 18m: a carved tablet rising from a plinth; at reading distance: the
// magic you can check by hand (struct-45 distance-tiering law).
//
// KIN CHECK (elevates, never competes): ledger grep melencolia/dürer/durer/
// "magic square": 0/0/0 — genuinely clean. No standing form carries NUMBERS;
// the lane owns curves, surfaces, fractals, tilings, CA — arithmetic-as-art
// is the unclaimed register. Era-1 heritage lineage: Melencolia I is THE
// iconic mathematical artwork of the Renaissance (Albrecht Dürer, 1514) —
// the bottom-row middle cells read 15|14, his signature year, carried in
// the stone. Nearest kin by feel: rule30wall owns the AUTOMATON wall; this
// owns the CONSTANT — every line the same answer.
//
// WORLD MAP (probe contract — ONE contract, imported): slab 2.80w × 3.02h ×
// 0.42t carrying the 2.20 grid (cell 0.55) with margins 0.30/0.42/0.40;
// chunky plinth 3.20 × 0.95 × 0.85 with the slab seated 0.12 into it.
// Envelope 3.20 × 3.75 × 0.95 (x width, z depth — face +Z), origin-centered,
// min y 0. Folly class, no walk owed (catalan/clebsch/menger/apollonian
// precedent).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) — mel_stone
// cell 32 (sierpinski/menger mottle calibration), bone lane texMat, brass
// wire plain MeshStandard (matches village brass); "34" answer emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage, no light entity); glow census
// exactly 1 KEEP (glow_ms_1); NaN 0; nodes 3 buckets + 1 KEEP = 4.
// Deterministic: canonical square + seeded texMat.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    CELL, GRID, SLAB_W, SLAB_H, SLAB_T, PL_W, PL_D, PL_H, SINK, TOTAL_H,
    MARGIN_TOP, MARGIN_BOT,
    DIG_W, DIG_H, BAR_W, BAR_D, DIG_GAP, C34_H, WIRE_S,
    SQ, SEG, numDigits,
} from "../struct182-probe-melencolia.ts";

// ---- materials ---------------------------------------------------------------------------------------
const stoneTex = texMat("mel_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 9642 });
const boneTex = texMat("mel_bone", [0xd8cfae, 0xcfc4a0, 0xd4caa8], { rough: 0.8, scale: 1, seed: 1514 });
// struct-38 law (struct-46 class): plain non-emissive MeshStandard exports
// material:null in glbwrite (only texMat .map lanes and emissive materials
// get real glTF materials) and renders loader-default near-black in-game.
// The brass grid wires take a texMat brass lane — decode caught null on v1.
// v3 cure (front-judge margin, struct-178 mottle class): tones lightened
// ~15% so the wires read INLAID BRASS, not carved grooves — matching the
// "34" answer's warm read in the same frame.
const brassTex = texMat("mel_brass", [0xbd985c, 0xb18567, 0xc4a768], { rough: 0.45, metal: 0.75, scale: 0.5, seed: 3434 });
const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();

// face frame: grid on the slab's +Z face, occupying x ∈ [−GRID/2, GRID/2],
// y ∈ [GRID_BOTTOM, GRID_TOP]
const FACE_Z = SLAB_T / 2;
const GRID_TOP = PL_H - SINK + SLAB_H - MARGIN_TOP;
const GRID_BOTTOM = GRID_TOP - GRID;
const cellCX = (c: number) => -GRID / 2 + (c + 0.5) * CELL;
const cellCY = (r: number) => GRID_TOP - (r + 0.5) * CELL;

// ---- the stele slab + plinth (stone bucket) ----------------------------------------------------------
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_T), stoneTex);
    slab.position.set(0, PL_H - SINK + SLAB_H / 2, 0);
    g.add(slab);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PL_W, PL_H, PL_D), stoneTex);
    plinth.position.set(0, PL_H / 2, 0);
    g.add(plinth);
    if (GRID_BOTTOM < PL_H - SINK + 0.01) throw Error(`grid bottom ${GRID_BOTTOM} inside plinth overlap`);
    console.log(`stele: slab ${SLAB_W}x${SLAB_H}x${SLAB_T} seated ${SINK}, plinth ${PL_W}x${PL_H}x${PL_D}; grid y[${GRID_BOTTOM.toFixed(2)},${GRID_TOP.toFixed(2)}]`);
}

// ---- the brass wire grid (brass bucket) ----------------------------------------------------------------
{
    let wires = 0;
    for (let i = 0; i <= 4; i++) {
        const x = -GRID / 2 + i * CELL;                       // vertical wire
        const mv = new THREE.Mesh(new THREE.BoxGeometry(WIRE_S, GRID + WIRE_S, WIRE_S), brassTex);
        mv.position.set(x, (GRID_TOP + GRID_BOTTOM) / 2, FACE_Z);
        g.add(mv); wires++;
        const y = GRID_TOP - i * CELL;                        // horizontal wire
        const mh = new THREE.Mesh(new THREE.BoxGeometry(GRID + WIRE_S, WIRE_S, WIRE_S), brassTex);
        mh.position.set(0, y, FACE_Z);
        g.add(mh); wires++;
    }
    if (wires !== 10) throw Error(`wire census ${wires} != 10`);
    console.log(`grid: 10 brass wires (5v + 5h), cell ${CELL}`);
}

// ---- seven-segment glyphs -------------------------------------------------------------------------------
// Digit box DIG_W × DIG_H in the glyph's local frame (y up, x right), bars
// of BAR_W × BAR_D. Horizontals full DIG_W; verticals half-height each.
// Segments: a top, b upper-right, c lower-right, d bottom, e lower-left,
// f upper-left, g middle.
const segGeoms = (d: string): THREE.BufferGeometry[] => {
    const hw = DIG_W / 2, hh = DIG_H / 2, w = BAR_W, t = BAR_D;
    const H = (y: number) => { const geo = new THREE.BoxGeometry(DIG_W, t, t); geo.translate(0, y, 0); return geo; };
    const V = (x: number, upper: boolean) => {
        const geo = new THREE.BoxGeometry(t, (DIG_H - 2 * w) / 2, t);
        geo.translate(x, upper ? (hh - w) / 2 : -(hh - w) / 2, 0);
        return geo;
    };
    const map: Record<string, () => THREE.BufferGeometry> = {
        a: () => H(hh - w / 2), d: () => H(-hh + w / 2), g: () => H(0),
        f: () => V(-hw + w / 2, true), b: () => V(hw - w / 2, true),
        e: () => V(-hw + w / 2, false), c: () => V(hw - w / 2, false),
    };
    return SEG[d].map(s => map[s]());
};

let boneBoxes = 0;
const drawNumber = (n: number, cx: number, cy: number, scale: number, mat: THREE.Material) => {
    const ds = numDigits(n);
    const totalW = ds.length * DIG_W * scale + (ds.length - 1) * DIG_GAP * scale;
    let x0 = cx - totalW / 2 + (DIG_W * scale) / 2;
    for (const d of ds) {
        for (const geo of segGeoms(d)) {
            const mesh = new THREE.Mesh(geo.clone().scale(scale, scale, scale), mat);
            mesh.position.set(x0, cy, FACE_Z + BAR_D / 2 + 0.004);
            g.add(mesh);
            boneBoxes++;
        }
        x0 += (DIG_W + DIG_GAP) * scale;
    }
};

// the sixteen numerals, bone inlay
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) drawNumber(SQ[r][c], cellCX(c), cellCY(r), 1.0, boneTex);

// the "34" answer — emissive brass KEEP (sole night element), centered in
// the bottom margin under the grid
const glowGroup = new THREE.Group();
{
    const scale = C34_H / DIG_H;
    const y34 = GRID_BOTTOM - MARGIN_BOT / 2;
    const totalW = 2 * DIG_W * scale + DIG_GAP * scale;
    let x0 = -totalW / 2 + (DIG_W * scale) / 2;
    for (const d of ["3", "4"]) {
        for (const geo of segGeoms(d)) {
            const mesh = new THREE.Mesh(geo.clone().scale(scale, scale, scale), glowMat);
            mesh.position.set(x0, y34, FACE_Z + BAR_D / 2 + 0.004);
            glowGroup.add(mesh);
        }
        x0 += (DIG_W + DIG_GAP) * scale;
    }
    glowGroup.name = "glow_ms_1";
    g.add(glowGroup);
}
console.log(`glyphs: 16 numerals (${boneBoxes} bone boxes), 34-answer ${glowGroup.children.length} glow meshes at y ${(GRID_BOTTOM - MARGIN_BOT / 2).toFixed(2)}`);

// ---- census + envelope/NaN laws -------------------------------------------------------------------------
{
    const expSegs = (() => { let s = 0; for (let n = 1; n <= 16; n++) for (const d of numDigits(n)) s += SEG[d].length; return s; })();
    if (boneBoxes !== expSegs) throw Error(`bone census ${boneBoxes} != expected ${expSegs}`);
    const glowSegs = SEG["3"].length + SEG["4"].length;
    if (glowGroup.children.length !== glowSegs) throw Error(`glow census ${glowGroup.children.length} != ${glowSegs}`);

    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - PL_W) > 0.02 || Math.abs(sz.y - TOTAL_H) > 0.05 || Math.abs(sz.z - PL_D) > 0.02)
        throw Error(`envelope ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} != ${PL_W}x${TOTAL_H}x${PL_D} (x width, z depth — face +Z)`);
    if (Math.abs(env.min.x + env.max.x) > 0.01 || Math.abs(env.min.z + env.max.z) > 0.01)
        throw Error(`envelope not origin-centered: x[${env.min.x.toFixed(3)},${env.max.x.toFixed(3)}] z[${env.min.z.toFixed(3)},${env.max.z.toFixed(3)}]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], pre-merge meshes ${meshes} + 1 glow KEEP group`);
}

const merged = mergeByMaterial(g, "melencolia");
writeFileSync("agents/arthur/assets/village_melencolia3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_melencolia3.glb`);
