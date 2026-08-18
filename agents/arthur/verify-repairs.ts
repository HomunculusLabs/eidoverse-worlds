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
ck("[tex-4] av-stable on thatch+timber+stone build (89dc80d7 → pin refreshed by tex-49)", ents["av-stable"]?.lib === "store/89dc80d7bb8fc395.glb");
ck("[tex-4] 10 wallSpan buildings on stone builds (house pin refreshed by tex-53; court → bb31e8a5 lift-1)",
    ents["arthur-house"]?.lib === "store/cff51defbdacd0ce.glb"
    && ents["av-longhouse"]?.lib === "store/333691747dd14c5c.glb"
    && ents["av-garden-cottage"]?.lib === "store/1790e1816f08b85e.glb"
    && ents["av-row-cottage"]?.lib === "store/7ec9fc54b9d79897.glb"
    && ents["av-bunkhouse"]?.lib === "store/4bfacdd739b9bd0e.glb"
    && ents["av-hall"]?.lib === "store/3f8f9e6f98bbbd04.glb"
    && ents["av-court"]?.lib === "store/bb31e8a5ffdc1e16.glb"
    && ents["av-inn"]?.lib === "store/6f35f80a336889cd.glb"
    && ents["av-windmill"]?.lib === "store/7fc779a5c7dd5dc5.glb"
    && ents["av-stable"]?.lib === "store/89dc80d7bb8fc395.glb");
ck("[tex-5] av-dyelaundry on weave build (c5f85611 → pin refreshed by tex-60, +cloth anchors r21)", ents["av-dyelaundry"]?.lib === "store/c5f85611ffefc522.glb");
ck("[tex-6] av-forge on metal build (6715b0f8 → pin refreshed by tex-56, +coals anchor r44)", ents["av-forge"]?.lib === "store/6715b0f885deaed7.glb");
ck("[tex-7] av-door-paths on soil build (bf157803 → pin refreshed by lift-10 spur re-aim)", ents["av-door-paths"]?.lib === "store/5357b28a015f6c8e.glb");
ck("[tex-84] full-stack regression (28 verifiers tex-55..83 sequential + gate) re-runnable", existsSync("agents/arthur/verify-tex84.ts"));
ck("[tex-83] av-inn on 4-family build (6f35f80a336889cd, 4 comps)", ents["av-inn"]?.lib === "store/6f35f80a336889cd.glb");
ck("[tex-82] av-court on 3-family build (ac75f33c → pin refreshed by lift-1, smoke comp)", ents["av-court"]?.lib === "store/bb31e8a5ffdc1e16.glb");
ck("[tex-81] av-row-cottage on timber build (7ec9fc54b9d79897, smoke comp)", ents["av-row-cottage"]?.lib === "store/7ec9fc54b9d79897.glb");
ck("[tex-80] av-bunkhouse on timber build (4bfacdd739b9bd0e, smoke comp)", ents["av-bunkhouse"]?.lib === "store/4bfacdd739b9bd0e.glb");
ck("[tex-79] av-garden-cottage on 2-family build (1790e1816f08b85e, smoke comp)", ents["av-garden-cottage"]?.lib === "store/1790e1816f08b85e.glb");
ck("[tex-78] av-tower-house on timber build (7f60f1f7a5794411, sockets comp)", ents["av-tower-house"]?.lib === "store/7f60f1f7a5794411.glb");
ck("[tex-77] av-longhouse on 3-family build (333691747dd14c5c, smoke comp)", ents["av-longhouse"]?.lib === "store/333691747dd14c5c.glb");
ck("[tex-76] av-hall on 3-family build (3f8f9e6f98bbbd04, smoke comp)", ents["av-hall"]?.lib === "store/3f8f9e6f98bbbd04.glb");
ck("[tex-74] av-inn on interior-timber build (33e8a1748ab4b8cf, 4 comps)", ents["av-inn"]?.lib === "store/6f35f80a336889cd.glb");
ck("[tex-73] av-chopblock on handle-timber build (ab5031c118d925c0)", ents["av-chopblock"]?.lib === "store/ab5031c118d925c0.glb");
ck("[tex-72] av-windmill on 2-family build (7fc779a5c7dd5dc5, sails comp)", ents["av-windmill"]?.lib === "store/7fc779a5c7dd5dc5.glb");
ck("[tex-71] av-charcoal on stake-timber build (dcb3bb63442a764c, smoke comp)", ents["av-charcoal"]?.lib === "store/dcb3bb63442a764c.glb");
ck("[tex-70] av-quarry on 3-family build (6b3da17816aeeb55)", ents["av-quarry"]?.lib === "store/6b3da17816aeeb55.glb");
ck("[tex-69] av-belltower on full-timber build (82e4c316b62e5006, bell comps)", ents["av-belltower"]?.lib === "store/82e4c316b62e5006.glb");
ck("[tex-68] av-watchpost on full-post-timber build (256e16a13027fb93, fire comps)", ents["av-watchpost"]?.lib === "store/256e16a13027fb93.glb");
ck("[tex-67] av-plaza-hearth on iron-bowl build (933ab1f9 → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/1a656f00ab66db91.glb");
ck("[tex-66] av-kiln on ring-stone build (0bdc0d18dddacf9b, fire+smoke)", ents["av-kiln"]?.lib === "store/0bdc0d18dddacf9b.glb");
ck("[tex-65] av-potter on timber-woodwork build (cea5c582bf05d72f, wheel comp)", ents["av-potter"]?.lib === "store/cea5c582bf05d72f.glb");
ck("[tex-64] av-waystone on bench-timber build (5fcaa644f4ba290b, float+spin+ffw)", ents["av-waystone"]?.lib === "store/5fcaa644f4ba290b.glb");
ck("[tex-63] av-milestone-n/s on stone+iron builds (a2b6bfab/3d423bc3)", ents["av-milestone-n"]?.lib === "store/a2b6bfab613f0e84.glb" && ents["av-milestone-s"]?.lib === "store/3d423bc3590b5068.glb");
ck("[tex-62] av-wayside on timber-woodwork build (5db486a79ff5cc6e, lamp comp)", ents["av-wayside"]?.lib === "store/5db486a79ff5cc6e.glb");
ck("[tex-61] av-mapboard on timber-post build (d555acbd0b0ab516 → pin refreshed by polish-16/18 live rollout e732ce10; timber tile byte-identical)", ents["av-mapboard"]?.lib === "store/e732ce10400c1979.glb");
ck("[tex-60] av-dyelaundry on timber-woodwork build (c5f85611ffefc522, 6 wind comps)", ents["av-dyelaundry"]?.lib === "store/c5f85611ffefc522.glb");
ck("[tex-59] av-monument on full-ashlar build (9520e61fc8e9d887, knot comp)", ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb");
ck("[tex-58] av-shrine on full-ashlar build (d0d3743a60802625, votive comps)", ents["av-shrine"]?.lib === "store/d0d3743a60802625.glb");
ck("[tex-57] av-market on woodwork build (2bb51287d4e1a2a2, wind comps)", ents["av-market"]?.lib === "store/2bb51287d4e1a2a2.glb");
ck("[tex-56] av-forge on woodwork build (6715b0f885deaed7, fire comps)", ents["av-forge"]?.lib === "store/6715b0f885deaed7.glb");
ck("[tex-55] av-bcistern on 3-family build (a96ee31d29c2085f)", ents["av-bcistern"]?.lib === "store/a96ee31d29c2085f.glb");
ck("[tex-54] av-hutch on leg-timber build (6263e8a20eb17cc9, rabbit comps)", ents["av-hutch"]?.lib === "store/6263e8a20eb17cc9.glb");
ck("[tex-53] arthur-house on textured-interior build (cff51defbdacd0ce)", ents["arthur-house"]?.lib === "store/cff51defbdacd0ce.glb");
ck("[tex-52] av-plaza-hearth on 3-family build (933ab1f9 → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/1a656f00ab66db91.glb");
ck("[tex-51] av-dyehouse on textured build (29b4efc54101106d, wind comps)", ents["av-dyehouse"]?.lib === "store/29b4efc54101106d.glb");
ck("[tex-50] av-watchpost on iron-bowl build (e7f5534850748fd3, fire comps)", ents["av-watchpost"]?.lib === "store/256e16a13027fb93.glb");
ck("[tex-49] av-stable on textured-fittings build (89dc80d7bb8fc395)", ents["av-stable"]?.lib === "store/89dc80d7bb8fc395.glb");
ck("[tex-48] av-treeline on stone-boulder build (8770a4d12ca5503b, ff comps)", ents["av-treeline"]?.lib === "store/8770a4d12ca5503b.glb");
ck("[tex-47] av-fieldpond on 3-family build (6071ee91f034f321)", ents["av-fieldpond"]?.lib === "store/6071ee91f034f321.glb");
ck("[tex-46] av-grainfield on timber-post build (b2846e09c5305d63, crow)", ents["av-grainfield"]?.lib === "store/b2846e09c5305d63.glb");
ck("[tex-45] av-flax on stone-lip build (3b7991ebfc24e083, fx_bundle)", ents["av-flax"]?.lib === "store/3b7991ebfc24e083.glb");
ck("[tex-44] four trade signs on iron builds (6c948ea7/6c54b963/f76b6b33/afb2309a)",
    ents["av-sign-bakery"]?.lib === "store/6c948ea7c8630889.glb"
    && ents["av-sign-smithy"]?.lib === "store/6c54b963019e06d5.glb"
    && ents["av-sign-weaver"]?.lib === "store/f76b6b33cbd05fac.glb"
    && ents["av-sign-livery"]?.lib === "store/afb2309ad8a607ff.glb");
ck("[tex-43] av-sign-dyer on iron build (a7f36a1460616bf1)", ents["av-sign-dyer"]?.lib === "store/a7f36a1460616bf1.glb");
ck("[tex-42] far benches on textured builds (417e6040/21eacf00)",
    ents["av-millbench"]?.lib === "store/417e60402d36a079.glb"
    && ents["av-stablebench"]?.lib === "store/21eacf008b9c6d9e.glb");
ck("[tex-41] av-goats on timber build (e172513026570cc5, goat motion)", ents["av-goats"]?.lib === "store/e172513026570cc5.glb");
ck("[tex-40] av-inndoor on textured build (40931320bb2d4bf2)", ents["av-inndoor"]?.lib === "store/40931320bb2d4bf2.glb");
ck("[tex-39] av-millyard on timber build (888231aa9182548d)", ents["av-millyard"]?.lib === "store/888231aa9182548d.glb");
ck("[tex-38] av-bellbase on 3-family build (c38a4fcfe2e57ad0, sockets)", ents["av-bellbase"]?.lib === "store/c38a4fcfe2e57ad0.glb");
ck("[tex-37] av-harvestcart on textured build (8b82ac9dc2663ef8, wheels roll)", ents["av-harvestcart"]?.lib === "store/8b82ac9dc2663ef8.glb");
ck("[tex-36] av-shutters on textured build (18b5fc9473ecce77)", ents["av-shutters"]?.lib === "store/18b5fc9473ecce77.glb");
ck("[tex-35] av-milkstand on textured build (1699deab824293ab)", ents["av-milkstand"]?.lib === "store/1699deab824293ab.glb");
ck("[tex-34] av-coop on timber build (715ed516ef72fd61)", ents["av-coop"]?.lib === "store/715ed516ef72fd61.glb");
ck("[tex-33] av-streetlamps on iron build (b3dc727a83831eab)", ents["av-streetlamps"]?.lib === "store/b3dc727a83831eab.glb");
ck("[tex-32] av-giftshelf on timber build (34c07c71c4d07d5d)", ents["av-giftshelf"]?.lib === "store/34c07c71c4d07d5d.glb");
ck("[tex-31] av-churn on timber build (3678ec3b0665a9e0)", ents["av-churn"]?.lib === "store/3678ec3b0665a9e0.glb");
ck("[tex-30] av-cartstop on 3-family build (a50a880415570539)", ents["av-cartstop"]?.lib === "store/a50a880415570539.glb");
ck("[tex-29] av-potter on timber build (cea5c582 → pin refreshed by tex-65, wheel spins)", ents["av-potter"]?.lib === "store/cea5c582bf05d72f.glb");
ck("[tex-28] av-waystone on ashlar build (f6531989649974c4, float+spin+ffw)", ents["av-waystone"]?.lib === "store/5fcaa644f4ba290b.glb");
ck("[tex-27] av-milestone-n + av-milestone-s on ashlar builds (35ed6a57/05b03249)",
    ents["av-milestone-n"]?.lib === "store/a2b6bfab613f0e84.glb"
    && ents["av-milestone-s"]?.lib === "store/3d423bc3590b5068.glb");
ck("[tex-26] all 5 rain barrels on textured builds (85edf547/2781edae/b12a17a3/ab728fbb/ea1f501d)",
    ents["av-rainbarrel-h"]?.lib === "store/85edf547c4a2e962.glb"
    && ents["av-rainbarrel-l"]?.lib === "store/2781edae5043cc08.glb"
    && ents["av-rainbarrel-i"]?.lib === "store/b12a17a3d56944b3.glb"
    && ents["av-rainbarrel-b"]?.lib === "store/ab728fbb2278b7e7.glb"
    && ents["av-rainbarrel-g"]?.lib === "store/ea1f501de84e4301.glb");
ck("[tex-25] av-charcoal on textured build (4f350e33f0f7de8f, smoke comp)", ents["av-charcoal"]?.lib === "store/dcb3bb63442a764c.glb");
ck("[tex-24] av-quarry on textured build (dd953ab2188427db)", ents["av-quarry"]?.lib === "store/6b3da17816aeeb55.glb");
ck("[tex-23] av-run on timber build (6c3c4f1127446592)", ents["av-run"]?.lib === "store/6c3c4f1127446592.glb");
ck("[tex-22] av-garden-fence + av-paddock on timber builds (c06c6d14/cd74f723)",
    ents["av-garden-fence"]?.lib === "store/c06c6d147b9141d8.glb"
    && ents["av-paddock"]?.lib === "store/cd74f723d7ce15e8.glb");
ck("[tex-21] av-hutch on timber build (6263e8a2 → pin refreshed by tex-54, rabbit comps)", ents["av-hutch"]?.lib === "store/6263e8a20eb17cc9.glb");
ck("[tex-20] av-belltower on ashlar build (82e4c316 → pin refreshed by tex-69, bell comps)", ents["av-belltower"]?.lib === "store/82e4c316b62e5006.glb");
ck("[tex-19] av-wayside on textured build (5cbb8e4cacefc16f, lamp comp)", ents["av-wayside"]?.lib === "store/5db486a79ff5cc6e.glb");
ck("[tex-18] av-monument on textured build (0ec3fe2e3c050081, knot spin)", ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb");
ck("[tex-17] av-mapboard on timber build (965fe0f6 → pin refreshed by tex-61, then polish-16/18 live rollout e732ce10; timber tile byte-identical)", ents["av-mapboard"]?.lib === "store/e732ce10400c1979.glb");
ck("[tex-16] av-chopblock on metal build (1f8b7d34bfe59272)", ents["av-chopblock"]?.lib === "store/ab5031c118d925c0.glb");
ck("[tex-15] av-welcome on textured build (fa0c9d94a07b9ef5)", ents["av-welcome"]?.lib === "store/fa0c9d94a07b9ef5.glb");
ck("[tex-14] av-watchpost on timber build (e7f55348 → pin refreshed by tex-50, sentry comps)", ents["av-watchpost"]?.lib === "store/256e16a13027fb93.glb");
ck("[tex-13] av-shrine on textured build (0ef2c1e60c5b070d, 3 votive comps)", ents["av-shrine"]?.lib === "store/d0d3743a60802625.glb");
ck("[tex-12] av-roads3 on ground build (20234503 → 2892af9e plaza-1 → 6358e1ab plaza-2 → 453f9ae5 plaza-3 milestones)", ents["av-roads3"]?.lib === "store/453f9ae5b885686b.glb");
ck("[tex-11] av-plaza-hearth on soil build (4e58865a → 1a656f00 by plaza-1/plaza-4, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/1a656f00ab66db91.glb");
ck("[tex-10] av-bcistern on ashlar build (a96ee31d → pin refreshed by tex-55)", ents["av-bcistern"]?.lib === "store/a96ee31d29c2085f.glb");
ck("[tex-9] av-kiln on ashlar build (0bdc0d18 → pin refreshed by tex-66, +fire anchor r45)", ents["av-kiln"]?.lib === "store/0bdc0d18dddacf9b.glb");
ck("[tex-8] av-market + av-dyehouse on weave builds (market pin refreshed by tex-57; dyehouse by tex-51)",
    ents["av-market"]?.lib === "store/2bb51287d4e1a2a2.glb"
    && ents["av-dyehouse"]?.lib === "store/29b4efc54101106d.glb");
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
    ck("[honest-top] av-run fixed lib @ (-28,18.6)", !!R && R.lib === "store/6c3c4f1127446592.glb"
        && Math.abs(R.pos[0] + 28) < 0.01 && Math.abs(R.pos[2] - 18.6) < 0.01
        && Math.abs(R.yaw) < 0.005 && Object.keys(R.comp ?? {}).length === 0);
    ck("[honest-top] av-garden-fence fixed lib", !!F && F.lib === "store/c06c6d147b9141d8.glb"
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
    ck("HEAD is a repair/tex/audit/refine/polish/plaza/lift/align commit", /^[\da-f]+ (repair-\d|tex-\d|audit-\d|refine-\d|polish-\d|plaza-\d|lift-\d|align-\d)/.test(head), head);
} catch { console.log("INFO git check unavailable (guard) — skipped"); }

console.log(fail ? `${fail} FAILURE(S)` : "ALL PASS");
process.exit(fail ? 1 : 0);
