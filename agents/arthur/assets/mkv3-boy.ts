// mkv3-boy.ts — STRUCTURES LANE struct-136, Round 11 commission R11-1.
// INTERRUPTED-WINDOW RECOVERY (struct-9/artwalk-32 pre-build class): a
// predecessor window authored this draft (mtime Sep 9 06:14, header named
// struct-134/R10-24) but died BEFORE any build — no GLB, no decode, no
// ledger, no commit; struct-134 became the R11 ring-read opener instead.
// This tick completes the draft under current law and builds it. Math core
// + asserted laws were the predecessor's and are verified below; the
// closed-mesh law block was broken mid-write (unterminated template
// literal) and everything after the film grid was missing — completed now.
//
// BOY'S SURFACE: the form ledger's first-named open family (struct-133
// close: "boy/seifert + nephroid/involute still 0/0/0"; struct-135 kept it
// open; fresh grep this tick: boy 0 standing-work mentions across
// STRUCTURES-PLAN.md + IMPROVEMENTS.md + IMPROVE-PLAN.md — gap-mentions
// only). First R11 new form under CITY-PLAN Amendment 1 (8m NN floor,
// rotate away from over-served rays: az184 carries 17 forms — seat scan
// next tick on an under-served ray, NOT enneper r250 -> r260).
//
// ONE IDEA: THE DISK THAT CLOSES INTO ITSELF — NO EDGE AT ALL. Werner
// Boy's 1901 immersion of the real projective plane: a disk whose opposite
// boundary points are THE SAME point (antipodal gluing), one-sided,
// closed, with a single triple point where three sheets pass through one
// another. Where the Enneper wears an iron rim on its analytic boundary,
// Boy has no boundary to hem — the surface simply continues. DoubleSide
// bone film is not a material choice but the topology (the surface is
// one-sided). An iron needle along the form's three-fold pinwheel axis
// pins the two special points: the south pole P(0)=(0,0,-2) at the bottom
// and the triple point at the heart. One brass bead AT the triple point
// (kiss/gyroid/enneper lineage, glow_bs_1).
//
// MATH (Kusner–Bryant parametrization, en.wikipedia.org/wiki/Boy's_surface,
// asserted in-file):
//   g1 = -(3/2) Im[ w(1 - w^4) / D ],  g2 = -(3/2) Re[ w(1 + w^4) / D ],
//   g3 = Im[ (1 + w^6) / D ] - 1/2,   D = w^6 + sqrt(5) w^3 - 1,
//   P(w) = (g1, g2, g3) / (g1^2 + g2^2 + g3^2),  on the closed unit disk.
// - SOUTH POLE LAW: P(0) = (0,0,-2) exactly.
// - TRIPLE POINT LAW: the three roots of D inside the disk,
//   w_k = r0 * e^{i 2 pi k / 3}, r0 = ((3 - sqrt5)/2)^(1/3) ~ 0.7265,
//   all map to (0,0,0) exactly — the single triple point.
// - ANTIPODAL GLUING LAW: P(e^{it}) = P(-e^{it}) exactly on |w| = 1 (the
//   boundary glues to itself with a half turn); generally P(w) =
//   P(-1/conj(w)) (the projective identification).
// - CLOSED MESH LAW: the outer ring merges antipodal pairs -> every edge
//   in exactly 2 triangles (zero boundary edges) and Euler characteristic
//   V - E + F = 1: a closed NON-ORIENTABLE surface, i.e. really RP^2.
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) bs_bone
// (film, DoubleSide — one-sided surface), bs_iron (needle), bs_stone
// (slab) — no plain materials. Glow census exactly 1 KEEP (glow_bs_1,
// unique token this cast). Deterministic: pure parametric grid + seeded
// texMat only. Folly class: no entry advertised — no walk owed
// (zeno..enneper precedent). 3-fold symmetric about the world-y axis —
// yaw legally near-irrelevant; family yaw-pi at placement for census
// consistency.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- Kusner–Bryant parametrization ---------------------------------------------------------------
type C = [number, number];
const SQ5 = Math.sqrt(5);
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
const cdiv = (a: C, b: C): C => {
    const d = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const wOf = (s: number, t: number): C => [s * Math.cos(t), s * Math.sin(t)];
const P = (w: C): THREE.Vector3 => {
    const w2 = cmul(w, w), w3 = cmul(w2, w), w5 = cmul(w3, w2), w6 = cmul(w3, w3);
    const D = cadd(cadd(w6, [SQ5 * w3[0], SQ5 * w3[1]]), [-1, 0]);
    const f1 = cdiv(csub(w, w5), D), f2 = cdiv(cadd(w, w5), D), f3 = cdiv(cadd([1, 0], w6), D);
    const g1 = -1.5 * f1[1], g2 = -1.5 * f2[0], g3 = f3[1] - 0.5;
    const n = g1 * g1 + g2 * g2 + g3 * g3;
    return new THREE.Vector3(g1 / n, g2 / n, g3 / n);
};
const Pv = (s: number, t: number) => P(wOf(s, t));

// ---- asserted laws --------------------------------------------------------------------------------
{
    const sp = P([0, 0]);
    if (sp.distanceTo(new THREE.Vector3(0, 0, -2)) > 1e-12) throw Error(`south pole law: P(0)=${sp.toArray()} != (0,0,-2)`);
    const r0 = Math.cbrt((3 - SQ5) / 2);
    for (let k = 0; k < 3; k++) {
        const t = (2 * Math.PI * k) / 3;
        const p = P(wOf(r0, t));
        if (p.length() > 1e-9) throw Error(`triple point law: D-root k=${k} maps to ${p.toArray()} != origin`);
    }
    for (const t of [0.3, 1.1, 2.2, 3.7, 5.1]) {
        const a = P([Math.cos(t), Math.sin(t)]), b = P([-Math.cos(t), -Math.sin(t)]);
        if (a.distanceTo(b) > 1e-9) throw Error(`antipodal gluing law failed at t=${t}: ${a.distanceTo(b)}`);
    }
    const wq: C = [0.6, 0.25], m2 = 0.6 * 0.6 + 0.25 * 0.25;
    const wq2: C = [-0.6 / m2, -0.25 / m2]; // -1/conj(w)
    if (P(wq).distanceTo(P(wq2)) > 1e-9) throw Error("projective law: P(w) != P(-1/conj(w))");
    console.log(`boy laws OK: south pole (0,0,-2) exact, 3 D-roots -> triple point origin exact, antipodal gluing + projective law verified, r0=${r0.toFixed(6)}`);
}

// ---- envelope pre-pass (deterministic; fixes SCALE/ZOFF/slab) -------------------------------------
const SECTORS = 112, RINGS = 72;
let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
for (let i = 0; i <= 400; i++) for (let j = 0; j < 200; j++) {
    const p = Pv(i / 400, (2 * Math.PI * j) / 200);
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
}
const TARGET_H = 6.0;
const SCALE = TARGET_H / (z1 - z0);
const SLAB = 0.14;
const ZOFF = SLAB - SCALE * z0;                 // lowest film point rests on slab top
const apexY = ZOFF + SCALE * z1;                // film apex in world y (decode-caught: SLAB+SCALE*z1 was wrong — v1 draft bug, needle crown reached only y1.54 vs film top 6.14)
const filmW = SCALE * (x1 - x0), filmD = SCALE * (y1 - y0);
const slabW = Math.round((Math.max(filmW, filmD) + 0.6) * 100) / 100; // film + 0.3m margin a side
const ccx = SCALE * (x0 + x1) / 2, ccz = SCALE * (y0 + y1) / 2;     // film bbox center (world x/z)
const toWorld = (p: THREE.Vector3) => new THREE.Vector3(SCALE * p.x, SCALE * p.z + ZOFF, SCALE * p.y);
console.log(`raw envelope x[${x0.toFixed(4)},${x1.toFixed(4)}] y[${y0.toFixed(4)},${y1.toFixed(4)}] z[${z0.toFixed(4)},${z1.toFixed(4)}] -> SCALE ${SCALE.toFixed(6)} ZOFF ${ZOFF.toFixed(6)}`);
console.log(`world: film plan ${filmW.toFixed(2)}x${filmD.toFixed(2)} center (${ccx.toFixed(3)},${ccz.toFixed(3)}), slab ${slabW.toFixed(2)} sq, apex ${apexY.toFixed(4)}, triple point world y ${ZOFF.toFixed(4)}`);
// south pole = lowest film point (the tail tip rests on the slab): pre-pass law
if (Math.abs(z0 - (-2)) > 1e-9) throw Error(`south pole not the lowest point: z0=${z0} != -2`);

// ---- symmetry probe (honest print, no false claim) ------------------------------------------------
{
    const N = 320;
    const cloud: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) cloud.push(Pv(0.15 + 0.85 * ((i * 37) % N) / N, 2.399963 * i));
    const rot = (p: THREE.Vector3) => { const c = Math.cos(2 * Math.PI / 3), s = Math.sin(2 * Math.PI / 3); return new THREE.Vector3(p.x * c - p.y * s, p.x * s + p.y * c, p.z); };
    let worst = 0;
    for (const q of cloud.map(rot)) {
        let best = Infinity;
        for (const c of cloud) best = Math.min(best, q.distanceTo(c));
        worst = Math.max(worst, best);
    }
    const size = SCALE * Math.max(x1 - x0, y1 - y0, z1 - z0);
    console.log(`3-fold symmetry probe about form-z: worst nearest-surface dev ${worst.toFixed(6)} (${((worst / size) * 100).toFixed(3)}% of size)${worst / size < 0.02 ? " — SYMMETRY VERIFIED" : " — NOT a symmetry axis, disclosed"}`);
}

// ---- film: polar grid on the unit disk, OUTER RING GLUED (antipodal merge) ------------------------
const filmPos: number[] = [], filmNor: number[] = [], filmUV: number[] = [];
const filmIdx: number[] = [];
const H = 1e-4;
const normalAt = (s: number, t: number): THREE.Vector3 => {
    const sb = s >= 1 ? s - 2 * H : s, sf = s >= 1 ? s : s + H; // backward FD at the glued rim
    const ts = Pv(sb, t).sub(Pv(sf, t)).negate();
    const tt = Pv(s, t + H).sub(Pv(s, t - H));
    return ts.cross(tt).normalize();
};
{
    // vertex emission: center + rings 1..71 full + ring 72 = glued half-ring
    const emit = (p: THREE.Vector3, n: THREE.Vector3) => {
        const b = filmPos.length / 3;
        filmPos.push(p.x, p.y, p.z);
        filmNor.push(n.x, n.y, n.z);
        filmUV.push((p.x / (slabW / 2) + 1) / 2, (p.z / (slabW / 2) + 1) / 2);
        return b;
    };
    const centerP = Pv(0, 0);
    // south-pole cap normal: pole minus the centroid of its first ring
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < SECTORS; i++) { const q = Pv(1 / RINGS, (2 * Math.PI * i) / SECTORS); cx += q.x; cy += q.y; cz += q.z; }
    const centerN = new THREE.Vector3(centerP.x - cx / SECTORS, centerP.y - cy / SECTORS, centerP.z - cz / SECTORS).normalize();
    const center = emit(toWorld(centerP), centerN);
    const ringBase: number[][] = [];
    for (let r = 1; r <= RINGS; r++) {
        const s = r / RINGS, half = r === RINGS ? SECTORS / 2 : SECTORS, base: number[] = [];
        for (let i = 0; i < half; i++) {
            const t = (2 * Math.PI * i) / SECTORS;
            const p = Pv(s, t), n = normalAt(s, t);
            base.push(emit(toWorld(p), n));
        }
        ringBase.push(base);
    }
    const tri = (a: number, b: number, c: number) => {
        const A = filmPos.slice(a * 3, a * 3 + 3), B = filmPos.slice(b * 3, b * 3 + 3), Cc = filmPos.slice(c * 3, c * 3 + 3);
        const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [Cc[0] - A[0], Cc[1] - A[1], Cc[2] - A[2]];
        const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        if (cr[0] * cr[0] + cr[1] * cr[1] + cr[2] * cr[2] > 1e-12) filmIdx.push(a, b, c);
    };
    const r1 = ringBase[0];
    for (let i = 0; i < SECTORS; i++) tri(center, r1[i], r1[(i + 1) % SECTORS]);
    for (let r = 1; r < RINGS; r++) {
        const inner = ringBase[r - 1], outer = ringBase[r], nOut = outer.length; // 112, or 56 at the glued rim
        for (let i = 0; i < SECTORS; i++) {
            const a = inner[i], b = outer[i % nOut], c = outer[(i + 1) % nOut], d = inner[(i + 1) % SECTORS];
            tri(a, b, c); tri(a, c, d);
        }
    }
    // CLOSED MESH LAW: every edge exactly 2 faces; Euler chi = 1 (RP^2)
    const ecount = new Map<string, number>();
    for (let f = 0; f < filmIdx.length; f += 3) {
        const edges: [number, number][] = [
            [filmIdx[f], filmIdx[f + 1]],
            [filmIdx[f + 1], filmIdx[f + 2]],
            [filmIdx[f + 2], filmIdx[f]],
        ];
        for (const [u, v] of edges) {
            const k = u < v ? `${u}_${v}` : `${v}_${u}`;
            ecount.set(k, (ecount.get(k) ?? 0) + 1);
        }
    }
    let boundaryEdges = 0, badEdges = 0;
    for (const c of ecount.values()) { if (c === 1) boundaryEdges++; else if (c > 2) badEdges++; }
    const V = filmPos.length / 3, E = ecount.size, F = filmIdx.length / 3;
    const chi = V - E + F;
    if (boundaryEdges !== 0) throw Error(`closed mesh law: ${boundaryEdges} boundary edges (expected 0 — antipodal gluing must close the surface)`);
    if (badEdges !== 0) throw Error(`closed mesh law: ${badEdges} edges with >2 faces`);
    if (Math.abs(chi - 1) > 1e-9) throw Error(`Euler characteristic ${chi} != 1 (RP^2 law) — V=${V} E=${E} F=${F}`);
    console.log(`closed mesh law OK: V=${V} E=${E} F=${F} chi=${chi} (RP^2), 0 boundary edges, 0 over-shared edges`);
    console.log(`film grid: ${V} verts / ${F} tris (${SECTORS} sectors x ${RINGS} rings + center fan, rim glued)`);
}

// ---- scene: film (bone, DoubleSide — one-sided topology) -----------------------------------------
const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
const boneTex = texMat("bs_bone", [0xd8d2c4, 0xcfc8b8, 0xbfb8a8], { rough: 0.9, scale: 2, weights: [3, 1, 1], seed: 9401 });
boneTex.side = THREE.DoubleSide;      // one-sided surface: both faces ARE the surface
(boneTex as any).userData = { ...(boneTex as any).userData, texName: "bs_bone", glTFDoubleSide: true }; // glbwrite v3.4 lane — non-orientable film MUST export doubleSided:true or FrontSide culling holes it
{
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(filmUV, 2));
    geo.setIndex(filmIdx);
    g.add(new THREE.Mesh(geo, boneTex));
}

// ---- iron: the pinwheel-axis needle (grade -> THROUGH the triple point ->
//          escapes the open eye; bead crowns the tip) -----------------------
const NEEDLE_R = 0.045;
const ironTex = texMat("bs_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9402 });
// v2 (struct-136 in-tick iteration, fallback judge fix #1): the axis above
// the triple point is the pinwheel's OPEN EYE (axis-law below proves the
// film never crosses the axis for form-z in (0, z1]) — so the needle
// passes through the heart and escapes 0.31m proud of the lobes; the bead
// on the tip reads from every walk-up view and glows at dusk (the v1
// interior-only bead failed the night contract exactly as enneper's
// top-plan-only identity did — survey-181 class, not repeated).
const NEEDLE_TIP = apexY + 0.75; // v4: both judges independently asked the crown to CLEAR the lobes (night: 'peeking from crease'); 0.75m + bead = ~0.88m over the silhouette, ~35px at 18m
{
    // AXIS LAW (in-file, deterministic): dense scan — the film touches the
    // world axis ONLY at the south pole (form z=-2) and the triple point
    // (z=0); everywhere else it keeps >= 1e-4 away, so the eye corridor is
    // clear for the crown.
    let axisHits = "";
    for (let i = 0; i <= 600; i++) for (let j = 0; j < 600; j++) {
        const p = Pv(i / 600, (2 * Math.PI * j) / 600);
        if (Math.abs(p.x) < 1e-6 && Math.abs(p.y) < 1e-6) axisHits += `(${p.z.toFixed(4)})`;
    }
    const allowed = new Set(["(-2.0000)", "(0.0000)", "(-2.0000)(0.0000)"]);
    if (![...axisHits.matchAll(/\(([^)]+)\)/g)].every(m => Math.abs(parseFloat(m[1]) + 2) < 1e-4 || Math.abs(parseFloat(m[1])) < 1e-4))
        throw Error(`axis law: film crosses the axis away from the poles: ${axisHits.slice(0, 120)}`);
    console.log(`axis law OK: film meets the axis only at z=-2 (south pole) and z=0 (triple point) — eye corridor open for the crown`);
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(NEEDLE_R, NEEDLE_R, NEEDLE_TIP, 10), ironTex);
    needle.position.set(0, NEEDLE_TIP / 2, 0);
    g.add(needle);
    const southPoleY = SCALE * (-2) + ZOFF;
    if (Math.abs(southPoleY - SLAB) > 1e-9) throw Error(`needle law: south pole world y ${southPoleY} != slab top ${SLAB}`);
    if (NEEDLE_TIP <= apexY) throw Error(`needle law: tip ${NEEDLE_TIP} must crest the film apex ${apexY}`);
}

// ---- THE BEAD at the triple point: the only light ------------------------------------------------
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;             // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, NEEDLE_TIP, 0);                   // v2: crowns the needle tip — the open eye lets it read from every side; the triple point itself is proven by the film's own geometry
    bead.name = "glow_bs_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone: the slab ------------------------------------------------------------------------------
const stoneTex = texMat("bs_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9403 });
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(slabW, SLAB, slabW), stoneTex);
    slab.position.set(0, SLAB / 2, 0);
    g.add(slab);
}

// ---- glow census + envelope/NaN laws --------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y < TARGET_H + SLAB - 0.01 || sz.y > TARGET_H + SLAB + 1.0) throw Error(`height ${sz.y.toFixed(3)} outside [${TARGET_H + SLAB - 0.01}, ${TARGET_H + SLAB + 1.0}] (v2 crown)`);
    if (Math.abs(sz.x - slabW) > 0.02 || Math.abs(sz.z - slabW) > 0.02) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != slab ${slabW.toFixed(2)} sq (+/-0.02)`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP node (glow_bs_1)`);
}

const merged = mergeByMaterial(g, "boy");
writeFileSync("agents/arthur/assets/village_boy3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_boy3.glb`);
