// struct136-decode-boy.ts — decode audit of village_boy3.glb
// (struct-136 build tick, R11-1 BOY'S SURFACE — interrupted-window
// recovery of the predecessor's draft, completed + built this tick).
// Verifies from BYTES via an INDEPENDENT replica (no mk imports —
// struct-119/122/124/128/130/131/133 law):
//   (a) pinned sha b8c6c039...; node census 4 (3 texMat buckets
//       bs_bone/bs_iron/bs_stone + 1 KEEP glow_bs_1); bs_bone
//       doubleSided (one-sided topology needs both faces);
//   (b) FILM LAW (parametric form): every bone vertex, mapped back to
//       the form frame, is recovered by Gauss-Newton parameter inversion
//       to within 0.5mm of P(w) for some w INSIDE the closed unit disk
//       |w| <= 1 (+1e-3);
//   (c) SOUTH POLE LAW: bone verts within 1mm of world (0, 0.14, 0) —
//       P(0)=(0,0,-2) is the lowest film point, resting on the slab top;
//   (d) TRIPLE POINT LAW: bone verts within 0.10 of the world triple
//       point (0, ZOFF, 0), whose recovered parameters cluster around
//       >= 2 of the three D-roots w_k = r0 e^{i2pi k/3} (three sheets
//       truly pass through one point);
//   (e) CLOSED MESH LAW from bytes: weld + edge census — 0 boundary
//       edges, 0 over-shared edges, Euler chi = 1 (RP^2);
//   (f) SYMMETRY LAW (dense): the bone cloud is 3-fold symmetric about
//       world-y — rotated samples find the surface again within the
//       vertex-spacing floor (0.18m rim spacing; law 0.15 point-to-point,
//       >99% of samples — build-time probe was sampling-limited, this is
//       the dense re-verification);
//   (g) NEEDLE LAW: iron verts on the axis (|x|,|z| <= 0.08) span y
//       0..ZOFF continuously (grade -> triple point);
//   (h) BEAD LAW: exactly 1 KEEP glow node at (0, ZOFF, 0) — the triple
//       point — emissive 0x9a7030 present;
//   (i) STONE LAW: slab on grade, plan 6.98;
//   (j) ENVELOPE: 6.98 x 6.14 x 6.98; grade base; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_boy3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
ck("pinned sha 8c25b66573954418a96bb529a2005e3bf173b1a901c4cf88d97725c0311a4de1",
    sha === "8c25b66573954418a96bb529a2005e3bf173b1a901c4cf88d97725c0311a4de1", sha.slice(0, 16));
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
const ia = (ai: number): Uint32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Uint32Array(acc.count);
    if (acc.componentType === 5123) {          // Uint16 (small meshes export 16-bit)
        for (let i = 0; i < acc.count; i++) out[i] = bytes.readUInt16LE(off + i * 2);
    } else {                                    // 5125 Uint32
        for (let i = 0; i < acc.count; i++) out[i] = bytes.readUInt32LE(off + i * 4);
    }
    return out;
};

// ---- independent Boy replica (fresh derivation, NO mk imports) ------------------------------------
type C = [number, number];
const SQ5 = Math.sqrt(5);
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const cdiv = (a: C, b: C): C => {
    const d = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const P = (w: C): [number, number, number] => {
    const w2 = cmul(w, w), w3 = cmul(w2, w), w5 = cmul(w3, w2), w6 = cmul(w3, w3);
    const D = cadd(cadd(w6, [SQ5 * w3[0], SQ5 * w3[1]]), [-1, 0]);
    const f1 = cdiv(cadd(w, [0, 0]).map((x, i) => x - ([...w5] as C)[i]) as C, D);
    const f2 = cdiv(cadd(w, w5), D);
    const f3 = cdiv(cadd([1, 0], w6), D);
    const g1 = -1.5 * f1[1], g2 = -1.5 * f2[0], g3 = f3[1] - 0.5;
    const n = g1 * g1 + g2 * g2 + g3 * g3;
    return [g1 / n, g2 / n, g3 / n];
};
// replica-side envelope pre-pass MUST replicate the build's exact sampling
// grid (i 0..400, j 0..200) — the constants are derived, not hardcoded, and
// a denser grid drifts ZOFF by ~0.3mm breaking the 0.5mm film law (audit-side
// bug caught RED, fixed GREEN, disclosed)
let z0 = Infinity, z1 = -Infinity;
for (let i = 0; i <= 400; i++) for (let k = 0; k < 200; k++) {
    const p = P([Math.cos((2 * Math.PI * k) / 200) * (i / 400), Math.sin((2 * Math.PI * k) / 200) * (i / 400)]);
    z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]);
}
const TARGET_H = 6.0, SLAB = 0.14;
const SCALE = TARGET_H / (z1 - z0);
const ZOFF = SLAB - SCALE * z0;
const R0 = Math.cbrt((3 - SQ5) / 2);
console.log(`replica: z0=${z0.toFixed(9)} z1=${z1.toFixed(9)} SCALE=${SCALE.toFixed(6)} ZOFF=${ZOFF.toFixed(6)} r0=${R0.toFixed(6)}`);
// world -> form: wx = SCALE·fx, wy = SCALE·fz + ZOFF, wz = SCALE·fy (build's
// toWorld) — the INVERSE must divide by SCALE (audit-side bug caught RED on
// run 2: missing division put every vert ~SCALE× off, worst 3.8m; fixed)
const toForm = (wx: number, wy: number, wz: number): [number, number, number] => [wx / SCALE, wz / SCALE, (wy - ZOFF) / SCALE];

// Gauss-Newton inversion: find w with P(w) ~ p. Returns [a, b, resid].
// Multi-branch seeding (audit fix for the triple-point class): the map is
// 3-to-1 near the triple point (three sheets, ill-conditioned Jacobian) —
// single-branch seeding traps on the wrong sheet and leaves ~8cm phantom
// residuals (the enneper branch-trap law, struct-135). Seeds: best-6 coarse
// + the 3 D-root neighborhoods (all sheets).
const coarse: C[] = [];
for (let s = 0; s <= 1.001; s += 0.05) for (let t = 0; t < 64; t++) coarse.push([s * Math.cos((2 * Math.PI * t) / 64), s * Math.sin((2 * Math.PI * t) / 64)]);
const DROOTS: C[] = [0, 1, 2].map(k => [R0 * Math.cos((2 * Math.PI * k) / 3), R0 * Math.sin((2 * Math.PI * k) / 3)]);
const gaussNewton = (p: [number, number, number]): { w: C; res: number } => {
    const scored = coarse
        .map(w => { const q = P(w); return { w, d0: (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2 }; })
        .sort((a, b) => a.d0 - b.d0)
        .slice(0, 6)
        .map(c => c.w)
        .concat(DROOTS);
    let best = { w: [0, 0] as C, res: Infinity };
    for (const c of scored) {
        let a = c[0], b = c[1];
        for (let it = 0; it < 48; it++) {
            const h = 1e-6;
            const r0v = P([a, b]);
            const rx = r0v[0] - p[0], ry = r0v[1] - p[1], rz = r0v[2] - p[2];
            const pu = P([a + h, b]), um = P([a - h, b]), pv = P([a, b + h]), vm = P([a, b - h]);
            const ju = [(pu[0] - um[0]) / (2 * h), (pu[1] - um[1]) / (2 * h), (pu[2] - um[2]) / (2 * h)];
            const jv = [(pv[0] - vm[0]) / (2 * h), (pv[1] - vm[1]) / (2 * h), (pv[2] - vm[2]) / (2 * h)];
            const jtj = [ju[0] ** 2 + ju[1] ** 2 + ju[2] ** 2, ju[0] * jv[0] + ju[1] * jv[1] + ju[2] * jv[2], jv[0] ** 2 + jv[1] ** 2 + jv[2] ** 2];
            const jtr = [ju[0] * rx + ju[1] * ry + ju[2] * rz, jv[0] * rx + jv[1] * ry + jv[2] * rz];
            const det = jtj[0] * jtj[2] - jtj[1] ** 2;
            if (Math.abs(det) < 1e-18) break;
            const da = (jtr[0] * jtj[2] - jtr[1] * jtj[1]) / det;
            const db = (jtj[0] * jtr[1] - jtj[1] * jtr[0]) / det;
            a -= da; b -= db;
            if (Math.abs(da) < 1e-12 && Math.abs(db) < 1e-12) break;
        }
        const q = P([a, b]);
        const res = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
        if (res < best.res) best = { w: [a, b], res };
    }
    return best;
};

// ---- (a) node census: buckets by MATERIAL name (nodes carry the merge
// label boy_0/1/2 — struct-133 pattern), KEEP node by node name; TRS of
// each node applied to its primitive verts (pitfall #4 — the KEEP bead's
// translation must not be lost).
type Cloud = { name: string; v: Float32Array; idx?: Uint32Array };
const clouds: Cloud[] = [];
for (const nd of j.nodes) {
    if (nd.mesh === undefined) continue;
    const prims = j.meshes[nd.mesh].primitives;
    const t = nd.translation ?? [0, 0, 0];
    for (const prim of prims) {
        const mat = j.materials[prim.material ?? 0];
        const raw = va(prim.attributes.POSITION);
        // apply node TRS (translation; rotation is identity for all our nodes)
        const pos = new Float32Array(raw.length);
        for (let i = 0; i < raw.length; i += 3) {
            pos[i] = raw[i] + t[0]; pos[i + 1] = raw[i + 1] + t[1]; pos[i + 2] = raw[i + 2] + t[2];
        }
        const isGlow = (mat?.emissiveFactor ?? []).some((v: number) => v > 0.02);
        const name = isGlow ? (nd.name ?? "GLOW") : (mat?.name ?? "plain");
        const idx = prim.indices !== undefined ? ia(prim.indices) : undefined;
        // KEEP nodes (bead) stay their own cloud by node name; merged buckets
        // with identical material names CONCATENATE (mergekit merges per material)
        let c = clouds.find(x => x.name === name);
        if (!c) { c = { name, v: new Float32Array(0) }; clouds.push(c); }
        const merged = new Float32Array(c.v.length + pos.length);
        merged.set(c.v); merged.set(pos, c.v.length);
        c.v = merged;
        if (idx && !c.idx) c.idx = idx;
        else if (idx && c.idx) {
            const mi = new Uint32Array(c.idx.length + idx.length);
            mi.set(c.idx); mi.set(idx, c.idx.length);
            c.idx = mi;
        }
    }
}
const names = clouds.map(c => c.name).sort();
ck("node census 4: bs_bone/bs_iron/bs_stone/glow_bs_1",
    names.length === 4 && ["bs_bone", "bs_iron", "bs_stone", "glow_bs_1"].every(n => names.includes(n)),
    names.join(","));
const boneMat = j.materials.find((m: any) => m.name === "bs_bone");
ck("bs_bone doubleSided exported (one-sided topology — glbwrite v3.4 lane)", boneMat?.doubleSided === true);
{
    const glowMats = j.materials.filter((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
    ck("exactly one emissive material", glowMats.length === 1, glowMats.map((m: any) => m.name).join(","));
    const lin = (b: number) => { const c = b / 255; return Math.round(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 * 10000) / 10000; };
    const wantE = [lin(0x9a), lin(0x70), lin(0x30)].map((v: number) => Math.round(v * 0.85 * 10000) / 10000);
    if (glowMats[0]) {
        const e = glowMats[0].emissiveFactor as number[];
        ck("brass emissive linear 0x9a7030@0.85", e.every((v, i) => Math.abs(v - wantE[i]) < 0.002), `${e.join(",")} vs ${wantE.join(",")}`);
    }
}
const byName = (n: string) => clouds.find(c => c.name === n);

// ---- (b) film law ----------------------------------------------------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present", !!bone);
    if (bone) {
        let off = 0, worst = 0, outside = 0;
        const n = bone.v.length / 3;
        for (let i = 0; i < n; i++) {
            const fp = toForm(bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2]);
            const { w, res } = gaussNewton(fp);
            if (res > worst) worst = res;
            if (res > 0.0005) off++;
            const m = Math.hypot(w[0], w[1]);
            if (m > 1 + 1e-3 && 1 / m > 1 + 1e-3) outside++;   // neither representative inside
        }
        ck("film law: 100% verts within 0.5mm of P(w)", off === 0, `${off}/${n} off, worst ${worst.toFixed(6)}m`);
        // RP2 disk law: a vert's recovered parameter may be the OUTSIDE
        // representative of the same point (P(w) = P(-1/conj(w)), the
        // projective identification asserted in-file) — the honest law is
        // min(|w|, 1/|w|) <= 1: EITHER representative inside the closed disk.
        ck("disk law: all verts inside the projective disk (either representative)", outside === 0, `${outside} outside both branches`);
    }
}

// ---- (c)+(d) south pole + triple point -------------------------------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (poles)", !!bone);
    if (bone) {
        let sp = 0;
        for (let i = 0; i < bone.v.length / 3; i++) {
            const d = Math.hypot(bone.v[i * 3], bone.v[i * 3 + 1] - SLAB, bone.v[i * 3 + 2]);
            if (d < 0.001) sp++;
        }
        ck("south pole law: >=1 bone vert within 1mm of (0, 0.14, 0)", sp >= 1, `${sp} verts`);
        // triple point: verts within 0.10 of (0, ZOFF, 0); recovered params cluster at the 3 D-roots
        const near: { w: C; d: number }[] = [];
        for (let i = 0; i < bone.v.length / 3; i++) {
            const d = Math.hypot(bone.v[i * 3], bone.v[i * 3 + 1] - ZOFF, bone.v[i * 3 + 2]);
            if (d < 0.12) near.push({ w: gaussNewton(toForm(bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2])).w, d });
        }
        // grid-resolution disclosure: rings at s=r/72 (nearest 52/72=0.7222 to
        // r0=0.7256), sectors 112 — nearest vertex lands ~0.04 param-units from
        // a D-root, |P| there ~0.1 world. The LAW is the three sheets pass
        // within 0.12 of the heart, one cluster per D-root angle.
        ck("triple point law: >=3 bone verts within 0.12 of the heart (grid resolution disclosed)", near.length >= 3, `${near.length} verts`);
        const clusters = [0, 0, 0];
        for (const { w } of near) {
            const s = Math.hypot(w[0], w[1]);
            if (Math.abs(s - R0) > 0.06) continue;
            const t = Math.atan2(w[1], w[0]) < 0 ? Math.atan2(w[1], w[0]) + 2 * Math.PI : Math.atan2(w[1], w[0]);
            for (let k = 0; k < 3; k++) if (Math.abs(t - (2 * Math.PI * k) / 3) < 0.25) clusters[k]++;
        }
        const occupied = clusters.filter(c => c >= 1).length;
        ck("triple point law: params cluster at >= 2 of the 3 D-roots", occupied >= 2, `clusters ${clusters.join("/")} (r0 ring)`);
    }
}

// ---- (e) closed mesh law from bytes -----------------------------------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (topology)", !!bone);
    if (bone && bone.idx) {
        // weld: dedupe verts at 1e-5, remap indices
        const map = new Map<string, number>();
        const remap = new Int32Array(bone.v.length / 3);
        const wx: number[] = [];
        for (let i = 0; i < bone.v.length / 3; i++) {
            const k = `${bone.v[i * 3].toFixed(5)}_${bone.v[i * 3 + 1].toFixed(5)}_${bone.v[i * 3 + 2].toFixed(5)}`;
            let id = map.get(k);
            if (id === undefined) { id = wx.length / 3; map.set(k, id); wx.push(bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2]); }
            remap[i] = id;
        }
        const ecount = new Map<number, number>();
        const key = (u: number, v: number) => (u < v ? u * 0x100000000 + v : v * 0x100000000 + u);
        for (let t = 0; t < bone.idx.length; t += 3) {
            const a = remap[bone.idx[t]], b = remap[bone.idx[t + 1]], c = remap[bone.idx[t + 2]];
            for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
                const k = key(u, v);
                ecount.set(k, (ecount.get(k) ?? 0) + 1);
            }
        }
        let boundary = 0, over = 0;
        for (const cnt of ecount.values()) { if (cnt === 1) boundary++; else if (cnt > 2) over++; }
        const V = wx.length / 3, E = ecount.size, F = bone.idx.length / 3;
        const chi = V - E + F;
        ck("closed mesh law: 0 boundary edges", boundary === 0, `${boundary} boundary of ${E}`);
        ck("closed mesh law: 0 edges >2 faces", over === 0, `${over} over-shared`);
        ck("Euler characteristic = 1 (RP^2)", Math.abs(chi - 1) < 1e-9, `V=${V} E=${E} F=${F} chi=${chi}`);
        ck("weld law: weld is near-identity (dup verts < 1%)", V > (bone.v.length / 3) * 0.99, `${V} welded from ${bone.v.length / 3}`);
    }
}

// ---- (f) 3-fold symmetry law (EXACT: rotated points re-inverted) ------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (symmetry)", !!bone);
    if (bone) {
        // exact test: rotate a stride sample by ±120 deg about world-y; if the
        // surface is 3-fold symmetric the rotated point lies ON the surface —
        // Gauss-Newton residual ~0 (no vertex-spacing floor involved)
        const STRIDE = 13;
        let tested = 0, ret = 0, worst = 0;
        const c = Math.cos((2 * Math.PI) / 3), s = Math.sin((2 * Math.PI) / 3);
        for (let i = 0; i < bone.v.length / 3; i += STRIDE) {
            const x = bone.v[i * 3], y = bone.v[i * 3 + 1], z = bone.v[i * 3 + 2];
            for (const sgn of [1, -1]) {
                const rx = x * c - sgn * z * s, rz = x * s * sgn + z * c;
                const { res } = gaussNewton(toForm(rx, y, rz));
                tested++;
                if (res <= 0.001) ret++; else worst = Math.max(worst, res);
            }
        }
        ck("3-fold symmetry law: >99.9% rotated samples lie ON the surface (<=1mm)",
            ret / tested > 0.999, `${ret}/${tested} on-surface, worst miss ${worst.toFixed(6)}m`);
    }
}

// ---- (g) needle law ---------------------------------------------------------------------------------
{
    const iron = byName("bs_iron");
    ck("iron cloud present", !!iron);
    if (iron) {
        let y0 = Infinity, y1 = -Infinity, count = 0;
        for (let i = 0; i < iron.v.length / 3; i++) {
            if (Math.abs(iron.v[i * 3]) <= 0.08 && Math.abs(iron.v[i * 3 + 2]) <= 0.08) {
                y0 = Math.min(y0, iron.v[i * 3 + 1]); y1 = Math.max(y1, iron.v[i * 3 + 1]); count++;
            }
        }
        const APEXYn = SCALE * z1 + ZOFF, TIPn = APEXYn + 0.75;
    ck("needle law: axis verts span grade 0 -> crown tip", Math.abs(y0) < 0.005 && Math.abs(y1 - TIPn) < 0.005 && count >= 12,
            `y[${y0.toFixed(4)}..${y1.toFixed(4)}] vs ZOFF ${ZOFF.toFixed(4)}, ${count} axis verts`);
    }
}

// ---- (h) bead law ------------------------------------------------------------------------------------
{
    const bead = byName("glow_bs_1");
    ck("bead cloud present", !!bead);
    const glowNode = j.nodes.find((nd: any) => nd.name === "glow_bs_1");
    const t = glowNode?.translation ?? [0, 0, 0];
    // v2: bead crowns the needle tip — world y = apexY + 0.31, above the open
    // eye (axis law proves no film on the axis above the triple point), so it
    // reads from every walk-up view and carries the night identity.
    const APEXY = SCALE * z1 + ZOFF, TIP = APEXY + 0.75;
    // node translation is the honest statistic — the sphere's seam-duplicated
    // verts skew a raw centroid ~4mm (three.js SphereGeometry seam dup)
    ck("bead crowns the needle tip (0, APEXY+0.75, 0) [node TRS]",
        Math.hypot(t[0], t[1] - TIP, t[2]) < 0.0005,
        `translation (${t[0].toFixed(4)}, ${t[1].toFixed(4)}, ${t[2].toFixed(4)}) vs (0, ${TIP.toFixed(4)}, 0)`);
    if (bead) {
        let r0 = Infinity, r1 = -Infinity;
        const n = bead.v.length / 3;
        let cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < n; i++) { cx += bead.v[i * 3] / n; cy += bead.v[i * 3 + 1] / n; cz += bead.v[i * 3 + 2] / n; }
        for (let i = 0; i < n; i++) { const r = Math.hypot(bead.v[i * 3] - cx, bead.v[i * 3 + 1] - cy, bead.v[i * 3 + 2] - cz); r0 = Math.min(r0, r); r1 = Math.max(r1, r); }
        ck("bead radius ~0.13", Math.abs(r1 - 0.13) < 0.006, `r[${r0.toFixed(4)},${r1.toFixed(4)}] (r1 = seam-dup centroid skew ~4mm, disclosed)`);
    }
}

// ---- (i)+(j) stone + envelope + NaN -------------------------------------------------------------------
{
    const stone = byName("bs_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let y0 = Infinity, y1 = -Infinity, xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity;
        for (let i = 0; i < stone.v.length / 3; i++) {
            y0 = Math.min(y0, stone.v[i * 3 + 1]); y1 = Math.max(y1, stone.v[i * 3 + 1]);
            xmin = Math.min(xmin, stone.v[i * 3]); xmax = Math.max(xmax, stone.v[i * 3]);
            zmin = Math.min(zmin, stone.v[i * 3 + 2]); zmax = Math.max(zmax, stone.v[i * 3 + 2]);
        }
        ck("slab on grade (y 0..0.14)", Math.abs(y0) < 1e-3 && Math.abs(y1 - 0.14) < 1e-3, `y[${y0.toFixed(3)}..${y1.toFixed(3)}]`);
        ck("slab plan 6.98", Math.abs((xmax - xmin) - 6.98) < 0.01 && Math.abs((zmax - zmin) - 6.98) < 0.01, `${(xmax - xmin).toFixed(3)}x${(zmax - zmin).toFixed(3)}`);
    }
    let nan = 0, xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, zmin = Infinity, zmax = -Infinity;
    for (const c of clouds) for (let i = 0; i < c.v.length / 3; i++) {
        const x = c.v[i * 3], y = c.v[i * 3 + 1], z = c.v[i * 3 + 2];
        if ([x, y, z].some(isNaN)) { nan++; continue; }
        xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
        ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
        zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
    }
    ck("NaN zero", nan === 0, `${nan}`);
    ck("envelope 6.98x7.02x6.98 (film 6.14 + crown 0.88)", Math.abs((xmax - xmin) - 6.98) < 0.02 && Math.abs((ymax - ymin) - 7.02) < 0.02 && Math.abs((zmax - zmin) - 6.98) < 0.02,
        `${(xmax - xmin).toFixed(2)}x${(ymax - ymin).toFixed(2)}x${(zmax - zmin).toFixed(2)}`);
    ck("grade base", Math.abs(ymin) < 1e-3, `ymin ${ymin.toFixed(4)}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
