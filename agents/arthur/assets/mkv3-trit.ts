// mkv3-trit.ts — STRUCTURES LANE struct-275, Round 11 commission R11-83.
// THE TRIAKIS TETRAHEDRON — the Catalan dual of the standing truncated
// tetrahedron (tret, struct-247/248, E band az4.0 r76.0 — AT CAP 6).
// Catalan branch member 6 (rt struct-235; dtria struct-267/268; deltoid
// struct-269/270; triakis struct-271/272; tetrakis struct-273/274).
// Dual-of-standing-parent move a SIXTH time (gsd->gdodec, trico->dtria,
// rico->deltoid, tdodec->triakis, toct->tetrakis, tret->trit). FIRST
// family member to seat OUTSIDE its parent's quarter (every parent band
// capped — E/SW/N-E all 6/6; the R11-84 seat goes to a fresh under-served
// octant, surfaced in the plan when it lands).
//
// ONE IDEA: THE FIRST CUT'S GHOST, READ THROUGH THE LOOKING GLASS. The
// parent tret told the BALANCED REMAINDER — the tetrahedron cut at a
// third, exactly 23 of 27 parts standing (struct-247 T6 machine-exact).
// The polar reciprocal about its midsphere (rho == 1 exact, both edge
// classes) turns every parent face into a POINT and every one of the 12
// tret vertices into an ISOCELES sail — one tri apex + two hex corners,
// every sail kissing ONE insphere at 3/sqrt(11) (the Catalan tangent
// property, probe T6). THE RANK INVERSION IS THE STORY: the four hexagons
// stand as the FOUR GREAT OUTER POINTS at radius sqrt(3) along -V — THE
// GRANDPARENT TETRAHEDRON ITSELF, REFLECTED THROUGH THE CENTER — while
// the four cut-ghosts sink to 3*sqrt(3)/5 (ratio 5/3 — the deepest
// relief in the family fleet) and short/base == 3/5 exactly. Silhouette:
// the foot spike rises to a WIDE three-shoulder belt low, tapers through
// the cut-ghost dimple ring (60deg interleaved), and climbs to the tall
// reflected-grandparent crown point — a three-sided spire.
// Presentation: TRI-GHOST POINT-DOWN 3-fold on the parent's own seated
// frame (triangle-down + belt twist-snap — self-catch (c): the side-hex
// normals ride below the equator on this seat, so the snap targets the
// BELT H-RING itself). STONE carries all 12 sails (ONE face family =
// ONE sail material — the face-transitivity read in the material law) +
// the TWELVE-sided dais (one side per sail, theme-number law); IRON
// carries all 18 seam bonds + the crown finial stem. Night contract: the
// parent's own bead census transcribed to the dual — its four lit hexagon
// centers become the four H points: 1 crown FINIAL + 3 waist-belt beads
// at exact 120deg, ONE dead at az 0, NONE pressed = glow_trit_4.
//
// Laws honored: texMat lanes (struct-38) — trit_stone/trit_iron; bead
// emissive 0x9a7030 @ 1.4 in-GLB (family build-time law); glow census
// exactly 1 KEEP group (glow_trit_4); ROOT STAYS IDENTITY (struct-188);
// plate basis BAKED INTO GEOMETRY (applyMatrix4); NaN 0; below-grade 0;
// dais APOTHEM-FIRST (struct-247).
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
} from "../struct275-probe-trit.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("trit_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 275 });
const ironTex = texMat("trit_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 276 });

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

// ---- iron: the eighteen seam bonds (one per tret edge — the dual edge census) ----------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — one dual edge per parent edge (bijection 18<->18; TWO length classes 6 hex-hex base + 12 hex-tri short — the honest non-uniform Catalan signature; zero tri-tri, the cuts never met)`);
}

// ---- panels: 12 stone isoceles sails (baked basis) -----------------------------------------------------------
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
    console.log(`panels: ${sailCount} stone isoceles sails (ONE face family = ONE sail material — the face-transitivity read in the material law; each sail a tret vertex figure: one tri apex + two hex corners, short/base exactly 3/5; inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — probe T8: every plate vertex strictly inside the solid`);
}

// ---- brass glow beads at the three belt points + crown finial (KEEP) — the parent's own census transcribed ----
// The crown bead rides the finial stem (tret v2 occlusion law); NO bead is
// pressed into the earth — the parent's honest idiom; the foot is the cut-ghost,
// unlit (absence is the mark of the removed corner).
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
    glowGroup.name = "glow_trit_4";
    g.add(glowGroup);
    const lowestBelt = Math.min(...BEADS.slice(0, 3).map((b) => b[1]));
    console.log(`beads: glow_trit_4 — 3 brass belt beads r${BEAD_R} at exact 120deg, ONE dead at az 0 (the parent's own bead census transcribed to the dual; lowest belt center y ${lowestBelt.toFixed(2)} ALL ALOFT, none pressed) + 1 crown FINIAL on a 0.03m iron stem +${STEM_H.toFixed(2)}m; sole night element`);
}

// ---- stone: the 12-sided dais -------------------------------------------------------------------------------
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod), h${PLINTH_H} — one side per sail, the theme number`);
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
const merged = mergeByMaterial(g, "trit");
writeFileSync("agents/arthur/assets/village_trit3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_trit3.glb`);
