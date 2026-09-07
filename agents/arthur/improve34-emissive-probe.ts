// improve34-emissive-probe.ts — which meshes in the new GLB carry real
// emissive materials (post-load THREE emissive != black), and their bboxes.
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const bytes = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_longhouse3.glb");
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);
const v = new THREE.Vector3();
root.traverse((o: any) => {
  if (!o.isMesh) return;
  const m = Array.isArray(o.material) ? o.material[0] : o.material;
  const e = (m as THREE.MeshStandardMaterial).emissive;
  const glowHex = e ? e.getHexString() : "none";
  const inten = (m as THREE.MeshStandardMaterial).emissiveIntensity ?? 0;
  const pos = o.geometry.attributes.position.array as Float32Array;
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pos.length; i += 3) {
    v.set(pos[i], pos[i + 1], pos[i + 2]).applyMatrix4(o.matrixWorld);
    mn = [Math.min(mn[0], v.x), Math.min(mn[1], v.y), Math.min(mn[2], v.z)];
    mx = [Math.max(mx[0], v.x), Math.max(mx[1], v.y), Math.max(mx[2], v.z)];
  }
  const isGlow = glowHex !== "none" && glowHex !== "000000";
  if (isGlow || /pane|lamp|flame|fire/.test(o.name)) {
    console.log(o.name.padEnd(24), "emissive", glowHex, "int", inten, "verts", pos.length / 3,
      "bbox", mn.map(n => +n.toFixed(2)).join(","), "..", mx.map(n => +n.toFixed(2)).join(","));
  }
});
// also dump material JSON emissiveFactors
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jl = dv.getUint32(12, true);
const json = JSON.parse(Buffer.from(bytes.buffer, bytes.byteOffset + 20, jl).toString("utf8"));
for (const [i, mm] of (json.materials ?? []).entries()) {
  console.log("MAT", i, mm.name, "em:", JSON.stringify(mm.emissiveFactor), "base:", JSON.stringify(mm.pbrMetallicRoughness?.baseColorFactor));
}
