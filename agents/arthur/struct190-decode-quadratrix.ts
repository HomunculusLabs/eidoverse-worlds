// struct190-decode-quadratrix.ts — decode audit of village_quadratrix3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_cissoid3.glb) and require >=1 FAIL.
//
// Checks: node census (qu_stone + qu_brass + qu_iron + glow_qu_1), BAND LAW
// (>=500 stone verts within SEC/2+2mm of the dense quadratrix — the curve
// reads from bytes; every remaining stone vert inside a frame member box or
// the plinth, union none=0), SWEEP LAW (ribbon y-histogram continuous foot
// to top; >=8 verts at the frozen crossing), BRASS LAW (ray verts on the
// 60-deg centerline; stud at 2W/pi on the base top), IRON LAW (falling line
// at y* spanning member-face to member-face), BEAD LAW (center at the
// crossing, front-face z, emissive), ENVELOPE == probe contract, NAMED
// texMats (struct-38). Stone members interpenetrate BY DESIGN (ribbon
// embeds into the corner joint and base member) so member counts are
// bounded, not exact; the curve laws are exact.
import { readFileSync } from "node:fs";
import {
    W, BASE_LIFT, FRAME_SEC, SEC, RAY_SEC, RAY_TH, LINE_SEC,
    STUD_R, STUD_H, BEAD_R, BEAD_Z, PLINTH, PI_X, Y_STAR, X_STAR,
    Y_TOP, Y_BOT, SHIFT_X, ENVELOPE, xOfY,
} from "./struct190-probe-quadratrix.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_quadratrix3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_qu_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "qu_stone");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "qu_brass");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "qu_iron");
check("D1 node census: 4 mesh nodes (qu_stone + qu_brass + qu_iron + glow_qu_1)",
    meshNodes.length === 4 && !!glowNode && !!stoneNode && !!brassNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// dense curve (math frame), nearest-point distance (struct-188 law: same-x
// vertical distance lies badly near the vertical-tangent corner)
const CURVE: Array<[number, number]> = [];
{
    const yHi = W - 1e-4;
    for (let i = 0; i <= 20000; i++) {
        const ym = Y_BOT + (i / 20000) * (yHi - Y_BOT);
        CURVE.push([xOfY(ym), ym]);
    }
}
const nearCurve = (x: number, y: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - x, cy - y); if (d < best) best = d; }
    return best;
};
const toMath = (v: number[]) => [v[0] - SHIFT_X, v[1] - BASE_LIFT];

// ---- D2 band + union law -------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 band + union law", false, "qu_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const hs = FRAME_SEC / 2;
        let band = 0, none = 0, frame = 0, plinth = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            const inBand = nearCurve(xm, ym) <= SEC / 2 + TOL;
            const inFrame =
                (Math.abs(xm) <= hs + TOL && ym >= -hs - TOL && ym <= W + hs + TOL) ||
                (Math.abs(xm - W) <= hs + TOL && ym >= -hs - TOL && ym <= W + hs + TOL) ||
                (Math.abs(ym) <= hs + TOL && xm >= -hs - TOL && xm <= W + hs + TOL) ||
                (Math.abs(ym - W) <= hs + TOL && xm >= -hs - TOL && xm <= W + hs + TOL);
            const inPlinth = xm >= PLINTH.x0 - TOL && xm <= PLINTH.x1 + TOL &&
                v[1] >= -TOL && v[1] <= PLINTH.h + TOL && Math.abs(v[2]) <= PLINTH.hz + TOL;
            if (inBand) band++;
            else if (inFrame) frame++;
            else if (inPlinth) plinth++;
            else none++;
        }
        check("D2 band + union law", none === 0 && band >= 500 && frame >= 80 && plinth >= 24,
            `${verts.length} stone verts: curve band ${band} (>=500; 22 voussoirs x 24 = 528 + corner-embedded frame verts), frame boxes ${frame}, plinth ${plinth}, unclassified ${none}`);
    }
}

// ---- D3 sweep law from bytes ----------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 sweep law", false, "qu_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n)
            .filter(v => { const [xm, ym] = toMath(v); return nearCurve(xm, ym) <= SEC / 2 + TOL; });
        // continuity: y-histogram bins of 0.10 over math y (0.05, W)
        const bins = new Array(26).fill(0);
        for (const v of verts) {
            const ym = toMath(v)[1];
            const b = Math.floor((ym - 0.05) / 0.10);
            if (b >= 0 && b < 26) bins[b]++;
        }
        const nonEmpty = bins.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0);
        const first = nonEmpty[0], last = nonEmpty[nonEmpty.length - 1];
        const gaps = nonEmpty.filter((b, i) => i > 0 && b - nonEmpty[i - 1] > 1).length;
        // the frozen crossing: ribbon passes (x*, y*)
        const atCross = verts.filter(v => {
            const [xm, ym] = toMath(v);
            return Math.abs(xm - X_STAR) <= 0.08 && Math.abs(ym - Y_STAR) <= 0.08;
        }).length;
        check("D3 sweep law", nonEmpty.length >= 15 && first <= 3 && last >= 23 && gaps === 0 && atCross >= 8,
            `${nonEmpty.length}/26 y-bins occupied from bin ${first} (y~0.10) to ${last} (y~2.45+), 0 interior gaps; ${atCross} verts at the frozen crossing (${X_STAR.toFixed(4)}, ${Y_STAR.toFixed(4)}) — the sweep is continuous corner-to-foot and passes the crossing`);
    }
}

// ---- D4 brass law (ray + pi-stud) ------------------------------------------------------------------------
{
    if (!brassNode) { check("D4 brass law", false, "qu_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        // ray: distance to the 60-deg centerline through the pole corner (0,0) math frame.
        // The ray EMBEDS into the top member: its axis runs t in [s0, s1],
        // s1 = (W + FRAME_SEC/2 - 0.03)/sin(60) ~ 3.058 — range caps must
        // cover the FULL member-embedded extent (first draft capped at W+0.12
        // and misread the top-end verts as unclassified — checker-side).
        const s0 = -0.05 / Math.sin(RAY_TH), s1 = (W + FRAME_SEC / 2 - 0.03) / Math.sin(RAY_TH);
        const c60 = Math.cos(RAY_TH), s60 = Math.sin(RAY_TH);
        const rayT = (xm: number, ym: number) => xm * c60 + ym * s60;          // projection on the ray
        const rayPerp = (xm: number, ym: number) => Math.abs(xm * s60 - ym * c60);
        const studTopY = BASE_LIFT + FRAME_SEC / 2 + STUD_H;
        let ray = 0, stud = 0, none = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            const isRay = rayPerp(xm, ym) <= RAY_SEC / 2 + TOL && rayT(xm, ym) >= s0 - 0.12 && rayT(xm, ym) <= s1 + 0.12;
            const isStud = Math.abs(xm - PI_X) <= STUD_R + TOL && v[1] >= BASE_LIFT + FRAME_SEC / 2 - TOL && v[1] <= studTopY + TOL;
            if (isRay) ray++;
            else if (isStud) stud++;
            else none++;
        }
        // the ray SEGMENT passes the frozen crossing: a single box carries verts
        // only at its end faces, so the passing law is geometric, not vertex-local
        const crossPerp = rayPerp(X_STAR, Y_STAR);
        const crossT = rayT(X_STAR, Y_STAR);
        const passesCross = crossPerp <= RAY_SEC / 2 + TOL && crossT >= s0 && crossT <= s1;
        check("D4 brass law", none === 0 && ray >= 20 && stud >= 20 && passesCross,
            `${verts.length} brass verts: ray ${ray} on the 60-deg centerline (axis t in [${s0.toFixed(3)}, ${s1.toFixed(3)}]), pi-stud ${stud} at x 2W/pi = ${PI_X.toFixed(6)}, unclassified ${none}; ray passes the frozen crossing perp ${(crossPerp * 1000).toFixed(1)} mm at t ${crossT.toFixed(4)}`);
    }
}

// ---- D5 iron law (the falling line) -----------------------------------------------------------------------
{
    if (!ironNode) { check("D5 iron law", false, "qu_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const yErr = Math.abs((mn[1] + mx[1]) / 2 - (BASE_LIFT + Y_STAR));
        const span = mx[0] - mn[0];
        check("D5 iron law", yErr <= TOL && Math.abs(span - (W - 0.10)) <= TOL + 0.002 && Math.abs((mx[2] - mn[2]) - LINE_SEC) <= TOL,
            `line center y ${(mn[1] + mx[1]) / 2} == y* ${BASE_LIFT + Y_STAR} (err ${(yErr * 1000).toFixed(1)} mm); span ${span.toFixed(3)} (member-face to member-face), section z ${(mx[2] - mn[2]).toFixed(3)} — the falling line frozen at 2W/3`);
    }
}

// ---- D6 bead law ------------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_qu_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const ctr = [(mn[0] + mx[0]) / 2 - SHIFT_X, (mn[1] + mx[1]) / 2 - BASE_LIFT, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D6 bead law", Math.hypot(ctr[0] - X_STAR, ctr[1] - Y_STAR, ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == (x*, y*, front-face), r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
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
    check("D8 named texMats", mats.includes("qu_stone") && mats.includes("qu_brass") && mats.includes("qu_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
