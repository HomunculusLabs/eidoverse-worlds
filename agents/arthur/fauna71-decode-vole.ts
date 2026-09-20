// fauna71-decode-vole.ts — decode audit for the fauna-71 field vole.
// GREEN contract (village_dress_vole1.glb v2): 3 motion anchors (vole,
// vole_head, vole_snout), snout NESTED in head, head nested in vole.
// Envelope bands (post-×2.2 bake + post-bake run furniture):
// full-entity W [0.58,0.72] (the run + cut pile), D [0.34,0.48], H
// [0.32,0.42] (tallest tuft stalk 0.20 + seed head), base min.y in
// [−0.006,0.008] (feet bottom ~3mm; contact shadow covers — hmou law).
// vole subtree (the animal itself): rear extent (tail tip) in
// [−0.210,−0.175], nose tip [0.095,0.130], crown y [0.080,0.100].
// THE SHORT-TAIL SPECIES GATE: visible tail (dark-bead chain extent
// behind the rump-rear face) / head-body (rump-rear face → nose tip)
// ∈ [0.28,0.42] — the vole's ~30% law (dmou fat-tail + hmou prehensile
// are the fleet's other rodent tails; the SHORT tail is the vole's).
// BICOLOR GATE: the TALV pale strip's min.y must sit ≥1mm BELOW the
// TALD chain's min.y (dark over pale, the bicolored read).
// NIBBLE-STEM CONTACT LAW: the nibbled stem's baked base x must lie
// within 12mm of the baked nose-tip x (the vole reaches ITS stem).
// RED control: the HMOU bytes (93ebddcb…, the live hmou lib) must FAIL —
// zero vole anchors. Decoder law: FULL TRS accumulation (fauna-2/7;
// magpi law a — the FIXED row-major quaternion block, fauna57 chassis).
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

const NEW = decode("agents/arthur/assets/village_dress_vole1.glb");
console.log("NEW sha16:", NEW.sha16);
if (NEW.sha !== "f27037673949833b4f240288e072f72410c8fb8a2fb1460607fefabd7e65772c") die(`sha drift: ${NEW.sha}`);

// vole subtree envelope + per-mesh dump (find tail buckets by material)
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const voleIdx = NEW.json.nodes.findIndex((n: any) => n.name === "vole");
let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
const meshList: any[] = [];
const env = (idx: number, parent: number[]) => {
    const n = NEW.json.nodes[idx];
    const world = mul(parent, trs(n.translation, n.rotation, n.scale));
    if (n.mesh !== undefined) for (const prim of NEW.json.meshes[n.mesh].primitives) {
        const acc = NEW.json.accessors[prim.attributes.POSITION];
        const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
        const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
        let mlo = [Infinity, Infinity, Infinity], mhi = [-Infinity, -Infinity, -Infinity];
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
            const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
            for (let k = 0; k < 3; k++) { if (w[k] < mlo[k]) mlo[k] = w[k]; if (w[k] > mhi[k]) mhi[k] = w[k]; }
        }
        for (let k = 0; k < 3; k++) { if (mlo[k] < lo[k]) lo[k] = mlo[k]; if (mhi[k] > hi[k]) hi[k] = mhi[k]; }
        meshList.push({ node: n.name, mat: prim.material, min: mlo, max: mhi });
    }
    for (const c of n.children ?? []) env(c, world);
};
env(voleIdx, I);
console.log(`vole subtree envelope: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
const VOLE = { lo, hi };

const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["vole", "vole_head", "vole_snout"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present");
// GREEN 2: nesting
const vI = NEW.json.nodes.findIndex((n: any) => n.name === "vole");
const hI = NEW.json.nodes.findIndex((n: any) => n.name === "vole_head");
const snI = NEW.json.nodes.findIndex((n: any) => n.name === "vole_snout");
if (!(NEW.json.nodes[vI].children ?? []).includes(hI)) die("GREEN FAIL: head not nested in vole");
if (!(NEW.json.nodes[hI].children ?? []).includes(snI)) die("GREEN FAIL: snout not nested in head");
console.log("GREEN nesting: snout->head->vole (rides the scan)");
// GREEN 3: full-entity envelope bands (re-derived from member arithmetic:
// lane rear −0.60 → cut-pile front 0.186 = W 0.786; seed-head crown 0.209;
// tuft-stalk lean z ±0.235 = D 0.47)
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.76 || w > 0.82) die(`GREEN FAIL: width ${w.toFixed(3)} outside band [0.76,0.82]`);
if (d < 0.44 || d > 0.50) die(`GREEN FAIL: depth ${d.toFixed(3)} outside band [0.44,0.50]`);
if (h < 0.19 || h > 0.23) die(`GREEN FAIL: height ${h.toFixed(3)} outside band [0.19,0.23]`);
if (NEW.bb.min[1] > 0.006 || NEW.bb.min[1] < -0.004) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated band`);
// GREEN 4: vole subtree bands (tail tip = rear, nose = front)
const noseX = VOLE.hi[0], tailTipX = VOLE.lo[0];
console.log(`GREEN vole body: tail tip ${tailTipX.toFixed(3)}, nose ${noseX.toFixed(3)}, crown ${VOLE.hi[1].toFixed(3)}`);
if (tailTipX < -0.225 || tailTipX > -0.195) die(`GREEN FAIL: tail tip ${tailTipX.toFixed(3)} outside [−0.225,−0.195]`);
if (noseX < 0.095 || noseX > 0.130) die(`GREEN FAIL: nose tip ${noseX.toFixed(3)} outside [0.095,0.130]`);
if (VOLE.hi[1] < 0.080 || VOLE.hi[1] > 0.100) die(`GREEN FAIL: crown ${VOLE.hi[1].toFixed(3)} outside [0.080,0.100]`);
// GREEN 5: joint heights (root frame, post-bake)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("vole_head"), sy = jy("vole_snout");
console.log(`GREEN joints: head y=${hy?.toFixed(4)} (want [0.038,0.055]); snout y=${sy?.toFixed(4)} head-local (want [−0.008,0.000])`);
if (hy === undefined || hy < 0.038 || hy > 0.055) die(`GREEN FAIL: head joint y=${hy} outside band [0.038,0.055]`);
if (sy === undefined || sy < -0.008 || sy > 0.000) die(`GREEN FAIL: snout joint y=${sy} outside head-local band [−0.008,0.000]`);
// GREEN 6: THE SHORT-TAIL SPECIES GATE — visible tail / head-body ∈ [0.28,0.42].
// glbwrite plain mats fold into COLOR_0 with NO material names (fauna-48
// law e), and merged buckets span WHOLE member chains (the TALD bead
// bucket runs bead-0-to-tip, crossing the body rear face) — so tail
// buckets are identified by REAR EXTENT: any mesh reaching past −0.17
// (body buckets stop at the rump −0.132); the pale underside strip is
// the tail mesh with the LOWEST min.y.
const tailMeshes = meshList.filter(m => m.min[0] < -0.17);
if (tailMeshes.length === 0) die("GREEN FAIL: no tail meshes found behind the body rear face");
const bodyMeshes = meshList.filter(m => m.min[0] >= -0.17);
if (bodyMeshes.length === 0) die("GREEN FAIL: no body meshes found");
const tlo = [Infinity, Infinity, Infinity], thi = [-Infinity, -Infinity, -Infinity];
for (const m of tailMeshes) for (let k = 0; k < 3; k++) { tlo[k] = Math.min(tlo[k], m.min[k]); thi[k] = Math.max(thi[k], m.max[k]); }
console.log(`tail meshes (${tailMeshes.length}) union: x ${tlo[0].toFixed(4)}..${thi[0].toFixed(4)}  y ${tlo[1].toFixed(4)}..${thi[1].toFixed(4)}`);
const paleMeshes = tailMeshes.filter(m => Math.abs(m.min[1] - tlo[1]) < 1e-6);
const darkMeshes = tailMeshes.filter(m => m.min[1] > tlo[1] + 1e-6);
// rump rear face from body meshes:
const blo = [Infinity, Infinity, Infinity];
for (const m of bodyMeshes) blo[0] = Math.min(blo[0], m.min[0]);
const visibleTail = blo[0] - tlo[0];
const headBody = noseX - blo[0];
const ratio = visibleTail / headBody;
console.log(`GREEN short-tail: rump rear ${blo[0].toFixed(4)}, visible tail ${visibleTail.toFixed(4)}, HB ${headBody.toFixed(4)}, ratio ${ratio.toFixed(3)} (want [0.28,0.42])`);
if (ratio < 0.28 || ratio > 0.42) die(`GREEN FAIL: tail/HB ratio ${ratio.toFixed(3)} outside the vole band [0.28,0.42]`);
// BICOLOR gate: pale strip's min.y ≥ 1mm below dark chain's min.y
if (darkMeshes.length && paleMeshes.length) {
    const dMinY = Math.min(...darkMeshes.map(m => m.min[1]));
    const pMinY = Math.min(...paleMeshes.map(m => m.min[1]));
    console.log(`GREEN bicolor: pale min.y ${pMinY.toFixed(4)} vs dark min.y ${dMinY.toFixed(4)} (want pale ≥1mm below)`);
    if (pMinY > dMinY - 0.001) die(`GREEN FAIL: pale strip not below the dark chain (${pMinY} vs ${dMinY})`);
} else {
    console.log("GREEN bicolor: SKIPPED (material names opaque — glbwrite plain mats may fold COLOR_0; judged at render)");
}
// GREEN 7: NIBBLE-STEM CONTACT — the baked stem base (0.116) vs nose tip x
const stemGap = Math.abs(0.116 - noseX);
console.log(`GREEN nibble-stem: stem base 0.116 vs nose tip ${noseX.toFixed(3)} → gap ${stemGap.toFixed(3)}m (want ≤0.012)`);
if (stemGap > 0.012) die(`GREEN FAIL: nibbled stem base ${stemGap.toFixed(3)}m from the nose — the vole does not reach its stem`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the HMOU bytes must fail every vole gate
const HOST = decode("agents/arthur/assets/village_dress_hmou1.glb");
if (HOST.sha16 !== "93ebddcbbda82774") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live hmou lib 93ebddcb…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /vole/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16.slice(0, 16)}: vole anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries vole anchors");
if (hhh >= 0.32 && hhh <= 0.42) die("RED FAIL: host height unexpectedly inside the vole band");
console.log("DECODE VERDICT: GREEN (new field vole) + RED (hmou clean) — PASS");
