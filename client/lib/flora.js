// flora — the browser host for eidoverse-video's vegetation brush
// (`createFlora`), which replaced `makeGrass` upstream (eidoverse-video
// c56800c). Real species with PBR map sets — grass carpets with seasonal
// color, desert bunch grass, three Mojave shrubs, yucca, corn with baked
// cobs and planted rows — GPU-instanced whole plants, self-animating wind,
// and pushers that part the foliage around walkers.
//
// This file owns everything worlds-specific about hosting it:
//
//   MODULE  — vegetation.js is an ES module (the engine injects it through a
//             loader shim; a browser imports it natively off /library/).
//   ASSETS  — the module reads its map sets Deno-style; we prime exactly the
//             files the requested species needs into the Deno-shim VFS first.
//   LEGACY  — `grass` verb args already persisted in world logs speak
//             makeGrass (bladeHeight/spacing/perCell/hex colors). Those logs
//             must replay forever, so old bags are mapped onto an equivalent
//             createFlora stroke here, at the client edge — the log is never
//             rewritten.
//   FIELD   — the returned field is shaped to terrain.js's setGrass contract
//             (autoHooks, setDensity) and carries the interior-clearing mask
//             and avatar pushers that grass_groom used to own for makeGrass.
import { THREE, TSL, bus } from './core.js';
import { primeFiles } from './assets.js';
import { colliders } from './colliders.js';
import { myState } from './controller.js';
import { remotes } from './remotes.js';

// ---- module ----------------------------------------------------------------

let floraMod = null;
/** Import the vegetation module off the library route. Native ESM — relative
 *  imports inside it (shrub/corn generators) resolve against the same route. */
export async function loadFloraModule() {
  if (!floraMod) {
    floraMod = import('/library/eidoverse/vegetation.js').then((m) => {
      // engine parity: the loader shim registers these globally
      globalThis.createFlora = m.createFlora;
      globalThis.FLORA_SPECIES = m.FLORA_SPECIES;
      globalThis.GRASS_COLORS = m.GRASS_COLORS;
      globalThis.resetFloraOccupancy = m.resetFloraOccupancy;
      return m;
    });
  }
  return floraMod;
}

// ---- assets ----------------------------------------------------------------

const GRASS_DIR = 'eidoverse/assets/grass';
/** Prime the map sets a species needs (albedo/normal/roughness/translucency,
 *  blade-fit + anchor JSONs, shrub bark). The module reads them synchronously
 *  Deno-style; missing optional maps degrade gracefully inside it. */
async function ensureFloraAssets(mod, species) {
  const spec = mod.FLORA_SPECIES[species];
  if (!spec) return;
  const paths = [];
  const set = (base) => {
    for (const kind of ['albedo', 'normal', 'roughness', 'translucency']) {
      paths.push(`${GRASS_DIR}/${base}_${kind}.png`);
    }
  };
  if (spec.maps) set(spec.maps);
  if (spec.stem) {
    for (const kind of ['albedo', 'normal', 'roughness']) {
      paths.push(`${GRASS_DIR}/${spec.stem}_${kind}.png`);
    }
  }
  if (spec.archetype === 'blades') paths.push(`${GRASS_DIR}/${spec.maps}_fit.json`);
  if (spec.archetype === 'shrub') paths.push(`${GRASS_DIR}/shrub_anchors.json`);
  await primeFiles(paths); // missing files warn + degrade, never throw
}

// ---- legacy args -----------------------------------------------------------

// makeGrass's blade atlas replacement has a known opaque mean (documented in
// vegetation.js: 91/138/35). A legacy hex color maps to the multiplier that
// carries the atlas mean to that hex — the same field intent, spoken in the
// new system's terms.
const ATLAS_MEAN = [91, 138, 35];
const LEGACY_KEYS = ['bladeHeight', 'spacing', 'perCell', 'colorTip',
  'windSpeed', 'lean', 'fade', 'fadeStart', 'fadeEnd', 'fadeColor', 'backlight'];

function isLegacyArgs(a) {
  return LEGACY_KEYS.some((k) => a[k] !== undefined) || typeof a.color === 'number';
}

function hexToMultiplier(hex, tipHex) {
  const c = new THREE.Color(hex);
  const t = tipHex !== undefined ? new THREE.Color(tipHex) : c;
  // blade color reads mostly at the lit tip half — bias the blend that way
  const rgb = [(c.r * 0.4 + t.r * 0.6) * 255, (c.g * 0.4 + t.g * 0.6) * 255, (c.b * 0.4 + t.b * 0.6) * 255];
  return rgb.map((v, i) => Math.min(2.5, Math.max(0.2, v / ATLAS_MEAN[i])));
}

/** A persisted `grass` bag → createFlora options. New-style bags pass
 *  through; legacy makeGrass bags are translated. */
export function mapGrassArgs(a) {
  if (!isLegacyArgs(a)) return { species: 'grass', ...a };
  const out = {
    species: 'grass',
    width: a.width, depth: a.depth, size: a.size, center: a.center, seed: a.seed,
    height: a.bladeHeight ?? 0.42,
    // legacy density knobs vs their own old defaults (spacing 0.26, perCell 4)
    density: Math.min(2.2, Math.max(0.25,
      ((0.26 / (a.spacing ?? 0.26)) ** 2) * ((a.perCell ?? 4) / 4))),
    wind: Math.min(2, Math.max(0, (a.wind ?? 0.24) / 0.24)),
  };
  if (a.color !== undefined) out.color = hexToMultiplier(a.color, a.colorTip);
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

// ---- interior clearings ----------------------------------------------------
// Ported from grass_groom (which was makeGrass-specific and retires with it):
// exact-collider interiors paint their footprints black into a mask; the
// vertex stage sinks masked plants underground. One change for the instanced
// world: the mask is sampled at the PLANT's world XZ — the output of the
// field's own positionNode — not at positionLocal, which is per-plant local
// space under instancing.
const MASK = 256;
let _clr = null;

export function paintClearings() {
  if (!_clr) return;
  const { ctx, tex, W, D } = _clr;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, MASK, MASK);
  ctx.fillStyle = '#000';
  for (const [, e] of colliders) {
    if (!e.interior) continue;
    const { obj, box } = e;
    const s = obj.scale?.x || 1;
    const hw = ((box.max.x - box.min.x) / 2) * s + 0.15;
    const hd = ((box.max.z - box.min.z) / 2) * s + 0.15;
    const bx = ((box.max.x + box.min.x) / 2) * s, bz = ((box.max.z + box.min.z) / 2) * s;
    const c = Math.cos(obj.rotation.y), n = Math.sin(obj.rotation.y);
    const wx = obj.position.x + bx * c + bz * n;
    const wz = obj.position.z - bx * n + bz * c;
    ctx.save();
    ctx.translate(((wx + W / 2) / W) * MASK, ((wz + D / 2) / D) * MASK);
    ctx.rotate(-obj.rotation.y);
    ctx.fillRect((-hw / W) * MASK, (-hd / D) * MASK, (2 * hw / W) * MASK, (2 * hd / D) * MASK);
    ctx.restore();
  }
  tex.needsUpdate = true;
}

function wireClearings(mat, W, D) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = MASK;
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  _clr = { canvas, ctx: canvas.getContext('2d'), tex, W, D };
  const { Fn, texture, vec2, vec3, float } = TSL;
  const orig = mat.positionNode;
  mat.positionNode = Fn(() => {
    const p = vec3(orig).toVar();
    const uv = p.xz.add(vec2(W / 2, D / 2)).div(vec2(W, D));
    const mask = texture(tex, uv).r;                // 1 = meadow, 0 = interior
    const sink = float(1).sub(mask).mul(4);         // deep enough for corn, not just blades
    return p.sub(vec3(0, sink, 0));
  })();
  paintClearings();
  bus.on('entity', paintClearings);
}

// ---- density dial ----------------------------------------------------------
// The perf governor thins the meadow before dropping resolution (Safari fill
// rate). Instanced fields make this near-free: shuffle the per-instance
// attribute arrays once (deterministic — a field must stay the same field),
// and InstancedMesh.count becomes a uniform-density dial.
function wireDensityDial(field) {
  const geo = field.mesh.geometry;
  const attrs = ['aPosRot', 'aScaleVar', 'aPhase'].map((n) => geo.getAttribute(n)).filter(Boolean);
  const n = field.count;
  if (!n || !attrs.length) return;
  const order = Array.from({ length: n }, (_, i) => i);
  let seed = 0x6d2b79f5;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000);
  for (let i = n - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    const t = order[i]; order[i] = order[j]; order[j] = t;
  }
  for (const a of attrs) {
    const sz = a.itemSize, src = a.array.slice();
    for (let i = 0; i < n; i++) {
      const s = order[i] * sz, d = i * sz;
      for (let k = 0; k < sz; k++) a.array[d + k] = src[s + k];
    }
    a.needsUpdate = true;
  }
  // the stem mesh (shrub wood, corn canes ride the same attribute OBJECTS, so
  // the shuffle above already covers it — only the count needs mirroring)
  field.setDensity = (f) => {
    const keep = Math.max(1, Math.round(n * Math.min(1, Math.max(0.05, f))));
    field.mesh.count = keep;
    if (field.stemMesh) field.stemMesh.count = keep;
  };
}

// ---- pushers ---------------------------------------------------------------
// The brush's own interaction model: up to 4 pusher slots part the plants
// around moving bodies. Slot 0 is the local avatar; the rest are the nearest
// remote presences. This is per-frame and cheap (a uniform write).
function wirePushers(field) {
  const R = 1.1;
  const hook = () => {
    const list = [];
    if (myState?.pos) list.push({ x: myState.pos.x, y: myState.pos.y, z: myState.pos.z, r: R });
    if (remotes?.size) {
      const near = [];
      for (const [, rb] of remotes) {
        const p = rb?.avatar?.root?.position;
        if (p) near.push(p);
      }
      if (myState?.pos) {
        near.sort((a, b) => a.distanceToSquared(myState.pos) - b.distanceToSquared(myState.pos));
      }
      for (const p of near.slice(0, 3)) list.push({ x: p.x, y: p.y, z: p.z, r: R });
    }
    field.setPushers(list);
  };
  (globalThis._autoParticleSystems ||= []).push(hook);
  return hook;
}

// ---- the field -------------------------------------------------------------

// The `grass` verb is a world singleton, but a real biome is several strokes
// (the engine's field-approved Mojave recipe is galleta + three shrubs at
// de-centred organic stands + yucca). `preset` bags compose those strokes
// client-side under ONE field object, so the verb model stays untouched.
function presetStrokes(args) {
  const W = args.width ?? args.size ?? 80, D = args.depth ?? args.size ?? 70;
  const [cx, cz] = args.center ?? [0, 0];
  const seed = args.seed ?? 7;
  const sc = (f) => Math.round(f * Math.min(W, D));
  if (args.preset === 'mojave') {
    return [
      { species: 'galleta_dry', width: W, depth: D, center: [cx, cz], seed, density: 1.3 },
      { species: 'blackbrush', width: W - 2, depth: D - 2, center: [cx + sc(0.08), cz - sc(0.05)], seed: seed + 2, density: 0.85, footprint: 'organic' },
      { species: 'blackbrush', width: W - 2, depth: D - 2, center: [cx - sc(0.09), cz + sc(0.08)], seed: seed + 52, variant: 1, density: 0.85, footprint: 'organic' },
      { species: 'creosote', width: W, depth: D, center: [cx - sc(0.06), cz - sc(0.08)], seed: seed + 5, density: 0.85, footprint: 'organic' },
      { species: 'creosote', width: W, depth: D, center: [cx + sc(0.1), cz + sc(0.06)], seed: seed + 85, variant: 1, density: 0.85, footprint: 'organic' },
      { species: 'sagebrush', width: W - 2, depth: D - 2, center: [cx + sc(0.05), cz + sc(0.1)], seed: seed + 9, density: 0.85, footprint: 'organic' },
      { species: 'yucca', width: W, depth: D, center: [cx, cz], seed: seed + 18, density: 0.7 },
    ];
  }
  if (args.species === 'corn' && !args.rows) {
    // a corn field without explicit rows gets honest agriculture
    return [{ rows: { spacing: 0.9, plant: 0.26 }, corn: { peelChance: 0.25 }, ...args }];
  }
  return [args];
}

/** Build a flora field from a `grass` verb bag. Returns a field shaped to
 *  terrain.js's setGrass contract: { mesh, material, update, autoHooks,
 *  setDensity }. The mesh is NOT auto-added — the caller owns the scene. */
export async function buildFloraField(rawArgs, { scene, heightFn }) {
  const mod = await loadFloraModule();
  const args = mapGrassArgs(rawArgs);
  const strokes = presetStrokes(args);
  const species = [...new Set(strokes.map((st) => st.species ?? 'grass'))];
  for (const sp of species) await ensureFloraAssets(mod, sp);
  // the grass verb is a world singleton: each build starts a fresh occupancy
  // registry, or a replaced field's plants would still claim their ground
  mod.resetFloraOccupancy();
  const group = new THREE.Group();
  const fields = [];
  for (const st of strokes) {
    const f = await mod.createFlora({ ...st, heightFn });
    wireDensityDial(f);
    wireClearings(f.material, st.width ?? st.size ?? 30, st.depth ?? st.size ?? 30);
    group.add(f.mesh);
    fields.push(f);
  }
  const field = {
    mesh: group,
    material: fields[0]?.material,
    update: fields[0]?.update,
    setPushers: (list) => { for (const f of fields) f.setPushers(list); },
    setDensity: (k) => { for (const f of fields) f.setDensity?.(k); },
  };
  const pusherHook = wirePushers(field);
  // setGrass removes every hook this field owns (each stroke's wind + pushers)
  field.autoHooks = [...fields.map((f) => f.update), pusherHook];
  scene.add(group);
  return field;
}
