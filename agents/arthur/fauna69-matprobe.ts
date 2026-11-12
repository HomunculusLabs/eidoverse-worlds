import { readFileSync } from "node:fs";
const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
const bytes = readFileSync("agents/arthur/assets/village_dress_pigeon1.glb");
const loader = new GLTFLoader();
const gltf: any = await new Promise((res, rej) => loader.parse(bytes.buffer as ArrayBuffer, "", res, rej));
gltf.scene.traverse((o: any) => {
  if (!o.isMesh) return;
  const keys = Object.keys(o.geometry.attributes);
  const a = o.geometry.attributes.color ?? o.geometry.attributes.COLOR_0;
  if (!a) { console.log(o.name, keys.join("+"), "no color attr"); return; }
  const arr: any = a.array;
  console.log(o.name, keys.join("+"), a.constructor?.name, arr.constructor.name, "norm:", a.normalized, "first:", arr[0], arr[1], arr[2]);
});
