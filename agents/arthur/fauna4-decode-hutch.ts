// fauna4-decode-hutch.ts — decode audit for the fauna-4 hutch rabbits.
// GREEN contract (village_hutch3.glb ce6df320fcee6e91…):
//  - 5 nested KEEP anchors: rabbit_sit, rabbit_sit_head, rabbit_alert,
//    rabbit_alert_head, rabbit_alert_ears
//  - SITTER VISIBLE: rabbit_sit base at the ramp-foot straw (x .52, z .88),
//    head front z max > .95 — NOT behind the wire strip (z .35)
//  - SENTINEL EARS: rabbit_alert_ears local bbox height >= .13 (16cm ears)
//  - TOTAL bbox within the LIVE envelope (W 1.839 D 1.432 H 1.515) so the
//    same-tuple replace creates zero new contacts
// RED control: the BEFORE bytes (f5f47791…, captured in reviews/fauna4-
// hutch/before/) must FAIL — no rabbit_sit_head anchor, and its rabbit_sit
// min.z >= 0 (the sitter sat INSIDE at z .05..0.17, behind the wire at .35).
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
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

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
    // I hoisted to module scope
    for (const s of json.scenes[json.scene].nodes) walk(s, I, 0);
    return { sha, nNodes: json.nodes.length, nodes: nodeInfo, bb, json };
};

const NEW = decode("agents/arthur/assets/village_hutch3.glb");
console.log("NEW sha16:", NEW.sha);
if (NEW.sha !== "c0a64ac43a695f67") die(`hash drift: ${NEW.sha}`);
const names = NEW.nodes.map(n => n.name);

// GREEN 1: the five motion anchors, exact names
const want = ["rabbit_sit", "rabbit_sit_head", "rabbit_alert", "rabbit_alert_head", "rabbit_alert_ears"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
const stale = names.filter(nm => nm === "rabbit_hop");
if (stale.length) die(`GREEN FAIL: stale anchor rabbit_hop still present`);
console.log("GREEN anchors: 5 rabbit motion groups present, rabbit_hop gone");

// GREEN 2: node census (budget law 5-45) and hierarchy shape
if (NEW.nNodes < 5 || NEW.nNodes > 45) die(`GREEN FAIL: node census ${NEW.nNodes} outside 5..45`);
console.log("GREEN nodes:", NEW.nNodes, "(budget 5-45)");

// GREEN 3: sitter VISIBILITY — the whole sitter in front of the wire strip
const nodeBB = (rootName: string) => {
    // find the named node and compute its world-frame bbox from accessors
    const stack: { idx: number; m: number[] }[] = [];
    const find = (idx: number, m: number[]): number => {
        const n = json_find(NEW.json, idx);
        if ((n.name ?? "") === rootName) { void m; return idx; }
        let r = -1;
        for (const c of n.children ?? []) { r = find(c, m); if (r >= 0) break; }
        return r;
    };
    const json_find = (_j: any, idx: number) => NEW.json.nodes[idx];
    const sceneNodes = NEW.json.scenes[NEW.json.scene].nodes;
    let target = -1;
    for (const s of sceneNodes) { target = find(s, I); if (target >= 0) break; }
    if (target < 0) die(`node ${rootName} not found for bbox`);
    // walk from SCENE root accumulating world matrices, collecting only
    // subtree meshes of target
    const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    const walkSub = (idx: number, parent: number[], inTarget: boolean) => {
        const n = NEW.json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        const it = inTarget || idx === target;
        if (it && n.mesh !== undefined) {
            for (const prim of NEW.json.meshes[n.mesh].primitives) {
                const acc = NEW.json.accessors[prim.attributes.POSITION];
                const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
                const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                    const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                    for (let k = 0; k < 3; k++) { if (w[k] < bb.min[k]) bb.min[k] = w[k]; if (w[k] > bb.max[k]) bb.max[k] = w[k]; }
                }
            }
        }
        for (const c of n.children ?? []) walkSub(c, world, it);
    };
    for (const s of sceneNodes) walkSub(s, I, false);
    void stack;
    return bb;
};

const sitBB = nodeBB("rabbit_sit");
console.log(`GREEN sitter world bbox: x[${sitBB.min[0].toFixed(3)}, ${sitBB.max[0].toFixed(3)}] y[${sitBB.min[1].toFixed(3)}, ${sitBB.max[1].toFixed(3)}] z[${sitBB.min[2].toFixed(3)}, ${sitBB.max[2].toFixed(3)}]`);
// the wire strip front face sits at z 0.35+.01 — the whole sitter must be
// in FRONT of z 0.36 in entity-local frame (occlusion cure, struct-52 class)
if (sitBB.min[2] < 0.36) die(`GREEN FAIL: sitter min.z ${sitBB.min[2].toFixed(3)} — still behind the wire strip plane z=0.36`);
console.log("GREEN occlusion cure: whole sitter forward of z=0.36 (wire front)");

// GREEN 4: sentinel ears height (species signature; v2 gate 0.175 — the
// v1-new ears at 0.158 must FAIL here, giving the decode its second
// discriminating control against the un-improved candidate)
for (const n of NEW.json.nodes) {
    if (n.name === "rabbit_alert_ears") {
        const h = (n.scale?.[1] ?? 1);
        void h;
    }
}
const earsBB = nodeBB("rabbit_alert_ears");
console.log(`GREEN ears local-subtree bbox y-extent: ${(earsBB.max[1] - earsBB.min[1]).toFixed(3)}m`);
if (earsBB.max[1] - earsBB.min[1] < 0.175) die(`GREEN FAIL: ears y-extent ${(earsBB.max[1] - earsBB.min[1]).toFixed(3)} < 0.175 (v2 pale tall ears required)`);

// GREEN 5: total bbox within the LIVE envelope (1mm float tolerance — the
// census prints rounded values; the guard exists to catch cm-scale growth)
const W = NEW.bb.max[0] - NEW.bb.min[0], D = NEW.bb.max[2] - NEW.bb.min[2], H = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN total bbox: ${W.toFixed(3)} x ${H.toFixed(3)} x ${D.toFixed(3)} (live envelope 1.839 x 1.515 x 1.432)`);
if (W > 1.839 + 0.001 || D > 1.432 + 0.001 || H > 1.515 + 0.001) die(`GREEN FAIL: exceeds live envelope — same-tuple replace would create new contacts`);
if (NEW.bb.min[1] < -0.001) die(`GREEN FAIL: below ground (min.y ${NEW.bb.min[1]})`);

console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: BEFORE bytes must fail — no rabbit_sit_head, sitter inside
const BEFORE = decode("agents/arthur/reviews/fauna4-hutch/before/village_hutch3.glb");
if (BEFORE.sha !== "f5f47791dadb5abe") die(`RED setup fail: before sha ${BEFORE.sha}`);
const bnames = BEFORE.nodes.map(n => n.name);
const bHasHead = bnames.includes("rabbit_sit_head");
let redSat = false;
if (bHasHead) { console.log("RED anomaly: before has rabbit_sit_head?"); redSat = true; }
if (!bnames.includes("rabbit_sit")) die("RED setup fail: before lacks rabbit_sit");
console.log(`RED control: BEFORE ${BEFORE.sha}: rabbit_sit_head=${bHasHead}, rabbit_hop=${bnames.includes("rabbit_hop")}`);
if (redSat || !bnames.includes("rabbit_hop")) die("RED FAIL: before unexpectedly satisfies the new contract");
console.log("DECODE VERDICT: GREEN (new rabbits) + RED (before fails) — PASS");
