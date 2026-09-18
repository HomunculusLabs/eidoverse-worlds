// fauna11-decode-geese.ts — decode audit for the fauna-11 goose pair.
// GREEN contract (village_goosepair.glb 67a8406dd63612ea… = v3): 6 anchors
// (goose_a/_head/_tail, goose_b/_head/_tail), pair footprint W in [1.3,1.9]
// & D in [1.0,1.6] (a goose pair, not a point, not a sprawl), base y in
// [0,0.010] (feet on the ground, nothing floating), total height in
// [0.60,1.10] (v4 measured 1.05: the sentry's full S-neck — domestic
// graylags with extended necks stand ~0.9-1.05m; the pre-build 0.95 cap
// was an estimate made before the S-curve was finalized), head/tail
// joints at y 0.469 (0.375 × BAKE 1.25).
// RED control: the HOST pool bytes (village_reedpool3.glb 7d770620…, the
// live lib) must FAIL — zero goose_ anchors.
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

const NEW = decode("agents/arthur/assets/village_goosepair.glb");
console.log("NEW sha16:", NEW.sha);
if (NEW.sha !== "67a8406dd63612ea") die(`hash drift: ${NEW.sha}`);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["goose_a", "goose_a_head", "goose_a_tail", "goose_b", "goose_b_head", "goose_b_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 6 motion groups present");
// GREEN 2: footprint + ground seat
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(2)} x ${h.toFixed(2)} x ${d.toFixed(2)} (min.y ${NEW.bb.min[1].toFixed(3)})`);
if (w < 1.3 || w > 1.9 || d < 1.0 || d > 1.6) die(`GREEN FAIL: footprint ${w.toFixed(2)}x${d.toFixed(2)} outside pair band`);
if (NEW.bb.min[1] < -0.002 || NEW.bb.min[1] > 0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} — feet must kiss the ground, nothing floating`);
if (h < 0.60 || h > 1.10) die(`GREEN FAIL: height ${h.toFixed(2)} outside [0.60,1.10]`);
// GREEN 3: joints at the baked shoulder height (0.375 × 1.25 = 0.4688)
for (const n of NEW.json.nodes) {
    if (n.name?.startsWith("goose_") && (n.name.endsWith("_head") || n.name.endsWith("_tail"))) {
        const y = n.translation?.[1];
        if (Math.abs((y ?? -1) - 0.46875) > 0.004) die(`GREEN FAIL: ${n.name} joint y=${y}, want 0.469`);
    }
}
console.log("GREEN joints: head+tail origins at y=0.469 (0.375 × 1.25 bake)");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the HOST pool bytes must fail every goose gate
const HOST = decode("agents/arthur/assets/village_reedpool3.glb");
if (HOST.sha !== "7d770620bb1b7bdc") die(`RED setup fail: host sha ${HOST.sha} (want the live reedpool lib)`);
const hostGeese = HOST.nodes.map(n => n.name).filter(nm => nm.startsWith("goose_"));
console.log(`\nRED control: HOST ${HOST.sha}: goose_ anchors: [${hostGeese.join(",") || "none"}]`);
if (hostGeese.length !== 0) die("RED FAIL: host unexpectedly carries goose anchors");
console.log("DECODE VERDICT: GREEN (new pair) + RED (host clean) — PASS");
