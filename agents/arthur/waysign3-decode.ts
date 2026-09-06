// waysign3-decode.ts — decode audit for village_sign_kiln3.glb (waysign-3).
// Prints merged-bucket node census, per-mesh local bboxes (translation-
// corrected), and the sign-local bbox used by the placer's SAT target.
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const glb = readFileSync("agents/arthur/assets/village_sign_kiln3.glb");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), null);
const root = gltf.scene;
let overall: { min: THREE.Vector3; max: THREE.Vector3 } | null = null;
let nodes = 0;
root.traverse((o: any) => {
    if (o.isMesh) {
        nodes++;
        const gb = new THREE.Box3().setFromObject(o);
        console.log(o.name.padEnd(28), "[",
            gb.min.x.toFixed(3), gb.min.y.toFixed(3), gb.min.z.toFixed(3), "]..[",
            gb.max.x.toFixed(3), gb.max.y.toFixed(3), gb.max.z.toFixed(3), "]");
        if (!overall) overall = { min: gb.min.clone(), max: gb.max.clone() };
        else overall.min.min(gb.min), overall.max.max(gb.max);
    }
});
console.log("mesh nodes:", nodes);
if (overall) console.log("sign-local bbox:", overall.min.toArray().map(n => +n.toFixed(3)), overall.max.toArray().map(n => +n.toFixed(3)));
