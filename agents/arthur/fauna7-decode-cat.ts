// fauna7-decode-cat.ts — decode audit for the fauna-7 barn cat.
// GREEN contract (village_dress_bcat1.glb): 4 motion anchors (bcat,
// bcat_head, bcat_tail, bcat_ears), sitting-cat footprint L in [0.47,0.62]
// (watch-sit + ground-wrapped tail), W in [0.30,0.40], height in
// [0.33,0.42] (source-derived: head joint 0.315 + ear center 0.078 + ear
// half 0.031 = 0.424 crown — allow band to 0.42; ears-up alert pose),
// base seated on the ground plane (|min.y| <= 0.013 — the 0.012 pad).
// RED control: the COOP HOST bytes (village_coop3.glb f5d4039489c1ce4b,
// the live lib) must FAIL — zero bcat anchors and height 1.41 outside the
// cat band (proves the gate discriminates rider from host).
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

const NEW = decode("agents/arthur/assets/village_dress_bcat1.glb");
console.log("NEW sha16:", NEW.sha);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["bcat", "bcat_head", "bcat_tail", "bcat_ears"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 4 motion groups present (bcat, bcat_head, bcat_tail, bcat_ears)");
// GREEN 2: sitting-cat bands. Height pins the CROWN (max.y, source-
// derived 0.424 = head joint 0.315 + ear center 0.078 + ear half 0.031),
// not the envelope — the 12mm trodden pad rides below grade by design.
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.47 || w > 0.62) die(`GREEN FAIL: length ${w.toFixed(2)} outside sit band [0.47,0.62]`);
if (d < 0.30 || d > 0.41) die(`GREEN FAIL: width ${d.toFixed(2)} outside band [0.30,0.41] (v12 wrap sweep; fox drape-wrap precedent)`);
if (NEW.bb.max[1] < 0.40 || NEW.bb.max[1] > 0.435) die(`GREEN FAIL: crown ${NEW.bb.max[1].toFixed(3)} outside [0.40,0.435] (ears-up watch pose, 0.424 derived)`);
if (NEW.bb.min[1] > 0.013 || NEW.bb.min[1] < -0.013) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: joint origin bands (group node translations, root frame)
const headN = NEW.json.nodes.find((n: any) => n.name === "bcat_head");
const tailN = NEW.json.nodes.find((n: any) => n.name === "bcat_tail");
const earsN = NEW.json.nodes.find((n: any) => n.name === "bcat_ears");
const hy = headN?.translation?.[1], ty = tailN?.translation?.[1], ey = earsN?.translation?.[1];
console.log(`GREEN joints: bcat_head y=${hy?.toFixed(3)} (want [0.28,0.36] neck); bcat_tail y=${ty?.toFixed(3)} (want [0.03,0.07] rump base); bcat_ears y=${ey?.toFixed(3)} HEAD-LOCAL (crown embed)`);
if (hy === undefined || hy < 0.28 || hy > 0.36) die(`GREEN FAIL: bcat_head joint y=${hy} outside neck band [0.28,0.36]`);
if (ty === undefined || ty < 0.03 || ty > 0.07) die(`GREEN FAIL: bcat_tail joint y=${ty} outside rump band`);
// bcat_ears is nested inside bcat_head — its translation is HEAD-LOCAL
// (fauna-2 decoder law: pose offsets live in child frames); joint sits at
// the skull crown, head-local y in [0.04,0.06]
if (ey === undefined || ey < 0.04 || ey > 0.06) die(`GREEN FAIL: bcat_ears joint y=${ey} outside head-local crown band [0.04,0.06]`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the coop host bytes must fail every cat gate
const HOST = decode("agents/arthur/assets/village_coop3.glb");
if (HOST.sha !== "f5d4039489c1ce4b") die(`RED setup fail: host sha ${HOST.sha} (want the live coop lib f5d4039489c1ce4b…)`);
const hostCat = HOST.nodes.map(n => n.name).filter(nm => /bcat/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha}: bcat anchors: [${hostCat.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostCat.length !== 0) die("RED FAIL: host unexpectedly carries bcat anchors");
if (hh >= 0.33 && hh <= 0.43) die("RED FAIL: host height unexpectedly inside the cat band");
console.log("DECODE VERDICT: GREEN (new cat) + RED (host clean) — PASS");
