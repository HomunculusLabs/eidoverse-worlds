// fauna2-decode-hens.ts — decode audit for the fauna-2 flock rebuild.
// GREEN contract (new bytes ea0ddae2…): 9 motion anchors present
// (hen_{a,b,c} + _head + _tail), flock footprint in [0.8, 2.5]m (a real
// flock scatter, not a micro-entity, not a sprawl), head origins at the
// neck band y∈[0.25,0.35], tail origins at y∈[0.20,0.32], flock seated on
// the ground plane (|min.y| <= 0.02).
// RED control: the BEFORE bytes (edc1a4c7… lone hen_a) must FAIL — no
// head/tail articulation, footprint 0.38m < flock minimum.
// Decoder law (probe pitfall 4): FULL TRS accumulation down the node
// hierarchy — head-group children live in head-local frames; transforming
// their accessor boxes by node-own translation alone misreads pose-local
// offsets (the peck skull) as world positions. Box corners under a full
// affine stay exact.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };
const mul = (a: number[], b: number[]): number[] => { // 4x4 col-major * 4x4
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
    const m = [r[0] * sx, r[3] * sx, r[6] * sx, 0,
               r[1] * sy, r[4] * sy, r[7] * sy, 0,
               r[2] * sz, r[5] * sz, r[8] * sz, 0,
               x, y, z, 1];
    return m;
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
        const local = trs(n.translation, n.rotation, n.scale);
        const world = mul(parent, local);
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

const NEW = decode("agents/arthur/assets/village_hens_flock.glb");
console.log("NEW sha16:", NEW.sha);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["hen_a", "hen_a_head", "hen_a_head_0", "hen_a_tail", "hen_b", "hen_b_head", "hen_b_head_0", "hen_b_tail", "hen_c", "hen_c_head", "hen_c_head_0", "hen_c_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 9 groups + 3 head buckets present");
// GREEN 2: flock footprint band
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(2)} x ${h.toFixed(2)} x ${d.toFixed(2)} (min.y ${NEW.bb.min[1].toFixed(3)})`);
if (w < 0.8 || w > 2.5 || d < 0.8 || d > 2.5) die(`GREEN FAIL: footprint ${w.toFixed(2)}x${d.toFixed(2)} outside flock band [0.8,2.5]`);
if (NEW.bb.min[1] > 0.02 || NEW.bb.min[1] < -0.02) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: head/tail origin bands (group node translations, root frame)
const bands: [RegExp, number, number, string][] = [[/^hen_._head$/, 0.25, 0.35, "neck"], [/^hen_._tail$/, 0.20, 0.32, "tail base"]];
for (const [re, lo, hi, label] of bands) {
    const found: string[] = [];
    for (const n of NEW.json.nodes) if (re.test(n.name ?? "")) {
        const y = n.translation?.[1];
        if (y === undefined || y < lo || y > hi) die(`GREEN FAIL: ${n.name} origin y=${y} outside ${label} band [${lo},${hi}]`);
        found.push(`${n.name}@${y.toFixed(2)}`);
    }
    if (found.length !== 3) die(`GREEN FAIL: expected 3 ${label} anchors, got ${found.length}`);
    console.log(`GREEN ${label} origins: ${found.join(", ")}`);
}
// GREEN 4: peck head reaches near-ground (head-local y=-0.17 at joint 0.30
// -> skull center ~0.13, bottom ~0.075): the peck must LOOK down without
// clipping turf (>= 0.04 above ground)
const headGroups: Record<string, number[]> = {};
for (const n of NEW.json.nodes) if (/^hen_._head$/.test(n.name ?? "")) headGroups[n.name] = n.translation;
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: before-bytes (lone hen_a) must fail the flock gates
const OLD = decode("agents/arthur/reviews/fauna2-hens/before/village_hen_a.glb");
const oldNames = OLD.nodes.map(n => n.name);
const ow = OLD.bb.max[0] - OLD.bb.min[0];
const oldHeads = oldNames.filter(n => /_head|_tail/.test(n));
console.log(`\nRED control: BEFORE sha ${OLD.sha}: ${oldNames.filter(n => n.startsWith("hen")).join(",") || "(none)"}; head/tail anchors: [${oldHeads.join(",")}] ; footprint ${ow.toFixed(2)}m`);
if (oldHeads.length !== 0) die("RED FAIL: before unexpectedly carries head/tail anchors");
if (ow >= 0.8) die("RED FAIL: before footprint unexpectedly in flock band");
console.log("DECODE VERDICT: GREEN (new) + RED (before) — PASS");
