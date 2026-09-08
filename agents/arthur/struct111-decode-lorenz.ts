// struct111-decode-lorenz.ts — decode audit of village_lorenz3.glb (v2).
// Verifies from BYTES: pinned sha, node budget, texMat lanes (lz_*), brass
// emissive exported, KEEP node glow_lz_1, THE LORENZ LAW — the iron bucket
// is vertex-for-vertex a TUBE around an independently reintegrated RK4
// trajectory of the Lorenz system (same constants, fresh integration):
//   (a) every iron vertex lies within 0.15 of some replica centerline
//       sample (pure-tube law — nothing else is iron),
//   (b) every replica sample has iron verts within 0.18 (the path passes
//       through ALL its waypoints — no truncated/invented geometry),
//   (c) iron vertex count == TubeGeometry law (4259 rings x 9),
//   (d) seed ball at sample[0], stanchion under the lowest sample, pin at
//       the apex terminus, bead KEEP topmost of the whole file,
//   (e) file envelope matches the replica envelope + tube radius, no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_lorenz3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const views = j.bufferViews ?? [];

// ---- independent replica: re-integrate the system from the equations ----
const SIGMA = 10, RHO = 28, BETA = 8 / 3, DT = 0.002, TRANSIENT = 2.0, T_TARGET = 48.0, T_CAP = 70.0, STRIDE = 1.15, S = 0.145;
function lorenz(s: number[]): number[] {
    return [SIGMA * (s[1] - s[0]), s[0] * (RHO - s[2]) - s[1], s[0] * s[1] - BETA * s[2]];
}
function rk4(s: number[], dt: number): number[] {
    const k1 = lorenz(s);
    const k2 = lorenz(s.map((v, i) => v + dt / 2 * k1[i]));
    const k3 = lorenz(s.map((v, i) => v + dt / 2 * k2[i]));
    const k4 = lorenz(s.map((v, i) => v + dt * k3[i]));
    return s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
let st = [1, 1, 1];
for (let t = 0; t < TRANSIENT; t += DT) st = rk4(st, DT);
const samples: number[][] = [[...st]];
let carried = 0;
function record(units: number) {
    const steps = Math.round(units / DT);
    for (let i = 0; i < steps; i++) {
        const prev = st;
        st = rk4(st, DT);
        carried += Math.hypot(st[0] - prev[0], st[1] - prev[1], st[2] - prev[2]);
        if (carried >= STRIDE) { samples.push([...st]); carried -= STRIDE; }
    }
}
record(T_TARGET);
const argmaxZ = () => samples.reduce((bi, p, i) => (p[2] > samples[bi][2] ? i : bi), 0);
let apex = argmaxZ(), totalT = T_TARGET;
while (apex < 0.6 * samples.length && totalT < T_CAP) { record(4); totalT += 4; apex = argmaxZ(); }
samples.length = apex + 1;
// world map: x=S*x, y=S*z, z=S*y
const pts = samples.map(p => [p[0] * S, p[2] * S, p[1] * S]);
const TUBE_R = 0.085, SEED_R = 0.12, BR = 0.10, RISER = 0.38, DAIS_H = 0.30, DAIS_RT = 2.35, DAIS_RB = 2.50;

ck("sha pinned v2", sha === "77b59dbbcb8bfb5963ad44ec40a092c5e81a3f65f88a2a1feeca40e8151da4ff", sha.slice(0, 16));
ck("node budget 1-45", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["lz_iron", "lz_stone"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("bead KEEP node", names.includes("glow_lz_1"));

function bucketVerts(matName: string): number[][] {
    const out: number[][] = [];
    for (const n of j.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j.meshes[n.mesh].primitives) {
            if (j.materials[prim.material]?.name !== matName) continue;
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const t = n.translation ?? [0, 0, 0];
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                out.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
            }
        }
    }
    return out;
}

// spatial hash over samples
const CELL = 0.5;
const key = (x: number, y: number, z: number) => `${Math.floor(x / CELL)}|${Math.floor(y / CELL)}|${Math.floor(z / CELL)}`;
const grid = new Map<string, number[][]>();
pts.forEach((p, i) => {
    const k = key(p[0], p[1], p[2]);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(p);
});
function nearSamples(x: number, y: number, z: number, r: number): number[][] {
    const found: number[][] = [];
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), cz = Math.floor(z / CELL);
    const span = Math.ceil(r / CELL);
    for (let a = -span; a <= span; a++) for (let b = -span; b <= span; b++) for (let c = -span; c <= span; c++) {
        for (const p of grid.get(`${cx + a}|${cy + b}|${cz + c}`) ?? []) found.push(p);
    }
    return found;
}

const iron = bucketVerts("lz_iron");
ck("iron bucket found", iron.length > 0, `${iron.length} verts`);
// (a) pure-tube law
{
    let bad = 0;
    for (const v of iron) {
        const near = nearSamples(v[0], v[1], v[2], 0.15);
        if (!near.some(p => Math.hypot(p[0] - v[0], p[1] - v[1], p[2] - v[2]) <= 0.15)) bad++;
    }
    ck("LORENZ LAW (a) every iron vertex within 0.15 of the replica path", bad === 0, `${bad}/${iron.length} outside`);
}
// (b) coverage law
{
    const ironGrid = new Map<string, number[][]>();
    iron.forEach(v => {
        const k = key(v[0], v[1], v[2]);
        if (!ironGrid.has(k)) ironGrid.set(k, []);
        ironGrid.get(k)!.push(v);
    });
    let uncovered = 0;
    for (const p of pts) {
        let hit = false;
        const cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL), cz = Math.floor(p[2] / CELL);
        outer: for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
            for (const v of ironGrid.get(`${cx + a}|${cy + b}|${cz + c}`) ?? []) {
                if (Math.hypot(v[0] - p[0], v[1] - p[1], v[2] - p[2]) <= 0.18) { hit = true; break outer; }
            }
        }
        if (!hit) uncovered++;
    }
    ck("LORENZ LAW (b) every replica sample carries tube verts", uncovered === 0, `${uncovered}/${pts.length} uncovered`);
}
// (c) tube count law: (samples) rings x (8+1) radial
ck("LORENZ LAW (c) iron count == TubeGeometry law", Math.abs(iron.length - pts.length * 9) <= 60, `${iron.length} vs ${pts.length * 9}`);

// (d) anchors + bead
const stone = bucketVerts("lz_stone");
{
    const s0 = pts[0];
    const seedHits = stone.filter(v => Math.hypot(v[0] - s0[0], v[1] - s0[1], v[2] - s0[2]) <= SEED_R + 0.03).length;
    ck("seed ball at sample[0] (stone)", seedHits >= 30, `${seedHits} verts near ${s0.map(n => n.toFixed(2))}`);
    let lowIdx = 0;
    pts.forEach((p, i) => { if (p[1] < pts[lowIdx][1]) lowIdx = i; });
    const lp = pts[lowIdx];
    const postHits = stone.filter(v => Math.hypot(v[0] - lp[0], v[2] - lp[2]) <= 0.15 && v[1] >= DAIS_H - 0.01 && v[1] <= lp[1] - TUBE_R + 0.01).length;
    ck("stanchion under lowest sample (stone)", postHits === 24, `${postHits} verts (BoxGeometry law = 24), low y ${lp[1].toFixed(2)}`);
    const ap = pts[pts.length - 1];
    const pinHits = stone.filter(v => Math.hypot(v[0] - ap[0], v[2] - ap[2]) <= 0.10 && v[1] >= ap[1] - 0.01 && v[1] <= ap[1] + RISER + 0.01).length;
    ck("pin at apex terminus (stone)", pinHits >= 20, `${pinHits} verts, apex y ${ap[1].toFixed(2)}`);
    const beadNode = j.nodes[names.indexOf("glow_lz_1")];
    const bt = beadNode?.translation ?? [0, 0, 0];
    const beadOk = Math.abs(bt[0] - ap[0]) < 1e-4 && Math.abs(bt[1] - (ap[1] + RISER + BR)) < 1e-4 && Math.abs(bt[2] - ap[2]) < 1e-4;
    ck("bead at apex + riser exact", beadOk, `bead (${bt.map(n => n.toFixed(3))}) vs apex+riser (${ap[0].toFixed(3)}, ${(ap[1] + RISER + BR).toFixed(3)}, ${ap[2].toFixed(3)})`);
    let maxY = -Infinity;
    for (const v of [...iron, ...stone]) maxY = Math.max(maxY, v[1]);
    ck("bead topmost of whole file", bt[1] + BR > maxY + 0.05, `bead top ${(bt[1] + BR).toFixed(2)} vs cloud max ${maxY.toFixed(2)}`);
}

// (e) envelope + NaN
{
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity], nan = 0, total = 0;
    for (const n of j.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j.meshes[n.mesh].primitives) {
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const t = n.translation ?? [0, 0, 0];
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                const v = [bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]];
                total++;
                if (v.some(isNaN)) { nan++; continue; }
                for (let k = 0; k < 3; k++) { if (v[k] < mn[k]) mn[k] = v[k]; if (v[k] > mx[k]) mx[k] = v[k]; }
            }
        }
    }
    ck("no NaN vertices", nan === 0, `${nan}`);
    const repX = Math.max(Math.abs(Math.min(...pts.map(p => p[0]))), Math.max(...pts.map(p => p[0])));
    const repZ = Math.max(Math.abs(Math.min(...pts.map(p => p[2]))), Math.max(...pts.map(p => p[2])));
    const daisX = Math.max(DAIS_RB, repX + TUBE_R + 0.02), daisZ = Math.max(DAIS_RB, repZ + TUBE_R + 0.02);
    ck("envelope x == replica", Math.abs(Math.max(mx[0], -mn[0]) - daisX) < 0.2 && Math.abs((mx[0] - mn[0]) - 2 * daisX) < 0.2, `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} vs daisX ${daisX.toFixed(2)}`);
    ck("envelope z == replica", Math.abs((mx[2] - mn[2]) - 2 * daisZ) < 0.2, `z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)} vs daisZ ${daisZ.toFixed(2)}`);
    const crest = pts[pts.length - 1][1] + RISER + 2 * BR;
    ck("envelope crest == bead top", Math.abs(mx[1] - crest) < 0.02, `y max ${mx[1].toFixed(3)} vs ${crest.toFixed(3)}`);
    ck("grade at 0 (dais base)", mn[1] >= -0.01 && mn[1] <= 0.01, `y min ${mn[1].toFixed(3)}`);
    ck("total verts sane", total > 30000 && total < 45000, `${total}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
if (f) process.exit(1);
