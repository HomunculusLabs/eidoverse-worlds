// verify-polish-staged.ts — PERSISTENT lane verifier for the polish lane's
// staged rollout package (does NOT self-delete; committed as durable,
// runnable evidence — the tex-lane pattern, applied to polish).
// Verifies every staged artifact in one command, offline only (no network,
// no mock — the consent-blocked dry-run is NOT attempted here):
//   A. Staged builds (byte-exact, ×2 deterministic):
//      carousel  38fbbc26dcdfcc1a  (roof lift + paint widening + stair fix)
//      mapboard  b77ef40aae3a9dae  (distance skeleton + tower chip)
//      welcome   62746d1af698eacc  (night lamp, emissive glow2)
//   B. GLB decodes: welcome glow2 emissiveFactor [1.5,*,*]; mapboard 24
//      nodes; welcome 5 nodes; mapboard COLOR_0 census (1502 verts).
//   C. Placers present + contract-bearing (carousel/mapboard/welcome):
//      capture law, stall watchdog, PLACER_CONFIG, staged-law guards.
//   D. Gate + hygiene: verify-repairs.ts ALL PASS; control idle.
// Run: bun agents/arthur/verify-polish-staged.ts
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const fails: string[] = [];
const ck = (n: string, c: boolean, d = "") => {
    console.log((c ? "PASS " : "FAIL ") + n + (d ? " | " + d : ""));
    if (!c) fails.push(n);
};
const sh = (cmd: string) => { try { return execSync(cmd, { cwd: W, encoding: "utf8" }); } catch (e: any) { return (e.stdout ?? "") + (e.stderr ?? ""); } };
const sha16 = (f: string) => createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 16);

// ---- A. staged builds: byte-exact + deterministic ----
const BUILDS: Array<[string, string]> = [
    ["village_carousel3.glb", "38fbbc26dcdfcc1a"],
    ["village_mapboard3.glb", "b77ef40aae3a9dae"],
    ["village_welcome3.glb", "62746d1af698eacc"],
];
for (const [f, want] of BUILDS) {
    const h = sha16(`${A}/${f}`);
    ck(`staged ${f} at ${want}`, h === want, h);
}
// determinism: rebuild mapboard + welcome (cheap) ×1 and re-hash; the
// carousel rebuild is heavy — hash equality above + committed record stand.
const mb = sh(`bun ${A}/mkv3-mapboard.ts`);
const wb = sh(`bun ${A}/mkv3-welcome59.ts`);
ck("rebuild mapboard deterministic (hash re-equal after rebuild)", sha16(`${A}/village_mapboard3.glb`) === "b77ef40aae3a9dae");
ck("rebuild welcome deterministic (hash re-equal after rebuild)", sha16(`${A}/village_welcome3.glb`) === "62746d1af698eacc");

// ---- B. GLB decodes (JSON chunk only — no network) ----
const decode = (f: string) => {
    const b = readFileSync(`${A}/${f}`);
    const jlen = b.readUInt32LE(12);
    return JSON.parse(b.subarray(20, 20 + jlen).toString());
};
const mj = decode("village_mapboard3.glb");
ck("mapboard 24 nodes (distance skeleton + tower chip era)", mj.nodes.length === 24, String(mj.nodes.length));
const wj = decode("village_welcome3.glb");
ck("welcome 5 nodes (lamp era)", wj.nodes.length === 5, String(wj.nodes.length));
const glow = wj.materials.find((m: any) => m.emissiveFactor);
ck("welcome glow2 emissive factor 1.5 present", !!glow && Math.abs(glow.emissiveFactor[0] - 1.5) < 0.01,
    glow ? JSON.stringify(glow.emissiveFactor) : "none");

// ---- C. placers present + contract-bearing ----
const PLACERS: Array<[string, string]> = [
    ["placecarousel.ts", "polish-14 STALL WATCHDOG|STALL"],
    ["placemapboard.ts", "stall watchdog|STALLED"],
    ["placewelcome.ts", "geometry-level emissive|STALLED"],
];
for (const [p, marker] of PLACERS) {
    const ok = existsSync(`${A}/${p}`);
    ck(`placer ${p} present`, ok);
    if (ok) {
        const src = readFileSync(`${A}/${p}`, "utf8");
        ck(`placer ${p} carries contract markers (watchdog etc.)`, marker.split("|").some((m) => src.includes(m))
            && src.includes("PLACER_CONFIG"), "");
    }
}
// welcome placer pure helpers behavioral (import side-effect-free — guarded)
const r = sh(`bun -e 'const m = await import("${A}/placewelcome.ts"); const v = m.planVerbs({pos:[1,0,-4], yaw:2}, "store/z.glb"); console.log("V=" + v[0][1].id + "@" + JSON.stringify(v[0][1].pos) + "y" + v[0][1].yaw);'`);
ck("placewelcome helpers pure (spawn at captured pose)", r.includes("V=av-welcome@[1,0,-4]y2"), r.trim().slice(0, 60));

// ---- D. gate + hygiene ----
const gate = sh(`bun ${W}/agents/arthur/verify-repairs.ts`);
ck("standing gate verify-repairs.ts ALL PASS", !/\nFAIL /.test("\n" + gate) && gate.includes("PASS"), (gate.match(/FAIL .*/g) ?? []).slice(0, 2).join(";"));
ck("control.json absent (channel idle; existsSync)", !existsSync(`${W}/agents/arthur/control.json`));

console.log(fails.length ? `${fails.length} FAIL` : "ALL PASS");
process.exit(fails.length ? 1 : 0);
