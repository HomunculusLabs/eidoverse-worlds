// fauna37-decode-dog.ts — decode audit for the fauna-37 farm collie.
// GREEN contract (village_dress_dog1.glb): 5 motion anchors (dog,
// dog_head, dog_tail, dog_ears, dog_chest); sphinx-doze footprint L in
// [1.55,1.85] (body + extended forelegs + laid brush tail), W in
// [0.34,0.48], crown height in [0.55,0.63] (head joint 0.50 + ear
// reach ~0.12 = the up-headed doze), base ground-seated (|min.y| <=
// 0.013 — the 12mm pad). RED control: the GOAT PEN host bytes
// (village_goats3.glb, live lib 7e9af5a5…) must FAIL — zero dog
// anchors and height 1.31 outside the dog band (proves the gate
// discriminates rider from host).
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under affine.
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

const NEW = decode("agents/arthur/assets/village_dress_dog1.glb");
console.log("NEW sha16:", NEW.sha16);
// per-mesh world envelope dump (law 0: unexplained envelope numbers get
// probed, not waived) — pinpoints which bucket owns min.y and the spans
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
const want = ["dog", "dog_head", "dog_tail", "dog_ears", "dog_chest"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 5 motion groups present (dog, dog_head, dog_tail, dog_ears, dog_chest)");
// GREEN 2: sphinx-doze bands. W is SHADOW-DERIVED (v3+): the contact
// shadow disc (r 0.62 × 0.55) spans z −0.281..0.401 = 0.682 — the
// widest member; body-only width would be 0.395. Band [0.62,0.74].
// min.y −0.010 = the brisket's intentional 10mm settle-embed (contact,
// within the ±0.013 ground-seated law).
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 1.55 || w > 1.85) die(`GREEN FAIL: length ${w.toFixed(2)} outside doze band [1.55,1.85]`);
if (d < 0.62 || d > 0.74) die(`GREEN FAIL: width ${d.toFixed(2)} outside shadow-derived band [0.62,0.74]`);
if (h < 0.55 || h > 0.66) die(`GREEN FAIL: height ${h.toFixed(2)} outside band [0.55,0.66] (crown 0.628 + settle-embed 0.010 → span 0.638)`);
if (NEW.bb.min[1] > 0.013 || NEW.bb.min[1] < -0.013) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: joint origin bands (group node translations, root frame)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("dog_head"), cy = jy("dog_chest"), ty = jy("dog_tail");
const eyN = NEW.json.nodes.find((n: any) => n.name === "dog_ears");
const ey = eyN?.translation?.[1];
console.log(`GREEN joints: dog_head y=${hy?.toFixed(3)} (want [0.44,0.56]); dog_chest y=${cy?.toFixed(3)} (want [0.22,0.34]); dog_tail y=${ty?.toFixed(3)} (want [0.03,0.07]); dog_ears y=${ey?.toFixed(3)} HEAD-LOCAL`);
if (hy === undefined || hy < 0.44 || hy > 0.56) die(`GREEN FAIL: dog_head joint y=${hy} outside neck band [0.44,0.56]`);
if (cy === undefined || cy < 0.22 || cy > 0.34) die(`GREEN FAIL: dog_chest joint y=${cy} outside withers band [0.22,0.34]`);
if (ty === undefined || ty < 0.03 || ty > 0.07) die(`GREEN FAIL: dog_tail joint y=${ty} outside rump band [0.03,0.07]`);
if (ey === undefined || ey < 0.03 || ey > 0.07) die(`GREEN FAIL: dog_ears joint y=${ey} outside head-local crown band [0.03,0.07]`);
// nesting: dog_ears must be a child of dog_head
const headIdx = NEW.json.nodes.findIndex((n: any) => n.name === "dog_head");
const earsIdx = NEW.json.nodes.findIndex((n: any) => n.name === "dog_ears");
if (!(NEW.json.nodes[headIdx].children ?? []).includes(earsIdx)) die("GREEN FAIL: dog_ears not nested in dog_head");
console.log("GREEN nesting: dog_ears nested in dog_head (rides the scan)");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the goat pen host bytes must fail every dog gate
const HOST = decode("agents/arthur/assets/village_goats3.glb");
if (HOST.sha16 !== "7e9af5a59d4b77ad") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live pen lib 7e9af5a59d4b77ad…)`);
const hostDog = HOST.nodes.map(n => n.name).filter(nm => /dog/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: dog anchors: [${hostDog.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostDog.length !== 0) die("RED FAIL: host unexpectedly carries dog anchors");
if (hh >= 0.55 && hh <= 0.63) die("RED FAIL: host height unexpectedly inside the dog band");
console.log("DECODE VERDICT: GREEN (new dog) + RED (host clean) — PASS");
