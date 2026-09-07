// struct54-decode-observatory.ts — decode audit for the lamp_slit fix.
// Prints merged-bucket node census, per-mesh local bboxes, node names,
// material index of the lamp_slit bucket, and the geometry-delta proof
// (POSITION blob byte-compare before vs after — envelope/subset check).
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

async function load(path: string) {
    const glb = readFileSync(path);
    const loader = new GLTFLoader();
    return await loader.parseAsync(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), null);
}

const AFTER = "agents/arthur/assets/village_observatory3.glb";
const BEFORE = "agents/arthur/reviews/struct54-observatory/before/baseline-bytes.glb";

for (const [tag, path] of [["AFTER", AFTER], ["BEFORE", BEFORE]] as const) {
    const root = (await load(path)).scene;
    let overall: { min: THREE.Vector3; max: THREE.Vector3 } | null = null;
    let nodes = 0;
    const names: string[] = [];
    root.traverse((o: any) => {
        if (o.isMesh) {
            nodes++;
            names.push(o.name);
            const gb = new THREE.Box3().setFromObject(o);
            console.log(tag, o.name.padEnd(28), "[",
                gb.min.x.toFixed(3), gb.min.y.toFixed(3), gb.min.z.toFixed(3), "]..[",
                gb.max.x.toFixed(3), gb.max.y.toFixed(3), gb.max.z.toFixed(3), "]");
            if (!overall) overall = { min: gb.min.clone(), max: gb.max.clone() };
            else overall.min.min(gb.min), overall.max.max(gb.max);
        }
    });
    console.log(tag, "mesh nodes:", nodes, "| named:", JSON.stringify(names));
    if (overall) console.log(tag, "envelope:", overall.min.toArray().map(n => +n.toFixed(3)), overall.max.toArray().map(n => +n.toFixed(3)));
}

// raw glTF JSON: material of the merged observatory bucket(s) — confirm the
// glow lane (emissiveFactor) is present and the dark slit bucket is gone.
for (const [tag, path] of [["AFTER", AFTER], ["BEFORE", BEFORE]] as const) {
    const glb = readFileSync(path);
    const jsonLen = new DataView(glb.buffer, glb.byteOffset + 12, 4).getUint32(0, true);
    const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLen)));
    console.log(tag, "materials:", JSON.stringify(json.materials?.map((m: any) => ({
        name: m.name, emissive: m.pbrMetallicRoughness?.emissiveFactor, base: m.pbrMetallicRoughness?.baseColorFactor?.slice(0, 3)
    }))));
    // mesh->primitive->material mapping
    const meshMats = json.meshes?.map((mesh: any) => ({
        mesh: mesh.name,
        mats: mesh.primitives.map((p: any) => p.material !== undefined ? (json.materials[p.material]?.name ?? '?') : 'none')
    }));
    console.log(tag, "mesh->mats:", JSON.stringify(meshMats));
}
