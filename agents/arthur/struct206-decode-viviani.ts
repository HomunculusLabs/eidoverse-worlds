// struct206-decode-viviani.ts — decode audit of village_viviani3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_mandelbrot3.glb) and require >=1 FAIL.
//
// Checks: node census (ps_stone + ps_iron + glow), PLINTH law, STRAP law
// (iron verts on the dense Viviani curve AND on the sphere shell; poles +
// node crossings present), SQUARE law (four rod AABBs populated), BEAD law
// (at the node, emissive, sole night element), HOLLOW law (no verts deep
// inside the globe), ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_W, PLINTH_H, PLINTH_D, S, TUBE, ROD_T, BEAD_R, Y_C,
    curveWorld, NODE_W, NPOLE_W, SPOLE_W, RODS, ENVELOPE,
} from "./struct206-probe-viviani.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_viviani3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ps_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ps_iron");
const glowNode = meshNodes.find(({ n }: any) => n !== stoneNode?.n && n !== ironNode?.n);
check("D1 node census: 3 mesh nodes (ps_stone + ps_iron + glow)",
    meshNodes.length === 3 && !!stoneNode && !!ironNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense curve in WORLD coords for nearness tests
const CURVE: Array<[number, number, number]> = [];
for (let i = 0; i <= 4000; i++) CURVE.push(curveWorld(-2 * Math.PI + (4 * Math.PI * i) / 4000));
const nearCurve = (v: number[]) => {
    let best = Infinity;
    for (const c of CURVE) { const d = Math.hypot(c[0] - v[0], c[1] - v[1], c[2] - v[2]); if (d < best) best = d; }
    return best;
};

// ---- D2 plinth law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 plinth law", false, "ps_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let plinth = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= PLINTH_W / 2 + TOL && v[1] >= -TOL && v[1] <= PLINTH_H + TOL && Math.abs(v[2]) <= PLINTH_D / 2 + TOL) plinth++;
        }
        check("D2 plinth law", plinth >= 24,
            `${plinth}/${verts.length} stone verts in the plinth box ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the square seat reads from bytes`);
    }
}

// ---- D3 strap law -------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D3 strap law", false, "ps_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        let onCurve = 0, onShell = 0;
        for (const v of verts) {
            const dCurve = nearCurve(v);
            const r = Math.hypot(v[0], v[1] - Y_C, v[2]);
            if (dCurve <= TUBE + 0.010) onCurve++;
            if (Math.abs(r - S) <= TUBE + TOL) onShell++;
        }
        const nearPt = (p: [number, number, number]) =>
            verts.filter((v) => Math.hypot(v[0] - p[0], v[1] - p[1], v[2] - p[2]) <= TUBE + 0.10).length;
        const nPole = nearPt(NPOLE_W), sPole = nearPt(SPOLE_W), node = nearPt(NODE_W);
        // strap-only count: verts NOT inside any rod box
        const inRod = (v: number[]) => RODS.some((r) =>
            v[0] >= r.min[0] - TOL && v[0] <= r.max[0] + TOL &&
            v[1] >= r.min[1] - TOL && v[1] <= r.max[1] + TOL &&
            v[2] >= r.min[2] - TOL && v[2] <= r.max[2] + TOL);
        const strapVerts = verts.filter((v) => !inRod(v));
        const strapOn = strapVerts.filter((v) => nearCurve(v) <= TUBE + 0.010).length;
        check("D3 strap law", onCurve >= 3000 && onShell >= 3000 && nPole >= 4 && sPole >= 4 && node >= 4 && strapOn >= strapVerts.length * 0.95,
            `${onCurve}/${verts.length} iron verts within tube+10mm of the dense curve; ${onShell} on the sphere shell ± tube; N pole ${nPole} / S pole ${sPole} / node ${node} verts present; strap population ${strapOn}/${strapVerts.length} ≥95% on-curve — the figure-eight on the globe reads from bytes`);
    }
}

// ---- D4 square law ------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 square law", false, "ps_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const counts = RODS.map((r) => verts.filter((v) =>
            v[0] >= r.min[0] - TOL && v[0] <= r.max[0] + TOL &&
            v[1] >= r.min[1] - TOL && v[1] <= r.max[1] + TOL &&
            v[2] >= r.min[2] - TOL && v[2] <= r.max[2] + TOL).length);
        const spanX = Math.max(...verts.map((v) => v[0])) - Math.min(...verts.map((v) => v[0]));
        const spanY = Math.max(...verts.map((v) => v[1]));
        const okSpan = Math.abs(spanX - (2 * S + ROD_T)) <= 0.01 && Math.abs(spanY - (Y_C + S + ROD_T)) <= 0.01;
        check("D4 square law", counts.every((c) => c >= 20) && okSpan,
            `rod verts [${counts.join(",")}] (${RODS.map((r) => r.name).join("/")}); frame span ${spanX.toFixed(3)} m == 2R+rod ${2 * S + ROD_T}; top at ${spanY.toFixed(3)} == N-pole weld — the circumscribed square reads from bytes`);
    }
}

// ---- D5 bead law --------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D5 bead law", false, "glow bucket absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        let cx = 0, cy = 0, cz = 0;
        for (const v of verts) { cx += v[0]; cy += v[1]; cz += v[2]; }
        cx /= verts.length; cy /= verts.length; cz /= verts.length;
        const centered = Math.hypot(cx - NODE_W[0], cy - NODE_W[1], cz - NODE_W[2]) <= 0.005;
        const radius = Math.max(...verts.map((v) => Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz)));
        const matIdx = json.meshes[glowNode.n.mesh].primitives[0].material;
        const mat = json.materials[matIdx];
        const emis = mat?.emissiveFactor && (mat.emissiveFactor.some((c: number) => c > 0.05));
        check("D5 bead law", verts.length >= 200 && centered && Math.abs(radius - BEAD_R) <= 0.005 && !!emis,
            `${verts.length} verts, centroid (${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) == node (${NODE_W[0].toFixed(3)}, ${NODE_W[1].toFixed(3)}, ${NODE_W[2].toFixed(3)}) within 5mm; r=${radius.toFixed(4)}; emissiveFactor present — the sole night element reads from bytes`);
    }
}

// ---- D6 hollow law ------------------------------------------------------------------------------------
{
    let deep = 0, total = 0;
    for (const { n } of meshNodes) {
        if (glowNode && n === glowNode.n) continue;          // bead rides the node, ON the shell
        for (const v of vertsOf(n)) {
            total++;
            if (Math.hypot(v[0], v[1] - Y_C, v[2]) < S - TUBE - 0.03) deep++;
        }
    }
    check("D6 hollow law", deep === 0,
        `${deep}/${total} verts deeper than tube-inner − 3cm inside the globe — the sphere's interior is empty (the strap is the only thing on it)`);
}

// ---- D7 envelope law ----------------------------------------------------------------------------------
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
    check("D7 envelope law", dErr <= 0.002,
        `decoded envelope [${mnx.toFixed(3)},${mxx.toFixed(3)}]x[${mny.toFixed(3)},${mxy.toFixed(3)}]x[${mnz.toFixed(3)},${mxz.toFixed(3)}] vs probe drift ${(dErr * 1000).toFixed(2)}mm`);
}

// ---- D8 named texMats (struct-38) ----------------------------------------------------------------------
{
    const names = (json.materials ?? []).map((m: any) => m?.name ?? "?");
    const stone = names.includes("ps_stone"), iron = names.includes("ps_iron");
    check("D8 named texMats", stone && iron, `materials [${names.join(", ")}]`);
}

if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
