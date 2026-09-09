// struct128-decode-peaucellier.ts — decode audit of village_peaucellier3.glb
// (struct-128 build tick, R10-20). Verifies from BYTES via an INDEPENDENT
// replica (no mk imports — struct-119/122/124 law pattern):
//   (a) pinned sha; node census 4 (3 texMat buckets peau_stone/peau_iron/
//       peau_line + 1 KEEP glow_pc_1); brass emissive exported;
//   (b) LINKAGE LAW: every iron vertex within 3mm of a replica primitive —
//       one of the 7 machine bars (re-derived joints), a joint boss sphere,
//       the crank-circle torus, or a rail stand;
//   (c) COVERAGE LAW: probes along every bar, every boss, the crank circle
//       and the rail each find a byte vertex within radius+2mm (no gaps);
//   (d) STRAIGHT-LINE LAW from bytes: the peau_line bucket IS a horizontal
//       rail at y=LINE_Y spanning past the web both sides, carrying P;
//   (e) INVERSION LAW (re-derived independently): replica joints satisfy
//       |OU|=|OV|=L, |UB|=|VB|=|UP|=|VP|=ell, |AB|=R, |OB|*|OP|=k^2 exact,
//       P.y = LINE_Y — the sculpture's joints ARE the machine's joints;
//   (f) GLOW LAW: exactly 1 KEEP glow node at P (the tracer point), emissive
//       0x9a7030 @0.85 linear;
//   (g) STONE LAW: plinth on grade; tower behind the machine plane; envelope
//       7.00x4.20x1.05; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_peaucellier3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const BIN = 20 + jl + 8;
const va = (ai: number): Float32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[i * 3] = bytes.readFloatLE(off + i * 12);
        out[i * 3 + 1] = bytes.readFloatLE(off + i * 12 + 4);
        out[i * 3 + 2] = bytes.readFloatLE(off + i * 12 + 8);
    }
    return out;
};

// ---- independent replica (re-derived fresh; NO mk imports) --------------------------------
const D = 1.829, R = D, L = 3.422, ell = 2.478;
const k2 = L * L - ell * ell;
const O: [number, number] = [0, 3.95], A: [number, number] = [0, O[1] - D];
const LINE_Y = O[1] - k2 / (2 * R);
const THETA = ((55 - 90) * Math.PI) / 180;   // from the DOWNWARD vertical (plan convention)
const B: [number, number] = [A[0] + R * Math.cos(THETA), A[1] + R * Math.sin(THETA)];
const inv = (): [number, number] => {
    const dB = [B[0] - O[0], B[1] - O[1]], m = Math.hypot(dB[0], dB[1]);
    const s = k2 / (m * m);
    return [O[0] + dB[0] * s, O[1] + dB[1] * s];
};
const P = inv();
const Nm: [number, number] = [(B[0] + P[0]) / 2, (B[1] + P[1]) / 2];
const chord = Math.hypot(P[0] - B[0], P[1] - B[1]);
const h = Math.sqrt(ell * ell - (chord / 2) ** 2);
const dirlen = Math.hypot(P[0] - B[0], P[1] - B[1]);
const dir: [number, number] = [(P[0] - B[0]) / dirlen, (P[1] - B[1]) / dirlen];
const perp: [number, number] = [-dir[1], dir[0]];
const U: [number, number] = [Nm[0] + perp[0] * h, Nm[1] + perp[1] * h];
const V: [number, number] = [Nm[0] - perp[0] * h, Nm[1] - perp[1] * h];
const BR = 0.055, JR = 0.085, ARC_Z = -0.06, ARC_T = 0.022, RAIL_R = 0.055;
const RAIL_L = 7.0, RAIL_X0 = -2.2, RAIL_X1 = RAIL_X0 + RAIL_L;
const TOWER_X = -1.6, TOWER_Z = -0.45, TOWER_RT = 0.32, TOP = O[1] + 0.25;
const PLINTH_H = 0.14, STAND_X = [-2.0, 3.85], STAND_R = 0.045;
const BARS: Array<[string, [number, number], [number, number], number]> = [
    ["kite O-U", O, U, L], ["kite O-V", O, V, L],
    ["rhom U-B", U, B, ell], ["rhom V-B", V, B, ell],
    ["rhom U-P", U, P, ell], ["rhom V-P", V, P, ell],
    ["crank A-B", A, B, R],
];

// ---- (a) sha + nodes + materials ----------------------------------------------------------
ck("pinned sha (re-pin after stand fix)", sha === "f66494fa3ffb9ff8445194b11e512d18b412f5c958a4a13fb138fcabe4cdb34e", sha.slice(0, 16));
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 4", meshNodes.length === 4, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_pc_1");
ck("KEEP glow_pc_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes peau_stone+peau_iron+peau_line", matNames.includes("peau_stone") && matNames.includes("peau_iron") && matNames.includes("peau_line"), matNames.join(","));
const glowMat = j.materials.find((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
{ // glTF stores emissiveFactor in LINEAR space: linear(0x9a7030) * 0.85 intensity
    const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const want = [0x9a, 0x70, 0x30].map(c => lin(c) * 0.85);
    const ok = !!glowMat && want.every((w, i) => Math.abs((glowMat.emissiveFactor ?? [9, 9, 9])[i] - w) < 0.01);
    ck("brass emissive exported (linear x0.85)", ok, glowMat ? `factor [${glowMat.emissiveFactor.map((v: number) => v.toFixed(3)).join(",")}] vs [${want.map(w => w.toFixed(3)).join(",")}]` : "none");
}

// ---- gather clouds by material name (APPLY node translation — pitfall 4) --------------------
function cloudOf(node: any): Float32Array {
    const base = va(j.meshes[node.mesh].primitives[0].attributes.POSITION);
    const t = node.translation ?? [0, 0, 0];
    for (let i = 0; i < base.length; i += 3) { base[i] += t[0]; base[i + 1] += t[1]; base[i + 2] += t[2]; }
    return base;
}
function bucketCloud(name: string): Float32Array {
    for (const n of meshNodes) {
        if (n === glowNode) continue;
        const mi = j.meshes[n.mesh].primitives[0].material;
        if ((j.materials[mi].name ?? "") === name) return cloudOf(n);
    }
    throw Error(`no bucket ${name}`);
}
const ironCloud = bucketCloud("peau_iron"), stoneCloud = bucketCloud("peau_stone"), lineCloud = bucketCloud("peau_line");
ck("iron+stone+line buckets identified", !!ironCloud && !!stoneCloud && !!lineCloud,
    `${ironCloud.length / 3}/${stoneCloud.length / 3}/${lineCloud.length / 3} verts`);

// ---- (b) linkage law: every iron vertex on a replica primitive -----------------------------
const segDist3 = (px: number, py: number, pz: number, a: [number, number, number], b: [number, number, number]): number => {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * abx + (py - a[1]) * aby + (pz - a[2]) * abz) / (abx * abx + aby * aby + abz * abz)));
    return Math.hypot(px - (a[0] + t * abx), py - (a[1] + t * aby), pz - (a[2] + t * abz));
};
{
    let unexplained = 0; const badList: string[] = [];
    for (let i = 0; i < ironCloud.length; i += 3) {
        const x = ironCloud[i], y = ironCloud[i + 1], z = ironCloud[i + 2];
        let ok = false;
        // 7 machine bars (cylinders in the z=0 plane)
        for (const [, p, q] of BARS) { if (segDist3(x, y, z, [p[0], p[1], 0], [q[0], q[1], 0]) <= BR + 0.003) { ok = true; break; } }
        // joint boss spheres at O, A, B, U, V
        if (!ok) for (const jp of [O, A, B, U, V]) { if (Math.hypot(x - jp[0], y - jp[1], z) <= JR + 0.003) { ok = true; break; } }
        // crank circle torus (front layer z=-0.06)
        if (!ok && Math.abs(Math.hypot(x - A[0], y - A[1]) - R) <= ARC_T + 0.003 && Math.abs(z - ARC_Z) <= ARC_T + 0.003) ok = true;
        // rail stands
        if (!ok) for (const sx of STAND_X) {
            if (Math.hypot(x - sx, z) <= STAND_R + 0.003 && y >= PLINTH_H - 0.003 && y <= LINE_Y - RAIL_R + 0.003) { ok = true; break; }
        }
        if (!ok) { unexplained++; if (badList.length < 3) badList.push(`(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)})`); }
    }
    ck("linkage law: every iron vertex on a replica primitive", unexplained === 0, `${ironCloud.length / 3} verts, ${unexplained} unexplained ${badList.join(" ")}`);
}

// ---- (c) coverage law: every designed member carries byte vertices -------------------------
{
    // NOTE: CylinderGeometry(heightSegments=1) carries only end-ring + cap verts —
    // probe member ENDS only (rail/stand mid-shaft has no verts by construction).
    // Arc probes use MESH ring angles (multiples of 2π/96) so each probe lands on
    // a tube cross-section. Cloud routing is EXPLICIT per group (BR == RAIL_R
    // makes value-based routing ambiguous — P-end probes misrouted to lineCloud).
    const probes: Array<[number, number, number, number, Float32Array]> = []; // x,y,z,maxDist,cloud
    const IC = ironCloud, LC = lineCloud;
    for (const [, p, q] of BARS) for (const e of [p, q]) probes.push([e[0], e[1], 0, BR + 0.002, IC]);
    for (const jp of [O, A, B, U, V]) probes.push([jp[0], jp[1], 0, JR + 0.002, IC]);
    for (let k = 0; k < 12; k++) { const phi = (k / 12) * Math.PI * 2; probes.push([A[0] + R * Math.cos(phi), A[1] + R * Math.sin(phi), ARC_Z, ARC_T + 0.002, IC]); }
    for (const sx of STAND_X) for (const ey of [PLINTH_H, LINE_Y - RAIL_R]) probes.push([sx, ey, 0, STAND_R + 0.002, IC]);
    for (const ex of [RAIL_X0, RAIL_X1]) probes.push([ex, LINE_Y, 0, RAIL_R + 0.002, LC]);
    const near = (cloud: Float32Array, px: number, py: number, pz: number, md: number) => {
        for (let i = 0; i < cloud.length; i += 3) if (Math.hypot(cloud[i] - px, cloud[i + 1] - py, cloud[i + 2] - pz) <= md) return true;
        return false;
    };
    let miss = 0; const missed: string[] = [];
    for (const [px, py, pz, md, cloud] of probes) {
        if (!near(cloud, px, py, pz, md)) { miss++; if (missed.length < 3) missed.push(`(${px.toFixed(2)},${py.toFixed(2)},${pz.toFixed(2)})`); }
    }
    ck("coverage law: all members carry byte vertices", miss === 0, `${probes.length} probes, ${miss} missed ${missed.join(" ")}`);
}

// ---- (d) straight-line law from bytes: the peau_line rail ----------------------------------
{
    let ymin = 1e9, ymax = -1e9, xmin = 1e9, xmax = -1e9, zmax = 0;
    for (let i = 0; i < lineCloud.length; i += 3) {
        ymin = Math.min(ymin, lineCloud[i + 1]); ymax = Math.max(ymax, lineCloud[i + 1]);
        xmin = Math.min(xmin, lineCloud[i]); xmax = Math.max(xmax, lineCloud[i]);
        zmax = Math.max(zmax, Math.abs(lineCloud[i + 2]));
    }
    const horiz = Math.abs(ymin - (LINE_Y - RAIL_R)) < 0.003 && Math.abs(ymax - (LINE_Y + RAIL_R)) < 0.003;
    ck("rail IS the traced line (y=LINE_Y horizontal)", horiz, `y[${ymin.toFixed(3)}..${ymax.toFixed(3)}] vs ${LINE_Y.toFixed(3)}±${RAIL_R}`);
    ck("rail spans the full designed reach", Math.abs(xmin - RAIL_X0) < 0.005 && Math.abs(xmax - RAIL_X1) < 0.005, `x[${xmin.toFixed(2)}..${xmax.toFixed(2)}] vs [${RAIL_X0}..${RAIL_X1}]`);
    ck("rail carries P (bead x inside span)", P[0] > xmin + 0.4 && P[0] < xmax - 0.4, `P.x=${P[0].toFixed(3)}`);
    ck("rail outreaches web both sides", xmin < Math.min(U[0], V[0]) - 0.7 && xmax > Math.max(U[0], V[0]) + 0.7, `web x[${Math.min(U[0], V[0]).toFixed(2)}..${Math.max(U[0], V[0]).toFixed(2)}]`);
    ck("rail thin in z (planar line)", zmax <= RAIL_R + 0.003, `|z|max ${zmax.toFixed(3)}`);
}

// ---- (e) inversion law: replica joints ARE the machine's joints -----------------------------
{
    const dd = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const bad: string[] = [];
    if (Math.abs(dd(O, U) - L) > 1e-3) bad.push("|OU|");
    if (Math.abs(dd(O, V) - L) > 1e-3) bad.push("|OV|");
    if (Math.abs(dd(U, B) - ell) > 1e-3) bad.push("|UB|");
    if (Math.abs(dd(V, B) - ell) > 1e-3) bad.push("|VB|");
    if (Math.abs(dd(U, P) - ell) > 1e-3) bad.push("|UP|");
    if (Math.abs(dd(V, P) - ell) > 1e-3) bad.push("|VP|");
    if (Math.abs(dd(A, B) - R) > 1e-3) bad.push("|AB|");
    if (Math.abs(dd(O, B) * dd(O, P) - k2) > 1e-3) bad.push("|OB||OP|=k2");
    if (Math.abs(P[1] - LINE_Y) > 1e-6) bad.push("P.y=LINE_Y");
    ck("inversion law: joints exact (kite+rhombus+crank, |OB||OP|=k2, P on line)", bad.length === 0, bad.join(",") || `B=(${B[0].toFixed(3)},${B[1].toFixed(3)}) P=(${P[0].toFixed(3)},${P[1].toFixed(3)}) U=(${U[0].toFixed(3)},${U[1].toFixed(3)}) V=(${V[0].toFixed(3)},${V[1].toFixed(3)})`);
}

// ---- (f) glow law: the bead at the tracer point ---------------------------------------------
{
    // exact placement = node.translation (vertex centroid is pole-skewed ~4mm)
    const t = (glowNode.translation ?? [9, 9, 9]) as number[];
    const dist = Math.hypot(t[0] - P[0], t[1] - LINE_Y, t[2]);
    ck("glow bead at the tracer point P", dist <= 0.003, `node t (${t[0].toFixed(4)},${t[1].toFixed(4)},${t[2].toFixed(4)}) vs P (${P[0].toFixed(4)},${LINE_Y.toFixed(4)},0), dist ${dist.toExponential(1)}`);
    ck("glow census exactly 1", meshNodes.filter((n: any) => n.name?.startsWith("glow")).length === 1);
}

// ---- (g) stone law + envelope + NaN ---------------------------------------------------------
{
    let ymin = 1e9;
    for (let i = 1; i < stoneCloud.length; i += 3) ymin = Math.min(ymin, stoneCloud[i]);
    ck("stone on grade", Math.abs(ymin) < 0.003, `min y ${ymin.toFixed(3)}`);
    // tower wholly behind the machine plane (rail passes unobstructed)
    let towerMaxZ = -1e9, anyTowerVert = false;
    for (let i = 0; i < stoneCloud.length; i += 3) {
        if (Math.hypot(stoneCloud[i] - TOWER_X, stoneCloud[i + 2] - TOWER_Z) <= TOWER_RT + 0.01 && stoneCloud[i + 1] > 0.3) {
            anyTowerVert = true; towerMaxZ = Math.max(towerMaxZ, stoneCloud[i + 2]);
        }
    }
    ck("tower behind machine plane", anyTowerVert && towerMaxZ < -0.10, `tower max z ${towerMaxZ.toFixed(3)} (machine plane z=0)`);
    let env = { minx: 1e9, maxx: -1e9, miny: 1e9, maxy: -1e9, minz: 1e9, maxz: -1e9 };
    for (const cloud of [ironCloud, stoneCloud, lineCloud, cloudOf(glowNode)]) {
        for (let i = 0; i < cloud.length; i += 3) {
            env.minx = Math.min(env.minx, cloud[i]); env.maxx = Math.max(env.maxx, cloud[i]);
            env.miny = Math.min(env.miny, cloud[i + 1]); env.maxy = Math.max(env.maxy, cloud[i + 1]);
            env.minz = Math.min(env.minz, cloud[i + 2]); env.maxz = Math.max(env.maxz, cloud[i + 2]);
        }
    }
    ck("envelope 7.00x4.20x1.05 y[0..4.20]", Math.abs(env.maxx - env.minx - 7.00) < 0.02 && Math.abs(env.maxy - 4.20) < 0.02 && Math.abs((env.maxz - env.minz) - 1.05) < 0.02,
        `${(env.maxx - env.minx).toFixed(2)}x${(env.maxy - env.miny).toFixed(2)}x${(env.maxz - env.minz).toFixed(2)} y[${env.miny.toFixed(3)}..${env.maxy.toFixed(3)}]`);
    let nan = 0;
    for (const cloud of [ironCloud, stoneCloud, lineCloud, cloudOf(glowNode)]) for (let i = 0; i < cloud.length; i++) if (isNaN(cloud[i])) nan++;
    ck("no NaN vertices", nan === 0);
}

console.log(f === 0 ? "DECODE ALL PASS" : `DECODE FAIL (${f})`);
process.exit(f === 0 ? 0 : 1);
