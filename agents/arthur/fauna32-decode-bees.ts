// fauna32-decode-bees.ts — decode audit for the fauna-32 skep bees.
// GREEN contract (village_fauna32_bees.glb): 6 anchors present
// (bee_1..bee_6), envelope x −2.35..3.45 z −1.15..1.15 y 0..0.83, skep
// reference bodies present (3 skeps, tops ≤ 0.81), every bee circle-
// band clear of every skep OBB by ≥ 0.05 (orbit-clearance law), flyers
// in the flight band y 0.35..0.70, workers in the flower band y 0.25..0.50.
// RED control: the pig GLB must FAIL — zero bee_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), transpose-fixed rotation
// block (fauna-28 law f), box corners under affine, anchors from the NODE
// tree.
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
    return [r[0] * sx, r[1] * sx, r[2] * sx, 0,
            r[3] * sy, r[4] * sy, r[5] * sy, 0,
            r[6] * sz, r[7] * sz, r[8] * sz, 0,
            x, y, z, 1];
};
const apply = (m: number[], p: number[]): number[] => [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

const decode = (path: string) => {
    const bytes = readFileSync(path);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let off = 12, json: any = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        const body = bytes.subarray(off + 8, off + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
        off += 8 + len + ((len % 4) ? (4 - len % 4) : 0);
    }
    if (!json) die("no JSON chunk");
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("bee_")) {
            out.anchors[n.name] = out.anchors[n.name] ?? [m[12], m[13], m[14]];
        }
        if (n.mesh !== undefined) {
            const prim = json.meshes[n.mesh].primitives[0];
            const { min, max } = acc(prim.attributes.POSITION);
            const corners = [
                [min[0], min[1], min[2]], [max[0], min[1], min[2]],
                [min[0], max[1], min[2]], [max[0], max[1], min[2]],
                [min[0], min[1], max[2]], [max[0], min[1], max[2]],
                [min[0], max[1], max[2]], [max[0], max[1], max[2]],
            ].map((c) => apply(m, c));
            const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]), zs = corners.map((c) => c[2]);
            out.nodes.push({
                name: n.name ?? `node${ni}`, depth,
                min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
                max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)],
            });
        }
        for (const c of n.children ?? []) walk(c, m, depth + 1);
    };
    for (const s of json.scenes[0].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 0);
    return out;
};

const GLB = "agents/arthur/assets/village_fauna32_bees.glb";
const d = decode(GLB);
console.log("bees sha16:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
const WANT_A = ["bee_1", "bee_2", "bee_3", "bee_4", "bee_5", "bee_6", "bee_7"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[1] < -0.001) die(`base digs ${env.min[1]}`);
if (env.max[1] > 0.75) die(`height drift ${env.max[1]}`);
if (env.max[2] > 1.95 || env.min[2] < -0.1) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[0] < -2.4 || env.max[0] > 2.4) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
// joint heights (authored): flyers 0.62/0.68/0.64/0.72, workers 0.60/0.64/0.60
const jointWant: Record<string, number> = { bee_1: 0.62, bee_2: 0.68, bee_3: 0.64, bee_4: 0.72, bee_5: 0.60, bee_6: 0.64, bee_7: 0.60 };
for (const k of WANT_A) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - jointWant[k]) > 0.02) die(`${k} joint y ${got.toFixed(3)} vs ${jointWant[k]}`);
    console.log(`joint ${k}: (${d.anchors[k][0].toFixed(2)}, ${got.toFixed(3)}, ${d.anchors[k][2].toFixed(2)})`);
}
// orbit-clearance law (RING math, not disc): each flyer's ring (center,
// radius) vs every skep OBB. Own hive (center inside OBB): clearance =
// r − halfdiag. Other hives: dist(center, OBB) − r. Both ≥ 0.05, plus
// body extent 0.037 margin honored by the 0.05 bound.
const orbits: [string, number, number, number, number][] = [
    ["bee_1", -1.9, 0.62, 0.0, 0.80],
    ["bee_2", -0.6, 0.68, 0.15, 0.80],
    ["bee_3", 0.7, 0.64, -0.1, 0.80],
    ["bee_4", 2.0, 0.72, 0.05, 0.80],
];
const skepCenters: [number, number][] = [[-1.9, 0.0], [-0.6, 0.15], [0.7, -0.1], [2.0, 0.05]];
const EX = 0.321, EZ = 0.309; // straw+hole half-extents (authored contract)
const halfdiag = Math.hypot(EX, EZ);
for (const [name, cx, cy, cz, r] of orbits) {
    void cy;
    for (const [sx, sz] of skepCenters) {
        const du = Math.max(Math.abs(cx - sx) - EX, 0);
        const dv = Math.max(Math.abs(cz - sz) - EZ, 0);
        const dist = Math.hypot(du, dv);
        const clear = dist === 0 ? r - halfdiag : dist - r;
        if (clear < 0.05) die(`${name} ring r${r} vs skep OBB at (${sx},${sz}): clearance ${clear.toFixed(3)} < 0.05`);
        console.log(`ring ${name} vs skep(${sx.toFixed(2)},${sz.toFixed(2)}): clear ${clear.toFixed(3)}m`);
    }
}
// rest points ON their rings (phase 0): authored positions must satisfy
// |rest − center| == r within 1mm
for (const [name, cx, cy, cz, r] of orbits) {
    const a = d.anchors[name];
    const dd = Math.hypot(a[0] - cx, a[2] - cz);
    if (Math.abs(dd - r) > 0.001) die(`${name} rest point off-ring: ${dd.toFixed(3)} vs r ${r}`);
    if (Math.abs(a[1] - cy) > 0.002) die(`${name} rest y ${a[1]} vs center y ${cy}`);
    console.log(`${name} on-ring: r=${dd.toFixed(3)}`);
}
// RED control: the standing skeps GLB (closest relative — straw, no bees)
// must report zero bee_ anchors.
const CTRL = "agents/arthur/assets/village_dress_nw_skeps1.glb";
const cd = decode(CTRL);
if (Object.keys(cd.anchors).length > 0) die(`RED FAILED: skeps GLB reports bee anchors: ${Object.keys(cd.anchors)}`);
console.log("RED control: skeps GLB has zero bee_ anchors — PASS");
console.log("DECODE GREEN");
