// struct177-env-clebsch.ts — literal local-frame envelope min/max from the
// banked Clebsch GLB (placement-contract law: derive the placement tuple from
// the TRUE decoded footprint, not prose). Scheme = struct176-decode's verified
// identity-translation law: all nodes carry translation-only TRS (identity
// rotation/scale, asserted here), accessor min/max + node translation.
import { readFileSync } from "node:fs";
const path = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_clebsch3.glb";
const buf = readFileSync(path);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
let meshes = 0, badTRS = 0;
const walk = (idx: number) => {
    const n = json.nodes[idx];
    const q = n.rotation, s = n.scale, m = n.matrix;
    const identityQ = !q || (q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 1);
    const identityS = !s || (s[0] === 1 && s[1] === 1 && s[2] === 1);
    if (!identityQ || !identityS || m) badTRS++;
    if (n.mesh === undefined) { for (const c of n.children ?? []) walk(c); return; }
    meshes++;
    const t = n.translation ?? [0, 0, 0];
    for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        minX = Math.min(minX, acc.min[0] + t[0]); maxX = Math.max(maxX, acc.max[0] + t[0]);
        minY = Math.min(minY, acc.min[1] + t[1]); maxY = Math.max(maxY, acc.max[1] + t[1]);
        minZ = Math.min(minZ, acc.min[2] + t[2]); maxZ = Math.max(maxZ, acc.max[2] + t[2]);
    }
    for (const c of n.children ?? []) walk(c);
};
for (const r of json.scenes[json.scene ?? 0].nodes ?? []) walk(r);
const CX = (minX + maxX) / 2, CZ = (minZ + maxZ) / 2;
console.log(`mesh nodes: ${meshes}, non-t-only TRS nodes: ${badTRS} (must be 0)`);
console.log(`literal envelope min [${minX.toFixed(4)}, ${minY.toFixed(4)}, ${minZ.toFixed(4)}] max [${maxX.toFixed(4)}, ${maxY.toFixed(4)}, ${maxZ.toFixed(4)}]`);
console.log(`size [${(maxX - minX).toFixed(4)}, ${(maxY - minY).toFixed(4)}, ${(maxZ - minZ).toFixed(4)}]  HX=${((maxX - minX) / 2).toFixed(4)} HZ=${((maxZ - minZ) / 2).toFixed(4)}`);
console.log(`bbox center CX=${CX.toFixed(4)} CZ=${CZ.toFixed(4)} (symmetric iff both 0)`);
if (badTRS !== 0) { console.log("FAIL non-t-only TRS present"); process.exit(1); }
if (Math.abs(CX) > 1e-9 || Math.abs(CZ) > 1e-9) { console.log("FAIL asymmetric footprint — placement must carry offset"); process.exit(1); }
console.log("PASS symmetric footprint (CX=CZ=0) — origin-centered SAT lawful");
