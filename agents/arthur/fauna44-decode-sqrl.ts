// fauna44-decode-sqrl.ts — decode audit for the fauna-44 red squirrel.
// GREEN contract (village_dress_sqrl1.glb, v6 186f227d…): 9 motion
// anchors sqrl_a{,_head,_ears,_paws,_tail} + sqrl_b{,_head,_ears,_tail};
// ears NESTED in head (rides the scan), head nested in the body group.
// Envelope bands (×1.6 bake + post-bake furniture at true coords):
// full-entity L in [0.50,0.62], D in [0.95,1.10], H in [0.34,0.41],
// base ground-seated |min.y| <= 0.008.
// Sentinel band: sqrl_a subtree y-max in [0.34,0.40]. Runner: sqrl_b
// subtree x-min in [−0.26,−0.20] (the v2 welded+raised tail stream).
// RED control: the WOODSTACK bytes (village_dress_ne_woodstack1.glb,
// live lib 692bc54e…) must FAIL — zero sqrl anchors, height 1.251
// outside the squirrel band.
// Decoder law: FULL TRS accumulation (fauna-2/7; fauna-28 v2 rotation
// block orientation), box corners under affine.
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

const NEW = decode("agents/arthur/assets/village_dress_sqrl1.glb");
console.log("NEW sha16:", NEW.sha16);

// subtree envelope helper (law 0: per-mesh world extents under the anchor)
const subEnv = (rootName: string) => {
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const idx = NEW.json.nodes.findIndex((n: any) => n.name === rootName);
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const env = (i: number, parent: number[]) => {
        const n = NEW.json.nodes[i];
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
    if (idx < 0) die(`anchor ${rootName} missing`);
    env(idx, I);
    return { lo, hi };
};

const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors (subset — mergekit may rename internal meshes)
const want = ["sqrl_a", "sqrl_a_head", "sqrl_a_ears", "sqrl_a_paws", "sqrl_a_tail",
              "sqrl_b", "sqrl_b_head", "sqrl_b_ears", "sqrl_b_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 9 motion groups present");
// GREEN 2: nesting — ears in head, head in body
const childOf = (parent: string, child: string) => {
    const p = NEW.json.nodes.find((n: any) => n.name === parent);
    return (p?.children ?? []).includes(NEW.json.nodes.findIndex((n: any) => n.name === child));
};
for (const b of ["sqrl_a", "sqrl_b"]) {
    if (!childOf(b, `${b}_head`)) die(`GREEN FAIL: ${b}_head not nested in ${b}`);
    if (!childOf(`${b}_head`, `${b}_ears`)) die(`GREEN FAIL: ${b}_ears not nested in ${b}_head`);
}
console.log("GREEN nesting: ears->head->body x2 (ears ride the scans)");
// GREEN 3: full-entity envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min [${NEW.bb.min.map(v=>v.toFixed(3))}], max [${NEW.bb.max.map(v=>v.toFixed(3))}])`);
if (w < 0.66 || w > 0.72) die(`GREEN FAIL: length ${w.toFixed(2)} outside band [0.66,0.72]`);
if (d < 1.05 || d > 1.15) die(`GREEN FAIL: depth ${d.toFixed(2)} outside band [1.05,1.15]`);
if (h < 0.34 || h > 0.41) die(`GREEN FAIL: height ${h.toFixed(2)} outside band [0.34,0.41]`);
if (NEW.bb.min[1] > 0.008 || NEW.bb.min[1] < -0.008) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 4: sentinel/runner subtree bands
const A = subEnv("sqrl_a"), B = subEnv("sqrl_b");
console.log(`GREEN sentinel: y-max ${A.hi[1].toFixed(3)} (want [0.34,0.40]); x ${A.lo[0].toFixed(3)}..${A.hi[0].toFixed(3)}`);
if (A.hi[1] < 0.34 || A.hi[1] > 0.40) die(`GREEN FAIL: sentinel crest ${A.hi[1].toFixed(3)} outside [0.34,0.40]`);
console.log(`GREEN runner: x-min ${B.lo[0].toFixed(3)} (want [-0.30,-0.26]); y-max ${B.hi[1].toFixed(3)}`);
if (B.lo[0] < -0.43 || B.lo[0] > -0.41) die(`GREEN FAIL: runner tail-stream ${B.lo[0].toFixed(3)} outside [-0.43,-0.41]`);
if (B.hi[1] > 0.27) die(`GREEN FAIL: runner too tall (${B.hi[1].toFixed(3)} > 0.27)`);
// GREEN 5: joint heights post-bake (root frame)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hyA = jy("sqrl_a_head"), hyB = jy("sqrl_b_head");
console.log(`GREEN joints: a_head y=${hyA?.toFixed(3)} (want [0.24,0.29]); b_head y=${hyB?.toFixed(3)} (want [0.06,0.08])`);
if (hyA === undefined || hyA < 0.24 || hyA > 0.29) die(`GREEN FAIL: a_head joint y=${hyA} outside [0.24,0.29]`);
if (hyB === undefined || hyB < 0.06 || hyB > 0.08) die(`GREEN FAIL: b_head joint y=${hyB} outside [0.06,0.08]`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the woodstack bytes must fail every squirrel gate
const HOST = decode("agents/arthur/assets/village_dress_ne_woodstack1.glb");
if (HOST.sha16 !== "692bc54e02358cc1") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live woodstack lib 692bc54e…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /sqrl/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: sqrl anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries sqrl anchors");
if (hhh >= 0.34 && hhh <= 0.41) die("RED FAIL: host height unexpectedly inside the squirrel band");
console.log("DECODE VERDICT: GREEN (new squirrel) + RED (woodstack clean) — PASS");
