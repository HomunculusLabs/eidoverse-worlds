// waysign16-decode.ts — decode audit for village_sign_smithy.glb v3 brace fix
// (waysign-16). Prints per-mesh translation-corrected local bboxes + overall
// envelope, and brace contact math vs plate/arm (the bakery v6 triangle).
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const glb = readFileSync("agents/arthur/assets/village_sign_smithy.glb");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), null);
const root = gltf.scene;
let overall: { min: THREE.Vector3; max: THREE.Vector3 } | null = null;
let nodes = 0;
const meshes: Array<{ name: string; b: THREE.Box3 }> = [];
root.traverse((o: any) => {
    if (o.isMesh) {
        nodes++;
        const gb = new THREE.Box3().setFromObject(o);
        console.log(o.name.padEnd(28), "[",
            gb.min.x.toFixed(3), gb.min.y.toFixed(3), gb.min.z.toFixed(3), "]..[",
            gb.max.x.toFixed(3), gb.max.y.toFixed(3), gb.max.z.toFixed(3), "]");
        meshes.push({ name: o.name, b: gb });
        if (!overall) overall = { min: gb.min.clone(), max: gb.max.clone() };
        else overall.min.min(gb.min), overall.max.max(gb.max);
    }
});
console.log("mesh nodes:", nodes);
if (overall) console.log("sign-local bbox:", overall.min.toArray().map(n => +n.toFixed(3)), overall.max.toArray().map(n => +n.toFixed(3)));

// brace contact proof (bakery v6 chassis math, re-verified on THIS build):
// plate face x [0-0.03..0.03] wait — plate is box(0.06,0.3,0.24) at (0,2.3):
//   x [-0.03..0.03], y [2.15..2.45]
// arm is box(0.5,0.06,0.06) at (0.26,2.42): x [0.01..0.51], y [2.39..2.45]
// brace box(0.34,0.05,0.05) at (0.165,2.305) rot atan2(0.21,0.27):
//   half-len 0.17 along (cos t, sin t); ends at 0.165±0.17*cos, 2.305±0.17*sin
const t = Math.atan2(0.21, 0.27);
const c = Math.cos(t), s = Math.sin(t);
const e1 = { x: 0.165 + 0.17 * c, y: 2.305 + 0.17 * s };
const e2 = { x: 0.165 - 0.17 * c, y: 2.305 - 0.17 * s };
console.log("brace ends:", { top: e1, bottom: e2 });
const dxPlate = Math.abs(e2.x - 0.03), dyPlate = e2.y - 2.30;
console.log("bottom end vs plate face x=0.03:", dxPlate.toFixed(4), "from face; y", e2.y.toFixed(3), "inside plate band [2.15..2.45]:", e2.y >= 2.15 && e2.y <= 2.45);
console.log("top end vs arm underside y=2.39:", (2.39 - e1.y).toFixed(4), "below underside (positive=overlap/attached):", 2.39 - e1.y >= -0.001);
console.log("top end x", e1.x.toFixed(3), "within arm span [0.01..0.51]:", e1.x >= 0.01 && e1.x <= 0.51);
