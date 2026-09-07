import { readFileSync } from "node:fs";
// improve41-decode-goats.ts — improve-41 (0b law): decode the goats-pen
// network entity's TRUE vertex solids from live store bytes and measure
// real radial clearance to each of the four mosaic disc centers, replacing
// the fat-bbox neighbor read (bbox 14.21x6.5 center-to-center 10.72m) with
// source-true geometry. Read-only: census GET + store GET, zero verbs.
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(await Bun.file(`${ROOT}/agents/arthur/config.json`).text());
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const die = (m: string): never => { throw Error(m); };

// 1. fresh census: pen entity + four mosaic tuples
const r = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) die(`geom ${r.status}`);
const ents: any[] = (await r.json()).entities ?? [];
const pen = ents.find(e => /goats/i.test(e.id));
if (!pen) die("no goats entity in census");
const mosaics = ents.filter(e => /^nx-gallery-mosaic-\d+$/.test(e.id));
if (mosaics.length !== 4) die(`expected 4 mosaics, got ${mosaics.length}`);
console.log(JSON.stringify({
    census: ents.length,
    pen: { id: pen.id, lib: pen.lib, pos: pen.pos, yaw: pen.yaw, scale: pen.scale },
    mosaics: mosaics.map(m => ({ id: m.id, lib: m.lib, pos: m.pos, yaw: m.yaw })),
}));

// 2. decode LOCAL source bytes — hash-domain law (SURVEY-PLAN): lib names
// hash UPLOADED bytes; the served DRACO store-min bytes hash differently.
// Local village_goats3.glb hash == live lib name => these ARE the uploaded
// bytes (source-true). Served-bytes fetch only confirms reachability.
const served = await fetch(`https://eidoverse.billding.dev/library/${pen.lib}`, { signal: AbortSignal.timeout(20_000) });
if (!served.ok) die(`library fetch ${served.status}`);
const servedMagic = new Uint8Array(await (await served.arrayBuffer()).slice(0, 4));
if (servedMagic[0] !== 0x67 || servedMagic[1] !== 0x6c) die("served bytes not glb");
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_goats3.glb`));
const sha = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
if (!pen.lib.includes(sha)) die(`local source bytes hash ${sha} != census lib ${pen.lib}`);
console.log(JSON.stringify({ source_bytes: bytes.length, sha16: sha, hash_gate: "PASS (uploaded-bytes domain)" }));

// 3. GLB decode: JSON chunk -> nodes -> meshes -> POSITION accessors
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) die("not a glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;
const bin = bytes.subarray(binStart);
const comp = (a: number[], b: number[]) => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
const accPos = (accIdx: number): number[][] => {
    const acc = json.accessors[accIdx], bv = json.bufferViews[acc.bufferView];
    const off = binStart + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out: number[][] = [];
    for (let i = 0; i < acc.count; i++) {
        const p = off + i * 12;
        out.push([dv.getFloat32(p, true), dv.getFloat32(p + 4, true), dv.getFloat32(p + 8, true)]);
    }
    return out;
};
// node world transforms (translation/rotation/scale)
interface N { t: [number, number, number]; q: [number, number, number, number] | null; s: [number, number, number]; mesh?: number; name?: string; children?: number[] }
const nodes: N[] = json.nodes.map((n: any) => ({
    t: n.translation ?? [0, 0, 0], q: n.rotation ?? null, s: n.scale ?? [1, 1, 1],
    mesh: n.mesh, name: n.name, children: n.children,
}));
// quaternion apply (clean, no tricks)
const qap = (q: number[], v: number[]): number[] => {
    const [qx, qy, qz, qw] = q, [x, y, z] = v;
    const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
    return [x + qw * tx + qy * tz - qz * ty, y + qw * ty + qz * tx - qx * tz, z + qw * tz + qx * ty - qy * tx];
};
const worldOf = new Map<number, number[][]>(); // node index -> model-space verts (full chain transform)
const walk = (idx: number, parentT: number[]) => {
    const n = nodes[idx];
    const t: number[] = [parentT[0] + n.t[0], parentT[1] + n.t[1], parentT[2] + n.t[2]];
    if (n.mesh !== undefined) {
        const mesh = json.meshes[n.mesh];
        const vs: number[][] = [];
        for (const prim of mesh.primitives) {
            for (const v of accPos(prim.attributes.POSITION)) {
                const s = comp(v, n.s);
                const w = n.q ? qap(n.q, s) : s;
                vs.push([w[0] + t[0], w[1] + t[1], w[2] + t[2]]);
            }
        }
        worldOf.set(idx, vs);
    }
    for (const c of n.children ?? []) walk(c, t);
};
const roots: number[] = json.scenes?.[0]?.nodes ?? nodes.map((_: N, i: number) => i);
for (const ri of roots) walk(ri, [0, 0, 0]);

// 4. collect ALL model-space verts (dedup not needed for clearance mins)
const all: number[][] = [];
for (const vs of worldOf.values()) all.push(...vs);
console.log(JSON.stringify({ nodes_total: nodes.length, mesh_nodes: worldOf.size, verts: all.length }));

// 5. world transform (align-1 axis convention) + radial clearance per mosaic
const py = pen.yaw, pc = Math.cos(py), ps = Math.sin(py);
const [ppx, , ppz] = pen.pos;
const world = all.map(([lx, ly, lz]) => [ppx + lx * pc + lz * ps, ly + pen.pos[1], ppz - lx * ps + lz * pc]);
// pen model-space envelope (for the record)
let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity;
for (const [x, y, z] of all) {
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    if (z < minz) minz = z; if (z > maxz) maxz = z;
}
console.log(JSON.stringify({ pen_local_bbox: { x: [minx, maxx], y: [miny, maxy], z: [minz, maxz] } }));
// radial profile vs each mosaic disc (R bands: bed 9.0 / course 9.55 / border 10.49)
const report: any = {};
for (const m of mosaics) {
    const [cx, , cz] = m.pos;
    let minR = Infinity, nearest: number[] | null = null, inBed = 0, inCourse = 0, inBorder = 0, maxYinDisc = -Infinity;
    for (const [x, y, z] of world) {
        const d = Math.hypot(x - cx, z - cz);
        if (d < minR) { minR = d; nearest = [x, y, z]; }
        if (d <= 9.0) inBed++;
        else if (d <= 9.55) inCourse++;
        else if (d <= 10.49) inBorder++;
        if (d <= 10.49 && y > maxYinDisc) maxYinDisc = y;
    }
    report[m.id] = {
        minR: +minR.toFixed(3), nearest_vertex: nearest?.map(n => +n.toFixed(2)),
        verts_in_bed_r9: inBed, verts_in_course_band: inCourse, verts_in_border_band: inBorder,
        max_pen_y_inside_disc: +maxYinDisc.toFixed(2),
        verdict: minR > 10.49 ? "CLEAR (all solids outside border)" : minR > 9.0 ? "GRAZES BORDER/COURSE ONLY" : "PEN SOLIDS INSIDE BED — real overlap",
    };
}
console.log(JSON.stringify(report, null, 1));
// 6. angular census of nearest-solid sector (which bearing the closest approach sits at)
{
    const m36 = mosaics.find(m => m.id.endsWith("0036"))!;
    const [cx, , cz] = m36.pos;
    const sorted = world.map(([x, y, z]) => ({ d: Math.hypot(x - cx, z - cz), x, y, z })).sort((a, b) => a.d - b.d).slice(0, 40);
    console.log(JSON.stringify({ nearest_40_to_0036: sorted.map(s => ({ d: +s.d.toFixed(2), x: +s.x.toFixed(1), z: +s.z.toFixed(1), y: +s.y.toFixed(2) })) }));
}
