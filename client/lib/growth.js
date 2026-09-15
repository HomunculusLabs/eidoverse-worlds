// growth — the browser realization of `comp {type:"growth"}` (vocab-12).
//
// Wires itself to the comp and entity buses on import (the door.js /
// water.js pattern — no boot step of its own; main.js imports this file
// for its side effects beside './lib/water.js'). The plant's SIZE is
// NEVER tween state: growthK (shared/growth.js, the motion.js /
// doorYaw shared-verbatim pattern) derives the within-stage factor purely
// from (folded comp data, serverNow()) — so this client, a late joiner, a
// reconnect, and the mcpl agent's effective pose all agree at every
// instant with zero traffic after the one write. TIME grows the plant;
// a hand write (advance/tend) re-bases the clock and the next frame
// follows.
//
// Scale composes, never clobbers: applied = baseScale × k, where baseScale
// is the FOLDED authored scale (state.st.entities[id].scale ?? 1 — read
// live each tick, so a `place {scale}` and growth compose honestly). The
// rest pose/base is captured on first sight (the door doctrine); wilt
// holds whatever k the clock last earned (no invented collapse).

import { bus } from './core.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { serverNow } from './remotes.js';
import { state } from './state.js';
import { normalizeGrowth, growthK, stageAt } from '../../shared/growth.js';

/** id -> { base: number } — tracked plants; the base authored scale is
 *  read live from the fold each tick, so only the object identity is
 *  cached here. */
const plants = new Map();

function untrack(id) { plants.delete(id); }

// the bag arrives folded (join snapshot) or live (comp bus) — one path
function onGrowthComp(id, data) {
  if (data == null) {
    untrack(id);
    // a removed comp returns the entity to its authored rest — the next
    // fold-driven scale write (a place) restores it; we also restore now
    // so a de-planted sapling does not linger at k.
    const ent = state.st?.entities?.[id];
    const obj = entities.get(id);
    if (obj && ent) obj.scale.setScalar(ent.scale ?? 1);
    return;
  }
  if (!plants.has(id)) plants.set(id, {});
}
bus.on('comp', ({ id, type, data }) => {
  if (type === 'growth') onGrowthComp(id, data);
});
bus.on('entity', ({ id, kind }) => {
  // retire/demote/remove: the model is gone
  if (kind === 'remove' || kind === 'demote') untrack(id);
});
bus.on('world-reset', () => { for (const id of [...plants.keys()]) untrack(id); });

function tickGrowth() {
  const now = serverNow();
  for (const [id] of plants) {
    const data = comps.get(id)?.growth;
    if (!data) { untrack(id); continue; }   // bag says otherwise now
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder || obj.userData?.mountedTo) continue;
    const { cfg } = normalizeGrowth(data);
    const d = data;
    const k = growthK(cfg,
      typeof d.plantedAt === 'number' ? d.plantedAt : undefined,
      typeof d.at === 'number' ? d.at : undefined, now);
    // authored scale, live from the fold — a place {scale} composes
    const authored = state.st?.entities?.[id]?.scale ?? 1;
    const want = authored * k;
    const cur = obj.scale.x;
    if (Math.abs(want - cur) < 0.0005 && want === obj.scale.y && want === obj.scale.z) continue;
    obj.scale.setScalar(want);
  }
}

// motion-adjacent: growth is a function of time like motion, but keyed off
// the growth comp; runs each frame, cheap (a Map over plants only)
registerSystem('growth', () => tickGrowth());
