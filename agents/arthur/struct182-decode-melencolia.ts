// struct182-decode-melencolia.ts — decode audit of village_melencolia3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB (e.g.
// village_catalan3.glb) and require ≥1 FAIL (the checker can fail).
//
// Checks: node census (3 buckets + glow_ms_1 KEEP family), bone census
// (90 boxes × 24 verts), GLYPH LAW (every expected segment-box center of
// all 16 numerals matches a decoded bone box center ≤2mm, one-to-one —
// wrong digits/missing segments cannot pass), 34-answer glyph law (9 boxes
// one-to-one at the margin center, emissive present), envelope exact +
// origin-centered, named texMats (struct-38 law).
import { readFileSync } from "node:fs";
import {
    CELL, GRID, SLAB_H, SLAB_T, PL_H, SINK, MARGIN_TOP, MARGIN_BOT,
    DIG_W, DIG_H, BAR_W, BAR_D, DIG_GAP, C34_H,
    SQ, SEG, numDigits,
} from "./struct182-probe-melencolia.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_melencolia3.glb";
const { json, bin } = parseGLB(target);
if (!bin) throw Error("no BIN chunk");
const nodes = json.nodes ?? [];

// world box per mesh node (translation-accumulated, pitfall 4; no matrices
// expected — identity scheme with mesh guard, struct-180 chassis)
const boxOf = (idx: number) => {
    const n = nodes[idx];
    const t = n.translation ?? [0, 0, 0];
    if (n.matrix) throw Error("unexpected matrix node");
    const mesh = n.mesh !== undefined ? json.meshes[n.mesh] : null;
    if (!mesh) return null;
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const prim of mesh.primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const a = acc.min as number[], b = acc.max as number[];
        for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], a[c] + t[c]); mx[c] = Math.max(mx[c], b[c] + t[c]); }
    }
    return { mn, mx, name: n.name ?? "", mesh };
};

const meshBoxes = nodes.map((_: any, i: number) => boxOf(i)).filter(Boolean) as any[];

// read all verts of a node as [x,y,z] triples (accessor.bufferView law —
// struct-180's checker-side bug lesson: index by acc.bufferView, NEVER by
// the accessor index)
const vertsOf = (b: any): number[][] => {
    const out: number[][] = [];
    for (const prim of b.mesh.primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const view = json.bufferViews[acc.bufferView];
        const off = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        for (let i = 0; i < acc.count; i++)
            out.push([bin.readFloatLE(off + i * 12), bin.readFloatLE(off + i * 12 + 4), bin.readFloatLE(off + i * 12 + 8)]);
    }
    return out;
};

// ---- expected glyph geometry (ONE contract with mk — same math) ---------------------------------------
const FACE_Z = SLAB_T / 2;
const GRID_TOP = PL_H - SINK + SLAB_H - MARGIN_TOP;
const GRID_BOTTOM = GRID_TOP - GRID;
const cellCX = (c: number) => -GRID / 2 + (c + 0.5) * CELL;
const cellCY = (r: number) => GRID_TOP - (r + 0.5) * CELL;
const GLYPH_Z = FACE_Z + BAR_D / 2 + 0.004;

// segment center offsets in a digit's local frame (mirrors mk segGeoms):
// horizontals span full DIG_W at y = ±(hh−w/2) and 0; verticals are
// half-height boxes centered at ±(hh−w)/2, x = ±(hw−w/2).
const segCenters = (d: string): [number, number][] => {
    const hw = DIG_W / 2, hh = DIG_H / 2, w = BAR_W;
    const centers: Record<string, [number, number]> = {
        a: [0, hh - w / 2], d: [0, -hh + w / 2], g: [0, 0],
        f: [-hw + w / 2, (hh - w) / 2], b: [hw - w / 2, (hh - w) / 2],
        e: [-hw + w / 2, -(hh - w) / 2], c: [hw - w / 2, -(hh - w) / 2],
    };
    return SEG[d].map(s => centers[s]);
};

const expectedBone: [number, number, number][] = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const n = SQ[r][c], ds = numDigits(n);
    const totalW = ds.length * DIG_W + (ds.length - 1) * DIG_GAP;
    let x0 = cellCX(c) - totalW / 2 + DIG_W / 2;
    for (const d of ds) {
        for (const [sx, sy] of segCenters(d)) expectedBone.push([x0 + sx, cellCY(r) + sy, GLYPH_Z]);
        x0 += DIG_W + DIG_GAP;
    }
}
const scale34 = C34_H / DIG_H;
const y34 = GRID_BOTTOM - MARGIN_BOT / 2;
const totalW34 = 2 * DIG_W * scale34 + DIG_GAP * scale34;
const expectedGlow: [number, number, number][] = [];
{
    let x0 = -totalW34 / 2 + (DIG_W * scale34) / 2;
    for (const d of ["3", "4"]) {
        for (const [sx, sy] of segCenters(d)) expectedGlow.push([x0 + sx * scale34, y34 + sy * scale34, GLYPH_Z]);
        x0 += (DIG_W + DIG_GAP) * scale34;
    }
}

// ---- D1 node census -----------------------------------------------------------------------------------
{
    const glow = meshBoxes.filter(b => /^glow_ms_1/.test(b.name));
    check("D1 node census: 4 mesh nodes (3 buckets + glow_ms_1 KEEP)",
        meshBoxes.length === 4 && glow.length === 1,
        `meshes ${meshBoxes.length}, glow ${glow.length}, names [${meshBoxes.map((b: any) => JSON.stringify(b.name)).join(", ")}]`);
}

// identify buckets by material name
const matNameOf = (b: any) => {
    const mi = b.mesh.primitives[0].material;
    return json.materials[mi]?.name ?? "?";
};
const boneBucket = meshBoxes.find(b => matNameOf(b) === "mel_bone");
const glowNode = meshBoxes.find(b => /^glow_ms_1/.test(b.name));

// ---- D2 bone census: 90 boxes = 2160 verts ------------------------------------------------------------
{
    let ok = !!boneBucket;
    let detail = "bone bucket missing";
    if (boneBucket) {
        const v = vertsOf(boneBucket);
        ok = v.length === 2160;
        detail = `${v.length} verts (expect 2160 = 90 boxes × 24)`;
    }
    check("D2 bone census: 90 segment boxes = 2160 verts", ok, detail);
}

// ---- D3 GLYPH LAW: one-to-one center match, tolerance 2mm --------------------------------------------
{
    let ok = !!boneBucket;
    let detail = "bone bucket missing";
    if (boneBucket) {
        const v = vertsOf(boneBucket);
        const centers = v.map(p => p); // chunk-average each 24 verts
        const boxCenters: number[][] = [];
        for (let i = 0; i + 24 <= centers.length; i += 24) {
            let cx = 0, cy = 0, cz = 0;
            for (let j = 0; j < 24; j++) { cx += centers[i + j][0]; cy += centers[i + j][1]; cz += centers[i + j][2]; }
            boxCenters.push([cx / 24, cy / 24, cz / 24]);
        }
        let matched = 0, unmatchedExp: string[] = [];
        const used = new Set<number>();
        for (const [ex, ey, ez] of expectedBone) {
            let best = -1, bestD = Infinity;
            for (let i = 0; i < boxCenters.length; i++) {
                if (used.has(i)) continue;
                const d = Math.hypot(boxCenters[i][0] - ex, boxCenters[i][1] - ey, boxCenters[i][2] - ez);
                if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0 && bestD <= 0.002) { used.add(best); matched++; }
            else unmatchedExp.push(`(${ex.toFixed(2)},${ey.toFixed(2)}) d=${bestD.toFixed(4)}`);
        }
        const leftovers = boxCenters.length - used.size;
        ok = matched === expectedBone.length && leftovers === 0;
        detail = `${matched}/${expectedBone.length} expected centers matched ≤2mm, ${leftovers} unexpected boxes` +
            (unmatchedExp.length ? `; worst ${unmatchedExp[0]}` : "");
    }
    check("D3 glyph law: all 16 numerals render exactly (one-to-one center match)", ok, detail);
}

// ---- D4 the 34-answer: 9 boxes one-to-one at margin center + emissive ---------------------------------
{
    let ok = !!glowNode;
    let detail = "glow KEEP missing";
    if (glowNode) {
        const v = vertsOf(glowNode);
        const boxCenters: number[][] = [];
        for (let i = 0; i + 24 <= v.length; i += 24) {
            let cx = 0, cy = 0, cz = 0;
            for (let j = 0; j < 24; j++) { cx += v[i + j][0]; cy += v[i + j][1]; cz += v[i + j][2]; }
            boxCenters.push([cx / 24, cy / 24, cz / 24]);
        }
        let matched = 0;
        const used = new Set<number>();
        for (const [ex, ey, ez] of expectedGlow) {
            let bestD = Infinity, best = -1;
            for (let i = 0; i < boxCenters.length; i++) {
                if (used.has(i)) continue;
                const d = Math.hypot(boxCenters[i][0] - ex, boxCenters[i][1] - ey, boxCenters[i][2] - ez);
                if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0 && bestD <= 0.002) { used.add(best); matched++; }
        }
        const mat = json.materials[glowNode.mesh.primitives[0].material];
        const emissive = !!mat?.emissiveFactor?.some((x: number) => x > 0);
        ok = v.length === 216 && matched === expectedGlow.length && boxCenters.length === used.size && emissive;
        detail = `${v.length} verts (9 boxes), ${matched}/9 centers matched, emissive ${emissive}`;
    }
    check("D4 34-answer: 9 emissive brass boxes exactly at the margin center", ok, detail);
}

// ---- D5 envelope exact ----------------------------------------------------------------------------------
{
    const mn: [number, number, number] = [Infinity, Infinity, Infinity];
    const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    for (const b of meshBoxes) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], b.mn[c]); mx[c] = Math.max(mx[c], b.mx[c]); }
    const sx = mx[0] - mn[0], sy = mx[1] - mn[1], sz = mx[2] - mn[2];
    const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    check("D5 envelope: 3.20x3.75x0.95, min y = 0, origin-centered",
        Math.abs(sx - 3.20) < 0.02 && Math.abs(sy - 3.75) < 0.05 && Math.abs(sz - 0.95) < 0.02 &&
        Math.abs(mn[1]) < 1e-6 && Math.abs(cx) < 1e-3 && Math.abs(cz) < 1e-3,
        `${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)}, y0 ${mn[1].toFixed(4)}, cx ${cx.toFixed(4)}, cz ${cz.toFixed(4)}`);
}

// ---- D6 named texMats (struct-38 law) --------------------------------------------------------------------
{
    const names = meshBoxes.map((b: any) => matNameOf(b)).sort();
    // mel_brass REQUIRED: v1 shipped the wire bucket with material:null
    // (plain MeshStandard exports none) — loader-default near-black in-game.
    const ok = names.includes("mel_stone") && names.includes("mel_bone") && names.includes("mel_brass") && !names.includes("?");
    check("D6 named glTF materials mel_stone + mel_bone + mel_brass, no null buckets (struct-38 law)", ok, `[${names.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL PASS" : `${fails.length} FAIL(S): ${fails.join("; ")}`);
process.exit(fails.length === 0 ? 0 : 1);
