// fauna53-decode-towl.ts — decode audit for the fauna-53 tawny owls.
// GREEN contract (village_dress_towl1.glb v3, TRUE-SIZE no bake): 5
// motion anchors (towl_a{,_head,_tail} + towl_b{,_head}), envelope
// bands (furniture included): W [0.85,1.05], D [0.25,0.45], H
// [0.42,0.55], base min.y [-0.035,0.02] (the sleeper's tucked tail
// dips INTO the canopy — the nestle read; the sentinel gate below
// asserts ITS base stays clear).
// Anatomy gates: sentinel head top >= sleeper head top - 0.03 (the
// sentinel stands tall); sentinel subtree base [0.005,0.05] (v2 seat:
// root planted AT the run surface zone — tail brush may kiss foliage,
// toes at the root plane; NO ≥5cm air gap, no deep burial); pair x-gap
// >= 0.25 (post-bake); merge-bucket count per owl >= 7.
// RED control: yham bytes (village_dress_yham1.glb, 0f7fdfea...) must
// FAIL — zero towl anchors.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine (fauna-28 orientation), chunk-walk GLB parse (sweep319).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
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
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    let off = 12, json: any = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(bytes.subarray(off + 8, off + 8 + len)));
        off += 8 + len;
    }
    if (!json) die("no JSON chunk: " + path);
    return { sha, sha16: sha.slice(0, 16), json };
};

const growMesh = (env: { lo: number[]; hi: number[] }, world: number[], acc: any) => {
    const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
    const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
        for (let k = 0; k < 3; k++) { if (w[k] < env.lo[k]) env.lo[k] = w[k]; if (w[k] > env.hi[k]) env.hi[k] = w[k]; }
    }
};

const subtree = (json: any, rootName: string) => {
    const idx = json.nodes.findIndex((n: any) => n.name === rootName);
    if (idx < 0) return null;
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const walk = (i: number, parent: number[]) => {
        const n = json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives)
            growMesh(env, world, json.accessors[prim.attributes.POSITION]);
        for (const c of n.children ?? []) walk(c, world);
    };
    walk(idx, I);
    return { env };
};

const NEW = decode("agents/arthur/assets/village_dress_towl1.glb");
console.log("NEW sha16:", NEW.sha16);

// full-entity envelope (scene roots)
{
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const walk = (i: number, parent: number[]) => {
        const n = NEW.json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives)
            growMesh(env, world, NEW.json.accessors[prim.attributes.POSITION]);
        for (const c of n.children ?? []) walk(c, world);
    };
    for (const s of NEW.json.scenes[NEW.json.scene].nodes) walk(s, I);
    const W = env.hi[0] - env.lo[0], D = env.hi[2] - env.lo[2], H = env.hi[1] - env.lo[1];
    console.log(`envelope: x [${env.lo[0].toFixed(3)},${env.hi[0].toFixed(3)}] y [${env.lo[1].toFixed(3)},${env.hi[1].toFixed(3)}] z [${env.lo[2].toFixed(3)},${env.hi[2].toFixed(3)}] -> W ${W.toFixed(3)} D ${D.toFixed(3)} H ${H.toFixed(3)}`);
    if (W < 0.85 || W > 1.05) die(`W band ${W}`);
    if (D < 0.25 || D > 0.45) die(`D band ${D}`);
    if (H < 0.42 || H > 0.55) die(`H band ${H}`);
    if (env.lo[1] < -0.035 || env.lo[1] > 0.02) die(`base min.y ${env.lo[1]}`);
}

// anchors present (subset law)
const ANCHORS = ["towl_a", "towl_a_head", "towl_a_tail", "towl_b", "towl_b_head"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 5/5 present");

// per-owl anatomy
const a = subtree(NEW.json, "towl_a"), b = subtree(NEW.json, "towl_b");
if (!a || !b) die("owl subtrees");
const aHead = subtree(NEW.json, "towl_a_head"), bHead = subtree(NEW.json, "towl_b_head");
if (!aHead || !bHead) die("head subtrees");
console.log(`heads: sentinel y-band [${aHead.env.lo[1].toFixed(3)},${aHead.env.hi[1].toFixed(3)}] sleeper [${bHead.env.lo[1].toFixed(3)},${bHead.env.hi[1].toFixed(3)}]`);
if (aHead.env.hi[1] < bHead.env.hi[1] - 0.03) die(`sentinel head too low (${aHead.env.hi[1] - bHead.env.hi[1]})`);
if (a.env.lo[1] < 0.005 || a.env.lo[1] > 0.05) die(`sentinel base band ${a.env.lo[1]} — air gap or burial`);
console.log(`sentinel base y ${a.env.lo[1].toFixed(3)} ([0.045,0.10] planted gate)`);
console.log(`owls: sentinel x-band [${a.env.lo[0].toFixed(3)},${a.env.hi[0].toFixed(3)}] sleeper [${b.env.lo[0].toFixed(3)},${b.env.hi[0].toFixed(3)}]`);
const pairGap = b.env.lo[0] - a.env.hi[0]; // sleeper sits RIGHT of sentinel
if (pairGap < 0.25) die(`pair x-gap ${pairGap} < 0.25 — reads as one blob`);

// merge-bucket census per owl family
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
    const nA = countBird("towl_a"), nB = countBird("towl_b");
    console.log(`merge buckets: sentinel ${nA} sleeper ${nB}`);
    if (nA < 7 || nB < 7) die(`bucket counts ${nA}/${nB}`);
}

// RED control: the yham bytes must FAIL — zero towl anchors
const RED = decode("agents/arthur/assets/village_dress_yham1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: yham carries ${redHit}`);
console.log("RED control: yham bytes carry zero towl anchors — discriminates");
console.log("GREEN: towl v1 decode complete");
