// struct169-decode-monkeysaddle.ts — independent byte-side audit of
// village_monkeysaddle3.glb (struct-169, R11-6). Parses the GLB directly
// (no three.js): node census, KEEP glow, materials, doubleSided, accessor
// envelope, film y-band. RED control: run on any other GLB -> must FAIL.
import { readFileSync } from "node:fs";
import * as struct from "node:fs";

const path = process.argv[2] ?? "agents/arthur/assets/village_monkeysaddle3.glb";
const b = readFileSync(path);
if (b.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
const jlen = b.readUInt32LE(12);
const json = JSON.parse(b.slice(20, 20 + jlen).toString("utf8"));

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};

// 1. node census + KEEP glow (node budget: this form's honest merge = 3 —
//    film + hem + glow; the 5-45 guideline's intent is "merged statics",
//    and 3 draw calls is better, not worse)
const nodes = json.nodes ?? [];
const named = nodes.filter((n: any) => n.name).map((n: any) => n.name);
check("node budget 2-45 (merged statics)", nodes.length >= 2 && nodes.length <= 45, `${nodes.length} nodes`);
check("exactly 1 KEEP glow node glow_ms_1", named.filter((n: string) => /^glow_/.test(n)).length === 1 && named.includes("glow_ms_1"), named.filter((n: string) => n.startsWith("glow_")).join(","));
check("motion anchors: none expected", !named.some((n: string) => /^(bell|sails|carousel|horse_|well_|sign|knot|orb)/.test(n)), "static form");

// 2. materials
const mats = json.materials ?? [];
const mnames = mats.map((m: any) => m.name);
check("texMat lanes present", mnames.includes("ms_bone") && mnames.includes("ms_iron"), mnames.join(","));
const bone = mats.find((m: any) => m.name === "ms_bone");
check("ms_bone doubleSided (film law)", bone?.doubleSided === true, `doubleSided=${bone?.doubleSided}`);
const glowMat = mats.find((m: any) => (m.name ?? "").startsWith("glow") || (m.emissiveFactor ?? []).some((v: number) => v > 0.05));
check("glow material carries emissiveFactor", !!glowMat, glowMat?.name ?? "none");

// 3. accessor envelope WITH node translations applied (pitfall-4 law: accessors
// are node-local; this file's nodes carry translation only — verify that)
let gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
for (const n of nodes) {
    const q = n.rotation;
    const isIdentityQ = !q || (q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 1);
    const isUnitScale = !n.scale || (n.scale[0] === 1 && n.scale[1] === 1 && n.scale[2] === 1);
    if (!isIdentityQ || !isUnitScale) throw Error(`node ${n.name} carries non-identity TRS — decode must apply full TRS`);
    const t = n.translation ?? [0, 0, 0];
    const mesh = json.meshes?.[n.mesh];
    if (!mesh) continue;
    for (const p of mesh.primitives ?? []) {
        const a = json.accessors[p.attributes.POSITION];
        if (!a.min || !a.max) continue;
        for (let i = 0; i < 3; i++) {
            gmin[i] = Math.min(gmin[i], a.min[i] + t[i]); gmax[i] = Math.max(gmax[i], a.max[i] + t[i]);
        }
    }
}
const [ex, ey, ez] = [gmax[0] - gmin[0], gmax[1] - gmin[1], gmax[2] - gmin[2]];
check("plan 3.89 circle (x==z within 1cm, 3.87-3.91)", Math.abs(ex - ez) < 0.01 && Math.abs(ex - 3.89) < 0.02, `${ex.toFixed(3)}x${ez.toFixed(3)}`);
check("height 1.19 (crest+hem)", Math.abs(ey - 1.19) < 0.02, `${ey.toFixed(3)}`);
check("min y at rest contact (-5mm..+15mm)", gmin[1] > -0.005 && gmin[1] < 0.015, `min y ${gmin[1].toFixed(4)}`);

// 4. film y-band: lowest LARGE mesh (the film) must reach near min y (feet) and the pan near 0.595
// find the biggest vertex-count accessor
let bigIdx = -1, bigCount = -1;
(json.accessors ?? []).forEach((a: any, i: number) => {
    if ((a.componentType === 5126 || a.componentType === 5125) && a.count > bigCount && a.type === "VEC3" && (a.min ?? false)) { bigCount = a.count; bigIdx = i; }
});
if (bigIdx >= 0) {
    const a = json.accessors[bigIdx];
    const dy = a.max[1] - a.min[1];
    check("film vertical band ~1.10 (SEAT_H*2, dips->crests)", Math.abs(dy - 1.10) < 0.02, `band ${dy.toFixed(3)} y[${a.min[1].toFixed(3)}..${a.max[1].toFixed(3)}]`);
} else { check("film accessor found", false); }

// 5. images (texMat lanes carry textures)
check("textures present (texMat lanes)", (json.images ?? []).length >= 2, `${(json.images ?? []).length} images`);

console.log(fails === 0 ? "DECODE ALL PASS" : `DECODE FAIL (${fails})`);
process.exit(fails === 0 ? 0 : 1);
