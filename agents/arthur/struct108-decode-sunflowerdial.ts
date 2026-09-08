// struct108-decode-sunflowerdial.ts — decode audit of village_sunflowerdial3.glb.
// Verifies from BYTES: pinned sha, node budget, texMat lanes (sd_*), brass
// emissive exported, KEEP nodes (glow_sd_1 bead + glow_sd_socket), TRUE
// world-frame envelope, THE VOGEL LAW — each of the 89 achenes' inner-tip
// vertices land at exactly (r_k·cosθ_k, r_k·sinθ_k) in the untilted head
// frame (r_k = c√k, θ_k = k·γ) — no NaN accessors.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_sunflowerdial3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);

// build math replica (constants must match mkv3-sunflowerdial.ts)
const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 2 * Math.PI * (2 - PHI);
const N = 89, C = 0.30, HEAD_Y = 4.05, TILT = -15 * Math.PI / 180, BR = 0.11;

ck("sha pinned v1-flat", sha === "3f271a10fff20cc1592dffa948f4d504e066e5187e157b53032f2c415c874142", sha.slice(0, 16));
ck("node budget 1-45", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["sd_face", "sd_bed", "sd_bract", "sd_stem"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("bead KEEP node", names.includes("glow_sd_1"));
ck("socket KEEP node", names.includes("glow_sd_socket"));

// ---- gather sd_face bucket vertices (baked world frame) ----
const views = j.bufferViews ?? [];
const faceNode = j.nodes.find((n: any) => n.name === "sd_face" || (n.mesh !== undefined && j.meshes[n.mesh].primitives[0]?.material !== undefined && j.materials[(j.meshes[n.mesh].primitives[0].material)]?.name === "sd_face"));
ck("sd_face bucket node found", !!faceNode, faceNode?.name ?? "(none)");
let fv: number[][] = [];
if (faceNode) {
    const prim = j.meshes[faceNode.mesh].primitives[0];
    const acc = j.accessors[prim.attributes.POSITION];
    const bv = views[acc.bufferView];
    const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const t = faceNode.translation ?? [0, 0, 0];
    for (let i = 0; i < acc.count; i++) {
        const p = BIN + off + i * 12;
        fv.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
    }
    console.log(`sd_face bucket: ${acc.count} verts`);
}

// ---- THE VOGEL LAW: inner-tip vertex per seed at exact (r cosθ, r sinθ) ----
// un-tilt: world -> head-local = R_x(+15°) then translate -HEAD_Y
if (fv.length) {
    const ct = Math.cos(-TILT), st = Math.sin(-TILT);
    const loc = fv.map(([x, y, z]) => [x, y * ct - z * st, y * st + z * ct].map((v, i) => i === 1 ? v - HEAD_Y : v) as number[]);
    // wait: rotate about x by -TILT: y' = y·cos(-TILT) - z·sin(-TILT), z' = y·sin(-TILT) + z·cos(-TILT)
    const loc2 = fv.map(([x, y, z]) => {
        const y2 = (y - HEAD_Y) * Math.cos(-TILT) - z * Math.sin(-TILT);
        const z2 = (y - HEAD_Y) * Math.sin(-TILT) + z * Math.cos(-TILT);
        return [x, y2, z2];
    });
    let hit = 0; const misses: string[] = [];
    for (let k = 1; k <= N; k++) {
        const r = C * Math.sqrt(k), th = k * GAMMA;
        const ex = r * Math.cos(th), ey = r * Math.sin(th);
        let best = Infinity;
        for (const [x, y] of loc2) { const d = Math.hypot(x - ex, y - ey); if (d < best) best = d; }
        if (best < 0.003) hit++; else misses.push(`k${k} d${best.toFixed(4)}`);
    }
    ck("Vogel inner-tips 89/89 exact (baked float32, tol 3mm)", hit === N, `${hit}/${N}${misses.length ? " misses: " + misses.slice(0, 4).join(", ") : ""}`);
}

// ---- true world-frame envelope ----
{
    let wmn = [Infinity, Infinity, Infinity], wmx = [-Infinity, -Infinity, -Infinity];
    for (const nd of j.nodes) {
        if (nd.mesh === undefined) continue;
        const prim = j.meshes[nd.mesh].primitives[0];
        const acc = j.accessors[prim.attributes.POSITION];
        const bv = views[acc.bufferView];
        const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const t = nd.translation ?? [0, 0, 0];
        for (let i = 0; i < acc.count; i++) {
            const p = BIN + off + i * 12;
            const x = bytes.readFloatLE(p) + t[0], y = bytes.readFloatLE(p + 4) + t[1], z = bytes.readFloatLE(p + 8) + t[2];
            wmn[0] = Math.min(wmn[0], x); wmx[0] = Math.max(wmx[0], x);
            wmn[1] = Math.min(wmn[1], y); wmx[1] = Math.max(wmx[1], y);
            wmn[2] = Math.min(wmn[2], z); wmx[2] = Math.max(wmx[2], z);
        }
    }
    const reach = Math.max(Math.abs(wmx[0]), Math.abs(wmn[0]), Math.abs(wmx[2]), Math.abs(wmn[2]));
    ck("below-grade none", wmn[1] >= -0.005, `y min ${wmn[1].toFixed(4)}`);
    ck("crest ≈ 8.21 (bead crown)", Math.abs(wmx[1] - 8.21) < 0.05, `${wmx[1].toFixed(3)}`);
    ck("x/z reach ≈ 3.9 (R_max + bract flare)", reach > 3.4 && reach < 4.1, `${reach.toFixed(3)}`);
    ck("vertical entity (h > 2.2)", wmx[1] - wmn[1] > 2.2, `h ${(wmx[1] - wmn[1]).toFixed(3)}`);
    console.log(`envelope: x[${wmn[0].toFixed(2)}, ${wmx[0].toFixed(2)}] y[${wmn[1].toFixed(2)}, ${wmx[1].toFixed(2)}] z[${wmn[2].toFixed(2)}, ${wmx[2].toFixed(2)}]`);
}
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));

if (f) { console.log(`\n${f} FAIL`); process.exit(1); }
console.log("\nALL PASS");
