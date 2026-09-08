// struct113-decode-voronoi.ts — decode audit of village_voronoi3.glb.
// Verifies from BYTES (independent of the mk script's own asserts):
//   (a) pinned sha, node budget 13, texMat lanes vo_stone/vo_core, brass
//       emissive exported, KEEP nodes glow_vo_1 (11),
//   (b) THE VORONOI LAW: an independent replica — re-derive the 11 kept
//       seeds (truncated Fibonacci lattice) and the 11 cells by the SAME
//       mathematical law (half-space vertex enumeration), then require
//       FULL vertex-cloud equality between the file's stone buckets and
//       the replica's drifted cell vertices (dedup, tolerance 1e-4),
//   (c) bead law: 11 brass spheres whose node TRANSLATIONS equal the
//       replica's heart-ray exits + drift + proud offset (tol 1e-4),
//   (d) drift law on the lattice: all 55 pairwise bisector separations
//       ≥ 0.02 (min 0.045),
//   (e) envelope == 5.36x6.40x3.82 y[0..6.40] incl. bead extents, no NaN,
//       base on grade.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as THREE from "three";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_voronoi3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const BIN = 20 + jl + 8;
const va = (ai: number): Float32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[i * 3] = bytes.readFloatLE(off + i * 12);
        out[i * 3 + 1] = bytes.readFloatLE(off + i * 12 + 4);
        out[i * 3 + 2] = bytes.readFloatLE(off + i * 12 + 8);
    }
    return out;
};

// ---- independent replica (same math, fresh code path) -------------------------------
const N_SEEDS = 11, N_RAW = 18, CAP_Y = -0.24;
const GA = Math.PI * (3 - Math.sqrt(5));
const HEART = new THREE.Vector3(0, 3.2, 0);
const T_DRIFT = 0.26;
const BEAD_PROUD = 0.05;
type Plane2 = { n: THREE.Vector3; d: number; kind: string; src: string };
type V3T = [number, number, number];
const FOOT: V3T[] = [[-2.2, 0, -1.5], [2.2, 0, -1.5], [2.2, 0, 1.5], [-2.2, 0, 1.5]];
const WAIST: V3T[] = [[-2.42, 2.8, -1.62], [2.42, 2.8, -1.62], [2.42, 2.8, 1.62], [-2.42, 2.8, 1.62]];
const SHOULDER: V3T[] = [[-1.72, 4.7, -1.18], [1.72, 4.7, -1.18], [1.72, 4.7, 1.18], [-1.72, 4.7, 1.18]];
const APEX: V3T[] = [[-0.0, 6.4, -0.42], [0.62, 6.4, -0.0], [0.62, 6.4, 0.42], [-0.62, 6.4, 0.0]];
const RINGS = [FOOT, WAIST, SHOULDER, APEX];
const planes: Plane2[] = [];
{
    const mkP = (p1: V3T, p2: V3T, p3: V3T, src: string): Plane2 => {
        const n = new THREE.Vector3().subVectors(new THREE.Vector3(...p2), new THREE.Vector3(...p1)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...p3), new THREE.Vector3(...p1)));
        n.normalize();
        return { n, d: n.dot(new THREE.Vector3(...p1)), kind: "flank", src };
    };
    planes.push({ n: new THREE.Vector3(0, -1, 0), d: 0, kind: "base", src: "base" });
    planes.push({ n: new THREE.Vector3(0, 1, 0), d: 6.4, kind: " faces", src: "top" });
    for (let r = 0; r < 3; r++) {
        const L = RINGS[r], U = RINGS[r + 1];
        for (let i = 0; i < 4; i++) {
            const jj = (i + 1) % 4;
            planes.push(mkP(L[i], U[i], L[jj], ["lower", "mid", "crown"][r] + i));
        }
    }
}
const seedsRaw: THREE.Vector3[] = [];
for (let i = 0; i < N_RAW; i++) {
    const y = 1 - (2 * (i + 0.5)) / N_RAW;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    seedsRaw.push(new THREE.Vector3(r * Math.cos(i * GA), y, r * Math.sin(i * GA)));
}
const seeds = seedsRaw.filter(s => s.y >= CAP_Y);
if (seeds.length !== N_SEEDS) throw Error("replica lattice mismatch");

function buildPoly(P: Plane2[]): THREE.Vector3[] {
    const verts: THREE.Vector3[] = [];
    const seen = new Set<string>();
    for (let i = / /.test("") ? 0 : 0; i < P.length; i++) for (let jj = i + 1; jj < P.length; jj++) for (let k = jj + 1; k < P.length; k++) {
        const M = new THREE.Matrix3().set(P[i].n.x, P[i].n.y, P[i].n.z, P[jj].n.x, P[jj].n.y, P[jj].n.z, P[k].n.x, P[k].n.y, P[k].n.z);
        const det = M.determinant();
        if (Math.abs(det) < 1e-9) continue;
        const x = new THREE.Vector3(P[i].d, P[jj].d, P[k].d).applyMatrix3(M.clone().invert());
        let inside = true;
        for (const pl of P) if (pl.n.dot(x) > pl.d + 2e-5) { inside = false; break; }
        if (!inside) continue;
        const key = [x.x, x.y, x.z].map(n => n.toFixed(6)).join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        verts.push(x);
    }
    return verts;
}
const replicaCellVerts: THREE.Vector3[][] = [];
for (let a = 0; a < N_SEEDS; a++) {
    const P: Plane2[] = [...planes];
    for (let b = 0; b < N_SEEDS; b++) {
        if (a === b) continue;
        const n = seeds[b].clone().sub(seeds[a]);
        P.push({ n, d: n.dot(HEART), kind: "cut", src: `bis${a}-${b}` });
    }
    replicaCellVerts.push(buildPoly(P));
}
const replicaBeads: THREE.Vector3[] = seeds.map((s, a) => {
    const drift = new THREE.Vector3(s.x * T_DRIFT, 0, s.z * T_DRIFT);
    let tExit = Infinity;
    for (const pl of planes) {
        kind: {
            const denom = pl.n.dot(s);
            if (denom > 1e-9) {
                const t = (pl.d - pl.n.dot(HEART)) / denom;
                if (t >= 0 && t < tExit) tExit = t;
            }
        }
    }
    return HEART.clone().addScaledVector(s, tExit).add(drift).addScaledVector(s, BEAD_PROUD);
});

// ---- checks -----------------------------------------------------------------------
ck("sha pinned", sha === "00b94c926392cece92e510bf4383159bd3ac392a597005763886efe7c032e5ea", sha.slice(0, 16));
const stoneNodes = names.filter(n => /^voronoi_\d+$/.test(n));
ck("stone buckets 2", stoneNodes.length === 2, stoneNodes.join(","));
const beadNodes = names.filter(n => n === "glow_vo_1");
ck("KEEP beads 11", beadNodes.length === N_SEEDS, `${beadNodes.length} nodes`);
const texMats = (j.materials ?? []).map((m: any) => m.name);
ck("texMat lanes", texMats.includes("vo_stone") && texMats.includes("vo_core"), texMats.join(","));
const brass = j.materials.find((m: any) => (m.name ?? "").includes("glow") || ((m.pbrMetallicRoughness ?? {}).metallic ?? 0) > 0.5);
ck("brass emissive exported", !!brass && !!(brass as any).emissiveFactor, brass ? JSON.stringify((brass as any).emissiveFactor) : "none");

// (b) THE VORONOI LAW: vertex-cloud equality between file stone verts and replica cell verts (after drift)
const stoneAcc: THREE.Vector3[] = [];
for (const node of j.nodes) {
    if (node.mesh === undefined) continue;
    const nm = node.name ?? "";
    if (!/^voronoi_\d+$/.test(nm)) continue;
    const mesh = j.meshes[node.mesh];
    const acc = mesh.primitives[0].attributes.POSITION;
    const pos = va(acc);
    const tr = node.translation ?? [0, 0, 0];
    for (let i = 0; i < pos.length; i += 3) stoneAcc.push(new THREE.Vector3(pos[i] + tr[0], pos[i + 1] + tr[1], pos[i + 2] + tr[2]));
}
const repCloud: THREE.Vector3[] = [];
for (let a = 0; a < N_SEEDS; a++) {
    const drift = new THREE.Vector3(seeds[a].x * T_DRIFT, 0, seeds[a].z * T_DRIFT);
    for (const v of replicaCellVerts[a]) repCloud.push(v.clone().add(drift));
}
const dedup = (vs: THREE.Vector3[]) => {
    const seen = new Set<string>();
    const out: THREE.Vector3[] = [];
    for (const v of vs) {
        const k = [v.x, v.y, v.z].map(n => n.toFixed(4)).join(",");
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(v);
    }
    return out;
};
const A = dedup(stoneAcc), B = dedup(repCloud);
ck("vertex counts match", A.length === B.length, `file ${A.length} vs replica ${B.length}`);
let worst = 0, unmatched = 0;
for (const v of A) {
    let best = Infinity;
    for (const w of B) best = Math.min(best, v.distanceTo(w));
    if (best > 1e-4) unmatched++;
    worst = Math.max(worst, best);
}
ck("VORONOI LAW vertex equality", unmatched === 0, `worst ${worst.toExponential(1)}, ${unmatched} unmatched of ${A.length}`);

// (c) bead law: node translations equal the replica bead positions
{
    const beadPos: THREE.Vector3[] = [];
    for (const node of j.nodes) {
        if (node.mesh === undefined || node.name !== "glow_vo_1") continue;
        const t = node.translation;
        if (!t) continue;
        beadPos.push(new THREE.Vector3(t[0], t[1], t[2]));
    }
    ck("bead count from bytes", beadPos.length === 11, `${beadPos.length}`);
    let ok = 0, bworst = 0;
    for (const c of beadPos) {
        let best = Infinity;
        for (const r of replicaBeads) best = Math.min(best, c.distanceTo(r));
        bworst = Math.max(bworst, best);
        if (best <= 1e-4) ok++;
    }
    ck("bead law (heart-ray exits + drift + proud)", ok === 11, `worst ${bworst.toExponential(1)}`);
}

// (d) drift law on the lattice
{
    let minSep = Infinity;
    for (let a = 0; a < N_SEEDS; a++) for (let b = 0; b < N_SEEDS; b++) {
        if (a === b) continue;
        const nHat = seeds[b].clone().sub(seeds[a]).normalize();
        const sep = nHat.dot(new THREE.Vector3(seeds[b].x * T_DRIFT, 0, seeds[b].z * T_DRIFT).sub(new THREE.Vector3(seeds[a].x * T_DRIFT, 0, seeds[a].z * T_DRIFT)));
        minSep = Math.min(minSep, sep);
    }
    ck("drift law (lattice)", minSep >= 0.02 - 1e-9, `min ${minSep.toFixed(4)}`);
}

// (e) envelope + NaN + base (stone buckets + beads, translations applied)
{
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity, nan = 0, total = 0;
    for (const node of j.nodes) {
        if (node.mesh === undefined) continue;
        const mesh = j.meshes[node.mesh];
        const pos = va(mesh.primitives[0].attributes.POSITION);
        const tr = node.translation ?? [0, 0, 0];
        for (let i = 0; i < pos.length; i += 3) {
            total++;
            const x = pos[i] + tr[0], y = pos[i + 1] + tr[1], z = pos[i + 2] + tr[2];
            if ([x, y, z].some(isNaN)) { nan++; continue; }
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
        }
    }
    ck("no NaN", nan === 0, `${nan}`);
    ck("base on grade", minY >= -1e-4, `minY ${minY.toFixed(4)}`);
    ck("envelope", Math.abs((maxX - minX) - 5.36) < 0.02 && Math.abs((maxY - minY) - 6.40) < 0.01 && Math.abs((maxZ - minZ) - 3.82) < 0.02,
        `${(maxX - minX).toFixed(2)}x${(maxY - minY).toFixed(2)}x${(maxZ - minZ).toFixed(2)} total verts ${total}`);
}
console.log(f === 0 ? "ALL PASS" : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
