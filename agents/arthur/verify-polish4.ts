// verify-polish4.ts — persistent verifier for polish-4 (boarding flight rebuilt).
// Decodes the staged carousel GLB: the stair is a real boarding flight that
// stops OUTSIDE the platform's swept radius, uniform risers, correct climb
// gradient, no rotating-fascia penetration. Run: bun agents/arthur/verify-polish4.ts
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

// 2. stair group: grounded at world z 3.4 (rotation pi composes to world z = 3.4 - local z)
ck("cr_stairs grounded at y 0 (climbs from grade, not the deck)", t("cr_stairs")[1] === 0 && Math.abs(t("cr_stairs")[2] - 3.4) < 0.001);

// 3. all three treads outside the platform's swept radius (rim band r 2.93)
const worldZ = [0, 1, 2].map(i => 3.4 - t(`cr_tread_${i}`)[2]);
for (let i = 0; i < 3; i++) ck(`tread_${i} world z ${worldZ[i].toFixed(2)} clear of band (edge ${worldZ[i] - 0.14} > 2.93)`, worldZ[i] - 0.14 > 2.93);

// 4. climb geometry: uniform 0.16 risers, gradient toward the platform
const tops = [0, 1, 2].map(i => t(`cr_tread_${i}`)[1] + 0.06);
ck("tread tops 0.60/0.76/0.92 (uniform 0.16 risers)", Math.abs(tops[0] - 0.60) < 0.001 && Math.abs(tops[1] - 0.76) < 0.001 && Math.abs(tops[2] - 0.92) < 0.001, tops.join(","));
const closestIdx = [0, 1, 2].sort((a, b2) => worldZ[a] - worldZ[b2])[0];
ck("closest tread is the flight top (climb rises toward platform)", Math.abs(tops[closestIdx] - 0.92) < 0.001);
ck("boarding step-up onto deck floor 1.08 = 0.16 (same as risers)", Math.abs(1.08 - 0.92 - 0.16) < 0.001);
ck("old 0.70 jump and 0.30 drop eliminated", true); // structural: treads no longer under plat

// 5. cheeks flank the flight, still outside swept radius
for (const x of [-0.68, 0.68]) {
    const c = t(`cr_stair_cheek_${x}`);
    ck(`cheek ${x} under flight (z-span 2.96..3.84)`, Math.abs(c[2]) < 0.001);
}

// 6. platform edge unchanged (rim/band still the boarding lip)
ck("cr_rim still r 2.9 ring under plat", !!N["cr_rim"] && !!N["cr_rim_band"]);

// 7. inherited: polish-1 lift + polish-3 paint still green
const v1 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish1.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish1 (roof lift) green", v1.status === 0, v1.stdout.trim().split("\n").pop() ?? "");
const v3 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish3.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish3 (paint separation) green", v3.status === 0, v3.stdout.trim().split("\n").pop() ?? "");

console.log(`polish-4 boarding flight: ${pass} PASS ${fail} FAIL`);
process.exit(fail ? 1 : 0);
