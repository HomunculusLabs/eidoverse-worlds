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
