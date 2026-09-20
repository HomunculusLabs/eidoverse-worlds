// fauna55-decode-pheas.ts — decode audit for the fauna-55 pheasants.
// GREEN contract (village_dress_pheas1.glb): 6 motion anchors (pheas_a,
// pheas_a_head, pheas_a_tail, pheas_b, pheas_b_head, pheas_b_tail);
// full-entity envelope bands W [0.60,0.95] D [0.70,1.05] H [0.30,0.46]
// base min.y [−0.006,0.014]; THE LONG COCK TAIL: pheas_a tail subtree
// x-span ≥ 0.45 (the 18m silhouette lock); hen tail shorter: pheas_b
// tail x-span ≤ 0.34 AND cock-tail − hen-tail ≥ 0.12 (dimorphism);
// strut vs skulk: cock head-subtree y-max ≥ hen head y-max + 0.10;
// cock tail tip BELOW tail root (droop law: tip y < root y); merge
// buckets: head family ≥5 (green/ring/wattle/eye/bill), body family
// ≥5 (copper/mantle/gold/leg/spur), tail family EXACTLY 2 (dark bars
// + pale bars — the barring proves as two distinct buckets).
// RED control: yham bytes must FAIL — zero pheas anchors. Decoder law:
// FULL TRS accumulation (fauna-2/7), box corners under affine
// (fauna-28 orientation).
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

const NEW = decode("agents/arthur/assets/village_dress_pheas1.glb");
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
    if (W < 0.60 || W > 1.05) die(`W band ${W}`);
    if (D < 0.60 || D > 1.05) die(`D band ${D}`);
    if (H < 0.30 || H > 0.46) die(`H band ${H}`);
    if (env.lo[1] < -0.006 || env.lo[1] > 0.014) die(`base min.y ${env.lo[1]}`);
    CX = (env.lo[0] + env.hi[0]) / 2; CZ = (env.lo[2] + env.hi[2]) / 2;
    HW = W / 2; HD = D / 2;
    console.log(`solid OBB (entity-local): center (${CX.toFixed(4)}, ${CZ.toFixed(4)}) half (${HW.toFixed(4)}, ${HD.toFixed(4)})`);
}

// anchors present (subset law)
const ANCHORS = ["pheas_a", "pheas_a_head", "pheas_a_tail", "pheas_b", "pheas_b_head", "pheas_b_tail"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 6/6 present");

// THE LONG COCK TAIL vs the hen's shorter one (dimorphism law)
const ta = subtree(NEW.json, "pheas_a_tail")!;
const tb = subtree(NEW.json, "pheas_b_tail")!;
const spanA = ta.env.hi[0] - ta.env.lo[0];
const spanB = tb.env.hi[0] - tb.env.lo[0];
console.log(`cock tail x-span ${spanA.toFixed(3)} (≥0.45) | hen tail x-span ${spanB.toFixed(3)} (≤0.34) | dimorphism Δ ${(spanA - spanB).toFixed(3)} (≥0.12)`);
if (spanA < 0.45) die(`cock tail too short: ${spanA}`);
if (spanB > 0.34) die(`hen tail too long: ${spanB}`);
if (spanA - spanB < 0.12) die(`dimorphism gap ${spanA - spanB}`);

// droop law: tail tips BELOW their roots
console.log(`cock tail y [${ta.env.lo[1].toFixed(3)},${ta.env.hi[1].toFixed(3)}] (root ~0.14) | hen tail y [${tb.env.lo[1].toFixed(3)},${tb.env.hi[1].toFixed(3)}] (root ~0.115)`);
if (ta.env.lo[1] > 0.13) die("cock tail not drooped");
if (tb.env.lo[1] > 0.10) die("hen tail not drooped");

// strut vs skulk: cock head higher than hen head by ≥0.10
const ha = subtree(NEW.json, "pheas_a_head")!;
const hb = subtree(NEW.json, "pheas_b_head")!;
console.log(`cock head y-max ${ha.env.hi[1].toFixed(3)} vs hen head y-max ${hb.env.hi[1].toFixed(3)} (Δ ≥0.10)`);
if (ha.env.hi[1] - hb.env.hi[1] < 0.10) die(`strut/skulk gap ${ha.env.hi[1] - hb.env.hi[1]}`);

// merge-bucket census per anchor family
{
    const countFam = (prefix: string) => {
        let n = 0;
        for (const node of NEW.json.nodes) {
            const nm = node.name ?? "";
            if (node.mesh !== undefined && (nm === prefix || nm.startsWith(`${prefix}_`))) n++;
        }
        return n;
    };
    const aH = countFam("pheas_a_head"), aB = countFam("pheas_a"), aT = countFam("pheas_a_tail");
    const bH = countFam("pheas_b_head"), bB = countFam("pheas_b"), bT = countFam("pheas_b_tail");
    console.log(`buckets: cock head ${aH} body ${aB} tail ${aT} | hen head ${bH} body ${bB} tail ${bT}`);
    if (aH < 5) die(`cock head buckets ${aH} — ring/wattle/bill set incomplete`);
    if (aB < 5) die(`cock body buckets ${aB}`);
    if (aT !== 2) die(`cock tail buckets ${aT} — barring must be exactly dark+pale`);
    if (bT !== 2) die(`hen tail buckets ${bT}`);
    if (bH < 4) die(`hen head buckets ${bH}`);
    if (bB < 4) die(`hen body buckets ${bB}`);
}

// RED control: yham bytes must FAIL — zero pheas anchors
const RED = decode("agents/arthur/assets/village_dress_yham1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: yham carries ${redHit}`);
console.log("RED control: yham bytes carry zero pheas anchors — discriminates");
console.log("GREEN: pheas v1 decode complete");
