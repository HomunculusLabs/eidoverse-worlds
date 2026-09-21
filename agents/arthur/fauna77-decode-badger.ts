// fauna77-decode-badger.ts — decode audit for the fauna-77 European
// badger (interrupted-window recovery: build landed 21:49, ledger
// ignorant — artwalk-32 pre-place class; deterministic rebuild ×2
// reproduced the pinned bytes 70051e46… this tick).
// GREEN contract (village_dress_badger1.glb): 4 motion anchors (badger,
// badger_head, badger_snout, badger_tail). Envelope bands re-derived
// from authored dims: the SETT dominates — mound x -1.55..0.45, old
// spoil z to -1.225, fresh spoil z to +1.19, nose/worm-casts x to
// ~1.36, mound crest y 0.34, heap clods half-settled min.y ~ -0.035.
// L [2.80,3.05], W [2.30,2.55], H [0.30,0.38], min.y [-0.045,0.012].
// Joints: badger @(0.95,0,0.10); head y 0.20 pitch rz -0.70 (forage
// crouch — snout at worm-cast height); tail y 0.17; snout NESTED in
// head (rides the Y-scan — hog/vole pattern). RED control: the HARE
// bytes (village_dress_hare1.glb, live lib 79ce2c97253bc33e) must FAIL
// — zero badger anchors, height 0.809 outside the badger band.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine; standard row-major quaternion block (magpi law a — the FIXED
// chassis).
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
    const sha = createHash("sha256").update(bytes).digest("hex");
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
    return { sha, sha16: sha.slice(0, 16), nNodes: json.nodes.length, nodes: nodeInfo, bb, json };
};

const NEW = decode("agents/arthur/assets/village_dress_badger1.glb");
console.log("NEW sha16:", NEW.sha16);
if (NEW.sha16 !== "2f62aae90ac7cdd1") die(`sha drift: ${NEW.sha16} != pinned v13 2f62aae90ac7cdd1`);
// per-mesh world envelope dump (law 0)
{
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const env = (idx: number, parent: number[]): any => {
        const n = NEW.json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives) {
            const acc = NEW.json.accessors[prim.attributes.POSITION];
            const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
            const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
            for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                for (let k = 0; k < 3; k++) { if (w[k] < lo[k]) lo[k] = w[k]; if (w[k] > hi[k]) hi[k] = w[k]; }
            }
        }
        console.log(`  mesh ${n.name ?? idx}: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
        for (const c of n.children ?? []) env(c, world);
    };
    for (const s of NEW.json.scenes[NEW.json.scene].nodes) env(s, I);
}
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["badger", "badger_head", "badger_snout", "badger_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 4 motion groups present");
// GREEN 2: envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min [${NEW.bb.min.map(v => v.toFixed(3))}] max [${NEW.bb.max.map(v => v.toFixed(3))}])`);
console.log(`ENTITY OBB: CX ${((NEW.bb.min[0] + NEW.bb.max[0]) / 2).toFixed(4)}, CZ ${((NEW.bb.min[2] + NEW.bb.max[2]) / 2).toFixed(4)}, HW ${(w / 2).toFixed(4)}, HD ${(d / 2).toFixed(4)}`);
if (w < 3.39 || w > 3.49) die(`GREEN FAIL: length ${w.toFixed(2)} outside band [3.39,3.49] (v5: badger +0.40 out the door)`);
if (d < 2.30 || d > 2.55) die(`GREEN FAIL: width ${d.toFixed(2)} outside band [2.30,2.55]`);
if (h < 0.38 || h > 0.40) die(`GREEN FAIL: height ${h.toFixed(2)} outside band [0.38,0.40] (v8 chest crest 0.355 + settled clod -0.035)`);
if (NEW.bb.min[1] > 0.012 || NEW.bb.min[1] < -0.045) die(`GREEN FAIL: base y ${NEW.bb.min[1]} outside settled band [-0.045,0.012]`);
// GREEN 3: joints (root frame)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const qangZ = (nm: string): number | undefined => {
    const q = NEW.json.nodes.find((n: any) => n.name === nm)?.rotation;
    if (!q) return undefined;
    // pure-z rotation: qz = sin(θ/2) → θ = 2·asin(qz)
    return 2 * Math.asin(Math.max(-1, Math.min(1, q[2])));
};
const byh = jy("badger"), hyh = jy("badger_head"), tyh = jy("badger_tail");
const hp = qangZ("badger_head");
console.log(`GREEN joints: badger y=${byh?.toFixed(3)} (want 0); head y=${hyh?.toFixed(3)} (want [0.16,0.24]) pitch rz=${hp?.toFixed(3)} (want -0.70±0.02); tail y=${tyh?.toFixed(3)} (want [0.14,0.20])`);
if (Math.abs(byh ?? 9) > 0.005) die(`GREEN FAIL: badger root y=${byh} not ground-seated`);
if (hyh === undefined || hyh < 0.24 || hyh > 0.32) die(`GREEN FAIL: head joint y=${hyh} outside band [0.24,0.32] (v2 raised to the chest-top line)`);
if (hp === undefined || Math.abs(hp + 0.52) > 0.02) die(`GREEN FAIL: head pitch ${hp} outside -0.52±0.02 (v7 softened for the belly-height read)`);
if (tyh === undefined || tyh < 0.16 || tyh > 0.21) die(`GREEN FAIL: tail joint y=${tyh} outside band [0.16,0.21] (v5 drooping root)`);
// nesting: snout nested in head (rides the Y-scan)
const hIdx = NEW.json.nodes.findIndex((n: any) => n.name === "badger_head");
const sIdx = NEW.json.nodes.findIndex((n: any) => n.name === "badger_snout");
if (!(NEW.json.nodes[hIdx].children ?? []).includes(sIdx)) die("GREEN FAIL: snout not nested in head");
// nose proud of muzzle front (hare v2 law): snout-local nose front
// composed head-local, then badger-local via the -0.70 pitch
{
    const noseNode = NEW.json.nodes[sIdx]?.children?.map((i: number) => NEW.json.nodes[i]).find((n: any) => n.mesh !== undefined);
    if (!noseNode) die("GREEN FAIL: no mesh under snout");
    const p = apply(trs(noseNode.translation, noseNode.rotation, noseNode.scale), [0.007, 0, 0]);
    // head-local (snout at (0.065,-0.008))
    const hl = [p[0] + 0.065, p[1] - 0.008, p[2]];
    const c = Math.cos(-0.70), s = Math.sin(-0.70);
    const bl = [hl[0] * c - hl[1] * s + 0.28, hl[0] * s + hl[1] * c + 0.20, hl[2]];
    console.log(`GREEN nose: composed badger-local (${bl[0].toFixed(3)}, ${bl[1].toFixed(3)}) — build comment says ~(0.36, 0.128)`);
    if (bl[0] < 0.32 || bl[0] > 0.40) die(`GREEN FAIL: nose x ${bl[0].toFixed(3)} outside [0.32,0.40] (snout break must read)`);
}
console.log("GREEN nesting: snout nested in head (rides the scan)");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the hare bytes must fail every badger gate
const HOST = decode("agents/arthur/assets/village_dress_hare1.glb");
if (HOST.sha16 !== "79ce2c97253bc33e") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live hare lib 79ce2c97…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /badger/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: badger anchors: [${hostR.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries badger anchors");
if (hh >= 0.30 && hh <= 0.38) die("RED FAIL: host height unexpectedly inside the badger band");
console.log("DECODE VERDICT: GREEN (new badger) + RED (hare clean) — PASS");
