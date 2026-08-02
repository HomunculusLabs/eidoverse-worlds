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

function decide(entry, s) {
  const { box, pref } = entry;
  const roomScale = (box.max.x - box.min.x) * (box.max.z - box.min.z) * s * s >= 16
    && (box.max.y - box.min.y) * s >= 2.2;
  const exact = pref === 'exact' || (pref !== 'box' && roomScale);
  // once exact, stay exact — a room scaled back down is still concave
  if (exact && !entry.exact) entry.exact = buildExact(entry.obj);
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
 *  Mutates pos.x/pos.z. `terrainAt` supplies the base ground. */
const _ray = new THREE.Ray();
const _hip = new THREE.Vector3();
const _cp = {};

export function resolveColliders(pos, terrainAt, r = 0.32) {
  blockedTop = null;
  let ground = terrainAt(pos.x, pos.z);
  for (const { obj, box, pillar, exact } of near(pos.x, pos.z)) {
    if (exact) {
      // work in entity-local space (yaw-only rotation, uniform scale)
      const s = obj.scale.x || 1;
      _local.set(pos.x - obj.position.x, 0, pos.z - obj.position.z)
        .applyAxisAngle(UP, -obj.rotation.y).divideScalar(s);
      const localY = (pos.y - obj.position.y) / s;
      // floor: nearest surface below the feet (+step allowance) IS the ground
      _ray.origin.set(_local.x, localY + STEP / s, _local.z);
      _ray.direction.set(0, -1, 0);
      const hit = exact.bvh.raycastFirst(_ray, THREE.DoubleSide);
      if (hit) {
        const gy = obj.position.y + hit.point.y * s;
        if (gy <= pos.y + STEP && gy > ground) ground = gy;
      }
      // walls: closest triangle to a hip-height probe pushes the capsule out
      _hip.set(_local.x, localY + HIP / s, _local.z);
      const res = exact.bvh.closestPointToPoint(_hip, _cp);
      if (res) {
        const dx = (_hip.x - res.point.x) * s, dz = (_hip.z - res.point.z) * s;
        const dy = Math.abs(_hip.y - res.point.y) * s;
        const dh = Math.hypot(dx, dz);
        if (dh < r && dy < 0.5 && dh > 1e-6) {
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
    _push.set(best.x, 0, best.z).applyAxisAngle(UP, obj.rotation.y).multiplyScalar(best.d * bs);
    pos.x += _push.x; pos.z += _push.z;
    if (!pillar) blockedTop = topY; // pillars aren't mantleable
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
