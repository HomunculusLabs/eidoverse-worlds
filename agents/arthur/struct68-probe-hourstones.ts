// struct68-probe-hourstones.ts — falsify/confirm the ZAI fallback's claim that
// the 7h hour stone renders as an "L-shaped double block" (struct-67 judge
// debt, top view). Probe law 11: decode the exact bone-bucket vertex data.
// PASS shape = EVERY stone is exactly one 24-vert box, local dims
// (0.14, 0.24, 0.14) after de-rotation to its hour angle, and 7h is the
// mirror twin of 17h. Anything else fails loudly.
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_meridiandial3.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);
const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
const mats = (jsonChunk.materials ?? []).map((m: any) => m.name);

const PHI = (40 * Math.PI) / 180;
const hourAngle = (H: number) => Math.atan(Math.sin(PHI) * Math.tan((15 * (H - 12) * Math.PI) / 180));

// find the bone bucket prim
let bone: number[][] | null = null;
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const mesh = meshes[n.mesh];
    for (const p of mesh.primitives) {
        const mat = p.material !== undefined ? mats[p.material] : undefined;
        if ((mat ?? "").toLowerCase().includes("bone")) {
            const posAcc = jsonChunk.accessors[p.attributes.POSITION];
            const bufView = jsonChunk.bufferViews[posAcc.bufferView];
            const off = (bufView.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
            const dv = new DataView(bin.buffer, bin.byteOffset + off, posAcc.count * 12);
            const tr = n.translation ?? [0, 0, 0];
            const verts: number[][] = [];
            for (let i = 0; i < posAcc.count; i++) {
                verts.push([
                    dv.getFloat32(i * 12, true) + (tr[0] ?? 0),
                    dv.getFloat32(i * 12 + 4, true),
                    dv.getFloat32(i * 12 + 8, true) + (tr[2] ?? 0),
                ]);
            }
            bone = verts;
        }
    }
}
if (!bone) { console.error("FAIL bone bucket not found"); process.exit(1); }
console.log(`bone verts total: ${bone.length} (law: 11 boxes × 24 = 264)`);

// de-duplicate exact positions (merged buckets can share verts at seams)
const uniq = new Map<string, number[]>();
for (const v of bone) uniq.set(v.map(n => n.toFixed(4)).join(","), v);
const pts = [...uniq.values()];
console.log(`unique positions: ${pts.length}`);

// cluster stones by (x,z); threshold 0.30 (noon-h11 near corners sit 0.355m
// apart — a 0.4 threshold cross-contaminates them), re-anchored on centroid.
const clusters: number[][][] = [];
for (const p of pts) {
    let hit = clusters.find(c => {
        const cx = c.reduce((s, v) => s + v[0], 0) / c.length;
        const cz = c.reduce((s, v) => s + v[2], 0) / c.length;
        return Math.hypot(p[0] - cx, p[2] - cz) < 0.30;
    });
    if (hit) hit.push(p); else clusters.push([p]);
}
console.log(`clusters: ${clusters.length} (law: 11)`);
if (clusters.length !== 11) { console.error("FAIL cluster count"); process.exit(1); }

type Stone = { H: number; n: number; cx: number; cz: number; cy: number; dims: number[]; span: number };
const stones: Stone[] = [];
let allBoxOk = true;
for (const c of clusters) {
    const cx = c.reduce((s, v) => s + v[0], 0) / c.length;
    const cz = c.reduce((s, v) => s + v[2], 0) / c.length;
    const cy = c.reduce((s, v) => s + v[1], 0) / c.length;
    // nearest hour by angle from N
    const theta = Math.atan2(cx, -cz);
    let bestH = 12, bestd = 1e9;
    for (let H = 6; H <= 18; H++) {
        if (H === 12 && Math.abs(cx) > 0.05) continue;
        const d = Math.abs(theta - hourAngle(H));
        if (d < bestd) { bestd = d; bestH = H; }
    }
    // de-rotate into the stone's local frame: radial direction u = (sinθ, -cosθ)
    const u = [Math.sin(theta), -Math.cos(theta)];
    const radial = c.map(v => v[0] * u[0] + v[2] * u[1]);
    const tangential = c.map(v => -v[0] * u[1] + v[2] * u[0]);
    const ys = c.map(v => v[1]);
    const dims = [
        Math.max(...radial) - Math.min(...radial),
        Math.max(...ys) - Math.min(...ys),
        Math.max(...tangential) - Math.min(...tangential),
    ];
    // span = max pairwise distance (an L / double block has span >> box diag)
    let span = 0;
    for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
        span = Math.max(span, Math.hypot(c[i][0] - c[j][0], c[i][1] - c[j][1], c[i][2] - c[j][2]));
    }
    const diag = Math.hypot(bestH === 12 ? 0.17 : 0.14, bestH === 12 ? 0.34 : 0.24, bestH === 12 ? 0.17 : 0.14);
    const boxOk = c.length === 8 // post-dedup, a box's 24 verts = 8 unique corners
        && Math.abs(dims[0] - (bestH === 12 ? 0.17 : 0.14)) < 0.02 && Math.abs(dims[1] - (bestH === 12 ? 0.34 : 0.24)) < 0.02 && Math.abs(dims[2] - (bestH === 12 ? 0.17 : 0.14)) < 0.02
        && span < diag + 0.02;
    if (!boxOk) allBoxOk = false;
    stones.push({ H: bestH, n: c.length, cx, cz, cy, dims, span });
    console.log(`  stone ~h${bestH}: n=${c.length} center (${cx.toFixed(3)},${cy.toFixed(3)},${cz.toFixed(3)}) radial×h×tang ${dims.map(d => d.toFixed(3)).join("×")} span ${span.toFixed(3)} ${boxOk ? "BOX-OK" : "*** NOT A CLEAN BOX ***"}`);
}

// mirror law: h7 vs h17 (and h8/h16, h9/h15, h10/h14, h11/h13)
for (const [a, b] of [[7, 17], [8, 16], [9, 15], [10, 14], [11, 13]] as [number, number][]) {
    const A = stones.find(s => s.H === a), B = stones.find(s => s.H === b);
    if (!A || !B) { console.error(`FAIL mirror pair ${a}/${b} missing`); process.exit(1); }
    const ok = A.n === B.n
        && Math.abs(A.cx + B.cx) < 0.01 && Math.abs(A.cz - B.cz) < 0.01
        && Math.abs(A.span - B.span) < 0.005
        && Math.abs(A.dims[0] - B.dims[0]) < 0.005 && Math.abs(A.dims[2] - B.dims[2]) < 0.005;
    console.log(`mirror h${a}↔h${b}: |Δcx| ${Math.abs(A.cx + B.cx).toFixed(4)} |Δcz| ${Math.abs(A.cz - B.cz).toFixed(4)} |Δspan| ${Math.abs(A.span - B.span).toFixed(4)} → ${ok ? "MIRROR-OK" : "*** ASYMMETRY ***"}`);
    if (!ok) allBoxOk = false;
}

// ground law: every stone base sits at the face plane 0.36
for (const s of stones) { /* checked via cy arithmetic below */ }
const baseOk = stones.every(s => Math.abs(s.cy - (0.36 + (s.H === 12 ? 0.34 : 0.24) / 2)) < 0.01);
console.log(`stone base on face plane (cy law): ${baseOk ? "PASS" : "FAIL"}`);

if (!allBoxOk || !baseOk) { console.error("FAIL probe — ZAI claim needs source fix"); process.exit(1); }
console.log("PROBE VERDICT: 11 clean boxes, 7h is the exact mirror of 17h — the L-shaped claim is a probe artifact (probe law 11: decode outranks the render claim)");
