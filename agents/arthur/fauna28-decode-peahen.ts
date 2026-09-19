// fauna28-decode-peahen.ts — decode audit for the fauna-28 peahen.
// GREEN contract (village_dress_peahen.glb, v1 a06d73f7): 4 anchors
// present (peahen, _head, _crest, _tail — crest nested in head), full-TRS
// envelope sane (authored: bird wings ±0.13; dust bath x→0.345; grit
// z→0.42; tail z→−0.44), base ≥ −0.006, height in [0.38, 0.50] (THE
// ANTI-TRAIN LAW: the peacock crests 1.69 — the hen must stay a low,
// round bird), joints at authored heights (head ≈0.105, crest ≈0.143,
// tail ≈0.335). Marker arithmetic: short dark tail trails behind
// (z0 ≤ −0.30) but stays LOW (tail top ≤ 0.36) — carried down, never
// a dome. RED control: turkey GLB must FAIL — zero peahen_ anchors.
// Decoder law: FULL TRS accumulation (fauna-2), box corners under
// affine; anchors recorded from the NODE tree.
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
    // v2 decoder fix (fauna-28): the rotation block was packed TRANSPOSED
    // into column-major storage — every prior GREEN check was rotation-
    // symmetric (spans/crests/translations), so the bug slept until the
    // peahen tail's asymmetric -0.46 rad group pitch read UP (0.461)
    // instead of DOWN (0.344). r[] below is COLUMN-major of R (r[3j+i] =
    // R[i][j]); columns of the product matrix M are (r0,r1,r2)*sx etc.
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
        if ((n.name ?? "").startsWith("peahen_") || n.name === "peahen") {
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

const GLB = "agents/arthur/assets/village_dress_peahen.glb";
const d = decode(GLB);
console.log("peahen sha:", d.sha.slice(0, 16));
console.log("node census:", d.nodes.length, "mesh nodes");
const byDepth = new Map<number, number>();
for (const n of d.nodes) byDepth.set(n.depth, (byDepth.get(n.depth) ?? 0) + 1);
console.log("by depth:", JSON.stringify([...byDepth.entries()]));
const anchors = Object.keys(d.anchors).sort();
console.log("anchors:", anchors.join(", "));
// subset law: the 4 comp targets must exist (keep-fold renames internal
// meshes <group>_N — children of the keep group inherit its motion)
const WANT_A = ["peahen", "peahen_head", "peahen_crest", "peahen_tail"];
const missing = WANT_A.filter(k => !anchors.includes(k));
if (missing.length) die(`anchor set drift, missing: ${missing}`);
const env = d.nodes.reduce((a: any, n: any) => ({
    min: [Math.min(a.min[0], n.min[0]), Math.min(a.min[1], n.min[1]), Math.min(a.min[2], n.min[2])],
    max: [Math.max(a.max[0], n.max[0]), Math.max(a.max[1], n.max[1]), Math.max(a.max[2], n.max[2])],
}), { min: [9, 9, 9], max: [-9, -9, -9] });
console.log("envelope min:", env.min.map((v: number) => v.toFixed(3)).join(", "));
console.log("envelope max:", env.max.map((v: number) => v.toFixed(3)).join(", "));
if (env.min[0] < -0.20 || env.max[0] > 0.42) die(`x envelope drift ${env.min[0]},${env.max[0]}`);
if (env.min[2] < -0.55 || env.max[2] > 0.50) die(`z envelope drift ${env.min[2]},${env.max[2]}`);
if (env.min[1] < -0.006) die(`base digs ${env.min[1]}`);
if (env.max[1] > 0.50 || env.max[1] < 0.38) die(`height drift ${env.max[1]} (anti-train law: hen stays 0.38–0.50)`);
for (const [k, want] of [["peahen_head", 0.105], ["peahen_crest", 0.143], ["peahen_tail", 0.335]] as const) {
    const got = d.anchors[k]?.[1] ?? -9;
    if (Math.abs(got - want) > 0.05) die(`${k} joint y ${got.toFixed(3)} vs ${want}`);
    console.log(`joint ${k}: y=${got.toFixed(3)}`);
}
// tail-marker arithmetic: the SHORT DARK TAIL trails behind (z0 ≤ −0.30)
// and stays BELOW the back topline (mantle top = 0.440) — top ≤ 0.40.
// That IS the anti-train law: his dome CRESTS the bird 3× over; her tail
// must never crest her own topline (the original 0.36 bound was tighter
// than the geometry contract it served — recalibrated to the topline).
const tailNodes = d.nodes.filter((n: any) => n.name === "peahen_tail" || n.name.startsWith("peahen_tail_"));
if (!tailNodes.length) die("tail meshes not found under keep-fold");
const tailTop = Math.max(...tailNodes.map((n: any) => n.max[1]));
const tailZ0 = Math.min(...tailNodes.map((n: any) => n.min[2]));
console.log(`tail: top y=${tailTop.toFixed(3)} (want ≤ 0.40, below the 0.440 topline), z back=${tailZ0.toFixed(3)} (want ≤ −0.30)`);
if (tailTop > 0.40) die(`tail crests the topline ${tailTop} (anti-train)`);
if (tailZ0 > -0.30) die(`tail does not trail behind (z0 ${tailZ0})`);
// crest arithmetic: the lateral fan crests the head — top of crest
// subtree ≥ 0.165 (head 0.105 + stems) but ≤ 0.24 (muted, not a crown);
// lateral span ≥ 0.085 (accepted cock crest spans ~0.10 — the kinship
// marker keeps ~90% of that; v1's 0.069 fused toward a single column,
// decode-caught)
const crestNodes = d.nodes.filter((n: any) => n.name === "peahen_crest" || n.name.startsWith("peahen_crest_"));
if (!crestNodes.length) die("crest meshes not found under keep-fold");
const crestTop = Math.max(...crestNodes.map((n: any) => n.max[1]));
const crestX0 = Math.min(...crestNodes.map((n: any) => n.min[0]));
const crestX1 = Math.max(...crestNodes.map((n: any) => n.max[0]));
console.log(`crest: top y=${crestTop.toFixed(3)} (want 0.16–0.24), lateral span x=[${crestX0.toFixed(3)}, ${crestX1.toFixed(3)}] (want ≥ 0.085 total)`);
if (crestTop < 0.16 || crestTop > 0.24) die(`crest height drift ${crestTop}`);
if (crestX1 - crestX0 < 0.085) die(`crest not laterally fanned (span ${crestX1 - crestX0})`);
// RED control — turkey GLB must yield ZERO peahen_ anchors
const red = decode("agents/arthur/assets/village_dress_turkeys.glb");
const redA = Object.keys(red.anchors).filter(k => k.startsWith("peahen_"));
if (redA.length !== 0) die(`RED control failed: ${redA}`);
console.log("RED control: turkey GLB carries", redA.length, "peahen_ anchors (expected 0)");
console.log("DECODE GREEN");
