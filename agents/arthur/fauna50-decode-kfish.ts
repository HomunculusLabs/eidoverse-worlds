// fauna50-decode-kfish.ts — decode audit for the fauna-50 kingfisher.
// GREEN contract (village_dress_kfish1.glb v2): 4 motion anchors (kfish,
// kfish_body, kfish_head, kfish_tail), full-entity envelope bands W
// [0.95,1.10] D [0.17,0.30] H [0.90,1.02], base min.y [-0.026,0.008]
// (the −20mm floor is the planted-snag ROOT EMBED — tilted-cylinder
// extent law, fauna-14 law c: bottom rim = center − (h/2·cosθ +
// r·sinθ); a planted dead branch embeds, documented); bird perched at
// the snag tip (kfish subtree y-min within ±5mm of 0.768); head family
// ≥7 merge buckets (orange/cobalt/white/ear-orange/eye/bill-dark/
// bill-coral — the two-tone bill PROVES as two distinct buckets); body
// family EXACTLY 3 buckets (orange/cobalt/AZURE — the azure rump
// survived its own bucket); tail family EXACTLY 1 bucket and SHORT
// (x-span ≤ 0.085 incl the v3 droop diagonal, never cresting the head
// top); bill long (head
// x-span ≥ 0.12 — ~40% of the 22cm read). RED control: dmou bytes must
// FAIL — zero kfish anchors. Decoder law: FULL TRS accumulation
// (fauna-2/7), box corners under affine (fauna-28 orientation).
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
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
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

const NEW = decode("agents/arthur/assets/village_dress_kfish1.glb");
console.log("NEW sha16:", NEW.sha16, "| nodes:", NEW.nNodes);

// full-entity envelope (scene roots)
let CX = 0, CZ = 0, HW = 0, HD = 0;
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
    if (W < 0.95 || W > 1.10) die(`W band ${W}`);
    if (D < 0.17 || D > 0.30) die(`D band ${D}`);
    if (H < 0.90 || H > 1.02) die(`H band ${H}`);
    if (env.lo[1] < -0.026 || env.lo[1] > 0.008) die(`base min.y ${env.lo[1]}`);
    CX = (env.lo[0] + env.hi[0]) / 2; CZ = (env.lo[2] + env.hi[2]) / 2;
    HW = W / 2; HD = D / 2;
    console.log(`solid OBB (entity-local): center (${CX.toFixed(4)}, ${CZ.toFixed(4)}) half (${HW.toFixed(4)}, ${HD.toFixed(4)})`);
}

// anchors present (subset law)
const ANCHORS = ["kfish", "kfish_body", "kfish_head", "kfish_tail"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 4/4 present");

// bird ON the snag tip
const kf = subtree(NEW.json, "kfish");
if (!kf) die("kfish subtree");
console.log(`kfish subtree y [${kf.env.lo[1].toFixed(3)},${kf.env.hi[1].toFixed(3)}] (perch tip 0.768)`);
if (Math.abs(kf.env.lo[1] - 0.768) > 0.006) die(`bird not at perch tip: min.y ${kf.env.lo[1]}`);

// head anatomy: bill length + bucket census
const head = subtree(NEW.json, "kfish_head");
if (!head) die("head subtree");
const headW = head.env.hi[0] - head.env.lo[0];
console.log(`head x-span ${headW.toFixed(3)} (bill included — ≥0.12)`);
if (headW < 0.12) die(`head/bill too short: ${headW}`);
// tail: short, level
const tail = subtree(NEW.json, "kfish_tail");
if (!tail) die("tail subtree");
const tailW = tail.env.hi[0] - tail.env.lo[0];
console.log(`tail x-span ${tailW.toFixed(3)} y-max ${tail.env.hi[1].toFixed(3)} vs head top ${head.env.hi[1].toFixed(3)}`);
if (tailW > 0.085) die(`tail too long: ${tailW}`);
if (tail.env.hi[1] > head.env.hi[1]) die("tail crests head");

// merge-bucket census per anchor family (fauna-48 dimorphism law):
// head ≥7 (orange/cobalt/white/ear-orange/eye/bill-dark/bill-coral),
// body EXACTLY 3 (orange/cobalt/AZURE), tail EXACTLY 1 (cobalt)
{
    const countFam = (prefix: string) => {
        let n = 0;
        for (const node of NEW.json.nodes) {
            const nm = node.name ?? "";
            if (node.mesh !== undefined && (nm === prefix || nm.startsWith(`${prefix}_`))) n++;
        }
        return n;
    };
    const nH = countFam("kfish_head"), nB = countFam("kfish_body"), nT = countFam("kfish_tail");
    console.log(`merge buckets: head ${nH} body ${nB} tail ${nT}`);
    if (nH < 7) die(`head buckets ${nH} — two-tone bill or face set incomplete`);
    if (nB !== 3) die(`body buckets ${nB} — azure rump must be its own bucket`);
    if (nT !== 1) die(`tail buckets ${nT}`);
}

// RED control: dmou bytes must FAIL — zero kfish anchors
const RED = decode("agents/arthur/assets/village_dress_dmou1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: dmou carries ${redHit}`);
console.log("RED control: dmou bytes carry zero kfish anchors — discriminates");
console.log("GREEN: kfish v1 decode complete");
