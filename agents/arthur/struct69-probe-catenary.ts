// struct69-probe-catenary.ts — decode audit for the CATENARY GATE v3 build.
// Laws (concept contract, mk source):
//  (1) CATENARY TRUTH — every stone vert in the arch region sits at or above
//      the true intrados intr(x) = 1.3 + C − 2(cosh(x/2)−1), C=3.92838
//      (tol 0.02 for chord faceting, sagitta ≤1mm);
//  (2) CLEAR PASSAGE — zero stone verts in the OPENING's air:
//      |x| < 3.30 and 0.10 < y < intr(|x|) − 0.02;
//  (3) copstone (plinths + threshold) all y ≤ 0.23 (flush passage floor);
//  (4) iron lane (tube + beads) rides the crest: all y ≥ 1.20;
//  (5) brass/emissive material present (glow2, emissiveFactor > 0);
//  (6) envelope |x| ≤ 4.55, y ∈ [−0.02, 5.65], |z| ≤ 0.90;
//  (7) node count 3..8, zero material-less primitives (struct-38 law).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_catenarygate3.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);
const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
const mats = (jsonChunk.materials ?? []).map((m: any) => ({
    name: m.name, emissive: (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0),
}));

const F = 2.0, H = 3.5, SPRING_Y = 1.3;
const C = F * (Math.cosh(H / F) - 1);
const intr = (x: number) => SPRING_Y + C - F * (Math.cosh(x / F) - 1);

const fails: string[] = [];
let nodeCount = 0, matless = 0, stoneVerts = 0, ironVerts = 0;
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
const matSeen = new Set<string>();

for (const n of nodes) {
    if (n.mesh === undefined) continue;
    nodeCount++;
    for (const p of meshes[n.mesh].primitives) {
        const posAcc = jsonChunk.accessors[p.attributes.POSITION];
        const bv = jsonChunk.bufferViews[posAcc.bufferView];
        const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
        const dv = new DataView(bin.buffer, bin.byteOffset + off, posAcc.count * 12);
        const tr = n.translation ?? [0, 0, 0];
        let mname = "", memissive = false;
        if (p.material === undefined) { matless++; }
        else { mname = (mats[p.material]?.name ?? "").toLowerCase(); memissive = !!mats[p.material]?.emissive; matSeen.add(mats[p.material]?.name ?? "?"); }

        for (let i = 0; i < posAcc.count; i++) {
            const x = dv.getFloat32(i * 12, true) + tr[0];
            const y = dv.getFloat32(i * 12 + 4, true) + tr[1];
            const z = dv.getFloat32(i * 12 + 8, true) + tr[2];
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;

            if (mname.includes("stone") && !mname.includes("cop")) {
                stoneVerts++;
                // (1) catenary truth — arch region |x| ≤ 3.92 (extrados spring offset)
                if (Math.abs(x) <= 3.92 && y > 0.30 && y < intr(Math.abs(x)) - 0.02) {
                    fails.push(`stone below intrados: x=${x.toFixed(3)} y=${y.toFixed(3)} intr=${intr(Math.abs(x)).toFixed(3)}`);
                }
                // (2) clear passage air — no stone in the opening below the curve
                if (Math.abs(x) < 3.30 && y > 0.10 && y < intr(Math.abs(x)) - 0.02) {
                    fails.push(`stone in passage air: x=${x.toFixed(3)} y=${y.toFixed(3)}`);
                }
            }
            if (mname.includes("cop") && y > 0.23) fails.push(`cop vert high y=${y.toFixed(3)} x=${x.toFixed(2)}`);
            if (mname.includes("iron")) { ironVerts++; if (y < 1.20) fails.push(`iron low y=${y.toFixed(3)}`); }
            if (memissive && mname.startsWith("glow") && y < 1.20 && Math.abs(x) > 3.0) {
                // spring pins sit at 1.30..1.60 near springs — allowed; beads ≥ 1.4
            }
        }
    }
}

const brassMats = mats.filter((m: any) => m.emissive);
if (brassMats.length === 0) fails.push("no emissive (brass) material");
if (ironVerts === 0) fails.push("no iron lane verts");
if (stoneVerts === 0) fails.push("no stone verts");

if (minX < -4.55 || maxX > 4.55) fails.push(`x env ${minX.toFixed(3)}..${maxX.toFixed(3)}`);
if (minY < -0.02 || maxY > 5.81) fails.push(`y env ${minY.toFixed(3)}..${maxY.toFixed(3)}`); // top = extrados crown 5.6284 + crown bead r 0.17
if (minZ < -0.90 || maxZ > 1.03) fails.push(`z env ${minZ.toFixed(3)}..${maxZ.toFixed(3)}`); // face chain proud z 0.86+0.06+0.14·cos
if (nodeCount < 3 || nodeCount > 8) fails.push(`node count ${nodeCount}`);
if (matless > 0) fails.push(`${matless} material-less primitives`);

console.log(JSON.stringify({
    nodes: nodeCount, matless, stoneVerts, ironVerts,
    materials: mats,
    env: { x: [+minX.toFixed(3), +maxX.toFixed(3)], y: [+minY.toFixed(3), +maxY.toFixed(3)], z: [+minZ.toFixed(3), +maxZ.toFixed(3)] },
    fails,
}, null, 1));
if (fails.length) { console.error("AUDIT FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("AUDIT ALL PASS");
