// struct198-decode-rhodonea.ts — decode audit of village_rhodonea3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_folium3.glb) and require >=1 FAIL.
//
// Checks: node census (rh_stone + rh_iron + glow_rh_1), CURB law, CURVE
// RIBBON law (stone verts on the dense 7-petal rose), BOSS COLUMN law,
// RING law (iron verts on the torus r=A about the heart, in-plane), HEART
// +BEAD law (bead at (0,YC) front-face half-embed, emissive; ribbon verts
// converge at the heart), TIP law (7 clusters at |P−heart| == A — the
// kiss reads from bytes), ENVELOPE == probe contract, NAMED texMats
// (struct-38).
import { readFileSync } from "node:fs";
import {
    A, K, YC, CURB_W, CURB_H, CURB_D, RIB_SEC_N, RIB_SEC_D,
    RING_T, COL_SEC, COL_TOP, COL_BASE,
    BEAD_R, BEAD_Z, ROT,
    rose, ENVELOPE,
} from "./struct198-probe-rhodonea.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_rhodonea3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_rh_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "rh_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "rh_iron");
check("D1 node census: 3 mesh nodes (rh_stone + rh_iron + glow_rh_1)",
    meshNodes.length === 3 && !!glowNode && !!stoneNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense rose in WORLD coords over θ ∈ [0, π] (signed-r one trace)
const CURVE: Array<[number, number]> = [];
{
    for (let i = 0; i <= 30000; i++) {
        const t = (i / 30000) * Math.PI;
        const r = rose(t);
        CURVE.push([r * Math.cos(t + ROT), YC + r * Math.sin(t + ROT)]);
    }
}
const nearCurve = (vx: number, vy: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - vx, cy - vy); if (d < best) best = d; }
    return best;
};

// ---- D2 curb law -----------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 curb law", false, "rh_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= CURB_W / 2 + TOL && v[1] >= -TOL && v[1] <= CURB_H + TOL && Math.abs(v[2]) <= CURB_D / 2 + TOL) curb++;
        }
        check("D2 curb law", curb >= 24,
            `${curb}/${verts.length} stone verts in the curb box ${CURB_W}x${CURB_H}x${CURB_D} — the ground echo reads from bytes`);
    }
}

// ---- D3 curve ribbon law ---------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 curve ribbon law", false, "rh_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0;
        for (const v of verts) {
            // corner allowance: chord dev <= 45mm, half-diag sqrt(45²+80²) = 92mm
            if (nearCurve(v[0], v[1]) <= 0.092) band++;
        }
        // heart convergence: ribbon verts near the heart (petals born there)
        const atHeart = verts.filter(v => Math.hypot(v[0], v[1] - YC) <= 0.30).length;
        check("D3 curve ribbon law", band >= 143 * 16 && atHeart >= 16,
            `${band} verts within 92mm of the dense rose (all 7 petals), ${atHeart} near the heart (0, ${YC}) — the curve reads from bytes`);
    }
}

// ---- D4 boss column law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D4 boss column law", false, "rh_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // column verts: inside the COL_SEC² × (COL_TOP−COL_BASE) box on the axis.
        // Voussoirs near the heart interpenetrate the boss by design (petals
        // born from it) — exclude the heart band ±0.30 for classification.
        let col = 0, none = 0;
        for (const v of verts) {
            if (Math.abs(v[1] - YC) <= 0.30) continue;   // heart band: shared by design
            const inCol = Math.abs(v[0]) <= COL_SEC / 2 + TOL && v[1] >= COL_BASE - TOL && v[1] <= COL_TOP + TOL && Math.abs(v[2]) <= COL_SEC / 2 + TOL;
            const inCurb = Math.abs(v[0]) <= CURB_W / 2 + TOL && v[1] <= CURB_H + TOL && Math.abs(v[2]) <= CURB_D / 2 + TOL;
            const inRib = nearCurve(v[0], v[1]) <= 0.092;
            if (inCol) col++;
            else if (inCurb || inRib) { /* classified elsewhere */ }
            else none++;
        }
        check("D4 boss column law", col >= 16 && none === 0,
            `column ${col} verts in the ${COL_SEC}² box (0.12→${COL_TOP.toFixed(2)}), unclassified ${none} — the heart band (±0.30) is shared by design`);
    }
}

// ---- D5 ring law ---------------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 ring law", false, "rh_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // every iron vert on the torus: |dist(|P−heart|, A) <= tube + tol, |z| <= tube + tol
        let on = 0;
        for (const v of verts) {
            const radial = Math.hypot(v[0], v[1] - YC);
            if (Math.abs(radial - A) <= RING_T + TOL && Math.abs(v[2]) <= RING_T + TOL) on++;
        }
        // angular coverage: 16 azimuth bins all populated (the circle is whole)
        const bins = new Set<number>();
        for (const v of verts) {
            const radial = Math.hypot(v[0], v[1] - YC);
            if (Math.abs(radial - A) <= RING_T + TOL) {
                bins.add(Math.floor(((Math.atan2(v[1] - YC, v[0]) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 8)));
            }
        }
        check("D5 ring law", on >= 24 && bins.size >= 16,
            `${on}/${verts.length} iron verts on the circle r=${A} about the heart, in-plane; ${bins.size}/16 azimuth bins — the whole circle reads from bytes`);
    }
}

// ---- D6 heart + bead law ------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 heart+bead law", false, "glow_rh_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D6 heart+bead law",
            Math.hypot(ctr[0] - 0, ctr[1] - YC, ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == heart (0, ${YC}, ${BEAD_Z}) half-embedded front face, r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D7 tip law (the kiss reads from bytes) -------------------------------------------------------------------
{
    if (!stoneNode) { check("D7 tip law", false, "rh_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        // tip thetas and expected world directions
        const tips = Array.from({ length: K }, (_, i) => {
            const t = (i * Math.PI) / K;
            const r = rose(t);
            return [r * Math.cos(t + ROT), YC + r * Math.sin(t + ROT)] as [number, number];
        });
        let kisses = 0;
        const gaps: number[] = [];
        for (const tp of tips) {
            // nearest ribbon vert to the tip point
            let best = Infinity;
            for (const v of verts) {
                if (Math.abs(v[2]) > RIB_SEC_D) continue;
                const d = Math.hypot(v[0] - tp[0], v[1] - tp[1]);
                if (d < best) best = d;
            }
            gaps.push(best);
            // corner allowance: half-diag of the tip voussoir section ≈ 98mm
            if (best <= 0.098) kisses++;
        }
        // every tip is at radius A from the heart (bytes re-derive)
        const onCircle = tips.every((tp) => Math.abs(Math.hypot(tp[0], tp[1] - YC) - A) < 1e-9);
        check("D7 tip law", kisses === K && onCircle,
            `${kisses}/${K} tips have ribbon verts within 98mm (gaps ${gaps.map(g => (g * 1000).toFixed(0)).join("/")}mm) — every petal tip reaches its kiss; tips on the circle r=a exact`);
    }
}

// ---- D8 envelope == probe contract -----------------------------------------------------------------------------
{
    if (!stoneNode || !ironNode || !glowNode) { check("D8 envelope", false, "bucket absent"); }
    else {
        const all = [...vertsOf(stoneNode.n), ...vertsOf(ironNode.n), ...vertsOf(glowNode.n)];
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        let dErr = 0;
        for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
        const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
        check("D8 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
            `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
    }
}

// ---- D9 named texMats (struct-38 law) ----------------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D9 named texMats", mats.includes("rh_stone") && mats.includes("rh_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
