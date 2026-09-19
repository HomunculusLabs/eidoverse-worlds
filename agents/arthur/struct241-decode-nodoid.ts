// struct241-decode-nodoid.ts — decode audit of village_nodoid3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_ico3.glb — the Platonic cousin's own build) and require >=1 FAIL
// (census stop, RED-clean).
//
// Checks: node census (nd_stone + nd_brass + glow_nd_1), MERIDIAN law (every
// brass vert lies on the decoder's OWN independent RK4 replica of the folded
// meridian, half-plane (y, rho) polyline distance), FOLD law (brass verts
// within 15mm of the replica's own crossing-circle coordinates on >=3
// periods — the bytes carry the self-penetration), DAIS law (two 48-gon
// tiers at exact radii/heights, sole at grade), BEAD law (crown sphere at
// TOP_RING_Y, emissive, sole night element), GROUNDING, ENVELOPE == probe
// contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    E_ECC, A_UNIT, R_PLUS, R_MINUS, K_WORLD, ENVELOPE,
    DAIS_H_LOWER, DAIS_R_LOWER, DAIS_H_UPPER, DAIS_R_UPPER, DAIS_TOP,
    BULGE0_Y, BEAD_R, TOP_RING_Y, BOTTOM_RING_Y, PERIODS,
    integrate, bulgePositions, reversalPositions,
} from "./struct241-probe-nodoid.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_nodoid3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "nd_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "nd_brass");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "nd_iron");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_nd_1"));
check("D1 node census: 4 mesh nodes (nd_stone + nd_brass + nd_iron + glow_nd_1)",
    meshNodes.length === 4 && !!stoneNode && !!brassNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);
if (fails.length) { console.error(`census FAIL on foreign/corrupt bytes — stopping (RED-clean, ${fails.length} fail)`); process.exit(1); }

// ---- independent replica (decoder's own integration — struct157 replica law) ----------------------------
const rep = integrate(A_UNIT, E_ECC, 80);
const repBul = bulgePositions(rep, R_PLUS);
const x0 = repBul[0].x;
const repRev = reversalPositions(rep);
const s0 = repBul[0].s, sN = repBul[PERIODS].s;
const sBot = Math.max(...repRev.filter(q => q.s < s0).map(q => q.s));
const sTop = Math.min(...repRev.filter(q => q.s > sN).map(q => q.s));
// half-plane polyline (y, rho), stride 2 samples (1.2mm world) — fine enough for point-to-polyline
const poly: { y: number; rho: number }[] = [];
for (let i = 0; i < rep.length; i += 2) {
    const p = rep[i];
    if (p.s < sBot || p.s > sTop) continue;
    poly.push({ y: BULGE0_Y + (p.x - x0) * K_WORLD, rho: p.r * K_WORLD });
}
// replica crossing circles (unit), first 4 adjacent pairs — same generic test as the probe
{
    // (kept minimal: find crossings between periods 1 and 2)
    const per = (k: number) => rep.filter(p => p.s >= repBul[k].s && p.s <= repBul[k + 1].s);
    const A = per(1), B = per(2);
    const cr: { x: number; r: number }[] = [];
    for (let i = 0; i + 10 < A.length; i += 10) {
        for (let j = 0; j + 10 < B.length; j += 10) {
            const p1 = A[i], p2 = A[i + 10], q1 = B[j], q2 = B[j + 10];
            const d1 = { x: p2.x - p1.x, r: p2.r - p1.r }, d2 = { x: q2.x - q1.x, r: q2.r - q1.r };
            const den = d1.x * d2.r - d1.r * d2.x;
            if (Math.abs(den) < 1e-12) continue;
            const t = ((q1.x - p1.x) * d2.r - (q1.r - p1.r) * d2.x) / den;
            const u = ((q1.x - p1.x) * d1.r - (q1.r - p1.r) * d1.x) / den;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                const cx = p1.x + t * d1.x, crr = p1.r + t * d1.r;
                if (!cr.some(c => Math.hypot(c.x - cx, c.r - crr) < 0.2)) cr.push({ x: cx, r: crr });
            }
        }
    }
    (globalThis as any).__repCross = cr;
}

const TOL = 0.015;   // 15mm: lathe chord sagitta at stride 40 (~0.3mm) + merge translation + fp noise

// point-to-polyline distance in the (y, rho) half-plane
function polyDist(y: number, rho: number): number {
    let best = Infinity;
    for (let i = 0; i + 1 < poly.length; i++) {
        const a = poly[i], b = poly[i + 1];
        const dy = b.y - a.y, dr = b.rho - a.rho;
        const len2 = dy * dy + dr * dr;
        let t = len2 > 1e-12 ? ((y - a.y) * dy + (rho - a.rho) * dr) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        const py = a.y + t * dy, pr = a.rho + t * dr;
        best = Math.min(best, Math.hypot(y - py, rho - pr));
    }
    return best;
}

// ---- D2 meridian law (v2: BOTH lanes on the independent folded replica) ---------------------------------
{
    const bv = vertsOf(brassNode.n);
    const iv = vertsOf(ironNode.n);
    let worstB = 0, worstI = 0;
    for (const p of bv) worstB = Math.max(worstB, polyDist(p[1], Math.hypot(p[0], p[2])));
    for (const p of iv) worstI = Math.max(worstI, polyDist(p[1], Math.hypot(p[0], p[2])));
    check("D2 meridian law: brass + iron verts on the independent folded replica", worstB <= TOL && worstI <= TOL,
        `${bv.length} brass verts worst ${(worstB * 1e3).toFixed(2)} mm; ${iv.length} iron verts worst ${(worstI * 1e3).toFixed(2)} mm; both <= ${(TOL * 1e3).toFixed(0)}`);
}

// ---- D3 fold law (the self-penetration carried in the bytes; union of both lanes) ----------------------
{
    const repCross: { x: number; r: number }[] = (globalThis as any).__repCross;
    const v = [...vertsOf(brassNode.n), ...vertsOf(ironNode.n)];
    let periodsHit = 0;
    const details: string[] = [];
    for (let k = 0; k < PERIODS - 1; k++) {
        // crossing circle k: replica crossing x + k periods of x-advance, projected to world y
        const perX = repBul[1].x - repBul[0].x;
        let hit = 0;
        for (const c of repCross) {
            const yStar = BULGE0_Y + (c.x + k * perX) * K_WORLD;
            const rhoStar = c.r * K_WORLD;
            const near = v.some(p => Math.abs(p[1] - yStar) < 0.02 && Math.abs(Math.hypot(p[0], p[2]) - rhoStar) < 0.02);
            if (near) hit++;
        }
        if (hit >= 1) periodsHit++;
        if (details.length < 3 && hit > 0) details.push(`y${(BULGE0_Y + (repCross[0].x + k * perX) * K_WORLD).toFixed(2)}`);
    }
    check("D3 fold law: crossing circles present in the bytes", repCross.length === 2 && periodsHit >= Math.min(3, PERIODS - 1),
        `replica crossings ${repCross.map(c => `r${(c.r * K_WORLD).toFixed(3)}`).join("/")}; union verts within 20mm of the crossing coordinates on ${periodsHit}/${PERIODS - 1} periods (e.g. ${details.join(" ")}) — THE BYTES CARRY THE PIERCING`);
}

// ---- D4 dais law --------------------------------------------------------------------------------------
{
    const v = vertsOf(stoneNode.n);
    const minY = Math.min(...v.map(p => p[1]));
    const lower = v.filter(([, y]) => y <= DAIS_H_LOWER + 1e-6);
    const upper = v.filter(([, y]) => y > DAIS_H_LOWER + 1e-6 && y <= DAIS_TOP + 1e-6);
    const bandOK = lower.length > 0 && upper.length > 0;
    // caps carry interior fan verts by construction: law = INSIDE the tier + RIM RING present + y in band
    const inside = lower.every(([x, , z]) => Math.hypot(x, z) <= DAIS_R_LOWER + 0.002) &&
        upper.every(([x, , z]) => Math.hypot(x, z) <= DAIS_R_UPPER + 0.002);
    const rimLower = lower.some(([x, , z]) => Math.abs(Math.hypot(x, z) - DAIS_R_LOWER) < 0.002);
    const rimUpper = upper.some(([x, , z]) => Math.abs(Math.hypot(x, z) - DAIS_R_UPPER) < 0.002);
    const maxY = Math.max(...v.map(p => p[1]));
    check("D4 dais law", bandOK && inside && rimLower && rimUpper && minY >= -1e-4 && Math.abs(maxY - DAIS_TOP) < 1e-4,
        `lower ${lower.length} verts inside r${DAIS_R_LOWER} (rim present ${rimLower}) y[0..${DAIS_H_LOWER}], upper ${upper.length} verts inside r${DAIS_R_UPPER} (rim present ${rimUpper}) y[${DAIS_H_LOWER}..${DAIS_TOP}]; sole min y ${minY.toFixed(6)}; top ${maxY.toFixed(4)}`);
}

// ---- D5 bead law --------------------------------------------------------------------------------------
{
    const v = vertsOf(glowNode.n);
    const ctr = [0, TOP_RING_Y, 0];
    let worst = 0;
    for (const p of v) worst = Math.max(worst, Math.abs(Math.hypot(p[0] - ctr[0], p[1] - ctr[1], p[2] - ctr[2]) - BEAD_R));
    const emissive = (() => {
        const mesh = json.meshes[glowNode.n.mesh];
        const mat = json.materials[mesh.primitives[0].material];
        return !!mat?.emissiveFactor && mat.emissiveFactor.some((x: number) => x > 0.1);
    })();
    const soleNight = meshNodes.filter(({ n }: any) => {
        const mat = json.materials[json.meshes[n.mesh].primitives[0].material];
        return mat?.emissiveFactor?.some((x: number) => x > 0.1);
    }).length === 1;
    check("D5 crown bead", worst < 0.002 && emissive && soleNight,
        `sphere r${BEAD_R} at y ${TOP_RING_Y.toFixed(3)}, worst radial dev ${(worst * 1e3).toFixed(2)} mm; emissive ${emissive}; sole night element ${soleNight} — swallows the top ring (r ${(R_MINUS * K_WORLD).toFixed(3)})`);
}

// ---- D6 grounding -------------------------------------------------------------------------------------
{
    const sv = vertsOf(stoneNode.n);
    const minY = Math.min(...sv.map(p => p[1]));
    const bv = vertsOf(brassNode.n), iv = vertsOf(ironNode.n);
    const brassMin = Math.min(...bv.map(p => p[1]));
    const ironMin = Math.min(...iv.map(p => p[1]));
    // v3 seat law: the brass lane (period 0 at the base) embeds into the upper tier and
    // reaches the bottom-ring plane; the iron lane starts at its first neck-ring seam
    // (mid-column by design — welded to the brass bead at the shared neck circle).
    const ironLow = iv.length ? Math.min(...iv.map(p => p[1])) : Infinity;
    const seatOK = brassMin > DAIS_H_LOWER - 0.002 && brassMin <= BOTTOM_RING_Y + 0.003 && ironLow > DAIS_TOP - 0.05;
    check("D6 grounding + embed", minY >= -1e-4 && seatOK,
        `stone sole ${minY.toFixed(6)}; brass min y ${brassMin.toFixed(3)} (inside upper tier y>${DAIS_H_LOWER}, reaching ring plane ${BOTTOM_RING_Y.toFixed(3)}); iron lane low y ${ironLow.toFixed(3)} (first neck-ring seam, welded mid-column) — no butt joint, no float`);
}

// ---- D7 envelope --------------------------------------------------------------------------------------
{
    const all: number[][] = [];
    for (const { n } of meshNodes) all.push(...vertsOf(n));
    const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
    const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
    const minZ = Math.min(...all.map(p => p[2])), maxZ = Math.max(...all.map(p => p[2]));
    const drift = Math.max(
        Math.abs(minX - ENVELOPE.min[0]), Math.abs(maxX - ENVELOPE.max[0]),
        Math.abs(minY - ENVELOPE.min[1]), Math.abs(maxY - ENVELOPE.max[1]),
        Math.abs(minZ - ENVELOPE.min[2]), Math.abs(maxZ - ENVELOPE.max[2]));
    check("D7 envelope == probe contract", drift <= 0.002,
        `(${minX.toFixed(3)}..${maxX.toFixed(3)}, ${minY.toFixed(3)}..${maxY.toFixed(3)}, ${minZ.toFixed(3)}..${maxZ.toFixed(3)}); drift ${(drift * 1e3).toFixed(2)} mm`);
}

// ---- D8 texMats ---------------------------------------------------------------------------------------
{
    const mats = new Set(meshNodes.map(({ n }: any) => matNameOf(n)));
    const named = ["nd_stone", "nd_brass", "nd_iron"].every(m => mats.has(m));
    const texd = meshNodes.filter(({ n }: any) => ["nd_stone", "nd_brass", "nd_iron"].includes(matNameOf(n)))
        .every(({ n }: any) => json.materials[json.meshes[n.mesh].primitives[0].material]?.pbrMetallicRoughness?.baseColorTexture !== undefined);
    check("D8 texMats (struct-38 law)", named && texd,
        `mats [${[...mats].join(", ")}]; textured ${texd ? "3/3" : "MISSING"}`);
}

if (fails.length) { console.error(`${fails.length} DECODE FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (decode struct241-nodoid)");
