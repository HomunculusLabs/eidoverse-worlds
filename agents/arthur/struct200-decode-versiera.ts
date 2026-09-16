// struct200-decode-versiera.ts — decode audit of village_versiera3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_rhodonea3.glb) and require >=1 FAIL.
//
// Checks: node census (vs_stone + vs_iron + glow_vs_1), CURB law, CURVE
// RIBBON law (stone verts on the dense versiera), HOOP law (iron verts on
// the torus r=A about (0,Y_RING), in-plane, tangent to the datum), CROWN
// +BEAD law (bead at the vertex front-face half-proud, emissive), TIP law
// (arm terminations near (±TIP_X, tip_y) with air below — the asymptote
// never lands), ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    A, CURB_W, CURB_H, CURB_D, RIB_SEC_N, RIB_SEC_D,
    RING_T, Y_RING, VERTEX_Y, BEAD_R, BEAD_Z, TIP_X, T_END,
    worldPt, ENVELOPE,
} from "./struct200-probe-versiera.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_versiera3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_vs_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "vs_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "vs_iron");
check("D1 node census: 3 mesh nodes (vs_stone + vs_iron + glow_vs_1)",
    meshNodes.length === 3 && !!glowNode && !!stoneNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense versiera in WORLD coords over t ∈ [−T_END, T_END]
const CURVE: Array<[number, number]> = [];
{
    for (let i = 0; i <= 30000; i++) {
        CURVE.push(worldPt(-T_END + (i / 30000) * 2 * T_END));
    }
}
const nearCurve = (vx: number, vy: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - vx, cy - vy); if (d < best) best = d; }
    return best;
};

// ---- D2 curb law -----------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 curb law", false, "vs_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= CURB_W / 2 + TOL && v[1] >= -TOL && v[1] <= CURB_H + TOL && Math.abs(v[2]) <= CURB_D / 2 + TOL) curb++;
        }
        check("D2 curb law", curb >= 24,
            `${curb}/${verts.length} stone verts in the curb box ${CURB_W}x${CURB_H}x${CURB_D} — the asymptote-made-pavement reads from bytes`);
    }
}

// ---- D3 curve ribbon law ---------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 curve ribbon law", false, "vs_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0;
        for (const v of verts) {
            // corner allowance: RIB half-thickness 100mm (RIB_SEC_N 0.20,
            // crown-swallow law) + curvature bend ~2mm → 103mm
            if (nearCurve(v[0], v[1]) <= 0.103) band++;
        }
        // crown convergence: ribbon verts near the vertex (the osculation)
        const atCrown = verts.filter(v => Math.hypot(v[0], v[1] - VERTEX_Y) <= 0.30).length;
        check("D3 curve ribbon law", band >= 38 * 16 && atCrown >= 16,
            `${band} verts within 103mm of the dense versiera (both arms + crown), ${atCrown} near the vertex (0, ${VERTEX_Y}) — the bell reads from bytes`);
    }
}

// ---- D4 hoop law ----------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 hoop law", false, "vs_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // every iron vert on the torus: |dist(|P−center|, A)| <= tube + tol, |z| <= tube + tol
        let on = 0;
        for (const v of verts) {
            const radial = Math.hypot(v[0], v[1] - Y_RING);
            if (Math.abs(radial - A) <= RING_T + TOL && Math.abs(v[2]) <= RING_T + TOL) on++;
        }
        // angular coverage: 16 azimuth bins all populated (the circle is whole)
        const bins = new Set<number>();
        for (const v of verts) {
            const radial = Math.hypot(v[0], v[1] - Y_RING);
            if (Math.abs(radial - A) <= RING_T + TOL) {
                bins.add(Math.floor(((Math.atan2(v[1] - Y_RING, v[0]) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 8)));
            }
        }
        // tangency: the lowest iron vert sits at CURB_H − RING_T (tube seated in curb top)
        let minY = Infinity;
        for (const v of verts) minY = Math.min(minY, v[1]);
        const tangency = Math.abs(minY - (CURB_H - RING_T)) <= TOL;
        check("D4 hoop law", on >= 24 && bins.size >= 16 && tangency,
            `${on}/${verts.length} iron verts on the circle r=${A} about (0, ${Y_RING}), in-plane; ${bins.size}/16 azimuth bins; lowest vert ${minY.toFixed(3)} == curb top − tube (tangent construction)`);
    }
}

// ---- D5 crown + bead law --------------------------------------------------------------------------------
{
    if (!glowNode) { check("D5 crown+bead law", false, "glow_vs_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D5 crown+bead law",
            Math.hypot(ctr[0] - 0, ctr[1] - VERTEX_Y, ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == vertex (0, ${VERTEX_Y}, ${BEAD_Z}) half-proud front face, r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D6 tip law (the asymptote never lands) ------------------------------------------------------------------
{
    if (!stoneNode) { check("D6 tip law", false, "vs_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // expected tip points
        const tips = [worldPt(-T_END), worldPt(T_END)];
        let found = 0;
        const gaps: number[] = [];
        for (const tp of tips) {
            let best = Infinity;
            for (const v of verts) {
                if (Math.abs(v[2]) > RIB_SEC_D) continue;
                const d = Math.hypot(v[0] - tp[0], v[1] - tp[1]);
                if (d < best) best = d;
            }
            gaps.push(best);
            if (best <= 0.118) found++;   // corner allowance: RIB half 100 + bend ≈ 118mm
        }
        // AIR LAW: every stone vert beyond the equators (|x| > 2.4) must sit
        // above CURB_H + 0.04 — no arm material ever lands on the asymptote.
        let grounded = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) > 2.4 && v[1] < CURB_H + 0.04 && Math.abs(v[2]) <= RIB_SEC_D) grounded++;
        }
        check("D6 tip law", found === 2 && grounded === 0,
            `both tips carry ribbon verts (gaps ${gaps.map(g => (g * 1000).toFixed(0)).join("/")}mm ≤ 118mm); ${grounded} stone verts below curb-top+0.04 beyond |x|=2.4 — the arms die in the air, the asymptote never lands`);
    }
}

// ---- D7 envelope == probe contract -----------------------------------------------------------------------------
{
    if (!stoneNode || !ironNode || !glowNode) { check("D7 envelope", false, "bucket absent"); }
    else {
        const all = [...vertsOf(stoneNode.n), ...vertsOf(ironNode.n), ...vertsOf(glowNode.n)];
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        let dErr = 0;
        for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
        const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
        check("D7 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
            `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
    }
}

// ---- D8 named texMats (struct-38 law) ----------------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D8 named texMats", mats.includes("vs_stone") && mats.includes("vs_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
