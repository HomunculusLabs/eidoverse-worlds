// struct247-decode-tret.ts — decode audit of village_tret3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_toct3.glb — the sibling Archimedean's own bytes) and require
// >=1 FAIL (census stop).
//
// Checks: node census (tret_stone + tret_iron + glow_tret_4), DAIS law
// (8-gon sole at grade + TRUE analytic box), ROD law (iron verts split:
// near the 18 exact edges OR on the 4 triangle plate shells — coverage
// 18/18 bonds), MEMBRANE law (stone plate verts within the plate shell of
// the 4 hex face planes), BEAD law (4 bead clusters at the four POKED
// hexagon centers — center + normal·BEAD_POKE — emissive present, sole
// night elements, ALL ALOFT above the dais top), ENVELOPE == probe
// contract (TRUE rim extents), NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, IS_TRI, ENVELOPE,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    ROD_R, BEAD_R, BEAD_POKE, STEM_H, STEM_R, PLATE_T, PLATE_BACK,
} from "./struct247-probe-tret.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_tret3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "tret_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "tret_iron");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_tret_4"));
check("D1 node census: 3 mesh nodes (tret_stone + tret_iron + glow_tret_4)",
    meshNodes.length === 3 && !!stoneNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);
if (fails.length) { console.error(`census FAIL on foreign/corrupt bytes — stopping (RED-clean, ${fails.length} fail)`); process.exit(1); }

// ---- finial stem segment (v2, module scope): crown plane → crown plane + STEM_H, on the axis ----------------------
const TOP_IDX = FACE_V.findIndex((_, u) => !IS_TRI[u] && NORMALS[u][1] > 0.99);
const STEM_BASE = [
    CENTERS[TOP_IDX][0] + NORMALS[TOP_IDX][0] * BEAD_POKE,
    CENTERS[TOP_IDX][1] + NORMALS[TOP_IDX][1] * BEAD_POKE,
    CENTERS[TOP_IDX][2] + NORMALS[TOP_IDX][2] * BEAD_POKE,
];
const STEM_TOP = [STEM_BASE[0], STEM_BASE[1] + STEM_H, STEM_BASE[2]];

const TOL = 0.0025;

// ---- D2 dais (8-gon; TRUE box from the actual corner angles) ------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    const minY = Math.min(...v.map((p) => p[1]));
    const xExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(PLINTH_R * Math.cos(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const zExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(-PLINTH_R * Math.sin(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const inside = pl.every(([x, y, z]) =>
        y >= -1e-6 && y <= PLINTH_H + TOL &&
        Math.abs(x) <= xExt + TOL && Math.abs(z) <= zExt + TOL);
    const hasVertex = pl.some(([x, , z]) => {
        for (let i = 0; i < PLINTH_N; i++) {
            const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
            const wx = PLINTH_R * Math.cos(a), wz = -PLINTH_R * Math.sin(a);   // mk maps shape y → world −z
            if (Math.hypot(x - wx, z - wz) < 1e-4) return true;
        }
        return false;
    });
    check("D2 dais", inside && hasVertex && minY >= -1e-4,
        `${pl.length} dais-band verts inside the true 8-gon prism (x ±${xExt.toFixed(3)} z ±${zExt.toFixed(3)}); circumradius corners present; sole min y ${minY.toFixed(6)}`);
}

// ---- D3 rods + triangle plates (the iron lane splits two ways) ----------------------------------------------------
{
    const v = vertsOf(ironNode.n);
    const segDist = (p: number[], a: number[], b: number[]) => {
        const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
        const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
        const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
        return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]);
    };
    // finial stem segment (v2): module-scope STEM_BASE/STEM_TOP
    const stemBase = STEM_BASE;
    const stemTop = STEM_TOP;
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    const plateShell = (p: number[]) => {
        let best = Infinity;
        for (let u = 0; u < FACE_V.length; u++) {
            if (!IS_TRI[u]) continue;                       // triangle plates only (iron lane)
            const c = CENTERS[u], n = NORMALS[u];
            const d = Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]);
            best = Math.min(best, d);
        }
        return best;
    };
    const segTol = ROD_R + 0.004;
    const plateTol = Math.abs(sSide) + PLATE_T / 2 + 0.004;
    let worstRod = 0, worstPlate = 0, rodVerts = 0, plateVerts = 0, stemVerts = 0, unclassified = 0;
    for (const p of v) {
        const rodD = Math.min(...E.map(([i, j]) => segDist(p, V[i], V[j])));
        const stemD = segDist(p, stemBase, stemTop);
        const plateD = plateShell(p);
        if (rodD <= segTol) { rodVerts++; worstRod = Math.max(worstRod, rodD); }
        else if (stemD <= STEM_R + 0.004) stemVerts++;
        else if (plateD <= plateTol) { plateVerts++; worstPlate = Math.max(worstPlate, plateD); }
        else unclassified++;
    }
    let covered = 0;
    for (const [i, j] of E) {
        const mid = [(V[i][0] + V[j][0]) / 2, (V[i][1] + V[j][1]) / 2, (V[i][2] + V[j][2]) / 2];
        if (v.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]) < segTol)) covered++;
    }
    check("D3 iron lane: every vert on a rod OR the finial stem OR a triangle plate; 18/18 bond coverage",
        unclassified === 0 && covered === E.length && stemVerts > 0,
        `${v.length} iron verts = ${rodVerts} rod + ${stemVerts} finial-stem + ${plateVerts} triangle-plate + ${unclassified} unclassified; worst rod dist ${(worstRod * 1e3).toFixed(2)}mm (<= ${(segTol * 1e3).toFixed(0)}); worst plate dist ${(worstPlate * 1e3).toFixed(2)}mm (<= ${(plateTol * 1e3).toFixed(0)}); bond coverage ${covered}/${E.length}`);
}

// ---- D4 membranes (stone plate verts within the plate shell of the 4 hex planes) --------------------------------
{
    const v = vertsOf(stoneNode.n).filter(([, y]) => y > PLINTH_H + 1e-6);
    const planeShell = (p: number[]) => {
        let best = Infinity;
        for (let u = 0; u < FACE_V.length; u++) {
            if (IS_TRI[u]) continue;                        // hexagon plates only (stone lane)
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
    check("D4 membranes", worst <= plateTol,
        `${v.length} hex-plate verts; worst distance to the nearest hex plane ${(worst * 1e3).toFixed(2)} mm (<= ${(plateTol * 1e3).toFixed(0)} mm shell bound)`);
}

// ---- D5 beads (4 clusters at the four POKED hexagon centers; emissive; sole night; ALL ALOFT) ----------------------
{
    const v = vertsOf(glowNode.n);
    let matched = 0;
    const used = new Set<number>();
    for (let u = 0; u < FACE_V.length; u++) {
        if (IS_TRI[u]) continue;
        const isCrown = NORMALS[u][1] > 0.99;
        const pc = isCrown
            ? [STEM_TOP[0], STEM_TOP[1], STEM_TOP[2]]                     // v2: crown bead lifted on the finial stem
            : [
                CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
                CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
                CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE,
            ];
        const idx = v.map((_, k) => k).filter((k) => !used.has(k) &&
            Math.hypot(v[k][0] - pc[0], v[k][1] - pc[1], v[k][2] - pc[2]) < BEAD_R + 0.01);
        if (idx.length) { matched++; for (const k of idx) used.add(k); }
    }
    const emissive = (() => {
        const mesh = json.meshes[glowNode.n.mesh];
        const mat = json.materials[mesh.primitives[0].material];
        return !!mat?.emissiveFactor && mat.emissiveFactor.some((x: number) => x > 0.1);
    })();
    const soleNight = meshNodes.filter(({ n }: any) => {
        const mat = json.materials[json.meshes[n.mesh].primitives[0].material];
        return mat?.emissiveFactor?.some((x: number) => x > 0.1);
    }).length === 1;
    const allAloft = v.every((p) => p[1] > PLINTH_H + 1e-6);   // every bead above the dais top — the foot triangle carries none
    check("D5 beads", matched === 4 && emissive && soleNight && allAloft,
        `${matched}/4 poked-hexagon-center clusters matched; emissive ${emissive}; sole night element ${soleNight}; all aloft ${allAloft} (1 crown dead-axis + 3 waist at 120° — the four that remain, lit; the cuts stay dark)`);
}

// ---- D6 grounding --------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map((p) => p[1]));
    const band = v.filter((p) => p[1] <= 0.5 + 1e-6).length;
    check("D6 grounding", minY >= -1e-4 && band > 0,
        `stone sole min y ${minY.toFixed(6)}; ${band} verts in the ground band (8-gon dais carries the solid at grade; bottom triangle flat on its top)`);
}

// ---- D7 envelope ---------------------------------------------------------------------------------------
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

// ---- D8 texMats ----------------------------------------------------------------------------------------
{
    const mats = new Set(meshNodes.map(({ n }: any) => matNameOf(n)));
    const named = ["tret_stone", "tret_iron"].every((m) => mats.has(m));
    const texd = meshNodes.filter(({ n }: any) => ["tret_stone", "tret_iron"].includes(matNameOf(n)))
        .every(({ n }: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.pbrMetallicRoughness?.baseColorTexture !== undefined);
    check("D8 texMats (struct-38 law)", named && texd,
        `mats [${[...mats].join(", ")}]; textured ${texd ? "2/2" : "MISSING"}`);
}

if (fails.length) { console.error(`${fails.length} DECODE FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (decode struct247-tret)");
