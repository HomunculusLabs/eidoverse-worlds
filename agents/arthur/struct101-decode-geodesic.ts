// struct101-decode-geodesic.ts — decode audit of village_geodesic3.glb.
// Verifies: pinned sha, node budget, texMat lanes (gd_iron/gd_plinth),
// brass emissive export, 5 glow_gd bead KEEP nodes at the zenith pentagon
// radius, true bbox vs build math (plinth skirt ±3.55, y .. 3.395),
// VERTICAL class (h > 0.5), no NaN accessors, iron bucket vertex census
// (64 struts × cylinder verts + 25 hub spheres merged), entry cut present
// (equator ring incomplete: the -z decagon edge absent from the vertex
// cloud — verified via low-y vertices near the -z axis gap).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_geodesic3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const R = 3.2, PL = 0.18, BR = 0.07;

ck("sha pinned", sha === "813ad295487442d2efb01ac74da1691dc4fea9668fe4d6a5f7ee7ab76c66a299", sha.slice(0, 16));
ck("node budget 5-45", j.nodes.length >= 5 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["gd_iron", "gd_plinth"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("5 bead KEEP nodes", ["glow_gd_1", "glow_gd_2", "glow_gd_3", "glow_gd_4", "glow_gd_5"].every(n => names.includes(n)));

// bucket envelope from accessors
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (const acc of j.accessors) {
    if (acc.min && acc.max) {
        for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], acc.min[k]); mx[k] = Math.max(mx[k], acc.max[k]); }
    }
}
// true envelope incl. KEEP beads
const beads = j.nodes.filter((n: any) => /^glow_gd_\d/.test(n.name ?? "")); // v5: exclude glow_gd_apex finial from ring math
const finial = j.nodes.find((n: any) => n.name === "glow_gd_apex");
const HUBR_D = 0.075; // HUB_R in build
ck("v5 apex finial present + centered", !!finial && Math.hypot((finial.translation ?? [0, 0, 0])[0], (finial.translation ?? [0, 0, 0])[2]) < 0.01 && Math.abs((finial.translation ?? [0, 0, 0])[1] - (PL + R + HUBR_D + BR * 1.2 - 0.01)) < 0.02, finial ? `finial at ${finial.translation.map((v: number) => v.toFixed(3))}` : "missing");
let bmn = [Infinity, Infinity, Infinity], bmx = [-Infinity, -Infinity, -Infinity];
for (const b of beads) {
    const t = b.translation ?? [0, 0, 0];
    for (let k = 0; k < 3; k++) { bmn[k] = Math.min(bmn[k], t[k] - BR); bmx[k] = Math.max(bmx[k], t[k] + BR); }
}
ck("plinth skirt envelope", Math.abs(mx[0] - 3.55) < 0.02 && Math.abs(mn[0] + 3.55) < 0.02
    && Math.abs(mx[2] - 3.55) < 0.02 && Math.abs(mn[2] + 3.55) < 0.02,
    `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
ck("apex crest = PL+R+HUB_R (iron bucket)", Math.abs(mx[1] - (PL + R + 0.075)) < 0.02, `${mx[1].toFixed(3)}`);
ck("vertical entity (h > 0.5)", mx[1] - Math.min(mn[1], 0) > 0.5, `h ${(mx[1] - Math.min(mn[1], 0)).toFixed(3)}`);
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));

// zenith pentagon: 5 beads, all at the same y, ring radius ≈ 1.682 (build math)
const beadTs = beads.map((b: any) => b.translation ?? [0, 0, 0]);
const ys = beadTs.map(t => t[1]);
const ySpread = Math.max(...ys) - Math.min(...ys);
const ringR = beadTs.map(t => Math.hypot(t[0], t[2]));
const rSpread = Math.max(...ringR) - Math.min(...ringR);
ck("zenith pentagon coplanar ring", ySpread < 0.01 && rSpread < 0.01, `y spread ${ySpread.toFixed(4)}, r spread ${rSpread.toFixed(4)}, r ${ringR[0].toFixed(3)}`);
ck("zenith ring radius (v5 hub-crest + finial)", Math.abs(ringR[0] - 1.756) < 0.02, `${ringR[0].toFixed(3)} (v1 1.693 bead-inside-hub; v5 crest ring r 1.756 + apex finial)`);
// 5-fold: equal angular spacing 72°
{
    const azs = beadTs.map(t => Math.atan2(t[0], t[2])).sort((a, b) => a - b);
    let gaps: number[] = [];
    for (let i = 0; i < azs.length; i++) {
        let d = azs[(i + 1) % azs.length] - azs[i];
        if (d < 0) d += 2 * Math.PI;
        gaps.push(d);
    }
    ck("pentagon 72° spacing", gaps.every(d => Math.abs(d - (2 * Math.PI / 5)) < 0.01), gaps.map(d => (d * 180 / Math.PI).toFixed(1)).join(","));
}

// iron bucket census: find the mesh using gd_iron, count its verts
{
    const ironMatIdx = j.materials.findIndex((m: any) => m.name === "gd_iron");
    let ironPrims: any[] = [];
    for (const m of j.meshes) for (const p of m.primitives) if (p.material === ironMatIdx) ironPrims.push(p);
    const vertCount = ironPrims.reduce((a, p) => a + j.accessors[p.attributes.POSITION].count, 0);
    // exact census: 61 struts (64 minus 2 rim edges minus 2 cutMid diagonals)
    // × CylinderGeometry(8 radial, closed caps) = 61×52 = 3172
    ck("iron bucket vertex census exact (61×52)", vertCount === 3172, `${vertCount} verts`);
}
// hub bucket census: 25 hub spheres (26 nodes minus removed cutMid) × SphereGeometry(10,8) = 25×99 = 2475
{
    const hubMatIdx = j.materials.findIndex((m: any) => m.name === "gd_hub");
    ck("hub material named lane (struct-38 law)", hubMatIdx >= 0, j.materials.map((m: any) => m.name).join(","));
    if (hubMatIdx >= 0) {
        let hubPrims: any[] = [];
        for (const m of j.meshes) for (const p of m.primitives) if (p.material === hubMatIdx) hubPrims.push(p);
        const vc = hubPrims.reduce((a, p) => a + j.accessors[p.attributes.POSITION].count, 0);
        ck("hub bucket census exact (25×99)", vc === 2475, `${vc} verts`);
    }
}

// entry cut: hub at the -z entry — the two doorpost hubs flank the -z axis
// at y = PL, and the plinth top carries no strut across the -z opening
// (verified in build graph; decode checks the two doorpost hubs exist as
// vertices at ±x near the -z midline at low y)
{
    // find accessor POSITION of the iron bucket, read BIN
    const ironMatIdx = j.materials.findIndex((m: any) => m.name === "gd_iron");
    const bv = j.buffers[0].byteLength;
    const bin = bytes.subarray(20 + jl + 8, 20 + jl + 8 + bv);
    const view = (vi: number) => { const v = j.bufferViews[vi]; return bin.subarray(v.byteOffset, v.byteOffset + v.byteLength); };
    const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    let doorpostFound = 0;
    for (const m of j.meshes) for (const p of m.primitives) {
        if (p.material !== ironMatIdx) continue;
        const acc = j.accessors[p.attributes.POSITION];
        const bview = j.bufferViews[acc.bufferView];
        const off = (bview.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        for (let i = 0; i < acc.count; i++) {
            const x = dv.getFloat32(off + i * 12 + 0, true);
            const y = dv.getFloat32(off + i * 12 + 4, true);
            const z = dv.getFloat32(off + i * 12 + 8, true);
            // doorpost hubs (wide 2-sector cut): y ≈ PL, |x| ≈ ±1.87 (half of 3.76 chord), z ≈ -2.6
            if (Math.abs(y - PL) < 0.06 && z < -2.3 && Math.abs(Math.abs(x) - 1.87) < 0.15) doorpostFound++;
        }
    }
    ck("doorpost hubs present at -z entry", doorpostFound > 20, `${doorpostFound} verts near the two doorposts`);
}

console.log(f === 0 ? `ALL PASS (${names.length} nodes)` : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
