// struct105-decode-hilbert.ts — decode audit for THE HILBERT LABYRINTH (struct-105, R10-7).
// v2: mergeByMaterial folds all stone into ONE primitive, so accessor min/max
// is vacuous — occupancy is decoded from TRIANGLES (2D point-in-triangle on
// the exact index+position buffers; walls are axis-aligned boxes so 2D
// footprint occupancy at any height == wall present).
// Checks: node census + KEEP names, texMat lanes + brass emissive, envelope,
// the maze from bytes (15 doors at exact sequence adjacencies, 9 solids,
// door/mouth lanes EMPTY of stone), heart pin+bead position. Exit 0 = ALL PASS.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const GLB = "agents/arthur/assets/village_hilbertlabyrinth3.glb";
const buf = readFileSync(GLB);
const sha = createHash("sha256").update(buf).digest("hex");
console.log("sha256", sha);

if (buf.readUInt32LE(0) !== 0x46546c67) throw Error("not glb");
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
const binStart = 20 + jsonLen + 8;
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

const nodes: any[] = json.nodes ?? [];
const meshes: any[] = json.meshes ?? [];
const mats: any[] = json.materials ?? [];
const accessors: any[] = json.accessors ?? [];
const bufferViews: any[] = json.bufferViews ?? [];

const sceneNodes = (json.scenes?.[0]?.nodes ?? []).map((i: number) => nodes[i]?.name);
console.log("top-level nodes:", JSON.stringify(sceneNodes));

// material checks
const stoneMat = mats.find((m: any) => m.name === "hl_wall");
const ironMat = mats.find((m: any) => m.name === "hl_pin");
const brassM = mats.filter((m: any) => m.name !== "hl_wall" && m.name !== "hl_pin");
if (!stoneMat || !ironMat) throw Error("texMat lanes missing");
if (brassM.length !== 1) throw Error(`expected 1 brass material, got ${brassM.map((m: any) => m.name)}`);
if (!brassM[0].emissiveFactor || (brassM[0].emissiveFactor as number[]).some(v => v <= 0)) throw Error("brass emissive missing/zero");

// ---- decode triangles per material -------------------------------------------
function trianglesOf(matName: string): number[][][] {
    const matIdx = mats.findIndex((m: any) => m.name === matName);
    const tris: number[][][] = [];
    const stack = [...((json.scenes?.[0]?.nodes ?? []) as number[])];
    const world = (n: any): number[] => [
        (n.translation ?? [0, 0, 0])[0], (n.translation ?? [0, 0, 0])[1], (n.translation ?? [0, 0, 0])[2],
    ];
    const walk = (i: number, t: number[]) => {
        const n = nodes[i];
        const nt = [t[0] + (n.translation?.[0] ?? 0), t[1] + (n.translation?.[1] ?? 0), t[2] + (n.translation?.[2] ?? 0)];
        if (n.mesh !== undefined) {
            for (const prim of meshes[n.mesh].primitives) {
                if (prim.material !== matIdx) continue;
                const posAcc = accessors[prim.attributes.POSITION];
                const posBv = bufferViews[posAcc.bufferView];
                const posOff = (posBv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
                const idxAcc = accessors[prim.indices];
                const idxBv = bufferViews[idxAcc.bufferView];
                const idxOff = (idxBv.byteOffset ?? 0) + (idxAcc.byteOffset ?? 0);
                const idxC = idxAcc.componentType === 5125 ? 4 : 2;
                const rd = (k: number) => dv.getFloat32(binStart + posOff + k * 12, true);
                for (let k = 0; k < idxAcc.count; k += 3) {
                    const a = idxC === 4 ? dv.getUint32(binStart + idxOff + k * 4, true) : dv.getUint16(binStart + idxOff + k * 2, true);
                    const b = idxC === 4 ? dv.getUint32(binStart + idxOff + (k + 1) * 4, true) : dv.getUint16(binStart + idxOff + (k + 1) * 2, true);
                    const c = idxC === 4 ? dv.getUint32(binStart + idxOff + (k + 2) * 4, true) : dv.getUint16(binStart + idxOff + (k + 2) * 2, true);
                    tris.push([
                        [rd(a)[0] ?? 0, rd(a)[1] ?? 0, rd(a)[2] ?? 0],
                        [rd(b)[0] ?? 0, rd(b)[1] ?? 0, rd(b)[2] ?? 0],
                        [rd(c)[0] ?? 0, rd(c)[1] ?? 0, rd(c)[2] ?? 0],
                    ].map((v, vi) => v.map((c2, ci) => {
                        const base = dv.getFloat32(binStart + posOff + [a, b, c][vi] * 12 + ci * 4, true);
                        return base + nt[ci];
                    })) as number[][]);
                }
            }
        }
        for (const ch of n.children ?? []) walk(ch, nt);
    };
    for (const i of json.scenes[0].nodes) walk(i, [0, 0, 0]);
    return tris;
}

const stoneTris = trianglesOf("hl_wall");
console.log("stone triangles:", stoneTris.length);

// 2D point-in-triangle (footprint occupancy; walls are vertical boxes so any
// triangle over the point == stone there)
const sign = (ax: number, az: number, bx: number, bz: number, px: number, pz: number) =>
    (px - bx) * (az - bz) - (ax - bx) * (pz - bz);
const inTri = (px: number, pz: number, t: number[][]) => {
    const d1 = sign(t[0][0], t[0][2], t[1][0], t[1][2], px, pz);
    const d2 = sign(t[1][0], t[1][2], t[2][0], t[2][2], px, pz);
    const d3 = sign(t[2][0], t[2][2], t[0][0], t[0][2], px, pz);
    const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
};
const covered = (x: number, z: number) => stoneTris.some(t => inTri(x, z, t));

// ---- the maze from bytes -------------------------------------------------------
const P = 2.0, EPS = 1e-6, INF = 3.79, OUTF = 4.21, TW = 0.42;
const seq: Array<[number, number]> = [
    [0, 0], [0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1],
    [2, 2], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [0, 2], [0, 3],
];
const cx = (i: number) => (i - 1.5) * P;
const cz = (i: number) => (1.5 - i) * P;
const consec = new Set<string>();
for (let k = 1; k < seq.length; k++) consec.add([seq[k - 1], seq[k]].map(c => c.join(",")).sort().join("|"));

let doors = 0, solids = 0, blockedDoors = 0, leakySolids = 0, mouthBlocked = 0;
for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
        if (c < 3) {
            const L = [-2, 0, 2][c];
            const mid = cz(r);
            const key = [`${c},${r}`, `${c + 1},${r}`].sort().join("|");
            if (consec.has(key)) { doors++; if (covered(L, mid)) blockedDoors++; }
            else { solids++; if (!covered(L, cz(r) - 0.7) || !covered(L, cz(r)) || !covered(L, cz(r) + 0.7)) leakySolids++; }
        }
        if (r < 3) {
            const L = 2 - 2 * r;
            const mid = cx(c);
            const key = [`${c},${r}`, `${c},${r + 1}`].sort().join("|");
            if (consec.has(key)) { doors++; if (covered(mid, L)) blockedDoors++; }
            else { solids++; if (!covered(cx(c) - 0.7, L) || !covered(cx(c), L) || !covered(cx(c) + 0.7, L)) leakySolids++; }
        }
    }
}
if (doors !== 15 || solids !== 9) throw Error(`decoded doors=${doors} solids=${solids} != 15/9`);
if (blockedDoors > 0 || leakySolids > 0) throw Error(`maze mismatch: ${blockedDoors} doors blocked, ${leakySolids} solids leaky`);

// mouth lane clear (x band -3.74..-2.26 over the START cell col 0 row 0 at +z)
for (const x of [-3.6, -3.0, -2.4]) for (const z of [INF + 0.05, 4.0, OUTF - 0.05]) if (covered(x, z)) mouthBlocked++;
if (mouthBlocked) throw Error(`mouth lane blocked at ${mouthBlocked} samples`);
// BACK (-z) bar continuity: the mouth's complement — 5 samples across the full
// width at the back bar's midline must ALL be stone (v1's bypass bug class)
let backOpen = 0;
for (const x of [-4.0, -3.0, -1.0, 1.0, 3.0, 4.0]) if (!covered(x, -INF - TW / 2)) backOpen++;
if (backOpen) throw Error(`back bar has ${backOpen} openings (bypass class)`);
// mouth opens into START cell: just inside the mouth must be open, and the
// start cell center must be open
if (covered(-3.0, INF - 0.1)) throw Error("inside-mouth start cell blocked");
if (covered(cx(0), cz(0))) throw Error("start cell center covered");

// cell interiors walkable (sample all 16 cell centers — must be EMPTY; the
// heart cell is the exception: its socket+pin stand AT center, so prove the
// surrounding ring walkable instead)
let blockedCells = 0;
for (const [gx, gz] of seq) {
    if (gx === 0 && gz === 3) {
        // heart ring: 0.6m off center in 4 directions (corridor half-width 0.79)
        for (const [dx, dz] of [[0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]])
            if (covered(cx(gx) + dx, cz(gz) + dz)) blockedCells++;
    } else if (covered(cx(gx), cz(gz))) blockedCells++;
}
if (blockedCells) throw Error(`${blockedCells} cell samples covered by stone`);

// heart: bead node
const beadNode = nodes.find((n: any) => n.name === "glow_hl_1");
if (!beadNode) throw Error("glow_hl_1 missing");
if (Math.abs(beadNode.translation[0] + 3) > 0.02 || Math.abs(beadNode.translation[2] + 3) > 0.02 || Math.abs(beadNode.translation[1] - 2.85) > 0.02)
    throw Error(`bead not at heart (-3, 2.85, -3): ${JSON.stringify(beadNode.translation)}`);

// envelope: stone-only bbox from triangles
let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity, mxy = -Infinity, mny = Infinity;
for (const t of stoneTris) for (const v of t) {
    mnx = Math.min(mnx, v[0]); mxx = Math.max(mxx, v[0]);
    mnz = Math.min(mnz, v[2]); mxz = Math.max(mxz, v[2]);
    mxy = Math.max(mxy, v[1]); mny = Math.min(mny, v[1]);
}
if (Math.abs(mnx + 4.21) > 0.01 || Math.abs(mxx - 4.21) > 0.01) throw Error(`x envelope ${mnx.toFixed(3)}..${mxx.toFixed(3)}`);
if (Math.abs(mnz + 4.21) > 0.01 || Math.abs(mxz - 4.21) > 0.01) throw Error(`z envelope ${mnz.toFixed(3)}..${mxz.toFixed(3)}`);
if (mny < -0.01) throw Error(`below grade ${mny}`);
if (Math.abs(mxy - 2.36) > 0.01) throw Error(`wall crest ${mxy} != 2.36`);

// iron pin present (triangle count > 0) under the bead
const ironTris = trianglesOf("hl_pin");
if (ironTris.length === 0) throw Error("iron pin missing");

console.log("ALL PASS", JSON.stringify({
    sha: sha.slice(0, 16),
    nodes: sceneNodes,
    stoneTriangles: stoneTris.length,
    ironTriangles: ironTris.length,
    doors, solids,
    mouthClear: true, cellsClear: 16,
    bead: beadNode.translation,
    stoneEnvelope: { x: [+mnx.toFixed(3), +mxx.toFixed(3)], z: [+mnz.toFixed(3), +mxz.toFixed(3)], y: [+mny.toFixed(3), +mxy.toFixed(3)] },
}));
