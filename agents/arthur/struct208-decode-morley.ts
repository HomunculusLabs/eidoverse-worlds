// struct208-decode-morley.ts — decode audit of village_morley3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_viviani3.glb) and require >=1 FAIL.
//
// Checks: node census (mo_stone + mo_iron + mo_brass + glow), PLINTH law,
// GABLE law (stone voussoirs hug the three edge lines), ROD law (iron
// verts on the six trisector chords, forged heads at vertices), HEART law
// (brass verts on the exact equilateral: sides + three corner beads),
// BEAD law (topmost corner, emissive, sole night element), GROUNDING law
// (base course embedded 8cm, nothing below), ENVELOPE == probe contract,
// NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, W, D, ROD_R, HEAD_R, HEART_R, CORNER_R, BEAD_R,
    EDGES, RODS, MORLEY, HEART_SIDE_CLOSED, BEAD_AT_W, ENVELOPE, worldPt, a as SIDE_A,
} from "./struct208-probe-morley.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_morley3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "mo_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "mo_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "mo_brass");
// mergekit names the KEEP group's merged mesh "<group>_0" — match by prefix
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_mo_1"));
check("D1 node census: 4 mesh nodes (mo_stone + mo_iron + mo_brass + glow)",
    meshNodes.length === 4 && !!stoneNode && !!ironNode && !!brassNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// dense edge samples (world) for gable nearness
const EDGE_PTS: Array<[number, number, number]> = [];
for (const e of EDGES) {
    const L = Math.hypot(e.Q[0] - e.P[0], e.Q[1] - e.P[1]);
    for (let i = 0; i <= 600; i++) EDGE_PTS.push(worldPt([e.P[0] + (e.Q[0] - e.P[0]) * i / 600, e.P[1] + (e.Q[1] - e.P[1]) * i / 600]));
}
// rod segment distance in WORLD (z=0 plane): point-to-line
const rodLineDist = (v: number[], k: number) => {
    const A = worldPt(RODS[k].P0), B = worldPt(RODS[k].P1);
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const L = Math.hypot(dx, dy);
    return Math.abs((v[0] - A[0]) * dy - (v[1] - A[1]) * dx) / L;
};
// heart side line distance (world)
const M_W = MORLEY.map(worldPt) as [number, number, number][];
const heartSideDist = (v: number[], i: number, j: number) => {
    const A = M_W[i], B = M_W[j];
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const L = Math.hypot(dx, dy);
    return Math.abs((v[0] - A[0]) * dy - (v[1] - A[1]) * dx) / L;
};

// ---- D2 plinth law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 plinth law", false, "mo_stone bucket absent (foreign/malformed target)"); }
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

// ---- D3 gable law -------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 gable law", false, "mo_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const gable = verts.filter((v) => v[1] > PLINTH_H + TOL);
        const near = (v: number[]) => {
            let best = Infinity;
            for (const p of EDGE_PTS) { const d = Math.hypot(p[0] - v[0], p[1] - v[1]); if (d < best) best = d; }
            return best;
        };
        let onEdges = 0;
        for (const v of gable) if (near(v) <= W / 2 + 0.010) onEdges++;
        check("D3 gable law", gable.length >= 500 && onEdges >= gable.length * 0.95,
            `${onEdges}/${gable.length} gable verts within W/2+10mm of the three edge lines (dense 600/edge) — the 40/60/80 scalene frame reads from bytes`);
    }
}

// ---- D4 rod law ---------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 rod law", false, "mo_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // nearest-rod-line distance for every vert; forged head balls (r=HEAD_R
        // centered ON the vertex) are designed geometry — count them by point
        // membership, not line distance
        let onRods = 0;
        for (const v of verts) {
            let best = Infinity;
            for (let k = 0; k < 6; k++) best = Math.min(best, rodLineDist(v, k));
            if (best <= ROD_R + 0.010) onRods++;
            else {
                const nearHead = [worldPt(RODS[0].P0), worldPt(RODS[2].P0), worldPt(RODS[4].P0)]
                    .some((P) => Math.hypot(v[0] - P[0], v[1] - P[1], v[2] - P[2]) <= HEAD_R + 0.010);
                if (nearHead) onRods++;
            }
        }
        // per-rod population: verts within ROD_R+10mm of THIS rod line
        const perRod = RODS.map((_, k) => verts.filter((v) => rodLineDist(v, k) <= ROD_R + 0.010).length);
        // forged heads at the three vertices (r = HEAD_R balls)
        const V_W = [worldPt(RODS[0].P0), worldPt(RODS[2].P0), worldPt(RODS[4].P0)];
        const heads = V_W.map((P) => verts.filter((v) => Math.hypot(v[0] - P[0], v[1] - P[1], v[2] - P[2]) <= HEAD_R + 0.01).length);
        check("D4 rod law", onRods >= verts.length * 0.97 && perRod.every((c) => c >= 40) && heads.every((h) => h >= 20),
            `${onRods}/${verts.length} iron verts on the six trisector lines (±rod+10mm); per-rod [${perRod.join(",")}]; forged heads at A/B/C [${heads.join(",")}] — the six exact thirds read from bytes`);
    }
}

// ---- D5 heart law -------------------------------------------------------------------------------------
{
    if (!brassNode) { check("D5 heart law", false, "mo_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        let onSides = 0;
        for (const v of verts) {
            const d = Math.min(heartSideDist(v, 0, 1), heartSideDist(v, 1, 2), heartSideDist(v, 2, 0));
            if (d <= HEART_R + 0.010) onSides++;
        }
        const corners = M_W.map((P) => verts.filter((v) => Math.hypot(v[0] - P[0], v[1] - P[1], v[2] - P[2]) <= CORNER_R + 0.01).length);
        // side span check: brass verts project onto each side within the segment (no overhang)
        const spanOK = ([[0, 1], [1, 2], [2, 0]] as [number, number][]).every(([i, j]) => {
            const A = M_W[i], B = M_W[j];
            const dx = B[0] - A[0], dy = B[1] - A[1];
            const L = Math.hypot(dx, dy);
            const ts = verts.filter((v) => heartSideDist(v, i, j) <= HEART_R + 0.010)
                .map((v) => ((v[0] - A[0]) * dx + (v[1] - A[1]) * dy) / L);
            if (!ts.length) return false;
            return Math.min(...ts) >= -CORNER_R - 0.01 && Math.max(...ts) <= L + CORNER_R + 0.01;
        });
        check("D5 heart law", onSides >= verts.length * 0.85 && corners.every((c) => c >= 20) && spanOK,
            `${onSides}/${verts.length} brass verts on the three heart sides; corner populations [${corners.join(",")}]; side spans contained — the exact equilateral (side ${HEART_SIDE_CLOSED.toFixed(6)} m) reads from bytes`);
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
        const centered = Math.hypot(cx - BEAD_AT_W[0], cy - BEAD_AT_W[1], cz - BEAD_AT_W[2]) <= 0.005;
        const radius = Math.max(...verts.map((v) => Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz)));
        const matIdx = json.meshes[glowNode.n.mesh].primitives[0].material;
        const mat = json.materials[matIdx];
        const emis = mat?.emissiveFactor && (mat.emissiveFactor.some((c: number) => c > 0.05));
        check("D6 bead law", verts.length >= 200 && centered && Math.abs(radius - BEAD_R) <= 0.005 && !!emis,
            `${verts.length} verts, centroid (${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) == topmost heart corner (${BEAD_AT_W[0].toFixed(3)}, ${BEAD_AT_W[1].toFixed(3)}, ${BEAD_AT_W[2].toFixed(3)}) within 5mm; r=${radius.toFixed(4)}; emissiveFactor present — the sole night element reads from bytes`);
    }
}

// ---- D7 grounding law ---------------------------------------------------------------------------------
{
    // gable = verts near the three edge LINES (2D); the base course's lower
    // half sits INSIDE the plinth box, so a y-threshold filter would exclude
    // exactly the embedded band — discriminate by edge-nearness instead
    const near = (v: number[]) => {
        let best = Infinity;
        for (const p of EDGE_PTS) { const d = Math.hypot(p[0] - v[0], p[1] - v[1]); if (d < best) best = d; }
        return best;
    };
    let minStoneY = Infinity, minGableY = Infinity, minIronY = Infinity, minBrassY = Infinity;
    if (stoneNode) for (const v of vertsOf(stoneNode.n)) {
        minStoneY = Math.min(minStoneY, v[1]);
        if (near(v) <= W / 2 + 0.010) minGableY = Math.min(minGableY, v[1]);
    }
    if (ironNode) for (const v of vertsOf(ironNode.n)) minIronY = Math.min(minIronY, v[1]);
    if (brassNode) for (const v of vertsOf(brassNode.n)) minBrassY = Math.min(minBrassY, v[1]);
    const embed = PLINTH_H - 0.08;
    check("D7 grounding law", Math.abs(minStoneY - 0) <= 0.002 && Math.abs(minGableY - embed) <= 0.005 && minIronY >= embed - 0.005 && minBrassY >= embed - 0.005,
        `plinth sole at grade ${minStoneY.toFixed(3)} m; gable lowest course ${minGableY.toFixed(3)} == plinth top − 8cm ${embed.toFixed(3)} (cradle embed); lowest iron ${minIronY.toFixed(3)} / brass ${minBrassY.toFixed(3)} never below it — nothing floats, nothing dips`);
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
    const ok = ["mo_stone", "mo_iron", "mo_brass"].every((n) => names.includes(n));
    check("D9 named texMats", ok, `materials [${names.join(", ")}]`);
}

if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
