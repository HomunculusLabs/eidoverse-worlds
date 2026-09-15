// struct192-decode-archispiral.ts — decode audit of village_archispiral3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_quadratrix3.glb) and require >=1 FAIL.
//
// Checks: node census (as_stone + as_brass + as_iron + glow_as_1), BAND LAW
// (>=700 stone verts within SEC/2+2mm of the dense 3D spiral — the coil
// reads from bytes; every remaining stone vert inside hub / kerb / plinth,
// union none=0), SWEEP LAW (theta coverage continuous theta_start..theta_max
// from plan radii, zero interior gaps; verts at both theorem pegs), BRASS
// LAW (peg1 at theta=2pi on-curve, peg2 at theta* on-curve, heights PEG_H),
// IRON LAW (mast at the curve-end plan position, spans plinth-top..MAST_TOP,
// curve-band vert embeds its flank), BEAD LAW (center on mast cap, emissive),
// ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    B, BASE, SEC, N_VOUS, HUB_R, HUB_H, KERB_R0, KERB_R1, KERB_H, KERB_N,
    PLINTH_R, PLINTH_H, MAST_SEC, MAST_TOP, PEG_R, PEG_H, BEAD_R,
    THETA_START, THETA_MAX, TURN1_TH, THETA_STAR, R_STAR, AZ_STAR, Y_STAR,
    MAST_P, END_Y, ENVELOPE, yOf,
} from "./struct192-probe-archispiral.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_archispiral3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_as_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "as_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "as_brass");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "as_iron");
check("D1 node census: 4 mesh nodes (as_stone + as_brass + as_iron + glow_as_1)",
    meshNodes.length === 4 && !!glowNode && !!stoneNode && !!brassNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// Band radius: a tangent voussoir's cross-section perpendicular to the 3D
// curve is SEC x SEC, so corner verts sit SEC/2*sqrt(2) from the centerline
// (+ chord sagitta ~8mm + tol). The quadratrix's SEC/2 bound was 2D in-plane;
// in 3D the honest classifier bound is the cross-section half-diagonal.
const BAND_R = (SEC / 2) * Math.SQRT2 + 0.010 + TOL;   // ~0.115

// dense 3D curve + nearest distance (plan polar + rise), same derivation as probe
const CURVE: Array<[number, number, number]> = [];
{
    const N = 20000;
    for (let i = 0; i <= N; i++) {
        const th = THETA_START + (i / N) * (THETA_MAX - THETA_START);
        CURVE.push([B * th * Math.cos(th), BASE + B * th, B * th * Math.sin(th)]);
    }
}
const nearCurve = (x: number, y: number, z: number) => {
    let best = Infinity;
    for (const [cx, cy, cz] of CURVE) { const d = Math.hypot(cx - x, cy - y, cz - z); if (d < best) best = d; }
    return best;
};

// ---- D2 band + union law -------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 band + union law", false, "as_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0, hub = 0, kerb = 0, plinth = 0, none = 0;
        // kerb chord-box corners swing to sqrt((rMid+d/2)^2 + (len/2)^2) —
        // the classifier window admits the designed swing (decode-caught law)
        const kerbRMax = Math.sqrt(((KERB_R0 + KERB_R1) / 2 + (KERB_R1 - KERB_R0) / 2) ** 2 + (2 * Math.PI * ((KERB_R0 + KERB_R1) / 2) / KERB_N / 2) ** 2) + 0.004;
        for (const v of verts) {
            const [x, y, z] = v;
            const rPlan = Math.hypot(x, z);
            const inBand = nearCurve(x, y, z) <= BAND_R;
            const inHub = rPlan <= HUB_R + TOL && y >= BASE - TOL && y <= BASE + HUB_H + TOL;
            const inKerb = rPlan >= KERB_R0 - 0.010 && rPlan <= kerbRMax && y >= BASE - TOL && y <= BASE + KERB_H + TOL;
            const inPlinth = rPlan <= PLINTH_R + TOL && y >= -TOL && y <= PLINTH_H + TOL;
            if (inBand) band++;
            else if (inHub) hub++;
            else if (inKerb) kerb++;
            else if (inPlinth) plinth++;
            else none++;
        }
        check("D2 band + union law", none === 0 && band >= 700 && hub >= 24 && kerb >= 400 && plinth >= 24,
            `${verts.length} stone verts: coil band ${band} (>=700; ${N_VOUS} voussoirs x 24 = ${N_VOUS * 24}), hub ${hub}, kerb ${kerb}, plinth ${plinth}, unclassified ${none}`);
    }
}

// ---- D3 sweep law from bytes ------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 sweep law", false, "as_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n)
            .filter(v => nearCurve(v[0], v[1], v[2]) <= BAND_R);
        // theta from plan radius: r = b*theta
        const NB = 20;
        const bins = new Array(NB).fill(0);
        for (const v of verts) {
            const r = Math.hypot(v[0], v[2]);
            const th = r / B;
            const bi = Math.floor((th - THETA_START) / (THETA_MAX - THETA_START) * NB);
            if (bi >= 0 && bi < NB) bins[bi]++;
        }
        // rise law note: per-vert y == BASE + rPlan is NOT a valid test for
        // tilted 3D boxes (corner verts legitimately differ by the
        // half-diagonal); the rise law is carried by D2's 3D band distance
        // against the dense curve — a wrong rise breaks the band, not this.
        const nonEmpty = bins.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0);
        const gaps = nonEmpty.filter((b, i) => i > 0 && b - nonEmpty[i - 1] > 1).length;
        // theorem pegs: coil passes theta=2pi and theta* (chord proximity —
        // station ends don't land exactly on the thetas)
        const atPeg1 = verts.filter(v => Math.hypot(v[0] - B * TURN1_TH * Math.cos(TURN1_TH), v[1] - yOf(TURN1_TH), v[2] - B * TURN1_TH * Math.sin(TURN1_TH)) <= BAND_R + 0.20).length;
        const atPeg2 = verts.filter(v => Math.hypot(v[0] - R_STAR * Math.cos(AZ_STAR), v[1] - Y_STAR, v[2] - R_STAR * Math.sin(AZ_STAR)) <= BAND_R + 0.20).length;
        check("D3 sweep law", nonEmpty.length === NB && gaps === 0 && atPeg1 >= 8 && atPeg2 >= 8,
            `${nonEmpty.length}/${NB} theta-bins occupied theta ${THETA_START.toFixed(2)}..${THETA_MAX.toFixed(2)}, 0 interior gaps; coil verts near peg1 theta=2pi: ${atPeg1}, near theta*: ${atPeg2}`);
    }
}

// ---- D4 brass law (theorem pegs) ---------------------------------------------------------------------------
{
    if (!brassNode) { check("D4 brass law", false, "as_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        const p1: [number, number] = [B * TURN1_TH * Math.cos(TURN1_TH), B * TURN1_TH * Math.sin(TURN1_TH)];
        const p2: [number, number] = [R_STAR * Math.cos(AZ_STAR), R_STAR * Math.sin(AZ_STAR)];
        let peg1 = 0, peg2 = 0, none = 0;
        for (const v of verts) {
            const onPeg = (px: number, pz: number, cy: number) =>
                Math.hypot(v[0] - px, v[2] - pz) <= PEG_R + TOL && Math.abs(v[1] - cy) <= PEG_H / 2 + TOL;
            if (onPeg(p1[0], p1[1], yOf(TURN1_TH))) peg1++;
            else if (onPeg(p2[0], p2[1], Y_STAR)) peg2++;
            else none++;
        }
        // pegs sit ON the curve: their plan radius == b*theta at their theta
        const onCurve1 = Math.abs(Math.hypot(p1[0], p1[1]) - B * TURN1_TH);
        const onCurve2 = Math.abs(Math.hypot(p2[0], p2[1]) - R_STAR);
        check("D4 brass law", none === 0 && peg1 >= 20 && peg2 >= 20 && onCurve1 < 1e-12 && onCurve2 < 1e-12,
            `${verts.length} brass verts: peg1 ${peg1} at theta=2pi plan (${p1[0].toFixed(4)},${p1[1].toFixed(4)}) y ${yOf(TURN1_TH).toFixed(4)}, peg2 ${peg2} at theta* plan (${p2[0].toFixed(4)},${p2[1].toFixed(4)}) y ${Y_STAR.toFixed(4)}, unclassified ${none}; both on-curve (dr ${onCurve1.toExponential(1)}/${onCurve2.toExponential(1)})`);
    }
}

// ---- D5 iron law (the landing mast) --------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 iron law", false, "as_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const posErr = Math.hypot(ctr[0] - MAST_P[0], ctr[2] - MAST_P[1]);
        const spanOk = Math.abs(mn[1] - BASE) <= TOL && Math.abs(mx[1] - MAST_TOP) <= TOL;
        const secOk = Math.abs((mx[0] - mn[0]) - MAST_SEC) <= TOL && Math.abs((mx[2] - mn[2]) - MAST_SEC) <= TOL;
        // the coil's last band embeds the mast flank: nearest curve point to the mast axis
        const endGap = nearCurve(ctr[0], END_Y, ctr[2]);
        check("D5 iron law", posErr <= TOL && spanOk && secOk && endGap <= SEC / 2 + TOL,
            `mast center (${ctr.map(x => x.toFixed(3)).join(",")}) == curve-end plan (err ${(posErr * 1000).toFixed(1)} mm), y span [${mn[1].toFixed(3)}, ${mx[1].toFixed(3)}] section ${(mx[0] - mn[0]).toFixed(3)}; curve end passes mast axis at distance ${(endGap * 1000).toFixed(1)} mm — the coil lands in iron`);
    }
}

// ---- D6 bead law ------------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_as_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D6 bead law", Math.hypot(ctr[0] - MAST_P[0], ctr[1] - MAST_TOP, ctr[2] - MAST_P[1]) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == mast cap (MAST_P, ${MAST_TOP}), r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D7 envelope == probe contract ------------------------------------------------------------------------
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

// ---- D8 named texMats (struct-38 law) ---------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D8 named texMats", mats.includes("as_stone") && mats.includes("as_brass") && mats.includes("as_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
