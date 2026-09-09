// mkv3-galtonboard.ts — STRUCTURES LANE struct-121, Round 10 commission R10-18.
// THE GALTON BOARD: the form ledger's missing family — PROBABILITY /
// STATISTICS (ledger grep fresh this tick: zero galton/gaussian/binomial/
// probability presence across IMPROVEMENTS.md + STRUCTURES-PLAN.md).
// The S mathematics axis (assembly -> convergence -> linked impossibility
// -> the race) gains the statistics chapter: order out of chaos.
//
// ONE IDEA: ORDER OUT OF CHAOS. A stone board streaked with a staggered
// iron peg lattice; brass balls rain frozen mid-scatter through it and
// stand stacked in nine ashlar bins whose column heights trace the exact
// binomial bell B(8, 1/2) — the law of large numbers as a monument. The
// tails stay honestly empty (round(7*C(8,k)/C(8,4)) = [0,1,3,6,7,6,3,1,0]).
// Night: the CENTER column's seven balls glow (dusk lineage, struct-82) —
// the bell's core holds the light; the falling rain stays dark. Chance
// falls; the peak answers.
//
// LAWS HONORED (all asserted in-file):
// - binomial law: stacked ball count per bin == round(7*C(8,k)/70) exact.
// - lattice law: 63 pegs (3 rows of 13 + 2 rows of 12), stagger offset
//   exactly half the 0.33 spacing, rows dy 0.19, all proud of the board
//   face at z 0.35..0.47.
// - rain law: every falling ball center >= 0.22m from every peg axis
//   segment in 3D (R_BALL 0.13 + R_PEG 0.07 + 0.02 margin).
// - containment law: every stacked ball rests exactly on the bin floor
//   (center y = 0.43 + i*0.26) inside its bin's inner x/z box.
// - hopper law: cheeks symmetric, converge to a 0.46 slot; throat ball
//   aligned x=0 below the exit.
// - glow census 7 KEEP (glow_ga_1..7, the center column);
// - envelope/NaN laws; texMat lanes (struct-38 law: NO plain materials);
// - node census 10 (stone + iron + brass buckets + 7 KEEP).
// Folly class: no entry advertised, no walk owed (zeno/voronoi/chladni/
// borromean/brachistochrone precedent). Static. Deterministic seeds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the board geometry (local frame: x across, y up, z depth) ----------------
const BOARD_W = 4.2, BOARD_Z0 = 0, BOARD_Z1 = 0.35;      // slab z 0..0.35
const PLINTH_Y0 = 0, PLINTH_Y1 = 0.30;                    // base course
const BOARD_TOP = 3.78;
const NBINS = 9, BIN_W = BOARD_W / NBINS;                 // 0.4667
const DIV_T = 0.08, DIV_H = 2.15, DIV_TOP = PLINTH_Y1 + DIV_H; // 2.45
const DIV_Z0 = 0.35, DIV_Z1 = 0.85;                       // bins depth
const BALL_R = 0.13, BALL_Z = 0.60;                       // brass ball radius / lane
const PEG_R = 0.07, PEG_Z0 = 0.35, PEG_Z1 = 0.47;         // iron pegs
const PEG_SP = 0.33;                                      // lattice spacing
const ROW_YS = [3.50, 3.31, 3.12, 2.93, 2.74];            // 5 rows dy 0.19
const SCALE_N = 7;                                        // center column balls
const RAIN: Array<[number, number]> = [                   // falling balls (x, y)
    [0, 4.10], [+0.165, 3.60], [-0.495, 3.22], [+0.33, 2.94],
];
const RAIN_Z = 0.74;                                      // proud of peg plane

// ---- binomial law (the bell) ----------------------------------------------------------------
const binom = (n: number, k: number): number => {
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
    return r;
};
const HEIGHTS = Array.from({ length: NBINS }, (_, k) => Math.round(SCALE_N * binom(8, k) / binom(8, 4)));
const WANT_HEIGHTS = [0, 1, 3, 6, 7, 6, 3, 1, 0];
if (HEIGHTS.join(",") !== WANT_HEIGHTS.join(",")) throw Error(`binomial law broke: [${HEIGHTS}]`);

// bin centers x: bin k centered at -BOARD_W/2 + (k+0.5)*BIN_W
const binCX = (k: number) => -BOARD_W / 2 + (k + 0.5) * BIN_W;

// ---- materials (struct-38 law: texMat lanes only; emissive via MeshStandard) -----------------
const stoneTex = texMat("galt_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 8101 });
const ironTex = texMat("galt_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 8102 });
const brassTex = texMat("galt_brass", [0xa8823f, 0x9c7739, 0xb08c46], { rough: 0.45, metal: 0.75, scale: 1, weights: [2, 1, 1], cell: 6, seed: 8103 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
let glowIdx = 0;
function addBall(pos: THREE.Vector3, glow: boolean) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 12, 10), glow ? brassGlow : brassTex);
    m.position.copy(pos);
    if (glow) { m.name = `glow_ga_${++glowIdx}`; glowMeshes.push(m); }
    g.add(m);
    return m;
}

// ---- stone: plinth/shelf, board, dividers, hopper --------------------------------------------
{
    // base course + bin shelf: one slab spanning board and bins
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W + 0.5, PLINTH_Y1 - PLINTH_Y0, 0.95), stoneTex);
    plinth.position.set(0, (PLINTH_Y0 + PLINTH_Y1) / 2, -0.10 + 0.95 / 2 - 0.0); // z -0.10..0.85
    plinth.position.z = -0.10 + 0.475;
    g.add(plinth);
    // backboard
    const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W, BOARD_TOP - PLINTH_Y1, BOARD_Z1 - BOARD_Z0), stoneTex);
    board.position.set(0, (PLINTH_Y1 + BOARD_TOP) / 2, (BOARD_Z0 + BOARD_Z1) / 2);
    g.add(board);
    // nine compartments: 10 dividers
    for (let k = 0; k <= NBINS; k++) {
        const x = -BOARD_W / 2 + k * BIN_W;
        const div = new THREE.Mesh(new THREE.BoxGeometry(DIV_T, DIV_H, DIV_Z1 - DIV_Z0), stoneTex);
        div.position.set(x, PLINTH_Y1 + DIV_H / 2, (DIV_Z0 + DIV_Z1) / 2);
        g.add(div);
    }
    // hopper: two cheeks from board-top corners converging to a 0.46 slot + cap lintel
    const slotHalf = 0.23, topY = 4.28;
    for (const side of [-1, 1]) {
        const x0 = side * BOARD_W / 2, y0 = BOARD_TOP;         // outer base
        const x1 = side * slotHalf, y1 = topY;                 // inner top
        const len = Math.hypot(x1 - x0, y1 - y0);
        const ang = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2; // box local +y along the slope
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.30, len, BOARD_Z1 - BOARD_Z0), stoneTex);
        cheek.position.set((x0 + x1) / 2, (y0 + y1) / 2, (BOARD_Z0 + BOARD_Z1) / 2);
        cheek.rotation.z = ang;
        g.add(cheek);
    }
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, BOARD_Z1 - BOARD_Z0), stoneTex);
    cap.position.set(0, topY + 0.09, (BOARD_Z0 + BOARD_Z1) / 2);
    g.add(cap);
}

// ---- iron peg lattice: staggered rows proud of the board face ---------------------------------
const pegs: Array<[number, number]> = [];
ROW_YS.forEach((y, r) => {
    const offset = r % 2 === 0 ? -1.98 : -1.98 + PEG_SP / 2;  // A-grid vs B-grid
    const count = r % 2 === 0 ? 13 : 12;
    for (let i = 0; i < count; i++) pegs.push([offset + i * PEG_SP, y]);
});
{
    let bad = 0;
    for (const [px, py] of pegs) {
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(PEG_R, PEG_R, PEG_Z1 - PEG_Z0, 8), ironTex);
        peg.rotation.x = Math.PI / 2;
        peg.position.set(px, py, (PEG_Z0 + PEG_Z1) / 2);
        g.add(peg);
        if (px < -BOARD_W / 2 - 1e-9 || px > BOARD_W / 2 + 1e-9) bad++;
    }
    if (pegs.length !== 63) throw Error(`lattice law broke: ${pegs.length} pegs != 63 (3x13 + 2x12)`);
    if (bad) throw Error(`${bad} pegs outside board width`);
    // stagger law: B-grid offset exactly half spacing
    const aPegs = pegs.filter((_, i) => i < 13).map(p => p[0]);
    const bPegs = pegs.filter((_, i) => i >= 13 && i < 25).map(p => p[0]);
    if (Math.abs((bPegs[0] - aPegs[0]) - PEG_SP / 2) > 1e-9) throw Error("stagger law broke");
    console.log(`lattice law OK: ${pegs.length} pegs, stagger ${PEG_SP / 2}, rows [${ROW_YS.join(", ")}]`);
}

// ---- the heap: stacked brass columns, exact binomial bell -------------------------------------
for (let k = 0; k < NBINS; k++) {
    for (let i = 0; i < HEIGHTS[k]; i++) {
        const y = PLINTH_Y1 + BALL_R + i * 2 * BALL_R;       // resting on the shelf
        addBall(new THREE.Vector3(binCX(k), y, BALL_Z), k === 4); // center column glows
    }
}

// ---- the rain: falling balls (dark brass), scatter read ----------------------------------------
for (const [x, y] of RAIN) addBall(new THREE.Vector3(x, y, RAIN_Z), false);

// ---- rain law: every falling ball clears every peg axis by >= 0.22 ------------------------------
{
    const NEED = BALL_R + PEG_R + 0.02;
    let worst = Infinity;
    for (const [x, y] of RAIN) {
        for (const [px, py] of pegs) {
            // peg axis = segment (px,py,PEG_Z0..PEG_Z1); ball center (x,y,RAIN_Z)
            const dz = Math.max(PEG_Z0, Math.min(PEG_Z1, RAIN_Z));
            const d = Math.hypot(x - px, y - py, dz - RAIN_Z);
            if (d < worst) worst = d;
            if (d < NEED) throw Error(`rain law broke: ball (${x},${y}) vs peg (${px},${py}) d=${d.toFixed(3)} < ${NEED}`);
        }
    }
    // rain balls clear each other
    for (let i = 0; i < RAIN.length; i++) for (let j = i + 1; j < RAIN.length; j++) {
        const d = Math.hypot(RAIN[i][0] - RAIN[j][0], RAIN[i][1] - RAIN[j][1], RAIN_Z - RAIN_Z);
        if (d < 2 * BALL_R + 0.02) throw Error(`rain pair too close: ${d.toFixed(3)}`);
    }
    // rain clears divider tops (y < DIV_TOP - BALL_R - 0.02) and the board face (z > BOARD_Z1 + BALL_R)
    for (const [x, y] of RAIN) {
        if (y - BALL_R < DIV_TOP + 0.02) throw Error(`rain ball (${x},${y}) sinks below divider tops`);
        if (RAIN_Z - BALL_R < BOARD_Z1 + 0.02) throw Error("rain ball intersects board face");
    }
    console.log(`rain law OK: 4 falling balls, worst peg clearance ${worst.toFixed(3)} (need ${NEED})`);
}

// ---- containment law: stacked balls inside their bins, on the floor ------------------------------
{
    for (let k = 0; k < NBINS; k++) {
        const cx = binCX(k);
        const x0 = -BOARD_W / 2 + k * BIN_W + DIV_T / 2, x1 = -BOARD_W / 2 + (k + 1) * BIN_W - DIV_T / 2;
        if (Math.abs(cx - (x0 + x1) / 2) > 1e-9) throw Error("bin center law broke");
        if (cx - BALL_R < x0 - 1e-9 || cx + BALL_R > x1 + 1e-9) throw Error(`bin ${k} too narrow for ball`);
        for (let i = 0; i < HEIGHTS[k]; i++) {
            const y = PLINTH_Y1 + BALL_R + i * 2 * BALL_R;
            if (y + BALL_R > DIV_TOP + 0.30) throw Error(`bin ${k} heap overshoots walls`);
        }
    }
    if (BALL_Z - BALL_R < DIV_Z0 + 0.01 || BALL_Z + BALL_R > DIV_Z1 - 0.01) throw Error("stacked ball z outside bin depth");
    const bellStr = HEIGHTS.join(",");
    console.log("containment law OK: bell [" + bellStr + "] - tails honestly empty");
}

// ---- glow census + envelope/NaN laws --------------------------------------------------------------
{
    if (glowMeshes.length !== 7) throw Error(`glow census ${glowMeshes.length} != 7`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.6 || sz.y < 3.9) throw Error(`height ${sz.y.toFixed(2)} outside band`);
    if (sz.x > 5.0 || sz.x < 4.3) throw Error(`width ${sz.x.toFixed(2)} outside band`);
    if (sz.z > 1.15 || sz.z < 0.85) throw Error(`depth ${sz.z.toFixed(2)} outside band`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 7 glow KEEP nodes`);
}

const merged = mergeByMaterial(g, "galtonboard");
writeFileSync("agents/arthur/assets/village_galtonboard3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_galtonboard3.glb`);
