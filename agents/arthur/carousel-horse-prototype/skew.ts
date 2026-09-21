// polish-337: carousel panel-ring drape skew + binding-tape straps.
// Queue head from polish-336's close: the deck judge's named CHEAPEST drape
// win — per-panel yaw skew (each panel hung slightly askew) plus wider,
// darker straps. polish-336's judges read the ring 60% toward cloth after
// the swag hems; the residuals were (a) identical-panel repetition still
// legible in the 16-deg arc rhythm, (b) straps 1-2px (0.035 rad half-width
// × 5m ≈ 1.5px), (c) straight hems below the 5m perception floor.
//
// ONE intervention (family = the panel ring's HUNG-CLOTH READ; nothing else):
//   - per-panel alternating YAW skew of SKEW_DEG = 2.0deg (top of the judge's
//     1-2deg band): every panel rotated about ITS OWN vertical axis through
//     its own center, odd panels +, even −. The judge's named form — a yaw
//     twist, not an orbit: each panel's surface tilts off dead-radial by 2deg
//     alternating (shading/foreshortening rhythm), corner edges displace
//     ~1.26cm, and adjacent slits alternate narrow/wide by ~2.5cm (every
//     neighbor pair is opposite parity). Kills the copy-paste arc rhythm;
//     hung cloth is never machine-aligned. (An orbit about the carousel
//     axis was considered and rejected at design time: it widens EVERY slit
//     identically ~2x — porosity, not rhythm.)
//   - straps widened 0.035 → 0.055 rad half-width (3px at 5m, 7px at 2m)
//     and darkened COLOR_0 0.35 → 0.24 — binding-tape read against both
//     the panel and the cone.
// Everything else is clothswag.ts verbatim (hems 2.80/2.94, drape gradient
// 0.80→1.0, base [0.71,0.52,0.38], emissive UNTOUCHED so polish-335's
// night hierarchy holds). Same node/material names; one primitive
// (accessor law); offline only; refuses existing outputs. Deterministic.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = 'c0c8c565e244bbc311316768b8319e4d7d57d66b93dfb24335df2d04cc15cc5f'; // polish-336 verified live (upload identity)
export const SCENERY_MAT = 'carousel_scenery_panel';
export const PANEL_BASE = [0.71, 0.52, 0.38] as const; // clothswag value, unchanged
export const STRAP_COLOR = 0.24; // polish-337: was 0.35
const R = 2.6, R_TOP = 2.52;
const Y_TOP = 4.28, Y_HEM_CORNER = 3.00, Y_HEM_DEEP = 2.80, Y_HEM_SHALLOW = 2.94;
const Y_STRAP_LO = 4.281, Y_STRAP_HI = 5.06; // polish-337 r2: 4.90 left a real 0.146m air gap below the canopy skin (skin y at r 2.52 = 4.84 + (3.06-2.52)*(5.78-4.84)/(3.06-0.60) = 5.046); 5.06 pierces ~14mm — angled crossing, occluded from below by the skin itself
const PANELS = 16, ARC_DEG = 16;
const DRAPE_TOP = 0.80, DRAPE_HEM = 1.0;
const SKEW_DEG = 2.0; // polish-337: per-panel alternating yaw skew (judge band 1-2deg)
const STRAP_HALF = 0.055 / 2 / R; // polish-337: was 0.035 (arc half-width / radius)

const usage = 'Usage: bun skew.ts --input <pinned-live.glb> --output <NEW-carousel-skew-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-skew-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-skew basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  const nodes = root.listNodes().filter(n => n.getName() === 'cr_scenery_ring');
  assert.equal(nodes.length, 1, 'expected exactly one cr_scenery_ring node');
  const mesh = nodes[0].getMesh();
  assert.ok(mesh, 'scenery node has no mesh');
  assert.equal(mesh.listPrimitives().length, 1, 'accessor law: one primitive (polish-335)');
  const prim = mesh.listPrimitives()[0];
  const mat = prim.getMaterial();
  assert.ok(mat && mat.getName() === SCENERY_MAT, 'primitive material is not carousel_scenery_panel');
  const oldPos = prim.getAttribute('POSITION');
  const oldCount = oldPos?.getCount() ?? 0;
  assert.equal(oldCount, 160, 'unexpected clothswag panel vertex count');

  // ---- panel body: clothswag geometry + per-panel alternating YAW skew ----
  // Each panel rotates about its own vertical axis through its arc-midpoint
  // (a YAW twist — the judge's named form), not an orbit: the surface tilts
  // off dead-radial alternately, slits alternate narrow/wide, radius and
  // clearance laws unchanged. Straps stay dead-radial (they bind panel to
  // cone, not panel to panel).
  const half = (ARC_DEG / 2) * Math.PI / 180;
  const skew = SKEW_DEG * Math.PI / 180;
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [], col: number[] = [];
  const at = (a: number, r: number): [number, number] => [Math.cos(a) * r, Math.sin(a) * r];
  for (let p = 0; p < PANELS; p++) {
    const deep = p % 2 === 1;
    const yHemMid = deep ? Y_HEM_DEEP : Y_HEM_SHALLOW;
    const th = p * (2 * Math.PI / PANELS);
    const sgn = p % 2 === 0 ? 1 : -1; // alternate
    const a0 = th - half, am = th, a1 = th + half;
    const nx = Math.cos(th), nz = Math.sin(th);
    // panel-local frame: mid at (cx, cz), tangent t=(-sin th, cos th) —
    // yaw twist = translate to mid, rotate in xz by sgn*skew, translate back
    const cx = Math.cos(th) * R, cz = Math.sin(th) * R;
    const c = Math.cos(sgn * skew), s = Math.sin(sgn * skew);
    const cols: { x: number, z: number, hem: number }[] = [];
    for (const [a, hem] of [[a0, Y_HEM_CORNER], [am, yHemMid], [a1, Y_HEM_CORNER]] as [number, number][]) {
      const [x, z] = at(a, R);
      cols.push({ x, z, hem });
    }
    const twist = (x: number, z: number): [number, number] => {
      const dx = x - cx, dz = z - cz;
      return [cx + dx * c - dz * s, cz + dx * s + dz * c];
    };
    const base = pos.length / 3;
    for (const cc of cols) {
      const [sx, sz] = twist(cc.x, cc.z);
      pos.push(sx, Y_TOP, sz); nrm.push(nx, 0, nz); col.push(DRAPE_TOP, DRAPE_TOP, DRAPE_TOP);
    }
    for (const cc of cols) {
      const [sx, sz] = twist(cc.x, cc.z);
      pos.push(sx, cc.hem, sz); nrm.push(nx, 0, nz); col.push(DRAPE_HEM, DRAPE_HEM, DRAPE_HEM);
    }
    for (const c0 of [0, 1]) {
      const t0 = base + c0, t1 = base + c0 + 1, h0 = base + 3 + c0, h1 = base + 3 + c0 + 1;
      idx.push(t0, h0, h1, t0, h1, t1);
    }
  }
  // ---- straps: one per panel, binding-tape dark, tilted inward at top ----
  const dA = STRAP_HALF;
  for (let p = 0; p < PANELS; p++) {
    const th = p * (2 * Math.PI / PANELS);
    const nx = Math.cos(th), nz = Math.sin(th);
    const [x0, z0] = at(th - dA, R), [x1, z1] = at(th + dA, R);
    const [X0, Z0] = at(th - dA, R_TOP), [X1, Z1] = at(th + dA, R_TOP);
    const base = pos.length / 3;
    pos.push(x0, Y_STRAP_LO, z0, x1, Y_STRAP_LO, z1, X1, Y_STRAP_HI, Z1, X0, Y_STRAP_HI, Z0);
    for (let v = 0; v < 4; v++) { nrm.push(nx, 0, nz); col.push(STRAP_COLOR, STRAP_COLOR, STRAP_COLOR); }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  for (const v of pos) assert.ok(Number.isFinite(v), 'non-finite panel vertex');
  assert.equal(pos.length / 3, PANELS * 6 + PANELS * 4, 'vertex count mismatch');
  assert.equal(idx.length / 3, PANELS * 4 + PANELS * 2, 'triangle count mismatch');
  assert.ok(Math.min(...pos.filter((_, i) => i % 3 === 1)) >= 2.78, 'hem clearance 2.75 law violated');

  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  prim.setAttribute('POSITION', vec3('polish337_panel_pos', pos));
  prim.setAttribute('NORMAL', vec3('polish337_panel_nrm', nrm));
  prim.setIndices(doc.createAccessor('polish337_panel_idx').setArray(new Uint16Array(idx)));
  prim.setAttribute('COLOR_0', doc.createAccessor('polish337_panel_col')
    .setArray(new Float32Array(col)).setType('VEC3'));
  assert.deepEqual(mat.getBaseColorFactor(), [...PANEL_BASE, 1], 'base color must stay clothswag value');
  // emissive NOT touched

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    skew: { radius: R, radiusTop: R_TOP, yTop: Y_TOP, hemCorner: Y_HEM_CORNER, hemDeep: Y_HEM_DEEP, hemShallow: Y_HEM_SHALLOW,
      drape: [DRAPE_TOP, DRAPE_HEM], strapColor: STRAP_COLOR, strapArcHalf: dA,
      strapY: [Y_STRAP_LO, Y_STRAP_HI], panels: PANELS, arcDeg: ARC_DEG, skewDeg: SKEW_DEG,
      triangles: idx.length / 3, baseColorFactor: PANEL_BASE },
    nodes: root.listNodes().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`skew: ${error.message}`);
  process.exitCode = 1;
});
