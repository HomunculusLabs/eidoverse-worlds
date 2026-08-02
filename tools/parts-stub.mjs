// Test stand-in for client/lib/world.js AND client/lib/colliders.js — see
// tools/parts-test.ts. motion.js touches exactly three names from those two
// modules; both resolve here so the test never drags in the renderer cone.
export const entities = new Map();
export const comps = new Map();
export const reindexCollider = () => {};
