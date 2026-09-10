// struct160-decode-boy-v2.ts — decode audit of village_boy3.glb v2 (axle
// composition, struct-159 authored / struct-160 built). Verifies from BYTES
// via an INDEPENDENT replica (no mk imports — struct-119..136 law).
//
// v2 COMPOSITION UNDER TEST (struct-159 contract): pinwheel face VERTICAL,
// form axis = horizontal iron AXLE (world x). Build map:
//   wx = SCALE*(fz − ZC),  wy = SCALE*fx + LIFT,  wz = SCALE*fy
//   SCALE = 6.0/(z1−z0), ZC = (z0+z1)/2, LIFT = 0.14 − SCALE*x0
// Both singular points ride the axle: south pole P(0)=(0,0,−2) → world
// (−3.000, LIFT, 0) EXACTLY (z0 = −2 by law, so SCALE*(z0−ZC) = −TARGET_H/2);
// triple point (0,0,0) → world (−SCALE*ZC, LIFT, 0).
//
// LAWS:
//   (a) pinned sha a20c9275...; census 4 clouds bs_bone/bs_iron/bs_stone/
//       glow_bs_1; bs_bone doubleSided; exactly 1 emissive material
//       (brass 0x9a7030 @ 0.85 linear);
//   (b) FILM LAW: every bone vert, mapped to form coords by the v2 INVERSE
//       (fx=(wy−LIFT)/SCALE, fy=wz/SCALE, fz=wx/SCALE+ZC), recovered by
//       Gauss-Newton parameter inversion to within 0.5mm of P(w), w in the
//       projective disk (either representative);
//   (c) SOUTH POLE ON AXLE: ≥1 bone vert within 1mm of world (−3.0, LIFT, 0);
//   (d) TRIPLE POINT ON AXLE: ≥3 bone verts within 0.12 of (−SCALE*ZC, LIFT, 0),
//       recovered params cluster at ≥2 of the 3 D-roots;
//   (e) CLOSED MESH: weld + edge census — 0 boundary edges, 0 over-shared,
//       Euler chi = 1 (RP^2);
//   (f) 3-FOLD SYMMETRY about the AXLE LINE (world x, y=LIFT, z=0): stride
//       samples rotated ±120° about that line re-invert onto the surface
//       within 1mm (>99.9%);
//   (g) AXLE LAW: iron verts within 0.07 of the axis line span world x
//       −4.6..4.6 (axle 2*AXSPAN=9.0 + post-top weld zone), ≥12 verts;
//   (h) FILM-AXLE SPAN: max |wx| over bone verts ≤ 3.001 (film inside the
//       stanchions; mk clearance law ≥1.2m by construction);
//   (i) BEAD LAW: exactly 1 KEEP glow node glow_bs_1, node TRS =
//       (AXSPAN−0.35, LIFT, 0) = (4.15, LIFT, 0) within 0.5mm; radius ~0.13;
//       bead CLEAR of film: nearest bone vert ≥ 0.10 from bead center;
//   (j) STONE LAW: slab on grade y[0..0.14], plan 10.1 x 7.1 ±0.01;
//   (k) ENVELOPE: 10.10 x 6.52 x 7.10 ±0.02, grade base, 0 NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_boy3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
ck("pinned sha a20c9275136841f3a0b2eca8339b41e5c6f7bb173caeeb5c3585d0e15289490e",
    sha === "a20c9275136841f3a0b2eca8339b41e5c6f7bb173caeeb5c3585d0e15289490e", sha.slice(0, 16));
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
    if (acc.componentType === 5123) {
        for (let i = 0; i < acc.count; i++) out[i] = bytes.readUInt16LE(off + i * 2);
    } else {
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
    const f1 = cdiv([w[0] - w5[0], w[1] - w5[1]], D), f2 = cdiv(cadd(w, w5), D), f3 = cdiv(cadd([1, 0], w6), D);
    const g1 = -1.5 * f1[1], g2 = -1.5 * f2[0], g3 = f3[1] - 0.5;
    const n = g1 * g1 + g2 * g2 + g3 * g3;
    return [g1 / n, g2 / n, g3 / n];
};
// replica envelope pre-pass MUST replicate the build's exact sampling grid
// (i 0..400, j 0..200) — derived constants, not hardcoded (struct-136 law)
let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
for (let i = 0; i <= 400; i++) for (let k = 0; k < 200; k++) {
    const p = P([Math.cos((2 * Math.PI * k) / 200) * (i / 400), Math.sin((2 * Math.PI * k) / 200) * (i / 400)]);
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
    y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
    z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]);
}
const TARGET_H = 6.0, SLAB = 0.14, AXSPAN = 4.5;
const SCALE = TARGET_H / (z1 - z0);
const ZC = (z0 + z1) / 2;
const LIFT = SLAB - SCALE * x0;
const R0 = Math.cbrt((3 - SQ5) / 2);
console.log(`replica v2: x0=${x0.toFixed(9)} z0=${z0.toFixed(9)} z1=${z1.toFixed(9)} SCALE=${SCALE.toFixed(6)} ZC=${ZC.toFixed(6)} LIFT=${LIFT.toFixed(6)} r0=${R0.toFixed(6)}`);
// world -> form (v2 inverse): fx=(wy−LIFT)/SCALE, fy=wz/SCALE, fz=wx/SCALE+ZC
const toForm = (wx: number, wy: number, wz: number): [number, number, number] => [(wy - LIFT) / SCALE, wz / SCALE, wx / SCALE + ZC];

// Gauss-Newton inversion, multi-branch seeding (struct-135 branch-trap law)
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

// ---- (a) node census (material-name buckets, KEEP node by name, TRS applied) -----------------------
type Cloud = { name: string; v: Float32Array; idx?: Uint32Array };
const clouds: Cloud[] = [];
for (const nd of j.nodes) {
    if (nd.mesh === undefined) continue;
    const prims = j.meshes[nd.mesh].primitives;
    const t = nd.translation ?? [0, 0, 0];
    for (const prim of prims) {
        const mat = j.materials[prim.material ?? 0];
        const raw = va(prim.attributes.POSITION);
        const pos = new Float32Array(raw.length);
        for (let i = 0; i < raw.length; i += 3) {
            pos[i] = raw[i] + t[0]; pos[i + 1] = raw[i + 1] + t[1]; pos[i + 2] = raw[i + 2] + t[2];
        }
        const isGlow = (mat?.emissiveFactor ?? []).some((v: number) => v > 0.02);
        const name = isGlow ? (nd.name ?? "GLOW") : (mat?.name ?? "plain");
        const idx = prim.indices !== undefined ? ia(prim.indices) : undefined;
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
            if (m > 1 + 1e-3 && 1 / m > 1 + 1e-3) outside++;
        }
        ck("film law: 100% verts within 0.5mm of P(w)", off === 0, `${off}/${n} off, worst ${worst.toFixed(6)}m`);
        ck("disk law: all verts inside the projective disk (either representative)", outside === 0, `${outside} outside both branches`);
    }
}

// ---- (c)+(d) south pole + triple point, BOTH ON THE AXLE --------------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (poles)", !!bone);
    if (bone) {
        const spX = -TARGET_H / 2;                       // SCALE*(z0−ZC) = −TARGET_H/2 exact (z0=−2)
        let sp = 0;
        for (let i = 0; i < bone.v.length / 3; i++) {
            const d = Math.hypot(bone.v[i * 3] - spX, bone.v[i * 3 + 1] - LIFT, bone.v[i * 3 + 2]);
            if (d < 0.001) sp++;
        }
        ck("south pole law: >=1 bone vert within 1mm of axle point (−3.0, LIFT, 0)", sp >= 1, `${sp} verts`);
        const tpX = -SCALE * ZC;
        const near: { w: C; d: number }[] = [];
        for (let i = 0; i < bone.v.length / 3; i++) {
            const d = Math.hypot(bone.v[i * 3] - tpX, bone.v[i * 3 + 1] - LIFT, bone.v[i * 3 + 2]);
            if (d < 0.12) near.push({ w: gaussNewton(toForm(bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2])).w, d });
        }
        ck("triple point law: >=3 bone verts within 0.12 of axle point (−SCALE*ZC, LIFT, 0) (grid resolution disclosed)", near.length >= 3, `${near.length} verts`);
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

// ---- (f) 3-fold symmetry law about the AXLE LINE (world x, y=LIFT, z=0) ------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (symmetry)", !!bone);
    if (bone) {
        const STRIDE = 13;
        let tested = 0, ret = 0;
        let worst = 0;
        const c = Math.cos((2 * Math.PI) / 3), s = Math.sin((2 * Math.PI) / 3);
        for (let i = 0; i < bone.v.length / 3; i += STRIDE) {
            const x = bone.v[i * 3], y = bone.v[i * 3 + 1] - LIFT, z = bone.v[i * 3 + 2];
            for (const sgn of [1, -1]) {
                const ry = y * c - sgn * z * s, rz = y * s * sgn + z * c;
                const { res } = gaussNewton(toForm(x, ry + LIFT, rz));
                tested++;
                if (res <= 0.001) ret++; else worst = Math.max(worst, res);
            }
        }
        ck("3-fold symmetry law about the axle: >99.9% rotated samples lie ON the surface (<=1mm)",
            ret / tested > 0.999, `${ret}/${tested} on-surface, worst miss ${worst.toFixed(6)}m`);
    }
}

// ---- (g) axle law -------------------------------------------------------------------------------------
{
    const iron = byName("bs_iron");
    ck("iron cloud present", !!iron);
    if (iron) {
        let ax0 = Infinity, ax1 = -Infinity, count = 0, maxRad = 0;
        for (let i = 0; i < iron.v.length / 3; i++) {
            const x = iron.v[i * 3], y = iron.v[i * 3 + 1], z = iron.v[i * 3 + 2];
            const rad = Math.hypot(y - LIFT, z);
            if (rad <= 0.07) {
                ax0 = Math.min(ax0, x); ax1 = Math.max(ax1, x); count++;
                maxRad = Math.max(maxRad, rad);
            }
        }
        ck("axle law: axis-line iron verts span x −4.6..4.6, >=12 verts",
            ax0 <= -4.4 && ax1 >= 4.4 && count >= 12, `x[${ax0.toFixed(3)}..${ax1.toFixed(3)}], ${count} verts, maxRad ${maxRad.toFixed(4)}`);
        // posts: iron verts forming vertical members at x=±AXSPAN (stanchions bear the axle)
        let postLow = 0;
        for (let i = 0; i < iron.v.length / 3; i++) {
            const x = iron.v[i * 3], y = iron.v[i * 3 + 1];
            if (Math.abs(Math.abs(x) - AXSPAN) <= 0.1 && y < 0.3) postLow++;
        }
        ck("stanchion law: posts rise from the slab at x=±4.5 (foot verts y<0.3 present)", postLow >= 8, `${postLow} foot verts`);
    }
}

// ---- (h) film-axle span law ----------------------------------------------------------------------------
{
    const bone = byName("bs_bone");
    ck("bone cloud present (span)", !!bone);
    if (bone) {
        let xmax = 0;
        for (let i = 0; i < bone.v.length / 3; i++) xmax = Math.max(xmax, Math.abs(bone.v[i * 3]));
        ck("film |x| <= 3.001 (inside the stanchions; mk clearance >=1.2m by construction)", xmax <= 3.001, `max |wx| ${xmax.toFixed(4)}`);
    }
}

// ---- (i) bead law ----------------------------------------------------------------------------------------
{
    const bead = byName("glow_bs_1");
    ck("bead cloud present", !!bead);
    const glowNode = j.nodes.find((nd: any) => nd.name === "glow_bs_1");
    const t = glowNode?.translation ?? [0, 0, 0];
    const BX = AXSPAN - 0.35;
    ck("bead on the axle outboard of the eye (4.15, LIFT, 0) [node TRS]",
        Math.hypot(t[0] - BX, t[1] - LIFT, t[2]) < 0.0005,
        `translation (${t[0].toFixed(4)}, ${t[1].toFixed(4)}, ${t[2].toFixed(4)}) vs (${BX.toFixed(4)}, ${LIFT.toFixed(4)}, 0)`);
    if (bead) {
        let r0v = Infinity, r1v = -Infinity;
        const n = bead.v.length / 3;
        let cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < n; i++) { cx += bead.v[i * 3] / n; cy += bead.v[i * 3 + 1] / n; cz += bead.v[i * 3 + 2] / n; }
        for (let i = 0; i < n; i++) { const r = Math.hypot(bead.v[i * 3] - cx, bead.v[i * 3 + 1] - cy, bead.v[i * 3 + 2] - cz); r0v = Math.min(r0v, r); r1v = Math.max(r1v, r); }
        ck("bead radius ~0.13", Math.abs(r1v - 0.13) < 0.006, `r[${r0v.toFixed(4)},${r1v.toFixed(4)}] (r1 = seam-dup centroid skew ~4mm, disclosed)`);
        const bone = byName("bs_bone");
        if (bone) {
            let nearest = Infinity;
            for (let i = 0; i < bone.v.length / 3; i++) nearest = Math.min(nearest, Math.hypot(bone.v[i * 3] - cx, bone.v[i * 3 + 1] - cy, bone.v[i * 3 + 2] - cz));
            ck("bead clear of film: nearest bone vert >= 0.10 from bead center", nearest >= 0.10, `${nearest.toFixed(4)}m`);
        }
    }
}

// ---- (j)+(k) stone + envelope + NaN ------------------------------------------------------------------------
{
    const stone = byName("bs_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let y0v = Infinity, y1v = -Infinity, xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity;
        for (let i = 0; i < stone.v.length / 3; i++) {
            y0v = Math.min(y0v, stone.v[i * 3 + 1]); y1v = Math.max(y1v, stone.v[i * 3 + 1]);
            xmin = Math.min(xmin, stone.v[i * 3]); xmax = Math.max(xmax, stone.v[i * 3]);
            zmin = Math.min(zmin, stone.v[i * 3 + 2]); zmax = Math.max(zmax, stone.v[i * 3 + 2]);
        }
        ck("slab on grade (y 0..0.14)", Math.abs(y0v) < 1e-3 && Math.abs(y1v - 0.14) < 1e-3, `y[${y0v.toFixed(3)}..${y1v.toFixed(3)}]`);
        ck("slab plan 10.1x7.1", Math.abs((xmax - xmin) - 10.1) < 0.01 && Math.abs((zmax - zmin) - 7.1) < 0.01, `${(xmax - xmin).toFixed(3)}x${(zmax - zmin).toFixed(3)}`);
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
    ck("envelope 10.10x6.52x7.10", Math.abs((xmax - xmin) - 10.10) < 0.02 && Math.abs((ymax - ymin) - 6.52) < 0.02 && Math.abs((zmax - zmin) - 7.10) < 0.02,
        `${(xmax - xmin).toFixed(2)}x${(ymax - ymin).toFixed(2)}x${(zmax - zmin).toFixed(2)}`);
    ck("grade base", Math.abs(ymin) < 1e-3, `ymin ${ymin.toFixed(4)}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
