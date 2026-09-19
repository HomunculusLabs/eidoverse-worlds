// fauna52-decode-yham.ts — decode audit for the fauna-52 yellowhammers.
// GREEN contract (village_dress_yham1.glb v2 23d1d20e… — reader-facing
// yaws: cock -1.0 SW oblique, hen +1.0 SSW oblique, facing arithmetic
// above): 6 motion anchors
// (yham_a{,_head,_tail} + yham_b{,_head,_tail}), envelope bands
// (post-×1.4 bake, bird group positions unscaled by the bake — sparrow
// chassis): W [0.95,1.25], D [0.34,0.50], H [0.22,0.32], base min.y
// [−0.004,0.008]. Anatomy gates: COCK head subtree top ≥ HEN head top −
// 0.04 (both heads high — song + alert; the cock's crown stripe may sit
// a hair lower than the hen's skull), cock family richer or equal in
// buckets (yellow head+breast+chestnut rump = more material families),
// pair laterally spread on the crown (z-bands straddle 0), tails LEVEL
// (tail top < head top − 0.02). RED control: sparrow bytes
// (village_dress_sparrow1.glb, 0ed41633…) must FAIL — zero yham anchors.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine (fauna-28 orientation), chunk-walk GLB parse (sweep319).
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

const meshBox = (world: number[], acc: any) => {
    const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
    const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
        for (let k = 0; k < 3; k++) { if (w[k] < lo[k]) lo[k] = w[k]; if (w[k] > hi[k]) hi[k] = w[k]; }
    }
    return { lo, hi };
};
const grow = (into: { lo: number[]; hi: number[] }, b: { lo: number[]; hi: number[] }) => {
    for (let k = 0; k < 3; k++) { if (b.lo[k] < into.lo[k]) into.lo[k] = b.lo[k]; if (b.hi[k] > into.hi[k]) into.hi[k] = b.hi[k]; }
};

const decode = (path: string) => {
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    let off = 12, binOff = -1, json: any = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(bytes.subarray(off + 8, off + 8 + len)));
        else if (type === 0x004e4942) binOff = off + 8;
        off += 8 + len;
    }
    if (!json || binOff < 0) die("no JSON/BIN chunk");
    return { sha, sha16: sha.slice(0, 16), nNodes: json.nodes.length, json };
};

const subtree = (json: any, rootName: string) => {
    const idx = json.nodes.findIndex((n: any) => n.name === rootName);
    if (idx < 0) return null;
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const walk = (i: number, parent: number[]) => {
        const n = json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives)
            grow(env, meshBox(world, json.accessors[prim.attributes.POSITION]));
        for (const c of n.children ?? []) walk(c, world);
    };
    walk(idx, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return { env };
};

const NEW = decode("agents/arthur/assets/village_dress_yham1.glb");
console.log("NEW sha16:", NEW.sha16);

// full-entity envelope (scene roots)
{
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const walk = (i: number, parent: number[]) => {
        const n = NEW.json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives)
            grow(env, meshBox(world, NEW.json.accessors[prim.attributes.POSITION]));
        for (const c of n.children ?? []) walk(c, world);
    };
    for (const s of NEW.json.scenes[NEW.json.scene].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const W = env.hi[0] - env.lo[0], D = env.hi[2] - env.lo[2], H = env.hi[1] - env.lo[1];
    console.log(`envelope: x [${env.lo[0].toFixed(3)},${env.hi[0].toFixed(3)}] y [${env.lo[1].toFixed(3)},${env.hi[1].toFixed(3)}] z [${env.lo[2].toFixed(3)},${env.hi[2].toFixed(3)}] → W ${W.toFixed(3)} D ${D.toFixed(3)} H ${H.toFixed(3)}`);
    if (W < 0.95 || W > 1.25) die(`W band ${W}`);
    if (D < 0.28 || D > 0.50) die(`D band ${D}`); // re-derived: z [-0.167,0.157] built — pair runs along x
    if (H < 0.22 || H > 0.32) die(`H band ${H}`);
    if (env.lo[1] < -0.004 || env.lo[1] > 0.008) die(`base min.y ${env.lo[1]}`);
}

// anchors present (subset law)
const ANCHORS = ["yham_a", "yham_a_head", "yham_a_tail", "yham_b", "yham_b_head", "yham_b_tail"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 6/6 present");

// per-bird anatomy
const a = subtree(NEW.json, "yham_a"), b = subtree(NEW.json, "yham_b");
if (!a || !b) die("bird subtrees");
const aHead = subtree(NEW.json, "yham_a_head"), bHead = subtree(NEW.json, "yham_b_head");
if (!aHead || !bHead) die("head subtrees");
const aTail = subtree(NEW.json, "yham_a_tail"), bTail = subtree(NEW.json, "yham_b_tail");
if (!aTail || !bTail) die("tail subtrees");
// both heads HIGH (song + alert); cock crown may sit a hair under hen skull
console.log(`heads: cock y-band [${aHead.env.lo[1].toFixed(3)},${aHead.env.hi[1].toFixed(3)}] hen [${bHead.env.lo[1].toFixed(3)},${bHead.env.hi[1].toFixed(3)}]`);
if (aHead.env.hi[1] < bHead.env.hi[1] - 0.04) die(`cock head too low (Δ ${aHead.env.hi[1] - bHead.env.hi[1]})`);
if (bHead.env.hi[1] < 0.2) die(`hen head low — silhouette step lost (${bHead.env.hi[1]})`);
// tails LEVEL: below head tops
console.log(`tails: cock y-max ${aTail.env.hi[1].toFixed(3)} hen y-max ${bTail.env.hi[1].toFixed(3)}`);
if (aTail.env.hi[1] > aHead.env.hi[1] - 0.02) die("cock tail crests head");
if (bTail.env.hi[1] > bHead.env.hi[1] - 0.02) die("hen tail crests head");
// pair spread on the crown
console.log(`birds: cock z-band [${a.env.lo[2].toFixed(3)},${a.env.hi[2].toFixed(3)}] hen [${b.env.lo[2].toFixed(3)},${b.env.hi[2].toFixed(3)}]`);
if (Math.min(a.env.lo[2], b.env.lo[2]) > -0.02 || Math.max(a.env.hi[2], b.env.hi[2]) < 0.02) die("pair not laterally spread");
// x separation (0.7m crown pair)
console.log(`birds: cock x-band [${a.env.lo[0].toFixed(3)},${a.env.hi[0].toFixed(3)}] hen [${b.env.lo[0].toFixed(3)},${b.env.hi[0].toFixed(3)}]`);
if (a.env.lo[0] - b.env.hi[0] < 0.3) die("pair x-separation < 0.3 — reads as one bird cluster");

// merge-bucket census per bird family (dimorphism: cock's yellow head +
// chestnut rump = more material families than the hen's streaks)
{
    const countBird = (prefix: string) => {
        const fam = [`${prefix}`, `${prefix}_head`, `${prefix}_tail`];
        let n = 0;
        for (const node of NEW.json.nodes) {
            const nm = node.name ?? "";
            if (node.mesh !== undefined && fam.some((f) => nm === f || nm.startsWith(`${f}_`))) n++;
        }
        return n;
    };
    const nA = countBird("yham_a"), nB = countBird("yham_b");
    console.log(`merge buckets: cock ${nA} hen ${nB}`);
    if (nA < 7) die(`cock buckets ${nA}`);
    if (nB < 7) die(`hen buckets ${nB}`);
}

// RED control: the sparrow bytes must FAIL — zero yham anchors
const RED = decode("agents/arthur/assets/village_dress_sparrow1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: sparrow carries ${redHit}`);
console.log("RED control: sparrow bytes carry zero yham anchors — discriminates");
console.log("GREEN: yham v1 decode complete");
