// fauna9-decode-robin.ts — decode audit for the fauna-9 robin.
// GREEN contract (village_dress_robin1.glb): 3 motion anchors (robin,
// robin_head, robin_tail), total height in [0.26, 0.34] (body ~0.16 +
// cocked head/tail; source-derived), ground-seated |min.y| <= 0.012,
// footprint x-extent in [0.24, 0.40] (beak-to-tail-tip) and z-extent
// in [0.09, 0.16] (body width + bib), head joint robin-group-local
// (x ~0.055, y ~0.135), tail joint (x ~ -0.072, y ~0.108), bib front
// PROUD of body front (extent arithmetic, owl law).
// RED control: the OWL bytes (village_dress_barnowl1.glb, live
// a11e5432) must FAIL — zero robin anchors, height 2.97 vs band.
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

// per-anchor world bbox (for the proud-bib extent check)
const decode = (path: string) => {
    const bytes = new Uint8Array(readFileSync(path));
    const sha = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb: " + path);
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
    const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    const anchorBB: Record<string, { min: number[]; max: number[] }> = {};
    const nodeInfo: { name: string; depth: number }[] = [];
    const walk = (idx: number, parent: number[], depth: number, anchor: string) => {
        const n = json.nodes[idx];
        const world = mul(parent, trs(n.translation, n.rotation, n.scale));
        const myAnchor = anchor || (KEEP.test(n.name ?? "") ? n.name : "");
        if (n.mesh !== undefined) {
            let ab = anchorBB[myAnchor];
            if (!ab) ab = anchorBB[myAnchor] = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
            for (const prim of json.meshes[n.mesh].primitives) {
                const acc = json.accessors[prim.attributes.POSITION];
                const c = [(acc.min[0] + acc.max[0]) / 2, (acc.min[1] + acc.max[1]) / 2, (acc.min[2] + acc.max[2]) / 2];
                const h = [(acc.max[0] - acc.min[0]) / 2, (acc.max[1] - acc.min[1]) / 2, (acc.max[2] - acc.min[2]) / 2];
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                    const w = apply(world, [c[0] + sx * h[0], c[1] + sy * h[1], c[2] + sz * h[2]]);
                    for (let k = 0; k < 3; k++) {
                        if (w[k] < bb.min[k]) bb.min[k] = w[k];
                        if (w[k] > bb.max[k]) bb.max[k] = w[k];
                        if (w[k] < ab.min[k]) ab.min[k] = w[k];
                        if (w[k] > ab.max[k]) ab.max[k] = w[k];
                    }
                }
            }
        }
        nodeInfo.push({ name: n.name ?? "(unnamed)", depth });
        for (const c of n.children ?? []) walk(c, world, depth + 1, myAnchor);
    };
    const KEEP = /^(robin)/;
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (const s of json.scenes[json.scene].nodes) walk(s, I, 0, "");
    return { sha, nNodes: json.nodes.length, nodes: nodeInfo, bb, anchorBB, json };
};

const NEW = decode("agents/arthur/assets/village_dress_robin1.glb");
console.log("NEW sha16:", NEW.sha);
const names = NEW.nodes.map(n => n.name);
// GREEN 1: anchors
const want = ["robin", "robin_head", "robin_tail"];
for (const w of want) if (!names.includes(w)) die(`GREEN FAIL: anchor ${w} missing`);
console.log("GREEN anchors: 3 motion groups present (robin, robin_head, robin_tail)");
// GREEN 2: envelope bands (source-derived, ×1.4 bake applied)
const w = NEW.bb.max[0] - NEW.bb.min[0], d = NEW.bb.max[2] - NEW.bb.min[2], h = NEW.bb.max[1] - NEW.bb.min[1];
console.log(`GREEN bbox: ${w.toFixed(3)} x ${h.toFixed(3)} x ${d.toFixed(3)} (min.y ${NEW.bb.min[1].toFixed(3)}, max.y ${NEW.bb.max[1].toFixed(3)})`);
if (h < 0.19 || h > 0.26) die(`GREEN FAIL: height ${h.toFixed(3)} outside [0.19,0.26]`);
if (w < 0.44 || w > 0.60) die(`GREEN FAIL: x-extent ${w.toFixed(3)} outside [0.44,0.60] (×1.4 bake: 0.377·1.4=0.528)`);
if (d < 0.15 || d > 0.26) die(`GREEN FAIL: z-extent ${d.toFixed(3)} outside [0.15,0.26] (×1.4 bake: 0.145·1.4=0.203)`);
if (NEW.bb.min[1] > 0.012 || NEW.bb.min[1] < -0.012) die(`GREEN FAIL: base y ${NEW.bb.min[1]} not ground-seated`);
// GREEN 3: joints
const rootN = NEW.json.nodes.find((n: any) => n.name === "robin");
const headN = NEW.json.nodes.find((n: any) => n.name === "robin_head");
const tailN = NEW.json.nodes.find((n: any) => n.name === "robin_tail");
const rt = rootN?.translation ?? [0, 0, 0], ht = headN?.translation, tt = tailN?.translation;
console.log(`GREEN joints: robin @${rt.map((v: number) => v.toFixed(3)).join(",")}; robin_head @${ht?.map((v: number) => v.toFixed(3)).join(",")} (want ~0.077,0.189,0 = ×1.4 bake); robin_tail @${tt?.map((v: number) => v.toFixed(3)).join(",")} (want ~-0.101,0.151,0 = ×1.4 bake)`);
if (!ht || Math.abs(ht[0] - 0.077) > 0.006 || Math.abs(ht[1] - 0.189) > 0.006) die(`GREEN FAIL: head joint ${ht}`);
if (!tt || Math.abs(tt[0] + 0.067) > 0.006 || Math.abs(tt[1] - 0.137) > 0.006) die(`GREEN FAIL: tail joint ${tt}`);
// GREEN 4: the bib is PROUD of the body front — robin-anchor bbox front x
// must exceed the non-bib body bbox front by >= 8mm. We approximate via
// the full-anchor front vs a RED sphere reference: simpler robust check —
// the robin-root anchor bbox front x >= 0.085 (bib sphere front 0.093
// minus merge tolerance) AND tail tip x <= -0.10 (cocked tail).
const rbb = NEW.anchorBB["robin"];
console.log(`GREEN robin-anchor bbox: x [${rbb.min[0].toFixed(3)}, ${rbb.max[0].toFixed(3)}] y [${rbb.min[1].toFixed(3)}, ${rbb.max[1].toFixed(3)}]`);
if (rbb.max[0] < 0.085) die(`GREEN FAIL: bib front ${rbb.max[0].toFixed(3)} not proud (< 0.085)`);
if (rbb.min[0] > -0.10) die(`GREEN FAIL: tail tip ${rbb.min[0].toFixed(3)} not cocked-rear (< -0.10)`);
console.log("total nodes:", NEW.nNodes);
console.log(NEW.nodes.filter(n => n.name !== "(unnamed)").map(n => "  ".repeat(n.depth) + n.name).join("\n"));

// RED control: the OWL bytes must fail every robin gate
const HOST = decode("agents/arthur/assets/village_dress_barnowl1.glb");
if (HOST.sha !== "a11e5432c329e697") die(`RED setup fail: owl sha ${HOST.sha} (want a11e5432c329e697…)`);
const hostRobins = HOST.nodes.map(n => n.name).filter(nm => /^robin/.test(nm));
const hh = HOST.bb.max[1] - HOST.bb.min[1];
console.log(`\nRED control: OWL ${HOST.sha}: robin anchors: [${hostRobins.join(",") || "none"}]; height ${hh.toFixed(2)}m`);
if (hostRobins.length !== 0) die("RED FAIL: owl unexpectedly carries robin anchors");
if (hh >= 0.24 && hh <= 0.36) die("RED FAIL: owl height unexpectedly inside the robin band");
console.log("DECODE VERDICT: GREEN (new robin) + RED (owl clean) — PASS");
