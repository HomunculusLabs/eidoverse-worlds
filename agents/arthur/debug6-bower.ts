// debug6-bower.ts — layer isolation: sidePos → Float32BufferAttribute →
// (a) attribute readback, (b) toGLB single mesh readback, (c) mergekit +
// toGLB readback. Find the layer that swaps the 6th vertex's z.
import { writeFileSync, readFileSync } from "node:fs";
import * as THREE from "three";
import { toGLB, texMat } from "./assets/glbwrite.ts";
import { mergeByMaterial } from "./assets/mergekit.ts";

type P2 = [number, number];
const poly: P2[] = [[0.2250, -0.3663], [0.2250, 0.1457], [0.0339, 0.2892], [-0.1965, 0.2462]];
const yTop = 2.90, yBot = 2.24;
const sidePos: number[] = [];
for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    sidePos.push(a[0], yTop, a[1], b[0], yTop, b[1], a[0], yBot, a[1]);
    sidePos.push(b[0], yTop, b[1], b[0], yBot, b[1], a[0], yBot, a[1]);
}
// (a) attribute readback
const attr = new THREE.Float32BufferAttribute(sidePos, 3);
console.log(`(a) attribute: ${attr.count} verts; i5 = (${attr.getX(5)}, ${attr.getY(5)}, ${attr.getZ(5)}) expect (0.2250, 2.24, -0.3663)`);
let bad = 0;
for (let i = 0; i < attr.count; i++) {
    const j = Math.floor(i / 6), e = j % poly.length;
    const a = poly[e], b = poly[(e + 1) % poly.length];
    const exp = [[a[0], yTop, a[1]], [b[0], yTop, b[1]], [a[0], yBot, a[1]], [b[0], yTop, b[1]], [b[0], yBot, b[1]], [a[0], yBot, a[1]]][i % 6];
    if (Math.abs(attr.getX(i) - exp[0]) > 1e-6 || Math.abs(attr.getZ(i) - exp[2]) > 1e-6) { bad++; if (bad < 4) console.log(`  attr BAD i${i}: got (${attr.getX(i)},${attr.getY(i)},${attr.getZ(i)}) want (${exp})`); }
}
console.log(`(a) attribute bad verts: ${bad}`);
// (b) toGLB single mesh, no merge
const darkTex = texMat("vw_dark", [0x3c3a32, 0x444138, 0x34322c], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 10, seed: 7701 });
{
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(sidePos, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, darkTex);
    const g2 = new THREE.Group(); g2.add(mesh);
    const buf = toGLB(g2);
    writeFileSync("/tmp/bower-min.glb", buf);
    const bytes = readFileSync("/tmp/bower-min.glb");
    const jl = bytes.readUInt32LE(12); const BIN = 20 + jl + 8;
    const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
    const views = j.bufferViews ?? [];
    const acc = j.accessors.find((a: any) => a.type === "VEC3" && a.count === sidePos.length / 3);
    const bv = views[acc.bufferView]; const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    let badB = 0;
    for (let i = 0; i < acc.count; i++) {
        const p = BIN + off + i * 12;
        const jj = Math.floor(i / 6), e = jj % poly.length;
        const a = poly[e], b = poly[(e + 1) % poly.length];
        const exp = [[a[0], yTop, a[1]], [b[0], yTop, b[1]], [a[0], yBot, a[1]], [b[0], yTop, b[1]], [b[0], yBot, b[1]], [a[0], yBot, a[1]]][i % 6];
        if (Math.abs(bytes.readFloatLE(p) - exp[0]) > 1e-6 || Math.abs(bytes.readFloatLE(p + 8) - exp[2]) > 1e-6) { badB++; if (badB < 4) console.log(`  (b) BAD i${i}: got (${bytes.readFloatLE(p)},${bytes.readFloatLE(p + 4)},${bytes.readFloatLE(p + 8)}) want (${exp})`); }
    }
    console.log(`(b) toGLB-only bad verts: ${badB}`);
}
// (c) mergekit + toGLB
{
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(sidePos, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, darkTex);
    const g3 = new THREE.Group(); g3.add(mesh);
    const merged = mergeByMaterial(g3, "t");
    const buf = toGLB(merged);
    writeFileSync("/tmp/bower-min-merged.glb", buf);
    const bytes = readFileSync("/tmp/bower-min-merged.glb");
    const jl = bytes.readUInt32LE(12); const BIN = 20 + jl + 8;
    const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
    const views = j.bufferViews ?? [];
    // find the dark material's primitive
    outer: for (const n of j.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j.meshes[n.mesh].primitives) {
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView]; const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            let badC = 0;
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                const jj = Math.floor(i / 6), e = jj % poly.length;
                const a = poly[e], b = poly[(e + 1) % poly.length];
                const exp = [[a[0], yTop, a[1]], [b[0], yTop, b[1]], [a[0], yBot, a[1]], [b[0], yTop, b[1]], [b[0], yBot, b[1]], [a[0], yBot, a[1]]][i % 6];
                if (Math.abs(bytes.readFloatLE(p) - exp[0]) > 1e-6 || Math.abs(bytes.readFloatLE(p + 8) - exp[2]) > 1e-6) { badC++; if (badC < 4) console.log(`  (c) BAD i${i}: got (${bytes.readFloatLE(p)},${bytes.readFloatLE(p + 4)},${bytes.readFloatLE(p + 8)}) want (${exp})`); }
            }
            console.log(`(c) mergekit+toGLB prim (mat ${j.materials[prim.material]?.name}, ${acc.count} verts) bad: ${badC}`);
            break outer;
        }
    }
}
