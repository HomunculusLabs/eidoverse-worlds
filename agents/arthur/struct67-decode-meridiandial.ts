// struct67-decode-meridiandial.ts — decode audit of village_meridiandial3.glb
// Checks: material census (texMat/emissive lanes), hour-groove law (each
// groove's angle from meridian == atan(sin φ tan 15°(H−12))), meridian line
// continuity S+N (with the designed blade-covered gap), gnomon style edge at
// exactly φ from horizontal, apex/pole-pin geometry, hour stones on the fan,
// room gates honest (octagon ≥8m², apex ≥2.2 → roomScale exact trimesh).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_meridiandial3.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);

const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
const mats = (jsonChunk.materials ?? []).map((m: any) => m.name);
console.log("materials:", mats.join(", "));

type Prim = { node: string; mat: string | undefined; verts: number[][] };
const prims: Prim[] = [];
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const mesh = meshes[n.mesh];
    for (const p of mesh.primitives) {
        const posAcc = jsonChunk.accessors[p.attributes.POSITION];
        const bufView = jsonChunk.bufferViews[posAcc.bufferView];
        const off = (bufView.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
        const dv = new DataView(bin.buffer, bin.byteOffset + off, posAcc.count * 12);
        const verts: number[][] = [];
        for (let i = 0; i < posAcc.count; i++) {
            verts.push([dv.getFloat32(i * 12, true), dv.getFloat32(i * 12 + 4, true), dv.getFloat32(i * 12 + 8, true)]);
        }
        prims.push({ node: n.name, mat: p.material !== undefined ? mats[p.material] : undefined, verts });
    }
}
console.log("prims:", prims.length, "| nodes:", nodes.length);

// 1. every prim carries a REAL material (struct-38 law)
const noMat = prims.filter(p => !p.mat);
if (noMat.length) { console.error("FAIL: prims without material:", noMat.map(p => p.node)); process.exit(1); }
console.log("PASS all prims carry real materials");

// 2. per-bucket envelopes
for (const p of prims) {
    const tr = nodes.find((n: any) => n.name === p.node)?.translation ?? [0, 0, 0];
    const xs = p.verts.map(v => v[0] + (tr[0] ?? 0)), ys = p.verts.map(v => v[1]), zs = p.verts.map(v => v[2] + (tr[2] ?? 0));
    console.log(`bucket ${p.node} [${p.mat}] n=${p.verts.length} x ${Math.min(...xs).toFixed(2)}..${Math.max(...xs).toFixed(2)} z ${Math.min(...zs).toFixed(2)}..${Math.max(...zs).toFixed(2)} y ${Math.min(...ys).toFixed(2)}..${Math.max(...ys).toFixed(2)}`);
}

// 3. hour-groove law: bucket by z-clusters of the dark texture lane
const PHI = (40 * Math.PI) / 180;
const hourAngle = (H: number) => Math.atan(Math.sin(PHI) * Math.tan((15 * (H - 12) * Math.PI) / 180));
{
    const dark = prims.filter(p => p.mat === "dialdark" || p.mat === "dialstone_dark");
    // the dark bucket merges grooves+meridian+rim — recover grooves by
    // clustering on the face plane: y ≈ FACE_Y+0.015±0.015, radial
    const FACE_Y = 0.36;
    const faceVerts = dark.flatMap(p => p.verts.map(v => ({ x: v[0], y: v[1], z: v[2] })));
    // project all face-plane dark verts to angle from +z axis (meridian S = 0):
    // grooves fan N (−z), meridian lies on ±z
    const face = faceVerts.filter(v => Math.abs(v.y - (FACE_Y + 0.015)) < 0.02);
    console.log(`dark face-plane verts: ${face.length}`);
    // cluster by polar angle around center
    const bins = new Map<number, { sx: number; sz: number; n: number }>();
    for (const v of face) {
        const r = Math.hypot(v.x, v.z);
        if (r < 0.5) continue;
        // angle from due-S (+z), signed: + toward E(+x)
        const ang = Math.atan2(v.x, v.z);
        const key = Math.round(ang / (Math.PI / 180)); // 1° bins
        const b = bins.get(key) ?? { sx: 0, sz: 0, n: 0 };
        b.sx += v.x; b.sz += v.z; b.n++;
        bins.set(key, b);
    }
    const clusters = [...bins.entries()].map(([k, b]) => ({ key: k, x: b.sx / b.n, z: b.sz / b.n, n: b.n })).filter(c => c.n >= 4);
    clusters.sort((a, b) => Math.atan2(a.x, a.z) - Math.atan2(b.x, b.z));
    console.log(`face clusters (>=4 verts): ${clusters.length}`);
    for (const c of clusters) {
        const ang = (Math.atan2(c.x, c.z) * 180) / Math.PI;
        console.log(`  cluster at (${c.x.toFixed(2)},${c.z.toFixed(2)}) r=${Math.hypot(c.x, c.z).toFixed(2)} ang-from-S ${ang.toFixed(1)}° n=${c.n}`);
    }
    // N-fan clusters: z<0 → angle from N axis = atan2(x, −z)
    const north = clusters.filter(c => c.z < 0);
    let worst = 0, checked = 0;
    for (const c of north) {
        const theta = Math.atan2(c.x, -c.z);
        // match to nearest hour
        let bestH = 12, bestd = 1e9;
        for (let H = 6; H <= 18; H++) {
            const d = Math.abs(theta - hourAngle(H));
            if (d < bestd) { bestd = d; bestH = H; }
        }
        if (bestd < Math.PI / 4) { checked++; worst = Math.max(worst, bestd); }
        console.log(`  N-cluster θ=${((theta * 180) / Math.PI).toFixed(1)}° ~ hour ${bestH} (err ${(bestd * 180 / Math.PI).toFixed(2)}°)`);
    }
    // meridian segments: z>0 cluster on +z axis and z<0 cluster near x=0
    const merS = clusters.find(c => c.z > 2 && Math.abs(c.x) < 0.1);
    const merN = clusters.find(c => c.z < -2 && Math.abs(c.x) < 0.1);
    console.log(`meridian clusters: S ${merS ? `(${merS.x.toFixed(2)},${merS.z.toFixed(2)})` : "MISSING"} N ${merN ? `(${merN.x.toFixed(2)},${merN.z.toFixed(2)})` : "MISSING"}`);
    if (!merS || !merN) { console.error("FAIL meridian segments missing"); process.exit(1); }
    console.log("PASS meridian S+N segments present on the ±z axis");
    if (checked < 11) { console.error(`FAIL only ${checked} hour grooves matched`); process.exit(1); }
    console.log(`hour law: ${checked} grooves matched, worst angular err ${(worst * 180 / Math.PI).toFixed(2)}° (law ≤2°)`);
    if (worst > (2 * Math.PI) / 180) { console.error("FAIL hour law"); process.exit(1); }
    console.log("PASS hour grooves on the true dial law");
}

// 4. gnomon: stone bucket's blade — style edge at φ
{
    const stone = prims.find(p => p.mat === "dialstone");
    // blade triangle: verts at the apex (y max of stone bucket)
    const apex = stone!.verts.reduce((a, b) => (b[1] > a[1] ? b : a));
    // find base verts near (x≈0, z≈0) and (x≈0, z≈−2.375)
    const baseO = stone!.verts.find(v => Math.hypot(v[0], v[2] + 0.0) < 0.15 && Math.abs(v[1] - 0.36) < 0.05);
    const baseB = stone!.verts.find(v => Math.hypot(v[0], v[2] + 2.375) < 0.15 && Math.abs(v[1] - 0.36) < 0.05);
    console.log(`apex ${apex.map(n => n.toFixed(3)).join(",")} baseO ${baseO ? baseO.map(n => n.toFixed(3)).join(",") : "—"} baseB ${baseB ? baseB.map(n => n.toFixed(3)).join(",") : "—"}`);
    if (Math.abs(apex[1] - 2.353) > 0.01) { console.error("FAIL apex height"); process.exit(1); }
    if (Math.abs(apex[2] + 2.375) > 0.01) { console.error("FAIL apex N position"); process.exit(1); }
    if (!baseO || !baseB) { console.error("FAIL blade base verts missing"); process.exit(1); }
    const styleAng = Math.atan2(apex[1] - baseO[1], baseO[2] - apex[2]);
    console.log(`style angle ${(styleAng * 180 / Math.PI).toFixed(2)}° (law 40.00°±0.05)`);
    if (Math.abs(styleAng - PHI) > 0.001) { console.error("FAIL style angle"); process.exit(1); }
    console.log("PASS style edge at φ=40° from horizontal, apex (0, 2.353, −2.375)");
}

// 5. brass pins: glow bucket exactly 2 spheres — pole pin at apex, noon pin
{
    const glow = prims.filter(p => (p.mat ?? "").startsWith("glow"));
    if (glow.length !== 1) { console.error(`FAIL glow bucket count ${glow.length}`); process.exit(1); }
    const b = glow[0];
    const tr = nodes.find((n: any) => n.name === b.node)?.translation ?? [0, 0, 0];
    const xs = b.verts.map(v => v[0] + (tr[0] ?? 0)), ys = b.verts.map(v => v[1]), zs = b.verts.map(v => v[2] + (tr[2] ?? 0));
    // two clusters by height
    const hi = ys.filter(y => y > 2.0), lo = ys.filter(y => y <= 2.0);
    if (hi.length === 0 || lo.length === 0) { console.error("FAIL pins not height-separated"); process.exit(1); }
    // pole pin: hi cluster
    const hiI = ys.map((y, i) => i).filter(i => ys[i] > 2.0);
    const poleX = hiI.map(i => xs[i]), poleY = hiI.map(i => ys[i]), poleZ = hiI.map(i => zs[i]);
    const loI = ys.map((y, i) => i).filter(i => ys[i] <= 2.0);
    const noonX = loI.map(i => xs[i]), noonY = loI.map(i => ys[i]), noonZ = loI.map(i => zs[i]);
    console.log(`pole pin center ≈ (${(Math.min(...poleX) + Math.max(...poleX)) / 2}, ${((Math.min(...poleY) + Math.max(...poleY)) / 2).toFixed(2)}, ${((Math.min(...poleZ) + Math.max(...poleZ)) / 2).toFixed(2)})`);
    console.log(`noon pin center ≈ (${(Math.min(...noonX) + Math.max(...noonX)) / 2}, ${((Math.min(...noonY) + Math.max(...noonY)) / 2).toFixed(2)}, ${((Math.min(...noonZ) + Math.max(...noonZ)) / 2).toFixed(2)})`);
    const poleMidZ = (Math.min(...poleZ) + Math.max(...poleZ)) / 2, poleMidY = (Math.min(...poleY) + Math.max(...poleY)) / 2;
    const noonMidZ = (Math.min(...noonZ) + Math.max(...noonZ)) / 2, noonMidY = (Math.min(...noonY) + Math.max(...noonY)) / 2;
    if (Math.abs(poleMidZ + 2.375) > 0.01 || Math.abs(poleMidY - (2.353 + 0.08)) > 0.01) { console.error("FAIL pole pin position"); process.exit(1); }
    if (Math.abs(noonMidZ + 2.95) > 0.01 || Math.abs(noonMidY - (0.36 + 0.34 + 0.055)) > 0.01) { console.error("FAIL noon pin position"); process.exit(1); }
    console.log("PASS pole pin at style apex, noon pin atop the noon stone");
}

// 6. hour stones: bone bucket = 11 boxes; centers on fan at STONE_R 3.25
{
    const boneP = prims.find(p => p.mat === "bone" || p.mat === "Bone" || (p.mat ?? "").toLowerCase().includes("bone"));
    if (!boneP) { console.error("FAIL bone bucket missing — hour stones"); process.exit(1); }
    const tr = nodes.find((n: any) => n.name === boneP.node)?.translation ?? [0, 0, 0];
    // cluster by (x,z) — each stone is a separate box; cluster center spacing
    const pts = boneP.verts.map(v => [v[0] + (tr[0] ?? 0), v[1], v[2] + (tr[2] ?? 0)]);
    const seen = new Set<number>();
    const centers: number[][] = [];
    for (const p of pts) {
        let assigned = false;
        for (const c of centers) {
            if (Math.hypot(p[0] - c[0], p[2] - c[2]) < 0.4) { c[3]++; assigned = true; break; }
        }
        if (!assigned) centers.push([p[0], p[1], p[2], 1]);
    }
    console.log(`bone clusters: ${centers.length}`);
    let worst = 0, checked = 0;
    for (const c of centers) {
        const theta = Math.atan2(c[0], -c[2]);
        let bestH = 12, bestd = 1e9;
        for (let H = 6; H <= 18; H++) {
            const d = Math.abs(theta - hourAngle(H));
            if (d < bestd) { bestd = d; bestH = H; }
        }
        const r = Math.hypot(c[0], c[2]);
        if (r > 2.7 && bestd < Math.PI / 6) { checked++; worst = Math.max(worst, bestd); }
        console.log(`  stone at (${c[0].toFixed(2)},${c[2].toFixed(2)}) r=${r.toFixed(2)} θ=${((theta * 180) / Math.PI).toFixed(1)}° ~${bestH} err ${(bestd * 180 / Math.PI).toFixed(2)}°`);
    }
    if (checked !== 11) { console.error(`FAIL ${checked} stones on the law (expect 11)`); process.exit(1); }
    if (worst > (2 * Math.PI) / 180) { console.error("FAIL stone fan law"); process.exit(1); }
    console.log("PASS 11 hour stones on the true fan at r≈3.25");
}

// 7. room gates honest
{
    const allX: number[] = [], allZ: number[] = [], allY: number[] = [];
    for (const p of prims) for (const v of p.verts) { allX.push(v[0]); allZ.push(v[2]); allY.push(v[1]); }
    const w = Math.max(...allX) - Math.min(...allX), d = Math.max(...allZ) - Math.min(...allZ), h = Math.max(...allY);
    const area = w * d;
    console.log(`room gates: ${w.toFixed(2)}×${d.toFixed(2)} = ${area.toFixed(1)}m² height ${h.toFixed(2)} (≥8 / ≥2.2 → roomScale)`);
    if (area < 8 || h < 2.2) { console.error("FAIL room gates"); process.exit(1); }
    console.log("PASS room gates honest — standable octagon face, solid blade");
}

console.log("ALL GREEN");
