// improve34-audit-longhouse.ts — post-build audit on the NEW village_longhouse3.glb.
// Checks: rockfoot material present, panes proud of wall faces, outer posts
// grade-to-slab, chimney replaced (no pot/rim; stoneTex boxes), b19 slab-band
// vert differential vs the banked baseline, envelope subset-or-equal.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const NEW = `${ROOT}/agents/arthur/assets/village_longhouse3.glb`;
const OLD = `${ROOT}/agents/arthur/reviews/improve34-longhouse/before/baseline-e3adcd3d.glb`;

async function load(path: string) {
  const bytes = readFileSync(path);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(Buffer.from(bytes.buffer, bytes.byteOffset + 20, jsonLen).toString("utf8"));
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  return { sha, json, root: gltf.scene };
}

const scene = await load(NEW);
console.log("new sha256", scene.sha);

const mats: string[] = (scene.json.materials ?? []).map((m: any) => m.name);
console.log("materials:", JSON.stringify(mats));
if (!mats.includes("rockfoot")) { console.error("FAIL: rockfoot material missing"); process.exit(1); }
let primTotal = 0, primNoMat = 0;
for (const m of scene.json.meshes ?? []) for (const p of m.primitives ?? []) { primTotal++; if (p.material === undefined) primNoMat++; }
console.log(`primitives: ${primTotal} total, ${primNoMat} material-less`);

scene.root.updateMatrixWorld(true);
// collect world verts of new mesh + envelope
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
const zoneCounts: Record<string, number> = {
  porch_outpost_e: 0, porch_outpost_w: 0,
  chim_masonry: 0, chim_pot_zone: 0,
  n_pane_proud: 0, w_pane_zone: 0, e_pane_zone: 0,
  b19_slab_band: 0, door_lane_band: 0,
};
const inOutpost = (x: number, y: number, z: number, sx: number) =>
  Math.abs(x - sx) <= 0.06 && y >= -0.01 && y <= 2.37 && Math.abs(z - 3.75) <= 0.06;
const v = new THREE.Vector3();
scene.root.traverse((o: any) => {
  if (!o.isMesh) return;
  const pos = o.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < pos.length; i += 3) {
    v.set(pos[i], pos[i + 1], pos[i + 2]).applyMatrix4(o.matrixWorld);
    if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
    if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;
    if (inOutpost(v.x, v.y, v.z, 1.72)) zoneCounts.porch_outpost_e++;
    if (inOutpost(v.x, v.y, v.z, -1.72)) zoneCounts.porch_outpost_w++;
    if (x1(v, -2.0) && v.z >= -0.5 && v.z <= 0.5 && v.y >= 3.85 && v.y <= 5.20) zoneCounts.chim_masonry++;
    if (x1(v, -2.0) && v.z >= -0.25 && v.z <= 0.25 && v.y >= 5.20) zoneCounts.chim_pot_zone++;
    if (v.z <= -2.505 && v.z >= -2.62 && Math.abs(v.x) <= 3.0 && v.y >= 1.25 && v.y <= 2.15) zoneCounts.n_pane_proud++;
    if (v.x <= -4.26 && v.x >= -4.40 && v.z >= -1.75 && v.z <= -0.65 && v.y >= 1.25 && v.y <= 2.15) zoneCounts.w_pane_zone++;
    if (v.x >= 4.26 && v.x <= 4.40 && v.z >= 0.65 && v.z <= 1.75 && v.y >= 1.25 && v.y <= 2.15) zoneCounts.e_pane_zone++;
    // b19 anchor surface band: the porch slab plane near x 0
    if (Math.abs(v.x) <= 0.7 && v.y >= 1.85 && v.y <= 2.45 && v.z >= 2.7 && v.z <= 4.4) zoneCounts.b19_slab_band++;
    // front door lane (|x|<=0.75, z 2.3..4.5, y 0..2.1) must stay clear of NEW solids
    if (Math.abs(v.x) <= 0.75 && v.z >= 2.3 && v.z <= 4.5 && v.y >= 0.0 && v.y <= 2.05) zoneCounts.door_lane_band++;
  }
});
function x1(v: THREE.Vector3, t: number) { return Math.abs(v.x - t) <= 0.55; }
console.log("envelope:", JSON.stringify({ minX: +minX.toFixed(3), maxX: +maxX.toFixed(3), minY: +minY.toFixed(3), maxY: +maxY.toFixed(3), minZ: +minZ.toFixed(3), maxZ: +maxZ.toFixed(3) }));
console.log("zone counts:", JSON.stringify(zoneCounts));

// baseline differential for the slab band
const old = await load(OLD);
old.root.updateMatrixWorld(true);
let oldSlab = 0, oldDoorLane = 0;
old.root.traverse((o: any) => {
  if (!o.isMesh) return;
  const pos = o.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < pos.length; i += 3) {
    v.set(pos[i], pos[i + 1], pos[i + 2]).applyMatrix4(o.matrixWorld);
    if (Math.abs(v.x) <= 0.7 && v.y >= 1.85 && v.y <= 2.45 && v.z >= 2.7 && v.z <= 4.4) oldSlab++;
    if (Math.abs(v.x) <= 0.75 && v.z >= 2.3 && v.z <= 4.5 && v.y >= 0.0 && v.y <= 2.05) oldDoorLane++;
  }
});
console.log("baseline slab-band verts:", oldSlab, " door-lane verts:", oldDoorLane);

// verdicts
const fails: string[] = [];
if (zoneCounts.porch_outpost_e < 8) fails.push("outpost_e missing");
if (zoneCounts.porch_outpost_w < 8) fails.push("outpost_w missing");
if (zoneCounts.chim_masonry < 24) fails.push("chimney masonry missing");
if (zoneCounts.chim_pot_zone !== 0) fails.push("geometry still above y 5.20 (pot/rim class)");
if (maxY > 5.369 + 0.001) fails.push(`y envelope grew: ${maxY}`);
if (Math.abs(maxX - 4.7) > 0.001 || Math.abs(minX + 4.7) > 0.001) fails.push(`x envelope changed: ${minX}..${maxX}`);
if (Math.abs(maxZ - 4.301) > 0.001 || Math.abs(minZ + 2.923) > 0.001) fails.push(`z envelope changed: ${minZ}..${maxZ}`);
if (zoneCounts.b19_slab_band !== oldSlab) fails.push(`b19 slab band changed: ${oldSlab} -> ${zoneCounts.b19_slab_band}`);
if (zoneCounts.door_lane_band !== oldDoorLane) fails.push(`door lane changed: ${oldDoorLane} -> ${zoneCounts.door_lane_band}`);
if (zoneCounts.n_pane_proud < 8) fails.push("N panes not proud");
if (zoneCounts.w_pane_zone < 8 || zoneCounts.e_pane_zone < 8) fails.push("flank window zones empty");
if (fails.length) { console.error("AUDIT FAIL:", fails.join("; ")); process.exit(1); }
console.log("AUDIT ALL PASS");
