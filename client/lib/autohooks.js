// autohooks — who owns what in the engine's per-frame hook array.
//
// `globalThis._autoParticleSystems` is a GLOBAL the toolkit drains every frame
// (sky.js's updateAutoSystems). Three different owners push into it: the sky
// system (cloud drift, weather), the meadow (wind, avatar pushers), and now
// every entity emitter. Nobody announces which entries are theirs.
//
// The sky owns its entries by DIFFING the array around its own async build,
// which is sound only while nothing else registers during that build. It is a
// real window: a `comp {type:"particles"}` folding while the sky is still
// awaiting its modules registers a hook the sky then claims and, at its next
// teardown, silently removes — leaving the emitter in the scene, frozen,
// facing wherever the camera was. The scene-children half of that diff already
// refuses to claim what the world owns (`userData.entityId`); this is the same
// refusal for the hook half, and it is deliberately general rather than a
// particles-shaped special case: any host subsystem that keeps a per-frame
// hook should mark it, and any subsystem that claims by diff should skip
// marked hooks.
//
// DOM-free and THREE-free; unit-tested in tools/particles-test.ts.

/** The engine's hook array, created on demand. Never captured in a module
 *  const — the toolkit makes it lazily and this file may load first. */
export const autoHooks = () => (globalThis._autoParticleSystems ||= []);

/** Hooks a host subsystem owns and will retire itself. Identity, not index. */
const hostOwned = new Set();

/** Mark an already-registered hook as host-owned. Used when the hook was
 *  pushed by upstream code we called (makeParticles registers its own
 *  billboard update) rather than by us. */
export function ownHook(fn) {
  if (typeof fn === 'function') hostOwned.add(fn);
  return fn;
}

/** Register a host-owned per-frame hook. */
export function pushHostHook(fn) {
  autoHooks().push(ownHook(fn));
  return fn;
}

/** Unregister a hook by IDENTITY and drop its ownership mark. Returns whether
 *  it was actually in the array. Safe to call twice. */
export function releaseHook(fn, autos = autoHooks()) {
  if (typeof fn !== 'function') return false;
  hostOwned.delete(fn);
  if (!Array.isArray(autos)) return false;
  const i = autos.indexOf(fn);
  if (i >= 0) autos.splice(i, 1);
  return i >= 0;
}

export const isHostOwned = (fn) => hostOwned.has(fn);

/**
 * What a subsystem that claims by DIFF may legitimately call its own: hooks
 * that appeared since `before` (a Set snapshotted at build start) and that no
 * host subsystem has claimed. The second condition is what makes the claim
 * safe across an await — a hook registered DURING the build is new, but it is
 * not therefore the builder's.
 */
export function claimUnowned(before, autos = autoHooks()) {
  const seen = before instanceof Set ? before : new Set(before ?? []);
  return (autos ?? []).filter((h) => !seen.has(h) && !hostOwned.has(h));
}

/** Test seam: how many hooks are currently marked host-owned. */
export const hostOwnedCount = () => hostOwned.size;
