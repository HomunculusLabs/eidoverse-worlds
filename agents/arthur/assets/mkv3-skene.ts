// mkv3-skene.ts — STRUCTURES LANE struct-14: U-4 THE SKENE WALL.
// The theater's backdrop: a 7m ashlar wall behind the performance disc,
// 1.8m tall with three tall niches at harmonic spacing (golden-ratio
// division of the span), a brass center pin at the stage-facing face,
// and stone cheek walls angled forward at each end (the proscenium
// embrace). One idea: the frame that makes a stage a stage. Wall is
// solid — approached, not entered.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-36: waysign handleTex textured-gold law (improve-8 precedent — flat
// metal-mat brass desaturates gray-olive without envmap at 18m; texture reads).
const goldTex = texMat("skene_gold", [0xa09832, 0x887c2a], { rough: 0.9, scale: 2, weights: [3, 1] });
const dark = mat(C.DARK, 0.95, 0);

const LEN = 7.0, H = 1.8, T = 0.5;

// main wall: two piers + three niche panels between them (niches at
// golden-ratio divisions of the span): tall dark insets, stone frames.
{
    for (const sx of [-1, 1]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(0.6, H, T), stoneTex);
        pier.name = `pier_${sx < 0 ? "w" : "e"}`;
        pier.position.set(sx * (LEN / 2 - 0.3), H / 2, 0);
        g.add(pier);
    }
    // struct-36 (improve-3 row 11 fix): THE WALL BODY — the original build
    // created only piers + floating dark insets + lintels with NOTHING
    // between them, so sky showed through every bay (native re-judgment
    // confirmed: five floating slabs). One solid stone back body now closes
    // the span behind the recessed niches; a sill course grounds them.
    const body = new THREE.Mesh(new THREE.BoxGeometry(LEN - 1.2, H, T * 0.55), stoneTex);
    body.name = "wall_body";
    body.position.set(0, H / 2, -0.12);
    g.add(body);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(LEN - 1.2, 0.16, T * 0.85), stoneTex);
    sill.name = "sill";
    sill.position.set(0, 0.08, 0);
    g.add(sill);
    // golden-ratio divisions: 0, 0.236, 0.382, 0.618, 0.764, 1 of span
    const divs = [0, 0.236, 0.382, 0.618, 0.764, 1];
    let panel = 0;
    for (let i = 0; i < divs.length - 1; i++) {
        const a = -LEN / 2 + 0.6 + (LEN - 1.2) * divs[i];
        const b = -LEN / 2 + 0.6 + (LEN - 1.2) * divs[i + 1];
        const w = b - a;
        if (w < 0.3) continue;
        // niche: dark inset recessed behind a PROUD stone surround — the
        // recess read the original flat layout could never give.
        const cx = (a + b) / 2;
        const niche = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, H * 0.8, T * 0.4), dark);
        niche.name = `niche_${panel}`;
        niche.position.set(cx, 0.16 + (H * 0.8) / 2, -0.05);
        g.add(niche);
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, T * 1.06), stoneTex);
        lintel.name = `nlin_${panel}`;
        lintel.position.set(cx, H - 0.07, 0);
        g.add(lintel);
        panel++;
    }
    // four mullions: one per internal golden division — the bay rhythm made
    // structural, and the closure of every through-gap the re-judgment saw.
    for (const d of [0.236, 0.382, 0.618, 0.764]) {
        const x = -LEN / 2 + 0.6 + (LEN - 1.2) * d;
        const mull = new THREE.Mesh(new THREE.BoxGeometry(0.14, H, T * 0.9), stoneTex);
        mull.name = `mull_${Math.round(d * 1000)}`;
        mull.position.set(x, H / 2, 0.02);
        g.add(mull);
    }
    // gold center pin on the stage face (local +Z) — textured gold, sub-pixel
    // brass speck finding fixed by waysign scale+material law.
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), goldTex);
    pin.name = "spin_pin";
    pin.position.set(0, H + 0.16, 0.28);
    g.add(pin);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 8), goldTex);
    stem.name = "pinstem";
    stem.position.set(0, H + 0.02, 0.28);
    g.add(stem);
}

// cheek walls: angled forward at each end (proscenium embrace)
for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.4), stoneTex);
    cheek.name = `cheek_${sx < 0 ? "w" : "e"}`;
    cheek.position.set(sx * (LEN / 2 + 0.62), 0.6, 0.5);
    cheek.rotation.y = sx * -0.5;
    g.add(cheek);
}

const merged = mergeByMaterial(g, "skene");
writeFileSync("agents/arthur/assets/village_skene3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_skene3.glb");
