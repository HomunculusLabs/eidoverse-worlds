// dress108-decode-hookrow.ts — decode audit for the lantern-hook row v1
// (8d723b69) on its EXACT bytes, deriving the true local bbox for the
// placer OBB. Chassis: dress99-decode. Read-only. Exit 0 = all pass.
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "");
const bytes = readFileSync(path);

const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);

const failures: string[] = [];
const check = (name: string, ok: boolean, detail: string) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
  if (!ok) failures.push(name);
};

let nodes = 0;
const min = new THREE.Vector3(Infinity, Infinity, Infinity);
const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
const mats = new Set<string>();
root.traverse((o: any) => {
  if (!o.isMesh) return;
  nodes++;
  o.geometry.computeBoundingBox();
  const bb = o.geometry.boundingBox!.clone().applyMatrix4(o.matrixWorld);
  min.min(bb.min); max.max(bb.max);
  if (o.material?.name) mats.add(o.material.name);
});
const size = max.clone().sub(min);
const clocal = { x: (min.x + max.x) / 2, z: (min.z + max.z) / 2 };
check("node budget 3-25", nodes >= 3 && nodes <= 25, `${nodes} nodes`);
check("row span 3.9-4.6 (3 posts at 0/1.8/3.7 + dressing scatter), width 0.7-1.0 (scatter-driven)", size.x >= 3.9 && size.x <= 4.6 && size.z >= 0.7 && size.z <= 1.0,
  `x ${min.x.toFixed(3)}..${max.x.toFixed(3)} z ${min.z.toFixed(3)}..${max.z.toFixed(3)} size ${size.x.toFixed(3)}x${size.z.toFixed(3)}`);
check("grounded (min.y >= -0.02)", min.y >= -0.02, `min.y ${min.y.toFixed(3)}`);
check("hook crown 0.95..1.25 (knee..thigh+crook)", max.y >= 0.95 && max.y <= 1.25, `max.y ${max.y.toFixed(3)}`);
console.log(`PLACER_OBB half_x=${(size.x / 2).toFixed(4)} half_z=${(size.z / 2).toFixed(4)} clocal_x=${clocal.x.toFixed(4)} clocal_z=${clocal.z.toFixed(4)}`);
console.log(`materials: ${[...mats].join(", ")}`);
if (failures.length) { console.error(`FAILURES: ${failures.join(", ")}`); process.exit(1); }
console.log("DECODE ALL PASS");
