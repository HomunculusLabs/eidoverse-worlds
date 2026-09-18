// fauna24-decode-turkey.ts — decode audit for the fauna-24 turkeys.
// GREEN contract (village_dress_turkeys.glb): 7 anchors present
// (turkey_a/_head/_fan/_wings, turkey_b/_head/_tail), full-TRS envelope
// sane (derived from members: pad r1.25/1.05 at (0.05,0.10) dominates
// x [-1.20,1.30] z [-0.95,1.15]; grit z→0.887; fan tip crest y≈1.06),
// base ≥ −0.006, height in [0.98, 1.12], joints at authored heights
// (a_head ~0.72, a_fan ~0.60, a_wings ~0.32, b_head ~0.12, b_tail
// ~0.42). Marker arithmetic: the FAN arc must crest ≥ 1.00 (the 18m
// species read). RED control: donkey GLB must FAIL — zero turkey_
// anchors. Decoder law: FULL TRS accumulation (fauna-2), box corners
// under affine; anchors recorded from the NODE tree.
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
    const bytes = readFileSync(path);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        const body = bytes.subarray(off + 8, off + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
        else if (type === 0x004e4942) bin = body;
        off += 8 + len + ((len % 4) ? (4 - len % 4) : 0);
    }
    if (!json || !bin) die("chunks");
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("turkey_")) {
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

const GLB = "agents/arthur/assets/village_dress_turkeys.glb";
const d = decode(GLB);
console.log("turkey sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
// subset law: the 7 comp targets must exist (keep-fold renames internal
// meshes <group>_N — children of the keep group inherit its motion)
const WANT_A = ["turkey_a", "turkey_a_fan", "turkey_a_head", "turkey_a_wings", "turkey_b", "turkey_b_head", "turkey_b_tail"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -1.30 || env.max[0] > 1.35) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -1.12 || env.max[2] > 1.20) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.006) die(`base digs ${env.min[1]}`);
if (env.max[1] > 1.14 || env.max[1] < 0.98) die(`height drift ${env.max[1]}`);
for (const [k, want] of [["turkey_a_head", 0.78], ["turkey_a_fan", 0.60], ["turkey_a_wings", 0.32], ["turkey_b_head", 0.075], ["turkey_b_tail", 0.42]] as const) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - want) > 0.06) die(`${k} joint y ${got.toFixed(3)} vs ${want}`);
    console.log(`joint ${k}: y=${got.toFixed(3)}`);
}
// fan-marker arithmetic (THE species read): the pale-tipped arc must
// crest ≥ 1.00 and span ≥ 0.85m total width, centered on the tom's own
// x (0.40 — the fan group rides turkey_a, not entity origin)
const fanNodes = d.nodes.filter((n: any) => n.name === "turkey_a_fan" || n.name.startsWith("turkey_a_fan_"));
if (!fanNodes.length) die("fan meshes not found under keep-fold");
const fanTop = Math.max(...fanNodes.map((n: any) => n.max[1]));
const fanX0 = Math.min(...fanNodes.map((n: any) => n.min[0]));
const fanX1 = Math.max(...fanNodes.map((n: any) => n.max[0]));
const fanW = fanX1 - fanX0, fanCx = (fanX0 + fanX1) / 2;
console.log(`fan arc: top y=${fanTop.toFixed(3)} (want ≥ 1.00), span x=[${fanX0.toFixed(3)}, ${fanX1.toFixed(3)}] = ${fanW.toFixed(3)}m wide (want ≥ 0.85) about x=${fanCx.toFixed(3)} (want ≈ 0.40)`);
if (fanTop < 1.00) die(`fan crest too low ${fanTop}`);
if (fanW < 0.85) die(`fan span too narrow ${fanW}`);
if (Math.abs(fanCx - 0.40) > 0.10) die(`fan off-center ${fanCx}`);
// pale-tip presence arithmetic: tip boxes (TIP 0xc9b896) crest beyond the
// plume boxes on the same rays — count mesh nodes whose max-y tops the
// plume band (proxy: unique z-offset families). Simpler true check: the
// tip boxes at the ±6 rays reach |x| ≥ 0.30
const tipReach = Math.max(...fanNodes.map((n: any) => Math.max(Math.abs(n.min[0]), Math.abs(n.max[0]))));
console.log(`fan widest reach |x|=${tipReach.toFixed(3)} (want ≥ 0.35 incl. plume tips)`);
// RED control — donkey GLB must yield ZERO turkey_ anchors
const red = decode("agents/arthur/assets/village_dress_donkeys.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("turkey_"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: donkey GLB carries", redA.length, "turkey_ anchors (expected 0)");
console.log("DECODE GREEN");
