// Four-Berth Lodge — standalone cabin-overhaul candidate. LOCAL ONLY.
// Run from repo root: bun agents/arthur/cabin-overhaul/build-bunkhouse.ts
// Original: assets/mkbunk.ts, not the mkv3-ring bunk. Four sleepers remain four.
// The old two stacked pairs crossed the ±1.8m interior wall faces. Four single
// alcove berths are a deliberate equivalent: full-size, directly accessible,
// no invented ladder functionality or future component required.
import * as THREE from 'three';
import { M, box, beam, wall, roof, window, finish } from './kit.ts';
import { decideSupportClass } from '../../../client/lib/supportclass.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const ID = 'nx-town-bunkhouse';
const FY = .26, W = 7, D = 4, T = .2;
const EAVE = 2.95, RISE = 1.18, OVER = .46;
const RUN = D / 2 + OVER, RIDGE = EAVE + RISE;
const WALL_TOP = EAVE + RISE * OVER / RUN - .054;
const DOOR_W = 2.14, DOOR_H = 2.52;
const ENVELOPE = { min: [-4.15, 0, -2.621], max: [4.15, 8, 2.621] };
const g = new THREE.Group();

// Stone footing and an actually flush timber floor; no trip rail in the entry.
box(g, 'foundation', W, .18, D, 0, .09, 0, M.stone);
// Tongue/subfloor closes the 6mm board joints: the real browser's downward
// support ray must not drop 8cm through a seam. Joints are only 2mm deep.
box(g, 'floor_tongue_substrate', W, .078, D, 0, .219, 0, M.wood);
for (let i = 0; i < 20; i++) {
  box(g, `floor_board_${i}`, W / 20 - .006, .08, D - .015,
    -W / 2 + (i + .5) * W / 20, FY - .04, 0, M.wood);
}
box(g, 'porch_deck', 2.48, FY, .43, 0, FY / 2, 2.185, M.stone);
box(g, 'porch_low_step', 2.60, .13, .20, 0, .065, 2.50, M.stone);
box(g, 'threshold_flush', DOOR_W, .08, .42, 0, FY - .04, 1.94, M.wood);

// Meaningful openings: these are holes through the shell, not glowing boxes
// attached to solid walls. The high front pair leaves the b20 rider unburied.
const frontWindows = [-2.22, 2.22].map(x => ({ x, w: 1.32, bottom: 1.46, h: .88 }));
const backWindows = [-2.14, 2.14].map(x => ({ x, w: 1.26, bottom: .92, h: 1.18 }));
wall(g, 'front_lime', W, WALL_TOP - FY, T, 0, FY, 1.90, 0,
  [{ x: 0, w: DOOR_W, bottom: 0, h: DOOR_H }, ...frontWindows]);
wall(g, 'back_lime', W, WALL_TOP - FY, T, 0, FY, -1.90, Math.PI, backWindows);
for (const side of [-1, 1]) {
  wall(g, `end_lime_${side}`, D - .20, WALL_TOP - FY, T, side * 3.40, FY, 0,
    side * Math.PI / 2, [{ x: 0, w: .78, bottom: .82, h: 1.50 }]);
  window(g, `end_window_${side}`, side * 3.505, FY + .82 + .75, 0,
    .78, 1.50, side * Math.PI / 2, false);
}
for (const o of frontWindows) window(g, `front_window_${o.x}`, o.x, FY + o.bottom + o.h / 2, 2.005, o.w, o.h);
for (const o of backWindows) window(g, `back_window_${o.x}`, -o.x, FY + o.bottom + o.h / 2, -2.005, o.w, o.h, Math.PI);

// Continuous stone skirt and dark sill, each interrupted by the doorway.
for (const side of [-1, 1]) {
  const width = (W - DOOR_W) / 2;
  box(g, `front_stone_${side}`, width, .24, .27, side * (DOOR_W / 2 + width / 2), FY + .12, 1.90, M.stone);
  box(g, `front_sill_${side}`, width, .10, .25, side * (DOOR_W / 2 + width / 2), .56, 1.90);
  box(g, `end_stone_${side}`, .27, .24, D, side * 3.40, FY + .12, 0, M.stone);
  box(g, `end_sill_${side}`, .25, .10, D, side * 3.40, .56, 0);
}
box(g, 'back_stone', W, .24, .27, 0, FY + .12, -1.90, M.stone);
box(g, 'back_sill', W, .10, .25, 0, .56, -1.90);

// Structural rhythm: large corner posts, top plates, and high braces only.
// Exact b20 mesh, not the old mkbunk comment: x[-3.11,-1.29], y[1.05,1.51].
// Its back meets z=2.0; the raised front sills start at y=1.58.
for (const x of [-3.40, 3.40]) for (const z of [-1.90, 1.90]) {
  box(g, `corner_${x}_${z}`, .21, WALL_TOP - FY + .04, .24, x, (WALL_TOP + FY) / 2, z);
  const ix = x - Math.sign(x) * .54;
  beam(g, `corner_brace_${x}_${z}`, [x, 2.55, z], [ix, WALL_TOP - .04, z], .12, .25);
}
for (const z of [-1.90, 1.90]) box(g, `wall_plate_${z}`, W, .17, .26, 0, WALL_TOP - .035, z);
for (const x of [-3.40, 3.40]) {
  box(g, `end_plate_${x}`, .25, .17, D, x, WALL_TOP - .035, 0);
  for (const z of [-.58, .58]) box(g, `end_window_post_${x}_${z}`, .23, WALL_TOP - .62, .12, x, (WALL_TOP + .62) / 2, z);
}
// Cedar lower panels on the end walls contrast with the lime long elevations.
for (const side of [-1, 1]) for (const z of [-1.23, 1.23]) {
  for (let i = 0; i < 5; i++) box(g, `end_cedar_${side}_${z}_${i}`, .035, .39, .15,
    side * 3.511, .82, z + (i - 2) * .175, M.wood);
}

// Protected porch: two posts, open king-post truss, wide clear portal.
// Clear width is 1.86m at the stone shoes, 1.90m between timber posts.
for (const side of [-1, 1]) {
  box(g, `door_jamb_${side}`, .16, DOOR_H + .10, .31,
    side * 1.09, FY + (DOOR_H + .10) / 2, 1.94);
  box(g, `porch_post_${side}`, .20, 2.71, .20, side * 1.05, FY + 2.71 / 2, 2.38);
  box(g, `porch_shoe_${side}`, .24, .24, .25, side * 1.05, FY + .12, 2.38, M.stone);
  beam(g, `porch_brace_${side}`, [side * 1.05, 2.69, 2.38], [side * .72, 2.96, 2.38], .12, .16);
  beam(g, `porch_tie_${side}`, [side * 1.05, 2.95, 1.82], [side * 1.05, 2.95, 2.43], .14, .17);
}
box(g, 'door_header', DOOR_W + .22, .17, .32, 0, FY + DOOR_H + .085, 1.94);
box(g, 'porch_front_beam', 2.34, .20, .22, 0, 2.96, 2.39);

// Geometric roof join. Clip the kit's actual triangles against two valley
// planes; a smaller gable pasted onto an uninterrupted roof is not a join.
// Both roofs retain the kit's layered slabs, staggered slate joints and trim.
type V = { p: THREE.Vector3, n: THREE.Vector3, uv: THREE.Vector2 };
type HalfPlane = (v: V) => number;
function clip(poly: V[], plane: HalfPlane, positive = true): V[] {
  const out: V[] = [], sign = positive ? 1 : -1;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = sign * plane(a), db = sign * plane(b);
    if (da >= -1e-9) out.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      out.push({ p: a.p.clone().lerp(b.p, t), n: a.n.clone().lerp(b.n, t).normalize(), uv: a.uv.clone().lerp(b.uv, t) });
    }
  }
  return out;
}
const CROSS_EAVE = 3.00, CROSS_RISE = .93, CROSS_RUN = 1.21;
const JOIN_Z = (RIDGE - CROSS_EAVE - CROSS_RISE) / (RISE / RUN);
const JOIN_K = (CROSS_RISE / CROSS_RUN) / (RISE / RUN);
const p1: HalfPlane = v => v.p.z - JOIN_Z - JOIN_K * v.p.x;
const p2: HalfPlane = v => v.p.z - JOIN_Z + JOIN_K * v.p.x;
function joinedMesh(mesh: THREE.Mesh, inside: boolean): THREE.Mesh | null {
  mesh.updateMatrixWorld(true);
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  const pos = geometry.getAttribute('position'), norm = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv');
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const pp: number[] = [], nn: number[] = [], uu: number[] = [];
  for (let i = 0; i < pos.count; i += 3) {
    const tri: V[] = [0, 1, 2].map(j => ({
      p: new THREE.Vector3().fromBufferAttribute(pos, i + j).applyMatrix4(mesh.matrixWorld),
      n: new THREE.Vector3().fromBufferAttribute(norm, i + j).applyMatrix3(nm).normalize(),
      uv: new THREE.Vector2().fromBufferAttribute(uv, i + j),
    }));
    const polys = inside ? [clip(clip(tri, p1), p2)] : [clip(tri, p1, false), clip(clip(tri, p1), p2, false)];
    for (const poly of polys) for (let j = 1; j + 1 < poly.length; j++) {
      const t = [poly[0], poly[j], poly[j + 1]];
      if (new THREE.Triangle(...t.map(v => v.p) as [THREE.Vector3, THREE.Vector3, THREE.Vector3]).getArea() < 1e-10) continue;
      for (const v of t) { pp.push(...v.p.toArray()); nn.push(...v.n.toArray()); uu.push(...v.uv.toArray()); }
    }
  }
  if (!pp.length) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nn, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uu, 2));
  const out = new THREE.Mesh(geo, mesh.material); out.name = mesh.name; return out;
}
const mainRoof = new THREE.Group();
roof(mainRoof, 'long_roof', W, D, EAVE, RISE, 0, 0, OVER);
for (const c of [...mainRoof.children] as THREE.Mesh[]) {
  if (c.name.includes('_gable_')) continue;
  const front = /_(under_1|course_1_|seam_1_|eave_1$)/.test(c.name);
  if (front) { const m = joinedMesh(c, false); if (m) g.add(m); }
  else g.add(c);
}
const porchRoof = new THREE.Group();
roof(porchRoof, 'porch_roof', 2.10, 2.10, CROSS_EAVE, CROSS_RISE, 0, 0, .16);
const rotate = new THREE.Matrix4().makeRotationY(-Math.PI / 2); rotate.setPosition(0, 0, 1.32);
for (const c of [...porchRoof.children] as THREE.Mesh[]) {
  if (c.name.includes('_gable_')) continue; // Open porch truss, not a false dormer room.
  c.applyMatrix4(rotate);
  const m = joinedMesh(c, true); if (m) g.add(m);
}
for (const side of [-1, 1]) {
  const z = RUN + .012, x = side * (z - JOIN_Z) / JOIN_K;
  beam(g, `valley_flashing_${side}`, [0, RIDGE - (RISE / RUN) * JOIN_Z + .123, JOIN_Z],
    [x, RIDGE - (RISE / RUN) * z + .123, z], .042, .030, M.roofAlt);
  beam(g, `porch_truss_rafter_${side}`, [side * 1.18, 3.035, 2.42], [0, 3.94, 2.42], .12, .16);
}
box(g, 'porch_king_post', .12, .89, .16, 0, 3.485, 2.42, M.wood);

// Correct end closure follows the roof's TRUE slope at the wall plane. The
// kit's default gable uses its eave elevation at d/2, below an overhung slab;
// replace only our own generated gable meshes, never edit the shared kit.
function gableEnd(side: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-D / 2, WALL_TOP); shape.lineTo(D / 2, WALL_TOP);
  shape.lineTo(0, RIDGE - .054); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
  const m = new THREE.Mesh(geo, M.lime); m.name = `true_gable_${side}`;
  m.rotation.y = Math.PI / 2; m.position.x = side * 3.40 - T / 2; g.add(m);
  for (const z of [-1.88, 1.88]) beam(g, `end_gable_rafter_${side}_${z}`,
    [side * 3.512, WALL_TOP + .035, z], [side * 3.512, RIDGE - .05, 0], .11, .12);
  beam(g, `end_king_post_${side}`, [side * 3.512, WALL_TOP, 0], [side * 3.512, RIDGE - .05, 0], .12, .12);
}
gableEnd(-1); gableEnd(1);

// One warm visible entrance lantern, supported from the porch beam. No new
// light entity; don't resurrect the old hidden bead or invent component data.
box(g, 'lantern_stem', .045, .13, .045, .56, 2.91, 2.46, M.iron);
box(g, 'lantern_cap', .19, .06, .16, .56, 2.84, 2.46, M.iron);
box(g, 'lamp', .115, .16, .10, .56, 2.73, 2.46, M.amber);
box(g, 'lantern_base', .17, .04, .14, .56, 2.63, 2.46, M.iron);

// FOUR real 2.02×0.94m mattresses. Berths face a 2.16m central aisle, with
// low, open feet and no rails blocking access. The nearest wood stays x≥1.08.
const berths: { id: string, mattress: THREE.Mesh, footprint: THREE.Box3 }[] = [];
for (const side of [-1, 1]) for (const row of [-1, 1]) {
  const n = `berth_${side < 0 ? 'west' : 'east'}_${row < 0 ? 'rear' : 'front'}`;
  const x = side * 2.13, z = row * 1.10;
  box(g, `${n}_platform`, 2.10, .12, 1.04, x, .50, z, M.wood);
  for (const dx of [-.96, .96]) for (const dz of [-.43, .43]) {
    box(g, `${n}_foot_${dx}_${dz}`, .11, .24, .11, x + dx, FY + .12, z + dz);
  }
  box(g, `${n}_headboard`, .08, .72, 1.07, side * 3.17, FY + .36, z, M.wood);
  const mattress = box(g, `${n}_mattress`, 2.02, .14, .94, x, .63, z, M.lime);
  box(g, `${n}_blanket`, 1.10, .045, .96, x - side * .35, .723, z, row === side ? M.roof : M.roofAlt);
  for (const edge of [-1, 1]) box(g, `${n}_blanket_hem_${edge}`, .045, .05, .965,
    x - side * .35 + edge * .47, .727, z, M.timber);
  box(g, `${n}_pillow`, .39, .13, .74, x + side * .73, .755, z, M.lime);
  // Open-front cubby above the head: a bottom, top, two ends and a back,
  // not a solid dark block with an imagined compartment painted on it.
  box(g, `${n}_cubby_back`, .04, .58, .86, side * 3.28, 1.52, z, M.wood);
  for (const y of [1.20, 1.84]) box(g, `${n}_cubby_shelf_${y}`, .34, .06, .92, side * 3.13, y, z);
  for (const dz of [-.43, .43]) box(g, `${n}_cubby_end_${dz}`, .34, .60, .06, side * 3.13, 1.52, z + dz);
  box(g, `${n}_cubby_fold`, .23, .11, .53, side * 3.11, 1.29, z, M.lime);
  box(g, `${n}_cubby_tag`, .02, .095, .16, side * 2.952, 1.67, z, M.wood);
  berths.push({ id: n, mattress, footprint: new THREE.Box3(
    new THREE.Vector3(Math.min(x - 1.05, x + 1.05), FY, z - .535),
    new THREE.Vector3(Math.max(x - 1.05, x + 1.05), 1.88, z + .535)) });
}

// Deterministic acceptance checks run on EVERY build, before and after export.
// IntersectsTriangle is a real SAT test, not the corner-blind vertex census.
const walk = new THREE.Box3(new THREE.Vector3(-.90, FY + .01, -1.70), new THREE.Vector3(.90, FY + 2.20, 2.621));
const rider = new THREE.Box3(new THREE.Vector3(-3.110001, 1.049999, 2.001), new THREE.Vector3(-1.289999, 1.510001, 2.120001));
function triangleHits(root: THREE.Object3D, region: THREE.Box3) {
  root.updateMatrixWorld(true); const hits: string[] = [];
  root.traverse(o => {
    if (!(o as THREE.Mesh).isMesh) return;
    const m = o as THREE.Mesh, geom = m.geometry, pos = geom.getAttribute('position'), ix = geom.index;
    for (let i = 0; i < (ix?.count ?? pos.count); i += 3) {
      const points = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(pos, ix ? ix.getX(i + j) : i + j).applyMatrix4(m.matrixWorld));
      if (region.intersectsTriangle(new THREE.Triangle(...points as [THREE.Vector3, THREE.Vector3, THREE.Vector3]))) { hits.push(m.name); break; }
    }
  }); return hits;
}
const negativeFixture = new THREE.Group();
box(negativeFixture, 'deliberate_blocker', 2.2, .12, .20, 0, 1.4, 2);
assert.deepEqual(triangleHits(negativeFixture, walk), ['deliberate_blocker'], 'clearance checker must catch a slab with corners outside the lane');
assert.deepEqual(triangleHits(g, walk), [], 'blocked 1.8m × 2.2m entrance/interior sweep');
assert.deepEqual(triangleHits(g, rider), [], 'trim obscures fixed rider');
const shellOnly = new THREE.Group();
for (const c of g.children.filter(c => /^(front_lime|back_lime|end_lime)/.test(c.name))) shellOnly.add(c.clone());
const windowVoids: THREE.Box3[] = [];
for (const [windows, z] of [[frontWindows, 1.90], [backWindows, -1.90]] as const) {
  for (const o of windows) windowVoids.push(new THREE.Box3(
    new THREE.Vector3(o.x - o.w / 2 + .12, FY + o.bottom + .12, z - .11),
    new THREE.Vector3(o.x + o.w / 2 - .12, FY + o.bottom + o.h - .12, z + .11)));
}
for (const side of [-1, 1]) windowVoids.push(new THREE.Box3(
  new THREE.Vector3(side * 3.40 - .11, FY + .94, -.27),
  new THREE.Vector3(side * 3.40 + .11, FY + 2.20, .27)));
assert.equal(windowVoids.length, 6);
for (const v of windowVoids) assert.deepEqual(triangleHits(shellOnly, v), [], 'glazing mounted on an uncut wall');
assert.equal(berths.length, 4);
for (const b of berths) {
  const bb = new THREE.Box3().setFromObject(b.mattress);
  assert(bb.min.x >= -3.30 && bb.max.x <= 3.30 && bb.min.z >= -1.80 && bb.max.z <= 1.80, `${b.id} outside room`);
  const size = bb.getSize(new THREE.Vector3()); assert(size.x >= 2 && size.z >= .90, 'undersized mattress');
}
for (let a = 0; a < berths.length; a++) for (let b = a + 1; b < berths.length; b++) assert(!berths[a].footprint.intersectsBox(berths[b].footprint), 'overlapping berths');
const bounds = new THREE.Box3().setFromObject(g), size = bounds.getSize(new THREE.Vector3());
assert(bounds.min.x >= ENVELOPE.min[0] && bounds.max.x <= ENVELOPE.max[0] && bounds.min.z >= ENVELOPE.min[2] && bounds.max.z <= ENVELOPE.max[2], 'envelope growth');
assert(decideSupportClass({ w: size.x, d: size.z, h: size.y }).roomScale, 'not an honest exact-trimesh room');
const stats = finish(g, ID);
assert(stats.nodes <= 24, 'draw-node budget exceeded');

// Decode exact written vertex bytes with owning-node transforms, then re-run
// clearance/rider gates. Keep geometry exports honest across merge/writer code.
const bytes = readFileSync(`${import.meta.dir}/build/${ID}.glb`);
const jsonLen = bytes.readUInt32LE(12), doc = JSON.parse(bytes.subarray(20, 20 + jsonLen).toString());
const bin = bytes.subarray(20 + jsonLen + 8), decoded = new THREE.Group();
function readAccessor(index: number) {
  const a = doc.accessors[index], v = doc.bufferViews[a.bufferView];
  const width = ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 } as any)[a.type];
  const bytesPer = ({ 5126: 4, 5125: 4, 5123: 2, 5121: 1 } as any)[a.componentType];
  assert(width && bytesPer && !a.sparse, 'unsupported accessor');
  const data: number[] = [];
  for (let i = 0; i < a.count; i++) for (let k = 0; k < width; k++) {
    const at = (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (v.byteStride ?? width * bytesPer) + k * bytesPer;
    data.push(a.componentType === 5126 ? bin.readFloatLE(at) : a.componentType === 5125 ? bin.readUInt32LE(at) : a.componentType === 5123 ? bin.readUInt16LE(at) : bin.readUInt8(at));
  } return { data, width };
}
function decodeNode(index: number, parent: THREE.Matrix4) {
  const n = doc.nodes[index];
  const local = n.matrix ? new THREE.Matrix4().fromArray(n.matrix) : new THREE.Matrix4().compose(
    new THREE.Vector3(...(n.translation ?? [0, 0, 0])), new THREE.Quaternion(...(n.rotation ?? [0, 0, 0, 1])), new THREE.Vector3(...(n.scale ?? [1, 1, 1])));
  const world = parent.clone().multiply(local);
  if (n.mesh !== undefined) for (const p of doc.meshes[n.mesh].primitives) {
    const pos = readAccessor(p.attributes.POSITION), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos.data, pos.width));
    if (p.indices !== undefined) geo.setIndex(readAccessor(p.indices).data);
    geo.applyMatrix4(world); const m = new THREE.Mesh(geo); m.name = n.name; decoded.add(m);
  }
  for (const child of n.children ?? []) decodeNode(child, world);
}
for (const n of doc.scenes[doc.scene ?? 0].nodes) decodeNode(n, new THREE.Matrix4());
assert.deepEqual(triangleHits(decoded, walk), [], 'exported entrance/interior blocked');
assert.deepEqual(triangleHits(decoded, rider), [], 'exported rider obscured');
const decodedBounds = new THREE.Box3().setFromObject(decoded);
for (const k of ['x', 'y', 'z'] as const) {
  assert(Math.abs(decodedBounds.min[k] - bounds.min[k]) < 1e-5 && Math.abs(decodedBounds.max[k] - bounds.max[k]) < 1e-5, 'written bounds diverged');
}
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const checks = {
  status: 'PASS', evidence: 'offline exact-byte geometry, not live locomotion', id: ID,
  sha256: stats.sha256, sourceSha256: hash(import.meta.path), kitSha256: hash(`${import.meta.dir}/kit.ts`),
  beforeServedSha256: hash(`${import.meta.dir}/before/${ID}.glb`),
  bounds: { min: decodedBounds.min.toArray(), max: decodedBounds.max.toArray() },
  floorY: FY, nominalDoorClearWidth: 1.86, nominalDoorHeadroom: 2.35,
  provedClearVolume: { min: walk.min.toArray(), max: walk.max.toArray() },
  exportedBlockingMeshes: 0, riderTrimBlockingMeshes: 0,
  rider: { id: 'nx-artwalk-b20-bunkhouse-four-rooms', local: [-2.2, 1.05, 2.0325], wallPlaneZ: 2.0 },
  sleepers: berths.map(b => ({ id: b.id, mattressBounds: (() => { const bb = new THREE.Box3().setFromObject(b.mattress); return { min: bb.min.toArray(), max: bb.max.toArray() }; })() })),
  cubbies: 4, realWindowOpenings: windowVoids.length,
  arrangement: 'four floor-level foot-entry alcove berths, two per side; equivalent to original four stacked sleepers, no ladder component',
  classifier: decideSupportClass({ w: size.x, d: size.z, h: size.y }),
  negativeClearanceFixture: 'PASS — wide slab crossing lane caught despite out-of-band corners',
  unchangedPoseRequired: JSON.parse(readFileSync(`${import.meta.dir}/before/contracts.json`, 'utf8')).find((x: any) => x.id === ID),
  liveWorldMutations: 0,
};
writeFileSync(`${import.meta.dir}/build/${ID}.checks.json`, JSON.stringify(checks, null, 2) + '\n');
console.log(JSON.stringify({ status: checks.status, sha256: stats.sha256, sourceSha256: checks.sourceSha256, kitSha256: checks.kitSha256,
  exportedBlockingMeshes: 0, riderTrimBlockingMeshes: 0, sleepers: checks.sleepers.length, cubbies: checks.cubbies, decodedBounds: checks.bounds }));
