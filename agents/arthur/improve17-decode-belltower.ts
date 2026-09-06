// improve17-decode-belltower.ts — vertex-level decode audit for improve-17
// (merged buckets bake translations; statics are nameless post-merge — the
// audit reads position attributes with node transforms applied).
// (a) ladder rung/stringer topology; (b) rope anchor stack; (c) lamp housing;
// (d) b5 rider keep-out differential vs live baseline; (e) bbox unchanged.
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const path = process.argv[2] ?? "agents/arthur/assets/village_belltower3.glb";
const base = process.argv[3] ?? "/tmp/improve17-belltower-live.glb";
const KEEP_OUT = { minX: 0.433, maxX: 1.077, minY: 0.65, maxY: 2.07, minZ: 0.952, maxZ: 1.092 };

async function verts(p: string) {
    const bytes = readFileSync(p);
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const out: number[][] = [];
    const bb = new THREE.Box3();
    const named: Record<string, number[]> = {};
    scene.traverse((o: any) => {
        if (o.name && o.name !== "Scene") named[o.name] = [o.position.x, o.position.y, o.position.z];
        if (!o.isMesh) return;
        const geom = o.geometry as THREE.BufferGeometry;
        const pos = geom.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            out.push([v.x, v.y, v.z]);
            bb.expandByPoint(v);
        }
    });
    return { verts: out, bb, named };
}

let fails = 0;
const ck = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};
const q = (n: number) => Math.round(n * 1000) / 1000;

const { verts: V, bb, named: NAMED } = await verts(path);
const inBox = (x: number[], a: number[], b: number[]) => x[0] >= a[0] && x[0] <= b[0] && x[1] >= a[1] && x[1] <= b[1] && x[2] >= a[2] && x[2] <= b[2];

// A. ladder (climb plane z 1.10, x band -0.92..-0.58)
const ladder = V.filter(v => v[2] > 1.0 && v[2] < 1.2 && v[0] > -0.95 && v[0] < -0.55 && v[1] < 5.1);
const rungYs = [...new Set(ladder.filter(v => v[1] > 0.6 && v[1] < 5.1).map(v => Math.round(v[1] / 0.42)))];
const rungClusters = new Set(ladder.filter(v => v[1] > 0.6 && v[1] < 5.1).map(v => Math.round(v[1] / 0.42))).size;
ck("A1 rung clusters (11 bands at 0.42 pitch)", rungClusters === 11, `bands ${rungClusters}`);
const strCols = new Set(ladder.filter(v => v[1] < 0.7 || v[1] > 4.8).map(v => Math.round(v[0] * 100) / 100)).size >= 2;
ck("A2 two stringer columns present (verts outside rung band)", strCols, `x-cols ${[...new Set(ladder.map(v => q(v[0])))].join(",")}`);
const strLow = ladder.filter(v => v[1] < 0.45);
ck("A3 stringers seated on slab (verts y ≤ 0.35)", strLow.some(v => v[1] <= 0.35), `min y ${q(Math.min(...ladder.map(v => v[1])))}`);
ck("A4 top rung above belfry floor top 4.82", ladder.some(v => v[1] >= 4.9), `max y ${q(Math.max(...ladder.map(v => v[1])))}`);
ck("A5 bottom rung reachable (min y ≤ 0.78)", Math.min(...ladder.filter(v => v[1] > 0.5 && v[1] < 1.1).map(v => v[1])) <= 0.78, `first-rung min ${q(Math.min(...ladder.filter(v => v[1] > 0.5 && v[1] < 1.1).map(v => v[1])))}`);
const oldLadder = V.filter(v => v[2] > -0.85 && v[2] < -0.7 && v[0] > -0.8 && v[0] < -0.15 && v[1] > 0.6 && v[1] < 4.3);
// A6 is a DIFFERENTIAL check (fixed this tick): the zone overlaps the
// pre-existing z-face X-brace (6 verts present in BOTH builds at z −0.74).
// The old embedded ladder was 72 rung/rail verts at x −0.2/−0.7 with 0.42
// y-pitch — those must be GONE in the edited build.
const brace = (v: number[]) => Math.abs(v[2] + 0.74) < 0.005;
const newOld = oldLadder.filter(v => !brace(v));
ck("A6 old embedded ladder GONE (differential: only pre-existing brace verts remain)", newOld.length === 0 && oldLadder.length > 0, `zone verts ${oldLadder.length} (brace-only = pass; baseline carried 78)`);
const standoff = V.filter(v => v[2] > 0.93 && v[2] < 1.13 && v[1] > 1.4 && v[1] < 1.7 && v[0] > -0.8 && v[0] < -0.7);
ck("A7 stand-off arms present (y≈1.5, z 1.03)", standoff.length > 0, `count ${standoff.length}`);
const standoff2 = V.filter(v => v[2] > 0.93 && v[2] < 1.13 && v[1] > 3.4 && v[1] < 3.7 && v[0] > -0.8 && v[0] < -0.7);
ck("A8 stand-off arms high (y≈3.5)", standoff2.length > 0, `count ${standoff2.length}`);

// B. rope anchor (x 0.12, z 0.58)
const blockV = V.filter(v => Math.abs(v[0] - 0.12) < 0.09 && v[1] > 0.28 && v[1] < 0.56 && Math.abs(v[2] - 0.58) < 0.09);
ck("B1 mounting block verts present (y 0.30..0.55)", blockV.length >= 8, `count ${blockV.length}`);
const oldCleat = V.filter(v => Math.abs(v[0] - 0.12) < 0.06 && v[1] > 0.95 && v[1] < 1.15 && Math.abs(v[2] - 0.62) < 0.06);
ck("B2 old floating cleat region empty", oldCleat.length === 0, `count ${oldCleat.length}`);
const tailV = V.filter(v => Math.abs(v[0] - 0.12) < 0.04 && v[1] > 0.28 && v[1] < 0.6 && Math.abs(v[2] - 0.58) < 0.04);
ck("B3 tail/knot verts on the block", tailV.length > 0, `count ${tailV.length}`);
const guideV = V.filter(v => Math.abs(v[0] - 0.12) < 0.09 && v[1] > 4.6 && v[1] < 4.76 && Math.abs(v[2] - 0.58) < 0.09);
ck("B4 guide ring verts at floor penetration (y≈4.68)", guideV.length >= 6, `count ${guideV.length}`);

// C. lamp housing (iron bucket verts around 0.67..0.83, y 5.54..5.76)
const postsV = V.filter(v => v[0] > 0.63 && v[0] < 0.87 && v[1] > 5.5 && v[1] < 5.7 && v[2] > 0.63 && v[2] < 0.87);
ck("C1 housing verts present (4 posts + arm)", postsV.length >= 16, `count ${postsV.length}`);
const hoodV = V.filter(v => Math.abs(v[0] - 0.75) < 0.12 && v[1] > 5.66 && v[1] < 5.78 && Math.abs(v[2] - 0.75) < 0.12);
ck("C2 hood verts above bead (y 5.68..5.76)", hoodV.length >= 4, `count ${hoodV.length}`);
const lampP = NAMED["lamp"];
ck("C3 lamp KEEP node present at exact (0.75, 5.6, 0.75)", !!lampP && Math.abs(lampP[0] - 0.75) < 1e-6 && Math.abs(lampP[1] - 5.6) < 1e-6 && Math.abs(lampP[2] - 0.75) < 1e-6, lampP ? `at (${q(lampP[0])}, ${q(lampP[1])}, ${q(lampP[2])})` : "MISSING");

// D. b5 keep-out differential (vertex-level, sorted set compare).
// Pitfall-12 fix (this tick): the exact rider zone x∈[0.433,1.077],
// y∈[0.65,2.07], z∈[0.952,1.092] holds ZERO host verts in both builds
// (the rider floats just proud of the pier's S face at z 0.9 — its volume
// is air on the host side; 0==0 can't prove the probe works). The WIDER
// probe zone below contains the live E-pier plinth band (verts at exactly
// y 0.3 — INCLUSIVE bound, pitfall 2: an exclusive >0.3 excluded them and
// made the differential vacuous again) and spans the full rider envelope.
const { verts: BV } = await verts(base);
const zone = (v: number[]) => v[0] > 0.3 && v[0] < 1.2 && v[1] >= 0.25 && v[1] < 2.3 && v[2] > 0.8 && v[2] < 1.2;
const nz = V.filter(zone).map(v => v.map(q).join(",")).sort().join(";");
const bz = BV.filter(zone).map(v => v.map(q).join(",")).sort().join(";");
ck("D1 b5 keep-out vertex differential IDENTICAL (wider zone: x 0.3..1.2, y 0.3..2.3, z 0.8..1.2)", nz === bz && bz.length > 0, `new ${nz.length} chars vs base ${bz.length} chars — ${bz.length > 0 ? "nonempty differential" : "VACUOUS, zone empty in baseline"}`);

// E. bbox
ck("E1 bbox unchanged ±1.7/7.6", Math.abs(bb.max.x - 1.7) < 0.01 && Math.abs(bb.min.x + 1.7) < 0.01 && Math.abs(bb.max.z - 1.7) < 0.01 && Math.abs(bb.min.z + 1.7) < 0.01 && Math.abs(bb.max.y - 7.6) < 0.01, `x[${q(bb.min.x)},${q(bb.max.x)}] y[${q(bb.min.y)},${q(bb.max.y)}] z[${q(bb.min.z)},${q(bb.max.z)}]`);

console.log(fails === 0 ? "IMPROVE17 DECODE ALL PASS" : `IMPROVE17 DECODE FAIL x${fails}`);
process.exit(fails === 0 ? 0 : 1);
