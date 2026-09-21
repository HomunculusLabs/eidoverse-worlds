// polish-336: scenery panel-ring cloth read at boarding distance.
// Fresh judging of the polish-335 ring at 5m (boarding + deck views — the
// views its 18m rig never covered; ZAI fallback, native re-judge owed)
// converged with the 18m judges' residual note on BOTH day views:
//   - ring reads as flat uniform CARDS, not hung cloth — zero drape cues,
//     identical width/color/hem on every panel, "machine-placed card fence";
//   - swag hem below threshold at 5m (dip 0.10m = 7% of panel height; judges
//     name 15-20% as legible);
//   - straps invisible: same COLOR_0 as the panel they cross (0.76,0.63,0.49);
//   - fill reads desaturated GRAY vs the warm structure (judge: "pushes them
//     strongly toward untextured placeholder slab").
// Source-truth check before authoring: all panel tops sit at y 4.28 with
// straps 4.281..4.90 tucked under the cone (panelring.ts) — the judges'
// "short floating panels" item is PROJECTION of the 6.5deg slits between
// 16deg panels, not geometry (decode outranks the render claim); not treated.
//
// ONE intervention (family = the panel ring's CLOTH READ; nothing else):
//   - alternating deep/shallow swag hems: odd panels dip to 2.80 (mid), even
//     to 2.94 — deep dip = 0.22m = 15.6% of panel height (judge-named
//     legible band); head clearance 2.75 law kept (min hem 2.78 > 2.75).
//     Alternation kills the copy-paste repetition AND gives the eye a
//     long-short rhythm to read as bunting.
//   - per-vertex COLOR_0 drape gradient 0.80 at attachment -> 1.0 at hem:
//     flat-shaded low-poly drape cue (the polish-289 synthesized-UV lineage —
//     value gradient as the cheap fold). Multiplies the existing warm
//     carousel_fabric-family baseColorTexture the material already carries.
//   - strap tape darkened to 0.35 COLOR_0: binding-tape read against both the
//     panel and the cone — the attachment becomes visible without a new
//     material or node.
//   - hue warmed at constant luminance 0.535: [0.63,0.52,0.40] ->
//     [0.71,0.52,0.38] (R/B 1.75 -> 1.87, R-G +0.08) — kills the gray-slab
//     read while keeping the day value separation from the bone horse
//     (baseColor ~#f2efe6, ~26% gap) and the night ladder unchanged.
// Night emissive [0.125,0.10,0.085] UNTOUCHED — polish-335's fixed night
// hierarchy (panels .10 < coats < lanterns .80) must not move.
// Same node/material names; spin subtree, sockets, motion roots, all other
// materials untouched. Offline only; refuses existing outputs.
// Deterministic.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '3d4550fac7d1cf21acf1e3385db1515b26d7ed420401d0c116c35c61deafb334'; // polish-335 verified live + served (identity)
export const SCENERY_MAT = 'carousel_scenery_panel';
export const PANEL_BASE = [0.71, 0.52, 0.38] as const;
export const STRAP_COLOR = 0.35;
const STRAP_BASE_OVERRIDE = true;
const R = 2.6, R_TOP = 2.52;
const Y_TOP = 4.28, Y_HEM_CORNER = 3.00, Y_HEM_DEEP = 2.80, Y_HEM_SHALLOW = 2.94;
const Y_STRAP_LO = 4.281, Y_STRAP_HI = 4.90;
const PANELS = 16, ARC_DEG = 16;
const DRAPE_TOP = 0.80, DRAPE_HEM = 1.0;

const usage = 'Usage: bun clothswag.ts --input <pinned-live.glb> --output <NEW-carousel-clothswag-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-clothswag-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-clothswag basename');
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
  assert.equal(oldCount, 160, 'unexpected polish-335 panel vertex count');

  // ---- panel body: alternating deep/shallow swag hems + drape gradient ----
  const half = (ARC_DEG / 2) * Math.PI / 180;
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [], col: number[] = [];
  const at = (a: number, r: number): [number, number] => [Math.cos(a) * r, Math.sin(a) * r];
  for (let p = 0; p < PANELS; p++) {
    const deep = p % 2 === 1;
    const yHemMid = deep ? Y_HEM_DEEP : Y_HEM_SHALLOW;
    const th = p * (2 * Math.PI / PANELS);
    const a0 = th - half, am = th, a1 = th + half;
    const nx = Math.cos(th), nz = Math.sin(th);
    const cols: { x: number, z: number, hem: number }[] = [];
    for (const [a, hem] of [[a0, Y_HEM_CORNER], [am, yHemMid], [a1, Y_HEM_CORNER]] as [number, number][]) {
      const [x, z] = at(a, R);
      cols.push({ x, z, hem });
    }
    const base = pos.length / 3;
    for (const c of cols) { pos.push(c.x, Y_TOP, c.z); nrm.push(nx, 0, nz); col.push(DRAPE_TOP, DRAPE_TOP, DRAPE_TOP); }
    for (const c of cols) { pos.push(c.x, c.hem, c.z); nrm.push(nx, 0, nz); col.push(DRAPE_HEM, DRAPE_HEM, DRAPE_HEM); }
    for (const c0 of [0, 1]) {
      const t0 = base + c0, t1 = base + c0 + 1, h0 = base + 3 + c0, h1 = base + 3 + c0 + 1;
      idx.push(t0, h0, h1, t0, h1, t1);
    }
  }
  // ---- straps: one per panel, binding-tape dark, tilted inward at top ----
  const dA = 0.035 / 2 / R;
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
  assert.ok(STRAP_BASE_OVERRIDE === true, 'strap color override flag');

  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  prim.setAttribute('POSITION', vec3('polish336_panel_pos', pos));
  prim.setAttribute('NORMAL', vec3('polish336_panel_nrm', nrm));
  prim.setIndices(doc.createAccessor('polish336_panel_idx').setArray(new Uint16Array(idx)));
  prim.setAttribute('COLOR_0', doc.createAccessor('polish336_panel_col')
    .setArray(new Float32Array(col)).setType('VEC3'));
  mat.setBaseColorFactor([...PANEL_BASE, 1]); // emissive NOT touched

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    clothswag: { radius: R, radiusTop: R_TOP, yTop: Y_TOP, hemCorner: Y_HEM_CORNER, hemDeep: Y_HEM_DEEP, hemShallow: Y_HEM_SHALLOW,
      drape: [DRAPE_TOP, DRAPE_HEM], strapColor: STRAP_COLOR,
      strapY: [Y_STRAP_LO, Y_STRAP_HI], panels: PANELS, arcDeg: ARC_DEG,
      triangles: idx.length / 3, baseColorFactor: PANEL_BASE },
    nodes: root.listNodes().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`clothswag: ${error.message}`);
  process.exitCode = 1;
});
