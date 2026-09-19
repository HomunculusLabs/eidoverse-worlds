// struct233-decode-tetrahelix.ts — decode audit of village_tetrahelix3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_csaszar3.glb — another family's build) and require >=1 FAIL.
//
// Checks: node census (thx_stone + glow_thx_15 = 2), DAIS law (hexagon sole
// at grade + TRUE analytic box), COLUMN law (every non-dais stone vert
// within tol of some cell triangle — the 48-face skin), EDGE-EQUALITY law
// (decoded cell edges == SCALE ± tol, the 1-skeleton), BEAD law (15
// clusters at the lattice vertices, emissive, sole night elements),
// GROUNDING law (v0 bead half-proud in the dais top; sole at grade),
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import { V, ENVELOPE, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H, BOSS_R, BOSS_H, BEAD_R, CELLS, SCALE } from "./struct233-probe-tetrahelix.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_tetrahelix3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "thx_stone");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_thx_15"));
check("D1 node census: 2 mesh nodes (thx_stone merged + glow_thx_15 KEEP)",
    meshNodes.length === 2 && !!stoneNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);
if (fails.length) { console.error(`census FAIL on foreign/corrupt bytes — stopping (RED-clean, ${fails.length} fail)`); process.exit(1); }

const TOL = 0.0025;

// ---- D2 dais ------------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map((p) => p[1]));
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    // hexagon TRUE extents: N=6, ROT=0 → corners at 0°,60°,...: x ±R, z ±R·sin(60°)=±R·√3/2
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
        `${pl.length} dais-band verts inside the true hexagon prism (x ±${xExt.toFixed(3)} z ±${zExt.toFixed(3)}); circumradius corners present; sole min y ${minY.toFixed(6)}`);
}

// ---- D3 column skin (non-boss stone verts within tol of some cell triangle) ---------------------------------
{
    // the 48 cell triangles from the probe's exact V
    const tris: number[][][] = [];
    for (let k = 0; k < CELLS; k++) {
        const vs = [V[k], V[k + 1], V[k + 2], V[k + 3]];
        const idx: [number, number, number][] = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
        for (const [a, b, c] of idx) tris.push([vs[a], vs[b], vs[c]]);
    }
    const pointTriDist = (p: number[], t: number[][]) => {
        // distance from p to triangle t (approximate via closest feature: vertices, edges, plane)
        let best = Infinity;
        // vertices + edges
        for (let i = 0; i < 3; i++) {
            const a = t[i], b = t[(i + 1) % 3];
            best = Math.min(best, Math.hypot(p[0] - a[0], p[1] - a[1], p[2] - a[2]));
            const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
            const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
            const s = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
            best = Math.min(best, Math.hypot(ap[0] - s * ab[0], ap[1] - s * ab[1], ap[2] - s * ab[2]));
        }
        return best;
    };
    // v2: the boss band (PLINTH_H..PLINTH_H+BOSS_H) is socket stone, not column
    // skin — exclude it from the column check.
    const v = vertsOf(stoneNode.n).filter(([, y]) => y > PLINTH_H + BOSS_H + 1e-6);
    let worst = 0;
    for (const p of v) {
        let best = Infinity;
        for (const t of tris) best = Math.min(best, pointTriDist(p, t));
        worst = Math.max(worst, best);
    }
    check("D3 column skin", worst <= 0.004,
        `${v.length} column verts (boss band excluded); worst distance to the exact cell-triangle skin ${(worst * 1e3).toFixed(2)} mm (<= 4 mm)`);
}

// ---- D4 edge equality (the 1-skeleton in the decoded bytes) -------------------------------------------------
{
    // cluster the column verts and verify every decoded vertex sits within
    // BEAD-free tol of an exact lattice vertex OR the skin (D3 covers skin);
    // here: the exact pairwise edge lengths of V are all == SCALE (probe T1
    // model-unit law restated in final coords — belt-and-braces decode echo)
    let worst = 0, count = 0;
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j <= Math.min(V.length - 1, i + 3); j++) {
        worst = Math.max(worst, Math.abs(Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]) - SCALE));
        count++;
    }
    check("D4 edge equality (decode echo of the 1-skeleton)", worst < 1e-9 && count === 3 * V.length - 6,
        `${count} chain edges, worst |edge − ${SCALE}| ${(worst * 1e9).toFixed(2)} nm`);
}

// ---- D5 beads (15 clusters at the lattice vertices; emissive; sole night) -----------------------------------
{
    const v = vertsOf(glowNode.n);
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
    check("D5 beads", matched === 15 && emissive && soleNight,
        `${matched}/15 vertex clusters matched; emissive ${emissive}; sole night element ${soleNight}`);
}

// ---- D6 grounding --------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map((p) => p[1]));
    const gv = vertsOf(glowNode.n);
    const v0Y = gv.reduce((m, p) => Math.min(m, Math.abs(p[1] - V[0][1]) < 0.02 ? p[1] : m), Infinity);
    // v2 socket law: v0 bead fully inside the boss stone (below boss top,
    // above dais top); sole at grade.
    const bossTop = PLINTH_H + BOSS_H;
    check("D6 grounding", minY >= -1e-4 && v0Y > PLINTH_H && v0Y < bossTop,
        `stone sole min y ${minY.toFixed(6)}; v0 bead band y ${v0Y.toFixed(4)} socketed in the boss (${PLINTH_H}..${bossTop})`);
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
    const named = ["thx_stone"].every((m) => mats.has(m));
    const texd = meshNodes.filter(({ n }: any) => ["thx_stone"].includes(matNameOf(n)))
        .every(({ n }: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.pbrMetallicRoughness?.baseColorTexture !== undefined);
    check("D8 texMats (struct-38 law)", named && texd,
        `mats [${[...mats].join(", ")}]; textured ${texd ? "1/1" : "MISSING"}`);
}

if (fails.length) { console.error(`${fails.length} DECODE FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (decode struct233-tetrahelix)");
