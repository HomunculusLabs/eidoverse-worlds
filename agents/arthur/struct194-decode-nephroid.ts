// struct194-decode-nephroid.ts — decode audit of village_nephroid3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_quadratrix3.glb) and require >=1 FAIL.
//
// Checks: node census (ns_stone + ns_iron + glow_ns_1), CUP-ARC LAW (arc
// verts on the R-circle), CAUSTIC RIBBON LAW (nephroid verts on the dense
// a=R/4 nephroid), UNION LAW (every stone vert plinth/arc/nephroid),
// IRON RAY LAW (reflected segments on the true specular lines; contact
// containment geometric — boxes carry no interior verts, struct-190 D4
// precedent), POST+BEAM law, CUSP+BEAD law (bead at world cusp, front-face
// half-embed, emissive; ribbon verts converge at the cusp), RIM-SHARE law
// (nephroid rim ends == cup rim ends), ENVELOPE == probe contract, NAMED
// texMats (struct-38). Rim vertices are shared by design (both curves'
// endpoints coincide) — classified arc-first, once.
import { readFileSync } from "node:fs";
import {
    R, YC, PLINTH_W, PLINTH_H, PLINTH_D, ARC_SEC_N, NEPH_SEC_N,
    POST_X, POST_SEC, POST_TOP, BEAM_Y, BEAM_SEC_T, BEAM_SEC_D, BEAM_HALF,
    BEAD_R, BEAD_Z, RAY_KS, RAY_SEC, OVER, ENVELOPE,
    arcP, dRefl, tContact, neph,
} from "./struct194-probe-nephroid.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_nephroid3.glb";
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
const glowNode = meshNodes.find(({ n }: any) => /^glow_ns_1/.test(n.name ?? ""));
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ns_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ns_iron");
check("D1 node census: 3 mesh nodes (ns_stone + ns_iron + glow_ns_1)",
    meshNodes.length === 3 && !!glowNode && !!stoneNode && !!ironNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name).join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;
// dense nephroid, half facing light (math frame, cup centre at origin)
const CURVE: Array<[number, number]> = [];
for (let i = 0; i <= 20000; i++) {
    const t = -Math.PI / 2 + (i / 20000) * Math.PI;
    CURVE.push(neph(t));
}
const nearNeph = (x: number, y: number) => {
    let best = Infinity;
    for (const [cx, cy] of CURVE) { const d = Math.hypot(cx - x, cy - y); if (d < best) best = d; }
    return best;
};
const toMath = (v: number[]) => [v[0], v[1] - YC];

// ---- D2 cup-arc law (the vessel) ------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 cup-arc law", false, "ns_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let arc = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            const r = Math.hypot(xm, ym);
            const phi = Math.atan2(ym, xm);
            // tangent-box corners sit sqrt((sec/2)^2 + sag) off the circle
            if (Math.abs(r - R) <= ARC_SEC_N / 2 + 0.013 && phi >= -Math.PI / 2 - 0.12 && phi <= Math.PI / 2 + 0.12) arc++;
        }
        check("D2 cup-arc law", arc >= 16 * 20,
            `${arc}/${verts.length} stone verts on the R=${R} circle within ${((ARC_SEC_N / 2 + 0.013) * 1000).toFixed(0)}mm (16 voussoirs) — the cup reads from bytes`);
    }
}

// ---- D3 caustic ribbon law ------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 caustic ribbon law", false, "ns_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let band = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            // corner allowance: mid-chord dev <= 45mm, half-diag sqrt(45^2+70^2) = 83mm
            if (nearNeph(xm, ym) <= 0.088) band++;
        }
        // cusp convergence: ribbon verts at the shared cusp station
        const atCusp = verts.filter(v => {
            const [xm, ym] = toMath(v);
            return Math.hypot(xm - R / 2, ym) <= 0.13;
        }).length;
        check("D3 caustic ribbon law", band >= 16 * 20 && atCusp >= 8,
            `${band} verts within 88mm of the dense a=R/4 nephroid (both half-chains), ${atCusp} at the cusp (R/2, 0) — the caustic ribbon reads from bytes`);
    }
}

// ---- D4 union law ---------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D4 union law", false, "ns_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let plinth = 0, arc = 0, nep = 0, none = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            const inPlinth = Math.abs(v[0]) <= PLINTH_W / 2 + TOL && v[1] >= -TOL && v[1] <= PLINTH_H + TOL && Math.abs(v[2]) <= PLINTH_D / 2 + TOL;
            const r = Math.hypot(xm, ym), phi = Math.atan2(ym, xm);
            const inArc = Math.abs(r - R) <= ARC_SEC_N / 2 + 0.013 && phi >= -Math.PI / 2 - 0.12 && phi <= Math.PI / 2 + 0.12;
            const inNep = nearNeph(xm, ym) <= 0.088;
            if (inPlinth) plinth++;
            else if (inArc) arc++;
            else if (inNep) nep++;
            else none++;
        }
        check("D4 union law", none === 0 && plinth >= 24 && arc >= 16 * 20 && nep >= 240,
            `${verts.length} stone verts: plinth ${plinth}, cup arc ${arc}, nephroid ${nep} pure (+~120 rim-band shared, classified arc-first BY DESIGN: for t in [1.2, pi/2] the ribbon runs inside the arc's 103mm radial band — both curves hug the rim; D2/D3 are the exact per-curve laws), unclassified ${none}`);
    }
}

// ---- D5 iron ray law -------------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 iron ray law", false, "ns_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const postFace = POST_X + POST_SEC / 2;
        const perLine: number[] = [];
        let contactsOK = true;
        const details: string[] = [];
        for (const k of RAY_KS) {
            const phi = Math.asin(k / R);
            const P = arcP(phi), d = dRefl(phi), tc = tContact(phi);
            const far: [number, number] = [P[0] + (tc + OVER) * d[0], P[1] + (tc + OVER) * d[1]];
            // line through P world with dir d; count verts near the INCIDENT or REFLECTED box span
            let cnt = 0;
            for (const v of verts) {
                const [xm, ym] = toMath(v);
                // reflected segment span [P, far] (perp to line, projection in span)
                const vx = xm - P[0], vy = ym - P[1];
                const tProj = vx * d[0] + vy * d[1];
                const perp = Math.abs(vx * d[1] - vy * d[0]);
                if (perp <= Math.SQRT2 * RAY_SEC / 2 + TOL && tProj >= -0.03 && tProj <= tc + OVER + 0.03) { cnt++; continue; }
                // incident span [postFace, P] along +x at y == k
                if (Math.abs(ym - k) <= Math.SQRT2 * RAY_SEC / 2 + TOL && xm >= postFace - 0.03 && xm <= P[0] + 0.03) cnt++;
            }
            perLine.push(cnt);
            // geometric contact containment (struct-190 D4 law: boxes carry no interior verts)
            const C = neph(phi);
            const cx = C[0] - P[0], cy = C[1] - P[1];
            const cPerp = Math.abs(cx * d[1] - cy * d[0]);
            const cT = cx * d[0] + cy * d[1];
            if (!(cPerp <= 1e-9 + TOL && cT >= 0 && cT <= tc + OVER)) contactsOK = false;
            details.push(`k=${k}: ${cnt}v perp${(cPerp * 1e6).toFixed(1)}um t=${cT.toFixed(3)}/${(tc + OVER).toFixed(3)}`);
        }
        check("D5 iron ray law", contactsOK && perLine.every(c => c >= 16),
            `5 reflected lines carry ${perLine.join("/")} verts (>=16 each; k=0 shares its line with the incident tail — normal-incidence retracing, by design); contact containment geometric: ${details[0]} etc.`);
    }
}

// ---- D6 post + beam law (exclusion-based: ray verts first — all five
// incident segments issue from the post's face plane, coincident by design) --
{
    if (!ironNode) { check("D6 post+beam law", false, "ns_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        const postFace = POST_X + POST_SEC / 2;
        const isRayVert = (xm: number, ym: number) => {
            for (const k of RAY_KS) {
                const phi = Math.asin(k / R);
                const P = arcP(phi), d = dRefl(phi), tc = tContact(phi);
                const vx = xm - P[0], vy = ym - P[1];
                const tProj = vx * d[0] + vy * d[1];
                const perp = Math.abs(vx * d[1] - vy * d[0]);
                if (perp <= Math.SQRT2 * RAY_SEC / 2 + TOL && tProj >= -0.03 && tProj <= tc + OVER + 0.03) return true;
                if (Math.abs(ym - k) <= Math.SQRT2 * RAY_SEC / 2 + TOL && xm >= postFace - 0.03 && xm <= P[0] + 0.03) return true;
            }
            return false;
        };
        let post = 0, beam = 0, none = 0;
        for (const v of verts) {
            const [xm, ym] = toMath(v);
            if (isRayVert(xm, ym)) continue;
            const inPost = Math.abs(v[0] - POST_X) <= POST_SEC / 2 + TOL && v[1] >= 0.12 - TOL && v[1] <= POST_TOP + TOL && Math.abs(v[2]) <= POST_SEC / 2 + TOL;
            const inBeam = v[0] >= POST_X - TOL && v[0] <= POST_X + 2 * BEAM_HALF + TOL && Math.abs(v[1] - BEAM_Y) <= BEAM_SEC_T / 2 + TOL && Math.abs(v[2]) <= BEAM_SEC_D / 2 + TOL;
            if (inPost) post++;
            else if (inBeam) beam++;
            else none++;
        }
        check("D6 post+beam law", none === 0 && post >= 20 && beam >= 8,
            `post ${post} (0.12->${POST_TOP}), beam ${beam} (seats post top, spans to the arc's rim centre; west end-face embeds the post by design — post-first classification absorbs it, east end-face is beam-pure), unclassified ${none} after ray exclusion — the incident boxes issue from the post's face plane by design`);
    }
}

// ---- D7 cusp + bead law -----------------------------------------------------------------------------------
{
    if (!glowNode) { check("D7 cusp+bead law", false, "glow_ns_1 absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
        for (const v of verts) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
        const cusp = neph(0);
        const ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
        const r = (mx[0] - mn[0]) / 2;
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? null;
        check("D7 cusp+bead law",
            Math.hypot(ctr[0] - cusp[0], ctr[1] - (YC + cusp[1]), ctr[2] - BEAD_Z) < 0.002 && Math.abs(r - BEAD_R) < 0.002 && !!emissive,
            `center (${ctr.map(x => x.toFixed(3)).join(",")}) == world cusp (${cusp[0].toFixed(3)}, ${(YC + cusp[1]).toFixed(3)}, ${BEAD_Z}) half-embedded front face, r ${r.toFixed(4)}, emissive ${emissive ? JSON.stringify(emissive) : "MISSING"}`);
    }
}

// ---- D8 rim-share law --------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D8 rim-share law", false, "ns_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const rims = [[0, R], [0, -R]] as Array<[number, number]>;
        const counts = rims.map(([rx, ry]) =>
            verts.filter(v => { const [xm, ym] = toMath(v); return Math.hypot(xm - rx, ym - ry) <= 0.16; }).length);
        check("D8 rim-share law", counts.every(c => c >= 8),
            `nephroid rim endpoints == cup rim ends (0, ±R): ${counts.join("/")} stone verts at each shared rim (arc voussoir end + ribbon end coincide)`);
    }
}

// ---- D9 envelope == probe contract -------------------------------------------------------------------------
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

// ---- D10 named texMats (struct-38 law) ----------------------------------------------------------------------
{
    const mats = meshNodes.map(({ n }: any) => matNameOf(n)).sort();
    check("D10 named texMats", mats.includes("ns_stone") && mats.includes("ns_iron") && !mats.includes("?"),
        `materials [${mats.join(", ")}]`);
}

console.log(fails.length === 0 ? "ALL CHECKS PASS" : `${fails.length} CHECK(S) FAILED: ${fails.join("; ")}`);
if (fails.length) process.exit(1);
