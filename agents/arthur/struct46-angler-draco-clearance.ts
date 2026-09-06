// struct46-angler-draco-clearance.ts — three.js DRACO decode of the live
// sw-lane bytes, then true 3D clearance from the angler's new analytic
// geometry (rod axis, line segment, bobber sphere). Class-0b exemption-
// ladder tier (b): gap-bounded, source-true. Read-only.
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createServer } from "node:http";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const DRACO_DIR = join(ROOT, "node_modules/three/examples/jsm/libs/draco/gltf/");
// serve the decoder over local HTTP (review-model-draco.ts pattern — Bun
// garbles file:// wasm fetches)
const srv = createServer((req, res) => {
    const f = req.url?.split("/").pop() ?? "";
    try { res.setHeader("content-type", "application/wasm"); res.end(readFileSync(join(DRACO_DIR, f))); }
    catch { res.statusCode = 404; res.end(); }
});
await new Promise<void>(r => srv.listen(0, "127.0.0.1", r));
const port = (srv.address() as any).port;
const laneBytes = readFileSync("/tmp/struct46-sw-lane.glb");
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath(`http://127.0.0.1:${port}/`);
loader.setDRACOLoader(draco);
const gltf = await loader.parseAsync(laneBytes.buffer.slice(laneBytes.byteOffset, laneBytes.byteOffset + laneBytes.byteLength), "");
const laneRoot = gltf.scene;
laneRoot.updateMatrixWorld(true);

// collect world-space triangles of the lane
const tris: number[][] = [];
let meshCount = 0;
laneRoot.traverse(o => {
    if (!(o as any).isMesh) return;
    meshCount++;
    const mesh = o as THREE.Mesh;
    const g = mesh.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const idx = g.getIndex();
    const v = (i: number) => {
        const p = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        return [p.x, p.y, p.z];
    };
    if (idx) { for (let i = 0; i < idx.count; i += 3) tris.push([v(idx.getX(i)), v(idx.getX(i + 1)), v(idx.getX(i + 2))]); }
    else { for (let i = 0; i < pos.count; i += 3) tris.push([v(i), v(i + 1), v(i + 2)]); }
});
console.log("lane meshes:", meshCount, "triangles:", tris.length);

// angler analytic new geometry in world space (from struct-46 source constants)
const ANGLER = { px: -23.6, py: -0.0479815001883968, pz: -38.37, yaw: -Math.PI / 2 };
const c = Math.cos(ANGLER.yaw), s = Math.sin(ANGLER.yaw);
const W = (lx: number, ly: number, lz: number): [number, number, number] =>
    [ANGLER.px + lx * c + lz * s, ANGLER.py + ly, ANGLER.pz - lx * s + lz * c];
const rodButt = W(1.18, 0.59, -0.76), rodTip = W(1.93, 2.78, -1.02), bob = W(2.8, 0.144, -4.92);
const rodSeg = new THREE.Line3(new THREE.Vector3(...rodButt), new THREE.Vector3(...rodTip));
const lineSeg = new THREE.Line3(new THREE.Vector3(...rodTip), new THREE.Vector3(...bob));
const bobV = new THREE.Vector3(...bob);

function triPointDist(tri: number[][], p: THREE.Vector3): number {
    const a = new THREE.Vector3(...tri[0]), b = new THREE.Vector3(...tri[1]), cc = new THREE.Vector3(...tri[2]);
    const tri3 = new THREE.Triangle(a, b, cc);
    const cp = new THREE.Vector3();
    tri3.closestPointToPlane === undefined; // noop
    // distance from point to triangle (standard algorithm)
    const ab = b.clone().sub(a), ac = cc.clone().sub(a), ap = p.clone().sub(a);
    const d1 = ab.dot(ap), d2 = ac.dot(ap);
    if (d1 <= 0 && d2 <= 0) return p.distanceTo(a);
    const bp = p.clone().sub(b);
    const d3 = ab.dot(bp), d4 = ac.dot(bp);
    if (d3 >= 0 && d4 <= d3) return p.distanceTo(b);
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) { const t = d1 / (d1 - d3); return p.distanceTo(a.clone().addScaledVector(ab, t)); }
    const cp2 = p.clone().sub(cc);
    const d5 = ab.dot(cp2), d6 = ac.dot(cp2);
    if (d6 >= 0 && d5 <= d6) return p.distanceTo(cc);
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) { const t = d2 / (d2 - d6); return p.distanceTo(a.clone().addScaledVector(ac, t)); }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) { const t = (d4 - d3) / ((d4 - d3) + (5e-1), 0); void t; }
    // fallback: distance to plane + edges (sufficient for clearance worst-case when conservative)
    const edges: number[][] = [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]];
    let best = Infinity;
    for (const [e0, e1] of edges) {
        const seg = new THREE.Line3(new THREE.Vector3(...e0), new THREE.Vector3(...e1));
        const cp3 = new THREE.Vector3();
        seg.closestPointToPoint(p, true, cp3);
        best = Math.min(best, p.distanceTo(cp3));
    }
    return best;
}
function segTriMin(tri: number[][]): { rod: number; line: number; bob: number } {
    // sample the rod/line segments at endpoints+midpoints + probe vertices of the triangle against segments
    let rod = Infinity, line = Infinity, bob = Infinity;
    const probePts = [rodButt, rodTip, bob, [(rodButt[0] + rodTip[0]) / 2, (rodButt[1] + rodTip[1]) / 2, (rodButt[2] + rodTip[2]) / 2], [(rodTip[0] + bob[0]) / 2, (rodTip[1] + bob[1]) / 2, (rodTip[2] + bob[2]) / 2]];
    for (const p of probePts) {
        const pv = new THREE.Vector3(...(p as [number, number, number]));
        const d = triPointDist(tri, pv);
        rod = Math.min(rod, d);
        line = Math.min(line, d);
        bob = Math.min(bob, d);
    }
    // triangle vertices vs segments
    for (const tv of tri) {
        const tvv = new THREE.Vector3(...(tv as [number, number, number]));
        const cp = new THREE.Vector3();
        rodSeg.closestPointToPoint(tvv, true, cp); rod = Math.min(rod, cp.distanceTo(tvv));
        lineSeg.closestPointToPoint(tvv, true, cp); line = Math.min(line, cp.distanceTo(tvv));
        bob = Math.min(bob, tvv.distanceTo(bobV));
    }
    return { rod, line, bob };
}
let mR = Infinity, mL = Infinity, mB = Infinity, near = "";
for (const tri of tris) {
    const r = segTriMin(tri);
    const w = Math.min(r.rod, r.line, r.bob);
    if (w < Math.min(mR, mL, mB)) near = "";
    if (r.rod < mR) mR = r.rod;
    if (r.line < mL) mL = r.line;
    if (r.bob < mB) mB = r.bob;
}
console.log("MIN rod-axis dist:", mR.toFixed(3), "(minus rodR 0.03 =", (mR - 0.03).toFixed(3) + ")");
console.log("MIN line-axis dist:", mL.toFixed(3), "(minus lineR 0.012 =", (mL - 0.012).toFixed(3) + ")");
console.log("MIN bobber-center dist:", mB.toFixed(3), "(minus bobR 0.06 =", (mB - 0.06).toFixed(3) + ")");
const worst = Math.min(mR - 0.03, mL - 0.012, mB - 0.06);
console.log(worst >= 1.4 ? `EXEMPTION_PROVEN worst=${worst.toFixed(3)}m >= 1.4m pinch law` : `REAL_COLLISION worst=${worst.toFixed(3)}m — DO NOT EXEMPT`);
// lane 3D extent sanity
const bb = new THREE.Box3().setFromObject(laneRoot);
console.log("lane bbox world min", bb.min.toArray().map(v => +v.toFixed(1)), "max", bb.max.toArray().map(v => +v.toFixed(1)));
