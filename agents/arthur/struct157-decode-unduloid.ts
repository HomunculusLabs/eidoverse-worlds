// struct157-decode-unduloid.ts — STRUCTURES LANE struct-157 decode audit.
// Independent replica of the Delaunay roulette (NO imports from mk script);
// audits the WRITTEN GLB vertex data against replica math, RED-proven on
// the villarceau GLB (different surface class must FAIL the unduloid
// population law).
// Usage: bun struct157-decode-unduloid.ts <model.glb>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const glbPath = resolve(process.argv[2] ?? "");
if (!glbPath.endsWith(".glb")) throw new Error("arg must be .glb");

// ---- independent replica (same derivation, freshly written) ---------------------------------------
const A = 1, E = 0.55, K = 0.38 / (A * (1 + E)), NP = 7200;
const B = A * Math.sqrt(1 - E * E), C = A * E;
const psi0 = -Math.PI / 2;
const spd = (psi: number) => Math.hypot(A * Math.sin(psi), B * Math.cos(psi));
const s = new Float64Array(NP + 1);
for (let i = 1; i <= NP; i++) {
    const p0 = psi0 + ((i - 1) / NP) * 2 * Math.PI, p1 = psi0 + (i / NP) * 2 * Math.PI;
    s[i] = s[i - 1] + 0.5 * (spd(p0) + spd(p1)) * (p1 - p0);
}
const poly: { x: number; y: number }[] = [];
for (let i = 0; i <= NP; i++) {
    const psi = psi0 + (i / NP) * 2 * Math.PI;
    const Px = A * Math.cos(psi), Py = B * Math.sin(psi);
    const th = -Math.atan2(B * Math.cos(psi), -A * Math.sin(psi));
    const dx = C - Px, dy = -Py;
    poly.push({ x: s[i] + dx * Math.cos(th) - dy * Math.sin(th), y: dx * Math.sin(th) + dy * Math.cos(th) });
}
const PERIOD = s[NP], P_W = PERIOD * K, BULGE_R = 0.38, NECK_R = A * (1 - E) * K;
const BULGE_X = poly.reduce((m, p) => (p.y > m.y ? p : m), poly[0]).x;
const rWorld = (u: number) => {
    let xm = ((BULGE_X + u / K) % PERIOD + PERIOD) % PERIOD;
    if (xm < poly[0].x) xm += PERIOD; // phase-seam law: trace x-range starts at poly[0].x; a mod that lands
    // below it must wrap FORWARD one period (the trace is periodic) — linear extrapolation
    // below poly[0] is garbage (caught live: u=0.35407260 lands PERIOD+1.4e-8 from the seam)
    let lo = 0, hi = poly.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (poly[mid].x <= xm) lo = mid; else hi = mid; }
    const t = (xm - poly[lo].x) / (poly[hi].x - poly[lo].x);
    return (poly[lo].y + t * (poly[hi].y - poly[lo].y)) * K;
};

// ---- read the GLB --------------------------------------------------------------------------------
const buf = readFileSync(glbPath);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("not a glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
const binOff = 20 + jsonLen + 8;
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = "") => {
    if (cond) { pass++; console.log(`PASS ${name}${detail ? " — " + detail : ""}`); }
    else { fail++; console.log(`FAIL ${name}${detail ? " — " + detail : ""}`); }
};

// world matrix per node (decode pitfall 4: merged buckets bake TRS, KEEP nodes carry it)
const nodeWorld: (number[] | null)[] = (json.nodes ?? []).map(() => null);
const matMul = (a: number[], b: number[]): number[] => {
    const o = new Array(16).fill(0);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[4 * r + c] += a[4 * r + k] * b[4 * k + c];
    return o;
};
const localMat = (n: any): number[] => {
    if (n.matrix) return n.matrix;
    const t = n.translation ?? [0, 0, 0];
    const s = n.scale ?? [1, 1, 1];
    const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1];
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    const r = [1 - (yy + zz), xy - wz, xz + wy, xy + wz, 1 - (xx + zz), yz - wx, xz - wy, yz + wx, 1 - (xx + yy)];
    return [
        r[0] * s[0], r[3] * s[0], r[6] * s[0], 0,
        r[1] * s[1], r[4] * s[1], r[7] * s[1], 0,
        r[2] * s[2], r[5] * s[2], r[8] * s[2], 0,
        t[0], t[1], t[2], 1,
    ];
};
const nodeMat = (i: number): number[] => {
    if (nodeWorld[i]) return nodeWorld[i]!;
    const n = json.nodes[i];
    const local = localMat(n);
    // find parent index (O(n^2) fine at this size)
    let p: number | null = null;
    for (let j = 0; j < json.nodes.length; j++) {
        if ((json.nodes[j].children ?? []).includes(i)) { p = j; break; }
    }
    nodeWorld[i] = p === null ? local : matMul(nodeMat(p), local);
    return nodeWorld[i]!;
};

// node census (glTF children are INDICES; iterative walk — probe pitfall 3)
const nodes = json.nodes ?? [];
let meshNodeCount = 0;
const stack = [...(json.scenes?.[0]?.nodes ?? [])];
const seen = new Set<number>();
while (stack.length) {
    const i = stack.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    const n = nodes[i];
    if (n.mesh !== undefined) meshNodeCount++;
    for (const c of n.children ?? []) stack.push(c);
}
ok("node census 4 (2 texMat + water + glow KEEP)", meshNodeCount === 4, `mesh nodes ${meshNodeCount}`);
ok("glow KEEP present", json.nodes.some((n: any) => n.name === "glow_uq_1"));
ok("glow count exactly 1", json.nodes.filter((n: any) => (n.name ?? "").startsWith("glow")).length === 1);

// material census
const matNames = (json.materials ?? []).map((m: any) => m.name);
ok("material lanes uq_stone+uq_brass", matNames.includes("uq_stone") && matNames.includes("uq_brass"), matNames.join(","));

// collect POSITION accessors per mesh node, grouped by material name
const accPos = (accIdx: number) => {
    const acc = json.accessors[accIdx];
    const bv = json.bufferViews[acc.bufferView];
    const off = binOff + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[3 * i] = dv.getFloat32(off + 12 * i, true);
        out[3 * i + 1] = dv.getFloat32(off + 12 * i + 4, true);
        out[3 * i + 2] = dv.getFloat32(off + 12 * i + 8, true);
    }
    return out;
};

// brass chain vertex population law: every brass vertex within 4mm of the replica surface
{
    let brassNodes = 0, brassVerts = 0, worst = 0;
    let bulgePop = 0, neckPop = 0, worstPrinted = 0;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        const mesh = json.meshes[n.mesh];
        for (const prim of mesh.primitives ?? []) {
            const mat = json.materials?.[prim.material]?.name ?? "";
            if (mat !== "uq_brass") continue;
            brassNodes++;
            const raw = accPos(prim.attributes.POSITION);
            const M = nodeMat(nodes.indexOf(n));
            const v = new Float32Array(raw.length);
            for (let i = 0; i < raw.length; i += 3) {
                const x = raw[i], y = raw[i + 1], z = raw[i + 2];
                v[i] = M[0] * x + M[4] * y + M[8] * z + M[12];
                v[i + 1] = M[1] * x + M[5] * y + M[9] * z + M[13];
                v[i + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
            }
            for (let i = 0; i < v.length; i += 3) {
                const x = v[i], y = v[i + 1], z = v[i + 2];
                brassVerts++;
                const u = -x;                     // lathe y-axis flips under rot.z=pi/2: mesh x = -u
                const rad = Math.hypot(y - 0.87, z); // chain center height LIFT=0.87
                const resid = Math.abs(rad - rWorld(u));
                worst = Math.max(worst, resid);
                if (resid > 0.004 && worstPrinted < 3) { fail++; console.log(`FAIL brass resid ${resid.toFixed(4)} at (${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}) u=${u.toFixed(5)} rad=${rad.toFixed(5)} rWorld=${rWorld(u).toFixed(5)}`); worstPrinted++; }
                if (rad > BULGE_R - 0.005) bulgePop++;
                if (rad < NECK_R + 0.005) neckPop++;
            }
        }
    }
    ok("brass chain on-surface (worst resid <= 4mm)", worst <= 0.004, `worst ${worst.toFixed(5)}m over ${brassVerts} verts / ${brassNodes} prims`);
    ok("bulge population > 60 verts", bulgePop > 60, `${bulgePop}`);
    ok("neck population > 60 verts", neckPop > 60, `${neckPop}`);
    if (brassVerts === 0) fail++, console.log("FAIL no brass vertices found");
}

// bead position law: glow at (0, 0.43, 0), r 0.10 — transform through node world matrix
{
    const ni = nodes.findIndex((n: any) => n.name === "glow_uq_1");
    const M = nodeMat(ni);
    const v = accPos(json.meshes[nodes[ni].mesh].primitives[0].attributes.POSITION);
    let miny = Infinity, maxy = -Infinity, cx = 0, cz = 0;
    for (let i = 0; i < v.length; i += 3) {
        const x = M[0] * v[i] + M[4] * v[i + 1] + M[8] * v[i + 2] + M[12];
        const y = M[1] * v[i] + M[5] * v[i + 1] + M[9] * v[i + 2] + M[13];
        const z = M[2] * v[i] + M[6] * v[i + 1] + M[10] * v[i + 2] + M[14];
        miny = Math.min(miny, y); maxy = Math.max(maxy, y);
        cx += x; cz += z;
    }
    cx /= v.length / 3; cz /= v.length / 3;
    const r = (maxy - miny) / 2;
    ok("bead at (0,0.43,0) r 0.10", Math.abs(cx) < 0.01 && Math.abs(cz) < 0.01 && Math.abs((miny + maxy) / 2 - 0.43) < 0.01 && Math.abs(r - 0.10) < 0.01,
        `c(${cx.toFixed(3)},${((miny + maxy) / 2).toFixed(3)},${cz.toFixed(3)}) r ${r.toFixed(3)}`);
}

// water law (struct-162 refine): meniscus dome CRESTS the rim — equator at
// rim y=0.20 (rx 1.88 x rz 0.98 inset), apex 0.29 (sagitta 0.09 proud),
// palette blue — identified GEOMETRICALLY (low dome inside the basin, apex
// over origin), color checked COLOR_0 linear. Replaces the v1/v2 flat-disc
// law (the disc sat INSIDE the stone block — survey-312 Sev 2 enclosure).
{
    let found = false;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives ?? []) {
            const M = nodeMat(nodes.indexOf(n));
            const raw = accPos(prim.attributes.POSITION);
            // transform all verts; look for the low dome (apex band 0.27-0.32)
            let miny = Infinity, maxy = -Infinity, maxr = 0, cx = 0, cz = 0, cnt = 0;
            const tx: number[] = [], ty: number[] = [], tz: number[] = [];
            for (let i = 0; i < raw.length; i += 3) {
                const x = M[0] * raw[i] + M[4] * raw[i + 1] + M[8] * raw[i + 2] + M[12];
                const y = M[1] * raw[i] + M[5] * raw[i + 1] + M[9] * raw[i + 2] + M[13];
                const z = M[2] * raw[i] + M[6] * raw[i + 1] + M[10] * raw[i + 2] + M[14];
                tx.push(x); ty.push(y); tz.push(z);
                miny = Math.min(miny, y); maxy = Math.max(maxy, y);
                cx += x; cz += z; cnt++;
            }
            if (maxy > 0.32 || maxy < 0.27 || cnt < 40) continue; // not the meniscus (excludes bead 0.53)
            for (let i = 0; i < cnt; i++) maxr = Math.max(maxr, Math.hypot(tx[i], tz[i]));
            if (maxr < 1.5 || maxr > 2.1) continue;                // not basin-scale
            found = true;
            // color: engine tint lane is COLOR_0 (normalized u8 VEC3, linear) — reedpool precedent
            const cacc = json.accessors[prim.attributes.COLOR_0];
            const cbv = json.bufferViews[cacc.bufferView];
            const coff = binOff + (cbv.byteOffset ?? 0) + (cacc.byteOffset ?? 0);
            const c0 = [buf[coff] / 255, buf[coff + 1] / 255, buf[coff + 2] / 255];
            const near = (v: number, t: number) => Math.abs(v - t) < 0.02;
            const waterBlue = near(c0[0], 0.0802) && near(c0[1], 0.1441) && near(c0[2], 0.1878); // linear(0x506a78)
            let apexI = 0; for (let i = 1; i < cnt; i++) if (ty[i] > ty[apexI]) apexI = i;
            const apexR = Math.hypot(tx[apexI], tz[apexI]);
            let eqMin = Infinity, eqMax = -Infinity;
            for (let i = 0; i < cnt; i++) if (Math.abs(ty[i] - 0.20) < 0.005) { const r = Math.hypot(tx[i], tz[i]); eqMin = Math.min(eqMin, r); eqMax = Math.max(eqMax, r); }
            ok("water dome apex 0.29", Math.abs(maxy - 0.29) < 0.005, `apex ${maxy.toFixed(3)}`);
            ok("water CRESTS rim >= 0.085 proud (dress-79 law)", maxy - 0.20 >= 0.085, `crest ${(maxy - 0.20).toFixed(3)}`);
            ok("water equator ring at rim y=0.20", eqMax > 1.7 && eqMax < 2.05 && eqMin > 0.85, `eq r ${eqMin.toFixed(2)}..${eqMax.toFixed(2)} (ellipse 0.98x1.88)`);
            ok("dome closes at apex (r < 0.06)", apexR < 0.06, `apex r ${apexR.toFixed(3)}`);
            ok("water palette blue 0x506a78 (COLOR_0 linear)", waterBlue, `rgb255 ${(c0[0] * 255).toFixed(0)},${(c0[1] * 255).toFixed(0)},${(c0[2] * 255).toFixed(0)}`);
        }
    }
    ok("meniscus water dome present", found);
}

// envelope + centering + grade (transformed verts, decode-pitfall-4 law)
{
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity, nan = 0, total = 0;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        const M = nodeMat(nodes.indexOf(n));
        for (const prim of json.meshes[n.mesh].primitives ?? []) {
            const raw = accPos(prim.attributes.POSITION);
            total += raw.length / 3;
            for (let i = 0; i < raw.length; i += 3) {
                const x = M[0] * raw[i] + M[4] * raw[i + 1] + M[8] * raw[i + 2] + M[12];
                const y = M[1] * raw[i] + M[5] * raw[i + 1] + M[9] * raw[i + 2] + M[13];
                const z = M[2] * raw[i] + M[6] * raw[i + 1] + M[10] * raw[i + 2] + M[14];
                if ([x, y, z].some(isNaN)) { nan++; continue; }
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
            }
        }
    }
    ok("zero NaN", nan === 0, `${nan} NaN of ${total} verts`);
    ok("envelope 6.57x1.30x2.20", Math.abs((maxX - minX) - 6.57) < 0.01 && Math.abs((maxY - minY) - 1.30) < 0.01 && Math.abs((maxZ - minZ) - 2.20) < 0.01,
        `${(maxX - minX).toFixed(2)}x${(maxY - minY).toFixed(2)}x${(maxZ - minZ).toFixed(2)}`);
    ok("on grade (y-min >= -5mm)", minY >= -0.005, `y-min ${minY.toFixed(4)}`);
    ok("x/z centered", Math.abs(minX + maxX) < 0.02 && Math.abs(minZ + maxZ) < 0.02, `x[${minX.toFixed(2)}..${maxX.toFixed(2)}] z[${minZ.toFixed(2)}..${maxZ.toFixed(2)}]`);
}

console.log(fail === 0 ? `ALL PASS (${pass}/${pass + fail})` : `FAILURES: ${fail} (${pass}/${pass + fail})`);
process.exit(fail === 0 ? 0 : 1);
