import { test, expect } from 'bun:test';
import { existsSync } from 'node:fs';
import * as THREE from 'three';
// Geometry-only glTF decode here; actual texture loading is separately exercised by review-model.ts.
const file = new URL('./moon-moth.glb', import.meta.url);
test('Moon Moth ships loadable bounded geometry with two wing assemblies and a real passenger seat', async () => {
  expect(existsSync(file), 'built Moon Moth GLB exists').toBe(true);
  const bytes = Buffer.from(await Bun.file(file).arrayBuffer());
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const doc = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const left = doc.nodes.find((n: any) => n.name === 'moon_wing_left');
  expect(Math.abs(left.rotation[0]), 'wing pitch reveals membranes to a ground-level frontal view').toBeGreaterThan(.05);
  const root = new THREE.Group();
  function decode(index: number): THREE.Object3D {
    const n = doc.nodes[index];
    const o = new THREE.Group(); o.name = n.name ?? '';
    if (n.translation) o.position.fromArray(n.translation);
    if (n.rotation) o.quaternion.fromArray(n.rotation);
    if (n.scale) o.scale.fromArray(n.scale);
    if (n.mesh !== undefined) for (const p of doc.meshes[n.mesh].primitives) {
      const a = doc.accessors[p.attributes.POSITION];
      const view = doc.bufferViews[a.bufferView];
      const offset = 20 + bytes.readUInt32LE(12) + 8 + (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
      const arr = new Float32Array(a.count * 3);
      for (let i = 0; i < arr.length; i++) arr[i] = bytes.readFloatLE(offset + i * 4);
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const mesh = new THREE.Mesh(geometry); mesh.userData.triangles = doc.accessors[p.indices]?.count / 3 || a.count / 3; o.add(mesh);
    }
    for (const child of n.children ?? []) o.add(decode(child));
    return o;
  }
  for (const index of doc.scenes[doc.scene ?? 0].nodes) root.add(decode(index));
  expect(root.getObjectByName('moon_wing_left')).toBeDefined();
  expect(root.getObjectByName('moon_wing_right')).toBeDefined();
  expect(root.getObjectByName('moon_seat')).toBeDefined();
  const bb = new THREE.Box3().setFromObject(root);
  const sz = bb.getSize(new THREE.Vector3());
  expect(sz.x).toBeGreaterThan(10);
  expect(sz.x).toBeLessThan(14);
  expect(bb.min.y).toBeGreaterThanOrEqual(-0.03);
  expect(sz.y).toBeLessThan(6);
  let meshes = 0, triangles = 0;
  root.traverse(o => { if ((o as THREE.Mesh).isMesh) { meshes++; triangles += o.userData.triangles; } });
  expect(meshes).toBeLessThanOrEqual(28);
  expect(triangles).toBeLessThan(65000);
  const seat = new THREE.Box3().setFromObject(root.getObjectByName('moon_seat')!);
  expect(seat.max.y).toBeCloseTo(1.97, 2);
  console.log(JSON.stringify({ bounds: { min: bb.min.toArray(), max: bb.max.toArray() }, meshes, triangles, seatTop: seat.max.y }));
});
