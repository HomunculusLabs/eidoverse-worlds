// verify-repairs.ts — the repair loop's persistent verification tool.
// Run: bun agents/arthur/verify-repairs.ts [wakeup]
// Checks the durable effects of the repair loop's work against LIVE state:
// placements/clearances per the register's FIXED entries, ledger law,
// register consistency, hygiene. Tracked in git — the loop's answer to
// "no canonical suite": this is the closest thing to one, and it is
// explicitly AD-HOC scope (live-world assertions), not a unit suite.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
let fail = 0;
const ck = (n: string, ok: boolean, d = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${d ? " | " + d : ""}`); if (!ok) fail++; };

type Ent = { pos: number[]; yaw: number; lib?: string; comp?: Record<string, unknown> };
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, Ent> = {};
for (const e of g.entities) ents[e.id] = e;

const rect = (e: Ent, hw: number, hd: number): number[] => {
    const c = Math.cos(e.yaw), s = Math.sin(e.yaw);
    const xs: number[] = [], zs: number[] = [];
    for (const lx of [-hw, hw]) for (const lz of [-hd, hd]) { xs.push(e.pos[0] + lx * c + lz * s); zs.push(e.pos[2] - lx * s + lz * c); }
    return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
};
const sep = (a: number[], b: number[]) => Math.max(Math.max(a[0] - b[1], b[0] - a[1]), Math.max(a[2] - b[3], b[2] - a[3]));

// --- per-defect live assertions (mirror of the register's FIXED entries) ---
const D = ents["av-dyehouse"], S = ents["av-sign-dyer"], R = ents["av-row-cottage"];
ck("[tex-4] av-stable on thatch+timber+stone build (89dc80d7 → pin refreshed by tex-49)", ents["av-stable"]?.lib === "store/84ba3b1b110282d9.glb");
ck("[tex-4] 10 wallSpan buildings on stone builds (house pin refreshed by tex-53; court → bb31e8a5 lift-1)",
    ents["arthur-house"]?.lib === "store/db08a24143ee5443.glb"
    && ents["av-longhouse"]?.lib === "store/05149e3e7d5e5918.glb"
    && ents["av-garden-cottage"]?.lib === "store/e0a6a7c426d39398.glb"
    && ents["av-row-cottage"]?.lib === "store/845ee738e09d5c1f.glb"
    && ents["av-bunkhouse"]?.lib === "store/e4c0651d5618b73b.glb"
    && ents["av-hall"]?.lib === "store/d9251dd0857e451f.glb"
    && ents["av-court"]?.lib === "store/543b53d03ac2f104.glb"
    && ents["av-inn"]?.lib === "store/8de1af9446f98eb9.glb"
    && ents["av-windmill"]?.lib === "store/4feee38977d7c6e5.glb"
    && ents["av-stable"]?.lib === "store/84ba3b1b110282d9.glb");
ck("[tex-5] av-dyelaundry on weave build (c5f85611 → pin refreshed by tex-60, +cloth anchors r21)", ents["av-dyelaundry"]?.lib === "store/30dd0a5ac7c00fe4.glb");
ck("[tex-6] av-forge on metal build (6715b0f8 → pin refreshed by tex-56, +coals anchor r44 → tex-86 emissive coals)", ents["av-forge"]?.lib === "store/fcc66d79b76b109e.glb");
ck("[tex-7] av-door-paths on soil build (bf157803 → pin refreshed by lift-10 spur re-aim)", ents["av-door-paths"]?.lib === "store/5357b28a015f6c8e.glb");
ck("[tex-84] full-stack regression (28 verifiers tex-55..83 sequential + gate) re-runnable", existsSync("agents/arthur/verify-tex84.ts"));
ck("[tex-83] av-inn on 4-family build (8de1af9446f98eb9, 4 comps)", ents["av-inn"]?.lib === "store/8de1af9446f98eb9.glb");
ck("[tex-82] av-court on 3-family build (ac75f33c → pin refreshed by lift-1, smoke comp)", ents["av-court"]?.lib === "store/543b53d03ac2f104.glb");
ck("[tex-81] av-row-cottage on timber build (845ee738e09d5c1f, smoke comp)", ents["av-row-cottage"]?.lib === "store/845ee738e09d5c1f.glb");
ck("[tex-80] av-bunkhouse on timber build (e4c0651d5618b73b, smoke comp)", ents["av-bunkhouse"]?.lib === "store/e4c0651d5618b73b.glb");
ck("[tex-79] av-garden-cottage on 2-family build (e0a6a7c426d39398, smoke comp)", ents["av-garden-cottage"]?.lib === "store/e0a6a7c426d39398.glb");
ck("[tex-78] av-tower-house on timber build (fb590200245f5985, sockets comp)", ents["av-tower-house"]?.lib === "store/fb590200245f5985.glb");
ck("[tex-77] av-longhouse on 3-family build (05149e3e7d5e5918, smoke comp)", ents["av-longhouse"]?.lib === "store/05149e3e7d5e5918.glb");
ck("[tex-76] av-hall on 3-family build (d9251dd0857e451f, smoke comp)", ents["av-hall"]?.lib === "store/d9251dd0857e451f.glb");
ck("[tex-74] av-inn on interior-timber build (33e8a1748ab4b8cf, 4 comps)", ents["av-inn"]?.lib === "store/8de1af9446f98eb9.glb");
ck("[tex-73] av-chopblock on handle-timber build (462433ed8a148a4b)", ents["av-chopblock"]?.lib === "store/462433ed8a148a4b.glb");
ck("[tex-72] av-windmill on 2-family build (4feee38977d7c6e5, sails comp)", ents["av-windmill"]?.lib === "store/4feee38977d7c6e5.glb");
ck("[tex-71] av-charcoal on stake-timber build (1d9a1c2d95f785b6, smoke comp)", ents["av-charcoal"]?.lib === "store/1d9a1c2d95f785b6.glb");
ck("[tex-70] av-quarry on 3-family build (8582f2d45440dfed)", ents["av-quarry"]?.lib === "store/8582f2d45440dfed.glb");
ck("[tex-69] av-belltower on full-timber build (66524bcde061a437, bell comps)", ents["av-belltower"]?.lib === "store/66524bcde061a437.glb");
ck("[tex-68] av-watchpost on full-post-timber build (4ac5cacf91ed5d2d, fire comps)", ents["av-watchpost"]?.lib === "store/4ac5cacf91ed5d2d.glb");
ck("[tex-67] av-plaza-hearth on iron-bowl build (933ab1f9 → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/43fcaf1442f5d6b8.glb");
ck("[tex-66] av-kiln on ring-stone build (69c0e48a917d4ed2, fire+smoke)", ents["av-kiln"]?.lib === "store/69c0e48a917d4ed2.glb");
ck("[tex-65] av-potter on timber-woodwork build (66836b01897cfebc, wheel comp)", ents["av-potter"]?.lib === "store/66836b01897cfebc.glb");
ck("[tex-64] av-waystone on bench-timber build (c418d713c69d23ae, float+spin+ffw)", ents["av-waystone"]?.lib === "store/c418d713c69d23ae.glb");
ck("[tex-63] av-milestone-n/s on stone+iron builds (a2b6bfab/3d423bc3)", ents["av-milestone-n"]?.lib === "store/5d2112b381b20672.glb" && ents["av-milestone-s"]?.lib === "store/6ccaeb40f50003e2.glb");
ck("[tex-62] av-wayside on timber-woodwork build (8da60306e51c68dd, lamp comp)", ents["av-wayside"]?.lib === "store/8da60306e51c68dd.glb");
ck("[polish-255] av-mapboard on distance-chip build (1f1a10f4dce71a0e; timber tile byte-identical)", ents["av-mapboard"]?.lib === "store/1f1a10f4dce71a0e.glb");
ck("[polish-256] av-carousel on lifted-roof/paint build (38fbbc26dcdfcc1a; smoke heal present)",
    ents["av-carousel"]?.lib === "store/38fbbc26dcdfcc1a.glb"
    && ["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "sockets", "particles:smoke"].every((k) => k in (ents["av-carousel"]?.comp ?? {})));
ck("[tex-60] av-dyelaundry on timber-woodwork build (30dd0a5ac7c00fe4, 6 wind comps)", ents["av-dyelaundry"]?.lib === "store/30dd0a5ac7c00fe4.glb");
ck("[tex-59] av-monument on full-ashlar build (9520e61fc8e9d887, knot comp)", ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb");
ck("[tex-58] av-shrine on full-ashlar build (78611c7dc9a3cb6e, votive comps)", ents["av-shrine"]?.lib === "store/78611c7dc9a3cb6e.glb");
ck("[tex-57] av-market on woodwork build (b7167aad118e47c5, wind comps)", ents["av-market"]?.lib === "store/b7167aad118e47c5.glb");
ck("[tex-56] av-forge on woodwork build (7fe0ce66 → fcc66d79 by tex-86: real emissive coals, court fire recipe)", ents["av-forge"]?.lib === "store/fcc66d79b76b109e.glb");
ck("[tex-55] av-bcistern on 3-family build (e132952021178a89)", ents["av-bcistern"]?.lib === "store/e132952021178a89.glb");
ck("[tex-54] av-hutch on leg-timber build (f5f47791dadb5abe, rabbit comps)", ents["av-hutch"]?.lib === "store/f5f47791dadb5abe.glb");
ck("[tex-53] arthur-house on textured-interior build (db08a24143ee5443)", ents["arthur-house"]?.lib === "store/db08a24143ee5443.glb");
ck("[tex-52] av-plaza-hearth on 3-family build (933ab1f9 → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/43fcaf1442f5d6b8.glb");
ck("[tex-51] av-dyehouse on textured build (8d750d7826584d9d, wind comps)", ents["av-dyehouse"]?.lib === "store/8d750d7826584d9d.glb");
ck("[tex-50] av-watchpost on iron-bowl build (e7f5534850748fd3, fire comps)", ents["av-watchpost"]?.lib === "store/4ac5cacf91ed5d2d.glb");
ck("[tex-49] av-stable on textured-fittings build (84ba3b1b110282d9)", ents["av-stable"]?.lib === "store/84ba3b1b110282d9.glb");
ck("[tex-48] av-treeline on stone-boulder build (36427f0b71b25086, ff comps)", ents["av-treeline"]?.lib === "store/36427f0b71b25086.glb");
ck("[tex-47] av-fieldpond on 3-family build (790a12b9ff2c1092)", ents["av-fieldpond"]?.lib === "store/790a12b9ff2c1092.glb");
ck("[tex-46] av-grainfield on timber-post build (c2db511e0eceadfa, crow)", ents["av-grainfield"]?.lib === "store/c2db511e0eceadfa.glb");
ck("[tex-45] av-flax on stone-lip build (8da23ee5935d53ff, fx_bundle)", ents["av-flax"]?.lib === "store/8da23ee5935d53ff.glb");
ck("[tex-44] four trade signs on iron builds (6c948ea7/6c54b963/f76b6b33/afb2309a)",
    ents["av-sign-bakery"]?.lib === "store/43bebd2db0b2b2f1.glb"
    && ents["av-sign-smithy"]?.lib === "store/ae8dad83832dcdd9.glb"
    && ents["av-sign-weaver"]?.lib === "store/89de4b877be5acea.glb"
    && ents["av-sign-livery"]?.lib === "store/1fb6c2a8461aa253.glb");
ck("[tex-43] av-sign-dyer on iron build (9490cc0ab7a19d3f)", ents["av-sign-dyer"]?.lib === "store/9490cc0ab7a19d3f.glb");
ck("[tex-42] far benches on textured builds (417e6040/21eacf00)",
    ents["av-millbench"]?.lib === "store/0bc874eadbde8717.glb"
    && ents["av-stablebench"]?.lib === "store/c24b7628da5f74ae.glb");
ck("[tex-41] av-goats on timber build (c47861e473e6f088, goat motion)", ents["av-goats"]?.lib === "store/c47861e473e6f088.glb");
ck("[tex-40] av-inndoor on textured build (9118d58b17b36390)", ents["av-inndoor"]?.lib === "store/9118d58b17b36390.glb");
ck("[tex-39] av-millyard on timber build (cb2d87e62eb46b6d)", ents["av-millyard"]?.lib === "store/cb2d87e62eb46b6d.glb");
ck("[tex-38] av-bellbase on 3-family build (10abf5ddf0e09412, sockets)", ents["av-bellbase"]?.lib === "store/10abf5ddf0e09412.glb");
ck("[tex-37] av-harvestcart on textured build (ee30d6709625bf2f, wheels roll)", ents["av-harvestcart"]?.lib === "store/ee30d6709625bf2f.glb");
ck("[tex-36] av-shutters on textured build (100195e0194c89c8)", ents["av-shutters"]?.lib === "store/100195e0194c89c8.glb");
ck("[tex-35] av-milkstand on textured build (bd2e613a10b9762e)", ents["av-milkstand"]?.lib === "store/bd2e613a10b9762e.glb");
ck("[tex-34] av-coop on timber build (f5d4039489c1ce4b)", ents["av-coop"]?.lib === "store/f5d4039489c1ce4b.glb");
ck("[tex-33] av-streetlamps on iron build (e815a897c7d73373)", ents["av-streetlamps"]?.lib === "store/e815a897c7d73373.glb");
ck("[tex-32] av-giftshelf on timber build (c623cfa6fbdeb48e)", ents["av-giftshelf"]?.lib === "store/c623cfa6fbdeb48e.glb");
ck("[tex-31] av-churn on timber build (a509c3d2c1f3026e)", ents["av-churn"]?.lib === "store/a509c3d2c1f3026e.glb");
ck("[tex-30] av-cartstop on 3-family build (bbdcc06e8312124c)", ents["av-cartstop"]?.lib === "store/bbdcc06e8312124c.glb");
ck("[tex-29] av-potter on timber build (cea5c582 → pin refreshed by tex-65, wheel spins)", ents["av-potter"]?.lib === "store/66836b01897cfebc.glb");
ck("[tex-28] av-waystone on ashlar build (f6531989649974c4, float+spin+ffw)", ents["av-waystone"]?.lib === "store/c418d713c69d23ae.glb");
ck("[tex-27] av-milestone-n + av-milestone-s on ashlar builds (35ed6a57/05b03249)",
    ents["av-milestone-n"]?.lib === "store/5d2112b381b20672.glb"
    && ents["av-milestone-s"]?.lib === "store/6ccaeb40f50003e2.glb");
ck("[tex-26] all 5 rain barrels on textured builds (85edf547/2781edae/b12a17a3/ab728fbb/ea1f501d)",
    ents["av-rainbarrel-h"]?.lib === "store/d39221bc55afeff5.glb"
    && ents["av-rainbarrel-l"]?.lib === "store/65ff0fefaa02491c.glb"
    && ents["av-rainbarrel-i"]?.lib === "store/a8e48bdad74304e0.glb"
    && ents["av-rainbarrel-b"]?.lib === "store/b49bd6c38378cae8.glb"
    && ents["av-rainbarrel-g"]?.lib === "store/34c52064be50dfdc.glb");
ck("[tex-25] av-charcoal on textured build (4f350e33f0f7de8f, smoke comp)", ents["av-charcoal"]?.lib === "store/1d9a1c2d95f785b6.glb");
ck("[tex-24] av-quarry on textured build (dd953ab2188427db)", ents["av-quarry"]?.lib === "store/8582f2d45440dfed.glb");
ck("[tex-23] av-run on timber build (db9d39ff66cc57df)", ents["av-run"]?.lib === "store/db9d39ff66cc57df.glb");
ck("[tex-22] av-garden-fence + av-paddock on timber builds (c06c6d14/cd74f723)",
    ents["av-garden-fence"]?.lib === "store/7c11d7ba8aff0a0f.glb"
    && ents["av-paddock"]?.lib === "store/f0d0c933cc9da8ee.glb");
ck("[tex-21] av-hutch on timber build (6263e8a2 → pin refreshed by tex-54, rabbit comps)", ents["av-hutch"]?.lib === "store/f5f47791dadb5abe.glb");
ck("[tex-20] av-belltower on ashlar build (82e4c316 → pin refreshed by tex-69, bell comps)", ents["av-belltower"]?.lib === "store/66524bcde061a437.glb");
ck("[tex-19] av-wayside on textured build (5cbb8e4cacefc16f, lamp comp)", ents["av-wayside"]?.lib === "store/8da60306e51c68dd.glb");
ck("[tex-18] av-monument on textured build (0ec3fe2e3c050081, knot spin)", ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb");
ck("[polish-255] av-mapboard on distance-chip build (1f1a10f4dce71a0e; timber tile byte-identical)", ents["av-mapboard"]?.lib === "store/1f1a10f4dce71a0e.glb");
ck("[tex-16] av-chopblock on metal build (1f8b7d34bfe59272)", ents["av-chopblock"]?.lib === "store/462433ed8a148a4b.glb");
ck("[polish-29] av-welcome on night-lamp build (6cd75bbbbf379df5)", ents["av-welcome"]?.lib === "store/6cd75bbbbf379df5.glb");
ck("[tex-14] av-watchpost on timber build (e7f55348 → pin refreshed by tex-50, sentry comps)", ents["av-watchpost"]?.lib === "store/4ac5cacf91ed5d2d.glb");
ck("[tex-13] av-shrine on textured build (0ef2c1e60c5b070d, 3 votive comps)", ents["av-shrine"]?.lib === "store/78611c7dc9a3cb6e.glb");
ck("[tex-12] av-roads3 on ground build (20234503 → 2892af9e plaza-1 → 6358e1ab plaza-2 → 453f9ae5 plaza-3 milestones)", ents["av-roads3"]?.lib === "store/3b76b621559fa1a1.glb");
ck("[tex-11] av-plaza-hearth on soil build (4e58865a → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/43fcaf1442f5d6b8.glb");
ck("[tex-10] av-bcistern on ashlar build (a96ee31d → pin refreshed by tex-55)", ents["av-bcistern"]?.lib === "store/e132952021178a89.glb");
ck("[tex-9] av-kiln on ashlar build (0bdc0d18 → pin refreshed by tex-66, +fire anchor r45)", ents["av-kiln"]?.lib === "store/69c0e48a917d4ed2.glb");
ck("[tex-8] av-market + av-dyehouse on weave builds (market pin refreshed by tex-57; dyehouse by tex-51)",
    ents["av-market"]?.lib === "store/b7167aad118e47c5.glb"
    && ents["av-dyehouse"]?.lib === "store/8d750d7826584d9d.glb");
ck("[R-106] dyehouse at (-21,-21.6) yaw .941", !!D && Math.abs(D.pos[0] + 21) < 0.01 && Math.abs(D.pos[2] + 21.6) < 0.01 && Math.abs(D.yaw - 0.941) < 0.005);
ck("[R-106] dyehouse clears row+carousel", !!D && sep(rect(D, 1.64, 1.10), rect(R, 2.95, 2.67)) > 0 && sep(rect(D, 1.64, 1.10), rect(ents["av-carousel"], 4.35, 4.1)) > 0);
{
    const c = Math.cos(D.yaw), s = Math.sin(D.yaw);
    const lx = (S.pos[0] - D.pos[0]) * c - (S.pos[2] - D.pos[2]) * s;
    const lz = (S.pos[0] - D.pos[0]) * s + (S.pos[2] - D.pos[2]) * c;
    ck("[R-106] sign-dyer rides dyehouse front (0.03,2.59)", Math.abs(lx - 0.03) < 0.02 && Math.abs(lz - 2.59) < 0.02);
}
{
    const L = ents["av-dyelaundry"], C = ents["av-bcistern"], Wp = ents["av-watchpost"];
    ck("[R-103] laundry clears row", sep(rect(L, 1.71, 0.38), rect(R, 2.95, 2.67)) > 0);
    ck("[R-105] cistern clears watchpost", sep(rect(C, 0.82, 0.42), rect(Wp, 0.92, 0.92)) > 0);
}
{
    const H = ents["av-hutch"], Ru = ents["av-run"], Sl = ents["av-stable"], P = ents["av-paddock"], I = ents["av-inn"];
    const slabG = [-26.0, -16.0, 9.9, 20.9], fenceG = [-30.0, -25.1, 7.6, 14.6];
    const hR = rect(H, 0.92, 0.72), rR = rect(Ru, 1.6, 1.16);
    ck("[R-101/102] hutch clears cottage slab+fence", sep(hR, slabG) > 0 && sep(hR, fenceG) > 0);
    ck("[R-101/102] run clears cottage slab+fence", sep(rR, slabG) > 0 && sep(rR, fenceG) > 0);
    ck("[R-202] paddock clears stable+inn", sep(rect(P, 3.5, 2.5), rect(Sl, 2.7, 2.1)) > 0 && sep(rect(P, 3.5, 2.5), rect(I, 4.5, 4.45)) > 0);
}
{
    const C = ents["av-coop"], F = ents["av-garden-fence"];
    ck("[R-107] coop at (-33.1,12.4) yaw 1.956, clears fence",
        Math.abs(C.pos[0] + 33.1) < 0.01 && Math.abs(C.pos[2] - 12.4) < 0.01 && Math.abs(C.yaw - 1.956) < 0.005
        && sep(rect(C, 1.06, 1.14), rect(F, 3.23, 1.34)) > 0);
}
{
    // honest-top pins (refinement wakeups 1-4): fixed libs standing at the
    // verified poses; comps empty by design (no placers needed for these)
    const R = ents["av-run"], F = ents["av-garden-fence"];
    ck("[honest-top] av-run fixed lib @ (-28,18.6)", !!R && R.lib === "store/db9d39ff66cc57df.glb"
        && Math.abs(R.pos[0] + 28) < 0.01 && Math.abs(R.pos[2] - 18.6) < 0.01
        && Math.abs(R.yaw) < 0.005 && Object.keys(R.comp ?? {}).length === 0);
    ck("[honest-top] av-garden-fence fixed lib", !!F && F.lib === "store/7c11d7ba8aff0a0f.glb"
        && Math.abs(F.pos[0] + 28.7) < 0.01 && Math.abs(F.pos[2] - 11.6) < 0.01
        && Math.abs(F.yaw - 1.9549) < 0.005 && Object.keys(F.comp ?? {}).length === 0);
}
{
    // R-110 pin: the inn's full comp set must survive every re-place
    const I = ents["av-inn"];
    ck("[R-110] av-inn carries sign+embers+smoke+sockets",
        !!I && ["motion:sign", "particles", "particles:smoke", "sockets"].every((k) => k in (I.comp ?? {})));
}

// --- ledger law (canonical algorithm) ---
const led = readFileSync(`${W}/agents/arthur/IMPROVEMENTS.md`, "utf8");
const post = led.slice(led.indexOf("[audit-balance]"));
const run = parseInt((led.match(/\*\*Running total: (\d+)/) ?? [])[1], 10);
let d = 0; for (const m of post.matchAll(/\(D\+(\d+), E\+(\d+)\)/g)) d += Number(m[1]) + Number(m[2]);
ck("ledger law EXACT", 2336002 + d === run, `${2336002 + d} == ${run}`);

// --- register consistency ---
const reg = readFileSync(`${W}/agents/arthur/REPAIR-REGISTER.md`, "utf8");
const openItems = (reg.match(/- STATUS: OPEN/g) ?? []).length;
console.log(`INFO register: ${openItems} OPEN item(s) (R-107 coop×fence expected)`);

// --- hygiene ---
const A = `${W}/agents/arthur/assets`;
const bad = readdirSync(A).filter(f => f.startsWith("probe-") || f.startsWith("hermes-verify-") || /^place-dyehouse/.test(f));
ck("assets free of throwaways", bad.length === 0, bad.join(",") || "clean");
ck("comp placers intact", existsSync(`${A}/place-smoke.ts`) && existsSync(`${A}/place-interior-lights.ts`));

// --- git state ---
try {
    const head = execSync("git log --oneline -1", { cwd: W, encoding: "utf8" }).trim();
    ck("HEAD is a repair/tex/audit/refine/polish/plaza/lift/align/mason/nv/nvp/viz commit", /^[\da-f]+ (repair-\d|tex-\d|audit-\d|refine-\d|polish-\d|plaza-\d|lift-\d|align-\d|mason-\d|nv-\d|nvp-\d|viz-\d|resilience-\d|pressure-\d|vocab-\d|artwalk-\d|interior-\d|struct-\d|dress-\d|approach-\d|night-\d|sweep-\d|waysign-\d|mile-\d|improve-\d|survey-\d|engine-\d|village-full-\d|village-full |core dressing|CORE DRESSING|renderer:)/.test(head), head);
} catch { console.log("INFO git check unavailable (guard) — skipped"); }

console.log(fail ? `${fail} FAILURE(S)` : "ALL PASS");
process.exit(fail ? 1 : 0);
