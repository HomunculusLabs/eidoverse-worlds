// debug5-bower.ts — dump ALL cell-0 dark verts in byte order (x,y,z), plus
// the same from a MINIMAL reproduction: one 8-gon prism through the exact mk
// prismMeshes path → toGLB, no mergekit. Isolates where pairing breaks.
import { readFileSync, writeFileSync } from "node:fs";
import * as THREE from "three";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_bower3.glb`);
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const views = j.bufferViews ?? [];
// first dark primitive = cell 0 sides
let printed = 0;
for (const n of j.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        if (j.materials[prim.material]?.name !== "vw_dark") continue;
        const acc = j.accessors[prim.attributes.POSITION];
        const bv = views[acc.bufferView];
        const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const t = n.translation ?? [0, 0, 0];
        console.log(`dark prim: count ${acc.count}`);
        for (let i = 0; i < acc.count && printed < 48; i++) {
            const p = BIN + off + i * 12;
            console.log(`  ${i}: (${bytes.readFloatLE(p).toFixed(4)}, ${bytes.readFloatLE(p + 4).toFixed(4)}, ${bytes.readFloatLE(p + 8).toFixed(4)})`);
            printed++;
        }
        break;
    }
    if (printed) break;
}
// ---- minimal reproduction: exact mk prismMeshes on the eye polygon, NO merge ----
type P2 = [number, number];
const poly: P2[] = [[0.2250, -0.3663], [0.2250, 0.1457], [0.0339, 0.2892], [-0.1965, 0.2462], [-0.3339, 0.0604], [-0.3229, -0.1679], [-0.1806, -0.3443], [0.0338, -0.4124]];
const yTop = 2.90, yBot = 2.24;
const sidePos: number[] = [];
for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    sidePos.push(a[0], yTop, a[1], b[0], yTop, b[1], a[0], yBot, a[1]);
    sidePos.push(b[0], yTop, b[1], b[0], yBot, b[1], a[0], yBot, a[1]);
}
console.log(`\nminimal push sequence, bottom verts (y=${yBot}) in order:`);
for (let i = 0; i < sidePos.length; i += 3) {
    if (Math.abs(sidePos[i + 1] - yBot) < 1e-9) console.log(`  (${sidePos[i].toFixed(4)}, ${sidePos[i + 1].toFixed(4)}, ${sidePos[i + 2].toFixed(4)})`);
}
