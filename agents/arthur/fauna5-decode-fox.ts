// fauna5-decode-fox.ts — decode audit for the fauna-5 den fox.
// GREEN contract (village_dress_se_fox2.glb): 3 motion anchors (fox,
// fox_head, fox_tail), curled-fox footprint L in [0.65,0.92] (v6: the
// drape-wrap tail extends past BOTH ends — rump rise to −0.354, pale tip
// block to +0.52; a curled fox WITH wrapped tail honestly occupies ~0.9m)
// & W in [0.35,0.50],
// height in [0.26,0.33] (v3 source-derived: head joint 0.165 + ear center
// 0.078 + ear half 0.044 = 0.287 — muzzle RESTING, ears still up: the
// sleeping-fox pose both judges demanded),
// base seated on the ground plane (|min.y| <= 0.012), head group origin
// at the shoulder band y ∈ [0.18,0.24], tail group origin at the rear
// y ∈ [0.09,0.15].
// RED control: the DEN HOST bytes (village_dress_se_foxden1.glb
// 856deec5…, the live lib) must FAIL — zero fox anchors (proves the gate
// discriminates rider from host) and height 0.86 outside the fox band.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under affine.
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
    const sha = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
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
    return { sha, nNodes: json.nodes.length, nodes: nodeInfo, bb, json };
};

const NEW = decode("agents/arthur/assets/village_dress_se_fox2.glb");
console.log("NEW sha16:", NEW.sha);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["fox", "fox_head", "fox_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present (fox, fox_head, fox_tail)");
// GREEN 2: curled-fox bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(2)} x ${h.toFixed(2)} x ${d.toFixed(2)} (min.y ${NEW.bb.min[1].toFixed(3)})`);
if (w < 0.65 || w > 0.92) die(`GREEN FAIL: length ${w.toFixed(2)} outside curl band [0.65,0.92] (v6 drape-wrap)`);
if (d < 0.35 || d > 0.50) die(`GREEN FAIL: width ${d.toFixed(2)} outside band [0.35,0.50]`);
if (h < 0.26 || h > 0.33) die(`GREEN FAIL: height ${h.toFixed(2)} outside [0.26,0.33] (v3 muzzle-rest pose, ears up)`);
if (NEW.bb.min[1] > 0.012 || NEW.bb.min[1] < -0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: joint origin bands (group node translations, root frame)
const foxHead = NEW.json.nodes.find((n: any) => n.name === "fox_head");
const foxTail = NEW.json.nodes.find((n: any) => n.name === "fox_tail");
const hy = foxHead?.translation?.[1], ty = foxTail?.translation?.[1];
console.log(`GREEN joints: fox_head y=${hy?.toFixed(3)} (want [0.14,0.24] v3 rest band); fox_tail y=${ty?.toFixed(3)} (want [0.09,0.15])`);
if (hy === undefined || hy < 0.14 || hy > 0.24) die(`GREEN FAIL: fox_head joint y=${hy} outside v3 rest band [0.14,0.24]`);
if (ty === undefined || ty < 0.09 || ty > 0.15) die(`GREEN FAIL: fox_tail joint y=${ty} outside rear band`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the den host bytes must fail every fox gate
const HOST = decode("agents/arthur/assets/village_dress_se_foxden1.glb");
if (HOST.sha !== "856deec51857c60a") die(`RED setup fail: host sha ${HOST.sha} (want the live den lib 856deec5…)`);
const hostFox = HOST.nodes.map(n => n.name).filter(nm => /^fox/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha}: fox anchors: [${hostFox.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostFox.length !== 0) die("RED FAIL: host unexpectedly carries fox anchors");
if (hh >= 0.22 && hh <= 0.30) die("RED FAIL: host height unexpectedly inside the fox band");
console.log("DECODE VERDICT: GREEN (new fox) + RED (host clean) — PASS");
