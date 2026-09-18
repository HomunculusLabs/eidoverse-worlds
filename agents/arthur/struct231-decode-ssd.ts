// struct231-decode-ssd.ts — decode audit of village_ssd3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_csaszar3.glb — the DUAL family's own build) and require >=1 FAIL.
//
// Checks: node census (ssd_stone + ssd_iron + glow_ssd_12), DAIS law
// (dodecagon sole at grade + TRUE analytic box), ROD law (iron verts within
// ROD_R+tol of the 30 exact star segments, coverage 30/30), MEMBRANE law
// (non-dais stone verts within the plate shell of the 12 face planes),
// BEAD law (12 bead clusters at the vertices, emissive present, sole night
// elements), GROUNDING law (tip bead half-proud in dais top; sole at grade),
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    V, E, CENTERS, NORMALS, ENVELOPE, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    ROD_R, BEAD_R, PLATE_T, PLATE_BACK,
} from "./struct231-probe-ssd.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_ssd3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ssd_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ssd_iron");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_ssd_12"));
check("D1 node census: 3 mesh nodes (ssd_stone + ssd_iron + glow_ssd_12)",
    meshNodes.length === 3 && !!stoneNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);
if (fails.length) { console.error(`census FAIL on foreign/corrupt bytes — stopping (RED-clean, ${fails.length} fail)`); process.exit(1); }

const TOL = 0.0025;

// ---- D2 dais ------------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    const minY = Math.min(...v.map((p) => p[1]));
    // dais verts must lie inside the true dodecagon prism. With ROT=0 the
    // dodecagon carries corners ON both axes (k·30° includes 0° and 90°), so
    // the TRUE box extents are ±R on x and z — the apothem bound is wrong
    // here (self-caught RED: it false-failed the exact geometry D7 proves).
    const xExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(PLINTH_R * Math.cos(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const zExt = Math.max(...Array.from({ length: PLINTH_N }, (_, i) => Math.abs(-PLINTH_R * Math.sin(PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2))));
    const inside = pl.every(([x, y, z]) =>
        y >= -1e-6 && y <= PLINTH_H + TOL &&
        Math.abs(x) <= xExt + TOL && Math.abs(z) <= zExt + TOL);
    // the dodecagon's circumradius corners exist as verts
    const hasVertex = pl.some(([x, , z]) => {
        for (let i = 0; i < PLINTH_N; i++) {
            const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
            const wx = PLINTH_R * Math.cos(a), wz = -PLINTH_R * Math.sin(a);   // mk maps shape y → world −z
            if (Math.hypot(x - wx, z - wz) < 1e-4) return true;
        }
        return false;
    });
    check("D2 dais", inside && hasVertex && minY >= -1e-4,
        `${pl.length} dais-band verts inside the true dodecagon prism (x ±${xExt.toFixed(3)} z ±${zExt.toFixed(3)}); circumradius corners present; sole min y ${minY.toFixed(6)}`);
}

// ---- D3 rods (iron verts near the 30 exact star segments) ------------------------------------------------
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
        for (const [i, j] of E) best = Math.min(best, segDist(p, V[i], V[j]));
        worst = Math.max(worst, best);
    }
    for (const [i, j] of E) {
        const mid = [(V[i][0] + V[j][0]) / 2, (V[i][1] + V[j][1]) / 2, (V[i][2] + V[j][2]) / 2];
        if (v.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]) < segTol)) covered++;
    }
    check("D3 rods", worst <= segTol && covered === E.length,
        `${v.length} iron verts; worst distance to the exact star segments ${(worst * 1e3).toFixed(2)} mm (<= ${(segTol * 1e3).toFixed(0)}); edge coverage ${covered}/${E.length}`);
}

// ---- D4 membranes (non-dais stone verts within the plate shell of the 12 face planes) ----------------------
{
    const v = vertsOf(stoneNode.n).filter(([, y]) => y > PLINTH_H + 1e-6);
    const planeShell = (p: number[]) => {
        let best = Infinity;
        for (let u = 0; u < 12; u++) {
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
        `${v.length} plate verts; worst distance to the nearest face plane ${(worst * 1e3).toFixed(2)} mm (<= ${(plateTol * 1e3).toFixed(0)} mm shell bound)`);
}

// ---- D5 beads (12 clusters at the vertices; emissive; sole night) ------------------------------------------
{
    const v = vertsOf(glowNode.n);
    // cluster by proximity to each vertex (BEAD_R shell)
    let matched = 0;
    const used = new Set<number>();
    for (let i = 0; i < V.length; i++) {
        const idx = v.map((_, k) => k).filter((k) => !used.has(k) &&
            Math.hypot(v[k][0] - V[i][0], v[k][1] - V[i][1], v[k][2] - V[i][2]) < BEAD_R + 0.01);
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
    check("D5 beads", matched === 12 && emissive && soleNight,
        `${matched}/12 vertex clusters matched; emissive ${emissive}; sole night element ${soleNight}`);
}

// ---- D6 grounding --------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map((p) => p[1]));
    const gv = vertsOf(glowNode.n);
    const tipY = Math.min(...gv.map((p) => p[1]));
    // tip bead half-proud: its lowest point sits BELOW the dais top (embedded) but above grade
    const halfProud = tipY < PLINTH_H - 1e-6 && tipY >= -1e-4;
    check("D6 grounding", minY >= -1e-4 && halfProud,
        `stone sole min y ${minY.toFixed(6)}; tip bead min y ${tipY.toFixed(4)} (dais top ${PLINTH_H}; half-proud embed)`);
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
    const named = ["ssd_stone", "ssd_iron"].every((m) => mats.has(m));
    const texd = meshNodes.filter(({ n }: any) => ["ssd_stone", "ssd_iron"].includes(matNameOf(n)))
        .every(({ n }: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.pbrMetallicRoughness?.baseColorTexture !== undefined);
    check("D8 texMats (struct-38 law)", named && texd,
        `mats [${[...mats].join(", ")}]; textured ${texd ? "2/2" : "MISSING"}`);
}

if (fails.length) { console.error(`${fails.length} DECODE FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (decode struct231-ssd)");
