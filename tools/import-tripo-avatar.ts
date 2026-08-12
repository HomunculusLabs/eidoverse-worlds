// import-tripo-avatar — Janus's Blender exports become wearable VRMs, in one
// command. Born from three mythos-PAINT imports in three days, each export
// missing something different; every repair below was needed at least once.
//
//   bun tools/import-tripo-avatar.ts <in.glb> --name mythos_paint3 \
//       [--donor path.glb] [--max-verts 200000] [--height 1.7] [--out dir]
//
// Stages, all detect-and-repair (a clean export passes through untouched):
//   1. STRIP: BODY_PROXY (the rig pipeline's hand-sculpted collision hull
//      ships inside some exports and would render as a blocky shell).
//   2. MATERIALS: Blender exports from the rig blend LOSE the texture images
//      and the paint (three for three so far). tripo_* materials get their
//      texture set transplanted from a known-good donor (same mesh UUID —
//      the UVs hold); PORCELAIN/RAVEN/GOLD get the factor materials the
//      avatar actually looks right in (white glaze / iridescent black /
//      default-metallic gold). A material that arrives WITH textures keeps
//      them.
//   3. DIET: weld + meshopt-simplify toward --max-verts (PAINT-inner shipped
//      1.5M vertices — 12x the proven-good density; a skinned mesh that size
//      is unwearable). Skipped when already under budget.
//   4. VRMIFY: VRMC_vrm 1.0 humanoid stamped on (52-bone Tripo→VRM map,
//      thumbs Metacarpal/Proximal/Distal, Pinky→Little; twist bones and
//      finger metacarpals stay unmapped and FK-follow, per spec).
//   5. SCALE: uniform bake to --height (node translations + POSITIONs + the
//      inverse-bind translation row — no scale nodes, so every consumer,
//      including rig-load's scale-blind worldPositions, agrees).
//   6. VERIFY: the fleet suite's own fixtures drive a fall under BOTH the
//      ammo engine (the avatar's native rig) and the verlet — settle, full
//      pose, fingers if the rig has digits, no skipped joints.
//
// Output: <out>/<name>.vrm + a report. Install is a copy into
// assets/opt/eidoverse/assets/vrms/ (any sequencer picks it up live) — this
// tool never touches a box; deploy stays a human/scp step.

import { plugin } from 'bun';
const STUB = new URL('./core-stub.mjs', import.meta.url).pathname;
plugin({ name: 'core-stub', setup(b) { b.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB })); } });

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsClearcoat, KHRMaterialsIridescence } from '@gltf-transform/extensions';
import { prune, weld, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

// ---- args -------------------------------------------------------------------
const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const opt = (k: string, d: string | null = null) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
if (!input || !opt('name')) {
  console.error('usage: bun tools/import-tripo-avatar.ts <in.glb> --name <avatar_name> [--donor glb] [--max-verts N] [--height M] [--out dir]');
  process.exit(2);
}
const NAME = opt('name')!;
const MAX_VERTS = Number(opt('max-verts', '200000'));
const HEIGHT = Number(opt('height', '1.7'));
const OUT_DIR = opt('out', dirname(resolve(input!)))!;
const DONOR = opt('donor', join(dirname(resolve(input!)), 'mythos-PAINT2.glb'));

const say = (s: string) => console.log(`  ${s}`);
console.log(`import-tripo-avatar: ${input} → ${NAME}.vrm`);

// ---- 1-3: gltf-transform stages --------------------------------------------
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input!);
const root = doc.getRoot();

for (const node of root.listNodes()) {
  if (node.getName() === 'BODY_PROXY') { node.dispose(); say('stripped BODY_PROXY'); }
}

const donorDoc = existsSync(DONOR!) ? await io.read(DONOR!) : null;
const donorMats = donorDoc
  ? Object.fromEntries(donorDoc.getRoot().listMaterials().map((m) => [m.getName(), m])) : {};
const texCache = new Map();
const carry = (srcTex: any) => {
  if (!srcTex) return null;
  if (!texCache.has(srcTex)) {
    texCache.set(srcTex, doc.createTexture(srcTex.getName())
      .setImage(srcTex.getImage()).setMimeType(srcTex.getMimeType()));
  }
  return texCache.get(srcTex);
};
const clearcoatExt = doc.createExtension(KHRMaterialsClearcoat);
const iridescenceExt = doc.createExtension(KHRMaterialsIridescence);
for (const mat of root.listMaterials()) {
  const name = mat.getName();
  if (name.startsWith('tripo_material') && !mat.getBaseColorTexture()) {
    const src = (donorMats as any)[name];
    if (src?.getBaseColorTexture()) {
      mat.setBaseColorTexture(carry(src.getBaseColorTexture()));
      mat.setMetallicRoughnessTexture(carry(src.getMetallicRoughnessTexture()));
      mat.setNormalTexture(carry(src.getNormalTexture()));
      mat.setMetallicFactor(src.getMetallicFactor()).setRoughnessFactor(src.getRoughnessFactor());
      say(`textures transplanted onto ${name}`);
    } else say(`⚠ ${name} is textureless and the donor cannot help (${DONOR})`);
  } else if (name === 'RAVEN') {
    // AUTHOR WINS: an export that arrives with its own factors or extensions
    // (Janus ships her own iridescence now) passes through untouched — the
    // house look below is a REPAIR for bare materials, not a house style
    if (mat.getBaseColorFactor().some((v: number, i: number) => v !== 1 && i < 3)
      || mat.listExtensions().length) { say('RAVEN: author-provided, kept'); continue; }
    mat.setBaseColorFactor([0.015, 0.015, 0.022, 1]).setMetallicFactor(0.2)
      .setRoughnessFactor(0.22).setDoubleSided(true);
    mat.setExtension('KHR_materials_clearcoat',
      clearcoatExt.createClearcoat().setClearcoatFactor(0.5).setClearcoatRoughnessFactor(0.1));
    mat.setExtension('KHR_materials_iridescence',
      iridescenceExt.createIridescence().setIridescenceFactor(0.55).setIridescenceIOR(1.3)
        .setIridescenceThicknessMinimum(200).setIridescenceThicknessMaximum(500));
    say('RAVEN → iridescent black');
  } else if (name === 'PORCELAIN') {
    if (mat.getBaseColorFactor().some((v: number, i: number) => v !== 1 && i < 3)
      || mat.listExtensions().length) { say('PORCELAIN: author-provided, kept'); continue; }
    for (const k of ['BaseColor', 'MetallicRoughness'] as const) (mat as any)[`set${k}Texture`](null);
    mat.setNormalTexture(null);
    mat.setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(0.28).setDoubleSided(true);
    mat.setExtension('KHR_materials_clearcoat',
      clearcoatExt.createClearcoat().setClearcoatFactor(0.25).setClearcoatRoughnessFactor(0.12));
    say('PORCELAIN → white glaze');
  } else if (name === 'GOLD') {
    mat.setDoubleSided(true);            // factor + default metallic already right
  } else if (name === 'eyeballs' && !mat.getBaseColorTexture()) {
    // the once-mysterious Sphere: give bare eyes a dark iris-ish gloss
    // rather than default white-out
    mat.setBaseColorFactor([0.06, 0.05, 0.06, 1]).setMetallicFactor(0).setRoughnessFactor(0.1);
    say('eyeballs → dark gloss');
  }
}

let verts = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  verts += prim.getAttribute('POSITION')?.getCount() ?? 0;
}
say(`${verts.toLocaleString()} vertices`);
if (verts > MAX_VERTS) {
  const ratio = MAX_VERTS / verts;
  say(`diet: simplify toward ${MAX_VERTS.toLocaleString()} (ratio ${ratio.toFixed(3)})`);
  await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error: Number(opt('diet-error', '0.01')) }));
  let after = 0;
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    after += prim.getAttribute('POSITION')?.getCount() ?? 0;
  }
  say(`diet result: ${after.toLocaleString()} vertices`);
}
await doc.transform(prune());

const tmpGlb = join(OUT_DIR, `.${NAME}.tmp.glb`);
await io.write(tmpGlb, doc);

// ---- 4: vrmify (JSON-chunk surgery — gltf-transform would strip VRMC_vrm) --
const buf = readFileSync(tmpGlb);
const jsonLen = buf.readUInt32LE(12);
const g = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
const rest0 = buf.subarray(20 + jsonLen);
const idx = new Map(g.nodes.map((n: any, i: number) => [n.name, i]));
const need = (n: string) => {
  if (!idx.has(n)) throw new Error(`missing bone ${n} — not a Tripo rig?`);
  return idx.get(n);
};
const MAP: Record<string, string> = {
  hips: 'Hip', spine: 'Waist', chest: 'Spine01', upperChest: 'Spine02',
  neck: 'NeckTwist01', head: 'Head',
  leftShoulder: 'L_Clavicle', leftUpperArm: 'L_Upperarm', leftLowerArm: 'L_Forearm', leftHand: 'L_Hand',
  rightShoulder: 'R_Clavicle', rightUpperArm: 'R_Upperarm', rightLowerArm: 'R_Forearm', rightHand: 'R_Hand',
  leftUpperLeg: 'L_Thigh', leftLowerLeg: 'L_Calf', leftFoot: 'L_Foot', leftToes: 'L_ToeBase',
  rightUpperLeg: 'R_Thigh', rightLowerLeg: 'R_Calf', rightFoot: 'R_Foot', rightToes: 'R_ToeBase',
};
for (const side of ['left', 'right']) {
  const S = side === 'left' ? 'L' : 'R';
  MAP[`${side}ThumbMetacarpal`] = `${S}_Thumb0`;
  MAP[`${side}ThumbProximal`] = `${S}_Thumb1`;
  MAP[`${side}ThumbDistal`] = `${S}_Thumb2`;
  for (const [vrm, tri] of [['Index', 'Index'], ['Middle', 'Middle'], ['Ring', 'Ring'], ['Little', 'Pinky']]) {
    MAP[`${side}${vrm}Proximal`] = `${S}_${tri}1`;
    MAP[`${side}${vrm}Intermediate`] = `${S}_${tri}2`;
    MAP[`${side}${vrm}Distal`] = `${S}_${tri}3`;
  }
}
const humanBones: Record<string, { node: unknown }> = {};
for (const [vrm, tri] of Object.entries(MAP)) humanBones[vrm] = { node: need(tri) };
g.extensionsUsed = [...new Set([...(g.extensionsUsed ?? []), 'VRMC_vrm'])];
g.extensions = g.extensions ?? {};
g.extensions.VRMC_vrm = {
  specVersion: '1.0',
  meta: {
    name: NAME, version: input!.split('/').pop(),
    authors: ['Janus (socketteer)'],
    copyrightInformation: 'Avatar of Mythos/Fable; paint by Janus',
    licenseUrl: 'https://vrm.dev/licenses/1.0/',
    avatarPermission: 'onlySeparatelyLicensedPerson',
    commercialUsage: 'personalNonProfit', creditNotation: 'required', modification: 'prohibited',
  },
  humanoid: { humanBones },
};
say(`vrmified: ${Object.keys(humanBones).length} humanoid bones`);

// ---- 5: scale bake ----------------------------------------------------------
// measure current height from hips..head span the way the engines do
// FULL TRS walk — translations alone once measured a NEGATIVE height on an
// export whose armature carried a rotation, and the tool nearly baked a
// mirror-flip ×-5.857 into the avatar
const wp = (() => {
  const parent = new Map();
  g.nodes.forEach((n: any, i: number) => (n.children ?? []).forEach((c: number) => parent.set(c, i)));
  const qmul = (a: number[], b: number[]) => [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  const qrot = (q: number[], v: number[]) => {
    const t = qmul(qmul(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]);
    return [t[0], t[1], t[2]];
  };
  const memo = new Map();
  const world = (i: number): { p: number[]; q: number[] } => {
    if (memo.has(i)) return memo.get(i);
    const n = g.nodes[i];
    const t = n.translation ?? [0, 0, 0];
    const q = n.rotation ?? [0, 0, 0, 1];
    const par: number | undefined = parent.get(i);
    let out;
    if (par == null) out = { p: [...t], q: [...q] };
    else {
      const pw = world(par);
      const rt = qrot(pw.q, t);
      out = { p: [pw.p[0] + rt[0], pw.p[1] + rt[1], pw.p[2] + rt[2]], q: qmul(pw.q, q) };
    }
    memo.set(i, out); return out;
  };
  return (i: number) => world(i).p;
})();
const headY = wp(need('Head') as number)[1];
const footY = wp(need('L_Foot') as number)[1];
const span = headY - footY;
if (!(span > 0.05)) {
  console.error(`ABORT: measured head-foot span ${span.toFixed(3)} — a non-positive or degenerate`
    + ' span would bake a mirror/garbage scale. Inspect the export.');
  process.exit(1);
}
const S = HEIGHT / (span * 1.16);
say(`scale ×${S.toFixed(3)} (head-foot span ${(headY - footY).toFixed(2)} → target ${HEIGHT}m)`);
const bin = Buffer.from(rest0.subarray(8));
for (const n of g.nodes) if (n.translation) n.translation = n.translation.map((x: number) => x * S);
const accBytes = (a: any) => {
  const bv = g.bufferViews[a.bufferView];
  return { base: (bv.byteOffset ?? 0) + (a.byteOffset ?? 0), stride: bv.byteStride ?? 0 };
};
const seen = new Set();
for (const m of g.meshes ?? []) for (const p of m.primitives) {
  for (const ai of [p.attributes.POSITION, ...(p.targets ?? []).map((t: any) => t.POSITION)]) {
    if (ai == null || seen.has(ai)) continue;
    seen.add(ai);
    const a = g.accessors[ai];
    const { base, stride } = accBytes(a);
    const step = stride || 12;
    for (let i = 0; i < a.count; i++) for (let c = 0; c < 3; c++) {
      const off = base + i * step + c * 4;
      bin.writeFloatLE(bin.readFloatLE(off) * S, off);
    }
    if (a.min) a.min = a.min.map((x: number) => x * S);
    if (a.max) a.max = a.max.map((x: number) => x * S);
  }
}
for (const sk of g.skins ?? []) {
  const a = g.accessors[sk.inverseBindMatrices];
  const { base, stride } = accBytes(a);
  const step = stride || 64;
  for (let i = 0; i < a.count; i++) for (const e of [12, 13, 14]) {
    const off = base + i * step + e * 4;
    bin.writeFloatLE(bin.readFloatLE(off) * S, off);
  }
}
let jsonBuf = Buffer.from(JSON.stringify(g));
const pad = (4 - (jsonBuf.length % 4)) % 4;
if (pad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(pad, 0x20)]);
const out = Buffer.alloc(12 + 8 + jsonBuf.length + 8 + bin.length);
out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
out.writeUInt32LE(jsonBuf.length, 12); out.writeUInt32LE(0x4e4f534a, 16);
jsonBuf.copy(out, 20);
out.writeUInt32LE(bin.length, 20 + jsonBuf.length);
out.writeUInt32LE(0x004e4942, 24 + jsonBuf.length);
bin.copy(out, 28 + jsonBuf.length);
const outPath = join(OUT_DIR, `${NAME}.vrm`);
writeFileSync(outPath, out);
await Bun.file(tmpGlb).unlink?.() ?? Bun.spawnSync(['rm', tmpGlb]);
say(`wrote ${outPath} (${(out.length / 1048576).toFixed(1)}MB)`);

// ---- 6: verify with the fleet fixtures + both engines -----------------------
const { glbJson, humanBones: hb, worldPositions, makeAvatar, toppleLean } = await import('./rig-load.mjs');
const { AmmoRagdoll, ensureAmmo } = await import('../client/lib/ammodoll.js');
const { Ragdoll } = await import('../client/lib/ragdoll.js');
const g2 = glbJson(readFileSync(outPath));
const bones2 = hb(g2);
const wpos = worldPositions(g2);
const P: Record<string, unknown> = {};
for (const [b, n] of Object.entries(bones2)) if (g2.nodes[n as number]) P[b] = wpos(n);
const nodeOf = new Map(Object.entries(bones2).map(([b, n]) => [n, b]));
const up = new Map();
g2.nodes.forEach((n: any, i: number) => (n.children ?? []).forEach((c: number) => up.set(c, i)));
const realParent: Record<string, string | null> = {};
for (const [b, n] of Object.entries(bones2)) {
  let a: any = up.get(n);
  while (a !== undefined && !nodeOf.has(a)) a = up.get(a);
  realParent[b] = a === undefined ? null : (nodeOf.get(a) as string);
}
let ok = true;
const checkV = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
  ok &&= cond;
};
checkV('wasm door opens', await ensureAmmo());
for (const [label, Engine] of [['ammo', AmmoRagdoll], ['verlet', Ragdoll]] as any) {
  const av = makeAvatar(P, { realParent });
  av.root.updateMatrixWorld(true);
  const rd: any = new Engine(av, toppleLean(), av.restBonePositions());
  let steps = 0;
  while (!rd.done && steps < 900) { rd.step(1 / 60); steps++; }
  const pose = rd.finalPose ?? {};
  const finite = Object.values(pose).every((q: any) => q.every(Number.isFinite));
  checkV(`${label}: falls, settles, finite pose`, rd.done && finite && Object.keys(pose).length >= 8,
    `${Object.keys(pose).length} bones in ${steps} steps`);
  if (label === 'ammo') {
    checkV('ammo: no detached joints', !(rd.skipped?.length), (rd.skipped ?? []).join(','));
    const fingers = Object.keys(pose).filter((k) => /Proximal|Intermediate|Thumb/.test(k)).length;
    say(`ammo drives ${fingers} finger bones`);
  }
}
console.log(ok ? `\nPASS — install: cp ${outPath} assets/opt/eidoverse/assets/vrms/` : '\nFAIL — do not install');
process.exit(ok ? 0 : 1);
