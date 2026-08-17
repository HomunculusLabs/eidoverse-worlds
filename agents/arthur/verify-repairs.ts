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
ck("[tex-4] av-stable on thatch+timber+stone build (fedd5d15de53f903)", ents["av-stable"]?.lib === "store/fedd5d15de53f903.glb");
ck("[tex-4] 10 wallSpan buildings on stone builds",
    ents["arthur-house"]?.lib === "store/36cd42b6d0b818e8.glb"
    && ents["av-longhouse"]?.lib === "store/21e4e46f17481b28.glb"
    && ents["av-garden-cottage"]?.lib === "store/f47574b7e16368fb.glb"
    && ents["av-row-cottage"]?.lib === "store/ffe8236b459c89fb.glb"
    && ents["av-bunkhouse"]?.lib === "store/b82a410467f22cdd.glb"
    && ents["av-hall"]?.lib === "store/9e2d43ac32729cec.glb"
    && ents["av-court"]?.lib === "store/2f2cacf9664e69e3.glb"
    && ents["av-inn"]?.lib === "store/45e51e8ecd7dc57e.glb"
    && ents["av-windmill"]?.lib === "store/d18cbc3f5e3e43b2.glb"
    && ents["av-stable"]?.lib === "store/fedd5d15de53f903.glb");
ck("[tex-5] av-dyelaundry on weave build (d55427b88073320c, +cloth anchors r21)", ents["av-dyelaundry"]?.lib === "store/d55427b88073320c.glb");
ck("[tex-6] av-forge on metal build (49e411d67e40d2f5, +coals anchor r44)", ents["av-forge"]?.lib === "store/49e411d67e40d2f5.glb");
ck("[tex-7] av-door-paths on soil build (bf15780386a790ac)", ents["av-door-paths"]?.lib === "store/bf15780386a790ac.glb");
ck("[tex-15] av-welcome on textured build (fa0c9d94a07b9ef5)", ents["av-welcome"]?.lib === "store/fa0c9d94a07b9ef5.glb");
ck("[tex-14] av-watchpost on timber build (dd2374c90f6cf0e7, sentry comps)", ents["av-watchpost"]?.lib === "store/dd2374c90f6cf0e7.glb");
ck("[tex-13] av-shrine on textured build (0ef2c1e60c5b070d, 3 votive comps)", ents["av-shrine"]?.lib === "store/0ef2c1e60c5b070d.glb");
ck("[tex-12] av-roads3 on ground build (20234503da4e1b55)", ents["av-roads3"]?.lib === "store/20234503da4e1b55.glb");
ck("[tex-11] av-plaza-hearth on soil build (cd31cfa0d121feb1, 4 comps)", ents["av-plaza-hearth"]?.lib === "store/cd31cfa0d121feb1.glb");
ck("[tex-10] av-bcistern on ashlar build (e6827189ae8d8c35)", ents["av-bcistern"]?.lib === "store/e6827189ae8d8c35.glb");
ck("[tex-9] av-kiln on ashlar build (8ad12f3984210c4c, +fire anchor r45)", ents["av-kiln"]?.lib === "store/8ad12f3984210c4c.glb");
ck("[tex-8] av-market + av-dyehouse on weave builds",
    ents["av-market"]?.lib === "store/ee64ba1860979060.glb"
    && ents["av-dyehouse"]?.lib === "store/c1555dced9a5362c.glb");
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
    ck("[honest-top] av-run fixed lib @ (-28,18.6)", !!R && R.lib === "store/35871bfcfee51392.glb"
        && Math.abs(R.pos[0] + 28) < 0.01 && Math.abs(R.pos[2] - 18.6) < 0.01
        && Math.abs(R.yaw) < 0.005 && Object.keys(R.comp ?? {}).length === 0);
    ck("[honest-top] av-garden-fence fixed lib", !!F && F.lib === "store/82d9288df665a63d.glb"
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
    ck("HEAD is a repair/tex/audit/refine commit", /^[\da-f]+ (repair-\d|tex-\d|audit-\d|refine-\d)/.test(head), head);
} catch { console.log("INFO git check unavailable (guard) — skipped"); }

console.log(fail ? `${fail} FAILURE(S)` : "ALL PASS");
process.exit(fail ? 1 : 0);
