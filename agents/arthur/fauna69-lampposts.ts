// fauna69-lampposts.ts — decode the streetlamp network's REAL post
// positions (the lamp-in-path law's instrument: the network bbox is a
// fat proxy; the posts are small solids). Serves local
// village_streetlamps3.glb, decodes post-base clusters (mesh buckets
// whose y-span starts at ground), maps entity-local → world via the live
// census tuple (yaw π, pos (0,0)).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const THREE = await import("three");
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

const bytes = readFileSync("agents/arthur/assets/village_streetlamps3.glb");
const sha = createHash("sha256").update(bytes).digest("hex");
console.log("streetlamps3 local sha16:", sha.slice(0, 16), "(live lib a7b05aefe1e971e8)");
const loader = new GLTFLoader();
const gltf: any = await new Promise((res, rej) => loader.parse(bytes.buffer as ArrayBuffer, "", res, rej));
const root = gltf.scene;
root.updateMatrixWorld(true);
// cluster mesh buckets by their world x/z (posts = vertical clusters)
const posts: { x: number; z: number; top: number }[] = [];
const clusters = new Map<string, { x: number; z: number; top: number; n: number }>();
root.traverse((o: any) => {
  if (!o.isMesh) return;
  o.geometry.computeBoundingBox();
  const bb = o.geometry.boundingBox;
  const m = o.matrixWorld;
  const corners = [[bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z]];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [cx, cy, cz] of corners) {
    const v = new THREE.Vector3(cx, cy, cz).applyMatrix4(m);
    minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
  }
  const key = `${Math.round((minX + maxX) / 2 / 0.5)},${Math.round((minZ + maxZ) / 2 / 0.5)}`;
  const c = clusters.get(key) ?? { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2, top: 0, n: 0 };
  c.top = Math.max(c.top, maxY); c.n++;
  clusters.set(key, c);
});
for (const c of clusters.values()) posts.push({ x: +c.x.toFixed(3), z: +c.z.toFixed(3), top: +c.top.toFixed(2) });
posts.sort((a, b) => (a.x - b.x) || (a.z - b.z));
console.log("clusters:", posts.length);
for (const p of posts) console.log(JSON.stringify(p));
