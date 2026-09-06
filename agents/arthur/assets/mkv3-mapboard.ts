// mkv3-mapboard.ts — THE VILLAGE MAP BOARD (era-2 heritage, era-3 radial):
// a standing painted board beside the north gate path showing the village
// miniature — hearth at center, ring buildings as chips, spokes, landmarks.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-17 TIMBER IV: the map board's slab joins the timber family (same
// wood as the signposts and walls — the village builds its boards from
// the same trees); frame + painted map chips + brass pin stay flat
// (painted detail and trim read flat at distance; material truth law).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
// two posts + tilted board (map faces arriving visitors: -Z toward plaza... board at (1.6,8.5) world; local frame: board faces S)
// tex-61: the posts + the cap board join the slab's family — the
// village builds the whole board from the same trees (a post is a
// post; the little cap roof is a plank). Painted map chips, bone
// frame, and brass pin stay flat (painted detail; material truth).
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
};
for (const px of [-0.85, 0.85]) texBox(`mpost_${px}`, 0.12, 2.0, 0.12, px, 1.0, 0, timberTex);
// board slab, tilted back 12°
const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 0.07), timberTex);
board.name = "map_board";
board.position.set(0, 1.55, -0.06);
board.rotation.x = -0.21;
g.add(board);
// frame around the board (bone trim) — improve-19: a real BORDER, not a
// solid plate. The era-2 frame was one solid 2.44x1.64x0.05 overlay whose
// map-side face (off −0.0392) sat 3–33mm OUTSIDE every painted chip front
// (−0.036..−0.006), permanently burying the whole map (model-local ray:
// mb3_1 hit FIRST from −z; the visible "ring" was the torus tube punching
// through the plate). Four bars, same plane/tilt/material/footprint — direct
// g-children (merge law; a nested group would ship unmerged): the interior
// opens, the timber slab face + paint read recessed inside a bone rim. No
// map-side movement (bars' outer face stays off −0.0392; torus −0.066
// remains the extreme — R-121 lamp-n kiss untouched).
const frameBar = (name: string, w: number, h: number, fx: number, fy: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), mat(C.BONE, 0.85, 0));
    mesh.name = name;
    // frameG-local (fx, fy, 0) tilted −0.21 about x, centered (0,1.55,−0.075):
    // g-pos = (fx, 1.55 + fy·cos(−0.21), −0.075 + fy·sin(−0.21))
    mesh.position.set(fx, 1.55 + fy * 0.97803, -0.075 + fy * -0.20846);
    mesh.rotation.x = -0.21;
    g.add(mesh);
    return mesh;
};
frameBar("map_frame_top", 2.44, 0.09, 0, 0.775);
frameBar("map_frame_bottom", 2.44, 0.09, 0, -0.775);
frameBar("map_frame_left", 0.08, 1.46, -1.18, 0);
frameBar("map_frame_right", 0.08, 1.46, 1.18, 0);
// cap board (little roof over the map)
const cap = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.09, 0.5), timberTex);
cap.name = "map_cap";
cap.position.set(0, 2.42, 0.02);
cap.rotation.x = -0.28;
g.add(cap);

// ---- THE PAINTED MAP (improve-18 rebuild) ----
// ROOT CAUSE of the old defect: onBoard() tilted chips -0.21 from HORIZONTAL
// while the slab is -0.21 from VERTICAL — the chip field rendered as a
// near-horizontal tray PERPENDICULAR to the face, smearing ~1.1 fore-aft
// through BOTH faces (the survey's "noise"; 36 verts stabbed through the b22
// compass rider) and hiding the map itself.
// NEW LAW (b22's own construction): content lies in mapG's XY plane — the
// face plane by construction — riding local -z; mapG carries the slab's OWN
// tilt and center. The far (-z) face is the map side (the b22 compass rider
// owns the +z plaza face — artwalk's committed design).
// Reader orientation: the -z reader looks along +z with up +y, so their
// RIGHT is host +x — authored map-east (+x) maps to mapG +x unflipped, and
// authored heritage north (-z) maps to mapG +y (up). TRUE-reading map.
// Seating (painted-flush law + R-121 lamp-n 9mm kiss): chip fronts sit 1mm
// proud of the slab's back face — mapG-local z -0.036 (the slab back is at
// mapG -0.035; the bone frame rim reaches -0.0397, so paint sits 3.7mm
// inside the rim) — zero new protrusion toward lamp-n; painted detail reads
// flat (material truth). [v1 of this edit used FACE -0.096, a g-local figure
// mistaken for mapG-local: 61mm-proud chips pointing at the lamp — caught
// by decode before any placement.]
// Fit: authored content rim 1.43 (x, quarry) / 1.42 (y, kiln); S=0.50 puts
// the rim at 0.72 max — centered on the 2.3x1.5 face with margin.
// Distance-skeleton floors (polish-16 law, absolute, unscaled): torus tube
// 0.03, spoke width 0.05, hearth r 0.06 emissive 1.5, ring-bar width 0.05 —
// ring+spokes+hearth read at 18m; detail chips are approach-range by design.
const mapG = new THREE.Group();
mapG.rotation.x = -0.21;
mapG.position.set(0, 1.55, -0.06);
g.add(mapG);
const S = 0.50;
const FACE = -0.036; // 1mm proud of the slab's back face (mapG-local -0.035)
const onBoard = (mesh: THREE.Mesh, ax: number, az: number, hd: number) => {
  // hd = the mesh's extent along z (its relief depth): fronts at FACE
  mesh.position.set(ax * S, -az * S, FACE + hd / 2);
  mapG.add(mesh);
  return mesh;
};
const chip = (name: string, x: number, z: number, w: number, d: number, c: number, h = 0.022) => {
  // authored w = east-west extent, d = north-south extent; on the XY face
  // plane they become mapG x and y; relief h rides along z (unscaled paint)
  // improve-19: faint same-hue emissive on painted chips (polish-274 law —
  // the face points away from every light source; without it the whole map
  // reads unlit timber from the reading side)
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, d * S, h),
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0, emissive: new THREE.Color(c), emissiveIntensity: 0.5 }));
  m.name = name;
  return onBoard(m, x, z, h);
};
// plaza hearth disc (center) — the hearth GLOWS on the map (a lantern-lit
// board at dusk); r = max(0.12·S, 0.06 floor) = 0.06. Seated hd=0.03 → front
// z_m -0.021 (41mm clear of the b22 plate back at -0.0375... plate +0.0375).
const hearth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), new THREE.MeshStandardMaterial({ color: 0xff8a3a, emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 1.5, roughness: 0.5 }));
hearth.name = "map_hearth";
hearth.rotation.x = Math.PI / 2;   // cylinder axis along the face normal
onBoard(hearth, 0, 0, 0.03);
// gathering-ring road: torus (tube 0.03 absolute floor) + E-W diameter bar.
// Torus seated hd=0 (center AT FACE): front z_m -0.006, back -0.066 — v1
// seated it hd=0.06 which put its front at +0.024, past the mid-plane
// toward the b22 rider's plate; decode caught it before placement.
const boneMat = () => new THREE.MeshStandardMaterial({ color: C.BONE, roughness: 0.8, metalness: 0, emissive: new THREE.Color(C.BONE), emissiveIntensity: 0.35 });
const ringN = new THREE.Mesh(new THREE.TorusGeometry(0.83 * S, 0.03, 5, 32), boneMat());
ringN.name = "map_ring2";
onBoard(ringN, 0, 0, 0);
chip("map_ring", 0, 0, 1.66, 0.10, C.BONE, 0.014); // ring road E-W bar (width floored 0.05)
// 4 spokes — radial bars hearth->ring so roads CONNECT on the face (the old
// field's bars floated free, offset off-axis): inner r 0.06, outer ring r
for (const [si, ang] of [[0, 0], [1, Math.PI / 2], [2, Math.PI], [3, -Math.PI / 2], [4, Math.PI / 4], [5, 3 * Math.PI / 4], [6, 5 * Math.PI / 4], [7, 7 * Math.PI / 4]] as const) {
    const outer = 0.83 * S, inner = 0.06;
    const sp = new THREE.Mesh(new THREE.BoxGeometry(outer - inner, 0.05, 0.014), boneMat());
    sp.name = `map_spoke_${si}`;
    sp.rotation.z = -ang;   // authored (cos a, sin a) -> mapG (cos a, -sin a)
    onBoard(sp, Math.cos(ang) * (outer + inner) / 2, Math.sin(ang) * (outer + inner) / 2, 0.014);
}
// 8 ring buildings at their angles (dark chips — lifted to readable umber)
for (const aDeg of [36, 72, 108, 144, 216, 252, 288, 324]) {
    const a = (aDeg * Math.PI) / 180;
    // improve-19 v4: blocks at legible scale (~6-7% board height rendered)
    // + long axis tangent to the ring road (buildings face the road — true
    // orientation, and it breaks the axis-aligned crosshair read)
    const b = chip(`map_bldg_${aDeg}`, Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0.19, 0.16, 0x8c7a3e);
    b.rotation.z = -(a + Math.PI / 2);
}
// landmarks: inn (N far), windmill (W far), carousel (SE), belltower (NE near)
chip("map_inn", 0, -0.98, 0.20, 0.17, 0xa06c32);
chip("map_windmill", -1.0, 0, 0.20, 0.17, 0xa06c32);
chip("map_carousel", 0.72, 0.72, 0.19, 0.17, 0xa06c32);
chip("map_belltower", 0.4, -0.4, 0.16, 0.16, 0xa06c32);
// loop #82 — the map catches up with the village: the seven builds since
// the board was painted get their chips (positions = village r/40 scaled):
// stable (r40 N, behind the inn), market (NW plaza-near), shrine (W r24),
// watchpost (SW r22), wayside (N gate r15), monument (SW plaza-near)
chip("map_stable", 0, -1.02, 0.13, 0.11, 0x78704a);
chip("map_market", -0.36, 0.36, 0.1, 0.1, 0x78704a);
chip("map_shrine", -0.56, 0.1, 0.09, 0.09, 0x78704a);
chip("map_watchpost", -0.5, -0.5, 0.08, 0.08, 0x78704a);
chip("map_wayside", 0.06, 0.32, 0.07, 0.07, 0x78704a);
chip("map_monument", -0.3, -0.3, 0.08, 0.08, 0x78704a);
// ---- THE WHISPER (new-era loop 45): not a chip — a faint smudge far SW,
// past the map's edge of known things. No label, no road. A reason to
// walk into the field and find out. (waystone at 225deg r55; board scale
// ~1:31 → -1.25, -1.25, off the painted ring but ON the board corner)
chip("map_whisper", -1.22, -1.22, 0.06, 0.06, 0x626442);
// loop #71 — the map catches up AGAIN: the era of chains (fields, goats,
// quarry road, dye house) gets its marks (same board scale ~1:31):
// grainfield (W r42), flax+pond (SW r44), quarry+kiln (NE r48), goats+stand
// (NE r43), dyehouse (NW r27), charcoal clamp (NE r35), welcome board (S r5)
chip("map_grainfield", -1.32, 0.18, 0.14, 0.2, 0xc9b454, 0.012);
chip("map_flax", -1.34, -0.16, 0.1, 0.16, 0x92b872, 0.012);
chip("map_quarry", 1.28, 1.28, 0.2, 0.18, 0x74705e, 0.012);
chip("map_kiln", 1.18, 1.4, 0.07, 0.07, 0xa08232, 0.018);
chip("map_goats", 1.34, -0.14, 0.12, 0.12, 0xb6b08a, 0.014);
chip("map_milkstand", 1.28, -0.08, 0.05, 0.05, 0x7c6832, 0.02);
chip("map_dyehouse", -0.42, 0.78, 0.11, 0.11, 0x526a96, 0.02);
chip("map_charcoal", 1.02, -0.9, 0.09, 0.09, 0x444036, 0.016);
chip("map_welcome", 0.1, -0.16, 0.06, 0.06, 0xc9a86a, 0.02);
// loop #87 — the map catches up AGAIN: the 8 builds since loop 71 get
// their marks (same 1:31 scale): chopblock (woodyard edge), field pond
// + ducks (SW r43-44 cluster), hutch + run (garden side), dyer sign.
chip("map_chopblock", 0.48, 0.72, 0.06, 0.06, 0x7c6832, 0.02);
chip("map_fieldpond", -1.36, -0.34, 0.09, 0.07, 0x303840, 0.012);
chip("map_ducks", -1.31, -0.38, 0.03, 0.03, 0x5c5c60, 0.016);
chip("map_hutch", -0.38, 0.62, 0.06, 0.06, 0xb6b08a, 0.018);
chip("map_run", -0.33, 0.68, 0.05, 0.05, 0x9a9a58, 0.014);
chip("map_dyer", -0.4, 0.82, 0.05, 0.05, 0x526a96, 0.02);
// loop #100 — the centennial map: the 6 builds since 87 get their marks
// (same 1:31 scale): inn door rides the inn (no mark — too small), but
// the cart, laundry, cistern, forge, and way-lamp do:
chip("map_cart", -1.18, 0.26, 0.07, 0.05, 0xd8c46a, 0.018);   // harvest cart (straw)
chip("map_laundry", -0.55, 0.4, 0.08, 0.03, 0xdcdcba, 0.014); // the laundry line
chip("map_cistern", 0.62, -0.5, 0.05, 0.05, 0x303840, 0.016); // bakery cistern (water)
chip("map_forge", 0.68, -0.56, 0.06, 0.06, 0xff7030, 0.02);   // THE FORGE (ember-orange — the only bright mark)
chip("map_waylamp", -0.75, -0.75, 0.03, 0.03, 0xffb066, 0.018); // the way-lamp on the whisper ray
// polish-20 — the map catches up AGAIN (tex-78's build never got its mark):
// the drum tower-house (-8, 24.7; ~1:31 → -0.26, 0.80) — the village's tallest
// landmark, the keeper's tower with the upper study. Timber-dark chip like the
// tower's own wood, ring-building size — it reads as a building, not a landmark
// glow (the tower IS a home; the belltower keeps the landmark-brown tone).
chip("map_tower", -0.26, 0.80, 0.07, 0.07, 0x78704a, 0.016);
// "you are here" brass pin at the board's own village position (1.6, 8.5 → r~0.42 N)
// Seated hd=0 (center AT FACE): front z_m -0.011 — v1 hd=0.05 put its front
// at +0.014, 3.5mm from the b22 plate back; reseat keeps 48mm clearance.
const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), mat(0xc9a86a, 0.3, 0.9));
pin.name = "map_pin";
pin.rotation.x = Math.PI / 2;   // axis along the face normal
onBoard(pin, 0.06, 0.4, 0);

// ---- decode manifest (improve-18 contract) ----
// Plane coordinates per painted element, computed from the mesh's REAL
// vertices in g-space (exact — AABB-corner projection under the 12° tilt
// inflates flat elements' fronts by their in-plane extent and was rejected
// in audit v4): x along the face's x; up RELATIVE to the face center;
// front/back along the face normal; minDim = smallest local extent.
mapG.updateMatrixWorld(true);
const COS = Math.cos(0.21), SIN = Math.sin(0.21);
const manElements = mapG.children.map((c: THREE.Object3D) => {
    const mesh = c as THREE.Mesh;
    const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    mesh.updateMatrixWorld?.();
    const m = mesh.matrixWorld;
    const v = new THREE.Vector3();
    let minX = Infinity, maxX = -Infinity, minU = Infinity, maxU = -Infinity, minO = Infinity, maxO = -Infinity;
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m);
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        const u = (v.y - 1.55) * COS - (v.z + 0.06) * SIN;      // in-plane up, face-centered
        minU = Math.min(minU, u); maxU = Math.max(maxU, u);
        const o = (v.y - 1.55) * SIN + (v.z + 0.06) * COS;      // along face normal
        minO = Math.min(minO, o); maxO = Math.max(maxO, o);
    }
    mesh.geometry.computeBoundingBox();
    const gb = mesh.geometry.boundingBox!;
    const dims = [gb.max.x - gb.min.x, gb.max.y - gb.min.y, gb.max.z - gb.min.z].sort((a, b) => a - b);
    const r4 = (t: number) => Math.round(t * 1e4) / 1e4;
    return { name: mesh.name, cx: r4((minX + maxX) / 2), halfW: r4((maxX - minX) / 2), cy: r4((minU + maxU) / 2), halfH: r4((maxU - minU) / 2), front: r4(maxO), back: r4(minO), minDim: r4(dims[0]) };
});

// flatten mapG into g before merging (dress-10 law: mergeByMaterial merges
// DIRECT mesh children only — a nested group ships unmerged, one draw call
// per chip). Bake each element's mapG-relative transform into its geometry;
// names vanish into per-material buckets.
g.updateMatrixWorld(true);
const baked: THREE.Mesh[] = [];
for (const c of [...mapG.children]) {
    const m = c as THREE.Mesh;
    const geom = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(mapG.matrix, m.matrix));
    const nm = new THREE.Mesh(geom, m.material);
    nm.name = m.name;
    baked.push(nm);
}
mapG.clear();
g.remove(mapG);
for (const nm of baked) g.add(nm);

mergeByMaterial(g, "mb3");
writeFileSync("agents/arthur/assets/village_mapboard3.glb", toGLB(g));
writeFileSync("agents/arthur/assets/village_mapboard3.review.json", JSON.stringify({ scale: S, face: FACE, elements: manElements }, null, 1));
console.log("village_mapboard3.glb —", g.children.length, "nodes;", manElements.length, "painted elements");
