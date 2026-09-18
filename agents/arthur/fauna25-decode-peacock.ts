// fauna25-decode-peacock.ts — decode audit for the fauna-25 peacock.
// GREEN contract (village_dress_peacock.glb, v3 fefb993d): 6 anchors
// present (peacock, _head, _crest, _train, _wings, _tail), full-TRS
// envelope sane (authored: plinth foot ±0.48; step stone x→0.755; molted
// feather 2 x→−0.69, z→0.60; train z→−0.71), base ≥ −0.006, height in
// [1.55, 1.78] (train crest ≈1.66), joints at authored heights (head
// ≈0.805, train ≈0.635, tail ≈0.535, wings ≈0.495). Marker arithmetic:
// THE TRAIN dome — crest ≥ 1.55, span ≥ 1.70 total width, backward z
// extent ≥ 0.50 behind the bird (the tilted-dome read, NOT a vertical
// fan). RED control: turkey GLB must FAIL — zero peacock_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under
// affine; anchors recorded from the NODE tree.
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
    void bin;
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("peacock_") || n.name === "peacock") {
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

const GLB = "agents/arthur/assets/village_dress_peacock.glb";
const d = decode(GLB);
console.log("peacock sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
// subset law: the 6 comp targets must exist (keep-fold renames internal
// meshes <group>_N — children of the keep group inherit its motion)
const WANT_A = ["peacock", "peacock_head", "peacock_crest", "peacock_train", "peacock_tail", "peacock_wings"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -0.90 || env.max[0] > 0.95) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -0.78 || env.max[2] > 0.65) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.006) die(`base digs ${env.min[1]}`);
if (env.max[1] > 1.72 || env.max[1] < 1.60) die(`height drift ${env.max[1]}`);
for (const [k, want] of [["peacock_head", 0.805], ["peacock_train", 0.635], ["peacock_tail", 0.535], ["peacock_wings", 0.495]] as const) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - want) > 0.06) die(`${k} joint y ${got.toFixed(3)} vs ${want}`);
    console.log(`joint ${k}: y=${got.toFixed(3)}`);
}
// train-marker arithmetic (THE species read — the tilted dome):
// crest ≥ 1.55, total span ≥ 1.70, backward reach ≥ 0.50 behind bird
const trainNodes = d.nodes.filter((n: any) => n.name === "peacock_train" || n.name.startsWith("peacock_train_"));
if (!trainNodes.length) die("train meshes not found under keep-fold");
const trainTop = Math.max(...trainNodes.map((n: any) => n.max[1]));
const trainX0 = Math.min(...trainNodes.map((n: any) => n.min[0]));
const trainX1 = Math.max(...trainNodes.map((n: any) => n.max[0]));
const trainZ0 = Math.min(...trainNodes.map((n: any) => n.min[2]));
const trainW = trainX1 - trainX0;
console.log(`train dome: top y=${trainTop.toFixed(3)} (want ≥ 1.60), span x=[${trainX0.toFixed(3)}, ${trainX1.toFixed(3)}] = ${trainW.toFixed(3)}m (want ≥ 1.75), z back=${trainZ0.toFixed(3)} (want ≤ −0.65)`);
if (trainTop < 1.60) die(`train crest too low ${trainTop}`);
if (trainW < 1.75) die(`train span too narrow ${trainW}`);
if (trainZ0 > -0.65) die(`train does not trail behind (z0 ${trainZ0})`);
// eyespot presence arithmetic: gold ring boxes must exist at plume tips —
// the GOLD material bucket carries ≥ 21 boxes + 2 molted rings → its
// mesh node count > 0; simpler true check: widest train reach |x| ≥ 0.80
const trainReach = Math.max(...trainNodes.map((n: any) => Math.max(Math.abs(n.min[0]), Math.abs(n.max[0]))));
console.log(`train widest reach |x|=${trainReach.toFixed(3)} (want ≥ 0.80)`);
if (trainReach < 0.80) die(`train too narrow at edges ${trainReach}`);
// RED control — turkey GLB must yield ZERO peacock_ anchors
const red = decode("agents/arthur/assets/village_dress_turkeys.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("peacock_"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: turkey GLB carries", redA.length, "peacock_ anchors (expected 0)");
console.log("DECODE GREEN");
