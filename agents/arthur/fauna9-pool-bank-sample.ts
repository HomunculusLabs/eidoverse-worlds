// fauna9-pool-bank-sample.ts — decode the reedpool3 GLB and raycast DOWN at
// the robin seat (pool-local -3.4, +2.4) to find the TRUE bank surface the
// robin must stand on. Judge fauna-9 read: "feet dangle, nothing beneath"
// — the rig's flat y=0 plane is not the pool's sculpted bank. Full TRS
// accumulation (fauna-2 decoder law), triangle raycast at a 5x5 grid over
// the seat footprint (0.55 x 0.25 envelope), report first-hit y per point.
// ALSO reports water-top local y (the big flat face) for context.
import { readFileSync } from "node:fs";

const mul = (a: number[], b: number[]): number[] => {
    const o = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
        for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return o;
};
const trs = (t: number[] | undefined, q: number[] | undefined, s: number[] | undefined): number[] => {
    const [x, y, z] = t ?? [0, 0, 0];
    const [qx, qy, qz, qw] = q ?? [0, 0, 0, 1];
    const [sx, sy, sz] = s ?? [1, 1, 1];
    const r = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy + qz * qw), 2 * (qx * qz - qy * qw),
               2 * (qx * qy - qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz + qx * qw),
               2 * (qx * qz + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy)];
    return [r[0] * sx, r[3] * sx, r[6] * sx, 0,
            r[1] * sy, r[4] * sy, r[7] * sy, 0,
            r[2] * sz, r[5] * sz, r[8] * sz, 0,
            x, y, z, 1];
};
const apply = (m: number[], p: number[]): number[] => [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

const bytes = new Uint8Array(readFileSync("agents/arthur/assets/village_reedpool3.glb"));
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw Error("not a glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;

const readAcc = (accIdx: number): Float32Array => {
    const acc = json.accessors[accIdx];
    const bv = json.bufferViews[acc.bufferView];
    const off = binStart + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const n = acc.count * (acc.type === "VEC3" ? 3 : 1);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = dv.getFloat32(off + i * 4, true);
    return out;
};

// collect world-space triangles
type Tri = [number[], number[], number[]];
const tris: Tri[] = [];
let bbmin = [Infinity, Infinity, Infinity], bbmax = [-Infinity, -Infinity, -Infinity];
const walk = (idx: number, parent: number[]) => {
    const n = json.nodes[idx];
    const world = mul(parent, trs(n.translation, n.rotation, n.scale));
    if (n.mesh !== undefined) {
        for (const prim of json.meshes[n.mesh].primitives) {
            if (prim.mode !== undefined && prim.mode !== 4) continue;
            const pos = readAcc(prim.attributes.POSITION);
            const acc = json.accessors[prim.attributes.POSITION];
            for (let i = 0; i < 3; i++) {
                bbmin[i] = Math.min(bbmin[i], acc.min[i]); bbmax[i] = Math.max(bbmax[i], acc.max[i]);
            }
            const idxs: number[] = [];
            if (prim.indices !== undefined) {
                const ia = json.accessors[prim.indices];
                const bv = json.bufferViews[ia.bufferView];
                const off = binStart + (bv.byteOffset ?? 0) + (ia.byteOffset ?? 0);
                for (let i = 0; i < ia.count; i++)
                    idxs.push(ia.componentType === 5123 ? dv.getUint16(off + i * 2, true) : dv.getUint32(off + i * 4, true));
            } else { for (let i = 0; i < pos.length / 3; i++) idxs.push(i); }
            for (let i = 0; i + 2 < idxs.length; i += 3) {
                tris.push([
                    apply(world, [pos[idxs[i] * 3], pos[idxs[i] * 3 + 1], pos[idxs[i] * 3 + 2]]),
                    apply(world, [pos[idxs[i + 1] * 3], pos[idxs[i + 1] * 3 + 1], pos[idxs[i + 1] * 3 + 2]]),
                    apply(world, [pos[idxs[i + 2] * 3], pos[idxs[i + 2] * 3 + 1], pos[idxs[i + 2] * 3 + 2]]),
                ]);
            }
        }
    }
    for (const c of n.children ?? []) walk(c, world);
};
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
for (const s of json.scenes[json.scene].nodes) walk(s, I);
console.log(`pool model: ${tris.length} tris, local bbox min(${bbmin.map(v => v.toFixed(3)).join(",")}) max(${bbmax.map(v => v.toFixed(3)).join(",")})`);

// raycast down at (x,z): highest triangle whose 2D projection contains the point
const hitY = (x: number, z: number): number | null => {
    let best: number | null = null;
    for (const [a, b, c] of tris) {
        const ax = a[0], az = a[2], bx = b[0], bz = b[2], cx = c[0], cz = c[2];
        const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
        if (Math.abs(d) < 1e-9) continue;
        const u = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
        const v = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
        if (u < -1e-6 || v < -1e-6 || u + v > 1 + 1e-6) continue;
        const y = a[1] + u * (b[1] - a[1]) + v * (c[1] - a[1]);
        if (best === null || y > best) best = y;
    }
    return best;
};

// the seat: pool-local (-3.4, +2.4), 5x5 grid over the robin envelope (0.55 x 0.25)
console.log("\nbank surface under the robin envelope (pool-local):");
const CX = -3.4, CZ = 2.4;
let lo = Infinity, hi = -Infinity;
for (let gx = -2; gx <= 2; gx++) for (let gz = -2; gz <= 2; gz++) {
    const x = CX + gx * 0.11, z = CZ + gz * 0.05;
    const y = hitY(x, z);
    if (y !== null) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    if (gx % 2 === 0 && gz % 2 === 0)
        console.log(`  (${x.toFixed(2)}, ${z.toFixed(2)}) -> ${y === null ? "NO HIT (off-mesh)" : y.toFixed(4)}`);
}
console.log(`\nseat surface span: ${lo === Infinity ? "n/a" : lo.toFixed(4)} .. ${hi === -Infinity ? "n/a" : hi.toFixed(4)} (span ${((hi - lo) * 1000).toFixed(1)}mm)`);
// water top: sample the pool center
console.log(`pool center (0,0) surface: ${hitY(0, 0)?.toFixed(4)}`);
// a profile outward from center through the seat, to see bank shape
console.log("\nradial profile center -> seat dir (per 0.5m):");
const L = Math.hypot(CX, CZ), ux = CX / L, uz = CZ / L;
for (let r = 0; r <= L + 1.5; r += 0.5) {
    const y = hitY(ux * r, uz * r);
    console.log(`  r=${r.toFixed(1)} (${(ux * r).toFixed(2)},${(uz * r).toFixed(2)}) -> ${y === null ? "off-mesh" : y.toFixed(3)}`);
}
