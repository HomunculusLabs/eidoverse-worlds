// lights — placed light sources, as authored entities.
//
// A light is a Thing: it persists, replays, and folds into the snapshot, so it
// is a `light` VERB, not presence. Each one renders two parts:
//
//   * a small emissive sphere GIZMO — always shown, cheap (one basic material,
//     no scene-wide cost), so a light is visible and selectable even when it
//     isn't casting;
//   * a real PointLight — granted only within a global budget.
//
// The budget exists because adding a point light forces a material recompile
// across the WHOLE scene, and with an instanced grass field that recompile can
// hang the tab (measured: grass + 4 point lights never finished compiling).
// Past the budget a light still GLOWS but does not cast — the same honest
// degradation the emissive-lamp system uses. The budget is shared with those
// lamps, so it bounds total point lights, not just these.

import { THREE, scene, renderer, camera } from './core.js';
import { lampCount } from './sky.js';
import { enqueue } from './loadwork.js';

// Total point lights the scene may cast, across placed lights AND emissive
// lamps. Conservative on purpose; a re-measure (not a guess) can raise it.
let MAX_CAST = 4;
const casters = new Set();     // the placed lights currently casting, newest last

const budgetLeft = () => Math.max(0, MAX_CAST - lampCount() - casters.size);

let warned = false;
function noBudget() {
  if (!warned) {
    warned = true;
    console.warn(`[lights] point-light budget (${MAX_CAST}) reached — further lights glow but do not cast`);
  }
}

/** A bare gizmo mesh — the visible, always-cheap part. Used both for a placed
 *  light and as the placement ghost. */
export function makeLightGizmo(color = 0xffd9a0) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 12),
    // basic node material: emits its colour regardless of scene lighting, so
    // the gizmo reads as a glowing bulb and costs no lighting recompute
    new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(color), toneMapped: false }),
  );
  m.userData.noCamCollide = true;   // don't let the camera collide with a bulb
  m.castShadow = m.receiveShadow = false;
  return m;
}

/** Build a placed-light entity: gizmo + (budget permitting) a PointLight. */
export function makeLight({ color = 0xffd9a0, intensity = 16, range = 10 } = {}) {
  const group = new THREE.Group();
  const c = new THREE.Color(color);
  const gizmo = makeLightGizmo(color);
  group.add(gizmo);

  group.userData.isLight = true;
  group.userData.lightParams = { color, intensity, range };
  group.userData.noCamCollide = true;

  if (budgetLeft() > 0) {
    const pl = new THREE.PointLight(c, intensity, range, 1.7);
    pl.castShadow = false;   // point-light shadows are a second cost cliff
    group.add(pl);
    group.userData.pointLight = pl;
    casters.add(group);
    // pre-warm the scene-wide recompile OFF the click, the way spawns do —
    // gpu lane, lowest priority: relighting never outranks a person arriving
    enqueue(() => renderer.compileAsync(scene, camera).catch(() => {}), { lane: 'gpu', priority: 0 });
  } else {
    noBudget();
  }
  return group;
}

/** Free a light: drop its caster (returning budget) and dispose the gizmo. */
export function disposeLight(group) {
  if (!group?.userData?.isLight) return;
  if (casters.delete(group)) {
    // a caster freed up — an over-budget light elsewhere could now cast, but
    // we don't hunt for one: lights are placed rarely and re-lighting on the
    // next placement is good enough. Keep it simple.
  }
  group.traverse((o) => {
    o.geometry?.dispose?.();
    if (Array.isArray(o.material)) o.material.forEach((m) => m?.dispose?.());
    else o.material?.dispose?.();
  });
}

/** Perf governor hook: give back one caster under load, before shedding
 *  pixels. The light stays (its gizmo glows); only the expensive cast drops. */
export function shedALight() {
  const last = [...casters].pop();
  if (!last) return false;
  const pl = last.userData.pointLight;
  if (pl) { last.remove(pl); pl.dispose?.(); last.userData.pointLight = null; }
  casters.delete(last);
  MAX_CAST = Math.max(0, MAX_CAST - 1);   // don't immediately re-grant it
  return true;
}

export const litCount = () => casters.size;
