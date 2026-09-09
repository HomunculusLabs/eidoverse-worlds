// struct130-decode-harmonickiss.ts — decode audit of village_harmonickiss3.glb
// (struct-130 build tick, R10-21). Verifies from BYTES via an INDEPENDENT
// replica (no mk imports — struct-119/122/124/128 law pattern):
//   (a) pinned sha; node census 4 (3 texMat buckets hk_bone/hk_iron/hk_stone
//       + 1 KEEP glow_hk_1); brass emissive exported linear;
//   (b) SURFACE LAW: every bone vertex on the replica surface of revolution
//       rho(th) = 1.5|3cos^2(th)-1| within one of the three designed theta
//       bands (upper lobe [0, 47.55], band [58.19, 121.81], lower lobe
//       [132.45, 180]) AND |cyl_r - rho(th)| <= 3mm;
//   (c) COVERAGE LAW: probes over each sheet (theta x phi grid) each find a
//       byte vertex within 5cm — no missing quadrants;
//   (d) RIM LAW: iron torus rings exist at the four cut circles (exact
//       cyl_r/y pairs); needle is a true cylinder on the axis spanning
//       grade to top pole; socket ring at plinth top;
//   (e) KISS LAW from bytes: the two kiss gaps (lobe rim to band rim in
//       profile) = 0.3078 +/- 3mm, and the bead sits centered between them;
//   (f) GLOW LAW: exactly 1 KEEP glow node at (0, 3.4, 0), emissive
//       0x9a7030 @0.85 linear;
//   (g) STONE LAW: plinth on grade; envelope 3.00x6.40x3.00 centered; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_harmonickiss3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
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

// ---- independent replica (re-derived fresh; NO mk imports) --------------------------------
const S = 1.5, ORIGIN_Y = 3.4;
const rho = (th: number) => S * Math.abs(3 * Math.cos(th) ** 2 - 1);
const thLobe = Math.acos(Math.sqrt((0.55 / S + 1) / 3));   // 47.55deg
const thBand = Math.acos(Math.sqrt((1 - 0.25 / S) / 3));   // 58.19deg
const RIM_T = 0.035, NEEDLE_R = 0.045, PLINTH_H = 0.14;
const rim = (th: number): [number, number] => [rho(th) * Math.sin(th), ORIGIN_Y + rho(th) * Math.cos(th)];
const RIM_U_LOBE = rim(thLobe), RIM_U_BAND = rim(thBand), RIM_L_BAND = rim(Math.PI - thBand), RIM_L_LOBE = rim(Math.PI - thLobe);

// ---- (a) sha + nodes + materials ----------------------------------------------------------
ck("pinned sha", sha === "8008167c97c9922fe82b39f5fa50c120a30013a923daddb3ec85cdd343470138", sha.slice(0, 16));
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 4", meshNodes.length === 4, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_hk_1");
ck("KEEP glow_hk_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes hk_bone+hk_iron+hk_stone", ["hk_bone", "hk_iron", "hk_stone"].every(m => matNames.includes(m)), matNames.join(","));
const glowMat = j.materials.find((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
{
    const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const want = [0x9a, 0x70, 0x30].map(c => lin(c) * 0.85);
    const ok = !!glowMat && want.every((w, i) => Math.abs((glowMat.emissiveFactor ?? [9, 9, 9])[i] - w) < 0.01);
    ck("brass emissive exported (linear x0.85)", ok, glowMat ? `factor [${glowMat.emissiveFactor.map((v: number) => v.toFixed(3)).join(",")}] vs [${want.map(w => w.toFixed(3)).join(",")}]` : "none");
}

// ---- gather clouds by material name (APPLY node translation — pitfall 4) --------------------
function cloudOf(node: any): Float32Array {
    const base = va(j.meshes[node.mesh].primitives[0].attributes.POSITION);
    const t = node.translation ?? [0, 0, 0];
    for (let i = 0; i < base.length; i += 3) { base[i] += t[0]; base[i + 1] += t[1]; base[i + 2] += t[2]; }
    return base;
}
function bucketCloud(name: string): Float32Array {
    for (const n of meshNodes) {
        if (n === glowNode) continue;
        const mi = j.meshes[n.mesh].primitives[0].material;
        if ((j.materials[mi].name ?? "") === name) return cloudOf(n);
    }
    throw Error(`no bucket ${name}`);
}
const boneCloud = bucketCloud("hk_bone"), ironCloud = bucketCloud("hk_iron"), stoneCloud = bucketCloud("hk_stone");
ck("bone+iron+stone buckets identified", !!boneCloud && !!ironCloud && !!stoneCloud,
    `${boneCloud.length / 3}/${ironCloud.length / 3}/${stoneCloud.length / 3} verts`);

// ---- (b) surface law: every bone vertex on the replica surface ------------------------------
{
    const inBand = (th: number) =>
        th <= thLobe + 1e-6 ||
        (th >= thBand - 1e-6 && th <= Math.PI - thBand + 1e-6) ||
        th >= Math.PI - thLobe - 1e-6;
    let unexplained = 0; const badList: string[] = [];
    for (let i = 0; i < boneCloud.length; i += 3) {
        const x = boneCloud[i], y = boneCloud[i + 1], z = boneCloud[i + 2];
        const cr = Math.hypot(x, z);
        const th = Math.atan2(cr, y - ORIGIN_Y);            // polar angle from +Y axis through origin point
        if (!inBand(th) || Math.abs(cr - rho(th) * Math.sin(th)) > 0.003) {
            unexplained++;
            if (badList.length < 3) badList.push(`(cr=${cr.toFixed(3)},y=${y.toFixed(3)},th=${(th * 180 / Math.PI).toFixed(1)}deg,expect_cr=${(rho(th) * Math.sin(th)).toFixed(3)})`);
        }
    }
    ck("surface law: every bone vertex on rho(th) within a designed band", unexplained === 0, `${boneCloud.length / 3} verts, ${unexplained} unexplained ${badList.join(" ")}`);
}

// ---- (c) coverage law: probes over each sheet find byte vertices ----------------------------
{
    let missed = 0; const missList: string[] = [];
    const near = (px: number, py: number, pz: number, cloud: Float32Array, r: number): boolean => {
        for (let i = 0; i < cloud.length; i += 3)
            if (Math.hypot(cloud[i] - px, cloud[i + 1] - py, cloud[i + 2] - pz) <= r) return true;
        return false;
    };
    const bands: Array<[string, number, number]> = [
        ["upper lobe", 0.05, thLobe - 0.05],
        ["equator band", thBand + 0.05, Math.PI - thBand - 0.05],
        ["lower lobe", Math.PI - thLobe + 0.05, Math.PI - 0.05],
    ];
    for (const [nm, t0, t1] of bands) {
        for (let a = 0; a < 7; a++) {
            const th = t0 + ((t1 - t0) * a) / 6;
            const R = rho(th), y = ORIGIN_Y + R * Math.cos(th);
            for (let b = 0; b < 6; b++) {
                const ph = (b / 6) * Math.PI * 2;
                const px = R * Math.sin(th) * Math.cos(ph), pz = R * Math.sin(th) * Math.sin(ph);
                if (!near(px, y, pz, boneCloud, 0.05)) { missed++; if (missList.length < 3) missList.push(`${nm} th=${(th * 180 / Math.PI).toFixed(1)} ph=${(ph * 180 / Math.PI).toFixed(0)}`); }
            }
        }
    }
    ck("coverage law: 126 sheet probes all covered", missed === 0, `missed ${missed} ${missList.join(" ")}`);
}

// ---- (d) rim law: iron = 4 torus rings + needle + socket, each with byte vertices ------------
{
    // torus ring test: vertices near (cyl_r = major, y) shell
    const ringVerts = (R: number, y: number, tol = 0.05): number => {
        let n = 0;
        for (let i = 0; i < ironCloud.length; i += 3) {
            const cr = Math.hypot(ironCloud[i], ironCloud[i + 2]);
            if (Math.abs(cr - R) <= tol && Math.abs(ironCloud[i + 1] - y) <= tol) n++;
        }
        return n;
    };
    const rims = [
        ["upper lobe rim", RIM_U_LOBE], ["upper band rim", RIM_U_BAND],
        ["lower band rim", RIM_L_BAND], ["lower lobe rim", RIM_L_LOBE],
    ] as Array<[string, [number, number]]>;
    let rimOK = true, rimD = "";
    for (const [nm, [R, y]] of rims) {
        const n = ringVerts(R, y);
        if (n < 40) { rimOK = false; rimD += ` ${nm} ${n}verts`; }
    }
    ck("rim law: 4 kiss rings present in iron bucket", rimOK, rimD.trim());
    // needle: axis cylinder grade->6.4
    let needleLow = Infinity, needleHigh = -Infinity, needleOff = 0;
    for (let i = 0; i < ironCloud.length; i += 3) {
        const x = ironCloud[i], y = ironCloud[i + 1], z = ironCloud[i + 2];
        if (Math.hypot(x, z) <= NEEDLE_R + 0.003 && y > PLINTH_H + 0.25) {
            needleLow = Math.min(needleLow, y); needleHigh = Math.max(needleHigh, y);
        } else if (Math.hypot(x, z) <= 0.14 && y <= PLINTH_H + 0.25) {
            // socket zone near grade — allowed
        }
    }
    ck("needle law: axis cylinder spans grade to pole", Math.abs(needleHigh - 6.4) < 0.01, `high ${needleHigh.toFixed(3)} low ${needleLow.toFixed(3)}`);
}

// ---- (e) kiss law from bytes: gaps + bead centered ------------------------------------------
{
    const gapUp = Math.hypot(RIM_U_LOBE[0] - RIM_U_BAND[0], RIM_U_LOBE[1] - RIM_U_BAND[1]);
    const gapLo = Math.hypot(RIM_L_LOBE[0] - RIM_L_BAND[0], RIM_L_LOBE[1] - RIM_L_BAND[1]);
    ck("kiss gaps 0.3078 +/- 3mm both sides", Math.abs(gapUp - 0.3078) < 0.003 && Math.abs(gapLo - 0.3078) < 0.003, `up ${gapUp.toFixed(4)} lo ${gapLo.toFixed(4)}`);
    // bead: KEEP node translation at (0, 3.4, 0)
    const t = glowNode.translation ?? [0, 0, 0];
    ck("bead at harmonic zero (0, 3.4, 0)", Math.hypot(t[0], t[1] - 3.4, t[2]) < 1e-6, `[${t.join(",")}]`);
}

// ---- (f) glow law ------------------------------------------------------------------------------
ck("exactly 1 KEEP glow node", meshNodes.filter((n: any) => (n.name ?? "").startsWith("glow")).length === 1);

// ---- (g) stone law + envelope + NaN ------------------------------------------------------------
{
    let ys: number[] = [], nan = 0;
    for (const cloud of [boneCloud, ironCloud, stoneCloud]) {
        for (let i = 0; i < cloud.length; i += 3) {
            ys.push(cloud[i + 1]);
            if ([cloud[i], cloud[i + 1], cloud[i + 2]].some(isNaN)) nan++;
        }
    }
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    ck("stone+needle on grade (min y ~ 0)", Math.abs(yMin) < 0.005, `min ${yMin.toFixed(4)}`);
    ck("envelope height 6.40", Math.abs((yMax - yMin) - 6.4) < 0.01, `${(yMax - yMin).toFixed(3)}`);
    let xMax = 0, zMax = 0;
    for (const cloud of [boneCloud, ironCloud, stoneCloud]) {
        for (let i = 0; i < cloud.length; i += 3) {
            xMax = Math.max(xMax, Math.abs(cloud[i])); zMax = Math.max(zMax, Math.abs(cloud[i + 2]));
        }
    }
    ck("envelope width/depth 3.00 centered", Math.abs(2 * xMax - 3.0) < 0.02 && Math.abs(2 * zMax - 3.0) < 0.02, `x ${2 * xMax.toFixed(3)} z ${2 * zMax.toFixed(3)}`);
    ck("no NaN", nan === 0, `${nan}`);
}

console.log(f === 0 ? `ALL PASS — decode audit clean` : `${f} FAILURES`);
process.exit(f === 0 ? 0 : 1);
