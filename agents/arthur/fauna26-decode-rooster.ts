// fauna26-decode-rooster.ts — decode audit for the fauna-26 rooster.
// GREEN contract (village_dress_rooster.glb v2): 5 anchors present
// (roost_a, roost_a_head, roost_a_comb, roost_a_tail, roost_a_wing),
// full-TRS envelope sane (roost stubs x −0.80; beam y 0.315; grain z
// 0.46; sickle crest y ≈ 0.78–0.85 above the rump at 0.50), base
// ≥ −0.006, joints at authored heights (head ~0.80, comb ~0.85 root,
// tail root ~0.53, wing root ~0.36). Marker arithmetic: THE SICKLE
// ARC must crest ≥ 0.82 (the 18m silhouette read) and reach aft
// z ≤ −0.48 (the arc sweeps up-and-back); comb teeth crest ≥ 0.90
// (front view: serrated crown above the head). RED control: donkey
// GLB must FAIL — zero roost_ anchors. Decoder law: FULL TRS
// accumulation (fauna-2), box corners under affine; anchors recorded
// from the NODE tree.
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
        if ((n.name ?? "").startsWith("roost_")) {
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

const GLB = "agents/arthur/assets/village_dress_rooster.glb";
const d = decode(GLB);
console.log("rooster sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
// subset law: the 5 comp targets must exist (keep-fold renames internal
// meshes <group>_N — children of the keep group inherit its motion)
const WANT_A = ["roost_a", "roost_a_comb", "roost_a_head", "roost_a_tail", "roost_a_wing"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -0.85 || env.max[0] > 0.45) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -0.97 || env.max[2] > 0.50) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.006) die(`base digs ${env.min[1]}`);
if (env.max[1] > 1.08 || env.max[1] < 0.95) die(`height drift ${env.max[1]}`);
for (const [k, want] of [["roost_a_head", 0.86], ["roost_a_comb", 0.906], ["roost_a_tail", 0.55], ["roost_a_wing", 0.36]] as const) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - want) > 0.06) die(`${k} joint y ${got.toFixed(3)} vs ${want}`);
    console.log(`joint ${k}: y=${got.toFixed(3)}`);
}
// sickle-marker arithmetic (THE species read): the v9 arc crest must
// sit in [0.93, 0.99] — ABOVE the backline (~0.65) but BELOW the comb
// crest (1.02) so the red comb tops the silhouette from every vantage
// (the v8 dead-front FAIL: arc crowning over the head read "sprout")
const tailNodes = d.nodes.filter((n: any) => n.name === "roost_a_tail" || n.name.startsWith("roost_a_tail_"));
if (!tailNodes.length) die("sickle meshes not found under keep-fold");
const tailTop = Math.max(...tailNodes.map((n: any) => n.max[1]));
const tailBack = Math.min(...tailNodes.map((n: any) => n.min[2]));
const tailX0 = Math.min(...tailNodes.map((n: any) => n.min[0]));
const tailX1 = Math.max(...tailNodes.map((n: any) => n.max[0]));
console.log(`sickle arc: top y=${tailTop.toFixed(3)} (want 0.93..0.99, below comb 1.02), aft z=${tailBack.toFixed(3)} (want ≤ −0.75), span x=[${tailX0.toFixed(3)}, ${tailX1.toFixed(3)}]`);
if (tailTop < 0.93 || tailTop > 0.99) die(`sickle crest out of band ${tailTop}`);
if (tailTop >= 1.0) die(`sickle crest crowds the comb ${tailTop}`);
if (tailBack > -0.75) die(`sickle sweep not aft ${tailBack}`);
// comb-marker arithmetic: serrated teeth crest ≥ 0.90 (comb root 0.846
// + tallest tooth 0.066 → ~0.912) and the tooth band separates from
// the skull dome (0.80+0.044=~0.844)
const combNodes = d.nodes.filter((n: any) => n.name === "roost_a_comb" || n.name.startsWith("roost_a_comb_"));
const combTop = Math.max(...combNodes.map((n: any) => n.max[1]));
console.log(`comb crest: y=${combTop.toFixed(3)} (want ≥ 0.90)`);
if (combTop < 0.90) die(`comb crest too low ${combTop}`);
// RED control — donkey GLB must yield ZERO roost_ anchors
const red = decode("agents/arthur/assets/village_dress_donkeys.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("roost_"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: donkey GLB carries", redA.length, "roost_ anchors (expected 0)");
console.log("DECODE GREEN");
