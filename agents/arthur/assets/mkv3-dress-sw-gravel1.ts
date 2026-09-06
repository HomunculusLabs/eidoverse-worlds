// mkv3-dress-sw-gravel1.ts — dress-4, SW CONTEMPLATIVE raked gravel path.
// Concept contract: the SW approach's civic pavers end at the seed ring
// (r71, az 217.25). Where the town's stone gives out, a raked gravel path
// carries the walker through the threshold gap between the temple seeds —
// a PALE tended gravel field with darker grooves (rake lines) that flow
// around dark feature stones (high-contrast karesansui ripple arcs), a
// hand-laid flat-stone kerb, deliberate threshold stones, and a gentle
// centerline bow. Grounds USE: the district's own surface idiom — the
// first act of contemplation is walking on raked ground. Static, unlit —
// spends no lamp budget (SW budget 3, used 0). Local frame: +x = walking
// direction (continues az 217.25 outward), path spans local x ±3.5 with a
// bow of ±0.13m. Ground-film class (h<=0.5), knee-height law clear.
// v5 iteration log: v1 plank+pebbles; v2 tonal inversion (tie); v3 value
// structure fixed, plank silhouette; v4 edge segments too subtle, rim read
// as continuous cut outline. v5: groove floor broken into GAPPED chunks
// (terrain shows through — a raked path is interrupted, a boardwalk is
// continuous), gentle single bow, high-contrast wide ripple arcs, skirt
// varies along length, spill pebbles kept.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

const gravel = texMat("swgravel", [0xd8d2c4, 0xcbc4b4, 0xbfb8a8], { rough: .95, metal: 0, cell: 4, scale: 3 });
const GROOVE = mat(0x9c9282, .95, 0);  // groove floor — warm gray, kept not-black (close-range review)
const FEAT = mat(0x6e6a62, .9, 0);
const FEATCAP = mat(0x94908a, .9, 0);
const KERB = mat(0x8c887e, .95, 0);
const SHADOW = mat(0x4a483f, 1, 0);

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;
// gentle single bow along the length — breaks dead-parallel edges
const bow = (x: number) => 0.13 * Math.sin(((x + 3.5) / 7) * Math.PI);

const flat = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material, fy = 0.35) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), m);
    s.scale.set(1 + jit(seed) * 0.3, fy + jit(seed + 5) * 0.08, 0.85 + jit(seed + 9) * 0.25);
    s.rotation.set(jit(seed + 13) * 0.2, jit(seed + 17) * 3.14, jit(seed + 23) * 0.15);
    s.position.set(x, y, z + bow(x));
    g.add(s);
};

// contact-shadow skirt: varies along length — wide at floor-chunk centers,
// nearly vanishing in the gaps (reads as cast shadow, not painted border)
for (let i = 0; i < 7; i++) {
    const x = -3.06 + i * 1.02;
    const sk = new THREE.Mesh(new THREE.BoxGeometry(0.72 + jit(50 + i) * 0.2, 0.012, 2.2 + Math.abs(jit(60 + i)) * 0.4), SHADOW);
    sk.position.set(x + jit(65 + i) * 0.1, 0.006, bow(x) + jit(70 + i) * 0.1);
    g.add(sk);
}

// groove floor: GAPPED chunks — terrain shows through the gaps; widths
// vary per chunk (1.6–2.0), widest near the large stone's station
const chunks: Array<{ x: number, len: number, w: number }> = [];
{
    const xs = [-3.42, -2.18, -0.72, 0.32, 1.38, 2.44, 3.30];
    const lens = [0.94, 1.06, 0.86, 0.94, 0.86, 0.72, 0.34];
    const ws = [1.66, 1.78, 1.92, 2.00, 1.86, 1.74, 1.62];
    for (let i = 0; i < xs.length; i++) chunks.push({ x: xs[i] + lens[i] / 2, len: lens[i], w: ws[i] + jit(80 + i) * 0.08 });
}
for (const c of chunks) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(c.len, 0.04, c.w), GROOVE);
    slab.position.set(c.x, 0.024, bow(c.x) + jit(85 + c.x) * 0.04);
    g.add(slab);
}

// feature stones — hierarchy: large (ripples, TALL — the anchor silhouette),
// medium (one arc), small; light caps give volume
const feats = [
    { x: 0.55, z: -0.18, r: 0.36, seed: 57, tall: true },
    { x: -1.9, z: 0.16, stoneR: 0.28, r: 0.28, seed: 41 },
    { x: 1.9, z: 0.02, r: 0.20, seed: 73 }, // moved off the 2.24..2.44 floor gap (top-view flag)
];
for (const f of feats) {
    const fy = f.tall ? 0.62 : 0.38;
    flat(f.r, f.x, f.r * 0.32, f.z, f.seed, FEAT, fy);
    flat(f.r * 0.55, f.x + jit(f.seed + 2) * 0.06, f.r * 0.32 + f.r * (f.tall ? 0.55 : 0.22), f.z + jit(f.tall ? 0.4 : (f.seed + 4)) * 0.05, f.seed + 9, FEATCAP, 0.3);
}

// karesansui ripple arcs — REAL RELIEF (v6): extruded curved ridges
// (squashed torus segments, tallest near the stone, decaying outward) that
// catch grazing light; flat dark GROOVE shadow bands between them.
const ringRidge = (cx: number, cz: number, rMid: number, tube: number, hgt: number, seed: number) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(rMid, tube, 8, 24, 4.2), gravel as unknown as THREE.Material);
    t.rotation.set(-Math.PI / 2, 0, jit(seed) * 6.28);
    t.scale.set(1, 1, hgt / tube); // squash vertically to hgt
    t.position.set(cx, 0.05 + hgt / 2, cz + bow(cx));
    g.add(t);
};
ringRidge(feats[0].x, feats[0].z, 0.58, 0.075, 0.052, 911);
ringRidge(feats[0].x, feats[0].z, 0.80, 0.070, 0.040, 913);
ringRidge(feats[1].x, feats[1].z, 0.47, 0.065, 0.036, 917);
const shadowBand = (cx: number, cz: number, r0: number, w: number, seed: number) => {
    const a = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + w, 24, 1, jit(seed) * 6.28, 4.0), GROOVE);
    a.rotation.x = -Math.PI / 2;
    a.position.set(cx, 0.064, cz + bow(cx));
    g.add(a);
};
shadowBand(feats[0].x, feats[0].z, 0.66, 0.13, 901);


// rake ridges: FIVE pale chunky bars are the walking surface; follow the
// bow; segmented around feature stones and arc zones
{
    const bw = 0.26; // grooves ~0.10 = 38% of ridge width (rake ratio fix)
    for (let k = 0; k < 5; k++) {
        const z0 = -0.72 + 0.36 * k + jit(200 + k) * 0.015;
        // sample the bar in bow-following sub-segments (0.7m) so it curves
        for (let xs = -3.42; xs < 3.42; xs += 0.7) {
            const x0 = xs, x1 = Math.min(xs + 0.74, 3.42);
            const xm = (x0 + x1) / 2;
            const z = z0 + bow(xm);
            const cuts: Array<[number, number]> = [];
            for (const f of feats) {
                if (Math.abs(z0 - f.z) < f.r * 0.9 + 0.16) cuts.push([f.x - f.r - 0.24, f.x + f.r + 0.24]);
            }
            if (Math.abs(z0 - feats[0].z) < 1.05) cuts.push([feats[0].x - 1.07, feats[0].x + 1.07]);
            if (Math.abs(z0 - feats[1].z) < 0.58) cuts.push([feats[1].x - 0.60, feats[1].x + 0.60]);
            let covered = false;
            for (const [c0, c1] of cuts) if (xm > c0 && xm < c1) covered = true;
            if (covered) continue;
            // honor floor-chunk gaps: ridge only where a floor chunk underlies
            const onFloor = chunks.some(c => Math.abs(xm - c.x) < c.len / 2 + 0.18 && Math.abs(z - bow(c.x)) < c.w / 2);
            if (!onFloor) continue;
            const bar = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 0.04, 0.045, bw), gravel);
            bar.position.set(xm, 0.062, z);
            g.add(bar);
        }
    }
}

// threshold stones: two deliberate paired caps per end
for (const side of [-1, 1]) {
    flat(0.34, side * 3.28, 0.075, -0.42, 100 + side, KERB, 0.24);
    flat(0.30, side * 3.28, 0.07, 0.38, 104 + side, KERB, 0.24);
}

// kerb: flat stones on the path edge, ~0.8m rhythm with gaps
for (let i = 0; i < 8; i++) {
    const x = -2.8 + i * 0.8 + jit(300 + i) * 0.18;
    for (const side of [-1, 1]) {
        if (jit(340 + i * 7 + side) > 0.28) continue;
        // nearest chunk's half-width (approx via interpolation of ws)
        const near = chunks.reduce((best, c) => Math.abs(c.x - x) < Math.abs(best.x - x) ? c : best, chunks[0]);
        flat(0.23 + jit(360 + i * 3 + side) * 0.05, x, 0.05, side * (near.w / 2 - 0.13 + jit(380 + i) * 0.05), 500 + i * 11 + side, KERB, 0.26);
    }
}

// gravel spill: pale pebbles escaping the broken edges
for (let i = 0; i < 12; i++) {
    const side = jit(750 + i * 3) > 0 ? 1 : -1;
    const near = chunks[Math.floor(((jit(760 + i * 5) + 0.5) * chunks.length)) % chunks.length];
    flat(0.08 + jit(770 + i) * 0.05, jit(780 + i * 7) * 6.4, 0.03, side * (near.w / 2 + 0.12 + Math.abs(jit(790 + i)) * 0.22), 950 + i * 13, gravel as unknown as THREE.MeshStandardMaterial, 0.4);
}

// unraked far end: tended section gives out where the grounds take over
for (let i = 0; i < 8; i++) {
    const x = 2.6 + jit(600 + i * 13) * 0.65;
    const z = jit(640 + i * 7) * 1.1;
    flat(0.09 + jit(660 + i) * 0.04, x, 0.055, z, 700 + i * 17, FEAT, 0.4);
}

mergeByMaterial(g, "dress_sw_gravel1");
writeFileSync("agents/arthur/assets/village_dress_sw_gravel1.glb", toGLB(g));
console.log("village_dress_sw_gravel1.glb —", g.children.length, "nodes");
