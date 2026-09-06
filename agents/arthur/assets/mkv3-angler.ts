// mkv3-angler.ts — STRUCTURES LANE struct-13: U-3 THE ANGLER'S REST.
// A place to sit at the water: a timber lookout cantilevered off the Reed
// Pool's west bank — deck on two dark posts planted in the bank, a bench
// running along the landward side, and a chain-sag rail (catenary curves
// between three posts) enclosing the water side, the Reed Pool's ripple
// language in brass. Small scale: furniture-solid (correct — sit, don't
// walk through).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-38 family law (struct-46): plain mat() exports NO glTF material ->
// loader-default metal-1 near-black in-game (angler_1/angler_3 buckets carry
// rod/chain/reel/line/bobber — the whole identity anchor). Textured lanes:
// dark -> angler_iron (hypar_iron tones), brass -> emissive brass (glow
// survives export; bobber = quiet night water-marker, struct-33 lineage).
const dark = texMat("angler_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1] });
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.55;

// Deck: 3.4 x 2.0, top at 0.55 (sit height above grade), planks along X,
// cantilevered to -Z (toward water when placed on the pool's west bank,
// local -Z faces the pool).
{
    const planks = 10;
    for (let i = 0; i < planks; i++) {
        const z = -1.0 + (2.0 * (i + 0.5)) / planks;
        const p = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 2.0 / planks * 0.85), timberTex);
        p.name = `plank_${i}`;
        p.position.set(0, 0.55, z);
        g.add(p);
    }
    // two bearers + stone footings at the landward edge (z=+0.8)
    for (const sx of [-1.2, 1.2]) {
        const bearer = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 2.2), timberTex);
        bearer.name = `bearer_${sx < 0 ? "w" : "e"}`;
        bearer.position.set(sx, 0.44, 0);
        g.add(bearer);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 8), dark);
        post.name = `post_${sx < 0 ? "w" : "e"}`;
        post.position.set(sx, 0.25, 0.8);
        g.add(post);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.5), stoneTex);
        foot.name = `foot_${sx < 0 ? "w" : "e"}`;
        foot.position.set(sx, 0.11, 0.8);
        g.add(foot);
    }
}

// Bench along the landward side (seat 0.45, back 0.75)
{
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.42), timberTex);
    seat.name = "bench_seat";
    seat.position.set(0, 1.0, 0.75);
    g.add(seat);
    for (const sx of [-1.15, 0, 1.15]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.36), dark);
        leg.name = `bleg_${sx}`;
        leg.position.set(sx, 0.775, 0.75);
        g.add(leg);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.34, 0.07), timberTex);
    back.name = "bench_back";
    back.position.set(0, 1.28, 0.94);
    g.add(back);
}

// RAIL on the water side (local z=-1.0): three posts, a sagging timber
// HANDRAIL (the 18m-readable line — struct-36 scale-class fix), the brass
// chain hanging beneath it (the ripple language, near-view reward), and the
// rod at rest leaning on the E post with its line out over the water.
{
    const RAIL_Z = -0.92, RAIL_Y = 1.48;
    for (const px of [-1.6, 0, 1.6]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.98, 8), dark);
        post.name = `rpost_${px}`;
        post.position.set(px, 1.04, RAIL_Z);
        g.add(post);
        const fin = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), brass);
        fin.name = `rfin_${px}`;
        fin.position.set(px, 1.56, RAIL_Z);
        g.add(fin);
    }
    // two catenary spans (each 8 segments, sag 0.16): handrail + chain
    const N = 8;
    for (let span = 0; span < 2; span++) {
        const x0 = -1.6 + span * 1.6, x1 = x0 + 1.6;
        for (let i = 0; i < N; i++) {
            const t0 = i / N, t1 = (i + 1) / N;
            const sag = (t: number) => 4 * 0.16 * t * (1 - t); // parabola approx
            const xa = x0 + 1.6 * t0, xb = x0 + 1.6 * t1;
            const ya = RAIL_Y - sag(t0), yb = RAIL_Y - sag(t1);
            const len = Math.hypot(xb - xa, yb - ya) * 1.05;
            const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.055, 0.075), timberTex);
            rail.name = `hrail_${span}_${i}`;
            rail.position.set((xa + xb) / 2, (ya + yb) / 2, RAIL_Z);
            rail.rotation.z = -Math.atan2(yb - ya, xb - xa);
            g.add(rail);
            const seg = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.03), brass);
            seg.name = `chain_${span}_${i}`;
            seg.position.set((xa + xb) / 2, (ya + yb) / 2 - 0.16, RAIL_Z);
            seg.rotation.z = -Math.atan2(yb - ya, xb - xa);
            g.add(seg);
        }
    }
}

// THE ROD AT REST (struct-36 identity anchor): leaned against the E rail
// post, tip up over the water side, tight line slanting down to a brass
// bobber beyond the deck edge. The angler sits; the rod fishes.
{
    const butt = new THREE.Vector3(1.18, 0.59, -0.76);
    const tip = new THREE.Vector3(1.93, 2.78, -1.02);
    const dir = tip.clone().sub(butt);
    const rodLen = dir.length();
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.042, rodLen, 8), dark);
    rod.name = "fishing_rod";
    rod.position.copy(butt.clone().add(tip).multiplyScalar(0.5));
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(rod);
    // reel seat: brass ring around the rod near the butt
    const reel = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 6, 12), brass);
    reel.name = "rod_reel";
    reel.position.copy(butt.clone().addScaledVector(dir.clone().normalize(), 0.42));
    reel.quaternion.copy(rod.quaternion);
    g.add(reel);
    // tight line: tip -> bobber floating ON the Reed Pool water (struct-46:
    // sibling draft's (2.6,0.28,-1.9) landed on the BANK 1.6m short of the
    // water — judge was live-true). Target angler-local (2.8,0.14,-4.92) =
    // pool-local (2.8,1.6): normalized water radius 0.82, 0.6m east of the
    // bridge deck edge (x 2.2), >=0.75m from reeds, 0.78m from rim stones;
    // bobber center at the water disc top (angler-local y 0.144 == world
    // 0.096 == pool -0.044+0.14) = half-submerged float. Night: quiet brass
    // dot on dark water (emissive 0.55).
    const bob = new THREE.Vector3(2.8, 0.144, -4.92);
    const ldir = bob.clone().sub(tip);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, ldir.length(), 6), brass);
    line.name = "rod_line";
    line.position.copy(tip.clone().add(bob).multiplyScalar(0.5));
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ldir.clone().normalize());
    g.add(line);
    const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), brass);
    bobber.name = "rod_bobber";
    bobber.position.copy(bob);
    g.add(bobber);
}

const merged = mergeByMaterial(g, "angler");
writeFileSync("agents/arthur/assets/village_angler3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_angler3.glb");
