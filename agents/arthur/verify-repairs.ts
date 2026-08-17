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
ck("[tex-1] av-stable stands on the thatch build (56d0122215bcca65)", ents["av-stable"]?.lib === "store/56d0122215bcca65.glb");
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
    ck("HEAD is a repair/tex/audit commit", /^[\da-f]+ (repair-\d|tex-\d|audit-)/.test(head), head);
} catch { console.log("INFO git check unavailable (guard) — skipped"); }

console.log(fail ? `${fail} FAILURE(S)` : "ALL PASS");
process.exit(fail ? 1 : 0);
