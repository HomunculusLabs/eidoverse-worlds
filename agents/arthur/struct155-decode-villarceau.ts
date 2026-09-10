// struct155-decode-villarceau.ts — decode audit of village_villarceau3.glb
// (struct-155 build tick, R11-3 THE VILLARCEAU RINGS). Verifies from BYTES
// via an INDEPENDENT replica (no mk imports — struct-119+ law):
//   (a) pinned sha; node census 4 (3 texMat buckets vc_stone/vc_brass/
//       vc_slab + 1 KEEP glow_vc_1); exactly one emissive material,
//       0x9a7030 @ 0.85 linear;
//   (b) STONE LAW: every vc_stone vertex satisfies the torus equation
//       (√(x²+y'²)−R0)² + z'² = r0² (y' = y−LIFT) — parametric torus
//       verts sit on the surface to float precision;
//   (c) HOOP LAW: every vc_brass vertex lies within HOOP_R+3mm of one of
//       the 10 replica Villarceau circles (true point-to-circle distance),
//       and every replica sample (every 8th of 96 per circle) finds a
//       brass vertex within 0.10 — coverage both directions;
//   (d) BEAD LAW: exactly 1 KEEP glow node at the φ=0 pair crossing
//       (0, 0.5+LIFT, 0.5);
//   (e) SLAB LAW: vc_slab on grade, plan 2.6 x 2.2;
//   (f) ENVELOPE 3.48 x 3.47 x 2.20, x/z centered; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(process.argv[2] ?? `${ROOT}/agents/arthur/assets/village_villarceau3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const BIN = 20 + jl + 8;
const va = (ai: number): Float32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[i * 3] = bytes.readFloatLE(off + i * 12);
        out[i * 3 + 1] = bytes.readFloatLE(off + i * 12 + 4);
        out[i * 3 + 2] = bytes.readFloatLE(off + i * 12 + 8);
    }
    return out;
};

// ---- independent replica constants (fresh derivation) --------------------------------------------
const R0 = 1, r0 = 1 / Math.SQRT2;
const HOOP_R = 0.035, SLAB_H = 0.36, EMBED = 0.30;
const LIFT = R0 + r0 + SLAB_H - EMBED;
const U = [0, 1 / Math.SQRT2, 1 / Math.SQRT2], W = [1, 0, 0];
const rotZ = (p: number[], phi: number) => [p[0] * Math.cos(phi) - p[1] * Math.sin(phi), p[0] * Math.sin(phi) + p[1] * Math.cos(phi), p[2]];
// replica circle centers (10) and unit plane normals
const circles: Array<{ c: number[]; n: number[] }> = [];
for (const k of [0, 1, 2, 3, 4]) {
    const phi = (k * 36 * Math.PI) / 180;
    for (const sign of [1, -1]) {
        const c = rotZ([sign * r0, 0, 0], phi);
        const u = rotZ(U, phi), w = rotZ(W, phi);
        const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        circles.push({ c, n });
    }
}
const hoopPt = (ci: number, t: number): number[] => {
    const { c, n } = circles[ci];
    // in-plane basis from the normal (any two orthonormal in-plane vectors)
    let a = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const e1 = [a[1] * n[2] - a[2] * n[1], a[2] * n[0] - a[0] * n[2], a[0] * n[1] - a[1] * n[0]];
    const el = Math.hypot(e1[0], e1[1], e1[2]);
    e1[0] /= el; e1[1] /= el; e1[2] /= el;
    const e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]];
    return [c[0] + R0 * (Math.cos(t) * e1[0] + Math.sin(t) * e2[0]), c[1] + R0 * (Math.cos(t) * e1[1] + Math.sin(t) * e2[1]), c[2] + R0 * (Math.cos(t) * e1[2] + Math.sin(t) * e2[2])];
};
const distToCircle = (p: number[], ci: number): number => {
    const { c, n } = circles[ci];
    const v = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    const h = v[0] * n[0] + v[1] * n[1] + v[2] * n[2];
    const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    const radial = Math.sqrt(Math.max(0, vv - h * h));
    return Math.hypot(h, radial - R0);
};

// ---- (a) sha + nodes + materials -----------------------------------------------------------------
ck("pinned sha", sha === "c8a54b6aa5992af8ac606706879318ca15697e4e8f28a2cff2402270a2f208a1", sha.slice(0, 16));
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 4", meshNodes.length === 4, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_vc_1");
ck("KEEP glow_vc_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes vc_stone+vc_brass+vc_slab", ["vc_stone", "vc_brass", "vc_slab"].every(m => matNames.includes(m)), matNames.join(","));
const emats = j.materials.filter((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
ck("exactly one emissive material", emats.length === 1);
const lin = (b: number) => { const c = b / 255; return Math.round(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 * 10000) / 10000; };
const wantE = [lin(0x9a), lin(0x70), lin(0x30)].map((v: number) => Math.round(v * 0.85 * 10000) / 10000);
if (emats.length === 1) {
    const e = emats[0].emissiveFactor as number[];
    ck("bead emissive linear 0x9a7030@0.85", e.every((v, i) => Math.abs(v - wantE[i]) < 0.002), `${e.join(",")} vs ${wantE.join(",")}`);
}

// ---- bucket vertices by material -----------------------------------------------------------------
type Cloud = { name: string; v: Float32Array };
const clouds: Cloud[] = [];
for (const nd of meshNodes) {
    for (const p of j.meshes[nd.mesh].primitives) {
        const mat = j.materials[p.material ?? 0];
        const pos = va(p.attributes.POSITION);
        let name = mat?.name ?? "plain";
        if ((mat?.emissiveFactor ?? []).some((v: number) => v > 0.02)) name = "GLOW";
        let c = clouds.find(x => x.name === name);
        if (!c) { c = { name, v: new Float32Array(0) }; clouds.push(c); }
        const merged = new Float32Array(c.v.length + pos.length);
        merged.set(c.v); merged.set(pos, c.v.length);
        c.v = merged;
    }
    const t = nd.translation ?? [0, 0, 0];
    if (t.some((x: number) => Math.abs(x) > 1e-9)) {
        const c = clouds[clouds.length - 1];
        for (let i = 0; i < c.v.length; i += 3) { c.v[i] += t[0]; c.v[i + 1] += t[1]; c.v[i + 2] += t[2]; }
    }
}
const byName = (n: string) => clouds.find(c => c.name === n);

// ---- (b) stone law: torus equation ----------------------------------------------------------------
{
    const stone = byName("vc_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let off = 0, worst = 0;
        const n = stone.v.length / 3;
        for (let i = 0; i < stone.v.length; i += 3) {
            const x = stone.v[i], y = stone.v[i + 1] - LIFT, z = stone.v[i + 2];
            const v = Math.hypot(x, y);
            const resid = (v - R0) * (v - R0) + z * z - r0 * r0;
            worst = Math.max(worst, Math.abs(resid));
            if (Math.abs(resid) > 1e-4) off++;
        }
        ck("stone law: torus equation holds (worst resid)", off === 0, `${off}/${n} off, worst ${worst.toExponential(1)} (m²)`);
    }
}

// ---- (c) hoop law: on-tube + coverage --------------------------------------------------------------
{
    const brass = byName("vc_brass");
    ck("brass cloud present", !!brass);
    if (brass) {
        let off = 0, worst = 0;
        for (let i = 0; i < brass.v.length; i += 3) {
            const p = [brass.v[i], brass.v[i + 1] - LIFT, brass.v[i + 2]];   // world -> torus frame (y lift)
            let best = Infinity;
            for (let ci = 0; ci < 10; ci++) best = Math.min(best, distToCircle(p, ci));
            worst = Math.max(worst, best);
            if (best > HOOP_R + 0.003) off++;
        }
        const n = brass.v.length / 3;
        ck("hoop law: verts within HOOP_R+3mm of a replica circle", off === 0, `${off}/${n} off, worst ${worst.toFixed(4)}m`);
        // coverage: every 8th replica sample finds a brass vertex within 0.10
        let missed = 0, total = 0;
        for (let ci = 0; ci < 10; ci++) {
            for (let s = 0; s < 96; s += 8) {
                total++;
                const q = hoopPt(ci, (s / 96) * 2 * Math.PI);
                const qw = [q[0], q[1] + LIFT, q[2]];                        // torus frame -> world
                let best = Infinity;
                for (let i = 0; i < brass.v.length; i += 3) {
                    const d = Math.hypot(brass.v[i] - qw[0], brass.v[i + 1] - qw[1], brass.v[i + 2] - qw[2]);
                    if (d < best) best = d;
                    if (best < 0.10) break;
                }
                if (best > 0.10) missed++;
            }
        }
        ck("hoop coverage: replica samples all covered", missed === 0, `${missed}/${total} uncovered`);
    }
}

// ---- (d) bead law ----------------------------------------------------------------------------------
{
    const glow = byName("GLOW");
    ck("glow cloud present", !!glow);
    if (glow && glow.v.length === 3) {
        const d = Math.hypot(glow.v[0] - 0, glow.v[1] - (0.5 + LIFT), glow.v[2] - 0.5);
        ck("bead at φ=0 pair crossing (0, .5+LIFT, .5)", d < 0.01, `dist ${d.toFixed(4)}m (bead ${glow.v.map((x: number) => x.toFixed(3))} want y ${(0.5 + LIFT).toFixed(3)})`);
    }
}

// ---- (e) slab law -----------------------------------------------------------------------------------
{
    const slab = byName("vc_slab");
    ck("slab cloud present", !!slab);
    if (slab) {
        let below = 0, xs = 0, zs = 0;
        for (let i = 0; i < slab.v.length; i += 3) {
            if (slab.v[i + 1] < -1e-3) below++;
            xs = Math.max(xs, Math.abs(slab.v[i]));
            zs = Math.max(zs, Math.abs(slab.v[i + 2]));
        }
        ck("slab on grade", below === 0, `${below} below`);
        ck("slab plan 2.6 x 2.2", Math.abs(2 * xs - 2.6) < 0.01 && Math.abs(2 * zs - 2.2) < 0.01, `${(2 * xs).toFixed(2)}x${(2 * zs).toFixed(2)}`);
    }
}

// ---- (f) envelope + NaN ------------------------------------------------------------------------------
{
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity], nan = 0;
    for (const c of clouds) for (let i = 0; i < c.v.length; i += 3) {
        for (let d = 0; d < 3; d++) {
            const val = c.v[i + d];
            if (isNaN(val)) nan++;
            mn[d] = Math.min(mn[d], val); mx[d] = Math.max(mx[d], val);
        }
    }
    const sz = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
    ck("envelope 3.48 x 3.47 x 2.20", Math.abs(sz[0] - 3.48) < 0.01 && Math.abs(sz[1] - 3.47) < 0.01 && Math.abs(sz[2] - 2.20) < 0.01, `${sz.map((v) => v.toFixed(2)).join(" x ")}`);
    ck("x/z centered", Math.abs((mn[0] + mx[0]) / 2) < 0.01 && Math.abs((mn[2] + mx[2]) / 2) < 0.01, `cx ${((mn[0] + mx[0]) / 2).toFixed(3)} cz ${((mn[2] + mx[2]) / 2).toFixed(3)}`);
    ck("no NaN vertices", nan === 0, `${nan}`);
}

console.log(f === 0 ? "ALL PASS" : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
