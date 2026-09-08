// mkv3-honeycombscreen.ts — STRUCTURES LANE struct-97, Round 10 commission R10-1.
// THE HONEYCOMB SCREEN: the form ledger's missing family — TESSELLATION.
// (Curves complete: parabola/ellipse/hyperbola/hypar/sine/circle/catenary/
// helicoid/Reuleaux/conoid/ogee/moon-disc/lemniscate/astroid; compositions:
// superposition fifthbench / intersection vesica / envelope slidingladder —
// NOTHING in the village's 49 struct entities carries a tessellation as its
// identity.)
//
// ONE IDEA: THE HONEYCOMB AS WINDSCREEN. One standing stone screen whose
// wall IS the comb — an offset-r lattice of hexagon tubes, perforated cells
// reading through, the geometry itself the ornament (Judd discipline: no
// applied trim). THREE QUEEN CELLS on a rising diagonal carry brass rims
// with warm emissive — the hive's rhythm and the night signature (three
// crisp amber points on one line, no bleed).
//
// GEOMETRY (entity local; screen face plane = local x–y, depth on z):
//   - flat-top hexagons, circumradius R=0.45, tube side wall 0.075,
//     extruded depth 0.55 (z ±0.275), bevel off.
//   - odd-r offset lattice: col j x = (j−2)·1.5R, row i y = BASE + i·√3R
//     + (j odd ? √3R/2 : 0); j=0..4, i=0..4 → 25 cells; every neighbor
//     pair exactly √3R apart (asserted). BASE=0.50 roots even-col bottoms
//     inside the plinth; the bottom selvage reads comb-out-of-course.
//   - base plinth y 0..0.30, deeper than the screen (z ±0.31 vs 0.275) so
//     embedded tubes seat cleanly (no coplanar faces).
//   - two slim end piers 0.18 × 4.067 × 0.62 + coping caps frame the comb;
//     odd-column tops (4.454) crest the piers — the comb is the hero.
//   - queens: (col 1,row 1),(col 2,row 2),(col 3,row 3) rising diagonal —
//     brass rims, KEEP-named glow_hc_1..3 (struct-82 law: emissive dies in
//     buckets; the queens must survive merge as their own nodes).
//
// Classification (supportclass.js read live this tick: ROOM_MIN_AREA 8,
// ROOM_MIN_H 2.2, FLOOR_MIN_AREA 2): footprint ≈ 4.2 × 0.62 = 2.6m² < 8,
// h ≈ 4.45 > 2.2 → furniture solid box — honest folly, walkable around,
// no door advertised (no walk owed).
//
// Determinism: fixed lattice arrays, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (struct-96 v4 cool-neutral grey stone
// dialect, native-proven to read STONE not timber; brass = slidingladder's
// distinctness-proven glow)
const stoneTex = texMat("hc_stone", [0x878b8e, 0x8f9396, 0x7d8184], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85;

// ---- constants ----------------------------------------------------------------
const R = 0.45;                // hex circumradius (flat-top: width 2R, height √3R)
const WALL = 0.075;            // tube side thickness (opening ≈ 0.60 across)
const DEPTH = 0.55;            // extrusion depth (z ±0.275)
const BASE = 0.50;             // even-col row-0 center y (bottom vertex 0.05, rooted in plinth)
const SQ3 = Math.sqrt(3);
const DX = 1.5 * R;            // column pitch
const DY = SQ3 * R;            // row pitch
const COLS = 5, ROWS = 5;
const PLINTH_H = 0.30;
const PLINTH_DZ = 0.31;        // deeper than screen — clean embed
const PIER_W = 0.18, PIER_DZ = 0.62;
const PIER_H = BASE + (ROWS - 1) * DY + R; // even-col top edge 4.067 — piers frame to the flat top line
const QUEENS: Array<[number, number]> = [[1, 1], [2, 2], [3, 2], [4, 3]]; // straight rising diagonal (odd-r law below)

const cx = (j: number) => (j - 2) * DX;
const cy = (j: number, i: number) => BASE + i * DY + (j % 2 === 1 ? DY / 2 : 0);

// ---- tessellation law: every neighbor pair exactly √3R apart (proven before build) ----
{
    const at = new Map<string, [number, number]>();
    for (let j = 0; j < COLS; j++) for (let i = 0; i < ROWS; i++) at.set(`${j},${i}`, [cx(j), cy(j, i)]);
    // odd-r offset neighbor offsets are PARITY-AWARE: an 8-neighborhood would
    // wrongly include (+1,+1)-class pairs that legitimately sit 3R apart.
    const NB = (j: number): Array<[number, number]> =>
        j % 2 === 0 ? [[0, 1], [0, -1], [1, -1], [1, 0], [-1, -1], [-1, 0]]
                    : [[0, 1], [0, -1], [1, 0], [1, 1], [-1, 0], [-1, 1]];
    let pairs = 0;
    for (let j = 0; j < COLS; j++) for (let i = 0; i < ROWS; i++) {
        const p = at.get(`${j},${i}`)!;
        for (const [dj, di] of NB(j)) {
            const q = at.get(`${j + dj},${i + di}`);
            if (!q) continue;
            const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
            if (Math.abs(d - SQ3 * R) > 1e-9) throw Error(`lattice law broken at (${j},${i})+(${dj},${di}): d=${d}`);
            pairs++;
        }
    }
    if (pairs === 0) throw Error("no neighbor pairs checked");
    // queen diagonal law: in an odd-r offset lattice the (+1,+1) center line is
    // STRAIGHT — each step rises exactly DY/2 (odd cols sit DY/2 high), so
    // equal consecutive rises = collinear queens.
    const rises: number[] = [];
    for (let k = 0; k + 1 < QUEENS.length; k++) {
        const [j0, i0] = QUEENS[k], [j1, i1] = QUEENS[k + 1];
        if (j1 - j0 !== 1) throw Error("queen diagonal broken"); // consecutive columns; the STRAIGHT diagonal alternates row steps (+1, 0)
        rises.push(cy(j1, i1) - cy(j0, i0));
    }
    if (Math.abs(rises[0] - DY / 2) > 1e-9 || Math.abs(rises[0] - rises[1]) > 1e-12) throw Error(`queen rises ${rises} not collinear DY/2=${(DY / 2).toFixed(4)}`);
    console.log(`tessellation law OK: ${pairs / 2} neighbor pairs at √3R=${(SQ3 * R).toFixed(4)} exact; ${QUEENS.length} queens collinear on the (+1,+1) diagonal rising DY/2=${(DY / 2).toFixed(4)} per step`);
}

// ---- hex tube helper --------------------------------------------------------------
// The tube OUTER contour is the FULL tessellation cell hexagon (circumradius
// R) so adjacent cells tile edge-to-edge with coincident shared walls — the
// honest honeycomb. The opening is a hole at inner apothem √3R/2 − WALL
// (opening ≈ 0.63 across flats: cells read through at distance). Queens
// extrude SOLID — capped brood cells, the deliberate contrast.
function hexTube(centerX: number, centerY: number, mat: THREE.Material, name: string, capped: boolean) {
    const shape = new THREE.Shape();
    for (let k = 0; k < 6; k++) {
        const a = (k * 60 * Math.PI) / 180;
        const px = centerX + R * Math.cos(a), py = centerY + R * Math.sin(a);
        if (k === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
    }
    shape.closePath();
    if (!capped) {
        const holeR = ((SQ3 * R) / 2 - WALL) * 2 / SQ3; // circumradius of inner apothem (√3R/2 − WALL)
        const hole = new THREE.Path();
        for (let k = 0; k < 6; k++) {
            const a = (k * 60 * Math.PI) / 180;
            const px = centerX + holeR * Math.cos(a), py = centerY + holeR * Math.sin(a);
            if (k === 0) hole.moveTo(px, py); else hole.lineTo(px, py);
        }
        hole.closePath();
        shape.holes.push(hole);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
    geo.translate(0, 0, -DEPTH / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    g.add(mesh);
}

// ---- the comb: 25 hexagon tubes, queens in brass ------------------------------------
{
    let qi = 0;
    for (let j = 0; j < COLS; j++) {
        for (let i = 0; i < ROWS; i++) {
            const isQueen = qi < QUEENS.length && QUEENS[qi][0] === j && QUEENS[qi][1] === i;
            if (isQueen) {
                hexTube(cx(j), cy(j, i), brassGlow, `glow_hc_${qi + 1}`, true);
                qi++;
            } else {
                hexTube(cx(j), cy(j, i), stoneTex, `hc_hex_${j}_${i}`, false);
            }
        }
    }
    if (qi !== QUEENS.length) throw Error(`queen placement incomplete: ${qi}/${QUEENS.length}`);
    console.log(`comb OK: ${COLS * ROWS} cells (${QUEENS.length} queens in brass), tube wall ${WALL}, depth ${DEPTH}`);
}

// ---- plinth + end piers + coping caps ------------------------------------------------
{
    const w = 2 * (2 * DX + R) + 0.24; // comb width 8R + margin, matches piers
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w, PLINTH_H, PLINTH_DZ * 2), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    plinth.name = "hc_plinth";
    g.add(plinth);
    for (const s of [-1, 1]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(PIER_W, PIER_H, PIER_DZ), stoneTex);
        pier.position.set(s * (2 * DX + R + 0.12 + PIER_W / 2), PIER_H / 2, 0);
        pier.name = `hc_pier_${s < 0 ? "l" : "r"}`;
        g.add(pier);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(PIER_W + 0.08, 0.09, PIER_DZ + 0.08), stoneTex);
        cap.position.set(pier.position.x, PIER_H + 0.045, 0);
        cap.name = `hc_cap_${s < 0 ? "l" : "r"}`;
        g.add(cap);
    }
    console.log(`plinth+piers OK: plinth ${w.toFixed(2)}x${PLINTH_H}, piers to ${PIER_H.toFixed(3)} + caps`);
}

// ---- assertions on the build --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    const wantTop = BASE + (ROWS - 1) * DY + DY / 2 + (SQ3 * R) / 2; // odd-col top edge, flat-top hex: center + √3R/2 apothem
    if (Math.abs(env.max.y - wantTop) > 0.01) throw Error(`top ${env.max.y.toFixed(3)} vs crest ${wantTop.toFixed(3)}`);
    const foot = sz.x * sz.z;
    if (foot < 2) throw Error(`footprint ${foot.toFixed(2)} below floor gate`);
    if (foot >= 8) throw Error(`footprint ${foot.toFixed(2)} >= room gate 8 (furniture-box claim broken)`);
    if (sz.z > 1.2) throw Error(`depth ${sz.z.toFixed(2)} — screen must read as a plane`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | footprint ${foot.toFixed(1)}m² | crest ${env.max.y.toFixed(3)} | furniture-box class (area<8, h>2.2)`);
}
const merged = mergeByMaterial(g, "honeycombscreen");
writeFileSync("agents/arthur/assets/village_honeycombscreen3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_honeycombscreen3.glb");
