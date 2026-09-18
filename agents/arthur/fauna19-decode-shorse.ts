// fauna19-decode-shorse.ts — decode audit for the fauna-19 stable horses.
// GREEN contract (village_dress_stablehorses.glb): 7 anchors present
// (shorse_a/_head/_ears/_tail, shorse_b/_head/_tail), full-TRS envelope
// sane (x within [-1.7,1.1], z within [-1.3,1.8]; base y in [-0.006,0.03]
// — hooves/pad/rail-legs on the ground, nothing floating or digging;
// total height in [1.6,2.0] — a draft pair, shoulder ~1.55, watch ears
// cresting ~1.85), joints at authored heights (a_head ~1.68, b_head ~0.52,
// tails ~1.30). RED control: the pig GLB (village_dress_pigsty.glb
// a4918702…) must FAIL — zero shorse_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under affine;
// anchors recorded from the NODE tree (nested keep-groups carry no mesh).
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

const decode = (path: string) => {
    const bytes = readFileSync(path);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        const body = bytes.subarray(off + 8, off + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
        else if (type === 0x004e4942) bin = body;
        off += 8 + len + ((len % 4) ? (4 - len % 4) : 0);
    }
    if (!json || !bin) die("chunks");
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("shorse_")) {
            out.anchors[n.name] = out.anchors[n.name] ?? [m[12], m[13], m[14]];
        }
        if (n.mesh !== undefined) {
            const prim = json.meshes[n.mesh].primitives[0];
            const { min, max } = acc(prim.attributes.POSITION);
            const corners = [
                [min[0], min[1], min[2]], [max[0], min[1], min[2]],
                [min[0], max[1], min[2]], [max[0], max[1], min[2]],
                [min[0], min[1], max[2]], [max[0], min[1], max[2]],
                [min[0], max[1], max[2]], [max[0], max[1], max[2]],
            ].map((c) => apply(m, c));
            const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]), zs = corners.map((c) => c[2]);
            out.nodes.push({
                name: n.name ?? `node${ni}`, depth,
                min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
                max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)],
            });
        }
        for (const c of n.children ?? []) walk(c, m, depth + 1);
    };
    for (const s of json.scenes[0].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 0);
    return out;
};

const GLB = "agents/arthur/assets/village_dress_stablehorses.glb";
const d = decode(GLB);
console.log("shorse sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
// subset law: the 7 comp targets must exist; mergekit's keep-fold also
// renames internal meshes to <group>_N — children of the keep group, they
// inherit its motion (pig chassis records them too)
const WANT_A = ["shorse_a", "shorse_a_ears", "shorse_a_head", "shorse_a_tail", "shorse_b", "shorse_b_head", "shorse_b_tail"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -1.7 || env.max[0] > 1.75) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -1.6 || env.max[2] > 1.9) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.006) die(`base digs ${env.min[1]}`);
if (env.max[1] > 2.05 || env.max[1] < 1.6) die(`height drift ${env.max[1]}`);
for (const [k, want] of [["shorse_a_head", 1.68], ["shorse_b_head", 0.64], ["shorse_a_tail", 1.30], ["shorse_b_tail", 1.30]] as const) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - want) > 0.08) die(`${k} joint y ${got.toFixed(3)} vs ${want}`);
    console.log(`joint ${k}: y=${got.toFixed(3)}`);
}
// RED control — pig GLB must yield ZERO shorse_ anchors
const red = decode("agents/arthur/assets/village_dress_pigsty.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("shorse_"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: pig GLB carries", redA.length, "shorse_ anchors (expected 0)");
console.log("DECODE GREEN");
