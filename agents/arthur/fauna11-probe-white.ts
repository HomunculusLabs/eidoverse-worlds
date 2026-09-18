import * as THREE from "three";
import { toGLB, mat } from "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/glbwrite.ts";
import { mergeByMaterial } from "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/mergekit.ts";
import { writeFileSync } from "node:fs";
// two boxes: left = plain mat path, right = baked ×1.25 like the geese
const g = new THREE.Group();
const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat(0xf2efe6, 0.95, 0));
a.position.set(-0.35, 0.2, 0); g.add(a);
const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat(0xf2efe6, 0.95, 0));
b.position.set(0.35, 0.25, 0);
const gg = new THREE.Group(); gg.add(b); gg.position.set(0,0,0); g.add(gg);
// bake ONLY the right box subtree, geese-style
gg.traverse(o => { if ((o as any).isMesh) { o.position.multiplyScalar(1.25); o.scale.multiplyScalar(1.25); } });
mergeByMaterial(g, "probe");
writeFileSync("/tmp/probe-white.glb", toGLB(g));
console.log("probe written");
