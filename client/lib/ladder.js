// ladder — climbable volumes, the Layer-0 way.
//
// Ladders are a COMPONENT, not geometry: an entity carrying a `ladder` comp
// is climbable inside its authored box. The comp verb folds blindly on the
// server (parameters, never code), so no server change is involved; this
// module is the client evaluator, and the same comp reaches the MCPL
// headless side through the entity bag for future walk-verb use.
//
// Component shape (all in entity-LOCAL metres):
//   { type: 'ladder', min: [x,y,z], max: [x,y,z] }
// A yaw-only entity transform applies. The box should cover the run band:
// from just below the base to the top rung/landing lip.

import { THREE } from './core.js';
import { entities, comps } from './world.js';

const UP = new THREE.Vector3(0, 1, 0);

export const ladders = new Map();   // id -> { obj, min, max }

const _local = new THREE.Vector3();

/** World-space AABB of a ladder's climb volume, entity yaw applied (the
 *  engine's axis convention: wx = px + lx·cos + lz·sin,
 *  wz = pz − lx·sin + lz·cos). */
export function ladderBox(l) {
  const o = l.obj;
  const c = Math.cos(o.rotation?.y ?? 0), s = Math.sin(o.rotation?.y ?? 0);
  const p = o.position;
  // corners in world
  const xs = [], zs = [];
  for (const [lx, lz] of [[l.min[0], l.min[2]], [l.min[0], l.max[2]],
    [l.max[0], l.min[2]], [l.max[0], l.max[2]]]) {
    xs.push(p.x + lx * c + lz * s);
    zs.push(p.z - lx * s + lz * c);
  }
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minZ: Math.min(...zs), maxZ: Math.max(...zs),
    bottom: p.y + l.min[1], top: p.y + l.max[1],
  };
}

/** Nearest ladder to `pos` whose climb volume contains a body of radius r
 *  at any height within [pos.y, pos.y + 1.9]; null when none. */
export function ladderAt(pos, r = 0.55) {
  let best = null;
  for (const l of ladders.values()) {
    const b = ladderBox(l);
    if (pos.x < b.minX - r || pos.x > b.maxX + r || pos.z < b.minZ - r || pos.z > b.maxZ + r) continue;
    if (pos.y + 1.9 < b.bottom || pos.y > b.top) continue;
    const d = Math.max(b.minX - pos.x, pos.x - b.maxX, b.minZ - pos.z, pos.z - b.maxZ, 0);
    if (!best || d < best.d) best = { d, ladder: l, box: b };
  }
  ladders._scratch = best;   // caller reads the same object; zero-alloc loop
  return best;
}

/** Re-fold the registry from live comp bags (initial fold + every comp
 *  verb). Mirrors the seat/sockets evaluator pattern from models.js. */
export function foldLadders() {
  ladders.clear();
  for (const [id, bag] of comps) {
    const lc = bag?.ladder;
    if (!lc || !Array.isArray(lc.min) || !Array.isArray(lc.max)) continue;
    const obj = entities.get(id);
    if (!obj) continue;
    ladders.set(id, { obj, min: lc.min, max: lc.max });
  }
}

// Refold on every comp event (cheap: village-scale N) and on entity
// realization (a ladder lib may spawn after its comp landed).
import { bus } from './core.js';
bus.on('comp', () => foldLadders());
