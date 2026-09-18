import { NodeIO, type Document, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { copyToDocument, unpartition } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { readFile, lstat, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';

async function makeIO() {
  return new NodeIO().setAllowNetwork(false).setStrictResources(true)
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
}

const TARGET = 'horse_2';
const DRACO = 'KHR_draco_mesh_compression';
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const KNOWN_EXTENSIONS = new Set(ALL_EXTENSIONS.map(e => e.EXTENSION_NAME));

function requireValid(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

/** Check the original container before NodeIO can normalize malformed or unsupported input. */
function validateGLB(bytes: Uint8Array, label: 'baseline' | 'replacement') {
  const check = (ok: unknown, message: string) => requireValid(ok, `${label}: ${message}`);
  check(bytes instanceof Uint8Array && bytes.byteLength >= 20, 'invalid GLB header');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  check(view.getUint32(0, true) === 0x46546c67 && view.getUint32(4, true) === 2 &&
    view.getUint32(8, true) === bytes.byteLength, 'invalid GLB magic/version/length');
  let json: any, binLength = 0, chunks = 0;
  for (let offset = 12; offset < bytes.length;) {
    check(offset + 8 <= bytes.length, 'invalid GLB chunk header');
    const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true);
    check(length % 4 === 0 && offset + 8 + length <= bytes.length, 'invalid GLB chunk length');
    if (chunks === 0) {
      check(type === 0x4e4f534a, 'invalid GLB JSON chunk');
      try { json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset + 8, offset + 8 + length))); }
      catch { throw new Error(`${label}: invalid GLB JSON`); }
    } else {
      check(chunks === 1 && type === 0x004e4942, 'invalid GLB binary chunk');
      binLength = length;
    }
    chunks++; offset += 8 + length;
  }
  check(json?.asset?.version === '2.0', 'invalid GLB asset version');
  function inspect(value: any) {
    if (!value || typeof value !== 'object') return;
    // Extras are opaque user metadata, not glTF extension declarations.
    for (const [key, child] of Object.entries(value)) {
      if (key === 'extras') continue;
      if (key === 'extensions') {
        check(child && typeof child === 'object' && !Array.isArray(child), 'invalid extensions');
        for (const name of Object.keys(child as object)) {
          check(KNOWN_EXTENSIONS.has(name), `unsupported extension ${name}`);
          check(json.extensionsUsed?.includes(name), `undeclared extension ${name}`);
        }
      }
      inspect(child);
    }
  }
  inspect(json);
  for (const name of [...(json.extensionsUsed ?? []), ...(json.extensionsRequired ?? [])]) {
    check(KNOWN_EXTENSIONS.has(name), `unsupported extension ${name}`);
  }
  // The approved asset is static. Reject unsupported cross-subtree animation/skin references instead of deleting them.
  check(!json.animations?.length && !json.skins?.length, 'only static sculpture is supported (no animations or skins)');
  check(json.buffers?.length === 1 && json.buffers[0].uri === undefined, 'one embedded buffer required; external resources forbidden');
  const size = json.buffers[0].byteLength;
  check(Number.isInteger(size) && size > 0 && size <= binLength && binLength - size <= 3, 'invalid GLB buffer length');
  function ref(index: any, list: any[], kind: string) {
    check(Number.isInteger(index) && index >= 0 && index < (list?.length ?? 0), `invalid ${kind} reference`);
  }
  for (const v of json.bufferViews ?? []) {
    check(v.buffer === 0 && Number.isInteger(v.byteLength) && v.byteLength > 0 &&
      Number.isInteger(v.byteOffset ?? 0) && (v.byteOffset ?? 0) >= 0 &&
      (v.byteOffset ?? 0) + v.byteLength <= size, 'invalid GLB bufferView bounds');
  }
  for (const image of json.images ?? []) {
    check(image.uri === undefined, 'images must be embedded; external resources forbidden');
    ref(image.bufferView, json.bufferViews, 'image bufferView');
  }
  for (const mesh of json.meshes ?? []) {
    check(mesh.primitives?.length, 'invalid mesh without primitives');
    for (const primitive of mesh.primitives) {
      check(primitive.attributes?.POSITION !== undefined, 'invalid mesh without POSITION');
      for (const index of Object.values(primitive.attributes)) ref(index, json.accessors, 'attribute');
      if (primitive.indices !== undefined) ref(primitive.indices, json.accessors, 'indices');
      if (primitive.material !== undefined) ref(primitive.material, json.materials, 'material');
    }
  }
  const nodes = json.nodes;
  check(Array.isArray(nodes) && nodes.length && Array.isArray(json.scenes) && json.scenes.length, 'invalid GLB scene/nodes');
  if (json.scene !== undefined) ref(json.scene, json.scenes, 'default scene');
  const parent = new Map<number, number>();
  for (const [i, node] of nodes.entries()) {
    for (const [key, count] of [['translation', 3], ['rotation', 4], ['scale', 3], ['matrix', 16]] as const) {
      if (node[key] !== undefined) check(Array.isArray(node[key]) && node[key].length === count &&
        node[key].every((v: unknown) => typeof v === 'number' && Number.isFinite(v)), `invalid ${key} transform`);
    }
    check(node.matrix === undefined || ['translation', 'rotation', 'scale'].every(k => node[k] === undefined), 'ambiguous matrix/TRS transform');
    if (node.mesh !== undefined) ref(node.mesh, json.meshes, 'mesh');
    if (node.camera !== undefined) ref(node.camera, json.cameras, 'camera');
    check(node.skin === undefined, 'only static nodes supported');
    check(node.children === undefined || Array.isArray(node.children), 'invalid child list');
    for (const child of node.children ?? []) {
      ref(child, nodes, 'child');
      check(!parent.has(child), 'invalid hierarchy: node has multiple parents');
      parent.set(child, i);
    }
  }
  const visited = new Set<number>(), active = new Set<number>();
  function walk(i: number, seen: Set<number>) {
    check(!active.has(i), 'invalid hierarchy: cycle');
    if (seen.has(i)) return;
    active.add(i); seen.add(i);
    for (const child of nodes[i].children ?? []) walk(child, seen);
    active.delete(i);
  }
  nodes.forEach((_: unknown, i: number) => walk(i, visited));
  const reachable = new Set<number>();
  for (const scene of json.scenes) {
    check(Array.isArray(scene.nodes), 'invalid scene root list');
    check(new Set(scene.nodes).size === scene.nodes.length, 'invalid hierarchy: duplicate scene root');
    for (const root of scene.nodes) {
      ref(root, nodes, 'scene node');
      check(!parent.has(root), 'invalid hierarchy: scene root also has a parent');
      walk(root, reachable);
    }
  }
  function unique(name: string) {
    const indices = nodes.flatMap((n: any, i: number) => n.name === name ? [i] : []);
    check(indices.length === 1, `expected exactly one ${name} node, found ${indices.length}`);
    check(reachable.has(indices[0]), `${name} must be reachable in a scene`);
    return indices[0];
  }
  const target = unique(TARGET), root = nodes[target];
  check(root.mesh === undefined && root.skin === undefined && root.camera === undefined, `${TARGET} must be a group, not a mesh/camera/skin`);
  check(root.children?.length, `${TARGET} must have children`);
  if (label === 'baseline') {
    const carousel = unique('carousel');
    for (const name of ['horse_0', TARGET, 'horse_4', 'horse_6']) {
      check(parent.get(unique(name)) === carousel, `${name} must retain its parent carousel hierarchy`);
    }
  } else {
    check(!Object.keys(root.extensions ?? {}).length, 'replacement root extensions cannot be discarded');
    check(json.scenes.length === 1 && json.scenes[0].nodes.length === 1 && json.scenes[0].nodes[0] === target,
      `${TARGET} must be the only replacement scene root`);
    const equal = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
    check(equal(root.translation ?? [0, 0, 0], [0, 0, 0]) && equal(root.rotation ?? [0, 0, 0, 1], [0, 0, 0, 1]) &&
      equal(root.scale ?? [1, 1, 1], [1, 1, 1]) && equal(root.matrix ?? IDENTITY, IDENTITY), `${TARGET} root must be at identity`);
    check(reachable.size === nodes.length, 'all replacement nodes must be reachable');
    for (const [i, node] of nodes.entries()) {
      check(i === target || !/^(?:carousel|horse_\d+)$/.test(node.name ?? ''), `unapproved motion anchor ${node.name}`);
      check(node.camera === undefined && !node.extensions?.KHR_lights_punctual, 'replacement must be static geometry without cameras/lights');
    }
  }
  return json;
}

function validateDecoded(doc: Document, original: any, label: string) {
  const check = (ok: unknown, message: string) => requireValid(ok, `${label}: ${message}`);
  const nodes = doc.getRoot().listNodes();
  nodes.forEach((node, i) => {
    const raw = original.nodes[i];
    check(Math.abs(node.getRotation().reduce((sum, v) => sum + v * v, 0) - 1) < 1e-6, 'invalid quaternion transform');
    for (const [rawValue, actual] of [[raw.translation, node.getTranslation()], [raw.rotation, node.getRotation()],
      [raw.scale, node.getScale()], [raw.matrix, node.getMatrix()]] as [number[] | undefined, number[]][]) {
      if (rawValue) check(rawValue.every((v, j) => v === actual[j]), 'transform cannot be preserved exactly through decoding');
    }
  });
  for (const accessor of doc.getRoot().listAccessors()) {
    const array = accessor.getArray();
    check(array && accessor.getCount() > 0 && Number.isInteger(accessor.getCount()) &&
      array.every(v => Number.isFinite(v)), `invalid or non-finite geometry accessor ${accessor.getName()}`);
  }
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      check(position?.getType() === 'VEC3', 'invalid POSITION geometry');
      const count = position!.getCount();
      for (const attribute of primitive.listAttributes()) check(attribute.getCount() === count, 'invalid attribute geometry count');
      const indices = primitive.getIndices();
      if (indices) {
        check(indices.getType() === 'SCALAR' && !indices.getNormalized() && [5121, 5123, 5125].includes(indices.getComponentType()) &&
          indices.getArray()!.every(v => Number.isInteger(v) && v >= 0 && v < count), 'invalid geometry indices');
      }
    }
  }
  let meshes = 0;
  nodes.find(n => n.getName() === TARGET)!.traverse(node => { if (node.getMesh()) meshes++; });
  check(meshes > 0, `${TARGET} requires reachable mesh geometry`);
}

/** Offline only: caller supplies the served bytes, never a regenerated carousel. */
export async function packagePrototype(baselineBytes: Uint8Array, horseBytes: Uint8Array): Promise<Uint8Array> {
  const baselineJSON = validateGLB(baselineBytes, 'baseline');
  const horseJSON = validateGLB(horseBytes, 'replacement');
  const io = await makeIO();
  const baseline = await io.readBinary(baselineBytes);
  const horse = await io.readBinary(horseBytes);
  validateDecoded(baseline, baselineJSON, 'baseline');
  validateDecoded(horse, horseJSON, 'replacement');
  // Decoding already produced the served vertex/index values. Re-encoding Draco would quantize them again.
  for (const doc of [baseline, horse]) {
    doc.getRoot().listExtensionsUsed().filter(e => e.extensionName === DRACO)
      .forEach(e => e.dispose());
  }
  const target = baseline.getRoot().listNodes().find(n => n.getName() === TARGET)!;
  const source = horse.getRoot().listNodes().find(n => n.getName() === TARGET)!;
  for (const extension of horse.getRoot().listExtensionsUsed()) {
    const copy = baseline.createExtension(extension.constructor as any);
    if (extension.isRequired()) copy.setRequired(true);
  }
  const children = source.listChildren();
  const copied = copyToDocument(baseline, horse, children);
  const old: Node[] = [];
  target.listChildren().forEach(n => n.traverse(child => old.push(child)));
  old.reverse().forEach(n => n.dispose()); // Nodes only: old meshes/materials may be shared by other horses.
  children.forEach(n => target.addChild(copied.get(n) as Node));
  await baseline.transform(unpartition()); // Buffer consolidation only; no geometry optimization.
  return io.writeBinary(baseline);
}

async function main(args: string[]): Promise<void> {
  const usage = 'Usage: bun package.ts --baseline <served.glb> --horse <cream-horse.glb> --output <NEW-prototype.glb>';
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    requireValid(['--baseline', '--horse', '--output'].includes(key) && !flags.has(key) &&
      value && !value.startsWith('--'), usage);
    requireValid(!/^[a-z][a-z\d+.-]*:/i.test(value) && !value.includes('\0'), 'Only local filesystem paths are accepted; no network');
    flags.set(key, resolve(value));
  }
  requireValid(flags.size === 3, usage);
  const output = flags.get('--output')!;
  requireValid(basename(output).toLowerCase() !== 'village_carousel3.glb', 'Refusing canonical basename village_carousel3.glb');
  // lstat catches dangling symlinks as well. Exclusive creation below closes the check/write race.
  try {
    await lstat(output);
    throw new Error(`Refusing existing output path: ${output}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const [baseline, horse] = await Promise.all([readFile(flags.get('--baseline')!), readFile(flags.get('--horse')!)]);
  const bytes = await packagePrototype(baseline, horse);
  await writeFile(output, bytes, { flag: 'wx', mode: 0o644 });
  const actual = await readFile(output);
  requireValid(actual.equals(Buffer.from(bytes)), 'Output read-back did not match packaged bytes');
  console.log(JSON.stringify({ output, bytes: actual.length, sha256: createHash('sha256').update(actual).digest('hex'), offline: true }));
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`packagePrototype: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
