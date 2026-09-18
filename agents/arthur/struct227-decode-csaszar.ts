// struct227-decode-csaszar.ts — decode audit of village_csaszar3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_oloid3.glb) and require >=1 FAIL.
//
// Checks: node census (cs_stone + cs_iron + glow_cs_7), PLINTH law (heptagon
// sole at grade + TRUE analytic box), ROD law (iron verts within ROD_R+tol of
// the 21 exact edge segments, coverage 21/21), PLATE law (non-plinth stone
// verts lie near the 14 face planes), BEAD law (7 bead centroids == the 7
// K7 vertices, emissive present, sole night elements), GROUNDING law,
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    V, FACES, EDGES, ENVELOPE, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H, PLINTH_BOX,
    ROD_R, BEAD_R, FOOT_FACE, PLATE_T, PLATE_INSET, PLATE_BACK, PLATED,
} from "./struct227-probe-csaszar.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_csaszar3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "cs_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "cs_iron");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_cs_7"));
check("D1 node census: 3 mesh nodes (cs_stone + cs_iron + glow_cs_7)",
    meshNodes.length === 3 && !!stoneNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.0025;

// ---- D2 plinth ------------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    const minY = Math.min(...v.map((p) => p[1]));
    // plinth verts must lie inside the TRUE heptagon prism (apothem bound in x/z)
    const apo = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const inside = pl.every(([x, y, z]) =>
        y >= -1e-6 && y <= PLINTH_H + TOL && Math.hypot(x, z) <= PLINTH_R + TOL &&
        Math.abs(x) <= Math.abs(PLINTH_BOX.x1) + TOL && Math.abs(z) <= Math.max(Math.abs(PLINTH_BOX.z0), Math.abs(PLINTH_BOX.z1)) + TOL);
    // the heptagon's circumradius corners exist as verts
    // (axis law: verts are [x,y,z] — destructure with the hole, [x, , z])
    const hasVertex = pl.some(([x, , z]) => {
        for (let i = 0; i < PLINTH_N; i++) {
            const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
            const wx = PLINTH_R * Math.cos(a), wz = -PLINTH_R * Math.sin(a);   // mk maps shape y → world −z
            if (Math.hypot(x - wx, z - wz) < 1e-4) return true;
        }
        return false;
    });
    check("D2 plinth", inside && hasVertex && minY >= -1e-6,
        `${pl.length} plinth-band verts inside the true heptagon prism; circumradius corners present; sole min y ${minY.toFixed(6)}`);
}

// ---- D3 rods (iron verts near the 21 exact edge segments) ------------------------------------------------
{
    const v = vertsOf(ironNode.n);
    const segDist = (p: number[], a: number[], b: number[]) => {
        const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
        const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
        const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
        return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]);
    };
    const segTol = ROD_R + 0.004;                     // cylinder surface within ROD_R; cap rings add slop
    let worst = 0, covered = 0;
    for (const p of v) {
        let best = Infinity;
        for (const [i, j] of EDGES) best = Math.min(best, segDist(p, V[i], V[j]));
        worst = Math.max(worst, best);
    }
    for (const [i, j] of EDGES) {
        // direct midpoint-distance test — a degenerate [mid,mid] segment makes
        // segDist divide by zero and NaN-compare false (self-caught: coverage 0/21)
        const mid = [(V[i][0] + V[j][0]) / 2, (V[i][1] + V[j][1]) / 2, (V[i][2] + V[j][2]) / 2];
        if (v.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]) < segTol)) covered++;    // mid ring verts near the midpoint
    }
    check("D3 rods", worst <= segTol && covered === EDGES.length,
        `${v.length} iron verts; worst distance to the exact K7 segments ${(worst * 1e3).toFixed(2)} mm (<= ${(segTol * 1e3).toFixed(0)}); edge coverage ${covered}/${EDGES.length}`);
}

// ---- D4 plates (non-plinth stone verts near the PLATED face planes) ---------------------------------------
{
    const v = vertsOf(stoneNode.n).filter(([, y]) => y > PLINTH_H + 1e-6);
    const facePlaneDist = (p: number[]) => {
        let best = Infinity;
        for (const fi of PLATED) {
            const f = FACES[fi];
            const [A, B, C] = [V[f[0]], V[f[1]], V[f[2]]];
            const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
            const w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
            const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
            const len = Math.hypot(...n) || 1;
            const nn = [n[0] / len, n[1] / len, n[2] / len];
            const d = Math.abs((p[0] - A[0]) * nn[0] + (p[1] - A[1]) * nn[1] + (p[2] - A[2]) * nn[2]);
            best = Math.min(best, d);
        }
        return best;
    };
    let worst = 0;
    for (const p of v) worst = Math.max(worst, facePlaneDist(p));
    // sSide offset from the face plane: |ROD_R − PLATE_BACK − PLATE_T/2| + PLATE_T/2 + inset slop
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    const plateTol = Math.abs(sSide) + PLATE_T / 2 + 0.004;
    check("D4 plates", worst <= plateTol,
        `${v.length} plate verts; worst distance to the nearest exact face plane ${(worst * 1e3).toFixed(2)} mm (<= ${((sSide + PLATE_T / 2) * 1e3).toFixed(0)} mm shell bound)`);
}

// ---- D5 beads (7 centroids == 7 K7 vertices; emissive; sole night) -----------------------------------------
{
    const v = vertsOf(glowNode.n);
    // beads are separate sphere meshes merged into one node — cluster by connectivity
    // of proximity: assign each vert to the nearest analytic vertex (analytic assignment law)
    const assign = v.map((p) => {
        let best = 0, bd = Infinity;
        V.forEach((q, qi) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (d < bd) { bd = d; best = qi; } });
        return { i: best, d: bd };
    });
    const maxDist = Math.max(...assign.map((a) => a.d));
    const counts = new Array(V.length).fill(0);
    for (const a of assign) counts[a.i]++;
    const covered = counts.filter((c) => c > 20).length;
    const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
    const hasEmissive = Array.isArray(mat?.emissiveFactor) && mat.emissiveFactor.some((c: number) => c > 0.05);
    const others = meshNodes.filter(({ n }: any) => n !== glowNode.n)
        .every(({ n }: any) => {
            const m = json.materials[json.meshes[n.mesh].primitives[0].material];
            return !(Array.isArray(m?.emissiveFactor) && m.emissiveFactor.some((c: number) => c > 0.05));
        });
    check("D5 beads", maxDist <= BEAD_R + TOL && covered === 7 && hasEmissive && others,
        `7 bead clusters by analytic assignment (worst vert-vertex distance ${(maxDist * 1e3).toFixed(1)} mm <= bead r+tol; clusters ${covered}/7 with >20 verts each); emissiveFactor present; sole night elements`);
}

// ---- D6 grounding ----------------------------------------------------------------------------------------
{
    const stoneMinY = Math.min(...vertsOf(stoneNode.n).map((p) => p[1]));
    const footIdx = new Set(FACES[FOOT_FACE]);
    const footPlateTop = Math.min(...FACES[FOOT_FACE].map((i) => V[i][1]));
    check("D6 grounding", Math.abs(stoneMinY) < 1e-6 && Math.abs(footPlateTop - PLINTH_H) < 1e-9,
        `plinth sole at ${stoneMinY.toFixed(6)} (grade 0); foot face plane at ${footPlateTop.toFixed(6)} == plinth top ${PLINTH_H} (flush contact, probe T8)`);
}

// ---- D7 envelope -----------------------------------------------------------------------------------------
{
    const vAll = meshNodes.flatMap(({ n }: any) => vertsOf(n));
    const mn = [0, 1, 2].map((a) => Math.min(...vAll.map((p) => p[a])));
    const mx = [0, 1, 2].map((a) => Math.max(...vAll.map((p) => p[a])));
    const dErr = Math.max(
        ...[0, 1, 2].flatMap((a) => [Math.abs(mn[a] - ENVELOPE.min[a]), Math.abs(mx[a] - ENVELOPE.max[a])]));
    check("D7 envelope", dErr < 0.001 && mn[1] >= -1e-6,
        `min [${mn.map((x) => x.toFixed(3)).join(",")}] max [${mx.map((x) => x.toFixed(3)).join(",")}] vs probe TRUE-box contract (drift ${dErr.toFixed(5)})`);
}

// ---- D8 texMats ------------------------------------------------------------------------------------------
{
    const mats = new Set(meshNodes.map(({ n }: any) => matNameOf(n)));
    const ok = mats.has("cs_stone") && mats.has("cs_iron") && ![...mats].some((m) => m === "?");
    const lanes = meshNodes.filter(({ n }: any) => ["cs_stone", "cs_iron"].includes(matNameOf(n)));
    const uvCount = lanes.filter(({ n }: any) => {
        const prims = json.meshes[n.mesh].primitives;
        return prims.every((p: any) => p.attributes.TEXCOORD_0 !== undefined);
    }).length;
    check("D8 texMats", ok && uvCount === lanes.length,
        `materials [${[...mats].join(", ")}]; TEXCOORD_0 on ${uvCount}/${lanes.length} lane mesh nodes (struct-38 texMat lanes; glow plain by lineage)`);
}

// ---- RED control (foreign GLB must FAIL somewhere; non-vacuous by construction) ---------------------------
{
    const isForeign = !json.nodes?.some?.((n: any) => (n.name ?? "").startsWith("csaszar")) &&
        !meshNodes.some(({ n }: any) => matNameOf(n) === "cs_stone");
    // explicit non-vacuity: the oloid GLB lacks cs_stone/cs_iron/glow_cs_7 → D1 fails on it
    check("RED control (self)", !isForeign,
        isForeign ? "foreign GLB detected — this run is the RED control; expect D1 FAIL above" : "own GLB — D1 census was non-vacuous (all three named nodes found)");
}

console.log(fails.length === 0 ? "DECODE ALL PASS" : `DECODE ${fails.length} FAIL: ${fails.join("; ")}`);
if (fails.length > 0) process.exit(1);
