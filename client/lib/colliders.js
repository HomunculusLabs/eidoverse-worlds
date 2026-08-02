// colliders — the physical reading of placed geometry.
//
// Every spawned object gets a box fit from its own geometry: an OBB (local
// AABB + the entity's yaw). Boxy things (desks, crates, barrels) block movement
// and their tops are walkable ground. Tall things (trees, streetlights) would
// wall you off with their canopy extents, so they collide as a slim centre
// pillar instead — you can't walk through a trunk, but you can walk under the
// branches.
//
// This is also where Layer-0 affordances come from: a surface that is walkable
// is, by the same data, sittable and placeable-on. Nobody authors that.

import { THREE } from './core.js';
import { MeshBVH } from 'three-mesh-bvh';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const UP = new THREE.Vector3(0, 1, 0);
export const colliders = new Map(); // entity id -> { obj, box, pillar, exact?, cell }

// ---- exact (trimesh) colliders ----------------------------------------------
// Boxes read the OUTSIDE of things. Generated interiors are the opposite: the
// avatar is INSIDE the concave shape — one box seals the room shut, and the
// floor must be real geometry (stairs, thresholds, uneven ground). Room-scale
// spawns therefore collide against their actual triangles via a BVH:
//   floor = downward raycast (step-up capped), walls = closest-point at hip
//   height. Auto-applied when footprint ≥ 16 m² AND height ≥ 2.2 m; the spawn
//   verb can force either way with collide: "exact" | "box".
const STEP = 0.55;   // max mantle-less step-up, metres — one comfortable stair
const HIP = 0.95;    // wall-probe height: floors stay > r away, walls don't
const TALL = 1.9;    // default body height above `pos` — an avatar on its feet

function buildExact(obj) {
  obj.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
  const geoms = [];
  obj.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position) return;
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone());
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const clean = new THREE.BufferGeometry(); // position-only: BVH wants no skinning/uv baggage
    clean.setAttribute('position', g.getAttribute('position'));
    geoms.push(clean);
  });
  if (!geoms.length) return null;
  return { bvh: new MeshBVH(mergeGeometries(geoms, false)) };
}

// ---- spatial hash -----------------------------------------------------------
// resolveColliders used to walk EVERY entity every frame, allocating as it
// went. Free at 20 objects; the frame budget at 500. Objects are bucketed by
// world-space cell and only the 3×3 neighbourhood around the query is tested.
const CELL = 8; // metres
const buckets = new Map();
const cellKey = (x, z) => `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;

function bucketAdd(id, entry) {
  // an OBB can straddle cells — register in every cell its footprint touches
  const { obj, box } = entry;
  const s = obj.scale?.x || 1; // imports land wrong-sized and get resized in-world
  const r = Math.max(
    Math.abs(box.min.x), Math.abs(box.max.x),
    Math.abs(box.min.z), Math.abs(box.max.z),
  ) * s;
  entry.cells = [];
  const x0 = Math.floor((obj.position.x - r) / CELL), x1 = Math.floor((obj.position.x + r) / CELL);
  const z0 = Math.floor((obj.position.z - r) / CELL), z1 = Math.floor((obj.position.z + r) / CELL);
  for (let cx = x0; cx <= x1; cx++) {
    for (let cz = z0; cz <= z1; cz++) {
      const k = `${cx},${cz}`;
      if (!buckets.has(k)) buckets.set(k, new Set());
      buckets.get(k).add(id);
      entry.cells.push(k);
    }
  }
}
function bucketRemove(id, entry) {
  for (const k of entry?.cells ?? []) {
    const s = buckets.get(k);
    if (s) { s.delete(id); if (!s.size) buckets.delete(k); }
  }
}

const _probe = new THREE.Vector3();
// Can an avatar STAND at the footprint centre? Interiors: yes — walls are metres
// away. Solids with mass at the centre (a tree's trunk, a statue) : no. This is
// what separates a walkable room from a big leafy thing whose bounding box
// merely LOOKS room-scale. Local space in, world-metre threshold out.
function isHollow(bvh, box, s) {
  // probe the box's mid-height: floor and ceiling are both far there, so the
  // nearest surface is a WALL (rooms: metres away) or the mass at the centre
  // (a tree's trunk: right here). Measuring at floor+1m would wrongly count the
  // floor you stand on as "near" and read every room as solid.
  _probe.set((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, (box.min.z + box.max.z) / 2);
  const res = bvh.closestPointToPoint(_probe, {});
  return res ? res.distance * s > 0.9 : false;
}

function decide(entry, s) {
  const { box, pref } = entry;
  const roomScale = (box.max.x - box.min.x) * (box.max.z - box.min.z) * s * s >= 16
    && (box.max.y - box.min.y) * s >= 2.2;
  let exact;
  if (pref === 'exact') exact = true;
  else if (pref === 'box') exact = false;
  else if (roomScale) {
    // room-SIZED isn't enough — a tree's canopy is too. Only the HOLLOW ones
    // (you can stand inside) become exact; trees fall through to pillar so you
    // still walk under the branches (and no grass clearing paints under them).
    if (!entry.exact) entry.exact = buildExact(entry.obj);
    exact = entry.exact ? isHollow(entry.exact.bvh, box, s) : false;
  } else exact = false;
  if (exact && !entry.exact) entry.exact = buildExact(entry.obj);
  if (!exact) entry.exact = null;         // tree/solid: use pillar/box, no trimesh, no clearing
  entry.pillar = !entry.exact && (box.max.y - box.min.y) * s > 2.4;
}

export function fitCollider(id, obj, { collide, scale = 1 } = {}) {
  const box = new THREE.Box3().setFromObject(obj); // obj still at identity here
  if (box.isEmpty()) return;
  const entry = { obj, box, pref: collide, pillar: false, exact: null, cells: [] };
  decide(entry, scale);
  colliders.set(id, entry);
  bucketAdd(id, entry);
}

/** Call after an in-world rescale: re-decides exact-vs-box against the NEW
 *  size (a dollhouse import scaled to a building becomes walkable-inside)
 *  and re-buckets with the scaled footprint. */
export function refitCollider(id) {
  const e = colliders.get(id);
  if (!e) return;
  bucketRemove(id, e);
  decide(e, e.obj.scale?.x || 1);
  bucketAdd(id, e);
}
export function removeCollider(id) {
  const e = colliders.get(id);
  if (e) bucketRemove(id, e);
  colliders.delete(id);
}
/** Call after moving an entity so its bucket registration follows it. */
export function reindexCollider(id) {
  const e = colliders.get(id);
  if (!e) return;
  bucketRemove(id, e);
  bucketAdd(id, e);
}

function* near(x, z) {
  const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const s = buckets.get(`${cx + i},${cz + j}`);
      if (!s) continue;
      for (const id of s) {
        const e = colliders.get(id);
        if (e) yield e;
      }
    }
  }
}

// ---- resolution -------------------------------------------------------------

let blockedTop = null;
export const lastBlockedTop = () => blockedTop;

const _local = new THREE.Vector3();
const _push = new THREE.Vector3();
const _exits = [
  { d: 0, x: 1, z: 0 }, { d: 0, x: -1, z: 0 },
  { d: 0, x: 0, z: 1 }, { d: 0, x: 0, z: -1 },
];

/** Push `pos` out of anything solid and return the ground height under it.
 *  Mutates pos.x/pos.z — never pos.y; placing the body vertically is the
 *  caller's job, and `r` is a HORIZONTAL radius (a vertical cylinder, not a
 *  sphere). `terrainAt` supplies the base ground. `tall` is how far the body
 *  extends ABOVE pos.y: 1.9 for an avatar standing on its feet, a couple of
 *  centimetres for a single ragdoll joint. It decides what you can pass
 *  underneath, and it scales the step-up and wall-probe heights, which were
 *  constants tuned for a standing human and wildly wrong for a wrist. */
const _ray = new THREE.Ray();
const _hip = new THREE.Vector3();
const _cp = {};

export function resolveColliders(pos, terrainAt, r = 0.32, tall = TALL) {
  blockedTop = null;
  let ground = terrainAt(pos.x, pos.z);
  // Everything below is written for a body of SOME height standing at `pos`.
  // The avatar is a 1.9m capsule on its feet; a ragdoll joint is a 3cm bead.
  // Sharing one routine between them means the vertical numbers cannot be
  // constants — a 55cm step-up allowance applied to a hand teleports it onto
  // the nearest crate, and a hip-height wall probe applied to a wrist lying on
  // the floor measures the wall a metre above the wrist.
  const step = Math.min(STEP, tall * 0.3);   // a ragdoll does not climb stairs
  const probeY = Math.min(HIP, tall * 0.5);  // mid-body, not "hip"
  const spanY = Math.max(r, tall * 0.26);    // how far up/down a wall hit counts
  for (const { obj, box, pillar, exact } of near(pos.x, pos.z)) {
    if (exact) {
      // work in entity-local space (yaw-only rotation, uniform scale)
      const s = obj.scale.x || 1;
      _local.set(pos.x - obj.position.x, 0, pos.z - obj.position.z)
        .applyAxisAngle(UP, -obj.rotation.y).divideScalar(s);
      const localY = (pos.y - obj.position.y) / s;
      // floor: nearest surface below the feet (+step allowance) IS the ground
      _ray.origin.set(_local.x, localY + step / s, _local.z);
      _ray.direction.set(0, -1, 0);
      const hit = exact.bvh.raycastFirst(_ray, THREE.DoubleSide);
      if (hit) {
        const gy = obj.position.y + hit.point.y * s;
        if (gy <= pos.y + step && gy > ground) ground = gy;
      }
      // walls: closest triangle to a mid-body probe pushes the capsule out
      _hip.set(_local.x, localY + probeY / s, _local.z);
      const res = exact.bvh.closestPointToPoint(_hip, _cp);
      if (res) {
        const dx = (_hip.x - res.point.x) * s, dz = (_hip.z - res.point.z) * s;
        const dy = Math.abs(_hip.y - res.point.y) * s;
        const dh = Math.hypot(dx, dz);
        if (dh < r && dy < spanY && dh > 1e-6) {
          _push.set(dx / dh, 0, dz / dh).applyAxisAngle(UP, obj.rotation.y)
            .multiplyScalar(r - dh);
          pos.x += _push.x; pos.z += _push.z;
        }
      }
      continue; // never box-test an exact entity — that would seal interiors
    }
    const bs = obj.scale?.x || 1;
    _local.set(pos.x - obj.position.x, 0, pos.z - obj.position.z)
      .applyAxisAngle(UP, -obj.rotation.y).divideScalar(bs);
    const br = r / bs;
    let minX = box.min.x, maxX = box.max.x, minZ = box.min.z, maxZ = box.max.z;
    if (pillar) {
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
      minX = cx - 0.25; maxX = cx + 0.25; minZ = cz - 0.25; maxZ = cz + 0.25;
    }
    if (_local.x < minX - br || _local.x > maxX + br || _local.z < minZ - br || _local.z > maxZ + br) continue;
    const topY = obj.position.y + box.max.y * bs;
    // Are we UNDER it? Nothing here ever read box.min.y, so every box was an
    // infinite column reaching down to the world floor: a mezzanine slab
    // modelled at y 2.4-2.7 shoved a walking avatar 2.3m sideways at ground
    // level, and a tabletop ejected anything that tried to lie beneath it.
    // The `pillar` heuristic was the only way anything was ever passable
    // underneath, which is why trees worked and archways did not.
    const bottomY = obj.position.y + box.min.y * bs;
    if (pos.y + tall <= bottomY) continue;
    if (pos.y >= topY - 0.08) {
      // at/above the top: the box is floor, not wall
      if (_local.x > minX && _local.x < maxX && _local.z > minZ && _local.z < maxZ) {
        ground = Math.max(ground, topY);
      }
      continue;
    }
    // inside the (radius-expanded) footprint below the top: push out the
    // nearest face
    _exits[0].d = (maxX + br) - _local.x;
    _exits[1].d = _local.x - (minX - br);
    _exits[2].d = (maxZ + br) - _local.z;
    _exits[3].d = _local.z - (minZ - br);
    let best = _exits[0];
    for (let i = 1; i < 4; i++) if (_exits[i].d < best.d) best = _exits[i];
    // Grazing the UNDERSIDE of an overhang is not walking into its side, and
    // exiting through the nearest vertical face regardless is how a head
    // brushing a mezzanine by 1.3cm got flung 1.6m sideways, clear of a 3m
    // slab's whole footprint — on a room-sized one it is tens of metres.
    //
    // Two things must hold before we decline the push. There must BE a down:
    // a crate sitting on the floor has its underside at ground level, so no
    // amount of "you could go under it" is true and it must still push you
    // sideways. And the overlap must be a GRAZE rather than "I do not fit" —
    // a waist-high counter overlaps a standing body by most of a metre, and
    // waving that through would let the avatar phase through it at chest
    // height. Note that "the shortest way out is down" is NOT the test: for
    // any large slab the sideways exit is metres away, so down always wins and
    // everything becomes passable.
    if (bottomY > ground + 0.05
        && (pos.y + tall) - bottomY <= Math.max(0.05, tall * 0.08)) continue;
    _push.set(best.x, 0, best.z).applyAxisAngle(UP, obj.rotation.y).multiplyScalar(best.d * bs);
    pos.x += _push.x; pos.z += _push.z;
    // pillars aren't mantleable — and neither is anything, to a body that
    // cannot climb. The ragdoll runs this routine once per JOINT per frame;
    // without the height test it would leave the controller's mantle probe
    // holding whichever wrist last brushed a crate. That is harmless only
    // because updateMe does not run while you are down, which is not a
    // guarantee worth resting on.
    if (!pillar && tall >= TALL) blockedTop = topY;
  }
  return ground;
}

// ---- Layer-0 affordances ----------------------------------------------------

/** Nearest sittable surface to a point: a horizontal top at chair-ish height
 *  within `range`. This is DESIGN.md's `seatOn` — no authoring, no metadata,
 *  the geometry IS the affordance. Returns {y, x, z, yaw, id} or null. */
export function findSeat(pos, range = 1.2) {
  let best = null;
  for (const [id, { obj, box, pillar, exact }] of colliders) {
    if (pillar || exact) continue; // interiors aren't chairs; furniture inside them is
    const sc = obj.scale?.x || 1;
    const topY = obj.position.y + box.max.y * sc;
    const rise = topY - pos.y;
    if (rise < 0.25 || rise > 0.85) continue;            // not seat height
    // centre of the top face, in world space
    _local.set((box.min.x + box.max.x) / 2 * sc, 0, (box.min.z + box.max.z) / 2 * sc)
      .applyAxisAngle(UP, obj.rotation.y);
    const cx = obj.position.x + _local.x, cz = obj.position.z + _local.z;
    const d = Math.hypot(cx - pos.x, cz - pos.z);
    if (d > range) continue;
    if (!best || d < best.d) best = { d, id, x: cx, z: cz, y: topY, yaw: obj.rotation.y };
  }
  return best;
}

/** Highest surface directly under a point — what a dropped object lands on.
 *  This is what makes "put the mug ON the table" work instead of the mug
 *  sinking to y=0 beside it. */
export function surfaceUnder(x, z, terrainAt, maxY = Infinity, skipId = null) {
  let y = terrainAt(x, z);
  let onto = null;
  for (const [id, { obj, box, pillar, exact }] of colliders) {
    if (pillar || id === skipId) continue;
    if (exact) {
      // dropped things land on the actual surface (stair tread, mezzanine)
      const s = obj.scale.x || 1;
      _local.set(x - obj.position.x, 0, z - obj.position.z)
        .applyAxisAngle(UP, -obj.rotation.y).divideScalar(s);
      const fromY = (Math.min(maxY, obj.position.y + box.max.y * s) - obj.position.y) / s;
      _ray.origin.set(_local.x, fromY + 0.01, _local.z);
      _ray.direction.set(0, -1, 0);
      const hit = exact.bvh.raycastFirst(_ray, THREE.DoubleSide);
      if (hit) {
        const topY = obj.position.y + hit.point.y * s;
        if (topY > y && topY <= maxY) { y = topY; onto = id; }
      }
      continue;
    }
    const sc2 = obj.scale?.x || 1;
    _local.set(x - obj.position.x, 0, z - obj.position.z).applyAxisAngle(UP, -obj.rotation.y).divideScalar(sc2);
    if (_local.x < box.min.x || _local.x > box.max.x || _local.z < box.min.z || _local.z > box.max.z) continue;
    const topY = obj.position.y + box.max.y * sc2;
    if (topY > y && topY <= maxY) { y = topY; onto = id; }
  }
  return { y, onto };
}

export function clearColliders() {
  colliders.clear();
  buckets.clear();
}
