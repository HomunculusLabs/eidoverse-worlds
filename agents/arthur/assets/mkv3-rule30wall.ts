// mkv3-rule30wall.ts — STRUCTURES LANE struct-109, Round 10 commission R10-10.
// THE RULE 30 WALL: the form ledger's missing family — CELLULAR AUTOMATON
// (ledger grep fresh this tick: zero automaton/rule-30/Wolfram presence in
// the 58 nx-struct works or any sibling plan).
//
// ONE IDEA: A WHOLE UNIVERSE FROM ONE RULE AND ONE SEED. Elementary rule 30
// (new = L XOR (C OR R); Wolfram's "physics of everything" icon) run 14
// steps from a single live cell; its spacetime diagram cut as a great
// triangular ashlar stele. Every cell of the light cone EXISTS (the cone is
// the triangle |c|<=n, rows 0..14, 225 cells): the 131 LIVE cells stand
// proud +0.18 as light ashlar through-stones (their backs ghost the pattern
// on the rear face), the 94 DEAD cells sit recessed in the dark bed
// (sunflowerdial bed lineage — packing gaps read as crevice shadow). The
// bed itself is the great truncated triangle whose raking edges pass
// through the outer-top corners of the edge blocks: THE TRIANGLE IS THE
// LIGHT CONE, the masonry fills it. The read at distance: left edge a
// clean raised diagonal (the ordered ray rule 30 is famous for), right
// edge ragged (the chaos it seeds). Half pattern, half noise — one rule.
// One brass dusk bead at the apex SEED cell (row 0: one rule, one seed,
// all this). Folly class: no entry advertised, no walk owed. Static by
// honest design.
//
// Layer planes (no two coplanar — z-fight law): live fronts +0.18, dead
// fronts +0.03, bed front -0.02, bed back -0.44, live backs -0.47.
// Determinism: rule-30 rows computed in-code; fixed texMat seeds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// ---- constants ----------------------------------------------------------------
const NR = 15;                 // rows 0..14 (a single seed + 14 generations)
const PITCH = 0.72;            // cell pitch m
const PROUD = 0.18;            // live-cell relief ahead of the bed face
const LIVE_T = 0.65;           // live through-stone depth (front +0.18 .. back -0.47)
const DEAD_T = 0.24;           // dead cell depth (front +0.03 .. back -0.21)
const BED_T = 0.42;            // bed slab depth (front -0.02 .. back -0.44)
const BR = 0.11;               // brass bead radius (dusk lineage)
const CELL = PITCH * 0.94;     // masonry reveal 6% between blocks
// Cone-edge law (derived, asserted below): every row's outer-TOP block corner
// lies EXACTLY on the line x+y = CORNER_SUM (blocks are axis-aligned squares
// pitched along a 45° cone) — the bed's raking edge rides that line +LIP.
const CORNER_SUM = (NR - 1) * PITCH + PITCH / 2 + CELL / 2 + CELL / 2; // = xOut(0)+yTop(0)
const LIP = 0.02;
const L = CORNER_SUM + LIP;    // bed raking edge: x + y = L
const HB = L;                  // bed half-base at y=0 (the light cone to grade)
const BED_TOP = (NR - 1) * PITCH + PITCH / 2 + CELL / 2 - 0.02; // 2cm below seed top

// ---- rule 30 (elementary CA, new = L XOR (C OR R)) --------------------------------
type Row = Set<number>;
function step(prev: Row): Row {
    const lo = Math.min(...prev) - 1, hi = Math.max(...prev) + 1;
    const nxt: Row = new Set();
    for (let c = lo; c <= hi; c++) {
        const L = prev.has(c - 1), C = prev.has(c), R = prev.has(c + 1);
        if ((L ? 1 : 0) ^ (C || R ? 1 : 0)) nxt.add(c);
    }
    return nxt;
}
const rowsCA: Row[] = [new Set([0])];
for (let n = 1; n < NR; n++) rowsCA.push(step(rowsCA[n - 1]));

// ---- in-code math asserts (independent recomputation, hand-me-down law) -----------
{
    const LIVE = [1, 3, 3, 6, 4, 9, 5, 12, 7, 12, 11, 14, 12, 19, 13]; // computed pre-build
    for (let n = 0; n < NR; n++) {
        if (rowsCA[n].size !== LIVE[n]) throw Error(`live-count hand-me-down fail row ${n}: ${rowsCA[n].size} != ${LIVE[n]}`);
        // every row's live extremes are exactly ±n (edges all-live => clean triangle rim)
        if (Math.min(...rowsCA[n]) !== -n || Math.max(...rowsCA[n]) !== n)
            throw Error(`edge law fail row ${n}: ${Math.min(...rowsCA[n])}..${Math.max(...rowsCA[n])}`);
    }
    // canonical rule-30 truth table vs the boolean form used above:
    // 111->0 110->0 101->0 100->1 011->1 010->1 001->1 000->0
    const cases: Array<[boolean, boolean, boolean, number]> = [
        [true, true, true, 0], [true, true, false, 0], [true, false, true, 0],
        [true, false, false, 1], [false, true, true, 1], [false, true, false, 1],
        [false, false, true, 1], [false, false, false, 0],
    ];
    const bool = (L: boolean, C: boolean, R: boolean) => (L ? 1 : 0) ^ (C || R ? 1 : 0);
    for (const [L, C, R, want] of cases) {
        if (bool(L, C, R) !== want) throw Error(`rule-30 boolean form mismatch ${L ? 1 : 0}${C ? 1 : 0}${R ? 1 : 0} -> ${bool(L, C, R)} want ${want}`);
    }
    console.log(`rule30 rows OK: live ${rowsCA.map(r => r.size).join(",")} | edges ±n every row | truth table 8/8`);
}

// ---- materials -------------------------------------------------------------------
const lightStone = texMat("rw_live", [0x9a9284, 0xa29a8b, 0x8e8677], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6301 });
const bedStone   = texMat("rw_bed",  [0x4f4d46, 0x57554e, 0x474540], { rough: 0.97, scale: 2, weights: [3, 1, 1], seed: 6302 });
const plinthStone = texMat("rw_plinth", [0x6b665c, 0x736e63, 0x615c53], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 6303 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- geometry ---------------------------------------------------------------------
// Local frame: stele face on the XY plane, +Z = face normal (toward approach).
// Row 0 (apex) at top, row 14 (base) at the bottom: time flows DOWN, the way
// the diagram is printed. c -> x, n -> y. The apex is the seed.
const liveZ = PROUD - LIVE_T / 2;   // center: front +PROUD, back -0.47
const deadZ = 0.03 - DEAD_T / 2;    // center: front +0.03, back -0.21
for (let n = 0; n < NR; n++) {
    const y = (NR - 1 - n) * PITCH + PITCH / 2; // row 14 at y=PITCH/2, row 0 at top
    for (let c = -n; c <= n; c++) {             // the light cone |c| <= n
        const x = c * PITCH;
        if (rowsCA[n].has(c)) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(CELL, CELL, LIVE_T), lightStone);
            b.position.set(x, y, liveZ);
            g.add(b);
        } else {
            const d = new THREE.Mesh(new THREE.BoxGeometry(CELL, CELL, DEAD_T), bedStone);
            d.position.set(x, y, deadZ);
            g.add(d);
        }
    }
}

// backing bed: the great truncated triangle. Raking edges ride the true cone
// edge line x+y = L (through every outer-top block corner + 2cm lip); top edge
// 2cm below the seed block top (reveal joint, no coplanar crest).
{
    const shape = new THREE.Shape();
    const top = BED_TOP;
    const halfAtTop = Math.max(0, L - top);      // where x+y=L meets the top cut
    shape.moveTo(-HB, 0);
    shape.lineTo(HB, 0);
    shape.lineTo(halfAtTop, top);
    shape.lineTo(-halfAtTop, top);
    shape.closePath();
    const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: BED_T, bevelEnabled: false }), bedStone);
    slab.position.z = -0.02 - BED_T;             // front -0.02, back -0.44
    g.add(slab);
}

// apex seed bead: socket + brass dusk bead at the seed cell's face center
// (struct-107 v2c lineage: mass makes it read intentional).
{
    const seedY = (NR - 1) * PITCH + PITCH / 2;
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 0.10, 8), plinthStone);
    socket.name = "glow_rw_socket";
    socket.rotation.x = Math.PI / 2; // cylinder axis -> +Z
    socket.position.set(0, seedY, PROUD + 0.05);
    g.add(socket);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
    bead.name = "glow_rw_1";
    bead.position.set(0, seedY, PROUD + 0.10 + 0.02 + BR);
    g.add(bead);
}

// plinth: two stepped ashlar strip courses under the stele's strip footprint
// (the triangle reads in elevation; the plinth grounds it in plan — stele
// z-span -0.47..+0.18, center -0.145; s2 base -0.42 seated by terrain PY).
{
    const zc = -0.145;
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(2 * (L + 0.35), 0.22, 0.80), plinthStone);
    s1.position.set(0, -0.11, zc);
    g.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(2 * (L + 0.80), 0.20, 1.00), plinthStone);
    s2.position.set(0, -0.32, zc);
    g.add(s2);
}

// ---- containment + flush-face assertions -------------------------------------------
{
    // cone-edge law: every row's outer-top block corner lies exactly on
    // x+y = CORNER_SUM (blocks are axis-aligned squares pitched on the 45°
    // cone) — asserted, then the bed edge rides that line +LIP.
    for (let n = 0; n < NR; n++) {
        const yc = (NR - 1 - n) * PITCH + PITCH / 2;
        const xOut = n * PITCH + CELL / 2, yTop = yc + CELL / 2;
        if (Math.abs(xOut + yTop - CORNER_SUM) > 1e-9)
            throw Error(`cone-edge law fail row ${n}: ${xOut.toFixed(3)}+${yTop.toFixed(3)} != ${CORNER_SUM.toFixed(3)}`);
    }
    // live block corners clear the bed's raking edge (x+y = L) with the
    // designed lip; no block corner buried past the edge line
    for (let n = 0; n < NR; n++) {
        const yc = (NR - 1 - n) * PITCH + PITCH / 2;
        const xOut = n * PITCH + CELL / 2, yTop = yc + CELL / 2;
        const gap = L - (xOut + yTop);
        if (gap < LIP - 0.001 || gap > LIP + 0.001)
            throw Error(`bed lip fail row ${n}: gap ${gap.toFixed(4)} != ${LIP}`);
    }
    const live: number[] = [];
    g.traverse(o => {
        const m = o as THREE.Mesh;
        if (!(m as any).isMesh || m.material !== lightStone) return;
        live.push(m.position.z);
    });
    if (live.length !== rowsCA.reduce((a, r) => a + r.size, 0)) throw Error(`live mesh count ${live.length} != ${rowsCA.reduce((a, r) => a + r.size, 0)}`);
    const zs = new Set(live.map(z => +z.toFixed(6)));
    if (zs.size !== 1) throw Error(`live faces not coplanar: ${[...zs]}`);
    if (Math.abs([...zs][0] + LIVE_T / 2 - PROUD) > 1e-6) throw Error(`live front face ${([...zs][0] + LIVE_T / 2).toFixed(4)} != +${PROUD}`);
    console.log(`containment + flush-face OK: ${live.length} live through-stones coplanar front +${PROUD}, edge relief <= 2.1cm`);
}

// ---- bead sightline assertion (Raycaster; occlusion-beats-emissive law) ------------
{
    g.updateMatrixWorld(true);
    const bead = g.getObjectByName("glow_rw_1") as THREE.Mesh;
    const target = new THREE.Vector3();
    bead.getWorldPosition(target);
    const targets: THREE.Object3D[] = [];
    g.traverse(o => { if ((o as any).isMesh && o !== bead) targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    let worst = "none";
    for (const [deg, dist] of [[0, 18], [30, 18], [-30, 18], [60, 18], [-60, 18], [0, 6], [25, 6]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = target.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const beadDist = eye.distanceTo(target);
        if (hits.length && hits[0].distance < beadDist - BR - 0.02) {
            worst = `blocked from ${deg}°@${dist}m by ${hits[0].object.name || hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${beadDist.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    console.log(`bead sightline OK: clear from 5×18m + 2×6m vantages (bead world y ${target.y.toFixed(3)})`);
}

// ---- envelope + NaN assertions ------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const expW = 2 * (L + 0.80); // plinth s2 governs width
    if (env.min.y < -0.43) throw Error(`below grade ${env.min.y} (s2 base -0.42 expected, seated by terrain)`);
    if (env.max.y > 11.5 || env.max.y < 10.5) throw Error(`crest ${env.max.y.toFixed(2)} outside 10.5..11.5`);
    if (Math.abs(sz.x - expW) > 0.01) throw Error(`width ${sz.x.toFixed(2)} != plinth ${expW.toFixed(2)}`);
    if (env.max.z < PROUD - 1e-6) throw Error(`front face crest ${env.max.z} < ${PROUD}`);
    let nan = 0;
    g.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] z[${env.min.z.toFixed(2)}..${env.max.z.toFixed(2)}]`);
}

const merged = mergeByMaterial(g, "rule30wall");
writeFileSync("agents/arthur/assets/village_rule30wall3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_rule30wall3.glb`);
