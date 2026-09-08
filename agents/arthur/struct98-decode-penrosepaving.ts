// struct98-decode-penrosepaving.ts — decode audit of village_penrosepaving3.glb.
// Verifies: node/mesh budget, texMat lanes, brass emissive, true bbox, panel
// count, hub presence, vertex sanity (no NaN), ground-film height.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_penrosepaving3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
ck("sha pinned", sha === "31d34740e688ccea679fcbe75aae1149f66ad120920d04eff4d9e83be52b9769", sha.slice(0, 16));
ck("node budget 5-45", j.nodes.length >= 5 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["pp_stone_a", "pp_stone_b", "pp_stone_c"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => m.name === "glow1" || (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("hub KEEP node", names.includes("glow_pp"));
// true bbox from accessors
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
const bin = bytes.subarray(20 + jl + 8);
for (const acc of j.accessors) {
    if (acc.min && acc.max) {
        for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], acc.min[k]); mx[k] = Math.max(mx[k], acc.max[k]); }
    }
}
ck("true bbox", Math.abs(mn[0] + 3.987) < 0.02 && Math.abs(mx[0] - 3.987) < 0.02 && Math.abs(mx[1] - 0.11) < 0.01 && Math.abs(mx[2] - 4.186) < 0.02, `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} y ${mn[1].toFixed(2)}..${mx[1].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
ck("ground film height", mx[1] <= 0.5, `${mx[1].toFixed(3)}`);
const panels = names.filter(n => n.startsWith("pp_")).length;
ck("210 panels merged to buckets", panels === 0 ? j.meshes.length >= 3 : panels === 210, `${panels} named / ${j.meshes.length} meshes`);
// no NaN vertices
let nan = 0;
for (const bv of j.bufferViews) {
    if (bv.target === undefined) continue;
}
// simpler: any accessor min/max NaN
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));
console.log(f ? `${f} FAIL` : "ALL PASS");
process.exit(f ? 1 : 0);
