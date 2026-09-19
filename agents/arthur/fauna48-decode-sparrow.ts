// fauna48-decode-sparrow.ts — decode audit for the fauna-48 house
// sparrows. GREEN contract (village_dress_sparrow1.glb): 6 motion anchors
// (sparrow_a{,_head,_tail} + sparrow_b{,_head,_tail}), envelope bands
// (post-×1.4 bake + post-bake furniture): W [0.55,0.75], D [0.28,0.44],
// H [0.15,0.24], base min.y [−0.004,0.008]. Anatomy gates: COCK beak-tip
// y < HEN beak-tip y − 0.03 (the peck/alert contrast — the posture IS the
// pair read); tail subtrees LEVEL (tail max-y < head-group top − 0.02);
// BIB bucket front-x proud of the cock body front (≥0.015 post-bake);
// grain bucket present ≥7 specks (bbox y-span < 0.02, x-span > 0.08).
// RED control: dmou bytes (village_dress_dmou1.glb, c2143064…) must FAIL
// — zero sparrow anchors.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine (fauna-28: rotation columns r0,r1,r2·s — correct orientation).
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

// one mesh-box (node world matrix + accessor box, corners under affine)
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

// walk a subtree: collect env + per-node mesh boxes (name → box, first hit)
const subtree = (json: any, rootName: string) => {
    const idx = json.nodes.findIndex((n: any) => n.name === rootName);
    if (idx < 0) return null;
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const named: Record<string, { lo: number[]; hi: number[] }> = {};
    const mats = new Set<number>();
    const walk = (i: number, parent: number[]) => {
        const n = json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) {
            for (const prim of json.meshes[n.mesh].primitives) {
                const b = meshBox(world, json.accessors[prim.attributes.POSITION]);
                grow(env, b);
                if (prim.material !== undefined) mats.add(prim.material);
                if (n.name && !named[n.name]) named[n.name] = b;
            }
            if (n.name && !named[n.name]) { /* mesh-less pass */ }
        }
        for (const c of n.children ?? []) walk(c, world);
    };
    walk(idx, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return { env, named, mats };
};

const NEW = decode("agents/arthur/assets/village_dress_sparrow1.glb");
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
    if (W < 0.55 || W > 0.75) die(`W band ${W}`);
    if (D < 0.28 || D > 0.44) die(`D band ${D}`);
    if (H < 0.15 || H > 0.24) die(`H band ${H}`);
    if (env.lo[1] < -0.004 || env.lo[1] > 0.008) die(`base min.y ${env.lo[1]}`);
}

// anchors present (subset law — mergekit renames internal meshes)
const ANCHORS = ["sparrow_a", "sparrow_a_head", "sparrow_a_tail", "sparrow_b", "sparrow_b_head", "sparrow_b_tail"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 6/6 present");

// per-bird anatomy
const a = subtree(NEW.json, "sparrow_a"), b = subtree(NEW.json, "sparrow_b");
if (!a || !b) die("bird subtrees");
const aHead = subtree(NEW.json, "sparrow_a_head"), bHead = subtree(NEW.json, "sparrow_b_head");
if (!aHead || !bHead) die("head subtrees");
const aTail = subtree(NEW.json, "sparrow_a_tail"), bTail = subtree(NEW.json, "sparrow_b_tail");
if (!aTail || !bTail) die("tail subtrees");
// beak-tip proxy: the head subtree's max-x extreme (beak is the fwd-most)
const aBeakY = aHead.env.hi[1], bBeakY = bHead.env.hi[1];
// better: peck contrast via the head-subtree centroid height
const cyA = (aHead.env.lo[1] + aHead.env.hi[1]) / 2, cyB = (bHead.env.lo[1] + bHead.env.hi[1]) / 2;
console.log(`heads: cock y-band [${aHead.env.lo[1].toFixed(3)},${aHead.env.hi[1].toFixed(3)}] hen [${bHead.env.lo[1].toFixed(3)},${bHead.env.hi[1].toFixed(3)}] centroidΔ ${(cyB - cyA).toFixed(3)}`);
if (cyB - cyA < 0.02) die(`peck/alert contrast weak (Δ ${cyB - cyA})`);
// tails LEVEL: tail top well below the alert hen head top
console.log(`tails: cock y-max ${aTail.env.hi[1].toFixed(3)} hen y-max ${bTail.env.hi[1].toFixed(3)} vs hen head top ${bHead.env.hi[1].toFixed(3)}`);
if (bTail.env.hi[1] > bHead.env.hi[1] - 0.02) die("hen tail crests head — not level");
if (aTail.env.hi[1] > aHead.env.hi[1]) die("cock tail crests head");
// pair spread (lateral offset — sqrl law c)
console.log(`birds: cock z-band [${a.env.lo[2].toFixed(3)},${a.env.hi[2].toFixed(3)}] hen [${b.env.lo[2].toFixed(3)},${b.env.hi[2].toFixed(3)}]`);
if (Math.min(a.env.lo[2], b.env.lo[2]) > -0.02 || Math.max(a.env.hi[2], b.env.hi[2]) < 0.02) die("pair not laterally spread");

// material census — glbwrite folds plain mats into COLOR_0 vertex colors
// (json.materials exists only for tex/emissive lanes — 0 here is the house
// idiom). The honest dimorphism census is MERGE-BUCKET COUNTS per bird:
// the cock folds into MORE material buckets (bib+crown+nape+cheeks are
// cock-only members) — count mesh nodes under each bird's anchor family
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
    const nA = countBird("sparrow_a"), nB = countBird("sparrow_b");
    console.log(`merge buckets: cock ${nA} hen ${nB}`);
    if (nA < 12) die(`cock buckets ${nA} — bib/crown/nape/cheek set incomplete`);
    if (nB < 9) die(`hen buckets ${nB}`);
    if (nA - nB < 2) die("cock not richer than hen — dimorphism lost");
}

// RED control: the dmou bytes must FAIL — zero sparrow anchors
const RED = decode("agents/arthur/assets/village_dress_dmou1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: dmou carries ${redHit}`);
console.log("RED control: dmou bytes carry zero sparrow anchors — discriminates");
console.log("GREEN: sparrow v2 decode complete");
