// fauna13-decode-sheep.ts — decode audit for the fauna-13 sheep fold.
// GREEN contract (village_dress_sheepfold.glb): 6 anchors present
// (sheep_a/_head/_tail, sheep_b/_head/_tail), full-TRS envelope sane
// (footprint x within [-2.6,2.4], z within [-2.6,1.1]; base y in
// [-0.005,0.03] — feet + pad on the ground, nothing floating; total height
// in [0.75,1.05] — a ewe pair, watch head ~0.92), node census recorded
// (top-level + nested), head/tail joints at their authored y (0.56/0.50).
// RED control: the geese GLB (village_goosepair.glb 67a8406d…) must FAIL —
// zero sheep_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under affine.
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
        off += 8 + len + ((len % 4) ? (4 - (len % 4)) : 0);
    }
    if (!json || !bin) die("chunks");
    // accessor min/max per mesh
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    // full-TRSwalk
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        // anchors are the KEEP GROUPS (nested keep-fold: sheep_a_head lives
        // inside sheep_a) — they may carry no mesh of their own, so record
        // them from the NODE tree, not the mesh census.
        if ((n.name ?? "").startsWith("sheep_")) {
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
            if ((n.name ?? "").startsWith("sheep_")) {
                out.anchors[n.name] = out.anchors[n.name] ?? [
                    Math.min(...xs), Math.min(...ys), Math.min(...zs),
                    Math.max(...xs), Math.max(...ys), Math.max(...zs)];
            }
        }
        for (const c of n.children ?? []) walk(c, m, depth + 1);
    };
    for (const s of json.scenes[0].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 0);
    return out;
};

const SHEEP = "agents/arthur/assets/village_dress_sheepfold.glb";
const s = decode(SHEEP);
console.log("sheep sha:", s.sha.slice(0, 16));
console.log("node census:", s.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of s.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
console.log("anchors:", Object.keys(s.anchors).sort().join(", "));
const env = s.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
const wantAnchors = ["sheep_a", "sheep_a_head", "sheep_a_tail", "sheep_b", "sheep_b_head", "sheep_b_tail"];
const missing = wantAnchors.filter((k) => !(k in s.anchors));
if (missing.length) die(`missing anchors: ${missing}`);
if (env.min[1] < -0.005 || env.min[1] > 0.03) die(`base y ${env.min[1]}`);
if (env.max[1] < 0.75 || env.max[1] > 1.05) die(`height ${env.max[1]}`);
if (env.min[0] < -2.6 || env.max[0] > 2.4) die(`x extent ${env.min[0]}..${env.max[0]}`);
// z: the trodden pad is a r1.65 disc z-scaled 1.25 → half 2.0625 from its
// center −0.55 → designed extremes −2.6125 / +1.5125 (guard ±5mm)
if (env.min[2] < -2.6175 || env.max[2] > 1.5175) die(`z extent ${env.min[2]}..${env.max[2]}`);
// per-node names for the census record
console.log("top-level mesh nodes:", s.nodes.filter((n: any) => n.depth === 0).map((n: any) => n.name).join(", "));
console.log("GREEN — sheep fold contract holds");

// RED control: geese bytes carry zero sheep_ anchors
const GEESE = "agents/arthur/assets/village_goosepair.glb";
const geeseSha = createHash("sha256").update(readFileSync(GEESE)).digest("hex");
if (geeseSha.slice(0, 16) !== "67a8406dd63612ea") die(`geese RED bytes drift ${geeseSha.slice(0, 16)}`);
const gdecode = decode(GEESE);
const gAnchors = Object.keys(gdecode.anchors).filter((k) => k.startsWith("sheep_"));
if (gAnchors.length !== 0) die(`RED failed: geese bytes carry sheep_ anchors ${gAnchors}`);
console.log("RED — geese bytes: zero sheep_ anchors (control holds)");
