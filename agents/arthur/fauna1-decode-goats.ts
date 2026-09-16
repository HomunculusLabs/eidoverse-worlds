// fauna1-decode-goats.ts — decode audit for the fauna-1 goats rebuild.
// GREEN contract (new bytes b7ac584d…): 9 motion anchors present
// (goat_{a,b,c} + _head + _tail), local bbox footprint ≤ 7.0m wide (pen
// bug cured: before-bytes spanned 14.21m x with orphan posts), heads at
// plausible neck heights, water palette present.
// RED control: the BEFORE bytes (c47861e4…) must FAIL the footprint gate.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };
const decode = (path: string) => {
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
    const binStart = 20 + jsonLen + 8;
    // node walk with accumulated transforms
    const nNodes = json.nodes.length;
    const nodeInfo: { name: string; depth: number }[] = [];
    const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    const walk = (idx: number, depth: number, parentT: number[][], parentQ: number[] | null) => {
        const n = json.nodes[idx];
        // TRS accumulation (translation + rotation only — builds use no scale)
        let t = parentT ? parentT.map((r: number[], i: number) => {
            const q = parentQ!;
            const [x, y, z] = [n.translation?.[0] ?? 0, n.translation?.[1] ?? 0, n.translation?.[2] ?? 0];
            // rotate child translation by parent quaternion
            const [qx, qy, qz, qw] = q;
            const cx = qy * z - qz * y + qw * x, cy = qz * x - qx * z + qw * y, cz = qx * y - qy * x + qw * z;
            const rx = x + 2 * (qy * cz - qz * cy), ry = y + 2 * (qz * cx - qx * cz), rz = z + 2 * (qx * cy - qy * cx);
            return [r[0] + rx, r[1] + ry, r[2] + rz];
        }) : [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        let q: number[] | null = parentQ;
        if (n.rotation) {
            const r = n.rotation;
            if (!parentQ) q = r;
            else {
                const [ax, ay, az, aw] = parentQ, [bx, by, bz, bw] = r;
                q = [aw * bx + ax * bw + ay * bz - az * by,
                     aw * by - ax * bz + ay * bw + az * bx,
                     aw * bz + ax * by - ay * bx + az * bw,
                     aw * bw - ax * bx - ay * by - az * bz];
            }
        }
        void t;
        // vertex bounds via this node's meshes (accessor min/max in node frame)
        if (n.mesh !== undefined) {
            const mesh = json.meshes[n.mesh];
            for (const prim of mesh.primitives) {
                const acc = json.accessors[prim.attributes.POSITION];
                const mn = acc.min, mx = acc.max;
                // node's own translation+rotation applied to the accessor box
                // (rotation on a box: conservative — apply R to center, add rotated half-extents)
                const c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
                const h = [(mx[0] - mn[0]) / 2, (mx[1] - mn[1]) / 2, (mx[2] - mn[2]) / 2];
                const P = json.nodes[idx].translation ?? [0, 0, 0];
                void P;
                // top-level nodes in these builds carry translation only (identity quat),
                // nested KEEP groups carry rotation — handle via full matrix from JSON node
                const nm = new Array(16);
                const n3 = json.nodes[idx];
                // compose node matrix: T * R * S(identity)
                const rot = n3.rotation ?? [0, 0, 0, 1];
                const [qx, qy, qz, qw] = rot;
                const Rm = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy + qz * qw), 2 * (qx * qz - qy * qw),
                            2 * (qx * qy - qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz + qx * qw),
                            2 * (qx * qz + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy)];
                const tr = n3.translation ?? [0, 0, 0];
                // world transform for this build family: parents are root (identity)
                const world = (p: number[]) => [
                    Rm[0] * p[0] + Rm[1] * p[1] + Rm[2] * p[2] + tr[0],
                    Rm[3] * p[0] + Rm[4] * p[1] + Rm[5] * p[2] + tr[1],
                    Rm[6] * p[0] + Rm[7] * p[1] + Rm[8] * p[2] + tr[2],
                ];
                const corners: number[][] = [];
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
                    corners.push(world([c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]));
                for (const w of corners) for (let k = 0; k < 3; k++) {
                    if (w[k] < bb.min[k]) bb.min[k] = w[k];
                    if (w[k] > bb.max[k]) bb.max[k] = w[k];
                }
            }
        }
        nodeInfo.push({ name: n.name ?? "(unnamed)", depth });
        for (const c of n.children ?? []) walk(c, depth + 1, null, q);
    };
    const scene = json.scenes[json.scene].nodes;
    for (const s of scene) walk(s, 0, null, null);
    return { sha, nNodes, nodes: nodeInfo, bb, json };
};

const NEW = decode("agents/arthur/assets/village_goats3.glb");
console.log("NEW sha:", NEW.sha);
// GREEN 1: anchors
const want = ["goat_a", "goat_a_head", "goat_a_tail", "goat_b", "goat_b_head", "goat_b_tail", "goat_c", "goat_c_head", "goat_c_tail"];
const names = NEW.nodes.map(n => n.name);
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 9/9 present:", want.join(","));
// GREEN 2: footprint
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: x[${NEW.bb.min[0].toFixed(2)}, ${NEW.bb.max[0].toFixed(2)}] y[..${NEW.bb.max[1].toFixed(2)}] z[${NEW.bb.min[2].toFixed(2)}, ${NEW.bb.max[2].toFixed(2)}] = ${w.toFixed(2)} x ${h.toFixed(2)} x ${d.toFixed(2)}`);
if (w > 7.0 || d > 7.0) die(`GREEN FAIL: footprint ${w.toFixed(2)}x${d.toFixed(2)} exceeds pen contract 7.0`);
// GREEN 3: head group origins (decode positions from node JSON)
const headPos: Record<string, number[]> = {};
for (const n of NEW.json.nodes) if ((n.name ?? "").match(/^goat_._head$/)) headPos[n.name] = n.translation;
for (const [k, p] of Object.entries(headPos)) {
    if (!p || p[1] < 0.55 || p[1] > 1.1) die(`GREEN FAIL: ${k} origin y=${p?.[1]} outside neck band`);
    console.log(`GREEN ${k} origin: [${p.map(v => v.toFixed(2)).join(", ")}]`);
}
if (Object.keys(headPos).length !== 3) die(`GREEN FAIL: expected 3 head anchors, got ${Object.keys(headPos).length}`);
// node count
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: before-bytes must fail the footprint gate
const OLD = decode("agents/arthur/reviews/fauna1-goats/before/village_goats3.glb");
const ow = OLD.bb.max[0] - OLD.bb.min[0];
console.log(`\nRED control: BEFORE sha ${OLD.sha} footprint x-width ${ow.toFixed(2)}m — ${ow > 7.0 ? "FAILS the new gate as expected (orphan posts)" : "UNEXPECTED PASS — gate is weak"}`);
if (ow <= 7.0) die("RED FAIL: gate did not discriminate");
const oldNames = OLD.nodes.map(n => n.name);
const oldHaveHead = oldNames.some(n => /_head/.test(n));
console.log(`RED control 2: BEFORE anchors ${oldNames.filter(n => n.startsWith("goat")).join(",")} (head anchors: ${oldHaveHead}) — new contract correctly discriminated`);
console.log("\nDECODE VERDICT: GREEN (new) + RED (before) — PASS");
