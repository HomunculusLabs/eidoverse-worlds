// mkv3-geodesic.ts — STRUCTURES LANE struct-101, Round 10 commission R10-5.
// THE GEODESIC PAVILION: the form ledger's missing GEODESIC family.
// Curves, ruled surfaces, spirals, harmonic rhythms, tessellation
// (honeycomb R10-1), aperiodic order (penrose R10-2), fractal planar+
// volumetric (koch R10-3, sierpinski R10-4) all stand. Nothing carries
// EQUAL-CHORD TRIANGULATION ON A SPHERE.
//
// ONE IDEA: THE LATTICE IS THE ORNAMENT. A 2V icosahedral hemisphere —
// exact Goldberg subdivision, two strut length classes, every node a hub —
// standing open on a stone plinth. No fill, no cladding: you look THROUGH
// the sky's own triangulation. Enter through the one cut sector; stand
// inside; look up: the zenith pentagon carrying five white-gold beads.
// At gameplay distance the silhouette is a woven hemisphere, light as a
// basket against every solid building in town.
//
// METHOD (exact, all assertions in-code):
//   - Seed icosahedron: 12 verts / 30 edges / 20 faces, every edge
//     exactly 2 (unit) to 1e-9, all faces equilateral.
//   - 2V subdivision: each face edge split at midpoint, midpoints pushed
//     onto the unit sphere. Two strut classes on the sphere (asserted).
//   - Hemisphere: keep y >= -0.05; equator closes as a decagon ring.
//   - Struts: cylinders between node pairs (iron texMat, hypar_iron
//     lineage). Hubs: small spheres (brass metal).
//   - Entry: TWO adjacent equator sectors cut (wide ~3.8m opening,
//     1.4m law met with margin), centered on -z (approach axis).
//     Asserted graph-connected.
//   - Plinth: stone disc r 3.45, h 0.12.
//   - 5 brass glow beads at the zenith pentagon (glow_gd_1..5 KEEP,
//     emissive 0x9a7030 @0.85 dusk lineage).
//
// Classification: footprint ~6.4x6.4 (32 m^2 > 8 gate), h ~3.35 > 2.2 —
// room-scale, exact trimesh, enterable through the cut sector (opening
// chord ~2.0m > 1.4m). Two-way MCPL walk owed. Node budget: iron bucket +
// hub bucket + plinth + 5 beads = 8 nodes.
//
// Determinism: fixed lattice, assertions below. (struct-88..101 chassis)
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — iron lattice lineage (hypar_iron tones, struct-37 law:
// dark iron needs a real texMat, not plain mat).
const ironTex = texMat("gd_iron", [0x4a4e52, 0x42464a, 0x52565a], { rough: 0.95, scale: 2, weights: [2, 1, 1] });
// hub: brass texMat lane (struct-38 law — toGLB exports only texMat/emissive
// lanes; a plain MeshStandardMaterial exports NO material and renders
// loader-default near-black in-game). Tones = brassGlow base family.
const hubMat = texMat("gd_hub", [0xa8823f, 0x9c7839, 0xb28c47], { rough: 0.5, metal: 0.7, scale: 2, weights: [3, 1, 1], seed: 5171 });
const plinthStone = texMat("gd_plinth", [0x767a7d, 0x7e8285, 0x6d7174], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 4001 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- seed icosahedron -------------------------------------------------------
const PHI = (1 + Math.sqrt(5)) / 2;
const base: number[][] = [];
for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    base.push([0, s1, s2 * PHI]);      // (0, ±1, ±φ)
    base.push([s1, s2 * PHI, 0]);      // (±1, ±φ, 0)
    base.push([s1 * PHI, 0, s2]);      // (±φ, 0, ±1)
}
let ico = base.map(p => new THREE.Vector3(p[0], p[1], p[2]).normalize());
if (ico.length !== 12) throw Error(`ico verts ${ico.length} != 12`);

// edges = pairs at minimal distance (edge length 2/sqrt(phi^2+1) on unit sphere)
const edgeLen = 2 / Math.hypot(1, PHI);
const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);
const icoEdges = new Map<string, [number, number]>();
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    const d = ico[i].distanceTo(ico[j]);
    if (Math.abs(d - edgeLen) < 1e-9) icoEdges.set(key(i, j), [i, j]);
}
if (icoEdges.size !== 30) throw Error(`ico edges ${icoEdges.size} != 30`);

// faces: for each edge, the two verts completing an equilateral triple
const icoFaces: number[][] = [];
for (const [i, j] of icoEdges.values()) {
    for (let k = 0; k < 12; k++) {
        if (k === i || k === j) continue;
        if (Math.abs(ico[i].distanceTo(ico[k]) - edgeLen) < 1e-9 &&
            Math.abs(ico[j].distanceTo(ico[k]) - edgeLen) < 1e-9) {
            const fk = [i, j, k].sort((a, b) => a - b).join(",");
            if (!icoFaces.some(f => f.join(",") === fk)) icoFaces.push([i, j, k]);
        }
    }
}
if (icoFaces.length !== 20) throw Error(`ico faces ${icoFaces.length} != 20`);

// ---- 2V subdivision: midpoints pushed to the unit sphere ---------------------
const R = 3.2;                       // hemisphere radius (final scale)
const nodes: THREE.Vector3[] = [];
const nodeIndex = new Map<string, number>();
const addNode = (v: THREE.Vector3): number => {
    const n = v.clone().normalize();
    const k = `${n.x.toFixed(6)},${n.y.toFixed(6)},${n.z.toFixed(6)}`;
    const hit = nodeIndex.get(k);
    if (hit !== undefined) return hit;
    nodes.push(n); nodeIndex.set(k, nodes.length - 1);
    return nodes.length - 1;
};
const edgeStruts = new Map<string, [number, number]>(); // unique struts
for (const f of icoFaces) {
    const m = f.map(i => addNode(ico[i]));                       // corners
    const e = [
        addNode(ico[f[0]].clone().add(ico[f[1]]).multiplyScalar(0.5)), // mid 01
        addNode(ico[f[1]].clone().add(ico[f[2]]).multiplyScalar(0.5)), // mid 12
        addNode(ico[f[2]].clone().add(ico[f[0]]).multiplyScalar(0.5)), // mid 20
    ];
    // the 2V face: six class-A struts (corner-mid) + three class-B struts
    // (the central inverted midpoint triangle)
    const ring = [m[0], e[0], m[1], e[1], m[2], e[2]];
    for (let a = 0; a < 6; a++) {
        const p = ring[a], q = ring[(a + 1) % 6];
        edgeStruts.set(key(p, q), [p, q]);
    }
    edgeStruts.set(key(e[0], e[1]), [e[0], e[1]]);
    edgeStruts.set(key(e[1], e[2]), [e[1], e[2]]);
    edgeStruts.set(key(e[2], e[0]), [e[2], e[0]]);
}

// ---- hemisphere cut: keep nodes y >= -0.05 ----------------------------------
// (unit sphere coords; one icosahedron vertex sits near +y so the zenith
// pentagon is exact; rotate so a PENTAGON vertex is at +y)
{
    // find the ico vertex closest to +y, rotate the whole lattice so it is +y
    let best = 0, bestY = -Infinity;
    ico.forEach((v, i) => { if (v.y > bestY) { bestY = v.y; best = i; } });
    const axis = new THREE.Vector3(0, 1, 0).cross(ico[best]).normalize();
    const ang = Math.acos(THREE.MathUtils.clamp(ico[best].y, -1, 1));
    const q = new THREE.Quaternion().setFromAxisAngle(axis, -ang);
    const m3 = new THREE.Matrix4().makeRotationFromQuaternion(q);
    ico = ico.map(v => v.clone().applyMatrix4(m3));
    // rotate around +y so one EQUATOR strut bisector faces -z (entry axis)
    // equator nodes of the hemisphere: y ~ 0 after rotation — find them,
    // then yaw so the mid-angle of the cut sector = 180° (pointing -z)
}
{
    // rebuild nodes/struts after rotation
    nodes.length = 0; nodeIndex.clear(); edgeStruts.clear();
    for (const f of icoFaces) {
        const m = f.map(i => addNode(ico[i]));
        const e = [
            addNode(ico[f[0]].clone().add(ico[f[1]]).multiplyScalar(0.5)),
            addNode(ico[f[1]].clone().add(ico[f[2]]).multiplyScalar(0.5)),
            addNode(ico[f[2]].clone().add(ico[f[0]]).multiplyScalar(0.5)),
        ];
        const ring = [m[0], e[0], m[1], e[1], m[2], e[2]];
        for (let a = 0; a < 6; a++) {
            const p = ring[a], q = ring[(a + 1) % 6];
            edgeStruts.set(key(p, q), [p, q]);
        }
        edgeStruts.set(key(e[0], e[1]), [e[0], e[1]]);
        edgeStruts.set(key(e[1], e[2]), [e[1], e[2]]);
        edgeStruts.set(key(e[2], e[0]), [e[2], e[0]]);
    }
}

// hemisphere filter: drop struts with BOTH nodes below the cut; drop nodes below
const CUT = -0.05;
const hemiNodes: number[] = [];
for (let i = 0; i < nodes.length; i++) if (nodes[i].y >= CUT) hemiNodes.push(i);
const hemiSet = new Set(hemiNodes);
const hemiStruts: Array<[number, number]> = [];
for (const [p, q] of edgeStruts.values()) if (hemiSet.has(p) && hemiSet.has(q)) hemiStruts.push([p, q]);

// ---- yaw alignment: center the LARGEST equator gap on -z ---------------------
// We cut one equator sector: pick the equator decagon edge whose midpoint
// direction is closest to -z AFTER an explicit yaw, so the entry faces -z.
const equatorNodes = hemiNodes.filter(i => Math.abs(nodes[i].y) < 0.12);
{
    // sort equator nodes by azimuth; confirm decagon
    const az = (v: THREE.Vector3) => Math.atan2(v.x, v.z); // 0 = +z
    equatorNodes.sort((a, b) => az(nodes[a]) - az(nodes[b]));
    if (equatorNodes.length !== 10) throw Error(`equator census ${equatorNodes.length} != 10`);
    for (let i = 0; i < 10; i++) {
        const a = nodes[equatorNodes[i]], b = nodes[equatorNodes[(i + 1) % 10]];
        const chord = a.distanceTo(b);
        if (Math.abs(a.y) > 0.12 || Math.abs(b.y) > 0.12) throw Error("equator node y drift");
        if (chord < 0.05) throw Error(`equator degenerate chord ${chord}`);
    }
}
// choose the cut edge: the one whose midpoint azimuth is closest to π (-z)
let cutIdx = 0, cutBest = Infinity;
for (let i = 0; i < 10; i++) {
    const a = nodes[equatorNodes[i]], b = nodes[equatorNodes[(i + 1) % 10]];
    const midAz = Math.atan2((a.x + b.x) / 2, (a.z + b.z) / 2);
    let d = Math.abs(midAz - Math.PI); if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < cutBest) { cutBest = d; cutIdx = i; }
}
const cutA = equatorNodes[cutIdx], cutB = equatorNodes[(cutIdx + 2) % 10];
const cutMid = equatorNodes[(cutIdx + 1) % 10];       // orphaned rim node — removed
const cutEdgeKeys = new Set([
    key(equatorNodes[cutIdx], equatorNodes[(cutIdx + 1) % 10]),
    key(equatorNodes[(cutIdx + 1) % 10], equatorNodes[(cutIdx + 2) % 10]),
]);
// ---- yaw-align: center the cut edge midpoint EXACTLY on -z ------------------
// (azimuth convention az = atan2(x, z), 0 = +z, π = -z; rotating by θ about
// +Y adds θ to every azimuth — want az(cut midpoint) = π)
{
    const a = nodes[cutA], b = nodes[cutB];
    // wide cut: center = midpoint of the two-span chord cutA→cutB
    const azMid = Math.atan2((a.x + b.x) / 2, (a.z + b.z) / 2);
    const th = Math.PI - azMid;
    const c = Math.cos(th), s = Math.sin(th);
    for (const n of nodes) { const nx = n.x * c + n.z * s, nz = -n.x * s + n.z * c; n.x = nx; n.z = nz; }
    const a2 = nodes[cutA], b2 = nodes[cutB];
    const az2 = Math.atan2((a2.x + b2.x) / 2, (a2.z + b2.z) / 2);
    if (Math.abs(az2 - Math.PI) > 1e-9 && Math.abs(az2 - Math.PI) < 2 * Math.PI - 1e-9)
        throw Error(`yaw-align failed: ${az2}`);
}
// remove the TWO cut edges + the orphaned mid node from the strut/node set (the ENTRY)
const cutKeyStrut = key(cutA, cutB);
const finalStruts = hemiStruts.filter(([p, q]) => !cutEdgeKeys.has(key(p, q)) && p !== cutMid && q !== cutMid);

// ---- graph connectivity assertion (post-cut) ---------------------------------
{
    const adj = new Map<number, number[]>();
    for (const n of hemiNodes) adj.set(n, []);
    for (const [p, q] of finalStruts) { adj.get(p)!.push(q); adj.get(q)!.push(p); }
    const live = hemiNodes.filter(n => n !== cutMid);
    const seen = new Set<number>([live[0]]);
    const stack = [live[0]];
    while (stack.length) {
        const c = stack.pop()!;
        for (const nx of adj.get(c) ?? []) if (!seen.has(nx)) { seen.add(nx); stack.push(nx); }
    }
    if (seen.size !== live.length)
        throw Error(`cut disconnected lattice: ${seen.size}/${live.length} reachable`);
}

// ---- strut length classes (the honest 2V property) ---------------------------
{
    const ls = finalStruts.map(([p, q]) => nodes[p].distanceTo(nodes[q]) * R);
    const l1 = Math.min(...ls), l2 = Math.max(...ls);
    // 2V icosahedron honest classes (unit sphere): A = 2 sin(α/4) ≈ 0.5465
    // (corner→mid), B = 1/φ ≈ 0.618 (mid→mid, golden) — ratio ≈ 1.1308;
    // classes COLLAPSE when ratio → 1. Cluster within 3% of R.
    const clustered = ls.every(l => Math.min(Math.abs(l - l1), Math.abs(l - l2)) < 0.03 * R);
    if (!clustered) throw Error(`strut lengths not 2-class: min ${l1} max ${l2}`);
    if (l2 / l1 < 1.08 || l2 / l1 > 1.18) throw Error(`strut class ratio ${l2 / l1} outside 2V [1.08,1.18]`);
    console.log(`2V OK: ${finalStruts.length} struts, 2 classes ${(l1).toFixed(3)}/${(l2).toFixed(3)} m (ratio ${(l2 / l1).toFixed(4)}), ${hemiNodes.length} nodes, equator decagon 10, cut sector yaw-centered on -z`);
}

// ---- entry width assertion ----------------------------------------------------
{
    const chord = nodes[cutA].distanceTo(nodes[cutB]) * R;
    if (chord < 3.6) throw Error(`entry chord ${chord.toFixed(2)} < 3.6 (wide cut, 1.4m law with margin)`);
    console.log(`entry chord (2-sector) ${(chord).toFixed(3)} m — wide cut, 1.4m law met with margin`);
}

// ---- build meshes -------------------------------------------------------------
const STRUT_R = 0.048;
const strutMesh = (a: THREE.Vector3, b: THREE.Vector3) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(STRUT_R, STRUT_R, len, 8, 1, false);
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const m = new THREE.Mesh(geo, ironTex);
    m.quaternion.copy(q);
    m.position.copy(a);
    return m;
};
const PL = 0.18; // plinth height — lattice seats on the plinth top
for (const [p, q] of finalStruts) {
    const a = nodes[p].clone().multiplyScalar(R); a.y += PL;
    const b = nodes[q].clone().multiplyScalar(R); b.y += PL;
    g.add(strutMesh(a, b));
}

// hubs (cutMid removed — its hub died with the rim node)
const HUB_R = 0.075;
for (const i of hemiNodes) {
    if (i === cutMid) continue;
    const hub = new THREE.Mesh(new THREE.SphereGeometry(HUB_R, 10, 8), hubMat);
    hub.position.copy(nodes[i]).multiplyScalar(R);
    hub.position.y += PL;
    g.add(hub);
}

// plinth: stone disc r 3.45, h 0.18 (18m read: thick enough to read as stone)
{
    const geo = new THREE.CylinderGeometry(3.45, 3.55, 0.18, 40);
    geo.translate(0, 0.09, 0);
    g.add(new THREE.Mesh(geo, plinthStone));
}

// zenith pentagon: the 5 nodes adjacent to the +y vertex (degree-5 apex)
{
    const adj = new Map<number, number[]>();
    for (const n of hemiNodes) adj.set(n, []);
    for (const [p, q] of finalStruts) { adj.get(p)!.push(q); adj.get(q)!.push(p); }
    let apex = -1, apexY = -Infinity;
    for (const n of hemiNodes) if (nodes[n].y > apexY) { apexY = nodes[n].y; apex = n; }
    const pent = adj.get(apex) ?? [];
    if (pent.length !== 5) throw Error(`zenith ring ${pent.length} != 5`);
    const BR = 0.075;
    // struct-101 night fix arc (v1→v5, probe law 11/15 driven):
    // v1 seated beads at R+0.02 INSIDE the non-emissive hub spheres —
    // occlusion-beats-emissive (polish-281/struct-52 class): 3/5 visible.
    // v2/v3 crest-seated + enlarged: near beads clean, but far-side ring
    // members are occluded by the near crown itself (hubs, converging
    // struts) — no slivers even at r>25 probe. v4 tightened the ring to
    // the mid-strut cone: WORSE (signature compressed to ~85px, far pair
    // lost in the apex cluster). Struct-45 lesson: a crown ring under the
    // apex cannot read as 5 from any walkable exterior vantage — stop
    // chasing sub-pixel legibility. v5 keeps the geometrically-true zenith
    // pentagon as the INTERIOR reward (stand under, look up: five —
    // decode-proven) and gives the exterior its own silhouette signature:
    // ONE apex finial bead on the 5-fold axis (nothing stands above it —
    // visible from every vantage; sierpinski apex-bead precedent). Night
    // story: outside = lattice crown + one amber point; inside = the pentagon.
    const apexVec = nodes[apex].clone();
    pent.forEach((n, i) => {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
        bead.position.copy(nodes[n]).multiplyScalar(R + HUB_R + BR - 0.01);
        bead.position.y += PL;
        bead.name = `glow_gd_${i + 1}`;
        g.add(bead);
    });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(BR * 1.2, 12, 10), brassGlow);
    finial.position.copy(apexVec).multiplyScalar(R + HUB_R + BR * 1.2 - 0.01);
    finial.position.y += PL;
    finial.name = `glow_gd_apex`;
    g.add(finial);
    console.log(`zenith pentagon beads: ${pent.length} at radius ${(R * Math.sin(Math.acos(nodes[pent[0]].y))).toFixed(3)} + apex finial`);
}

// ---- envelope assertions -------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y}`);
    const xs = env.max.x, zs = env.max.z;
    if (xs > 3.56 || zs > 3.56) throw Error(`reach exceeds plinth skirt 3.55: ${xs}/${zs}`);
    const BRQ = 0.075; // bead radius (v5; finial = 1.2×BRQ)
    if (Math.abs(env.max.y - (PL + R + HUB_R + 2 * (BRQ * 1.2) - 0.01)) > 0.05)
        throw Error(`apex crest ${env.max.y.toFixed(3)} unexpected`); // v5: finial bead top = PL+R+HUB_R+2·(BR·1.2)−0.01
    console.log(`assertions OK: bbox x[${env.min.x.toFixed(2)},${env.max.x.toFixed(2)}] z[${env.min.z.toFixed(2)},${env.max.z.toFixed(2)}] y[0..${env.max.y.toFixed(3)}]`);
}
const merged = mergeByMaterial(g, "geodesic");
writeFileSync("agents/arthur/assets/village_geodesic3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_geodesic3.glb`);
