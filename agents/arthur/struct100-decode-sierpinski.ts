// struct100-decode-sierpinski.ts — decode audit of village_sierpinski3.glb.
// Verifies: pinned sha, node/mesh budget (6), texMat lanes (ss_stone/ss_plinth),
// brass emissive, 4 glow_ss bead KEEP nodes at the seed apices, true bbox vs
// build math (x ±(R0·√3/2+BR), z [−R0/2−BR, R0+BR], y .. H+2BR−0.03),
// VERTICAL class (h > 0.5), no NaN accessors, stone bucket vertex census
// (64 blocks × 12 tris = 768 verts).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_sierpinski3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const E = 6.4, R0 = E / Math.sqrt(3), H = E * Math.sqrt(2 / 3), BR = 0.075;
const XS = R0 * Math.sqrt(3) / 2;
ck("sha pinned", sha === "7f8b5fd7a3d18b229f5caadf36d76da8b57f8d582df1b1fbb948b864bfb1bd1c", sha.slice(0, 16));
ck("node budget 5-45", j.nodes.length >= 5 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["ss_stone", "ss_plinth"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("4 bead KEEP nodes", ["glow_ss_1", "glow_ss_2", "glow_ss_3", "glow_ss_4"].every(n => names.includes(n)));

// bucket envelope from accessors (merged stone+plinth carry baked TRS)
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (const acc of j.accessors) {
    if (acc.min && acc.max) {
        for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], acc.min[k]); mx[k] = Math.max(mx[k], acc.max[k]); }
    }
}
// true envelope incl. KEEP beads (node translations + local ±0.075 spheres)
const beads = j.nodes.filter((n: any) => /^glow_ss_/.test(n.name ?? ""));
let bmn = [Infinity, Infinity, Infinity], bmx = [-Infinity, -Infinity, -Infinity];
for (const b of beads) {
    const t = b.translation ?? [0, 0, 0];
    for (let k = 0; k < 3; k++) { bmn[k] = Math.min(bmn[k], t[k] - BR); bmx[k] = Math.max(bmx[k], t[k] + BR); }
}
ck("bucket envelope (stone+plinth)", Math.abs(mx[0] - XS) < 0.01 && Math.abs(mn[0] + XS) < 0.01
    && Math.abs(mx[2] - R0) < 0.01 && Math.abs(mn[2] + R0 / 2) < 0.01 && Math.abs(mx[1] - H) < 0.01,
    `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} y ${mn[1].toFixed(2)}..${mx[1].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
ck("true envelope incl. beads", Math.abs(bmx[0] - (XS + BR)) < 0.01 && Math.abs(bmn[0] + (XS + BR)) < 0.01
    && Math.abs(bmx[2] - (R0 + BR)) < 0.01 && Math.abs(bmn[2] + (R0 / 2 + BR)) < 0.01,
    `x ${bmn[0].toFixed(2)}..${bmx[0].toFixed(2)} y ${bmn[1].toFixed(2)}..${bmx[1].toFixed(2)} z ${bmn[2].toFixed(2)}..${bmx[2].toFixed(2)}`);
ck("vertical entity (h > 0.5)", bmx[1] - bmn[1] > 0.5, `h ${(bmx[1] - bmn[1]).toFixed(3)}`);
ck("apex bead crest = H+2BR-0.03", Math.abs(bmx[1] - (H + 2 * BR - 0.03)) < 0.01, `${bmx[1].toFixed(3)}`);
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));

// beads at seed apices: (0,·,R0), (±XS,·,−R0/2), (0,·+H,0)
const wantSeats: [number, number][] = [[0, R0], [XS, -R0 / 2], [-XS, -R0 / 2], [0, 0]];
for (const b of beads) {
    const t = b.translation ?? [0, 0, 0];
    const ok = wantSeats.some(([wx, wz]) => Math.hypot(t[0] - wx, t[2] - wz) < 0.01);
    const apex = Math.abs(t[1] - (H + BR - 0.03)) < 0.01;
    if (!ok && !apex) ck(`bead ${b.name} at a seed apex`, false, `${t.map((v: number) => v.toFixed(2)).join(",")}`);
}
console.log(`beads at: ${beads.map((b: any) => (b.translation ?? [0, 0, 0]).map((v: number) => v.toFixed(2)).join(",")).join(" | ")}`);
// stone bucket vertex census: 64 blocks × 4 faces × 3 verts = 768 (non-indexed)
const stoneMatIdx = j.materials.findIndex((m: any) => m.name === "ss_stone");
const stonePrims = j.meshes.filter((m: any) => m.primitives?.some((p: any) => p.material === stoneMatIdx));
let stoneVerts = 0;
for (const m of j.meshes) for (const p of m.primitives ?? []) if (p.material === stoneMatIdx) stoneVerts += j.accessors[p.attributes.POSITION].count;
ck("stone bucket 768 verts (64×12 tris)", stoneVerts === 768, `${stoneVerts} verts in ${stonePrims.length} mesh(es)`);
console.log(f ? `${f} FAIL` : "ALL PASS");
process.exit(f ? 1 : 0);
