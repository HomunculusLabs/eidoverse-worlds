// struct46-angler-sat-exempt.ts — exemption-ladder tier (b) probe for the
// nx-approach-sw-lane-003 SAT block. Class-0b law: a network entity's census
// bbox spans the whole walk; obstruction must be measured against actual
// solids. Lane entity: pos (0,0,0) yaw 0 -> world == local, direct arithmetic.
// Angler new-beyond-old-envelope geometry = analytic primitives from
// mkv3-angler.ts source (rod cylinder axis, line segment, bobber sphere),
// transformed to world by the standing tuple (POS, YAW=-pi/2).
// Law: hard-fail below 1.4m true solid clearance (pinch law); print the
// measured value for the placer's gap-bounded exemption comment.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const LANE = "/tmp/struct46-sw-lane.glb";
const laneBytes = readFileSync(LANE);
const ANGLER = { px: -23.6, py: -0.0479815001883968, pz: -38.37, yaw: -Math.PI / 2 };
// angler-local -> world: wx = px + lx*cos + lz*sin ; wz = pz - lx*sin + lz*cos
const c = Math.cos(ANGLER.yaw), s = Math.sin(ANGLER.yaw);
const W = (lx: number, ly: number, lz: number): [number, number, number] =>
    [ANGLER.px + lx * c + lz * s, ANGLER.py + ly, ANGLER.pz - lx * s + lz * c];

// decode lane POSITION accessors (non-DRACO at-rest bytes? lane may be DRACO)
const dv = new DataView(laneBytes.buffer, laneBytes.byteOffset, laneBytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(laneBytes.subarray(20, 20 + jsonLen)));
const draco = json.extensionsRequired?.includes("KHR_draco_mesh_compression");
console.log("lane draco:", !!draco, "nodes:", json.nodes?.length, "meshes:", json.meshes?.length);

// analytic new geometry (angler-local), from mkv3-angler.ts struct-46 constants:
const rodButtL = [1.18, 0.59, -0.76], rodTipL = [1.93, 2.78, -1.02]; // rod axis
const bobL = [2.8, 0.144, -4.92];                                     // bobber center, r=0.06
const rodButt = W(...(rodButtL as [number, number, number]));
const rodTip = W(...(rodTipL as [number, number, number]));
const bob = W(...(bobL as [number, number, number]));
console.log("world rodButt", rodButt.map(v => +v.toFixed(2)), "rodTip", rodTip.map(v => +v.toFixed(2)), "bobber", bob.map(v => +v.toFixed(2)));

function segDist(p: number[], a: number[], b: number[]): number {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
    const q = [a[0] + t * ab[0], a[1] + t * ab[1], a[2] + t * ab[2]];
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
const rodR = 0.03, bobR = 0.06, lineR = 0.012;

if (!draco) {
    const accs = json.accessors, views = json.bufferViews;
    let n = 0, minRod = Infinity, minLine = Infinity, minBob = Infinity;
    let minRodId = "", minLineId = "", minBobId = "";
    // gather all mesh vertices in world (=local) space with node translations
    for (const [ni, nd] of (json.nodes ?? []).entries()) {
        if (nd.mesh === undefined) continue;
        const mesh = json.meshes[nd.mesh];
        const t = nd.translation ?? [0, 0, 0];
        for (const prim of mesh.primitives) {
            const posAcc = accs[prim.attributes.POSITION];
            const bv = views[posAcc.bufferView];
            const base = 8 + (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
            const name = nd.name ?? `node${ni}`;
            for (let i = 0; i < posAcc.count; i++) {
                const o = base + i * 12;
                const x = dv.getFloat32(o, true) + t[0], y = dv.getFloat32(o + 4, true) + t[1], z = dv.getFloat32(o + 8, true) + t[2];
                n++;
                const dRod = segDist([x, y, z], rodButt, rodTip) - rodR;
                const dLine = segDist([x, y, z], rodTip, bob) - lineR;
                const dBob = Math.hypot(x - bob[0], y - bob[1], z - bob[2]) - bobR;
                if (dRod < minRod) { minRod = dRod; minRodId = name; }
                if (dLine < minLine) { minLine = dLine; minLineId = name; }
                if (dBob < minBob) { minBob = dBob; minBobId = name; }
            }
        }
    }
    console.log("lane verts scanned:", n);
    console.log("MIN CLEARANCE rod:", minRod.toFixed(3), "@", minRodId);
    console.log("MIN CLEARANCE line:", minLine.toFixed(3), "@", minLineId);
    console.log("MIN CLEARANCE bobber:", minBob.toFixed(3), "@", minBobId);
    const worst = Math.min(minRod, minLine, minBob);
    console.log(worst >= 1.4 ? `EXEMPTION_PROVEN worst=${worst.toFixed(3)}m >= 1.4m` : `REAL_COLLISION worst=${worst.toFixed(3)}m — DO NOT EXEMPT`);
} else {
    // DRACO: run a three.js decode via the draco review rig pattern instead
    console.log("DRACO lane — need decode rig; run review-model-draco extraction");
}
