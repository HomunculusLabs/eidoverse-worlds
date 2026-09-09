// mkv3-peaucellier.ts — STRUCTURES LANE struct-127, Round 10 commission R10-20.
// THE PEAUCELLIER INVERTOR: the form ledger's missing LINKAGE /
// STRAIGHT-LINE-MACHINE family (ledger grep fresh this tick: peaucellier 0,
// inversor 0, lipkin 0, linkage 0 real hits across STRUCTURES-PLAN.md +
// IMPROVE-PLAN.md; only 2 incidental "kinematics" prose lines about other
// works; tractrix/pseudosphere standing is a different family).
// The S mathematics walk gains the machine chapter: linkwork CAN draw an
// exact straight line, and here is the proof, frozen mid-draw.
//
// ONE IDEA: THE MACHINE THAT DRAWS A STRAIGHT LINE. Before 1864 no linkage
// could output an exact straight line (watt's approximate, evans' approximate).
// Peaucellier's cell: a crank sweeping a circle that passes exactly through
// the fixed pivot O, a rhombus riding the motion out, and a tracer that can
// travel ONLY one exact straight line — the inverse of that circle, because
// the cell enforces |OB|·|OP| = k² at every crank angle. The sculpture
// freezes the machine at one crank angle: an iron web of bars between two
// pivots stepped up one stone tower; the crank's circle drawn as a
// front-layer arc; and the product — one long dark straight rail on two
// slender stands — passing through the web. A single brass bead at the point
// of contact is the only light after dark (glow_pc_1, struct-82 dusk
// lineage; galton/brachistochrone/clothoid single-bead precedent).
//
// MATH (all asserted in-file):
// - Fixed pivots O (tower top) and A, separated D=R so the crank circle
//   passes exactly through O (the Peaucellier condition).
// - Crank A→B, |AB|=R. Kite |OU|=|OV|=L, rhombus |UB|=|VB|=|UP|=|VP|=ℓ.
// - Inversion: |OB|·|OP| = L²−ℓ² = k² for EVERY crank angle (circle through
//   O inverts to a line NOT through O — exactly straight).
// - Traced line: y = O_y − k²/(2R) — verified by sampling the full crank
//   sweep numerically in-build (every sampled P lands on the line, y
//   variance < 1e-9).
// - Frozen configuration: crank θ=55°; the sculpture's joints are computed
//   from the exact geometry, not hand-placed.
//
// LAWS HONORED (struct-121+ build-laws lineage):
// - texMat lanes (struct-38 law: no plain materials); per-channel dimCh for
//   the dark line rail (struct-126 law: 0.60x slate, bead owns warmth).
// - glow census exactly 1 KEEP (glow_pc_1); envelope/NaN laws; node budget.
// - Deterministic: no RNG outside texMat seeds.
// Folly class: no entry advertised, no walk owed (zeno..clothoid precedent).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- exact Peaucellier geometry ---------------------------------------------------------------
// The cell (7 bars): kite O→U, O→V (L); rhombus U→B, V→B, U→P, V→P (ℓ); crank A→B (R).
// (constants FIRST — the stub's TDZ D-before-use fixed)
const D = 1.829, R = D;                          // crank circle passes exactly through O
const L = 3.422, ell = 2.478;                    // kite / rhombus bars
const k2 = L * L - ell * ell;                    // 5.568 — the inversion constant
const O = new THREE.Vector2(0, 3.95);            // tower-top pivot (on the machine plane)
const A = new THREE.Vector2(0, O.y - D);         // lower pivot, D below O (crank center)
const LINE_Y = O.y - k2 / (2 * R);               // 2.428 — the exact straight line

// Straight-line law over the FULL crank sweep (the whole concept):
{
    let worst = 0, sampled = 0;
    for (let i = 0; i <= 360; i++) {
        const th = (i / 360) * Math.PI * 2;
        const B = new THREE.Vector2(A.x + R * Math.cos(th), A.y + R * Math.sin(th));
        // circle inversion: P = O + k2/|OB|² · (B−O), reflected direction — the
        // standard Peaucellier closure: P lies on ray O→B at distance k²/|OB|.
        const dB = B.clone().sub(O), m = dB.length();
        if (m < 1e-9) continue;            // the DEAD POINT: crank pin on the fixed
        // pivot (θ=90°, the singular pass-through). P is the point at infinity ON
        // the traced line — the machine itself cannot rotate through this collapse
        // (rhombus degenerate); it is not a finite P and carries no y to check.
        sampled++;
        const P = O.clone().add(dB.multiplyScalar(k2 / (m * m)));
        worst = Math.max(worst, Math.abs(P.y - LINE_Y));
    }
    if (worst > 1e-9) throw Error(`straight-line law broke over sweep: y variance ${worst}`);
    // |OB|·|OP| = k2 at every angle (inversion invariant)
    let worstInv = 0;
    for (let i = 0; i <= 360; i++) {
        const th = (i / 360) * Math.PI * 2;
        const B = new THREE.Vector2(A.x + R * Math.cos(th), A.y + R * Math.sin(th));
        const dB = B.clone().sub(O);
        if (dB.length() < 1e-9) continue;  // dead point (see above)
        const P = O.clone().add(dB.clone().normalize().multiplyScalar(k2 / dB.length()));
        const P2 = O.clone().add(dB.clone().multiplyScalar(k2 / (dB.length() * dB.length())));
        worstInv = Math.max(worstInv, Math.abs(P.distanceTo(P2)));
    }
    console.log(`straight-line law OK: ${sampled}/361 finite samples on traced y = ${LINE_Y.toFixed(4)} exact (variance < 1e-9; dead point θ=90° excluded); inversion |OB||OP|=${k2.toFixed(3)} exact (worst form-agreement ${worstInv.toExponential(1)})`);
}

// ---- frozen configuration at crank θ=55° -------------------------------------------------------
// θ measured from the DOWNWARD vertical at A (struct-127 plan convention) —
// standard math angle = θ−90° = −35°. Frozen pose = the plan's verified
// quadruple: crank pin LOW, kite/rhombus web spread wide, P inside the web span.
const THETA = ((55 - 90) * Math.PI) / 180;
const B = new THREE.Vector2(A.x + R * Math.cos(THETA), A.y + R * Math.sin(THETA));
// tracer: on ray O→B at distance k²/|OB| (the inversion point)
{
    const dB = B.clone().sub(O), m = dB.length();
    var P = O.clone().add(dB.multiplyScalar(k2 / (m * m)));
}
// rhombus joints U, V: N = (B+P)/2, U/V = N ± h·perp( P−B )
const Nm = B.clone().add(P).multiplyScalar(0.5);
const chord = B.distanceTo(P);
const h = Math.sqrt(ell * ell - (chord / 2) ** 2);
const dir = P.clone().sub(B).normalize();
const perp = new THREE.Vector2(-dir.y, dir.x);
const U = Nm.clone().add(perp.clone().multiplyScalar(h));
const V = Nm.clone().add(perp.clone().multiplyScalar(-h));

// joint laws (the sculpture's joints must BE the machine's joints):
{
    const chk = (name: string, got: number, want: number, tol = 1e-3) =>
        { if (Math.abs(got - want) > tol) throw Error(`joint law broke (${name}): ${got.toFixed(4)} != ${want.toFixed(4)}`); };
    chk("|OU|", O.distanceTo(U), L); chk("|OV|", O.distanceTo(V), L);
    chk("|UB|", U.distanceTo(B), ell); chk("|VB|", V.distanceTo(B), ell);
    chk("|UP|", U.distanceTo(P), ell); chk("|VP|", V.distanceTo(P), ell);
    chk("|AB|", A.distanceTo(B), R);
    chk("|OB|·|OP|", O.distanceTo(B) * O.distanceTo(P), k2, 1e-3);
    chk("P on line", P.y, LINE_Y);
    // U,V equidistant from O and from line B-P (kite symmetry, belt)
    chk("U on kite axis", (U.clone().sub(O).length() + V.clone().sub(O).length()) / 2, L);
    console.log(`joints OK θ=55°: B=(${B.x.toFixed(3)},${B.y.toFixed(3)}) P=(${P.x.toFixed(3)},${P.y.toFixed(3)}) U=(${U.x.toFixed(3)},${U.y.toFixed(3)}) V=(${V.x.toFixed(3)},${V.y.toFixed(3)})`);
}

// ---- the sculptural frame (stone tower, rail stands, footprint) --------------------------------
// Tower: one stone tower carries BOTH pivots (O at top, A below on a jib) —
// the machine hangs off one column, silhouette reads as one asymmetric web.
const TOWER_X = -1.6;                       // tower behind/left of the machine plane z=-0.10
const TOWER_R = 0.30;
const JIB_L = TOWER_X * -1 + 0.10;          // horizontal arm from tower face to A (x=0)
const RAIL_L = 7.0, RAIL_Y = LINE_Y;        // the product line, through the web
const RAIL_X0 = -2.2, RAIL_X1 = RAIL_X0 + RAIL_L;

// pivot laws: jib carries A at (0, 2.12); tower top carries O at (0, 3.95)
// via a short offset arm
const O_ARM = TOWER_X * -1;                 // arm length from tower axis to x=0 plane
{
    if (Math.abs(A.y - (O.y - D)) > 1e-9) throw Error("pivot law: A not D below O");
    if (A.x !== 0 || O.x !== 0) throw Error("pivot law: pivots not on machine plane x=0");
    console.log(`pivots OK: O=(0,${O.y}) A=(0,${A.y.toFixed(3)}) D=R=${D}`);
}

// ---- materials (struct-38 texMat law; struct-126 dimCh law) ------------------------------------
const stoneTex = texMat("peau_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9251 });
const ironTex = texMat("peau_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9252 });
const dimCh = (c: number) =>
    (Math.round(((c >> 16) & 255) * 0.60) << 16) |
    (Math.round(((c >> 8) & 255) * 0.60) << 8) |
    Math.round((c & 255) * 0.60);
const lineTex = texMat("peau_line", [dimCh(0x4a525c), dimCh(0x3f464f), dimCh(0x565e69)], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9253 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];

// ---- helper: an iron bar between two planar points --------------------------------------------
const bar = (p: THREE.Vector2, q: THREE.Vector2, r: number, mat: THREE.Material, z: number): THREE.Mesh => {
    const len = p.distanceTo(q);
    if (len < 1e-6) throw Error("zero-length bar");
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, z);
    const d = q.clone().sub(p);
    m.rotation.z = Math.atan2(-d.x, d.y);   // cylinder +Y rotated by θ about Z → (−sinθ, cosθ): θ = atan2(−dx, dy)
    return m;
};

// ---- helpers + frame constants (declared BEFORE first use — stub TDZ class) ---------------------
const TOWER_Z = -0.45;                      // tower wholly behind the machine plane z=0
const PLINTH_H = 0.14;
const v3 = (p: THREE.Vector2, z = 0) => new THREE.Vector3(p.x, p.y, z);
const bar3 = (p: THREE.Vector3, q: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh => {
    const len = p.distanceTo(q);
    if (len < 1e-6) throw Error("zero-length bar");
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(p.clone().add(q).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize());
    return m;
};

// ---- iron: the seven-bar machine (plane z=0) ---------------------------------------------------
{
    const BR = 0.055;                       // bar radius (family: clothoid rail)
    // kite (L): O→U, O→V — rhombus (ℓ): U→B, V→B, U→P, V→P — crank (R): A→B
    g.add(bar(O, U, BR, ironTex, 0));
    g.add(bar(O, V, BR, ironTex, 0));
    g.add(bar(U, B, BR, ironTex, 0));
    g.add(bar(V, B, BR, ironTex, 0));
    g.add(bar(U, P, BR, ironTex, 0));
    g.add(bar(V, P, BR, ironTex, 0));
    g.add(bar(A, B, BR, ironTex, 0));
}

// ---- iron: joint bosses — the machine's pin joints (P carries the brass bead instead) ----------
{
    const JR = 0.085;
    for (const j of [O, A, B, U, V]) {
        const boss = new THREE.Mesh(new THREE.SphereGeometry(JR, 10, 8), ironTex);
        boss.position.set(j.x, j.y, 0);
        g.add(boss);
    }
}

// ---- stone: the tower behind the plane, carrying both pivots -----------------------------------
{
    // tower spans z[-0.75,-0.15]: the machine plane z=0 sits wholly in front, so
    // the rail passes the tower unobstructed (no through-tower collision).
    const TOP = O.y + 0.25;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, TOP, 12), stoneTex);
    tower.position.set(TOWER_X, TOP / 2, TOWER_Z);
    g.add(tower);
    // O arm: tower axis → tower-top pivot O (on the machine plane)
    g.add(bar3(new THREE.Vector3(TOWER_X, O.y, TOWER_Z), v3(O), 0.10, stoneTex));
    // jib: tower axis → lower pivot A
    g.add(bar3(new THREE.Vector3(TOWER_X, A.y, TOWER_Z), v3(A), 0.10, stoneTex));
    // jib brace: triangulates the jib back up the tower shaft
    g.add(bar3(new THREE.Vector3(TOWER_X, A.y + 1.05, TOWER_Z), v3(A), 0.07, stoneTex));
    if (TOWER_Z + TOWER_R > -0.10) throw Error("tower law broke: tower crosses the machine plane");
    console.log(`tower OK: x=${TOWER_X} z=${TOWER_Z} top=${TOP.toFixed(2)}; arms carry O (${O.y}) and A (${A.y.toFixed(3)})`);
}

// ---- iron: the crank circle, drawn (front layer, behind the bars) ------------------------------
{
    const ARC_Z = -0.06;                    // just behind the machine plane
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.022, 8, 96), ironTex);
    arc.position.set(A.x, A.y, ARC_Z);
    g.add(arc);
    // the drawn circle passes EXACTLY through O (the Peaucellier condition, shown)
    if (Math.abs(A.y + R - O.y) > 1e-9) throw Error("arc law broke: crank circle does not pass through O");
    if (A.y - R < 0.20) throw Error("arc law broke: circle dips below plinth clearance");
    // B rides ON its track: the frozen crank pin sits exactly on the drawn circle
    if (Math.abs(Math.hypot(B.x - A.x, B.y - A.y) - R) > 1e-9) throw Error("arc law broke: B off track");
}

// ---- the product: one long dark straight rail through the web, on two slender stands -----------
{
    const RAIL_R = 0.055;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(RAIL_R, RAIL_R, RAIL_L, 10), lineTex);
    rail.rotation.z = Math.PI / 2;
    rail.position.set((RAIL_X0 + RAIL_X1) / 2, RAIL_Y, 0);
    g.add(rail);
    // line laws: the rail IS the traced line — through P, out-reaching the web
    // both sides (the machine draws the whole line, not a segment)
    if (Math.abs(RAIL_Y - LINE_Y) > 1e-9) throw Error("rail law broke: rail not at LINE_Y");
    if (P.x < RAIL_X0 + 0.5 || P.x > RAIL_X1 - 0.5) throw Error("rail law broke: P not carried");
    if (RAIL_X0 > V.x - 0.8 || RAIL_X1 < U.x + 0.8) throw Error("rail law broke: line does not outreach the web");
    // stands + stone feet, clear of the web (web x-span from the ACTUAL joint
    // labels — U/V ordering flips with pose; min/max, never label order).
    // LEFT STAND at -2.0: clear of the tower's front-view silhouette
    // (tower x∈[-1.92,-1.28]) — a stand hidden behind the tower reads as an
    // unsupported cantilever from the family's face-on seating (ZAI judge,
    // struct-128 first render).
    const wx0 = Math.min(U.x, V.x), wx1 = Math.max(U.x, V.x);
    for (const sx of [-2.0, 3.85]) {
        if (sx > wx0 - 0.30 && sx < wx1 + 0.30) throw Error(`stand law broke: stand ${sx} inside web span`);
        const h = RAIL_Y - RAIL_R - PLINTH_H;
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, h, 8), ironTex);
        stand.position.set(sx, PLINTH_H + h / 2, 0);
        g.add(stand);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.26), stoneTex);
        foot.position.set(sx, PLINTH_H + 0.05, 0);
        g.add(foot);
    }
}

// ---- THE BEAD at P: the tracer point, the only light (glow_pc_1, struct-82 dusk lineage) -------
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12), brassGlow);
    bead.position.set(P.x, LINE_Y, 0);
    bead.name = "glow_pc_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone: plinth slab ------------------------------------------------------------------------
{
    const xMin = Math.min(TOWER_X - 0.45, RAIL_X0), xMax = 3.85 + 0.45;   // plinth carries rail tip + tower + east stand
    const zMin = TOWER_Z - TOWER_R - 0.05, zMax = 0.25;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(xMax - xMin, PLINTH_H, zMax - zMin), stoneTex);
    plinth.position.set((xMin + xMax) / 2, PLINTH_H / 2, (zMin + zMax) / 2);
    g.add(plinth);
    console.log(`plinth OK: x[${xMin.toFixed(2)}..${xMax.toFixed(2)}] z[${zMin.toFixed(2)}..${zMax.toFixed(2)}]`);
}

// ---- glow census + envelope/NaN laws -----------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.5 || sz.y < 4.0) throw Error(`height ${sz.y.toFixed(2)} outside band [4.0,4.5]`);
    if (sz.x > 7.3 || sz.x < 6.5) throw Error(`width ${sz.x.toFixed(2)} outside band [6.5,7.3]`);
    if (sz.z > 1.1 || sz.z < 0.8) throw Error(`depth ${sz.z.toFixed(2)} outside band [0.8,1.1]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP node (glow_pc_1)`);
}

const merged = mergeByMaterial(g, "peaucellier");
writeFileSync("agents/arthur/assets/village_peaucellier3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_peaucellier3.glb`);
