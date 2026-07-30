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

const UP = new THREE.Vector3(0, 1, 0);
export const colliders = new Map(); // entity id -> { obj, box, pillar, cell }

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
  const r = Math.max(
    Math.abs(box.min.x), Math.abs(box.max.x),
    Math.abs(box.min.z), Math.abs(box.max.z),
  );
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

export function fitCollider(id, obj) {
  const box = new THREE.Box3().setFromObject(obj); // obj still at identity here
  if (box.isEmpty()) return;
  const entry = { obj, box, pillar: box.max.y - box.min.y > 2.4, cells: [] };
  colliders.set(id, entry);
  bucketAdd(id, entry);
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
export function resolveColliders(pos, terrainAt, r = 0.32) {
  blockedTop = null;
  let ground = terrainAt(pos.x, pos.z);
  for (const { obj, box, pillar } of near(pos.x, pos.z)) {
    _local.set(pos.x - obj.position.x, 0, pos.z - obj.position.z)
      .applyAxisAngle(UP, -obj.rotation.y);
    let minX = box.min.x, maxX = box.max.x, minZ = box.min.z, maxZ = box.max.z;
    if (pillar) {
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
      minX = cx - 0.25; maxX = cx + 0.25; minZ = cz - 0.25; maxZ = cz + 0.25;
    }
    if (_local.x < minX - r || _local.x > maxX + r || _local.z < minZ - r || _local.z > maxZ + r) continue;
    const topY = obj.position.y + box.max.y;
    if (pos.y >= topY - 0.08) {
      // at/above the top: the box is floor, not wall
      if (_local.x > minX && _local.x < maxX && _local.z > minZ && _local.z < maxZ) {
        ground = Math.max(ground, topY);
      }
      continue;
    }
    // inside the (radius-expanded) footprint below the top: push out the
    // nearest face
    _exits[0].d = (maxX + r) - _local.x;
    _exits[1].d = _local.x - (minX - r);
    _exits[2].d = (maxZ + r) - _local.z;
    _exits[3].d = _local.z - (minZ - r);
    let best = _exits[0];
    for (let i = 1; i < 4; i++) if (_exits[i].d < best.d) best = _exits[i];
    _push.set(best.x, 0, best.z).applyAxisAngle(UP, obj.rotation.y).multiplyScalar(best.d);
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
  for (const [id, { obj, box, pillar }] of colliders) {
    if (pillar) continue;
    const topY = obj.position.y + box.max.y;
    const rise = topY - pos.y;
    if (rise < 0.25 || rise > 0.85) continue;            // not seat height
    // centre of the top face, in world space
    _local.set((box.min.x + box.max.x) / 2, 0, (box.min.z + box.max.z) / 2)
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
  for (const [id, { obj, box, pillar }] of colliders) {
    if (pillar || id === skipId) continue;
    _local.set(x - obj.position.x, 0, z - obj.position.z).applyAxisAngle(UP, -obj.rotation.y);
    if (_local.x < box.min.x || _local.x > box.max.x || _local.z < box.min.z || _local.z > box.max.z) continue;
    const topY = obj.position.y + box.max.y;
    if (topY > y && topY <= maxY) { y = topY; onto = id; }
  }
  return { y, onto };
}

export function clearColliders() {
  colliders.clear();
  buckets.clear();
}
