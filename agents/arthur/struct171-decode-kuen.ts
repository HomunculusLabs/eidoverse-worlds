// struct171-decode-kuen.ts — independent byte-side audit of village_kuen3.glb
// (struct-171, R11-7). Parses the GLB directly (no three.js): node census,
// KEEP glow, texMat lanes, doubleSided, envelope with node translations,
// film symmetry census, spine/rib presence. RED control: any other GLB FAILs.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "agents/arthur/assets/village_kuen3.glb";
const b = readFileSync(path);
if (b.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
const jlen = b.readUInt32LE(12);
const json = JSON.parse(b.slice(20, 20 + jlen).toString("utf8"));

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};

// 1. node census + KEEP glow (5 nodes: 4 texMat buckets + 1 glow KEEP)
const nodes = json.nodes ?? [];
const named = nodes.filter((n: any) => n.name).map((n: any) => n.name);
check("node budget 2-45 (merged statics)", nodes.length >= 2 && nodes.length <= 45, `${nodes.length} nodes: ${named.join(",")}`);
check("exactly 1 KEEP glow node glow_ku_1", named.filter((n: string) => /^glow_/.test(n)).length === 1 && named.includes("glow_ku_1"), named.filter((n: string) => n.startsWith("glow_")).join(","));

// 2. materials
const mats = json.materials ?? [];
const mnames = mats.map((m: any) => m.name);
check("texMat lanes present", ["ku_bone", "ku_iron", "ku_brass", "ku_stone"].every((m) => mnames.includes(m)), mnames.join(","));
const bone = mats.find((m: any) => m.name === "ku_bone");
check("ku_bone doubleSided (film law)", bone?.doubleSided === true, `doubleSided=${bone?.doubleSided}`);
const glowMat = mats.find((m: any) => (m.name ?? "").startsWith("glow") || (m.emissiveFactor ?? []).some((v: number) => v > 0.05));
check("glow material carries emissiveFactor", !!glowMat, glowMat?.name ?? "none");

// 3. accessor envelope WITH node translations (monkeysaddle-decode chassis:
//    identity-q/unit-scale asserted, translation applied — pitfall-4 law)
function accMin(k: number) { return (p: any) => p.min?.[k] ?? Infinity; }
let gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
let meshCount = 0;
for (const n of nodes) {
    const q = n.rotation;
    const isIdentityQ = !q || (q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 1);
    const isUnitScale = !n.scale || (n.scale[0] === 1 && n.scale[1] === 1 && n.scale[2] === 1);
    if (!isIdentityQ || !isUnitScale) throw Error(`node ${n.name} carries non-identity TRS — decode must apply full TRS`);
    if (n.mesh === undefined) continue;
    const mesh = json.meshes[n.mesh];
    for (const prim of mesh.primitives) {
        const posA = json.accessors[prim.attributes.POSITION];
        meshCount++;
        const t = n.translation ?? [0, 0, 0];
        for (let k = 0; k < 3; k++) {
            gmin[k] = Math.min(gmin[k], posA.min[k] + t[k]);
            gmax[k] = Math.max(gmax[k], posA.max[k] + t[k]);
        }
    }
}
const EPS = 0.01;
check("envelope x [~-1.02..~2.02] plan 3.05±0.02 (asymmetric lean law)", Math.abs((gmax[0] - gmin[0]) - 3.05) < EPS && gmin[0] > -1.1 && gmax[0] < 2.1, `x [${gmin[0].toFixed(3)}..${gmax[0].toFixed(3)}]`);
check("envelope y on grade [0..4.66] ±0.01 (v3 crown bead)", Math.abs(gmin[1]) < EPS && Math.abs(gmax[1] - 4.66) < EPS, `y [${gmin[1].toFixed(3)}..${gmax[1].toFixed(3)}]`);
check("envelope z 2.13±0.02 symmetric about 0", Math.abs((gmax[2] - gmin[2]) - 2.13) < EPS && Math.abs(gmin[2] + gmax[2]) < 0.02, `z [${gmin[2].toFixed(3)}..${gmax[2].toFixed(3)}] center ${((gmin[2] + gmax[2]) / 2).toFixed(3)}`);
console.log(`      meshes: ${meshCount}, envelope x[${gmin[0].toFixed(3)}..${gmax[0].toFixed(3)}] y[${gmin[1].toFixed(3)}..${gmax[1].toFixed(3)}] z[${gmin[2].toFixed(3)}..${gmax[2].toFixed(3)}]`);

// 4. glow bead placement: node translation of glow_ku_1 == crown seat
//    (0, 4.43+0.08+0.10-0.05 = 4.56, 0) ±0.005 (v3 crown law; envelope top
//    extends to 4.56+0.10 = 4.66)
{
    const gn = nodes.find((n: any) => n.name === "glow_ku_1");
    const t = gn?.translation ?? [NaN, NaN, NaN];
    const seat = 4.43 + 0.08 + 0.10 - 0.05;
    check("glow_ku_1 at crown seat (0, 4.56, 0)", Math.abs(t[0]) < 0.005 && Math.abs(t[1] - seat) < 0.005 && Math.abs(t[2]) < 0.005, `t=${t.map((v: number) => v.toFixed(3)).join(",")}`);
}

// 5. film mirror-symmetry census on the bone bucket: for every film vertex
//    (x,y,z) a partner (x,y,-z) must exist within 0.4mm (sampled, spatial hash)
{
    const bonePrim = (() => {
        for (const n of nodes) {
            if (n.mesh === undefined) continue;
            const mesh = json.meshes[n.mesh];
            for (const prim of mesh.primitives) {
                const matIdx = prim.material;
                if (json.materials[matIdx]?.name === "ku_bone") return { prim, n };
            }
        }
        return null;
    })();
    if (!bonePrim) { check("film bucket found", false); }
    else {
        // decode positions from the binary chunk (readFloatLE — Buffer.pool
        // law: .buffer on a sliced Buffer returns the WHOLE pool, wrong memory)
        const view = json.bufferViews[json.accessors[bonePrim.prim.attributes.POSITION].bufferView];
        const off = view.byteOffset ?? 0;
        const cnt = json.accessors[bonePrim.prim.attributes.POSITION].count;
        const start = 20 + jlen + 8 + off;
        const arr = new Float32Array(cnt * 3);
        for (let i = 0; i < cnt * 3; i++) arr[i] = b.readFloatLE(start + i * 4);
        const t = bonePrim.n.translation ?? [0, 0, 0];
        const pts: number[][] = [];
        for (let i = 0; i < cnt; i++) pts.push([arr[i * 3] + t[0], arr[i * 3 + 1] + t[1], arr[i * 3 + 2] + t[2]]);
        const cell = 0.02;
        const key = (x: number, y: number, z: number) => `${Math.round(x / cell)},${Math.round(y / cell)},${Math.round(z / cell)}`;
        const grid = new Map<string, number[][]>();
        pts.forEach((p) => { const k = key(p[0], p[1], p[2]); const a = grid.get(k); if (a) a.push(p); else grid.set(k, [p]); });
        let miss = 0, checked = 0;
        for (let i = 0; i < pts.length; i += Math.max(1, Math.floor(pts.length / 2000))) {
            const p = pts[i];
            checked++;
            const partners = grid.get(key(p[0], p[1], -p[2]));
            const ok = partners?.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] + p[2]) < 4e-4);
            if (!ok) miss++;
        }
        check("film mirror-symmetry census (sampled ~2000 verts, <2% partner-miss allowed at fold offset)", miss / Math.max(1, checked) < 0.02, `${miss}/${checked} misses`);
    }
}

// 6. brass bucket census: mergeByMaterial fused spine+sleeve into ONE
//    ku_brass bucket — per-member bands are invisible; source-true law is the
//    BUCKET RANGE: bottom = spine tube bottom (2.42 - 0.028) and top = sleeve
//    top (4.51), both ±0.005. (Sleeve-only would read bottom ≈ 4.35; spine-only
//    would read top ≈ 2.45.)
{
    let yMin = Infinity, yMax = -Infinity;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        const mesh = json.meshes[n.mesh];
        for (const prim of mesh.primitives) {
            if (json.materials[prim.material]?.name !== "ku_brass") continue;
            const a = json.accessors[prim.attributes.POSITION];
            const t = n.translation ?? [0, 0, 0];
            yMin = Math.min(yMin, a.min[1] + t[1]); yMax = Math.max(yMax, a.max[1] + t[1]);
        }
    }
    check("ku_brass bucket spans spine-bottom (2.392) to sleeve-top (4.510) — both members fused",
        Math.abs(yMin - (2.42 - 0.028)) < 0.005 && Math.abs(yMax - 4.51) < 0.005,
        `brass y [${yMin.toFixed(3)}..${yMax.toFixed(3)}]`);
}

console.log(fails === 0 ? "ALL PASS" : `${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
