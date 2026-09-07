// improve34-decode-longhouse.ts — decode the live longhouse GLB (e3adcd3d):
// which primitives are material-less (struct-38 class), porch post positions,
// window burial, chimney bucket, plinth extents, envelope.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_longhouse3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
console.log("sha256", sha);

// parse JSON chunk directly for materials
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const jsonStr = Buffer.from(bytes.buffer, bytes.byteOffset + 20, jsonLen).toString("utf8");
const json = JSON.parse(jsonStr);
const matNames: string[] = (json.materials ?? []).map((m: any) => m.name);
console.log("materials:", JSON.stringify(matNames));

// count mesh primitives and how many have material set
let primTotal = 0, primNoMat = 0;
const meshes = json.meshes ?? [];
for (const m of meshes) for (const p of m.primitives ?? []) { primTotal++; if (p.material === undefined) primNoMat++; }
console.log(`primitives: ${primTotal} total, ${primNoMat} material-less`);

// geometry decode
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);

const buckets: Record<string, any> = {};
root.traverse((o: any) => {
  if (!o.isMesh) return;
  let geo = o.geometry as THREE.BufferGeometry;
  const pos = geo.attributes.position;
  const arr = pos.array as Float32Array;
  const v = new THREE.Vector3();
  let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < arr.length; i += 3) {
    v.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(o.matrixWorld);
    if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
    if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
    if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;
  }
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  const hasMat = (o as any).userData?.gltfMaterialIdx !== undefined;
  buckets[o.name] = {
    verts: arr.length / 3,
    bbox: [+minX.toFixed(3), +minY.toFixed(3), +minZ.toFixed(3), +maxX.toFixed(3), +maxY.toFixed(3), +maxZ.toFixed(3)],
    matType: mats[0]?.map ? "tex" : (mats[0]?.emissiveIntensity > 0 ? "emissive" : "plain"),
  };
});
for (const [name, b] of Object.entries(buckets)) console.log(name.padEnd(28), JSON.stringify(b));

// keep-out zones: rider b19 anchor band (porch roof outer edge zone) and
// window rows — count verts
const zones: Record<string, (x: number, y: number, z: number) => boolean> = {
  b19_porch_roof_edge: (x, y, z) => x >= -0.6 && x <= 0.6 && y >= 1.9 && y <= 2.55 && z >= 3.9 && z <= 4.7,
  porch_center_posts: (x, y, z) => Math.abs(x) <= 1.85 && Math.abs(x) >= 1.65 && y >= 0.2 && y <= 2.4 && Math.abs(z - 3.55) <= 0.1,
  chimney_zone: (x, y, z) => x >= -2.4 && x <= -1.6 && z >= -0.5 && z <= 0.5 && y >= 3.0,
};
const counts: Record<string, number> = {};
for (const zn of Object.keys(zones)) counts[zn] = 0;
root.traverse((o: any) => {
  if (!o.isMesh) return;
  const pos = o.geometry.attributes.position.array as Float32Array;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.length; i += 3) {
    v.set(pos[i], pos[i + 1], pos[i + 2]).applyMatrix4(o.matrixWorld);
    for (const [zn, t] of Object.entries(zones)) if (t(v.x, v.y, v.z)) counts[zn]++;
  }
});
console.log("zone vert counts:", JSON.stringify(counts));
