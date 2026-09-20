// mkv3-trioct.ts — STRUCTURES LANE struct-277, Round 11 commission R11-85.
// THE TRIAKIS OCTAHEDRON — the Catalan dual of the standing truncated cube
// (tcube, struct-249/250, S-SW band az228.5 r83.0 — AT CAP 6). Catalan
// branch member 7 (rt struct-235; dtria struct-267/268; deltoid
// struct-269/270; triakis struct-271/272; tetrakis struct-273/274; trit
// struct-275/276). Dual-of-standing-parent move a SEVENTH time
// (gsd->gdodec, trico->dtria, rico->deltoid, tdodec->triakis,
// toct->tetrakis, tret->trit, tcube->trioct). The LAST unclaimed achiral
// small Catalan (struct-276 directive) — parents toct/trcubo N-E AT CAP,
// so this is the SECOND family member to seat OUTSIDE its parent's
// quarter (R11-86 seat: fresh under-served octant, surfaced when placed).
//
// ONE IDEA: THE DEEPER CUT'S GHOST, READ THROUGH THE LOOKING GLASS. The
// parent tcube told THE DEEPER CUT — octagon regularity demands cutting
// past the family's 1/3 law to u = 1−1/√2, and even then 96.65% stands.
// The polar reciprocal about its midsphere (rho == √2 exact, both edge
// classes) turns every parent face into a POINT and every one of the 24
// tcube vertices into an ISOCELES sail — one ghost apex + two oct wings,
// every sail kissing ONE insphere at rho^2/R (Catalan tangent property,
// probe T6). THE RANK INVERSION IS THE STORY: the six untouched faces
// stand as the SIX GREAT OUTER POINTS at exactly 2 on the axes — THE
// OCTAHEDRON ITSELF, the cube's own dual surfacing through the cut —
// while the eight razor-ghosts sink to 2√3(√2−1) ≈ 1.435 on the
// diagonals (ratio (1+√2)/√3 exactly), tenting the octahedron's eight
// faces with the flattest apexes in the fleet (arccos((1−2√2)/4) ≈
// 117.20deg OBTUSE). Wings/base == 2−√2 EXACTLY — the parent's own
// corner-tet leg constant returning in the dual's sail. Presentation:
// OCT-POINT-DOWN 4-fold on the parent's own seated frame INHERITED
// (face-down Rx(90°) + cardinals dead-on, NO twist-snap). STONE carries
// all 24 sails (ONE face family = ONE sail material — the
// face-transitivity read in the material law) + the TWENTY-FOUR-sided
// dais (one side per sail, theme-number law); IRON carries all 36 seam
// bonds + the crown finial stem. Night contract: the parent's OWN bead
// census transcribed to the dual — its six lit octagon centers become
// the six OCT-POINTS: 1 crown FINIAL on the iron stem + 4 WAIST at the
// exact cardinals + the SIXTH PRESSED into the earth beneath the foot,
// fully buried in the dais band (tico's-twelfth idiom — five read at
// night, six in truth, disclosed); the eight razor-ghosts stay dark:
// absence is the mark of the removed corners = glow_trioct_6.
//
// Laws honored: texMat lanes (struct-38) — trioct_stone/trioct_iron;
// bead emissive 0x9a7030 @ 1.4 in-GLB (family build-time law); glow
// census exactly 1 KEEP group (glow_trioct_6); ROOT STAYS IDENTITY
// (struct-188); plate basis BAKED INTO GEOMETRY (applyMatrix4); NaN 0;
// below-grade 0; dais APOTHEM-FIRST (struct-247).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, BEADS,
    CROWN_IDX, STEM_H,
    ROD_R, BEAD_R,
    PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    ENVELOPE,
} from "../struct277-probe-trioct.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("trioct_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 277 });
const ironTex = texMat("trioct_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 278 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // family build-time law: face-center beads sit at exposure threshold at 1.0; +40% clears oblique reads without bloom
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// rod from P to Q (heightSegments 2: mid-ring verts exist for the decode coverage law)
function rod(P: [number, number, number], Q: [number, number, number]): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, len, 10, 2), ironTex);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
}

// ---- iron: the thirty-six seam bonds (one per tcube edge — the dual edge census) ---------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — one dual edge per parent edge (bijection 36<->36; TWO length classes 24 oct-ghost wings + 12 oct-oct bases — the honest non-uniform Catalan signature; zero ghost-ghost, the razors never met in the parent)`);
}

// ---- panels: 24 stone isoceles sails (baked basis) ----------------------------------------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let sailCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
        // in-plane basis from the first face corner
        const d0 = new THREE.Vector3(...V[FACE_V[u][0]]).sub(c);
        const e1n = d0.clone().normalize();
        const e2n = new THREE.Vector3().crossVectors(n, e1n);
        // face → 2D, inset PLATE_INSET toward c (uniform radial shrink)
        const pts = FACE_V[u].map((vi) => {
            const d = new THREE.Vector3(...V[vi]).sub(c);
            const r = d.length();
            const s = (r - PLATE_INSET) / r;
            const q = d.multiplyScalar(s);
            return [q.dot(e1n), q.dot(e2n)] as [number, number];
        });
        const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: PLATE_T, bevelEnabled: false });
        geo.translate(0, 0, -PLATE_T / 2);    // center on local z = 0
        // bake: local (x,y,z) → c + e1n·x + e2n·y + n·(z + sSide)
        const m4 = new THREE.Matrix4().makeBasis(e1n, e2n, n);
        m4.setPosition(c.clone().addScaledVector(n, sSide));
        geo.applyMatrix4(m4);
        g.add(new THREE.Mesh(geo, stoneTex));
        sailCount++;
    }
    console.log(`panels: ${sailCount} stone isoceles sails (ONE face family = ONE sail material — the face-transitivity read in the material law; each sail a tcube vertex figure: one ghost apex + two oct wings, wings/base exactly 2−√2 — the parent's own corner-tet leg constant; inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — probe T8: every plate vertex strictly inside the solid`);
}

// ---- brass glow beads at the four waist oct-points + pressed sixth + crown finial (KEEP) --------
// The parent's own bead census transcribed to the dual: its six lit octagon
// centers become the six OCT-POINTS. The crown bead rides the finial stem
// (tret v2 occlusion law); the SIXTH is pressed into the earth beneath the
// foot, fully buried in the dais band (tico's-twelfth idiom — five read at
// night, six in truth, disclosed); the eight razor-ghosts stay dark —
// absence is the mark of the removed corners.
const glowGroup = new THREE.Group();
{
    const crownY = V[CROWN_IDX][1] + 0.02;   // BEAD_POKE — crown bead base plane
    // iron finial stem: crown plane → lifted bead center, on the axis
    const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, STEM_H, 8, 1), ironTex);
    stem.position.set(0, crownY + STEM_H / 2, 0);
    g.add(stem);
    for (const p of BEADS) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(p[0], p[1], p[2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_trioct_6";
    g.add(glowGroup);
    const waistBeads = BEADS.slice(0, 4);
    const lowestWaist = Math.min(...waistBeads.map((b) => b[1]));
    console.log(`beads: glow_trioct_6 — 4 brass waist oct-beads r${BEAD_R} at the EXACT cardinals (lowest waist center y ${lowestWaist.toFixed(2)} ALL ALOFT) + 1 PRESSED sixth buried in the dais band y[0.00,0.30] beneath the foot (five read at night, six in truth) + 1 crown FINIAL on a 0.03m iron stem +${STEM_H.toFixed(2)}m; the eight razor-ghosts stay dark; sole night element`);
}

// ---- stone: the 24-sided dais -------------------------------------------------------------------------
{
    const shape = new THREE.Shape();
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = PLINTH_R * Math.cos(a), y = PLINTH_R * Math.sin(a);
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: PLINTH_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);                // extrusion +z → +y; spans y [0, PLINTH_H]
    const plinth = new THREE.Mesh(geo, stoneTex);
    g.add(plinth);
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(3.5 + ROD_R).toFixed(3)}), h${PLINTH_H} — one side per sail, the theme number`);
}

// ---- census + envelope/NaN laws --------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    // TRUE vertex extents (struct-245 law: Box3.setFromObject measures each
    // rod's CONSERVATIVE rotated bbox — the probe contract models true rims.)
    const tmin = [Infinity, Infinity, Infinity], tmax = [-Infinity, -Infinity, -Infinity];
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.updateMatrixWorld(true);
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < posA.count; i++) {
            v.fromBufferAttribute(posA, i).applyMatrix4(mesh.matrixWorld);
            for (let k = 0; k < 3; k++) {
                const c = k === 0 ? v.x : k === 1 ? v.y : v.z;
                tmin[k] = Math.min(tmin[k], c);
                tmax[k] = Math.max(tmax[k], c);
            }
        }
    });
    const sz = [tmax[0] - tmin[0], tmax[1] - tmin[1], tmax[2] - tmin[2]];
    const dErr = Math.max(
        Math.abs(tmin[0] - ENVELOPE.min[0]), Math.abs(tmax[0] - ENVELOPE.max[0]),
        Math.abs(tmin[1] - ENVELOPE.min[1]), Math.abs(tmax[1] - ENVELOPE.max[1]),
        Math.abs(tmin[2] - ENVELOPE.min[2]), Math.abs(tmax[2] - ENVELOPE.max[2]));
    if (tmin[1] < -1e-6) throw Error(`below grade ${tmin[1]}`);
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.map((x) => x.toFixed(3)).join("x")} vs probe ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(3)).join("x")})`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o: any) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.map((x) => x.toFixed(2)).join("x")} y[${tmin[1].toFixed(3)}..${tmax[1].toFixed(3)}] == probe contract (TRUE vertex extents), pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "trioct");
writeFileSync("agents/arthur/assets/village_trioct3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_trioct3.glb`);
