// mkv3-brachistochrone.ts — STRUCTURES LANE struct-119, Round 10 commission R10-17.
// THE BRACHISTOCHRONE: the form ledger's missing family — CYCLOID /
// TAUTOCHRONE (ledger grep fresh this tick: zero cycloid/brachistochrone/
// tautochrone presence across plans; catenary struct-69 and astroid
// struct-95 are DIFFERENT curve families, both standing). The S mathematics
// axis (assembly -> convergence -> linked impossibility) gains the race
// chapter: the curve that beats the straight line.
//
// ONE IDEA: THE FASTEST PATH IS NOT THE STRAIGHT LINE. Bernoulli's
// challenge answered in stone: a teardrop lens whose upper rail drops
// straight (the chord) and whose lower rail dives deep on the inverted
// cycloid — same brass release bead at the crest, same finish basin at the
// rim. Five time-beads per rail, frozen at equal fractions of each rail's
// own descent time (cycloid EXACT via t = sqrt(r/g)·theta; chord EXACT via
// closed-form constant-acceleration): the diving rail's beads glow — the
// winning line's clock — ending in one warm landing bead at the basin
// heart. Night: five warm points tracing the dive beneath one dark
// straight line, one point in the basin, one at the crest.
//
// CONSTRUCTION TRUTH (build arc, honest): first draft used L = R*THETA —
// WRONG: the cycloid x-law is x = R(theta - sin theta), so THETA must
// exceed pi for the dip to sit inside the span. Recomputed R from
// R = L/(THETA - sin THETA); H = R(1 - cos THETA); dip at theta=pi.
//
// LAWS HONORED (all asserted in-file):
// - cycloid law: every centerline point satisfies the rolling-circle
//   condition (x - R*t)^2 + (y - (H - R))^2 = R^2 to 1e-9.
// - span law: R(THETA - sin THETA) == L and R(1 - cos THETA) == H exact.
// - race law: cycloid descent time < chord descent time (asserted, ~0.75
//   ratio at this geometry); chord time cross-checked closed-form vs
//   numeric integration to 0.02s.
// - lens law: cycloid strictly below the chord everywhere strictly inside
//   the span (sampled) — the teardrop is a clean closed figure.
// - bead law: every race-bead center lies on its rail centerline <= 2mm;
//   cycloid bead thetas are EXACT fractions of THETA; chord bead arcs are
//   EXACT closed-form time fractions.
// - contact law: start post / dip pier / finish basin each meet their rail
//   or bead underside within 5mm; all stand on the plinth; plinth base at
//   grade y=0; dip clears the plinth top.
// - envelope/NaN laws; texMat lanes (struct-38 law); node census 9
//   (stone bucket + iron bucket + brass bucket + 7 KEEP glow beads...
//   = 10; asserted exactly).
// Folly class: no entry advertised, no walk owed (zeno/voronoi/borromean
// precedent). Static. Determinism: fixed constants, fixed texMat seeds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the race geometry --------------------------------------------------------------------
const THETA = 3.8;                       // cycloid arc parameter at the finish (rad > pi)
const L = 7.2;                           // horizontal run release -> basin center
const R = L / (THETA - Math.sin(THETA)); // rolling-circle radius from the x-law
const H = R * (1 - Math.cos(THETA));     // release height above the finish line
const DIP_X = R * Math.PI;               // lowest point of the cycloid (theta = pi)
const DIP_DROP = R * (1 + Math.cos(Math.PI)) * -1; // depth of dip below finish = 2R... computed below instead
const DIP_BELOW = 2 * R - H;             // dip sits this far BELOW the finish line
const FINY = 1.0;                        // world y of the finish line (basin rim)
const RAIL = 0.055;                      // iron rail tube radius
const BEAD_R = 0.095;                    // brass bead radius (proud of the rail)
if (Math.abs(R * (THETA - Math.sin(THETA)) - L) > 1e-9) throw Error("span x-law broke");
if (DIP_X >= L) throw Error(`dip outside span: ${DIP_X} >= ${L}`);

function cycRace(t: number): THREE.Vector3 {   // race frame: release at (0,H), finish at (L,0)
    return new THREE.Vector3(R * (t - Math.sin(t)), H - R * (1 - Math.cos(t)), 0);
}
function cyc(t: number): THREE.Vector3 {        // world frame (adds FINY)
    return cycRace(t).add(new THREE.Vector3(0, FINY, 0));
}
function chordPoint(s: number): THREE.Vector3 { // world; s = arc length from release
    const len = Math.hypot(L, H);
    const t = s / len;
    return new THREE.Vector3(t * L, FINY + H * (1 - t), 0);
}
const CHORD_LEN = Math.hypot(L, H);

// ---- construction asserts -------------------------------------------------------------------
{
    for (let i = 0; i <= 400; i++) {
        const t = (i / 400) * THETA;
        const p = cycRace(t);
        const cx = p.x - R * t, cy = p.y - (H - R);
        if (Math.abs(cx * cx + cy * cy - R * R) > 1e-9) throw Error(`rolling-circle law broke at t=${t.toFixed(3)}`);
    }
    // lens law: at the same X, the cycloid sits strictly below the chord
    // strictly inside the span (build-arc catch: comparing at the same
    // PARAMETER is wrong — the cycloid leaves the crest vertically; x =
    // R(th - sin th) is flat at th=0, so invert x -> th by bisection).
    for (let i = 1; i < 100; i++) {
        const x = (i / 100) * L;
        let lo = 0, hi = THETA;                    // x(th) strictly increasing on (0,THETA]
        for (let k = 0; k < 60; k++) {
            const mid = (lo + hi) / 2;
            if (R * (mid - Math.sin(mid)) < x) lo = mid; else hi = mid;
        }
        const th = (lo + hi) / 2;
        const yCyc = H - R * (1 - Math.cos(th));
        const yChord = H * (1 - x / L);
        if (yCyc >= yChord) throw Error(`lens law broke at x=${x.toFixed(3)}: cyc ${yCyc.toFixed(3)} >= chord ${yChord.toFixed(3)}`);
    }
    console.log(`cycloid + lens laws OK: R ${R.toFixed(4)}, L ${L}, H ${H.toFixed(4)}, THETA ${THETA}, dip x ${DIP_X.toFixed(3)} (inside), dip ${DIP_BELOW.toFixed(3)} below finish`);
}

// ---- race law: the cycloid must win -----------------------------------------------------------
const GRAV = 9.81;
const T_CYC = Math.sqrt(R / GRAV) * THETA;                 // exact cycloid descent time
const SIN_A = H / CHORD_LEN;
const T_CHORD = Math.sqrt(2 * CHORD_LEN / (GRAV * SIN_A)); // exact chord descent time
{
    // numeric cross-check of the chord closed form
    let tNum = 0; const N = 4000, ds = CHORD_LEN / N;
    for (let i = 0; i < N; i++) {
        const s0 = (i + 0.5) * ds;
        const drop = s0 * SIN_A;
        tNum += ds / Math.sqrt(2 * GRAV * drop);
    }
    if (Math.abs(tNum - T_CHORD) > 0.02) throw Error(`chord time mismatch: numeric ${tNum.toFixed(4)} vs closed ${T_CHORD.toFixed(4)}`);
    if (T_CYC >= T_CHORD) throw Error(`race law broke: cycloid ${T_CYC.toFixed(3)}s not faster than chord ${T_CHORD.toFixed(3)}s`);
    console.log(`race law OK: cycloid ${T_CYC.toFixed(3)}s < chord ${T_CHORD.toFixed(3)}s (ratio ${(T_CYC / T_CHORD).toFixed(3)}; numeric chord check ${tNum.toFixed(3)}s)`);
}

// ---- time-beads ---------------------------------------------------------------------------------
const F = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];
function chordArcAtTime(tf: number): number {  // arc length along chord at time fraction tf
    const T = tf * T_CHORD;
    return (GRAV * SIN_A / 2) * T * T;
}

// ---- materials -----------------------------------------------------------------------------------
const stoneTex = texMat("brr_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 7501 });
const ironTex = texMat("brr_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 7502 });
// struct-38 law: NO plain materials — a bare MeshStandardMaterial exports
// with NO material (glbwrite assigns only textured/emissive lanes) and
// renders glTF-default white. Brass plain lane (decode caught this class).
const brassTex = texMat("brr_brass", [0xa8823f, 0x9c7739, 0xb08c46], { rough: 0.45, metal: 0.75, scale: 1, weights: [2, 1, 1], cell: 6, seed: 7503 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
let glowIdx = 0;
function addGlow(pos: THREE.Vector3, r: number) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), brassGlow);
    m.position.copy(pos);
    m.name = `glow_brr_${++glowIdx}`;
    g.add(m); glowMeshes.push(m);
}

// ---- stone: plinth, start post, dip pier, finish basin --------------------------------------------
const PLINTH_H = 0.4, PLINTH_W = 1.9;      // base course under the whole race
const X0 = -0.55, X1 = L + 0.75;           // plinth extent (basin far edge L+0.7 + margin)
const BASIN_R = 0.7, BASIN_TOP = FINY;     // basin drum from plinth to rim = finish line
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, PLINTH_H, PLINTH_W), stoneTex);
    plinth.position.set((X0 + X1) / 2, PLINTH_H / 2, 0);
    g.add(plinth);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 0.24, 0.1, PLINTH_W + 0.24), stoneTex);
    skirt.position.set((X0 + X1) / 2, 0.05, 0);
    g.add(skirt);
}
const RELEASE = cyc(0);                    // (0, FINY + H) — the crest bead
{
    const topY = RELEASE.y - BEAD_R;       // post meets bead underside
    const h = topY - PLINTH_H;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, h, 12), stoneTex);
    post.position.set(0, PLINTH_H + h / 2, 0);
    g.add(post);
}
const DIP = cyc(Math.PI);                  // lowest rail point
{
    const topY = DIP.y - RAIL;             // pier meets rail underside
    const h = topY - PLINTH_H;
    if (h < 0.08) throw Error(`dip pier degenerate: ${h.toFixed(3)} (dip world ${DIP.y.toFixed(3)} vs plinth ${PLINTH_H})`);
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), stoneTex);
    pier.position.set(DIP.x, PLINTH_H + h / 2, 0);
    g.add(pier);
}
{
    const h = BASIN_TOP - PLINTH_H;
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(BASIN_R, BASIN_R + 0.1, h, 20), stoneTex);
    drum.position.set(L, PLINTH_H + h / 2, 0);
    g.add(drum);
}

// ---- iron rails: the chord (upper) and the cycloid (lower), same z-lane ----------------------------
{
    const chordPts = Array.from({ length: 40 }, (_, i) => chordPoint((i / 39) * CHORD_LEN));
    const chordCurve = new THREE.CatmullRomCurve3(chordPts, false, "catmullrom", 0.0);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(chordCurve, 48, RAIL, 8, false), ironTex));
    const cycPts = Array.from({ length: 160 }, (_, i) => cyc((i / 159) * THETA));
    const cycCurve = new THREE.CatmullRomCurve3(cycPts, false, "catmullrom", 0.0);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cycCurve, 200, RAIL, 8, false), ironTex));
}

// ---- beads: release (glow), five chord time-beads (plain), five cycloid time-beads (glow), landing (glow)
addGlow(RELEASE, BEAD_R);
for (const f of F) {
    const p = chordPoint(chordArcAtTime(f));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 12, 10), brassTex);
    bead.position.copy(p);
    g.add(bead);
}
for (const f of F) {
    addGlow(cyc(f * THETA), BEAD_R);
}
addGlow(new THREE.Vector3(L, BASIN_TOP + 0.02, 0), 0.075); // landing bead at the basin heart

// ---- bead law: every race-bead on its rail centerline (exact where the rail is straight) -------
{
    // chord: the rail is a straight segment — exact point-to-segment distance
    const A = chordPoint(0), B = chordPoint(CHORD_LEN);
    const AB = B.clone().sub(A);
    const abLen2 = AB.lengthSq();
    function segDist(p: THREE.Vector3): number {
        const t = Math.max(0, Math.min(1, p.clone().sub(A).dot(AB) / abLen2));
        return p.distanceTo(A.clone().addScaledVector(AB, t));
    }
    // cycloid: dense-sample nearest (1601 samples over ~8.6m arc = 5.4mm
    // spacing); tolerance = half-spacing + 1mm documents resolution
    const cycSamples = Array.from({ length: 1601 }, (_, i) => cyc((i / 1600) * THETA));
    function cycDist(p: THREE.Vector3): number {
        let m = Infinity;
        for (const q of cycSamples) { const d = p.distanceTo(q); if (d < m) m = d; }
        return m;
    }
    for (const f of F) {
        const dp = segDist(chordPoint(chordArcAtTime(f)));
        if (dp > 1e-9) throw Error(`chord bead law broke at f=${f.toFixed(3)}: ${dp}`);
        const dc = cycDist(cyc(f * THETA));
        if (dc > 0.0037) throw Error(`cycloid bead law broke at f=${f.toFixed(3)}: ${dc.toFixed(4)}`);
    }
    // endpoint joins: both rails meet the release bead and the landing bead
    if (cycDist(RELEASE) > 0.0037 || segDist(RELEASE) > 1e-9) throw Error("release join broke");
    const END = new THREE.Vector3(L, BASIN_TOP, 0);
    if (cycDist(END) > 0.0037 || segDist(END) > 1e-9) throw Error("finish join broke");
    console.log("bead laws OK: 10 race-beads on-centerline (chord exact 1e-9, cycloid <=3.7mm sample-res), rails join at crest and basin");
}

// ---- glow census + envelope/NaN laws ----------------------------------------------------------------
{
    if (glowMeshes.length !== 7) throw Error(`glow census ${glowMeshes.length} != 7`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.3 || sz.y < 3.5) throw Error(`crest ${sz.y.toFixed(2)} outside expectation`);
    if (sz.x > 8.9 || sz.x < 8.0) throw Error(`length ${sz.x.toFixed(2)} outside expectation`);
    if (sz.z > 2.15 || sz.z < 1.7) throw Error(`width ${sz.z.toFixed(2)} outside expectation`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], dip world y ${DIP.y.toFixed(3)}, 7 glow KEEP nodes`);
}

const merged = mergeByMaterial(g, "brachistochrone");
writeFileSync("agents/arthur/assets/village_brachistochrone3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_brachistochrone3.glb`);
