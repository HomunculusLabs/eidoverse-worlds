// flora_field — field lifecycle assembly, DOM-free (unit-tested in
// spec/flora_field.test.ts). A "field" is the setGrass-shaped object the
// grass verb owns: possibly several engine strokes composed under one group.

import { ownHook, releaseHook } from './autohooks.js';

/** Compose stroke fields (createFlora results) + a clearing mask handle into
 *  ONE setGrass-shaped field. The caller supplies the parent group (THREE
 *  lives with the caller) and appends any host hooks (pushers) to autoHooks. */
export function composeField({ group, fields, mask }) {
  return {
    mesh: group,
    material: fields[0]?.material,
    update: fields[0]?.update,
    setPushers: (list) => { for (const f of fields) f.setPushers?.(list); },
    setDensity: (k) => { for (const f of fields) f.setDensity?.(k); },
    // The engine registered these itself; marking them says the meadow retires
    // them, so no subsystem that claims per-frame hooks by diffing the global
    // array may adopt one that appeared while ITS own async build was in
    // flight (see autohooks.js).
    autoHooks: fields.map((f) => ownHook(f.update)).filter(Boolean),
    dispose: () => {
      for (const f of fields) f.dispose?.();
      mask?.dispose?.();
    },
  };
}

/** Retire a field completely: unhook its per-frame updates, release its GPU
 *  resources, remove it from the scene. Prefers the field's own dispose()
 *  (engine fields know their textures); falls back to the legacy single-mesh
 *  teardown for fields that predate it. Safe against double-removal. */
export function retireField(field, autos, scene) {
  if (!field) return;
  const hooks = field.autoHooks ?? (field.update ? [field.update] : []);
  for (const h of hooks) releaseHook(h, autos);
  if (field.dispose) {
    field.dispose();
  } else if (field.mesh) {
    field.mesh.geometry?.dispose?.();
    const m = field.mesh.material;
    if (Array.isArray(m)) m.forEach((x) => x?.dispose?.()); else m?.dispose?.();
  }
  if (field.mesh) scene?.remove?.(field.mesh);
}
