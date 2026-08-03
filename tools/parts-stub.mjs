// Test stand-in for client/lib/world.js AND client/lib/colliders.js — see
// tools/parts-test.ts. motion.js touches exactly four names from those two
// modules; both resolve here so the test never drags in the renderer cone.
export const entities = new Map();
export const comps = new Map();
export const reindexCollider = () => {};

// same contract as world.js findPart: name → node, misses retry after 1s
const _partCache = new WeakMap();
export function findPart(root, name) {
  let map = _partCache.get(root);
  if (!map) { map = new Map(); _partCache.set(root, map); }
  const hit = map.get(name);
  if (hit && (hit.obj || Date.now() - hit.at < 1000)) return hit.obj;
  let found = null;
  root.traverse((c) => { if (!found && c !== root && c.name === name) found = c; });
  map.set(name, { obj: found, at: Date.now() });
  return found;
}
