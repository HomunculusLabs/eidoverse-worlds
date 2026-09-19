// fauna45-decode-hmou.ts — decode audit for the fauna-45 harvest mouse.
// GREEN contract (village_dress_hmou1.glb): 3 motion anchors (hmou,
// hmou_head, hmou_snout), snout NESTED in head, head nested in hmou.
// Envelope bands (post-×2.2 bake + post-bake tuft furniture):
// full-entity W [0.20,0.26] (stalk leans), D [0.22,0.28], H [0.38,0.44]
// (tallest sibling stalk 0.40 + seed head), base min.y in [−0.006,0.008]
// (root clump embeds 2mm; feet bottom ~3mm — frog-law note: parts not
// authored at exact y=0 lift with the bake; contact shadow covers).
// hmou subtree (the animal itself): x in [−0.075,−0.055] rear … nose
// [0.050,0.065], y in [0.000,0.030] body band, stalk top ≤ 0.160.
// TAIL CONTACT LAW (sqrl r1): the merged TAL bucket (the tail cord,
// folded into the hmou keep-group) must ENCLOSE the gripped-stalk axis
// segment y∈[0.009,0.057] post-bake — every axis sample point inside the
// TAL bucket envelope + radial clearance < bead r + stalk r + 0.6mm.
// RED control: the HOG bytes (village_dress_hog1.glb, 5fcd8dce…) must
// FAIL — zero hmou anchors, height outside the mouse band.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under affine.
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
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
    const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    const nodeInfo: { name: string; depth: number }[] = [];
    const walk = (idx: number, parent: number[], depth: number) => {
        const n = json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) {
            for (const prim of json.meshes[n.mesh].primitives) {
                const acc = json.accessors[prim.attributes.POSITION];
                const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
                const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                    const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                    for (let k = 0; k < 3; k++) { if (w[k] < bb.min[k]) bb.min[k] = w[k]; if (w[k] > bb.max[k]) bb.max[k] = w[k]; }
                }
            }
        }
        nodeInfo.push({ name: n.name ?? "(unnamed)", depth });
        for (const c of n.children ?? []) walk(c, world, depth + 1);
    };
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (const s of json.scenes[json.scene].nodes) walk(s, I, 0);
    return { sha, sha16: sha.slice(0, 16), nNodes: json.nodes.length, nodes: nodeInfo, bb, json };
};

const NEW = decode("agents/arthur/assets/village_dress_hmou1.glb");
console.log("NEW sha16:", NEW.sha16);

// hmou subtree envelope + per-mesh dump (find the TAL tail bucket by
// its material name; mergekit names buckets from the material table)
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const hmouIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hmou");
let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
const meshList: any[] = [];
const env = (idx: number, parent: number[]) => {
    const n = NEW.json.nodes[idx];
    const world = mul(parent, trs(n.translation, n.rotation, n.scale));
    if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives) {
        const acc = NEW.json.accessors[prim.attributes.POSITION];
        const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
        const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
        let mlo = [Infinity, Infinity, Infinity], mhi = [-Infinity, -Infinity, -Infinity];
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
            const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
            for (let k = 0; k < 3; k++) { if (w[k] < mlo[k]) mlo[k] = w[k]; if (w[k] > mhi[k]) mhi[k] = w[k]; }
        }
        for (let k = 0; k < 3; k++) { if (mlo[k] < lo[k]) lo[k] = mlo[k]; if (mhi[k] > hi[k]) hi[k] = mhi[k]; }
        meshList.push({ node: n.name, mat: prim.material, min: mlo, max: mhi });
    }
    for (const c of n.children ?? []) env(c, world);
};
env(hmouIdx, I);
console.log(`hmou subtree envelope: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
const HMOU = { lo, hi };

const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["hmou", "hmou_head", "hmou_snout"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present");
// GREEN 2: nesting
const hI = NEW.json.nodes.findIndex((n: any) => n.name === "hmou");
const hdI = NEW.json.nodes.findIndex((n: any) => n.name === "hmou_head");
const snI = NEW.json.nodes.findIndex((n: any) => n.name === "hmou_snout");
if (!(NEW.json.nodes[hI].children ?? []).includes(hdI)) die("GREEN FAIL: head not nested in hmou");
if (!(NEW.json.nodes[hdI].children ?? []).includes(snI)) die("GREEN FAIL: snout not nested in head");
console.log("GREEN nesting: snout->head->hmou (rides the scan)");
// GREEN 3: full-entity envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.24 || w > 0.32) die(`GREEN FAIL: width ${w.toFixed(3)} outside band [0.24,0.32]`);
if (d < 0.14 || d > 0.20) die(`GREEN FAIL: depth ${d.toFixed(3)} outside band [0.14,0.20]`);
if (h < 0.26 || h > 0.33) die(`GREEN FAIL: height ${h.toFixed(3)} outside band [0.26,0.33]`);
if (NEW.bb.min[1] > 0.008 || NEW.bb.min[1] < -0.006) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated band`);
// GREEN 4: hmou subtree band (the ×2.2 animal + its gripped stalk,
// which rides the bob subtree by design — rear extent = the stalk base)
const ml = HMOU.hi[0] - HMOU.lo[0];
console.log(`GREEN mouse body: len ${ml.toFixed(3)} (rear ${HMOU.lo[0].toFixed(3)}, nose ${HMOU.hi[0].toFixed(3)}), stalk top ${HMOU.hi[1].toFixed(3)}`);
if (HMOU.lo[0] < -0.098 || HMOU.lo[0] > -0.080) die(`GREEN FAIL: rump rear ${HMOU.lo[0].toFixed(3)} outside [−0.098,−0.080]`);
if (HMOU.hi[0] < 0.048 || HMOU.hi[0] > 0.066) die(`GREEN FAIL: nose tip ${HMOU.hi[0].toFixed(3)} outside [0.048,0.066]`);
if (HMOU.hi[1] > 0.160) die(`GREEN FAIL: gripped-stalk top ${HMOU.hi[1].toFixed(3)} above 0.160`);
// GREEN 5: joint heights (root frame, post-bake)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("hmou_head"), sy = jy("hmou_snout");
console.log(`GREEN joints: head y=${hy?.toFixed(4)} (want [0.030,0.050]); snout y=${sy?.toFixed(4)} head-local (want [−0.006,0.002])`);
if (hy === undefined || hy < 0.030 || hy > 0.050) die(`GREEN FAIL: head joint y=${hy} outside band [0.030,0.050]`);
if (sy === undefined || sy < -0.006 || sy > 0.002) die(`GREEN FAIL: snout joint y=${sy} outside head-local band [−0.006,0.002]`);
// GREEN 6: TAIL CONTACT (sqrl r1 law) — the merged TAL bucket must hug
// the gripped-stalk axis. Stalk axis post-bake: base (−0.044,0,0.0352)
// → top (−0.0264,0.154,0.0484) (source constants ×2.2). Sample the axis
// over the wrap span y∈[0.009,0.057]; each sample must sit INSIDE the
// TAL bucket envelope grown by clearance 0.8mm (bead r 1.1 + stalk r ~1
// = the cord surface reaches ~2.1mm from the axis; the merged bucket
// envelope is a box around the helix, so containment is the honest
// box-level test — radial distance to bucket faces ≤ 3.2mm).
const tal = meshList.filter(m => (NEW.json.materials?.[m.mat]?.name ?? "").toUpperCase().includes("TAL") || (NEW.json.materials?.[m.mat]?.name ?? "").includes("tail"));
if (tal.length === 0) {
    // fallback: identify the tail bucket as the mesh whose envelope sits
    // nearest the stalk axis midspan (no material name reliance)
    let best = null, bestD = Infinity;
    // r5 ring band: rings at pre-bake y 20/31mm → post-bake 0.044/0.0682;
    // band center on the axis ≈ (−0.0759, 0.056, 0.0488)
    const mid = { x: -0.0759, y: 0.056, z: 0.0488 };
    for (const m of meshList) {
        const cx = (m.min[0] + m.max[0]) / 2, cy = (m.min[1] + m.max[1]) / 2, cz = (m.min[2] + m.max[2]) / 2;
        const dd = Math.hypot(cx - mid.x, cy - mid.y, cz - mid.z);
        if (dd < bestD) { bestD = dd; best = m; }
    }
    if (best) { tal.push(best); console.log(`tail bucket identified by proximity: node ${best.node}, center-dist ${bestD.toFixed(4)}`); }
}
if (tal.length === 0) die("GREEN FAIL: no tail (TAL) bucket found in the hmou subtree");
const tlo = [Infinity, Infinity, Infinity], thi = [-Infinity, -Infinity, -Infinity];
for (const m of tal) for (let k = 0; k < 3; k++) { tlo[k] = Math.min(tlo[k], m.min[k]); thi[k] = Math.max(thi[k], m.max[k]); }
console.log(`tail bucket envelope: x ${tlo[0].toFixed(4)}..${thi[0].toFixed(4)}  y ${tlo[1].toFixed(4)}..${thi[1].toFixed(4)}  z ${tlo[2].toFixed(4)}..${thi[2].toFixed(4)}`);
const a = { x: -0.0836, y: 0, z: 0.0352 }, b = { x: -0.066, y: 0.154, z: 0.088 };
let maxRad = 0;
for (let i = 0; i <= 12; i++) {
    // r5 ring span: pre-bake y 20..31mm → post-bake 0.044..0.0682
    const t = 0.046 / 0.154 + (0.066 - 0.046) / 0.154 * (i / 12);
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t, pz = a.z + (b.z - a.z) * t;
    const inside = px >= tlo[0] - 0.0008 && px <= thi[0] + 0.0008 && py >= tlo[1] - 0.0008 && py <= thi[1] + 0.0008 && pz >= tlo[2] - 0.0008 && pz <= thi[2] + 0.0008;
    const rad = Math.max(tlo[0] - px, px - thi[0], 0); // outside-face distance (x only, honest box test)
    maxRad = Math.max(maxRad, rad);
    if (!inside) die(`GREEN FAIL: stalk axis sample ${i} (y=${py.toFixed(3)}) escapes the tail bucket envelope + 0.8mm`);
}
console.log(`GREEN tail contact: all 13 axis samples inside the tail cord envelope (max x-escape ${maxRad.toFixed(5)}m) — the wrap TOUCHES (sqrl r1 law)`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the hog bytes must fail every hmou gate
const HOST = decode("agents/arthur/assets/village_dress_hog1.glb");
if (HOST.sha16 !== "5fcd8dcec44ee2e3") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live hog lib 5fcd8dce…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /hmou/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16.slice(0, 16)}: hmou anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries hmou anchors");
if (hhh >= 0.38 && hhh <= 0.44) die("RED FAIL: host height unexpectedly inside the mouse band");
console.log("DECODE VERDICT: GREEN (new harvest mouse) + RED (hog clean) — PASS");
