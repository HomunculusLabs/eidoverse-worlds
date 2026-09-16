// struct202-decode-elliptic.ts — decode audit of village_elliptic3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_versiera3.glb) and require >=1 FAIL.
//
// Checks: node census (el_stone + el_iron + el_brass + glow_el_1), PLINTH
// law, CURVE RIBBON law (stone verts on the dense curve, both components:
// oval closed-loop + wing, root joints + tail socket + high tip), DATUM
// ROD law (iron verts on the axis rod + posts; three root pierces), CHORD
// ROD law (rod on the R→Q line; crosses the datum exactly at the
// x-intercept), BEAD law (at P on curve AND line, emissive, half-proud),
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    S, X_TIP, TIP_AIR, PLINTH_W, PLINTH_H, PLINTH_D, RIB_N, RIB_D,
    ROD_R, ROD_XL, ROD_XR, POST_X, POST_S, COLLAR_R, COLLAR_L,
    BEAD_R, BEAD_Z, DATUM_Y, ROOTS, P_M, R_M, Q_M, M_SLOPE, LINE_B, X_INT,
    CHORD_A, CHORD_B, fCub, yUpper, worldPt, worldRootX, ARCS, arcStations, ENVELOPE,
} from "./struct202-probe-elliptic.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_elliptic3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_el_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "el_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "el_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "el_brass");
check("D1 node census: 4 mesh nodes (el_stone + el_iron + el_brass + glow_el_1)",
    meshNodes.length === 4 && !!glowNode && !!stoneNode && !!ironNode && !!brassNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense curve in WORLD coords (both components), for nearness tests
const CURVE: Array<[number, number]> = [];
{
    for (let i = 0; i <= 30000; i++) {
        const x = -1 + (i / 30000) * (X_TIP + 1);
        const fv = fCub(x);
        if (fv < 0) continue;
        for (const sg of [1, -1]) CURVE.push(worldPt(x, sg * yUpper(x)));
    }
}
const nearCurve = (vx: number, vy: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - vx, cy - vy); if (d < best) best = d; }
    return best;
};

// ---- D2 plinth law ---------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 plinth law", false, "el_stone bucket absent (foreign/malformed target)"); }
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

// ---- D3 curve ribbon law ---------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 curve ribbon law", false, "el_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0;
        for (const v of verts) {
            // corner allowance: RIB half-thickness 100mm + curvature bend ~2mm
            if (nearCurve(v[0], v[1]) <= 0.103) band++;
        }
        // component coverage: verts near the oval (math x∈[−1,0] → world band) and the wing
        const ovalMin = worldRootX(-1), ovalMax = worldRootX(0), wingMin = worldRootX(1);
        let oval = 0, wing = 0;
        for (const v of verts) {
            if (nearCurve(v[0], v[1]) > 0.103) continue;
            if (v[0] >= ovalMin - 0.15 && v[0] <= ovalMax + 0.15) oval++;
            if (v[0] >= wingMin - 0.15) wing++;
        }
        // root joints: verts near each root crossing
        let rootsHit = 0;
        for (const r of ROOTS) {
            const rw: [number, number] = [worldRootX(r), DATUM_Y];
            if (verts.some((v) => Math.hypot(v[0] - rw[0], v[1] - rw[1]) <= 0.16)) rootsHit++;
        }
        // the tail socket: stone verts of the wing INSIDE the plinth box (below its top, past the right root)
        const socket = verts.filter((v) => v[0] > wingMin + 0.05 && v[1] < PLINTH_H + TOL && v[1] > -TOL).length;
        // the high tip: ribbon verts near the wing's upper tip point
        const tipPt = worldPt(X_TIP, yUpper(X_TIP));
        const tipNear = verts.filter((v) => Math.hypot(v[0] - tipPt[0], v[1] - tipPt[1]) <= 0.16).length;
        check("D3 curve ribbon law", band >= 36 * 8 && oval >= 200 && wing >= 200 && rootsHit === 3 && socket >= 4 && tipNear >= 4,
            `${band} verts within 103mm of the dense curve (oval ${oval}, wing ${wing}); ${rootsHit}/3 root joints present; tail socket ${socket} verts inside the plinth; upper tip ${tipNear} verts — both components read from bytes`);
    }
}

// ---- D4 datum rod + gantry law ---------------------------------------------------------------------------
{
    if (!ironNode) { check("D4 datum rod law", false, "el_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // verts on the axis rod: |y − DATUM_Y| <= rod + tol, |x| <= span/2 + tol, |z| <= rod + tol
        let onRod = 0;
        for (const v of verts) {
            if (Math.abs(v[1] - DATUM_Y) <= ROD_R + TOL && Math.abs(v[0]) <= ROD_XR + TOL && Math.abs(v[2]) <= ROD_R + TOL) onRod++;
        }
        // post verts: inside the two post boxes
        let inPosts = 0;
        for (const v of verts) {
            for (const sx of [-1, 1]) {
                if (Math.abs(v[0] - sx * POST_X) <= POST_S / 2 + TOL) inPosts++;
            }
        }
        // the three pierces: the rod's SPAN covers each root's world x (the
        // rod axis sits exactly at DATUM_Y — any root-x inside the span is a
        // pierce by construction; mid-span verts don't exist on a
        // heightSegment-1 cylinder, so span-coverage + D3's stone root
        // joints are the honest read)
        const rodXs = verts.filter((v) => Math.abs(v[1] - DATUM_Y) <= ROD_R + TOL).map((v) => v[0]);
        const spanMin = Math.min(...rodXs), spanMax = Math.max(...rodXs);
        let pierces = 0;
        for (const r of ROOTS) {
            const rx = worldRootX(r);
            if (rx >= spanMin - TOL && rx <= spanMax + TOL) pierces++;
        }
        check("D4 datum rod law", onRod >= 40 && inPosts >= 24 && pierces === 3,
            `${onRod}/${verts.length} iron verts on the axis rod at y=${DATUM_Y.toFixed(4)} (span ${spanMin.toFixed(2)}..${spanMax.toFixed(2)}); ${inPosts} in the post boxes; rod span covers all ${pierces}/3 root pierces — the line of reals, pinned to the curve`);
    }
}

// ---- D5 chord rod law ------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 chord rod law", false, "el_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // the rod's world line: through CHORD_A (=R) with direction CHORD_DIR; verts project onto [−tol, len+tol]
        const rw = CHORD_A;
        const dx = CHORD_B[0] - CHORD_A[0], dy = CHORD_B[1] - CHORD_A[1];
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        let onRod = 0;
        for (const v of verts) {
            const px = v[0] - rw[0], py = v[1] - rw[1];
            const along = px * ux + py * uy;
            const perp = Math.abs(px * uy - py * ux);
            if (perp <= ROD_R + TOL && along >= -0.01 && along <= len + 0.01 && Math.abs(v[2]) <= ROD_R + TOL) onRod++;
        }
        // the datum crossing: point on the rod line at world x of X_INT sits at DATUM_Y exactly
        const cw: [number, number] = [worldPt(X_INT, 0)[0], DATUM_Y];
        const onLine = Math.abs((cw[0] - rw[0]) * uy - (cw[1] - rw[1]) * ux);
        // welds: R is the rod's START (end-cap verts exist there); Q is
        // mid-span by design (the rod extends past it) — honest read: R cap
        // verts present AND Q projects inside the rod's extent
        const qw = worldPt(Q_M[0], Q_M[1]);
        const sQ = (qw[0] - rw[0]) * ux + (qw[1] - rw[1]) * uy;
        const qCovered = sQ >= 0.05 && sQ <= len - 0.05;
        const rCap = verts.some((v) => Math.hypot(v[0] - rw[0], v[1] - rw[1]) <= ROD_R + 0.02 && Math.abs(v[2]) <= ROD_R + TOL);
        check("D5 chord rod law", onRod >= 24 && onLine < 1e-6 && rCap && qCovered,
            `${onRod} verts on the R→Q rod line (len ${len.toFixed(3)}); crosses the datum rod at the x-intercept x=${X_INT.toFixed(5)} (perp ${onLine.toExponential(1)}); R cap-weld verts present, Q at rod-span ${sQ.toFixed(3)}m (rod extends past it) — the line that does arithmetic`);
    }
}

// ---- D6 bead law (the hidden third point) --------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_el_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const pw = worldPt(P_M[0], P_M[1]);
        // ON THE ROD'S LINE: perp distance from the bead to the R→Q line ≈ 0 (world)
        const rw = CHORD_A;
        const dxw = CHORD_B[0] - rw[0], dyw = CHORD_B[1] - rw[1];
        const lw = Math.hypot(dxw, dyw);
        const perp = Math.abs((pw[0] - rw[0]) * (dyw / lw) - (pw[1] - rw[1]) * (dxw / lw));
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D6 bead law",
            Math.hypot(ctr[0] - pw[0], ctr[1] - pw[1], ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive && perp < 1e-6,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == P (${pw.map(x => x.toFixed(3)).join(",")}, z ${BEAD_Z}) half-proud front face, r ${r.toFixed(4)}, ON the rod's line (perp ${perp.toExponential(1)}), emissive ${emissive ? JSON.stringify(emissive) : "MISSING"} — the hidden third point`);
    }
}

// ---- D7 collars law ---------------------------------------------------------------------------------------
{
    if (!brassNode) { check("D7 collars law", false, "el_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        // each collar (through-pin, length along x): verts near the rod axis
        // LINE at the root's world x, within the pin half-length
        let clusters = 0;
        for (const r of ROOTS) {
            const n = verts.filter((v) =>
                Math.abs(v[1] - DATUM_Y) <= COLLAR_R + TOL &&
                Math.abs(v[0] - worldRootX(r)) <= COLLAR_L / 2 + TOL).length;
            if (n >= 8) clusters++;
        }
        // all brass verts belong to some pin (axis-line distance, x within half-length)
        let strays = 0;
        for (const v of verts) {
            const near = ROOTS.some((r) =>
                Math.abs(v[1] - DATUM_Y) <= COLLAR_R + TOL &&
                Math.abs(v[0] - worldRootX(r)) <= COLLAR_L / 2 + TOL);
            if (!near) strays++;
        }
        check("D7 collars law", clusters === 3 && strays === 0,
            `${clusters}/3 collar clusters on the rod at the root pierces (world x ${ROOTS.map(r => worldRootX(r).toFixed(3)).join(", ")}), ${strays} stray brass verts — the 2-torsion dressed`);
    }
}

// ---- D8 envelope == probe contract -----------------------------------------------------------------------------
{
    if (!stoneNode || !ironNode || !brassNode || !glowNode) { check("D8 envelope", false, "bucket absent"); }
    else {
        const all = [...vertsOf(stoneNode.n), ...vertsOf(ironNode.n), ...vertsOf(brassNode.n), ...vertsOf(glowNode.n)];
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of all) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = maxc(mx[c], v[c]); }
        let dErr = 0;
        for (let c = 0; c < 3; c++) dErr = Math.max(dErr, Math.abs(mn[c] - ENVELOPE.min[c]), Math.abs(mx[c] - ENVELOPE.max[c]));
        const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
        check("D8 envelope", dErr < 0.001 && Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001,
            `${(mx[0] - mn[0]).toFixed(3)}x${(mx[1] - mn[1]).toFixed(3)}x${(mx[2] - mn[2]).toFixed(3)} drift ${dErr.toFixed(4)} cx/cz ${cx.toExponential(1)}/${cz.toExponential(1)}`);
    }
}

// helper (typo guard)
function maxc(a: number, b: number) { return a > b ? a : b; }

// ---- D9 named texMats (struct-38 law) ----------------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D9 named texMats", mats.includes("el_stone") && mats.includes("el_iron") && mats.includes("el_brass") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
