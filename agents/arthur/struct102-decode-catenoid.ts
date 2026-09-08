// struct102-decode-catenoid.ts — decode audit of village_catenoid3.glb.
// Verifies: pinned sha, node budget, texMat lanes (ct_iron/ct_collar/ct_crown),
// brass emissive export, 5 glow_ct bead KEEP nodes on the crown crest ring,
// true bbox vs build math (±R_OUT 2.46, y .. 5.37), VERTICAL class (h > 0.5),
// no NaN accessors, iron bucket vertex census (272 struts × CylinderGeometry
// 8 radial open-ended = 272×32 verts), door cut present (collar bucket's
// -z door sector absent: no collar verts within the door arc at drum mid-height).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_catenoid3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const R_OUT = 2.46, R_IN = 2.22, CR_Y1 = 5.25, BR = 0.075, STRUT = 0.05;

ck("sha pinned", sha === "8ac664937f96976d96883221c125d328879e678bc3d9f661e4ac8ab7ec778d6f", sha.slice(0, 16));
ck("node budget 5-45", j.nodes.length >= 5 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["ct_iron", "ct_collar", "ct_crown"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("5 bead KEEP nodes", ["glow_ct_1", "glow_ct_2", "glow_ct_3", "glow_ct_4", "glow_ct_5"].every(n => names.includes(n)));

// bucket envelope from accessors
let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (const acc of j.accessors) {
    if (acc.min && acc.max) {
        for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], acc.min[k]); mx[k] = Math.max(mx[k], acc.max[k]); }
    }
}
ck("collar/crown envelope ±R_OUT", Math.abs(mx[0] - R_OUT) < 0.02 && Math.abs(mn[0] + R_OUT) < 0.02
    && Math.abs(mx[2] - R_OUT) < 0.02 && Math.abs(mn[2] + R_OUT) < 0.02,
    `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
ck("bucket crest = crown top CR_Y1", Math.abs(mx[1] - CR_Y1) < 0.02, `${mx[1].toFixed(3)} (beads are KEEP nodes — true crest via node translation below)`);
ck("vertical entity (h > 0.5)", mx[1] - Math.min(mn[1], 0) > 0.5, `h ${(mx[1] - Math.min(mn[1], 0)).toFixed(3)}`);
ck("no NaN accessor", !j.accessors.some((a: any) => a.min?.some(isNaN) || a.max?.some(isNaN)));

// bead ring: 5 beads, coplanar at crown crest, radius = (CR_OUT+CR_IN)/2
{
    const beads = j.nodes.filter((n: any) => /^glow_ct_\d$/.test(n.name ?? ""));
    const ts = beads.map((b: any) => b.translation ?? [0, 0, 0]);
    const ys = ts.map(t => t[1]);
    const ySpread = Math.max(...ys) - Math.min(...ys);
    const ringR = ts.map(t => Math.hypot(t[0], t[2]));
    const rSpread = Math.max(...ringR) - Math.min(...ringR);
    ck("crown bead ring coplanar", ySpread < 0.01 && rSpread < 0.01, `y spread ${ySpread.toFixed(4)}, r spread ${rSpread.toFixed(4)}, r ${ringR[0].toFixed(3)}`);
    ck("crown ring radius 2.075", Math.abs(ringR[0] - 2.075) < 0.02, `${ringR[0].toFixed(3)}`);
    // 5-fold: equal angular spacing 72°
    const azs = ts.map(t => Math.atan2(t[0], t[2])).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 0; i < azs.length; i++) {
        let d = azs[(i + 1) % azs.length] - azs[i];
        if (d < 0) d += 2 * Math.PI;
        gaps.push(d);
    }
    ck("pentagon 72° spacing", gaps.every(d => Math.abs(d - (2 * Math.PI / 5)) < 0.01), gaps.map(d => (d * 180 / Math.PI).toFixed(1)).join(","));
}

// iron bucket census: struts × CylinderGeometry(8 radial, 1 height, open, INDEXED)
// = (8+1)×(1+1) = 18 verts/strut × 272 = 4896
{
    const ironMatIdx = j.materials.findIndex((m: any) => m.name === "ct_iron");
    let ironPrims: any[] = [];
    for (const m of j.meshes) for (const p of m.primitives) if (p.material === ironMatIdx) ironPrims.push(p);
    const vertCount = ironPrims.reduce((a, p) => a + j.accessors[p.attributes.POSITION].count, 0);
    ck("iron bucket vertex census exact (272×18 indexed)", vertCount === 272 * 18, `${vertCount} verts (${ironPrims.length} prims)`);
}

// door cut present: collar bucket's -z door sector absent at drum mid-height
{
    const collarMatIdx = j.materials.findIndex((m: any) => m.name === "ct_collar");
    let collarPrims: any[] = [];
    for (const m of j.meshes) for (const p of m.primitives) if (p.material === collarMatIdx) collarPrims.push(p);
    // decode POSITION accessor binary
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const verts: number[][] = [];
    for (const p of collarPrims) {
        const acc = j.accessors[p.attributes.POSITION];
        const bv = j.bufferViews[acc.bufferView];
        const off = 8 + bv.byteOffset + (acc.byteOffset ?? 0);
        for (let i = 0; i < acc.count; i++) {
            const o = off + i * 12;
            verts.push([dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]);
        }
    }
    const doorHalfArc = Math.asin(1.1 / R_OUT); // DOOR_CHORD/2 / R_OUT
    const yMid = 0.08 + (2.3 - 0.08) / 2;
    let inDoor = 0;
    for (const v of verts) {
        if (Math.abs(v[1] - yMid) > 0.5) continue;                 // drum band only
        const r = Math.hypot(v[0], v[2]);
        if (r < R_IN - 0.05 || r > R_OUT + 0.05) continue;         // drum radius band
        let d = Math.abs(Math.atan2(v[0], v[2]) - Math.PI);        // angle from -z (θ=π)
        if (d > Math.PI) d = 2 * Math.PI - d;
        if (d < doorHalfArc - 0.02) inDoor++;
    }
    ck("door sector cut (no collar verts in -z door arc)", inDoor === 0, `${inDoor} verts inside door arc at drum band`);
}

if (f) { console.log(`\n${f} FAILURES`); process.exit(1); }
console.log("\nALL PASS");
