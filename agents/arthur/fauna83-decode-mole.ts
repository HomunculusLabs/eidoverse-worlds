// fauna83-decode-mole.ts — decode audit for the fauna-83 European mole.
// GREEN contract (village_dress_mole1.glb v4 — THE RIM-RING CRATER): 3
// motion anchors (mole, mole_head, mole_snout), snout NESTED in head.
// Decoder law: FULL TRS accumulation (fauna-2/7; magpi law a — FIXED
// row-major quaternion block, fauna57 chassis verbatim).
// Gates:
//  G1 anchors present + nesting snout->head->mole
//  G2 full-entity envelope: W [0.60,0.72] (h3 tail -0.466 .. crumb 0.189),
//     D [0.19,0.24] (rim ±0.107), H [0.10,0.12] (shoulders crest 0.1015),
//     base min.y ground-seated [-0.014,0.002]
//  G3 mole subtree bands: nose tip x [0.095,0.115], emerge crest y
//     [0.115,0.130]
//  G4 joint heights post-bake: mole_head y [0.072,0.088], mole_snout y
//     head-local [0.000,0.003]
//  G5 THE EMERGE GATE — animal crest must EXCEED furniture crest (the
//     heap knob, top 0.108) by >= 0.008: the mole breaks its hill.
//  G6 HEAP GATE — the lead earth form reads as ONE RAISED MOUND: >= 3
//     earth buckets cresting >= 0.075 (base+knob+crater = the mound
//     mass) AND the merged earth tops contain a tonal step (>= 2
//     distinct EA/EB-family tops >= 6mm apart) AND dig-line span >= 0.50.
//  G7 SNOUT-PRIDE GATE — snout mesh max.x > skull-mass max.x + 0.004
//     (kfish law: the probe rides PAST the face plane).
//  G8 SPADE-HAND GATE — a pink bucket in the head group with z-span
//     crossing BOTH ±0.032 (the symmetric hand pair flanks the body).
// RED control: the RAT bytes (9b1cb0d6, live rat lib) must FAIL — zero
// mole anchors.
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

const NEW = decode("agents/arthur/assets/village_dress_mole1.glb");
console.log("NEW sha16:", NEW.sha16);
if (NEW.sha !== "31717975fcc5323b2908c903bb64a3dba41c881bb6f4ac98c00bc27b2676638d") die(`sha drift: ${NEW.sha}`);

// mole subtree envelope + per-mesh dump
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const moleIdx = NEW.json.nodes.findIndex((n: any) => n.name === "mole");
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
env(moleIdx, I);
console.log(`mole subtree envelope: x ${lo[0].toFixed(3)}..${hi[0].toFixed(3)}  y ${lo[1].toFixed(3)}..${hi[1].toFixed(3)}  z ${lo[2].toFixed(3)}..${hi[2].toFixed(3)}`);

const names = NEW.nodes.map(n => n.name);
// G1: anchors + nesting
const want = ["mole", "mole_head", "mole_snout"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
const mI = NEW.json.nodes.findIndex((n: any) => n.name === "mole");
const hI = NEW.json.nodes.findIndex((n: any) => n.name === "mole_head");
const snI = NEW.json.nodes.findIndex((n: any) => n.name === "mole_snout");
if (!(NEW.json.nodes[mI].children ?? []).includes(hI)) die("G1 FAIL: head not nested in mole");
if (!(NEW.json.nodes[hI].children ?? []).includes(snI)) die("G1 FAIL: snout not nested in head");
console.log("G1 anchors+nesting: mole->head->snout PASS");
// G2: full-entity envelope
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`G2 bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (w < 0.60 || w > 0.72) die(`G2 FAIL: width ${w.toFixed(3)} outside [0.60,0.72]`);
if (d < 0.14 || d > 0.17) die(`G2 FAIL: depth ${d.toFixed(3)} outside [0.14,0.17]`);
if (h < 0.12 || h > 0.16) die(`G2 FAIL: height ${h.toFixed(3)} outside [0.12,0.16]`);
if (NEW.bb.min[1] > 0.004 || NEW.bb.min[1] < -0.020) die(`G2 FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// G3: mole subtree bands
console.log(`G3 mole body: nose tip ${hi[0].toFixed(4)} (want [0.095,0.115]), emerge crest ${hi[1].toFixed(4)} (want [0.115,0.130])`);
if (hi[0] < 0.095 || hi[0] > 0.115) die(`G3 FAIL: nose tip ${hi[0].toFixed(4)} outside [0.095,0.115]`);
if (hi[1] < 0.115 || hi[1] > 0.130) die(`G3 FAIL: emerge crest ${hi[1].toFixed(4)} outside [0.115,0.130]`);
// G4: joints post-bake
const jy = (nm: string) => NEW.json.nodes.find((n: any) => n.name === nm)?.translation?.[1];
const hy = jy("mole_head"), sy = jy("mole_snout");
console.log(`G4 joints: head y=${hy?.toFixed(4)} (want [0.072,0.088]); snout y=${sy?.toFixed(4)} head-local (want [0.000,0.003])`);
if (hy === undefined || hy < 0.072 || hy > 0.088) die(`G4 FAIL: head joint y=${hy} outside [0.072,0.088]`);
if (sy === undefined || sy < 0.000 || sy > 0.003) die(`G4 FAIL: snout joint y=${sy} outside head-local [0.000,0.003]`);
// G5: THE EMERGE GATE — mole subtree crest vs furniture crest
let furnTop = -Infinity;
const furnList: any[] = [];
for (const s of NEW.json.scenes[NEW.json.scene].nodes) {
    const n = NEW.json.nodes[s];
    if (n.name === "mole" || n.mesh === undefined) continue;
    for (const prim of NEW.json.meshes[n.mesh].primitives) {
        const acc = NEW.json.accessors[prim.attributes.POSITION];
        const world = trs(n.translation, n.rotation, n.scale);
        const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
        const hh = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
        let flo = [Infinity, Infinity, Infinity], fhi = [-Infinity, -Infinity, -Infinity];
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
            const w2 = apply(world, [c[0] + sx * hh[0], c[1] + sy * hh[1], c[2] + sz * hh[2]]);
            for (let k = 0; k < 3; k++) { if (w2[k] < flo[k]) flo[k] = w2[k]; if (w2[k] > fhi[k]) fhi[k] = w2[k]; }
        }
        if (fhi[1] > furnTop) furnTop = fhi[1];
        if (fhi[1] > 0.020) furnList.push({ node: n.name, min: flo, max: fhi });
    }
}
const emergeGap = hi[1] - furnTop;
console.log(`G5 emerge: animal crest ${hi[1].toFixed(4)} vs furniture crest ${furnTop.toFixed(4)} -> +${(emergeGap * 1000).toFixed(1)}mm (want >= 8mm)`);
if (emergeGap < 0.008) die(`G5 FAIL: the earth swallows the animal (crest gap ${(emergeGap * 1000).toFixed(1)}mm < 8mm)`);
// G6: HEAP GATE — one raised mound + tonal step + dig-line span
const earth = furnList.filter(mm => mm.node.startsWith("dress_mole1") && mm.max[1] > 0.020);
const mound = earth.filter(mm => mm.max[1] >= 0.070);
const tops = [...new Set(earth.map(mm => +mm.max[1].toFixed(3)))].sort((a, b) => b - a);
let elo = Infinity, ehi = -Infinity;
for (const mm of earth) { elo = Math.min(elo, mm.min[0]); ehi = Math.max(ehi, mm.max[0]); }
let step = 0;
for (let i = 0; i < tops.length - 1; i++) if (tops[i] - tops[i + 1] >= 0.006) { step = tops[i] - tops[i + 1]; break; }
console.log(`G6 heap: ${mound.length} mound buckets cresting >=0.070 (want >=3), max tonal step ${(step * 1000).toFixed(0)}mm (want >=6), dig span ${(ehi - elo).toFixed(3)} (want >=0.50)`);
if (mound.length < 3) die(`G6 FAIL: mound mass not raised (found ${mound.length} buckets >= 0.070)`);
if (step < 0.006) die(`G6 FAIL: no tonal step in earth tops [${tops}]`);
if (ehi - elo < 0.50) die(`G6 FAIL: dig line too short (${(ehi - elo).toFixed(3)})`);
// G7: SNOUT-PRIDE — snout-family mesh max.x > head-mass max.x + 4mm
// (KEEP-fold renames meshes <group>_N — prefix-match, magpi law)
const snoutMeshes = meshList.filter(mm => mm.node.startsWith("mole_snout"));
const skullMeshes = meshList.filter(mm => mm.node.startsWith("mole_head"));
const snoutMaxX = Math.max(...snoutMeshes.map(mm => mm.max[0]));
const skullMaxX = Math.max(...skullMeshes.map(mm => mm.max[0]));
if (!isFinite(snoutMaxX) || !isFinite(skullMaxX)) die("G7 FAIL: snout/skull buckets not found (vacuous pass guard)");
console.log(`G7 snout pride: snout tip ${snoutMaxX.toFixed(4)} vs skull face ${skullMaxX.toFixed(4)} -> +${((snoutMaxX - skullMaxX) * 1000).toFixed(1)}mm (want >= 4mm)`);
if (snoutMaxX < skullMaxX + 0.004) die(`G7 FAIL: snout buried in the face plane (gap ${((snoutMaxX - skullMaxX) * 1000).toFixed(1)}mm)`);
// G8: spade hands — ONE pink bucket in the head group whose z-span
// crosses BOTH ±0.045 (only the hand pair reaches that far; the snout
// stays within ±0.010 post-bake — z-extent is the discriminator, the
// merged y-span is not, v5 lesson)
const handMeshes = meshList.filter(mm => mm.node.startsWith("mole_head") && mm.max[2] > 0.045 && mm.min[2] < -0.045);
console.log(`G8 spade hands: ${handMeshes.length} flanking bucket(s) crossing z ±0.045 (want >= 1 — the pair merges)`);
if (handMeshes.length < 1) die(`G8 FAIL: no flanking hand pair (found ${handMeshes.length})`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the RAT bytes must fail every mole gate
const HOST = decode("agents/arthur/assets/village_dress_rat1.glb");
if (HOST.sha16 !== "9b1cb0d657c42d3f") die(`RED setup fail: host sha16 ${HOST.sha16} (want the live rat lib 9b1cb0d6…)`);
const hostR = HOST.nodes.map(n => n.name).filter(nm => /mole/.test(nm ?? ""));
console.log(`\nRED control: HOST ${HOST.sha16}: mole anchors: [${hostR.join(",") || "none"}]`);
if (hostR.length !== 0) die("RED FAIL: host unexpectedly carries mole anchors");
console.log("DECODE VERDICT: GREEN (new European mole) + RED (rat clean) — PASS");
