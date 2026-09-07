// mkv3-waterstair.ts — STRUCTURES LANE struct-16 / struct-53 / struct-57.
// struct-57 (survey-21/22 native-backed dissent cure): the v1 "reflecting
// shelf" formula seated the water tray ABOVE grade (+0.25) as a raised tank
// while the treads descended below live terrain — the world showed a dry
// floodgate over buried slabs, water one edge-on 6px sliver. v2 raised a
// cascade but kept FLAT-FULL-HEIGHT cheeks + high back wall — the 18m
// after-judge read post-and-lintel GATE (descent invisible in profile),
// navy-not-teal films, foot pool edge-on invisible. v3 (this): (a) cheek
// tops STEP DOWN with the stair — the silhouette itself is a descending
// terrace, the gate frame is gone; (b) back wall dropped to a low rim
// behind the header plate; (c) water brightened within its 200-deg hue
// family (base 0x5f8698, emissive 0x41708a@0.65) for the 18m teal read —
// palette-legibility shift disclosed in plan/ledger; (d) foot pool raised
// to a brimming line (0.13) over its curb (0.09) on a grounded stone base.
// One idea: the village steps down to touch its water. Films are VERTICAL
// z-facing planes (unforeshortened at the 1.5-deg approach down-angle) and
// sit 0.015 PROUD of each stone riser (struct-52 law: never recess).
// Envelope law: footprint x/z EXACT vs standing [-1.825..1.825, -0.2..3.6]
// (SAT/collider-neutral reseat); y strict subset [-0.33, 0.78] vs
// [-0.90, 0.795]. Solid furniture class unchanged. Local +Z = approach.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// water, struct-57 v3: same hue family as the canon 0x506a78 (polish-271)
// but brightened for the 18m dead-on contract (v2 films read navy/indigo at
// 7-8px band height — survey-21/22 ask was "reads as water at a glance").
const water = mat(0x5f8698, 0.22, 0.45);
(water as any).emissive = new THREE.Color(0x41708a);
(water as any).emissiveIntensity = 0.65;
// finials: textured gold (plain brass mat() reads gray at 18m — waysign
// handleTex law / improve-8 no-envmap root cause).
const goldTex = texMat("ws_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });

const W = 2.6;          // channel width between cheeks
const RISE = 0.12;      // per-tread fall
const TREAD_D = 0.36;   // tread depth (z)
const H0 = 0.48;        // first tread top (header lip)
const HEAD_W = 0.58;    // header water top
const Z0 = 0.55;        // stair start z (header front face)
const topOf = (i: number) => H0 - i * RISE; // tread i top

// header (source pool): LOW back rim + brimming water plate inside
{
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.99, 0.35), stoneTex);
    back.name = "header_wall";
    back.position.set(0, 0.66 - 0.99 / 2, -0.2 + 0.35 / 2); // top 0.66, z -0.2..0.15
    g.add(back);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 0.75), water);
    plate.name = "header_water";
    plate.position.set(0, HEAD_W - 0.03, -0.2 + 0.375); // top y0.58, spans to cheek faces
    g.add(plate);
}

// stair: five treads descending toward the approach, solid interpenetrating
// bodies (each box hangs 0.33 deep so no see-through gaps — skene lesson)
for (let i = 0; i < 5; i++) {
    const top = topOf(i);
    const zc = Z0 + i * TREAD_D + TREAD_D / 2;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(W, 0.33, TREAD_D), stoneTex);
    tread.name = `tread_${i}`;
    tread.position.set(0, top - 0.33 / 2, zc);
    g.add(tread);
}

// water films: one per RISER (vertical, +Z-facing), 0.015 proud of the stone
// face, spanning the channel; plus a shallow lip sheeting each tread top.
// Film i covers the exposed front face of tread i (header lip fall for i=0).
// The last tread ends IN the pool (top 0.03 < pool 0.13) — submerged, no film.
for (let i = 0; i < 5; i++) {
    const yHi = i === 0 ? HEAD_W : topOf(i - 1);
    const yLo = topOf(i);
    const zFace = Z0 + i * TREAD_D; // front face of tread i
    const film = new THREE.Mesh(new THREE.BoxGeometry(W, yHi - yLo, 0.045), water);
    film.name = `film_${i}`;
    film.position.set(0, (yHi + yLo) / 2, zFace + 0.0075); // outer face 0.015 proud of stone
    g.add(film);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(W, 0.025, 0.14), water);
    lip.name = `lip_${i}`;
    lip.position.set(0, yLo + 0.0125, zFace + 0.07 + 0.015);
    g.add(lip);
}

// foot: grounded stone base, brimming pool line above its curb
{
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.41, 1.3), stoneTex);
    base.name = "pool_base";
    base.position.set(0, 0.08 - 0.41 / 2, 2.3 + 0.65); // y -0.33..0.08, z 2.3..3.6
    g.add(base);
    const pool = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 1.0), water);
    pool.name = "pool_water";
    pool.position.set(0, 0.08 + 0.025, 2.35 + 0.5); // top y0.13 (brims 0.04 over curb)
    g.add(pool);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.09, 0.25), stoneTex);
    curb.name = "pool_curb";
    curb.position.set(0, 0.045, 3.35 + 0.125); // top 0.09, z 3.35..3.60 (envelope exact)
    g.add(curb);
}

// cheeks: STEPPED tops descending with the stair — the silhouette is the
// terrace profile (v2's flat full-height runs read post-and-lintel gate).
// Segment tops follow tread tops +0.14 parapet, foot segment over the pool.
const segs: Array<[number, number, number]> = [
    [-0.2, 0.91, 0.62],   // header + tread 0 (top 0.48+0.14)
    [0.91, 1.27, 0.50],   // tread 1 (0.36+0.14)
    [1.27, 1.63, 0.38],   // tread 2 (0.24+0.14)
    [1.63, 1.99, 0.26],   // tread 3 (0.12+0.14)
    [1.99, 3.4, 0.17],    // tread 4 + pool run (0.03+0.14)
];
for (const sx of [-1, 1]) {
    for (const [za, zb, top] of segs) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.35, top + 0.33, zb - za), stoneTex);
        seg.name = `cheek_${sx < 0 ? "w" : "e"}_${za.toFixed(2)}`;
        seg.position.set(sx * (W / 2 + 0.35), (top - 0.33) / 2, (za + zb) / 2);
        g.add(seg);
    }
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), goldTex);
    fin.name = `fin_${sx < 0 ? "w" : "e"}`;
    fin.position.set(sx * (W / 2 + 0.35), 0.62 + 0.09, 0.1); // top 0.78
    g.add(fin);
}

const merged = mergeByMaterial(g, "waterstair");
writeFileSync("agents/arthur/assets/village_waterstair3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_waterstair3.glb");
