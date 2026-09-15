// struct188-decode-cissoid.ts — decode audit of village_cissoid3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_catalan3.glb) and require ≥1 FAIL.
//
// Checks: node census (ci_stone + ci_brass + ci_iron + glow_ci_1), STONE
// CLASS LAW (every stone vertex belongs to exactly one of 2 members —
// ribbon band-law distance-to-curve ≤ SEC/2 + 2mm, plinth box), CURVE LAW
// FROM BYTES (crown crossing: stone verts reach (a,a) within SEC/2; the
// crossing bead center exact), BRASS LAW (arch verts on the generating
// circle shell; studs at m1/m2 on the plinth; bar at y* spanning
// [m1, post]), IRON LAW (post box at x=2a), BEAD LAW (center (a,a),
// radius, emissive), ENVELOPE == probe contract, NAMED texMats (struct-38).
// All world-frame checks apply SHIFT_X to bring verts into probe frame.
import { readFileSync } from "node:fs";
import {
    S, ASYM, SEC, N_VOUS, RING_TUBE, POST_SEC, POST_TOP, STUD_R, STUD_TOP,
    BAR_SEC, BEAD_R, BEAD_Z, PLINTH, ARCH_D, SHIFT_X, ENVELOPE,
    yOfX, M1, M2, BAR_Y, POST_INNER, X_START, X_END,
} from "./struct188-probe-cissoid.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_cissoid3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_ci_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ci_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ci_brass");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ci_iron");
check("D1 node census: 4 mesh nodes (ci_stone + ci_brass + ci_iron + glow_ci_1)",
    meshNodes.length === 4 && !!glowNode && !!stoneNode && !!brassNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// ---- D2 stone class law -------------------------------------------------------------------------------
// World → probe frame: x − SHIFT_X. NEAREST-POINT distance to a dense curve
// sample (same-x vertical distance lies badly on the steep asymptote end —
// diag-proven: 966/2304 with same-x, 2304/2304 nearest-point).
const CURVE: Array<[number, number]> = [];
for (let i = 0; i <= 20000; i++) {
    const x = X_START + (i / 20000) * (X_END - X_START);
    CURVE.push([x, yOfX(x)]);
}
const nearCurve = (x: number, y: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - x, cy - y); if (d < best) best = d; }
    return best;
};
const ribbonClass = (v: number[]) => nearCurve(v[0] - SHIFT_X, v[1]) <= SEC / 2 + TOL;
const plinthClass = (v: number[]) => {
    const x = v[0] - SHIFT_X;
    return x >= PLINTH.x0 - TOL && x <= PLINTH.x1 + TOL &&
        v[1] >= -TOL && v[1] <= PLINTH.h + TOL &&
        Math.abs(v[2]) <= PLINTH.hz + TOL;
};
{
    if (!stoneNode) { check("D2 stone class law", false, "ci_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let ribbon = 0, plinth = 0, unassigned = 0;
        for (const v of verts) {
            if (ribbonClass(v)) ribbon++;
            else if (plinthClass(v)) plinth++;
            else unassigned++;
        }
        // 96 voussoirs × 24 verts = 2304 ribbon; 1 plinth box × 24 verts
        check("D2 stone class law", unassigned === 0 && ribbon === N_VOUS * 24 && plinth === 24,
            `${verts.length} verts: ribbon ${ribbon} (96×24), plinth ${plinth} (1×24), unassigned ${unassigned}`);
    }
}

// ---- D3 curve law from bytes (the crown crossing + asymptote climb) ------------------------------------
{
    if (!stoneNode) { check("D3 curve law from bytes", false, "ci_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n).filter(ribbonClass);
        // crown: verts within SEC/2+TOL of (a,a) — the ribbon passes the crossing
        const nearCrown = verts.filter(v => {
            const x = v[0] - SHIFT_X;
            return Math.abs(x - S) <= SEC / 2 + TOL && Math.abs(v[1] - S) <= SEC / 2 + TOL;
        }).length;
        // top of the ribbon reaches y(X_END)+SEC/2·max ≈ 3.60+0.24 band; honest:
        // ribbon max y within SEC/2 of y(X_END) + band half-diagonal
        const topY = Math.max(...verts.map(v => v[1]));
        const topLaw = yOfX(X_END);  // centerline top
        // min x of ribbon (cusp side) vs X_START centerline
        const minX = Math.min(...verts.map(v => v[0] - SHIFT_X));
        check("D3 curve law from bytes", nearCrown >= 8 &&
            Math.abs(topY - topLaw) <= SEC / 2 + 0.001 && Math.abs(minX - X_START) <= SEC / 2 + 0.001,
            `verts at the crown crossing ${nearCrown} (ribbon passes (a,a)); ribbon top y ${topY.toFixed(3)} (centerline ${topLaw.toFixed(3)}); cusp-side min x ${minX.toFixed(3)} (centerline ${X_START.toFixed(3)})`);
    }
}

// ---- D4 brass law (arch + studs + bar) -----------------------------------------------------------------
{
    if (!brassNode) { check("D4 brass law", false, "ci_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        // exclusive priority classification (diag-proven counts):
        // stud → bar → arch-shell → NONE must be 0
        let arch = 0, stud = 0, bar = 0, none = 0;
        for (const v of verts) {
            const x = v[0] - SHIFT_X, y = v[1];
            const isStud = (Math.abs(x - M1) <= STUD_R + TOL || Math.abs(x - M2) <= STUD_R + TOL) && y <= STUD_TOP + TOL && y >= -TOL;
            const isBar = Math.abs(y - BAR_Y) <= BAR_SEC / 2 + TOL && x >= M1 - TOL && x <= POST_INNER + TOL;
            const onShell = y >= PLINTH.h - RING_TUBE - TOL && Math.abs(Math.hypot(x - S, y) - S) <= RING_TUBE + TOL;
            if (isStud) stud++;
            else if (isBar) bar++;
            else if (onShell) arch++;
            else none++;
        }
        check("D4 brass law", none === 0 && arch > 1500 && stud >= 48 && bar >= 24,
            `${verts.length} brass verts: arch ${arch} on the circle shell (springs embed to y 0.05), studs ${stud} at m1/m2, bar ${bar} at y* ${BAR_Y.toFixed(3)} spanning [m1, post], unclassified ${none}`);
    }
}

// ---- D5 iron post law -----------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 iron post law", false, "ci_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const cx = (mn[0] + mx[0]) / 2 - SHIFT_X;
        check("D5 iron post law", Math.abs(cx - ASYM) <= TOL && Math.abs(mx[1] - POST_TOP) <= TOL && Math.abs(mn[1]) <= TOL &&
            Math.abs((mx[0] - mn[0]) - POST_SEC) <= TOL,
            `post center x ${cx.toFixed(3)} (asymptote ${ASYM}), y [0, ${mx[1].toFixed(3)}], section ${(mx[0] - mn[0]).toFixed(3)} — the tangent line made solid`);
    }
}

// ---- D6 bead law --------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_ci_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2 - SHIFT_X, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D6 bead law", Math.hypot(ctr[0] - S, ctr[1] - S, ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == (a,a,front-face), r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D7 envelope == probe contract --------------------------------------------------------------------
{
    if (!stoneNode || !brassNode || !ironNode || !glowNode) { check("D7 envelope", false, "bucket absent"); }
    else {
        const all = [...vertsOf(stoneNode.n), ...vertsOf(brassNode.n), ...vertsOf(ironNode.n), ...vertsOf(glowNode.n)];
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        let dErr = 0;
        for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
        const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
        check("D7 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
            `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
    }
}

// ---- D8 named texMats (struct-38 law) -----------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D8 named texMats", mats.includes("ci_stone") && mats.includes("ci_brass") && mats.includes("ci_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
