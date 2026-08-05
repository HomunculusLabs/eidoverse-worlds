// blanket-probe — the control experiment for the "standing on a blanket puts
// you at pillow height" bug.
//
//   bun tools/blanket-probe.ts
//
// The reported symptom: a generated blanket with giant pillows on it collides
// as ONE box, so its top face — the top of the tallest pillow — becomes the
// ground over the entire footprint. Walk onto the bare blanket and you float
// half a metre up.
//
// This asks one question before any collision work is designed: does the
// EXISTING `collide: "exact"` override already fix it? If it does, better
// collision hulls are a performance problem, not a correctness one, and the
// project changes shape.
//
// Same stubbing trick as tools/collider-test.ts, but resolving core-stub via
// fileURLToPath — `new URL(...).pathname` yields "/L:/a%20b/..." on Windows
// and the plugin then can't find the module.

import { plugin } from 'bun';
import { fileURLToPath } from 'node:url';

const STUB = fileURLToPath(new URL('./core-stub.mjs', import.meta.url));
plugin({ name: 'core-stub', setup(b) { b.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB })); } });

const { THREE } = await import('./core-stub.mjs');
const { mergeGeometries } = await import(
  '../client/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const { MeshBVH } = await import('../client/node_modules/three-mesh-bvh/src/index.js');
const C: any = await import('../client/lib/colliders.js');

const flat = () => 0;
const AVATAR = 1.9;

// ---- loading a REAL mesh ----------------------------------------------------
// Deliberately NOT three's GLTFLoader: it reaches for DOM Image/ImageBitmap to
// build textures, which headless Bun has not got, and this probe only ever
// asks about triangles. @gltf-transform is already a root dependency (it runs
// the store's optimize pass) and reads draco'd GLBs — which /library serves,
// since it prefers the store-min mirror.
async function loadGlbMesh(path: string) {
  const { NodeIO } = await import('@gltf-transform/core');
  const { ALL_EXTENSIONS } = await import('@gltf-transform/extensions');
  const draco3d = (await import('draco3dgltf')).default;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });
  const doc = await io.read(path);
  const inScene = new Set<any>();
  for (const s of doc.getRoot().listScenes()) s.traverse((n: any) => inScene.add(n));

  const verts: number[] = [];
  for (const node of doc.getRoot().listNodes()) {
    if (!inScene.has(node)) continue;         // orphans render nowhere
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const idx = prim.getIndices();
      const count = idx ? idx.getCount() : pos.getCount();
      const p = [0, 0, 0];
      for (let t = 0; t < count; t++) {
        pos.getElement(idx ? idx.getScalar(t) : t, p);
        // flatten to non-indexed world-space triangles, same as buildExact
        verts.push(
          m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
          m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
          m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
        );
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
  const mesh = new THREE.Mesh(g, undefined);
  mesh.updateMatrixWorld(true);
  return { mesh, tris: verts.length / 9 };
}

/** Ground truth for a real mesh: raycast its triangles directly, independent
 *  of anything colliders.js decides. This is the yardstick both modes are
 *  scored against — the mesh cannot disagree with itself. */
function truthSampler(mesh: any) {
  const bvh = new MeshBVH(mesh.geometry);
  const ray = new THREE.Ray();
  return (x: number, z: number, from: number) => {
    ray.origin.set(x, from, z);
    ray.direction.set(0, -1, 0);
    const hit = bvh.raycastFirst(ray, THREE.DoubleSide);
    return hit ? hit.point.y : null;
  };
}

// ---- the object under test --------------------------------------------------
// A 3x3m blanket, 4cm thick, with three 50cm pillows sitting on it. Nothing
// exotic: this is the smallest mesh that reproduces the bug, and its true
// walkable height is known analytically (0.04 on cloth, 0.54 on a pillow).

const BLANKET_Y = 0.04;
const PILLOW_Y = 0.04 + 0.50;
const PILLOWS = [[-0.9, -0.9], [0.9, -0.6], [0.2, 1.0]];

function blanket(id: string, collide?: string) {
  const parts = [];
  const cloth = new THREE.BoxGeometry(3, 0.04, 3);
  cloth.translate(0, 0.02, 0);
  parts.push(cloth);
  for (const [px, pz] of PILLOWS) {
    const p = new THREE.BoxGeometry(0.7, 0.5, 0.7);
    p.translate(px, 0.04 + 0.25, pz);
    parts.push(p);
  }
  const m = new THREE.Mesh(mergeGeometries(parts, false), undefined);
  m.updateMatrixWorld(true);
  C.fitCollider(id, m, collide ? { collide } : {});
  m.updateMatrixWorld(true);
  C.reindexCollider(id);
  return m;
}

// A sample sitting exactly on a pillow's rim is neither on nor off it, and
// float error decides which — 1.35 - 1.0 > 0.35 by one ulp. Those samples say
// nothing about the collider, so they are excluded rather than scored.
const HALF = 0.35, EDGE = 0.03;
const nearRim = (x: number, z: number) => PILLOWS.some(([px, pz]) =>
  Math.abs(Math.abs(x - px) - HALF) < EDGE || Math.abs(Math.abs(z - pz) - HALF) < EDGE);
const onPillow = (x: number, z: number) =>
  PILLOWS.some(([px, pz]) => Math.abs(x - px) < HALF && Math.abs(z - pz) < HALF);

/** Stand at (x,z) with feet at `y` and ask for the ground. */
function probe(x: number, z: number, y = 0) {
  const p = new THREE.Vector3(x, y, z);
  const ground = C.resolveColliders(p, flat, 0.32, AVATAR);
  return { ground, push: Math.hypot(p.x - x, p.z - z) };
}

/** Walk a 7x7 grid over the blanket and score the ground each mode reports
 *  against what the geometry actually is.
 *
 *  `feetY` is the regime under test, and it matters more than anything else
 *  here. At cloth height you are measuring whether the thing WALLS you out;
 *  at pillow height you are measuring the reported bug — someone who has
 *  already mantled up and is now walking around on top. */
function sweep(label: string, feetY: number) {
  let worst = 0, sumErr = 0, n = 0, walled = 0, skipped = 0;
  const rows: string[] = [];
  for (let i = 0; i < 7; i++) {
    let row = '';
    for (let j = 0; j < 7; j++) {
      const x = -1.35 + (2.7 * i) / 6, z = -1.35 + (2.7 * j) / 6;
      if (nearRim(x, z)) { row += '  ~  '; skipped++; continue; }
      const { ground, push } = probe(x, z, feetY);
      const truth = onPillow(x, z) ? PILLOW_Y : BLANKET_Y;
      const err = Math.abs(ground - truth);
      worst = Math.max(worst, err); sumErr += err; n++;
      if (push > 0.01) walled++;
      row += err < 0.02 ? '  .  ' : `${(ground - truth >= 0 ? '+' : '-')}${err.toFixed(2)} `;
    }
    rows.push(`   ${row}`);
  }
  console.log(`\n${label}`);
  console.log('   ground error per sample ( . = correct within 2cm, ~ = on a pillow rim, unscored ):');
  rows.forEach((r) => console.log(r));
  console.log(`   worst error ${worst.toFixed(3)}m · mean ${(sumErr / n).toFixed(3)}m · ` +
    `${walled}/${n} samples pushed sideways`);
  return { worst, mean: sumErr / n, walled, n };
}

console.log('blanket-probe — does `collide: "exact"` already fix the floating blanket?\n');
console.log(`  object: 3.0 x 3.0m blanket, 4cm thick, three 0.5m pillows`);
console.log(`  truth:  ground is ${BLANKET_Y}m on cloth, ${PILLOW_Y}m on a pillow`);

// ---- what does the CURRENT auto-classifier pick? ----------------------------
C.clearColliders();
blanket('auto');
{
  const e = C.colliders.get('auto');
  const bx = e.box;
  const foot = (bx.max.x - bx.min.x) * (bx.max.z - bx.min.z);
  console.log(`\n  auto-classified as: ${e.exact ? 'EXACT (bvh)' : e.pillar ? 'PILLAR' : 'BOX'}`);
  console.log(`  (footprint ${foot.toFixed(1)}m² — needs >=16 — and height ` +
    `${(bx.max.y - bx.min.y).toFixed(2)}m — needs >=2.2)`);
}
// The reported bug is what someone STANDING ON the blanket experiences, so the
// feet start at pillow height — where the mantle below actually puts them.
const boxRes = sweep('  === as it ships today (one OBB), standing on it ===', PILLOW_Y);

C.clearColliders();
blanket('exact', 'exact');
const exactRes = sweep('  === forced collide: "exact" (BVH over real triangles) ===', PILLOW_Y);

// ---- and can you even get ON it in each mode? -------------------------------
console.log('\n  approach from outside, feet on terrain (y=0), edge of the blanket:');
for (const [mode, forced] of [['box', 'box'], ['exact', 'exact']] as const) {
  C.clearColliders(); blanket('t', forced);
  const p = probe(1.2, 0, 0);
  console.log(`   ${mode.padEnd(6)} ground ${p.ground.toFixed(2)}m · pushed ${p.push.toFixed(2)}m sideways` +
    ` · mantle target ${C.lastBlockedTop() === null ? 'none' : C.lastBlockedTop().toFixed(2)}`);
}

// ---- what does exact COST? --------------------------------------------------
// The blanket above is 60 triangles. A Tripo conjure is not. Subdivide to a
// realistic generated-mesh density and time the BVH build, because "just use
// exact for everything" lives or dies on this number.
console.log('\n  cost of exact at generated-mesh density:');
for (const target of [5_000, 50_000, 150_000]) {
  const seg = Math.max(1, Math.round(Math.sqrt(target / 12)));
  const g = new THREE.BoxGeometry(3, 0.5, 3, seg, seg, seg);
  const m = new THREE.Mesh(g, undefined);
  m.updateMatrixWorld(true);
  // BoxGeometry is INDEXED — position.count is vertices, not 3x triangles
  const idx = g.getIndex();
  const tris = (idx ? idx.count : g.getAttribute('position').count) / 3;
  C.clearColliders();
  const t0 = performance.now();
  C.fitCollider(`cost${target}`, m, { collide: 'exact' });
  const build = performance.now() - t0;
  const t1 = performance.now();
  for (let i = 0; i < 1000; i++) probe((i % 20) * 0.1 - 1, (i % 17) * 0.1 - 1, 0.3);
  const query = (performance.now() - t1) / 1000;
  console.log(`   ${String(Math.round(tris)).padStart(7)} tris — build ${build.toFixed(1)}ms · ` +
    `${query.toFixed(3)}ms per avatar frame-query`);
}

console.log('\n  verdict (synthetic):');
const fixed = exactRes.worst < 0.05;
console.log(`   exact ${fixed ? 'FIXES' : 'does NOT fix'} the float ` +
  `(worst error ${boxRes.worst.toFixed(2)}m → ${exactRes.worst.toFixed(2)}m)`);

// ---- the real thing ---------------------------------------------------------
//   bun tools/blanket-probe.ts --glb <file> [--y <entity pos.y>] [--scale <s>]
// Defaults are commons' entity 90094b0e (store/9a9d0239eca609b3.glb), the
// violet blanket with mismatched cushions, as it actually stands in the world.

const argv = process.argv.slice(2);
const argOf = (k: string, d: number) => {
  const i = argv.indexOf(k);
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : d;
};
const glbIdx = argv.indexOf('--glb');
if (glbIdx >= 0 && argv[glbIdx + 1]) {
  const file = argv[glbIdx + 1];
  const entY = argOf('--y', 0.4936);      // commons entity 90094b0e
  const entScale = argOf('--scale', 1);

  console.log(`\n\n=== REAL MESH: ${file} ===`);
  const { mesh, tris } = await loadGlbMesh(file);
  const truthAt = truthSampler(mesh);
  const bb = new THREE.Box3().setFromObject(mesh);
  console.log(`  ${tris} triangles · bbox y [${bb.min.y.toFixed(3)}, ${bb.max.y.toFixed(3)}]` +
    ` · footprint ${((bb.max.x - bb.min.x) * (bb.max.z - bb.min.z)).toFixed(1)}m²`);
  console.log(`  placed at world y=${entY}, scale ${entScale}`);

  // What does the shipping classifier pick, and what ELSE does forcing exact
  // turn on? `interior` is not a collision flag — it drives the grass clearing
  // mask, so flipping a thing to exact also decides whether meadow grows
  // through it. Worth knowing before recommending the flip.
  {
    C.clearColliders();
    const probeMesh = mesh.clone(); probeMesh.updateMatrixWorld(true);
    C.fitCollider('auto', probeMesh, { scale: entScale });
    const a = C.colliders.get('auto');
    console.log(`  ships today as: ${a.exact ? 'EXACT' : a.pillar ? 'PILLAR' : 'BOX'}`);
    C.clearColliders();
    C.fitCollider('forced', probeMesh, { collide: 'exact', scale: entScale });
    const f = C.colliders.get('forced');
    console.log(`  forced exact ⇒ interior=${f.interior} (true = suppresses grass under it)`);
  }

  for (const mode of ['box', 'exact'] as const) {
    C.clearColliders();
    const m2 = mesh.clone();
    m2.updateMatrixWorld(true);
    const t0 = performance.now();
    C.fitCollider('real', m2, { collide: mode, scale: entScale });
    m2.position.set(0, entY, 0);
    m2.scale.setScalar(entScale);
    m2.updateMatrixWorld(true);
    C.reindexCollider('real');
    const build = performance.now() - t0;

    let worst = 0, sum = 0, n = 0, missing = 0;
    const rows: string[] = [];
    for (let i = 0; i < 9; i++) {
      let row = '';
      for (let j = 0; j < 9; j++) {
        const x = bb.min.x + ((bb.max.x - bb.min.x) * (i + 0.5)) / 9;
        const z = bb.min.z + ((bb.max.z - bb.min.z) * (j + 0.5)) / 9;
        // truth is the mesh's own top surface at this column, in world terms
        const localTruth = truthAt(x, z, bb.max.y + 0.5);
        if (localTruth == null) { row += '  -  '; missing++; continue; }
        const truth = entY + localTruth * entScale;
        // stand where the mesh says the surface is, then ask for the ground
        const p = new THREE.Vector3(x, truth, z);
        const ground = C.resolveColliders(p, flat, 0.32, AVATAR);
        const err = ground - truth;
        worst = Math.max(worst, Math.abs(err)); sum += Math.abs(err); n++;
        row += Math.abs(err) < 0.02 ? '  .  ' : `${err >= 0 ? '+' : '-'}${Math.abs(err).toFixed(2)} `;
      }
      rows.push(`   ${row}`);
    }
    console.log(`\n  --- collide: "${mode}" (fit in ${build.toFixed(1)}ms) ---`);
    rows.forEach((r) => console.log(r));
    console.log(`   worst ${worst.toFixed(3)}m · mean ${(sum / n).toFixed(3)}m` +
      (missing ? ` · ${missing} columns with no surface` : ''));
  }
}
