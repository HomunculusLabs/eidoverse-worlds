// struct210-decode-arbelos.ts — decode audit of village_arbelos3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_morley3.glb) and require >=1 FAIL.
//
// Checks: node census (ab_stone + ab_iron + ab_brass + glow), PLINTH law,
// BLADE law (stone voussoirs fill the arbelos band between the arcs),
// SOLE law (iron rod on the baseline, pins at A/B/C), TWINS law (brass
// verts on the two exact twin tori + the CD ruler line), BEAD law (at D,
// emissive, sole night element), GROUNDING law (curb sole at grade, toes
// embedded 8cm), ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, DEPTH, TWIN_R, RING_T, RULER_T, ROD_R, PIN_R, BEAD_R,
    VOUSSOIRS_W, TWIN_L_W, TWIN_R_W, D_W, A_W, B_W, C_W, ENVELOPE, Y0, EMBED,
    yOuter, yLobe, regionAt, r1, r2, R, COURSE_T,
} from "./struct210-probe-arbelos.ts";

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

function parseGLB(path: string) {
    const buf = readFileSync(path);
    if (buf.readUInt32LE(0) !== 0x46546c67) throw Error("not a glb");
    let off = 12, json: any = null, bin: Uint8Array | null = null;
    while (off < buf.length) {
        const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
        if (type === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + len).toString("utf8"));
        if (type === 0x004e4942) bin = buf.subarray(off + 8, off + 8 + len);
        off += 8 + len;
    }
    return { json, bin };
}

const target = process.argv[2] ?? "agents/arthur/assets/village_arbelos3.glb";
const { json, bin } = parseGLB(target);
if (!bin) throw Error("no BIN chunk");
const nodes = json.nodes ?? [];

const meshNodes = nodes.map((n: any, i: number) => ({ n, i }))
    .filter(({ n }: any) => n.mesh !== undefined);
const matNameOf = (n: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.name ?? "?";

const vertsOf = (n: any): number[][] => {
    const out: number[][] = [];
    const t = n.translation ?? [0, 0, 0];
    for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const view = json.bufferViews[acc.bufferView];   // struct-180 law: INDEX BY accessor.bufferView
        const off = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        for (let i = 0; i < acc.count; i++)
            out.push([
                bin.readFloatLE(off + i * 12) + t[0],
                bin.readFloatLE(off + i * 12 + 4) + t[1],
                bin.readFloatLE(off + i * 12 + 8) + t[2],
            ]);
    }
    return out;
};

// ---- D1 node census -----------------------------------------------------------------------------------
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ab_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ab_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ab_brass");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_ab_1"));
check("D1 node census: 4 mesh nodes (ab_stone + ab_iron + ab_brass + glow)",
    meshNodes.length === 4 && !!stoneNode && !!ironNode && !!brassNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// world<->math helpers (math frame: x+R, y - Y0 + EMBED)
const toMath = (v: number[]): [number, number] => [v[0] + R, v[1] - Y0 + EMBED];

// ---- D2 plinth law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 plinth law", false, "ab_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let plinth = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= PLINTH_L / 2 + TOL && v[1] >= -TOL && v[1] <= PLINTH_H + TOL && Math.abs(v[2]) <= PLINTH_D / 2 + TOL) plinth++;
        }
        check("D2 plinth law", plinth >= 24,
            `${plinth}/${verts.length} stone verts in the curb box ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long seat reads from bytes`);
    }
}

// ---- D3 blade law -------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 blade law", false, "ab_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // blade verts: within plate z-extent (curb excluded by z)
        const blade = verts.filter((v) => Math.abs(v[2]) <= DEPTH / 2 + TOL);
        let inBand = 0;
        for (const v of blade) {
            const mx = v[0] + R, my = v[1] - Y0 + EMBED;
            // inside band: below the outer arc, and NOT strictly inside a lobe
            // disc beyond the stepped under-hang margin (course bottoms hug
            // the arcs in a staircase BY DESIGN — probe L5's disclosed class;
            // a genuinely-wrong vert deeper than one course still fails)
            const inOuter = my <= yOuter(mx) + 0.002 && my >= -0.02;
            const lobIn = (cx0: number, rr: number) => (mx - cx0) ** 2 + my ** 2;
            const inLobe = lobIn(r1, r1) < (r1 - COURSE_T - 0.002) ** 2 || lobIn(2 * r1 + r2, r2) < (r2 - COURSE_T - 0.002) ** 2;
            if (inOuter && !inLobe) inBand++;
        }
        // coverage by corner presence: every voussoir box's 8 corners carried
        // by a blade vert within 8mm (BoxGeometry carries only corner verts)
        let covered = 0, total = 0;
        for (const b of VOUSSOIRS_W) {
            const cx = (b.x0w + b.x1w) / 2, cy = (b.yw + b.yTopw) / 2;
            const hx = (b.x1w - b.x0w) / 2, hy = (b.yTopw - b.yw) / 2;
            total++;
            let corners = 0;
            for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const)
                for (const sz of [-1, 1])
                    if (blade.some((p) => Math.abs(p[0] - (cx + sx * hx)) <= 0.008 && Math.abs(p[1] - (cy + sy * hy)) <= 0.008 && Math.abs(p[2] - sz * DEPTH / 2) <= 0.008)) corners++;
            if (corners >= 8) covered++;
        }
        check("D3 blade law", blade.length >= 400 && inBand >= blade.length * 0.95 && covered >= total * 0.95,
            `${blade.length} blade verts, ${inBand} in the arbelos band (${(100 * inBand / Math.max(1, blade.length)).toFixed(1)}%); corner coverage ${covered}/${total} boxes — the region reads from bytes`);
    }
}

// ---- D4 sole + pins law -------------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 sole-pins law", false, "ab_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // sole rod: verts within ROD_R+10mm of the baseline segment y=Y0, x in [A_W.x, B_W.x], z=0
        let onSole = 0;
        for (const v of verts) {
            if (Math.abs(v[1] - Y0) <= ROD_R + 0.010 && Math.abs(v[2]) <= ROD_R + 0.010 && v[0] >= A_W[0] - 0.01 && v[0] <= B_W[0] + 0.01) onSole++;
        }
        const pins = [A_W, B_W, C_W].map((P) => verts.filter((v) => Math.hypot(v[0] - P[0], v[1] - P[1], v[2] - P[2]) <= PIN_R + 0.01).length);
        check("D4 sole-pins law", onSole >= 40 && pins.every((h) => h >= 20),
            `${onSole} iron verts on the sole datum rod (rod rail verts + pin equatorial bands); pin populations at A/B/C [${pins.join(", ")}] — the baseline reads from bytes`);
    }
}

// ---- D5 twins + ruler law -----------------------------------------------------------------------------
{
    if (!brassNode) { check("D5 twins-ruler law", false, "ab_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        // twin torus surfaces: |dist(centerline circle) - RING_T| <= 10mm
        const ringSurfaceDist = (v: number[], C: [number, number, number]) =>
            Math.abs(Math.hypot(Math.hypot(v[0] - C[0], v[1] - C[1]) - TWIN_R, v[2]) - RING_T);
        let onTwins = 0;
        for (const v of verts) {
            if (Math.min(ringSurfaceDist(v, TWIN_L_W), ringSurfaceDist(v, TWIN_R_W)) <= 0.010) onTwins++;
        }
        // ruler: within RULER_T+10mm of the CD segment (x = C_W.x, y in [C_W.y, D_W.y], z=0)
        const rulerDist = (v: number[]) => Math.hypot(v[0] - C_W[0], v[2]) <= RULER_T + 0.010 && v[1] >= C_W[1] - 0.01 && v[1] <= D_W[1] + 0.01;
        let onRuler = 0;
        for (const v of verts) if (rulerDist(v)) onRuler++;
        check("D5 twins-ruler law", onTwins >= verts.length * 0.55 && onRuler >= 40,
            `${onTwins}/${verts.length} brass verts on the two twin ring surfaces; ${onRuler} on the CD ruler — the twins read from bytes`);
    }
}

// ---- D6 bead law --------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow bucket absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        let cx = 0, cy = 0, cz = 0;
        for (const v of verts) { cx += v[0]; cy += v[1]; cz += v[2]; }
        cx /= verts.length; cy /= verts.length; cz /= verts.length;
        const centered = Math.hypot(cx - D_W[0], cy - D_W[1], cz - D_W[2]) <= 0.005;
        const radius = Math.max(...verts.map((v) => Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz)));
        const matIdx = json.meshes[glowNode.n.mesh].primitives[0].material;
        const mat = json.materials[matIdx];
        const emis = mat?.emissiveFactor && (mat.emissiveFactor.some((c: number) => c > 0.05));
        check("D6 bead law", verts.length >= 200 && centered && Math.abs(radius - BEAD_R) <= 0.005 && !!emis,
            `${verts.length} verts, centroid (${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) == D (${D_W[0].toFixed(3)}, ${D_W[1].toFixed(3)}, ${D_W[2].toFixed(3)}) within 5mm; r=${radius.toFixed(4)}; emissiveFactor present — the sole night element reads from bytes`);
    }
}

// ---- D7 grounding law ---------------------------------------------------------------------------------
{
    // blade discrimination by plate z-extent (morley D7 law: a y-threshold
    // filter would exclude exactly the embedded toe band); the CROTCH
    // pedestal is the blade's stand — its toe is the lowest blade material
    const inPlate = (v: number[]) => Math.abs(v[2]) <= DEPTH / 2 + TOL;
    let minStoneY = Infinity, minBladeY = Infinity, minIronY = Infinity, minBrassY = Infinity;
    if (stoneNode) for (const v of vertsOf(stoneNode.n)) {
        minStoneY = Math.min(minStoneY, v[1]);
        if (inPlate(v)) minBladeY = Math.min(minBladeY, v[1]);
    }
    if (ironNode) for (const v of vertsOf(ironNode.n)) minIronY = Math.min(minIronY, v[1]);
    if (brassNode) for (const v of vertsOf(brassNode.n)) minBrassY = Math.min(minBrassY, v[1]);
    const toeY = PLINTH_H - EMBED;
    // the iron sole reads post-embed for BOTH members: the rod (r ROD_R) and
    // the A/B/C pins (r PIN_R) are half-inlaid — bottom = curb top − member
    // radius (versiera hoop/anchor class); the KEEL toe is the lowest blade
    // material at the 8cm cradle embed
    const ironFloor = toeY - Math.max(ROD_R, PIN_R);
    check("D7 grounding law", Math.abs(minStoneY - 0) <= 0.002 && Math.abs(minBladeY - toeY) <= 0.005 && minIronY >= ironFloor - 0.005 && minBrassY >= toeY - 0.005,
        `curb sole at grade ${minStoneY.toFixed(3)} m; crotch-keel toe (lowest blade material) at ${minBladeY.toFixed(3)} == curb top − 8cm ${toeY.toFixed(3)} (cradle embed); lowest iron ${minIronY.toFixed(3)} (rod + pins half-inlaid: floor = curb top − max radius = ${ironFloor.toFixed(3)}); lowest brass ${minBrassY.toFixed(3)} — nothing floats below the embed classes`);
}

// ---- D8 envelope law ----------------------------------------------------------------------------------
{
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const { n } of meshNodes) for (const v of vertsOf(n)) {
        mnx = Math.min(mnx, v[0]); mxx = Math.max(mxx, v[0]);
        mny = Math.min(mny, v[1]); mxy = Math.max(mxy, v[1]);
        mnz = Math.min(mnz, v[2]); mxz = Math.max(mxz, v[2]);
    }
    const dErr = Math.max(
        Math.abs(mnx - ENVELOPE.min[0]), Math.abs(mxx - ENVELOPE.max[0]),
        Math.abs(mny - ENVELOPE.min[1]), Math.abs(mxy - ENVELOPE.max[1]),
        Math.abs(mnz - ENVELOPE.min[2]), Math.abs(mxz - ENVELOPE.max[2]));
    check("D8 envelope law", dErr <= 0.002,
        `decoded envelope [${mnx.toFixed(3)},${mxx.toFixed(3)}]x[${mny.toFixed(3)},${mxy.toFixed(3)}]x[${mnz.toFixed(3)},${mxz.toFixed(3)}] vs probe drift ${(dErr * 1000).toFixed(2)}mm`);
}

// ---- D9 named texMats (struct-38) ----------------------------------------------------------------------
{
    const names = (json.materials ?? []).map((m: any) => m?.name ?? "?");
    const ok = ["ab_stone", "ab_iron", "ab_brass"].every((n) => names.includes(n));
    check("D9 named texMats", ok, `materials [${names.join(", ")}]`);
}

if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
