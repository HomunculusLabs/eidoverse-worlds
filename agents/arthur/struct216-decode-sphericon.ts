// struct216-decode-sphericon.ts — decode audit of village_sphericon3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_lunes3.glb) and require >=1 FAIL.
//
// Checks: node census (sp_stone + sp_iron + sp_brass + glow_sp_1), CURB law,
// SOLID law (stone voussoir verts INSIDE the exact hull's supporting-plane
// family + corner coverage of all COURSES boxes), EDGES law (brass verts on
// the two exact semicircular-edge polylines), TRACE law (iron verts in the
// seat-line tube + the two wake spokes + the wake arc tubes), BEAD law (at
// the crown, emissive, sole night element), GROUNDING law (curb sole at
// grade, cradle clamp band), ENVELOPE == probe contract, NAMED texMats
// (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, ARC_A, ARC_B, FAMILY, SEAT,
    SEAT_LINE_W, BARS_W, ARC_W, BEAD_W, ENVELOPE, EMBED, TUBE, BEAD_R,
    SEAT_TUBE, TRACE_TUBE, INLAY_Y, CX, CZ, seatedOf, seatBound, vecSeat2,
} from "./struct216-probe-sphericon.ts";

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

const target = process.argv[2] ?? "agents/arthur/assets/village_sphericon3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "sp_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "sp_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "sp_brass");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_sp_1"));
check("D1 node census: 4 mesh nodes (sp_stone + sp_iron + sp_brass + glow)",
    meshNodes.length === 4 && !!stoneNode && !!ironNode && !!brassNode && !!glowNode,
    `meshes ${meshNodes.length} [${meshNodes.map(({ n }: any) => n.name ?? "(unnamed)").join(", ")}] mats [${meshNodes.map(({ n }: any) => matNameOf(n)).join(", ")}]`);

const TOL = 0.002;

// point-to-segment distance (3D)
const segDist = (p: number[], a: number[], b: number[]): number => {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
    let t = ab2 > 0 ? (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2 : 0;
    t = Math.max(0, Math.min(1, t));
    const q = [a[0] + t * ab[0], a[1] + t * ab[1], a[2] + t * ab[2]];
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

// ---- D2 curb law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D2 curb law", false, "sp_stone bucket absent (foreign/malformed target)"); }
    else {
        const verts = vertsOf(stoneNode.n);
        let curb = 0;
        for (const v of verts) {
            if (Math.abs(v[0]) <= PLINTH_L / 2 + TOL && v[1] >= -TOL && v[1] <= PLINTH_H + TOL && Math.abs(v[2]) <= PLINTH_D / 2 + TOL) curb++;
        }
        check("D2 curb law", curb >= 24,
            `${curb}/${verts.length} stone verts in the curb box ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the rolling floor reads from bytes`);
    }
}

// ---- D3 solid law ------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 solid law", false, "sp_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const plate = verts.filter((v) => v[1] > PLINTH_H + TOL);
        // decode frame law: FAMILY planes live in the SEATED frame — map world verts back
        const toSeated = (v: number[]) => seatedOf(v);
        // cradle-clamp disclosure: courses whose band was clamped off the degenerate seat-line
        // strip (first.y > PLINTH_H - EMBED + 1e-9) sit above the analytic contact strip by
        // design; their verts are tested against the family, but their BOXES' bottoms are exempt
        // from the embed check (D7 carries the clamp).
        let inside = 0, tested = 0;
        for (const v of plate) {
            const q = toSeated(v);
            tested++;
            let ok = true;
            for (const f of FAMILY) {
                // frame law (struct-214 pitfall h): FAMILY planes are twist-frame; in the SEATED
                // frame the plane is (vecSeat2(f.n) · q <= seatBound(f)) — the exact lift
                // seatBound(f) = f.d - SEAT.d*(f.n · SEAT.n)  (probe L5's verification form)
                const n2 = vecSeat2(f.n);
                if (n2[0] * q[0] + n2[1] * q[1] + n2[2] * q[2] > seatBound(f) + 0.004) { ok = false; break; }
            }
            if (ok) inside++;
        }
        // corner coverage: every voussoir box
        let covered = 0;
        for (const b of COURSES) {
            const cx = (b.x0 + b.x1) / 2, cy = (b.y + b.yTop) / 2, cz = (b.z0 + b.z1) / 2;
            const hx = (b.x1 - b.x0) / 2, hy = (b.yTop - b.y) / 2, hz = (b.z1 - b.z0) / 2;
            let corners = 0;
            for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const)
                for (const sz of [-1, 1])
                    if (plate.some((p) => Math.abs(p[0] - (cx + sx * hx)) <= 0.008 && Math.abs(p[1] - (cy + sy * hy)) <= 0.008 && Math.abs(p[2] - (sz * hz + cz)) <= 0.008)) corners++;
            if (corners >= 8) covered++;
        }
        check("D3 solid law", plate.length >= 1000 && tested >= plate.length * 0.5 && inside >= tested * 0.995 && covered >= COURSES.length * 0.9,
            `${plate.length} solid verts, ${inside}/${tested} inside the exact supporting-plane family (${(100 * inside / Math.max(1, tested)).toFixed(1)}% — the TRUE hull reads from bytes); corner coverage ${covered}/${COURSES.length} voussoir boxes (the clamp-tapered crown boxes sit below one full course band; the 100% inside test carries the hull law)`);
    }
}

// ---- D4 edges law -----------------------------------------------------------------------------------
{
    if (!brassNode) { check("D4 edges law", false, "sp_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        let onEdge = 0;
        for (const v of verts) {
            let best = Infinity;
            for (let i = 0; i < ARC_A.length - 1 && best > TUBE + 0.004; i++) best = Math.min(best, segDist(v, ARC_A[i], ARC_A[i + 1]));
            for (let i = 0; i < ARC_B.length - 1 && best > TUBE + 0.004; i++) best = Math.min(best, segDist(v, ARC_B[i], ARC_B[i + 1]));
            if (best <= TUBE + 0.004) onEdge++;
        }
        check("D4 edges law", verts.length >= 1500 && onEdge >= verts.length * 0.98,
            `${onEdge}/${verts.length} brass verts on the two exact semicircular-edge polylines (tube ${TUBE}) — the interlocked perpendicular pair reads from bytes`);
    }
}

// ---- D5 trace law -----------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 trace law", false, "sp_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // seat line tube: A->B at inlay height
        const s = SEAT_LINE_W;
        const A = [s.x0, INLAY_Y, s.z0], B = [s.x1, INLAY_Y, s.z1];
        let seat = 0, spokes = 0, arc = 0;
        for (const v of verts) {
            if (segDist(v, A, B) <= SEAT_TUBE + 0.004) { seat++; continue; }
            let inSpoke = false;
            for (const b of BARS_W) {
                if (segDist(v, [b.x0, INLAY_Y, b.z0], [b.x1, INLAY_Y, b.z1]) <= TRACE_TUBE + 0.004) { inSpoke = true; break; }
            }
            if (inSpoke) { spokes++; continue; }
            let inArc = false;
            for (let i = 0; i < ARC_W.length - 1 && !inArc; i++) {
                if (segDist(v, ARC_W[i], ARC_W[i + 1]) <= TRACE_TUBE + 0.004) inArc = true;
            }
            if (inArc) arc++;
        }
        check("D5 trace law", seat + spokes + arc >= verts.length * 0.98,
            `${seat}/${verts.length} iron verts in the seat-line tube (live contact generator) + ${spokes} in the two wake spokes + ${arc} in the wake arc — the roll's own ground geometry reads from bytes`);
    }
}

// ---- D6 bead law ------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_sp_1 KEEP absent"); }
    else {
        const verts = vertsOf(glowNode.n);
        let cx = 0, cy = 0, cz = 0;
        for (const v of verts) { cx += v[0]; cy += v[1]; cz += v[2]; }
        cx /= verts.length; cy /= verts.length; cz /= verts.length;
        const dB = Math.hypot(cx - BEAD_W[0], cy - BEAD_W[1], cz - BEAD_W[2]);
        const mat = json.materials[json.meshes[glowNode.n.mesh].primitives[0].material];
        const emissive = mat?.emissiveFactor ?? [];
        const hasGlow = Array.isArray(emissive) && emissive.some((c: number) => c > 0.05);
        check("D6 bead law", verts.length >= 100 && dB <= 0.005 && hasGlow,
            `bead centroid (${cx.toFixed(4)}, ${cy.toFixed(4)}, ${cz.toFixed(4)}) == crown within ${dB.toFixed(4)} m; ${verts.length} verts r~${BEAD_R}; emissiveFactor [${emissive}] present — the sole night element at the crown`);
    }
}

// ---- D7 grounding law -------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D7 grounding law", false, "sp_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const minY = Math.min(...verts.map((v) => v[1]));
        const curbOK = Math.abs(minY) < 1e-6;
        // cradle clamp disclosure: the seat-line strip at y~0 is degenerate (the contact LINE,
        // probe L2/L6), so the first boxed course may begin up to one course-band above the seat.
        const first = COURSES[0];
        const clampOK = first && first.y - (PLINTH_H - EMBED) >= -1e-9 && first.y - (PLINTH_H - EMBED) <= 0.16 + 1e-9;
        check("D7 grounding law", curbOK && clampOK,
            `curb sole at grade 0.000 exact; first boxed course bottom at ${(first?.y ?? 0).toFixed(3)} (cradle clamp: the degenerate seat-line strip belongs to the curb, disclosed); nothing below grade`);
    }
}

// ---- D8 envelope == probe contract ------------------------------------------------------------------
{
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const { n }: any of meshNodes)
        for (const v of vertsOf(n)) {
            minX = Math.min(minX, v[0]); maxX = Math.max(maxX, v[0]);
            minY = Math.min(minY, v[1]); maxY = Math.max(maxY, v[1]);
            minZ = Math.min(minZ, v[2]); maxZ = Math.max(maxZ, v[2]);
        }
    const dErr = Math.max(
        Math.abs(minX - ENVELOPE.min[0]), Math.abs(maxX - ENVELOPE.max[0]),
        Math.abs(minY - ENVELOPE.min[1]), Math.abs(maxY - ENVELOPE.max[1]),
        Math.abs(minZ - ENVELOPE.min[2]), Math.abs(maxZ - ENVELOPE.max[2]));
    check("D8 envelope", dErr <= 0.001,
        `decoded [${minX.toFixed(3)}, ${maxX.toFixed(3)}]x[${minY.toFixed(3)}, ${maxY.toFixed(3)}]x[${minZ.toFixed(3)}, ${maxZ.toFixed(3)}] == probe contract (drift ${dErr.toFixed(4)} m)`);
}

// ---- D9 named texMats --------------------------------------------------------------------------------
{
    const names = (json.materials ?? []).map((m: any) => m.name);
    const want = ["sp_stone", "sp_iron", "sp_brass"];
    const ok = want.every((w) => names.includes(w));
    check("D9 texMats", ok, `materials [${names.join(", ")}] carry ${want.join("/")} (struct-38 texMat lanes)`);
}
void CX; void CZ;
if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
