// terrain — the world's ground truth for "how high is the floor here".
//
// Its own module (rather than living in world.js) purely to break a cycle:
// the controller needs ground height every frame, and world.js needs the
// controller's position to place things. Both depend on this instead.

import { scene, ground, grid } from './core.js';

let current = null;

export const heightAt = (x, z) => (current ? current.heightAt(x, z) : 0);
export const hasTerrain = () => current !== null;

export function setTerrain(t) {
  if (current) scene.remove(current.mesh);
  current = t;
  if (t) {
    scene.add(t.mesh);
    // terrain replaces the stage floor
    ground.visible = false;
    grid.visible = false;
  } else {
    ground.visible = true;
    grid.visible = true;
  }
}

// ---- grass -----------------------------------------------------------------
// makeGrass adds its own mesh to the scene AND pushes its wind `update` into
// globalThis._autoParticleSystems. So replacing or clearing grass has to undo
// BOTH — otherwise a new field stacks on the old, and the old field's update
// keeps ticking against a mesh that's been disposed. setGrass owns that.
let currentGrass = null;

export function setGrass(field) {
  if (currentGrass) {
    if (currentGrass.mesh) {
      scene.remove(currentGrass.mesh);
      currentGrass.mesh.geometry?.dispose?.();
      const m = currentGrass.mesh.material;
      if (Array.isArray(m)) m.forEach((x) => x?.dispose?.()); else m?.dispose?.();
    }
    const autos = globalThis._autoParticleSystems;
    // a groomed field owns SEVERAL per-frame hooks (wind + sheen); remove all
    // of them, falling back to the bare update for an ungroomed field
    const hooks = currentGrass.autoHooks ?? (currentGrass.update ? [currentGrass.update] : []);
    if (Array.isArray(autos)) {
      for (const h of hooks) { const i = autos.indexOf(h); if (i >= 0) autos.splice(i, 1); }
    }
  }
  currentGrass = field ?? null;
  // sticky density: a machine that had to thin its meadow keeps it thin
  // across re-grows, instead of re-discovering the same slow frame rate
  if (field?.setDensity && grassDensity < 1) field.setDensity(grassDensity);
}
export const clearGrass = () => setGrass(null);
export const hasGrass = () => currentGrass !== null;

// Perf governor's handle on the meadow.
let grassDensity = 1;
export function setGrassDensity(f) {
  grassDensity = f;
  currentGrass?.setDensity?.(f);
}
export const getGrassDensity = () => grassDensity;
