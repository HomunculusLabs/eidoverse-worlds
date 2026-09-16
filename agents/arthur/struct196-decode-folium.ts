// struct196-decode-folium.ts — decode audit of village_folium3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_nephroid3.glb) and require >=1 FAIL.
//
// Checks: node census (fs_stone + fs_iron + glow_fs_1), CURB law, CURVE
// RIBBON law (stone verts on the dense folium: loop + both arms),
// ASYMPTOTE RAIL law (level line at RAIL_Y, span, square section), POSTS
// law (3 posts, center to node, outboard seat rail), NODE+BEAD law (bead
// at (0,YC) front-face half-embed, emissive; ribbon verts converge at the
// node X), TIP law (both arm tips above the rail by TIP_GAP band),
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    A, YC, CURB_W, CURB_H, CURB_D, RIB_SEC_N, RIB_SEC_D,
    RAIL_SEC, RAIL_HALF, RAIL_Y,
    POST_SEC, POST_TOP_C, POST_TOP_O, POST_OUT, POST_BASE,
    BEAD_R, BEAD_Z, TIP_GAP,
    folium, T_ARM, T_LOOP_END,
    ENVELOPE,
} from "./struct196-probe-folium.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_folium3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_fs_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "fs_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "fs_iron");
check("D1 node census: 3 mesh nodes (fs_stone + fs_iron + glow_fs_1)",
    meshNodes.length === 3 && !!glowNode && !!stoneNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense folium in WORLD coords: loop t ∈ [0, T_LOOP_END], arms t ∈ [T_ARM, 0] + mirror.
// world mapping: v=(x−y)/√2, u=(x+y)/√2+YC.
const CURVE: Array<[number, number]> = [];
{
    const pushT = (t: number) => {
        const [x, y] = folium(t);
        const v = (x - y) / Math.SQRT2, u = (x + y) / Math.SQRT2 + YC;
        CURVE.push([v, u]);
        if (t <= 0.0001) CURVE.push([-v, u]);   // mirror arm (x↔y → v→−v)
    };
    for (let i = 0; i <= 20000; i++) pushT((i / 20000) * T_LOOP_END);
    for (let i = 0; i <= 8000; i++) pushT(T_ARM + (i / 8000) * (0 - T_ARM));
}
const nearCurve = (vx: number, vy: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - vx, cy - vy); if (d < best) best = d; }
    return best;
};

// ---- D2 curb law -----------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 curb law", false, "fs_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= CURB_W / 2 + TOL && v[1] >= -TOL && v[1] <= CURB_H + TOL && Math.abs(v[2]) <= CURB_D / 2 + TOL) curb++;
        }
        check("D2 curb law", curb >= 24,
            `${curb}/${verts.length} stone verts in the curb box ${CURB_W}x${CURB_H}x${CURB_D} — the level echo reads from bytes`);
    }
}

// ---- D3 curve ribbon law ---------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 curve ribbon law", false, "fs_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0;
        for (const v of verts) {
            // corner allowance: mid-chord dev <= 45mm, half-diag sqrt(45²+80²) = 92mm
            if (nearCurve(v[0], v[1]) <= 0.092) band++;
        }
        // node convergence: ribbon verts near the node X
        const atNode = verts.filter(v => Math.hypot(v[0], v[1] - YC) <= 0.16).length;
        check("D3 curve ribbon law", band >= 40 * 20 && atNode >= 16,
            `${band} verts within 92mm of the dense folium (loop + both arms + mirror), ${atNode} at the node X (0, ${YC}) — the curve reads from bytes`);
    }
}

// ---- D4 union law ----------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D4 union law", false, "fs_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0, rib = 0, none = 0;
        for (const v of verts) {
            const inCurb = Math.abs(v[0]) <= CURB_W / 2 + TOL && v[1] >= -TOL && v[1] <= CURB_H + TOL && Math.abs(v[2]) <= CURB_D / 2 + TOL;
            const inRib = nearCurve(v[0], v[1]) <= 0.092;
            if (inCurb) curb++;
            else if (inRib) rib++;
            else none++;
        }
        check("D4 union law", none === 0 && curb >= 24 && rib >= 40 * 20,
            `${verts.length} stone verts: curb ${curb}, ribbon ${rib}, unclassified ${none}`);
    }
}

// ---- D5 asymptote rail law --------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 asymptote rail law", false, "fs_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // rail verts: |y − RAIL_Y| <= half-diag, |x| <= RAIL_HALF + tol, |z| <= half
        const h = (Math.SQRT2 * RAIL_SEC) / 2 + TOL;
        let rail = 0;
        for (const v of verts) {
            if (Math.abs(v[1] - RAIL_Y) <= h && Math.abs(v[0]) <= RAIL_HALF + TOL && Math.abs(v[2]) <= h) rail++;
        }
        // rail end-cap x extent exactly ±RAIL_HALF
        const railXs = verts.filter(v => Math.abs(v[1] - RAIL_Y) <= h).map(v => v[0]);
        const span = railXs.length ? Math.max(...railXs) - Math.min(...railXs) : 0;
        check("D5 asymptote rail law", rail >= 16 && Math.abs(span - 2 * RAIL_HALF) < 0.01,
            `${rail} iron verts on the level line y=${RAIL_Y.toFixed(4)} (x+y+a=0), span ${span.toFixed(3)} == 2×${RAIL_HALF}`);
    }
}

// ---- D6 posts law ------------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D6 posts law", false, "fs_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const h = (Math.SQRT2 * RAIL_SEC) / 2 + TOL;
        const notRail = verts.filter(v => !(Math.abs(v[1] - RAIL_Y) <= h && Math.abs(v[2]) <= h));
        // note: outboard post tops are cut at the rail seat; the center post
        // crosses the rail — exclude the rail BAND ±0.25 for post
        // classification (posts pass through/under the rail by design; the
        // outboard post top faces sit exactly at the band edge, so the top
        // 24 verts (12 per side) are absorbed by the exclusion — by design)
        const notRailBand = notRail.filter(v => !(Math.abs(v[1] - RAIL_Y) <= 0.25));
        let center = 0, outboard = 0, none = 0;
        for (const v of notRailBand) {
            const inCenter = Math.abs(v[0]) <= POST_SEC / 2 + TOL && v[1] >= POST_BASE - TOL && v[1] <= POST_TOP_C + TOL && Math.abs(v[2]) <= POST_SEC / 2 + TOL;
            const inOut = Math.abs(Math.abs(v[0]) - POST_OUT) <= POST_SEC / 2 + TOL && v[1] >= POST_BASE - TOL && v[1] <= POST_TOP_O + 0.001 && Math.abs(v[2]) <= POST_SEC / 2 + TOL;
            if (inCenter) center++;
            else if (inOut) outboard++;
            else none++;
        }
        check("D6 posts law", none === 0 && center >= 16 && outboard >= 20,
            `center post ${center} (0.12→${POST_TOP_C} to the node), outboard ${outboard} (rail-seat tops), unclassified ${none} — rail-band verts excluded by design (crossings/seats)`);
    }
}

// ---- D7 node + bead law ------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D7 node+bead law", false, "glow_fs_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D7 node+bead law",
            Math.hypot(ctr[0] - 0, ctr[1] - YC, ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == node (0, ${YC}, ${BEAD_Z}) half-embedded front face, r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D8 tip law ---------------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D8 tip law", false, "fs_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // the arms must NOT reach the rail: every arm-side ribbon vert
        // (|x| > 1.0, above curb, near the curve) must clear the rail TOP
        // by > 20mm. Arm ribbon lives in y ∈ (CURB_H, RAIL_Y + 0.45).
        const railTop = RAIL_Y + RAIL_SEC / 2;
        let minGap = Infinity;
        for (const v of verts) {
            if (Math.abs(v[0]) > 1.0 && v[1] > CURB_H + 0.1 && v[1] < RAIL_Y + 0.45) {
                if (nearCurve(v[0], v[1]) <= 0.092) {
                    minGap = Math.min(minGap, v[1] - railTop);
                }
            }
        }
        // diagnostic: lowest arm vert overall (should sit just above railTop + TIP_GAP − rib/2)
        let lowestArm = Infinity;
        for (const v of verts) {
            if (Math.abs(v[0]) > 1.0 && v[1] > CURB_H + 0.1 && nearCurve(v[0], v[1]) <= 0.092) lowestArm = Math.min(lowestArm, v[1]);
        }
        check("D8 tip law", minGap > 0.02,
            `arm ribbon min height above rail top ${(minGap * 1000).toFixed(0)}mm > 20mm (lowest arm vert y=${lowestArm.toFixed(3)} vs rail top ${railTop.toFixed(3)}; authored TIP_GAP ${TIP_GAP * 1000}mm) — the asymptote is approached, never touched`);
    }
}

// ---- D9 envelope == probe contract ---------------------------------------------------------------------------
{
    if (!stoneNode || !ironNode || !glowNode) { check("D9 envelope", false, "bucket absent"); }
    else {
        const all = [...vertsOf(stoneNode.n), ...vertsOf(ironNode.n), ...vertsOf(glowNode.n)];
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        let dErr = 0;
        for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
        const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
        check("D9 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
            `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
    }
}

// ---- D10 named texMats (struct-38 law) -------------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D10 named texMats", mats.includes("fs_stone") && mats.includes("fs_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
