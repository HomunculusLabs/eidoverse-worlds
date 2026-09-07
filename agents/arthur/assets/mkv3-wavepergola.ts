// mkv3-wavepergola.ts — STRUCTURES LANE struct-65, Round 5 commission R5-2.
// THE WAVE PERGOLA: the wave family's building-scale figure. The village
// holds the wave as frozen TIME (pendulum's rod sine) and as kinetic air
// (stillwind's masts) — nothing holds one clean sine period as a ROOFLINE.
// One idea (Judd): a promenade gallery whose twin rails ARE one full sine
// period; everything else (posts, joists) only serves the wave.
//   - twin iron rails swept along y = YBASE + A·sin(2πx/λ), one exact
//     period x ∈ [−7, +7] (λ=14, A=0.9), 56 tangent segments per rail;
//   - YBASE 3.41 set by the WALK-UNDER LAW: trough rail bottom =
//     YBASE − A − BH/2 = 2.30m clear — the whole promenade is honestly
//     walkable under BOTH crests and troughs (room gates: 14.04×4.4 = 61.8m²
//     ≥16, height 4.59 ≥2.2 → exact trimesh, beams are real headroom);
//   - 7 timber post pairs at x = ±6..0 (2m bays, 1.84m clear ≥1.4), tops
//     cut to the rail underside +30mm embed (always seated, never gapped);
//   - 14 joists at 1m rhythm riding the rails (20mm embed);
//   - two brass beads (glow2 emissive dusk lineage — ellipsecourt pins /
//     beacon head lane) seated on the rail crests at x=+3.5 — the crest
//     jewelry; ZERO lamp draw, no comps, no motion (stillwind owns kinetic).
// Sited to run ALONG the E approach (axis on world X) so walking the
// allège rises and falls through one full wave toward the ruled tower.
// Determinism: fixed trig, fixed counts, asserts below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timberTex = texMat("timber", [0x6e5a3e, 0x77654a, 0x5c4c34], { rough: 0.85, scale: 1.5 });
const ironTex = texMat("wave_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brass = mat(0xa0a248, 0.4, 0.8);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.55;

// ---- the wave --------------------------------------------------------------
const LAM = 14, AMP = 0.9, YBASE = 3.41;
const X0 = -LAM / 2, X1 = LAM / 2;
const BH = 0.42, BW = 0.20;          // rail section
const ZB = 2.1;                      // twin rail z-offset
const waveY = (x: number) => YBASE + AMP * Math.sin((2 * Math.PI * x) / LAM);

// walk-under law: lowest rail underside must clear 2.30m
const troughBottom = YBASE - AMP - BH / 2;
if (troughBottom < 2.295) throw Error(`trough rail bottom ${troughBottom} violates walk-under law`);
// one exact period: endpoints at midline
if (Math.abs(waveY(X0) - YBASE) > 1e-12 || Math.abs(waveY(X1) - YBASE) > 1e-12) throw Error("not one exact period");

// ---- twin rails: 56 tangent segments each, chained at sample points -------
const SEG = 56;
for (const sz of [-1, 1] as const) {
    for (let i = 0; i < SEG; i++) {
        const xa = X0 + (i / SEG) * LAM, xb = X0 + ((i + 1) / SEG) * LAM;
        const ya = waveY(xa), yb = waveY(xb);
        const len = Math.hypot(xb - xa, yb - ya) + 0.02;   // 10mm lap per joint
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, BH, BW), ironTex);
        seg.name = `rail_s${sz < 0 ? "n" : "p"}`;
        seg.position.set((xa + xb) / 2, (ya + yb) / 2, sz * ZB);
        seg.rotation.z = Math.atan2(yb - ya, xb - xa);
        g.add(seg);
    }
}

// ---- posts: 7 pairs, tops cut to the rail underside (+30mm embed) ---------
const POST_X = [-6, -4, -2, 0, 2, 4, 6];
const PW = 0.16;
for (const px of POST_X) for (const sz of [-1, 1] as const) {
    const top = waveY(px) - BH / 2 + 0.03;   // embed: seated, never gapped
    if (top < 2.0) throw Error(`post at x=${px} too short (${top})`);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(PW, top - 0.1, PW), timberTex);
    shaft.name = `post_s${sz < 0 ? "n" : "p"}`;
    shaft.position.set(px, 0.1 + (top - 0.1) / 2, sz * ZB);
    g.add(shaft);
    // base plinth block (visual footing)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.28), timberTex);
    foot.name = `postfoot_s${sz < 0 ? "n" : "p"}`;
    foot.position.set(px, 0.05, sz * ZB);
    g.add(foot);
}
// bay rhythm proof: 2m pitch, 1.84m clear between shafts ≥ 1.4
{
    const clear = 2 - PW;
    if (clear < 1.4) throw Error(`bay clear ${clear} < 1.4`);
}

// ---- joists: 1m rhythm riding the rails ------------------------------------
for (let xj = -6.5; xj <= 6.5 + 1e-9; xj += 1) {
    const j = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 2 * ZB + BW + 0.06), timberTex);
    j.name = "joist_";
    j.position.set(xj, waveY(xj) + BH / 2 - 0.02 + 0.035, 0);
    g.add(j);
}

// ---- crest beads: brass, one per rail, at the +x crest ---------------------
const CREST = LAM / 4;                 // 3.5 — sin = +1
for (const sz of [-1, 1] as const) {
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), brass);
    bead.name = "crestbead_";          // KEEP-adjacent naming (emissive anchor)
    bead.position.set(CREST, waveY(CREST) + BH / 2 + 0.07 - 0.015, sz * ZB);
    g.add(bead);
}
if (Math.abs(waveY(CREST) - (YBASE + AMP)) > 1e-12) throw Error("crest not at λ/4");

// ---- envelope proof ---------------------------------------------------------
const maxY = YBASE + AMP + BH / 2 + 0.07, minY = 0;
const area = (2 * 7.02) * (2 * ZB + BW);
console.log(`envelope: x ±${(7.02).toFixed(2)} z ±${(ZB + BW / 2).toFixed(2)} y ${minY}..${maxY.toFixed(2)} area ${area.toFixed(1)}m²`);
if (area < 16) throw Error(`footprint ${area} < room gate`);
if (maxY < 2.2) throw Error(`height ${maxY} < room gate`);

const merged = mergeByMaterial(g, "wavepergola");
writeFileSync("agents/arthur/assets/village_wavepergola3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_wavepergola3.glb (rails ${2 * SEG} segs, posts ${POST_X.length * 2}, trough-bottom ${troughBottom.toFixed(3)}m)`);
