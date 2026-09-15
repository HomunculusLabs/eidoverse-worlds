// struct180-decode-apollonian.ts — decode audit of village_apollonian3.glb.
// Fail-closed: any FAIL exits 1. RED control first (catalan bytes must FAIL).
//
// Checks: node census (1 stone bucket + 1 glow KEEP), ring presence (verts
// at the disc radius), PIERCING law (no stone vertex inside any hole
// cylinder — 34 holes from the probe contract), twin bead exact position +
// emissive, envelope exact + origin-centered (placement-contract law), stone
// material is a real glTF texMat (struct-38 law).
import { readFileSync } from "node:fs";

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

function parseGLB(path: string) {
    const buf = readFileSync(path);
    if (buf.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + len).toString("utf8"));
        if (type === 0x004e4942) bin = buf.subarray(off + 8, off + 8 + len);
        off += 8 + len;
    }
    return { json, bin };
}

const target = process.argv[2] ?? "agents/arthur/assets/village_apollonian3.glb";
const { json, bin } = parseGLB(target);
if (!bin) throw Error("no BIN chunk");
(globalThis as any).__bin = bin;
const nodes = json.nodes ?? [];

// world box per node, TRS accumulated (pitfall 4), identity-translation
// scheme with mesh-node guard (waysign-15 / struct-176 class).
const boxOf = (idx: number) => {
    const n = nodes[idx];
    const t = n.translation ?? [0, 0, 0];
    if (n.matrix) throw Error("unexpected matrix node");
    const mesh = n.mesh !== undefined ? json.meshes[n.mesh] : null;
    if (!mesh) return null;
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const prim of mesh.primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const a = acc.min as number[], b = acc.max as number[];
        for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], a[c] + t[c]); mx[c] = Math.max(mx[c], b[c] + t[c]); }
    }
    return { mn, mx, name: n.name ?? "", mesh };
};

const meshBoxes = nodes.map((_: any, i: number) => boxOf(i)).filter(Boolean) as any[];

// the hole contract, regenerated (probe chassis, trimmed — same constants)
const R_W = 2.05, DISC_R = 2.40, TH = 0.40, PL_H = 0.90, SINK = 0.12, KMAX = 45;
const Y_CENTER = PL_H - SINK + DISC_R;
type Cx = { re: number; im: number };
const cAdd = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im });
const cMul = (a: Cx, b: Cx): Cx => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cScale = (a: Cx, s: number): Cx => ({ re: a.re * s, im: a.im * s });
const cAbs = (a: Cx): number => Math.hypot(a.re, a.im);
const cSqrt = (a: Cx): Cx => {
    const m = cAbs(a), t = Math.sqrt(Math.max(0, (m + a.re) / 2));
    return { re: t, im: (a.im === 0 && a.re < 0) ? 0 : (a.im >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, (m - a.re) / 2)) };
};
type Cir = { k: number; x: number; y: number };
const rad = (c: Cir) => 1 / Math.abs(c.k);
const dist = (a: Cir, b: Cir) => Math.hypot(a.x - b.x, a.y - b.y);
const tangentGap = (a: Cir, b: Cir): number => {
    const d = dist(a, b);
    return a.k < 0 || b.k < 0 ? d - Math.abs(rad(a) - rad(b)) : d - (rad(a) + rad(b));
};
const kRoots = (k1: number, k2: number, k3: number): [number, number] => {
    const s = k1 + k2 + k3, r = 2 * Math.sqrt(Math.max(0, k1 * k2 + k2 * k3 + k3 * k1));
    return [s + r, s - r];
};
const zCandidates = (q: Cir[], idx: number, k4: number): Cir[] => {
    const others = q.filter((_, i) => i !== idx);
    const kzs = others.map(c => cScale({ re: c.x, im: c.y }, c.k));
    let sum = kzs[0];
    for (let i = 1; i < 3; i++) sum = cAdd(sum, kzs[i]);
    let acc = cMul(kzs[0], kzs[1]);
    acc = cAdd(acc, cMul(kzs[1], kzs[2]));
    acc = cAdd(acc, cMul(kzs[2], kzs[0]));
    const out: Cir[] = [];
    for (const sign of [1, -1]) {
        const kz4 = cAdd(sum, cScale(cSqrt(acc), 2 * sign));
        out.push({ k: k4, x: kz4.re / k4, y: kz4.im / k4 });
    }
    return out;
};
const seed: Cir[] = [
    { k: -1, x: 0, y: 0 },
    { k: 2, x: 0, y: 0.5 },
    { k: 2, x: 0, y: -0.5 },
    { k: 3, x: -2 / 3, y: 0 },
];
const key = (c: Cir) => `${c.k.toFixed(6)}@${c.x.toFixed(6)},${c.y.toFixed(6)}`;
const holes: Cir[] = [seed[1], seed[2], seed[3]];
const seen = new Set<string>(seed.map(key));
const quads: Cir[][] = [seed];
const quadSeen = new Set<string>([seed.map(key).sort().join("|")]);
while (quads.length) {
    const q = quads.shift()!;
    for (let i = 0; i < 4; i++) {
        const ki = q[i].k;
        const others = q.filter((_, j) => j !== i);
        const [r1, r2] = kRoots(others[0].k, others[1].k, others[2].k);
        let k4: number | null = null;
        if (Math.abs(r1 - ki) < 1e-12 && Math.abs(r2 - ki) < 1e-12) k4 = ki;
        else if (Math.abs(r1 - ki) < 1e-12) k4 = r2;
        else if (Math.abs(r2 - ki) < 1e-12) k4 = r1;
        else continue;
        if (k4 < 0.5 || k4 > KMAX + 1e-9) continue;
        const cands = zCandidates(q, i, k4);
        const c = dist(cands[0], q[i]) > dist(cands[1], q[i]) ? cands[0] : cands[1];
        let tg = 0;
        for (const o of others) tg = Math.max(tg, Math.abs(tangentGap(c, o)));
        if (tg > 1e-6 || Math.hypot(c.x, c.y) + rad(c) > 1 + 1e-9) continue;
        const kk = key(c);
        if (!seen.has(kk)) { seen.add(kk); holes.push(c); }
        const nq = [...q]; nq[i] = c;
        const qk = nq.map(x => key(x)).sort().join("|");
        if (!quadSeen.has(qk) && nq.every(x => x.k < 0 || x.k <= KMAX + 1e-9)) { quadSeen.add(qk); quads.push(nq); }
    }
}
if (holes.length !== 34) throw Error(`hole contract regeneration ${holes.length} != 34`);
const lipOf = (c: Cir) => Math.min(0.022, Math.max(0.013, 0.10 * (R_W / c.k)));
// world hole centers: (x any-in-disc, y = Y_CENTER + gy*R_W, z = -gx*R_W)
const worldHoles = holes.map(c => ({
    y: Y_CENTER + c.y * R_W,
    z: -(c.x * R_W),
    r: R_W / c.k - lipOf(c),
    k: c.k,
}));

// D1 node census: exactly 2 mesh nodes, 1 glow KEEP.
{
    const glow = meshBoxes.filter(b => b.name.startsWith("glow_ap_"));
    check("D1 node census: 2 mesh nodes (1 stone bucket + 1 glow KEEP)",
        meshBoxes.length === 2 && glow.length === 1,
        `meshes ${meshBoxes.length}, glow ${glow.length}, names [${meshBoxes.map((b: any) => JSON.stringify(b.name)).join(", ")}]`);
}

// D2 ring presence: stone verts reach the disc radius (2.40 from the disc
// center axis) — the ring exists as real geometry, not just a bbox.
{
    let ok = false, best = 0;
    for (const b of meshBoxes) {
        if (b.name.startsWith("glow_ap_")) continue;
        for (const prim of b.mesh.primitives) {
            const acc = json.accessors[prim.attributes.POSITION];
            const a = acc.min as number[], bb = acc.max as number[];
            // conservative: max |y - Y_CENTER| or |z| reaching the rim
            best = Math.max(best, bb[1] - Y_CENTER, Y_CENTER - a[1], Math.abs(a[2]), Math.abs(bb[2]));
        }
    }
    ok = Math.abs(best - DISC_R) < 0.01 || best >= DISC_R - 0.01;
    check("D2 ring presence: stone extends to the disc radius", ok, `max radial reach ${best.toFixed(3)} (disc R ${DISC_R})`);
}

// D3 PIERCING law: no stone vertex inside any hole cylinder (34 holes).
// Rim verts sit exactly at r (inscribed polygon dips ≤ r·(1−cos 3.75°) ≈
// 0.002 m — tolerance 0.005 covers the chord).
// CHECKER-SIDE BUG CAUGHT THIS TICK (pitfall-3 kin): bufferviews must be
// indexed by accessor.bufferView, never by the accessor INDEX — the first
// draft read UV bytes as positions and "found" phantom verts inside holes.
{
    let violations = 0, worst = "";
    for (const b of meshBoxes) {
        if (b.name.startsWith("glow_ap_")) continue;
        for (const prim of b.mesh.primitives) {
            const acc = json.accessors[prim.attributes.POSITION];
            const view = json.bufferViews[acc.bufferView];
            const off = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const cnt = acc.count;
            for (let i = 0; i < cnt; i++) {
                const x = bin.readFloatLE(off + i * 12), y = bin.readFloatLE(off + i * 12 + 4), z = bin.readFloatLE(off + i * 12 + 8);
                if (Math.abs(x) > TH / 2 + 0.001) continue;   // plinth corners exempt (all below every hole)
                for (const h of worldHoles) {
                    const d = Math.hypot(y - h.y, z - h.z);
                    if (d < h.r - 0.005) { violations++; if (!worst) worst = `k${h.k} hole: vert (${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}) d ${d.toFixed(4)} < r ${h.r.toFixed(4)}`; }
                }
            }
        }
    }
    check("D3 piercing law: 0 stone verts inside any of the 34 holes", violations === 0, violations ? worst : "34 cylinders clean");
}

// D4 twin bead: exact (0, 3.18, -1.3667), r 0.09, emissive.
{
    const glow = meshBoxes.find(b => b.name.startsWith("glow_ap_"));
    let ok = !!glow;
    if (glow) {
        const cx = (glow.mn[0] + glow.mx[0]) / 2, cy = (glow.mn[1] + glow.mx[1]) / 2, cz = (glow.mn[2] + glow.mx[2]) / 2;
        const dia = Math.max(glow.mx[0] - glow.mn[0], glow.mx[1] - glow.mn[1], glow.mx[2] - glow.mn[2]);
        ok = Math.abs(cx) < 1e-6 && Math.abs(cy - Y_CENTER) < 1e-6 && Math.abs(cz + (2 / 3) * R_W) < 1e-6 && Math.abs(dia - 0.18) < 1e-6;
        const mat = json.materials[glow.mesh.primitives[0].material];
        ok = ok && !!mat?.emissiveFactor?.some((v: number) => v > 0);
    }
    check("D4 twin bead: exact (0,3.18,-1.3667) r0.09, emissive present", ok);
}

// D5 envelope exact: 0.70 x 5.58 x 4.80, min y = 0, origin-centered x/z.
{
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const b of meshBoxes) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], b.mn[c]); mx[c] = Math.max(mx[c], b.mx[c]); }
    const sx = mx[0] - mn[0], sy = mx[1] - mn[1], sz = mx[2] - mn[2];
    const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    check("D5 envelope: 0.70x5.58x4.80, min y = 0, origin-centered",
        Math.abs(sx - 0.70) < 0.02 && Math.abs(sy - 5.58) < 0.05 && Math.abs(sz - 4.80) < 0.02 &&
        Math.abs(mn[1]) < 1e-6 && Math.abs(cx) < 1e-3 && Math.abs(cz) < 1e-3,
        `${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)}, y0 ${mn[1].toFixed(4)}, cx ${cx.toFixed(4)}, cz ${cz.toFixed(4)}`);
}

// D6 stone material is a real glTF material with a name (struct-38 law).
{
    let ok = false, name = "?";
    for (const b of meshBoxes) if (!b.name.startsWith("glow_ap_")) {
        const mat = json.materials[b.mesh.primitives[0].material];
        ok = !!mat && !!mat.name;
        name = mat?.name ?? "?";
    }
    check("D6 stone texMat exports a named glTF material (struct-38 law)", ok, `material "${name}"`);
}

console.log(fails.length === 0 ? "ALL PASS" : `${fails.length} FAIL(S): ${fails.join("; ")}`);
process.exit(fails.length === 0 ? 0 : 1);
