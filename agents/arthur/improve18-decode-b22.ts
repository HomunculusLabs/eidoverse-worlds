// improve18-decode-b22.ts — decode the b22 eight-ways rider geometry to
// establish the map/rider coexistence contract on the mapboard face.
// Where do the 8 marks sit in HOST-local space? Is the face center clear?
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const bytes = readFileSync("agents/arthur/assets/village_artwalk_b22.glb");
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
gltf.scene.updateMatrixWorld(true);
const out: number[][] = [];
gltf.scene.traverse((o: any) => {
    if (!o.isMesh) return;
    const pos = o.geometry.getAttribute("position") as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        out.push([v.x, v.y, v.z]);
    }
});
const q = (n: number) => Math.round(n * 1000) / 1000;
const bb = new THREE.Box3().setFromPoints(out.map(v => new THREE.Vector3(...v as [number, number, number])));
console.log("rider verts:", out.length);
console.log("rider local bbox:", bb.min.toArray().map(q).join(","), "..", bb.max.toArray().map(q).join(","));
// cluster marks by proximity (grid 0.15) in the y-z face plane
const seen = new Map<string, number>();
for (const v of out) {
    const k = `${Math.round(v[0] / 0.3)},${Math.round(v[1] / 0.3)},${Math.round(v[2] / 0.15)}`;
    seen.set(k, (seen.get(k) ?? 0) + 1);
}
const marks = [...seen.entries()].sort((a, b) => b[1] - a[1]);
console.log("clusters (k=count):", marks.length);
for (const [k, c] of marks.slice(0, 20)) console.log(`  ${k}: ${c}`);
// distribution in x bands (is the center column clear?)
const bands = { left: 0, center: 0, right: 0 };
for (const v of out) {
    if (v[0] < -0.3) bands.left++;
    else if (v[0] > 0.3) bands.right++;
    else bands.center++;
}
console.log("x-band distribution:", JSON.stringify(bands));
