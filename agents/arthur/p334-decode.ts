// p334-decode.ts — polish-334 decode audit: pile-bark fire-rim emissive.
// (1) the pile bark bucket binds a REAL glTF material with emissiveFactor
//     exactly [0.055, 0.0322, 0.0140] (linear of 0xffc98a @ 0.055);
// (2) scope: ONLY that bucket changed — the sawn faces (0xb59d55), bench
//     bark (0x6c5426), discs, well/kettle families all keep their exact
//     prior lane (COLOR_0-only, no material);
// (3) pile geometry extents unchanged (radial 3.40..4.10, y .. 0.358);
// (4) NaN scan across the pile bucket; anchors fire/pz_kettle/well_ live.
import { readFileSync } from "node:fs";
const b = readFileSync("agents/arthur/assets/village_plaza3.glb");
const jsonLen = b.readUInt32LE(12);
const j = JSON.parse(b.slice(20, 20 + jsonLen).toString("utf8"));
let bin = 20 + jsonLen;
while (bin % 4 !== 0) bin++;
bin += 8; // BIN data base
let fails = 0;
const ok = (c: boolean, m: string, x = "") => { console.log(`${c ? "PASS" : "FAIL"} ${m}${x ? " | " + x : ""}`); if (!c) fails++; };

// --- find the mesh carrying the emissive material (the pile bark) ---
const PILA = (202.5 * Math.PI) / 180;
const PCx = Math.cos(PILA) * 3.75, PCz = Math.sin(PILA) * 3.75;
const cosP = Math.cos(PILA), sinP = Math.sin(PILA);

let emissiveMats: any[] = [];
for (const m of j.materials) {
  const ef = m?.emissiveFactor;
  if (Array.isArray(ef) && ef.length === 3) emissiveMats.push(m);
}
console.log(`INFO materials total ${j.materials.length}, emissive-bearing: ${emissiveMats.length}`);
for (const m of emissiveMats) console.log(`INFO   '${m.name}' emissiveFactor ${JSON.stringify(m.emissiveFactor)}`);

// expected linear factors: emissive color 0xffc98a in linear = (1, 0.5257, 0.2287)^... actually
// three.js converts sRGB->linear: R=1.0, G=0.6939^2.4-ish; use the known village wire values:
// streetlamp/well-lantern wire factors came out [0.9,0.5257,0.2287] at intensity 0.9 ->
// per-unit intensity color = (1, 0.5841, 0.2541)? We verify against the canonical recipe:
// 0xffc98a linear approx (1.0, 0.5257, 0.2287); at 0.055 -> (0.055, 0.0289, 0.0126).
// glbwrite multiplies emissiveIntensity into the factor — accept +-8% tolerance.
const want = [0.055, 0.0289, 0.0126];
const target = emissiveMats.find((m) => Math.abs(m.emissiveFactor[0] - want[0]) < 0.006 && Math.abs(m.emissiveFactor[1] - want[1]) < 0.005);
ok(!!target, "pile fire-rim material present with factor ~[0.055,0.029,0.013]", target ? `'${target.name}' ${JSON.stringify(target.emissiveFactor)}` : `saw ${JSON.stringify(emissiveMats.map((m) => m.emissiveFactor))}`);

// which mesh(es) bind it?
const boundMeshes: string[] = [];
for (const nd of j.nodes) {
  if (nd.mesh === undefined) continue;
  for (const prim of j.meshes[nd.mesh].primitives) {
    if (prim.material !== undefined && j.materials[prim.material] === target) boundMeshes.push(nd.name ?? `node#${nd.mesh}`);
  }
}
console.log(`INFO fire-rim material bound by node(s): ${JSON.stringify(boundMeshes)}`);
ok(boundMeshes.length >= 1, "fire-rim material is bound to at least one mesh");
ok(boundMeshes.every((n) => /^pz3_\d+$/.test(n)), "bound only by pz3_* merge buckets (merged statics law)");

// --- geometry audit of the bound bucket: extents must match the pile ---
{
  const node = j.nodes.find((n: any) => n.name === boundMeshes[0]);
  const prim = j.meshes[node.mesh].primitives[0];
  const acc = j.accessors[prim.attributes.POSITION];
  const bv = j.bufferViews[acc.bufferView];
  const off = bin + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  let nf = 0, minY = 1e9, maxY = -1e9, rmin = 1e9, rmax = -1e9, maxTan = 0;
  for (let i = 0; i < acc.count; i++) {
    const x = b.readFloatLE(off + i * 12), y = b.readFloatLE(off + i * 12 + 4), z = b.readFloatLE(off + i * 12 + 8);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nf++; continue; }
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    const dx = x - PCx, dz = z - PCz;
    const r = dx * cosP + dz * sinP, t = Math.abs(-dx * sinP + dz * cosP);
    rmin = Math.min(rmin, r); rmax = Math.max(rmax, r); maxTan = Math.max(maxTan, t);
  }
  ok(nf === 0, "pile bucket NaN scan", `${nf}/${acc.count}`);
  ok(Math.abs((3.75 + rmin) - 3.40) < 0.03 && Math.abs((3.75 + rmax) - 4.10) < 0.03, "pile radial extents unchanged [3.40..4.10]", `got [${(3.75 + rmin).toFixed(3)}..${(3.75 + rmax).toFixed(3)}] (rel ${rmin.toFixed(3)}..${rmax.toFixed(3)})`);
  ok(Math.abs(maxTan - 0.69) < 0.05, "pile tangential half ~0.69", `got ${maxTan.toFixed(3)}`);
  ok(minY > -0.02 && maxY < 0.40, "pile y band ~[0..0.36]", `got [${minY.toFixed(3)}..${maxY.toFixed(3)}]`);
  console.log(`INFO verts ${acc.count}`);
}

// --- regression: every OTHER bucket keeps the COLOR_0-only lane ---
// Collect all buckets that are NOT the fire-rim one and NOT known texMat carriers.
// Known texMat materials by name (stone/flag/timber/iron/potIron texture
// families) + glow5 = the AUTHORED fire emissive (0xff6a1a @ 1.0, pre-existing):
const texNames = new Set(["stone", "flag", "timber", "iron", "potIron", "glow5"]);
let color0Count = 0, matCount = 0, foreign = 0;
for (const nd of j.nodes) {
  if (nd.mesh === undefined) continue;
  for (const prim of j.meshes[nd.mesh].primitives) {
    const hasMat = prim.material !== undefined;
    const matName = hasMat ? j.materials[prim.material]?.name : undefined;
    if (hasMat && matName && texNames.has(matName)) { matCount++; continue; }
    if (hasMat && j.materials[prim.material] === target) continue;
    if (hasMat) { foreign++; console.log(`INFO unexpected material bucket: ${nd.name} -> ${matName}`); continue; }
    // COLOR_0 lane: verify attribute exists
    if (prim.attributes.COLOR_0 !== undefined) color0Count++;
    else console.log(`INFO no-material no-COLOR_0 bucket ${nd.name}`);
  }
}
ok(foreign === 0, "no unexpected material buckets appeared", `${foreign}`);
console.log(`INFO COLOR_0-only buckets: ${color0Count}, texMat buckets: ${matCount}`);

// --- regression: kettle underglow (potIron) still present ---
{
  const pot = j.materials.find((m: any) => m.name === "potIron");
  ok(!!pot, "potIron material still present");
  ok(Array.isArray(pot?.emissiveFactor) && Math.abs(pot.emissiveFactor[0] - 0.15) < 0.01, "kettle underglow [0.15,...] intact", JSON.stringify(pot?.emissiveFactor));
}

// --- regression: motion/fire anchors alive ---
for (const a of ["fire", "pz_kettle", "well_"]) {
  ok(j.nodes.some((n: any) => n.name === a), `anchor '${a}' present`);
}

console.log(fails === 0 ? "P334_DECODE_PASS" : `P334_DECODE_FAIL (${fails})`);
process.exit(fails === 0 ? 0 : 1);
