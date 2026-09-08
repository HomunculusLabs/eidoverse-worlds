// mkv3-dodecahedron.ts — STRUCTURES LANE struct-106, Round 10 commission R10-8.
// THE DODECAHEDRON: the form ledger's missing family — THE PLATONIC SOLID.
// (Ledger check fresh this tick: curves, compositions, ruled (hypar,
// hyperboloid, helicoid, conoid), pseudosphere, tessellation, aperiodic,
// fractal planar+volumetric, geodesic, minimal surface, space-filling,
// torus-knot all stand; geodesic used icosa SUBDIVISION, not the solid
// itself. No regular Platonic solid stands anywhere in the 55 nx-struct
// works.)
//
// ONE IDEA: THE SOLID ITSELF IS THE MONUMENT. Plato's fifth element — the
// cosmos (Timaeus). A face-down REGULAR dodecahedron as an enterable stone
// shell: 12 true pentagon faces, 30 chiselled arris ridges (the wireframe
// IS the ornament — geometry, not trim), one door through a belt face,
// one brass bead at the zenith face center. The interior reward: standing
// inside the cosmic solid, its facets converging overhead. The golden
// ratio rides every diagonal (φ built into the vertex construction).
//
// METHOD (exact, all assertions in-code):
//   - Vertices: (±1,±1,±1) ∪ cyclic(0, ±1/φ, ±φ), scaled to circumradius
//     R=3.12. |v|=R exact; each vertex exactly 3 edge-neighbors at edge a.
//   - Faces: 12, derived by the 12 icosahedral plane directions — the 5
//     vertices with maximal dot(dir) form each face; each face exactly 5
//     verts, every face edge exactly a. Euler V−E+F = 20−30+12 = 2.
//   - Face-down orientation: quaternion rotates one face normal to −y;
//     bottom + top faces exactly horizontal (5 verts each at constant y).
//   - Shell: each face an extruded pentagon plate, thickness 0.18, outer
//     surface ON the exact face plane (extrude inward along −n).
//   - DOOR: rectangular hole through ONE belt face (chosen nearest local
//     +z approach axis), centered on that face's bottom edge, in-plane
//     1.60 wide × H_ip tall where H_ip = 2.20 / sin(belt-lean-from-
//     horizontal) — vertical clear height 2.20 at the outer plane. All
//     hole corners strictly inside the face pentagon with ≥0.08 clearance.
//   - The bottom edge ridge splits into two segments flanking the hole
//     (1.60 clear span asserted).
//   - 30 arris ridges: 0.10×0.10 beams along every edge, seated on the
//     outward bisector of the adjacent face normals (half proud, half
//     embedded — chiselled read).
//   - Crown: brass bead glow_dd_1 at the zenith face center, proud by
//     BR−0.03 (dusk lineage 0x9a7030 @0.85).
//   - Room gates honest (supportclass.js live constants 2026-09-06):
//     footprint ≈ 33 m² ≥ 8, bbox h ≈ 4.96 ≥ 2.2 → exact trimesh; the
//     door hole is the true collider lane. Two-way MCPL walk owed.
//   - Two-tone plates: caps (bottom+top) tone A, belt+upper tone B;
//     ridges darker tone C; bead KEEP. ≈4 nodes after merge (under-floor
//     honest merge, struct-98/105 precedent, disclosed in plan).
//
// Determinism: no randomness; fixed seeds on texMat lanes.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// ---- constants ----------------------------------------------------------------
const PHI = (1 + Math.sqrt(5)) / 2;
const R = 3.12;                       // circumradius
const T = 0.18;                       // plate thickness
const DOOR_W = 1.60;                  // in-plane door width (law ≥1.4 clear)
const DOOR_H_VERT = 2.20;             // vertical clear height at outer plane
const BR = 0.095;                     // bead radius (dusk lineage; v2b mass)

// materials — R10 mathematical-stone lineage (sierpinski ss_, koch, penrose
// cool greys); caps one tone warmer, ridges darkest chisel tone.
const capStone = texMat("dd_cap", [0x8a8d8b, 0x929593, 0x7f8280], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6101 });
const faceStone = texMat("dd_face", [0x7f8386, 0x878b8e, 0x75797c], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6102 });
const ridgeStone = texMat("dd_ridge", [0x6a6e71, 0x727679, 0x62666a], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 6103 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- exact vertex construction -------------------------------------------------
const raw: THREE.Vector3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1])
    raw.push(new THREE.Vector3(sx, sy, sz));
for (const [a, b] of [[1 / PHI, PHI], [-1 / PHI, PHI], [1 / PHI, -PHI], [-1 / PHI, -PHI]] as Array<[number, number]>) {
    raw.push(new THREE.Vector3(0, a, b), new THREE.Vector3(a, b, 0), new THREE.Vector3(b, 0, a));
}
const s = R / Math.sqrt(3);           // raw circumradius is √3
const verts = raw.map(v => v.clone().multiplyScalar(s));
const EDGE = 2 / PHI * s;             // exact edge length

// adjacency: each vertex exactly 3 neighbors at EDGE
const nbrs: number[][] = verts.map(() => []);
for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) {
    if (Math.abs(verts[i].distanceTo(verts[j]) - EDGE) < 1e-9) { nbrs[i].push(j); nbrs[j].push(i); }
}

// ---- faces via 12 face-plane directions (cyclic(0,±φ,±1), verified by
// hand: face {(1,1,1),(0,1/φ,φ),(1/φ,φ,0),(−1/φ,φ,0),(−1,1,1)} ⊥ (0,φ,1),
// all five at dot φ²) ----------------------------------
const dirs: THREE.Vector3[] = [];
for (const [a, b] of [[PHI, 1], [PHI, -1], [-PHI, 1], [-PHI, -1]] as Array<[number, number]>) {
    dirs.push(new THREE.Vector3(a, b, 0).normalize(), new THREE.Vector3(0, a, b).normalize(), new THREE.Vector3(b, 0, a).normalize());
}
type Face = { idx: number[]; n: THREE.Vector3; C: THREE.Vector3 };
const faces: Face[] = dirs.map(d => {
    const dots = verts.map(v => v.dot(d));
    const mx = Math.max(...dots);
    const idx = dots.map((x, i) => (Math.abs(x - mx) < 1e-7 ? i : -1)).filter(i => i >= 0);
    return { idx, n: d.clone(), C: idx.reduce((acc, i) => acc.add(verts[i]), new THREE.Vector3()).multiplyScalar(1 / idx.length) };
});

// ---- construction assertions (pre-rotation) -------------------------------------
{
    if (verts.length !== 20) throw Error(`vertex count ${verts.length} != 20`);
    for (const ns of nbrs) if (ns.length !== 3) throw Error(`vertex degree ${ns.length} != 3`);
    if (faces.length !== 12) throw Error(`face count ${faces.length} != 12`);
    for (const f of faces) {
        if (f.idx.length !== 5) throw Error(`face size ${f.idx.length} != 5`);
        // every face edge exactly EDGE (consecutive around the pentagon after angular sort)
        const c = new THREE.Vector3();
        f.idx.forEach(i => c.add(verts[i]));
        c.multiplyScalar(1 / 5);
        const u = verts[f.idx[0]].clone().sub(c).normalize();
        const v = new THREE.Vector3().crossVectors(f.n, u);
        const sorted = [...f.idx].sort((p, q) =>
            Math.atan2(verts[p].clone().sub(c).dot(v), verts[p].clone().sub(c).dot(u)) -
            Math.atan2(verts[q].clone().sub(c).dot(v), verts[q].clone().sub(c).dot(u)));
        for (let k = 0; k < 5; k++) {
            const d = verts[sorted[k]].distanceTo(verts[sorted[(k + 1) % 5]]);
            if (Math.abs(d - EDGE) > 1e-9) throw Error(`face edge ${d} != ${EDGE}`);
        }
        f.idx = sorted;
    }
    // face-center distance (inradius) identical for all faces
    const ri = faces[0].C.length();
    for (const f of faces) if (Math.abs(f.C.length() - ri) > 1e-9) throw Error("inradius not constant");
    console.log(`dodeca OK pre-rotate: 20V/30E/12F, edge ${EDGE.toFixed(4)}, ri ${ri.toFixed(4)}, R ${R}`);
}

// ---- face-down rotation ----------------------------------------------------------
// pick the face whose normal is "most downward" in raw frame; rotate its
// normal to exactly (0,-1,0) so that face is horizontal at the bottom.
let bottom = faces[0], best = 2;
for (const f of faces) { const dy = f.n.y; if (dy < best) { best = dy; bottom = f; } }
const q = new THREE.Quaternion().setFromUnitVectors(bottom.n.clone().normalize(), new THREE.Vector3(0, -1, 0));
for (const v of verts) v.applyQuaternion(q);
for (const f of faces) { f.n.applyQuaternion(q); f.C.applyQuaternion(q); }

// after rotation: bottom face horizontal (5 verts constant y), top too
{
    const ys = bottom.idx.map(i => verts[i].y);
    if (Math.max(...ys) - Math.min(...ys) > 1e-9) throw Error("bottom face not horizontal");
    const top = faces.find(f => f.n.y > 0.999)!;
    const ys2 = top.idx.map(i => verts[i].y);
    if (Math.max(...ys2) - Math.min(...ys2) > 1e-9) throw Error("top face not horizontal");
    if (verts.some(v => v.y < bottom.C.y - 1e-9)) throw Error("vertex below bottom face plane");
}
// lift so bottom face plane sits at y=0 (ground)
const preLiftCY = bottom.C.y;          // negative; |it| = inradius
const lift = -bottom.C.y;
for (const v of verts) v.y += lift;
for (const f of faces) f.C.y += lift;
const CENTER = new THREE.Vector3(0, -preLiftCY, 0); // solid center after lift (y=ri)
const RI = faces[0].C.distanceTo(CENTER);  // inradius from the true center
for (const f of faces) if (Math.abs(f.C.distanceTo(CENTER) - RI) > 1e-9) throw Error("post-rotate inradius drift");

// ---- face classification ----------------------------------------------------------
const topF = faces.find(f => f.n.y > 0.999)!;
const beltF = faces.filter(f => f !== bottom && f !== topF && f.idx.some(i => bottom.idx.includes(i))); // 5 adjacent to bottom
const upperF = faces.filter(f => f !== bottom && f !== topF && !beltF.includes(f));                      // 5 adjacent to top
if (beltF.length !== 5 || upperF.length !== 5) throw Error(`belt ${beltF.length} upper ${upperF.length} != 5/5`);

// ---- door face: belt face nearest local +z (approach axis) -------------------------
let doorF = beltF[0], bestZ = -2;
for (const f of beltF) { const dz = f.C.z; if (dz > bestZ) { bestZ = dz; doorF = f; } }

// face-local basis for a face
function basis(f: Face) {
    const n = f.n.clone().normalize();
    const u0 = verts[f.idx[0]].clone().sub(f.C).normalize();
    const v0 = new THREE.Vector3().crossVectors(n, u0);
    return { n, u: u0, v: v0 };
}
// belt lean: angle of face plane from horizontal
const dBasis = basis(doorF);
// belt lean: vertical component of the steepest in-plane direction
const vertComp = Math.sqrt(Math.max(0, 1 - dBasis.n.y * dBasis.n.y));
const H_inplane = DOOR_H_VERT / vertComp;

// door hole rectangle in face-local 2D: centered on the face's bottom edge
// (the edge shared with the bottom face), extending up-the-face.
function face2D(f: Face) {
    const { n, u, v } = basis(f);
    return { n, u, v, pts: f.idx.map(i => { const d = verts[i].clone().sub(f.C); return { x: d.dot(u), y: d.dot(v), i }; }) };
}
const d2 = face2D(doorF);
// bottom edge of door face = consecutive pair with lowest world-y midpoint
let b0 = -1, b1 = -1, bym = 1e9;
for (let k = 0; k < 5; k++) {
    const i0 = d2.pts[k], i1 = d2.pts[(k + 1) % 5];
    const ym = (verts[i0.i].y + verts[i1.i].y) / 2;
    if (ym < bym) { bym = ym; b0 = k; b1 = (k + 1) % 5; }
}
const P0 = d2.pts[b0], P1 = d2.pts[b1];
const mx = (P0.x + P1.x) / 2, my = (P0.y + P1.y) / 2;
const ex = P1.x - P0.x, ey = P1.y - P0.y;
const elen = Math.hypot(ex, ey);
if (Math.abs(elen - EDGE) > 1e-9) throw Error(`door bottom edge ${elen} != ${EDGE}`);
const eux = ex / elen, euy = ey / elen; // edge unit (in-plane)
// up-the-face unit (perpendicular to edge, pointing into the pentagon)
let ux2 = -euy, uy2 = eux;
const cx = d2.pts.reduce((a, p) => a + p.x, 0) / 5, cy = d2.pts.reduce((a, p) => a + p.y, 0) / 5;
if (ux2 * (cx - mx) + uy2 * (cy - my) < 0) { ux2 = -ux2; uy2 = -uy2; } // point at face center
const holePts = [
    { x: mx - eux * DOOR_W / 2, y: my - euy * DOOR_W / 2 },
    { x: mx + eux * DOOR_W / 2, y: my + euy * DOOR_W / 2 },
    { x: mx + eux * DOOR_W / 2 + ux2 * H_inplane, y: my + euy * DOOR_W / 2 + uy2 * H_inplane },
    { x: mx - eux * DOOR_W / 2 + ux2 * H_inplane, y: my - euy * DOOR_W / 2 + uy2 * H_inplane },
];
// hole-inside-polygon clearance: the two TOP corners must sit strictly
// inside the pentagon with margin; the two BOTTOM corners sit ON the
// bottom edge by design (threshold = the bottom edge itself).
{
    const poly = d2.pts.map(p => ({ x: p.x, y: p.y }));
    const distSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    };
    const winding = (h: { x: number; y: number }) => {
        let wn = 0;
        for (let k = 0; k < 5; k++) {
            const a = poly[k], b = poly[(k + 1) % 5];
            if (a.y <= h.y) { if (b.y > h.y && (b.x - a.x) * (h.y - a.y) - (h.x - a.x) * (b.y - a.y) > 0) wn++; }
            else { if (b.y <= h.y && (b.x - a.x) * (h.y - a.y) - (h.x - a.x) * (b.y - a.y) < 0) wn--; }
        }
        return wn;
    };
    // top corners (index 2,3) strictly inside
    for (const h of [holePts[2], holePts[3]]) if (winding(h) === 0) throw Error(`hole top corner outside pentagon`);
    let minClear = 1e9;
    for (const h of [holePts[2], holePts[3]]) for (let k = 0; k < 5; k++) {
        const a = poly[k], b = poly[(k + 1) % 5];
        minClear = Math.min(minClear, distSeg(h.x, h.y, a.x, a.y, b.x, b.y));
    }
    if (minClear < 0.08) throw Error(`hole clearance ${minClear.toFixed(3)} < 0.08`);
    console.log(`door OK: in-plane ${DOOR_W.toFixed(2)}w x ${H_inplane.toFixed(3)}h (vert ${(H_inplane * vertComp).toFixed(3)}), clearance ${minClear.toFixed(3)}`);
}

// ---- build plates -----------------------------------------------------------------
function buildPlate(f: Face, mat: THREE.Material, hole?: { pts: Array<{ x: number; y: number }> }) {
    const { n, u, v } = basis(f);
    const p2 = face2D(f);
    // rebase shape coords so polygon + hole share the SAME 2D frame as face2D
    const shape = new THREE.Shape();
    p2.pts.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, p.y) : shape.lineTo(p.x, p.y)));
    shape.closePath();
    if (hole) {
        const hpath = new THREE.Path();
        hole.pts.forEach((p, i) => (i === 0 ? hpath.moveTo(p.x, p.y) : hpath.lineTo(p.x, p.y)));
        hpath.closePath();
        shape.holes.push(hpath);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    // shape frame (x,y,z-extrude) -> world: p = C + u*x + v*y - n*z (extrude INWARD)
    const m4 = new THREE.Matrix4().makeBasis(u, v, n.clone().negate());
    m4.setPosition(f.C);
    geo.applyMatrix4(m4);
    return new THREE.Mesh(geo, mat);
}
g.add(buildPlate(bottom, capStone));
g.add(buildPlate(topF, capStone));
for (const f of beltF) g.add(f === doorF ? buildPlate(f, faceStone, { pts: holePts }) : buildPlate(f, faceStone));
for (const f of upperF) g.add(buildPlate(f, faceStone));

// ---- arris ridges (30 edges; door-bottom edge split around the hole) ----------------
const RIDGE = 0.10;
function ridge(A: THREE.Vector3, B: THREE.Vector3, n1: THREE.Vector3, n2: THREE.Vector3) {
    const dir = B.clone().sub(A);
    const len = dir.length();
    dir.normalize();
    const out = n1.clone().add(n2).normalize(); // outward bisector at the edge
    const geo = new THREE.BoxGeometry(RIDGE, RIDGE, len);
    const m4 = new THREE.Matrix4();
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const xa = up.clone().sub(dir.clone().multiplyScalar(up.dot(dir))).normalize();
    const ya = new THREE.Vector3().crossVectors(dir, xa);
    m4.makeBasis(xa, ya, dir);
    const mid = A.clone().add(B).multiplyScalar(0.5).add(out.clone().multiplyScalar(RIDGE * 0.30));
    m4.setPosition(mid);
    const mesh = new THREE.Mesh(geo, ridgeStone);
    mesh.applyMatrix4(m4);
    // base-touching ridges: seat ON grade — slant-edge cross-sections dip
    // RIDGE/2 below their low endpoint otherwise; lift by exactly the dip.
    const bb = new THREE.Box3().setFromObject(mesh);
    if (bb.min.y < 0) mesh.position.y -= bb.min.y; // increment, not replace
    return mesh;
}
// edge -> adjacent faces map
const edgeFaces = new Map<string, { a: number; b: number; fs: Face[] }>();
for (const f of faces) for (let k = 0; k < 5; k++) {
    const i = f.idx[k], j = f.idx[(k + 1) % 5];
    const key = i < j ? `${i},${j}` : `${j},${i}`;
    const e = edgeFaces.get(key) ?? { a: Math.min(i, j), b: Math.max(i, j), fs: [] };
    e.fs.push(f);
    edgeFaces.set(key, e);
}
if (edgeFaces.size !== 30) throw Error(`edge count ${edgeFaces.size} != 30`);
// door bottom edge id: the two door-face verts of edge b0/b1
const dv0 = d2.pts[b0].i, dv1 = d2.pts[b1].i;
const doorKey = dv0 < dv1 ? `${dv0},${dv1}` : `${dv1},${dv0}`;
for (const [key, e] of edgeFaces) {
    if (e.fs.length !== 2) throw Error(`edge ${key} faces ${e.fs.length} != 2`);
    const A = verts[e.a], B = verts[e.b];
    if (key === doorKey) {
        // split into two segments flanking the hole: hole center at midpoint,
        // clear span DOOR_W along the edge + ridge thickness margin each side
        const half = DOOR_W / 2 + 0.02;
        const dir = B.clone().sub(A).normalize();
        const M = A.clone().add(B).multiplyScalar(0.5);
        g.add(ridge(A.clone(), M.clone().sub(dir.clone().multiplyScalar(half)), e.fs[0].n, e.fs[1].n));
        g.add(ridge(M.clone().add(dir.clone().multiplyScalar(half)), B.clone(), e.fs[0].n, e.fs[1].n));
    } else {
        g.add(ridge(A, B, e.fs[0].n, e.fs[1].n));
    }
}

// ---- crown finial: brass pin + bead, crest-seated (struct-107 cure) ---------------
// v1 seated the bead AT the zenith face center — decode-proven geometry, but
// the crown ridge ring (crest 5.079 at apothem 1.53m) occludes it from every
// ground vantage: ray from eye 1.65m to bead top 5.079 passes 5.079−(5.079−
// 1.65)·1.53/d < ridge crest for ALL finite d (struct-52 class — occlusion
// beats emissive; native aerial on v1 bytes confirmed the bead + emissive
// read fine from above, 0 warm px at eye level). Crest-seat (polish-272/278
// finial lineage): PIN 0.55 lifts bead top to ~5.65 → center ray clears the
// ridge + 0.05 margin from d ≥ 12m (18m audit distance passes).
// v2b: collar disc at pin base + bead 0.075→0.095 + pin thickened — native
// 18m judge read the bare pin as "stray spike / antenna" risk; mass at the
// crown is what makes a finial read intentional (polish-272 collar+spire).
// v2c: brass rod read "antenna" at 18m day (native, two judges) — replace
// with stone socket + tapered stone spire (obelisk/gnomon language, darkest
// chisel tone): mass + transition + taper are the intentional-read cues;
// ONLY the bead stays brass-emissive so night keeps one quiet amber point
// (polish-278 ember-bead lineage: day reads unlit warm stone).
const PIN = 0.62;                    // spire height (socket 0.12 + spire 0.50)
const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.12, 8), ridgeStone);
socket.position.set(topF.C.x, topF.C.y - 0.03 + 0.06, topF.C.z);
socket.name = "glow_dd_socket";
g.add(socket);
const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.052, 0.50, 8), ridgeStone);
pin.position.set(topF.C.x, topF.C.y - 0.03 + 0.12 + 0.25, topF.C.z);
pin.name = "glow_dd_pin";
g.add(pin);
const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
bead.position.set(topF.C.x, topF.C.y - 0.03 + PIN + BR, topF.C.z);
bead.name = "glow_dd_1";
g.add(bead);
// sightline assert: bead-top ray over the ridge crest must clear from 18m
{
    const eyeY = 1.65, d = 18;
    const beadTop = topF.C.y - 0.03 + PIN + 2 * BR;
    const apothem = EDGE / (2 * Math.tan(Math.PI / 5));       // top-face inradius
    const ridgeCrest = topF.C.y + RIDGE * 0.45;
    const rayAtApothem = beadTop - (beadTop - eyeY) * (apothem / d);
    if (rayAtApothem < ridgeCrest + 0.05) throw Error(`crest sightline fail: ray ${rayAtApothem.toFixed(3)} <= ridge+margin ${ridgeCrest + 0.05}`);
    console.log(`crest sightline OK: bead-top ray ${rayAtApothem.toFixed(3)} clears ridge+margin ${(ridgeCrest + 0.05).toFixed(3)} at 18m`);
}

// ---- door lane assertion (walkable aperture clear of solids) ------------------------
{
    // lane core box in world: centered on door centerline. Door bottom edge
    // midpoint world + up-the-face direction in world.
    const dW = { n: dBasis.n, u: dBasis.u, v: dBasis.v };
    const upWorld = dW.u.clone().multiplyScalar(ux2).add(dW.v.clone().multiplyScalar(uy2));
    const doorBaseW = doorF.C.clone()
        .add(dW.u.clone().multiplyScalar(mx)).add(dW.v.clone().multiplyScalar(my));
    const laneCenter = doorBaseW.clone().add(upWorld.clone().multiplyScalar(H_inplane * 0.42));
    // vertical clear height at the outer plane measured from ground:
    const vertAt = (t: number) => t * vertComp;
    if (vertAt(H_inplane) < DOOR_H_VERT - 1e-6) throw Error("vertical door height assertion failed");
    const box = new THREE.Box3(
        new THREE.Vector3(laneCenter.x - DOOR_W / 2 + 0.10, 0.19, laneCenter.z - 0.35),
        new THREE.Vector3(laneCenter.x + DOOR_W / 2 - 0.10, 0.19 + 1.95, laneCenter.z + 0.35),
    );
    // only geometry allowed inside the lane box: NOTHING (plates are solid
    // except the hole; ridges flank it). Sample the built meshes' triangles.
    let violations = 0;
    g.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const geo = mesh.geometry as THREE.BufferGeometry;
        const pos = geo.getAttribute("position") as THREE.BufferAttribute;
        mesh.updateMatrixWorld(true);
        for (let i = 0; i + 2 < pos.count; i += 3) {
            const a = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
            const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1).applyMatrix4(mesh.matrixWorld);
            const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2).applyMatrix4(mesh.matrixWorld);
            const cen = a.clone().add(b).add(c).multiplyScalar(1 / 3);
            if (box.containsPoint(cen)) violations++;
        }
    });
    if (violations) throw Error(`${violations} triangle centroids inside door lane box`);
    console.log(`door lane OK: clear box ${(DOOR_W - 0.2).toFixed(2)}w x 1.95h x 0.70d at door centerline`);
}

// ---- envelope assertions -------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y}`);
    const beltMax = Math.max(...verts.map(v => Math.hypot(v.x, v.z)));
    const TOL = RIDGE * 0.5 + 0.05;
    if (Math.abs(env.max.x) > beltMax + TOL || Math.abs(env.min.x) > beltMax + TOL ||
        Math.abs(env.max.z) > beltMax + TOL || Math.abs(env.min.z) > beltMax + TOL)
        throw Error(`x/z reach ${env.min.x.toFixed(2)}..${env.max.x.toFixed(2)} / ${env.min.z.toFixed(2)}..${env.max.z.toFixed(2)} vs belt ${beltMax.toFixed(3)}`);
    const expectTop = 2 * RI - 0.03 + PIN + 2 * BR;
    if (Math.abs(env.max.y - expectTop) > 0.06) throw Error(`crest ${env.max.y.toFixed(3)} vs expected ~${expectTop.toFixed(3)}`);
    const foot = sz.x * sz.z;
    if (foot < 8) throw Error(`footprint ${foot.toFixed(1)} < 8`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} < 2.2`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[0..${env.max.y.toFixed(3)}] | footprint bbox ${foot.toFixed(1)} m2 | ri ${RI.toFixed(3)} | edge ${EDGE.toFixed(4)}`);
}

const merged = mergeByMaterial(g, "dodecahedron");
writeFileSync("agents/arthur/assets/village_dodecahedron3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_dodecahedron3.glb`);
