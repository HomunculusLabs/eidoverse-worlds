// fauna53-decode-rows.ts — decode the espalier rows HOST for the fauna-53
// tawny-owl crown seat. Verifies local bytes == live lib (962c5fb0…),
// then maps the crown surface VERTEX-TRUE (merged material buckets span
// whole plants — union boxes lie per-bin; the honest instrument is
// per-vertex world positions, sweep-319 class).
// Decoder law: FULL TRS accumulation (fauna-2/7), chunk-walk GLB parse.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };
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

const bytes = new Uint8Array(readFileSync("agents/arthur/assets/village_dress_nw_orchardrows1.glb"));
const sha = createHash("sha256").update(bytes).digest("hex");
console.log("rows sha16:", sha.slice(0, 16));
if (sha.slice(0, 16) !== "962c5fb041d19c63") die(`rows bytes drift vs live lib: ${sha.slice(0, 16)}`);

const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb");
let off = 12, binOff = -1, json: any = null;
while (off < bytes.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(bytes.subarray(off + 8, off + 8 + len)));
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
}
if (!json || binOff < 0) die("no chunks");

// world-space VERTEX cloud (true local surface)
const verts: number[][] = [];
const walk = (i: number, parent: number[]) => {
    const n = json.nodes[i];
    const world = mul(parent, trs(n.translation, n.rotation, n.scale));
    if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const bv = json.bufferViews[acc.bufferView];
        const start = binOff + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const cnt = acc.count;
        const stride = bv.byteStride ?? 12;
        for (let v = 0; v < cnt; v++) {
            const o = start + v * stride;
            verts.push(apply(world, [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]));
        }
    }
    for (const ch of n.children ?? []) walk(ch, world);
};
for (const s of json.scenes[json.scene].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
console.log("vertices:", verts.length, "| nodes:", json.nodes.length);

// crown map: per 0.25m x-bin, max y + z-band of crown-zone verts (y>0.95)
const crownAt = (xc: number, halfWin = 0.25): { top: number; zLo: number; zHi: number; n: number } => {
    let top = -Infinity, zLo = Infinity, zHi = -Infinity, n = 0;
    for (const p of verts) {
        if (Math.abs(p[0] - xc) > halfWin) continue;
        if (p[1] > top) top = p[1];
        if (p[1] > 0.95) { n++; if (p[2] < zLo) zLo = p[2]; if (p[2] > zHi) zHi = p[2]; }
    }
    return { top, zLo, zHi, n };
};
console.log("x-bin   topY   crownZ-band        n");
for (let x = -3.25; x <= 3.25; x += 0.5) {
    const c = crownAt(x);
    console.log(`${x.toFixed(2).padStart(6)}  ${c.top === -Infinity ? "  -" : c.top.toFixed(3)}  ${c.n ? `[${c.zLo.toFixed(3)},${c.zHi.toFixed(3)}]` : "[ - ]"}  ${c.n}`);
}
const p2 = crownAt(2.10), p1 = crownAt(-0.15), p0 = crownAt(-1.82);
console.log("\nPLANT CROWN SEATS (0.25m window):");
console.log(`plant2 (x 2.10): top ${p2.top.toFixed(3)} z-band [${p2.zLo.toFixed(3)},${p2.zHi.toFixed(3)}] n=${p2.n}`);
console.log(`plant1 (x -0.15): top ${p1.top.toFixed(3)} z-band [${p1.zLo.toFixed(3)},${p1.zHi.toFixed(3)}] n=${p1.n}`);
console.log(`plant0 (x -1.82): top ${p0.top.toFixed(3)} z-band [${p0.zLo.toFixed(3)},${p0.zHi.toFixed(3)}] n=${p0.n}`);
if (p2.top < 1.25 || p1.top < 1.05 || p0.top < 1.3) die("crown tops lower than source plan — decode mismatch");
console.log("\nGREEN: rows host vertex-true decode complete");
