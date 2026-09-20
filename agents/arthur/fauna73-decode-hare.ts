// fauna73-decode-hare.ts — decode audit for the fauna-73 brown hare.
// GREEN contract (village_dress_hare1.glb): 6 motion anchors (hare_a,
// hare_a_head, hare_a_ears, hare_b, hare_b_head, hare_b_ears).
// Envelope bands (re-derived from authored dims): pair span L in
// [1.45,1.65] (sentinel rear ~-0.725 to form-blade front ~0.825), W in
// [0.70,0.90] (the form dish is the widest member: z -0.485..0.346),
// H in [0.72,0.88] (sentinel black-tipped ear crest ~0.80 — the 18m
// marker), base ground-seated |min.y| <= 0.012. Sentinel head joint y
// in [0.48,0.60]; flat-one head joint y in [0.04,0.11]; ears head-local
// y in [0.02,0.08]. RED control: the WRABBIT bytes
// (village_dress_wrabbit1.glb, live lib 57edb8a9b7cc076b) must FAIL —
// zero hare anchors and height 0.52 outside the hare band.
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

const NEW = decode("agents/arthur/assets/village_dress_hare1.glb");
console.log("NEW sha16:", NEW.sha16);
// per-mesh world envelope dump (law 0: unexplained envelope numbers get
// probed, not waived)
{
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const env = (idx: number, parent: number[]): any => {
        const n = NEW.json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives) {
            const acc = NEW.json.accessors[prim.attributes.POSITION];
            const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
            const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                for (let k = 0; k < 3; k++) { if (w[k] < lo[k]) lo[k] = w[k]; if (w[k] > hi[k]) hi[k] = w[k]; }
            }
        }
        console.log(`  mesh ${n.name ?? idx}: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
        for (const c of n.children ?? []) env(c, world);
    };
    for (const s of NEW.json.scenes[NEW.json.scene].nodes) env(s, I);
}
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["hare_a", "hare_a_head", "hare_a_ears", "hare_b", "hare_b_head", "hare_b_ears"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 6 motion groups present");
// GREEN 2: envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min [${NEW.bb.min.map(v => v.toFixed(3))}] max [${NEW.bb.max.map(v => v.toFixed(3))}])`);
console.log(`ENTITY OBB: CX ${((NEW.bb.min[0] + NEW.bb.max[0]) / 2).toFixed(4)}, CZ ${((NEW.bb.min[2] + NEW.bb.max[2]) / 2).toFixed(4)}, HW ${(w / 2).toFixed(4)}, HD ${(d / 2).toFixed(4)}`);
if (w < 1.45 || w > 1.65) die(`GREEN FAIL: length ${w.toFixed(2)} outside band [1.45,1.65]`);
if (d < 0.70 || d > 0.90) die(`GREEN FAIL: width ${d.toFixed(2)} outside band [0.70,0.90]`);
if (h < 0.72 || h > 0.88) die(`GREEN FAIL: height ${h.toFixed(2)} outside band [0.72,0.88]`);
if (NEW.bb.min[1] > 0.012 || NEW.bb.min[1] < -0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: joint heights (root frame)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const ayh = jy("hare_a_head"), byh = jy("hare_b_head"), aeh = jy("hare_a_ears"), beh = jy("hare_b_ears");
console.log(`GREEN joints: a_head y=${ayh?.toFixed(3)} (want [0.48,0.60]); b_head y=${byh?.toFixed(3)} (want [0.04,0.11]); a_ears y=${aeh?.toFixed(3)}, b_ears y=${beh?.toFixed(3)} HEAD-LOCAL`);
if (ayh === undefined || ayh < 0.48 || ayh > 0.60) die(`GREEN FAIL: a_head joint y=${ayh} outside band [0.48,0.60]`);
if (byh === undefined || byh < 0.04 || byh > 0.11) die(`GREEN FAIL: b_head joint y=${byh} outside band [0.04,0.11]`);
if (aeh === undefined || aeh < 0.02 || aeh > 0.08) die(`GREEN FAIL: a_ears joint y=${aeh} outside head-local band [0.02,0.08]`);
if (beh === undefined || beh < 0.02 || beh > 0.08) die(`GREEN FAIL: b_ears joint y=${beh} outside head-local band [0.02,0.08]`);
// nesting: ears nested in heads (ride the scans)
const ahIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hare_a_head");
const aeIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hare_a_ears");
if (!(NEW.json.nodes[ahIdx].children ?? []).includes(aeIdx)) die("GREEN FAIL: a_ears not nested in a_head");
const bhIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hare_b_head");
const beIdx = NEW.json.nodes.findIndex((n: any) => n.name === "hare_b_ears");
if (!(NEW.json.nodes[bhIdx].children ?? []).includes(beIdx)) die("GREEN FAIL: b_ears not nested in b_head");
console.log("GREEN nesting: both ear groups nested in their heads (ride the scans)");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the wrabbit bytes must fail every hare gate
const HOST = decode("agents/arthur/assets/village_dress_wrabbit1.glb");
if (HOST.sha16 !== "57edb8a9b7cc076b") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live wrabbit lib 57edb8a9…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /hare/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: hare anchors: [${hostR.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries hare anchors");
if (hh >= 0.72 && hh <= 0.88) die("RED FAIL: host height unexpectedly inside the hare band");
console.log("DECODE VERDICT: GREEN (new pair) + RED (wrabbit clean) — PASS");
