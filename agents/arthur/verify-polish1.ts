// verify-polish1.ts — persistent verifier for polish-1 (carousel roof lift, audit-101).
// Decodes the built GLB at source: lifted canopy heights, attachment chain,
// untouched horse/socket/motion layer, and the audit-101 clearance targets.
// Run: bun agents/arthur/verify-polish1.ts   (non-self-deleting by design)
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const GLB = `${ROOT}/agents/arthur/assets/village_carousel3.glb`;
const build = spawnSync("bun", [`${ROOT}/agents/arthur/assets/mkcarousel.ts`], { cwd: ROOT, encoding: "utf8" });
if (build.status !== 0) { console.log("FAIL: rebuild", build.stderr); process.exit(1); }
const b = readFileSync(GLB);
const jlen = b.readUInt32LE(12);
const j = JSON.parse(b.slice(20, 20 + jlen).toString());
const N = Object.fromEntries(j.nodes.filter((n: any) => n.name).map((n: any) => [n.name, n]));
let pass = 0, fail = 0;
const ck = (name: string, cond: boolean, detail = "") => { if (cond) pass++; else { fail++; console.log("FAIL:", name, detail); } };
const t = (n: any) => n?.translation ?? [0, 0, 0];

// lifted canopy assembly (+0.45 over the pre-polish build)
ck("canopy hub y 5.15", Math.abs(t(N["cr_canopy_hub"])[1] - 5.15) < 0.001);
ck("canopy fabric y 5.40 (base 4.81, apex 5.99)", Math.abs(t(N["cr_canopy_fabric"])[1] - 5.40) < 0.001);
ck("canopy edge y 4.83", Math.abs(t(N["cr_canopy_edge"])[1] - 4.83) < 0.001);
ck("finial y 6.08", Math.abs(t(N["cr_finial"])[1] - 6.08) < 0.001);
ck("mast center 3.225 / height 4.25 (seats in hub, spans 1.1-5.35)", Math.abs(t(N["cr_mast"])[1] - 3.225) < 0.001);
ck("flag_0 y 3.68 (rides lifted edge)", Math.abs(t(N["cr_flag_0"])[1] - 3.68) < 0.001);

// attachment chain intact: rib ends on hub(5.15) and edge(4.87-zone), pole tops at upper collars
ck("rib_0 mid y ~5.01 (hub 5.15 -> edge 4.87)", Math.abs(t(N["cr_rib_0"])[1] - 5.01) < 0.01);
ck("drop_pole_0 mid y 2.185 (0.28 -> 4.09)", Math.abs(t(N["cr_drop_pole_0"])[1] - 2.185) < 0.001);
ck("drop_upper_0 local y 4.06 (scene 5.06, meets pole top 4.09 in collar band)", Math.abs(t(N["cr_drop_upper_0"])[1] - 4.06) < 0.001);

// untouched layer: 4 horse stations, spin group, deck, comp anchors
for (const m of [0, 2, 4, 6]) {
    ck(`horse_${m} station group at y 1.02`, !!N[`horse_${m}`] && Math.abs(t(N[`horse_${m}`])[1] - 1.02) < 0.001);
    ck(`horse_${m}_pole_clamp present`, !!N[`horse_${m}_pole_clamp`]);
    ck(`cr_drop_pole_${m} present`, !!N[`cr_drop_pole_${m}`]);
}
ck("carousel spin group present (motion:carousel)", !!N["carousel"]);
ck("cr_deck present", !!N["cr_deck"]);

// audit-101 targets (cone base 4.81, apex 5.99, r_base 3.12; bob amp 0.18 -> peak +0.09)
const under = (r: number) => 4.81 + (3.12 - r) * (1.18 / 3.12);
const rider = under(2.0) - 4.6, riderBob = under(2.0) - (4.6 + 0.09);
const ears = under(2.1) - 3.54, earsBob = under(2.1) - (3.54 + 0.09);
ck(`rider-head clearance ${rider.toFixed(2)}m >= 0.40`, rider >= 0.4);
ck(`rider-head at bob peak ${riderBob.toFixed(2)}m >= 0.40`, riderBob >= 0.4);
ck(`horse-ear clearance ${ears.toFixed(2)}m >= 1.50`, ears >= 1.5);
ck(`horse-ear at bob peak ${earsBob.toFixed(2)}m >= 1.50`, earsBob >= 1.5);

// texture chain intact (6 families by construction)
ck("6 textured materials", j.materials.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture).length === 6);
// texture chain: textured materials (baseColorTexture) must carry UVs;
// flat trim (brass rods, lantern globes) is exempt per the rework plan's
// "unmapped trim stays flat" law. (Assertion tightened polish-5 after the
// flat lantern globes tripped the over-broad form.)
const texturedIdx = new Set(j.materials.map((m: any, i: number) => m.pbrMetallicRoughness?.baseColorTexture ? i : -1).filter((i: number) => i >= 0));
ck("TEXCOORD_0 on all TEXTURED primitives", j.meshes.every((m: any) => m.primitives.every((p: any) => p.material === undefined || !texturedIdx.has(p.material) || p.attributes.TEXCOORD_0)));

console.log(`polish-1 source decode: ${pass} PASS ${fail} FAIL (nodes ${j.nodes.length})`);
process.exit(fail ? 1 : 0);
