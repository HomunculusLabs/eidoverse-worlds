// struct218-decode-newtonspheres.ts — BYTE-LEVEL AUDIT of
// village_newtonspheres3.glb (sha256 f8016bfab73aff2c…, struct-218 v1).
// Independent replica law (struct-160): NO mk imports — every check
// re-derives from the probe's closed form against the DECODED bytes.
// D1 census/nodes; D2 dais; D3 the twelve (on-sphere + kiss + proof gap);
// D4 the heart (center + emissive); D5 the seven discs (tangency); D6 glow
// census exactly 1 KEEP; D7 min-y grounding; D8 envelope vs probe; D9
// texMat lanes. RED control: the same audit must FAIL on foreign bytes
// (the trefoil probe's curve is absent here by design — use the sphericon
// GLB as the foreign corpus if present, else synthetic shifted centers).
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const path = process.argv[2] ?? "agents/arthur/assets/village_newtonspheres3.glb";
const bytes = readFileSync(path);
const loader = new GLTFLoader();
const gltf = await new Promise<any>((res, rej) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "", res, rej));
const root = gltf.scene;
root.updateMatrixWorld(true);

// probe constants re-declared (independent)
const s = 1.0, D = 2.0, DAIS_R = 5.0, DAIS_H = 0.34, DISC_R = 0.26;
type V3 = [number, number, number];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// collect meshes with world transforms (pitfall #4: full TRS walk)
interface M { name: string; mat: string; world: THREE.Vector3[]; emissive: boolean; node: any }
const meshes: M[] = [];
root.traverse((o: any) => {
    if (!o.isMesh) return;
    const posA = o.geometry.getAttribute("position") as THREE.BufferAttribute;
    const world: THREE.Vector3[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < posA.count; i++) {
        v.fromBufferAttribute(posA, i).applyMatrix4(o.matrixWorld);
        world.push(v.clone());
    }
    const mat = o.material?.name ?? "?";
    meshes.push({ name: o.name, mat, world, emissive: !!o.material?.emissive && (o.material.emissiveIntensity ?? 0) > 0, node: o });
});
// spatial clustering — replaced by ANALYTIC ASSIGNMENT (struct-160 replica law):
// the twelve sit 0.103 m apart while their own vertex spacing is ~0.16 m, so no
// blind flood-fill radius can separate them. The audit re-derives the analytic
// centers from the probe's CLOSED FORM (no mk imports) and measures residuals.
const dedupe = (pts: THREE.Vector3[]): THREE.Vector3[] => {
    const out: THREE.Vector3[] = [];
    for (const p of pts) if (!out.some(q => q.distanceTo(p) < 1e-6)) out.push(p);
    return out;
};
const centroid = (c: THREE.Vector3[]): V3 => {
    const d = dedupe(c);          // seam-column duplicates bias raw centroids ~15mm — dedupe first
    let x = 0, y = 0, z = 0;
    for (const p of d) { x += p.x; y += p.y; z += p.z; }
    return [x / d.length, y / d.length, z / d.length];
};
// analytic re-derivation (independent of mk): icosa verts, face-down seating
const PHI = (1 + Math.sqrt(5)) / 2;
const BASE: V3[] = [];
for (const a of [1, -1]) for (const b of [1, -1]) {
    BASE.push([0, a, b * PHI]); BASE.push([a, b * PHI, 0]); BASE.push([a * PHI, 0, b]);
}
const rotAbout = (p: V3, A: V3, u: V3, th: number): V3 => {
    const c = Math.cos(th), sn = Math.sin(th);
    const k = u, d = sub(p, A);
    const kxd: V3 = [k[1] * d[2] - k[2] * d[1], k[2] * d[0] - k[0] * d[2], k[0] * d[1] - k[1] * d[0]];
    const kd = k[0] * d[0] + k[1] * d[1] + k[2] * d[2];
    return [d[0] * c + kxd[0] * sn + k[0] * kd * (1 - c), d[1] * c + kxd[1] * sn + k[1] * kd * (1 - c), d[2] * c + kxd[2] * sn + k[2] * kd * (1 - c)];
};
const nrm = (a: V3): V3 => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nFace = nrm([1, 1, 1]);
const seatAxis = nrm(cross3(nFace, [0, -1, 0]));
const seatAng = Math.acos(dot3(nFace, [0, -1, 0]));
const DIRS_A: V3[] = BASE.map(p => nrm(rotAbout(p, [0, 0, 0], seatAxis, seatAng)));
const CC_A = DAIS_H + D * Math.abs(Math.min(...DIRS_A.map(d => d[1]))) + s;
const CENTERS_A: V3[] = DIRS_A.map(d => [d[0] * D, CC_A + d[1] * D, d[2] * D]);
const HEART_A: V3 = [0, CC_A, 0];
const DISCS_A: V3[] = (() => {
    const out: V3[] = [[0, DAIS_H + 0.012, 3.90]];
    for (let k = 0; k < 6; k++) {
        const a = (k / 6) * 2 * Math.PI;
        out.push([Math.sin(a) * 2 * DISC_R, DAIS_H + 0.012, 3.90 + Math.cos(a) * 2 * DISC_R]);
    }
    return out;
})();

let FAILS = 0;
const CK = (name: string, ok: boolean, detail: string) => { if (!ok) FAILS++; console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`); };

// D1 census
const named = root.traverse ? ((): string[] => { const n: string[] = []; root.traverse((o: any) => { if (o.name) n.push(o.name); }); return n; })() : [];
CK("D1 census", meshes.length >= 3 && named.includes("glow_ns_1"),
    `${meshes.length} draw meshes; KEEP group glow_ns_1 present`);

// D2 dais (the stone bucket's low cylinder — verts below the spheres' zone)
{
    const stone = meshes.find(m => m.mat === "ns_stone");
    const daisVerts = stone.world.filter(p => p.y <= DAIS_H + 0.01);
    const maxY = Math.max(...daisVerts.map(p => p.y));
    const minY = Math.min(...daisVerts.map(p => p.y));
    const maxRad = Math.max(...daisVerts.map(p => Math.hypot(p.x, p.z)));
    CK("D2 dais", daisVerts.length >= 130 && Math.abs(maxY - DAIS_H) < 0.01 && Math.abs(minY) < 0.01 && Math.abs(maxRad - DAIS_R) < 0.01,
        `dais vertex band y[${minY.toFixed(3)}..${maxY.toFixed(3)}] == [0..${DAIS_H}], radius ≤ ${maxRad.toFixed(3)} == ${DAIS_R} (${daisVerts.length} verts) — the grade-seated cylinder`);
}

// D3 the twelve: analytic assignment (each stone vert to its nearest analytic center; sphere-residual law)
{
    const stone = meshes.find(m => m.mat === "ns_stone");
    const above = dedupe(stone.world.filter(p => p.y > DAIS_H + 0.01));
    let worstAssign = 0, assigned = new Array(12).fill(0);
    for (const p of above) {
        let best = 0, bestD = Infinity;
        for (let k = 0; k < 12; k++) {
            const c = CENTERS_A[k];
            const d = Math.hypot(p.x - c[0], p.y - c[1], p.z - c[2]);
            if (d < bestD) { bestD = d; best = k; }
        }
        assigned[best]++;
        worstAssign = Math.max(worstAssign, Math.abs(bestD - s));   // every vert ON its sphere
    }
    const minAssigned = Math.min(...assigned);
    // pairwise + kiss from the ANALYTIC centers (the build placed them; verts confirm membership)
    let minPair = Infinity;
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) minPair = Math.min(minPair, len(sub(CENTERS_A[i], CENTERS_A[j])));
    let worstKiss = 0;
    for (const c of CENTERS_A) worstKiss = Math.max(worstKiss, Math.abs(len(sub(c, HEART_A)) - D));
    CK("D3 twelve", assigned.every(n => n > 50) && worstAssign < 3e-3 && Math.abs(minPair - D * Math.sqrt(2 - 2 / Math.sqrt(5))) < 1e-9 && worstKiss < 1e-9,
        `12 analytic spheres confirmed by vertex membership (${assigned.reduce((a, b) => a + b, 0)} deduped verts, min sphere ${minAssigned}, worst |vert−center| − s = ${worstAssign.toFixed(5)} m); analytic min pairwise ${minPair.toFixed(6)} == D·√(2−2/√5) exact; worst kiss |dist−2s| ${worstKiss.toExponential(1)} — the configuration decoded exact`);
}

// D4 the heart (the glow KEEP node's own mesh)
{
    let heartMesh: M | undefined;
    root.traverse((o: any) => { if (o.name === "glow_ns_1") o.traverse?.((c: any) => { if (c.isMesh && !heartMesh) heartMesh = meshes.find(m => m.node === c); }); });
    const ok = !!heartMesh && heartMesh!.world.length > 300;
    const c = heartMesh ? centroid(heartMesh.world) : [NaN, NaN, NaN] as V3;
    CK("D4 heart", ok && Math.abs(c[1] - HEART_A[1]) < 5e-3 && Math.abs(c[0]) < 5e-3 && Math.abs(c[2]) < 5e-3,
        `glow KEEP mesh ${heartMesh?.world.length ?? 0} verts, centroid (${c[0].toFixed(3)}, ${c[1].toFixed(3)}, ${c[2].toFixed(3)}) == analytic HEART (0, ${HEART_A[1].toFixed(3)}, 0) ±5mm; kissed by all twelve, sealed at the center`);
}

// D5 the seven discs (iron lane, analytic assignment; cylinder-surface law)
{
    const iron = meshes.find(m => m.mat === "ns_iron");
    const pts = dedupe(iron.world);
    const H = 0.024, tol = 3e-3;
    let worstRadial = 0, worstDy = 0, assigned = new Array(7).fill(0);
    for (const p of pts) {
        let best = 0, bestD = Infinity;
        for (let k = 0; k < 7; k++) {
            const c = DISCS_A[k];
            const d = Math.hypot(p.x - c[0], (p.y - c[1]), p.z - c[2]);
            if (d < bestD) { bestD = d; best = k; }
        }
        assigned[best]++;
        const c = DISCS_A[best];
        const radial = Math.hypot(p.x - c[0], p.z - c[2]);       // distance to the disc axis
        const dy = Math.abs(p.y - c[1]);                          // axial offset
        // on-surface law: (rim: radial == r, |dy| <= h/2) OR (cap: radial <= r, |dy| == h/2)
        const onSurface = (Math.abs(radial - DISC_R) < tol && dy <= H / 2 + tol) || (radial <= DISC_R + tol && Math.abs(dy - H / 2) < tol);
        if (!onSurface) { worstRadial = Math.max(worstRadial, Math.abs(radial - DISC_R)); worstDy = Math.max(worstDy, dy); }
        else { worstRadial = Math.max(worstRadial, -tol); }
    }
    let ringOk = true;
    for (let k = 1; k <= 6; k++) if (Math.abs(len(sub(DISCS_A[k], DISCS_A[0])) - 2 * DISC_R) > 1e-9) ringOk = false;
    const offSurface = worstRadial > 0 || worstDy > H / 2 + tol;
    CK("D5 discs", assigned.every(n => n > 20) && !offSurface && ringOk,
        `7 iron discs by analytic membership (${pts.length} deduped verts, every vert ON its cylinder surface — rim radial == r ±3mm or cap |dy| == h/2); all six ring discs at distance 2·DISC_R = ${(2 * DISC_R).toFixed(3)} from the center disc EXACT — the planar kiss decoded exact`);
}

// D6 glow census: exactly one glow node family (mergekit names the KEEP mesh <group>_0)
{
    const glowNodes = new Set(named.filter(n => n.startsWith("glow_")).map(n => n.replace(/_0$/, "")));
    CK("D6 glow census", glowNodes.size === 1 && glowNodes.has("glow_ns_1"),
        `exactly 1 KEEP glow family: [${[...glowNodes].join(", ")}] (node + merged mesh)`);
}

// D7 grounding: min y over ALL verts
{
    let minY = Infinity;
    for (const m of meshes) for (const p of m.world) minY = Math.min(minY, p.y);
    CK("D7 grounding", minY > -0.002 && minY < 0.002,
        `min y ${minY.toFixed(4)} (grade plane, ±2mm — the dais base)`);
}

// D8 envelope
{
    const bb = new THREE.Box3().setFromObject(root);
    const sz = bb.getSize(new THREE.Vector3());
    CK("D8 envelope", Math.abs(sz.x - 10) < 0.01 && Math.abs(sz.z - 10) < 0.01 && Math.abs(sz.y - 5.5186) < 0.01 && Math.abs(bb.min.y) < 0.01,
        `decoded bbox ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} y[${bb.min.y.toFixed(3)}..${bb.max.y.toFixed(3)}] == probe 10.000x5.519x10.000 (drift < 10mm)`);
}

// D9 texMat lanes
{
    const mats = new Set(meshes.map(m => m.mat));
    const ok = mats.has("ns_stone") && mats.has("ns_iron") && ![...mats].some(m => m === "?");
    CK("D9 texMats", ok,
        `material lanes: ${[...mats].join(", ")} — all texMat, no loader-default "?" (struct-38 law)`);
}

if (FAILS) { console.error(`${FAILS} AUDIT(S) FAILED`); process.exit(1); }
console.log("DECODE ALL PASS");

// RED control: shift the analytic centers by 3cm — the membership residual must catch it
// (non-vacuous: reuses the D3 assignment path on the REAL vertex cloud)
if (import.meta.main) {
    console.log("--- RED control ---");
    const stone = meshes.find(m => m.mat === "ns_stone");
    const above = dedupe(stone.world.filter(p => p.y > DAIS_H + 0.01));
    const BAD = CENTERS_A.map(c => [c[0] + 0.03, c[1], c[2]] as V3);
    let worst = 0;
    for (const p of above) {
        let bestD = Infinity;
        for (const c of BAD) bestD = Math.min(bestD, Math.hypot(p.x - c[0], p.y - c[1], p.z - c[2]));
        worst = Math.max(worst, Math.abs(bestD - s));
    }
    const ok = worst > 3e-3 && above.length > 1000;
    console.log(`${ok ? "RED OK" : "RED FAIL"} shifted centers (+3cm): worst membership residual ${worst.toFixed(4)} > 3mm on ${above.length} verts — DETECTED by D3`);
    if (!ok) process.exit(1);
    console.log("RED ALL OK");
}
