// mkv3-millrace.ts — STRUCTURES LANE struct-8: T-2 MILLRACE CASCADE.
// The windmill's water: a raised head-race (stone box + timber sluice)
// steps down SEVEN diminishing stone steps (harmonic heights ~ 1/(n+1)
// scaled) to a still basin at grade. Water in the canon WATER family on
// every step, thin and calm. One idea: water let down in measures.
// Local +Z runs DOWN the race (head at -Z end, basin at +Z).
// Collider honesty: narrow furniture profile (1.6 wide, ~15.8m2 footprint
// < 16 gate, height 1.5 < 2.2) -> solid box, correct for a water channel
// (you walk the bank, not through the race).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
// struct-38 (shard row 13): plain mat() exports NO glTF material (glbwrite
// emits only texMat/emissive lanes) -> COLOR_0 x loader-default metal-1
// material rendered near-black sheenless (survey-2 findings 2/3/4). Fix via
// the emissive lane, which emits a REAL material: canon water rough/metal
// (polish-271) + faint same-hue glow (polish-281 shadowed-water law, same
// numbers as bakery-cistern97).
const water = mat(0x506a78, 0.25, 0.5);
(water as any).emissive = new THREE.Color(0x2e4a58);
(water as any).emissiveIntensity = 0.45;
// textured gold (waysign handleTex law — plain brass mat() reads gray at
// 18m, improve-8 no-envmap root cause): sluice lift pin bead.
const goldTex = texMat("mill_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });

const W = 1.6;        // race width
const STEP_D = 1.15;  // step depth
// harmonic step heights: cumulative drop from head 1.45m
const drops = [0.30, 0.25, 0.21, 0.18, 0.16, 0.14, 0.12]; // ratios of 1/(n+1)-ish
const headH = 1.45;

// HEAD RACE: stone box + timber sluice gate + brass pin
{
    const head = new THREE.Mesh(new THREE.BoxGeometry(W + 0.5, headH, 1.3), stoneTex);
    head.name = "head";
    head.position.set(0, headH / 2, -0.65 - STEP_D * 0 + 0);
    // place head box spanning z -1.3..0 (its front face at z=0)
    head.position.z = -0.65;
    g.add(head);
    // water lip on the head top (the reservoir)
    const lip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.3, 0.06, 1.0), water);
    lip.name = "head_water";
    lip.position.set(0, headH + 0.03, -0.65);
    g.add(lip);
    // timber sluice gate (raised — water released)
    const gate = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.5, 0.1), timberTex);
    gate.name = "sluice";
    gate.position.set(0, headH - 0.25, 0.06);
    g.add(gate);
    // brass lift-stem + bead on the sluice (struct-38: the old bare r0.06
    // sphere hovered 0.2m above the gate with no stem — floating-speck
    // read at 18m. Now: textured-gold stem rising THROUGH the gate top +
    // r0.09 bead seated on it — a screw-lift you can read.)
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 8), goldTex);
    pin.name = "spin_gate";
    pin.position.set(0, headH + 0.05, 0.06);
    g.add(pin);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), goldTex);
    bead.name = "spin_bead";
    bead.position.set(0, headH + 0.26, 0.06);
    g.add(bead);
}

// SEVEN HARMONIC STEPS: each a stone slab with a water inset, descending
{
    let z = 0;
    let y = headH;
    for (let i = 0; i < drops.length; i++) {
        y -= drops[i];
        const step = new THREE.Mesh(new THREE.BoxGeometry(W, y, STEP_D), stoneTex);
        step.name = `step_${i}`;
        step.position.set(0, y / 2, z + STEP_D / 2);
        g.add(step);
        // water film on each step
        const film = new THREE.Mesh(new THREE.BoxGeometry(W - 0.25, 0.05, STEP_D - 0.3), water);
        film.name = `swater_${i}`;
        film.position.set(0, y + 0.025, z + STEP_D / 2);
        g.add(film);
        z += STEP_D;
    }
}

// CHUTE + FLUME: the mill's water, visibly DELIVERED (struct-38, survey-2
// finding 5 — the identity read "ornamental fountain", not millrace: no
// channel, no visible pour). A raised timber launder (open-top trough on
// trestle posts) carries water from above/behind the head-race and pours
// over a stone chute into the first step — the flume-to-race signature the
// windmill quarter was missing. Local +Z still runs downhill.
{
    // timber launder: open-top U-channel, 2.2m long, feeding the head
    const launL = 2.2, launW = 0.6, launD = 0.22, launH = 1.78;
    const launZ0 = -0.65 - 1.3 - launL + 0.35; // trough runs back from head's rear face
    const bed = new THREE.Mesh(new THREE.BoxGeometry(launW, 0.06, launL), timberTex);
    bed.name = "laun_bed";
    bed.position.set(0, launH, launZ0 + launL / 2);
    g.add(bed);
    for (const sx of [-1, 1]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, launD, launL), timberTex);
        side.name = `laun_side_${sx > 0 ? "e" : "w"}`;
        side.position.set(sx * (launW / 2 - 0.025), launH + launD / 2, launZ0 + launL / 2);
        g.add(side);
    }
    // water ribbon inside the launder
    const lwater = new THREE.Mesh(new THREE.BoxGeometry(launW - 0.14, 0.05, launL - 0.3), water);
    lwater.name = "laun_water";
    lwater.position.set(0, launH + 0.045, launZ0 + launL / 2 + 0.05);
    lwater.rotation.x = 0.06; // gentle fall toward the head
    g.add(lwater);
    // two trestle post pairs carrying the launder, one cross-brace per pair
    for (const tz of [launZ0 + 0.35, launZ0 + launL - 0.3]) {
        for (const sx of [-1, 1]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, launH, 6), timberTex);
            leg.name = "laun_post";
            leg.position.set(sx * (launW / 2 - 0.05), launH / 2, tz);
            g.add(leg);
        }
        const brace = new THREE.Mesh(new THREE.BoxGeometry(launW - 0.1, 0.05, 0.05), timberTex);
        brace.name = "laun_brace";
        brace.position.set(0, launH * 0.45, tz);
        g.add(brace);
    }
    // the launder's delivery: inclined water tongue from the trough's front
    // lip (y1.83, z-1.73) down onto the head pool (y1.49, z-1.17) — without
    // it the ribbon reads disconnected from the race below.
    {
        const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.65), water);
        tongue.name = "laun_drop";
        tongue.position.set(0, 1.66, -1.45);
        tongue.rotation.x = 0.535; // rear (-Z) end raised to launder height
        g.add(tongue);
    }
    // stone chute spout at the head's front lip + water riding it, both
    // descending INTO step 1 (rotation.x positive = +Z end lower — the old
    // -0.9 tilt raised the far end and read as a wisp pointing uphill).
    const chute = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.09, 0.6), stoneTex);
    chute.name = "chute";
    chute.position.set(0, 1.30, 0.28);
    chute.rotation.x = 0.5;
    g.add(chute);
    const pour = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.05, 0.55), water);
    pour.name = "pour";
    pour.position.set(0, 1.36, 0.28);
    pour.rotation.x = 0.5;
    g.add(pour);
}

// BASIN: oval stone-rimmed pool at grade, end of the race
{
    const basinZ = drops.length * STEP_D + 1.1;
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.18, 22), water);
    basin.name = "basin";
    basin.scale.set(1.5, 1, 1.0);
    basin.position.set(0, 0.09, basinZ);
    g.add(basin);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 6, 30), stoneTex);
    brim.name = "brim";
    brim.rotation.x = Math.PI / 2;
    brim.scale.set(1.53, 1.03, 1);
    brim.position.set(0, 0.18, basinZ);
    g.add(brim);
    // reed accents at the basin edge (family callback to the Reed Pool);
    // struct-38: clumps, not hairlines — 3-4 stalks per clump (fan ~12cm)
    // at r0.035-0.045, clump centers exactly on the brim ring r~1.42
    const reedMat = mat(0x5c7648, 0.95, 0);
    const clumps = 5;
    for (let k = 0; k < clumps; k++) {
        const a = (k / clumps) * Math.PI * 2 + 0.55;
        const cx = Math.cos(a) * 1.42, cz = basinZ + Math.sin(a) * 1.42;
        for (let j = 0; j < 3; j++) {
            const h = 0.95 + 0.3 * Math.abs(Math.sin(k * 2.399 + j * 1.7));
            const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 5), reedMat);
            reed.name = `breed_${k}_${j}`;
            reed.position.set(cx + Math.cos(k * 2.399 + j * 2.1) * 0.13, h / 2, cz + Math.sin(k * 2.399 + j * 2.1) * 0.13);
            g.add(reed);
        }
    }
}

const merged = mergeByMaterial(g, "millrace");
writeFileSync("agents/arthur/assets/village_millrace3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_millrace3.glb");
