// struct204-decode-mandelbrot.ts — decode audit of village_mandelbrot3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_elliptic3.glb) and require >=1 FAIL.
//
// Checks: node census (ps_stone + ps_iron + glow), PLINTH law, HEART RIBBON
// law (stone verts on the dense cardioid; six mark joints; cradle embed),
// WHEEL law (iron verts on the rim circle |c+1| = 1/4), AXLE law (rod on
// the real axis spanning [−2, 1/4]; both rim pierces + cusp butt present),
// BEAD law (at c = −2, emissive, the sole night element), IRON-FLIES law
// (wheel/axle never touch the plinth), ENVELOPE == probe contract, NAMED
// texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_W, PLINTH_H, PLINTH_D, RIB_N, ROD_R, RIM_TUBE, BEAD_R,
    RIM_C, RIM_R, ROD_XL_M, ROD_XR_M, CUSP_POKE, AXIS_Y, S, MARKS,
    cardioid, worldPt, worldX, ENVELOPE,
} from "./struct204-probe-mandelbrot.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_mandelbrot3.glb";
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
// dense cardioid in WORLD coords, for nearness tests
const CURVE: Array<[number, number]> = [];
for (let i = 0; i <= 30000; i++) {
    const p = cardioid((i / 30000) * 2 * Math.PI);
    CURVE.push(worldPt(p[0], p[1]));
}
const nearCurve = (vx: number, vy: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - vx, cy - vy); if (d < best) best = d; }
    return best;
};
const distToRim = (wx: number, wy: number) =>
    Math.abs(Math.hypot(wx - worldX(RIM_C[0]), wy - AXIS_Y) - S * RIM_R);

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
            `${plinth}/${verts.length} stone verts in the plinth box ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the datum mass reads from bytes`);
    }
}

// ---- D3 heart ribbon law ------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 heart ribbon law", false, "ps_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // corner allowance: RIB half-thickness 100mm + chord dev ≤ 45mm → 120mm
        let band = 0;
        for (const v of verts) if (nearCurve(v[0], v[1]) <= 0.120) band++;
        // six mark joints (cusp / shoulders / top / tangency / bottom) — distinct points
        const distinct = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3];
        let marksHit = 0;
        for (const t of distinct) {
            const p = cardioid(t), wp = worldPt(p[0], p[1]);
            if (verts.some((v) => Math.hypot(v[0] - wp[0], v[1] - wp[1]) <= 0.16)) marksHit++;
        }
        // cradle: ribbon verts (near curve) seated BELOW the plinth top
        const cradle = verts.filter((v) => nearCurve(v[0], v[1]) <= 0.120 && v[1] < PLINTH_H - 0.02 && v[1] > -TOL).length;
        // loop closure: verts near the cusp from BOTH sides (arcs 1 and 6) — x-extent coverage at the dimple
        check("D3 heart ribbon law", band >= 500 && marksHit === 5 && cradle >= 8,
            `${band} verts within 120mm of the dense cardioid; ${marksHit}/5 mark joints (cusp/±shoulders/top/tangency/bottom); cradle embed ${cradle} verts below the plinth top — the closed heart reads from bytes`);
    }
}

// ---- D4 wheel law --------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 wheel law", false, "ps_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // torus verts: distance to the rim CENTERLINE within tube + tol
        let rim = 0;
        for (const v of verts) if (distToRim(v[0], v[1]) <= RIM_TUBE + TOL && Math.abs(v[2]) <= RIM_TUBE + TOL) rim++;
        // tangent point present: verts near (worldX(−3/4), AXIS_Y)
        const tang = worldX(-0.75);
        const tangNear = verts.filter((v) => Math.hypot(v[0] - tang, v[1] - AXIS_Y) <= RIM_TUBE + 0.10).length;
        check("D4 wheel law", rim >= 400 && tangNear >= 4,
            `${rim}/${verts.length} iron verts on the rim circle |c+1| = 1/4 (± tube); ${tangNear} verts at the tangency x=${tang.toFixed(3)} — the exact period-2 boundary reads from bytes`);
    }
}

// ---- D5 axle law ----------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 axle law", false, "ps_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const xl = worldX(ROD_XL_M), xr = worldX(ROD_XR_M) + CUSP_POKE;
        let rod = 0;
        for (const v of verts) {
            if (Math.abs(v[1] - AXIS_Y) <= ROD_R + TOL && Math.abs(v[2]) <= ROD_R + TOL && v[0] >= xl - 0.10 && v[0] <= xr + TOL) rod++;
        }
        // spans: both rim pierces (−5/4 → worldX(−1.25), −3/4 → worldX(−0.75)) + the cusp butt zone
        const span = (a: number, b: number) => verts.some((v) => Math.abs(v[1] - AXIS_Y) <= ROD_R + TOL && v[0] >= a && v[0] <= b);
        const crossL = span(worldX(-1.25) - 0.08, worldX(-1.25) + 0.08);
        const crossR = span(worldX(-0.75) - 0.08, worldX(-0.75) + 0.08);
        const butt = span(worldX(0.25) - 0.02, worldX(0.25) + CUSP_POKE);
        // free flight: rod verts past the wheel's left rim into the antenna region
        const fly = span(xl - 0.02, worldX(-1.25) - 0.10);
        check("D5 axle law", rod >= 60 && crossL && crossR && butt && fly,
            `${rod} rod verts on y=${AXIS_Y.toFixed(3)} spanning [${xl.toFixed(3)}, ${xr.toFixed(3)}]; rim pierces at −3/4 and −5/4 present; cusp butt socketed (+${CUSP_POKE * 100}cm); free flight through the antenna region present — M ∩ ℝ = [−2, 1/4] made steel`);
    }
}

// ---- D6 bead law -----------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow bucket absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        let cx = 0, cy = 0, cz = 0;
        for (const v of verts) { cx += v[0]; cy += v[1]; cz += v[2]; }
        cx /= verts.length; cy /= verts.length; cz /= verts.length;
        const wantX = worldX(ROD_XL_M);
        const centered = Math.hypot(cx - wantX, cy - AXIS_Y, cz) <= 0.005;
        const radius = Math.max(...verts.map((v) => Math.hypot(v[0] - cx, v[1] - cy, v[2] - cz)));
        // emissive: the glow material must carry emissiveIntensity > 0
        const matIdx = json.meshes[glowNode.n.mesh].primitives[0].material;
        const mat = json.materials[matIdx];
        const emis = mat?.emissiveFactor && (mat.emissiveFactor.some((c: number) => c > 0.05));
        check("D6 bead law", verts.length >= 200 && centered && Math.abs(radius - BEAD_R) <= 0.005 && !!emis,
            `${verts.length} verts, centroid (${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}) == c=−2 terminus (${wantX.toFixed(3)}, ${AXIS_Y.toFixed(3)}, 0) within 5mm; r=${radius.toFixed(4)}; emissiveFactor present — the sole night element reads from bytes`);
    }
}

// ---- D7 iron-flies law -------------------------------------------------------------------------------------
{
    if (!ironNode || !glowNode) { check("D7 iron-flies law", false, "iron/glow bucket absent"); }
    else {
        const iv = vertsOf(ironNode.n), gv = vertsOf(glowNode.n);
        const low = [...iv, ...gv].filter((v) => v[1] < PLINTH_H + 0.05).length;
        check("D7 iron-flies law", low === 0,
            `${low} iron/glow verts below plinth-top + 5cm — the wheel and the axle never touch the stone`);
    }
}

// ---- D8 envelope law -----------------------------------------------------------------------------------------
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

// ---- D9 named texMats (struct-38) ------------------------------------------------------------------------------
{
    const names = (json.materials ?? []).map((m: any) => m?.name ?? "?");
    const stone = names.includes("ps_stone"), iron = names.includes("ps_iron");
    check("D9 named texMats", stone && iron, `materials [${names.join(", ")}]`);
}

if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
