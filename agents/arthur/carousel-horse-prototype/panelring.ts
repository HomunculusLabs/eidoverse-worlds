// polish-335: scenery panel-ring re-author (hung-cloth cure).
// Judges on exact live bytes 3ed80c49 (day 6/10, night 5/10) converged on
// the panel ring as the weakest element, with pixel-probe confirmation:
//   DAY   panel band (225,208,186) vs bone horse head (224,210,186) — the
//         hero-brightest coat dissolves into the backdrop at EVERY rotation
//         phase (far panels back every near horse head).
//   NIGHT panels (emissive lum .213) + bone (.254) are the brightest large
//         masses — architecture outshines the lanterns; hierarchy inverted.
//   BOTH  flat unattached quads y 3.00..4.28 with a 0.66m air gap to the
//         cone underside — "floating cards" is geometrically real (decode).
//
// ONE intervention (family = the panel ring, no other element touched):
//   - value drop: base [0.87,0.76,0.58] -> [0.63,0.52,0.40]; emissive
//     [0.28,0.20,0.15] -> [0.125,0.10,0.085] (lum .213 -> .10). Night
//     ladder after: lanterns .80 > crown .62 > ceiling .35 > wedges .285 >
//     teeth .215 > bone .254/gold .173/navy .185 coats > PANELS .10 ≈
//     canopy .06 — the ring reads as hung cloth, not a lit wall. Day:
//     panels ~#a98d6b vs bone #f2efe6 (~26% value gap) and vs gold ~18% +
//     rail/hem line breaks.
//   - hung-cloth geometry: scalloped swag hem (corners y 3.00, center dip
//     2.90 — head clearance 2.75 law preserved), 3-column grid so the hem
//     reads at boarding distance.
//   - attachment: one 7cm strap per panel, r 2.60 -> 2.52 tilted inward,
//     y 4.281..4.90 — tucks under the cone slope (surface y 4.92..4.96 at
//     those radii at any 16-gon facet phase). No more floating cards.
// Same node (cr_scenery_ring), same material name (factors re-authored),
// primitive 0 rebuilt + strap primitive added. Spin subtree, sockets,
// motion roots, all other materials: untouched.
// Offline only; refuses existing outputs. Deterministic.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '3ed80c49d16e89d8c0eb4900d8dbd8ab1b0850a4aa3cf8603bad88b3e3e41f1b'; // polish-299 verified live + served (identity)
export const SCENERY_MAT = 'carousel_scenery_panel';
export const PANEL_BASE = [0.63, 0.52, 0.40] as const;
export const PANEL_EMISSIVE = [0.125, 0.10, 0.085] as const;
const R = 2.6, R_TOP = 2.52;
const Y_TOP = 4.28, Y_HEM_CORNER = 3.00, Y_HEM_MID = 2.90;
const Y_STRAP_LO = 4.281, Y_STRAP_HI = 4.90;
const PANELS = 16, ARC_DEG = 16; // unchanged pitch

const usage = 'Usage: bun panelring.ts --input <pinned-live.glb> --output <NEW-carousel-panelring-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-panelring-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-panelring basename');
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
  assert.equal(mesh.listPrimitives().length, 1, 'expected the single polish-292 panel primitive');
  const prim = mesh.listPrimitives()[0];
  const mat = prim.getMaterial();
  assert.ok(mat && mat.getName() === SCENERY_MAT, 'primitive material is not carousel_scenery_panel');
  const oldPos = prim.getAttribute('POSITION');
  assert.equal(oldPos?.getCount(), 64, 'unexpected legacy panel vertex count');

  // ---- panel body: 3-column grid with swag hem ----
  const half = (ARC_DEG / 2) * Math.PI / 180;
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  const at = (a: number, r: number): [number, number] => [Math.cos(a) * r, Math.sin(a) * r];
  for (let p = 0; p < PANELS; p++) {
    const th = p * (2 * Math.PI / PANELS);
    const a0 = th - half, am = th, a1 = th + half;
    const nx = Math.cos(th), nz = Math.sin(th);
    const cols: { x: number, z: number, hem: number }[] = [];
    for (const [a, hem] of [[a0, Y_HEM_CORNER], [am, Y_HEM_MID], [a1, Y_HEM_CORNER]] as [number, number][]) {
      const [x, z] = at(a, R);
      cols.push({ x, z, hem });
    }
    // verts: for each column: top (Y_TOP) and hem (swag) — 6 verts
    const base = pos.length / 3;
    for (const c of cols) { pos.push(c.x, Y_TOP, c.z); nrm.push(nx, 0, nz); }
    for (const c of cols) { pos.push(c.x, c.hem, c.z); nrm.push(nx, 0, nz); }
    // two quads: col0-col1, col1-col2 (top row = verts 0..2, hem row = 3..5)
    for (const c0 of [0, 1]) {
      const t0 = base + c0, t1 = base + c0 + 1, h0 = base + 3 + c0, h1 = base + 3 + c0 + 1;
      idx.push(t0, h0, h1, t0, h1, t1);
    }
  }
  // ---- straps: one per panel, tilted inward at top ----
  const dA = 0.035 / 2 / R; // half-width 3.5cm at r 2.6
  for (let p = 0; p < PANELS; p++) {
    const th = p * (2 * Math.PI / PANELS);
    const nx = Math.cos(th), nz = Math.sin(th);
    const [x0, z0] = at(th - dA, R), [x1, z1] = at(th + dA, R);
    const [X0, Z0] = at(th - dA, R_TOP), [X1, Z1] = at(th + dA, R_TOP);
    const base = pos.length / 3;
    pos.push(x0, Y_STRAP_LO, z0, x1, Y_STRAP_LO, z1, X1, Y_STRAP_HI, Z1, X0, Y_STRAP_HI, Z0);
    for (let v = 0; v < 4; v++) nrm.push(nx, 0, nz);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  for (const v of pos) assert.ok(Number.isFinite(v), 'non-finite panel vertex');
  assert.equal(pos.length / 3, PANELS * 6 + PANELS * 4, 'vertex count mismatch');
  assert.equal(idx.length / 3, PANELS * 4 + PANELS * 2, 'triangle count mismatch');

  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  prim.setAttribute('POSITION', vec3('polish335_panel_pos', pos));
  prim.setAttribute('NORMAL', vec3('polish335_panel_nrm', nrm));
  prim.setIndices(doc.createAccessor('polish335_panel_idx').setArray(new Uint16Array(idx)));
  // RED->GREEN (first build): adding a SECOND primitive to this mesh produced a
  // garbage duplicate (decoded extents r 0..1.79, y {0,4.9}) that rendered as a
  // cream wedge — caught by decode + A/B judge before any placement. The single
  // rewritten primitive already carries panels+straps (one index stream); the
  // scenery.ts accessor law stands: one primitive, plain createAccessor().
  mat.setBaseColorFactor([...PANEL_BASE, 1]).setEmissiveFactor([...PANEL_EMISSIVE]);

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    panelring: { radius: R, radiusTop: R_TOP, yTop: Y_TOP, hemCorner: Y_HEM_CORNER, hemMid: Y_HEM_MID,
      strapY: [Y_STRAP_LO, Y_STRAP_HI], panels: PANELS, arcDeg: ARC_DEG,
      triangles: idx.length / 3, baseColorFactor: PANEL_BASE, emissiveFactor: PANEL_EMISSIVE },
    nodes: root.listNodes().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`panelring: ${error.message}`);
  process.exitCode = 1;
});
