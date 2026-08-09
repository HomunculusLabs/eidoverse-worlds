// parity — the shadow-mode probe (TEL0S_NOTES §11.6).
//
// While the migration runs two world models side by side — the legacy
// applyEntry scene path and the pure shared-fold shadow in state.js — this
// is the instrument that measures drift between them. House rule 1's
// remaining mirror (shared/fold.js vs applyEntry) stops being a hope and
// becomes a number you can print.
//
// Console surface: EW.foldParity() — run it in any live world, after any
// suspect sequence of verbs. It compares the fold's OWN outputs (entity
// ids, component bags, parents/mounts) and deliberately not realization
// (transforms mid-motion, loaded meshes): those diverge by design while an
// object is in flight or riding a motion comp.

import { state } from './state.js';
import { entities, comps, avatarMounts } from './world.js';

const jstr = (v) => JSON.stringify(v ?? null);

export function foldParity() {
  const shadow = state.st;
  const out = { hydrated: state.hydrated, lastSeq: state.lastSeq,
    checked: 0, onlyShadow: [], onlyLegacy: [], compDiffs: [], mountDiffs: [] };

  const legacyIds = new Set(entities.keys());
  const shadowIds = new Set(Object.keys(shadow.entities));
  for (const id of shadowIds) if (!legacyIds.has(id)) out.onlyShadow.push(id);
  for (const id of legacyIds) if (!shadowIds.has(id)) out.onlyLegacy.push(id);

  for (const id of shadowIds) {
    if (!legacyIds.has(id)) continue;
    out.checked++;
    const legacyBag = comps.get(id) ?? null;
    const shadowBag = shadow.entities[id].comp ?? null;
    if (jstr(legacyBag) !== jstr(shadowBag)) {
      out.compDiffs.push({ id, legacy: legacyBag, shadow: shadowBag });
    }
  }

  // body mounts: world.js's avatarMounts map vs the fold's mounts record
  const shadowMounts = shadow.mounts ?? {};
  const legacyMounts = avatarMounts instanceof Map ? Object.fromEntries(avatarMounts) : (avatarMounts ?? {});
  for (const id of new Set([...Object.keys(shadowMounts), ...Object.keys(legacyMounts)])) {
    if (jstr(legacyMounts[id]) !== jstr(shadowMounts[id])) {
      out.mountDiffs.push({ id, legacy: legacyMounts[id] ?? null, shadow: shadowMounts[id] ?? null });
    }
  }

  out.ok = !out.onlyShadow.length && !out.onlyLegacy.length
    && !out.compDiffs.length && !out.mountDiffs.length;
  console.log(`[parity] ${out.ok ? '✓ fold and legacy agree' : '✗ DRIFT'} — ` +
    `${out.checked} entities checked, +${out.onlyShadow.length} shadow-only, ` +
    `+${out.onlyLegacy.length} legacy-only, ${out.compDiffs.length} comp diffs, ` +
    `${out.mountDiffs.length} mount diffs (seq ${out.lastSeq})`);
  return out;
}
