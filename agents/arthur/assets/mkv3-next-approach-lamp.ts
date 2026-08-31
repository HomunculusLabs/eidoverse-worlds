// mkv3-next-approach-lamp.ts — commons-next four-way approach lamp model.
// One coherent lamp at local origin, instanced as four entities at cardinal r=10.
// Local +Z is the inward-facing crossarm/lantern direction; each seat yaws it
// toward the hearth. Companion light entities are placed separately.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { toGLB } from "./glbwrite.ts";

const g = new THREE.Group();
const iron = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const glow = new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffa45f), emissiveIntensity: 1.25, roughness: 0.4 });
const add = (o: THREE.Object3D, name: string) => { o.name = name; g.add(o); };

// Grounded tapered post and foot.
const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.10, 10), iron); foot.position.y = 0.05; add(foot, "al_foot");
const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 2.30, 8), iron); post.position.y = 1.15; add(post, "al_post");
const collar = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 5, 10), iron); collar.rotation.x = Math.PI / 2; collar.position.y = 2.20; add(collar, "al_collar");
// polish-280: the post above the crossarm ended in a bare flat cut — the
// unfinished-crown class. Small brass finial spike caps the summit (accepted
// crown language at lamp scale; iron post, brass cap — material truth).
const postFinial = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.26, 8), new THREE.MeshStandardMaterial({ color: 0xa0a248, roughness: 0.4, metalness: 0.6 }));
postFinial.position.y = 2.30 + 0.13; add(postFinial, "al_post_finial");

// nvp-9 visual gate: the one-sided inward lantern disappeared exactly behind
// the post from the OUTWARD approach — the direction this object must greet.
// Use a true transverse crossarm with twin lanterns, both biased 0.10m inward.
// The pair reads from every direction and still marks the centerward side.
const arm = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.07, 0.07), iron); arm.position.set(0, 2.28, 0.10); add(arm, "al_arm");
const braceL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6), iron); braceL.position.set(-0.10, 2.10, 0.16); braceL.rotation.z = -0.50; add(braceL, "al_brace_l");
const braceR = braceL.clone(); braceR.position.x = 0.10; braceR.rotation.z = 0.50; add(braceR, "al_brace_r");

// Twin lantern cages around warm emissive globes. Same materials merge to the
// same two draw buckets as the one-lantern draft.
for (const [side, lx] of [["l", -0.29], ["r", 0.29]] as const) {
  const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6), iron); hanger.position.set(lx, 2.12, 0.10); add(hanger, `al_hanger_${side}`);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), glow); core.position.set(lx, 1.96, 0.10); add(core, `al_lamp_${side}`);
  for (const [i, x, z] of [[0,-0.11,-0.08],[1,0.11,-0.08],[2,-0.11,0.08],[3,0.11,0.08]] as const) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.30, 0.025), iron); bar.position.set(lx + x, 1.96, 0.10 + z); add(bar, `al_cage_${side}_${i}`);
  }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.06, 8), iron); top.position.set(lx, 2.13, 0.10); add(top, `al_top_${side}`);
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.055, 8), iron); pan.position.set(lx, 1.79, 0.10); add(pan, `al_pan_${side}`);
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 6), iron); finial.position.set(lx, 2.23, 0.10); add(finial, `al_finial_${side}`);
}

mergeByMaterial(g, "al3");
writeFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_approach_lamp.glb", toGLB(g));
console.log(`village_approach_lamp.glb — ${g.children.length} nodes`);
