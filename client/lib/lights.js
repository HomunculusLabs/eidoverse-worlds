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

/** Grant a group its PointLight caster (call only within budget). */
function grantCast(group) {
  const { color = 0xffd9a0, intensity = 16, range = 10 } = group.userData.lightParams;
  const pl = new THREE.PointLight(new THREE.Color(color), intensity, range, 1.7);
  pl.castShadow = false;   // point-light shadows are a second cost cliff
  group.add(pl);
  group.userData.pointLight = pl;
  casters.add(group);
  // pre-warm the scene-wide recompile OFF the click, the way spawns do —
  // gpu lane, lowest priority: relighting never outranks a person arriving
  enqueue(() => renderer.compileAsync(scene, camera).catch(() => {}), { lane: 'gpu', priority: 0 });
}

/** Build a placed-light entity: gizmo + (budget permitting) a PointLight.
 *  `keep: true` exempts it from the perf governor's shedALight — dear lights
 *  (a resident's porchlight) survive while sheddable ones go first. */
export function makeLight({ color = 0xffd9a0, intensity = 16, range = 10, keep = false } = {}) {
  const group = new THREE.Group();
  const gizmo = makeLightGizmo(color);
  group.add(gizmo);

  group.userData.isLight = true;
  group.userData.lightParams = { color, intensity, range, keep: !!keep };
  group.userData.noCamCollide = true;

  if (budgetLeft() > 0) grantCast(group);
  else noBudget();
  return group;
}

/** Partial update of a placed light — the render side of re-issuing the
 *  `light` verb on an existing id. Only fields present in the patch change;
 *  the fold upstream merges the same way, so a joiner and a live client
 *  agree. A doused (budget-shed) light that gets updated re-lights if the
 *  budget has since freed up — updating a light is a fine moment to re-grant. */
export function updateLight(group, { color, intensity, range, keep } = {}) {
  if (!group?.userData?.isLight) return;
  const p = group.userData.lightParams;
  if (color != null) p.color = color;
  if (intensity != null) p.intensity = intensity;
  if (range != null) p.range = range;
  if (keep != null) p.keep = !!keep;

  if (color != null) {
    const gizmo = group.children.find((o) => o.isMesh);
    gizmo?.material?.color?.set(new THREE.Color(color));
  }
  const pl = group.userData.pointLight;
  if (pl) {
    if (color != null) pl.color.set(new THREE.Color(color));
    if (intensity != null) pl.intensity = intensity;
    if (range != null) pl.distance = range;
  } else if (budgetLeft() > 0) {
    grantCast(group);
  }
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
 *  pixels. The light stays (its gizmo glows); only the expensive cast drops.
 *  Lights marked `keep` are exempt — sheddable ones go first, and when only
 *  kept lights remain this returns false and the governor moves to its next
 *  lever (clouds, grass, pixels). */
export function shedALight() {
  const last = [...casters].filter((g) => !g.userData.lightParams?.keep).pop();
  if (!last) return false;
  const pl = last.userData.pointLight;
  if (pl) { last.remove(pl); pl.dispose?.(); last.userData.pointLight = null; }
  casters.delete(last);
  MAX_CAST = Math.max(0, MAX_CAST - 1);   // don't immediately re-grant it
  return true;
}

export const litCount = () => casters.size;
