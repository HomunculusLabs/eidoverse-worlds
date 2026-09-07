// improve33-decode-windmill.ts — improve-33 ANALYZE decode on the exact
// LOCAL bytes (sha 09938360… == live lib full hash, proven this tick).
// Read-only. Answers arithmetically:
//   F1: gallery torus at y5.2 — nearest tower tier half-width at that band,
//       ring inner radius (1.9 - 0.07), gap = ring-to-tower standoff; count
//       verts in the y[5.0,5.4] band NOT within any tower tier x/z extent.
//   F2: sails — sail plane (cloth) z-extent per arm vs tower front face
//       (twr tier front at +z); shaft/window intersection windows at
//       (0, 4.7) and (0, 5.9) — any sail-group verts inside the window
//       x-band ±0.3 at those y's?
//   F3: rider bands — b10 crown local (0, 2.22, 2.62) r1.125 band and
//       sign anchor local [-1.6, 2.78, 2.5] ± 0.5: vertex counts + extents
//       BEFORE (baseline for the after-differential).
//   Envelope: global min/max vs live census bbox.
import { readFileSync } from "node:fs";

const bytes = readFileSync("agents/arthur/assets/village_windmill3.glb");
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));

if (json.extensionsRequired?.includes("KHR_draco_mesh_compression")) throw new Error("draco");
const nodes = json.nodes ?? [], meshes = json.meshes ?? [], mats = json.materials ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "materials:", mats.map((m: any) => m.name).join(", "));

const accs = json.accessors ?? [], views = json.bufferViews ?? [];
interface V { x: number; y: number; z: number }
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];
const all: V[] = [];

// merged buckets bake node translations (decode pitfall 4): walk node-index
// tree and accumulate world translations per mesh.
function worldTranslations(): Map<number, number[]> {
    const world = new Map<number, number[]>();
    const stack: Array<{ i: number; tx: number[] }> = nodes.map((n: any, i: number) => ({ i, tx: n.translation ?? [0, 0, 0] }));
    // iterative accumulation: each node's world = parent world + own translation (no rotations in merged buckets, but keep any)
    const parentOf = new Map<number, number>();
    nodes.forEach((n: any, i: number) => (n.children ?? []).forEach((c: number) => parentOf.set(c, i)));
    const memo = new Map<number, number[]>();
    const worldOf = (i: number): number[] => {
        if (memo.has(i)) return memo.get(i)!;
        const p = parentOf.get(i);
        const own = nodes[i].translation ?? [0, 0, 0];
        const w = p === undefined ? own : ((pw => [pw[0] + own[0], pw[1] + own[1], pw[2] + own[2]])(worldOf(p)));
        memo.set(i, w); return w;
    };
    nodes.forEach((_, i) => worldOf(i));
    nodes.forEach((n: any, i: number) => { if (n.mesh !== undefined) world.set(i, worldOf(i)); });
    return world;
}
const wtr = worldTranslations();

for (const m of meshes) {
    for (const prim of m.primitives) {
        const posAcc = accs[prim.attributes.POSITION];
        if (!posAcc) continue;
        const bv = views[posAcc.bufferView];
        const base = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + 28 + jsonLen;
        const owner = nodes.find((n: any) => n.mesh === meshes.indexOf(m));
        const t = wtr.get(nodes.indexOf(owner!)) ?? [0, 0, 0];
        for (let i = 0; i < posAcc.count; i++) {
            const o = base + i * 12;
            const v = {
                x: dv.getFloat32(o, true) + t[0],
                y: dv.getFloat32(o + 4, true) + t[1],
                z: dv.getFloat32(o + 8, true) + t[2],
            };
            if (v.x < gMin[0]) gMin[0] = v.x; if (v.y < gMin[1]) gMin[1] = v.y; if (v.z < gMin[2]) gMin[2] = v.z;
            if (v.x > gMax[0]) gMax[0] = v.x; if (v.y > gMax[1]) gMax[1] = v.y; if (v.z > gMax[2]) gMax[2] = v1_safe(v.z);
            all.push(v);
        }
    }
}
function v1_safe(n: number) { return Math.max(gMax[2], n); }

console.log("total verts:", all.length);
console.log("envelope x:", gMin[0].toFixed(3), gMax[0].toFixed(3), " y:", gMin[1].toFixed(3), gMax[1].toFixed(3), " z:", gMin[2].toFixed(3), gMax[2].toFixed(3));

// F1: gallery band y[5.0,5.4]
const gband = all.filter(v => v.y >= 5.0 && v.y <= 5.4);
// tier half-widths: w(s) = 3.2 - s*0.36, tier s spans y [3.1 + s*h_t, 3.1+(s+1)*h_t], h_t=(7.5-3.1)/5=0.88
const h_t = (7.5 - 3.1) / 5;
const tierHalfAt = (y: number) => {
    const s = Math.max(0, Math.min(4, Math.floor((y - 3.1) / h_t)));
    return (3.2 - s * 0.36) / 2;
};
let inTier = 0, outTier = 0, ringR: number[] = [];
for (const v of gband) {
    const h = tierHalfAt(v.y);
    if (Math.abs(v.x) <= h + 1e-6 && Math.abs(v.z) <= h + 1e-6) inTier++;
    else { outTier++; ringR.push(Math.hypot(v.x, v.z)); }
}
console.log("F1 gallery band verts:", gband.length, "in-tier:", inTier, "outside-tier(ring):", outTier);
if (ringR.length) {
    ringR.sort((a, b) => a - b);
    console.log("  ring radius min/median/max:", ringR[0].toFixed(3), ringR[Math.floor(ringR.length / 2)].toFixed(3), ringR[ringR.length - 1].toFixed(3));
    const h = tierHalfAt(5.2);
    console.log("  tier half-width at y5.2:", h.toFixed(3), " ring inner edge ~1.83 — standoff:", (1.83 - h).toFixed(3), "m");
}

// F2: sail plane verts (z >= 1.2) — z-extent and window-band crossings
const sailPlane = all.filter(v => v.z >= 1.2);
console.log("F2 verts z>=1.2 (sail plane):", sailPlane.length, "z max:", Math.max(...sailPlane.map(v => v.z)).toFixed(3));
// tower front face at sail band: tier half at y 4.5..7.9
for (const wy of [4.7, 5.9]) {
    const crossing = sailPlane.filter(v => Math.abs(v.y - wy) <= 0.45 && Math.abs(v.x) <= 0.35);
    console.log(`  window y=${wy}: sail-plane verts in x±0.35 band:`, crossing.length);
}
// tower tier front extent at y band 4.5-7.9 (max tier half)
console.log("  tier front z at y4.7:", (tierHalfAt(4.7)).toFixed(3), " at y5.9:", tierHalfAt(5.9).toFixed(3));

// F3: rider bands — b10 crown center local (0,2.22,2.62) ±1.3 box, sign anchor [-1.6,2.78,2.5] ±0.6
const b10band = all.filter(v => Math.abs(v.x) <= 1.3 && v.y >= 0.9 && v.y <= 3.5 && v.z >= 1.3 && v.z <= 3.9);
const signband = all.filter(v => Math.abs(v.x - (-1.6)) <= 0.6 && v.y >= 2.2 && v.y <= 3.4 && Math.abs(v.z - 2.5) <= 0.6);
console.log("F3 b10 band verts:", b10band.length, " sign band verts:", signband.length);
if (b10band.length) {
    const ys = b10band.map(v => v.y), zs = b10band.map(v => v.z), xs = b10band.map(v => v.x);
    console.log("  b10 band extents x:", Math.min(...xs).toFixed(3), Math.max(...xs).toFixed(3), " y:", Math.min(...ys).toFixed(3), Math.max(...ys).toFixed(3), " z:", Math.min(...zs).toFixed(3), Math.max(...zs).toFixed(3));
}
if (signband.length) {
    const ys = signband.map(v => v.y), zs = signband.map(v => v.z);
    console.log("  sign band extents y:", Math.min(...ys).toFixed(3), Math.max(...ys).toFixed(3), " z:", Math.min(...zs).toFixed(3), Math.max(...zs).toFixed(3));
}

// keep-outs my edits must not enter: rceil front edge (z ~2.6, y ~3.05), window frames at (0,4.7)/(0,5.9)
const rceilBand = all.filter(v => v.z >= 2.45 && v.y >= 2.85 && v.y <= 3.25 && Math.abs(v.x) <= 1.3);
console.log("rceil front band (z2.45+,y2.85-3.25,x±1.3):", rceilBand.length, "verts");
const winBands = [4.7, 5.9].map(wy => all.filter(v => Math.abs(v.y - wy) <= 0.4 && Math.abs(v.x) <= 0.35 && v.z >= 1.0).length);
console.log("window bands (z>=1.0) vert counts y4.7/y5.9:", winBands.join("/"));
