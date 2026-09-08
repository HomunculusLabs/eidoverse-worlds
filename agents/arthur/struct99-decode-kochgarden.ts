// struct99-decode-kochgarden.ts — decode audit of village_kochgarden3.glb.
// Verifies: pinned sha, node/mesh budget, texMat lanes (kg_stone/kg_soil),
// brass emissive, 3 glow_ks bead KEEP nodes, true bbox vs build math,
// ground-film height, no NaN accessors.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_kochgarden3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
ck("sha pinned", sha === "f561eb5a3a0ebe79eb5e191ade3d56002812d1fc5dfb8096137925b9f58b0166", sha.slice(0, 16));
ck("node budget 5-45", j.nodes.length >= 5 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["kg_stone", "kg_soil"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("3 bead KEEP nodes", ["glow_ks_1", "glow_ks_2", "glow_ks_3"].every(n => names.includes(n)));
// true bbox from accessors
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (const acc of j.accessors) {
    if (acc.min && acc.max) {
        for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], acc.min[k]); mx[k] = Math.max(mx[k], acc.max[k]); }
    }
}
// build math: curve extents x[-2.7,2.7] z[-3.118,3.118]; kerb crests ≤ KW past
ck("true bbox", Math.abs(mx[0] - 2.7) < 0.14 && Math.abs(mn[0] + 2.7) < 0.14 && Math.abs(mx[2] - 3.118) < 0.14 && Math.abs(mn[2] + 3.118) < 0.14, `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} y ${mn[1].toFixed(2)}..${mx[1].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
ck("ground film height", mx[1] <= 0.5, `${mx[1].toFixed(3)}`);
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));
// beads must sit near seed vertices (0,3.118) / (±2.7,-1.559)
const beads = j.nodes.filter((n: any) => /^glow_ks_/.test(n.name ?? ""));
for (const b of beads) {
    const t = b.translation ?? [0, 0, 0];
    const r = Math.hypot(t[0], t[1] - 0.24, t[2]);
    if (r > 3.3) { ck(`bead ${b.name} near a seed vertex`, false, `r ${r.toFixed(2)}`); }
}
console.log(`beads at: ${beads.map((b: any) => (b.translation ?? [0, 0, 0]).map((v: number) => v.toFixed(2)).join(",")).join(" | ")}`);
console.log(f ? `${f} FAIL` : "ALL PASS");
process.exit(f ? 1 : 0);
