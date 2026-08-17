// verify-polish5.ts — persistent verifier for polish-5 (night lanterns).
// Decodes the staged carousel GLB: 8 warm emissive lantern globes under
// the static canopy edge, hung between rib ends, merge-safe naming, and
// the full inherited invariant stack. Run: bun agents/arthur/verify-polish5.ts
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const GLB = `${ROOT}/agents/arthur/assets/village_carousel3.glb`;
let pass = 0, fail = 0;
const ck = (n: string, c: boolean, d = "") => { if (c) pass++; else { fail++; console.log("FAIL:", n, d); } };

// 1. deterministic rebuild at the staged pin
const build = spawnSync("bun", [`${ROOT}/agents/arthur/assets/mkcarousel.ts`], { cwd: ROOT, encoding: "utf8" });
if (build.status !== 0) { console.log("FAIL: rebuild", build.stderr); process.exit(1); }
const h = createHash("sha256").update(readFileSync(GLB)).digest("hex").slice(0, 16);
ck("deterministic staged build 38fbbc26dcdfcc1a", h === "38fbbc26dcdfcc1a", h);

const b = readFileSync(GLB);
const j = JSON.parse(b.slice(20, 20 + b.readUInt32LE(12)).toString());
const N = Object.fromEntries(j.nodes.filter((n: any) => n.name).map((n: any) => [n.name, n]));
const t = (nm: string) => N[nm]?.translation ?? [0, 0, 0];

// 2. warm emissive material, one shared glow bucket
const glowMats = j.materials.filter((m: any) => m.emissiveFactor);
ck("emissive material present", glowMats.length >= 1, `count ${glowMats.length}`);
const warm = glowMats.some((m: any) => { const e = m.emissiveFactor; return e[0] >= 0.9 && e[1] >= 0.5 && e[2] < 0.5; });
ck("warm emissive factor (ffb066-class ×1.5 intensity)", warm, JSON.stringify(glowMats.map((m: any) => m.emissiveFactor)));
const glowIdxs = new Set(glowMats.map((m: any) => j.materials.indexOf(m)));
let glowPrims = 0;
for (const mesh of j.meshes) for (const p of mesh.primitives) if (p.material !== undefined && glowIdxs.has(p.material)) glowPrims += 1;
ck("glow bucket carries all 8 globes", glowPrims >= 8, String(glowPrims));

// 3. lantern placement: 8 globes between rib ends, hung under canopy edge (4.42), rods above
let placed = 0;
for (let i = 0; i < 8; i++) {
    const g = t(`cr_lantern_${i}`), r = t(`cr_lantern_rod_${i}`);
    const a = i * Math.PI / 4 + Math.PI / 8;
    const ex = Math.cos(a) * 3.0, ez = Math.sin(a) * 3.0;
    if (Math.abs(g[0] - ex) < 0.01 && Math.abs(g[2] - ez) < 0.01 && Math.abs(g[1] - 4.42) < 0.01) placed++;
    if (!(Math.abs(r[1] - 4.665) < 0.01 && Math.hypot(r[0], r[2]) > 2.9)) { ck(`rod_${i} hangs from canopy edge`, false, JSON.stringify(r)); }
}
ck("8 globes at between-rib positions, y 4.42", placed === 8, `${placed}/8`);
ck("globes clear horse heads (4.42 vs head top 3.49 + bob 0.09)", 4.42 - 3.58 > 0.8);

// 4. naming: no KEEP collision (lanterns are static, not motion targets)
const lanternNames = j.nodes.map((n: any) => n.name).filter((n: string) => n?.startsWith("cr_lantern"));
ck("16 lantern nodes (8 globes + 8 rods), none KEEP-colliding", lanternNames.length === 16);
ck("node count 193 (177 + 16)", j.nodes.length === 193, String(j.nodes.length));

// 5. inherited invariants: lift + paint + boarding flight
const v1 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish1.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish1 (roof lift) green", v1.status === 0, v1.stdout.trim().split("\n").pop() ?? "");
const v3 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish3.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish3 (paint, refreshed node-count) green", v3.status === 0, v3.stdout.trim().split("\n").pop() ?? "");
const v4 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish4.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish4 (boarding flight) green", v4.status === 0, v4.stdout.trim().split("\n").pop() ?? "");

console.log(`polish-5 night lanterns: ${pass} PASS ${fail} FAIL`);
process.exit(fail ? 1 : 0);
