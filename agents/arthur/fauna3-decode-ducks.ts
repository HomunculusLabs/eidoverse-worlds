// fauna3-decode-ducks.ts — decode audit for the fauna-3 duck pair.
// GREEN contract (village_duckpair.glb 81a0bb7d… = v2: indigo speculum both
// (duck_a/_head/_tail, duck_b/_head/_tail), pair footprint W in [0.9,1.6]
// & D in [0.7,1.2] (a pair, not a point, not a sprawl), seated so the keel
// breaks the waterline (base y in [0, 0.012] — WL 0.02, keel -15mm), duck
// group origins AT the waterline 0.02, head joint y: drake 0.16 / duck 0.125 (v3: joint moved fwd 0.13→0.155 + up — skull clears the hull nose by ~5cm, was occluded at ultra)
// (her dabble reaches the water), total height in [0.30, 0.45].
// RED control: the HOST pool bytes (village_reedpool3.glb 7d770620…, the
// live lib) must FAIL the duck gates — zero duck_ anchors (proves the gate
// discriminates rider from host).
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

const NEW = decode("agents/arthur/assets/village_duckpair.glb");
console.log("NEW sha16:", NEW.sha);
if (NEW.sha !== "c156b6a12a935495") die(`hash drift: ${NEW.sha}`);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["duck_a", "duck_a_head", "duck_a_tail", "duck_b", "duck_b_head", "duck_b_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 6 motion groups present");
// GREEN 2: footprint + waterline seat
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(2)} x ${h.toFixed(2)} x ${d.toFixed(2)} (min.y ${NEW.bb.min[1].toFixed(3)})`);
if (w < 0.9 || w > 1.6 || d < 0.7 || d > 1.2) die(`GREEN FAIL: footprint ${w.toFixed(2)}x${d.toFixed(2)} outside pair band`);
if (NEW.bb.min[1] < 0 || NEW.bb.min[1] > 0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} — keel must kiss the waterline from below`);
if (h < 0.30 || h > 0.45) die(`GREEN FAIL: height ${h.toFixed(2)} outside [0.30,0.45]`);
// GREEN 3: duck group origins ON the waterline; head joints at species heights
for (const n of NEW.json.nodes) {
    if (n.name === "duck_a" || n.name === "duck_b") {
        const y = n.translation?.[1];
        if (Math.abs((y ?? -1) - 0.02) > 0.003) die(`GREEN FAIL: ${n.name} origin y=${y}, want waterline 0.02`);
    }
    if (n.name === "duck_a_head" && Math.abs((n.translation?.[1] ?? -1) - 0.16) > 0.003) die(`GREEN FAIL: drake joint y=${n.translation?.[1]}, want 0.16`);
    if (n.name === "duck_b_head" && Math.abs((n.translation?.[1] ?? -1) - 0.125) > 0.003) die(`GREEN FAIL: duck joint y=${n.translation?.[1]}, want 0.125`);
}
console.log("GREEN waterline: both duck groups at y=0.02; joints drake 0.16 / duck 0.125");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the HOST pool bytes must fail every duck gate
const HOST = decode("agents/arthur/assets/village_reedpool3.glb");
if (HOST.sha !== "7d770620bb1b7bdc") die(`RED setup fail: host sha ${HOST.sha} (want the live reedpool lib)`);
const hostDucks = HOST.nodes.map(n => n.name).filter(nm => nm.startsWith("duck_"));
console.log(`\nRED control: HOST ${HOST.sha}: duck_ anchors: [${hostDucks.join(",") || "none"}]`);
if (hostDucks.length !== 0) die("RED FAIL: host unexpectedly carries duck anchors");
console.log("DECODE VERDICT: GREEN (new pair) + RED (host clean) — PASS");
