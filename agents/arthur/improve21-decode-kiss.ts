// improve21-decode-kiss.ts — R-121 re-derivation on LIVE bytes (post-improve-19).
// R-121's 9mm kiss was decoded against the OLD solid-plate mapboard
// (1f1a10f4, z-ext 2.63). improve-19 replaced it with a 4-bar border frame
// (95231f20, z-ext 0.543). Before any lamp-n move: re-derive true clearance
// against the CURRENT mapboard, at the current pose and spoke-shift
// candidates. Also checks the b26 wayband rider volume against the mapboard
// (rider stays put if the lamp stays put).
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const LAMP = "agents/arthur/assets/village_approach_lamp.glb";      // 18b69a6bb2f5862f == live
const MAPB = "agents/arthur/assets/village_mapboard3.glb";          // 95231f20a016b303 == live

// live tuples (census 2026-09-06, this tick)
const MAPB_T = { pos: [2.5, 0, 9.5], yaw: -2.944197 };
const LAMP_T = { pos: [1.75, 0, 10], yaw: -Math.PI / 2 }; // current
// rider b26 concentric at (1.75, 1.5, 10), yaw -pi/2, bbox 0.25x0.42x0.25

async function worldVerts(p: string, pos: number[], yaw: number) {
    const bytes = readFileSync(p);
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const out: number[][] = [];
    scene.traverse((o: any) => {
        if (!o.isMesh) return;
        const geom = o.geometry as THREE.BufferGeometry;
        const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
            v.fromBufferAttribute(posAttr, i).applyMatrix4(o.matrixWorld);
            // local -> world: wx = px + lx*cos - lz*sin ; wz = pz + lx*sin + lz*cos (village convention)
            out.push([
                pos[0] + v.x * Math.cos(yaw) - v.z * Math.sin(yaw),
                pos[1] + v.y,
                pos[2] + v.x * Math.sin(yaw) + v.z * Math.cos(yaw),
            ]);
        }
    });
    return out;
}

function minDist(a: number[][], b: number[][], band?: [number, number]) {
    let best = Infinity; let pa: number[] | null = null; let pb: number[] | null = null;
    const A = band ? a.filter(v => v[1] >= band[0] && v[1] <= band[1]) : a;
    for (const va of A) {
        for (const vb of b) {
            const d = Math.hypot(va[0] - vb[0], va[1] - vb[1], va[2] - vb[2]);
            if (d < best) { best = d; pa = va; pb = vb; }
        }
    }
    return { best, pa, pb };
}

const q = (n: number) => Math.round(n * 1000) / 1000;

const mapb = await worldVerts(MAPB, MAPB_T.pos, MAPB_T.yaw);
console.log(`mapboard verts ${mapb.length}, y-range ${q(Math.min(...mapb.map(v => v[1])))}..${q(Math.max(...mapb.map(v => v[1])))}`);

for (const cand of [10, 10.6, 11.2]) {
    const lampPos = [1.75, 0, cand];
    const lamp = await worldVerts(LAMP, lampPos, LAMP_T.yaw);
    const r3d = minDist(lamp, mapb);
    const rHead = minDist(lamp, mapb, [1.4, 2.6]);   // visitor band
    const rBase = minDist(lamp, mapb, [0, 0.25]);
    console.log(`lamp-n z=${cand}: 3D ${q(r3d.best)}m @(${r3d.pa?.map(q)}) | head-band(1.4-2.6) ${q(rHead.best)}m | base-band ${q(rBase.best)}m`);
}

// rider b26 vs mapboard at CURRENT pose (rider box center 1.75,1.5,10 half 0.125/0.21/0.125, yaw -pi/2)
// approximate as its 8 corners:
const c: number[][] = [];
for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
    c.push([1.75 + sx * 0.125, 1.5 + sy * 0.21, 10 + sz * 0.125]);
const rr = minDist(c, mapb, [1.0, 2.0]);
console.log(`b26 rider box vs mapboard (y1-2): ${q(rr.best)}m`);
