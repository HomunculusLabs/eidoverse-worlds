// flora — the browser host for eidoverse-video's vegetation brush
// (`createFlora`), which replaced `makeGrass` upstream. Real species with PBR
// map sets — grass carpets with seasonal color, desert bunch grass, three
// Mojave shrubs, yucca, corn with baked cobs and planted rows — GPU-instanced
// whole plants, self-animating wind, pushers that part foliage around walkers.
//
// This file owns the DOM/THREE-bound hosting. The pure logic lives beside it
// so it can be unit-tested without a browser:
//   flora_args.js  — legacy makeGrass-bag mapping + preset/variety strokes
//   flora_field.js — field composition + retirement lifecycle
// Both are covered by tools/flora.test.ts.
import { THREE, TSL, bus, camera } from './core.js';
import { primeFiles } from './assets.js';
import { colliders } from './colliders.js';
import { myState } from './controller.js';
import { remotes } from './remotes.js';
import { mapGrassArgs, presetStrokes } from './flora_args.js';
import { composeField } from './flora_field.js';
import { densityCount } from './grass_quality.js';
import { pushHostHook } from './autohooks.js';

export { mapGrassArgs, presetStrokes } from './flora_args.js';
export { retireField } from './flora_field.js';

// ---- module ----------------------------------------------------------------

const FLORA_URL = '/library/eidoverse/vegetation.js';
let floraMod = null;
/** Import the vegetation module off the library route. Native ESM — relative
 *  imports inside it (shrub/corn generators) resolve against the same route.
 *  The specifier goes through an indirect import so a BUNDLER treats it as
 *  runtime data: `/library/` exists only on the sequencer at run time, and a
 *  literal dynamic import made the bundle fail trying to resolve it. */
const runtimeImport = new Function('s', 'return import(s)');
export async function loadFloraModule() {
  if (!floraMod) {
    floraMod = runtimeImport(FLORA_URL).then((m) => {
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
  if (spec.maps) {
    for (const kind of ['albedo', 'normal', 'roughness', 'translucency']) {
      paths.push(`${GRASS_DIR}/${spec.maps}_${kind}.png`);
    }
  }
  if (spec.stem) {
    for (const kind of ['albedo', 'normal', 'roughness']) {
      paths.push(`${GRASS_DIR}/${spec.stem}_${kind}.png`);
    }
  }
  if (spec.archetype === 'blades') paths.push(`${GRASS_DIR}/${spec.maps}_fit.json`);
  if (spec.archetype === 'shrub') paths.push(`${GRASS_DIR}/shrub_anchors.json`);
  await primeFiles(paths); // missing files warn + degrade, never throw
}

// ---- interior clearings ----------------------------------------------------
// Exact-collider interiors paint their footprints black into a mask; the
// vertex stage sinks masked plants underground. ONE mask per FIELD, wired into
// EVERY stroke's material and disposed with the field: a module-global mask
// left earlier strokes pointing at an orphaned canvas (only the last stroke
// stayed repaintable) and leaked a bus listener per stroke per re-grow.
// The mask samples the PLANT's world XZ — the field's positionNode output —
// because positionLocal is per-plant space under instancing.
const MASK = 256;

function makeClearingMask(W, D) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = MASK;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  const paint = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, MASK, MASK);
    ctx.fillStyle = '#000';
    for (const [, e] of colliders) {
      if (!e.interior) continue;                    // things with a real floor only
      const { obj, box } = e;
      const s = obj.scale?.x || 1;
      const hw = ((box.max.x - box.min.x) / 2) * s + 0.15;  // small apron past the wall
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
  };
  const unsubscribe = bus.on('entity', paint);      // spawns/moves/rescales repaint
  paint();
  /** Sink this stroke's masked plants. Composes with the stroke's own
   *  positionNode (instancing + wind + pushers all live in there). */
  const wire = (mat) => {
    if (!mat) return;
    const { Fn, texture, vec2, vec3, float } = TSL;
    const orig = mat.positionNode;
    mat.positionNode = Fn(() => {
      const p = vec3(orig).toVar();
      const uv = p.xz.add(vec2(W / 2, D / 2)).div(vec2(W, D));
      const mask = texture(tex, uv).r;              // 1 = meadow, 0 = interior
      const sink = float(1).sub(mask).mul(4);       // deep enough for corn, not just blades
      return p.sub(vec3(0, sink, 0));
    })();
  };
  return { tex, paint, wire, dispose: () => { unsubscribe(); tex.dispose(); } };
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
  // the stem mesh (shrub wood) rides the same attribute OBJECTS, so the
  // shuffle above already covers it — only the count needs mirroring
  field.setDensity = (f) => {
    // densityCount owns the clamp — including genuine zero for `off` (#60)
    const keep = densityCount(n, f);
    field.mesh.count = keep;
    if (field.stemMesh) field.stemMesh.count = keep;
  };
}

// ---- frustum culling -------------------------------------------------------
// Upstream ships frustumCulled = false, and it HAS to: the engine's
// instanceMatrix is all identity (every transform rides the aPosRot/
// aScaleVar/aPhase attributes inside positionNode), so three's own
// computeBoundingSphere would union identity matrices into a half-meter
// sphere at the world origin and the field would vanish whenever the origin
// left the view. The adapter knows better: aPosRot IS the world placement
// (heights baked at build), so a correct world-space sphere is one pass
// over the attribute. Assign it explicitly — a non-null boundingSphere is
// never recomputed — and culling turns on: looking away from the meadow
// stops drawing every blade of it (§13.2 G1).
function wireFieldCulling(field) {
  const geo = field.mesh.geometry;
  const posRot = geo.getAttribute('aPosRot');
  const scaleVar = geo.getAttribute('aScaleVar');
  if (!posRot || !field.count) return;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < field.count; i++) {
    box.expandByPoint(v.set(posRot.getX(i), posRot.getY(i), posRot.getZ(i)));
  }
  // plant height × the tallest instance, plus wind/pusher lean slack (the
  // tanh lean ceiling is 0.6 in the engine) — conservative on every axis
  geo.computeBoundingBox();   // per-plant LOCAL bounds (positions, not instances)
  const plantH = Math.max(0.5, geo.boundingBox.max.y - Math.min(0, geo.boundingBox.min.y));
  let maxScale = 1;
  if (scaleVar) {
    for (let i = 0; i < field.count; i++) maxScale = Math.max(maxScale, scaleVar.getY(i));
  }
  box.expandByScalar(plantH * maxScale + 0.6);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  // the field group sits at the scene root with an identity transform, so a
  // world-space sphere is directly what the frustum test wants
  field.mesh.boundingSphere = sphere;
  field.mesh.frustumCulled = true;
  if (field.stemMesh) {   // shrub wood is a CHILD mesh — culled independently
    field.stemMesh.boundingSphere = sphere;
    field.stemMesh.frustumCulled = true;
  }
}

// ---- tiling (§13.2 G2) -----------------------------------------------------
// One monolithic InstancedMesh can never cull a blade behind you and pays
// full fragment cost regardless of view. So a big stroke is re-cut into XZ
// tiles AFTER the density shuffle: K geometries SHARING the vertex/index/aH
// attribute objects (the backend keys GPU buffers on the attribute object —
// uploaded once) with sliced copies of only the three instanced attributes
// (~44 bytes/instance), K meshes sharing the ONE material (wind, clearing
// mask, and the factory wrap are all material- or name-bound). Each tile
// carries its own world sphere → three's frustum culling finally works —
// and per-tile `count` becomes distance density for free, because bucketing
// in stable order preserves the shuffle: any prefix of a tile is still a
// uniform random subset of its plants.

const TILE_MIN_INSTANCES = 2000;   // shrubs/yucca are hundreds — stay whole
const TILE_SIZE = 12;              // meters per tile edge, roughly
const GRASS_NEAR = 30;             // full density inside this
const GRASS_FAR = 140;             // invisible beyond this
const _tv = new THREE.Vector3();

function tileField(f) {
  // the shrub archetype pairs a stem mesh sharing backing arrays — skip it
  if (f.stemMesh || (f.count ?? 0) < TILE_MIN_INSTANCES) return false;
  const src = f.mesh.geometry;
  const names = ['aPosRot', 'aScaleVar', 'aPhase'];
  const inst = names.map((n) => src.getAttribute(n));
  if (inst.some((a) => !a)) return false;
  const posRot = inst[0], scaleVar = inst[1];
  const n = f.count;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxScale = 1;
  for (let i = 0; i < n; i++) {
    const x = posRot.getX(i), z = posRot.getZ(i);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    const s = scaleVar.getY(i);
    if (s > maxScale) maxScale = s;
  }
  const nx = Math.max(1, Math.round((maxX - minX) / TILE_SIZE));
  const nz = Math.max(1, Math.round((maxZ - minZ) / TILE_SIZE));
  if (nx * nz < 4) return false;     // culling can't win on a postage stamp
  const spanX = (maxX - minX) || 1, spanZ = (maxZ - minZ) || 1;
  const buckets = Array.from({ length: nx * nz }, () => []);
  for (let i = 0; i < n; i++) {      // STABLE scan — preserves the shuffle
    const tx = Math.min(nx - 1, Math.floor((posRot.getX(i) - minX) / spanX * nx));
    const tz = Math.min(nz - 1, Math.floor((posRot.getZ(i) - minZ) / spanZ * nz));
    buckets[tz * nx + tx].push(i);
  }
  src.computeBoundingBox();          // per-plant LOCAL bounds (tiny)
  const plantH = Math.max(0.5, src.boundingBox.max.y - Math.min(0, src.boundingBox.min.y));
  const pad = plantH * maxScale + 0.6;   // tallest plant + the wind/push lean ceiling
  const container = new THREE.Group();
  container.userData = { ...f.mesh.userData };
  const tiles = [];
  const m4 = new THREE.Matrix4();
  for (const idx of buckets) {
    if (!idx.length) continue;
    const tg = new THREE.BufferGeometry();
    tg.setIndex(src.getIndex());
    for (const name of ['position', 'normal', 'uv', 'aH']) {
      const a = src.getAttribute(name);
      if (a) tg.setAttribute(name, a);   // SHARED objects — one GPU upload
    }
    const box = new THREE.Box3();
    names.forEach((name, j) => {
      const a = inst[j], sz = a.itemSize;
      const arr = new a.array.constructor(idx.length * sz);
      for (let k = 0; k < idx.length; k++) {
        for (let c = 0; c < sz; c++) arr[k * sz + c] = a.array[idx[k] * sz + c];
      }
      tg.setAttribute(name, new THREE.InstancedBufferAttribute(arr, sz));
    });
    for (const i of idx) box.expandByPoint(_tv.set(posRot.getX(i), posRot.getY(i), posRot.getZ(i)));
    box.expandByScalar(pad);
    const tm = new THREE.InstancedMesh(tg, f.mesh.material, idx.length);
    for (let k = 0; k < idx.length; k++) tm.setMatrixAt(k, m4.identity());   // the engine's identity contract
    tm.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
    tm.frustumCulled = true;
    Object.assign(tm.userData, f.mesh.userData);   // noWalkable/noSupportCheck/…
    tm.castShadow = false;
    tm.receiveShadow = f.mesh.receiveShadow;
    tm.userData.fullCount = idx.length;
    container.add(tm);
    tiles.push(tm);
  }
  // the container answers for the stroke: #74's applied-truth reads .count
  Object.defineProperty(container, 'count', {
    get: () => tiles.reduce((s, t) => s + (t.visible ? t.count : 0), 0),
  });
  const origDispose = f.dispose;
  f.mesh = container;
  f.tiled = true;
  f.tiles = tiles;
  let eff = 1;
  const applyTiles = () => {
    for (const t of tiles) {
      const d = _tv.copy(t.boundingSphere.center).distanceTo(camera.position);
      const fall = d >= GRASS_FAR ? 0
        : d <= GRASS_NEAR ? 1
          : 1 - 0.75 * ((d - GRASS_NEAR) / (GRASS_FAR - GRASS_NEAR));
      t.count = densityCount(t.userData.fullCount, eff * fall);
      t.visible = t.count > 0;
    }
  };
  f.setDensity = (k) => { eff = k; applyTiles(); };
  let lastTick = 0;
  f._tileTick = () => {              // buildFloraField hangs this on autoHooks
    const now = performance.now();
    if (now - lastTick < 300) return;
    lastTick = now;
    applyTiles();
  };
  applyTiles();
  f.dispose = () => {
    for (const t of tiles) t.geometry.dispose();   // teardown-only: shared
    origDispose?.call(f);                          // buffers die with the field
  };
  return true;
}

// ---- pushers ---------------------------------------------------------------
// The brush's own interaction model: up to 4 pusher slots part the plants
// around moving bodies. Slot 0 is the local avatar; the rest are the nearest
// remote presences. Per-frame and cheap (a uniform write).
function wirePushers(field) {
  const R = 1.1;
  // reused across frames — this hook ran every frame allocating two arrays
  // and sorting all remotes to keep 4 pusher slots (§14.1 offender #4)
  const list = [];
  const cand = [];
  const hook = () => {
    list.length = 0;
    if (myState?.pos) list.push({ x: myState.pos.x, y: myState.pos.y, z: myState.pos.z, r: R });
    if (remotes?.size) {
      cand.length = 0;
      for (const [, rb] of remotes) {
        const p = rb?.avatar?.root?.position;
        if (p) cand.push(p);
      }
      if (myState?.pos && cand.length > 3) {
        cand.sort((a, b) => a.distanceToSquared(myState.pos) - b.distanceToSquared(myState.pos));
      }
      for (let i = 0; i < Math.min(3, cand.length); i++) {
        const p = cand[i];
        list.push({ x: p.x, y: p.y, z: p.z, r: R });
      }
    }
    field.setPushers(list);
  };
  pushHostHook(hook);
  return hook;
}

// ---- the field -------------------------------------------------------------

/** Build a flora field from a `grass` verb bag. Returns a field shaped to
 *  terrain.js's setGrass contract: { mesh, material, update, autoHooks,
 *  setDensity, dispose }. The mesh is added to the scene here; setGrass owns
 *  removing and disposing it. */
export async function buildFloraField(rawArgs, { scene, heightFn }) {
  const mod = await loadFloraModule();
  const args = mapGrassArgs(rawArgs);
  const strokes = presetStrokes(args);
  const species = [...new Set(strokes.map((st) => st.species ?? 'grass'))];
  for (const sp of species) await ensureFloraAssets(mod, sp);
  // the grass verb is a world singleton: each build starts a fresh occupancy
  // registry, or a replaced field's plants would still claim their ground
  mod.resetFloraOccupancy();
  const W = args.width ?? args.size ?? 30, D = args.depth ?? args.size ?? 30;
  const mask = makeClearingMask(W, D);
  const group = new THREE.Group();
  const fields = [];
  try {
    for (const st of strokes) {
      const f = await mod.createFlora({ ...st, heightFn });
      // named so an applied-truth report (#74) can identify the stroke
      f.strokeLabel = `${fields.length}:${st.species ?? 'grass'}`;
      wireDensityDial(f);
      mask.wire(f.material);
      // big blade/corn strokes tile (per-tile culling + distance density);
      // small ones keep the whole-stroke sphere from G1
      if (!tileField(f)) wireFieldCulling(f);
      group.add(f.mesh);
      fields.push(f);
    }
  } catch (e) {
    // a half-built field must not leak its listener or its finished strokes
    for (const f of fields) f.dispose?.();
    mask.dispose();
    throw e;
  }
  const field = composeField({ group, fields, mask });
  field.autoHooks.push(wirePushers(field));   // setGrass unhooks everything the field owns
  for (const f of fields) {
    if (f._tileTick) { pushHostHook(f._tileTick); field.autoHooks.push(f._tileTick); }
  }
  scene.add(group);
  return field;
}
