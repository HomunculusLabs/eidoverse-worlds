// fauna16-decode-dovecote.ts — decode audit for the fauna-16 dovecote.
// GREEN contract (village_dress_dovecote.glb): 6 anchors present
// (dove_a/_head, dove_b/_head, dove_c/_head), full-TRS envelope sane
// (footprint x within [-1.05,0.9], z within [-0.35,1.35]; base y in
// [-0.006,0.04] — fruit/specks/patch/ladder-foot on the ground, nothing
// floating or digging; total height in [2.7,3.15] — box top 2.65 + cap
// + ridge dove), node census recorded (top-level + nested), dove joints
// at their authored heights (perch 2.335+0.033, ridge 2.905+0.033,
// ground 0.085+0.020). RED control: the pig GLB
// (village_dress_pigsty.glb a4918702…) must FAIL — zero dove_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under affine;
// anchors recorded from the NODE tree (fauna-13 law b).
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
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("dove_")) {
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

const DOVE = "agents/arthur/assets/village_dress_dovecote.glb";
const p = decode(DOVE);
console.log("dovecote sha:", p.sha.slice(0, 16));
console.log("node census:", p.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of p.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
console.log("anchors:", Object.keys(p.anchors).sort().join(", "));
console.log("anchor origins:", JSON.stringify(Object.fromEntries(
    Object.entries(p.anchors).map(([k, v]) => [k, (v as number[]).map((x) => +x.toFixed(3))])
), null, 0));
const env = p.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
const wantAnchors = ["dove_a", "dove_a_head", "dove_b", "dove_b_head", "dove_c", "dove_c_head"];
const missing = wantAnchors.filter((k) => !(k in p.anchors));
if (missing.length) die(`missing anchors: ${missing}`);
if (env.min[1] < -0.006 || env.min[1] > 0.04) die(`base y ${env.min[1]}`);
if (env.max[1] < 2.7 || env.max[1] > 3.15) die(`height ${env.max[1]}`);
if (env.min[0] < -1.05 || env.max[0] > 0.9) die(`x extent ${env.min[0]}..${env.max[0]}`);
if (env.min[2] < -0.35 || env.max[2] > 1.35) die(`z extent ${env.min[2]}..${env.max[2]}`);
// dove joints at authored heights (pendulum swing centers)
const exp = { dove_a: 2.335, dove_b: 2.905, dove_c: 0.085 };
for (const [k, wantY] of Object.entries(exp)) {
    const got = p.anchors[k]?.[1];
    if (Math.abs(got - (wantY as number)) > 0.02) die(`${k} joint y ${got} want ${wantY}`);
}
console.log("top-level mesh nodes:", p.nodes.filter((n: any) => n.depth === 0).map((n: any) => n.name).join(", "));
console.log("GREEN — dovecote contract holds");

// RED control: pig bytes carry zero dove_ anchors
const PIG = "agents/arthur/assets/village_dress_pigsty.glb";
const pigSha = createHash("sha256").update(readFileSync(PIG)).digest("hex");
if (pigSha.slice(0, 16) !== "a49187024127dcd8") die(`pig RED bytes drift ${pigSha.slice(0, 16)}`);
const pdecode = decode(PIG);
const pAnchors = Object.keys(pdecode.anchors).filter((k) => k.startsWith("dove_"));
if (pAnchors.length !== 0) die(`RED failed: pig bytes carry dove_ anchors ${pAnchors}`);
console.log("RED — pig bytes: zero dove_ anchors (control holds)");
