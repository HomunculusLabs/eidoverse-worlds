// struct166-decode-costa.ts — STRUCTURES LANE struct-166 decode audit.
// Audits the WRITTEN GLB (village_costa3.glb) against the committed contract:
// topology (3 boundary loops, chi=-3), rim law (world radius 1.46 + snap slack),
// loop classes (down embedded / skirt high / up high), plinth + dome + bead
// geometry, material lanes, doubleSided film, glow census, envelope.
// Independent of the mk script's in-file laws (re-derives from the bytes).
// RED control: must FAIL on a foreign surface GLB (village_unduloid3.glb).
// Usage: bun struct166-decode-costa.ts <model.glb>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const glbPath = resolve(process.argv[2] ?? "");
if (!glbPath.endsWith(".glb")) throw new Error("arg must be .glb");
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

// world matrix per node (decode pitfall 4)
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
ok("node census 4 (film + brass + stone + glow KEEP)", meshNodeCount === 4, `mesh nodes ${meshNodeCount}`);
ok("glow KEEP present", nodes.some((n: any) => n.name === "glow_cs_1"));
ok("glow count exactly 1", nodes.filter((n: any) => (n.name ?? "").startsWith("glow")).length === 1);

// materials
const matNames = (json.materials ?? []).map((m: any) => m.name);
ok("material lanes cs_bone+cs_brass+cs_stone", matNames.includes("cs_bone") && matNames.includes("cs_brass") && matNames.includes("cs_stone"), matNames.join(","));
const boneMat = (json.materials ?? []).find((m: any) => m.name === "cs_bone");
ok("cs_bone doubleSided (one-sided-surface film law)", boneMat?.doubleSided === true);

// accessor reader
const accPos = (accIdx: number) => {
    const acc = json.accessors[accIdx];
    const bv = json.bufferViews[acc.bufferView];
    const off = binOff + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[3 * i] = dv.getFloat32(off + 12 * i, true);
        out[3 * i + 1] = dv.getFloat32(off + 12 * i + 1 * 4, true);
        out[3 * i + 2] = dv.getFloat32(off + 12 * i + 2 * 4, true);
    }
    return out;
};

// locate the film primitive (cs_bone) and transform verts to world
let filmWorld: Float32Array | null = null, filmIdxArr: number[] | null = null;
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of json.meshes[n.mesh].primitives ?? []) {
        const mat = json.materials?.[prim.material]?.name ?? "";
        if (mat !== "cs_bone") continue;
        const M = nodeMat(nodes.indexOf(n));
        const raw = accPos(prim.attributes.POSITION);
        const v = new Float32Array(raw.length);
        for (let i = 0; i < raw.length; i += 3) {
            v[i] = M[0] * raw[i] + M[4] * raw[i + 1] + M[8] * raw[i + 2] + M[12];
            v[i + 1] = M[1] * raw[i] + M[5] * raw[i + 1] + M[9] * raw[i + 2] + M[13];
            v[i + 2] = M[2] * raw[i] + M[6] * raw[i + 1] + M[10] * raw[i + 2] + M[14];
        }
        filmWorld = v;
        const ia = json.accessors[prim.indices];
        const ibv = json.bufferViews[ia.bufferView];
        const ioff = binOff + (ibv.byteOffset ?? 0) + (ia.byteOffset ?? 0);
        filmIdxArr = [];
        if (ia.componentType === 5125) for (let i = 0; i < ia.count; i++) filmIdxArr.push(dv.getUint32(ioff + 4 * i, true));
        else if (ia.componentType === 5123) for (let i = 0; i < ia.count; i++) filmIdxArr.push(dv.getUint16(ioff + 2 * i, true));
        else throw Error(`unsupported index componentType ${ia.componentType}`);
    }
}
ok("film (cs_bone) primitive found with indices", filmWorld !== null && filmIdxArr !== null);

if (filmWorld && filmIdxArr) {
    // boundary edge census -> rim law + loop count
    const ecount = new Map<string, number>();
    const idxA = filmIdxArr!;
    for (let f = 0; f < idxA.length; f += 3) {
        const es: [number, number][] = [[idxA[f], idxA[f + 1]], [idxA[f + 1], idxA[f + 2]], [idxA[f + 2], idxA[f]]];
        for (const [u, v] of es) {
            const k = u < v ? `${u}_${v}` : `${v}_${u}`;
            ecount.set(k, (ecount.get(k) ?? 0) + 1);
        }
    }
    let bad = 0, bnd = 0;
    const bndVerts = new Map<number, number[]>();
    for (const [k, c] of ecount) {
        if (c === 2) continue;
        if (c > 2) { bad++; continue; }
        bnd++;
        const [u, v] = k.split("_").map(Number);
        (bndVerts.get(u) ?? bndVerts.set(u, []).get(u)!).push(v);
        (bndVerts.get(v) ?? bndVerts.set(v, []).get(v)!).push(u);
    }
    ok("film edge census: 0 edges >2 faces", bad === 0, `${bad}`);
    // walk loops (deterministic: sorted starts)
    const ek = (u: number, v: number) => (u < v ? `${u}_${v}` : `${v}_${u}`);
    const visited = new Set<string>();
    const loops: number[][] = [];
    const starts = [...bndVerts.keys()].sort((a, b) => a - b);
    for (const s of starts) for (const first of bndVerts.get(s)!) {
        if (visited.has(ek(s, first))) continue;
        const loop = [s];
        let prev = s, cur = first;
        while (true) {
            visited.add(ek(prev, cur));
            loop.push(cur);
            const nxt = (bndVerts.get(cur) ?? []).find((n) => n !== prev && !visited.has(ek(cur, n)));
            if (nxt === undefined) {
                if ((bndVerts.get(cur) ?? []).some((n) => n === s && !visited.has(ek(cur, s)))) { visited.add(ek(cur, s)); loop.push(s); }
                break;
            }
            prev = cur; cur = nxt;
        }
        if (loop[0] === loop[loop.length - 1]) loops.push(loop.slice(0, -1));
    }
    ok("exactly 3 closed boundary loops (torus minus 3 discs)", loops.length === 3, `loops ${loops.length} (lengths ${loops.map((l) => l.length).join("/")}), boundary edges ${bnd}`);
    if (loops.length === 3) {
        // Euler characteristic over the film component
        const V = filmWorld!.length / 3, F = idxA.length / 3;
        const chi = V - ecount.size + F;
        ok("film Euler characteristic -3", chi === -3, `V=${V} E=${ecount.size} F=${F} chi=${chi}`);
        // classify loops by mean world y
        const meanY = (l: number[]) => l.reduce((s, v) => s + filmWorld![3 * v + 1], 0) / l.length;
        const sorted = [...loops].sort((p, q) => meanY(p) - meanY(q));
        const [down, skirt, up] = sorted;
        // rim radius law: ALL boundary verts at world r 1.46 within snap slack 0.0105
        let worstR = 0;
        for (const l of loops) for (const v of l) worstR = Math.max(worstR, Math.abs(Math.hypot(filmWorld![3 * v], filmWorld![3 * v + 2]) - 1.46));
        ok("rim radius law: all rim verts at world r 1.46 (+-snap 0.0105)", worstR <= 0.0105, `worst ${worstR.toFixed(5)}`);
        // down loop embedded under plinth top 0.114
        const downYs = down.map((v) => filmWorld![3 * v + 1]);
        ok("down mouth embedded under drum top (max y <= 0.114)", Math.max(...downYs) <= 0.115, `y [${Math.min(...downYs).toFixed(3)},${Math.max(...downYs).toFixed(3)}] vs top 0.114`);
        // skirt loop: high above the drum
        const skirtYs = skirt.map((v) => filmWorld![3 * v + 1]);
        ok("skirt brim clears drum by >= 1.2m", Math.min(...skirtYs) - 0.114 >= 1.2, `min y ${Math.min(...skirtYs).toFixed(3)} (clear ${(Math.min(...skirtYs) - 0.114).toFixed(2)}m)`);
        // up loop high
        const upYs = up.map((v) => filmWorld![3 * v + 1]);
        ok("up mouth high (min y >= 2.9)", Math.min(...upYs) >= 2.9, `y [${Math.min(...upYs).toFixed(3)},${Math.max(...upYs).toFixed(3)}]`);
        // trumpet pair symmetry: mean radii equal within 5mm
        const mr = (l: number[]) => l.reduce((s, v) => s + Math.hypot(filmWorld![3 * v], filmWorld![3 * v + 2]), 0) / l.length;
        ok("trumpet pair balanced (mean rim radii within 5mm)", Math.abs(mr(down) - mr(up)) <= 0.005, `down ${mr(down).toFixed(4)} up ${mr(up).toFixed(4)}`);
    }
}

// plinth: cylinder r 1.58 h 0.114
{
    let found = false;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives ?? []) {
            if ((json.materials?.[prim.material]?.name ?? "") !== "cs_stone") continue;
            const M = nodeMat(nodes.indexOf(n));
            const v = accPos(prim.attributes.POSITION);
            let minY = Infinity, maxY = -Infinity, maxR = 0;
            for (let i = 0; i < v.length; i += 3) {
                const x = M[0] * v[i] + M[4] * v[i + 1] + M[8] * v[i + 2] + M[12];
                const y = M[1] * v[i] + M[5] * v[i + 1] + M[9] * v[i + 2] + M[13];
                const z = M[2] * v[i] + M[6] * v[i + 1] + M[10] * v[i + 2] + M[14];
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                maxR = Math.max(maxR, Math.hypot(x, z));
            }
            found = true;
            ok("plinth drum r 1.58 h 0.114 on grade", Math.abs(maxR - 1.58) < 0.01 && Math.abs((maxY - minY) - 0.114) < 0.005 && Math.abs(minY) < 0.005,
                `r ${maxR.toFixed(3)} h ${(maxY - minY).toFixed(3)} y[${minY.toFixed(3)},${maxY.toFixed(3)}]`);
        }
    }
    ok("plinth present", found);
}

// bead: glow_cs_1 at (0, ~3.26, 0), r 0.11
{
    const ni = nodes.findIndex((n: any) => n.name === "glow_cs_1");
    const M = nodeMat(ni);
    const v = accPos(json.meshes[nodes[ni].mesh].primitives[0].attributes.POSITION);
    let minY = Infinity, maxY = -Infinity, cx = 0, cz = 0;
    for (let i = 0; i < v.length; i += 3) {
        const x = M[0] * v[i] + M[4] * v[i + 1] + M[8] * v[i + 2] + M[12];
        const y = M[1] * v[i] + M[5] * v[i + 1] + M[9] * v[i + 2] + M[13];
        const z = M[2] * v[i] + M[6] * v[i + 1] + M[10] * v[i + 2] + M[14];
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        cx += x; cz += z;
    }
    const cnt = v.length / 3;
    cx /= cnt; cz /= cnt;
    const r = (maxY - minY) / 2;
    ok("bead on dome apex (0, ~3.21+, 0) r 0.11", Math.abs(cx) < 0.01 && Math.abs(cz) < 0.01 && (minY + maxY) / 2 > 3.15 && Math.abs(r - 0.11) < 0.012,
        `c(${cx.toFixed(3)},${((minY + maxY) / 2).toFixed(3)},${cz.toFixed(3)}) r ${r.toFixed(3)}`);
}

// dome (cs_brass): apex ~3.210 high, present above the up mouth
{
    let apex = -Infinity, cnt = 0, minR = Infinity;
    for (const n of nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of json.meshes[n.mesh].primitives ?? []) {
            if ((json.materials?.[prim.material]?.name ?? "") !== "cs_brass") continue;
            const M = nodeMat(nodes.indexOf(n));
            const v = accPos(prim.attributes.POSITION);
            for (let i = 0; i < v.length; i += 3) {
                const x = M[0] * v[i] + M[4] * v[i + 1] + M[8] * v[i + 2] + M[12];
                const y = M[1] * v[i] + M[5] * v[i + 1] + M[9] * v[i + 2] + M[13];
                const z = M[2] * v[i] + M[6] * v[i + 1] + M[10] * v[i + 2] + M[14];
                cnt++;
                if (Math.hypot(x, z) < 0.05) { apex = Math.max(apex, y); minR = Math.min(minR, Math.hypot(x, z)); }
            }
        }
    }
    ok("brass dome apex ~3.21 on axis", cnt > 0 && Math.abs(apex - 3.210) < 0.01, `apex ${apex.toFixed(3)} (${cnt} brass verts scanned)`);
}

// envelope + grade + centering over ALL transformed verts
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
    ok("plan 3.16x3.16 (plinth-owned)", Math.abs((maxX - minX) - 3.16) < 0.01 && Math.abs((maxZ - minZ) - 3.16) < 0.01,
        `${(maxX - minX).toFixed(2)}x${(maxZ - minZ).toFixed(2)}`);
    ok("height ~3.37 (drum to dome apex)", Math.abs((maxY - minY) - 3.37) < 0.02, `${(maxY - minY).toFixed(3)}`);
    ok("on grade (y-min >= -5mm)", minY >= -0.005, `y-min ${minY.toFixed(4)}`);
    ok("x/z centered", Math.abs(minX + maxX) < 0.02 && Math.abs(minZ + maxZ) < 0.02, `x[${minX.toFixed(2)}..${maxX.toFixed(2)}] z[${minZ.toFixed(2)}..${maxZ.toFixed(2)}]`);
}

console.log(fail === 0 ? `ALL PASS (${pass}/${pass + fail})` : `FAILURES: ${fail} (${pass}/${pass + fail})`);
process.exit(fail === 0 ? 0 : 1);
