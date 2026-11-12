// debug7-bower.ts — bisect the REAL 33-cell build: check cell-0 side verts
// at (1) sidePos array, (2) Float32BufferAttribute readback, (3) after
// computeVertexNormals, (4) after mergekit, in one process.
import * as THREE from "three";
import { texMat } from "./assets/glbwrite.ts";
import { mergeByMaterial } from "./assets/mergekit.ts";

// ==== copy of mk derivation ====
const DISK_R = 2.4, R0 = 0.45, R1 = 2.05, TURNS = 2;
const K = Math.log(R1 / R0) / (TURNS * 2 * Math.PI);
const DS = 0.42;
const SPIRAL_L = Math.sqrt(1 + K * K) * (R1 - R0) / K;
type Seed = { x: number; z: number; r: number };
const seeds: Seed[] = [{ x: 0, z: 0, r: 0 }];
{ let s = 0, th = 0; while (s <= SPIRAL_L) { const r = R0 * Math.exp(K * th); seeds.push({ x: r * Math.cos(th), z: r * Math.sin(th), r }); th += DS / (Math.sqrt(1 + K * K) * r); s += DS; } }
const N = seeds.length;
type P2 = [number, number];
function cellOf(i: number): P2[] {
    let poly: P2[] = [];
    for (let k = 0; k < 48; k++) { const a = k * 2 * Math.PI / 48; poly.push([DISK_R * Math.cos(a), DISK_R * Math.sin(a)]); }
    const si = seeds[i];
    for (let jj = 0; jj < N; jj++) {
        if (jj === i) continue;
        const sj = seeds[jj];
        const mx = (si.x + sj.x) / 2, mz = (si.z + sj.z) / 2;
        const dx = si.x - sj.x, dz = si.z - sj.z;
        const out: P2[] = [];
        for (let e = 0; e < poly.length; e++) {
            const cur = poly[e], nxt = poly[(e + 1) % poly.length];
            const dc = (cur[0] - mx) * dx + (cur[1] - mz) * dz;
            const dn = (nxt[0] - mx) * dx + (nxt[1] - mz) * dz;
            if (dc >= 0) out.push(cur);
            if ((dc >= 0) !== (dn >= 0)) { const t = dc / (dc - dn); out.push([cur[0] + (nxt[0] - cur[0]) * t, cur[1] + (nxt[1] - cur[1]) * t]); }
        }
        poly = out;
        if (poly.length < 3) break;
    }
    return poly;
}
const TOP = 2.90, T_MIN = 0.24, T_SPAN = 0.42;
const bottoms = seeds.map(s => TOP - (T_MIN + T_SPAN * (1 - Math.min(s.r, R1) / R1)));
const darkTex = texMat("vw_dark", [0x3c3a32, 0x444138, 0x34322c], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 10, seed: 7701 });
const stoneTex = texMat("vw_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 7703 });

// build ONLY cell 0 sides exactly as the mk does
const poly = cellOf(0), yTop = TOP, yBot = bottoms[0];
const sidePos: number[] = [];
const cx0 = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz0 = poly.reduce((s, p) => s + p[1], 0) / poly.length;
for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const outward = dz * ((a[0] + b[0]) / 2 - cx0) - dx * ((a[1] + b[1]) / 2 - cz0);
    if (outward <= 0) throw Error(`winding edge ${k}`);
    sidePos.push(a[0], yTop, a[1], b[0], yTop, b[1], a[0], yBot, a[1]);
    sidePos.push(b[0], yTop, b[1], b[0], yBot, b[1], a[0], yBot, a[1]);
}
const expect = (i: number) => {
    const k = Math.floor(i / 6), a = poly[k], b = poly[(k + 1) % poly.length];
    return [[a[0], yTop, a[1]], [b[0], yTop, b[1]], [a[0], yBot, a[1]], [b[0], yTop, b[1]], [b[0], yBot, b[1]], [a[0], yBot, a[1]]][i % 6];
};
let bad1 = 0;
for (let i = 0; i < sidePos.length / 3; i++) { const e = expect(i); if (Math.abs(sidePos[i * 3] - e[0]) > 1e-9 || Math.abs(sidePos[i * 3 + 2] - e[2]) > 1e-9) bad1++; }
console.log(`(1) sidePos array: ${bad1} bad of ${sidePos.length / 3}`);
const attr = new THREE.Float32BufferAttribute(sidePos, 3);
let bad2 = 0;
for (let i = 0; i < attr.count; i++) { const e = expect(i); if (Math.abs(attr.getX(i) - e[0]) > 1e-7 || Math.abs(attr.getZ(i) - e[2]) > 1e-7) bad2++; }
console.log(`(2) attribute readback: ${bad2} bad`);
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", attr);
geo.computeVertexNormals();
let bad3 = 0;
for (let i = 0; i < attr.count; i++) { const e = expect(i); if (Math.abs(attr.getX(i) - e[0]) > 1e-7 || Math.abs(attr.getZ(i) - e[2]) > 1e-7) bad3++; }
console.log(`(3) after computeVertexNormals: ${bad3} bad`);
// full 33-cell group exactly like the mk
const g = new THREE.Group();
for (let ci = 0; ci < N; ci++) {
    const p = cellOf(ci), yb = bottoms[ci];
    const sp: number[] = [];
    const mx0 = p.reduce((s, q) => s + q[0], 0) / p.length, mz0 = p.reduce((s, q) => s + q[1], 0) / p.length;
    const cp: number[] = [];
    for (let k = 1; k < p.length - 1; k++) {
        const [ax, az] = p[0], [bx, bz] = p[k], [cxx, czz] = p[k + 1];
        cp.push(ax, TOP, az, cxx, TOP, czz, bx, TOP, bz);
        cp.push(ax, yb, az, bx, yb, bz, cxx, yb, czz);
    }
    const capGeo = new THREE.BufferGeometry();
    capGeo.setAttribute("position", new THREE.Float32BufferAttribute(cp, 3));
    capGeo.computeVertexNormals();
    for (let k = 0; k < p.length; k++) {
        const a = p[k], b = p[(k + 1) % p.length];
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const outward = dz * ((a[0] + b[0]) / 2 - mx0) - dx * ((a[1] + b[1]) / 2 - mz0);
        if (outward <= 0) throw Error(`winding cell ${ci} edge ${k}`);
        sp.push(a[0], TOP, a[1], b[0], TOP, b[1], a[0], yb, a[1]);
        sp.push(b[0], TOP, b[1], b[0], yb, b[1], a[0], yb, a[1]);
    }
    const sideGeo = new THREE.BufferGeometry();
    sideGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    sideGeo.computeVertexNormals();
    g.add(new THREE.Mesh(capGeo, stoneTex), new THREE.Mesh(sideGeo, darkTex));
}
// check the FIRST dark child in the group BEFORE merge
{
    const first = g.children.find(c => (c as any).isMesh && (((c as THREE.Mesh).material as any)?.userData?.texName === "vw_dark"));
    const posA = (first as THREE.Mesh)!.geometry.getAttribute("position");
    let bad = 0;
    for (let i = 0; i < posA.count; i++) { const e = expect(i); if (Math.abs(posA.getX(i) - e[0]) > 1e-7 || Math.abs(posA.getZ(i) - e[2]) > 1e-7) { bad++; if (bad < 3) console.log(`  (4a) BAD i${i}: (${posA.getX(i)},${posA.getY(i)},${posA.getZ(i)}) want (${e})`); } }
    console.log(`(4a) first dark mesh in group (${first?.name}, ${posA.count} verts): ${bad} bad`);
}
const merged = mergeByMaterial(g, "t");
{
    const darkMesh = merged.children.find((c: any) => (c as THREE.Mesh).isMesh && ((c as THREE.Mesh).material as any)?.userData?.texName === "vw_dark") as THREE.Mesh;
    const posA = darkMesh.geometry.getAttribute("position");
    let bad = 0;
    for (let i = 0; i < posA.count && i < 48; i++) { const e = expect(i); if (Math.abs(posA.getX(i) - e[0]) > 1e-7 || Math.abs(posA.getZ(i) - e[2]) > 1e-7) { bad++; if (bad < 3) console.log(`  (4b) BAD i${i}: (${posA.getX(i)},${posA.getY(i)},${posA.getZ(i)}) want (${e})`); } }
    console.log(`(4b) merged dark mesh (${posA.count} verts; first 48 checked): ${bad} bad`);
}
// (5) toGLB on this exact merged group, byte-check the dark prim
{
    const { toGLB } = await import("./assets/glbwrite.ts");
    const buf = toGLB(merged);
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const jl = bytes.readUInt32LE ? (buf as any).readUInt32LE(12) : new DataView(bytes.buffer).getUint32(12, true);
    // Buffer has readUInt32LE; use buf directly
    const j2 = JSON.parse(buf.subarray(20, 20 + jl).toString());
    const views2 = j2.bufferViews ?? [];
    let BIN = 20 + jl + 8;
    outer2: for (const n of j2.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j2.meshes[n.mesh].primitives) {
            if (j2.materials[prim.material]?.name !== "vw_dark") continue;
            const acc = j2.accessors[prim.attributes.POSITION];
            const bv = views2[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            let bad = 0;
            for (let i = 0; i < acc.count && i < 48; i++) {
                const p = BIN + off + i * 12;
                const e = expect(i);
                const x = buf.readFloatLE(p), y = buf.readFloatLE(p + 4), z = buf.readFloatLE(p + 8);
                if (Math.abs(x - e[0]) > 1e-7 || Math.abs(z - e[2]) > 1e-7) { bad++; if (bad < 4) console.log(`  (5) BAD i${i}: (${x},${y},${z}) want (${e})`); }
            }
            console.log(`(5) toGLB in-process dark prim (${acc.count} verts; first 48 checked): ${bad} bad`);
            break outer2;
        }
    }
}
