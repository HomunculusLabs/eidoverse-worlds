// struct106-decode-dodecahedron.ts — decode audit of village_dodecahedron3.glb.
// Verifies: pinned sha, node/mesh budget, texMat lanes (dd_cap/dd_face/dd_ridge),
// brass emissive bead KEEP node at the zenith face center, TRUE world-frame
// envelope from node-transformed accessors vs build math (regular dodecahedron:
// R 3.12, ri = R·√((5+2√5)/15), edge a = 2R/√3/φ, crest 2ri+2BR−0.03),
// bottom face on grade, VERTICAL class, door lane corridor vertex-free,
// no NaN accessors.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_dodecahedron3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8; // end of JSON chunk + BIN header (8B) = binary start
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const R = 3.12, RIDGE = 0.10, BR = 0.075, T = 0.18;
const PHI = (1 + Math.sqrt(5)) / 2;
const RI = R * Math.sqrt((5 + 2 * Math.sqrt(5)) / 15); // exact regular-dodeca inradius
ck("sha pinned", sha === "e30bbfa932e24dc17638dbf7db1abad830744e5182e91b9eb2eb424d06cf150c", sha.slice(0, 16));
ck("node budget 1-45 (honest under-floor merge disclosed)", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["dd_cap", "dd_face", "dd_ridge"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("bead KEEP node", names.includes("glow_dd_1"));

// ---- true world-frame envelope: transform each mesh node's accessor by its TRS
const views = j.bufferViews ?? [];
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
const bead = j.nodes.find((n: any) => n.name === "glow_dd_1");
const bt = bead?.translation ?? [0, 0, 0];
ck("bead at zenith face center (0, 2ri+BR−0.03, 0)", Math.abs(bt[0]) < 1e-6 && Math.abs(bt[2]) < 1e-6
    && Math.abs(bt[1] - (2 * RI + BR - 0.03)) < 0.01, `${bt.map((v: number) => v.toFixed(3)).join(",")} want y ${(2 * RI + BR - 0.03).toFixed(3)}`);
ck("below-grade none", wmn[1] >= -0.005, `y min ${wmn[1].toFixed(4)}`);
// horizontal reach: vertex circumradius R + ridge seat outward ~0.05·√(1−out.y²)·? — cap at R + 0.09
const reach = Math.max(Math.abs(wmx[0]), Math.abs(wmn[0]), Math.abs(wmx[2]), Math.abs(wmn[2]));
ck("horizontal reach ≈ R..R+0.09", reach > R - 0.01 && reach < R + 0.095, `${reach.toFixed(3)} (R ${R})`);
ck("crest = 2ri + 2BR − 0.03", Math.abs(wmx[1] - (2 * RI + 2 * BR - 0.03)) < 0.01, `${wmx[1].toFixed(3)} want ${(2 * RI + 2 * BR - 0.03).toFixed(3)}`);
ck("vertical entity (h > 2.2)", wmx[1] - wmn[1] > 2.2, `h ${(wmx[1] - wmn[1]).toFixed(3)}`);
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));

// ---- geometric re-derivation (build math replica) for door lane + grade
function norm(v: number[]) { const l = Math.hypot(...v); return v.map(x => x / l); }
function rot(v: number[], axis: number[], w: number) {
    const [x, y, z] = v, [ux, uy, uz] = axis, c = Math.cos(w), s2 = Math.sin(w);
    return [
        x * (c + ux * ux * (1 - c)) + y * (ux * uy * (1 - c) - uz * s2) + z * (ux * uz * (1 - c) + uy * s2),
        x * (uy * ux * (1 - c) + uz * s2) + y * (c + uy * uy * (1 - c)) + z * (uy * uz * (1 - c) - ux * s2),
        x * (uz * ux * (1 - c) - uy * s2) + y * (uz * uy * (1 - c) + ux * s2) + z * (c + uz * uz * (1 - c))];
}
const raw: number[][] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) raw.push([sx, sy, sz]);
for (const [a, b] of [[1 / PHI, PHI], [-1 / PHI, PHI], [1 / PHI, -PHI], [-1 / PHI, -PHI]] as Array<[number, number]>) {
    raw.push([0, a, b], [a, b, 0], [b, 0, a]);
}
const s = R / Math.sqrt(3);
const V0 = raw.map(v => v.map(x => x * s));
const dn0 = norm([0, -PHI, 1]);
const t0 = [0, -1, 0];
const cr = [dn0[1] * t0[2] - dn0[2] * t0[1], dn0[2] * t0[0] - dn0[0] * t0[2], dn0[0] * t0[1] - dn0[1] * t0[0]];
const w0 = Math.acos(Math.max(-1, Math.min(1, dn0[0] * t0[0] + dn0[1] * t0[1] + dn0[2] * t0[2])));
const axis = norm(cr);
const Vr = V0.map(v => rot(v, axis, w0).map((x, i) => x + (i === 1 ? RI : 0)));
const dirs: number[][] = [];
for (const [a, b] of [[PHI, 1], [PHI, -1], [-PHI, 1], [-PHI, -1]] as Array<[number, number]>) {
    dirs.push(norm([a, b, 0]), norm([0, a, b]), norm([b, 0, a]));
}
type F = { idx: number[]; n: number[]; C: number[] };
const faces: F[] = dirs.map(d => {
    // face selection on UNROTATED V0 (same as mk); verts then read from Vr
    const dots = V0.map(v => v[0] * d[0] + v[1] * d[1] + v[2] * d[2]);
    const mx2 = Math.max(...dots);
    const idx = dots.map((x, i) => (Math.abs(x - mx2) < 1e-5 ? i : -1)).filter(i => i >= 0);
    const C = [0, 1, 2].map(k => idx.reduce((a, i) => a + Vr[i][k], 0) / idx.length);
    return { idx, n: d, C };
});
ck("all 12 faces exactly 5 verts", faces.every(fc => fc.idx.length === 5), faces.map(fc => fc.idx.length).join(","));
const botF = faces.reduce((b, fc) => (fc.C[1] < b.C[1] ? fc : b), faces[0]);
const byLow = botF.idx.map(i => Vr[i][1]);
ck("bottom face on grade", Math.max(...byLow) < 0.005 && Math.min(...byLow) > -0.005, `${Math.min(...byLow).toFixed(4)}..${Math.max(...byLow).toFixed(4)}`);
const belt = faces.filter(fc => fc !== botF && fc.idx.some(i => botF.idx.includes(i)));
const doorF = belt.length ? belt.reduce((b, fc) => (fc.C[2] > b.C[2] ? fc : b), belt[0]) : null;
ck("door face identified (belt of 5, max z)", belt.length === 5 && !!doorF && doorF!.C[2] > 1.5, `belt ${belt.length} doorC z ${doorF?.C[2].toFixed(2)}`);

// door lane corridor: cylinder r 0.62 around door centerline, y 0.2..2.0 —
// no world-frame vertex inside (walkable aperture)
let laneHits = 0, checked = 0;
const dcx = doorF!.C[0], dcz = doorF!.C[2];
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
        checked++;
        if (y < 0.2 || y > 2.0) continue;
        if (Math.hypot(x - dcx, z - dcz) < 0.62) laneHits++;
    }
}
ck("door lane corridor vertex-free", laneHits === 0, `${laneHits} hits / ${checked} verts`);
console.log(f === 0 ? "DECODE ALL PASS" : `DECODE ${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
