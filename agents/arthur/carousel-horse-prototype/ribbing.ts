// polish-298: canopy pieced-wedge treatment — the mid-cone dead-surface cure.
// Judge findings on exact live bytes acee7bcf… (fresh this tick, ZAI fallback
// disclosed, native re-judge owed): DAY 18m — the mid-roof cone reads as "a
// mostly flat, untextured mass… no readable banding, speckle, or shingle
// texture"; NIGHT 18m — the cone is the WEAKEST element, "just barely"
// separated from the sky. Criterion 2 (crown/canopy hierarchy) fails by day;
// criterion 6 drags by night. Queue head named at polish-290/297 close
// (crown-hub/valance second pass — the mid-cone is the zone's remainder).
//
// Falsified builds THIS tick (in-tick retune, polish-272/285 precedent):
//   v1  9cm brass battens, emissive lum 0.131 — judged sub-resolution at 18m
//       day ("no discrete radial lines") AND night ("no warm tracery").
//   v2  22cm cream battens — day contrast present in pixels (55-100 pts over
//       fabric) but still judged flat: thin bright lines in a 26px-tall
//       foreshortened band read as speckle, not canopy structure. Both
//       judges independently recommended the same cure: "alternating panel
//       colors… aligning their count with the scallop rhythm below".
//
// Decode facts (polish298-probe-cone/-armature, this tick): the fabric shell
// cr3_4 is a 16-facet polygon from eave (r 3.12, y 4.81) to apex (r 0,
// y 6.0) — ZERO armature verts within 0.12m of the slope in y 4.9..5.9 (no
// existing ribs to collide with); the valance weld row sits y 4.86 r 3.25;
// the hub cluster (cr3_3) is r ≤ 0.36 from y 5.2 up; the gold finial (cr3_5)
// tops at 6.77.
//
// ONE coherent canopy-piecing intervention (three coupled parts, the polish-
// 258 "crown intervention" shape — collar+spire+valance was likewise one
// treatment):
//   1. WEDGE SPLIT (ceiling.ts chassis): the 16 fabric slope facets split by
//      centroid-angle parity into alternating materials — even facets keep
//      textured `carousel_fabric`, odd facets get NEW solid rose paint
//      `carousel_fabric_b` [0.62,0.32,0.26] + emissive [0.14,0.06,0.045].
//      Day: panel-scale cream/rose alternation at 22.5° pitch = the valance
//      tooth rhythm (16 teeth: 8 gold + 8 fabric). Night: wedge-pair value
//      separation (lum 0.059 vs 0.083) survives as gentle banding.
//   2. SEAM BATTENS (v2 geometry retained): 16 slim battens (22cm wide,
//      6cm proud, y 5.00..5.70, r 2.62..0.79) on the wedge boundaries —
//      picked out crisply by the color change beneath them.
//   3. SEAM NIGHT TRACE: batten emissive raised to [0.30,0.21,0.085]
//      (lum 0.213 ≈ valance teeth 0.203) — at night the seams become warm
//      radial tracery converging on the beacon spire: the mid-cone reads as
//      a SEAMED TENT, not a dark mass. Ladder: lanterns .80 > crown .59 >
//      ceiling .35 > teeth .203 ≈ RIBS .213 > canopy .059/.083 >
//      structural .039/.036.
// Rejected alternative (polish-288 second pass — raise carousel_fabric
// emissive): brute brightness compresses the eave hierarchy and does nothing
// for the day flat-mass defect.
//
// Surgical: reads the pinned live bytes, refuses existing outputs. The
// wedge split rewrites ONE primitive's index buffer and adds ONE sharing
// primitive (no vertex moves — accessors shared by reference); battens are
// pure-additive; the spinning `carousel` subtree, sockets, and motion roots
// are untouched by construction.
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = 'acee7bcf13d20bf2eb7d4369b57e123ce92ea8742c1469f4b600061f16c95a48'; // polish-297 verified live + served bytes (identity)
export const RIB_MAT = 'carousel_canopy_rib';
export const WEDGE_MAT = 'carousel_fabric_b';
const FABRIC = 'carousel_fabric';
const RIB_BASE = [0.85, 0.72, 0.50]; // warm cream-gold painted batten (valance-teeth family)
const RIB_EMISSIVE = [0.30, 0.21, 0.085]; // lum≈0.213 — teeth-parity seam trace, see header ladder
const WEDGE_BASE = [0.40, 0.13, 0.10]; // deep carousel red — scanline-probe finding: cream wedges (lum 226) collide with the DAY SKY (0xcbd6df lum 212) and read as holes; red reads against BOTH sky (Δ90) and fabric (Δ47), and completes the cream/red/gold festive palette (criterion 5)
const WEDGE_EMISSIVE = [0.15, 0.05, 0.04]; // lum≈0.071 — canopy .059 < wedges .071 < teeth .203 (night banding)
const RIBS = 8; // 45° pitch — v6's 16×22.5° scheme rendered sub-resolution above r1.5 and left a bare strip below 4.9 (judge: "alternation never reaches the eave"); 8 full-slope stripes = the classic read, halving the 16-tooth rhythm
const PANELS = 8; // 45° panels spanning two facets each, alternating with bare fabric
const Y0 = 5.0, Y1 = 5.7; // batten run (battens slightly inset from panels)
const PY0 = 4.84, PY1 = 5.78; // panel run: eave-adjacent (weld 4.86 rides under) to hub clearance 0.22
const A = 0.11; // base half-width (22cm batten)
const H = 0.06; // ridge proud height
// Cone slope from decode: eave (r 3.12, y 4.81) → apex (0, 6.0).
const CONE = { rEave: 3.12, yEave: 4.81, rApex: 0, yApex: 6.0 };
const rAt = (y: number) => CONE.rEave * (CONE.yApex - y) / (CONE.yApex - CONE.yEave);

const usage = 'Usage: bun ribbing.ts --input <pinned-live.glb> --output <NEW-carousel-ribs-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-ribs-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-ribs basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();
  assert.ok(!root.listMaterials().some(m => m.getName() === RIB_MAT), 'rib material already exists');
  assert.ok(!root.listMaterials().some(m => m.getName() === WEDGE_MAT), 'wedge material already exists');
  assert.ok(!root.listNodes().some(n => n.getName() === 'cr_canopy_ribs'), 'rib node already exists');

  // ── Part 1: rose wedge panels (additive overlay, no primitive split) ────
  // The v3 centroid-parity split was falsified by polish298-probe-split (tri
  // centroids cluster 7-per-even-bin/1-per-odd — the strip is not
  // facet-columnar; the split scattered 8 isolated tris). Robust cure: 8
  // flat overlay quads, one per ODD facet, riding the facet plane +2cm
  // outward (the 16-facet cone is planar per facet; corner rays ride the
  // slope r(y)). Same band as the battens: y 5.00..5.70.
  const fabricMat = root.listMaterials().find(m => m.getName() === FABRIC);
  assert.ok(fabricMat, 'carousel_fabric material missing');
  const OFF = 0.02; // outward offset over the facet plane
  const wpos: number[] = [], wnrm: number[] = [], widx: number[] = [];
  for (let k = 0; k < PANELS; k++) {
    // Each 45° panel spans two 22.5° facets: [k*45°, (k+1)*45°); alternate red/bare.
    if (k % 2 === 0) {
      const a0 = k * (2 * Math.PI / PANELS), a1 = (k + 1) * (2 * Math.PI / PANELS);
      const am = (a0 + a1) / 2;
      const nx = Math.cos(am), nz = Math.sin(am); // facet-plane outward normal
      const V = (a: number, y: number): [number, number, number] => {
        const r = rAt(y) + OFF;
        return [r * Math.cos(a), y, r * Math.sin(a)];
      };
      const base = wpos.length / 3;
      for (const p of [V(a0, PY0), V(a1, PY0), V(a1, PY1), V(a0, PY1)]) { wpos.push(p[0], p[1], p[2]); wnrm.push(nx, 0.4, nz); }
      // Outward winding (v4's t̂×ŷ = −r̂ faced inward; cull-risk fixed by order + DoubleSide).
      widx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  }
  for (const v of wpos) assert.ok(Number.isFinite(v), 'non-finite wedge vertex');
  const wvec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  const wedgeMat = doc.createMaterial(WEDGE_MAT)
    .setBaseColorFactor(WEDGE_BASE).setRoughnessFactor(0.9).setMetallicFactor(0)
    .setEmissiveFactor(WEDGE_EMISSIVE).setDoubleSided(true);
  const wedgeMesh = doc.createMesh(WEDGE_MAT);
  wedgeMesh.addPrimitive(doc.createPrimitive()
    .setAttribute('POSITION', wvec3('polish298_wedge_pos', wpos))
    .setAttribute('NORMAL', wvec3('polish298_wedge_nrm', wnrm))
    .setIndices(doc.createAccessor('polish298_wedge_idx').setArray(new Uint16Array(widx)))
    .setMode(4).setMaterial(wedgeMat));
  const anchor4 = root.listNodes().find(n => n.getName() === 'cr3_4')!;
  const parent4: Node = anchor4.listParents().find(p => p.propertyType === 'Node') as Node ?? root.listScenes()[0];
  parent4.addChild(doc.createNode('cr_canopy_wedges').setMesh(wedgeMesh));

  // ── Part 2+3: seam battens with night-trace emissive ────────────────────
  const dr = CONE.rApex - CONE.rEave, dy = CONE.yApex - CONE.yEave;
  const slopeLen = Math.hypot(dr, dy);
  const t3r = dr / slopeLen, t3y = dy / slopeLen;      // slope tangent (unit)
  const n3r = dy / slopeLen, n3y = -dr / slopeLen;      // outward normal (unit)

  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  for (let k = 0; k < RIBS; k++) {
    const phi = k * (2 * Math.PI / RIBS);
    const ux = Math.cos(phi), uz = Math.sin(phi);
    const wx = -uz, wz = ux;
    const P = (y: number): [number, number, number] => {
      const r = rAt(y);
      return [r * ux, y, r * uz];
    };
    const p0 = P(Y0), p1 = P(Y1);
    const r0: [number, number, number] = [p0[0] + H * n3r * ux, p0[1] + H * n3y, p0[2] + H * n3r * uz];
    const r1: [number, number, number] = [p1[0] + H * n3r * ux, p1[1] + H * n3y, p1[2] + H * n3r * uz];
    const base = pos.length / 3;
    const push = (p: [number, number, number]) => { pos.push(p[0], p[1], p[2]); nrm.push(n3r * ux, n3y, n3r * uz); };
    push([p0[0] - A * wx, p0[1], p0[2] - A * wz]);
    push([p0[0] + A * wx, p0[1], p0[2] + A * wz]);
    push(r0);
    push([p1[0] - A * wx, p1[1], p1[2] - A * wz]);
    push([p1[0] + A * wx, p1[1], p1[2] + A * wz]);
    push(r1);
    idx.push(base, base + 3, base + 5, base, base + 5, base + 2);
    idx.push(base + 1, base + 2, base + 5, base + 1, base + 5, base + 4);
    idx.push(base, base + 1, base + 2);
    idx.push(base + 3, base + 5, base + 4);
  }
  for (const v of pos) assert.ok(Number.isFinite(v), 'non-finite rib vertex');

  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  const mesh = doc.createMesh(RIB_MAT);
  mesh.addPrimitive(doc.createPrimitive()
    .setAttribute('POSITION', vec3('polish298_ribs_pos', pos))
    .setAttribute('NORMAL', vec3('polish298_ribs_nrm', nrm))
    .setIndices(doc.createAccessor('polish298_ribs_idx').setArray(new Uint16Array(idx)))
    .setMode(4)
    .setMaterial(doc.createMaterial(RIB_MAT)
      .setBaseColorFactor(RIB_BASE).setRoughnessFactor(0.55).setMetallicFactor(0.15)
      .setEmissiveFactor(RIB_EMISSIVE).setDoubleSided(true)));
  const node = doc.createNode('cr_canopy_ribs').setMesh(mesh);
  const anchor = root.listNodes().find(n => n.getName() === 'cr3_4')!;
  const parent: Node = anchor.listParents().find(p => p.propertyType === 'Node') as Node ?? root.listScenes()[0];
  parent.addChild(node);

  // Per rib: left flank quad (2 tris) + right flank quad (2 tris) + 2 cap tris.
  const triCount = idx.length / 3;
  assert.equal(triCount, RIBS * 6, 'unexpected rib triangle count');
  const topClear = rAt(Y1) - 0.36; // hub outer r at that band
  assert.ok(topClear > 0.3, `rib top too close to hub: ${topClear}`);

  const out = new Uint8Array(await io.writeBinary(doc));
  const lum = (f: readonly number[]) => 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    wedges: { panels: 4, pitchDeg: 360 / PANELS, y0: PY0, y1: PY1, base: WEDGE_BASE, emissive: WEDGE_EMISSIVE, lum: +lum(WEDGE_EMISSIVE).toFixed(4) },
    ribs: { count: RIBS, pitchDeg: 360 / RIBS, y0: Y0, y1: Y1, r0: +rAt(Y0).toFixed(3), r1: +rAt(Y1).toFixed(3), width: A * 2, proud: H, triangles: triCount, hubClearance: +topClear.toFixed(3), emissive: RIB_EMISSIVE, lum: +lum(RIB_EMISSIVE).toFixed(4) },
    nodes: root.listNodes().length, materials: root.listMaterials().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`ribbing: ${error.message}`);
  process.exitCode = 1;
});
