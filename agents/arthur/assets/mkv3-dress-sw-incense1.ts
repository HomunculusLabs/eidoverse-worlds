// mkv3-dress-sw-incense1.ts — dress-79, SW CONTEMPLATIVE incense stand (round-3
// item 15). Concept contract: on the az-232.725 SW corridor at r80, OPPOSITE
// side of the walking line from the dress-8 prayer stones (which sit +2.5 on
// the n1 side at r83), a cast-iron tripod censer stand with an ember-filled
// bowl and a pale ash ring at its foot. Extends the devotional line: raked
// gravel (dress-4, r~75) -> incense censer (r80, this) -> prayer stones
// (dress-8, r83) -> labyrinth (r98). Walkers pass BETWEEN censer and mound —
// the pair frames the line. Distinct from every other dressing: nothing else
// in the village burns. Iron family (0x4a4a50 anvilpad precedent), pale ASH
// ring = the lane's worked-pale distance tell (stile caps / prayer crown /
// sawn post-tops), warm EMBER beads = the heat cue (anvilpad hot-iron
// 0x9a4a18@0.65 emissive lane — MESH ember, no light entity, no lamp budget
// draw; dress-76 night mesh-ember precedent). Static, unlit.
// Site: (−46.69, −65.00) yaw −52.75° (local +z faces the walking line).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

// material families (standing families + the lane's proven values)
const IRON = mat(0x4a4a50, 0.5, 0.15);    // tripod legs / feet / crown / bowl
const IRON_LT = mat(0x5f5f68, 0.5, 0.15); // bowl rim band (anvilpad barrel idiom)
const SCORCH = mat(0x34322d, 0.98, 0);    // ground scorch plate (anvilpad forge stain)
const ASH = mat(0xd8d2c4, 0.95, 0);       // pale ash ring / clumps / stub tips
const STUB = mat(0x3a352c, 0.95, 0);      // burnt incense sticks
const EMBER = mat(0x6b3212, 0.8, 0);      // ember beads (emissive set below)
(EMBER as any).emissive = new THREE.Color(0x9a4a18);
(EMBER as any).emissiveIntensity = 0.62;

// deterministic jitter (splitmix-style trig hash, no Math.random)
const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// ---- cast-iron tripod: 3 tapered legs, ball feet, crown ring ----
// (v2: legs + feet thickened for the 18m silhouette — v1's 0.028-0.042 legs
// read 2px and the judge called legibility marginal)
// legs lean out ~18deg: foot r 0.40 -> top r 0.07, meeting at y ~1.00
const legTopR = 0.07, footR = 0.40, topY = 1.00, footY = 0.06;
for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4 + jit(11 + i * 7) * 0.18;
    const bot = new THREE.Vector3(Math.cos(a) * footR, footY, Math.sin(a) * footR);
    const top = new THREE.Vector3(Math.cos(a + jit(17 + i) * 0.12) * legTopR, topY, Math.sin(a + jit(17 + i) * 0.12) * legTopR);
    const mid = bot.clone().add(top).multiplyScalar(0.5);
    const len = bot.distanceTo(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.050, len, 8), IRON);
    leg.position.copy(mid);
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(bot).normalize());
    g.add(leg);
    // cast ball foot
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), IRON);
    foot.position.set(bot.x, 0.055 + jit(23 + i) * 0.01, bot.z);
    g.add(foot);
}
// crown ring where the legs meet
{
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 16), IRON);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = topY;
    g.add(crown);
}

// ---- fire bowl: shallow wide dish seated on the crown, ember heap above rim ----
// (v2: the burning read must be GEOMETRY, not intensity — at 18m the eye looks
// down only ~1.5deg, so a shallow bowl's interior is rim-occluded from any
// walkable vantage; the ember mass now rises ABOVE the rim as a heaped coal
// bed, and 4 bright beads sit proud of the heap — visible from every angle)
{
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.17, 0.17, 18), IRON);
    bowl.position.y = topY + 0.095;
    g.add(bowl);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.02, 8, 20), IRON_LT);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = topY + 0.175;
    g.add(rim);
    // heaped coal bed: squashed sphere cresting ~0.09 above the rim
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), EMBER);
    heap.scale.set(1, 0.42, 0.92);
    heap.position.y = topY + 0.155;
    g.add(heap);
    // bright ember beads proud of the heap (the "live coal" points)
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.9 + jit(31 + i * 5) * 0.5;
        const rr = 0.10 + jit(37 + i * 5) * 0.10;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.042 + jit(41 + i) * 0.018, 8, 6), EMBER);
        bead.position.set(Math.cos(a) * rr, topY + 0.235 + jit(43 + i) * 0.02, Math.sin(a) * rr);
        g.add(bead);
    }
}

// ---- ground: scorch plate + pale ash ring + clumps breaking it ----
{
    const scorch = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.65, 0.012, 20), SCORCH);
    scorch.position.set(jit(51) * 0.06, 0.006, jit(53) * 0.06);
    g.add(scorch);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.50, 0.76, 40, 1), ASH);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(jit(51) * 0.06, 0.014, jit(53) * 0.06);
    g.add(ring);
    // ash clumps scattered on/breaking the ring (no perfect-circle read)
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + jit(61 + i * 3) * 0.8;
        const rr = 0.5 + jit(67 + i * 3) * 0.24;
        const clump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035 + jit(71 + i) * 0.02, 1), ASH);
        clump.scale.y = 0.5;
        clump.position.set(Math.cos(a) * rr, 0.02, Math.sin(a) * rr);
        clump.rotation.set(jit(73 + i) * 0.4, jit(77 + i) * 3.1, jit(79 + i) * 0.3);
        g.add(clump);
    }
}

// ---- burnt incense stubs standing in the ash, pale stopped-burning tips ----
for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 1.7 + jit(83 + i * 5) * 0.55;
    const rr = 0.53 + jit(89 + i * 5) * 0.15;
    const h = 0.13 + jit(97 + i) * 0.09;
    const r = 0.013 + jit(101 + i) * 0.004;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 6), STUB);
    stub.position.set(x, h / 2 + 0.01, z);
    stub.rotation.set(jit(103 + i) * 0.14, 0, jit(107 + i) * 0.14);
    g.add(stub);
    // pale ash tip — where the stick stopped burning
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.02, 6), ASH);
    tip.position.set(x + jit(109 + i) * 0.01, h + 0.018, z + jit(111 + i) * 0.01);
    tip.rotation.set(jit(103 + i) * 0.14, 0, jit(107 + i) * 0.14);
    g.add(tip);
}

mergeByMaterial(g, "dress_sw_incense1");
writeFileSync("agents/arthur/assets/village_dress_sw_incense1.glb", toGLB(g));
console.log("village_dress_sw_incense1.glb —", g.children.length, "top-level nodes");
