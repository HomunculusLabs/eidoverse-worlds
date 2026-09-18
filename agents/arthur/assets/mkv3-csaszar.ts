// mkv3-csaszar.ts — STRUCTURES LANE struct-227, Round 11 commission R11-41
// THE CSÁSZÁR POLYHEDRON — seven vertices, 21 edges (every pair joined — NO
// DIAGONALS), 14 triangular faces, Euler 0: the smallest stone a torus can be
// woven from. K7, every point acquainted with every other.
//
// One idea: SEVEN POINTS, ALL ACQUAINTED. IRON carries the complete graph —
// every one of the 21 edges drawn as a rod through space, meeting at 7 brass
// vertex beads (degree 6 each). STONE carries the surface's 14 triangular
// membranes, inset in the rod frame with a shadow-gap reveal (the frame is
// the structure; the membrane fills its bays). The 21 missing triangles of
// the 35 possible are the TORUS'S HOLES read against the sky — genus 1.
// Plinth: a SEVEN-sided heptagon (the theme number), ashlar.
// Night contract: seven warm vertex stars — three socketed half-proud in the
// plinth top at the triangular foot face, four riding the crown.
//
// Laws honored: texMat lanes (struct-38) — cs_stone/cs_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage, struct-82); glow census exactly 1
// KEEP group (glow_cs_7); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's face-down seating is the lift); envelope
// vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, FACES, EDGES, ENVELOPE, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    PLATE_T, PLATE_INSET, PLATE_BACK, ROD_R, BEAD_R, FOOT_FACE, PLATED,
} from "../struct227-probe-csaszar.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("cs_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 227 });
const ironTex = texMat("cs_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 24, seed: 41 });   // v3: brightened lane (0x4a→0x6a) — rods must survive 18m dark-ground contrast

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's face-down seating already applied lift.

// rod from P to Q (the lane's tangent-segment register: curve by turning)
// heightSegments 2: a genuine mid ring rides every segment midpoint — the
// decode D3 coverage law is non-vacuous (midpoint verts exist to be found).
function rod(P: [number, number, number], Q: [number, number, number]): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, len, 10, 2), ironTex);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
}

// ---- iron: the complete graph K7 (21 rods) ---------------------------------------------------------------
{
    for (const [i, j] of EDGES) g.add(rod(V[i], V[j]));
    console.log(`K7 frame: ${EDGES.length} iron rods r${ROD_R} — every vertex pair joined, ZERO diagonals (probe T2); 6 rods meet at every bead`);
}

// ---- stone: SPARSE CAGE — the 5 smallest faces carry membranes (v3) --------------------------------------
// v1 plated all 14 faces and read "tent/sail"; v2 plated fi%3===0 (5 faces,
// 10.2 m²) and STILL read "tent" — the 3.76 m² foot canvas dominated. v3
// plates the probe's PLATED = five smallest faces (5.52 m², 24% of the
// surface): stone becomes accents INSIDE the cage, the foot bay and underside
// stay open, and K7's through-going diagonals read against open sky. The
// plates are the surface's canonical form (Euler/manifold laws unchanged);
// the open bays are presentation (bore-shadow/open-lattice lineage).
// SELF-CAUGHT (v1 build died "below grade -1.58"): Box3.setFromObject unions
// each geometry's cached bounding-BOX corners under the node matrix — a thin
// steeply-oriented plate's BOX corner flies ~1.9m below its true triangle.
// Fix per the dodecahedron struct-106 chassis: bake the face basis INTO THE
// GEOMETRY (applyMatrix4) — bounds become vertex-true and root stays identity.
{
    // mid-plane recess along the face's outward normal: plate outer face sits
    // PLATE_BACK behind the rods' outer surface (s = ROD_R − PLATE_BACK − PLATE_T/2).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let plateCount = 0, footPlates = 0;
    for (let fi = 0; fi < FACES.length; fi++) {
        if (!(PLATED as readonly number[]).includes(fi)) continue;   // SPARSE CAGE law (v3): five smallest faces
        const [ia, ib, ic] = FACES[fi];
        const Pa = V[ia], Pb = V[ib], Pc = V[ic];
        const A3 = new THREE.Vector3(...Pa), B3 = new THREE.Vector3(...Pb), C3 = new THREE.Vector3(...Pc);
        const ctr = new THREE.Vector3().add(A3).add(B3).add(C3).multiplyScalar(1 / 3);
        // orthonormal face basis: u along AB, n outward (right-hand), v = n × u
        const u = B3.clone().sub(A3).normalize();
        const n = new THREE.Vector3().crossVectors(u, C3.clone().sub(A3)).normalize();
        const v = new THREE.Vector3().crossVectors(n, u);
        // inset: shrink the triangle about its centroid by PLATE_INSET
        const shrink = (p: THREE.Vector3) => {
            const d = p.clone().sub(ctr), l = d.length();
            return l <= PLATE_INSET ? null : p.clone().sub(d.multiplyScalar(PLATE_INSET / l));
        };
        const A2 = shrink(A3), B2 = shrink(B3), C2 = shrink(C3);
        if (!A2 || !B2 || !C2) continue;      // face too small to plate at this inset — honest skip
        const to2D = (p: THREE.Vector3) => [p.clone().sub(ctr).dot(u), p.clone().sub(ctr).dot(v)] as [number, number];
        const a = to2D(A2), b = to2D(B2), c = to2D(C2);
        const shape = new THREE.Shape([
            new THREE.Vector2(a[0], a[1]), new THREE.Vector2(b[0], b[1]), new THREE.Vector2(c[0], c[1]),
        ]);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: PLATE_T, bevelEnabled: false });
        geo.translate(0, 0, -PLATE_T / 2);    // center on local z = 0
        // bake: local (x,y,z) → world ctr + u·x + v·y + n·z  (matrix = [u v n | ctr])
        const m4 = new THREE.Matrix4().makeBasis(u, v, n);
        // v3: no foot face is plated (PLATED excludes face 0) — all plates ride
        // the standard recess; the foot bay stays OPEN.
        m4.setPosition(ctr.clone().addScaledVector(n, sSide));
        geo.applyMatrix4(m4);
        g.add(new THREE.Mesh(geo, stoneTex));
        plateCount++;
    }
    console.log(`membranes: ${plateCount} stone plates inset ${PLATE_INSET}m with ${PLATE_BACK}m reveal (${footPlates} foot plate flush on the plinth top) — the frame carries, the surface fills; bases baked vertex-true`);
}

// ---- brass glow beads at the 7 vertices (KEEP) — the night stars -----------------------------------------
const glowGroup = new THREE.Group();
{
    for (let i = 0; i < V.length; i++) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(V[i][0], V[i][1], V[i][2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_cs_7";
    g.add(glowGroup);
    const footIdx = new Set(FACES[FOOT_FACE]);
    const nFoot = [...footIdx].length;
    console.log(`beads: glow_cs_7 — 7 brass stars r${BEAD_R} (${nFoot} half-proud in the plinth top at the foot, ${7 - nFoot} aloft); sole night element`);
}

// ---- stone: the heptagonal plinth -------------------------------------------------------------------------
{
    const shape = new THREE.Shape();
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;   // one vertex aims at the foot apex (−z)
        const x = PLINTH_R * Math.cos(a), y = PLINTH_R * Math.sin(a);
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: PLINTH_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);                // extrusion +z → +y; spans y [0, PLINTH_H]
    const plinth = new THREE.Mesh(geo, stoneTex);
    g.add(plinth);
    console.log(`plinth: heptagon R${PLINTH_R} (${PLINTH_N} sides — the theme number, one vertex aimed at the foot apex), h${PLINTH_H} — SEVEN below seven points`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const want = new THREE.Box3(
        new THREE.Vector3().fromArray(ENVELOPE.min),
        new THREE.Vector3().fromArray(ENVELOPE.max));
    const wsz = want.getSize(new THREE.Vector3());
    const dErr = Math.max(
        Math.abs(env.min.x - want.min.x), Math.abs(env.max.x - want.max.x),
        Math.abs(env.min.y - want.min.y), Math.abs(env.max.y - want.max.y),
        Math.abs(env.min.z - want.min.z), Math.abs(env.max.z - want.max.z));
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} vs probe ${wsz.x.toFixed(3)}x${wsz.y.toFixed(3)}x${wsz.z.toFixed(3)})`);
    // Designed asymmetry (odd heptagon, one vertex at the foot apex): the
    // centering law drops in favor of the probe's analytic TRUE box — the mk
    // must reproduce the probe's exact x/z extremes (dErr law above), not
    // symmetry. Drift tolerance already covers it.
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract, pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "csaszar");
writeFileSync("agents/arthur/assets/village_csaszar3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_csaszar3.glb`);
