// struct59-decode-stillwind.ts — read-only decode audit of village_stillwind3.glb.
// Checks: node census, envelope vs designed, brass beads (KEEP glow_pinN/S)
// at the arch springs, gate clear zone EMPTY of stone at spring height,
// coping continuity (dark bucket crest present at 5 stations), wall base
// below grade (y-min = -0.12).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_stillwind3.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;

const nodes = json.nodes ?? [];
console.log("nodes:", nodes.length, nodes.map((n: any) => n.name).join(", "));

// accessor decode helper
const accs = json.accessors ?? [];
function verts(meshIdx: number): Float32Array {
    const mesh = json.meshes[meshIdx];
    const prim = mesh.primitives[0];
    const acc = accs[prim.attributes.POSITION];
    const view = json.bufferViews[acc.bufferView];
    const off = binStart + view.byteOffset + (acc.byteOffset ?? 0);
    const count = acc.count;
    const stride = 12;
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        out[i * 3] = dv.getFloat32(off + i * (view.byteStride ?? stride) + 0, true);
        out[i * 3 + 1] = dv.getFloat32(off + i * (view.byteStride ?? stride) + 4, true);
        out[i * 3 + 2] = dv.getFloat32(off + i * (view.byteStride ?? stride) + 8, true);
    }
    return out;
}
function meshOf(name: string): { idx: number; mat: number } | null {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name && nodes[i].mesh !== undefined) {
            return { idx: nodes[i].mesh, mat: json.meshes[nodes[i].mesh].primitives[0].material };
        }
    }
    return null;
}
function env(v: Float32Array) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < v.length; i += 3) for (let a = 0; a < 3; a++) {
        mn[a] = Math.min(mn[a], v[i + a]); mx[a] = Math.max(mx[a], v[i + a]);
    }
    return { mn, mx };
}

// per-node: name, material, vertex count, envelope
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const v = verts(n.mesh);
    const e = env(v);
    console.log(n.name, "mat", json.meshes[n.mesh].primitives[0].material, "verts", v.length / 3,
        "env", e.mn.map(x => x.toFixed(3)).join(","), "..", e.mx.map(x => x.toFixed(3)).join(","));
}

// design constants for the gate zone (used by beads + clear-zone checks)
const A = 1.5, LAM = 15.4, K = 2 * Math.PI / LAM;
const slopeG = A * K * Math.cos(K * 7.7);
const thetaG = Math.atan(slopeG);
const wG = 0.34 + 0.12 * Math.abs(Math.cos(K * 7.7));
const nx = Math.cos(thetaG), nz = -Math.sin(thetaG);
const cxG = -(wG / 2) * nx, czG = -(wG / 2) * nz; // xc(0)=0
const tlen = Math.hypot(slopeG, 1);
const Tt = [slopeG / tlen, 1 / tlen];
const R = 0.85, SPRING = 1.42;

// BEADS: exact positions (node.translation carries placement — pitfall 4)
for (const nm of ["glow_pinN", "glow_pinS"]) {
    const ni = nodes.findIndex((n: any) => n.name === nm);
    if (ni < 0) { console.log(nm, "MISSING"); continue; }
    const t = nodes[ni].translation ?? [0, 0, 0];
    console.log(nm, "nodeTranslation", t.map((x: number) => (+x).toFixed(4)).join(","));
    // design expectation: springs at ±R along Tt + 0.21 outward
    const expN = [cxG + (R + 0.21) * Tt[0], SPRING, czG + (R + 0.21) * Tt[1]];
    const expS = [cxG + (-R + 0.21) * Tt[0], SPRING, czG + (-R + 0.21) * Tt[1]];
    const which = nm === "glow_pinN" ? expN : expS;
    const dd = Math.hypot(t[0] - which[0], t[2] - which[1 + 1]);
    console.log(nm, "expected", which.map(x => x.toFixed(4)).join(","), "delta", dd.toFixed(4));
}

// GATE CLEAR ZONE: stone material buckets (mat != brass) must have ZERO
// verts inside the clear arc: center (acx,acz) = wall centerline at gate,
// R 0.85, spring 1.42..2.27. Constants block above (cxG/Tt/R/SPRING).
let badLow = 0, badHi = 0;
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const matIdx = json.meshes[n.mesh].primitives[0].material;
    const isBrass = (json.materials[matIdx].name ?? "").includes("brass") || n.name.startsWith("glow");
    if (isBrass) continue;
    const v = verts(n.mesh);
    for (let i = 0; i < v.length; i += 3) {
        const x = v[i], y = v[i + 1], z = v[i + 2];
        // gate-frame distance in the run-tangent direction
        const dt = (x - cxG) * Tt[0] + (z - czG) * Tt[1];
        if (Math.abs(dt) < 0.62) {          // inside the passage (clear half 0.62 < 0.725 foot embed)
            if (y > 0.05 && y < SPRING) badLow++;            // below-spring = true blockage
            else if (y >= SPRING && y < SPRING + R - 0.10) badHi++;  // barrel soffit above spring
        }
    }
}
console.log("gate clear-zone stone verts BELOW spring (expect 0):", badLow);
console.log("gate zone barrel soffit verts above spring (intended ceiling):", badHi);

// COPING continuity: dark bucket verts near crest at 5 z-stations
const darkNodes = nodes.filter((n: any) => {
    if (n.mesh === undefined) return false;
    const mi = json.meshes[n.mesh].primitives[0].material;
    return (json.materials[mi].name ?? "") === "copstone";
});
for (const z of [-7.0, -3.85, 0, 3.85, 7.0]) {
    const K2 = K, zc = A * Math.sin(K2 * (z + 7.7));
    const crest = 1.75 + 1.1 * (1 - Math.cos(K2 * (z + 7.7))) / 2;
    let found = 0;
    for (const n of darkNodes) {
        const v = verts(n.mesh);
        for (let i = 0; i < v.length; i += 3) {
            if (Math.abs(v[i + 2] - z) < 0.30 && Math.abs(v[i] - zc) < 0.55 && v[i + 1] > crest - 0.25 && v[i + 1] < crest + 0.25) found++;
        }
    }
    console.log(`copstone verts near z=${z} crest=${crest.toFixed(2)}:`, found);
}
