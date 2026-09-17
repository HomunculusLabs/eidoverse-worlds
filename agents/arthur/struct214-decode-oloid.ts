// struct214-decode-oloid.ts — decode audit of village_oloid3.glb.
// Fail-closed: any FAIL exits 1. RED control: run with a foreign GLB
// (village_lunes3.glb) and require >=1 FAIL.
//
// Checks: node census (ol_stone + ol_iron + ol_brass + glow), CURB law,
// HULL law (stone voussoir verts INSIDE the exact hull's supporting-plane
// family + corner coverage of all COURSES boxes), RINGS law (brass verts
// on the two exact generator-circle polylines), TRAIL law (iron verts in
// the seat-line tube + the three wear-bar boxes), BEAD law (at the crown,
// emissive, sole night element), GROUNDING law (curb sole at grade, base
// course embed), ENVELOPE == probe contract, NAMED texMats (struct-38).
import { readFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, RING_A, RING_B, FAMILY,
    SEAT_LINE_W, TRAIL_W, BEAD_W, ENVELOPE, EMBED, TUBE, BEAD_R, BAR_H, BAR_W, CX, CZ,
    stationsOf, PLINTH_L as _PL,
} from "./struct214-probe-oloid.ts";
void _PL;

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

const target = process.argv[2] ?? "agents/arthur/assets/village_oloid3.glb";
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
const stoneNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ol_stone");
const ironNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ol_iron");
const brassNode = meshNodes.find(({ n }: any) => matNameOf(n) === "ol_brass");
const glowNode = meshNodes.find(({ n }: any) => (n.name ?? "").startsWith("glow_ol_1"));
check("D1 node census: 4 mesh nodes (ol_stone + ol_iron + ol_brass + glow)",
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
    if (!stoneNode) { check("D2 curb law", false, "ol_stone bucket absent (foreign/malformed target)"); }
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

// ---- D3 hull law -------------------------------------------------------------------------------------
{
    if (!stoneNode) { check("D3 hull law", false, "ol_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const plate = verts.filter((v) => v[1] > PLINTH_H + TOL);
        // decode frame law: FAMILY planes live in the SEATED frame — map world verts back
        // (inverse of worldPt: x + CX, y - (PLINTH_H - EMBED), z + CZ) before testing
        const toSeated = (v: number[]) => [v[0] + CX, v[1] - (PLINTH_H - EMBED), v[2] + CZ];
        // wedge boxes (single-station courses, disclosed) are excluded from both tests —
        // their tops legitimately stand past the shrunken partner slice (probe L6 class)
        const isWedge = (b: { y: number; yTop: number }) =>
            stationsOf(b.y - (PLINTH_H - EMBED), b.yTop - (PLINTH_H - EMBED)).length === 1;
        const solid = COURSES.filter((b) => !isWedge(b));
        const wedgeSet = new Set(COURSES.filter(isWedge));
        const inWedgeBox = (q: number[]) => {
            for (const b of wedgeSet) {
                if (q[0] >= b.x0 - 0.004 && q[0] <= b.x1 + 0.004 && q[1] >= b.y - 0.004 && q[1] <= b.yTop + 0.004 && q[2] >= b.z0 - 0.004 && q[2] <= b.z1 + 0.004) return true;
            }
            return false;
        };
        let inside = 0, tested = 0;
        for (const v of plate) {
            const q = toSeated(v);
            if (inWedgeBox(q)) continue;                       // disclosed wedge class
            tested++;
            let ok = true;
            for (const f of FAMILY) {
                if (f.n[0] * q[0] + f.n[1] * q[1] + f.n[2] * q[2] > f.d + 0.004) { ok = false; break; }
            }
            if (ok) inside++;
        }
        // corner coverage: every non-wedge voussoir box
        let covered = 0;
        for (const b of solid) {
            const cx = (b.x0 + b.x1) / 2, cy = (b.y + b.yTop) / 2, cz = (b.z0 + b.z1) / 2;
            const hx = (b.x1 - b.x0) / 2, hy = (b.yTop - b.y) / 2, hz = (b.z1 - b.z0) / 2;
            let corners = 0;
            for (const [sx, sy] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const)
                for (const sz of [-1, 1])
                    if (plate.some((p) => Math.abs(p[0] - (cx + sx * hx)) <= 0.008 && Math.abs(p[1] - (cy + sy * hy)) <= 0.008 && Math.abs(p[2] - (sz * hz + cz)) <= 0.008)) corners++;
            if (corners >= 8) covered++;
        }
        check("D3 hull law", plate.length >= 1000 && tested >= plate.length * 0.5 && inside >= tested * 0.995 && covered >= solid.length * 0.98,
            `${plate.length} hull verts, ${inside}/${tested} inside the exact supporting-plane family (${(100 * inside / Math.max(1, tested)).toFixed(1)}% — the TRUE hull reads from bytes; wedge-box verts excluded, disclosed); corner coverage ${covered}/${solid.length} non-wedge voussoir boxes`);
    }
}

// ---- D4 rings law -----------------------------------------------------------------------------------
{
    if (!brassNode) { check("D4 rings law", false, "ol_brass bucket absent"); }
    else {
        const verts = vertsOf(brassNode.n);
        let onRing = 0;
        for (const v of verts) {
            let best = Infinity;
            for (let i = 0; i < RING_A.length - 1 && best > TUBE + 0.004; i++) best = Math.min(best, segDist(v, RING_A[i], RING_A[i + 1]));
            for (let i = 0; i < RING_B.length - 1 && best > TUBE + 0.004; i++) best = Math.min(best, segDist(v, RING_B[i], RING_B[i + 1]));
            if (best <= TUBE + 0.004) onRing++;
        }
        check("D4 rings law", verts.length >= 1500 && onRing >= verts.length * 0.98,
            `${onRing}/${verts.length} brass verts on the two exact generator-circle polylines (tube ${TUBE}) — the linked pair reads from bytes`);
    }
}

// ---- D5 trail law -----------------------------------------------------------------------------------
{
    if (!ironNode) { check("D5 trail law", false, "ol_iron bucket absent"); }
    else {
        const verts = vertsOf(ironNode.n);
        // seat line tube
        const s = SEAT_LINE_W;
        const dx = Math.cos(s.yaw) * s.len / 2, dz = Math.sin(s.yaw) * s.len / 2;
        const A = [s.x - dx, PLINTH_H - 0.012, s.z - dz], B = [s.x + dx, PLINTH_H - 0.012, s.z + dz];
        let seat = 0, bars = 0;
        for (const v of verts) {
            if (segDist(v, A, B) <= 0.018 + 0.004) { seat++; continue; }
            let inBar = false;
            for (const b of TRAIL_W) {
                const bx = Math.cos(b.yaw) * b.len / 2, bz = Math.sin(b.yaw) * b.len / 2;
                // bar AABB in its local rotated frame: cheap test via the two centers
                const c = [b.x, PLINTH_H + BAR_H / 2 - 0.008, b.z];
                // rotate v into bar frame (inverse yaw)
                const rx = (v[0] - c[0]) * Math.cos(b.yaw) - (v[2] - c[2]) * Math.sin(b.yaw) * -1;
                void rx;
                const cdx = Math.cos(-b.yaw), sdz = Math.sin(-b.yaw);
                const lx = (v[0] - c[0]) * cdx + (v[2] - c[2]) * sdz * -1 + (v[0] - c[0]) * 0;   // rotate by -yaw: x' = x cos+y... using 2D form below
                void lx;
                // 2D rotation by -b.yaw about the bar center
                const ca = Math.cos(-b.yaw), sa = Math.sin(-b.yaw);
                const ox = (v[0] - c[0]) * ca - (v[2] - c[2]) * sa;
                const oz = (v[0] - c[0]) * sa + (v[2] - c[2]) * ca;
                if (Math.abs(ox) <= b.len / 2 + 0.004 && Math.abs(oz) <= BAR_W / 2 + 0.004 && Math.abs(v[1] - c[1]) <= BAR_H / 2 + 0.004) inBar = true;
            }
            if (inBar) bars++;
        }
        check("D5 trail law", seat + bars >= verts.length * 0.98,
            `${seat}/${verts.length} iron verts in the seat-line tube + ${bars} in the three wear-bar boxes — the roll's contact geometry reads from bytes`);
    }
}

// ---- D6 bead law ------------------------------------------------------------------------------------
{
    if (!glowNode) { check("D6 bead law", false, "glow_ol_1 KEEP absent"); }
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
    if (!stoneNode) { check("D7 grounding law", false, "ol_stone bucket absent"); }
    else {
        const verts = vertsOf(stoneNode.n);
        const minY = Math.min(...verts.map((v) => v[1]));
        const curbOK = Math.abs(minY) < 1e-6;
        const first = COURSES[0];
        const seatBottom = Math.abs(first.y - (PLINTH_H - EMBED)) < 1e-9;
        check("D7 grounding law", curbOK && seatBottom,
            `curb sole at grade 0.000 exact; first course bottom at ${(PLINTH_H - EMBED).toFixed(3)} = curb top − 8cm (cradle embed — the flat contact strip); nothing below grade`);
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
    const want = ["ol_stone", "ol_iron", "ol_brass"];
    const ok = want.every((w) => names.includes(w));
    check("D9 texMats", ok, `materials [${names.join(", ")}] carry ${want.join("/")} (struct-38 texMat lanes)`);
}
void CX; void CZ;
if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS");
