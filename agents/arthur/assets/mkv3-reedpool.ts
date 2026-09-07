// mkv3-reedpool.ts — STRUCTURES LANE struct-6: S-5 REED POOL & BRIDGE.
// The fieldpond commission, reborn where the fieldpond cannot be (old-world
// entity; commons-next has no pond). One idea: still water, crossed. A
// 9x6m pool (canon WATER flat family, stone rim), reed clusters on the
// banks, and a flat timber crossing at threshold height (0.22 — the proven
// standable ground-layer/stoop pattern, NOT an arc ramp) whose balustrade
// posts carry a ripple-height wave along the span: the water's rhythm
// lifted into the rail. Bridge is walkable both ways by construction.
// Collider honesty: bbox ~11x9 = 99m2 >= 16, height ~1.1 < 2.2 -> solid
// furniture box... NO: height under 2.2 gives a SOLID box which would block
// the crossing! Split law: total height 1.15 < room gate -> whole-entity
// solid collider. To stay walkable the composition must either exceed both
// room gates (>=16m2 AND >=2.2m) or stay a thin ground layer (<=0.5 tall).
// Resolution: raise the language — two reed-mast clusters at each bridge
// end rise to 2.5m (masts with brass tips, like mooring posts), pushing
// the bbox height to 2.5 >= 2.2 with the same 99m2 footprint -> honest
// trimesh, real gaps preserved, deck planks walkable.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
// struct-81 (survey-40 void-read cure): plain mats export COLOR_0-only
// (glbwrite texMat/emissive lanes only — struct-38/55/56 class; decode
// proved meshes 0/3/4/5 material:None). Water gets the screwwell idiom
// (canon hue + faint same-hue emissive — polish-271/281 lineage, void-read
// cure validated on fountain/cistern/screwwell); brass tips get the
// catenary/moongate amber accent (0x9a6a28@0.75). Reeds PASSed native.
const water = mat(0x506a78, 0.25, 0.5);        // canon WATER — calm, but real
(water as any).emissive = new THREE.Color(0x2e4a58);
(water as any).emissiveIntensity = 0.45;
const reedMat = mat(0x5c7648, 0.95, 0);        // CANOPY_DK
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.75;

// POOL: water disc sunk to grade, stone rim (x-scaled oval 9x6)
{
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.16, 28), water);
    pool.name = "pool";
    pool.scale.set(4.5, 1, 3.0);
    pool.position.y = 0.06;
    g.add(pool);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.14, 6, 36), stoneTex);
    rim.name = "rim";
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(4.55, 3.05, 1);
    rim.position.y = 0.14;
    g.add(rim);
}

// BRIDGE: flat timber deck at 0.22 (threshold height) crossing the pool's
// narrow (z) axis: span 7 along z, deck 1.9 wide. Stone sills both ends.
{
    const DECK = 7.0;
    const planks = 12;
    for (let i = 0; i < planks; i++) {
        const z = -DECK / 2 + (DECK * (i + 0.5)) / planks;
        const plank = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.09, DECK / planks * 0.86), timberTex);
        plank.name = `plank_${i}`;
        plank.position.set(0, 0.22, z);
        g.add(plank);
    }
    // two bearers under the deck + stone sills at the banks
    for (const sx of [-0.7, 0.7]) {
        const bearer = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, DECK), timberTex);
        bearer.name = `bearer_${sx < 0 ? "w" : "e"}`;
        bearer.position.set(sx, 0.12, 0);
        g.add(bearer);
    }
    for (const sz of [-1, 1]) {
        const sill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.7), stoneTex);
        sill.name = `sill_${sz < 0 ? "n" : "s"}`;
        sill.position.set(0, 0.11, sz * (DECK / 2 + 0.15));
        g.add(sill);
    }
}

// RIPPLE BALUSTRADE: posts along both deck edges whose heights follow a
// single sine wave along the span (one ripple, calm) + rail segments
// following the wave. 9 posts per side.
{
    const N = 9, SPAN = 6.4;
    for (const sx of [-0.88, 0.88]) {
        const baseH = 0.78, amp = 0.22;
        for (let i = 0; i < N; i++) {
            const t = (i + 0.5) / N;
            const z = -SPAN / 2 + SPAN * t;
            const h = baseH + amp * Math.sin(t * Math.PI * 2);
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), timberTex);
            post.name = `bpost_${sx < 0 ? "w" : "e"}${i}`;
            post.position.set(sx, 0.26 + h / 2, z);
            g.add(post);
        }
        // rail: 8 chord segments joining post tops (the wave, drawn)
        for (let i = 0; i < N - 1; i++) {
            const t0 = (i + 0.5) / N, t1 = (i + 1.5) / N;
            const z0 = -SPAN / 2 + SPAN * t0, z1 = -SPAN / 2 + SPAN * t1;
            const h0 = baseH + amp * Math.sin(t0 * Math.PI * 2), h1 = baseH + amp * Math.sin(t1 * Math.PI * 2);
            const y0 = 0.26 + h0, y1 = 0.26 + h1;
            const len = Math.hypot(z1 - z0, y1 - y0);
            const seg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len), timberTex);
            seg.name = `rail_${sx < 0 ? "w" : "e"}${i}`;
            seg.position.set(sx, (y0 + y1) / 2, (z0 + z1) / 2);
            seg.rotation.x = Math.atan2(y1 - y0, z1 - z0);
            g.add(seg);
        }
    }
}

// REEDS: clusters of thin rods on the banks (west and east edges of the
// oval), heights in a narrow band — vertical rhythm, life-stays-flat
{
    let ri = 0;
    const cluster = (cx: number, cz: number, n: number, spread: number) => {
        for (let k = 0; k < n; k++) {
            const h = 1.1 + 0.7 * Math.abs(Math.sin(ri * 2.399)); // golden-angle jitter
            const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, h, 5), reedMat);
            reed.name = `reed_${ri++}`;
            reed.position.set(cx + Math.cos(ri * 2.399) * spread, h / 2, cz + Math.sin(ri * 2.399) * spread * 0.6);
            g.add(reed);
        }
    };
    cluster(-4.1, -1.6, 7, 0.55);
    cluster(4.1, 1.4, 7, 0.55);
    cluster(-3.4, 2.4, 4, 0.4);
    cluster(3.5, -2.3, 4, 0.4);
}

// MOORING MASTS: at each bridge end, a dark mast to 2.5m with brass tip —
// pushes the bbox honestly over the 2.2 trimesh line (and reads as the
// folly's vertical accent)
for (const sz of [-1, 1]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.5, 8), mat(C.DARK, 0.95, 0));
    mast.name = `mast_${sz < 0 ? "n" : "s"}`;
    mast.position.set(1.25, 1.25, sz * (3.5 + 0.3));
    g.add(mast);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), brass);
    tip.name = `mtip_${sz < 0 ? "n" : "s"}`;
    tip.position.set(1.25, 2.56, sz * 3.8);
    g.add(tip);
}

const merged = mergeByMaterial(g, "reedpool");
writeFileSync("agents/arthur/assets/village_reedpool3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_reedpool3.glb");
