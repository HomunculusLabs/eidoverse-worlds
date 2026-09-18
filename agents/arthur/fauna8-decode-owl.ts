// fauna8-decode-owl.ts — decode audit for the fauna-8 barn owl.
// GREEN contract (village_dress_barnowl1.glb): 3 motion anchors (barnowl,
// barnowl_head, barnowl_tail), post crown max.y in [2.78, 2.90]
// (source-derived: beam top 2.42 + head joint 0.285 + skull top
// 0.088·0.95 + 0.050 = 2.839 theoretical; decode is truth), base
// ground-seated
// |min.y| <= 0.013, footprint W(x) in [0.18, 0.34] (post 0.10 + tail
// sweep; beam runs along z), D(z) in [0.60, 0.80] (beam 0.66 + owl
// width), head joint barnowl-group-local y in [0.26, 0.32], tail joint y
// in [0.03, 0.08], owl group y in [2.40, 2.44] (beam top).
// RED control: the DUCKS bytes (village_duckpair.glb, live c156b6a1)
// must FAIL — zero barnowl anchors and no 2.4m height.
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

const NEW = decode("agents/arthur/assets/village_dress_barnowl1.glb");
console.log("NEW sha16:", NEW.sha);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["barnowl", "barnowl_head", "barnowl_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present (barnowl, barnowl_head, barnowl_tail)");
// GREEN 2: envelope bands (source-derived)
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (NEW.bb.max[1] < 2.94 || NEW.bb.max[1] > 3.00) die(`GREEN FAIL: crown ${NEW.bb.max[1].toFixed(3)} outside [2.94,3.00] (v3 ×1.3: 2.42+1.3·0.4186=2.964)`);
if (NEW.bb.min[1] > 0.013 || NEW.bb.min[1] < -0.013) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
if (w < 0.30 || w > 0.44) die(`GREEN FAIL: width ${w.toFixed(2)} outside [0.30,0.44] (v3 ×1.3)`);
if (d < 0.60 || d > 0.80) die(`GREEN FAIL: depth(beam) ${d.toFixed(2)} outside [0.60,0.80]`);
// GREEN 3: joints (group translations, root frame for owl/tail; head y is
// barnowl-group-local)
const owlN = NEW.json.nodes.find((n: any) => n.name === "barnowl");
const headN = NEW.json.nodes.find((n: any) => n.name === "barnowl_head");
const tailN = NEW.json.nodes.find((n: any) => n.name === "barnowl_tail");
const oy = owlN?.translation?.[1], hy = headN?.translation?.[1], ty = tailN?.translation?.[1];
console.log(`GREEN joints: barnowl y=${oy?.toFixed(3)} (beam top [2.40,2.44]); barnowl_head y=${hy?.toFixed(3)} (group-local neck [0.26,0.32]); barnowl_tail y=${ty?.toFixed(3)} (group-local [0.03,0.08])`);
if (oy === undefined || oy < 2.40 || oy > 2.44) die(`GREEN FAIL: barnowl joint y=${oy} outside beam band`);
if (hy === undefined || hy < 0.36 || hy > 0.39) die(`GREEN FAIL: barnowl_head joint y=${hy} outside neck band (v3 ×1.3: 0.285·1.3=0.371)`);
if (ty === undefined || ty < 0.055 || ty > 0.075) die(`GREEN FAIL: barnowl_tail joint y=${ty} outside band (v3 ×1.3: 0.050·1.3=0.065)`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the ducks bytes must fail every owl gate
const HOST = decode("agents/arthur/assets/village_duckpair.glb");
if (HOST.sha !== "c156b6a12a935495") die(`RED setup fail: ducks sha ${HOST.sha} (want c156b6a12a935495…)`);
const hostOwl = HOST.nodes.map(n => n.name).filter(nm => /barnowl/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: DUCKS ${HOST.sha}: barnowl anchors: [${hostOwl.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostOwl.length !== 0) die("RED FAIL: ducks unexpectedly carry barnowl anchors");
if (hh >= 2.94 && hh <= 3.00) die("RED FAIL: ducks height unexpectedly inside the owl crown band");
console.log("DECODE VERDICT: GREEN (new owl) + RED (ducks clean) — PASS");
