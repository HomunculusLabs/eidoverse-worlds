// struct186-decode-fourier.ts — decode audit of village_fourier3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_catalan3.glb) and require ≥1 FAIL.
//
// Checks: node census (four_stone + four_brass + glow_fl_1), STONE CLASS
// LAW (every stone vertex belongs to exactly one of the 6 members — 4
// ribbon band-laws |y − yc − S_N(x)| ≤ band/2 + 2mm, 2 pier boxes — with
// per-class coverage), RIBBON LAW FROM BYTES (each ribbon's crest carries
// the Gibbs overshoot; S1 crest == 4A/π), RAIL LAW (every brass vertex on
// the square-wave outline at ±(band/2) of its run), BEAD LAW (center,
// radius, emissive), ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    LAM, SPAN, X0, A_AMP, BAND_H, RAIL_BAND, RAIL_A, HARMONICS,
    RAIL_Y, PIER_HW, PIER_HD, PIER_X, PIER_TOP, BEAD_R, BEAD_C,
    ENVELOPE, sN, ribbonY,
} from "./struct186-probe-fourier.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_fourier3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_fl_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "four_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "four_brass");
check("D1 node census: 3 mesh nodes (four_stone + four_brass + glow_fl_1)",
    meshNodes.length === 3 && !!glowNode && !!stoneNode && !!brassNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

// ---- D2 stone class law -------------------------------------------------------------------------------
const TOL = 0.002;
const ribbonClass = (i: number, v: number[]) => {
    const yc = ribbonY(i);
    return Math.abs(v[0]) <= SPAN / 2 + TOL &&
        Math.abs(v[1] - yc - sN(HARMONICS[i], v[0])) <= BAND_H / 2 + TOL &&
        Math.abs(v[2]) <= 0.36 / 2 + TOL;
};
const pierClass = (v: number[]) =>
    Math.abs(Math.abs(v[0]) - PIER_X) <= PIER_HW + TOL &&
    v[1] >= -TOL && v[1] <= PIER_TOP + TOL &&
    Math.abs(v[2]) <= PIER_HD + TOL;
{
    // guard: foreign GLB lacks the buckets — fail closed without crashing
    if (!stoneNode) { check("D2 stone class law", false, "four_stone bucket absent (foreign/malformed target)"); }
    else {
    const verts = vertsOf(stoneNode.n);
    const counts = [0, 0, 0, 0, 0];   // ribbon 0..3, piers
    let unassigned = 0;
    for (const v of verts) {
        let hit = -1;
        for (let i = 0; i < 4; i++) if (ribbonClass(i, v)) { hit = i; break; }
        if (hit < 0 && pierClass(v)) hit = 4;
        if (hit < 0) unassigned++;
        else counts[hit]++;
    }
    // self-catch: 2 pier boxes × 24 verts = EXACTLY 48 (first draft demanded >100)
    check("D2 stone class law", unassigned === 0 && counts.slice(0, 4).every(c => c > 500) && counts[4] === 48,
        `${verts.length} verts: ribbons ${counts.slice(0, 4).join("/")} piers ${counts[4]} (2 boxes × 24), unassigned ${unassigned}`);
    }
}

// ---- D3 ribbon crest law (Gibbs from bytes) -----------------------------------------------------------
{
    if (!stoneNode) { check("D3 crest + Gibbs from bytes", false, "four_stone bucket absent"); }
    else {
    const verts = vertsOf(stoneNode.n);
    // self-catch: extrude caps sit at z = ±depth/2 = ±0.18, NOT z=0 — the
    // first draft filtered |z|<=0.001, matched nothing, and read -Infinity.
    const capZ = 0.36 / 2;
    let ok = true; const det: string[] = [];
    for (let i = 0; i < 4; i++) {
        const yc = ribbonY(i);
        const rv = verts.filter(v => ribbonClass(i, v) && Math.abs(Math.abs(v[2]) - capZ) <= 0.002);
        const crest = Math.max(...rv.map(v => v[1] - yc));
        const theory = [4 * A_AMP / Math.PI, 0.3117, 0.3078, 0.3069][i] + BAND_H / 2;  // probe P4 peaks + band
        if (Math.abs(crest - theory) > 0.004) { ok = false; det.push(`S${HARMONICS[i]} crest ${crest.toFixed(4)} vs ${theory.toFixed(4)}`); }
    }
    const s15 = Math.max(...verts.filter(v => ribbonClass(3, v) && Math.abs(Math.abs(v[2]) - capZ) <= 0.002).map(v => v[1] - ribbonY(3)));
    const gibbs = (s15 - BAND_H / 2 - A_AMP) / (2 * A_AMP);
    check("D3 crest + Gibbs from bytes", ok && gibbs > 0.07 && gibbs < 0.10,
        `crests exact; S15 overshoot ${(gibbs * 100).toFixed(1)}% of jump (theory 8.95%)${det.length ? "; DRIFT " + det.join("; ") : ""}`);
    }
}

// ---- D4 rail law --------------------------------------------------------------------------------------
{
    const verts = vertsOf(brassNode.n);
    const runVal = (x: number) => RAIL_A * Math.sign(Math.sin((2 * Math.PI * x) / LAM));
    let bad = 0;
    for (const v of verts) {
        const val = runVal(v[0] + (Math.abs(Math.sin(2 * Math.PI * v[0] / LAM)) < 1e-9 ? 1e-4 : 0));
        const dTop = Math.abs(v[1] - (RAIL_Y + val + RAIL_BAND / 2));
        const dBot = Math.abs(v[1] - (RAIL_Y + val - RAIL_BAND / 2));
        // jump-face vertices: x at a jump line, y anywhere between the two run bands
        const atJump = Math.abs(Math.sin(2 * Math.PI * v[0] / LAM)) < 1e-6 &&
            v[1] >= RAIL_Y - RAIL_A - RAIL_BAND / 2 - TOL && v[1] <= RAIL_Y + RAIL_A + RAIL_BAND / 2 + TOL;
        if (!(Math.min(dTop, dBot) <= TOL || atJump)) bad++;
    }
    check("D4 rail law", bad === 0 && verts.length > 100,
        `${verts.length} brass verts, ${bad} off the square-wave outline (runs ±(band/2), jump faces vertical)`);
}

// ---- D5 bead law --------------------------------------------------------------------------------------
{
    const verts = vertsOf(glowNode.n);
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
    const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
    const r = (mx[0] - mn[0]) / 2;
    const dErr = Math.hypot(ctr[0] - BEAD_C.x, ctr[1] - BEAD_C.y, ctr[2] - BEAD_C.z);
    const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
    const emissive = mat?.emissiveFactor ?? null;
    check("D5 bead law", dErr < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
        `center (${ctr.map(x => x.toFixed(3)).join(",")}) err ${dErr.toFixed(4)}, r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
}

// ---- D6 envelope == probe contract --------------------------------------------------------------------
{
    const all = [...vertsOf(stoneNode.n), ...vertsOf(brassNode.n), ...vertsOf(glowNode.n)];
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
    let dErr = 0;
    for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
    const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    check("D6 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
        `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
}

// ---- D7 named texMats (struct-38 law) -----------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D7 named texMats", mats.includes("four_stone") && mats.includes("four_brass") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
