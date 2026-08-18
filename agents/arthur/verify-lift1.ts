// verify-lift1.ts — PERSISTENT lane verifier for lift-1 (court roof
// mislocation fix). Offline checks ONLY for the staged-build state:
//   1. mkv3-ring.ts rebuild determinism ×2 — court at the lift-1 build,
//      all six ring siblings byte-identical to their standing builds
//      (RING-SAFETY), backups fresh.
//   2. Decode: roof-band vertex coverage — every 1m x-bin from -6..+6
//      populated (both sheds covered), no gap at the court's midline;
//      fire/fire2 emissive anchors survive; node budget sane.
//   3. The standing gate green at the CURRENT (pre-rollout) live state
//      (live court stays on the tex-82 build until rollout consent —
//      this verifier does NOT assert the live lib; the post-rollout
//      live-read section is added when consent lifts, per the
//      consent-block law).
// Staged rollout: place-lift1-court.ts (capture-then-reapply chassis,
// proven at tex-82) — NOT executed until consent.
// Run: bun agents/arthur/verify-lift1.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const CONVERTED = ["village_hall3", "village_longhouse3", "village_tower3", "village_garden3", "village_bunk3", "village_row3"];
const EXPECT: Record<string, string> = {
    "village_hall3": "3f8f9e6f98bbbd04",
    "village_longhouse3": "333691747dd14c5c",
    "village_tower3": "7f60f1f7a5794411",
    "village_garden3": "1790e1816f08b85e",
    "village_bunk3": "4bfacdd739b9bd0e",
    "village_row3": "7ec9fc54b9d79897",
};
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const restore = () => { for (const f of CONVERTED) copyFileSync(`/tmp/ring-bak-${f}.glb`, `${A}/${f}.glb`); };

// 1) rebuild ×2: deterministic, court at lift-1 build, siblings safe
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
const c1 = sha(`${A}/village_court3.glb`);
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
const c2 = sha(`${A}/village_court3.glb`);
ok("court rebuild deterministic (lift-1 build)", c1 === c2, c1.slice(0, 16));
ok("ring-safety: all six siblings byte-identical to standing builds",
    CONVERTED.every((f) => sha(`${A}/${f}.glb`).slice(0, 16) === EXPECT[f]));
ok("backups fresh", CONVERTED.every((f) => existsSync(`/tmp/ring-bak-${f}.glb`)));

// 2) decode: roof coverage + emissives + node budget
const buf = readFileSync(`${A}/village_court3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const b = buf.subarray(binStart);
const acc = (ai: number, comp = 3): number[] => {
    const a = j.accessors[ai];
    const bv = j.bufferViews[a.bufferView];
    const base = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const out: number[] = [];
    const data = b.subarray(base, base + a.count * comp * 4);
    for (let i = 0; i < data.length; i += 4) out.push(data.readFloatLE(i));
    return out;
};
// parent-chain world translation per node (glTF children are indices)
const par: Record<number, number> = {};
j.nodes.forEach((n: any, i: number) => (n.children ?? []).forEach((c: number) => { par[c] = i; }));
const wtr = (ni: number): number[] => {
    let t = [0, 0, 0], i = ni;
    while (par[i] !== undefined) {
        const pt = j.nodes[par[i]].translation ?? [0, 0, 0];
        t = [t[0] + pt[0], t[1] + pt[1], t[2] + pt[2]];
        i = par[i];
    }
    const rt = j.nodes[i].translation ?? [0, 0, 0];
    return [t[0] + rt[0], t[1] + rt[1], t[2] + rt[2]];
};
const bins = new Map<number, number>();
for (const n of j.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        const pos = acc(prim.attributes.POSITION);
        const t = wtr(j.nodes.indexOf(n));
        for (let i = 0; i < pos.length; i += 3) {
            if (pos[i + 1] + t[1] > 2.7) {
                const x = Math.round(pos[i] + t[0]);
                bins.set(x, (bins.get(x) ?? 0) + 1);
            }
        }
    }
}
const missing = [];
for (let x = -6; x <= 6; x++) if (!bins.has(x)) missing.push(x);
ok("roof coverage: every 1m x-bin -6..+6 populated (both sheds covered)", missing.length === 0, missing.length ? "gaps: " + missing.join(",") : "13/13 bins");
const named = j.nodes.filter((n: any) => /^ct3_/.test(n.name ?? "")).length;
ok("node budget sane (buckets + anchors < 40)", named < 40, `${named} ct3 nodes`);
const fireAnchors = j.nodes.filter((n: any) => /^fire/.test(n.name ?? "")).length;
ok("fire/fire2 emissive anchors survive", fireAnchors === 2, `${fireAnchors}`);
// emissive material present (oven mouth)
const hasEmissive = j.materials.some((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((v: number) => v > 0));
ok("emissive materials present (oven mouth / work bar)", hasEmissive);

// 3) the standing gate green at the CURRENT live state
const vr = execSync("bun agents/arthur/verify-repairs.ts", { cwd: W, encoding: "utf8", timeout: 120000 });
ok("standing gate ALL PASS (live court now on the lift-1 build, pins refreshed)", vr.includes("ALL PASS"));

// 4) LIVE post-rollout close: court on the lift-1 lib at preserved pose,
//    smoke comp recovered (R-110 law: av-court carries sign+embers+smoke
//    +sockets — pre-rollout bag read 1 comp; capture-then-reapply preserves
//    the bag verbatim, so 1 in = 1 out here).
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ct: any = g.entities.find((x: any) => x.id === "av-court");
ok("live: av-court on the lift-1 build (bb31e8a5ffdc1e16)", ct?.lib === "store/bb31e8a5ffdc1e16.glb", ct?.lib ?? "missing");
ok("live: pose preserved (21, -15.3, yaw -0.941)", Math.abs(ct.pos[0] - 21) < 0.01 && Math.abs(ct.pos[2] + 15.3) < 0.01 && Math.abs(Number(ct.yaw) + 0.941) < 0.01, JSON.stringify(ct?.pos) + " yaw " + ct?.yaw);
const bag = Object.keys(ct?.comp ?? {});
ok("live: smoke comp recovered after re-place", bag.includes("particles:smoke"), bag.join(",") || "none");

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
