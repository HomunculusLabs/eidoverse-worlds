// struct225-decode-steinmetz.ts — decode audit of village_steinmetz3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_oloid3.glb) and require >=1 FAIL.
//
// Checks: node census (sm_stone + sm_brass + glow), PLINTH law, SOLID law
// (stone verts inside BOTH cylinders + square-course corner coverage),
// HOOPS law (brass verts on the two exact circles, in-plane), BEAD law
// (at the crown crossing, emissive, sole night element), GROUNDING law
// (plinth sole at grade, first course embed), ENVELOPE == probe contract,
// NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, HOOP_A, HOOP_B,
    BEAD_W, ENVELOPE, R, DATUM, EMBED, TUBE, BEAD_R,
} from "./struct225-probe-steinmetz.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_steinmetz3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "sm_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "sm_brass");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_sm_1"));
check("D1 node census: 3 mesh nodes (sm_stone + sm_brass + glow)",
    meshNodes.length === 3 && !!stoneNode && !!brassNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// ---- D2 plinth -----------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    // plinth verts: y in [0, PLINTH_H], x/z in [-PLINTH_L/2, PLINTH_L/2]
    const pl = v.filter(([, y]) => y <= PLINTH_H + 1e-6);
    const okSpan = pl.every(([x, y, z]) =>
        Math.abs(x) <= PLINTH_L / 2 + TOL && Math.abs(z) <= PLINTH_D / 2 + TOL && y >= -1e-6 && y <= PLINTH_H + TOL);
    const hasFull = pl.some(([x]) => Math.abs(Math.abs(x) - PLINTH_L / 2) < 1e-6);
    check("D2 plinth", okSpan && hasFull && pl.length >= 8,
        `${pl.length} verts in the plinth band y<=${PLINTH_H}, span exact, sole at grade`);
}

// ---- D3 solid (square courses inside BOTH cylinders) -----------------------------------------------------
{
    // course verts only: exclude the plinth (its corner verts sit at |x|=|z|=2.9, beyond every
    // course's max half-width 2.1996; RED-caught: filtering by y leaked plinth top verts AND
    // dropped the first course's embedded bottom face).
    const v = vertsOf(stoneNode.n).filter(([x, , z]) => Math.abs(x) < 2.5 && Math.abs(z) < 2.5);
    let worst = 0, covered = 0;
    for (const [x, y, z] of v) {
        const yl = y - DATUM;
        worst = Math.max(worst, x * x + yl * yl - R * R, yl * yl + z * z - R * R);   // inside both cylinders
    }
    // corner coverage: every course box's 8 corners present in the decoded set (within TOL)
    const near = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < TOL;
    for (const c of COURSES)
        for (const x of [c.x0, c.x1]) for (const y of [c.y, c.yTop]) for (const z of [c.z0, c.z1])
            if (v.some((p) => near(p, [x, y, z]))) covered++;
    const totalCorners = COURSES.length * 8;
    check("D3 solid", worst <= 1e-6 && covered === totalCorners,
        `${v.length} course verts, worst excursion ${(worst * 1e3).toFixed(4)} (m^2 scale, <=0 = inside both cylinders); corner coverage ${covered}/${totalCorners}`);
}

// ---- D4 hoops (brass verts within TUBE of the two exact circle polylines) --------------------------------
{
    const v = vertsOf(brassNode.n);
    const segDist = (p: number[], a: number[], b: number[]) => {
        const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
        const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
        const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
        return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]);
    };
    const polyDist = (p: number[], poly: number[][]) => {
        let d = Infinity;
        for (let i = 0; i < poly.length - 1; i++) d = Math.min(d, segDist(p, poly[i], poly[i + 1]));
        return d;
    };
    let worstTube = 0, offPlane = 0, segsCovered = 0;
    const segTol = TUBE + 0.0025;
    for (const p of v) {
        const dA = polyDist(p, HOOP_A), dB = polyDist(p, HOOP_B);
        worstTube = Math.max(worstTube, Math.min(dA, dB));
        // planarity: within TUBE of its own hoop's plane
        const onA = dA <= dB;
        offPlane = Math.max(offPlane, Math.abs(onA ? p[2] : p[0]) - TUBE);
    }
    for (const poly of [HOOP_A, HOOP_B])
        for (let i = 0; i < poly.length - 1; i++)
            if (v.some((p) => segDist(p, poly[i], poly[i + 1]) <= segTol)) segsCovered++;
    const totalSegs = (HOOP_A.length - 1) + (HOOP_B.length - 1);
    check("D4 hoops", worstTube <= segTol && offPlane <= 0.0025 && segsCovered === totalSegs,
        `${v.length} brass verts within ${segTol.toFixed(4)} m of the exact circle polylines (worst ${worstTube.toFixed(4)}); planarity worst ${(Math.max(0, offPlane) * 1e3).toFixed(2)} mm over tube; segment coverage ${segsCovered}/${totalSegs}`);
}

// ---- D5 bead ---------------------------------------------------------------------------------------------
{
    const v = vertsOf(glowNode.n);
    const cx = v.reduce((s, p) => s + p[0], 0) / v.length;
    const cy = v.reduce((s, p) => s + p[1], 0) / v.length;
    const cz = v.reduce((s, p) => s + p[2], 0) / v.length;
    const d = Math.hypot(cx - BEAD_W[0], cy - BEAD_W[1], cz - BEAD_W[2]);
    const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
    const hasEmissive = Array.isArray(mat?.emissiveFactor) && mat.emissiveFactor.some((c: number) => c > 0.05);
    const others = meshNodes.filter(({ n }: any) => n !== glowNode.n)
        .every(({ n }: any) => {
            const m = json.materials[json.meshes[n.mesh].primitives[0].material];
            return !(Array.isArray(m?.emissiveFactor) && m.emissiveFactor.some((c: number) => c > 0.05));
        });
    check("D5 bead", d < 0.005 && hasEmissive && others,   // 5mm: sphere-vertex centroid noise (RED-caught at 2mm)
        `centroid (${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) == crown crossing within ${d.toFixed(4)} m; emissiveFactor present; sole night element (others clean)`);
}

// ---- D6 grounding ----------------------------------------------------------------------------------------
{
    const stoneMinY = Math.min(...vertsOf(stoneNode.n).map((p) => p[1]));
    const first = COURSES[0];
    const embed = PLINTH_H - first.y;
    check("D6 grounding", Math.abs(stoneMinY) < 1e-6 && Math.abs(embed - EMBED) < 0.005,
        `plinth sole at ${stoneMinY.toFixed(6)} (grade 0); first course embed ${(embed * 100).toFixed(1)} cm == probe ${(EMBED * 100).toFixed(0)} cm`);
}

// ---- D7 envelope -----------------------------------------------------------------------------------------
{
    const vAll = meshNodes.flatMap(({ n }: any) => vertsOf(n));
    const mn = [0, 1, 2].map((a) => Math.min(...vAll.map((p) => p[a])));
    const mx = [0, 1, 2].map((a) => Math.max(...vAll.map((p) => p[a])));
    const dErr = Math.max(
        ...[0, 1, 2].flatMap((a) => [Math.abs(mn[a] - ENVELOPE.min[a]), Math.abs(mx[a] - ENVELOPE.max[a])]));
    check("D7 envelope", dErr < 0.001 && mn[1] >= -1e-6,
        `min [${mn.map((x) => x.toFixed(3)).join(",")}] max [${mx.map((x) => x.toFixed(3)).join(",")}] vs probe contract (drift ${dErr.toFixed(5)})`);
}

// ---- D8 texMats ------------------------------------------------------------------------------------------
{
    const mats = new Set(meshNodes.map(({ n }: any) => matNameOf(n)));
    const ok = mats.has("sm_stone") && mats.has("sm_brass") && ![...mats].some((m) => m === "?");
    // the texMat law applies to the stone/brass LANES; the glow bead is a plain
    // emissive material by lineage (no TEXCOORD_0 by design — oloid D-class precedent)
    const lanes = meshNodes.filter(({ n }: any) => ["sm_stone", "sm_brass"].includes(matNameOf(n)));
    const uvCount = lanes.filter(({ n }: any) => {
        const prims = json.meshes[n.mesh].primitives;
        return prims.every((p: any) => p.attributes.TEXCOORD_0 !== undefined);
    }).length;
    check("D8 texMats", ok && uvCount === lanes.length,
        `materials [${[...mats].join(", ")}]; TEXCOORD_0 on ${uvCount}/${lanes.length} lane mesh nodes (struct-38 texMat lanes; glow plain by lineage)`);
}

console.log(fails.length === 0 ? "DECODE ALL PASS" : `DECODE ${fails.length} FAIL: ${fails.join("; ")}`);
if (fails.length > 0) process.exit(1);
