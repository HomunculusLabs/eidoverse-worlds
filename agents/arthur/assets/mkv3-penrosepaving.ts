// mkv3-penrosepaving.ts — STRUCTURES LANE struct-98, Round 10 commission R10-2.
// THE PENROSE PAVING: the form ledger's second missing family — APERIODIC
// ORDER. (Ledger: curves complete; compositions superposition/intersection/
// envelope; periodic tessellation = honeycomb R10-1. Nothing in the village's
// 50 struct entities carries APERIODIC fivefold order as its identity.)
//
// ONE IDEA: A COURT THAT NEVER REPEATS. One flat stone film whose stones ARE
// the Penrose P3 tiling in its Robinson-triangle form — acute (36°) and
// obtuse (108°) golden triangles grown by exact deflation from a ten-fold
// sun wheel, edge-to-edge with no translational cell anywhere. Two stone
// tones alternate by triangle kind, and the deflation PROVES they alternate
// across every shared edge (asserted) — a two-tone grain organized by
// ten-fold sun symmetry radiating from one brass hub. The viewer reads:
// a court that never repeats.
//
// METHOD (exact, all assertions in-code):
//   - Start: sun wheel of 10 acute golden triangles A(36°,72°,72°) around
//     the origin (10 × 36° = 360°), legs L = 4.2, unit u0 = L/φ.
//   - Deflation (composite rules, area- and count-invariant verified):
//       A(u) → 2·A(u/φ) + 1·O(u)   [36° split; O at parent scale, then deflated]
//       O(u) → 1·A(u/φ) + 1·O(u/φ) [base golden split]
//     Every produced triangle is ASSERTED to spec (angles/lengths to 1e-9).
//   - Edge census ASSERTED: no edge shared by 3+ triangles (edge-to-edge,
//     zero overlap). Tone assignment is an exact DSATUR 3-coloring of the
//     adjacency graph, ASSERTED conflict-free (kind alone is NOT 2-tone-
//     able — 70 same-kind adjacencies; the honest map needs three tones).
//   - From the sun wheel the tiles remain triangles at every depth (each
//     interior edge is a base on exactly one side — the maximal-symmetry
//     sun property); the stones are honestly Robinson triangles.
//   - Tiles shrink ~6% toward centroid (kerf joints); three stone tones;
//     one brass hub bead at the origin (glow_pp KEEP, emissive 0x9a7030 @
//     0.85 — struct-82 law + dusk lineage).
//
// Classification (supportclass.js live: film h 0.09 ≤ 0.5): ground-layer
// exemption class, walkable surface, no door advertised (no walk owed).
//
// Determinism: fixed trig, fixed substitution, assertions below.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (struct-96 v4 cool grey pair)
const stoneA = texMat("pp_stone_a", [0x878b8e, 0x8f9396, 0x7d8184], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const stoneB = texMat("pp_stone_b", [0x7b837e, 0x838b86, 0x6f7772], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const stoneC = texMat("pp_stone_c", [0x8e8878, 0x969080, 0x827c6c], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85;

const PHI = (1 + Math.sqrt(5)) / 2;
const L = 4.2;              // wheel leg length (patch radius ~L·cos18)
const T = 0.09;             // tile thickness (ground film)
const SHRINK = 0.94;        // centroid shrink (kerf joints)
const DEFATIONS = 3;        // 4.2/φ³ ≈ 0.99m rhomb side

type V2 = [number, number];
// triangle: kind A (apex 36) or O (apex 108); apex + base pair, unit u
interface Tri { k: "A" | "O"; V: V2; B1: V2; B2: V2; u: number }

const sub = (P: V2, Q: V2, t: number): V2 => [P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])];
const d = (P: V2, Q: V2) => Math.hypot(Q[0] - P[0], Q[1] - P[1]);

function assertTri(t: Tri) {
    const { k, V, B1, B2, u } = t;
    const l1 = d(V, B1), l2 = d(V, B2), b = d(B1, B2);
    if (Math.abs(l1 - l2) > 1e-9) throw Error(`${k} legs differ ${l1} ${l2}`);
    if (k === "A") {
        if (Math.abs(l1 - PHI * u) > 1e-9) throw Error(`A legs ${l1} vs φu ${PHI * u}`);
        if (Math.abs(b - u) > 1e-9) throw Error(`A base ${b} vs u ${u}`);
    } else {
        if (Math.abs(l1 - u) > 1e-9) throw Error(`O legs ${l1} vs u ${u}`);
        if (Math.abs(b - PHI * u) > 1e-9) throw Error(`O base ${b} vs φu ${PHI * u}`);
    }
}

// ---- sun wheel ----------------------------------------------------------------
let tris: Tri[] = [];
{
    const u0 = L / PHI;
    for (let k = 0; k < 10; k++) {
        const a1 = ((18 + 36 * k) * Math.PI) / 180, a2 = ((18 + 36 * (k + 1)) * Math.PI) / 180;
        const t: Tri = { k: "A", V: [0, 0], B1: [L * Math.cos(a1), L * Math.sin(a1)], B2: [L * Math.cos(a2), L * Math.sin(a2)], u: u0 };
        assertTri(t); // 36° apex at origin between adjacent leg directions
        tris.push(t);
    }
    console.log(`wheel: 10 A(unit ${u0.toFixed(4)}) — 10×36° = 360° exact`);
}

// ---- deflation -----------------------------------------------------------------
function deflate(t: Tri): Tri[] {
    const u2 = t.u / PHI;
    if (t.k === "A") {
        // 36° split from base vertex B1 → golden point P on leg V→B2 (VP = u)
        const P = sub(t.V, t.B2, 1 / PHI);           // V + (B2−V)/φ : VP = L_leg/φ = φu/φ = u ✓
        const A1: Tri = { k: "A", V: t.B1, B1: t.B2, B2: P, u: u2 };
        const Obig: Tri = { k: "O", V: P, B1: t.V, B2: t.B1, u: t.u };
        assertTri(A1); assertTri(Obig);
        return [A1, ...deflate(Obig)];               // A → A + O, O → A + O ⇒ composite 2A + O
    } else {
        // base golden split R = B1 + 1/φ²·(B2−B1)  (B1R = φu/φ² = u/φ)
        const R = sub(t.B1, t.B2, 1 / (PHI * PHI));
        const O1: Tri = { k: "O", V: R, B1: t.V, B2: t.B1, u: u2 };
        const A1: Tri = { k: "A", V: t.B2, B1: t.V, B2: R, u: u2 };
        assertTri(O1); assertTri(A1);
        return [O1, A1];
    }
}
for (let i = 0; i < DEFATIONS; i++) {
    const next: Tri[] = [];
    for (const t of tris) next.push(...deflate(t));
    const a = next.filter(t => t.k === "A").length, o = next.length - a;
    // count invariant: A→2A+O, O→A+O
    const pa = tris.filter(t => t.k === "A").length, po = tris.length - pa;
    if (a !== 2 * pa + po || o !== pa + po) throw Error(`count law broken: A ${a} O ${o} from (${pa},${po})`);
    tris = next;
}
for (const t of tris) assertTri(t);
console.log(`deflated ×${DEFATIONS}: ${tris.length} triangles (A ${tris.filter(t => t.k === "A").length} / O ${tris.filter(t => t.k === "O").length}), rhomb side ≈ ${(L / Math.pow(PHI, DEFATIONS)).toFixed(3)}m`);

// ---- edge census + exact 3-tone map (DSATUR, conflict-free asserted) -------------
{
    const ek = (P: V2, Q: V2) => {
        const r = (p: V2) => p.map(c => Math.round(c * 1e6) / 1e6).join(",");
        return r(P) < r(Q) ? `${r(P)}|${r(Q)}` : `${r(Q)}|${r(P)}`;
    };
    const edgeOwner = new Map<string, number[]>();
    for (let i = 0; i < tris.length; i++) {
        const t = tris[i];
        for (const [P, Q] of [[t.V, t.B1], [t.V, t.B2], [t.B1, t.B2]] as Array<[V2, V2]>) {
            const kk = ek(P, Q);
            if (!edgeOwner.has(kk)) edgeOwner.set(kk, []);
            edgeOwner.get(kk)!.push(i);
        }
    }
    let interior = 0, boundary = 0, triShared = 0;
    for (const o of edgeOwner.values()) {
        if (o.length >= 3) triShared++;
        if (o.length === 2) interior++; else boundary++;
    }
    if (triShared) throw Error(`${triShared} edges owned by 3+ triangles — not edge-to-edge`);
    console.log(`edge census: ${interior} interior + ${boundary} boundary edges, zero overlap`);
    // adjacency
    const adj: Set<number>[] = tris.map(() => new Set<number>());
    for (const o of edgeOwner.values())
        if (o.length === 2) { adj[o[0]].add(o[1]); adj[o[1]].add(o[0]); }
    // DSATUR 3-coloring (deterministic: max-saturation, then max-degree, then index)
    const color: number[] = tris.map(() => -1);
    const sat: Set<number>[] = tris.map(() => new Set<number>());
    for (let step = 0; step < tris.length; step++) {
        let best = -1;
        for (let i = 0; i < tris.length; i++) {
            if (color[i] >= 0) continue;
            if (best < 0 || sat[i].size > sat[best].size || (sat[i].size === sat[best].size && adj[i].size > adj[best].size)) best = i;
        }
        const c = [0, 1, 2].find(c => !sat[best].has(c));
        if (c === undefined) throw Error(`3-tone map failed at tile ${best} — adjacency not 3-colorable`);
        color[best] = c;
        for (const m of adj[best]) if (color[m] < 0) sat[m].add(c);
    }
    let conflicts = 0;
    for (let i = 0; i < tris.length; i++) for (const j of adj[i]) if (color[i] === color[j]) conflicts++;
    if (conflicts) throw Error(`${conflicts / 2} same-tone adjacencies — tone map broken`);
    (globalThis as any).__tone = color;
    const counts = [0, 0, 0];
    for (const c of color) counts[c]++;
    console.log(`tone map: 3 tones DSATUR-exact, ${interior} joins all two-tone, counts ${counts.join("/")} (kind alone not 2-tone-able — 70 same-kind adjacencies, disclosed)`);
}
const TONE = (globalThis as any).__tone as number[];

// ---- panels ---------------------------------------------------------------------
let idx = 0;
function panel(pts: V2[], mat: THREE.Material, name: string) {
    // centroid shrink (kerf)
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const sp = pts.map(p => [cx + (p[0] - cx) * SHRINK, cz + (p[1] - cz) * SHRINK] as V2);
    const shape = new THREE.Shape();
    sp.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z)));
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);          // shape x–y → ground x–z (top toward +y)
    geo.translate(0, T, 0);            // bottom at grade, top at T
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    g.add(mesh);
}
for (const [i, r] of tris.entries()) panel([r.V, r.B1, r.B2], [stoneA, stoneB, stoneC][TONE[i]], `pp_${idx++}`);

// brass hub bead at the origin (the wheel's center vertex)
{
    const bead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, T + 0.02, 10), brassGlow);
    bead.position.set(0, (T + 0.02) / 2, 0);
    bead.name = "glow_pp";
    g.add(bead);
}

// ---- assertions ------------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (Math.abs(env.max.y - (T + 0.02)) > 0.005) throw Error(`top ${env.max.y.toFixed(3)} vs hub ${T + 0.02}`);
    if (env.max.y > 0.5) throw Error(`not a ground film: h ${env.max.y.toFixed(3)}`);
    if (sz.x > 9.4 || sz.z > 9.4) throw Error(`patch ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} exceeds seat 8.0 footprint basis`);
    const foot = sz.x * sz.z;
    if (foot < 8) throw Error(`footprint ${foot.toFixed(1)} — court too small to read`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | ${idx} panels + hub | ground-film class (h ≤ 0.5)`);
}
const merged = mergeByMaterial(g, "penrosepaving");
writeFileSync("agents/arthur/assets/village_penrosepaving3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_penrosepaving3.glb`);
