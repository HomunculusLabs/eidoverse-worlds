// fauna87-decode-kiln.ts — kiln geometry decode for the fauna-87 lizard
// seat (FAUNA-PLAN row 54). READ-ONLY: decodes the LOCAL kiln build
// (village_kiln3.glb) and prints every mesh's kiln-local box, so the
// basking seat is derived from TRUE geometry, never prose. Verifies the
// local bbox against the LIVE census bbox (4.805x3.111x2.791, geom
// 2026-09-21) — the served lib is the DRACO re-encode (struct-104 class),
// sizes must match within rounding or the local bytes are NOT the twin.
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

const path = "agents/arthur/assets/village_kiln3.glb";
const bytes = new Uint8Array(readFileSync(path));
console.log("sha256", createHash("sha256").update(bytes).digest("hex"));
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));

const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
const rows: { name: string; min: number[]; max: number[] }[] = [];
const walk = (idx: number, parent: number[]) => {
    const n = json.nodes[idx];
    const world = mul(parent, trs(n.translation, n.rotation, n.scale));
    if (n.mesh !== undefined) {
        const mb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
        for (const prim of json.meshes[n.mesh].primitives) {
            const acc = json.accessors[prim.attributes.POSITION];
            const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
            const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                for (let k = 0; k < 3; k++) {
                    if (w[k] < mb.min[k]) mb.min[k] = w[k];
                    if (w[k] > mb.max[k]) mb.max[k] = w[k];
                    if (w[k] < bb.min[k]) bb.min[k] = w[k];
                    if (w[k] > bb.max[k]) bb.max[k] = w[k];
                }
            }
        }
        rows.push({ name: n.name ?? `(mesh@${idx})`, min: mb.min, max: mb.max });
    }
    for (const c of n.children ?? []) walk(c, world);
};
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
for (const i of json.scenes[json.scene ?? 0].nodes) walk(i, I);

console.log("ENVELOPE min", bb.min.map((v) => v.toFixed(3)), "max", bb.max.map((v) => v.toFixed(3)));
console.log("SIZE", (bb.max[0] - bb.min[0]).toFixed(3), (bb.max[1] - bb.min[1]).toFixed(3), (bb.max[2] - bb.min[2]).toFixed(3),
    "| LIVE 4.805 3.111 2.791 (tol 0.05 each)");
for (const r of rows) console.log(r.name.padEnd(22), "min", r.min.map((v) => v.toFixed(3)).join(","), "max", r.max.map((v) => v.toFixed(3)).join(","));
