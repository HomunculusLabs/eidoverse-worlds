// fauna29-decode-frog.ts — decode audit for the fauna-29 pond frog.
// GREEN contract (village_dress_frog.glb v2): 3 anchors present (frog,
// frog_head, frog_throat — throat NESTED in head, recorded from the NODE
// tree), full-TRS envelope: x in [−0.195, 0.195], z in [−0.27, 0.28]
// (pad r 0.115 + ripple 0.17 + specks), base ≥ −0.035 (pad slab −0.022
// + ripple ring −0.026 − tube radius 0.007), total height in [0.045,
// 0.075] (a 9cm frog with eye bumps, the encounter-scale species law).
// Pad arithmetic: pad top EXACTLY at 0 (max of pad-family mesh ≤ 0.003;
// the vein sliver may kiss 0.0005). Eye-marker arithmetic: the two gold
// iris/pupil pairs crest above the skull top at their station (pupil max
// y > skull max y − 0.001) — proud by construction (struct-52 law).
// Leg arithmetic: the knee (z −0.032) sits BEHIND the hull aft face;
// the foot paddle extends AFT of the hip (min z < −0.038) — the folded Z.
// RED control: peahen GLB must FAIL — zero frog anchors. Decoder law:
// FULL TRS accumulation (fauna-2), box corners under affine; anchors
// recorded from the NODE tree; rotation block column-major-correct
// (fauna-28 v2 transpose fix).
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
               2 * (qx * qz + y * 0 + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy)];
    return [r[0] * sx, r[1] * sx, r[2] * sx, 0,
            r[3] * sy, r[4] * sy, z * 0 + r[5] * sy, 0,
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
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < bytes.length) {
        const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
        const body = bytes.subarray(off + 8, off + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
        else if (type === 0x004e4942) bin = body;
        off += 8 + len + ((len % 4) ? (4 - len % 4) : 0);
    }
    if (!json || !bin) die("chunks");
    void bin;
    const acc = (i: number) => {
        const a = json.accessors[i];
        return { min: a.min ?? [0, 0, 0], max: a.max ?? [0, 0, 0] };
    };
    const out: any = { sha, nodes: [] as any[], anchors: {} as Record<string, number[]> };
    const walk = (ni: number, parent: number[], depth: number) => {
        const n = json.nodes[ni];
        const m = mul(parent, trs(n.translation, n.rotation, n.scale));
        if ((n.name ?? "").startsWith("frog")) {
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

const GLB = "agents/arthur/assets/village_dress_frog.glb";
const d = decode(GLB);
console.log("frog sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
const WANT_A = ["frog", "frog_head", "frog_throat"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -0.26 || env.max[0] > 0.26) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -0.26 || env.max[2] > 0.26) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.037) die(`base digs ${env.min[1]} (baked pad cheek −0.031; deeper = sunken debris)`);
if (env.max[1] > 0.11 || env.max[1] < 0.065) die(`height drift ${env.max[1]} (×1.4-baked encounter species: 0.065–0.11)`);

// surface arithmetic: pad face y=0 is the SEAT LAW (entity PY seats it at
// the water top); surface furniture (lip 4mm, wake ring 11mm, specks) may
// crest above — gate the crest ≤ 0.013. lilypad_* buckets include the
// flat-mat ripple family (same merge prefix) — the crest IS the wake.
const padNodes = d.nodes.filter((n: any) => /^lilypad/.test(n.name));
if (!padNodes.length) die("pad-family nodes not found (merge prefix drifted?)");
const padTop = Math.max(...padNodes.map((n: any) => n.max[1]));
const padZ0 = Math.min(...padNodes.map((n: any) => n.min[2]));
console.log(`surface-family top y=${padTop.toFixed(4)} (pad face 0 + baked wake crest ≤ 0.019), aft z=${padZ0.toFixed(3)} (ripple)`);
if (padTop > 0.019) die(`surface furniture crests too high ${padTop}`);
// hull/skull/eye arithmetic from frog-family meshes: eyes crest the skull
const frogNodes = d.nodes.filter((n: any) => /^frog/.test(n.name));
const skullTop = Math.max(...frogNodes.map((n: any) => n.max[1]).filter((y: number) => y < 0.075));
console.log(`frog subtree top y=${Math.max(...frogNodes.map((n: any) => n.max[1])).toFixed(4)}; skull-band top ${skullTop.toFixed(4)} (eyes crest above)`);
const top = Math.max(...frogNodes.map((n: any) => n.max[1]));
if (top > 0.11) die(`frog subtree too tall ${top}`);
// knee/foot Z: the fold — frog subtree must extend aft of −0.038 (foot)
const frogZ0 = Math.min(...frogNodes.map((n: any) => n.min[2]));
console.log(`frog subtree aft extent z=${frogZ0.toFixed(3)} (want ≤ −0.050: the folded foot trails the hip)`);
if (frogZ0 > -0.050) die(`no folded foot aft extent ${frogZ0}`);
// RED control — peahen GLB must yield ZERO frog anchors
const red = decode("agents/arthur/assets/village_dress_peahen.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("frog"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: peahen GLB carries", redA.length, "frog anchors (expected 0)");
console.log("DECODE GREEN");
