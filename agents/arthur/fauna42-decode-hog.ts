// fauna42-decode-hog.ts — decode audit for the fauna-42 hedgehog.
// GREEN contract (village_dress_hog1.glb): 3 motion anchors (hog,
// hog_head, hog_snout), snout NESTED in head, head nested in hog.
// Envelope bands (post-×1.5 bake + post-bake furniture at true coords):
// full-entity L in [0.68,0.84] (rump −0.19 .. litter +0.57), W in
// [0.38,0.48] (mantle ±0.11 + shadow ±0.14 + litter spread ±0.22), H in [0.14,0.23] (dome
// crown ~0.18 incl. spine wedges), base ground-seated |min.y| <= 0.012.
// Hog-body band (the animal itself, litter excluded): rear min.x in
// [−0.21,−0.16], nose max.x in [0.19,0.25] — the ×1.5 trundle.
// RED control: the HUTCH bytes (village_hutch3.glb, live lib c0a64ac4…)
// must FAIL — zero hog anchors, height 1.33 outside the hog band.
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

const NEW = decode("agents/arthur/assets/village_dress_hog1.glb");
console.log("NEW sha16:", NEW.sha16);
// per-mesh world envelope dump under the hog subtree (law 0)
{
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const hogIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hog");
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const env = (idx: number, parent: number[]) => {
        const n = NEW.json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives) {
            const acc = NEW.json.accessors[prim.attributes.POSITION];
            const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
            const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                for (let k = 0; k < 3; k++) { if (w[k] < lo[k]) lo[k] = w[k]; if (w[k] > hi[k]) hi[k] = w[k]; }
            }
        }
        for (const c of n.children ?? []) env(c, world);
    };
    env(hogIdx, I);
    console.log(`hog subtree envelope: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
    var HOG = { lo, hi };
}
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["hog", "hog_head", "hog_snout"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present");
// GREEN 2: nesting — snout in head, head in hog
const hogI = NEW.json.nodes.findIndex((n: any) => n.name === "hog");
const headI = NEW.json.nodes.findIndex((n: any) => n.name === "hog_head");
const snoutI = NEW.json.nodes.findIndex((n: any) => n.name === "hog_snout");
if (!(NEW.json.nodes[hogI].children ?? []).includes(headI)) die("GREEN FAIL: head not nested in hog");
if (!(NEW.json.nodes[headI].children ?? []).includes(snoutI)) die("GREEN FAIL: snout not nested in head");
console.log("GREEN nesting: snout->head->hog (rides the scan)");
// GREEN 3: full-entity envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.68 || w > 0.84) die(`GREEN FAIL: length ${w.toFixed(2)} outside band [0.68,0.84]`);
if (d < 0.38 || d > 0.48) die(`GREEN FAIL: width ${d.toFixed(2)} outside band [0.38,0.48]`);
if (h < 0.14 || h > 0.23) die(`GREEN FAIL: height ${h.toFixed(2)} outside band [0.14,0.23]`);
if (NEW.bb.min[1] > 0.012 || NEW.bb.min[1] < -0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 4: hog-body band (the ×1.5 trundle)
const hl = HOG.hi[0] - HOG.lo[0], hh = HOG.hi[1] - HOG.lo[1];
console.log(`GREEN hog body: len ${hl.toFixed(3)} (rear ${HOG.lo[0].toFixed(3)}, nose ${HOG.hi[0].toFixed(3)}), height ${hh.toFixed(3)}`);
if (HOG.lo[0] < -0.21 || HOG.lo[0] > -0.16) die(`GREEN FAIL: rump rear ${HOG.lo[0].toFixed(3)} outside [−0.21,−0.16]`);
if (HOG.hi[0] < 0.19 || HOG.hi[0] > 0.25) die(`GREEN FAIL: nose tip ${HOG.hi[0].toFixed(3)} outside [0.19,0.25]`);
if (hh < 0.14 || hh > 0.22) die(`GREEN FAIL: hog height ${hh.toFixed(3)} outside [0.14,0.22]`);
// GREEN 5: joint heights (root frame, post-bake)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("hog_head"), sy = jy("hog_snout");
console.log(`GREEN joints: head y=${hy?.toFixed(3)} (want [0.04,0.09]); snout y=${sy?.toFixed(3)} head-local (want [−0.02,0.005])`);
if (hy === undefined || hy < 0.04 || hy > 0.09) die(`GREEN FAIL: head joint y=${hy} outside band [0.04,0.09]`);
if (sy === undefined || sy < -0.02 || sy > 0.005) die(`GREEN FAIL: snout joint y=${sy} outside head-local band [−0.02,0.005]`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the hutch bytes must fail every hog gate
const HOST = decode("agents/arthur/assets/village_hutch3.glb");
if (HOST.sha16 !== "c0a64ac43a695f67") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live hutch lib c0a64ac4…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /hog/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: hog anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries hog anchors");
if (hhh >= 0.14 && hhh <= 0.23) die("RED FAIL: host height unexpectedly inside the hog band");
console.log("DECODE VERDICT: GREEN (new hedgehog) + RED (hutch clean) — PASS");
