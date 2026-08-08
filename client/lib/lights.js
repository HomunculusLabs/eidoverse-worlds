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
import { registerEditor } from './inspect.js';

// Total point lights the scene may cast, across placed lights AND emissive
// lamps. Conservative on purpose; a re-measure (not a guess) can raise it.
// KEPT lights live OUTSIDE this budget entirely: `keep: true` is an author
// saying "this light matters more than frame rate", so it always casts and
// consumes no slot — the budget governs only the sheddable pool. The cost is
// real (every cast is a scene-wide recompile + per-frame GPU), which is why
// keep is a deliberate checkbox and not the default.
let MAX_CAST = 4;
const casters = new Set();     // ALL casting placed lights, newest last

const sheddable = () => [...casters].filter((g) => !g.userData.lightParams?.keep);
const budgetLeft = () => MAX_CAST - lampCount() - sheddable().length;

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

/** Build a placed-light entity: gizmo + a PointLight when it may cast.
 *  `keep: true` casts UNCONDITIONALLY (no budget slot, never governor-shed);
 *  everything else casts only within the budget. */
export function makeLight({ color = 0xffd9a0, intensity = 16, range = 10, keep = false } = {}) {
  const group = new THREE.Group();
  const gizmo = makeLightGizmo(color);
  group.add(gizmo);

  group.userData.isLight = true;
  group.userData.lightParams = { color, intensity, range, keep: !!keep };
  group.userData.noCamCollide = true;

  if (keep || budgetLeft() > 0) grantCast(group);
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
    // un-keeping a casting light re-enters it into the budget; if that
    // overcommits the pool, the privilege it was casting on is gone — drop
    // its cast rather than silently running over budget
    if (keep === false && budgetLeft() < 0) {
      group.remove(pl); pl.dispose?.(); group.userData.pointLight = null;
      casters.delete(group);
    }
  } else if (p.keep || budgetLeft() > 0) {
    // checking "keep lit" on a doused light re-lights it ON THE SPOT — the
    // checkbox must DO something you can see (kept casts need no budget)
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
  const last = sheddable().pop();
  if (!last) return false;
  const pl = last.userData.pointLight;
  if (pl) { last.remove(pl); pl.dispose?.(); last.userData.pointLight = null; }
  casters.delete(last);
  MAX_CAST = Math.max(0, MAX_CAST - 1);   // don't immediately re-grant it
  return true;
}

export const litCount = () => casters.size;

// ---- the inspector's light editor -------------------------------------------
// Registered here because the MEANING of these fields lives in this module:
// what a sane brightness range is, and what `keep` honestly promises (never
// auto-doused by the perf governor — but still glow-only on a machine whose
// point-light budget was already spent). Dragging previews locally through
// updateLight; releasing commits ONE partial `light` verb (just the touched
// field — the fold merges), so a gesture is one log line, not a stream.
registerEditor(({ id, obj, commit }) => {
  if (!obj?.userData?.isLight) return null;
  const p = obj.userData.lightParams ?? {};
  const hex = '#' + (p.color ?? 0xffd9a0).toString(16).padStart(6, '0');
  const inten = p.intensity ?? 16;
  const range = p.range ?? 10;
  return {
    html: `<div style="display:flex;flex-direction:column;gap:4px;margin:4px 0">
      <label style="display:flex;gap:6px;align-items:center">color
        <input type="color" data-lp="color" value="${hex}"></label>
      <label style="display:flex;gap:6px;align-items:center">brightness
        <input type="range" data-lp="intensity" min="0" max="${Math.max(64, inten)}" step="1" value="${inten}" style="flex:1">
        <span data-lp-out="intensity" style="min-width:2.5em;text-align:right">${inten}</span></label>
      <label style="display:flex;gap:6px;align-items:center">range
        <input type="range" data-lp="range" min="1" max="${Math.max(40, range)}" step="1" value="${range}" style="flex:1">
        <span data-lp-out="range" style="min-width:2.5em;text-align:right">${range}</span></label>
      <label style="display:flex;gap:6px;align-items:center;cursor:pointer">
        <input type="checkbox" data-lp="keep" ${p.keep ? 'checked' : ''}>
        keep lit — never auto-doused for framerate</label>
      ${obj.userData.pointLight ? '' : '<div style="color:var(--dim);font-size:11px">glow-only on this machine (light budget) — it may still cast for others</div>'}
    </div>`,
    wire(root) {
      for (const el of root.querySelectorAll('[data-lp]')) {
        const field = el.dataset.lp;
        const read = () =>
          field === 'color' ? parseInt(el.value.slice(1), 16)
            : field === 'keep' ? el.checked
              : Number(el.value);
        el.addEventListener('input', () => {
          updateLight(obj, { [field]: read() });
          const out = root.querySelector(`[data-lp-out="${field}"]`);
          if (out) out.textContent = el.value;
        });
        el.addEventListener('change', () => {
          commit('light', { id, [field]: read() });
          el.blur();   // release focus so the panel's held repaints resume
        });
      }
    },
  };
});
