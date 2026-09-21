// p336 decode audit v2: type-aware NaN scan + per-prim POSITION extent
// confinement (double-DRACO re-encode makes accessor-hash comparison
// meaningless; extents with tolerance are the semantic probe).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });

const load = async (p: string) => {
  const bytes = new Uint8Array(readFileSync(p));
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();
  const mats: Record<string, any> = {};
  for (const m of root.listMaterials())
    mats[m.getName()] = { baseColorFactor: m.getBaseColorFactor(), emissiveFactor: m.getEmissiveFactor() };
  const prims: Record<string, any> = {};
  let nonFinite = 0, scannedFloats = 0;
  root.listNodes().forEach((n, ni) => {
    const mesh = n.getMesh();
    if (!mesh) return;
    mesh.listPrimitives().forEach((prim, pi) => {
      const rec: Record<string, any> = { mat: prim.getMaterial()?.getName() ?? null, sems: {} };
      for (const sem of prim.listSemantics()) {
        const attr = prim.getAttribute(sem)!;
        const arr = attr.getArray()!;
        rec.sems[sem] = { count: attr.getCount(), type: attr.getType(), cls: arr.constructor.name };
        if (arr instanceof Float32Array) {
          scannedFloats += arr.length;
          for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nonFinite++;
          if (sem === 'POSITION' || sem === 'COLOR_0') {
            const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
            for (let i = 0; i < arr.length; i += 3) for (let k = 0; k < 3; k++) {
              if (arr[i + k] < mn[k]) mn[k] = arr[i + k];
              if (arr[i + k] > mx[k]) mx[k] = arr[i + k];
            }
            const tag = sem === 'POSITION' ? 'min' : 'cmin';
            const tag2 = sem === 'POSITION' ? 'max' : 'cmax';
            rec.sems[sem][tag] = mn; rec.sems[sem][tag2] = mx;
          }
        }
      }
      prims[`${ni}:${n.getName()}#${pi}`] = rec;
    });
  });
  return { sha: createHash('sha256').update(bytes).digest('hex'), nodes: root.listNodes().length, mats, prims, nonFinite, scannedFloats };
};

const a = await load(process.argv[2]);
const b = await load(process.argv[3]);
const TOL = 5e-4;
const matDiffs: string[] = [], extentDrift: { prim: string, d: number }[] = [], structural: string[] = [];
for (const k of new Set([...Object.keys(a.mats), ...Object.keys(b.mats)]))
  if (JSON.stringify(a.mats[k]) !== JSON.stringify(b.mats[k])) matDiffs.push(`${k}: ${JSON.stringify(a.mats[k])} -> ${JSON.stringify(b.mats[k])}`);
for (const k of new Set([...Object.keys(a.prims), ...Object.keys(b.prims)])) {
  const pa = a.prims[k], pb = b.prims[k];
  if (!pa || !pb || pa.mat !== pb.mat) { structural.push(`${k}: presence/mat`); continue; }
  const ea = pa.sems.POSITION, eb = pb.sems.POSITION;
  if (!ea || !eb) continue;
  let d = 0;
  for (let i = 0; i < 3; i++) d = Math.max(d, Math.abs(ea.min[i] - eb.min[i]), Math.abs(ea.max[i] - eb.max[i]));
  if (d > TOL) extentDrift.push({ prim: k, d });
}
const scen = b.prims[Object.keys(b.prims).find(k => k.includes('cr_scenery_ring'))!];
console.log(JSON.stringify({
  nodes: [a.nodes, b.nodes],
  nonFinite: [a.nonFinite, b.nonFinite], scannedFloats: b.scannedFloats,
  matDiffs, extentDrift, structural,
  sceneryCandidate: scen,
}, null, 1));
