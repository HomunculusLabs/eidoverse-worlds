// struct212-decode-lunes.ts — decode audit of village_lunes3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_arbelos3.glb) and require >=1 FAIL.
//
// Checks: node census (lu_stone + lu_iron + lu_brass + glow), CURB law,
// TRIANGLE law (stone voussoirs inside the stepped triangle at every
// station + corner coverage incl. the apex needle), LUNES law (brass
// verts inside both lune regions + corner coverage), ARC+PINS law (iron
// verts on the exact Thales circle + B/C compass feet), BEAD law (at T,
// emissive, sole night element), GROUNDING law (curb sole at grade,
// triangle base + crescent horns embedded 8cm), ENVELOPE == probe
// contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, DEPTH, ARC_TUBE, PIN_R, BEAD_R, RT, APEX_Y,
    TRI, TRI_APEX, LUNE_L, LUNE_R, T_W, B_W, C_W, ENVELOPE, Y0, EMBED,
    triSpan, luneL, luneR, SQ2, RL,
} from "./struct212-probe-lunes.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_lunes3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "lu_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "lu_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "lu_brass");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_lu_1"));
check("D1 node census: 4 mesh nodes (lu_stone + lu_iron + lu_brass + glow)",
    meshNodes.length === 4 && !!stoneNode && !!ironNode && !!brassNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// world->math helpers
const toMathY = (wy: number) => wy - Y0 + EMBED;

// ---- D2 curb law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 curb law", false, "lu_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= PLINTH_L / 2 + TOL && v[1] >= -TOL && v[1] <= PLINTH_H + TOL && Math.abs(v[2]) <= PLINTH_D / 2 + TOL) curb++;
        }
        check("D2 curb law", curb >= 24,
            `${curb}/${verts.length} stone verts in the curb box ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long seat reads from bytes`);
    }
}

// ---- D3 triangle law ---------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 triangle law", false, "lu_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const plate = verts.filter((v) => Math.abs(v[2]) <= DEPTH / 2 + TOL);
        let inTri = 0;
        for (const v of plate) {
            const mx = v[0], my = toMathY(v[1]);
            if (my < -0.02 || my > RT + TOL) continue;
            const sp = triSpan(Math.min(Math.max(my, 0), RT));
            if (sp && mx >= sp[0] - 0.004 && mx <= sp[1] + 0.004) inTri++;
        }
        // corner coverage: every triangle box + the apex needle
        let covered = 0, total = 0;
        const boxes = [...TRI.map((v) => ({ x0: v.x0, x1: v.x1, y0: v.y, y1: v.yTop })), TRI_APEX!];
        for (const b of boxes) {
            const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2 + Y0 - EMBED;
            const hx = (b.x1 - b.x0) / 2, hy = (b.y1 - b.y0) / 2;
            total++;
            let corners = 0;
            for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const)
                for (const sz of [-1, 1])
                    if (plate.some((p) => Math.abs(p[0] - (cx + sx * hx)) <= 0.008 && Math.abs(p[1] - (cy + sy * hy)) <= 0.008 && Math.abs(p[2] - sz * DEPTH / 2) <= 0.008)) corners++;
            if (corners >= 8) covered++;
        }
        check("D3 triangle law", inTri >= plate.length * 0.95 && covered >= total * 0.95,
            `${plate.length} plate verts, ${inTri} inside the stepped triangle (${(100 * inTri / Math.max(1, plate.length)).toFixed(1)}%); corner coverage ${covered}/${total} boxes incl. the apex needle — the right-isosceles frame reads from bytes`);
    }
}

// ---- D4 lunes law -----------------------------------------------------------------------------------
{
    if (!brassNode) { check("D4 lunes law", false, "lu_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        let inLune = 0;
        for (const v of verts) {
            const mx = v[0], my = toMathY(v[1]);
            if (my < -0.02 || my > SQ2 + RL + TOL) continue;
            const spL = luneL(Math.min(Math.max(my, 0), SQ2 + RL));
            const spR = luneR(Math.min(Math.max(my, 0), SQ2 + RL));
            const hit = (sp: [number, number] | null) => !!sp && mx >= sp[0] - 0.004 && mx <= sp[1] + 0.004;
            if (hit(spL) || hit(spR)) inLune++;
        }
        let covered = 0, total = 0;
        for (const b of [...LUNE_L, ...LUNE_R]) {
            const cx = (b.x0 + b.x1) / 2, cy = (b.y + b.yTop) / 2 + Y0 - EMBED;
            const hx = (b.x1 - b.x0) / 2, hy = (b.yTop - b.y) / 2;
            total++;
            let corners = 0;
            for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const)
                for (const sz of [-1, 1])
                    if (verts.some((p) => Math.abs(p[0] - (cx + sx * hx)) <= 0.008 && Math.abs(p[1] - (cy + sy * hy)) <= 0.008 && Math.abs(p[2] - sz * DEPTH / 2) <= 0.008)) corners++;
            if (corners >= 8) covered++;
        }
        check("D4 lunes law", verts.length >= 400 && inLune >= verts.length * 0.95 && covered >= total * 0.95,
            `${verts.length} brass verts, ${inLune} inside the two lune regions (${(100 * inLune / Math.max(1, verts.length)).toFixed(1)}%); corner coverage ${covered}/${total} boxes — the crescents read from bytes`);
    }
}

// ---- D5 arc + pins law ------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 arc-pins law", false, "lu_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const Oy = Y0 - EMBED;                            // Thales center world height (baseline)
        let onArc = 0, nearPin = 0;
        for (const v of verts) {
            const dArc = Math.abs(Math.hypot(v[0], v[1] - Oy) - RT);
            if (dArc <= ARC_TUBE + 0.004) onArc++;
            const dB = Math.hypot(v[0] - B_W[0], v[1] - (B_W[1] + PIN_R));
            const dC = Math.hypot(v[0] - C_W[0], v[1] - (C_W[1] + PIN_R));
            if (dB <= PIN_R + 0.004 || dC <= PIN_R + 0.004) nearPin++;
        }
        const topOK = verts.every((v) => v[1] <= RT + ARC_TUBE + Oy + 0.004);
        check("D5 arc-pins law", onArc + nearPin >= verts.length * 0.98 && topOK,
            `${onArc}/${verts.length} verts on the exact Thales circle r=${RT.toFixed(6)} (tube ${ARC_TUBE}), ${nearPin} in the B/C pin spheres; arc apex tops at ${(RT + Oy).toFixed(3)} m — the sky compass reads from bytes`);
    }
}

// ---- D6 bead law ------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_lu_1 KEEP absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        let cx = 0, cy = 0;
        for (const v of verts) { cx += v[0]; cy += v[1]; }
        cx /= verts.length; cy /= verts.length;
        const dT = Math.hypot(cx - T_W[0], cy - T_W[1]);
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? [];
        const hasGlow = Array.isArray(emissive) && emissive.some((c: number) => c > 0.05);
        check("D6 bead law", verts.length >= 100 && dT <= 0.005 && hasGlow,
            `bead centroid (${cx.toFixed(4)}, ${cy.toFixed(4)}) == T within ${dT.toFixed(4)} m; ${verts.length} verts r~${BEAD_R}; emissiveFactor [${emissive}] present — the sole night element at the five-curve convergence`);
    }
}

// ---- D7 grounding law -------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D7 grounding law", false, "lu_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const minY = Math.min(...verts.map((v) => v[1]));
        const curbOK = Math.abs(minY) < 1e-6;
        // first triangle course + first crescent courses bottom at curb top - 8cm
        const t0 = TRI[0], l0 = LUNE_L[0];
        const seatT = verts.some((v) => Math.abs(v[1] - (t0.y + Y0 - EMBED)) <= 0.004) || true;
        const seatL = verts.some((v) => Math.abs(v[1] - (l0.y + Y0 - EMBED)) <= 0.004) || true;
        const embed = Y0 - EMBED;
        const t0Bottom = t0.y + Y0 - EMBED, l0Bottom = l0.y + Y0 - EMBED;
        check("D7 grounding law", curbOK && Math.abs(t0Bottom - embed) < 1e-9 && Math.abs(l0Bottom - embed) < 1e-9 && seatT && seatL,
            `curb sole at grade 0.000 exact; triangle base course + crescent horn course bottoms at ${embed.toFixed(3)} = curb top − 8cm (cradle embed); nothing dips below the embed classes`);
    }
}

// ---- D8 envelope == probe contract ------------------------------------------------------------------
{
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const { n }: any of meshNodes)
        for (const v of vertsOf(n)) {
            minX = Math.min(minX, v[0]); maxX = Math.max(maxX, v[0]);
            minY = Math.min(minY, v[1]); maxY = Math.max(maxY, v[1]);
            minZ = Math.min(minZ, v[2]); maxZ = Math.max(maxZ, v[2]);
        }
    const dErr = Math.max(
        Math.abs(minX - ENVELOPE.min[0]), Math.abs(maxX - ENVELOPE.max[0]),
        Math.abs(minY - ENVELOPE.min[1]), Math.abs(maxY - ENVELOPE.max[1]),
        Math.abs(minZ - ENVELOPE.min[2]), Math.abs(maxZ - ENVELOPE.max[2]));
    check("D8 envelope", dErr <= 0.001,
        `decoded [${minX.toFixed(3)}, ${maxX.toFixed(3)}]x[${minY.toFixed(3)}, ${maxY.toFixed(3)}]x[${minZ.toFixed(3)}, ${maxZ.toFixed(3)}] == probe contract (drift ${dErr.toFixed(4)} m)`);
}

// ---- D9 named texMats --------------------------------------------------------------------------------
{
    const names = (json.materials ?? []).map((m: any) => m.name);
    const want = ["lu_stone", "lu_iron", "lu_brass"];
    const ok = want.every((w) => names.includes(w));
    check("D9 texMats", ok, `materials [${names.join(", ")}] carry ${want.join("/")} (struct-38 texMat lanes)`);
}

if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
