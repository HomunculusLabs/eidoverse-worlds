// fauna57-tailsign-probe.ts — settle the tail-pitch sign dispute: the
// hand decoder says the tail sits LOW (y-max 0.103); pure three.js
// rotation math for θ=−0.16 on a −x tail says it should sit HIGH
// (y-max ~0.159). Load the GLB with three and Box3 the tail subtree —
// the honest instrument (fauna-23 law b: probe outranks the argument).
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const bytes = readFileSync("agents/arthur/assets/village_dress_magpi1.glb");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);
for (const name of ["magpi", "magpi_head", "magpi_tail"]) {
  let found: any = null;
  root.traverse((o: any) => { if (!found && o.name === name) found = o; });
  if (!found) throw Error(`absent ${name}`);
  const bb = new THREE.Box3().setFromObject(found);
  console.log(name, "y", bb.min.y.toFixed(4), "..", bb.max.y.toFixed(4),
    "| x", bb.min.x.toFixed(4), "..", bb.max.x.toFixed(4),
    "| rotZ", found.rotation?.z?.toFixed(4) ?? "n/a");
}
