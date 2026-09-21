// fauna81-decode-rat.ts — decode audit for the fauna-81 brown rat.
// GREEN contract (village_dress_rat1.glb v1): 3 motion anchors (rat,
// rat_head, rat_snout), snout NESTED in head, head nested in rat.
// Envelope bands (post-×2.0 bake + post-bake run furniture): full-entity
// W [0.66,0.72] (lane rear −0.48 → husk front ~0.21), D [0.26,0.32] (blade
// lean ±0.14), H [0.085,0.105] (ear crest 0.096), base min.y in
// [−0.002,0.008]. rat subtree: tail tip [−0.435,−0.405], nose tip
// [0.120,0.145], crown [0.088,0.104].
// THE LONG-TAIL SPECIES GATE: visible tail / head-body ∈ [0.9,1.3] — the
// murid law (vole is 0.35; the rat's naked tail is ~1.0x HB). Computed
// from mesh extents: rump rear face = min x of body-mass buckets (those
// reaching within −0.16), tail buckets = those extending past −0.16.
// EAR-PRIDE GATE: the ear mesh's max.y must crest the body-mass max.y by
// ≥6mm (the alert head IS the pause-and-listen read).
// HUSK-CONTACT LAW: the husk pile's leading (min) x must lie within 15mm
// of the nose-tip x (the rat feeds at ITS pile).
// RED control: the VOLE bytes (f2703767…, the live vole lib) must FAIL —
// zero rat anchors. Decoder law: FULL TRS accumulation (fauna-2/7;
// magpi law a — FIXED row-major quaternion block, fauna57 chassis).
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

const NEW = decode("agents/arthur/assets/village_dress_rat1.glb");
console.log("NEW sha16:", NEW.sha16);
if (NEW.sha !== "9b1cb0d657c42d3fd90c398c8506eb68153569ae70875a803248ec361cf3c641") die(`sha drift: ${NEW.sha}`);

// rat subtree envelope + per-mesh dump
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const ratIdx = NEW.json.nodes.findIndex((n: any) => n.name === "rat");
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
env(ratIdx, I);
console.log(`rat subtree envelope: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);
const RAT = { lo, hi };

const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["rat", "rat_head", "rat_snout"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present");
// GREEN 2: nesting
const rI = NEW.json.nodes.findIndex((n: any) => n.name === "rat");
const hI = NEW.json.nodes.findIndex((n: any) => n.name === "rat_head");
const snI = NEW.json.nodes.findIndex((n: any) => n.name === "rat_snout");
if (!(NEW.json.nodes[rI].children ?? []).includes(hI)) die("GREEN FAIL: head not nested in rat");
if (!(NEW.json.nodes[hI].children ?? []).includes(snI)) die("GREEN FAIL: snout not nested in head");
console.log("GREEN nesting: snout->head->rat (rides the scan)");
// GREEN 3: full-entity envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 1.18 || w > 1.33) die(`GREEN FAIL: width ${w.toFixed(3)} outside band [1.18,1.33]`); // v8: the extended wall-run lane spans −0.71..+0.55
if (d < 0.26 || d > 0.33) die(`GREEN FAIL: depth ${d.toFixed(3)} outside band [0.26,0.33]`); // v4+: the vole-width lane (0.30) carries the depth
if (h < 0.085 || h > 0.110) die(`GREEN FAIL: height ${h.toFixed(3)} outside band [0.085,0.110]`); // v6: husk-mound crest 0.106
if (NEW.bb.min[1] > 0.008 || NEW.bb.min[1] < -0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated band`); // vole law: struts/lane disc root ≤12mm below grade (v6 lane disc)
// GREEN 4: rat subtree bands (tail tip = rear, nose = front)
const noseX = RAT.hi[0], tailTipX = RAT.lo[0];
console.log(`GREEN rat body: tail tip ${tailTipX.toFixed(3)}, nose ${noseX.toFixed(3)}, crown ${RAT.hi[1].toFixed(3)}`);
if (tailTipX < -0.435 || tailTipX > -0.405) die(`GREEN FAIL: tail tip ${tailTipX.toFixed(3)} outside [−0.435,−0.405]`);
if (noseX < 0.120 || noseX > 0.145) die(`GREEN FAIL: nose tip ${noseX.toFixed(3)} outside [0.120,0.145]`);
if (RAT.hi[1] < 0.088 || RAT.hi[1] > 0.104) die(`GREEN FAIL: crown ${RAT.hi[1].toFixed(3)} outside [0.088,0.104]`);
// GREEN 5: joint heights (root frame, post-bake)
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("rat_head"), sy = jy("rat_snout");
console.log(`GREEN joints: head y=${hy?.toFixed(4)} (want [0.055,0.070]); snout y=${sy?.toFixed(4)} head-local (want [−0.008,0.000])`);
if (hy === undefined || hy < 0.055 || hy > 0.070) die(`GREEN FAIL: head joint y=${hy} outside band [0.055,0.070]`);
if (sy === undefined || sy < -0.008 || sy > 0.000) die(`GREEN FAIL: snout joint y=${sy} outside head-local band [−0.008,0.000]`);
// GREEN 6: THE LONG-TAIL SPECIES GATE — visible tail / head-body ∈ [0.9,1.3].
// Mesh buckets identified by REAR EXTENT (vole decoder law): body-mass
// buckets stop at the rump rear face (~−0.14 baked); tail buckets extend
// past −0.16 (v3's two-segment tail: tailA box min ≈−0.27, tailB ≈−0.42;
// the rump's −0.144 stays body-side). The rump rear = min x of body
// buckets; visible tail = rump rear − tail min x; HB = nose − rump rear.
const tailMeshes = meshList.filter(m => m.min[0] < -0.16);
if (tailMeshes.length === 0) die("GREEN FAIL: no tail meshes found behind the body rear face");
const bodyMeshes = meshList.filter(m => m.min[0] >= -0.16);
if (bodyMeshes.length === 0) die("GREEN FAIL: no body meshes found");
const tlo = [Infinity, Infinity, Infinity], thi = [-Infinity, -Infinity, -Infinity];
for (const m of tailMeshes) for (let k = 0; k < 3; k++) { tlo[k] = Math.min(tlo[k], m.min[k]); thi[k] = Math.max(thi[k], m.max[k]); }
console.log(`tail meshes (${tailMeshes.length}) union: x ${tlo[0].toFixed(4)}..${thi[0].toFixed(4)}  y ${tlo[1].toFixed(4)}..${thi[1].toFixed(4)}`);
const blo = [Infinity, Infinity, Infinity];
for (const m of bodyMeshes) blo[0] = Math.min(blo[0], m.min[0]);
const visibleTail = blo[0] - tlo[0];
const headBody = noseX - blo[0];
const ratio = visibleTail / headBody;
console.log(`GREEN long-tail: rump rear ${blo[0].toFixed(4)}, visible tail ${visibleTail.toFixed(4)}, HB ${headBody.toFixed(4)}, ratio ${ratio.toFixed(3)} (want [0.9,1.3])`);
if (ratio < 0.9 || ratio > 1.3) die(`GREEN FAIL: tail/HB ratio ${ratio.toFixed(3)} outside the murid band [0.9,1.3]`);
// GREEN 7: EAR-PRIDE GATE — the ear bucket's max.y must crest the BODY
// mass top by ≥6mm (the alert head carries the read). Ear buckets: those
// reaching > 0.085 (only the ears reach that high); body top = max over
// the NON-ear buckets (body/rump/head masses — excluding the ears so the
// gate never compares the crest against itself).
const earMeshes = meshList.filter(m => m.max[1] > 0.085);
const nonEarMeshes = meshList.filter(m => m.max[1] <= 0.085);
if (earMeshes.length < 1) die("GREEN FAIL: no ear meshes cresting 0.085 (ears missing or buried — the vole is the buried one)");
const earTop = Math.max(...earMeshes.map(m => m.max[1]));
const bodyTop = Math.max(...nonEarMeshes.map(m => m.max[1]));
console.log(`GREEN ear-pride: ear crest ${earTop.toFixed(4)} vs body top ${bodyTop.toFixed(4)} (want ≥6mm crest)`);
if (earTop < bodyTop + 0.006) die(`GREEN FAIL: ears crest only ${(earTop - bodyTop).toFixed(4)}m above the body line — the pause-and-listen read is dead`);
// GREEN 8: HUSK-CONTACT — the husk pile's leading x within 15mm of nose
// (the merged furniture buckets are top-level nodes beside "rat")
let huskLead = Infinity;
for (const s of NEW.json.scenes[NEW.json.scene].nodes) {
    const n = NEW.json.nodes[s];
    if (n.name === "rat" || n.mesh === undefined) continue;
    for (const prim of NEW.json.meshes[n.mesh].primitives) {
        const acc = NEW.json.accessors[prim.attributes.POSITION];
        const world = trs(n.translation, n.rotation, n.scale);
        const pts = [apply(world, [acc.min[0], acc.min[1], acc.min[2]]), apply(world, [acc.max[0], acc.min[1], acc.min[2]])];
        const minX = Math.min(pts[0][0], pts[1][0]);
        // husk/mote buckets live FORWARD of the lane: min.x in [0.10,0.25]
        // AND stand tall (y-extent > 8mm — the flat husk-shadow bucket must
        // not masquerade as the pile). v6: the MOUND BASE (squashed disc,
        // y-ext 14mm) is itself a pile component — y-ext ≥ 8mm qualifies it.
        const yExt = acc.max[1] - acc.min[1];
        if (minX > 0.10 && minX < 0.25 && yExt > 0.008) huskLead = Math.min(huskLead, minX);
    }
}
const huskGap = Math.abs(huskLead - noseX);
console.log(`GREEN husk-contact: pile lead ${huskLead.toFixed(3)} vs nose tip ${noseX.toFixed(3)} → gap ${huskGap.toFixed(3)}m (want ≤0.015)`);
if (huskGap > 0.015) die(`GREEN FAIL: husk pile ${huskGap.toFixed(3)}m from the nose — the rat does not feed at its pile`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the VOLE bytes must fail every rat gate
const HOST = decode("agents/arthur/assets/village_dress_vole1.glb");
if (HOST.sha16 !== "f27037673949833b") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live vole lib f2703767…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /rat/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16.slice(0, 16)}: rat anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(2)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries rat anchors");
if (hhh >= 0.085 && hhh <= 0.105) die("RED FAIL: host height unexpectedly inside the rat band");
console.log("DECODE VERDICT: GREEN (new brown rat) + RED (vole clean) — PASS");
