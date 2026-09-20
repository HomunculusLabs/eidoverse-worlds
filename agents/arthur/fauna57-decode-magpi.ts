// fauna57-decode-magpi.ts — decode audit for the fauna-57 magpie.
// GREEN contract (village_dress_magpi1.glb): 3 motion anchors (magpi,
// magpi_tail); envelope bands W [0.60,0.90] D [0.14,0.30] (SINGLE bird —
// not a pair; the authored wing-panel crest ±0.0634·1.4 = ±0.089 sets
// the true width) H [0.15,0.28] base min.y [−0.006,0.012]; 4 anchors
// (magpi planted-feet root, magpi_body hop anchor, head, tail); THE LONG
// magpi_tail subtree x-span ≥ 0.30 (the 18m silhouette lock — a magpie
// at distance IS a long tail); COCKED law: tail tip (y-max) ≥ 0.140
// with root band (y-min) ≤ 0.105 — the tip rides ABOVE the rump line;
// WHITE-READ law: the magpi body family carries ≥3 WHITE buckets
// (belly + flanks + wing panels — the distance marker set), head family
// ≥3 (black skull/neck, bill, eye), tail family EXACTLY 3 (black vane
// + green sheen + purple sheen — the two sheen bands prove as distinct
// buckets). RED control: sparrow bytes must FAIL — zero magpi anchors.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine (fauna-28).
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
    const r = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
               2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
               2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy)];
    // STANDARD row-major (peahen law f re-confirmed: the fauna55 chassis
    // carried the TRANSPOSED block — r[1]/r[3], r[2]/r[6], r[5]/r[7]
    // swapped; all fauna-55 checks were rotation-symmetric so it slept.
    // First asymmetric check (the COCKED gate) woke it; validated against
    // the three.js Box3 probe fauna57-tailsign-probe.ts).
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

const NEW = decode("agents/arthur/assets/village_dress_magpi1.glb");
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
    if (W < 0.60 || W > 0.90) die(`W band ${W}`);
    if (D < 0.14 || D > 0.30) die(`D band ${D}`);
    if (H < 0.15 || H > 0.28) die(`H band ${H}`);
    if (env.lo[1] < -0.006 || env.lo[1] > 0.012) die(`base min.y ${env.lo[1]}`);
    CX = (env.lo[0] + env.hi[0]) / 2; CZ = (env.lo[2] + env.hi[2]) / 2;
    HW = W / 2; HD = D / 2;
    console.log(`solid OBB (entity-local): center (${CX.toFixed(4)}, ${CZ.toFixed(4)}) half (${HW.toFixed(4)}, ${HD.toFixed(4)})`);
}

// anchors present (subset law)
const ANCHORS = ["magpi", "magpi_body", "magpi_head", "magpi_tail"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 4/4 present");

// THE LONG TAIL LOCK (x-span ≥ 0.30) + COCKED law
const tt = subtree(NEW.json, "magpi_tail")!;
const spanT = tt.env.hi[0] - tt.env.lo[0];
console.log(`tail x-span ${spanT.toFixed(3)} (≥0.30) | tail y [${tt.env.lo[1].toFixed(3)},${tt.env.hi[1].toFixed(3)}] — tip ${tt.env.hi[1].toFixed(3)} ≥ 0.140, root ${tt.env.lo[1].toFixed(3)} ≤ 0.105`);
if (spanT < 0.30) die(`tail too short: ${spanT}`);
if (tt.env.hi[1] < 0.140) die(`tail not cocked: tip y ${tt.env.hi[1]}`);
if (tt.env.lo[1] > 0.105) die(`tail root too high: ${tt.env.lo[1]}`);

// head subtree: proud bill (x-max ≥ 0.19 post-bake)
const hh = subtree(NEW.json, "magpi_head")!;
console.log(`head x [${hh.env.lo[0].toFixed(3)},${hh.env.hi[0].toFixed(3)}] y-max ${hh.env.hi[1].toFixed(3)}`);
if (hh.env.hi[0] < 0.19) die(`head/bill not proud: ${hh.env.hi[0]}`);

// merge-bucket census per anchor family (NESTED-FAMILY LAW: countFam
// "magpi" would swallow magpi_body/_head/_tail buckets — count the
// BODY family from magpi_body, and magpi's own buckets as exact-name
// + N-suffixed only)
{
    const countFam = (prefix: string) => {
        let n = 0;
        for (const node of NEW.json.nodes) {
            const nm = node.name ?? "";
            if (node.mesh !== undefined && (nm === prefix || nm.startsWith(`${prefix}_`))) n++;
        }
        return n;
    };
    const countRoot = (prefix: string, exclude: string[]) => {
        let n = 0;
        for (const node of NEW.json.nodes) {
            const nm = node.name ?? "";
            if (node.mesh === undefined) continue;
            if (nm === prefix || (nm.startsWith(`${prefix}_`) && !exclude.some((x) => nm === x || nm.startsWith(`${x}_`) || /^[A-Z]/.test(nm.slice(prefix.length + 1))))) n++;
        }
        return n;
    };
    // magpi root buckets: exact + _N merges only (legs/toes = 1 bucket LEG)
    let rootB = 0;
    for (const node of NEW.json.nodes) {
        const nm = node.name ?? "";
        if (node.mesh !== undefined && nm === "magpi") rootB++;
        else if (node.mesh !== undefined && nm.startsWith("magpi_") && /^\d/.test(nm.slice(6))) rootB++;
    }
    const bB = countFam("magpi_body"), bH = countFam("magpi_head"), bT = countFam("magpi_tail");
    console.log(`buckets: root(feet) ${rootB} body ${bB} head ${bH} tail ${bT}`);
    if (rootB < 1) die(`root buckets ${rootB} — planted legs missing`);
    if (bB < 4) die(`body buckets ${bB} — white marker set incomplete`);
    // body family = BLACK + WHITE + GREEN sheen + RUMP (4); the LEG
    // bucket rides the planted root since the magpi_body restructure
    if (bH < 3) die(`head buckets ${bH}`);
    if (bT !== 3) die(`tail buckets ${bT} — must be exactly black+green+purple`);
}

// RED control: sparrow bytes must FAIL — zero magpi anchors
const RED = decode("agents/arthur/assets/village_dress_sparrow1.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: sparrow carries ${redHit}`);
console.log("RED control: sparrow bytes carry zero magpi anchors — discriminates");
console.log("GREEN: magpi v2 decode complete");
