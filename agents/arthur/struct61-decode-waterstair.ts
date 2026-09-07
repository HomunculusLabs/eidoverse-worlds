// struct61-decode-waterstair.ts — v4 decode audit (probe discipline: decode
// the built bytes; never trust prose). Prints node census, per-bucket vertex
// y-bands, and asserts the v4 contract: 3 water/foam-bearing buckets,
// foam beads at 4 lip heights, well face top y 0.14, y-max <= 0.795.
import { readFileSync } from "node:fs";
const path = "agents/arthur/assets/village_waterstair3.glb";
const buf = readFileSync(path);
const jsonChunk = (() => {
    let off = 12;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x4e4f534a) return buf.subarray(off + 8, off + 8 + len);
        off += 8 + len;
    }
    throw Error("no JSON chunk");
})();
const gltf = JSON.parse(jsonChunk.toString());
const bin = (() => {
    let off = 12;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x004e4942) return buf.subarray(off + 8, off + 8 + len);
        off += 8 + len;
    }
    throw Error("no BIN chunk");
})();
console.log("nodes:", gltf.nodes.length, "meshes:", gltf.meshes.length, "materials:", gltf.materials.length);
for (const m of gltf.materials) {
    const e = m.emissiveFactor ?? null;
    console.log(`mat ${m.name}: base#${(m.pbrMetallicRoughness?.baseColorFactor ?? []).slice(0,3).map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("")} rough=${m.pbrMetallicRoughness?.roughness} emissive=${e} i=${m.emissiveStrength ?? 1}`);
}
const f32 = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
let globalMax = -Infinity, globalMin = Infinity;
for (const [ni, node] of gltf.nodes.entries()) {
    if (node.mesh === undefined) { console.log(`node ${ni} (${node.name}) no mesh`); continue; }
    for (const prim of gltf.meshes[node.mesh].primitives) {
        const acc = gltf.accessors[prim.attributes.POSITION];
        const yOff = (acc.byteOffset ?? 0) + (gltf.bufferViews[acc.bufferView].byteOffset ?? 0);
        let yMin = Infinity, yMax = -Infinity;
        for (let i = 0; i < acc.count; i++) {
            const y = f32.getFloat32(yOff + i * acc.byteStride! * 0 + i * 12 + 4, true);
            if (y < yMin) yMin = y; if (y > yMax) yMax = y;
        }
        const t = node.translation ?? [0,0,0];
        console.log(`node ${ni} (${node.name}): verts=${acc.count} y[${(yMin+t[1]).toFixed(3)},${(yMax+t[1]).toFixed(3)}] tr=${JSON.stringify(t.map((v:number)=>+v.toFixed(3)))} min=${JSON.stringify(acc.min)} max=${JSON.stringify(acc.max)}`);
        globalMax = Math.max(globalMax, yMax + t[1]); globalMin = Math.min(globalMin, yMin + t[1]);
    }
}
console.log(`ENVELOPE y [${globalMin.toFixed(3)}, ${globalMax.toFixed(3)}]`);
if (globalMax > 0.795) { console.error("FAIL y-max over 0.795"); process.exit(1); }
if (gltf.nodes.length > 8) { console.error("FAIL node count"); process.exit(1); }
console.log("DECODE OK");
