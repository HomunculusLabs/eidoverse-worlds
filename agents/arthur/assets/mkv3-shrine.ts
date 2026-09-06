// mkv3-shrine.ts — THE WAYSIDE SHRINE (era-2 heritage, era-3 edition):
// 4 carved standing stones in a circle, altar slab w/ votive candles
// (emissive), offering stone + bench. Open-air at 198°, r=24 — behind the
// treeline, discovered rather than displayed. All small-object scale.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-13 STONE IV — the shrine joins the ashlar family: 4 carved standing
// stones + altar top take the village stone tile (cell law — carved
// standing stones read as coursed blocks at village scale); pavers join
// the soil family (the shrine sits on trodden earth like every other
// walked surface). Flames/bowl/runes stay flat (emissive + small trim).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const soilTex = texMat("soil-0", [0x787250, 0x807c58, 0x6c6846], { rough: 0.97, scale: 3, weights: [2, 1, 1], seed: 1000 });
const pav = (name: string, w: number, d: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), soilTex);
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
};
// ground: 5 flat pavers in a cross
pav("pav_0", 1.0, 0.7, 0, 0.03, 0);
pav("pav_1", 0.7, 1.0, 0.9, 0.03, 0.9);
pav("pav_2", 0.7, 1.0, -0.9, 0.03, -0.9);
pav("pav_3", 0.7, 1.0, 0.9, 0.03, -0.9);
pav("pav_4", 0.7, 1.0, -0.9, 0.03, 0.9);

// 4 CARVED STANDING STONES at the diagonals — tall slabs, slightly leaning
// inward, each with 3 rune bars carved (darker inlay)
for (let s = 0; s < 4; s++) {
    const a = ((45 + s * 90) * Math.PI) / 180;
    const lean = 0.06 * ((s % 2) ? 1 : -1);
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.5 + (s % 2) * 0.2, 0.22), stoneTex);
    stone.name = `stone_${s}`;
    stone.position.set(Math.cos(a) * 1.35, (1.5 + (s % 2) * 0.2) / 2, Math.sin(a) * 1.35);
    stone.rotation.z = lean * Math.cos(a);
    stone.rotation.x = -lean * Math.sin(a);
    stone.rotation.y = -a;
    g.add(stone);
    // rune bars (3, darker) on the inward face
    for (const ry of [1.0, 0.7, 0.4]) {
        box(g, `rune_${s}_${ry}`, 0.24, 0.07, 0.03, Math.cos(a) * 1.22, ry, Math.sin(a) * 1.22, 0x36301e);
    }
    // polish-278 night identity: the stone tops were flat-cut dead ends —
    // the same unfinished-crown class as the gates/banner. A small warm
    // ember on each summit (same flame material family as the votives)
    // turns each stone into a lit marker; at night the circle reads as
    // four quiet points of light around the altar instead of black slabs.
    const emberMat = new THREE.MeshStandardMaterial({ color: 0xffb066, emissive: new THREE.Color(0xff9a4a), emissiveIntensity: 0.9, roughness: 0.5 });
    const stoneH = 1.5 + (s % 2) * 0.2;
    const ember = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), emberMat);
    ember.name = `ember_${s}`;
    ember.position.set(Math.cos(a) * 1.35, stoneH + 0.06, Math.sin(a) * 1.35);
    g.add(ember);
}
// THE ALTAR: low slab on a plinth at center
// tex-58 STONE XIII: the altar's plinth joins the family its top
// already carries (the plinth is the same coursed stone as the slab
// it holds); the devout's bench + its legs join too (a stone bench is
// stone — the pond-lip law at furniture scale). The brass offering
// bowl stays flat (the monument-bowl precedent), candles + flames +
// rune inlays stay flat (light and carving).
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.6), stoneTex);
    plinth.name = "altar_plinth";
    plinth.position.set(0, 0.175, 0);
    g.add(plinth);
}
{
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.72), stoneTex);
    top.name = "altar_top";
    top.position.set(0, 0.41, 0);
    g.add(top);
}
// 3 VOTIVE CANDLES on the altar (emissive flames — the shrine glows at dusk)
// Wakeup-40: each flame rides a flame_v${vi} anchor group — `flame` is already
// a KEEP prefix, so no mergekit edit: the flames can flicker.
for (const [vi, vx] of [[0, -0.28], [1, 0], [2, 0.28]] as const) {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.14, 6), mat(0xdcdcba, 0.85, 0));
    candle.name = `candle_${vi}`;
    candle.position.set(vx, 0.54, 0.12);
    g.add(candle);
    const vGrp = new THREE.Group();
    vGrp.name = `flame_v${vi}`;
    // improve-14 F1: flames at ~2px specks at 18m (survey-2 threshold note)
    // — r 0.038→0.055 + intensity 1.0→1.25 (improve-9 proven recipe): clear
    // warm points without blob noise (stone embers 0.045 stay the quiet tier).
    const flame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 1.25, roughness: 0.4 }));
    flame.name = `votive_${vi}`;
    flame.position.set(vx, 0.64, 0.12);
    vGrp.add(flame);
    g.add(vGrp);
}
// offering bowl on the altar's N edge
const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.09, 8), mat(0xa0a248, 0.4, 0.6));
bowl.name = "obowl";
bowl.position.set(0, 0.5, -0.18);
g.add(bowl);
// improve-14 F2: pale offering row on the altar top's front (bench-facing)
// edge — reads deliberate laid offerings at 18m. v1/v2 DOMED mounds FAILED
// native judgment twice: from the 18m vantage the altar top is seen at
// ~3.75° depression, so dome RELIEF projects ~0.35px — width-only smears
// that merge into the edge highlight. v3 switches idiom to UPRIGHT loaves
// (0.16m tall pale rounds, slightly varied yaw — bread/fruit laid standing
// for the shrine): full height silhouettes ~7.6px against the dark top,
// countable verticals (milestone-idiom), same scale tier as the candles.
for (const [oi, ox] of [[0, -0.30], [1, 0], [2, 0.30]] as const) {
    const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.13, 7), mat(0xdcdcba, 0.85, 0));
    loaf.name = `offering_${oi}`;
    loaf.position.set(ox, 0.47 + 0.065, 0.26);
    loaf.rotation.y = oi * 0.5 - 0.4;
    const loafDome = new THREE.Mesh(new THREE.SphereGeometry(0.048, 7, 5), mat(0xdcdcba, 0.85, 0));
    loafDome.name = `offering_dome_${oi}`;
    loafDome.position.set(ox, 0.47 + 0.13, 0.26);
    g.add(loaf); g.add(loafDome);
}
// stone bench S of the circle (for the devout)
{
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.09, 0.4), stoneTex);
    benchTop.name = "bench";
    benchTop.position.set(0, 0.26, 2.3);
    g.add(benchTop);
    for (const bx of [-0.5, 0.5]) {
        const bleg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.35), stoneTex);
        bleg.name = `bleg_${bx}`;
        bleg.position.set(bx, 0.12, 2.3);
        g.add(bleg);
    }
}

mergeByMaterial(g, "sh3");
writeFileSync("agents/arthur/assets/village_shrine3.glb", toGLB(g));
console.log("village_shrine3.glb —", g.children.length, "nodes");
