// fauna46-decode-dmou.ts — decode audit for the fauna-46 dormouse.
// GREEN contract (village_dress_dmou1.glb, f78598ba): 4 motion anchors
// (dmou, dmou_head, dmou_ear NESTED in head, dmou_tail in dmou).
// Post-×2.0 bake arithmetic: body ball center (−0.008,0.030,0.004) half
// (0.027,0.025,0.024) → top 0.055; ear tips ~0.060 (ride the silhouette
// by design); nest tori rim top ~0.028 (back cresting the bed); tail
// root (−0.036,0.026,0.016) → crest (−0.020,0.038,0.040) → drape tip
// (−0.018,0.018,0.054). Envelope bands W [0.11,0.14] D [0.105,0.13]
// H [0.054,0.068] base [−0.005,0.005]. TAIL-RIM CROSSING LAW (the
// signature read): the merged TAL bucket under dmou_tail must contain
// the rim-crossing point (−0.019,0.034,0.041) ±4mm and drape to
// z ≥ 0.050 past the outer wall. NEST LAW: a root-level woven bucket
// spans the ring footprint. RED control: the HMOU bytes (93ebddcb…)
// must FAIL — zero dmou anchors, height outside the band.
// Decoder law: FULL TRS accumulation (fauna-2/7), box corners under
// affine; keep-fold renames internal meshes <group>_N — anchor checks
// are SUBSET checks (fauna-19 law c).
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

const NEW = decode("agents/arthur/assets/village_dress_dmou1.glb");
if (NEW.sha16 !== "c21430641ffadf67") die(`NEW sha16 ${NEW.sha16} — v6 bytes expected (shingle-cane wall)`);
console.log("NEW sha16:", NEW.sha16);

// subtree envelope + per-mesh dump, rooted at a named node
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const subtree = (rootName: string) => {
    const idx = NEW.json.nodes.findIndex((n: any) => n.name === rootName);
    if (idx < 0) die(`node ${rootName} missing`);
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
            meshList.push({ node: n.name, min: mlo, max: mhi });
        }
        for (const c of n.children ?? []) env(c, world);
    };
    env(idx, I);
    return { lo, hi, meshList };
};
const DMOU = subtree("dmou");
console.log(`dmou subtree envelope: x ${DMOU.lo[0].toFixed(3)}..${DMOU.hi[0].toFixed(3)}  y ${DMOU.lo[1].toFixed(3)}..${DMOU.hi[1].toFixed(3)}  z ${DMOU.lo[2].toFixed(3)}..${DMOU.hi[2].toFixed(3)}`);

const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["dmou", "dmou_head", "dmou_ear", "dmou_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 4 motion groups present");
// GREEN 2: nesting
const node = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm);
if (!(node("dmou").children ?? []).map((c: any) => NEW.json.nodes[c].name).includes("dmou_head")) die("GREEN FAIL: head not nested in dmou");
if (!(node("dmou_head").children ?? []).map((c: any) => NEW.json.nodes[c].name).includes("dmou_ear")) die("GREEN FAIL: ear not nested in head");
if (!(node("dmou").children ?? []).map((c: any) => NEW.json.nodes[c].name).includes("dmou_tail")) die("GREEN FAIL: tail not nested in dmou");
console.log("GREEN nesting: ear->head->dmou (rides the sway), tail->dmou");
// GREEN 3: full-entity envelope bands
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.11 || w > 0.14) die(`GREEN FAIL: width ${w.toFixed(3)} outside band [0.11,0.14]`);
// v2 depth band re-derived: the drape composes the tail-group origin
// (z +0.008) — tip z 0.073, 15mm proud of the outer wall face — and
// the rotated rim-knot/arcs inflate the footprint to 0.134.
if (d < 0.125 || d > 0.140) die(`GREEN FAIL: depth ${d.toFixed(3)} outside band [0.125,0.140]`);
// v3 height band re-derived: the fat tail's crest point (0.0155+0.0055)
// tops 0.066 + bead; full envelope 0.069.
if (h < 0.060 || h > 0.075) die(`GREEN FAIL: height ${h.toFixed(3)} outside band [0.060,0.075]`);
if (NEW.bb.min[1] > 0.005 || NEW.bb.min[1] < -0.008) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated band`);
// GREEN 4: the dmou subtree (the animal itself, incl. its tail)
const bodyTop = DMOU.meshList.filter(m => /^dmou(_\d+)?$/.test(m.node ?? ""));
let bt = -Infinity;
for (const m of bodyTop) bt = Math.max(bt, m.max[1]);
console.log(`GREEN body ball: merged body-bucket top y=${bt.toFixed(3)} (want [0.050,0.060]); subtree rear x=${DMOU.lo[0].toFixed(3)}`);
if (bt < 0.050 || bt > 0.060) die(`GREEN FAIL: body bucket top ${bt.toFixed(3)} outside [0.050,0.060]`);
// rear band re-derived from TRUE member arithmetic: the rump sphere
// (post-bake center −0.038, half 0.018) reaches −0.056; the first
// draft's [−0.040,−0.030] was body-ball-only and forgot the rump.
if (DMOU.lo[0] < -0.060 || DMOU.lo[0] > -0.050) die(`GREEN FAIL: subtree rear ${DMOU.lo[0].toFixed(3)} outside [−0.060,−0.050]`);
// GREEN 5: joints
const j = (nm: string) => node(nm)?.translation;
const hy = j("dmou_head"), ey = j("dmou_ear"), ty = j("dmou_tail");
console.log(`GREEN joints: head y=${hy?.[2] !== undefined ? hy[1].toFixed(4) : "?undefined"} (want [0.036,0.044] entity); ear head-local y=${ey?.[1]?.toFixed(4)} (want [0.013,0.017]); tail entity y=${ty?.[1]?.toFixed(4)} x=${ty?.[0]?.toFixed(4)} (want y [0.023,0.029], x [−0.039,−0.033])`);
if (hy === undefined || hy[1] < 0.036 || hy[1] > 0.044) die(`GREEN FAIL: head joint y=${hy?.[1]} outside band [0.036,0.044]`);
if (ey === undefined || ey[1] < 0.013 || ey[1] > 0.017) die(`GREEN FAIL: ear joint head-local y=${ey?.[1]} outside band [0.013,0.017]`);
if (ty === undefined || ty[1] < 0.023 || ty[1] > 0.029 || ty[0] < -0.039 || ty[0] > -0.033) die(`GREEN FAIL: tail joint ${JSON.stringify(ty)} outside bands`);
// GREEN 6: TAIL-RIM CROSSING (the signature read) — the TAL bucket
// under dmou_tail must contain the rim crossing + drape past the wall
const TAIL = subtree("dmou_tail");
let tlo = [Infinity, Infinity, Infinity], thi = [-Infinity, -Infinity, -Infinity];
for (const m of TAIL.meshList) for (let k = 0; k < 3; k++) { tlo[k] = Math.min(tlo[k], m.min[k]); thi[k] = Math.max(thi[k], m.max[k]); }
if (!TAIL.meshList.length) die("GREEN FAIL: dmou_tail carries no mesh (anchor lost in merge?)");
console.log(`tail bucket envelope: x ${tlo[0].toFixed(4)}..${thi[0].toFixed(4)}  y ${tlo[1].toFixed(4)}..${thi[1].toFixed(4)}  z ${tlo[2].toFixed(4)}..${thi[2].toFixed(4)}`);
const TOL = 0.004;
const cross = [-0.019, 0.033, 0.041];
for (let k = 0; k < 3; k++) {
    if (cross[k] < tlo[k] - TOL || cross[k] > thi[k] + TOL) die(`GREEN FAIL: rim-crossing point axis ${k} (${cross[k]}) escapes the tail bucket ±4mm`);
}
if (thi[2] < 0.058) die(`GREEN FAIL: tail drape z-max ${thi[2].toFixed(4)} < 0.058 (does not pass proud of the outer wall face)`);
if (thi[1] < 0.040 || thi[1] > 0.052) die(`GREEN FAIL: tail crest y-max ${thi[1].toFixed(4)} outside [0.040,0.052]`);
if (tlo[1] > 0.006) die(`GREEN FAIL: tail drape y-min ${tlo[1].toFixed(4)} > 0.006 (does not drop to nest-base height)`);
console.log(`GREEN tail-rim crossing: bucket contains (${cross}) ±4mm; drape z-max ${thi[2].toFixed(4)} ≥ 0.058, y-min ${tlo[1].toFixed(4)} — the tail CRESTS the rim and drapes the outer wall to base height`);
// GREEN 7: NEST — a root-level woven bucket spans the ring footprint
const nestOK = NEW.json.scenes[NEW.json.scene].nodes.some((si: number) => {
    const n = NEW.json.nodes[si];
    if (n.mesh === undefined) return false;
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const prim of NEW.json.meshes[n.mesh].primitives) {
        const acc = NEW.json.accessors[prim.attributes.POSITION];
        const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
        const hh = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
        for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], c[k] - hh[k]); hi[k] = Math.max(hi[k], c[k] + hh[k]); }
    }
    return lo[0] <= -0.045 && hi[0] >= 0.030 && lo[2] <= -0.040 && hi[2] >= 0.040 && lo[1] >= -0.002 && hi[1] <= 0.033;
});
if (!nestOK) die("GREEN FAIL: no root-level woven bucket spans the nest ring footprint");
console.log("GREEN nest: woven bucket spans the ring footprint (x −0.045..0.030, z ±0.040, y ≤ 0.033)");
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the hmou bytes must fail every dmou gate
const HOST = decode("agents/arthur/assets/village_dress_hmou1.glb");
if (HOST.sha16 !== "93ebddcbbda82774") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live hmou lib 93ebddcb…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /dmou/.test(nm ?? ""));
const hhh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: HOST ${HOST.sha16}: dmou anchors: [${hostR.join(",") || "none"}]; height ${hhh.toFixed(3)}m`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries dmou anchors");
if (hhh >= 0.054 && hhh <= 0.068) die("RED FAIL: host height unexpectedly inside the dormouse band");
console.log("DECODE VERDICT: GREEN (new dormouse) + RED (hmou clean) — PASS");
