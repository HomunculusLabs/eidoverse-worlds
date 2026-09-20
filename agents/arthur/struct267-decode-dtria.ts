// struct267-decode-dtria.ts — decode audit of village_dtria3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_trico3.glb — the parent's own build) and require >=1 FAIL.
//
// Checks: node census (dtria_stone + dtria_iron + glow_dtria_12), DAIS law
// (120-gon corners-on-axes sole at grade + TRUE analytic box), ROD law
// (iron verts within ROD_R+tol of the 180 exact dual segments, coverage
// 180/180), SAIL law (non-dais stone verts within the plate shell of the
// 120 face planes), BEAD law (12 bead clusters at the dec-rank points,
// emissive present, sole night element), GROUNDING law (sole at grade;
// foot bead pressed into the dais band), ENVELOPE == probe contract,
// NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    V, E, CENTERS, NORMALS, ENVELOPE, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    ROD_R, BEAD_R, PLATE_T, PLATE_BACK, BEADS, BEAD_POKE, STEM_H,
} from "./struct267-probe-dtria.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_dtria3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "dtria_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "dtria_iron");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_dtria_12"));
check("D1 node census: 3 mesh nodes (dtria_stone + dtria_iron + glow_dtria_12)",
    meshNodes.length === 3 && !!stoneNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);
if (fails.length) { console.error(`census FAIL on foreign/corrupt bytes — stopping (RED-clean, ${fails.length} fail)`); process.exit(1); }

const TOL = 0.0025;

// ---- D2 dais (the 120-gon: corners-on-axes, TRUE box = ±R both axes) ----------------------------------
{
    const v = vertsOf(stoneNode.n);
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    const minY = Math.min(...v.map((p) => p[1]));
    // 120-gon corners-on-axes (ROT=0, N=120): TRUE box extents are ±R on BOTH x and z.
    const xExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(PLINTH_R * Math.cos(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const zExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(-PLINTH_R * Math.sin(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const inside = pl.every(([x, y, z]) =>
        y >= -1e-6 && y <= PLINTH_H + TOL &&
        Math.abs(x) <= xExt + TOL && Math.abs(z) <= zExt + TOL);
    // the 120-gon's circumradius corners exist as verts
    const hasVertex = pl.some(([x, , z]) => {
        for (let i = 0; i < PLINTH_N; i++) {
            const ang = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
            const wx = PLINTH_R * Math.cos(ang), wz = -PLINTH_R * Math.sin(ang);   // mk maps shape y → world −z
            if (Math.hypot(x - wx, z - wz) < 1e-4) return true;
        }
        return false;
    });
    check("D2 dais", inside && hasVertex && minY >= -1e-4,
        `${pl.length} dais-band verts inside the true 120-gon prism (x ±${xExt.toFixed(3)} z ±${zExt.toFixed(3)}); circumradius corners present; sole min y ${minY.toFixed(6)}`);
}

// ---- D3 rods (iron verts near the 180 exact dual segments + the NAMED finial stem) -----------------------
{
    const v = vertsOf(ironNode.n);
    // the finial stem is an authored iron member (tret v2 occlusion law):
    // crown plane -> lifted bead center, on the axis. Named member, disclosed.
    const crownIdx = V.reduce((best, p, i) => p[1] > V[best][1] ? i : best, 0);
    const stemA = [0, V[crownIdx][1] + BEAD_POKE, 0];
    const stemB = [0, stemA[1] + STEM_H, 0];
    const segs: number[][][] = [...E.map(([i, j]) => [V[i], V[j]] as number[][]), [stemA, stemB]];
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
        for (const [a, b] of segs) best = Math.min(best, segDist(p, a, b));
        worst = Math.max(worst, best);
    }
    for (const [i, j] of E) {
        const mid = [(V[i][0] + V[j][0]) / 2, (V[i][1] + V[j][1]) / 2, (V[i][2] + V[j][2]) / 2];
        if (v.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]) < segTol)) covered++;
    }
    check("D3 rods", worst <= segTol && covered === E.length,
        `${v.length} iron verts; worst distance to the exact dual segments + the NAMED finial stem (${stemA[1].toFixed(3)}->${stemB[1].toFixed(3)} on-axis, authored member tret v2) ${(worst * 1e3).toFixed(2)} mm (<= ${(segTol * 1e3).toFixed(0)}); edge coverage ${covered}/${E.length}`);
}

// ---- D4 sails (non-dais stone verts within the plate shell of the 120 face planes) ------------------------
{
    const v = vertsOf(stoneNode.n).filter(([, y]) => y > PLINTH_H + 1e-6);
    const planeShell = (p: number[]) => {
        let best = Infinity;
        for (let u = 0; u < CENTERS.length; u++) {
            const c = CENTERS[u], n = NORMALS[u];
            const d = Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]);
            best = Math.min(best, d);
        }
        return best;
    };
    let worst = 0;
    for (const p of v) worst = Math.max(worst, planeShell(p));
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    const plateTol = Math.abs(sSide) + PLATE_T / 2 + 0.004;
    check("D4 sails", worst <= plateTol,
        `${v.length} plate verts over ${CENTERS.length} face planes; worst distance to the nearest face plane ${(worst * 1e3).toFixed(2)} mm (<= ${(plateTol * 1e3).toFixed(0)} mm shell bound)`);
}

// ---- D5 beads (12 clusters at the dec-rank points; emissive; sole night) --------------------------------
{
    const v = vertsOf(glowNode.n);
    let matched = 0;
    const used = new Set<number>();
    for (const bp of BEADS) {
        const idx = v.map((_, k) => k).filter((k) => !used.has(k) &&
            Math.hypot(v[k][0] - bp[0], v[k][1] - bp[1], v[k][2] - bp[2]) < BEAD_R + 0.01);
        if (idx.length) { matched++; for (const k of idx) used.add(k); }
    }
    const glowEmissive = (() => {
        const mesh = json.meshes[glowNode.n.mesh];
        const mat = json.materials[mesh.primitives[0].material];
        return !!mat?.emissiveFactor && mat.emissiveFactor.some((x: number) => x > 0.1);
    })();
    const soleNight = meshNodes.filter(({ n }: any) => {
        if (n === glowNode.n) return false;
        const mat = json.materials[json.meshes[n.mesh].primitives[0].material];
        return mat?.emissiveFactor?.some((x: number) => x > 0.1);
    }).length === 0;
    check("D5 beads", matched === 12 && glowEmissive && soleNight,
        `${matched}/12 dec-rank bead clusters matched; emissive ${glowEmissive}; sole night element ${soleNight}`);
}

// ---- D6 grounding ---------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map((p) => p[1]));
    const gv = vertsOf(glowNode.n);
    const lowestBeadY = Math.min(...gv.map((p) => p[1]));
    const footBead = BEADS.find((b) => b[1] < PLINTH_H)!;
    const halfProud = Math.abs(lowestBeadY - (footBead[1] - BEAD_R)) < 0.001;
    check("D6 grounding", minY >= -1e-4 && halfProud,
        `stone sole min y ${minY.toFixed(6)}; lowest bead min y ${lowestBeadY.toFixed(4)} (foot bead center ${footBead[1]}, dais top ${PLINTH_H}; pressed into the dais band — tico's-twelfth idiom)`);
}

// ---- D7 envelope ----------------------------------------------------------------------------------------
{
    const all: number[][] = [];
    for (const { n } of meshNodes) all.push(...vertsOf(n));
    const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
    const minZ = Math.min(...all.map((p) => p[2])), maxZ = Math.max(...all.map((p) => p[2]));
    const drift = Math.max(
        Math.abs(minX - ENVELOPE.min[0]), Math.abs(maxX - ENVELOPE.max[0]),
        Math.abs(minY - ENVELOPE.min[1]), Math.abs(maxY - ENVELOPE.max[1]),
        Math.abs(minZ - ENVELOPE.min[2]), Math.abs(maxZ - ENVELOPE.max[2]));
    check("D7 envelope == probe contract", drift <= 0.001,
        `(${minX.toFixed(3)}..${maxX.toFixed(3)}, ${minY.toFixed(3)}..${maxY.toFixed(3)}, ${minZ.toFixed(3)}..${maxZ.toFixed(3)}); drift ${(drift * 1e3).toFixed(2)} mm`);
}

// ---- D8 texMats -----------------------------------------------------------------------------------------
{
    const mats = new Set(meshNodes.map(({ n }: any) => matNameOf(n)));
    const named = ["dtria_stone", "dtria_iron"].every((m) => mats.has(m));
    const texd = meshNodes.filter(({ n }: any) => ["dtria_stone", "dtria_iron"].includes(matNameOf(n)))
        .every(({ n }: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.pbrMetallicRoughness?.baseColorTexture !== undefined);
    check("D8 texMats (struct-38 law)", named && texd,
        `mats [${[...mats].join(", ")}]; textured ${texd ? "2/2" : "MISSING"}`);
}

if (fails.length) { console.error(`${fails.length} DECODE FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (decode struct267-dtria)");
