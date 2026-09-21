// fauna85-decode-bfly.ts — decode audit for the fauna-85 butterflies.
// GREEN contract (village_fauna85_bfly.glb): 10 anchors (bfly_a/_jink/
// _hover/_wingL/_wingR + bfly_b...); the PAIR envelope sits in the
// blossom working band y [0.60,0.90] (crowns 0.55 below, crown riders
// 1.48+ above); REST-POSE SEPARATION law (bats law d): the two ring
// anchors stand ≥2.0m apart (no stacked column at rest); SPAN law: each
// butterfly's full subtree x-span ≥0.13 ≤0.26 (the ~23cm ×4.2-baked
// read); MARKER-BUCKET law: the tortoise wing family carries ≥4 buckets
// (ORG/BLK/CRM/BLU — the blue marginal row is the species lock), the
// admiral wing family ≥3 (NWG/RED/WHT); ring-point law: each anchor's
// position == its authored center + r·(sin a, 0, cos a) within 1mm.
// RED control: bats bytes must FAIL — zero bfly anchors.
// Decoder law: FULL TRS accumulation (fauna-2/7), standard row-major
// quaternion block (magpie law a), box corners under affine (fauna-28).
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
    const r = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
               2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
               2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy)];
    return [r[0] * sx, r[3] * sx, r[6] * sx, 0,
            r[1] * sy, r[4] * sy, r[7] * sy, 0,
            r[2] * sz, r[5] * sz, r[8] * sz, 0,
            x, y, z, 1];
};
const apply = (m: number[], p: number[]): number[] => [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

const meshBox = (world: number[], acc: any) => {
    const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
    const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
        for (let k = 0; k < 3; k++) { if (w[k] < lo[k]) lo[k] = w[k]; if (w[k] > hi[k]) hi[k] = w[k]; }
    }
    return { lo, hi };
};
const grow = (into: { lo: number[]; hi: number[] }, b: { lo: number[]; hi: number[] }) => {
    for (let k = 0; k < 3; k++) { if (b.lo[k] < into.lo[k]) into.lo[k] = b.lo[k]; if (b.hi[k] > into.hi[k]) into.hi[k] = b.hi[k]; }
};

const decode = (path: string) => {
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex");
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
    return { sha, sha16: sha.slice(0, 16), nNodes: json.nodes.length, json };
};

const NEW = decode("agents/arthur/assets/village_fauna85_bfly.glb");
console.log("NEW sha16:", NEW.sha16, "| nodes:", NEW.nNodes);

// subtree envelope by node NAME (walk from the named node)
const subtree = (json: any, rootName: string) => {
    const idx = json.nodes.findIndex((n: any) => n.name === rootName);
    if (idx < 0) return null;
    const env = { lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] };
    const walk = (i: number, parent: number[]) => {
        const n = json.nodes[i];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives)
            grow(env, meshBox(world, json.accessors[prim.attributes.POSITION]));
        for (const c of n.children ?? []) walk(c, world);
    };
    walk(idx, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return { env, idx };
};

// anchors present (subset law)
const ANCHORS = ["bfly_a", "bfly_a_jink", "bfly_a_hover", "bfly_a_wingL", "bfly_a_wingR",
                 "bfly_b", "bfly_b_jink", "bfly_b_hover", "bfly_b_wingL", "bfly_b_wingR"];
const names = new Set(NEW.json.nodes.map((n: any) => n.name));
const missing = ANCHORS.filter((a) => !names.has(a));
if (missing.length) die(`missing anchors: ${missing}`);
console.log("anchors: 10/10 present");

// ring-point law: anchor positions == authored ring points
const PLAN: Record<string, { c: number[]; r: number; a: number }> = {
    bfly_a: { c: [0, 0.72, 0], r: 1.30, a: 5.895 },
    bfly_b: { c: [2.0, 0.78, 1.2], r: 1.70, a: 2.400 },
};
const anchorPos: Record<string, number[]> = {};
for (const [k, p] of Object.entries(PLAN)) {
    const n = NEW.json.nodes[subtree(NEW.json, k)!.idx];
    const t = n.translation ?? [0, 0, 0];
    const want = [p.c[0] + p.r * Math.sin(p.a), p.c[1], p.c[2] + p.r * Math.cos(p.a)];
    const d = Math.hypot(t[0] - want[0], t[1] - want[1], t[2] - want[2]);
    console.log(`ring point ${k}: got (${t.map((v: number) => +v.toFixed(3))}) want (${want.map((v) => +v.toFixed(3))} Δ ${d.toFixed(4)}m) yaw ${(n.rotation ?? [0,0,0,1])[1] >= 0 ? "+" : "-"}${(2 * Math.acos(Math.min(1, Math.abs((n.rotation ?? [0,0,0,1])[1])))).toFixed(3)}`);
    if (d > 0.001) die(`ring point drift ${k}: Δ${d}`);
    anchorPos[k] = t;
}

// REST-POSE SEPARATION law (bats law d — no stacked column at rest)
const sep = Math.hypot(anchorPos.bfly_a[0] - anchorPos.bfly_b[0], anchorPos.bfly_a[2] - anchorPos.bfly_b[2]);
console.log(`rest separation: ${sep.toFixed(3)}m (≥2.0)`);
if (sep < 2.0) die(`rest pose stacked: ${sep}`);

// per-butterfly subtree span + flight band
for (const k of ["bfly_a", "bfly_b"]) {
    const s = subtree(NEW.json, k)!;
    const W = s.env.hi[0] - s.env.lo[0], H = s.env.hi[1] - s.env.lo[1];
    console.log(`${k}: x-span ${W.toFixed(3)} (0.13..0.26) y [${s.env.lo[1].toFixed(3)},${s.env.hi[1].toFixed(3)}] band`);
    if (W < 0.13 || W > 0.26) die(`${k} span ${W}`);
    if (s.env.lo[1] < 0.60 || s.env.hi[1] > 0.90) die(`${k} outside blossom band: y [${s.env.lo[1]},${s.env.hi[1]}]`);
}

// MARKER-BUCKET law: count mesh buckets per wing family
const countFam = (prefix: string) => {
    let n = 0;
    for (const node of NEW.json.nodes) {
        const nm = node.name ?? "";
        if (node.mesh !== undefined && (nm === prefix || nm.startsWith(`${prefix}_`))) n++;
    }
    return n;
};
const tort = countFam("bfly_a_wingL") + countFam("bfly_a_wingR");
const adm = countFam("bfly_b_wingL") + countFam("bfly_b_wingR");
console.log(`marker buckets: tortoise wings ${tort} (≥8 = 4/side), admiral wings ${adm} (≥6 = 3/side)`);
if (tort < 8) die(`tortoise marker buckets ${tort} — ORG/BLK/CRM/BLU incomplete`);
if (adm < 6) die(`admiral marker buckets ${adm} — NWG/RED/WHT incomplete`);

// RED control: bats bytes must FAIL — zero bfly anchors
const RED = decode("agents/arthur/assets/village_fauna79_bats.glb");
const redNames = new Set(RED.json.nodes.map((n: any) => n.name));
const redHit = ANCHORS.filter((a) => redNames.has(a));
if (redHit.length) die(`RED control failed: bats carry ${redHit}`);
console.log("RED control: bats bytes carry zero bfly anchors — discriminates");
console.log("GREEN: bfly v1 decode complete");
